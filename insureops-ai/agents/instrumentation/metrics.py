"""
InsureOps AI — Client-Side Metrics Calculator
Computes aggregated metrics from trace data. Complements the backend
analytics.js with Python-side computation for agent-local analysis.
"""

import math
from collections import Counter, defaultdict
from typing import Optional

from agents.instrumentation.schemas import (
    TraceRecord, Section1Metrics, Section2Metrics,
    LatencyMetrics, CostMetrics
)


def _percentile(values: list[float], pct: float) -> float:
    """Calculate the given percentile from a sorted list of values."""
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    k = (len(sorted_vals) - 1) * (pct / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_vals[int(k)]
    return sorted_vals[f] * (c - k) + sorted_vals[c] * (k - f)


def compute_section1_metrics(traces: list[TraceRecord]) -> Section1Metrics:
    """
    Compute AI Application Monitoring metrics (PRD §4.3) from a list of traces.

    Metrics computed:
    - Prompt quality average and trend
    - Response accuracy (based on decision confidence)
    - Latency percentiles (P50, P95, P99)
    - API success/failure rate
    - Cost breakdown by agent
    - Drift score (placeholder — requires baseline comparison)

    Args:
        traces: List of TraceRecord objects to analyze

    Returns:
        Section1Metrics with all computed values
    """
    if not traces:
        return Section1Metrics()

    # ── Prompt Quality ──
    all_qualities = []
    for trace in traces:
        for llm_call in trace.llm_calls:
            all_qualities.append(llm_call.prompt_quality)

    prompt_quality_avg = sum(all_qualities) / len(all_qualities) if all_qualities else 0.0

    # Trend: compute per-trace average quality (ordered by timestamp)
    quality_trend = []
    for trace in sorted(traces, key=lambda t: t.timestamp):
        if trace.llm_calls:
            avg_q = sum(c.prompt_quality for c in trace.llm_calls) / len(trace.llm_calls)
            quality_trend.append(round(avg_q, 3))

    # ── Response Accuracy ──
    # Use confidence as a proxy for accuracy (traces with high confidence = likely accurate)
    confidences = [
        trace.decision.confidence
        for trace in traces
        if trace.decision and trace.decision.confidence > 0
    ]
    response_accuracy = sum(confidences) / len(confidences) if confidences else 0.0

    # Per-agent accuracy
    agent_confidences = defaultdict(list)
    for trace in traces:
        if trace.decision and trace.decision.confidence > 0:
            agent_confidences[trace.agent_type].append(trace.decision.confidence)

    accuracy_by_agent = {
        agent: round(sum(vals) / len(vals), 4)
        for agent, vals in agent_confidences.items()
    }

    # ── Latency ──
    latencies = [trace.total_latency_ms for trace in traces if trace.total_latency_ms > 0]
    latency_metrics = LatencyMetrics(
        p50=_percentile(latencies, 50),
        p95=_percentile(latencies, 95),
        p99=_percentile(latencies, 99),
        mean=sum(latencies) / len(latencies) if latencies else 0.0
    )

    # ── API Success/Failure ──
    total = len(traces)
    success_count = sum(1 for t in traces if t.status == "success")
    error_count = total - success_count
    api_success_rate = success_count / total if total > 0 else 0.0

    # Error breakdown
    error_breakdown = Counter()
    for trace in traces:
        if trace.status == "error":
            error_type = trace.output_data.get("error_type", "unknown") if trace.output_data else "unknown"
            error_breakdown[error_type] += 1

    # ── Cost ──
    total_cost = sum(t.total_cost_usd for t in traces)
    cost_by_agent = defaultdict(float)
    token_by_agent = defaultdict(int)

    for trace in traces:
        cost_by_agent[trace.agent_type] += trace.total_cost_usd
        for llm_call in trace.llm_calls:
            token_by_agent[trace.agent_type] += llm_call.prompt_tokens + llm_call.completion_tokens

    cost_metrics = CostMetrics(
        total_cost=round(total_cost, 6),
        cost_per_request=round(total_cost / total, 6) if total > 0 else 0.0,
        cost_by_agent={k: round(v, 6) for k, v in cost_by_agent.items()},
        token_usage=dict(token_by_agent)
    )

    # ── Drift Score (placeholder) ──
    # Real drift detection requires baseline comparison.
    # For now, compute a simple metric: variance of decision confidence over recent traces
    if len(confidences) >= 10:
        mean_conf = sum(confidences) / len(confidences)
        variance = sum((c - mean_conf) ** 2 for c in confidences) / len(confidences)
        drift_score = min(variance * 10, 1.0)  # Normalize to 0-1
    else:
        drift_score = 0.0

    return Section1Metrics(
        prompt_quality_avg=round(prompt_quality_avg, 4),
        prompt_quality_trend=quality_trend[-20:],  # Last 20 data points
        response_accuracy=round(response_accuracy, 4),
        accuracy_by_agent=accuracy_by_agent,
        latency=latency_metrics,
        api_success_rate=round(api_success_rate, 4),
        api_error_breakdown=dict(error_breakdown),
        cost=cost_metrics,
        drift_score=round(drift_score, 4)
    )


def compute_section2_metrics(traces: list[TraceRecord]) -> Section2Metrics:
    """
    Compute LLM Agent Monitoring metrics (PRD §4.4) from a list of traces.

    Metrics computed:
    - Human approval rates and override rates
    - Agent performance (completion, success, SLA adherence)
    - Decision accuracy
    - Tool usage frequency and success rates
    - Escalation rates and reasons
    - Compliance/safety pass rates

    Args:
        traces: List of TraceRecord objects to analyze

    Returns:
        Section2Metrics with all computed values
    """
    if not traces:
        return Section2Metrics()

    total = len(traces)

    # ── Human Approval Rates ──
    auto_approved = sum(
        1 for t in traces
        if t.decision and t.decision.decision_type in ('approved', 'rejected')
        and not t.decision.escalated_to_human
    )
    human_reviewed = sum(
        1 for t in traces
        if t.decision and t.decision.escalated_to_human
    )
    human_overridden = sum(
        1 for t in traces
        if t.decision and t.decision.human_override is True
    )

    override_rate = human_overridden / human_reviewed if human_reviewed > 0 else 0.0
    human_approval_rate = auto_approved / total if total > 0 else 0.0

    # ── Agent Performance ──
    agent_traces = defaultdict(list)
    for trace in traces:
        agent_traces[trace.agent_type].append(trace)

    agent_performance = {}
    for agent_type, agent_trace_list in agent_traces.items():
        agent_total = len(agent_trace_list)
        agent_success = sum(1 for t in agent_trace_list if t.status == "success")
        # SLA: P95 latency < 5000ms
        agent_latencies = [t.total_latency_ms for t in agent_trace_list]
        p95 = _percentile(agent_latencies, 95) if agent_latencies else 0
        sla_adherence = 1.0 if p95 < 5000 else max(0.0, 1.0 - (p95 - 5000) / 5000)

        agent_performance[agent_type] = {
            "total_runs": agent_total,
            "completion_rate": round(agent_success / agent_total, 4) if agent_total > 0 else 0.0,
            "success_rate": round(agent_success / agent_total, 4) if agent_total > 0 else 0.0,
            "sla_adherence": round(sla_adherence, 4),
            "avg_latency_ms": round(sum(agent_latencies) / len(agent_latencies), 1) if agent_latencies else 0
        }

    # ── Decision Accuracy ──
    # Use confidence as proxy
    decisions_with_confidence = [
        t.decision.confidence for t in traces
        if t.decision and t.decision.confidence > 0
    ]
    decision_accuracy = (
        sum(decisions_with_confidence) / len(decisions_with_confidence)
        if decisions_with_confidence else 0.0
    )

    # ── Tool Usage ──
    tool_counter = Counter()
    tool_success = Counter()
    tool_total = Counter()

    for trace in traces:
        for tc in trace.tool_calls:
            tool_counter[tc.tool_name] += 1
            tool_total[tc.tool_name] += 1
            if tc.success:
                tool_success[tc.tool_name] += 1

    tool_success_rates = {
        name: round(tool_success[name] / tool_total[name], 4)
        for name in tool_total
    }

    # ── Escalation ──
    escalated = sum(
        1 for t in traces
        if t.decision and t.decision.decision_type in ('escalated', 'flagged')
    )
    escalation_rate = escalated / total if total > 0 else 0.0

    escalation_by_agent = {}
    escalation_reasons = Counter()
    for agent_type, agent_trace_list in agent_traces.items():
        agent_escalated = sum(
            1 for t in agent_trace_list
            if t.decision and t.decision.decision_type in ('escalated', 'flagged')
        )
        escalation_by_agent[agent_type] = (
            round(agent_escalated / len(agent_trace_list), 4) if agent_trace_list else 0.0
        )
        # Categorize escalation reasons
        for t in agent_trace_list:
            if t.decision and t.decision.decision_type in ('escalated', 'flagged'):
                reasoning = t.decision.reasoning.lower() if t.decision.reasoning else ""
                if "high value" in reasoning or "$" in reasoning or "amount" in reasoning:
                    escalation_reasons["high_value"] += 1
                elif "confidence" in reasoning or "low" in reasoning:
                    escalation_reasons["low_confidence"] += 1
                elif "fraud" in reasoning or "suspicious" in reasoning:
                    escalation_reasons["fraud_suspicion"] += 1
                elif "guardrail" in reasoning or "compliance" in reasoning:
                    escalation_reasons["policy_flag"] += 1
                else:
                    escalation_reasons["other"] += 1

    # ── Compliance & Safety ──
    total_guardrails = 0
    passed_guardrails = 0
    pii_flags = 0
    bias_flags = 0
    safety_violations = 0

    for trace in traces:
        for g in trace.guardrails:
            total_guardrails += 1
            if g.passed:
                passed_guardrails += 1
            else:
                if g.check_type == "pii":
                    pii_flags += 1
                elif g.check_type == "bias":
                    bias_flags += 1
                elif g.check_type == "safety":
                    safety_violations += 1

    compliance_pass_rate = passed_guardrails / total_guardrails if total_guardrails > 0 else 1.0

    return Section2Metrics(
        human_approval_rate=round(human_approval_rate, 4),
        auto_approved_count=auto_approved,
        human_reviewed_count=human_reviewed,
        override_rate=round(override_rate, 4),
        agent_performance=agent_performance,
        decision_accuracy=round(decision_accuracy, 4),
        tool_usage=dict(tool_counter),
        tool_success_rates=tool_success_rates,
        escalation_rate=round(escalation_rate, 4),
        escalation_by_agent=escalation_by_agent,
        escalation_reasons=dict(escalation_reasons),
        compliance_pass_rate=round(compliance_pass_rate, 4),
        pii_flags=pii_flags,
        bias_flags=bias_flags,
        safety_violations=safety_violations
    )


def compute_drift_score(
    baseline_distribution: dict[str, float],
    current_distribution: dict[str, float]
) -> float:
    """
    Compute drift score between baseline and current output distributions.
    Uses a simplified Jensen-Shannon divergence approximation.

    Args:
        baseline_distribution: Expected output type proportions (e.g., {"approved": 0.6, "rejected": 0.3, "escalated": 0.1})
        current_distribution: Observed output type proportions

    Returns:
        Drift score from 0.0 (no drift) to 1.0 (maximum drift)
    """
    if not baseline_distribution or not current_distribution:
        return 0.0

    # Get all keys
    all_keys = set(baseline_distribution.keys()) | set(current_distribution.keys())

    # Compute sum of squared differences (simplified divergence)
    total_diff = 0.0
    for key in all_keys:
        baseline_val = baseline_distribution.get(key, 0.0)
        current_val = current_distribution.get(key, 0.0)
        total_diff += (baseline_val - current_val) ** 2

    # Normalize to 0-1 range
    drift = min(math.sqrt(total_diff), 1.0)
    return round(drift, 4)
