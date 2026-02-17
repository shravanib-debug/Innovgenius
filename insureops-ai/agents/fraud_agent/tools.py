"""
Fraud Detection Agent — Tools
Deterministic tools: duplicate_checker, pattern_analyzer, claimant_history_lookup.
"""

import random
from agents.base_agent import load_json_data, ToolCallRecord, Timer


def duplicate_checker(claim_data: dict) -> tuple[dict, ToolCallRecord]:
    """
    Check for duplicate or very similar claims in the system.
    Simulates a cross-reference against existing claims database.
    """
    with Timer() as timer:
        claims_db = load_json_data("sample_claims.json")
        current_id = claim_data.get("id", "")
        current_type = claim_data.get("claim_type", "")
        current_claimant = claim_data.get("claimant_id", "")
        current_amount = claim_data.get("amount", 0)

        similar_claims = []
        exact_duplicates = []

        for claim in claims_db:
            if claim["id"] == current_id:
                continue  # Skip self

            # Check for same claimant
            if claim.get("claimant_id") == current_claimant:
                similar_claims.append({
                    "claim_id": claim["id"],
                    "match_type": "same_claimant",
                    "claim_type": claim["claim_type"],
                    "amount": claim["amount"],
                    "similarity_score": 0.8
                })

            # Check for very similar descriptions and amounts
            if (claim.get("claim_type") == current_type and
                abs(claim.get("amount", 0) - current_amount) < current_amount * 0.15):
                similar_claims.append({
                    "claim_id": claim["id"],
                    "match_type": "similar_amount_and_type",
                    "claim_type": claim["claim_type"],
                    "amount": claim["amount"],
                    "similarity_score": 0.6
                })

        # Deduplicate
        seen = set()
        unique_similar = []
        for c in similar_claims:
            if c["claim_id"] not in seen:
                seen.add(c["claim_id"])
                unique_similar.append(c)

        result = {
            "exact_duplicates_found": len(exact_duplicates),
            "similar_claims_found": len(unique_similar),
            "similar_claims": unique_similar[:5],
            "risk_level": "high" if len(unique_similar) > 2 else "medium" if len(unique_similar) > 0 else "low",
            "recommendation": "investigate" if len(unique_similar) > 2 else "monitor" if len(unique_similar) > 0 else "clear"
        }

    record = ToolCallRecord(
        tool_name="duplicate_checker",
        parameters={"claim_id": current_id},
        result_summary=f"Found {len(unique_similar)} similar claims. Risk: {result['risk_level']}",
        duration_ms=timer.elapsed_ms,
        success=True
    )
    return result, record


def pattern_analyzer(claim_data: dict) -> tuple[dict, ToolCallRecord]:
    """
    Analyze the claim for known fraud patterns and anomalies.
    Checks timing, amount, description, and circumstance indicators.
    """
    with Timer() as timer:
        flags = []
        severity_score = 0

        claim_type = claim_data.get("claim_type", "")
        amount = claim_data.get("amount", 0)
        description = claim_data.get("description", "").lower()
        fraud_flag = claim_data.get("fraud_indicators", False)

        # Pre-flagged
        if fraud_flag:
            flags.append({
                "pattern": "pre_flagged",
                "description": "Claim was pre-flagged with fraud indicators",
                "severity": 5
            })
            severity_score += 5

        # High-value claim
        if amount > 25000:
            flags.append({
                "pattern": "high_value_claim",
                "description": f"Claim amount (${amount:,.2f}) exceeds high-value threshold ($25,000)",
                "severity": 3
            })
            severity_score += 3

        # Suspicious keywords in description
        suspicious_keywords = [
            ("no witnesses", 3), ("alarm was not set", 3), ("alarm was deactivated", 4),
            ("no signs of forced entry", 3), ("multiple locations", 4),
            ("security camera", 2), ("fourth", 5), ("vacant", 3),
            ("recently purchased", 3), ("45 days", 4), ("no occupants", 3)
        ]

        for keyword, severity in suspicious_keywords:
            if keyword in description:
                flags.append({
                    "pattern": f"suspicious_keyword: {keyword}",
                    "description": f"Description contains suspicious phrase: '{keyword}'",
                    "severity": severity
                })
                severity_score += severity

        # Claim type specific patterns
        if claim_type == "theft" and "jewelry" in description:
            flags.append({
                "pattern": "high_value_portable_items",
                "description": "Theft claim for high-value portable items (jewelry) — difficult to verify",
                "severity": 2
            })
            severity_score += 2

        if claim_type == "fire_damage" and ("multiple" in description or "simultaneous" in description):
            flags.append({
                "pattern": "multiple_fire_origin",
                "description": "Fire with multiple origin points — common arson indicator",
                "severity": 5
            })
            severity_score += 5

        # Determine overall risk
        if severity_score >= 10:
            fraud_risk = "critical"
        elif severity_score >= 6:
            fraud_risk = "high"
        elif severity_score >= 3:
            fraud_risk = "medium"
        else:
            fraud_risk = "low"

        result = {
            "flags_found": len(flags),
            "flags": flags,
            "severity_score": severity_score,
            "fraud_risk": fraud_risk,
            "fraud_probability": min(severity_score / 15, 1.0),
            "recommendation": "investigate" if severity_score >= 8 else "flag" if severity_score >= 4 else "clear"
        }

    record = ToolCallRecord(
        tool_name="pattern_analyzer",
        parameters={"claim_id": claim_data.get("id", "N/A")},
        result_summary=f"{len(flags)} flags found, severity {severity_score}, risk: {fraud_risk}",
        duration_ms=timer.elapsed_ms,
        success=True
    )
    return result, record


def claimant_history_lookup(claimant_id: str) -> tuple[dict, ToolCallRecord]:
    """
    Look up the claimant's history across all claims in the system.
    Checks claim frequency, total amounts, and patterns.
    """
    with Timer() as timer:
        claims_db = load_json_data("sample_claims.json")

        claimant_claims = [c for c in claims_db if c.get("claimant_id") == claimant_id]

        total_claims = len(claimant_claims)
        total_amount = sum(c.get("amount", 0) for c in claimant_claims)
        claim_types = list(set(c.get("claim_type", "") for c in claimant_claims))
        fraud_flagged = sum(1 for c in claimant_claims if c.get("fraud_indicators"))

        # Risk assessment
        if total_claims >= 4:
            frequency_risk = "critical"
        elif total_claims >= 3:
            frequency_risk = "high"
        elif total_claims >= 2:
            frequency_risk = "medium"
        else:
            frequency_risk = "low"

        result = {
            "claimant_id": claimant_id,
            "total_claims": total_claims,
            "total_amount_claimed": total_amount,
            "claim_types": claim_types,
            "previous_fraud_flags": fraud_flagged,
            "frequency_risk": frequency_risk,
            "claims_summary": [
                {"id": c["id"], "type": c["claim_type"], "amount": c["amount"]}
                for c in claimant_claims[:5]
            ],
            "recommendation": "investigate" if fraud_flagged > 0 or total_claims > 2 else "standard_review"
        }

    record = ToolCallRecord(
        tool_name="claimant_history_lookup",
        parameters={"claimant_id": claimant_id},
        result_summary=f"Claimant {claimant_id}: {total_claims} claims, ${total_amount:,.0f} total, freq risk: {frequency_risk}",
        duration_ms=timer.elapsed_ms,
        success=True
    )
    return result, record
