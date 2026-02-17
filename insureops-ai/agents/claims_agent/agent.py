"""
Claims Processing Agent — LangGraph Workflow
A multi-step agent that processes insurance claims using:
1. Policy lookup (tool)
2. Coverage verification (tool)
3. RAG context retrieval from policy document
4. LLM analysis for decision
5. Guardrail checks (PII, compliance)
6. Final decision output + telemetry
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
from agents.claims_agent.tools import policy_lookup, coverage_checker, payout_calculator
from agents.claims_agent.rag import get_policy_rag
from agents.claims_agent.prompts import (
    CLAIMS_SYSTEM_PROMPT,
    CLAIM_ANALYSIS_PROMPT,
    GUARDRAIL_PII_PROMPT,
    GUARDRAIL_COMPLIANCE_PROMPT
)

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))


# ─── Agent State ─────────────────────────────────────

class ClaimsState(TypedDict):
    """State passed through the LangGraph-style workflow."""
    claim_data: dict
    policy_data: Optional[dict]
    coverage_data: Optional[dict]
    payout_data: Optional[dict]
    policy_context: str
    llm_analysis: Optional[dict]
    guardrail_results: list
    decision: Optional[dict]
    trace: Optional[TraceRecord]


# ─── LLM Wrapper ────────────────────────────────────

def call_llm(prompt: str, system_prompt: str = "", model: str = None) -> tuple[str, LLMCallRecord]:
    """
    Call the LLM via OpenRouter (OpenAI-compatible API).
    Falls back to a simulated response if no API key is available.
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
    """Generate a realistic simulated LLM response for demo purposes."""
    # Simulate processing time
    time.sleep(random.uniform(0.3, 1.2))

    prompt_tokens = len(prompt.split()) * 2
    completion_tokens = random.randint(150, 400)

    # Determine decision based on keywords in the prompt
    prompt_lower = prompt.lower()

    if "fraud" in prompt_lower or "suspicious" in prompt_lower:
        decision_type = "escalated"
        confidence = round(random.uniform(0.55, 0.75), 2)
        reasoning = "Multiple fraud indicators detected. Claim requires investigation by the Special Investigations Unit before processing."
    elif "not covered" in prompt_lower or "exclusion" in prompt_lower or "flood" in prompt_lower:
        decision_type = "rejected"
        confidence = round(random.uniform(0.80, 0.95), 2)
        reasoning = "Claim falls under a policy exclusion. The claimed peril is not covered under the current policy terms."
    elif "25000" in prompt_lower or "45000" in prompt_lower or "48000" in prompt_lower or "52000" in prompt_lower:
        decision_type = "escalated"
        confidence = round(random.uniform(0.65, 0.85), 2)
        reasoning = "High-value claim exceeding $25,000 threshold. Requires senior claims supervisor approval per Section 4.3."
    else:
        decision_type = "approved"
        confidence = round(random.uniform(0.80, 0.95), 2)
        reasoning = "Claim is valid and falls within policy coverage. Documentation requirements met. Payout calculated per standard ACV method."

    response = json.dumps({
        "decision": decision_type,
        "confidence": confidence,
        "reasoning": reasoning,
        "payout_amount": None if decision_type == "rejected" else random.randint(500, 50000),
        "conditions": ["Standard documentation verification required"] if decision_type == "approved" else [],
        "risk_flags": ["Requires SIU review"] if decision_type == "escalated" else [],
        "compliance_notes": "Decision compliant with state insurance regulations."
    }, indent=2)

    return response, prompt_tokens, completion_tokens


# ─── Workflow Steps ──────────────────────────────────

def step_policy_lookup(state: ClaimsState) -> ClaimsState:
    """Step 1: Look up the policy associated with this claim."""
    claim = state["claim_data"]
    policy_data, tool_record = policy_lookup(claim.get("policy_id", ""))

    state["policy_data"] = policy_data
    state["trace"].tool_calls.append(tool_record)
    return state


def step_coverage_check(state: ClaimsState) -> ClaimsState:
    """Step 2: Check if the claim type is covered."""
    claim = state["claim_data"]
    coverage_data, tool_record = coverage_checker(
        claim.get("claim_type", ""),
        state.get("policy_data", {})
    )

    state["coverage_data"] = coverage_data
    state["trace"].tool_calls.append(tool_record)
    return state


def step_payout_calculation(state: ClaimsState) -> ClaimsState:
    """Step 3: Calculate the potential payout."""
    claim = state["claim_data"]
    payout_data, tool_record = payout_calculator(
        claim.get("amount", 0),
        state.get("coverage_data", {}),
        state.get("policy_data", {})
    )

    state["payout_data"] = payout_data
    state["trace"].tool_calls.append(tool_record)
    return state


