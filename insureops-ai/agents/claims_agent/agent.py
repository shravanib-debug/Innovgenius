"""
Claims Processing Agent — LangGraph Workflow (Orchestrator)
Phase 4: Integrates AI Evidence Analysis + Type-Specific Verification.
"""

import json
import os
import sys
import argparse
from typing import TypedDict, Optional, List, Dict, Any
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Fix Windows encoding for emojis
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from agents.base_agent import (
    TraceRecord, LLMCallRecord, ToolCallRecord, GuardrailResult,
    DecisionRecord, Timer, calculate_cost, calculate_prompt_quality,
    send_telemetry_to_backend
)
from agents.claims_agent.tools import policy_lookup, coverage_checker, payout_calculator
from agents.claims_agent.evidence_analyzer import EvidenceAnalyzer
from agents.claims_agent.verifiers import get_verifier
from agents.claims_agent.prompts import (
    CLAIMS_SYSTEM_PROMPT, CLAIM_ANALYSIS_PROMPT,
    HEALTH_CLAIM_PROMPT, VEHICLE_CLAIM_PROMPT,
    TRAVEL_CLAIM_PROMPT, PROPERTY_CLAIM_PROMPT, LIFE_CLAIM_PROMPT
)

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))


# ─── Agent State ─────────────────────────────────────

class ClaimsState(TypedDict):
    claim_data: dict
    policy_data: Optional[dict]
    coverage_data: Optional[dict]
    payout_data: Optional[dict]
    policy_context: str
    evidence_analysis: List[Dict[str, Any]]
    verification_results: Optional[Dict[str, Any]]
    llm_analysis: Optional[dict]
    guardrail_results: list
    decision: Optional[dict]
    trace: Optional[TraceRecord]


# ─── LLM Wrapper ────────────────────────────────────

def call_llm(prompt: str, system_prompt: str = "", model: str = None) -> tuple[str, LLMCallRecord]:
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    model = model or os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

    with Timer() as timer:
        if api_key:
            try:
                from openai import OpenAI
                client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
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
                pt = response.usage.prompt_tokens
                ct = response.usage.completion_tokens
            except Exception as e:
                response_text = json.dumps({"error": str(e)})
                pt, ct = 0, 0
        else:
             response_text = json.dumps({"decision": "escalated", "reasoning": "Simulation mode (no API key)"})
             pt, ct = 100, 50

    cost = calculate_cost(pt, ct, model)
    quality = calculate_prompt_quality(prompt)

    record = LLMCallRecord(
        model=model,
        prompt_tokens=pt,
        completion_tokens=ct,
        latency_ms=timer.elapsed_ms,
        cost_usd=cost,
        status="success",
        prompt_quality=quality,
        prompt_text=prompt[:500],
        response_text=response_text[:500]
    )
    return response_text, record


# ─── Workflow Steps ──────────────────────────────────

def step_evidence_analysis(state: ClaimsState) -> ClaimsState:
    print("   → Evidence Analysis (Vision AI)...")
    claim = state["claim_data"]
    evidence_files = claim.get("evidence_files", []) 
    
    analyzer = EvidenceAnalyzer()
    results = []
    
    for file_path in evidence_files:
        if ".." in file_path: continue 
        if os.path.exists(file_path):
            res = analyzer.analyze_evidence(file_path, context=claim)
            res["file_path"] = os.path.basename(file_path)
            results.append(res)
        else:
            print(f"   ⚠️ Evidence file not found: {file_path}")
            results.append({"file_path": file_path, "error": "File not found"})

    state["evidence_analysis"] = results
    return state


def step_type_verification(state: ClaimsState) -> ClaimsState:
    print("   → Type Verification...")
    claim = state["claim_data"]
    insurance_type = claim.get("insurance_type", "general")
    
    verifier = get_verifier(insurance_type)
    result = None
    
    if verifier:
        result = verifier.verify(claim, state["evidence_analysis"])
        state["verification_results"] = result.model_dump()
        summary = f"Verified: {result.verified}, Flags: {len(result.flags)}"
    else:
        state["verification_results"] = {"error": "No verifier for this type", "verified": False}
        summary = "No verifier found"
    
    print(f"     Verifier: {insurance_type} -> {summary}")
    return state


def step_policy_lookup(state: ClaimsState) -> ClaimsState:
    print("   → Policy Lookup...")
    claim = state["claim_data"]
    policy_data, tool_record = policy_lookup(claim.get("policy_id", ""))
    state["policy_data"] = policy_data
    return state


def step_coverage_check(state: ClaimsState) -> ClaimsState:
    print("   → Coverage Check...")
    claim = state["claim_data"]
    coverage_data, tool_record = coverage_checker(claim.get("claim_type", ""), state.get("policy_data", {}))
    state["coverage_data"] = coverage_data
    return state


def step_payout_calculation(state: ClaimsState) -> ClaimsState:
    print("   → Payout Calculation...")
    claim = state["claim_data"]
    payout_data, tool_record = payout_calculator(claim.get("amount", 0), state.get("coverage_data", {}), state.get("policy_data", {}))
    state["payout_data"] = payout_data
    return state


