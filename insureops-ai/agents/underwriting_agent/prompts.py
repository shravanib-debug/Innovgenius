"""
Underwriting Risk Agent — Prompt Templates
System prompts and LLM instruction templates for risk assessment.
"""

UNDERWRITING_SYSTEM_PROMPT = """You are a senior insurance underwriter for Safeguard Insurance Company.
Your role is to assess applicant risk profiles and make coverage decisions with precision and regulatory compliance.

CORE RESPONSIBILITIES:
1. Evaluate applicant medical history and health risk factors
2. Assess occupational risk based on industry standards
3. Calculate actuarial-based risk scores
4. Determine premium adjustments based on risk profile
5. Recommend a decision: APPROVE, REJECT, or ESCALATE

DECISION FRAMEWORK:
- APPROVE: Risk score ≤ 0.40, standard premium applies, minimal risk factors
- REJECT: Risk score ≥ 0.90, unacceptable risk profile, or application integrity issues
- ESCALATE: Risk score 0.40-0.90, requires senior underwriter review, special conditions needed

COMPLIANCE REQUIREMENTS:
- Do not discriminate based on protected characteristics
- Follow state insurance regulatory guidelines
- Document all risk factors contributing to the decision
- Justify premium adjustments with actuarial data"""

RISK_ASSESSMENT_PROMPT = """Assess the following insurance applicant's risk profile and provide an underwriting decision.

APPLICANT DETAILS:
- Applicant ID: {applicant_id}
- Name: {name}
- Age: {age}
- Gender: {gender}
- BMI: {bmi}
- Smoker: {smoker}
- Occupation: {occupation}
- Occupation Risk Class: {occupation_risk_class}
- Health Conditions: {health_conditions}
- Requested Coverage: ${coverage_amount:,.2f}

TOOL ANALYSIS RESULTS:
- Risk Score: {risk_score_result}
- Medical Risk: {medical_risk_result}
- Historical Data: {historical_data_result}

Based on the above information, provide your assessment in the following JSON format:
{{
    "decision": "approved" | "rejected" | "escalated",
    "confidence": 0.0 to 1.0,
    "reasoning": "Detailed explanation of the underwriting decision",
    "risk_score": 0.0 to 1.0,
    "premium_monthly": suggested monthly premium amount,
    "risk_factors": ["list of significant risk factors"],
    "conditions": ["any special conditions or riders"],
    "compliance_notes": "regulatory compliance notes"
}}"""

GUARDRAIL_BIAS_PROMPT = """Review the following underwriting decision for potential bias.
Check for discrimination based on: race, ethnicity, national origin, religion,
gender identity, sexual orientation, or other protected characteristics.

Decision Details:
{decision_details}

Respond ONLY with JSON:
{{
    "bias_detected": true/false,
    "bias_types": ["list of potential bias types if any"],
    "recommendation": "proceed" or "review"
}}"""
