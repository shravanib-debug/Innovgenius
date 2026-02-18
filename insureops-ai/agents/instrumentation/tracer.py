"""
Agent Tracer — Captures execution traces from AI agent workflows.
Wraps agent steps (LLM calls, tool calls, reasoning) in spans 
and collects them into a complete trace.
"""

import time
import uuid
from typing import Optional, Dict, Any
from contextlib import contextmanager
from .schemas import TraceSchema, SpanSchema


class AgentTracer:
    """
    Context-aware tracer for instrumenting AI agent execution.
    
    Usage:
        tracer = AgentTracer(agent_type="claims")
        tracer.start_trace()
        
        with tracer.span("policy_lookup", span_type="tool_call") as span:
            result = lookup_policy(policy_id)
            span.output_data = {"policy": result}
        
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

    def start_trace(self, metadata: Optional[Dict[str, Any]] = None) -> TraceSchema:
        """Begin a new execution trace."""
        self.current_trace = TraceSchema(
            agent_type=self.agent_type,
            metadata=metadata or {},
        )
        self._total_cost = 0.0
        self._total_tokens = 0
        self._tools_used = []
        return self.current_trace

    @contextmanager
    def span(self, name: str, span_type: str = "generic", input_data: Optional[Dict] = None):
        """
        Context manager for timing and capturing a single execution step.
        
        Args:
            name: Human-readable step name (e.g. "policy_lookup")
            span_type: One of 'llm_call', 'tool_call', 'reasoning', 'guardrail'
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

        completed_trace = self.current_trace
        self.current_trace = None
        return completed_trace
