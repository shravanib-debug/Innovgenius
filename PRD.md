# Product Requirements Document (PRD)
## InsureOps AI — AI & Agent Observability Dashboard for Smart Insurance Operations

| Field | Detail |
|---|---|
| **Document Version** | 1.1 |
| **Date** | February 17, 2026 |
| **Status** | Draft |
| **Project Type** | Full-Stack AI Observability Platform |

---

## 1. Executive Summary

InsureOps AI is a real-time observability dashboard designed to monitor AI applications and LLM-based agents operating within insurance organizations. It provides two distinct monitoring sections — one for AI application-level metrics (prompt quality, latency, cost, drift) and another for LLM agent-level metrics (human approval rates, tool usage, escalation frequency, compliance) — giving insurance stakeholders complete visibility into their autonomous AI systems.

The platform includes 3 real, working insurance AI agents (Claims Processing, Underwriting, Fraud Detection) plus 1 simulated agent (Customer Support), all emitting structured telemetry that flows into the dashboard in real-time.

---

## 2. Goals & Objectives

### Primary Goals
1. Build a **dual-section observability dashboard** covering both AI application metrics and LLM agent behavior metrics
2. Build **3 real insurance AI agents** that emit structured telemetry to the dashboard
3. Enable **real-time monitoring** via WebSocket-powered live updates
4. Implement an **alert system** that detects anomalies, compliance violations, and performance degradation
5. Provide **execution traceability** — full audit trail of every agent decision

### Success Metrics
| Metric | Target |
|---|---|
| Dashboard loads with real-time data | < 2s initial load |
| Agent trace appears on dashboard | < 3s after agent execution |
| All 12 dashboard widgets functional | Section 1: 6, Section 2: 6 |
| Alert fires within threshold breach | < 5s detection time |
| Trace viewer shows full execution flow | All steps, tools, decisions visible |

---

## 3. User Personas

### Persona 1: Insurance Operations Manager
- **Needs:** High-level overview of all AI system health
- **Uses:** Dashboard overview, cost tracking, performance trends
- **Key Question:** "Are our AI systems performing reliably and within budget?"

### Persona 2: AI/ML Engineer
- **Needs:** Deep technical visibility into agent behavior
- **Uses:** Trace viewer, latency metrics, drift detection, tool usage
- **Key Question:** "Why did the claims agent behave differently today?"

### Persona 3: Compliance Officer
- **Needs:** Audit trail, safety compliance, regulatory adherence
- **Uses:** Compliance panel, human approval metrics, escalation logs
- **Key Question:** "Can we prove our AI decisions are compliant and unbiased?"

### Persona 4: Claims Supervisor
- **Needs:** Oversight of AI-assisted claim decisions
- **Uses:** Human approval rates, decision accuracy, escalation queue
- **Key Question:** "Which claims need my attention, and how accurate are the AI recommendations?"

---

## 4. Functional Requirements

### 4.1 Insurance AI Agents

#### FR-AGT-01: Claims Processing Agent
| ID | Requirement | Priority |
|---|---|---|
| FR-AGT-01.1 | Accept claim description as text input | P0 |
| FR-AGT-01.2 | Parse and retrieve relevant clauses from policy PDF via RAG | P0 |
| FR-AGT-01.3 | Generate decision: Approve / Reject / Escalate with justification | P0 |
| FR-AGT-01.4 | Calculate estimated payout amount for approved claims | P0 |
| FR-AGT-01.5 | Escalate claims above $10,000 threshold for human review | P0 |
| FR-AGT-01.6 | Emit structured telemetry for every execution step | P0 |

#### FR-AGT-02: Underwriting Risk Agent
| ID | Requirement | Priority |
|---|---|---|
| FR-AGT-02.1 | Accept applicant profile data (age, health, occupation, coverage) | P0 |
| FR-AGT-02.2 | Use tools to calculate risk score, check medical risk, query history | P0 |
| FR-AGT-02.3 | Generate decision: Accept / Conditional / Reject + recommended premium | P0 |
| FR-AGT-02.4 | Flag high-risk applications (score > 0.7) for human underwriter | P0 |
| FR-AGT-02.5 | Emit structured telemetry | P0 |

