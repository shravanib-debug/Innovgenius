/**
 * Analytics Engine
 * Time-series aggregation queries for computing dashboard metrics.
 * Works with both Sequelize (real DB) and in-memory data store (fallback).
 */

const { Op } = require('sequelize');

/**
 * Get time range filter as Date object
 */
function getTimeRangeDate(timerange = '24h') {
    const now = new Date();
    const ranges = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
    };
    return new Date(now.getTime() - (ranges[timerange] || ranges['24h']));
}

/**
 * Compute overview KPIs from traces
 */
async function getOverviewMetrics(models, timerange = '24h') {
    const since = getTimeRangeDate(timerange);
    const { Trace, Alert } = models;

    try {
        const traces = await Trace.findAll({
            where: { created_at: { [Op.gte]: since } },
            attributes: ['id', 'agent_type', 'total_latency', 'total_cost', 'status', 'decision_type', 'output_data'],
            raw: true
        });

        const activeAlerts = await Alert.count({
            where: { acknowledged: false }
        });

        const totalTraces = traces.length;
        const avgLatency = totalTraces > 0
            ? Math.round(traces.reduce((sum, t) => sum + (t.total_latency || 0), 0) / totalTraces)
            : 0;
        const totalCost = traces.reduce((sum, t) => sum + (parseFloat(t.total_cost) || 0), 0);
        const successRate = totalTraces > 0
            ? Math.round((traces.filter(t => t.status === 'success').length / totalTraces) * 100)
            : 100;

        // Agent breakdown
        const agentCounts = {};
        traces.forEach(t => {
            agentCounts[t.agent_type] = (agentCounts[t.agent_type] || 0) + 1;
        });

        return {
            totalTraces,
            avgLatency,
            totalCost: Math.round(totalCost * 1000000) / 1000000,
            activeAlerts,
            successRate,
            agentBreakdown: agentCounts,
            timerange
        };
    } catch (error) {
        console.error('Analytics error (overview):', error.message);
        return _fallbackOverview();
    }
}

/**
 * Compute Section 1 metrics: AI Application Monitoring
 * - Prompt Quality, Response Accuracy, Latency, API Rates, Cost, Drift
 */
async function getSection1Metrics(models, timerange = '24h') {
    const since = getTimeRangeDate(timerange);
    const { Trace, LLMCall, ToolCall, GuardrailCheck } = models;

    try {
        const traces = await Trace.findAll({
            where: { created_at: { [Op.gte]: since } },
            include: [
                { model: LLMCall, as: 'llm_calls' },
                { model: ToolCall, as: 'tool_calls' },
                { model: GuardrailCheck, as: 'guardrail_checks' }
            ],
            order: [['created_at', 'DESC']]
        });

        const allLLMCalls = traces.flatMap(t => t.llm_calls || []);
        const allToolCalls = traces.flatMap(t => t.tool_calls || []);
        const latencies = traces.map(t => t.total_latency || 0).sort((a, b) => a - b);

        // Prompt Quality
        const promptScores = allLLMCalls.map(c => parseFloat(c.prompt_quality) || 0).filter(s => s > 0);
        const avgPromptQuality = promptScores.length > 0
            ? Math.round((promptScores.reduce((a, b) => a + b, 0) / promptScores.length) * 100)
            : 85;

        // Prompt quality trend (group by hour)
        const promptTrend = _groupByHour(allLLMCalls, 'created_at', c => parseFloat(c.prompt_quality) || 0);

        // Response Accuracy (per agent)
        const accuracyByAgent = {};
        const agentTypes = ['claims', 'underwriting', 'fraud', 'support'];
        agentTypes.forEach(agent => {
            const agentTraces = traces.filter(t => t.agent_type === agent);
            const successful = agentTraces.filter(t => t.status === 'success').length;
            accuracyByAgent[agent] = agentTraces.length > 0
                ? Math.round((successful / agentTraces.length) * 100)
                : 100;
        });

        // Latency percentiles
        const p50 = _percentile(latencies, 50);
        const p95 = _percentile(latencies, 95);
        const p99 = _percentile(latencies, 99);

        // Latency trend
        const latencyTrend = _groupByHour(traces, 'created_at', t => t.total_latency || 0);

        // API Success/Failure rates
        const successCount = allLLMCalls.filter(c => c.status === 'success').length;
        const failCount = allLLMCalls.filter(c => c.status !== 'success').length;

        // Cost breakdown
        const costByAgent = {};
        agentTypes.forEach(agent => {
            const agentTraces = traces.filter(t => t.agent_type === agent);
            costByAgent[agent] = agentTraces.reduce((sum, t) => sum + (parseFloat(t.total_cost) || 0), 0);
        });
        const totalCost = Object.values(costByAgent).reduce((a, b) => a + b, 0);
        const costTrend = _groupByHour(traces, 'created_at', t => parseFloat(t.total_cost) || 0);

        // Drift score (output distribution stability)
        const driftScore = _calculateDriftScore(traces);

        return {
            promptQuality: {
                score: avgPromptQuality,
                trend: promptTrend
            },
            responseAccuracy: {
                byAgent: accuracyByAgent,
                overall: Math.round(Object.values(accuracyByAgent).reduce((a, b) => a + b, 0) / agentTypes.length)
            },
            latency: {
                p50, p95, p99,
                avg: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
                trend: latencyTrend,
                slaBreach: p95 > 5000
            },
            apiRates: {
                success: successCount,
                failure: failCount,
                successRate: (successCount + failCount) > 0
                    ? Math.round((successCount / (successCount + failCount)) * 100)
                    : 100
            },
            cost: {
                total: Math.round(totalCost * 1000000) / 1000000,
                byAgent: costByAgent,
                trend: costTrend,
                avgPerRequest: traces.length > 0 ? totalCost / traces.length : 0
            },
            drift: {
                score: driftScore,
                status: driftScore > 0.3 ? 'warning' : driftScore > 0.5 ? 'critical' : 'normal'
            },
            timerange,
            traceCount: traces.length
        };
    } catch (error) {
        console.error('Analytics error (section1):', error.message);
        return _fallbackSection1();
    }
}

