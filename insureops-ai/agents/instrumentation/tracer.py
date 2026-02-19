"""
Agent Tracer — Captures execution traces from AI agent workflows.
Wraps agent steps (LLM calls, tool calls, reasoning, verification) in spans 
and collects them into a complete trace.

v2: Extended with verification pipeline tracking for claims agents.
"""

import time
import uuid
from typing import Optional, Dict, Any, List
from contextlib import contextmanager
from .schemas import TraceSchema, SpanSchema, VerificationStepRecord


class AgentTracer:
    """
    Context-aware tracer for instrumenting AI agent execution.
    
    Usage:
        tracer = AgentTracer(agent_type="claims")
        tracer.start_trace()
        
        # v2: Set claim context
        tracer.set_claim_context(claim_id="c-123", insurance_type="health")
        
        with tracer.span("policy_lookup", span_type="tool_call") as span:
            result = lookup_policy(policy_id)
            span.output_data = {"policy": result}
        
        # v2: Record verification steps
        tracer.record_verification_step("doc_check", "passed", 120.5, "All docs present")
        tracer.set_evidence_info(evidence_count=3, completeness_score=0.85, 
                                evidence_used=["bill.pdf"], missing_docs=[])
        
        trace = tracer.end_trace(decision="approved", confidence=0.94)
    """

    def __init__(self, agent_type: str, backend_url: str = "http://localhost:5000"):
        self.agent_type = agent_type
        self.backend_url = backend_url
        self.current_trace: Optional[TraceSchema] = None
        self._active_spans = []
        self._total_cost = 0.0
        self._total_tokens = 0
        self._tools_used = []
        # v2: verification tracking
        self._verification_start: Optional[float] = None
        self._verification_latency_ms = 0.0

    def start_trace(self, metadata: Optional[Dict[str, Any]] = None) -> TraceSchema:
        """Begin a new execution trace."""
        self.current_trace = TraceSchema(
            agent_type=self.agent_type,
            metadata=metadata or {},
        )
        self._total_cost = 0.0
        self._total_tokens = 0
        self._tools_used = []
        self._verification_start = None
        self._verification_latency_ms = 0.0
        return self.current_trace

    # ── v2: Claim context ──

    def set_claim_context(self, claim_id: str, insurance_type: str):
        """Set the claim context for this trace (v2)."""
        if not self.current_trace:
            raise RuntimeError("No active trace. Call start_trace() first.")
        self.current_trace.claim_id = claim_id
        self.current_trace.insurance_type = insurance_type

    # ── v2: Verification tracking ──

    def record_verification_step(
        self, step_name: str, status: str, duration_ms: float = 0.0,
        details: str = "", evidence_used: Optional[List[str]] = None
    ):
        """Record a verification pipeline step (v2)."""
        if not self.current_trace:
            raise RuntimeError("No active trace. Call start_trace() first.")

        step = VerificationStepRecord(
            step_name=step_name,
            status=status,
            duration_ms=duration_ms,
            details=details,
            evidence_used=evidence_used or [],
        )
        self.current_trace.add_verification_step(step)

        # Also create a span for the verification step
        span = SpanSchema(
            name=f"verify:{step_name}",
            span_type="verification",
            duration_ms=duration_ms,
        )
        span.status = "ok" if status in ("passed", "pending") else "error"
        span.output_data = {"status": status, "details": details}
        if self.current_trace:
            self.current_trace.add_span(span)

    def set_evidence_info(
        self, evidence_count: int = 0, completeness_score: float = 0.0,
        evidence_used: Optional[List[str]] = None,
        missing_docs: Optional[List[str]] = None
    ):
        """Set evidence metadata for this trace (v2)."""
        if not self.current_trace:
            raise RuntimeError("No active trace. Call start_trace() first.")
        self.current_trace.evidence_count = evidence_count
        self.current_trace.evidence_completeness_score = completeness_score
        self.current_trace.evidence_used_in_decision = evidence_used or []
        self.current_trace.missing_documents = missing_docs or []

    @contextmanager
    def verification_timer(self):
        """Context manager for tracking total verification latency (v2)."""
        start = time.time()
        try:
            yield
        finally:
            elapsed = (time.time() - start) * 1000
            self._verification_latency_ms += elapsed

    # ── Core span tracking (v1) ──

    @contextmanager
    def span(self, name: str, span_type: str = "generic", input_data: Optional[Dict] = None):
        """
        Context manager for timing and capturing a single execution step.
        
        Args:
            name: Human-readable step name (e.g. "policy_lookup")
            span_type: One of 'llm_call', 'tool_call', 'reasoning', 'guardrail', 'verification'
            input_data: Input payload for this step
        """
        span = SpanSchema(
            name=name,
            span_type=span_type,
            input_data=input_data,
            start_time=time.time(),
        )
        self._active_spans.append(span)

        try:
            yield span
            span.status = "ok"
        except Exception as e:
            span.status = "error"
            span.error = str(e)
            raise
        finally:
            span.end_time = time.time()
            span.duration_ms = round((span.end_time - span.start_time) * 1000, 2)

            if span_type == "tool_call" and name not in self._tools_used:
                self._tools_used.append(name)

            if self.current_trace:
                self.current_trace.add_span(span)

            self._active_spans.pop()

    def record_llm_usage(self, tokens: int, cost: float):
        """Record token usage and cost from an LLM call."""
        self._total_tokens += tokens
        self._total_cost += cost

    def end_trace(
        self,
        decision: str = "",
        confidence: float = 0.0,
        reasoning: str = "",
    ) -> TraceSchema:
        """
        Finalize the current trace with decision metadata.
        
        Args:
            decision: Agent decision ('approved', 'rejected', 'escalated', 'flagged')
            confidence: Decision confidence score (0.0 to 1.0)
            reasoning: Agent's reasoning text
        
        Returns:
            The completed TraceSchema
        """
        if not self.current_trace:
            raise RuntimeError("No active trace. Call start_trace() first.")

        self.current_trace.decision = decision
        self.current_trace.confidence = confidence
        self.current_trace.reasoning = reasoning
        self.current_trace.total_cost = round(self._total_cost, 4)
        self.current_trace.total_tokens = self._total_tokens
        self.current_trace.tools_used = self._tools_used.copy()

        # v2: Set verification latency
        if self._verification_latency_ms > 0:
            self.current_trace.verification_latency_ms = round(self._verification_latency_ms, 2)

        completed_trace = self.current_trace
        self.current_trace = None
        return completed_trace
