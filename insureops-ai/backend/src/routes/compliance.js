/**
 * Compliance API Routes
 * Endpoints for compliance dashboard, PII scanning, bias analysis, 
 * policy rule validation, and audit trail retrieval.
 */

const express = require('express');
const router = express.Router();
const complianceService = require('../services/complianceService');
const { runComplianceCheck, scanForPII, runFullBiasAnalysis } = require('../core/complianceEngine');

// Middleware to inject models
function withModels(req, res, next) {
    req.models = req.app.locals.models;
    next();
}

router.use(withModels);

// ─── GET /api/compliance/overview ────────────────────
// Returns compliance KPIs for dashboard
router.get('/overview', async (req, res) => {
    try {
        const { timerange = '24h' } = req.query;
        const overview = await complianceService.getComplianceOverview(req.models, timerange);
        res.json(overview);
    } catch (err) {
        console.error('Compliance overview error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/compliance/events ──────────────────────
// Paginated compliance events
router.get('/events', async (req, res) => {
    try {
        const result = await complianceService.getComplianceEvents(req.models, req.query);
        res.json(result);
    } catch (err) {
        console.error('Compliance events error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/compliance/events/:id ──────────────────
// Single compliance event detail
router.get('/events/:id', async (req, res) => {
    try {
        const event = await complianceService.getComplianceEventDetail(req.models, req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (err) {
        console.error('Compliance event detail error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/compliance/bias ────────────────────────
// Bias & fairness analysis
router.get('/bias', async (req, res) => {
    try {
        const { timerange = '7d' } = req.query;
        const analysis = await complianceService.getBiasAnalysis(req.models, timerange);
        res.json(analysis);
    } catch (err) {
        console.error('Bias analysis error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/compliance/audit ───────────────────────
// Audit trail logs
router.get('/audit', async (req, res) => {
    try {
        const result = await complianceService.getAuditLogs(req.models, req.query);
        res.json(result);
    } catch (err) {
        console.error('Audit logs error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/compliance/policy-rules ────────────────
// Policy rules with pass/fail statistics
router.get('/policy-rules', async (req, res) => {
    try {
        const { timerange = '24h' } = req.query;
        const rules = await complianceService.getPolicyRuleStats(req.models, timerange);
        res.json(rules);
    } catch (err) {
        console.error('Policy rules error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/compliance/scan-pii ───────────────────
// Ad-hoc PII scan on arbitrary text
router.post('/scan-pii', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'text field required' });
        const result = scanForPII(text);
        res.json(result);
    } catch (err) {
        console.error('PII scan error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