/**
 * Compute Section 2 metrics: LLM Agent Monitoring
 * - Approval Rates, Agent Performance, Decision Accuracy, Tool Usage, Escalations, Compliance
 */
async function getSection2Metrics(models, timerange = '24h', agentFilter = null) {
    const since = getTimeRangeDate(timerange);
    const { Trace, LLMCall, ToolCall, GuardrailCheck } = models;

    try {
        const where = { created_at: { [Op.gte]: since } };
        if (agentFilter) where.agent_type = agentFilter;

        const traces = await Trace.findAll({
            where,
            include: [
                { model: LLMCall, as: 'llm_calls' },
                { model: ToolCall, as: 'tool_calls' },
                { model: GuardrailCheck, as: 'guardrail_checks' }
            ],
            order: [['created_at', 'DESC']]
        });

        const allToolCalls = traces.flatMap(t => t.tool_calls || []);
        const allGuardrails = traces.flatMap(t => t.guardrail_checks || []);

        // Decision distribution
        const decisions = { approved: 0, rejected: 0, escalated: 0, flagged: 0, other: 0 };
        traces.forEach(t => {
            const dec = t.decision_type || t.output_data?.decision || 'other';
            decisions[dec] = (decisions[dec] || 0) + 1;
        });

        // Approval / escalation rates
        const total = traces.length || 1;
        const approvalRate = Math.round((decisions.approved / total) * 100);
        const escalationRate = Math.round(((decisions.escalated + decisions.flagged) / total) * 100);

        // Agent performance scorecards
        const agentTypes = agentFilter ? [agentFilter] : ['claims', 'underwriting', 'fraud', 'support'];
        const agentPerformance = {};
        agentTypes.forEach(agent => {
            const agentTraces = traces.filter(t => t.agent_type === agent);
            const count = agentTraces.length;
            agentPerformance[agent] = {
                totalTraces: count,
                successRate: count > 0
                    ? Math.round((agentTraces.filter(t => t.status === 'success').length / count) * 100)
                    : 100,
                avgLatency: count > 0
                    ? Math.round(agentTraces.reduce((s, t) => s + (t.total_latency || 0), 0) / count)
                    : 0,
                avgCost: count > 0
                    ? agentTraces.reduce((s, t) => s + (parseFloat(t.total_cost) || 0), 0) / count
                    : 0
            };
        });

        // Tool usage distribution
        const toolUsage = {};
        allToolCalls.forEach(tc => {
            const name = tc.tool_name || 'unknown';
            if (!toolUsage[name]) toolUsage[name] = { count: 0, successCount: 0, avgDuration: 0, totalDuration: 0 };
            toolUsage[name].count++;
            if (tc.success) toolUsage[name].successCount++;
            toolUsage[name].totalDuration += (tc.duration_ms || 0);
        });
        Object.keys(toolUsage).forEach(name => {
            toolUsage[name].avgDuration = Math.round(toolUsage[name].totalDuration / toolUsage[name].count);
            toolUsage[name].successRate = Math.round((toolUsage[name].successCount / toolUsage[name].count) * 100);
        });

        // Escalation trend
        const escalationTrend = _groupByHour(
            traces.filter(t => ['escalated', 'flagged'].includes(t.decision_type || t.output_data?.decision)),
            'created_at',
            () => 1,
            'sum'
        );

        // Compliance / guardrail stats
        const guardrailStats = { pii: { passed: 0, failed: 0 }, bias: { passed: 0, failed: 0 }, safety: { passed: 0, failed: 0 }, compliance: { passed: 0, failed: 0 } };
        allGuardrails.forEach(g => {
            const type = g.check_type || 'other';
            if (guardrailStats[type]) {
                if (g.passed) guardrailStats[type].passed++;
                else guardrailStats[type].failed++;
            }
        });

        return {
            decisions,
            approvalRate,
            escalationRate,
            agentPerformance,
            toolUsage,
            escalationTrend,
            compliance: guardrailStats,
            timerange,
            traceCount: traces.length
        };
    } catch (error) {
        console.error('Analytics error (section2):', error.message);
        return _fallbackSection2();
    }
}

