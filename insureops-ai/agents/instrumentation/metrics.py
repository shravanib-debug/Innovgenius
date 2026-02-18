"""
Metrics Collector — Aggregates and emits metrics from agent operations.
Tracks latency, costs, token usage, accuracy, and custom counters.
"""

import time
from typing import Dict, Any, Optional, List
from collections import defaultdict
from .schemas import MetricSchema


class MetricsCollector:
    """
    Collects and aggregates operational metrics from AI agents.
    
    Usage:
        metrics = MetricsCollector(agent_type="claims")
        metrics.record_latency(2340)
        metrics.record_cost(0.08)
        metrics.record_tokens(1842)
        metrics.record_decision("approved")
        metrics.increment("tool_calls", tags={"tool": "policy_lookup"})
        
        batch = metrics.flush()  # Returns all collected metrics
    """

    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self._metrics: List[MetricSchema] = []
        self._counters: Dict[str, float] = defaultdict(float)
        self._histograms: Dict[str, List[float]] = defaultdict(list)

    def record_latency(self, latency_ms: float, tags: Optional[Dict[str, str]] = None):
        """Record a latency measurement in milliseconds."""
        self._metrics.append(MetricSchema(
            metric_name="agent_latency",
            value=latency_ms,
            unit="ms",
            agent_type=self.agent_type,
            tags=tags or {},
        ))
        self._histograms["latency"].append(latency_ms)

    def record_cost(self, cost_usd: float, tags: Optional[Dict[str, str]] = None):
        """Record a cost in USD."""
        self._metrics.append(MetricSchema(
            metric_name="agent_cost",
            value=cost_usd,
            unit="usd",
            agent_type=self.agent_type,
            tags=tags or {},
        ))
        self._counters["total_cost"] += cost_usd

    def record_tokens(self, token_count: int, tags: Optional[Dict[str, str]] = None):
        """Record token usage."""
        self._metrics.append(MetricSchema(
            metric_name="token_usage",
            value=float(token_count),
            unit="count",
            agent_type=self.agent_type,
            tags=tags or {},
        ))
        self._counters["total_tokens"] += token_count

    def record_decision(self, decision: str, confidence: float = 0.0):
        """Record an agent decision (approved/rejected/escalated/flagged)."""
        self._metrics.append(MetricSchema(
            metric_name="agent_decision",
            value=confidence,
            unit="percent",
            agent_type=self.agent_type,
            tags={"decision": decision},
        ))
        self._counters[f"decision_{decision}"] += 1
        self._counters["total_decisions"] += 1

    def record_accuracy(self, correct: bool, tags: Optional[Dict[str, str]] = None):
        """Record a correctness data point for accuracy tracking."""
        self._counters["correct" if correct else "incorrect"] += 1
        self._metrics.append(MetricSchema(
            metric_name="accuracy_event",
            value=1.0 if correct else 0.0,
            unit="boolean",
            agent_type=self.agent_type,
            tags=tags or {},
        ))

    def record_escalation(self, reason: str):
        """Record an escalation event."""
        self._counters[f"escalation_{reason}"] += 1
        self._counters["total_escalations"] += 1
        self._metrics.append(MetricSchema(
            metric_name="escalation",
            value=1.0,
            unit="count",
            agent_type=self.agent_type,
            tags={"reason": reason},
        ))

    def increment(self, name: str, value: float = 1.0, tags: Optional[Dict[str, str]] = None):
        """Increment a generic counter."""
        self._counters[name] += value
        self._metrics.append(MetricSchema(
            metric_name=name,
            value=value,
            unit="count",
            agent_type=self.agent_type,
            tags=tags or {},
        ))

    def get_percentiles(self, metric_name: str = "latency") -> Dict[str, float]:
        """Calculate P50, P95, P99 for histogram data."""
        values = sorted(self._histograms.get(metric_name, []))
        if not values:
            return {"p50": 0, "p95": 0, "p99": 0}

        def percentile(data, p):
            idx = int(len(data) * p / 100)
            return data[min(idx, len(data) - 1)]

        return {
            "p50": percentile(values, 50),
            "p95": percentile(values, 95),
            "p99": percentile(values, 99),
        }

    def get_summary(self) -> Dict[str, Any]:
        """Return a summary of all collected metrics."""
        return {
            "agent_type": self.agent_type,
            "counters": dict(self._counters),
            "latency_percentiles": self.get_percentiles("latency"),
            "total_metrics": len(self._metrics),
        }

    def flush(self) -> List[Dict]:
        """Return all collected metrics as dicts and clear the buffer."""
        batch = [m.to_dict() for m in self._metrics]
        self._metrics.clear()
        return batch
