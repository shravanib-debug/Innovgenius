/**
 * Agent Service — Insurance AI Agents powered by Python Agent Pipelines
 * Each agent: receives input → spawns Python process → real tools + LLM + guardrails → structured decision
 * Full telemetry is captured by the Python agent and stored in the database.
 */

const { spawn } = require('child_process');
const path = require('path');
const traceService = require('./traceService');
const metricsService = require('./metricsService');
const { evaluateAlerts } = require('../core/alertEngine');
const { runComplianceCheck } = require('../core/complianceEngine');
const wsManager = require('../websocket');

// Path to project root (where the agents/ Python module lives)
const ROOT_DIR = path.resolve(__dirname, '../../../');

// ─── Agent → Python Module Mapping ──────────────────────

const AGENT_CONFIG = {
    claims: {
        module: 'agents.claims_agent.agent',
        toolNames: ['policy_lookup', 'coverage_checker', 'payout_calculator', 'clause_verifier', 'guardrails'],
    },
    underwriting: {
        module: 'agents.underwriting_agent.agent',
        toolNames: ['risk_score_calculator', 'medical_risk_lookup', 'historical_data_check', 'guardrails'],
    },
    fraud: {
        module: 'agents.fraud_agent.agent',
        toolNames: ['duplicate_checker', 'pattern_analyzer', 'claimant_history_lookup', 'guardrails'],
    },
};

// ─── Python Agent Spawner ───────────────────────────────

/**
 * Spawn a Python agent process and return parsed results.
 * All agents use the same pattern: python -m <module> --payload <json>
 * Output is parsed from between __JSON_START__ and __JSON_END__ markers.
 */
function spawnPythonAgent(agentType, inputData) {
    const config = AGENT_CONFIG[agentType];
    if (!config) {
        return Promise.reject(new Error(`Unknown agent type: ${agentType}`));
    }

    const payload = JSON.stringify(inputData);
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['-m', config.module, '--payload', payload], {
            cwd: ROOT_DIR,
            env: { ...process.env, PYTHONPATH: ROOT_DIR },
        });

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
            console.error(`[Python ${agentType}]: ${data.toString().trim()}`);
        });

        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to spawn Python process for ${agentType}: ${err.message}`));
        });

        pythonProcess.on('close', (code) => {
            const latency = Date.now() - startTime;

            if (code !== 0) {
                console.error(`Python ${agentType} agent exited with code ${code}`);
                resolve({
                    success: false,
                    error: `Agent process failed (exit code ${code})`,
                    details: stderrData,
                    latency,
                });
                return;
            }

            try {
                // Extract JSON from output (between markers if present)
                let jsonStr = stdoutData;
                if (stdoutData.includes('__JSON_START__')) {
                    jsonStr = stdoutData.split('__JSON_START__')[1].split('__JSON_END__')[0];
                }
                const result = JSON.parse(jsonStr.trim());

                resolve({
                    success: true,
                    result,
                    latency,
                    toolNames: config.toolNames,
                });
            } catch (e) {
                console.error(`Failed to parse ${agentType} agent output:`, e.message);
                resolve({
                    success: false,
                    error: 'Invalid agent output',
                    details: stdoutData,
                    latency,
                });
            }
        });
    });
}

// ─── Main Agent Runner ──────────────────────────────────

async function runAgent(agentType, inputData, models) {
    // Spawn the Python agent
    const agentResult = await spawnPythonAgent(agentType, inputData);

    if (!agentResult.success) {
        return {
            success: false,
            error: agentResult.error,
            details: agentResult.details,
        };
    }

    const { result, latency, toolNames } = agentResult;

    // Extract decision from Python agent output
    const decision = result.decision?.decision_type || result.decision?.decision || 'escalated';
    const rawConfidence = result.decision?.confidence || 0;
    // Normalize: Python agents return 0.0-1.0, system expects 0-100
    const confidence = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : rawConfidence;
    const reasoning = result.decision?.reasoning || '';

    // Build output for DB trace
    const outputData = {
        decision,
        confidence,
        reasoning,
        details: result,
    };

    // Extract telemetry from Python trace if available
    const pyTrace = result.trace || {};
    const totalCost = pyTrace.total_cost_usd || 0;
    const totalTokens = (pyTrace.llm_calls || []).reduce(
        (sum, c) => sum + (c.prompt_tokens || 0) + (c.completion_tokens || 0), 0
    );

    // Build LLM calls from Python trace
    const llmCalls = (pyTrace.llm_calls || []).map((c, i) => ({
        step_order: i + 1,
        model: c.model || 'unknown',
        prompt_tokens: c.prompt_tokens || 0,
        completion_tokens: c.completion_tokens || 0,
        latency_ms: c.latency_ms || 0,
        cost_usd: c.cost_usd || 0,
        status: c.status || 'success',
        prompt_quality: c.prompt_quality || 0,
        prompt_text: (c.prompt_text || '').substring(0, 500),
        response_text: (c.response_text || '').substring(0, 2000),
    }));

    // Build tool calls from Python trace
    const toolCalls = (pyTrace.tool_calls || []).map((t, i) => ({
        step_order: i + 1,
        tool_name: t.tool_name || 'unknown',
        parameters: t.parameters || {},
        result_summary: (t.result_summary || '').substring(0, 500),
        duration_ms: t.duration_ms || 0,
        success: t.success !== false,
    }));

    // Build guardrail checks from Python trace
    const guardrailChecks = (pyTrace.guardrails || []).map(g => ({
        check_type: g.check_type || 'unknown',
        passed: g.passed !== false,
        details: g.details || '',
    }));

    // Store trace in database
    let trace = null;
    if (models && models.Trace) {
        try {
            trace = await traceService.createTrace(models, {
                agent_type: agentType,
                status: result.success !== false ? 'success' : 'error',
                total_latency_ms: latency,
                total_cost_usd: totalCost,
                total_tokens: totalTokens,
                input_data: inputData,
                output_data: outputData,
                llm_calls: llmCalls,
                tool_calls: toolCalls,
                guardrail_checks: guardrailChecks,
            });

            // Invalidate metrics cache & evaluate alerts
            metricsService.invalidateCache();
            await evaluateAlerts(trace, models);
            wsManager.broadcastTrace(trace);

            // Run compliance check
            try {
                await runComplianceCheck(trace, models);
                console.log(`🛡️  Compliance check complete: ${trace.id}`);
            } catch (compErr) {
                console.error('Compliance check failed:', compErr.message);
            }

            console.log(`✅ Trace saved: ${trace.id}`);
        } catch (dbError) {
            console.error('Failed to store trace:', dbError.message);
        }
    } else {
        console.log('⚠️  No DB connection — skipping trace storage (Limited Mode)');
    }

    // Return result to frontend
    return {
        success: true,
        decision: outputData.decision,
        confidence: outputData.confidence,
        reasoning: outputData.reasoning,
        latency,
        cost: Math.round(totalCost * 1_000_000) / 1_000_000,
        toolsUsed: toolNames,
        totalTokens,
        traceId: trace?.id || result.trace_id || null,
        details: result,
        // Claims-specific fields
        ...(agentType === 'claims' && {
            verification: result.verification,
            clauseVerification: result.clause_verification,
            evidenceAnalysis: result.evidence_analysis,
        }),
        // Underwriting-specific fields
        ...(agentType === 'underwriting' && {
            riskScore: result.risk_score,
        }),
        // Fraud-specific fields
        ...(agentType === 'fraud' && {
            patternAnalysis: result.pattern_analysis,
            claimantHistory: result.claimant_history,
        }),
    };
}

module.exports = { runAgent };
