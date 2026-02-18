"""
InsureOps AI — Base Agent Utilities
Re-exports from instrumentation modules for backward compatibility,
plus data loading helpers used across all agents.

NOTE: All schemas, telemetry, and tracing logic has been moved to
agents/instrumentation/. This file re-exports everything so existing
imports like `from agents.base_agent import TraceRecord` continue to work.
"""

import json
import os
from typing import Any

# ─── Re-exports from Instrumentation (backward compatibility) ──

from agents.instrumentation.schemas import (
    LLMCallRecord,
    ToolCallRecord,
    GuardrailResult,
    DecisionRecord,
    TraceRecord,
)

from agents.instrumentation.tracer import (
    calculate_cost,
    calculate_prompt_quality,
    Timer,
    call_llm,
    AgentTracer,
)

from agents.instrumentation.collector import (
    send_telemetry as send_telemetry_to_backend_new,
)

from agents.instrumentation.guardrails import (
    check_pii,
    check_bias,
    check_safety,
    check_compliance,
    run_all_guardrails,
)


# ─── Legacy Compatibility Wrapper ────────────────────────

def send_telemetry_to_backend(trace: TraceRecord, backend_url: str = None):
    """
    Legacy wrapper for backward compatibility.
    Calls the new TelemetryCollector under the hood.
    """
    send_telemetry_to_backend_new(trace, backend_url)


# ─── Data Utilities (remain here) ────────────────────────

def get_data_path(filename: str) -> str:
    """Get the absolute path to a file in the agents/data directory."""
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", filename)


def load_json_data(filename: str) -> Any:
    """Load a JSON data file from the agents/data directory."""
    filepath = get_data_path(filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)
