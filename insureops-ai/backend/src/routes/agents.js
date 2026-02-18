/**
 * Agent Trigger Routes
 * POST /api/agents/claims/run — trigger claims agent
 * POST /api/agents/underwriting/run — trigger underwriting agent
 * POST /api/agents/fraud/run — trigger fraud agent
 * GET /api/agents/status — agent health check
 */

const express = require('express');
const router = express.Router();
const { runAgent } = require('../services/agentService');

/**
 * POST /api/agents/claims/run
 * Body: { description, policyId, amount }
 */
router.post('/claims/run', async (req, res) => {
    try {
        const input = req.body;
        if (!input.description && !input.claim_type) {
            return res.status(400).json({
                error: 'description or claim_type is required'
            });
        }

        console.log('🤖 Running Claims Agent...');
        const result = await runAgent('claims', input, req.app.locals.models);
        res.json(result);
    } catch (error) {
        console.error('Claims agent error:', error.message);
        res.status(500).json({ error: 'Failed to run claims agent', details: error.message });
    }
});

/**
 * POST /api/agents/underwriting/run
 * Body: { name, age, healthConditions, occupation, coverageAmount }
 */
router.post('/underwriting/run', async (req, res) => {
    try {
        const input = req.body;
        if (!input.name && !input.applicant_name) {
            return res.status(400).json({
                error: 'name is required'
            });
        }

        console.log('🤖 Running Underwriting Agent...');
        const result = await runAgent('underwriting', input, req.app.locals.models);
        res.json(result);
    } catch (error) {
        console.error('Underwriting agent error:', error.message);
        res.status(500).json({ error: 'Failed to run underwriting agent', details: error.message });
    }
});

/**
 * POST /api/agents/fraud/run
 * Body: { claimId, claimantId, description, amount }
 */
router.post('/fraud/run', async (req, res) => {
    try {
        const input = req.body;
        if (!input.claimId && !input.claim_id) {
            return res.status(400).json({
                error: 'claimId is required'
            });
        }

        console.log('🤖 Running Fraud Detection Agent...');
        const result = await runAgent('fraud', input, req.app.locals.models);
        res.json(result);
    } catch (error) {
        console.error('Fraud agent error:', error.message);
        res.status(500).json({ error: 'Failed to run fraud agent', details: error.message });
    }
});

/**
 * GET /api/agents/status
 * Returns health status of all agents
 */
router.get('/status', (req, res) => {
    const apiKeyPresent = !!process.env.OPENROUTER_API_KEY;
    res.json({
        agents: {
            claims: { status: apiKeyPresent ? 'online' : 'no_api_key', type: 'claims', framework: 'openrouter' },
            underwriting: { status: apiKeyPresent ? 'online' : 'no_api_key', type: 'underwriting', framework: 'openrouter' },
            fraud: { status: apiKeyPresent ? 'online' : 'no_api_key', type: 'fraud', framework: 'openrouter' },
        },
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        apiKeyConfigured: apiKeyPresent,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
