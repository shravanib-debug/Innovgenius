"""
Claims Processing Agent — LangGraph Workflow (Orchestrator)
Phase 4: Integrates AI Evidence Analysis + Type-Specific Verification.
Phase 5: Dynamic Clause Interpretation with post-LLM verification,
         deterministic guardrails, and replay-safe hashing.
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
from agents.claims_agent.rag import get_policy_rag
from agents.claims_agent.clause_verifier import verify_llm_clauses, compute_policy_hash
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
    policy_text: str
    evidence_analysis: List[Dict[str, Any]]
    verification_results: Optional[Dict[str, Any]]
    clause_verification: Optional[Dict[str, Any]]
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

def step_load_policy_text(state: ClaimsState) -> ClaimsState:
    """Load the full policy document text and RAG-retrieved context."""
    print("   → Loading Policy Text...")
    rag = get_policy_rag()
    state["policy_text"] = rag.get_full_policy_text()

    claim = state["claim_data"]
    state["policy_context"] = rag.retrieve_context(
        claim.get("claim_type", ""),
        claim.get("description", "")
    )

    text_len = len(state["policy_text"])
    ctx_len = len(state["policy_context"])
    print(f"     Policy text loaded: {text_len} chars, RAG context: {ctx_len} chars")
    return state


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


def _format_clause_attribution(coverage_data: dict) -> str:
    """Format coverage clause data into a structured string for LLM prompt injection."""
    if not coverage_data:
        return "No coverage data available"

    clause_id = coverage_data.get("clause_id", "POL-0.0-UNKNOWN")
    section_title = coverage_data.get("section_title", "Unknown")
    covered = coverage_data.get("covered", False)
    coverage_limit = coverage_data.get("coverage_limit")
    exclusion_triggered = coverage_data.get("exclusion_triggered", False)
    triggered_codes = coverage_data.get("triggered_exclusion_codes", [])
    exclusions = coverage_data.get("exclusions", [])
    notes = coverage_data.get("notes", "")

    lines = [
        f"Clause ID: {clause_id}",
        f"Section: {section_title}",
        f"Coverage Status: {'COVERED' if covered else 'NOT COVERED'}",
        f"Coverage Limit: ${coverage_limit:,.2f}" if coverage_limit else "Coverage Limit: N/A",
        f"Exclusions: {', '.join(exclusions)}" if exclusions else "Exclusions: None",
        f"Exclusion Triggered: {'YES — ' + ', '.join(triggered_codes) if exclusion_triggered else 'No'}",
        f"Notes: {notes}"
    ]
    return "\n".join(lines)


def step_coverage_check(state: ClaimsState) -> ClaimsState:
    print("   → Coverage Check...")
    claim = state["claim_data"]
    coverage_data, tool_record = coverage_checker(
        claim.get("claim_type", ""),
        state.get("policy_data", {}),
        claim_description=claim.get("description", "")
    )
    state["coverage_data"] = coverage_data
    state["trace"].tool_calls.append(tool_record)
    print(f"     Clause: [{coverage_data.get('clause_id', 'N/A')}] {coverage_data.get('section_title', 'N/A')}")
    if coverage_data.get('exclusion_triggered'):
        print(f"     ⚠️ Exclusion triggered: {coverage_data.get('triggered_exclusion_codes', [])}")
    return state


def step_payout_calculation(state: ClaimsState) -> ClaimsState:
    print("   → Payout Calculation...")
    claim = state["claim_data"]
    payout_data, tool_record = payout_calculator(claim.get("amount", 0), state.get("coverage_data", {}), state.get("policy_data", {}))
    state["payout_data"] = payout_data
    return state


def step_llm_analysis(state: ClaimsState) -> ClaimsState:
    print("   → LLM Analysis (Grounded Clause Interpretation)...")
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
        policy_document_text=state.get("policy_text", "[Policy text unavailable]"),
        policy_context=state.get("policy_context", "[No RAG context]"),
        evidence_analysis=evidence_dump[:1500],
        verification_results=verification_dump,
        policy_lookup_result=json.dumps(state.get("policy_data", {}), indent=2)[:300],
        coverage_check_result=_format_clause_attribution(state.get("coverage_data", {})),
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
            "generated_clauses": [],
            "policy_text_citations": [],
            "evidence_used": [],
            "reasoning_summary": "Failed to parse LLM response"
        }

    state["llm_analysis"] = analysis
    return state


def step_verify_clauses(state: ClaimsState) -> ClaimsState:
    """Phase 3 — Post-LLM verification: check all clause references against policy text."""
    print("   → Clause Verification (Anti-Hallucination)...")
    analysis = state.get("llm_analysis", {})
    policy_text = state.get("policy_text", "")

    if not policy_text:
        print("     ⚠️ No policy text available — skipping verification")
        state["clause_verification"] = {
            "hallucination_detected": False,
            "skipped": True,
            "reason": "No policy text loaded"
        }
        return state

    validated_output, verification_report = verify_llm_clauses(analysis, policy_text)
    state["clause_verification"] = verification_report

    if verification_report["hallucination_detected"]:
        failed_s = len(verification_report["failed_sections"])
        failed_e = len(verification_report["failed_excerpts"])
        print(f"     ❌ HALLUCINATION DETECTED: {failed_s} invalid sections, {failed_e} ungrounded excerpts")
        print(f"     🔄 Re-running LLM with stricter instructions...")

        # Re-run LLM with explicit failure feedback
        claim = state["claim_data"]
        insurance_type = claim.get("insurance_type", "general").lower()

        type_prompts = {
            "health": HEALTH_CLAIM_PROMPT,
            "vehicle": VEHICLE_CLAIM_PROMPT,
            "travel": TRAVEL_CLAIM_PROMPT,
            "property": PROPERTY_CLAIM_PROMPT,
            "life": LIFE_CLAIM_PROMPT
        }

        stricter_system = CLAIMS_SYSTEM_PROMPT + "\n\n" + type_prompts.get(insurance_type, "")
        stricter_system += "\n\nCRITICAL: Your previous output was REJECTED because it contained hallucinated policy references."
        stricter_system += f"\nThe following section numbers are INVALID: {[s['section_number'] for s in verification_report['failed_sections']]}"
        stricter_system += f"\nValid section numbers in this policy are: {verification_report['policy_sections_available']}"
        stricter_system += "\nYou MUST only reference sections from the valid list above."
        stricter_system += "\nCopy clause excerpts VERBATIM from the policy text. Do NOT paraphrase."

        retry_prompt = CLAIM_ANALYSIS_PROMPT.format(
            claim_id=claim.get("id", "N/A"),
            claim_type=claim.get("claim_type", "N/A"),
            insurance_type=insurance_type,
            description=claim.get("description", "N/A"),
            amount=claim.get("amount", 0),
            policy_id=claim.get("policy_id", "N/A"),
            date_of_incident=claim.get("date_of_incident", "N/A"),
            policy_document_text=state.get("policy_text", "[Policy text unavailable]"),
            policy_context=state.get("policy_context", "[No RAG context]"),
            evidence_analysis=json.dumps(state.get("evidence_analysis", []))[:1500],
            verification_results=json.dumps(state.get("verification_results", {}), indent=2),
            policy_lookup_result=json.dumps(state.get("policy_data", {}), indent=2)[:300],
            coverage_check_result=_format_clause_attribution(state.get("coverage_data", {})),
            payout_calculation_result=json.dumps(state.get("payout_data", {}), indent=2)[:300]
        )

        retry_text, retry_record = call_llm(retry_prompt, stricter_system)
        state["trace"].llm_calls.append(retry_record)

        try:
            if "```json" in retry_text:
                json_match = retry_text.split("```json")[1].split("```")[0]
            elif "```" in retry_text:
                json_match = retry_text.split("```")[1].split("```")[0]
            else:
                json_match = retry_text
            retry_analysis = json.loads(json_match.strip())
        except:
            retry_analysis = analysis  # Fall back to original

        # Re-verify the retry
        _, retry_report = verify_llm_clauses(retry_analysis, policy_text)
        if not retry_report["hallucination_detected"]:
            print("     ✅ Retry passed verification")
            state["llm_analysis"] = retry_analysis
            state["clause_verification"] = retry_report
        else:
            print("     ⚠️ Retry still has issues — marking output as unverified")
            state["clause_verification"] = retry_report
            state["clause_verification"]["retry_failed"] = True
    else:
        valid = len(verification_report["valid_section_refs"])
        print(f"     ✅ Verification passed: {valid} valid section references")

    return state


def step_deterministic_guardrails(state: ClaimsState) -> ClaimsState:
    """Phase 4 — Deterministic guardrails that override LLM reasoning."""
    print("   → Deterministic Guardrails...")
    analysis = state.get("llm_analysis", {})
    coverage = state.get("coverage_data", {})

    overridden = False
    override_reasons = []

    # Rule 1: If coverage_checker determined exclusion triggered, decision cannot be approved
    if coverage.get("exclusion_triggered", False):
        triggered = coverage.get("triggered_exclusion_codes", [])
        if analysis.get("decision") == "approved":
            analysis["decision"] = "rejected"
            override_reasons.append(
                f"Deterministic override: exclusion codes {triggered} triggered — cannot approve"
            )
            overridden = True
            print(f"     ⚠️ OVERRIDE: approved → rejected (exclusion codes: {triggered})")

    # Rule 2: If LLM generated clauses with impact=exclusion, decision cannot be approved
    for clause in analysis.get("generated_clauses", []):
        if clause.get("impact") == "exclusion" and analysis.get("decision") == "approved":
            analysis["decision"] = "rejected"
            sec = clause.get("section_number", "unknown")
            override_reasons.append(
                f"Deterministic override: LLM cited exclusion clause POLICY_SECTION_{sec}"
            )
            overridden = True
            print(f"     ⚠️ OVERRIDE: approved → rejected (exclusion clause: {sec})")
            break

    # Rule 3: If not covered at all by policy, cannot approve
    if not coverage.get("covered", False) and analysis.get("decision") == "approved":
        analysis["decision"] = "rejected"
        override_reasons.append("Deterministic override: claim type not covered by policy")
        overridden = True
        print("     ⚠️ OVERRIDE: approved → rejected (not covered)")

    if not overridden:
        print("     ✅ No deterministic overrides needed")

    analysis["deterministic_overrides"] = override_reasons
    state["llm_analysis"] = analysis
    return state


def compute_confidence(coverage_result: dict, evidence_analysis: list, fraud_flags: list) -> float:
    """Deterministic confidence decomposition — replaces LLM-generated confidence.
    
    Formula: 0.4 * coverage_score + 0.4 * evidence_score - fraud_penalty
    - coverage_score: 1.0 if matched, 0.0 otherwise
    - evidence_score: average completeness across evidence files (default 0.5)
    - fraud_penalty: 0.2 if any fraud flags present
    """
    coverage_score = 1.0 if coverage_result.get("matched", False) else 0.0

    # Compute evidence completeness from evidence analysis results
    if evidence_analysis:
        scores = [e.get("completeness_score", 0.5) for e in evidence_analysis]
        evidence_score = sum(scores) / len(scores)
    else:
        evidence_score = 0.5

    fraud_penalty = 0.2 if fraud_flags else 0.0

    return round(
        0.4 * coverage_score +
        0.4 * evidence_score -
        fraud_penalty,
        3
    )


def step_finalize(state: ClaimsState) -> ClaimsState:
    print("   → Finalizing...")
    analysis = state.get("llm_analysis", {})
    claim = state["claim_data"]

    # Deterministic confidence (replaces LLM confidence)
    coverage = state.get("coverage_data", {})
    evidence = state.get("evidence_analysis", [])
    fraud_flags = analysis.get("risk_flags", []) + analysis.get("deterministic_overrides", [])
    confidence = compute_confidence(coverage, evidence, fraud_flags)
    print(f"     Deterministic confidence: {confidence}")
    
    decision = DecisionRecord(
        decision_type=analysis.get("decision", "escalated"),
        confidence=confidence,
        reasoning=analysis.get("reasoning_summary", analysis.get("reasoning", "")),
        escalated_to_human=analysis.get("decision") == "escalated",
        human_override=None,
        human_decision=None
    )

    trace = state["trace"]
    trace.decision = decision
    trace.status = "success"
    trace.input_data = claim
    
    # Build clause attribution from coverage data
    coverage = state.get("coverage_data", {})
    clause_attribution = {
        "clause_id": coverage.get("clause_id", "POL-0.0-UNKNOWN"),
        "section_title": coverage.get("section_title", "Unknown"),
        "matched": coverage.get("matched", False),
        "exclusion_triggered": coverage.get("exclusion_triggered", False),
        "triggered_exclusion_codes": coverage.get("triggered_exclusion_codes", []),
        "coverage_limit": coverage.get("coverage_limit"),
        "covered": coverage.get("covered", False)
    }

    # Phase 5 — Replay safety: compute hashes
    policy_text = state.get("policy_text", "")
    policy_context = state.get("policy_context", "")
    policy_hash = compute_policy_hash(policy_text) if policy_text else "N/A"
    context_hash = compute_policy_hash(policy_context) if policy_context else "N/A"

    # Collect section numbers from LLM output
    llm_generated_sections = [
        f"POLICY_SECTION_{c.get('section_number', '?')}"
        for c in analysis.get("generated_clauses", [])
    ]

    clause_verification = state.get("clause_verification", {})
    validation_passed = not clause_verification.get("hallucination_detected", True)

    trace.output_data = {
        "decision": decision.decision_type,
        "confidence": decision.confidence,
        "reasoning": decision.reasoning,
        "clause_attribution": clause_attribution,
        "generated_clauses": analysis.get("generated_clauses", []),
        "policy_text_citations": analysis.get("policy_text_citations", []),
        "deterministic_overrides": analysis.get("deterministic_overrides", []),
        "verification": state.get("verification_results", {}),
        "evidence_analysis_summary": f"Analyzed {len(state.get('evidence_analysis', []))} files",
        # Phase 5 — Replay safety fields
        "policy_text_hash": policy_hash,
        "retrieved_context_hash": context_hash,
        "llm_generated_sections": llm_generated_sections,
        "validation_passed": validation_passed
    }

    state["decision"] = decision.model_dump()
    return state


# ─── Main Runner ─────────────────────────────────────

def run_claims_agent(claim_data: dict, send_telemetry: bool = True) -> dict:
    print(f"\n🔍 Claims Agent v3 (Grounded Clause Interpretation) — Processing {claim_data.get('id', 'N/A')}")
    
    trace = TraceRecord(agent_type="claims")
    state: ClaimsState = {
        "claim_data": claim_data,
        "trace": trace,
        "evidence_analysis": [],
        "policy_context": "",
        "policy_text": "",
    }

    # Workflow — updated pipeline with verification and guardrails
    try:
        state = step_load_policy_text(state)
        state = step_evidence_analysis(state)
        state = step_type_verification(state)
        state = step_policy_lookup(state)
        state = step_coverage_check(state)
        state = step_payout_calculation(state)
        state = step_llm_analysis(state)
        state = step_verify_clauses(state)
        state = step_deterministic_guardrails(state)
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
        "clause_verification": state.get("clause_verification"),
        "evidence_analysis": state.get("evidence_analysis")
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--payload", help="JSON string of claim data")
    args = parser.parse_args()

    if args.payload:
        try:
            claim_data = json.loads(args.payload)
            result = run_claims_agent(claim_data, send_telemetry=True)
            
            # Output ONLY valid JSON on the last line for Node.js to parse
            print("__JSON_START__")
            print(json.dumps(result))
            print("__JSON_END__")
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print("Usage: python -m agents.claims_agent.agent --payload <json>")