#### FR-AGT-03: Fraud Detection Agent
| ID | Requirement | Priority |
|---|---|---|
| FR-AGT-03.1 | Accept claim data with claimant history | P0 |
| FR-AGT-03.2 | Use tools: duplicate checker, pattern analyzer, history lookup | P0 |
| FR-AGT-03.3 | Output fraud risk score (0-1), evidence summary, recommendation | P0 |
| FR-AGT-03.4 | Escalate suspected fraud (score > 0.6) with evidence package | P0 |
| FR-AGT-03.5 | Emit structured telemetry | P0 |

#### FR-AGT-04: Customer Support Agent (Simulated)
| ID | Requirement | Priority |
|---|---|---|
| FR-AGT-04.1 | Generate realistic simulated telemetry via Python script | P1 |
| FR-AGT-04.2 | Include: conversation logs, intent accuracy, handoff rate, CSAT | P1 |
| FR-AGT-04.3 | Data follows realistic patterns (peak hours, variance, anomalies) | P1 |

---

### 4.2 Telemetry & Instrumentation

#### FR-TEL: Telemetry Pipeline
| ID | Requirement | Priority |
|---|---|---|
| FR-TEL-01 | Capture telemetry from every LLM call (tokens, latency, cost, model) | P0 |
| FR-TEL-02 | Capture tool usage (tool name, parameters, result, duration) | P0 |
| FR-TEL-03 | Capture agent decisions (decision type, confidence, escalation) | P0 |
| FR-TEL-04 | Capture guardrail checks (PII detection, bias flags, safety triggers) | P1 |
| FR-TEL-05 | Assign unique trace_id to each agent execution | P0 |
| FR-TEL-06 | Store telemetry in PostgreSQL with efficient indexing | P0 |
| FR-TEL-07 | Forward telemetry to frontend via WebSocket in real-time | P0 |

**Telemetry Schema:**
```json
{
  "trace_id": "string (UUID)",
  "agent_type": "claims | underwriting | fraud | support",
  "timestamp": "ISO-8601",
  "llm_calls": [
    {
      "model": "string",
      "prompt_tokens": "int",
      "completion_tokens": "int",
      "latency_ms": "int",
      "cost_usd": "float",
      "status": "success | error",
      "prompt_quality_score": "float (0-1)"
    }
  ],
  "tools_used": [
    {
      "tool_name": "string",
      "parameters": "object",
      "result_summary": "string",
      "duration_ms": "int",
      "success": "boolean"
    }
  ],
  "decision": {
    "type": "approved | rejected | escalated | flagged",
    "confidence": "float (0-1)",
    "reasoning": "string",
    "escalated_to_human": "boolean",
    "human_override": "boolean | null",
    "human_decision": "string | null"
  },
  "guardrails": {
    "pii_detected": "boolean",
    "bias_flag": "boolean",
    "safety_violation": "boolean",
    "compliance_checks_passed": "int",
    "compliance_checks_total": "int"
  },
  "total_latency_ms": "int",
  "total_cost_usd": "float"
}
```

---

### 4.3 Dashboard — Section 1: AI Application Monitoring

| ID | Widget | Metrics Displayed | Visualization | Priority |
|---|---|---|---|---|
| FR-S1-01 | Prompt Quality Monitor | Quality score (0-100), template adherence | Gauge + trend line | P0 |
| FR-S1-02 | Response Accuracy Tracker | Accuracy %, per-agent breakdown | Line chart + bar chart | P0 |
| FR-S1-03 | Latency Dashboard | P50, P95, P99 response times | Histogram + real-time line | P0 |
| FR-S1-04 | API Success/Failure Rates | Success %, error codes, retry counts | Donut + error waterfall | P0 |
| FR-S1-05 | Cost Tracker | Token usage, cost/request, cost/agent, burn rate | Stacked bar + burn-down | P0 |
| FR-S1-06 | Model Drift Detection | Distribution shift, drift score | Distribution comparison | P1 |

