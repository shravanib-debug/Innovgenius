/**
 * API Service
 * Centralized Axios client for all backend API endpoints.
 * Provides graceful fallback when backend is unavailable.
 */

import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

// ─── Response interceptor for error handling ──────
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.warn('API Error:', error.message);
        return Promise.reject(error);
    }
);

// ─── Metrics ──────────────────────────────────────
export async function getOverviewMetrics(timerange = '24h') {
    try {
        return await api.get(`/metrics/overview?timerange=${timerange}`);
    } catch {
        return FALLBACK_OVERVIEW;
    }
}

export async function getSection1Metrics(timerange = '24h') {
    try {
        return await api.get(`/metrics/section1?timerange=${timerange}`);
    } catch {
        return FALLBACK_SECTION1;
    }
}

export async function getSection2Metrics(timerange = '24h', agent = null) {
    try {
        const params = `?timerange=${timerange}${agent ? `&agent=${agent}` : ''}`;
        return await api.get(`/metrics/section2${params}`);
    } catch {
        return FALLBACK_SECTION2;
    }
}

// ─── Traces ───────────────────────────────────────
export async function getRecentTraces(limit = 20) {
    try {
        return await api.get(`/traces/recent?limit=${limit}`);
    } catch {
        return FALLBACK_TRACES;
    }
}

export async function getTraces(params = {}) {
    try {
        const query = new URLSearchParams(params).toString();
        return await api.get(`/traces?${query}`);
    } catch {
        return { traces: FALLBACK_TRACES, pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 } };
    }
}

export async function getTraceDetail(traceId) {
    try {
        return await api.get(`/traces/${traceId}`);
    } catch {
        return null;
    }
}

// ─── Alerts ───────────────────────────────────────
export async function getActiveAlerts() {
    try {
        return await api.get('/alerts/active');
    } catch {
        return FALLBACK_ALERTS;
    }
}

export async function getAlerts(params = {}) {
    try {
        const query = new URLSearchParams(params).toString();
        return await api.get(`/alerts?${query}`);
    } catch {
        return { alerts: FALLBACK_ALERTS, pagination: { page: 1, limit: 50, totalItems: 0, totalPages: 0 } };
    }
}

export async function acknowledgeAlert(id) {
    return await api.put(`/alerts/${id}/acknowledge`);
}

export async function getAlertRules() {
    try {
        return await api.get('/alerts/rules');
    } catch {
        return [];
    }
}

// ─── Agents ───────────────────────────────────────
export async function getAgentStatus() {
    try {
        return await api.get('/agents/status');
    } catch {
        return FALLBACK_AGENT_STATUS;
    }
}

export async function triggerAgent(type, input) {
    return await api.post(`/agents/${type}/run`, input);
}

// ─── Fallback Mock Data ───────────────────────────
const FALLBACK_OVERVIEW = {
    totalTraces: 1247,
    avgLatency: 2400,
    totalCost: 34.52,
    activeAlerts: 3,
    successRate: 87,
    agentBreakdown: { claims: 342, underwriting: 287, fraud: 198, support: 420 },
    timerange: '24h'
};

const FALLBACK_SECTION1 = {
    promptQuality: { score: 85, trend: [] },
    responseAccuracy: { byAgent: { claims: 92, underwriting: 88, fraud: 90, support: 95 }, overall: 91 },
    latency: { p50: 800, p95: 2500, p99: 4000, avg: 1200, trend: [], slaBreach: false },
    apiRates: { success: 847, failure: 23, successRate: 97 },
    cost: { total: 34.52, byAgent: { claims: 12.5, underwriting: 8.3, fraud: 6.7, support: 7.02 }, trend: [], avgPerRequest: 0.028 },
    drift: { score: 0.12, status: 'normal' },
    timerange: '24h', traceCount: 870
};

const FALLBACK_SECTION2 = {
    decisions: { approved: 423, rejected: 156, escalated: 89, flagged: 42 },
    approvalRate: 60, escalationRate: 18,
    agentPerformance: {
        claims: { totalTraces: 342, successRate: 89, avgLatency: 2300, avgCost: 0.035 },
        underwriting: { totalTraces: 287, successRate: 84, avgLatency: 3100, avgCost: 0.042 },
        fraud: { totalTraces: 198, successRate: 91, avgLatency: 2800, avgCost: 0.052 },
        support: { totalTraces: 420, successRate: 93, avgLatency: 900, avgCost: 0.012 }
    },
    toolUsage: {
        policy_lookup: { count: 245, successRate: 98, avgDuration: 120 },
        coverage_checker: { count: 189, successRate: 95, avgDuration: 85 },
        risk_calculator: { count: 156, successRate: 99, avgDuration: 45 },
        duplicate_checker: { count: 134, successRate: 97, avgDuration: 200 }
    },
    escalationTrend: [],
    compliance: { pii: { passed: 834, failed: 3 }, bias: { passed: 840, failed: 1 }, safety: { passed: 841, failed: 0 }, compliance: { passed: 838, failed: 2 } },
    timerange: '24h', traceCount: 710
};

const FALLBACK_TRACES = [
    { id: 'tr-f8a1', agent_type: 'claims', status: 'success', total_latency_ms: 2300, total_cost_usd: 0.035, decision: 'approved', created_at: new Date(Date.now() - 2 * 60000).toISOString() },
    { id: 'tr-b3c2', agent_type: 'fraud', status: 'success', total_latency_ms: 3500, total_cost_usd: 0.052, decision: 'flagged', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'tr-d7e3', agent_type: 'underwriting', status: 'success', total_latency_ms: 4100, total_cost_usd: 0.055, decision: 'escalated', created_at: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: 'tr-a2f4', agent_type: 'support', status: 'success', total_latency_ms: 900, total_cost_usd: 0.012, decision: 'approved', created_at: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'tr-e5g5', agent_type: 'claims', status: 'success', total_latency_ms: 1900, total_cost_usd: 0.028, decision: 'rejected', created_at: new Date(Date.now() - 15 * 60000).toISOString() },
];

const FALLBACK_ALERTS = [
    { id: 1, severity: 'warning', name: 'Latency Spike', agent_type: 'claims', current_value: 5.2, threshold: 5.0, created_at: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
    { id: 2, severity: 'critical', name: 'Accuracy Drop', agent_type: 'fraud', current_value: 76.5, threshold: 80, created_at: new Date(Date.now() - 10800000).toISOString(), acknowledged: false },
    { id: 3, severity: 'warning', name: 'High Escalation Rate', agent_type: 'underwriting', current_value: 55, threshold: 50, created_at: new Date(Date.now() - 86400000).toISOString(), acknowledged: false },
];

const FALLBACK_AGENT_STATUS = {
    agents: {
        claims: { status: 'available', type: 'claims', framework: 'langgraph' },
        underwriting: { status: 'available', type: 'underwriting', framework: 'langgraph' },
        fraud: { status: 'available', type: 'fraud', framework: 'langgraph' },
        support: { status: 'available', type: 'support', framework: 'simulator' }
    },
    model: 'openai/gpt-4o-mini'
};

export default api;
