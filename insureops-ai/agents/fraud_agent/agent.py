"""
Fraud Detection Agent — LangGraph Workflow
A multi-step agent that analyzes claims for fraud using:
1. Duplicate claim checker (tool)
2. Pattern analysis (tool)
3. Claimant history lookup (tool)
4. LLM fraud analysis (with all tool context)
5. Guardrail checks (compliance, safety)
6. Final decision + telemetry
"""

import json
import os
import random
import time
from typing import TypedDict, Optional
from dotenv import load_dotenv

from agents.base_agent import (
    TraceRecord, LLMCallRecord, ToolCallRecord, GuardrailResult,
    DecisionRecord, Timer, calculate_cost, calculate_prompt_quality,
    send_telemetry_to_backend, load_json_data
)
from agents.fraud_agent.tools import (
    duplicate_checker, pattern_analyzer, claimant_history_lookup
)
from agents.fraud_agent.prompts import FRAUD_SYSTEM_PROMPT, FRAUD_ANALYSIS_PROMPT

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))


# ─── Agent State ─────────────────────────────────────

class FraudState(TypedDict):
    claim_data: dict
    duplicate_data: Optional[dict]
    pattern_data: Optional[dict]
    history_data: Optional[dict]
    llm_analysis: Optional[dict]
    guardrail_results: list
    decision: Optional[dict]
    trace: Optional[TraceRecord]


# ─── LLM Wrapper ────────────────────────────────────

def call_llm(prompt: str, system_prompt: str = "", model: str = None) -> tuple[str, LLMCallRecord]:
    """Call LLM via OpenRouter (OpenAI-compatible API) or simulation fallback."""
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
                    model=model, messages=messages, temperature=0.1,
                    response_format={"type": "json_object"}
                )

                response_text = response.choices[0].message.content
                prompt_tokens = response.usage.prompt_tokens if response.usage else len(prompt.split()) * 2
                completion_tokens = response.usage.completion_tokens if response.usage else len(response_text.split()) * 2
            except Exception as e:
                print(f"⚠️ LLM call failed, using simulation: {e}")
                response_text, prompt_tokens, completion_tokens = _simulate_llm_response(prompt)
        else:
            response_text, prompt_tokens, completion_tokens = _simulate_llm_response(prompt)

    cost = calculate_cost(prompt_tokens, completion_tokens, model)
    quality = calculate_prompt_quality(prompt)

    record = LLMCallRecord(
        model=model, prompt_tokens=prompt_tokens, completion_tokens=completion_tokens,
        latency_ms=timer.elapsed_ms, cost_usd=cost, status="success",
        prompt_quality=quality, prompt_text=prompt[:500], response_text=response_text[:500]
    )
    return response_text, record


def _simulate_llm_response(prompt: str) -> tuple[str, int, int]:
    """Simulate fraud detection LLM response."""
    time.sleep(random.uniform(0.5, 1.8))

    prompt_tokens = len(prompt.split()) * 2
    completion_tokens = random.randint(200, 500)
    prompt_lower = prompt.lower()

    # Check for strong fraud indicators
    high_risk_keywords = ["multiple locations", "simultaneously", "deactivated",
                          "fourth", "no signs of forced entry", "vacant", "45 days"]
    fraud_count = sum(1 for kw in high_risk_keywords if kw in prompt_lower)

    if fraud_count >= 2 or "critical" in prompt_lower:
        decision = "escalated"
        confidence = round(random.uniform(0.85, 0.95), 2)
        fraud_prob = round(random.uniform(0.75, 0.95), 2)
        reasoning = "Strong fraud indicators detected. Multiple suspicious patterns match known fraud schemes. Recommending full SIU investigation."
        action = "investigation_required"
        priority = "critical"
    elif fraud_count >= 1 or "high" in prompt_lower or "pre_flagged" in prompt_lower:
        decision = "flagged"
        confidence = round(random.uniform(0.70, 0.85), 2)
        fraud_prob = round(random.uniform(0.45, 0.70), 2)
        reasoning = "Some suspicious patterns detected. Claim requires closer review to rule out fraudulent activity."
        action = "flag"
        priority = "high"
    else:
        decision = "approved"
        confidence = round(random.uniform(0.80, 0.95), 2)
        fraud_prob = round(random.uniform(0.05, 0.20), 2)
        reasoning = "No significant fraud indicators detected. Claim appears legitimate based on available data."
        action = "clear"
        priority = "low"

    response = json.dumps({
        "decision": decision, "confidence": confidence,
        "fraud_probability": fraud_prob, "reasoning": reasoning,
        "risk_flags": [f"Flag {i+1}" for i in range(fraud_count)] if fraud_count > 0 else [],
        "recommended_action": action, "investigation_priority": priority,
        "compliance_notes": "Assessment compliant with SIU investigation guidelines."
    }, indent=2)

    return response, prompt_tokens, completion_tokens


