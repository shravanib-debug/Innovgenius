"""
InsureOps AI — Instrumentation Package
Telemetry, tracing, guardrails, and metrics for all insurance AI agents.
"""

from agents.instrumentation.schemas import (
    TraceRecord,
    LLMCallRecord,
    ToolCallRecord,
    GuardrailResult,
    DecisionRecord,
    Section1Metrics,
    Section2Metrics,
    LatencyMetrics,
    CostMetrics,
)

from agents.instrumentation.tracer import (
    AgentTracer,
    Timer,
    call_llm,
    calculate_cost,
    calculate_prompt_quality,
)

from agents.instrumentation.guardrails import (
    check_pii,
    check_bias,
    check_safety,
    check_compliance,
    run_all_guardrails,
)

from agents.instrumentation.collector import (
    TelemetryCollector,
    send_telemetry,
    get_collector,
)

from agents.instrumentation.metrics import (
    compute_section1_metrics,
    compute_section2_metrics,
    compute_drift_score,
)

__all__ = [
    # Schemas
    'TraceRecord', 'LLMCallRecord', 'ToolCallRecord', 'GuardrailResult',
    'DecisionRecord', 'Section1Metrics', 'Section2Metrics',
    'LatencyMetrics', 'CostMetrics',
    # Tracer
    'AgentTracer', 'Timer', 'call_llm',
    'calculate_cost', 'calculate_prompt_quality',
    # Guardrails
    'check_pii', 'check_bias', 'check_safety', 'check_compliance',
    'run_all_guardrails',
    # Collector
    'TelemetryCollector', 'send_telemetry', 'get_collector',
    # Metrics
    'compute_section1_metrics', 'compute_section2_metrics',
    'compute_drift_score',
]
