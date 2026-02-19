/**
 * Claim Service
 * Business logic for claims CRUD and evidence completeness scoring.
 */

// Evidence requirements per insurance type (used for completeness scoring)
const EVIDENCE_REQUIREMENTS = {
    health: [
        { key: 'hospital_bills', label: 'Hospital Bills', required: true },
        { key: 'medical_reports', label: 'Medical Reports', required: true },
        { key: 'discharge_summary', label: 'Discharge Summary', required: true },
        { key: 'prescription', label: 'Doctor Prescription', required: false },
    ],
    vehicle: [
        { key: 'accident_images', label: 'Accident Images', required: true },
        { key: 'police_fir', label: 'Police FIR / Report', required: true },
        { key: 'repair_estimates', label: 'Repair Estimates', required: true },
        { key: 'driver_details', label: 'Driver Details', required: true },
    ],
    travel: [
        { key: 'boarding_pass', label: 'Flight Tickets / Boarding Pass', required: true },
        { key: 'delay_proof', label: 'Delay/Cancellation Proof', required: true },
        { key: 'itinerary', label: 'Travel Itinerary', required: false },
        { key: 'emergency_docs', label: 'Emergency Documents', required: false },
    ],
    property: [
        { key: 'ownership_proof', label: 'Ownership Proof', required: true },
        { key: 'damage_photos', label: 'Damage Photos/Videos', required: true },
        { key: 'surveyor_report', label: 'Surveyor Report', required: true },
        { key: 'repair_costs', label: 'Repair Cost Estimates', required: true },
    ],
    life: [
        { key: 'death_certificate', label: 'Death Certificate', required: true },
        { key: 'medical_history', label: 'Medical History', required: true },
        { key: 'nominee_details', label: 'Nominee Details', required: true },
        { key: 'policy_tenure', label: 'Policy Tenure Records', required: true },
    ],
};

/**
 * Calculate evidence completeness score based on insurance type and uploaded evidence count
 * Returns a score from 0.00 to 1.00
 */
function calculateCompletenessScore(insuranceType, evidenceCount) {
    const requirements = EVIDENCE_REQUIREMENTS[insuranceType];
    if (!requirements) return 0;

    const requiredCount = requirements.filter(r => r.required).length;
    if (requiredCount === 0) return 1;

    return Math.min(evidenceCount / requiredCount, 1.0);
}

/**
 * Get required evidence categories for an insurance type
 */
function getRequiredEvidence(insuranceType) {
    return EVIDENCE_REQUIREMENTS[insuranceType] || [];
}

/**
 * Create a new claim
 */
async function createClaim(models, data) {
    const { Claim } = models;

    const claim = await Claim.create({
        policy_id: data.policy_id,
        insurance_type: data.insurance_type,
        claim_type: data.claim_type || data.insurance_type,
        incident_date: data.incident_date || null,
        claim_amount: data.claim_amount || 0,
        description: data.description || '',
        location: data.location || '',
        status: 'pending',
        verification_status: 'not_started',
        evidence_completeness_score: 0.00,
        type_specific_data: data.type_specific_data || {},
    });

    return claim;
}

/**
 * Get claims with optional filtering
 */
async function getClaims(models, filters = {}) {
    const { Claim, ClaimEvidence } = models;
    const where = {};

    if (filters.insurance_type) where.insurance_type = filters.insurance_type;
    if (filters.status) where.status = filters.status;

    const claims = await Claim.findAll({
        where,
        include: [
            { model: ClaimEvidence, as: 'evidence', attributes: ['id', 'file_name', 'file_type', 'evidence_category'] },
        ],
        order: [['created_at', 'DESC']],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
    });

    return claims;
}

/**
 * Get a single claim with full details
 */
async function getClaimById(models, claimId) {
    const { Claim, ClaimEvidence, Trace } = models;

    const claim = await Claim.findByPk(claimId, {
        include: [
            { model: ClaimEvidence, as: 'evidence' },
            { model: Trace, as: 'trace', required: false },
        ],
    });

    return claim;
}

/**
 * Update a claim's status
 */
async function updateClaimStatus(models, claimId, status) {
    const { Claim } = models;

    const claim = await Claim.findByPk(claimId);
    if (!claim) return null;

    claim.status = status;
    await claim.save();
    return claim;
}

/**
 * Update evidence completeness score for a claim
 */
async function updateCompletenessScore(models, claimId) {
    const { Claim, ClaimEvidence } = models;

    const claim = await Claim.findByPk(claimId);
    if (!claim) return null;

    const evidenceCount = await ClaimEvidence.count({ where: { claim_id: claimId } });
    const score = calculateCompletenessScore(claim.insurance_type, evidenceCount);

    claim.evidence_completeness_score = score;
    await claim.save();

    return { score, evidenceCount };
}

module.exports = {
    createClaim,
    getClaims,
    getClaimById,
    updateClaimStatus,
    updateCompletenessScore,
    calculateCompletenessScore,
    getRequiredEvidence,
    EVIDENCE_REQUIREMENTS,
};
