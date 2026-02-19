"""
Pydantic schemas for telemetry data validation.
Used by the collector to validate spans, traces, and metrics before sending to backend.

v2: Extended with verification-level fields for claims pipeline telemetry.
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid


@dataclass
class SpanSchema:
    """Represents a single execution step within a trace."""
    span_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str = ""
    span_type: str = "generic"  # llm_call | tool_call | reasoning | guardrail | verification
    start_time: float = 0.0
    end_time: float = 0.0
    duration_ms: float = 0.0
    status: str = "ok"  # ok | error
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None

    def to_dict(self) -> Dict:
        return {
            "span_id": self.span_id,
            "name": self.name,
            "type": self.span_type,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration_ms": self.duration_ms,
            "status": self.status,
            "input": self.input_data,
            "output": self.output_data,
            "metadata": self.metadata,
            "error": self.error,
        }


@dataclass
class VerificationStepRecord:
    """Represents a single step in the verification pipeline."""
    step_name: str = ""
    status: str = "pending"  # pending | in_progress | passed | failed
    duration_ms: float = 0.0
    details: str = ""
    evidence_used: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict:
        return {
            "step_name": self.step_name,
            "status": self.status,
            "duration_ms": self.duration_ms,
            "details": self.details,
            "evidence_used": self.evidence_used,
        }


@dataclass
class TraceSchema:
    """Represents a complete agent execution trace (v2: includes verification telemetry)."""
    trace_id: str = field(default_factory=lambda: f"trc-{uuid.uuid4().hex[:8]}")
    agent_type: str = ""  # claims | underwriting | fraud | support
    decision: str = ""  # approved | rejected | escalated | flagged
    confidence: float = 0.0
    total_latency_ms: float = 0.0
    total_cost: float = 0.0
    total_tokens: int = 0
    tools_used: List[str] = field(default_factory=list)
    spans: List[SpanSchema] = field(default_factory=list)
    reasoning: str = ""
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)

    # ── v2: Verification-level fields ──
    insurance_type: Optional[str] = None  # health | vehicle | travel | property | life
    claim_id: Optional[str] = None
    verification_steps: List[VerificationStepRecord] = field(default_factory=list)
    missing_documents: List[str] = field(default_factory=list)
    evidence_count: int = 0
    evidence_completeness_score: float = 0.0
    verification_latency_ms: float = 0.0
    evidence_used_in_decision: List[str] = field(default_factory=list)

    def add_span(self, span: SpanSchema):
        self.spans.append(span)
        self.total_latency_ms += span.duration_ms

    def add_verification_step(self, step: VerificationStepRecord):
        self.verification_steps.append(step)
        self.verification_latency_ms += step.duration_ms

    def to_dict(self) -> Dict:
        result = {
            "trace_id": self.trace_id,
            "agent_type": self.agent_type,
            "decision": self.decision,
            "confidence": self.confidence,
            "total_latency_ms": self.total_latency_ms,
            "total_cost": self.total_cost,
            "total_tokens": self.total_tokens,
            "tools_used": self.tools_used,
            "spans": [s.to_dict() for s in self.spans],
            "reasoning": self.reasoning,
            "timestamp": self.timestamp,
            "metadata": self.metadata,
        }

        # v2 fields — only include if populated (backward compatible)
        if self.insurance_type:
            result["insurance_type"] = self.insurance_type
        if self.claim_id:
            result["claim_id"] = self.claim_id
        if self.verification_steps:
            result["verification_steps"] = [s.to_dict() for s in self.verification_steps]
        if self.missing_documents:
            result["missing_documents"] = self.missing_documents
        if self.evidence_count > 0:
            result["evidence_count"] = self.evidence_count
        if self.evidence_completeness_score > 0:
            result["evidence_completeness_score"] = self.evidence_completeness_score
        if self.verification_latency_ms > 0:
            result["verification_latency_ms"] = self.verification_latency_ms
        if self.evidence_used_in_decision:
            result["evidence_used_in_decision"] = self.evidence_used_in_decision

        return result


@dataclass
class MetricSchema:
    """Represents a single metric data point."""
    metric_name: str = ""
    value: float = 0.0
    unit: str = ""  # ms | usd | percent | count
    agent_type: str = ""
    tags: Dict[str, str] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict:
        return {
            "metric_name": self.metric_name,
            "value": self.value,
            "unit": self.unit,
            "agent_type": self.agent_type,
            "tags": self.tags,
            "timestamp": self.timestamp,
        }
