"""
Customer Support Agent — Simulator
Generates realistic simulated telemetry for customer support interactions.
This agent is NOT a real LLM agent — it produces synthetic trace data
that mimics what a real support agent would generate.
"""

import json
import random
import uuid
import time
from datetime import datetime, timedelta
from agents.base_agent import (
    TraceRecord, LLMCallRecord, ToolCallRecord, GuardrailResult,
    DecisionRecord, send_telemetry_to_backend
)

# Simulated support scenarios
SUPPORT_SCENARIOS = [
    {
        "query": "How do I file a new claim for water damage in my basement?",
        "category": "claims_inquiry",
        "intent": "file_claim",
        "complexity": "simple",
        "sentiment": "neutral"
    },
    {
        "query": "I want to know the status of my claim CLM-001. It's been 2 weeks and I haven't heard anything.",
        "category": "claim_status",
        "intent": "check_status",
        "complexity": "simple",
        "sentiment": "frustrated"
    },
    {
        "query": "Can you explain why my claim was denied? I don't understand the reasoning.",
        "category": "claim_dispute",
        "intent": "understand_denial",
        "complexity": "complex",
        "sentiment": "angry"
    },
    {
        "query": "I'd like to add flood coverage to my homeowner's policy. What are my options?",
        "category": "coverage_inquiry",
        "intent": "add_coverage",
        "complexity": "moderate",
        "sentiment": "neutral"
    },
    {
        "query": "My payment didn't go through and I'm worried my policy will lapse. Can you help?",
        "category": "billing",
        "intent": "payment_issue",
        "complexity": "simple",
        "sentiment": "anxious"
    },
    {
        "query": "I need to change the beneficiary on my life insurance policy.",
        "category": "policy_change",
        "intent": "update_beneficiary",
        "complexity": "moderate",
        "sentiment": "neutral"
    },
    {
        "query": "I was in a car accident and need to file a claim. The other driver was at fault.",
        "category": "new_claim",
        "intent": "file_auto_claim",
        "complexity": "complex",
        "sentiment": "stressed"
    },
    {
        "query": "What's the difference between actual cash value and replacement cost?",
        "category": "education",
        "intent": "understand_terms",
        "complexity": "simple",
        "sentiment": "neutral"
    },
    {
        "query": "I want to cancel my policy and get a refund for the remaining months.",
        "category": "cancellation",
        "intent": "cancel_policy",
        "complexity": "moderate",
        "sentiment": "determined"
    },
    {
        "query": "Someone broke into my car last night. What do I need to do to file a claim?",
        "category": "new_claim",
        "intent": "file_theft_claim",
        "complexity": "moderate",
        "sentiment": "upset"
    }
]

# Simulated tools available to the support agent
SUPPORT_TOOLS = [
    "knowledge_base_search",
    "policy_lookup",
    "claim_status_check",
    "payment_status_check",
    "escalation_router",
    "template_response_generator"
]


def _simulate_support_trace(scenario: dict = None) -> TraceRecord:
    """Generate a single simulated support trace."""
    if scenario is None:
        scenario = random.choice(SUPPORT_SCENARIOS)

    trace = TraceRecord(agent_type="support")

    complexity_latencies = {"simple": (200, 800), "moderate": (500, 1500), "complex": (800, 2500)}
    latency_range = complexity_latencies.get(scenario["complexity"], (300, 1200))

    # Simulate LLM calls
    num_llm_calls = {"simple": 1, "moderate": 2, "complex": 3}.get(scenario["complexity"], 1)

    for i in range(num_llm_calls):
        prompt_tokens = random.randint(200, 800)
        completion_tokens = random.randint(100, 400)
        latency = random.randint(*latency_range)

        trace.llm_calls.append(LLMCallRecord(
            model="gemini-1.5-flash",
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            latency_ms=latency,
            cost_usd=round(prompt_tokens * 0.000000075 + completion_tokens * 0.0000003, 6),
            status="success",
            prompt_quality=round(random.uniform(0.75, 0.95), 2),
            prompt_text=f"[Support] Customer query: {scenario['query'][:100]}",
            response_text=f"[Support] Response for {scenario['category']} intent: {scenario['intent']}"
        ))

    # Simulate tool calls
    tools_used = random.sample(SUPPORT_TOOLS, min(random.randint(1, 3), len(SUPPORT_TOOLS)))
    for j, tool in enumerate(tools_used):
        trace.tool_calls.append(ToolCallRecord(
            tool_name=tool,
            parameters={"query": scenario["query"][:50], "category": scenario["category"]},
            result_summary=f"Tool {tool} returned results successfully",
            duration_ms=random.randint(10, 200),
            success=random.random() > 0.05  # 95% success rate
        ))

    # Guardrails
    trace.guardrails.append(GuardrailResult(
        check_type="pii", passed=True,
        details="No PII detected in support interaction"
    ))
    trace.guardrails.append(GuardrailResult(
        check_type="safety", passed=True,
        details="Response tone and content are appropriate"
    ))

    # Decision
    decision_type = "approved" if scenario["complexity"] != "complex" else random.choice(["approved", "escalated"])
    escalated = decision_type == "escalated"

    trace.decision = DecisionRecord(
        decision_type=decision_type,
        confidence=round(random.uniform(0.80, 0.98), 2),
        reasoning=f"Support query handled: {scenario['category']} — {scenario['intent']}",
        escalated_to_human=escalated,
        human_override=None,
        human_decision=None
    )

    # Totals
    trace.total_latency_ms = sum(c.latency_ms for c in trace.llm_calls) + sum(t.duration_ms for t in trace.tool_calls)
    trace.total_cost_usd = sum(c.cost_usd for c in trace.llm_calls)
    trace.status = "success"
    trace.input_data = {
        "query": scenario["query"],
        "category": scenario["category"],
        "intent": scenario["intent"],
        "sentiment": scenario["sentiment"]
    }
    trace.output_data = {
        "decision": decision_type,
        "category": scenario["category"],
        "resolution": "resolved" if not escalated else "escalated_to_human",
        "customer_satisfaction": round(random.uniform(3.5, 5.0), 1)
    }

    return trace


def run_support_simulator(count: int = 1, send_telemetry: bool = True) -> list[dict]:
    """
    Run the customer support simulator to generate synthetic traces.

    Args:
        count: Number of simulated interactions to generate
        send_telemetry: Whether to send traces to the backend

    Returns:
        List of trace dictionaries
    """
    print(f"\n💬 Support Simulator — Generating {count} interactions...")

    results = []
    for i in range(count):
        scenario = SUPPORT_SCENARIOS[i % len(SUPPORT_SCENARIOS)]
        trace = _simulate_support_trace(scenario)

        # Stagger timestamps slightly
        offset = timedelta(minutes=random.randint(1, 60), seconds=random.randint(0, 59))
        trace.timestamp = (datetime.utcnow() - offset).isoformat()

        print(f"   [{i+1}/{count}] {scenario['category']} — {trace.decision.decision_type}")

        if send_telemetry:
            send_telemetry_to_backend(trace)

        results.append({
            "trace_id": trace.trace_id,
            "category": scenario["category"],
            "intent": scenario["intent"],
            "decision": trace.decision.decision_type,
            "latency_ms": trace.total_latency_ms,
            "trace": trace.model_dump()
        })

    print(f"   ✅ Generated {count} support interaction traces")
    return results


if __name__ == "__main__":
    results = run_support_simulator(count=5, send_telemetry=False)
    for r in results:
        print(f"  {r['trace_id'][:8]}... | {r['category']} | {r['decision']} | {r['latency_ms']}ms")