# ─── Workflow Steps ──────────────────────────────────

def step_duplicate_check(state: FraudState) -> FraudState:
    """Step 1: Check for duplicate claims."""
    dup_data, record = duplicate_checker(state["claim_data"])
    state["duplicate_data"] = dup_data
    state["trace"].tool_calls.append(record)
    return state


def step_pattern_analysis(state: FraudState) -> FraudState:
    """Step 2: Analyze fraud patterns."""
    pattern_data, record = pattern_analyzer(state["claim_data"])
    state["pattern_data"] = pattern_data
    state["trace"].tool_calls.append(record)
    return state


def step_claimant_history(state: FraudState) -> FraudState:
    """Step 3: Look up claimant history."""
    claimant_id = state["claim_data"].get("claimant_id", "UNKNOWN")
    history_data, record = claimant_history_lookup(claimant_id)
    state["history_data"] = history_data
    state["trace"].tool_calls.append(record)
    return state


def step_llm_analysis(state: FraudState) -> FraudState:
    """Step 4: LLM performs comprehensive fraud analysis."""
    claim = state["claim_data"]

    prompt = FRAUD_ANALYSIS_PROMPT.format(
        claim_id=claim.get("id", "N/A"),
        claim_type=claim.get("claim_type", "N/A"),
        description=claim.get("description", "N/A"),
        amount=claim.get("amount", 0),
        policy_id=claim.get("policy_id", "N/A"),
        date_of_incident=claim.get("date_of_incident", "N/A"),
        fraud_indicators="Yes — Pre-flagged" if claim.get("fraud_indicators") else "No",
        duplicate_check_result=json.dumps(state.get("duplicate_data", {}), indent=2)[:400],
        pattern_analysis_result=json.dumps(state.get("pattern_data", {}), indent=2)[:400],
        claimant_history_result=json.dumps(state.get("history_data", {}), indent=2)[:400]
    )

    response_text, llm_record = call_llm(prompt, FRAUD_SYSTEM_PROMPT)
    state["trace"].llm_calls.append(llm_record)

    try:
        json_match = response_text
        if "```json" in response_text:
            json_match = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            json_match = response_text.split("```")[1].split("```")[0]
        analysis = json.loads(json_match.strip())
    except (json.JSONDecodeError, IndexError):
        analysis = {
            "decision": "escalated", "confidence": 0.60, "fraud_probability": 0.50,
            "reasoning": "Unable to parse LLM response. Escalating for manual review.",
            "risk_flags": [], "recommended_action": "flag",
            "investigation_priority": "medium", "compliance_notes": "Requires manual review"
        }

    state["llm_analysis"] = analysis
    return state


def step_guardrails(state: FraudState) -> FraudState:
    """Step 5: Run compliance and safety guardrails."""
    analysis = state.get("llm_analysis", {})
    state["guardrail_results"] = []

    # Compliance check — ensure fair investigation procedures
    compliance_passed = True
    compliance_detail = "Fraud assessment follows SIU investigation guidelines"
    if analysis.get("decision") == "escalated" and analysis.get("confidence", 0) < 0.6:
        compliance_passed = False
        compliance_detail = "Low-confidence fraud flag — ensure sufficient evidence before SIU referral"

    state["guardrail_results"].append(GuardrailResult(
        check_type="compliance", passed=compliance_passed, details=compliance_detail
    ))
    state["trace"].guardrails.append(state["guardrail_results"][-1])

    # Safety check
    state["guardrail_results"].append(GuardrailResult(
        check_type="safety", passed=True,
        details="No safety concerns in fraud assessment"
    ))
    state["trace"].guardrails.append(state["guardrail_results"][-1])

    # PII check
    description = state["claim_data"].get("description", "")
    has_pii = any(t in description.lower() for t in ["ssn", "social security", "credit card"])
    state["guardrail_results"].append(GuardrailResult(
        check_type="pii", passed=not has_pii,
        details="No PII detected" if not has_pii else "PII detected — redaction required"
    ))
    state["trace"].guardrails.append(state["guardrail_results"][-1])

    return state


