/**
 * Evidence Routes
 * POST   /api/claims/:id/evidence              — Upload evidence file(s) for a claim
 * GET    /api/claims/:id/evidence              — List all evidence for a claim
 * DELETE /api/claims/:id/evidence/:evidenceId  — Remove an evidence file
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { upload, getFileUrl, getFileType, deleteFile } = require('../services/evidenceService');
const claimService = require('../services/claimService');

/**
 * POST /api/claims/:id/evidence
 * Multipart upload — field name: "files" (up to 10 files)
 */
router.post('/', upload.array('files', 10), async (req, res) => {
    try {
        const { ClaimEvidence, Claim } = req.app.locals.models;
        const claimId = req.params.id;

        // Verify claim exists
        const claim = await Claim.findByPk(claimId);
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Get evidence categories from body (optional, auto-assign if not provided)
        const categories = req.body.categories
            ? (Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories])
            : [];

        const evidenceRecords = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const category = categories[i] || 'general';

            const record = await ClaimEvidence.create({
                claim_id: claimId,
                file_url: getFileUrl(claimId, file.filename),
                file_name: file.originalname,
                file_type: getFileType(file.mimetype),
                file_size_bytes: file.size,
                evidence_category: category,
                insurance_type: claim.insurance_type,
            });

            evidenceRecords.push(record.toJSON());
        }

        // Update completeness score
        const scoreResult = await claimService.updateCompletenessScore(req.app.locals.models, claimId);

        console.log(`📎 Uploaded ${req.files.length} evidence file(s) for claim ${claimId} (completeness: ${Math.round(scoreResult.score * 100)}%)`);

        res.status(201).json({
            success: true,
            uploaded: evidenceRecords.length,
            evidence: evidenceRecords,
            completenessScore: scoreResult.score,
            totalEvidence: scoreResult.evidenceCount,
        });
    } catch (error) {
        console.error('Evidence upload error:', error.message);
        res.status(500).json({ error: 'Failed to upload evidence', details: error.message });
    }
});

/**
 * GET /api/claims/:id/evidence
 * List all evidence files for a claim
 */
router.get('/', async (req, res) => {
    try {
        const { ClaimEvidence } = req.app.locals.models;
        const claimId = req.params.id;

        const evidence = await ClaimEvidence.findAll({
            where: { claim_id: claimId },
            order: [['created_at', 'ASC']],
        });

        res.json({
            success: true,
            count: evidence.length,
            evidence: evidence.map(e => e.toJSON()),
        });
    } catch (error) {
        console.error('List evidence error:', error.message);
        res.status(500).json({ error: 'Failed to fetch evidence', details: error.message });
    }
});

/**
 * DELETE /api/claims/:id/evidence/:evidenceId
 * Remove an evidence file and its DB record
 */
router.delete('/:evidenceId', async (req, res) => {
    try {
        const { ClaimEvidence } = req.app.locals.models;
        const { id: claimId, evidenceId } = req.params;

        const record = await ClaimEvidence.findOne({
            where: { id: evidenceId, claim_id: claimId },
        });

        if (!record) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        // Delete file from disk
        await deleteFile(record.file_url);

        // Delete DB record
        await record.destroy();

        // Update completeness score
        const scoreResult = await claimService.updateCompletenessScore(req.app.locals.models, claimId);

        console.log(`🗑️  Deleted evidence ${evidenceId} from claim ${claimId}`);

        res.json({
            success: true,
            deleted: evidenceId,
            completenessScore: scoreResult.score,
            totalEvidence: scoreResult.evidenceCount,
        });
    } catch (error) {
        console.error('Delete evidence error:', error.message);
        res.status(500).json({ error: 'Failed to delete evidence', details: error.message });
    }
});

// ─── Multer error handler ────────────────────────────
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

module.exports = router;