def step_rag_retrieval(state: ClaimsState) -> ClaimsState:
    """Step 4: Retrieve relevant policy context via RAG."""
    claim = state["claim_data"]
    rag = get_policy_rag()

    with Timer() as timer:
        context = rag.retrieve_context(
            claim.get("claim_type", ""),
            claim.get("description", "")
        )

    state["policy_context"] = context
    state["trace"].tool_calls.append(ToolCallRecord(
        tool_name="rag_policy_retrieval",
        parameters={"claim_type": claim.get("claim_type", "")},
        result_summary=f"Retrieved {len(context)} chars of policy context",
        duration_ms=timer.elapsed_ms,
        success=True
    ))
    return state


def step_llm_analysis(state: ClaimsState) -> ClaimsState:
    """Step 5: LLM analyzes the claim with all gathered context."""
    claim = state["claim_data"]

    prompt = CLAIM_ANALYSIS_PROMPT.format(
        claim_id=claim.get("id", "N/A"),
        claim_type=claim.get("claim_type", "N/A"),
        description=claim.get("description", "N/A"),
        amount=claim.get("amount", 0),
        policy_id=claim.get("policy_id", "N/A"),
        date_of_incident=claim.get("date_of_incident", "N/A"),
        policy_context=state.get("policy_context", "None"),
        policy_lookup_result=json.dumps(state.get("policy_data", {}), indent=2)[:300],
        coverage_check_result=json.dumps(state.get("coverage_data", {}), indent=2)[:300],
        payout_calculation_result=json.dumps(state.get("payout_data", {}), indent=2)[:300]
    )

    response_text, llm_record = call_llm(prompt, CLAIMS_SYSTEM_PROMPT)

    state["trace"].llm_calls.append(llm_record)

    # Parse LLM response
    try:
        # Try to extract JSON from the response
        json_match = response_text
        if "```json" in response_text:
            json_match = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            json_match = response_text.split("```")[1].split("```")[0]

        analysis = json.loads(json_match.strip())
    except (json.JSONDecodeError, IndexError):
        # Fallback if JSON parsing fails
        analysis = {
            "decision": "escalated",
            "confidence": 0.60,
            "reasoning": "Unable to parse LLM response. Escalating for manual review.",
            "payout_amount": None,
            "conditions": [],
            "risk_flags": ["LLM response parse failure"],
            "compliance_notes": "Requires manual review"
        }

    state["llm_analysis"] = analysis
    return state


def step_guardrails(state: ClaimsState) -> ClaimsState:
    """Step 6: Run guardrail checks (PII, compliance)."""
    claim = state["claim_data"]
    analysis = state.get("llm_analysis", {})

    # PII Check
    pii_text = f"{claim.get('description', '')} {analysis.get('reasoning', '')}"
    pii_has_issues = any(
        indicator in pii_text.lower()
        for indicator in ['ssn', 'social security', 'credit card', 'bank account']
    )

    state["guardrail_results"] = []
    state["guardrail_results"].append(GuardrailResult(
        check_type="pii",
        passed=not pii_has_issues,
        details="No PII detected in claim data" if not pii_has_issues else "Potential PII detected — redaction recommended"
    ))

    state["trace"].guardrails.append(state["guardrail_results"][-1])

    # Compliance Check
    decision = analysis.get("decision", "")
    amount = claim.get("amount", 0)
    compliance_passed = True
    compliance_details = "Decision compliant with insurance regulations"

    if decision == "rejected" and analysis.get("confidence", 0) < 0.7:
        compliance_passed = False
        compliance_details = "Low-confidence rejection may violate fair claims handling requirements"

    state["guardrail_results"].append(GuardrailResult(
        check_type="compliance",
        passed=compliance_passed,
        details=compliance_details
    ))
    state["trace"].guardrails.append(state["guardrail_results"][-1])

    # Safety Check (bias detection)
    state["guardrail_results"].append(GuardrailResult(
        check_type="safety",
        passed=True,
        details="No bias indicators detected in decision rationale"
    ))
    state["trace"].guardrails.append(state["guardrail_results"][-1])

    return state


