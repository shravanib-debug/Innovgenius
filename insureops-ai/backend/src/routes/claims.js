/**
 * Claims Routes
 * POST   /api/claims           — Create a new claim
 * GET    /api/claims           — List claims (filter by insurance_type, status)
 * GET    /api/claims/:id       — Get full claim detail + evidence + linked trace
 * PUT    /api/claims/:id/status — Update claim status
 */

const express = require('express');
const router = express.Router();
const claimService = require('../services/claimService');

/**
 * POST /api/claims
 * Body: { insurance_type, policy_id, claim_amount, description, location, incident_date, claim_type, type_specific_data }
 */
router.post('/', async (req, res) => {
    try {
        const { insurance_type, policy_id, claim_amount, description } = req.body;

        if (!insurance_type) {
            return res.status(400).json({ error: 'insurance_type is required' });
        }
        if (!policy_id) {
            return res.status(400).json({ error: 'policy_id is required' });
        }

        const validTypes = ['health', 'life', 'vehicle', 'travel', 'property'];
        if (!validTypes.includes(insurance_type)) {
            return res.status(400).json({ error: `Invalid insurance_type. Must be one of: ${validTypes.join(', ')}` });
        }

        console.log(`📋 Creating ${insurance_type} claim for policy ${policy_id}...`);
        const claim = await claimService.createClaim(req.app.locals.models, req.body);

        res.status(201).json({
            success: true,
            claim: claim.toJSON(),
            requiredEvidence: claimService.getRequiredEvidence(insurance_type),
        });
    } catch (error) {
        console.error('Create claim error:', error.message);
        res.status(500).json({ error: 'Failed to create claim', details: error.message });
    }
});

/**
 * GET /api/claims
 * Query: ?insurance_type=health&status=pending&limit=50&offset=0
 */
router.get('/', async (req, res) => {
    try {
        const { insurance_type, status, limit, offset } = req.query;
        const claims = await claimService.getClaims(req.app.locals.models, {
            insurance_type,
            status,
            limit: parseInt(limit) || 50,
            offset: parseInt(offset) || 0,
        });

        res.json({
            success: true,
            count: claims.length,
            claims: claims.map(c => c.toJSON()),
        });
    } catch (error) {
        console.error('List claims error:', error.message);
        res.status(500).json({ error: 'Failed to fetch claims', details: error.message });
    }
});

/**
 * GET /api/claims/:id
 * Returns full claim detail with evidence list and linked trace
 */
router.get('/:id', async (req, res) => {
    try {
        const claim = await claimService.getClaimById(req.app.locals.models, req.params.id);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json({
            success: true,
            claim: claim.toJSON(),
        });
    } catch (error) {
        console.error('Get claim error:', error.message);
        res.status(500).json({ error: 'Failed to fetch claim', details: error.message });
    }
});

/**
 * PUT /api/claims/:id/status
 * Body: { status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated' }
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'in_review', 'approved', 'rejected', 'escalated'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const claim = await claimService.updateClaimStatus(req.app.locals.models, req.params.id, status);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json({
            success: true,
            claim: claim.toJSON(),
        });
    } catch (error) {
        console.error('Update claim status error:', error.message);
        res.status(500).json({ error: 'Failed to update claim status', details: error.message });
    }
});

module.exports = router;
