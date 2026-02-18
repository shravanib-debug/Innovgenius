"""
InsureOps AI — Telemetry Tracer
Wraps agent execution to capture telemetry: LLM calls, tool calls,
guardrail checks, decisions, latency, and cost. Also provides the
centralized LLM call wrapper used by all agents.
"""

import os
import json
import time
import random
from typing import Optional, Callable

from agents.instrumentation.schemas import (
    TraceRecord, LLMCallRecord, ToolCallRecord, GuardrailResult, DecisionRecord
)


# ─── Cost Calculation ────────────────────────────────────

# Pricing per token (input/output) by model
MODEL_PRICING = {
    "gpt-4o-mini": {"input": 0.00000015, "output": 0.0000006},
    "gpt-4o": {"input": 0.0000025, "output": 0.00001},
    "gpt-4.1-mini": {"input": 0.0000004, "output": 0.0000016},
    "gpt-4.1-nano": {"input": 0.0000001, "output": 0.0000004},
    "gemini-1.5-flash": {"input": 0.000000075, "output": 0.0000003},
    "gemini-1.5-pro": {"input": 0.00000125, "output": 0.000005},
}


def calculate_cost(prompt_tokens: int, completion_tokens: int, model: str = "openai/gpt-4o-mini") -> float:
    """Calculate cost based on token usage and model pricing."""
    # Strip provider prefix (e.g. "openai/gpt-4o-mini" -> "gpt-4o-mini")
    model_key = model.split("/")[-1] if "/" in model else model
    rates = MODEL_PRICING.get(model_key, MODEL_PRICING["gpt-4o-mini"])
    return (prompt_tokens * rates["input"]) + (completion_tokens * rates["output"])


def calculate_prompt_quality(prompt_text: str) -> float:
    """
    Estimate prompt quality score (0-1) based on structure and content.
    Checks for persona definition, structured instructions, output format,
    and context sections.
    """
    score = 0.5  # Base score

    # Length check (good prompts are 100-2000 chars)
    length = len(prompt_text)
    if 100 <= length <= 2000:
        score += 0.15
    elif length > 2000:
        score += 0.10

    # Structure indicators
    if any(marker in prompt_text.lower() for marker in ['you are', 'your role', 'as a']):
        score += 0.1  # Has persona
    if any(marker in prompt_text.lower() for marker in ['step', '1.', '- ', 'first']):
        score += 0.1  # Has structure
    if any(marker in prompt_text.lower() for marker in ['output', 'respond', 'return', 'format']):
        score += 0.1  # Has output instructions
    if any(marker in prompt_text.lower() for marker in ['context:', 'given:', 'based on']):
        score += 0.05  # Has context section

    return min(score, 1.0)


# ─── Timer ───────────────────────────────────────────────

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


# ─── Centralized LLM Wrapper ────────────────────────────

def call_llm(prompt: str, system_prompt: str = "", model: str = None) -> tuple[str, LLMCallRecord]:
    """
    Call the LLM via OpenRouter (OpenAI-compatible API).
    Falls back to simulated response if no API key is available.

    This is the single source of truth for LLM calls across all agents.

    Args:
        prompt: The user prompt to send
        system_prompt: Optional system prompt for persona
        model: Model identifier (defaults to OPENROUTER_MODEL env var)

    Returns:
        Tuple of (response_text, LLMCallRecord)
    """
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    model = model or os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

    with Timer() as timer:
        if api_key and api_key != "your_openrouter_api_key_here":
            try:
                from openai import OpenAI

                client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=api_key
                )

                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )

                response_text = response.choices[0].message.content
                prompt_tokens = response.usage.prompt_tokens if response.usage else len(prompt.split()) * 2
                completion_tokens = response.usage.completion_tokens if response.usage else len(response_text.split()) * 2

            except Exception as e:
                print(f"⚠️ LLM call failed, using simulation: {e}")
                response_text, prompt_tokens, completion_tokens = _simulate_llm_response(prompt)
        else:
            # No API key — simulate a realistic response
            response_text, prompt_tokens, completion_tokens = _simulate_llm_response(prompt)

    cost = calculate_cost(prompt_tokens, completion_tokens, model)
    quality = calculate_prompt_quality(prompt)

    record = LLMCallRecord(
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        latency_ms=timer.elapsed_ms,
        cost_usd=cost,
        status="success",
        prompt_quality=quality,
        prompt_text=prompt[:500],
        response_text=response_text[:500]
    )

    return response_text, record