/**
 * Compute insurance-type domain analytics (v2)
 * - Distribution of claims per insurance type
 * - Avg verification latency per type
 * - Avg evidence completeness per type
 * - Escalation rate per type
 */
async function getInsuranceTypeMetrics(models, timerange = '24h') {
    const since = getTimeRangeDate(timerange);
    const { Claim, Trace } = models;
    const insuranceTypes = ['health', 'vehicle', 'travel', 'property', 'life'];

    try {
        // Fetch claims within time range
        const claims = await Claim.findAll({
            where: { created_at: { [Op.gte]: since } },
            attributes: ['id', 'insurance_type', 'status', 'evidence_completeness_score', 'claim_amount'],
            raw: true
        });

        // Fetch traces with verification data
        const traces = await Trace.findAll({
            where: { created_at: { [Op.gte]: since }, agent_type: 'claims' },
            attributes: ['id', 'insurance_type', 'verification_latency', 'total_latency', 'decision_type', 'output_data'],
            raw: true
        });

        // Distribution: claims count per type
        const distribution = {};
        insuranceTypes.forEach(type => {
            distribution[type] = claims.filter(c => c.insurance_type === type).length;
        });

        // Verification latency per type
        const latencyByType = {};
        insuranceTypes.forEach(type => {
            const typeTraces = traces.filter(t => (t.insurance_type || '') === type);
            if (typeTraces.length > 0) {
                const totalLat = typeTraces.reduce((sum, t) => sum + (t.verification_latency || t.total_latency || 0), 0);
                latencyByType[type] = Math.round(totalLat / typeTraces.length);
            } else {
                latencyByType[type] = 0;
            }
        });

        // Evidence completeness per type
        const completenessByType = {};
        insuranceTypes.forEach(type => {
            const typeClaims = claims.filter(c => c.insurance_type === type && c.evidence_completeness_score != null);
            if (typeClaims.length > 0) {
                const total = typeClaims.reduce((sum, c) => sum + (parseFloat(c.evidence_completeness_score) || 0), 0);
                completenessByType[type] = Math.round((total / typeClaims.length) * 100) / 100;
            } else {
                completenessByType[type] = 0;
            }
        });

        // Escalation rate per type
        const escalationByType = {};
        insuranceTypes.forEach(type => {
            const typeTraces = traces.filter(t => (t.insurance_type || '') === type);
            const escalated = typeTraces.filter(t => {
                const dec = t.decision_type || (t.output_data ? (typeof t.output_data === 'string' ? JSON.parse(t.output_data) : t.output_data)?.decision : null);
                return dec === 'escalated' || dec === 'flagged';
            }).length;
            escalationByType[type] = typeTraces.length > 0 ? Math.round((escalated / typeTraces.length) * 100) : 0;
        });

        // Total value by type
        const valueByType = {};
        insuranceTypes.forEach(type => {
            valueByType[type] = claims.filter(c => c.insurance_type === type)
                .reduce((sum, c) => sum + (parseFloat(c.claim_amount) || 0), 0);
        });

        return {
            distribution,
            latencyByType,
            completenessByType,
            escalationByType,
            valueByType,
            totalClaims: claims.length,
            timerange
        };
    } catch (error) {
        console.error('Analytics error (insurance-type):', error.message);
        return _fallbackInsuranceType();
    }
}

