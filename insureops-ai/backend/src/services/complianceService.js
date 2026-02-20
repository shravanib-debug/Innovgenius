/**
 * Compliance Service
 * Business logic for compliance dashboard metrics, event retrieval,
 * bias analysis, and audit log generation.
 */

const { Op } = require('sequelize');
const { runFullBiasAnalysis, scanTracePII, validatePolicyRules, POLICY_RULES } = require('../core/complianceEngine');

/**
 * Get compliance overview metrics for dashboard.
 */
async function getComplianceOverview(models, timerange = '24h') {
    const { ComplianceEvent, Trace } = models;
    const since = _parseSince(timerange);

    console.log('[Compliance] Overview query — timerange:', timerange, 'since:', since.toISOString());

    const events = await ComplianceEvent.findAll({
        where: { created_at: { [Op.gte]: since.toISOString() } },
        raw: true,
        order: [['created_at', 'DESC']],
    });

    const total = events.length;
    const piiClean = events.filter(e => e.pii_clean).length;
    const piiLeaks = events.filter(e => !e.pii_clean).length;
    const criticalPII = events.filter(e => e.pii_risk_level === 'critical').length;
    const highPII = events.filter(e => e.pii_risk_level === 'high').length;

    const avgCompliance = total > 0
        ? Math.round(events.reduce((s, e) => s + (e.policy_compliance_rate || 100), 0) / total)
        : 100;

    const totalViolations = events.reduce((s, e) => {
        const violations = e.policy_violations;
        return s + (Array.isArray(violations) ? violations.length : 0);
    }, 0);

    const statusCounts = { compliant: 0, review: 0, warning: 0, critical: 0 };
    events.forEach(e => {
        statusCounts[e.overall_status] = (statusCounts[e.overall_status] || 0) + 1;
    });

    // Compliance rate over time (hourly buckets)
    const complianceTimeline = _buildTimeline(events, since);

    // Per-agent compliance
    const agentCompliance = {};
    events.forEach(e => {
        if (!agentCompliance[e.agent_type]) {
            agentCompliance[e.agent_type] = { total: 0, compliant: 0, violations: 0 };
        }
        agentCompliance[e.agent_type].total++;
        if (e.overall_status === 'compliant') agentCompliance[e.agent_type].compliant++;
        agentCompliance[e.agent_type].violations += Array.isArray(e.policy_violations) ? e.policy_violations.length : 0;
    });

    return {
        total_checks: total,
        pii: {
            clean: piiClean,
            leaks: piiLeaks,
            critical: criticalPII,
            high: highPII,
            clean_rate: total > 0 ? Math.round((piiClean / total) * 100) : 100,
        },
        policy: {
            avg_compliance_rate: avgCompliance,
            total_violations: totalViolations,
            rules_count: POLICY_RULES.length,
        },
        status_distribution: statusCounts,
        agent_compliance: agentCompliance,
        timeline: complianceTimeline,
    };
}

/**
 * Get paginated compliance events.
 */
async function getComplianceEvents(models, params = {}) {
    const { ComplianceEvent } = models;
    const { page = 1, limit = 20, agent_type, status, timerange = '7d' } = params;
    const since = _parseSince(timerange);

    const where = { created_at: { [Op.gte]: since } };
    if (agent_type) where.agent_type = agent_type;
    if (status) where.overall_status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await ComplianceEvent.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset,
        raw: true,
    });

    return {
        events: rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: count,
            totalPages: Math.ceil(count / limit),
        },
    };
}

/**
 * Get a single compliance event detail.
 */
async function getComplianceEventDetail(models, eventId) {
    const { ComplianceEvent } = models;
    const event = await ComplianceEvent.findByPk(eventId, { raw: true });
    return event;
}

/**
 * Run bias analysis on recent traces.
 */
