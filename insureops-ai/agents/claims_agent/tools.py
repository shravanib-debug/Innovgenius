"""
Claims Processing Agent — Tools
Deterministic tool functions: policy_lookup, coverage_checker, payout_calculator.
These simulate real insurance backend systems.
"""

import json
from agents.base_agent import load_json_data, ToolCallRecord, Timer


def policy_lookup(policy_id: str) -> tuple[dict, ToolCallRecord]:
    """
    Look up a policy by ID and return coverage details.
    Simulates a policy database lookup.
    """
    with Timer() as timer:
        # Simulate policy database — maps policy IDs to coverage details
        policies = {
            f"POL-{1000 + i}": {
                "policy_id": f"POL-{1000 + i}",
                "holder_name": f"Customer {1000 + i}",
                "status": "active",
                "effective_date": "2025-06-01",
                "expiry_date": "2026-06-01",
                "dwelling_coverage": 300000 + (i * 25000),
                "personal_property_coverage": 150000 + (i * 12500),
                "liability_coverage": 100000,
                "medical_coverage": 5000,
                "deductible_standard": 500,
                "deductible_wind_hail": 1000,
                "premium_monthly": 120 + (i * 15),
                "claims_history": max(0, i % 3),
                "payment_status": "current"
            }
            for i in range(1, 21)
        }

        result = policies.get(policy_id)
        if result is None:
            result = {"error": f"Policy {policy_id} not found", "status": "not_found"}

    record = ToolCallRecord(
        tool_name="policy_lookup",
        parameters={"policy_id": policy_id},
        result_summary=f"Policy {policy_id}: {'Active' if result.get('status') == 'active' else 'Not Found'}",
        duration_ms=timer.elapsed_ms,
        success=result.get("status") != "not_found"
    )

    return result, record


def coverage_checker(claim_type: str, policy_data: dict) -> tuple[dict, ToolCallRecord]:
    """
    Check if a specific claim type is covered under the given policy.
    Returns coverage status, applicable limits, and exclusions.
    """
    with Timer() as timer:
        # Coverage mapping — which claim types are covered
        coverage_rules = {
            "water_damage": {
                "covered": True,
                "coverage_section": "Section 2.3 — Water Damage (Limited)",
                "notes": "Burst pipes and plumbing failures are covered. Flood damage excluded.",
                "exclusions": ["flood", "gradual_seepage", "ground_water"],
                "applicable_limit": "dwelling_coverage",
                "deductible": "standard"
            },
            "fire_damage": {
                "covered": True,
                "coverage_section": "Section 2.1 — Fire and Lightning",
                "notes": "All fire damage covered including smoke damage and firefighting water damage.",
                "exclusions": ["intentional_arson_by_policyholder"],
                "applicable_limit": "dwelling_coverage",
                "deductible": "standard"
            },
            "flood_damage": {
                "covered": False,
                "coverage_section": "Section 3.1 — Excluded",
                "notes": "Flood damage requires separate NFIP or private flood insurance policy.",
                "exclusions": ["all_flood_types"],
                "applicable_limit": None,
                "deductible": None
            },
            "theft": {
                "covered": True,
                "coverage_section": "Section 2.4 — Theft and Vandalism",
                "notes": "Theft covered. Police report required within 48 hours. Sub-limits apply to jewelry and electronics.",
                "exclusions": ["mysterious_disappearance"],
                "applicable_limit": "personal_property_coverage",
                "deductible": "standard"
            },
            "auto_collision": {
                "covered": True,
                "coverage_section": "Section 5.4 — Auto Insurance Coverage",
                "notes": "Collision coverage for damage to insured vehicle in an accident.",
                "exclusions": ["intentional_damage"],
                "applicable_limit": "auto_collision_limit",
                "deductible": "collision"
            },
            "auto_glass": {
                "covered": True,
                "coverage_section": "Section 5.4 — Glass Coverage",
                "notes": "Full windshield replacement covered with $0 deductible.",
                "exclusions": [],
                "applicable_limit": "auto_glass_limit",
                "deductible": "none"
            },
            "medical": {
                "covered": True,
                "coverage_section": "Section 1.6 — Medical Payments Coverage (F)",
                "notes": "Medical expenses covered regardless of fault. Limit $5,000 per person.",
                "exclusions": [],
                "applicable_limit": "medical_coverage",
                "deductible": "none"
            },
            "liability": {
                "covered": True,
                "coverage_section": "Section 1.5 — Personal Liability Coverage (E)",
                "notes": "Protects against lawsuits for bodily injury or property damage.",
                "exclusions": ["intentional_acts"],
                "applicable_limit": "liability_coverage",
                "deductible": "none"
            },
            "windstorm": {
                "covered": True,
                "coverage_section": "Section 2.2 — Windstorm and Hail",
                "notes": "Damage from severe wind events covered. Separate deductible applies.",
                "exclusions": [],
                "applicable_limit": "dwelling_coverage",
                "deductible": "wind_hail"
            },
            "structural": {
                "covered": False,
                "coverage_section": "Section 3.3 — Neglect and Maintenance Exclusion",
                "notes": "Foundation settling and structural issues due to maintenance are typically excluded.",
                "exclusions": ["wear_and_tear", "settling", "maintenance"],
                "applicable_limit": None,
                "deductible": None
            }
        }

        rule = coverage_rules.get(claim_type, {
            "covered": False,
            "coverage_section": "Unknown",
            "notes": f"Claim type '{claim_type}' not recognized in policy coverage.",
            "exclusions": [],
            "applicable_limit": None,
            "deductible": None
        })

        # Add applicable limit value from policy data
        if rule["applicable_limit"] and policy_data:
            limit_key = rule["applicable_limit"]
            rule["limit_amount"] = policy_data.get(limit_key, "N/A")

    record = ToolCallRecord(
        tool_name="coverage_checker",
        parameters={"claim_type": claim_type},
        result_summary=f"{claim_type}: {'Covered' if rule['covered'] else 'Not Covered'} — {rule['coverage_section']}",
        duration_ms=timer.elapsed_ms,
        success=True
    )

    return rule, record


