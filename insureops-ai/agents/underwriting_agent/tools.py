"""
Underwriting Risk Agent — Tools
Deterministic tools: risk_score_calculator, medical_risk_lookup, historical_data_check.
"""

from agents.base_agent import load_json_data, ToolCallRecord, Timer


def _get_age_bracket(age: int) -> str:
    """Map age to the correct bracket string."""
    if age < 26:
        return "18-25"
    elif age < 36:
        return "26-35"
    elif age < 46:
        return "36-45"
    elif age < 56:
        return "46-55"
    elif age < 66:
        return "56-65"
    else:
        return "66+"


def _get_bmi_category(bmi: float) -> tuple[str, float]:
    """Get BMI category and multiplier."""
    guidelines = load_json_data("underwriting_guidelines.json")
    thresholds = guidelines["risk_factors"]["bmi_thresholds"]

    for category, info in thresholds.items():
        low, high = info["range"]
        if low <= bmi < high:
            return category, info["multiplier"]

    return "normal", 1.0


def risk_score_calculator(applicant: dict) -> tuple[dict, ToolCallRecord]:
    """
    Calculate a comprehensive risk score for an applicant
    using the underwriting guidelines (age, health, occupation, BMI, smoker).
    """
    with Timer() as timer:
        guidelines = load_json_data("underwriting_guidelines.json")
        risk_factors = guidelines["risk_factors"]

        age = applicant.get("age", 30)
        health_conditions = applicant.get("health_conditions", [])
        occupation_risk_class = applicant.get("occupation_risk_class", "low")
        smoker = applicant.get("smoker", False)
        bmi = applicant.get("bmi", 25.0)
        coverage_amount = applicant.get("coverage_amount", 0)

        # Base risk from age
        age_bracket = _get_age_bracket(age)
        age_info = risk_factors["age_brackets"].get(age_bracket, {"base_risk": 0.20})
        base_risk = age_info["base_risk"]

        # Medical condition risk
        medical_multiplier = 1.0
        condition_details = []
        for condition in health_conditions:
            if condition in risk_factors["medical_conditions"]:
                cond = risk_factors["medical_conditions"][condition]
                medical_multiplier *= cond["risk_multiplier"]
                condition_details.append({
                    "condition": cond["description"],
                    "severity": cond["severity"],
                    "multiplier": cond["risk_multiplier"]
                })

        # Occupation risk
        occ_class = risk_factors["occupation_risk_classes"].get(occupation_risk_class, {"risk_multiplier": 1.0})
        occupation_multiplier = occ_class["risk_multiplier"]

        # Smoker
        smoker_multiplier = risk_factors["smoker_multiplier"] if smoker else 1.0

        # BMI
        bmi_category, bmi_multiplier = _get_bmi_category(bmi)

        # Calculate composite score (capped at 1.0)
        composite_risk = base_risk * medical_multiplier * occupation_multiplier * smoker_multiplier * bmi_multiplier
        risk_score = min(composite_risk, 1.0)

        # High coverage increases risk assessment
        high_value = guidelines["coverage_limits"]["high_value_threshold"]
        if coverage_amount > high_value:
            risk_score = min(risk_score * 1.15, 1.0)

        # Decision thresholds
        thresholds = guidelines["decision_thresholds"]
        if risk_score <= thresholds["auto_approve_max_risk"]:
            recommendation = "auto_approve"
        elif risk_score >= thresholds["auto_reject_min_risk"]:
            recommendation = "auto_reject"
        else:
            recommendation = "manual_review"

        result = {
            "risk_score": round(risk_score, 4),
            "recommendation": recommendation,
            "breakdown": {
                "age_bracket": age_bracket,
                "base_risk": base_risk,
                "medical_multiplier": round(medical_multiplier, 2),
                "occupation_multiplier": occupation_multiplier,
                "smoker_multiplier": smoker_multiplier,
                "bmi_category": bmi_category,
                "bmi_multiplier": bmi_multiplier,
                "conditions": condition_details,
                "high_value_adjustment": coverage_amount > high_value
            }
        }

    record = ToolCallRecord(
        tool_name="risk_score_calculator",
        parameters={"applicant_id": applicant.get("id", "N/A")},
        result_summary=f"Risk Score: {risk_score:.2%} — {recommendation}",
        duration_ms=timer.elapsed_ms,
        success=True
    )

    return result, record


