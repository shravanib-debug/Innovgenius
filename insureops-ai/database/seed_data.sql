-- ============================================
-- InsureOps AI — Seed Data
-- Populates dashboard with initial data
-- ============================================

-- ============================================
-- DEFAULT ALERT RULES (7 rules)
-- ============================================
INSERT INTO alert_rules (name, description, metric, condition, threshold, severity, agent_type, enabled) VALUES
('Latency Spike', 'P95 latency exceeds 5000ms for sustained period', 'p95_latency', 'gt', 5000, 'warning', NULL, TRUE),
('Accuracy Drop', 'Agent accuracy drops below 80% over last 50 decisions', 'accuracy', 'lt', 80, 'critical', NULL, TRUE),
('Cost Overrun', 'Daily cost exceeds $50 budget', 'daily_cost', 'gt', 50, 'warning', NULL, TRUE),
('Compliance Violation', 'PII detected in response or bias flag triggered', 'compliance_violations', 'gt', 0, 'critical', NULL, TRUE),
('High Escalation Rate', 'Escalation rate exceeds 50% for any agent', 'escalation_rate', 'gt', 50, 'warning', NULL, TRUE),
('API Failure Rate', 'Success rate drops below 95% over last 100 calls', 'success_rate', 'lt', 95, 'critical', NULL, TRUE),
('Drift Detected', 'Model drift score exceeds 0.3 threshold', 'drift_score', 'gt', 0.3, 'investigation', NULL, TRUE);