---

### 4.4 Dashboard — Section 2: LLM Agent Monitoring

| ID | Widget | Metrics Displayed | Visualization | Priority |
|---|---|---|---|---|
| FR-S2-01 | Human Approval Rates | Auto vs human reviewed, override % | Funnel chart + trend | P0 |
| FR-S2-02 | Agent Performance Scorecard | Completion rate, success rate, SLA adherence | Scorecard tiles + leaderboard | P0 |
| FR-S2-03 | Decision Accuracy | Correct vs incorrect, confidence calibration | Trend line + error table | P0 |
| FR-S2-04 | Tool Usage Analytics | Tool call frequency, success rate, per-agent | Sankey diagram + heatmap | P0 |
| FR-S2-05 | Escalation Frequency | Escalation rate, reasons, resolution time | Trend line + pie chart | P0 |
| FR-S2-06 | Safety & Compliance Panel | Guardrail triggers, PII flags, bias detection | Scorecard + violation log | P0 |

---

### 4.5 Execution Trace Viewer

| ID | Requirement | Priority |
|---|---|---|
| FR-TRC-01 | List view of all recent traces with sorting and filtering | P0 |
| FR-TRC-02 | Click into any trace to see full execution timeline | P0 |
| FR-TRC-03 | Display each step: LLM call, tool usage, decision, guardrails | P0 |
| FR-TRC-04 | Show input/output for each step | P0 |
| FR-TRC-05 | Display cost and latency breakdown per step | P1 |
| FR-TRC-06 | Highlight escalated or failed traces visually | P1 |
| FR-TRC-07 | Filter traces by agent type, decision, date range, status | P1 |

---

### 4.6 Alert System

| ID | Requirement | Priority |
|---|---|---|
| FR-ALT-01 | Define threshold-based alert rules (latency, accuracy, cost, compliance) | P0 |
| FR-ALT-02 | Evaluate incoming telemetry against active alert rules in real-time | P0 |
| FR-ALT-03 | Display active alerts in dashboard notification center | P0 |
| FR-ALT-04 | Alert severity levels: Info, Warning, Critical | P0 |
| FR-ALT-05 | Alert history log with search and filter | P1 |
| FR-ALT-06 | Anomaly-based detection (statistical deviation from baseline) | P2 |

**Default Alert Rules:**

| Alert | Condition | Severity |
|---|---|---|
| Latency Spike | P95 > 5000ms for 5 minutes | Warning |
| Accuracy Drop | Agent accuracy < 80% over last 50 decisions | Critical |
| Cost Overrun | Daily cost > $50 | Warning |
| Compliance Violation | PII detected in response OR bias flag triggered | Critical |
| High Escalation | Escalation rate > 50% for any agent | Warning |
| API Failure | Success rate < 95% over last 100 calls | Critical |
| Drift Detected | Drift score > 0.3 | Investigation |

---

### 4.7 Agent Trigger Interface

| ID | Requirement | Priority |
|---|---|---|
| FR-TRG-01 | UI panel to manually submit a claim to Claims Agent | P0 |
| FR-TRG-02 | UI panel to submit an applicant profile to Underwriting Agent | P0 |
| FR-TRG-03 | UI panel to submit claim data to Fraud Detection Agent | P0 |
| FR-TRG-04 | Show real-time processing status after submission | P1 |
| FR-TRG-05 | Display agent response inline with link to full trace | P1 |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Dashboard initial load time | < 2 seconds |
| NFR-02 | Real-time update latency (WebSocket) | < 500ms |
| NFR-03 | Agent execution to dashboard trace display | < 3 seconds |
| NFR-04 | Support concurrent dashboard users | At least 5 |
| NFR-05 | Database should handle metric storage | 30 days retention |
| NFR-06 | Responsive design | Desktop + tablet |
| NFR-07 | Browser support | Chrome, Firefox, Edge (latest) |
| NFR-08 | Code quality | Linted, documented, modular |