def payout_calculator(
    claim_amount: float,
    coverage_data: dict,
    policy_data: dict
) -> tuple[dict, ToolCallRecord]:
    """
    Calculate the payout amount based on claim, coverage, and policy details.
    Applies deductibles, limits, and depreciation.
    """
    with Timer() as timer:
        if not coverage_data.get("covered"):
            result = {
                "payout": 0,
                "reason": "Claim type is not covered under this policy",
                "breakdown": {}
            }
        else:
            # Determine deductible
            deductible_type = coverage_data.get("deductible", "standard")
            deductible_amounts = {
                "standard": policy_data.get("deductible_standard", 500),
                "wind_hail": policy_data.get("deductible_wind_hail", 1000),
                "collision": 500,
                "none": 0
            }
            deductible = deductible_amounts.get(deductible_type, 500)

            # Get coverage limit
            limit_amount = coverage_data.get("limit_amount", float('inf'))
            if limit_amount == "N/A":
                limit_amount = float('inf')

            # Calculate ACV (Actual Cash Value) — apply 15% depreciation
            depreciation_rate = 0.15
            acv = claim_amount * (1 - depreciation_rate)

            # Apply deductible
            after_deductible = max(0, acv - deductible)

            # Apply coverage limit
            final_payout = min(after_deductible, limit_amount)

            # RCV holdback (depreciation) — paid after proof of repair
            rcv_holdback = claim_amount * depreciation_rate

            result = {
                "payout": round(final_payout, 2),
                "breakdown": {
                    "claimed_amount": claim_amount,
                    "depreciation_applied": round(claim_amount * depreciation_rate, 2),
                    "acv_after_depreciation": round(acv, 2),
                    "deductible": deductible,
                    "after_deductible": round(after_deductible, 2),
                    "coverage_limit": limit_amount,
                    "rcv_holdback": round(rcv_holdback, 2)
                },
                "reason": f"Payout calculated: ${final_payout:,.2f} (ACV minus ${deductible} deductible)",
                "requires_inspection": claim_amount > 10000,
                "requires_supervisor": claim_amount > 25000
            }

    record = ToolCallRecord(
        tool_name="payout_calculator",
        parameters={"claim_amount": claim_amount},
        result_summary=f"Payout: ${result['payout']:,.2f}" if result["payout"] > 0 else "Payout: $0 (not covered)",
        duration_ms=timer.elapsed_ms,
        success=True
    )

    return result, record