async function getBiasAnalysis(models, timerange = '7d') {
    const { Trace } = models;
    const since = _parseSince(timerange);

    const traces = await Trace.findAll({
        where: { created_at: { [Op.gte]: since } },
        raw: true,
    });

    const biasReport = runFullBiasAnalysis(traces);

    // Set overall flag
    biasReport.overall_bias_detected = [
        biasReport.geography,
        biasReport.age_group,
        biasReport.claim_type,
        biasReport.gender,
    ].some(b => b.bias_detected);

    return biasReport;
}

/**
 * Get audit logs for a specific trace or time range.
 */
async function getAuditLogs(models, params = {}) {
    const { ComplianceEvent } = models;
    const { trace_id, page = 1, limit = 50, timerange = '7d' } = params;
    const since = _parseSince(timerange);

    const where = { created_at: { [Op.gte]: since } };
    if (trace_id) where.trace_id = trace_id;

    const offset = (page - 1) * limit;
    const { rows, count } = await ComplianceEvent.findAndCountAll({
        where,
        attributes: ['id', 'trace_id', 'agent_type', 'overall_status', 'audit_record', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset,
        raw: true,
    });

    return {
        audit_logs: rows.map(r => ({
            id: r.id,
            trace_id: r.trace_id,
            agent_type: r.agent_type,
            overall_status: r.overall_status,
            audit: r.audit_record,
            timestamp: r.createdAt || r.created_at,
        })),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: count,
            totalPages: Math.ceil(count / limit),
        },
    };
}

/**
 * Get policy rules list with pass/fail stats.
 */
async function getPolicyRuleStats(models, timerange = '24h') {
    const { ComplianceEvent } = models;
    const since = _parseSince(timerange);

    const events = await ComplianceEvent.findAll({
        where: { created_at: { [Op.gte]: since } },
        attributes: ['policy_violations'],
        raw: true,
    });

    // Count violations per rule
    const violationCounts = {};
    POLICY_RULES.forEach(r => { violationCounts[r.id] = 0; });

    events.forEach(e => {
        const violations = e.policy_violations;
        if (Array.isArray(violations)) {
            violations.forEach(v => {
                if (violationCounts[v.rule_id] !== undefined) {
                    violationCounts[v.rule_id]++;
                }
            });
        }
    });

    return POLICY_RULES.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        total_checks: events.length,
        violations: violationCounts[rule.id] || 0,
        pass_rate: events.length > 0
            ? Math.round(((events.length - violationCounts[rule.id]) / events.length) * 100)
            : 100,
    }));
}

// ─── Helpers ─────────────────────────────────────────

function _parseSince(timerange) {
    const now = new Date();
    const hours = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };
    return new Date(now.getTime() - (hours[timerange] || 24) * 60 * 60 * 1000);
}

function _buildTimeline(events, since) {
    const buckets = {};
    const now = new Date();
    const hours = Math.ceil((now - since) / (60 * 60 * 1000));
    const bucketSize = hours <= 24 ? 1 : hours <= 168 ? 6 : 24; // 1h, 6h, or 24h buckets

    for (let i = 0; i < Math.ceil(hours / bucketSize); i++) {
        const bucketTime = new Date(since.getTime() + i * bucketSize * 60 * 60 * 1000);
        const key = bucketTime.toISOString().slice(0, 13);
        buckets[key] = { time: bucketTime.toISOString(), total: 0, compliant: 0, violations: 0 };
    }

    events.forEach(e => {
        const ts = e.createdAt || e.created_at;
        if (!ts) return;
        const key = new Date(ts).toISOString().slice(0, 13);
        if (buckets[key]) {
            buckets[key].total++;
            if (e.overall_status === 'compliant') buckets[key].compliant++;
            buckets[key].violations += Array.isArray(e.policy_violations) ? e.policy_violations.length : 0;
        }
    });

    return Object.values(buckets);
}

module.exports = {
    getComplianceOverview,
    getComplianceEvents,
    getComplianceEventDetail,
    getBiasAnalysis,
    getAuditLogs,
    getPolicyRuleStats,
};
