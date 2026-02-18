"""
Telemetry Collector — Central hub for collecting traces and metrics
and sending them to the backend API for storage and visualization.
"""

import json
import logging
from typing import Optional, Dict, Any, List
from .schemas import TraceSchema, MetricSchema
from .tracer import AgentTracer
from .metrics import MetricsCollector

logger = logging.getLogger(__name__)


class TelemetryCollector:
    """
    Central telemetry collector that manages tracers and metrics collectors
    and sends data to the InsureOps backend.
    
    Usage:
        collector = TelemetryCollector(backend_url="http://localhost:5000")
        
        # Get agent-specific tracer
        tracer = collector.get_tracer("claims")
        metrics = collector.get_metrics("claims")
        
        # After agent executes, send telemetry
        trace = tracer.end_trace(decision="approved")
        collector.send_trace(trace)
        collector.send_metrics(metrics.flush())
    """

    def __init__(self, backend_url: str = "http://localhost:5000"):
        self.backend_url = backend_url
        self._tracers: Dict[str, AgentTracer] = {}
        self._metrics_collectors: Dict[str, MetricsCollector] = {}
        self._trace_buffer: List[Dict] = []
        self._metric_buffer: List[Dict] = []

    def get_tracer(self, agent_type: str) -> AgentTracer:
        """Get or create an AgentTracer for a specific agent type."""
        if agent_type not in self._tracers:
            self._tracers[agent_type] = AgentTracer(
                agent_type=agent_type,
                backend_url=self.backend_url,
            )
        return self._tracers[agent_type]

    def get_metrics(self, agent_type: str) -> MetricsCollector:
        """Get or create a MetricsCollector for a specific agent type."""
        if agent_type not in self._metrics_collectors:
            self._metrics_collectors[agent_type] = MetricsCollector(agent_type=agent_type)
        return self._metrics_collectors[agent_type]

    def send_trace(self, trace: TraceSchema) -> bool:
        """Send a completed trace to the backend."""
        try:
            import urllib.request

            payload = json.dumps({
                "type": "trace",
                "data": trace.to_dict(),
            }).encode("utf-8")

            req = urllib.request.Request(
                f"{self.backend_url}/api/telemetry/ingest",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200 or resp.status == 201:
                    logger.info(f"Trace {trace.trace_id} sent successfully")
                    return True

        except Exception as e:
            logger.warning(f"Failed to send trace {trace.trace_id}: {e}")
            # Buffer for retry
            self._trace_buffer.append(trace.to_dict())

        return False

    def send_metrics(self, metrics: List[Dict]) -> bool:
        """Send a batch of metrics to the backend."""
        try:
            import urllib.request

            payload = json.dumps({
                "type": "metrics",
                "data": metrics,
            }).encode("utf-8")

            req = urllib.request.Request(
                f"{self.backend_url}/api/telemetry/ingest",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200 or resp.status == 201:
                    logger.info(f"Sent {len(metrics)} metrics successfully")
                    return True

        except Exception as e:
            logger.warning(f"Failed to send metrics: {e}")
            self._metric_buffer.extend(metrics)

        return False

    def flush_buffers(self) -> Dict[str, int]:
        """Attempt to send any buffered traces and metrics."""
        sent = {"traces": 0, "metrics": 0}

        # Retry buffered traces
        remaining_traces = []
        for trace_dict in self._trace_buffer:
            try:
                import urllib.request

                payload = json.dumps({"type": "trace", "data": trace_dict}).encode("utf-8")
                req = urllib.request.Request(
                    f"{self.backend_url}/api/telemetry/ingest",
                    data=payload,
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=5) as resp:
                    if resp.status in (200, 201):
                        sent["traces"] += 1
                    else:
                        remaining_traces.append(trace_dict)
            except Exception:
                remaining_traces.append(trace_dict)

        self._trace_buffer = remaining_traces

        # Retry buffered metrics
        if self._metric_buffer:
            try:
                import urllib.request

                payload = json.dumps({
                    "type": "metrics",
                    "data": self._metric_buffer,
                }).encode("utf-8")
                req = urllib.request.Request(
                    f"{self.backend_url}/api/telemetry/ingest",
                    data=payload,
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=5) as resp:
                    if resp.status in (200, 201):
                        sent["metrics"] = len(self._metric_buffer)
                        self._metric_buffer = []
            except Exception:
                pass

        return sent

    def get_status(self) -> Dict[str, Any]:
        """Return collector status including buffer sizes."""
        return {
            "active_tracers": list(self._tracers.keys()),
            "active_collectors": list(self._metrics_collectors.keys()),
            "buffered_traces": len(self._trace_buffer),
            "buffered_metrics": len(self._metric_buffer),
        }
