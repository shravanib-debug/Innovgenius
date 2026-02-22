"""
Underwriting Risk Agent — LangGraph Workflow
A multi-step agent that assesses insurance applicant risk using:
1. Risk score calculation (tool)
2. Medical risk lookup (tool)
3. Historical data check (tool)
4. LLM risk assessment (with guidelines context)
5. Guardrail checks (bias, compliance)
6. Premium calculation + final decision + telemetry
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
from agents.underwriting_agent.tools import (
    risk_score_calculator, medical_risk_lookup, historical_data_check
)
from agents.underwriting_agent.prompts import (
    UNDERWRITING_SYSTEM_PROMPT,
    RISK_ASSESSMENT_PROMPT
)

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))


# ─── Agent State ─────────────────────────────────────

class UnderwritingState(TypedDict):
    applicant_data: dict
    risk_score_data: Optional[dict]
    medical_risk_data: Optional[dict]
    historical_data: Optional[dict]
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
                    model=model, messages=messages, temperature=0.2,
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
    """Simulate underwriting LLM response."""
    time.sleep(random.uniform(0.4, 1.5))

    prompt_tokens = len(prompt.split()) * 2
    completion_tokens = random.randint(200, 450)
    prompt_lower = prompt.lower()

    # Determine decision from risk score in prompt
    if "auto_reject" in prompt_lower or "very_high" in prompt_lower:
        decision = "rejected"
        confidence = round(random.uniform(0.82, 0.95), 2)
        reasoning = "Applicant's composite risk score exceeds acceptable threshold. Multiple severe risk factors present."
        premium = 0
    elif "auto_approve" in prompt_lower:
        decision = "approved"
        confidence = round(random.uniform(0.85, 0.95), 2)
        reasoning = "Low risk profile. All health, occupational, and demographic factors within acceptable ranges."
        premium = random.randint(80, 200)
    else:
        decision = "escalated"
        confidence = round(random.uniform(0.60, 0.80), 2)
        reasoning = "Moderate risk factors require senior underwriter review. Special conditions may apply."
        premium = random.randint(150, 400)

    response = json.dumps({
        "decision": decision, "confidence": confidence, "reasoning": reasoning,
        "risk_score": round(random.uniform(0.1, 0.9), 2),
        "premium_monthly": premium,
        "risk_factors": ["See tool analysis for complete breakdown"],
        "conditions": ["Standard medical exam required"] if decision == "escalated" else [],
        "compliance_notes": "Decision is compliant with insurance regulations and anti-discrimination laws."
    }, indent=2)

    return response, prompt_tokens, completion_tokens


# ─── Workflow Steps ──────────────────────────────────

def step_risk_score(state: UnderwritingState) -> UnderwritingState:
    """Step 1: Calculate composite risk score."""
    risk_data, record = risk_score_calculator(state["applicant_data"])
    state["risk_score_data"] = risk_data
    state["trace"].tool_calls.append(record)
    return state


def step_medical_risk(state: UnderwritingState) -> UnderwritingState:
    """Step 2: Look up medical risk details."""
    applicant = state["applicant_data"]
    medical_data, record = medical_risk_lookup(
        applicant.get("health_conditions", []),
        applicant.get("age", 30)
    )
    state["medical_risk_data"] = medical_data
    state["trace"].tool_calls.append(record)
    return state


def step_historical_data(state: UnderwritingState) -> UnderwritingState:
    """Step 3: Check historical claim rates."""
    hist_data, record = historical_data_check(state["applicant_data"])
    state["historical_data"] = hist_data
    state["trace"].tool_calls.append(record)
    return state


def step_llm_assessment(state: UnderwritingState) -> UnderwritingState:
    """Step 4: LLM performs comprehensive risk assessment."""
    applicant = state["applicant_data"]

    prompt = RISK_ASSESSMENT_PROMPT.format(
        applicant_id=applicant.get("id", "N/A"),
        name=applicant.get("name", "N/A"),
        age=applicant.get("age", 0),
        gender=applicant.get("gender", "N/A"),
        bmi=applicant.get("bmi", 0),
        smoker="Yes" if applicant.get("smoker") else "No",
        occupation=applicant.get("occupation", "N/A"),
        occupation_risk_class=applicant.get("occupation_risk_class", "N/A"),
        health_conditions=", ".join(applicant.get("health_conditions", [])) or "None",
        coverage_amount=applicant.get("coverage_amount", 0),
        risk_score_result=json.dumps(state.get("risk_score_data", {}), indent=2)[:400],
        medical_risk_result=json.dumps(state.get("medical_risk_data", {}), indent=2)[:400],
        historical_data_result=json.dumps(state.get("historical_data", {}), indent=2)[:300]
    )

    response_text, llm_record = call_llm(prompt, UNDERWRITING_SYSTEM_PROMPT)
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
            "decision": "escalated", "confidence": 0.55, "risk_score": 0.5,
            "reasoning": "Unable to parse LLM response. Escalating for manual review.",
            "premium_monthly": 0, "risk_factors": [], "conditions": [],
            "compliance_notes": "Requires manual review"
        }

    state["llm_analysis"] = analysis
    return state


def step_guardrails(state: UnderwritingState) -> UnderwritingState:
    """Step 5: Run bias and compliance guardrail checks."""
    analysis = state.get("llm_analysis", {})
    state["guardrail_results"] = []

    # Bias check
    reasoning = analysis.get("reasoning", "").lower()
    bias_detected = any(term in reasoning for term in [
        "gender", "race", "ethnicity", "religion", "orientation"
    ])
    state["guardrail_results"].append(GuardrailResult(
        check_type="bias", passed=not bias_detected,
        details="No bias indicators in underwriting decision" if not bias_detected else "Potential bias detected — review required"
    ))
    state["trace"].guardrails.append(state["guardrail_results"][-1])

    # Compliance check
    compliance_passed = True
    if analysis.get("decision") == "rejected" and analysis.get("confidence", 0) < 0.7:
        compliance_passed = False
    state["guardrail_results"].append(GuardrailResult(
        check_type="compliance", passed=compliance_passed,
        details="Decision meets regulatory compliance standards" if compliance_passed else "Low-confidence rejection may require additional justification"
    ))
    state["trace"].guardrails.append(state["guardrail_results"][-1])

    return state


def step_finalize(state: UnderwritingState) -> UnderwritingState:
    """Step 6: Calculate premium and finalize."""
    analysis = state.get("llm_analysis", {})
    applicant = state["applicant_data"]
    risk_data = state.get("risk_score_data", {})

    guardrails_passed = all(g.passed for g in state.get("guardrail_results", []))
    if not guardrails_passed:
        decision_type = "escalated"
        confidence = min(analysis.get("confidence", 0.5), 0.65)
        reasoning = f"Escalated due to guardrail failure. {analysis.get('reasoning', '')}"
    else:
        decision_type = analysis.get("decision", "escalated")
        confidence = analysis.get("confidence", 0.5)
        reasoning = analysis.get("reasoning", "")

    # Calculate premium
    guidelines = load_json_data("underwriting_guidelines.json")
    premium_config = guidelines["premium_calculation"]
    coverage = applicant.get("coverage_amount", 0)
    risk_score = risk_data.get("risk_score", 0.5)

    if decision_type != "rejected":
        base_premium = (coverage / 1000) * premium_config["base_rate_per_1000"]
        adjusted_premium = base_premium * (1 + risk_score * premium_config["risk_premium_multiplier"])
        monthly_premium = max(adjusted_premium / 12, premium_config["min_premium_monthly"])
        monthly_premium = min(monthly_premium, base_premium / 12 * premium_config["max_premium_multiplier"])
    else:
        monthly_premium = 0

    decision = DecisionRecord(
        decision_type=decision_type, confidence=confidence, reasoning=reasoning,
        escalated_to_human=decision_type == "escalated"
    )

    trace = state["trace"]
    trace.decision = decision
    trace.total_latency_ms = sum(c.latency_ms for c in trace.llm_calls) + sum(t.duration_ms for t in trace.tool_calls)
    trace.total_cost_usd = sum(c.cost_usd for c in trace.llm_calls)
    trace.status = "success"
    trace.input_data = applicant
    trace.output_data = {
        "decision": decision_type, "confidence": confidence, "reasoning": reasoning,
        "risk_score": risk_data.get("risk_score", 0), "monthly_premium": round(monthly_premium, 2)
    }

    state["decision"] = decision.model_dump()
    return state


# ─── Main Agent Runner ──────────────────────────────

def run_underwriting_agent(applicant_data: dict, send_telemetry: bool = True) -> dict:
    """Run the Underwriting Risk Agent on a single applicant."""
    print(f"\n📋 Underwriting Agent — Assessing: {applicant_data.get('name', 'N/A')}")
    print(f"   Age: {applicant_data.get('age')}, Occupation: {applicant_data.get('occupation')}")
    print(f"   Coverage: ${applicant_data.get('coverage_amount', 0):,.2f}")

    trace = TraceRecord(agent_type="underwriting")
    state: UnderwritingState = {
        "applicant_data": applicant_data, "risk_score_data": None,
        "medical_risk_data": None, "historical_data": None,
        "llm_analysis": None, "guardrail_results": [], "decision": None,
        "trace": trace
    }

    steps = [
        ("Risk Score Calculation", step_risk_score),
        ("Medical Risk Lookup", step_medical_risk),
        ("Historical Data Check", step_historical_data),
        ("LLM Risk Assessment", step_llm_assessment),
        ("Guardrail Checks", step_guardrails),
        ("Finalize Decision", step_finalize),
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
        "trace": trace.model_dump(), "risk_score": state.get("risk_score_data", {})
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--payload", help="JSON string of applicant data")
    args = parser.parse_args()

    if args.payload:
        try:
            applicant_data = json.loads(args.payload)
            result = run_underwriting_agent(applicant_data, send_telemetry=True)

            # Output ONLY valid JSON between markers for Node.js to parse
            print("__JSON_START__")
            print(json.dumps(result))
            print("__JSON_END__")
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Default: run with sample data for testing
        applicants = load_json_data("sample_applicants.json")
        result = run_underwriting_agent(applicants[0], send_telemetry=False)
        print(f"\n📋 Full Result:")
        print(json.dumps(result["decision"], indent=2))