def medical_risk_lookup(health_conditions: list, age: int) -> tuple[dict, ToolCallRecord]:
    """
    Look up detailed medical risk information for the given conditions.
    Provides age-adjusted risk notes and recommendations.
    """
    with Timer() as timer:
        guidelines = load_json_data("underwriting_guidelines.json")
        conditions_db = guidelines["risk_factors"]["medical_conditions"]

        results = []
        total_severity_score = 0

        for condition in health_conditions:
            if condition in conditions_db:
                cond = conditions_db[condition]
                severity_scores = {"minimal": 1, "low": 2, "medium": 3, "high": 4, "very_high": 5}
                sev_score = severity_scores.get(cond["severity"], 2)

                # Age adjustment — older applicants with conditions get higher risk
                if age > 50:
                    sev_score += 1
                if age > 60:
                    sev_score += 1

                total_severity_score += sev_score

                results.append({
                    "condition": cond["description"],
                    "severity": cond["severity"],
                    "risk_multiplier": cond["risk_multiplier"],
                    "age_adjusted_severity": min(sev_score, 7),
                    "notes": f"{'Elevated concern' if sev_score >= 4 else 'Manageable'} for age {age}"
                })

        overall = "low" if total_severity_score <= 3 else "moderate" if total_severity_score <= 6 else "high" if total_severity_score <= 9 else "very_high"

        result = {
            "conditions_analyzed": len(results),
            "details": results,
            "overall_medical_risk": overall,
            "total_severity_score": total_severity_score,
            "requires_medical_exam": total_severity_score >= 6
        }

    record = ToolCallRecord(
        tool_name="medical_risk_lookup",
        parameters={"conditions_count": len(health_conditions), "age": age},
        result_summary=f"Medical risk: {overall} ({len(results)} conditions, severity {total_severity_score})",
        duration_ms=timer.elapsed_ms,
        success=True
    )

    return result, record


def historical_data_check(applicant: dict) -> tuple[dict, ToolCallRecord]:
    """
    Check historical claim rates for the applicant's demographic.
    Simulates actuarial database lookup.
    """
    with Timer() as timer:
        guidelines = load_json_data("underwriting_guidelines.json")
        historical_rates = guidelines["historical_claim_rates"]

        age = applicant.get("age", 30)
        age_bracket = _get_age_bracket(age)
        occupation = applicant.get("occupation", "default")

        # Look up matching historical rate
        lookup_key = f"{occupation}_{age_bracket}"
        claim_rate = historical_rates.get(lookup_key, historical_rates.get("default", 0.15))

        # Risk assessment based on claim rate
        if claim_rate < 0.12:
            historical_risk = "low"
        elif claim_rate < 0.20:
            historical_risk = "moderate"
        elif claim_rate < 0.30:
            historical_risk = "high"
        else:
            historical_risk = "very_high"

        result = {
            "demographic_claim_rate": claim_rate,
            "historical_risk": historical_risk,
            "lookup_key": lookup_key,
            "benchmark_rate": 0.15,
            "above_benchmark": claim_rate > 0.15,
            "recommendation": "standard_terms" if claim_rate <= 0.20 else "adjusted_terms"
        }

    record = ToolCallRecord(
        tool_name="historical_data_check",
        parameters={"occupation": occupation, "age_bracket": age_bracket},
        result_summary=f"Historical claim rate: {claim_rate:.0%} ({historical_risk} risk)",
        duration_ms=timer.elapsed_ms,
        success=True
    )

    return result, record
