"""
InsureOps AI — Telemetry Collector
Receives TraceRecords from agents, validates them, sends to the
Express backend for storage and alert evaluation. Supports async
(non-blocking) sending via threading.
"""

import os
import threading
import time
from typing import Optional

from agents.instrumentation.schemas import TraceRecord


class TelemetryCollector:
    """
    Manages sending completed trace records to the backend API.

    Features:
    - Validates trace data before sending
    - Formats payload for the backend telemetry ingestion endpoint
    - Supports async (fire-and-forget) sending via threading
    - Retry logic with configurable attempts
    - Graceful error handling (never crashes the agent)
    """

    def __init__(self, backend_url: Optional[str] = None, async_send: bool = True):
        """
        Args:
            backend_url: Base URL of the Express backend (default: BACKEND_URL env var or localhost:5000)
            async_send: If True, send telemetry in a background thread (non-blocking)
        """
        self.backend_url = backend_url or os.getenv("BACKEND_URL", "http://localhost:5000")
        self.endpoint = f"{self.backend_url}/api/telemetry/ingest"
        self.async_send = async_send
        self.max_retries = 1
        self.retry_delay = 2.0  # seconds

    def send(self, trace: TraceRecord) -> bool:
        """
        Send a completed trace record to the backend.

        Args:
            trace: The TraceRecord to send

        Returns:
            True if sent successfully (or queued for async), False on validation failure
        """
        # Validate first
        errors = self.validate_trace(trace)
        if errors:
            print(f"⚠️ Trace validation failed: {'; '.join(errors)}")
            return False

        # Format payload
        payload = self._format_payload(trace)

        if self.async_send:
            # Fire-and-forget in background thread
            thread = threading.Thread(
                target=self._send_with_retry,
                args=(payload, trace.trace_id),
                daemon=True
            )
            thread.start()
            return True
        else:
            return self._send_with_retry(payload, trace.trace_id)

    def validate_trace(self, trace: TraceRecord) -> list[str]:
        """
        Validate that a trace has all required fields populated.

        Returns:
            List of validation error messages (empty = valid)
        """
        errors = []

        if not trace.trace_id:
            errors.append("Missing trace_id")
        if not trace.agent_type:
            errors.append("Missing agent_type")
        if trace.agent_type not in ('claims', 'underwriting', 'fraud', 'support'):
            errors.append(f"Invalid agent_type: {trace.agent_type}")
        if not trace.timestamp:
            errors.append("Missing timestamp")
        if trace.status not in ('success', 'error', 'pending'):
            errors.append(f"Invalid status: {trace.status}")

        return errors

    def _format_payload(self, trace: TraceRecord) -> dict:
        """Format a TraceRecord into the backend's expected ingestion format."""
        return {
            "trace_id": trace.trace_id,
            "agent_type": trace.agent_type,
            "session_id": None,
            "status": trace.status,
            "total_latency_ms": trace.total_latency_ms,
            "total_cost_usd": trace.total_cost_usd,
            "total_tokens": sum(
                c.prompt_tokens + c.completion_tokens for c in trace.llm_calls
            ),
            "input_data": trace.input_data,
            "output_data": trace.output_data,
            "llm_calls": [
                {
                    "step_order": i + 1,
                    "model": c.model,
                    "prompt_tokens": c.prompt_tokens,
                    "completion_tokens": c.completion_tokens,
                    "latency_ms": c.latency_ms,
                    "cost_usd": c.cost_usd,
                    "status": c.status,
                    "prompt_quality": c.prompt_quality,
                    "prompt_text": c.prompt_text,
                    "response_text": c.response_text
                }
                for i, c in enumerate(trace.llm_calls)
            ],
            "tool_calls": [
                {
                    "step_order": i + 1,
                    "tool_name": c.tool_name,
                    "input_data": c.parameters,
                    "output_data": c.result_summary,
                    "duration_ms": c.duration_ms,
                    "success": c.success
                }
                for i, c in enumerate(trace.tool_calls)
            ],
            "guardrail_checks": [
                {
                    "check_type": g.check_type,
                    "passed": g.passed,
                    "details": g.details
                }
                for g in trace.guardrails
            ],
            # Include decision data if present
            "decision": {
                "decision_type": trace.decision.decision_type,
                "confidence": trace.decision.confidence,
                "reasoning": trace.decision.reasoning,
                "escalated_to_human": trace.decision.escalated_to_human,
                "human_override": trace.decision.human_override,
                "human_decision": trace.decision.human_decision,
            } if trace.decision else None
        }

    def _send_with_retry(self, payload: dict, trace_id: str) -> bool:
        """Send payload to backend with retry logic."""
        import requests

        for attempt in range(self.max_retries + 1):
            try:
                response = requests.post(
                    self.endpoint,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )

                if response.status_code in (200, 201):
                    print(f"✅ Telemetry sent: trace_id={trace_id}")
                    return True
                else:
                    print(f"⚠️ Telemetry send failed (HTTP {response.status_code}): {response.text[:200]}")

            except Exception as e:
                print(f"⚠️ Telemetry send error (attempt {attempt + 1}/{self.max_retries + 1}): {e}")

            # Retry after delay (except on last attempt)
            if attempt < self.max_retries:
                time.sleep(self.retry_delay)

        print(f"❌ Telemetry send failed after {self.max_retries + 1} attempts for trace_id={trace_id}")
        return False


# ─── Convenience Function ────────────────────────────────

# Singleton collector instance
_default_collector: Optional[TelemetryCollector] = None


def get_collector() -> TelemetryCollector:
    """Get or create the default TelemetryCollector singleton."""
    global _default_collector
    if _default_collector is None:
        _default_collector = TelemetryCollector()
    return _default_collector


def send_telemetry(trace: TraceRecord, backend_url: str = None) -> bool:
    """
    Convenience function to send telemetry using the default collector.
    This is the recommended way to send telemetry from agent code.

    Args:
        trace: The TraceRecord to send
        backend_url: Optional override for backend URL

    Returns:
        True if sent/queued successfully
    """
    collector = get_collector()
    if backend_url:
        collector.backend_url = backend_url
        collector.endpoint = f"{backend_url}/api/telemetry/ingest"
    return collector.send(trace)
