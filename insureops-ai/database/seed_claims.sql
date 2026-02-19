-- ============================================
-- InsureOps AI v2 — Seed Data for Claims & Evidence
-- Populates 25 sample claims across 5 insurance types
-- ============================================

-- ─── HEALTH CLAIMS ────────────────────────────────────
INSERT INTO claims (id, policy_id, insurance_type, claim_type, incident_date, claim_amount, description, location, status, verification_status, evidence_completeness_score) VALUES
('a0000001-0001-4000-8000-000000000001', 'POL-H-1001', 'health', 'hospitalization', '2026-01-15', 125000.00, 'Emergency appendectomy surgery at City Hospital. Patient was admitted for 3 days.', 'Mumbai, Maharashtra', 'approved', 'complete', 1.00),
('a0000001-0001-4000-8000-000000000002', 'POL-H-1002', 'health', 'outpatient', '2026-01-20', 8500.00, 'Routine diagnostic tests and specialist consultation for persistent headaches.', 'Delhi, NCR', 'approved', 'complete', 0.75),
('a0000001-0001-4000-8000-000000000003', 'POL-H-1003', 'health', 'hospitalization', '2026-02-01', 350000.00, 'Cardiac bypass surgery. Patient hospitalized for 7 days in ICU.', 'Chennai, Tamil Nadu', 'in_review', 'in_progress', 0.80),
('a0000001-0001-4000-8000-000000000004', 'POL-H-1004', 'health', 'medication', '2026-02-05', 15000.00, 'Ongoing chemotherapy medication costs for cancer treatment.', 'Bangalore, Karnataka', 'pending', 'not_started', 0.50),
('a0000001-0001-4000-8000-000000000005', 'POL-H-1005', 'health', 'hospitalization', '2026-02-10', 75000.00, 'Knee replacement surgery at Apollo Hospital.', 'Hyderabad, Telangana', 'rejected', 'complete', 0.90);

-- ─── VEHICLE CLAIMS ───────────────────────────────────
INSERT INTO claims (id, policy_id, insurance_type, claim_type, incident_date, claim_amount, description, location, status, verification_status, evidence_completeness_score) VALUES
('b0000002-0002-4000-8000-000000000001', 'POL-V-2001', 'vehicle', 'collision', '2026-01-18', 85000.00, 'Rear-end collision at traffic signal. Front bumper and radiator damaged.', 'Pune, Maharashtra', 'approved', 'complete', 1.00),
('b0000002-0002-4000-8000-000000000002', 'POL-V-2002', 'vehicle', 'theft', '2026-01-25', 450000.00, 'Vehicle stolen from residential parking. FIR filed within 24 hours.', 'Noida, UP', 'in_review', 'in_progress', 0.85),
('b0000002-0002-4000-8000-000000000003', 'POL-V-2003', 'vehicle', 'collision', '2026-02-02', 120000.00, 'Head-on collision on highway. Extensive front damage, airbags deployed.', 'Jaipur, Rajasthan', 'escalated', 'complete', 0.70),
('b0000002-0002-4000-8000-000000000004', 'POL-V-2004', 'vehicle', 'natural_disaster', '2026-02-08', 200000.00, 'Vehicle submerged in flash flood. Engine and electrical systems damaged.', 'Mumbai, Maharashtra', 'pending', 'not_started', 0.40),
('b0000002-0002-4000-8000-000000000005', 'POL-V-2005', 'vehicle', 'collision', '2026-02-12', 35000.00, 'Minor fender bender in parking lot. Scratches and dent on rear door.', 'Bangalore, Karnataka', 'approved', 'complete', 1.00);

