"""
InsureOps AI — Base Agent Utilities
Shared schemas, state definitions, telemetry decorator, and error handling
used across all insurance AI agents.
"""

import uuid
import time
import json
import os
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


# ─── Shared Schemas ──────────────────────────────────────

class LLMCallRecord(BaseModel):
    """Record of a single LLM API call."""
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
    """Record of a single tool invocation."""
    tool_name: str
    parameters: dict = {}
    result_summary: str = ""
    duration_ms: int = 0
    success: bool = True


class GuardrailResult(BaseModel):
    """Result of a guardrail safety check."""
    check_type: str  # pii, bias, safety, compliance
    passed: bool = True
    details: str = ""


class DecisionRecord(BaseModel):
    """The agent's final decision."""
    decision_type: str  # approved, rejected, escalated, flagged
    confidence: float = 0.0
    reasoning: str = ""
    escalated_to_human: bool = False
    human_override: Optional[bool] = None
    human_decision: Optional[str] = None


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


# ─── Telemetry Helpers ───────────────────────────────────

def calculate_cost(prompt_tokens: int, completion_tokens: int, model: str = "openai/gpt-4o-mini") -> float:
    """Calculate cost based on token usage and model pricing."""
    # Strip provider prefix from OpenRouter model names (e.g. "openai/gpt-4o-mini" -> "gpt-4o-mini")
    model_key = model.split("/")[-1] if "/" in model else model

    pricing = {
        "gpt-4o-mini": {"input": 0.00000015, "output": 0.0000006},
        "gpt-4o": {"input": 0.0000025, "output": 0.00001},
        "gpt-4.1-mini": {"input": 0.0000004, "output": 0.0000016},
        "gpt-4.1-nano": {"input": 0.0000001, "output": 0.0000004},
        "gemini-1.5-flash": {"input": 0.000000075, "output": 0.0000003},
        "gemini-1.5-pro": {"input": 0.00000125, "output": 0.000005},
    }
    rates = pricing.get(model_key, pricing["gpt-4o-mini"])
    return (prompt_tokens * rates["input"]) + (completion_tokens * rates["output"])


def calculate_prompt_quality(prompt_text: str) -> float:
    """Estimate prompt quality score (0-1) based on structure, content, and data richness.
    
    Scores are computed from:
      - Template structure (persona, formatting, output instructions)  → up to 0.45
      - Data completeness (how many fields are filled vs N/A/empty)    → up to 0.30
      - Context richness (evidence, policy text, tool results present) → up to 0.25
    """
    import re

    prompt_lower = prompt_text.lower()
    length = len(prompt_text)

    # ─── 1. Template Structure Score (max 0.45) ─────────────
    structure_score = 0.15  # Base: a prompt exists at all

    # Length bonus
    if 100 <= length <= 2000:
        structure_score += 0.08
    elif length > 2000:
        structure_score += 0.05

    # Persona indicators
    if any(m in prompt_lower for m in ['you are', 'your role', 'as a', 'you must']):
        structure_score += 0.06

    # Structured formatting (lists, numbered steps)
    if any(m in prompt_lower for m in ['step', '1.', '- ', 'first', '###', '───']):
        structure_score += 0.06

    # Output format instructions
    if any(m in prompt_lower for m in ['output', 'respond', 'return', 'format', 'json']):
        structure_score += 0.06

    # Context anchoring
    if any(m in prompt_lower for m in ['context:', 'given:', 'based on', 'provided']):
        structure_score += 0.04

    structure_score = min(structure_score, 0.45)

    # ─── 2. Data Completeness Score (max 0.30) ──────────────
    # Check how many data fields are actually filled vs placeholder/empty
    na_count = prompt_lower.count('n/a') + prompt_lower.count('not provided') + prompt_lower.count('unknown')
    empty_json = prompt_lower.count('{}') + prompt_lower.count('[]') + prompt_lower.count('null')
    placeholder_count = na_count + empty_json

    # Count data fields that have real values (dollar amounts, IDs, dates, numbers)
    real_data_indicators = (
        len(re.findall(r'\$[\d,]+', prompt_text)) +          # Dollar amounts
        len(re.findall(r'[A-Z]{2,}-\d+', prompt_text)) +     # IDs like CLM-001, POL-123
        len(re.findall(r'\d{4}-\d{2}-\d{2}', prompt_text)) + # Dates
        len(re.findall(r'(?:section|clause)\s+[\d.]+', prompt_lower))  # Section refs
    )

    if placeholder_count == 0 and real_data_indicators >= 3:
        data_score = 0.30       # Fully populated prompt
    elif placeholder_count <= 2 and real_data_indicators >= 2:
        data_score = 0.22       # Mostly populated
    elif placeholder_count <= 4:
        data_score = 0.15       # Partially populated
    else:
        data_score = 0.05       # Many missing fields

    # ─── 3. Context Richness Score (max 0.25) ────────────────
    context_score = 0.0

    # Has policy/evidence/tool data injected (not just template placeholders)
    if length > 3000:
        context_score += 0.08   # Substantial data injected
    elif length > 1000:
        context_score += 0.04

    # Evidence analysis present
    if 'evidence' in prompt_lower and '"file_path"' in prompt_lower:
        context_score += 0.06

    # Policy text present (not just placeholder)
    if 'policy' in prompt_lower and length > 2000:
        context_score += 0.06

    # Tool results present
    if any(m in prompt_lower for m in ['tool result', 'coverage check', 'payout', 'risk score']):
        context_score += 0.05

    context_score = min(context_score, 0.25)

    return min(round(structure_score + data_score + context_score, 3), 1.0)