-- ============================================
-- SAMPLE TRACES — Claims Agent (15 traces)
-- ============================================
INSERT INTO traces (id, agent_type, timestamp, total_latency, total_cost, decision_type, confidence, reasoning, escalated, human_override, status, input_data, output_data) VALUES
('a1000001-0000-0000-0000-000000000001', 'claims', NOW() - INTERVAL '6 hours', 2340, 0.035, 'approved', 0.92, 'Claim valid per policy terms. Water damage covered under standard homeowner policy.', FALSE, NULL, 'success', '{"claim_type": "water_damage", "amount": 7500, "policy_id": "POL-1001"}', '{"payout": 6800, "decision": "approved"}'),
('a1000001-0000-0000-0000-000000000002', 'claims', NOW() - INTERVAL '5 hours', 3120, 0.042, 'escalated', 0.67, 'High value claim exceeds $10,000 threshold. Requires human adjuster review.', TRUE, NULL, 'success', '{"claim_type": "fire_damage", "amount": 25000, "policy_id": "POL-1002"}', '{"payout": null, "decision": "escalated"}'),
('a1000001-0000-0000-0000-000000000003', 'claims', NOW() - INTERVAL '4 hours', 1890, 0.028, 'rejected', 0.88, 'Claim type not covered under existing policy. Flood damage excluded.', FALSE, NULL, 'success', '{"claim_type": "flood_damage", "amount": 12000, "policy_id": "POL-1003"}', '{"payout": 0, "decision": "rejected"}'),
('a1000001-0000-0000-0000-000000000004', 'claims', NOW() - INTERVAL '3 hours', 2560, 0.038, 'approved', 0.95, 'Auto collision claim verified. Coverage confirmed and deductible applied.', FALSE, NULL, 'success', '{"claim_type": "auto_collision", "amount": 4200, "policy_id": "POL-1004"}', '{"payout": 3700, "decision": "approved"}'),
('a1000001-0000-0000-0000-000000000005', 'claims', NOW() - INTERVAL '2 hours', 2100, 0.031, 'approved', 0.89, 'Theft claim validated. Items covered under personal property clause.', FALSE, NULL, 'success', '{"claim_type": "theft", "amount": 3500, "policy_id": "POL-1005"}', '{"payout": 3200, "decision": "approved"}'),
('a1000001-0000-0000-0000-000000000006', 'claims', NOW() - INTERVAL '1 day 2 hours', 2780, 0.040, 'approved', 0.91, 'Medical claim approved within coverage limits.', FALSE, NULL, 'success', '{"claim_type": "medical", "amount": 8900, "policy_id": "POL-1006"}', '{"payout": 8100, "decision": "approved"}'),
('a1000001-0000-0000-0000-000000000007', 'claims', NOW() - INTERVAL '1 day 5 hours', 3450, 0.045, 'escalated', 0.55, 'Ambiguous coverage terms for this claim type. Escalating for expert review.', TRUE, TRUE, 'success', '{"claim_type": "liability", "amount": 45000, "policy_id": "POL-1007"}', '{"payout": null, "decision": "escalated"}'),
('a1000001-0000-0000-0000-000000000008', 'claims', NOW() - INTERVAL '1 day 8 hours', 1650, 0.025, 'rejected', 0.93, 'Claim filed after policy expiration date.', FALSE, NULL, 'success', '{"claim_type": "water_damage", "amount": 5600, "policy_id": "POL-1008"}', '{"payout": 0, "decision": "rejected"}'),
('a1000001-0000-0000-0000-000000000009', 'claims', NOW() - INTERVAL '2 days', 2200, 0.033, 'approved', 0.87, 'Windstorm damage covered under comprehensive policy.', FALSE, NULL, 'success', '{"claim_type": "windstorm", "amount": 6700, "policy_id": "POL-1009"}', '{"payout": 6200, "decision": "approved"}'),
('a1000001-0000-0000-0000-000000000010', 'claims', NOW() - INTERVAL '2 days 4 hours', 4100, 0.052, 'error', 0.00, 'LLM API timeout during claim analysis.', FALSE, NULL, 'error', '{"claim_type": "auto_collision", "amount": 9800, "policy_id": "POL-1010"}', NULL),
('a1000001-0000-0000-0000-000000000011', 'claims', NOW() - INTERVAL '3 days', 2450, 0.036, 'approved', 0.90, 'Kitchen fire damage claim validated and approved.', FALSE, NULL, 'success', '{"claim_type": "fire_damage", "amount": 9200, "policy_id": "POL-1011"}', '{"payout": 8500, "decision": "approved"}'),
('a1000001-0000-0000-0000-000000000012', 'claims', NOW() - INTERVAL '3 days 6 hours', 2890, 0.041, 'escalated', 0.62, 'Borderline coverage determination requires human review.', TRUE, FALSE, 'success', '{"claim_type": "mold_damage", "amount": 15000, "policy_id": "POL-1012"}', '{"payout": null, "decision": "escalated"}'),
('a1000001-0000-0000-0000-000000000013', 'claims', NOW() - INTERVAL '4 days', 1980, 0.029, 'approved', 0.94, 'Minor auto glass damage covered.', FALSE, NULL, 'success', '{"claim_type": "auto_glass", "amount": 850, "policy_id": "POL-1013"}', '{"payout": 650, "decision": "approved"}'),
('a1000001-0000-0000-0000-000000000014', 'claims', NOW() - INTERVAL '5 days', 2670, 0.039, 'rejected', 0.86, 'Pre-existing condition not covered under policy.', FALSE, NULL, 'success', '{"claim_type": "structural", "amount": 22000, "policy_id": "POL-1014"}', '{"payout": 0, "decision": "rejected"}'),
('a1000001-0000-0000-0000-000000000015', 'claims', NOW() - INTERVAL '6 days', 2350, 0.034, 'approved', 0.91, 'Personal property loss from burglary confirmed and approved.', FALSE, NULL, 'success', '{"claim_type": "theft", "amount": 4800, "policy_id": "POL-1015"}', '{"payout": 4300, "decision": "approved"}');