def _simulate_llm_response(prompt: str) -> tuple[str, int, int]:
    """
    Generate a generic simulated LLM response for demo/testing.
    Agent-specific simulation logic should remain in agent files
    for domain accuracy. This is the fallback.
    """
    time.sleep(random.uniform(0.3, 1.2))

    prompt_tokens = len(prompt.split()) * 2
    completion_tokens = random.randint(150, 400)
    prompt_lower = prompt.lower()

    # Determine a reasonable decision based on common prompt patterns
    if "fraud" in prompt_lower or "suspicious" in prompt_lower:
        decision = "escalated"
        confidence = round(random.uniform(0.55, 0.75), 2)
        reasoning = "Suspicious patterns detected. Requires further investigation."
    elif "reject" in prompt_lower or "exclusion" in prompt_lower:
        decision = "rejected"
        confidence = round(random.uniform(0.80, 0.95), 2)
        reasoning = "Claim falls under a policy exclusion or does not meet criteria."
    elif "high" in prompt_lower and ("risk" in prompt_lower or "amount" in prompt_lower):
        decision = "escalated"
        confidence = round(random.uniform(0.65, 0.85), 2)
        reasoning = "High-value or high-risk case requires senior review."
    else:
        decision = "approved"
        confidence = round(random.uniform(0.80, 0.95), 2)
        reasoning = "All criteria met. Documentation requirements satisfied."

    response = json.dumps({
        "decision": decision,
        "confidence": confidence,
        "reasoning": reasoning,
        "conditions": [],
        "risk_flags": [],
        "compliance_notes": "Decision compliant with regulations."
    }, indent=2)

    return response, prompt_tokens, completion_tokens


# ─── Agent Tracer Context Manager ────────────────────────

class AgentTracer:
    """
    Context manager that wraps an agent execution to capture telemetry.

    Usage:
        with AgentTracer("claims") as tracer:
            # ... do agent work ...
            tracer.record_tool_call(tool_record)
            tracer.record_llm_call(llm_record)
            tracer.set_decision(decision_record)
        # tracer.trace now has all data with totals calculated

    The tracer automatically:
    - Creates a TraceRecord on enter
    - Calculates total latency and cost on exit
    - Sets status to 'error' if an exception occurs
    """

    def __init__(self, agent_type: str, input_data: dict = None):
        self.agent_type = agent_type
        self.input_data = input_data or {}
        self.trace = TraceRecord(agent_type=agent_type, input_data=self.input_data)
        self._start_time = None

    def __enter__(self):
        self._start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Calculate totals
        self.trace.total_latency_ms = (
            sum(c.latency_ms for c in self.trace.llm_calls) +
            sum(t.duration_ms for t in self.trace.tool_calls)
        )
        self.trace.total_cost_usd = sum(c.cost_usd for c in self.trace.llm_calls)

        # Set error status if exception occurred
        if exc_type is not None:
            self.trace.status = "error"
            self.trace.output_data = {
                "error": str(exc_val),
                "error_type": exc_type.__name__
            }

        # Don't suppress the exception
        return False

    def record_llm_call(self, record: LLMCallRecord):
        """Add an LLM call record to the trace."""
        self.trace.llm_calls.append(record)

    def record_tool_call(self, record: ToolCallRecord):
        """Add a tool call record to the trace."""
        self.trace.tool_calls.append(record)

    def record_guardrail(self, result: GuardrailResult):
        """Add a guardrail check result to the trace."""
        self.trace.guardrails.append(result)

    def set_decision(self, decision: DecisionRecord):
        """Set the final decision on the trace."""
        self.trace.decision = decision

    def set_output(self, output_data: dict):
        """Set the output data on the trace."""
        self.trace.output_data = output_data
        self.trace.status = "success"

    def finalize(self):
        """Manually finalize the trace (calculate totals). Called automatically on exit."""
        self.trace.total_latency_ms = (
            sum(c.latency_ms for c in self.trace.llm_calls) +
            sum(t.duration_ms for t in self.trace.tool_calls)
        )
        self.trace.total_cost_usd = sum(c.cost_usd for c in self.trace.llm_calls)
