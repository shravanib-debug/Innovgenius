"""
InsureOps AI — Telemetry Schemas
Pydantic models for all telemetry data structures used across agents,
the collector, and the API layer.
"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ─── Individual Record Models ────────────────────────────

class LLMCallRecord(BaseModel):
    """Record of a single LLM API call within an agent execution."""
    model: str = "gemini-1.5-flash"
    prompt_tokens: int = 0
    completion_tokens: int = 0
    latency_ms: int = 0
    cost_usd: float = 0.0
    status: str = "success"
    prompt_quality: float = 0.85
    prompt_text: Optional[str] = None
    response_text: Optional[str] = None


class ToolCallRecord(BaseModel):
    """Record of a single tool invocation within an agent execution."""
    tool_name: str
    parameters: dict = {}
    result_summary: str = ""
    duration_ms: int = 0
    success: bool = True


class GuardrailResult(BaseModel):
    """Result of a guardrail safety/compliance check."""
    check_type: str  # pii, bias, safety, compliance
    passed: bool = True
    details: str = ""


class DecisionRecord(BaseModel):
    """The agent's final decision output."""
    decision_type: str  # approved, rejected, escalated, flagged
    confidence: float = 0.0
    reasoning: str = ""
    escalated_to_human: bool = False
    human_override: Optional[bool] = None
    human_decision: Optional[str] = None


# ─── Trace Record ────────────────────────────────────────

class TraceRecord(BaseModel):
    """Complete trace of an agent execution — the telemetry payload."""
    trace_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agent_type: str  # claims, underwriting, fraud, support
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    llm_calls: list[LLMCallRecord] = []
    tool_calls: list[ToolCallRecord] = []
    guardrails: list[GuardrailResult] = []
    decision: Optional[DecisionRecord] = None
    total_latency_ms: int = 0
    total_cost_usd: float = 0.0
    status: str = "success"  # success, error, pending
    input_data: dict = {}
    output_data: dict = {}


# ─── Aggregated Metrics Models ───────────────────────────

class LatencyMetrics(BaseModel):
    """Latency percentile breakdown."""
    p50: float = 0.0
    p95: float = 0.0
    p99: float = 0.0
    mean: float = 0.0


class CostMetrics(BaseModel):
    """Cost breakdown by agent."""
    total_cost: float = 0.0
    cost_per_request: float = 0.0
    cost_by_agent: dict[str, float] = {}
    token_usage: dict[str, int] = {}


class Section1Metrics(BaseModel):
    """AI Application Monitoring metrics (PRD §4.3)."""
    prompt_quality_avg: float = 0.0
    prompt_quality_trend: list[float] = []
    response_accuracy: float = 0.0
    accuracy_by_agent: dict[str, float] = {}
    latency: LatencyMetrics = LatencyMetrics()
    api_success_rate: float = 0.0
    api_error_breakdown: dict[str, int] = {}
    cost: CostMetrics = CostMetrics()
    drift_score: float = 0.0


class Section2Metrics(BaseModel):
    """LLM Agent Monitoring metrics (PRD §4.4)."""
    human_approval_rate: float = 0.0
    auto_approved_count: int = 0
    human_reviewed_count: int = 0
    override_rate: float = 0.0
    agent_performance: dict[str, dict] = {}
    decision_accuracy: float = 0.0
    tool_usage: dict[str, int] = {}
    tool_success_rates: dict[str, float] = {}
    escalation_rate: float = 0.0
    escalation_by_agent: dict[str, float] = {}
    escalation_reasons: dict[str, int] = {}
    compliance_pass_rate: float = 0.0
    pii_flags: int = 0
    bias_flags: int = 0
    safety_violations: int = 0
