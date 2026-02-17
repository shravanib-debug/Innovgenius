/**
 * Alert Evaluation Engine
 * Evaluates alert rules against new trace data, fires alerts for breached thresholds,
 * and broadcasts via WebSocket.
 */

const { Op } = require('sequelize');
const wsManager = require('../websocket');

// In-memory dedup cache: ruleId -> last fired timestamp
const recentAlerts = new Map();
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Evaluate all active alert rules against a newly ingested trace.
 * @param {object} trace - The trace record (Sequelize instance or plain object)
 * @param {object} models - { Trace, AlertRule, Alert, ... }
 */
async function evaluateAlerts(trace, models) {
    const { AlertRule, Alert, Trace } = models;

    try {
        // Fetch all enabled rules
        const rules = await AlertRule.findAll({
            where: { enabled: true },
            raw: true
        });

        for (const rule of rules) {
            try {
                const shouldFire = await _checkRule(rule, trace, models);
                if (shouldFire) {
                    await _fireAlert(rule, trace, models);
                }
            } catch (err) {
                console.error(`Alert rule evaluation error (${rule.name}):`, err.message);
            }
        }
    } catch (error) {
        console.error('Alert engine error:', error.message);
    }
}

/**
 * Check if a specific rule's condition is breached
 */
async function _checkRule(rule, trace, models) {
    const { Trace } = models;
    const metric = rule.metric;
    const condition = rule.condition; // '>', '<', '>=', '<=', '=='
    const threshold = parseFloat(rule.threshold);
    const agentType = rule.agent_type; // null = all agents

    // Filter by agent type if specified
    if (agentType && trace.agent_type !== agentType) return false;

    // Deduplication check
    const dedupKey = `${rule.id}_${agentType || 'all'}`;
    const lastFired = recentAlerts.get(dedupKey);
    if (lastFired && (Date.now() - lastFired) < DEDUP_WINDOW_MS) return false;

    let currentValue;

    switch (metric) {
        case 'latency_p95': {
            // Get P95 latency over last hour
            const recentTraces = await Trace.findAll({
                where: {
                    created_at: { [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) },
                    ...(agentType ? { agent_type: agentType } : {})
                },
                attributes: ['total_latency_ms'],
                raw: true
            });
            const latencies = recentTraces.map(t => t.total_latency_ms || 0).sort((a, b) => a - b);
            currentValue = latencies.length > 0
                ? latencies[Math.ceil(0.95 * latencies.length) - 1]
                : 0;
            break;
        }

        case 'error_rate': {
            const recentTraces = await Trace.findAll({
                where: {
                    created_at: { [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) },
                    ...(agentType ? { agent_type: agentType } : {})
                },
                attributes: ['status'],
                raw: true
            });
            const total = recentTraces.length;
            const errors = recentTraces.filter(t => t.status === 'error').length;
            currentValue = total > 0 ? (errors / total) * 100 : 0;
            break;
        }

        case 'cost_per_hour': {
            const recentTraces = await Trace.findAll({
                where: {
                    created_at: { [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) },
                    ...(agentType ? { agent_type: agentType } : {})
                },
                attributes: ['total_cost_usd'],
                raw: true
            });
            currentValue = recentTraces.reduce((sum, t) => sum + (parseFloat(t.total_cost_usd) || 0), 0);
            break;
        }

        case 'escalation_rate': {
            const recentTraces = await Trace.findAll({
                where: {
                    created_at: { [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) },
                    ...(agentType ? { agent_type: agentType } : {})
                },
                attributes: ['output_data'],
                raw: true
            });
            const total = recentTraces.length;
            const escalated = recentTraces.filter(t =>
                ['escalated', 'flagged'].includes(t.output_data?.decision)
            ).length;
            currentValue = total > 0 ? (escalated / total) * 100 : 0;
            break;
        }

        case 'guardrail_failure_rate': {
            // Use the current trace's guardrail data
            currentValue = trace.guardrail_checks?.some(g => !g.passed) ? 100 : 0;
            break;
        }

        case 'latency': {
            // Direct latency of this trace
            currentValue = trace.total_latency_ms || 0;
            break;
        }

        case 'cost': {
            // Direct cost of this trace
            currentValue = parseFloat(trace.total_cost_usd) || 0;
            break;
        }

        default:
            return false;
    }

    // Evaluate condition
    return _evaluateCondition(currentValue, condition, threshold);
}

/**
 * Evaluate a numeric condition
 */
function _evaluateCondition(value, condition, threshold) {
    switch (condition) {
        case '>': return value > threshold;
        case '<': return value < threshold;
        case '>=': return value >= threshold;
        case '<=': return value <= threshold;
        case '==': return value === threshold;
        case '!=': return value !== threshold;
        default: return false;
    }
}

/**
 * Fire an alert — create record, update dedup cache, broadcast
 */
async function _fireAlert(rule, trace, models) {
    const { Alert } = models;

    const alert = await Alert.create({
        rule_id: rule.id,
        severity: rule.severity,
        title: rule.name,
        description: `Alert: ${rule.name} — ${rule.metric} ${rule.condition} ${rule.threshold} triggered by ${trace.agent_type} agent`,
        current_value: trace.total_latency_ms || 0,
        threshold_value: parseFloat(rule.threshold),
        agent_type: trace.agent_type,
        trace_id: trace.id || null,
        acknowledged: false,
        metadata: {
            rule_metric: rule.metric,
            rule_condition: rule.condition,
            trace_id: trace.id,
            agent_type: trace.agent_type
        }
    });

    // Update dedup cache
    const dedupKey = `${rule.id}_${trace.agent_type || 'all'}`;
    recentAlerts.set(dedupKey, Date.now());

    // Broadcast via WebSocket
    wsManager.broadcastAlert(alert.toJSON());

    console.log(`🚨 Alert fired: ${rule.name} (${rule.severity}) — ${trace.agent_type}`);
    return alert;
}

module.exports = { evaluateAlerts };
