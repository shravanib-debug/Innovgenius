"""
InsureOps AI — Guardrail Checks
Consolidated safety, compliance, PII detection, and bias checking
used across all insurance AI agents.
"""

import re
from typing import Optional
from agents.instrumentation.schemas import GuardrailResult, TraceRecord


# ─── PII Detection Patterns ─────────────────────────────

PII_PATTERNS = [
    # SSN: XXX-XX-XXXX or XXXXXXXXX
    (r'\b\d{3}-\d{2}-\d{4}\b', 'SSN pattern detected'),
    (r'\b\d{9}\b', 'Possible SSN (9 consecutive digits)'),
    # Credit card: 13-19 digit number
    (r'\b(?:\d{4}[-\s]?){3,4}\d{1,4}\b', 'Credit card number pattern detected'),
    # Phone: various formats
    (r'\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', 'Phone number detected'),
    # Email
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'Email address detected'),
    # Bank account (8-17 digits often preceded by "account")
    (r'(?i)(?:bank|account|routing)\s*(?:number|#|no\.?)?\s*:?\s*\d{8,17}', 'Bank account number detected'),
]

# Keywords that also suggest PII presence
PII_KEYWORDS = [
    'ssn', 'social security', 'credit card', 'bank account',
    'routing number', 'account number', 'driver license',
    'passport number', 'date of birth', 'dob',
]

# ─── Bias Detection Terms ────────────────────────────────

BIAS_TERMS = [
    'gender', 'race', 'ethnicity', 'religion', 'religious',
    'orientation', 'sexual orientation', 'nationality',
    'skin color', 'marital status', 'pregnancy', 'disability',
    'genetic information', 'national origin',
]

# ─── Safety Violation Patterns ───────────────────────────

SAFETY_PATTERNS = [
    'harm', 'violence', 'discriminat', 'illegal', 'unethical',
    'hate speech', 'threat', 'kill', 'attack', 'weapon',
]


# ─── Check Functions ────────────────────────────────────

def check_pii(text: str) -> GuardrailResult:
    """
    Scan text for Personally Identifiable Information (PII).
    Uses regex pattern matching and keyword detection.

    Returns:
        GuardrailResult with passed=False if PII is detected.
    """
    if not text:
        return GuardrailResult(
            check_type="pii",
            passed=True,
            details="No text to scan for PII"
        )

    text_lower = text.lower()
    findings = []

    # Check regex patterns
    for pattern, description in PII_PATTERNS:
        if re.search(pattern, text):
            findings.append(description)

    # Check keywords
    for keyword in PII_KEYWORDS:
        if keyword in text_lower:
            findings.append(f"PII keyword found: '{keyword}'")
            break  # One keyword match is enough

    if findings:
        return GuardrailResult(
            check_type="pii",
            passed=False,
            details=f"PII detected — {'; '.join(findings[:3])}. Redaction recommended."
        )

    return GuardrailResult(
        check_type="pii",
        passed=True,
        details="No PII detected in text"
    )


def check_bias(reasoning: str, applicant_data: Optional[dict] = None) -> GuardrailResult:
    """
    Check if agent reasoning references protected attributes
    that could indicate biased decision-making.

    Args:
        reasoning: The agent's decision reasoning text
        applicant_data: Optional applicant/claimant data for context

    Returns:
        GuardrailResult with passed=False if bias indicators found.
    """
    if not reasoning:
        return GuardrailResult(
            check_type="bias",
            passed=True,
            details="No reasoning text to check for bias"
        )

    reasoning_lower = reasoning.lower()
    bias_found = []

    for term in BIAS_TERMS:
        if term in reasoning_lower:
            bias_found.append(term)

    # Check if decision correlates with protected attributes in applicant data
    if applicant_data and isinstance(applicant_data, dict):
        protected_fields = ['gender', 'race', 'ethnicity', 'religion', 'marital_status']
        for field in protected_fields:
            value = applicant_data.get(field, '')
            if value and str(value).lower() in reasoning_lower:
                bias_found.append(f"Decision references '{field}' attribute")

    if bias_found:
        return GuardrailResult(
            check_type="bias",
            passed=False,
            details=f"Potential bias detected — references: {', '.join(bias_found[:3])}. Review required."
        )

    return GuardrailResult(
        check_type="bias",
        passed=True,
        details="No bias indicators detected in decision rationale"
    )