class Timer:
    """Simple context manager for timing operations."""

    def __init__(self):
        self.start_time = None
        self.elapsed_ms = 0

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, *args):
        self.elapsed_ms = int((time.time() - self.start_time) * 1000)


def send_telemetry_to_backend(trace: TraceRecord, backend_url: str = None):
    """Send a completed trace record to the Express backend for storage and alerting."""
    import requests

    url = backend_url or os.getenv("BACKEND_URL", "http://localhost:5000")
    endpoint = f"{url}/api/telemetry/ingest"

    # Format payload for the backend ingestion endpoint
    payload = {
        "trace_id": trace.trace_id,
        "agent_type": trace.agent_type,
        "session_id": None,
        "status": trace.status,
        "total_latency_ms": trace.total_latency_ms,
        "total_cost_usd": trace.total_cost_usd,
        "total_tokens": sum(c.prompt_tokens + c.completion_tokens for c in trace.llm_calls),
        "input_data": trace.input_data,
        "output_data": trace.output_data,
        "llm_calls": [
            {
                "step_order": i + 1,
                "model": c.model,
                "prompt_tokens": c.prompt_tokens,
                "completion_tokens": c.completion_tokens,
                "latency_ms": c.latency_ms,
                "cost_usd": c.cost_usd,
                "status": c.status,
                "prompt_quality": c.prompt_quality,
                "prompt_text": c.prompt_text,
                "response_text": c.response_text
            }
            for i, c in enumerate(trace.llm_calls)
        ],
        "tool_calls": [
            {
                "step_order": i + 1,
                "tool_name": c.tool_name,
                "input_data": c.parameters,
                "output_data": c.result_summary,
                "duration_ms": c.duration_ms,
                "success": c.success
            }
            for i, c in enumerate(trace.tool_calls)
        ],
        "guardrail_checks": [
            {
                "check_type": g.check_type,
                "passed": g.passed,
                "details": g.details
            }
            for g in trace.guardrails
        ]
    }

    try:
        response = requests.post(
            endpoint,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if response.status_code in (200, 201):
            print(f"✅ Telemetry sent: trace_id={trace.trace_id}")
        else:
            print(f"⚠️ Telemetry send failed: {response.status_code} — {response.text[:200]}")
    except Exception as e:
        print(f"⚠️ Could not send telemetry to backend: {e}")
        # Don't fail the agent if telemetry fails — log and continue


def get_data_path(filename: str) -> str:
    """Get the absolute path to a file in the agents/data directory."""
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", filename)


def load_json_data(filename: str) -> Any:
    """Load a JSON data file from the agents/data directory."""
    filepath = get_data_path(filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)