---

## 6. API Specification

### 6.1 REST Endpoints

#### Metrics API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/metrics/overview` | Dashboard-level aggregated metrics |
| GET | `/api/metrics/section1` | AI Application metrics (latency, cost, accuracy, drift) |
| GET | `/api/metrics/section2` | LLM Agent metrics (approvals, escalations, tool usage) |
| GET | `/api/metrics/agent/:agent_type` | Metrics for a specific agent |
| GET | `/api/metrics/cost` | Cost breakdown and trends |

#### Traces API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/traces` | List all traces (paginated, filterable) |
| GET | `/api/traces/:trace_id` | Full trace detail with all steps |
| POST | `/api/traces` | Ingest new trace (used by telemetry collector) |

#### Agents API
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/agents/claims/run` | Trigger claims agent with input data |
| POST | `/api/agents/underwriting/run` | Trigger underwriting agent with applicant data |
| POST | `/api/agents/fraud/run` | Trigger fraud detection agent with claim data |
| GET | `/api/agents/status` | Health status of all agents |

#### Alerts API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/alerts` | List all alerts (active + history) |
| GET | `/api/alerts/active` | Currently active alerts only |
| POST | `/api/alerts/rules` | Create a new alert rule |
| PUT | `/api/alerts/:alert_id/acknowledge` | Acknowledge an alert |

### 6.2 WebSocket Endpoints
| Endpoint | Description |
|---|---|
| `ws://host/ws/dashboard` | Real-time metric updates for dashboard widgets |
| `ws://host/ws/traces` | Live trace feed as agents execute |
| `ws://host/ws/alerts` | Real-time alert notifications |

---

## 7. Database Schema (High-Level)

### Core Tables

```sql
-- Agent traces (one row per agent execution)
CREATE TABLE traces (
    id              UUID PRIMARY KEY,
    agent_type      VARCHAR(20) NOT NULL,   -- claims, underwriting, fraud, support
    timestamp       TIMESTAMPTZ NOT NULL,
    total_latency   INTEGER NOT NULL,       -- ms
    total_cost      DECIMAL(10,6) NOT NULL, -- USD
    decision_type   VARCHAR(20),            -- approved, rejected, escalated, flagged
    confidence      DECIMAL(3,2),
    escalated       BOOLEAN DEFAULT FALSE,
    human_override  BOOLEAN,
    status          VARCHAR(10) DEFAULT 'success',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Individual LLM calls within a trace
CREATE TABLE llm_calls (
    id              UUID PRIMARY KEY,
    trace_id        UUID REFERENCES traces(id),
    model           VARCHAR(50),
    prompt_tokens   INTEGER,
    completion_tokens INTEGER,
    latency_ms      INTEGER,
    cost_usd        DECIMAL(10,6),
    status          VARCHAR(10),
    prompt_quality  DECIMAL(3,2),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tool usage within a trace
CREATE TABLE tool_calls (
    id              UUID PRIMARY KEY,
    trace_id        UUID REFERENCES traces(id),
    tool_name       VARCHAR(50),
    parameters      JSONB,
    result_summary  TEXT,
    duration_ms     INTEGER,
    success         BOOLEAN,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Guardrail check results
CREATE TABLE guardrail_checks (
    id              UUID PRIMARY KEY,
    trace_id        UUID REFERENCES traces(id),
    check_type      VARCHAR(30),    -- pii, bias, safety, compliance
    passed          BOOLEAN,
    details         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Alert rules configuration
CREATE TABLE alert_rules (
    id              UUID PRIMARY KEY,
    name            VARCHAR(100),
    metric          VARCHAR(50),
    condition       VARCHAR(10),    -- gt, lt, eq
    threshold       DECIMAL(10,4),
    severity        VARCHAR(10),    -- info, warning, critical
    enabled         BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Triggered alert instances
CREATE TABLE alerts (
    id              UUID PRIMARY KEY,
    rule_id         UUID REFERENCES alert_rules(id),
    triggered_at    TIMESTAMPTZ NOT NULL,
    current_value   DECIMAL(10,4),
    severity        VARCHAR(10),
    acknowledged    BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    details         JSONB
);
```

