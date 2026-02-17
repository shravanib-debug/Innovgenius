-- ============================================
-- InsureOps AI — Database Schema
-- PostgreSQL 15+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRACES — One row per agent execution
-- ============================================
CREATE TABLE traces (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type      VARCHAR(20) NOT NULL CHECK (agent_type IN ('claims', 'underwriting', 'fraud', 'support')),
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_latency   INTEGER NOT NULL DEFAULT 0,
    total_cost      DECIMAL(10,6) NOT NULL DEFAULT 0,
    decision_type   VARCHAR(20) CHECK (decision_type IN ('approved', 'rejected', 'escalated', 'flagged')),
    confidence      DECIMAL(3,2),
    reasoning       TEXT,
    escalated       BOOLEAN DEFAULT FALSE,
    human_override  BOOLEAN,
    human_decision  VARCHAR(20),
    status          VARCHAR(10) DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
    input_data      JSONB,
    output_data     JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_traces_agent_type ON traces(agent_type);
CREATE INDEX idx_traces_timestamp ON traces(timestamp DESC);
CREATE INDEX idx_traces_status ON traces(status);
CREATE INDEX idx_traces_decision_type ON traces(decision_type);

-- ============================================
-- LLM_CALLS — Individual LLM calls within a trace
-- ============================================
CREATE TABLE llm_calls (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id        UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL DEFAULT 0,
    model           VARCHAR(50),
    prompt_tokens   INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    latency_ms      INTEGER DEFAULT 0,
    cost_usd        DECIMAL(10,6) DEFAULT 0,
    status          VARCHAR(10) DEFAULT 'success',
    prompt_quality  DECIMAL(3,2),
    prompt_text     TEXT,
    response_text   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_llm_calls_trace_id ON llm_calls(trace_id);

-- ============================================
-- TOOL_CALLS — Tool usage within a trace
-- ============================================
CREATE TABLE tool_calls (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id        UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL DEFAULT 0,
    tool_name       VARCHAR(50) NOT NULL,
    parameters      JSONB,
    result_summary  TEXT,
    duration_ms     INTEGER DEFAULT 0,
    success         BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_calls_trace_id ON tool_calls(trace_id);

-- ============================================
-- GUARDRAIL_CHECKS — Safety & compliance checks
-- ============================================
CREATE TABLE guardrail_checks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id        UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
    check_type      VARCHAR(30) NOT NULL CHECK (check_type IN ('pii', 'bias', 'safety', 'compliance')),
    passed          BOOLEAN NOT NULL DEFAULT TRUE,
    details         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guardrail_checks_trace_id ON guardrail_checks(trace_id);

-- ============================================
-- ALERT_RULES — Configurable alert thresholds
-- ============================================
CREATE TABLE alert_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    metric          VARCHAR(50) NOT NULL,
    condition       VARCHAR(10) NOT NULL CHECK (condition IN ('gt', 'lt', 'eq', 'gte', 'lte')),
    threshold       DECIMAL(10,4) NOT NULL,
    severity        VARCHAR(15) NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'investigation')),
    agent_type      VARCHAR(20),
    enabled         BOOLEAN DEFAULT TRUE,
    cooldown_minutes INTEGER DEFAULT 5,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ALERTS — Triggered alert instances
-- ============================================
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id         UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
    rule_name       VARCHAR(100),
    triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_value   DECIMAL(10,4),
    threshold_value DECIMAL(10,4),
    severity        VARCHAR(15) NOT NULL,
    agent_type      VARCHAR(20),
    acknowledged    BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    details         JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);

-- ============================================
-- METRICS_SNAPSHOT — Periodic aggregated metrics
-- ============================================
CREATE TABLE metrics_snapshot (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type      VARCHAR(20),
    snapshot_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metric_type     VARCHAR(50) NOT NULL,
    metric_value    DECIMAL(12,4),
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_snapshot_time ON metrics_snapshot(snapshot_time DESC);
CREATE INDEX idx_metrics_snapshot_agent ON metrics_snapshot(agent_type);
CREATE INDEX idx_metrics_snapshot_type ON metrics_snapshot(metric_type);