-- ─── TRAVEL CLAIMS ────────────────────────────────────
INSERT INTO claims (id, policy_id, insurance_type, claim_type, incident_date, claim_amount, description, location, status, verification_status, evidence_completeness_score) VALUES
('c0000003-0003-4000-8000-000000000001', 'POL-T-3001', 'travel', 'flight_delay', '2026-01-22', 15000.00, 'Flight delayed by 12 hours due to weather. Hotel and meals expenses claimed.', 'Delhi Airport, NCR', 'approved', 'complete', 1.00),
('c0000003-0003-4000-8000-000000000002', 'POL-T-3002', 'travel', 'lost_baggage', '2026-01-28', 25000.00, 'Checked baggage lost during transit. Essential items purchased at destination.', 'Mumbai Airport, Maharashtra', 'in_review', 'in_progress', 0.65),
('c0000003-0003-4000-8000-000000000003', 'POL-T-3003', 'travel', 'trip_cancellation', '2026-02-03', 50000.00, 'Trip cancelled due to medical emergency. Non-refundable bookings claimed.', 'Kochi, Kerala', 'pending', 'not_started', 0.55),
('c0000003-0003-4000-8000-000000000004', 'POL-T-3004', 'travel', 'medical_emergency', '2026-02-09', 120000.00, 'Hospitalized abroad for food poisoning. Emergency medical treatment.', 'Bangkok, Thailand', 'approved', 'complete', 0.90),
('c0000003-0003-4000-8000-000000000005', 'POL-T-3005', 'travel', 'flight_delay', '2026-02-14', 8000.00, 'Flight cancelled. Alternative transport and accommodation expenses.', 'Goa Airport', 'rejected', 'complete', 1.00);

-- ─── PROPERTY CLAIMS ──────────────────────────────────
INSERT INTO claims (id, policy_id, insurance_type, claim_type, incident_date, claim_amount, description, location, status, verification_status, evidence_completeness_score) VALUES
('d0000004-0004-4000-8000-000000000001', 'POL-P-4001', 'property', 'fire', '2026-01-10', 500000.00, 'Kitchen fire spread to living room. Structural damage and furniture loss.', 'Pune, Maharashtra', 'in_review', 'in_progress', 0.80),
('d0000004-0004-4000-8000-000000000002', 'POL-P-4002', 'property', 'flood', '2026-01-30', 350000.00, 'Ground floor flooded after heavy rains. Furniture and appliances damaged.', 'Chennai, Tamil Nadu', 'approved', 'complete', 1.00),
('d0000004-0004-4000-8000-000000000003', 'POL-P-4003', 'property', 'burglary', '2026-02-04', 150000.00, 'Break-in at commercial property. Electronics and cash stolen.', 'Delhi, NCR', 'escalated', 'complete', 0.75),
('d0000004-0004-4000-8000-000000000004', 'POL-P-4004', 'property', 'structural', '2026-02-11', 800000.00, 'Earthquake damage to residential building. Cracks in walls, foundation shift.', 'Dehradun, Uttarakhand', 'pending', 'not_started', 0.30),
('d0000004-0004-4000-8000-000000000005', 'POL-P-4005', 'property', 'fire', '2026-02-15', 120000.00, 'Electrical short circuit caused minor fire. Damage to one room.', 'Bangalore, Karnataka', 'approved', 'complete', 0.95);

-- ─── LIFE CLAIMS ──────────────────────────────────────
INSERT INTO claims (id, policy_id, insurance_type, claim_type, incident_date, claim_amount, description, location, status, verification_status, evidence_completeness_score) VALUES
('e0000005-0005-4000-8000-000000000001', 'POL-L-5001', 'life', 'death_benefit', '2026-01-05', 2500000.00, 'Policyholder passed away due to cardiac arrest. Nominee claims death benefit.', 'Mumbai, Maharashtra', 'approved', 'complete', 1.00),
('e0000005-0005-4000-8000-000000000002', 'POL-L-5002', 'life', 'death_benefit', '2026-01-12', 1500000.00, 'Accidental death during trekking. Claims under accidental death rider.', 'Manali, Himachal Pradesh', 'in_review', 'in_progress', 0.85),
('e0000005-0005-4000-8000-000000000003', 'POL-L-5003', 'life', 'critical_illness', '2026-02-06', 1000000.00, 'Diagnosed with stage 3 cancer. Critical illness benefit claimed.', 'Hyderabad, Telangana', 'pending', 'not_started', 0.60),
('e0000005-0005-4000-8000-000000000004', 'POL-L-5004', 'life', 'death_benefit', '2026-02-13', 5000000.00, 'Suspicious death circumstances. Policy purchased 6 months before incident.', 'Lucknow, UP', 'escalated', 'in_progress', 0.70),
('e0000005-0005-4000-8000-000000000005', 'POL-L-5005', 'life', 'maturity', '2026-02-16', 750000.00, 'Term plan maturity benefit. Policyholder alive at term end.', 'Kolkata, West Bengal', 'approved', 'complete', 1.00);