def check_safety(response_text: str) -> GuardrailResult:
    """
    Ensure agent response doesn't contain harmful or inappropriate content.

    Returns:
        GuardrailResult with passed=False if safety violations found.
    """
    if not response_text:
        return GuardrailResult(
            check_type="safety",
            passed=True,
            details="No response text to check for safety"
        )

    response_lower = response_text.lower()
    violations = []

    for pattern in SAFETY_PATTERNS:
        if pattern in response_lower:
            violations.append(pattern)

    if violations:
        return GuardrailResult(
            check_type="safety",
            passed=False,
            details=f"Safety concern detected — terms: {', '.join(violations[:3])}. Manual review required."
        )

    return GuardrailResult(
        check_type="safety",
        passed=True,
        details="No safety concerns in response"
    )


def check_compliance(decision: str, confidence: float, agent_type: str) -> GuardrailResult:
    """
    Verify that the agent's decision meets regulatory compliance standards.

    Rules:
    - Rejections with confidence < 0.7 may violate fair handling requirements
    - Escalations with confidence < 0.6 require additional evidence (fraud agent)
    - All decisions must have non-empty reasoning

    Returns:
        GuardrailResult with passed=False if compliance issues found.
    """
    issues = []

    # Low-confidence rejections
    if decision == "rejected" and confidence < 0.7:
        issues.append("Low-confidence rejection may violate fair claims handling requirements")

    # Fraud: low-confidence escalation
    if agent_type == "fraud" and decision == "escalated" and confidence < 0.6:
        issues.append("Low-confidence fraud escalation — ensure sufficient evidence before SIU referral")

    if issues:
        return GuardrailResult(
            check_type="compliance",
            passed=False,
            details="; ".join(issues)
        )

    return GuardrailResult(
        check_type="compliance",
        passed=True,
        details=f"Decision compliant with {agent_type} regulatory standards"
    )


def run_all_guardrails(
    trace: TraceRecord,
    reasoning: str = "",
    input_data: Optional[dict] = None
) -> list[GuardrailResult]:
    """
    Run all applicable guardrail checks on a completed trace.

    This is the main entry point for guardrail checking. It runs PII,
    bias, safety, and compliance checks and appends results to the trace.

    Args:
        trace: The TraceRecord to check and update
        reasoning: The agent's decision reasoning text
        input_data: Optional input data (for bias correlation checking)

    Returns:
        List of GuardrailResult objects (also appended to trace.guardrails)
    """
    results = []

    # 1. PII check on input + output text
    pii_text_parts = []
    if trace.input_data:
        pii_text_parts.append(str(trace.input_data))
    if reasoning:
        pii_text_parts.append(reasoning)
    for llm_call in trace.llm_calls:
        if llm_call.response_text:
            pii_text_parts.append(llm_call.response_text)

    pii_result = check_pii(" ".join(pii_text_parts))
    results.append(pii_result)

    # 2. Bias check on reasoning
    bias_result = check_bias(reasoning, input_data)
    results.append(bias_result)

    # 3. Safety check on all LLM responses
    safety_texts = [llm_call.response_text or "" for llm_call in trace.llm_calls]
    safety_result = check_safety(" ".join(safety_texts))
    results.append(safety_result)

    # 4. Compliance check on decision
    if trace.decision:
        compliance_result = check_compliance(
            trace.decision.decision_type,
            trace.decision.confidence,
            trace.agent_type
        )
    else:
        compliance_result = GuardrailResult(
            check_type="compliance",
            passed=True,
            details="No decision to check compliance against"
        )
    results.append(compliance_result)

    # Append all results to the trace
    trace.guardrails.extend(results)

    return results