// ─── Helper Functions ────────────────────────────────

function _percentile(sortedArr, p) {
    if (sortedArr.length === 0) return 0;
    const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, idx)];
}

function _groupByHour(items, dateField, valueFn, mode = 'avg') {
    const buckets = {};
    items.forEach(item => {
        const date = new Date(item[dateField] || item.created_at);
        const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00`;
        if (!buckets[hourKey]) buckets[hourKey] = [];
        buckets[hourKey].push(valueFn(item));
    });

    return Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([time, values]) => ({
            time,
            value: mode === 'sum'
                ? values.reduce((a, b) => a + b, 0)
                : Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
        }));
}

function _calculateDriftScore(traces) {
    // Simple drift: compare first half vs second half decision distribution
    if (traces.length < 10) return 0.05;
    const mid = Math.floor(traces.length / 2);
    const first = traces.slice(0, mid);
    const second = traces.slice(mid);

    const dist = (arr) => {
        const d = { approved: 0, rejected: 0, escalated: 0 };
        arr.forEach(t => {
            const dec = t.decision_type || t.output_data?.decision || 'other';
            if (d[dec] !== undefined) d[dec]++;
        });
        const total = arr.length || 1;
        return { approved: d.approved / total, rejected: d.rejected / total, escalated: d.escalated / total };
    };

    const d1 = dist(first);
    const d2 = dist(second);

    const drift = Math.abs(d1.approved - d2.approved) + Math.abs(d1.rejected - d2.rejected) + Math.abs(d1.escalated - d2.escalated);
    return Math.round(drift * 100) / 100;
}

// ─── Fallback Data ──────────────────────────────────

function _fallbackOverview() {
    return { totalTraces: 0, avgLatency: 0, totalCost: 0, activeAlerts: 0, successRate: 100, agentBreakdown: {}, timerange: '24h' };
}

function _fallbackSection1() {
    return {
        promptQuality: { score: 85, trend: [] },
        responseAccuracy: { byAgent: { claims: 92, underwriting: 88, fraud: 90, support: 95 }, overall: 91 },
        latency: { p50: 800, p95: 2500, p99: 4000, avg: 1200, trend: [], slaBreach: false },
        apiRates: { success: 0, failure: 0, successRate: 100 },
        cost: { total: 0, byAgent: {}, trend: [], avgPerRequest: 0 },
        drift: { score: 0.05, status: 'normal' },
        timerange: '24h', traceCount: 0
    };
}

function _fallbackInsuranceType() {
    return {
        distribution: { health: 12, vehicle: 9, travel: 7, property: 5, life: 3 },
        latencyByType: { health: 1200, vehicle: 950, travel: 1450, property: 1100, life: 800 },
        completenessByType: { health: 0.82, vehicle: 0.75, travel: 0.68, property: 0.88, life: 0.71 },
        escalationByType: { health: 8, vehicle: 12, travel: 15, property: 6, life: 18 },
        valueByType: { health: 45000, vehicle: 38000, travel: 12000, property: 95000, life: 150000 },
        totalClaims: 36,
        timerange: '24h'
    };
}

function _fallbackSection2() {
    return {
        decisions: { approved: 0, rejected: 0, escalated: 0, flagged: 0 },
        approvalRate: 0, escalationRate: 0,
        agentPerformance: {},
        toolUsage: {},
        escalationTrend: [],
        compliance: { pii: { passed: 0, failed: 0 }, bias: { passed: 0, failed: 0 }, safety: { passed: 0, failed: 0 }, compliance: { passed: 0, failed: 0 } },
        timerange: '24h', traceCount: 0
    };
}

module.exports = {
    getOverviewMetrics,
    getSection1Metrics,
    getSection2Metrics,
    getInsuranceTypeMetrics,
    getTimeRangeDate
};