---

## 8. UI/UX Requirements

### 8.1 Dashboard Layout
- **Navigation:** Sidebar with sections: Overview, Section 1, Section 2, Traces, Alerts, Agents
- **Theme:** Dark mode primary (professional, modern), light mode toggle
- **Layout:** Responsive grid-based widget layout
- **Branding:** InsureOps AI logo, insurance-themed color palette (blues, teals, accent orange)

### 8.2 Design Principles
- **Data density:** Show maximum information without clutter
- **Glanceability:** Key metrics visible immediately, drill-down on click
- **Real-time feel:** Subtle animations for live data updates (pulse, slide-in)
- **Consistency:** All charts use the same color scheme, typography, and card style
- **Accessibility:** WCAG 2.1 AA compliance for contrast and interactive elements

### 8.3 Key Interactions
| Interaction | Behavior |
|---|---|
| Click chart data point | Open drill-down with filtered trace list |
| Hover on metric | Show tooltip with comparison to baseline |
| Click alert bell | Open alert panel with active alerts |
| Toggle time range | Update all widgets to selected period (1h, 6h, 24h, 7d) |
| Click agent name | Navigate to agent-specific detailed view |
| Submit to agent | Show processing spinner → result + trace link |

---

## 9. Out of Scope (v1)

| Feature | Why Excluded |
|---|---|
| Multi-tenant authentication | Not needed for demo/PS submission |
| Email/Slack alert delivery | Dashboard notifications sufficient for v1 |
| Prompt playground/editor | Focus is on observability, not prompt engineering |
| A/B model testing | Could be v2 feature |
| Historical data import | Dashboard works with generated data |
| Mobile-responsive design | Desktop/tablet is sufficient |
| Production deployment (cloud) | Local development is the target |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM API rate limits / costs | Medium | High | Use free tiers, cache responses, limit demo runs |
| Agent complexity exceeds timeline | Medium | High | Start with simplest agent, incrementally add features |
| Real-time WebSocket reliability | Low | Medium | Fallback to polling if WebSocket disconnects |
| Dashboard performance with large datasets | Low | Medium | Pagination, aggregation at API level |
| LLM hallucination in agents | Medium | Low | Guardrails + explicit prompt engineering |

---

## 11. Dependencies

| Dependency | Type | Notes |
|---|---|---|
| Google Gemini API or OpenAI API | External | LLM provider for agents — need API key |
| Node.js v18+ | Runtime | Backend (Express.js) + Frontend build tooling |
| Python 3.10+ | Runtime | AI Agents (LangGraph) |
| PostgreSQL 15+ | Database | Primary data store via Sequelize ORM |
| FAISS | Library | Vector store for Claims Agent RAG |

---

## 12. Acceptance Criteria

### Must Have (P0)
- [ ] 3 real agents process inputs and produce decisions with telemetry
- [ ] Dashboard Section 1 displays all 6 AI application metrics with real data
- [ ] Dashboard Section 2 displays all 6 LLM agent metrics with real data
- [ ] Trace viewer shows full execution flow for any agent run
- [ ] At least 3 alert rules fire correctly when thresholds are breached
- [ ] Real-time updates work via WebSocket (< 3s latency)

### Should Have (P1)
- [ ] Simulated customer support agent data populates dashboard
- [ ] Alert history is searchable and filterable
- [ ] Dashboard time range selector works across all widgets
- [ ] Trace viewer shows cost breakdown per step
- [ ] Agent trigger UI allows manual submission with inline results

### Nice to Have (P2)
- [ ] Anomaly-based alert detection (statistical, not just threshold)
- [ ] Dashboard widgets are rearrangeable via drag-and-drop
- [ ] Cost optimization insights/recommendations
- [ ] Export trace data as JSON for audit

---

*Document Version: 1.1 | Last Updated: February 17, 2026*