def step_llm_analysis(state: ClaimsState) -> ClaimsState:
    print("   → LLM Analysis (Decision Decision)...")
    claim = state["claim_data"]
    insurance_type = claim.get("insurance_type", "general").lower()
    
    type_prompts = {
        "health": HEALTH_CLAIM_PROMPT,
        "vehicle": VEHICLE_CLAIM_PROMPT,
        "travel": TRAVEL_CLAIM_PROMPT,
        "property": PROPERTY_CLAIM_PROMPT,
        "life": LIFE_CLAIM_PROMPT
    }
    system_instruction = CLAIMS_SYSTEM_PROMPT + "\n\n" + type_prompts.get(insurance_type, "")

    verification_dump = json.dumps(state.get("verification_results", {}), indent=2)
    evidence_dump = json.dumps(state.get("evidence_analysis", []), indent=2)
    
    prompt = CLAIM_ANALYSIS_PROMPT.format(
        claim_id=claim.get("id", "N/A"),
        claim_type=claim.get("claim_type", "N/A"),
        insurance_type=insurance_type,
        description=claim.get("description", "N/A"),
        amount=claim.get("amount", 0),
        policy_id=claim.get("policy_id", "N/A"),
        date_of_incident=claim.get("date_of_incident", "N/A"),
        policy_context="[Policy Context Placeholder]",
        evidence_analysis=evidence_dump[:1500],
        verification_results=verification_dump,
        policy_lookup_result=json.dumps(state.get("policy_data", {}), indent=2)[:300],
        coverage_check_result=json.dumps(state.get("coverage_data", {}), indent=2)[:300],
        payout_calculation_result=json.dumps(state.get("payout_data", {}), indent=2)[:300]
    )

    response_text, llm_record = call_llm(prompt, system_instruction)
    state["trace"].llm_calls.append(llm_record)

    try:
        if "```json" in response_text:
            json_match = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            json_match = response_text.split("```")[1].split("```")[0]
        else:
            json_match = response_text
        analysis = json.loads(json_match.strip())
    except:
        analysis = {
            "decision": "escalated",
            "confidence": 0.5,
            "reasoning": "Failed to parse LLM response",
            "risk_flags": ["LLM Parse Error"]
        }

    state["llm_analysis"] = analysis
    return state


def step_finalize(state: ClaimsState) -> ClaimsState:
    print("   → Finalizing...")
    analysis = state.get("llm_analysis", {})
    claim = state["claim_data"]
    
    decision = DecisionRecord(
        decision_type=analysis.get("decision", "escalated"),
        confidence=analysis.get("confidence", 0.5),
        reasoning=analysis.get("reasoning", ""),
        escalated_to_human=analysis.get("decision") == "escalated",
        human_override=None,
        human_decision=None
    )

    trace = state["trace"]
    trace.decision = decision
    trace.status = "success"
    trace.input_data = claim
    
    trace.output_data = {
        "decision": decision.decision_type,
        "confidence": decision.confidence,
        "reasoning": decision.reasoning,
        "verification": state.get("verification_results", {}),
        "evidence_analysis_summary": f"Analyzed {len(state.get('evidence_analysis', []))} files"
    }

    state["decision"] = decision.model_dump()
    return state


# ─── Main Runner ─────────────────────────────────────

def run_claims_agent(claim_data: dict, send_telemetry: bool = True) -> dict:
    print(f"\n🔍 Claims Agent v2 (Orchestrator) — Processing {claim_data.get('id', 'N/A')}")
    
    trace = TraceRecord(agent_type="claims")
    state: ClaimsState = {
        "claim_data": claim_data,
        "trace": trace,
        "evidence_analysis": [],
        "policy_context": "",
    }

    # Workflow
    try:
        state = step_evidence_analysis(state)
        state = step_type_verification(state)
        state = step_policy_lookup(state)
        state = step_coverage_check(state)
        state = step_payout_calculation(state)
        state = step_llm_analysis(state)
        state = step_finalize(state)
    except Exception as e:
        print(f"❌ Error in workflow: {e}")
        import traceback
        traceback.print_exc()
        trace.status = "error"
        trace.output_data = {"error": str(e)}

    # Send telemetry
    if send_telemetry:
        send_telemetry_to_backend(trace)
    
    return {
        "success": trace.status == "success",
        "decision": state.get("decision"),
        "trace_id": trace.trace_id,
        "verification": state.get("verification_results"),
        "evidence_analysis": state.get("evidence_analysis")
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--payload", help="JSON string of claim data")
    args = parser.parse_args()

    if args.payload:
        try:
            claim_data = json.loads(args.payload)
            # Add implicit evidence files detection if not passed but claim ID is passed?
            # For now assume payload has everything
            
            result = run_claims_agent(claim_data, send_telemetry=True)
            
            # Output ONLY valid JSON on the last line for Node.js to parse
            print("__JSON_START__")
            print(json.dumps(result))
            print("__JSON_END__")
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print("Usage: python -m agents.claims_agent.agent --payload <json>")
