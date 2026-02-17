/**
 * Telemetry Routes
 * POST /api/telemetry/ingest — receives trace data from Python agents
 */

const express = require('express');
const router = express.Router();
const traceService = require('../services/traceService');
const metricsService = require('../services/metricsService');
const { evaluateAlerts } = require('../core/alertEngine');
const wsManager = require('../websocket');

/**
 * POST /api/telemetry/ingest
 * Receives complete trace data from a Python agent run:
 * { agent_type, trace_id, total_latency_ms, total_cost_usd, total_tokens,
 *   input_data, output_data, llm_calls[], tool_calls[], guardrail_checks[] }
 */
router.post('/ingest', async (req, res) => {
    try {
        const data = req.body;

        // Validate required fields
        if (!data.agent_type) {
            return res.status(400).json({ error: 'agent_type is required' });
        }

        // Map from Python agent output format to DB format
        const traceData = {
            trace_id: data.trace_id,
            agent_type: data.agent_type,
            session_id: data.session_id,
            status: data.status || 'success',
            total_latency_ms: data.total_latency_ms || data.latency_ms || 0,
            total_cost_usd: data.total_cost_usd || data.cost_usd || 0,
            total_tokens: data.total_tokens || 0,
            input_data: data.input_data || data.input || null,
            output_data: data.output_data || data.decision || null,
            llm_calls: (data.llm_calls || []).map((c, i) => ({
                step_order: c.step_order ?? i + 1,
                model: c.model,
                prompt_tokens: c.prompt_tokens,
                completion_tokens: c.completion_tokens,
                latency_ms: c.latency_ms,
                cost_usd: c.cost_usd,
                status: c.status || 'success',
                prompt_quality: c.prompt_quality,
                prompt_text: c.prompt_text,
                response_text: c.response_text
            })),
            tool_calls: (data.tool_calls || []).map((c, i) => ({
                step_order: c.step_order ?? i + 1,
                tool_name: c.tool_name,
                input_data: c.input_data || c.input,
                output_data: c.output_data || c.output || c.result,
                duration_ms: c.duration_ms,
                success: c.success !== false
            })),
            guardrail_checks: (data.guardrail_checks || []).map(c => ({
                check_type: c.check_type || c.type,
                passed: c.passed !== false,
                details: c.details || c.result
            }))
        };

        // Store in database
        const trace = await traceService.createTrace(req.app.locals.models, traceData);

        // Invalidate metrics cache
        metricsService.invalidateCache();

        // Evaluate alert rules
        await evaluateAlerts(trace, req.app.locals.models);

        // Broadcast to WebSocket clients
        wsManager.broadcastTrace(trace);

        res.status(201).json({
            success: true,
            trace_id: trace.id,
            message: 'Trace ingested successfully'
        });
    } catch (error) {
        console.error('Telemetry ingest error:', error.message);
        res.status(500).json({ error: 'Failed to ingest telemetry', details: error.message });
    }
});

module.exports = router;