def step_finalize(state: FraudState) -> FraudState:
    """Step 6: Finalize the fraud assessment."""
    analysis = state.get("llm_analysis", {})
    pattern_data = state.get("pattern_data", {})

    guardrails_passed = all(g.passed for g in state.get("guardrail_results", []))

    decision_type = analysis.get("decision", "escalated")
    confidence = analysis.get("confidence", 0.5)
    reasoning = analysis.get("reasoning", "")

    if not guardrails_passed:
        decision_type = "escalated"
        confidence = min(confidence, 0.65)
        reasoning = f"Guardrail check failed. {reasoning}"

    # Override decision if pattern analysis shows critical fraud risk
    if pattern_data.get("fraud_risk") == "critical" and decision_type == "approved":
        decision_type = "flagged"
        reasoning = f"Pattern analysis flagged critical fraud risk. {reasoning}"

    decision = DecisionRecord(
        decision_type=decision_type, confidence=confidence, reasoning=reasoning,
        escalated_to_human=decision_type in ("escalated", "flagged")
    )

    trace = state["trace"]
    trace.decision = decision
    trace.total_latency_ms = sum(c.latency_ms for c in trace.llm_calls) + sum(t.duration_ms for t in trace.tool_calls)
    trace.total_cost_usd = sum(c.cost_usd for c in trace.llm_calls)
    trace.status = "success"
    trace.input_data = state["claim_data"]
    trace.output_data = {
        "decision": decision_type, "confidence": confidence, "reasoning": reasoning,
        "fraud_probability": analysis.get("fraud_probability", 0),
        "flags_count": pattern_data.get("flags_found", 0),
        "investigation_priority": analysis.get("investigation_priority", "low")
    }

    state["decision"] = decision.model_dump()
    return state


# ─── Main Agent Runner ──────────────────────────────

def run_fraud_agent(claim_data: dict, send_telemetry: bool = True) -> dict:
    """Run the Fraud Detection Agent on a single claim."""
    print(f"\n🔎 Fraud Agent — Analyzing claim: {claim_data.get('id', 'N/A')}")
    print(f"   Type: {claim_data.get('claim_type', 'N/A')}")
    print(f"   Amount: ${claim_data.get('amount', 0):,.2f}")
    print(f"   Pre-flagged: {'Yes ⚠️' if claim_data.get('fraud_indicators') else 'No'}")

    trace = TraceRecord(agent_type="fraud")
    state: FraudState = {
        "claim_data": claim_data, "duplicate_data": None,
        "pattern_data": None, "history_data": None,
        "llm_analysis": None, "guardrail_results": [], "decision": None,
        "trace": trace
    }

    steps = [
        ("Duplicate Check", step_duplicate_check),
        ("Pattern Analysis", step_pattern_analysis),
        ("Claimant History Lookup", step_claimant_history),
        ("LLM Fraud Analysis", step_llm_analysis),
        ("Guardrail Checks", step_guardrails),
        ("Finalize Assessment", step_finalize),
    ]

    for step_name, step_fn in steps:
        try:
            print(f"   → {step_name}...")
            state = step_fn(state)
        except Exception as e:
            print(f"   ❌ Error in {step_name}: {e}")
            trace.status = "error"
            trace.output_data = {"error": str(e), "failed_step": step_name}
            break

    decision = state.get("decision", {})
    print(f"\n   ✅ Decision: {decision.get('decision_type', 'N/A').upper()}")
    print(f"   📊 Confidence: {decision.get('confidence', 0):.0%}")
    print(f"   ⏱️  Latency: {trace.total_latency_ms}ms")
    print(f"   💰 Cost: ${trace.total_cost_usd:.6f}")

    if send_telemetry:
        send_telemetry_to_backend(trace)

    return {
        "trace_id": trace.trace_id, "decision": decision,
        "trace": trace.model_dump(),
        "pattern_analysis": state.get("pattern_data", {}),
        "claimant_history": state.get("history_data", {})
    }


if __name__ == "__main__":
    claims = load_json_data("sample_claims.json")
    # Test with a fraud-flagged claim (CLM-014 — suspicious fire)
    fraud_claim = next((c for c in claims if c["id"] == "CLM-014"), claims[0])
    result = run_fraud_agent(fraud_claim, send_telemetry=False)
    print(f"\n📋 Full Result:")
    print(json.dumps(result["decision"], indent=2))
