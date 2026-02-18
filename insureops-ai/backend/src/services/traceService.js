/**
 * Trace Service
 * Business logic for fetching, formatting, and creating trace records.
 * Handles nested detail (trace → llm_calls, tool_calls, guardrails).
 */

const { Op } = require('sequelize');

/**
 * Get paginated trace list with filters
 */
async function getTraces(models, params = {}) {
    const { Trace } = models;
    const {
        page = 1,
        limit = 20,
        agent_type,
        decision,
        status,
        date_from,
        date_to,
        sort_by = 'created_at',
        sort_order = 'DESC'
    } = params;

    const where = {};
    if (agent_type) where.agent_type = agent_type;
    if (decision) where.decision_type = decision;
    if (status) where.status = status;
    if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at[Op.gte] = new Date(date_from);
        if (date_to) where.created_at[Op.lte] = new Date(date_to);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Trace.findAndCountAll({
        where,
        order: [[sort_by, sort_order]],
        limit: parseInt(limit),
        offset,
        raw: true
    });

    return {
        traces: rows.map(_formatTraceListItem),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: count,
            totalPages: Math.ceil(count / limit)
        }
    };
}

/**
 * Get recent traces (last N)
 */
async function getRecentTraces(models, limit = 20) {
    const { Trace } = models;

    const traces = await Trace.findAll({
        order: [['created_at', 'DESC']],
        limit,
        raw: true
    });

    return traces.map(_formatTraceListItem);
}

/**
 * Get full trace detail with nested LLM calls, tool calls, guardrail checks
 */
async function getTraceDetail(models, traceId) {
    const { Trace, LLMCall, ToolCall, GuardrailCheck } = models;

    const trace = await Trace.findByPk(traceId, {
        include: [
            { model: LLMCall, as: 'llm_calls', order: [['step_order', 'ASC']] },
            { model: ToolCall, as: 'tool_calls', order: [['step_order', 'ASC']] },
            { model: GuardrailCheck, as: 'guardrail_checks' }
        ]
    });

    if (!trace) return null;

    const plain = trace.toJSON();

    // Build execution timeline (merge all steps, sort by step_order)
    const timeline = [];

    (plain.llm_calls || []).forEach(call => {
        timeline.push({
            type: 'llm_call',
            step_order: call.step_order || 0,
            name: `LLM Call (${call.model || 'unknown'})`,
            duration_ms: call.latency_ms,
            cost_usd: parseFloat(call.cost_usd) || 0,
            status: call.status,
            details: {
                model: call.model,
                prompt_tokens: call.prompt_tokens,
                completion_tokens: call.completion_tokens,
                prompt_text: call.prompt_text,
                response_text: call.response_text,
                prompt_quality: call.prompt_quality
            }
        });
    });

    (plain.tool_calls || []).forEach(call => {
        timeline.push({
            type: 'tool_call',
            step_order: call.step_order || 0,
            name: call.tool_name,
            duration_ms: call.duration_ms,
            status: call.success ? 'success' : 'error',
            details: {
                parameters: call.parameters,
                result_summary: call.result_summary,
                success: call.success
            }
        });
    });

    (plain.guardrail_checks || []).forEach(check => {
        timeline.push({
            type: 'guardrail',
            step_order: check.step_order || 99,
            name: `Guardrail: ${check.check_type}`,
            duration_ms: 0,
            status: check.passed ? 'passed' : 'failed',
            details: {
                check_type: check.check_type,
                passed: check.passed,
                details: check.details
            }
        });
    });

    // Sort by step_order
    timeline.sort((a, b) => a.step_order - b.step_order);

    return {
        id: plain.id,
        agent_type: plain.agent_type,
        session_id: plain.session_id,
        status: plain.status,
        total_latency_ms: plain.total_latency,
        total_cost_usd: parseFloat(plain.total_cost) || 0,
        total_tokens: (plain.llm_calls || []).reduce((sum, c) => sum + (c.prompt_tokens || 0) + (c.completion_tokens || 0), 0),
        decision: plain.decision_type || plain.output_data?.decision || null,
        confidence: plain.confidence ? parseFloat(plain.confidence) : (plain.output_data?.confidence || null),
        reasoning: plain.reasoning || plain.output_data?.reasoning || null,
        input_data: plain.input_data,
        output_data: plain.output_data,
        created_at: plain.created_at,
        timeline,
        llm_calls: plain.llm_calls,
        tool_calls: plain.tool_calls,
        guardrail_checks: plain.guardrail_checks
    };
}

/**
 * Create a new trace from agent execution data.
 * Maps from the agentService format to the actual DB model fields.
 */
async function createTrace(models, data) {
    const { Trace, LLMCall, ToolCall, GuardrailCheck } = models;

    // Create the main trace record — map to actual model fields
    const trace = await Trace.create({
        id: data.trace_id || undefined,
        agent_type: data.agent_type,
        timestamp: new Date(),
        total_latency: data.total_latency_ms || 0,
        total_cost: data.total_cost_usd || 0,
        decision_type: data.output_data?.decision || null,
        confidence: data.output_data?.confidence ? data.output_data.confidence / 100 : null,
        reasoning: data.output_data?.reasoning || null,
        escalated: ['escalated', 'flagged'].includes(data.output_data?.decision),
        status: data.status || 'success',
        input_data: data.input_data || null,
        output_data: data.output_data || null
    });

    const traceId = trace.id;

    // Create LLM call records
    if (data.llm_calls && data.llm_calls.length > 0) {
        await Promise.all(data.llm_calls.map((call, idx) =>
            LLMCall.create({
                trace_id: traceId,
                step_order: call.step_order ?? idx + 1,
                model: call.model || 'unknown',
                prompt_tokens: call.prompt_tokens || 0,
                completion_tokens: call.completion_tokens || 0,
                latency_ms: call.latency_ms || 0,
                cost_usd: call.cost_usd || 0,
                status: call.status || 'success',
                prompt_quality: call.prompt_quality || null,
                prompt_text: call.prompt_text || null,
                response_text: call.response_text || null
            })
        ));
    }

    // Create tool call records — using correct model fields
    if (data.tool_calls && data.tool_calls.length > 0) {
        await Promise.all(data.tool_calls.map((call, idx) =>
            ToolCall.create({
                trace_id: traceId,
                step_order: call.step_order ?? idx + 1,
                tool_name: call.tool_name || 'unknown',
                parameters: call.parameters || null,
                result_summary: call.result_summary || null,
                duration_ms: call.duration_ms || 0,
                success: call.success !== false
            })
        ));
    }

    // Create guardrail check records
    if (data.guardrail_checks && data.guardrail_checks.length > 0) {
        await Promise.all(data.guardrail_checks.map(check =>
            GuardrailCheck.create({
                trace_id: traceId,
                check_type: check.check_type || 'safety',
                passed: check.passed !== false,
                details: check.details || null
            })
        ));
    }

    // Return the full trace
    return await getTraceDetail(models, traceId);
}

// ─── Formatters ─────────────────────────────────────

function _formatTraceListItem(trace) {
    return {
        id: trace.id,
        agent_type: trace.agent_type,
        status: trace.status,
        total_latency_ms: trace.total_latency,
        total_cost_usd: parseFloat(trace.total_cost) || 0,
        total_tokens: trace.total_tokens || 0,
        decision: trace.decision_type || trace.output_data?.decision || null,
        confidence: trace.confidence ? parseFloat(trace.confidence) : null,
        reasoning: trace.reasoning || null,
        created_at: trace.created_at
    };
}

module.exports = {
    getTraces,
    getRecentTraces,
    getTraceDetail,
    createTrace
};
