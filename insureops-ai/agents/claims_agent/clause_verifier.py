"""
Claims Processing Agent — Post-LLM Clause Verification Layer (Phase 3)
Verifies that LLM-generated clause references are grounded in actual policy text.
Detects hallucination and enforces audit-grade reproducibility.

Updated for generated_policy_clauses schema.
"""

import hashlib
import re
from typing import Any


def compute_policy_hash(policy_text: str) -> str:
    """Compute SHA256 hash of the policy text for replay safety."""
    return hashlib.sha256(policy_text.encode("utf-8")).hexdigest()


def _extract_section_numbers_from_policy(policy_text: str) -> set[str]:
    """Extract all section numbers that appear in the policy document.
    Matches patterns like '1.1', '2.3', '3.1', '5.4' etc."""
    # Match section headers like "2.3 WATER DAMAGE" or "1.1 DWELLING COVERAGE"
    pattern = r'(?:^|\n)\s*(\d+\.\d+)\s+[A-Z]'
    matches = re.findall(pattern, policy_text)
    return set(matches)


def verify_llm_clauses(llm_output: dict, policy_text: str) -> tuple[dict, dict]:
    """
    Verify that all section references and clause text in the LLM output
    are grounded in the actual policy document text.

    Supports both new format (generated_policy_clauses) and legacy format
    (generated_clauses / policy_text_citations).

    Args:
        llm_output: Parsed JSON from LLM response
        policy_text: The full policy document text

    Returns:
        (validated_output, verification_report)
    """
    valid_sections = _extract_section_numbers_from_policy(policy_text)

    failed_sections = []
    failed_excerpts = []
    valid_section_refs = []
    valid_excerpt_refs = []

    # ─── Verify generated_policy_clauses (new format) ────────────────
    policy_clauses = llm_output.get("generated_policy_clauses", [])
    for i, clause in enumerate(policy_clauses):
        section_num = clause.get("section_number", "")

        # Verify section_number exists in policy
        if section_num not in valid_sections:
            failed_sections.append({
                "index": i,
                "section_number": section_num,
                "reason": f"Section '{section_num}' not found in policy document"
            })
        else:
            valid_section_refs.append(section_num)

        # Verify clause_text appears in policy text (substring match)
        clause_text = clause.get("clause_text", "")
        if clause_text and len(clause_text) > 20:
            # Check if a meaningful substring (first 60 chars) appears in policy
            check_substr = clause_text[:60].strip()
            if check_substr not in policy_text:
                failed_excerpts.append({
                    "index": i,
                    "section_number": section_num,
                    "excerpt_preview": clause_text[:100],
                    "reason": "Clause text not found as substring in policy document"
                })
            else:
                valid_excerpt_refs.append(section_num)

    # ─── Legacy: Verify generated_clauses (backward compat) ─────────
    generated_clauses = llm_output.get("generated_clauses", [])
    for i, clause in enumerate(generated_clauses):
        section_num = clause.get("section_number", "")

        if section_num not in valid_sections:
            failed_sections.append({
                "index": i,
                "section_number": section_num,
                "reason": f"Section '{section_num}' not found in policy document"
            })
        else:
            valid_section_refs.append(section_num)

        excerpt = clause.get("clause_excerpt", "")
        if excerpt and excerpt not in policy_text:
            failed_excerpts.append({
                "index": i,
                "section_number": section_num,
                "excerpt_preview": excerpt[:100],
                "reason": "Clause excerpt not found as substring in policy document"
            })
        elif excerpt:
            valid_excerpt_refs.append(section_num)

    # ─── Legacy: Verify policy_text_citations ────────────────────────
    citations = llm_output.get("policy_text_citations", [])
    for i, citation in enumerate(citations):
        section_num = citation.get("section_number", "")
        if section_num not in valid_sections:
            failed_sections.append({
                "index": f"citation_{i}",
                "section_number": section_num,
                "reason": f"Citation section '{section_num}' not found in policy document"
            })
        else:
            valid_section_refs.append(section_num)

        quoted = citation.get("quoted_text", "")
        if quoted and quoted not in policy_text:
            failed_excerpts.append({
                "index": f"citation_{i}",
                "section_number": section_num,
                "excerpt_preview": quoted[:100],
                "reason": "Quoted text not found as substring in policy document"
            })
        elif quoted:
            valid_excerpt_refs.append(section_num)

    # ─── Validate clause_type and impact_on_claim values ─────────────
    valid_clause_types = {"coverage", "exclusion", "condition"}
    valid_impacts = {"supports", "exclusion", "conditional"}
    for i, clause in enumerate(policy_clauses):
        ctype = clause.get("clause_type", "")
        if ctype and ctype not in valid_clause_types:
            failed_sections.append({
                "index": i,
                "section_number": clause.get("section_number", ""),
                "reason": f"Invalid clause_type '{ctype}' — must be coverage|exclusion|condition"
            })
        impact = clause.get("impact_on_claim", "")
        if impact and impact not in valid_impacts:
            failed_sections.append({
                "index": i,
                "section_number": clause.get("section_number", ""),
                "reason": f"Invalid impact_on_claim '{impact}' — must be supports|exclusion|conditional"
            })

    hallucination_detected = len(failed_sections) > 0 or len(failed_excerpts) > 0

    verification_report = {
        "hallucination_detected": hallucination_detected,
        "failed_sections": failed_sections,
        "failed_excerpts": failed_excerpts,
        "valid_section_refs": list(set(valid_section_refs)),
        "valid_excerpt_refs": list(set(valid_excerpt_refs)),
        "total_clauses_checked": len(policy_clauses) + len(generated_clauses),
        "total_citations_checked": len(citations),
        "policy_sections_available": sorted(valid_sections)
    }

    return llm_output, verification_report
