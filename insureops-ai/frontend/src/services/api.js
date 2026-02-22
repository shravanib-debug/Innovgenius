import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' },
});

// Centralized error handling
api.interceptors.response.use(
    (res) => res,
    (error) => {
        // Auto-logout on 401 (except for auth endpoints)
        if (error?.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
            localStorage.removeItem('insureops_token');
        }
        console.warn('[API Error]', error?.response?.status, error?.message);
        return Promise.reject(error);
    }
);

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('insureops_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Metrics ──────────────────────────────────
export const getOverviewMetrics = (range = '24h') =>
    api.get(`/metrics/overview?timerange=${range}`).then(r => r.data);

export const getSection1Metrics = (range = '24h') =>
    api.get(`/metrics/section1?timerange=${range}`).then(r => r.data);

export const getSection2Metrics = (range = '24h') =>
    api.get(`/metrics/section2?timerange=${range}`).then(r => r.data);

export const getAgentMetrics = (agentType, range = '24h') =>
    api.get(`/metrics/agent/${agentType}?timerange=${range}`).then(r => r.data);

// ── Claims ───────────────────────────────────
export const getClaims = (params = {}) =>
    api.get('/claims', { params }).then(r => r.data);

export const getClaimDetail = (claimId) =>
    api.get(`/claims/${claimId}`).then(r => r.data);

// ── Insurance Type Metrics ───────────────────
export const getInsuranceTypeMetrics = (timerange = '24h') =>
    api.get(`/metrics/by-insurance-type?timerange=${timerange}`).then(r => r.data);

// ── Traces ───────────────────────────────────
export const getTraces = (params = {}) =>
    api.get('/traces', { params }).then(r => r.data);

export const getTraceDetail = (traceId) =>
    api.get(`/traces/${traceId}`).then(r => r.data);

// ── Agents ───────────────────────────────────
export const triggerClaimsAgent = (input) =>
    api.post('/agents/claims/run', input).then(r => r.data);

export const triggerUnderwritingAgent = (input) =>
    api.post('/agents/underwriting/run', input).then(r => r.data);

export const triggerFraudAgent = (input) =>
    api.post('/agents/fraud/run', input).then(r => r.data);

export const getAgentsStatus = () =>
    api.get('/agents/status').then(r => r.data);

// ── Alerts ───────────────────────────────────
export const getAlerts = (params = {}) =>
    api.get('/alerts', { params }).then(r => r.data);

export const getActiveAlerts = () =>
    api.get('/alerts/active').then(r => r.data);

export const acknowledgeAlert = (alertId) =>
    api.put(`/alerts/${alertId}/acknowledge`).then(r => r.data);

export const getAlertRules = () =>
    api.get('/alerts/rules').then(r => r.data);

export const createAlertRule = (rule) =>
    api.post('/alerts/rules', rule).then(r => r.data);

export const deleteAlertRule = (ruleId) =>
    api.delete(`/alerts/rules/${ruleId}`).then(r => r.data);
// ── Compliance ───────────────────────────────
export const getComplianceOverview = (timerange = '24h') =>
    api.get(`/compliance/overview?timerange=${timerange}`).then(r => r.data);

export const getComplianceEvents = (params = {}) =>
    api.get('/compliance/events', { params }).then(r => r.data);

export const getBiasAnalysis = (timerange = '7d') =>
    api.get(`/compliance/bias?timerange=${timerange}`).then(r => r.data);

export const getAuditLogs = (params = {}) =>
    api.get('/compliance/audit', { params }).then(r => r.data);

export const getPolicyRules = (timerange = '24h') =>
    api.get(`/compliance/policy-rules?timerange=${timerange}`).then(r => r.data);

// ── Auth ─────────────────────────────────────
export const authRegister = (data) =>
    api.post('/auth/register', data).then(r => r.data);

export const authLogin = (data) =>
    api.post('/auth/login', data).then(r => r.data);

export const authMe = () =>
    api.get('/auth/me').then(r => r.data);

export default api;