-- ============================================
-- SAMPLE TRACES — Underwriting Agent (12 traces)
-- ============================================
INSERT INTO traces (id, agent_type, timestamp, total_latency, total_cost, decision_type, confidence, reasoning, escalated, human_override, status, input_data, output_data) VALUES
('b2000001-0000-0000-0000-000000000001', 'underwriting', NOW() - INTERVAL '3 hours', 3200, 0.048, 'approved', 0.85, 'Low-risk applicant. Young, healthy, office occupation.', FALSE, NULL, 'success', '{"name": "John Smith", "age": 28, "conditions": [], "occupation": "software_engineer", "coverage": 250000}', '{"risk_score": 0.25, "premium": 180, "decision": "approved"}'),
('b2000001-0000-0000-0000-000000000002', 'underwriting', NOW() - INTERVAL '5 hours', 4100, 0.055, 'escalated', 0.58, 'High-risk score (0.78) due to pre-existing conditions. Flagged for human underwriter.', TRUE, NULL, 'success', '{"name": "Mary Johnson", "age": 55, "conditions": ["diabetes", "hypertension"], "occupation": "construction_worker", "coverage": 500000}', '{"risk_score": 0.78, "premium": null, "decision": "escalated"}'),
('b2000001-0000-0000-0000-000000000003', 'underwriting', NOW() - INTERVAL '8 hours', 2900, 0.043, 'approved', 0.90, 'Moderate risk acceptably within guidelines. Standard premium applied.', FALSE, NULL, 'success', '{"name": "David Lee", "age": 35, "conditions": ["asthma"], "occupation": "teacher", "coverage": 300000}', '{"risk_score": 0.40, "premium": 220, "decision": "approved"}'),
('b2000001-0000-0000-0000-000000000004', 'underwriting', NOW() - INTERVAL '1 day', 3500, 0.050, 'rejected', 0.82, 'Extremely high risk profile. Multiple severe conditions, dangerous occupation.', FALSE, NULL, 'success', '{"name": "Robert Chen", "age": 62, "conditions": ["heart_disease", "diabetes", "obesity"], "occupation": "mining", "coverage": 750000}', '{"risk_score": 0.92, "premium": null, "decision": "rejected"}'),
('b2000001-0000-0000-0000-000000000005', 'underwriting', NOW() - INTERVAL '1 day 6 hours', 2700, 0.041, 'approved', 0.93, 'Young healthy applicant. Minimal risk factors.', FALSE, NULL, 'success', '{"name": "Emily Davis", "age": 24, "conditions": [], "occupation": "marketing", "coverage": 150000}', '{"risk_score": 0.15, "premium": 95, "decision": "approved"}'),
('b2000001-0000-0000-0000-000000000006', 'underwriting', NOW() - INTERVAL '2 days', 3800, 0.053, 'escalated', 0.61, 'High coverage amount with moderate risk. Requires human review.', TRUE, TRUE, 'success', '{"name": "Michael Brown", "age": 45, "conditions": ["high_cholesterol"], "occupation": "pilot", "coverage": 1000000}', '{"risk_score": 0.72, "premium": null, "decision": "escalated"}'),
('b2000001-0000-0000-0000-000000000007', 'underwriting', NOW() - INTERVAL '2 days 8 hours', 2600, 0.039, 'approved', 0.88, 'Standard risk. No concerning factors.', FALSE, NULL, 'success', '{"name": "Sarah Wilson", "age": 32, "conditions": [], "occupation": "nurse", "coverage": 200000}', '{"risk_score": 0.30, "premium": 155, "decision": "approved"}'),
('b2000001-0000-0000-0000-000000000008', 'underwriting', NOW() - INTERVAL '3 days', 3100, 0.046, 'approved', 0.84, 'Moderate risk with manageable conditions.', FALSE, NULL, 'success', '{"name": "James Taylor", "age": 48, "conditions": ["mild_anxiety"], "occupation": "accountant", "coverage": 400000}', '{"risk_score": 0.45, "premium": 290, "decision": "approved"}'),
('b2000001-0000-0000-0000-000000000009', 'underwriting', NOW() - INTERVAL '4 days', 2950, 0.044, 'rejected', 0.79, 'High risk: recent hospitalization combined with dangerous occupation.', FALSE, NULL, 'success', '{"name": "William Harris", "age": 58, "conditions": ["back_injury", "high_bp"], "occupation": "firefighter", "coverage": 600000}', '{"risk_score": 0.85, "premium": null, "decision": "rejected"}'),
('b2000001-0000-0000-0000-000000000010', 'underwriting', NOW() - INTERVAL '4 days 12 hours', 2500, 0.037, 'approved', 0.92, 'Low risk profile. Excellent health history.', FALSE, NULL, 'success', '{"name": "Lisa Anderson", "age": 30, "conditions": [], "occupation": "designer", "coverage": 200000}', '{"risk_score": 0.18, "premium": 110, "decision": "approved"}'),
('b2000001-0000-0000-0000-000000000011', 'underwriting', NOW() - INTERVAL '5 days', 3300, 0.049, 'escalated', 0.63, 'Borderline risk score. Needs senior underwriter assessment.', TRUE, NULL, 'success', '{"name": "Thomas Moore", "age": 50, "conditions": ["pre_diabetes"], "occupation": "truck_driver", "coverage": 450000}', '{"risk_score": 0.71, "premium": null, "decision": "escalated"}'),
('b2000001-0000-0000-0000-000000000012', 'underwriting', NOW() - INTERVAL '6 days', 2800, 0.042, 'approved', 0.87, 'Acceptable risk with minor conditions.', FALSE, NULL, 'success', '{"name": "Jessica Clark", "age": 38, "conditions": ["allergies"], "occupation": "lawyer", "coverage": 350000}', '{"risk_score": 0.32, "premium": 195, "decision": "approved"}');

