"""
Guardrails Engine — Safety checks for AI agent responses.
Detects PII, bias patterns, safety violations, and content policy breaches.
"""

import re
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class GuardrailResult:
    """Result of a guardrail check."""
    passed: bool = True
    checks_run: int = 0
    violations: List[Dict[str, Any]] = field(default_factory=list)

    def add_violation(self, check_type: str, severity: str, detail: str):
        self.violations.append({
            "type": check_type,
            "severity": severity,
            "detail": detail,
        })
        self.passed = False

    def to_dict(self) -> Dict:
        return {
            "passed": self.passed,
            "checks_run": self.checks_run,
            "violations_count": len(self.violations),
            "violations": self.violations,
        }


class GuardrailsEngine:
    """
    Runs safety and compliance checks on agent inputs and outputs.
    
    Usage:
        guardrails = GuardrailsEngine()
        result = guardrails.check_output(
            text="The claim for SSN 123-45-6789 is approved.",
            agent_type="claims"
        )
        
        if not result.passed:
            # Handle violations
            for v in result.violations:
                print(f"Violation: {v['type']} - {v['detail']}")
    """

    # PII Patterns
    SSN_PATTERN = re.compile(r'\b\d{3}[-.]?\d{2}[-.]?\d{4}\b')
    EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    PHONE_PATTERN = re.compile(r'\b(?:\+1[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
    CREDIT_CARD_PATTERN = re.compile(r'\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b')
    AADHAAR_PATTERN = re.compile(r'\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b')

    # Bias indicators
    BIAS_KEYWORDS = [
        "because of their age", "due to their gender", "based on their race",
        "because they are", "typical for their demographic",
        "statistically their group", "people like them",
    ]

    # Safety violation patterns
    UNSAFE_PATTERNS = [
        re.compile(r'(guarante|promis|assur).*(?:payout|compensat|approve)', re.IGNORECASE),
        re.compile(r'ignore.*(?:policy|guideline|rule|regulation)', re.IGNORECASE),
        re.compile(r'override.*(?:threshold|limit|restriction)', re.IGNORECASE),
    ]

    def __init__(self, strict_mode: bool = True):
        self.strict_mode = strict_mode

    def check_output(self, text: str, agent_type: str = "") -> GuardrailResult:
        """Run all guardrail checks on an agent output."""
        result = GuardrailResult()

        self._check_pii(text, result)
        self._check_bias(text, result)
        self._check_safety(text, result)

        result.checks_run = 3  # PII, Bias, Safety
        return result

    def check_input(self, text: str) -> GuardrailResult:
        """Run guardrail checks on agent input (lighter checks)."""
        result = GuardrailResult()
        self._check_pii(text, result)
        result.checks_run = 1
        return result

    def redact_pii(self, text: str) -> str:
        """Redact detected PII from text."""
        text = self.SSN_PATTERN.sub('[SSN_REDACTED]', text)
        text = self.EMAIL_PATTERN.sub('[EMAIL_REDACTED]', text)
        text = self.PHONE_PATTERN.sub('[PHONE_REDACTED]', text)
        text = self.CREDIT_CARD_PATTERN.sub('[CC_REDACTED]', text)
        text = self.AADHAAR_PATTERN.sub('[AADHAAR_REDACTED]', text)
        return text

    def _check_pii(self, text: str, result: GuardrailResult):
        """Check for PII patterns in text."""
        if self.SSN_PATTERN.search(text):
            result.add_violation("pii", "critical", "SSN pattern detected in text")
            logger.warning("PII violation: SSN pattern detected")

        if self.EMAIL_PATTERN.search(text):
            result.add_violation("pii", "warning", "Email address detected in text")

        if self.PHONE_PATTERN.search(text):
            result.add_violation("pii", "warning", "Phone number detected in text")

        if self.CREDIT_CARD_PATTERN.search(text):
            result.add_violation("pii", "critical", "Credit card number pattern detected")
            logger.warning("PII violation: Credit card pattern detected")

    def _check_bias(self, text: str, result: GuardrailResult):
        """Check for bias-indicating language."""
        text_lower = text.lower()
        for keyword in self.BIAS_KEYWORDS:
            if keyword in text_lower:
                result.add_violation(
                    "bias", "warning",
                    f"Potential bias indicator: '{keyword}' found in output"
                )
                logger.info(f"Bias flag: '{keyword}' detected")

    def _check_safety(self, text: str, result: GuardrailResult):
        """Check for safety violations."""
        for pattern in self.UNSAFE_PATTERNS:
            match = pattern.search(text)
            if match:
                result.add_violation(
                    "safety", "warning",
                    f"Safety concern: '{match.group()}' — agent may be overstepping bounds"
                )
