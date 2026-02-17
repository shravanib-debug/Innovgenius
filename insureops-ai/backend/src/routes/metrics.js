/**
 * Metrics Routes
 * GET /api/metrics/overview — Top-level KPIs
 * GET /api/metrics/section1 — AI Application Monitoring metrics
 * GET /api/metrics/section2 — LLM Agent Monitoring metrics
 */

const express = require('express');
const router = express.Router();
const metricsService = require('../services/metricsService');

/**
 * GET /api/metrics/overview
 * Query: ?timerange=1h|6h|24h|7d (default: 24h)
 */
router.get('/overview', async (req, res) => {
    try {
        const { timerange = '24h' } = req.query;
        const data = await metricsService.getOverview(req.app.locals.models, timerange);
        res.json(data);
    } catch (error) {
        console.error('Metrics overview error:', error.message);
        res.status(500).json({ error: 'Failed to fetch overview metrics' });
    }
});

/**
 * GET /api/metrics/section1
 * Query: ?timerange=1h|6h|24h|7d
 */
router.get('/section1', async (req, res) => {
    try {
        const { timerange = '24h' } = req.query;
        const data = await metricsService.getSection1(req.app.locals.models, timerange);
        res.json(data);
    } catch (error) {
        console.error('Metrics section1 error:', error.message);
        res.status(500).json({ error: 'Failed to fetch Section 1 metrics' });
    }
});

/**
 * GET /api/metrics/section2
 * Query: ?timerange=1h|6h|24h|7d&agent=claims|underwriting|fraud|support
 */
router.get('/section2', async (req, res) => {
    try {
        const { timerange = '24h', agent = null } = req.query;
        const data = await metricsService.getSection2(req.app.locals.models, timerange, agent);
        res.json(data);
    } catch (error) {
        console.error('Metrics section2 error:', error.message);
        res.status(500).json({ error: 'Failed to fetch Section 2 metrics' });
    }
});

module.exports = router;