-- ============================================
-- SAMPLE TRACES — Fraud Agent (12 traces)
-- ============================================
INSERT INTO traces (id, agent_type, timestamp, total_latency, total_cost, decision_type, confidence, reasoning, escalated, human_override, status, input_data, output_data) VALUES
('c3000001-0000-0000-0000-000000000001', 'fraud', NOW() - INTERVAL '2 hours', 2800, 0.044, 'approved', 0.90, 'No fraud indicators detected. Claim is legitimate.', FALSE, NULL, 'success', '{"claimant_id": "CLM-001", "amount": 5200, "claim_type": "auto_collision"}', '{"fraud_score": 0.08, "recommendation": "legitimate"}'),
('c3000001-0000-0000-0000-000000000002', 'fraud', NOW() - INTERVAL '4 hours', 3500, 0.052, 'flagged', 0.75, 'Multiple red flags: recent policy, high claim amount, history of claims.', TRUE, NULL, 'success', '{"claimant_id": "CLM-002", "amount": 48000, "claim_type": "fire_damage"}', '{"fraud_score": 0.82, "recommendation": "investigate"}'),
('c3000001-0000-0000-0000-000000000003', 'fraud', NOW() - INTERVAL '6 hours', 2400, 0.037, 'approved', 0.93, 'Clean history, consistent claim details, no anomalies.', FALSE, NULL, 'success', '{"claimant_id": "CLM-003", "amount": 3100, "claim_type": "theft"}', '{"fraud_score": 0.05, "recommendation": "legitimate"}'),
('c3000001-0000-0000-0000-000000000004', 'fraud', NOW() - INTERVAL '10 hours', 3200, 0.048, 'flagged', 0.68, 'Duplicate claim pattern detected. Similar claim filed 3 months ago.', TRUE, NULL, 'success', '{"claimant_id": "CLM-004", "amount": 12500, "claim_type": "water_damage"}', '{"fraud_score": 0.72, "recommendation": "investigate"}'),
('c3000001-0000-0000-0000-000000000005', 'fraud', NOW() - INTERVAL '1 day', 2600, 0.040, 'approved', 0.88, 'Claim consistent with reported incident. No fraud indicators.', FALSE, NULL, 'success', '{"claimant_id": "CLM-005", "amount": 7800, "claim_type": "medical"}', '{"fraud_score": 0.12, "recommendation": "legitimate"}'),
('c3000001-0000-0000-0000-000000000006', 'fraud', NOW() - INTERVAL '1 day 8 hours', 4200, 0.058, 'flagged', 0.82, 'Staged accident indicators. Inconsistent witness statements in records.', TRUE, TRUE, 'success', '{"claimant_id": "CLM-006", "amount": 35000, "claim_type": "auto_collision"}', '{"fraud_score": 0.88, "recommendation": "deny"}'),
('c3000001-0000-0000-0000-000000000007', 'fraud', NOW() - INTERVAL '2 days', 2300, 0.035, 'approved', 0.91, 'Low risk. First-time claimant with verifiable incident.', FALSE, NULL, 'success', '{"claimant_id": "CLM-007", "amount": 2200, "claim_type": "windstorm"}', '{"fraud_score": 0.06, "recommendation": "legitimate"}'),
('c3000001-0000-0000-0000-000000000008', 'fraud', NOW() - INTERVAL '2 days 12 hours', 3600, 0.051, 'flagged', 0.72, 'Suspicious timing: claim filed day after coverage increase.', TRUE, NULL, 'success', '{"claimant_id": "CLM-008", "amount": 28000, "claim_type": "theft"}', '{"fraud_score": 0.76, "recommendation": "investigate"}'),
('c3000001-0000-0000-0000-000000000009', 'fraud', NOW() - INTERVAL '3 days', 2500, 0.038, 'approved', 0.89, 'Legitimate medical claim with hospital documentation.', FALSE, NULL, 'success', '{"claimant_id": "CLM-009", "amount": 6500, "claim_type": "medical"}', '{"fraud_score": 0.09, "recommendation": "legitimate"}'),
('c3000001-0000-0000-0000-000000000010', 'fraud', NOW() - INTERVAL '4 days', 2700, 0.042, 'approved', 0.86, 'No anomalies detected in claim pattern analysis.', FALSE, NULL, 'success', '{"claimant_id": "CLM-010", "amount": 4100, "claim_type": "auto_glass"}', '{"fraud_score": 0.11, "recommendation": "legitimate"}'),
('c3000001-0000-0000-0000-000000000011', 'fraud', NOW() - INTERVAL '5 days', 3100, 0.047, 'flagged', 0.70, 'Pattern match with known fraud ring geography.', TRUE, NULL, 'success', '{"claimant_id": "CLM-011", "amount": 19000, "claim_type": "fire_damage"}', '{"fraud_score": 0.68, "recommendation": "investigate"}'),
('c3000001-0000-0000-0000-000000000012', 'fraud', NOW() - INTERVAL '6 days', 2200, 0.034, 'approved', 0.94, 'Clean record, verified incident, straightforward claim.', FALSE, NULL, 'success', '{"claimant_id": "CLM-012", "amount": 1800, "claim_type": "water_damage"}', '{"fraud_score": 0.04, "recommendation": "legitimate"}');

