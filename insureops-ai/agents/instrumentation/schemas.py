"""
Pydantic schemas for telemetry data validation.
Used by the collector to validate spans, traces, and metrics before sending to backend.
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
    span_type: str = "generic"  # llm_call | tool_call | reasoning | guardrail
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
class TraceSchema:
    """Represents a complete agent execution trace."""
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

    def add_span(self, span: SpanSchema):
        self.spans.append(span)
        self.total_latency_ms += span.duration_ms

    def to_dict(self) -> Dict:
        return {
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