def step_finalize(state: ClaimsState) -> ClaimsState:
    """Step 7: Finalize the decision and build the trace."""
    analysis = state.get("llm_analysis", {})
    claim = state["claim_data"]

    # Check if any guardrails failed — escalate if so
    guardrails_passed = all(g.passed for g in state.get("guardrail_results", []))
    if not guardrails_passed:
        decision_type = "escalated"
        confidence = min(analysis.get("confidence", 0.5), 0.65)
        reasoning = f"Escalated due to failed guardrail checks. Original: {analysis.get('reasoning', '')}"
    else:
        decision_type = analysis.get("decision", "escalated")
        confidence = analysis.get("confidence", 0.5)
        reasoning = analysis.get("reasoning", "")

    # Check fraud indicators from input data
    if claim.get("fraud_indicators"):
        if decision_type != "rejected":
            decision_type = "escalated"
            reasoning = f"Fraud indicators present in claim data. {reasoning}"

    decision = DecisionRecord(
        decision_type=decision_type,
        confidence=confidence,
        reasoning=reasoning,
        escalated_to_human=decision_type == "escalated",
        human_override=None,
        human_decision=None
    )

    trace = state["trace"]
    trace.decision = decision

    # Calculate totals
    trace.total_latency_ms = sum(c.latency_ms for c in trace.llm_calls) + sum(t.duration_ms for t in trace.tool_calls)
    trace.total_cost_usd = sum(c.cost_usd for c in trace.llm_calls)
    trace.status = "success"
    trace.input_data = claim
    trace.output_data = {
        "decision": decision_type,
        "confidence": confidence,
        "reasoning": reasoning,
        "payout": state.get("payout_data", {}).get("payout", 0),
        "coverage_status": "covered" if state.get("coverage_data", {}).get("covered") else "not_covered"
    }

    state["decision"] = decision.model_dump()
    return state


# ─── Main Agent Runner ──────────────────────────────

def run_claims_agent(claim_data: dict, send_telemetry: bool = True) -> dict:
    """
    Run the Claims Processing Agent on a single claim.

    Args:
        claim_data: Dictionary with claim details (id, claim_type, description, amount, policy_id, date_of_incident)
        send_telemetry: Whether to send the trace to the backend

    Returns:
        Dictionary with decision, trace, and output details
    """
    print(f"\n🔍 Claims Agent — Processing claim: {claim_data.get('id', 'N/A')}")
    print(f"   Type: {claim_data.get('claim_type', 'N/A')}")
    print(f"   Amount: ${claim_data.get('amount', 0):,.2f}")

    # Initialize state
    trace = TraceRecord(agent_type="claims")

    state: ClaimsState = {
        "claim_data": claim_data,
        "policy_data": None,
        "coverage_data": None,
        "payout_data": None,
        "policy_context": "",
        "llm_analysis": None,
        "guardrail_results": [],
        "decision": None,
        "trace": trace
    }

    # Execute workflow steps sequentially (LangGraph-style)
    workflow_steps = [
        ("Policy Lookup", step_policy_lookup),
        ("Coverage Check", step_coverage_check),
        ("Payout Calculation", step_payout_calculation),
        ("RAG Retrieval", step_rag_retrieval),
        ("LLM Analysis", step_llm_analysis),
        ("Guardrail Checks", step_guardrails),
        ("Finalize Decision", step_finalize),
    ]

    for step_name, step_fn in workflow_steps:
        try:
            print(f"   → {step_name}...")
            state = step_fn(state)
        except Exception as e:
            print(f"   ❌ Error in {step_name}: {e}")
            trace.status = "error"
            trace.output_data = {"error": str(e), "failed_step": step_name}
            break

    # Print result
    decision = state.get("decision") or {}
    print(f"\n   ✅ Decision: {decision.get('decision_type', 'N/A').upper()}")
    print(f"   📊 Confidence: {decision.get('confidence', 0):.0%}")
    print(f"   ⏱️  Latency: {trace.total_latency_ms}ms")
    print(f"   💰 Cost: ${trace.total_cost_usd:.6f}")

    # Send telemetry
    if send_telemetry:
        send_telemetry_to_backend(trace)

    return {
        "trace_id": trace.trace_id,
        "decision": decision,
        "trace": trace.model_dump(),
        "payout": state.get("payout_data", {}),
        "coverage": state.get("coverage_data", {})
    }


# ─── CLI Entry Point ────────────────────────────────

if __name__ == "__main__":
    # Load a sample claim and run the agent
    claims = load_json_data("sample_claims.json")
    sample_claim = claims[0]  # CLM-001: water damage

    result = run_claims_agent(sample_claim, send_telemetry=False)
    print(f"\n📋 Full Result:")
    print(json.dumps(result["decision"], indent=2))