-- ============================================
-- SAMPLE TRACES — Support Agent (Simulated, 10 traces)
-- ============================================
INSERT INTO traces (id, agent_type, timestamp, total_latency, total_cost, decision_type, confidence, reasoning, escalated, human_override, status, input_data, output_data) VALUES
('d4000001-0000-0000-0000-000000000001', 'support', NOW() - INTERVAL '1 hour', 890, 0.012, 'approved', 0.95, 'Successfully answered policy coverage question.', FALSE, NULL, 'success', '{"intent": "policy_inquiry", "query": "What does my homeowner policy cover?"}', '{"response_quality": 0.93, "csat": 4.5}'),
('d4000001-0000-0000-0000-000000000002', 'support', NOW() - INTERVAL '2 hours', 1200, 0.015, 'escalated', 0.45, 'Complex billing dispute. Handoff to human agent.', TRUE, NULL, 'success', '{"intent": "billing_dispute", "query": "I was overcharged on my premium"}', '{"response_quality": 0.70, "csat": 3.0}'),
('d4000001-0000-0000-0000-000000000003', 'support', NOW() - INTERVAL '4 hours', 750, 0.010, 'approved', 0.97, 'Provided claim status update successfully.', FALSE, NULL, 'success', '{"intent": "claim_status", "query": "What is the status of my claim?"}', '{"response_quality": 0.96, "csat": 5.0}'),
('d4000001-0000-0000-0000-000000000004', 'support', NOW() - INTERVAL '6 hours', 980, 0.013, 'approved', 0.88, 'Explained deductible terms clearly.', FALSE, NULL, 'success', '{"intent": "policy_inquiry", "query": "How does my deductible work?"}', '{"response_quality": 0.90, "csat": 4.0}'),
('d4000001-0000-0000-0000-000000000005', 'support', NOW() - INTERVAL '1 day', 1100, 0.014, 'escalated', 0.52, 'Customer requesting policy cancellation. Needs retention team.', TRUE, NULL, 'success', '{"intent": "cancellation", "query": "I want to cancel my policy"}', '{"response_quality": 0.75, "csat": 2.5}'),
('d4000001-0000-0000-0000-000000000006', 'support', NOW() - INTERVAL '1 day 4 hours', 680, 0.009, 'approved', 0.96, 'Address update processed successfully.', FALSE, NULL, 'success', '{"intent": "account_update", "query": "I need to update my address"}', '{"response_quality": 0.95, "csat": 4.8}'),
('d4000001-0000-0000-0000-000000000007', 'support', NOW() - INTERVAL '2 days', 2100, 0.018, 'error', 0.00, 'API timeout during response generation.', FALSE, NULL, 'error', '{"intent": "claim_filing", "query": "I need to file a new claim"}', NULL),
('d4000001-0000-0000-0000-000000000008', 'support', NOW() - INTERVAL '3 days', 850, 0.011, 'approved', 0.91, 'Coverage explanation provided for auto policy.', FALSE, NULL, 'success', '{"intent": "policy_inquiry", "query": "Am I covered for rental car?"}', '{"response_quality": 0.89, "csat": 4.2}'),
('d4000001-0000-0000-0000-000000000009', 'support', NOW() - INTERVAL '4 days', 920, 0.012, 'approved', 0.93, 'Premium payment confirmation provided.', FALSE, NULL, 'success', '{"intent": "payment", "query": "Has my payment been received?"}', '{"response_quality": 0.92, "csat": 4.6}'),
('d4000001-0000-0000-0000-000000000010', 'support', NOW() - INTERVAL '5 days', 1350, 0.016, 'escalated', 0.48, 'Complaint about claim denial. Escalated to supervisor.', TRUE, NULL, 'success', '{"intent": "complaint", "query": "Why was my claim denied?"}', '{"response_quality": 0.65, "csat": 2.0}');

