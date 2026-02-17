/**
 * Traces Routes
 * GET /api/traces — paginated list with filters
 * GET /api/traces/recent — last 20 traces
 * GET /api/traces/:trace_id — full trace detail
 */

const express = require('express');
const router = express.Router();
const traceService = require('../services/traceService');

/**
 * GET /api/traces/recent
 * Returns the most recent 20 traces (for live feed)
 */
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const traces = await traceService.getRecentTraces(req.app.locals.models, limit);
        res.json(traces);
    } catch (error) {
        console.error('Traces recent error:', error.message);
        res.status(500).json({ error: 'Failed to fetch recent traces' });
    }
});

/**
 * GET /api/traces/:trace_id
 * Returns full trace detail with timeline, LLM calls, tool calls, guardrails
 */
router.get('/:trace_id', async (req, res) => {
    try {
        const trace = await traceService.getTraceDetail(req.app.locals.models, req.params.trace_id);
        if (!trace) {
            return res.status(404).json({ error: 'Trace not found' });
        }
        res.json(trace);
    } catch (error) {
        console.error('Trace detail error:', error.message);
        res.status(500).json({ error: 'Failed to fetch trace detail' });
    }
});

/**
 * GET /api/traces
 * Query: ?page=1&limit=20&agent_type=claims&decision=approved&status=success&date_from=...&date_to=...
 */
router.get('/', async (req, res) => {
    try {
        const result = await traceService.getTraces(req.app.locals.models, req.query);
        res.json(result);
    } catch (error) {
        console.error('Traces list error:', error.message);
        res.status(500).json({ error: 'Failed to fetch traces' });
    }
});

module.exports = router;