-- ============================================
-- SAMPLE LLM CALLS (for first few traces)
-- ============================================
INSERT INTO llm_calls (trace_id, step_order, model, prompt_tokens, completion_tokens, latency_ms, cost_usd, status, prompt_quality) VALUES
('a1000001-0000-0000-0000-000000000001', 1, 'gemini-1.5-flash', 850, 320, 1800, 0.025, 'success', 0.88),
('a1000001-0000-0000-0000-000000000001', 2, 'gemini-1.5-flash', 420, 180, 540, 0.010, 'success', 0.85),
('a1000001-0000-0000-0000-000000000002', 1, 'gemini-1.5-flash', 920, 450, 2400, 0.032, 'success', 0.82),
('a1000001-0000-0000-0000-000000000002', 2, 'gemini-1.5-flash', 380, 150, 720, 0.010, 'success', 0.90),
('b2000001-0000-0000-0000-000000000001', 1, 'gemini-1.5-flash', 780, 290, 2100, 0.028, 'success', 0.86),
('b2000001-0000-0000-0000-000000000001', 2, 'gemini-1.5-flash', 450, 200, 1100, 0.020, 'success', 0.84),
('c3000001-0000-0000-0000-000000000001', 1, 'gemini-1.5-flash', 680, 350, 1900, 0.030, 'success', 0.89),
('c3000001-0000-0000-0000-000000000002', 1, 'gemini-1.5-flash', 950, 480, 2800, 0.042, 'success', 0.87),
('c3000001-0000-0000-0000-000000000002', 2, 'gemini-1.5-flash', 520, 220, 700, 0.010, 'success', 0.85);

-- ============================================
-- SAMPLE TOOL CALLS (for first few traces)
-- ============================================
INSERT INTO tool_calls (trace_id, step_order, tool_name, parameters, result_summary, duration_ms, success) VALUES
('a1000001-0000-0000-0000-000000000001', 1, 'policy_lookup', '{"policy_id": "POL-1001"}', 'Found: Homeowner Standard Policy, active, water damage covered', 120, TRUE),
('a1000001-0000-0000-0000-000000000001', 2, 'coverage_checker', '{"claim_type": "water_damage", "policy_type": "homeowner_standard"}', 'Covered: Yes, deductible $500, limit $50000', 85, TRUE),
('a1000001-0000-0000-0000-000000000001', 3, 'payout_calculator', '{"damage_amount": 7500, "deductible": 500, "coverage_limit": 50000}', 'Calculated payout: $6800 after $500 deductible', 45, TRUE),
('a1000001-0000-0000-0000-000000000002', 1, 'policy_lookup', '{"policy_id": "POL-1002"}', 'Found: Homeowner Premium Policy, active', 110, TRUE),
('a1000001-0000-0000-0000-000000000002', 2, 'coverage_checker', '{"claim_type": "fire_damage", "policy_type": "homeowner_premium"}', 'Covered: Yes, deductible $1000, limit $100000', 90, TRUE),
('b2000001-0000-0000-0000-000000000001', 1, 'risk_score_calculator', '{"age": 28, "conditions": [], "occupation": "software_engineer", "coverage": 250000}', 'Risk score: 0.25 (Low)', 65, TRUE),
('b2000001-0000-0000-0000-000000000001', 2, 'medical_risk_lookup', '{"conditions": []}', 'No medical risk factors. Multiplier: 1.0', 40, TRUE),
('b2000001-0000-0000-0000-000000000001', 3, 'historical_data_check', '{"occupation": "software_engineer", "age_bracket": "25-34"}', 'Historical claim rate: 0.08 (very low)', 55, TRUE),
('c3000001-0000-0000-0000-000000000001', 1, 'duplicate_claim_checker', '{"claimant_id": "CLM-001", "claim_description": "auto collision"}', 'No duplicate claims found', 150, TRUE),
('c3000001-0000-0000-0000-000000000001', 2, 'pattern_analyzer', '{"claim_type": "auto_collision", "amount": 5200, "policy_age_days": 730}', 'No red flags detected', 180, TRUE),
('c3000001-0000-0000-0000-000000000001', 3, 'claimant_history_lookup', '{"claimant_id": "CLM-001"}', '1 prior claim in 5 years, all legitimate', 95, TRUE),
('c3000001-0000-0000-0000-000000000002', 1, 'duplicate_claim_checker', '{"claimant_id": "CLM-002", "claim_description": "fire damage"}', 'Similar claim found 8 months ago', 160, TRUE),
('c3000001-0000-0000-0000-000000000002', 2, 'pattern_analyzer', '{"claim_type": "fire_damage", "amount": 48000, "policy_age_days": 45}', 'RED FLAGS: New policy (45 days), high amount, recent similar claim', 200, TRUE),
('c3000001-0000-0000-0000-000000000002', 3, 'claimant_history_lookup', '{"claimant_id": "CLM-002"}', '4 claims in 2 years, escalating amounts', 110, TRUE);

-- ============================================
-- SAMPLE GUARDRAIL CHECKS
-- ============================================
INSERT INTO guardrail_checks (trace_id, check_type, passed, details) VALUES
('a1000001-0000-0000-0000-000000000001', 'pii', TRUE, 'No PII detected in input or output'),
('a1000001-0000-0000-0000-000000000001', 'bias', TRUE, 'No bias indicators in decision'),
('a1000001-0000-0000-0000-000000000001', 'compliance', TRUE, 'All regulatory checks passed'),
('a1000001-0000-0000-0000-000000000002', 'pii', TRUE, 'No PII detected'),
('a1000001-0000-0000-0000-000000000002', 'bias', TRUE, 'No bias indicators'),
('a1000001-0000-0000-0000-000000000002', 'compliance', TRUE, 'Escalation protocol followed correctly'),
('b2000001-0000-0000-0000-000000000001', 'pii', TRUE, 'No PII exposure in underwriting output'),
('b2000001-0000-0000-0000-000000000001', 'bias', TRUE, 'Decision factors are non-discriminatory'),
('b2000001-0000-0000-0000-000000000002', 'pii', TRUE, 'Medical data properly handled'),
('b2000001-0000-0000-0000-000000000002', 'bias', FALSE, 'WARNING: Age and health conditions may introduce bias in risk assessment'),
('c3000001-0000-0000-0000-000000000001', 'pii', TRUE, 'No PII detected'),
('c3000001-0000-0000-0000-000000000001', 'safety', TRUE, 'Response is appropriate and professional'),
('c3000001-0000-0000-0000-000000000002', 'pii', TRUE, 'Claimant data properly anonymized'),
('c3000001-0000-0000-0000-000000000002', 'compliance', TRUE, 'Fraud investigation protocol followed');

-- ============================================
-- SAMPLE ALERTS (pre-triggered)
-- ============================================
INSERT INTO alerts (rule_name, triggered_at, current_value, threshold_value, severity, agent_type, acknowledged, details) VALUES
('Latency Spike', NOW() - INTERVAL '1 hour', 5200, 5000, 'warning', 'claims', FALSE, '{"metric": "p95_latency", "window": "5m", "message": "Claims agent P95 latency exceeded 5000ms threshold"}'),
('Accuracy Drop', NOW() - INTERVAL '3 hours', 76.5, 80, 'critical', 'fraud', TRUE, '{"metric": "accuracy", "window": "50_decisions", "message": "Fraud detection accuracy dropped below 80%"}'),
('High Escalation Rate', NOW() - INTERVAL '1 day', 55, 50, 'warning', 'underwriting', TRUE, '{"metric": "escalation_rate", "window": "24h", "message": "Underwriting agent escalation rate exceeded 50%"}');
