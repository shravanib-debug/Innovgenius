# 🗺️ InsureOps AI — Project Roadmap & File Tracker

> Complete build plan, file-by-file breakdown, and progress tracker for the AI & Agent Observability Dashboard.

---

## 📊 Progress Overview

| Phase | Status | Files | Progress |
|---|---|---|---|
| Phase 1: Foundation & Setup | ⬜ Not Started | 14 files | 0% |
| Phase 2: Insurance AI Agents | ⬜ Not Started | 15 files | 0% |
| Phase 3: Telemetry Pipeline | ⬜ Not Started | 6 files | 0% |
| Phase 4: Backend API | ⬜ Not Started | 10 files | 0% |
| Phase 5: Dashboard — Section 1 | ⬜ Not Started | 10 files | 0% |
| Phase 6: Dashboard — Section 2 | ⬜ Not Started | 10 files | 0% |
| Phase 7: Trace Viewer | ⬜ Not Started | 5 files | 0% |
| Phase 8: Alert System | ⬜ Not Started | 6 files | 0% |
| Phase 9: Agent Trigger UI | ⬜ Not Started | 5 files | 0% |
| Phase 10: Polish & Demo | ⬜ Not Started | 6 files | 0% |
| **TOTAL** | | **~87 files** | **0%** |

---

## 🔖 Milestone Tracking

- [ ] **M1** — Project boots up (frontend + backend + DB) — *End of Phase 1*
- [ ] **M2** — All 3 agents work standalone (accept input → produce decision) — *End of Phase 2*
- [ ] **M3** — Agent traces flow into database via telemetry pipeline — *End of Phase 3*
- [ ] **M4** — Backend API serves metrics to frontend — *End of Phase 4*
- [ ] **M5** — Section 1 dashboard live with real data — *End of Phase 5*
- [ ] **M6** — Section 2 dashboard live with real data — *End of Phase 6*
- [ ] **M7** — Can click any trace and see full execution flow — *End of Phase 7*
- [ ] **M8** — Alerts fire when thresholds are breached — *End of Phase 8*
- [ ] **M9** — Can trigger agents from the dashboard UI — *End of Phase 9*
- [ ] **M10** — Demo-ready, polished, documented — *End of Phase 10*

---

---

# PHASE 1: Foundation & Setup

> **Goal:** Project scaffolding, database, config, and both frontend/backend boot up.

## Root Configuration Files

### `insureops-ai/`

| # | File | Functionality | Status |
|---|---|---|---|
| 1 | `README.md` | Project overview, setup instructions, how to run, screenshots | ⬜ |
| 2 | `.env.example` | Template for environment variables (API keys, DB URL, ports) | ⬜ |
| 3 | `.gitignore` | Ignore node_modules, __pycache__, .env, venv, dist, etc. | ⬜ |
| 4 | `docker-compose.yml` | Optional: PostgreSQL + backend + frontend container setup | ⬜ |

---

## Database Setup

### `database/`

| # | File | Functionality | Status |
|---|---|---|---|
| 5 | `database/schema.sql` | Full PostgreSQL schema — tables: `traces`, `llm_calls`, `tool_calls`, `guardrail_checks`, `alert_rules`, `alerts`, `metrics_snapshot`. Indexes for fast queries on `agent_type`, `timestamp`, `trace_id`. | ⬜ |
| 6 | `database/seed_data.sql` | Initial seed data — default alert rules (7 rules), sample historical traces for demo, sample metrics for pre-populated dashboard on first load | ⬜ |

---

## Backend Foundation

### `backend/`

| # | File | Functionality | Status |
|---|---|---|---|
| 7 | `backend/package.json` | Node.js dependencies: `express`, `cors`, `dotenv`, `pg`, `sequelize`, `ws`, `uuid`, `joi`, `morgan`, `helmet`, `express-async-errors` | ⬜ |
| 8 | `backend/server.js` | Express.js app entry point. Mounts all routers, initializes DB connection pool, starts WebSocket server, configures CORS for frontend. Listens on configured port. | ⬜ |
| 9 | `backend/src/config/index.js` | Central configuration: loads `.env` via `dotenv`, exports config object with DB_URL, API keys, port numbers, alert thresholds, model names | ⬜ |
| 10 | `backend/src/config/database.js` | Sequelize instance + PostgreSQL connection via `pg`. Connection pooling config. Exports `sequelize` instance and connection test utility. | ⬜ |
| 11 | `backend/src/models/index.js` | Exports all Sequelize models and sets up associations | ⬜ |
| 12 | `backend/src/models/models.js` | Sequelize ORM models matching `schema.sql`: `Trace`, `LLMCall`, `ToolCall`, `GuardrailCheck`, `AlertRule`, `Alert`, `MetricsSnapshot` | ⬜ |

---

## Frontend Foundation

### `frontend/`

| # | File | Functionality | Status |
|---|---|---|---|
| 13 | `frontend/package.json` | Dependencies: `react`, `react-dom`, `react-router-dom`, `recharts`, `axios`, `lucide-react`, `date-fns`, `clsx` | ⬜ |
| 14 | `frontend/vite.config.js` | Vite config: React plugin, dev server proxy to backend (port 5000), build output config | ⬜ |
| 15 | `frontend/index.html` | Root HTML: mounts React app, includes Google Fonts (Inter), meta tags, favicon | ⬜ |
| 16 | `frontend/src/main.jsx` | React entry point: renders `<App />` into `#root`, wraps with BrowserRouter | ⬜ |
| 17 | `frontend/src/App.jsx` | Root component: sidebar navigation layout, React Router routes for all pages (Overview, Section 1, Section 2, Traces, Alerts, Agents) | ⬜ |
| 18 | `frontend/src/index.css` | Global styles: CSS variables (color palette — dark blues, teals, accent orange), dark mode base, typography (Inter), reset, scrollbar styling, card/widget base styles, grid layout utilities, animation keyframes (pulse, fade-in, slide-up) | ⬜ |

### **Phase 1 Checklist:**
- [ ] `npm create vite@latest ./` in frontend
- [ ] `npm install` in backend
- [ ] PostgreSQL running with schema applied
- [ ] Frontend dev server running at `:5173`
- [ ] Backend server running at `:5000`
- [ ] Backend returns `{"status": "ok"}` on GET `/health`
- [ ] Frontend shows sidebar + empty dashboard layout

---

---

# PHASE 2: Insurance AI Agents

> **Goal:** Build 3 real LangGraph agents + 1 simulated data generator. Each agent accepts input, uses tools, makes decisions, and returns structured output.

## Shared Agent Infrastructure

### `agents/`

| # | File | Functionality | Status |
|---|---|---|---|
| 19 | `agents/__init__.py` | Package init, exports agent runner functions | ⬜ |
| 20 | `agents/base_agent.py` | Base agent class/utilities shared across all agents: common input/output schemas (Pydantic models), shared state definition for LangGraph, decorator for telemetry emission, error handling wrapper | ⬜ |

---

## Claims Processing Agent

### `agents/claims_agent/`

| # | File | Functionality | Status |
|---|---|---|---|
| 21 | `agents/claims_agent/__init__.py` | Exports `run_claims_agent(claim_input)` | ⬜ |
| 22 | `agents/claims_agent/agent.py` | **LangGraph workflow definition.** Nodes: `parse_claim` → `lookup_policy` → `check_coverage` → `analyze_claim` (LLM) → `calculate_payout` → `make_decision` → `check_escalation`. Conditional edge: if amount > $10K → escalate. State schema tracks claim data, tool results, LLM responses, decision. | ⬜ |
| 23 | `agents/claims_agent/tools.py` | **Tool definitions** (LangGraph tool format): `policy_lookup(policy_id)` — retrieves policy details from sample data; `coverage_checker(claim_type, policy)` — checks if claim type is covered; `payout_calculator(damage_amount, deductible, coverage_limit)` — calculates approved payout amount. Each tool returns structured dict. | ⬜ |
| 24 | `agents/claims_agent/prompts.py` | Prompt templates: `CLAIM_ANALYSIS_PROMPT` — system prompt with insurance adjuster persona + claim context + policy clauses → outputs decision + reasoning + confidence; `CLAIM_SUMMARY_PROMPT` — summarize claim for trace output. | ⬜ |
| 25 | `agents/claims_agent/rag.py` | **RAG pipeline for policy documents.** Loads PDF with PyMuPDF → chunks text (500 chars, 100 overlap) → embeds with sentence-transformers → stores in FAISS index. `retrieve_relevant_clauses(query, k=5)` returns top matching policy sections. Initializes vector store on first call, caches after. | ⬜ |

---

## Underwriting Risk Agent

### `agents/underwriting_agent/`

| # | File | Functionality | Status |
|---|---|---|---|
| 26 | `agents/underwriting_agent/__init__.py` | Exports `run_underwriting_agent(applicant_input)` | ⬜ |
| 27 | `agents/underwriting_agent/agent.py` | **LangGraph workflow.** Nodes: `validate_application` → `calculate_risk_score` (tool) → `check_medical_risk` (tool) → `check_history` (tool) → `analyze_risk` (LLM) → `recommend_premium` → `make_decision`. Conditional: risk_score > 0.7 → escalate to human. State tracks applicant data, tool results, risk factors, decision. | ⬜ |
| 28 | `agents/underwriting_agent/tools.py` | **Tool definitions:** `risk_score_calculator(age, health_conditions, occupation, coverage_amount)` — weighted score formula; `medical_risk_lookup(conditions_list)` — maps conditions to risk multipliers from lookup table; `historical_data_check(occupation, age_bracket)` — returns historical claim frequency for demographic. | ⬜ |
| 29 | `agents/underwriting_agent/prompts.py` | Prompt templates: `RISK_ANALYSIS_PROMPT` — underwriter persona + applicant profile + all risk factors → outputs risk assessment + premium recommendation + decision + reasoning. | ⬜ |

---

## Fraud Detection Agent

### `agents/fraud_agent/`

| # | File | Functionality | Status |
|---|---|---|---|
| 30 | `agents/fraud_agent/__init__.py` | Exports `run_fraud_agent(claim_input)` | ⬜ |
| 31 | `agents/fraud_agent/agent.py` | **LangGraph workflow.** Nodes: `receive_claim` → `check_duplicates` (tool) → `analyze_patterns` (tool) → `check_claimant_history` (tool) → `evaluate_fraud_risk` (LLM) → `generate_evidence_summary` (LLM) → `make_recommendation`. Conditional: fraud_score > 0.6 → escalate to SIU. State tracks claim data, anomalies found, evidence list, fraud score. | ⬜ |
| 32 | `agents/fraud_agent/tools.py` | **Tool definitions:** `duplicate_claim_checker(claimant_id, claim_description)` — searches for similar claims in history; `pattern_analyzer(claim_data)` — checks for red flags (recent policy, high claim, multiple claims); `claimant_history_lookup(claimant_id)` — returns claim history with frequencies and amounts. | ⬜ |
| 33 | `agents/fraud_agent/prompts.py` | Prompt templates: `FRAUD_ANALYSIS_PROMPT` — fraud investigator persona + claim + anomalies + history → outputs fraud score + evidence summary + recommendation; `EVIDENCE_SUMMARY_PROMPT` — compile evidence into structured report. | ⬜ |

---

## Simulated Customer Support Agent

### `simulator/`

| # | File | Functionality | Status |
|---|---|---|---|
| 34 | `simulator/customer_support_sim.py` | **Generates realistic telemetry** for a customer support chatbot. Produces: conversation traces with intent classification, response latency (normal distribution, mean 800ms), CSAT scores (skewed positive), handoff rates (~15%), tool usage (policy_lookup, faq_search). Includes time-of-day patterns (busy 9-5) and random anomalies. Outputs telemetry in same format as real agents. | ⬜ |
| 35 | `simulator/seed_data.py` | **Generates historical seed data** for all 4 agents. Creates 200+ past traces across the last 7 days with realistic distributions. Populates database so dashboard has data on first load. Includes trending patterns (e.g., fraud agent accuracy slowly declining). | ⬜ |

---

## Sample Data

### `agents/data/`

| # | File | Functionality | Status |
|---|---|---|---|
| 36 | `agents/data/sample_policy.pdf` | Sample insurance policy PDF (created or sourced) used by Claims Agent RAG. Contains sections: coverage types, deductibles, exclusions, claim procedures, payout limits. | ⬜ |
| 37 | `agents/data/sample_claims.json` | 20+ sample claim inputs for testing: varied types (water damage, theft, auto collision, medical), varied amounts ($500-$50,000), some with fraud indicators. | ⬜ |
| 38 | `agents/data/sample_applicants.json` | 15+ sample applicant profiles for underwriting: varied ages, health conditions, occupations, coverage amounts. Mix of low/medium/high risk. | ⬜ |
| 39 | `agents/data/underwriting_guidelines.json` | Underwriting rules: risk factor weights, medical condition multipliers, occupation risk classes, age brackets, coverage limits. | ⬜ |

### **Phase 2 Checklist:**
- [ ] Claims agent: input claim → returns Approve/Reject/Escalate with justification
- [ ] Underwriting agent: input applicant → returns Accept/Reject with premium
- [ ] Fraud agent: input claim → returns fraud score + evidence summary
- [ ] Each agent can run standalone from a Python script
- [ ] Sample data files created and loaded
- [ ] RAG pipeline works for claims agent (policy PDF → FAISS → retrieval)

---

---

# PHASE 3: Telemetry Pipeline

> **Goal:** Instrument agents to emit structured telemetry. Collect, validate, store, and forward telemetry to WebSocket clients.

### `agents/instrumentation/`

| # | File | Functionality | Status |
|---|---|---|---|
| 40 | `agents/instrumentation/__init__.py` | Exports tracer and collector | ⬜ |
| 41 | `agents/instrumentation/tracer.py` | **Telemetry tracer.** Wraps agent execution to capture: (1) every LLM call (model, tokens, latency, cost, status), (2) every tool call (name, params, result, duration), (3) guardrail checks (PII scan on input/output, bias flag check), (4) final decision + confidence + escalation. Generates unique `trace_id` (UUID). Calculates `prompt_quality_score` based on token count, structure, template match. Timestamps every step. Returns complete `TraceRecord` (Pydantic model). | ⬜ |
| 42 | `agents/instrumentation/metrics.py` | **Metrics calculator.** Takes raw traces and computes aggregated metrics: P50/P95/P99 latency, rolling accuracy (window=50), cost per agent per hour/day, escalation rate, tool usage frequency, drift score (output distribution compared to baseline). Exports `compute_section1_metrics()` and `compute_section2_metrics()`. | ⬜ |
| 43 | `agents/instrumentation/collector.py` | **Telemetry collector.** Receives `TraceRecord` from tracer → validates schema → writes to PostgreSQL (inserts into `traces`, `llm_calls`, `tool_calls`, `guardrail_checks` tables) → forwards to WebSocket manager for real-time dashboard update → checks alert rules against new data → triggers alerts if thresholds breached. Async, non-blocking. | ⬜ |
| 44 | `agents/instrumentation/guardrails.py` | **Guardrail checks.** `check_pii(text)` — regex + pattern matching for SSN, phone, email, credit card in agent I/O; `check_bias(decision, applicant_data)` — flags if decisions correlate with protected attributes; `check_safety(response)` — ensures responses don't contain harmful content. Returns `GuardrailResult`. | ⬜ |
| 45 | `agents/instrumentation/schemas.py` | **Pydantic models** for all telemetry: `TraceRecord`, `LLMCallRecord`, `ToolCallRecord`, `GuardrailResult`, `DecisionRecord`, `Section1Metrics`, `Section2Metrics`. Shared across agents, collector, and API. | ⬜ |

### **Phase 3 Checklist:**
- [ ] Run any agent → `TraceRecord` is generated with all fields populated
- [ ] `TraceRecord` is saved to PostgreSQL (all 4 tables populated)
- [ ] Metrics calculator produces correct aggregates from stored traces
- [ ] Guardrail checks detect PII patterns correctly
- [ ] WebSocket forward works (trace appears on connected clients)

---

---

# PHASE 4: Backend API

> **Goal:** REST API + WebSocket endpoints serving metrics, traces, and alerts to the frontend.

### `backend/src/routes/`

| # | File | Functionality | Status |
|---|---|---|---|
| 46 | `backend/src/routes/index.js` | Registers all routers with Express app | ⬜ |
| 47 | `backend/src/routes/metrics.js` | **Metrics endpoints.** `GET /api/metrics/overview` — top-level KPIs (total traces, avg latency, total cost, active alerts); `GET /api/metrics/section1` — all Section 1 metrics (prompt quality, accuracy, latency percentiles, API rates, cost breakdown, drift scores); `GET /api/metrics/section2` — all Section 2 metrics (approval rates, agent performance, decisions, tool usage, escalations, compliance); `GET /api/metrics/agent/:agent_type` — filtered metrics for one agent. All accept `?timerange=1h|6h|24h|7d` query param. | ⬜ |
| 48 | `backend/src/routes/traces.js` | **Traces endpoints.** `GET /api/traces` — paginated list (params: page, limit, agent_type, decision, status, date_from, date_to); `GET /api/traces/:trace_id` — full trace detail with nested LLM calls, tool calls, guardrail checks, decision; `GET /api/traces/recent` — last 20 traces for live feed. | ⬜ |
| 49 | `backend/src/routes/agents.js` | **Agent trigger endpoints.** `POST /api/agents/claims/run` — accepts `{claim_description, policy_id, amount}`; `POST /api/agents/underwriting/run` — accepts `{name, age, health_conditions, occupation, coverage_amount}`; `POST /api/agents/fraud/run` — accepts `{claim_id, claimant_id, claim_description, amount}`; `GET /api/agents/status` — health check for all agents. Each POST triggers agent → telemetry collector → returns `{trace_id, decision, summary}`. | ⬜ |
| 50 | `backend/src/routes/alerts.js` | **Alerts endpoints.** `GET /api/alerts` — all alerts (params: severity, acknowledged, date range); `GET /api/alerts/active` — unacknowledged alerts only; `POST /api/alerts/rules` — create new alert rule; `GET /api/alerts/rules` — list all rules; `PUT /api/alerts/:id/acknowledge` — mark alert as acknowledged; `DELETE /api/alerts/rules/:id` — remove a rule. | ⬜ |

### `backend/src/core/`

| # | File | Functionality | Status |
|---|---|---|---|
| 51 | `backend/src/core/alertEngine.js` | **Alert evaluation engine.** On each new trace ingestion: queries relevant metric (e.g., rolling P95 latency), compares against all active alert rules, fires alerts for breached thresholds. `evaluateAlerts(trace)` — main function. Handles deduplication (don't fire same alert within 5 min window). Updates `alerts` table. Pushes to WebSocket. | ⬜ |
| 52 | `backend/src/core/analytics.js` | **Analytics engine.** Time-series aggregation queries: `getLatencyPercentiles(agent, timerange)`, `getCostBreakdown(timerange)`, `getAccuracyTrend(agent, timerange)`, `getEscalationRate(agent, timerange)`, `getToolUsageDistribution(agent)`, `getDriftScore(agent)`, `getApprovalFunnel(agent)`. Optimized SQL queries with proper indexing. | ⬜ |

### `backend/src/`

| # | File | Functionality | Status |
|---|---|---|---|
| 53 | `backend/src/websocket.js` | **WebSocket manager.** Manages connected clients using the `ws` library. Channels: `dashboard` (metric updates every 5s), `traces` (new traces pushed immediately), `alerts` (alert notifications pushed immediately). `broadcast(channel, data)` sends to all clients on that channel. Handles connect/disconnect gracefully. | ⬜ |
| 54 | `backend/src/services/metricsService.js` | **Metrics service layer.** Business logic between API routes and analytics engine. Formats metrics into frontend-expected shapes. Caches frequently requested aggregations (TTL 10s). Handles time range conversions. | ⬜ |
| 55 | `backend/src/services/traceService.js` | **Trace service layer.** Fetches and formats trace data. Builds nested trace detail (trace → llm_calls, tool_calls, guardrails). Handles pagination, filtering, sorting logic. | ⬜ |

### **Phase 4 Checklist:**
- [ ] `GET /api/metrics/section1` returns valid JSON with all 6 metric groups
- [ ] `GET /api/metrics/section2` returns valid JSON with all 6 metric groups
- [ ] `GET /api/traces` returns paginated trace list
- [ ] `GET /api/traces/:id` returns full nested trace
- [ ] `POST /api/agents/claims/run` triggers agent and returns result
- [ ] WebSocket `/ws/dashboard` sends metric updates to connected clients
- [ ] `GET /api/alerts/active` returns alerts

---

---

# PHASE 5: Dashboard — Section 1 (AI Application Monitoring)

> **Goal:** Build all 6 widgets for AI infrastructure metrics.

### `frontend/src/components/shared/`

| # | File | Functionality | Status |
|---|---|---|---|
| 56 | `Sidebar.jsx` + `Sidebar.css` | **Navigation sidebar.** Links: Overview, AI Monitoring (Section 1), Agent Monitoring (Section 2), Trace Explorer, Alerts, Agent Console. Active link highlighting, InsureOps AI logo at top, collapse toggle. Dark theme. Icons via lucide-react. | ⬜ |
| 57 | `MetricCard.jsx` + `MetricCard.css` | **Reusable metric card.** Displays: title, large metric value, trend indicator (↑↓), sparkline, subtitle. Glassmorphism card style with subtle border. Supports variants: default, success (green), warning (yellow), critical (red). | ⬜ |
| 58 | `TimeRangeSelector.jsx` | **Time range selector.** Pill toggle: 1h, 6h, 24h, 7d. Emits `onRangeChange(range)` to parent. Persists selection in URL params. All widgets re-fetch data when range changes. | ⬜ |
| 59 | `AlertBadge.jsx` | **Alert notification badge.** Bell icon in top bar. Shows count of active alerts. Clicking opens alert panel. Pulses when new alert arrives via WebSocket. | ⬜ |

### `frontend/src/services/`

| # | File | Functionality | Status |
|---|---|---|---|
| 60 | `api.js` | **API client.** Axios instance with base URL config. Functions: `getSection1Metrics(range)`, `getSection2Metrics(range)`, `getTraces(params)`, `getTraceDetail(id)`, `triggerAgent(type, input)`, `getAlerts()`, `acknowledgeAlert(id)`. Centralized error handling. | ⬜ |
| 61 | `websocket.js` | **WebSocket client.** Connects to `ws://localhost:5000/ws/dashboard`. Auto-reconnect on disconnect. Exposes `subscribe(channel, callback)` and `unsubscribe(channel)`. Dispatches incoming messages to registered callbacks. | ⬜ |

### `frontend/src/hooks/`

| # | File | Functionality | Status |
|---|---|---|---|
| 62 | `useMetrics.js` | **Custom hook.** Fetches Section 1 or Section 2 metrics on mount and timerange change. Subscribes to WebSocket for real-time updates. Returns `{ data, loading, error }`. Merges REST response with WebSocket deltas. | ⬜ |
| 63 | `useWebSocket.js` | **WebSocket hook.** Manages connection lifecycle within React components. Returns `{ connected, lastMessage, subscribe }`. Handles cleanup on unmount. | ⬜ |

### `frontend/src/pages/`

| # | File | Functionality | Status |
|---|---|---|---|
| 64 | `OverviewPage.jsx` + `OverviewPage.css` | **Dashboard home.** Top KPI row: Total Traces (24h), Avg Latency, Total Cost, Active Alerts, Overall Accuracy. Below: mini versions of key charts from both sections. Quick-glance health status per agent (green/yellow/red dot). | ⬜ |

### `frontend/src/components/section1/`

| # | File | Functionality | Status |
|---|---|---|---|
| 65 | `Section1Page.jsx` + `Section1Page.css` | **Section 1 layout.** Page header: "AI Application Monitoring". TimeRangeSelector. 2×3 grid of widget cards. Each card is its own component below. | ⬜ |
| 66 | `PromptQualityWidget.jsx` | **Prompt Quality.** Gauge chart (0-100 score) + line chart (score trend over time). Color: green > 80, yellow 60-80, red < 60. Tooltip: "Based on structure, token count, and template adherence." | ⬜ |
| 67 | `ResponseAccuracyWidget.jsx` | **Response Accuracy.** Multi-line chart (one line per agent, accuracy % over time). Bar chart toggle showing per-agent comparison. Threshold line at 80%. | ⬜ |
| 68 | `LatencyWidget.jsx` | **Latency.** Histogram of response time distribution. Three metric cards: P50, P95, P99. Real-time line chart. SLA breach indicator when P95 > 5s. | ⬜ |
| 69 | `ApiRatesWidget.jsx` | **API Success/Failure.** Donut chart (success vs failure %). Stacked bar chart showing error categories (timeout, 4xx, 5xx, rate_limit) over time. | ⬜ |
| 70 | `CostTrackerWidget.jsx` | **Cost.** Stacked area chart (cost by agent over time). Daily budget gauge. Metric cards: Today's Cost, This Week, Cost/Request avg. Budget line overlay. | ⬜ |
| 71 | `DriftWidget.jsx` | **Model Drift.** Drift score line chart over time. Side-by-side distribution comparison (baseline vs current output distribution). Alert marker when drift > 0.3. | ⬜ |

### **Phase 5 Checklist:**
- [ ] Sidebar navigation works, routes to all pages
- [ ] Section 1 page shows all 6 widgets with real data from API
- [ ] TimeRangeSelector changes data across all widgets
- [ ] WebSocket updates metrics in real-time (no page refresh needed)
- [ ] All charts render correctly with proper tooltips and legends
- [ ] Responsive grid layout (2 columns on desktop)

---

---

# PHASE 6: Dashboard — Section 2 (LLM Agent Monitoring)

> **Goal:** Build all 6 widgets for agent behavior metrics.

### `frontend/src/components/section2/`

| # | File | Functionality | Status |
|---|---|---|---|
| 72 | `Section2Page.jsx` + `Section2Page.css` | **Section 2 layout.** Page header: "LLM Agent Monitoring". Same grid pattern as Section 1. TimeRangeSelector + agent filter dropdown. | ⬜ |
| 73 | `ApprovalRatesWidget.jsx` | **Human Approval Rates.** Funnel chart: Total Decisions → Auto-approved → Human Reviewed → Human Approved → Human Rejected. Per-agent toggle. Override rate metric card. | ⬜ |
| 74 | `AgentPerformanceWidget.jsx` | **Agent Performance.** Scorecard tiles (one per agent): completion rate, success rate, SLA adherence. Sparkline trend on each. Color-coded status (green/yellow/red). | ⬜ |
| 75 | `DecisionAccuracyWidget.jsx` | **Decision Accuracy.** Line chart (accuracy trend per agent). Confusion matrix style table (correct approvals, correct rejections, false approvals, false rejections). Error breakdown list. | ⬜ |
| 76 | `ToolUsageWidget.jsx` | **Tool Usage.** Horizontal bar chart (tool call frequency). Heatmap: tools × time of day. Per-agent breakdown toggle. Success rate per tool. | ⬜ |
| 77 | `EscalationWidget.jsx` | **Escalation Frequency.** Line chart (escalation count over time per agent). Pie chart (reasons: high value, low confidence, policy flag, fraud suspicion). Resolution time metric. | ⬜ |
| 78 | `ComplianceWidget.jsx` | **Safety & Compliance.** Scorecard: PII checks (pass/fail count), Bias flags, Safety violations. Traffic light status per category. Scrollable violation log table with timestamp, agent, type, severity, details. | ⬜ |

### **Phase 6 Checklist:**
- [ ] Section 2 page shows all 6 widgets with real data
- [ ] Agent filter dropdown filters all widgets for a specific agent
- [ ] Funnel chart for approval rates is interactive (hover shows counts)
- [ ] Tool usage heatmap renders correctly
- [ ] Compliance violation log scrolls and shows recent events
- [ ] Real-time updates via WebSocket work for all Section 2 widgets

---

---

# PHASE 7: Trace Viewer

> **Goal:** Interactive trace explorer — list traces, click to see full execution flow.

### `frontend/src/components/traces/`

| # | File | Functionality | Status |
|---|---|---|---|
| 79 | `TracesPage.jsx` + `TracesPage.css` | **Traces list page.** Filter bar: agent type, decision, status, date range. Sortable table: trace_id (truncated), agent, timestamp, latency, cost, decision, status. Pagination. Click row → opens trace detail. | ⬜ |
| 80 | `TraceDetail.jsx` + `TraceDetail.css` | **Trace detail view.** Full-page or slide-out panel. Header: trace_id, agent, timestamp, total latency, total cost, decision badge. Execution timeline: vertical step-by-step with lines connecting steps. Each step shows: icon (LLM/Tool/Decision/Guardrail), name, duration, input/output expandable. Color-coded decision node. | ⬜ |
| 81 | `TraceTimeline.jsx` | **Timeline component.** Renders vertical timeline of execution steps. Each node: step number, type icon, name, duration bar (proportional width), expandable detail. Connected by vertical line. Highlights: tools in blue, LLM calls in purple, decisions in green/red, guardrails in yellow. | ⬜ |
| 82 | `TraceStepCard.jsx` | **Individual step card.** Expandable card showing: step type, name, duration, input (collapsible JSON), output (collapsible JSON/text), status badge. Different border colors per type. | ⬜ |
| 83 | `TraceFilters.jsx` | **Filter component.** Agent type multi-select, decision type checkboxes, date range picker, status toggle (success/error), latency range slider, cost range slider. Applies filters to trace list API call. | ⬜ |

### **Phase 7 Checklist:**
- [ ] Traces page loads with paginated trace list
- [ ] Filters work (agent, decision, date range)
- [ ] Click on trace → full detail view with timeline
- [ ] All steps (LLM, tool, decision, guardrail) visible in timeline
- [ ] Input/output expandable for each step
- [ ] Cost and latency shown per step and total

---

---

# PHASE 8: Alert System

> **Goal:** Alert engine fires on threshold breaches, dashboard displays alerts.

### `frontend/src/components/alerts/`

| # | File | Functionality | Status |
|---|---|---|---|
| 84 | `AlertsPage.jsx` + `AlertsPage.css` | **Alerts page.** Two tabs: "Active Alerts" and "Alert History". Active: cards with severity badge, alert name, current value vs threshold, timestamp, acknowledge button. History: table with all past alerts, sortable. Filter by severity and agent. | ⬜ |
| 85 | `AlertCard.jsx` | **Single alert card.** Shows: severity icon (🔴🟡🔵), alert rule name, description, current value, threshold, agent affected, time triggered, acknowledge button. Critical alerts have red border + pulse animation. | ⬜ |
| 86 | `AlertRulesPanel.jsx` | **Alert rules management.** Table of all alert rules with: name, metric, condition, threshold, severity, enabled toggle. Add new rule form (modal): select metric, set condition (>, <, =), set threshold, set severity. Delete rule button. | ⬜ |
| 87 | `AlertNotificationToast.jsx` | **Toast popup.** Appears top-right when new alert fires via WebSocket. Shows severity icon + alert name + "View" link. Auto-dismisses after 8 seconds. Stacks if multiple alerts. | ⬜ |

### Backend alert integration (already in Phase 4, verified here):

| # | File | Functionality | Status |
|---|---|---|---|
| 88 | `backend/src/core/alertEngine.js` | (Verification) Alert engine correctly evaluates all 7 default rules | ⬜ |
| 89 | `backend/src/routes/alerts.js` | (Verification) CRUD endpoints work, acknowledge works | ⬜ |

### **Phase 8 Checklist:**
- [ ] Alerts page shows active alerts
- [ ] Acknowledge button clears alert from active list
- [ ] Alert history shows all past alerts
- [ ] Toast notification appears when new alert fires (WebSocket)
- [ ] Default 7 alert rules are seeded and functional
- [ ] Can add new custom alert rule via UI

---

---

# PHASE 9: Agent Trigger UI

> **Goal:** Interface to manually trigger agents from the dashboard and see results.

### `frontend/src/components/agents/`

| # | File | Functionality | Status |
|---|---|---|---|
| 90 | `AgentConsolePage.jsx` + `AgentConsolePage.css` | **Agent console page.** Three panels (tabs or columns): Claims, Underwriting, Fraud. Each panel is its own form component below. Shows "Recent Runs" list below the form with the last 5 runs for that agent. | ⬜ |
| 91 | `ClaimsAgentForm.jsx` | **Claims submission form.** Fields: claim description (textarea), policy ID (select from samples), estimated amount (number input). Submit button → calls API → shows processing spinner → displays result card (decision, reasoning, payout, confidence). "View Full Trace" link navigates to trace detail. | ⬜ |
| 92 | `UnderwritingAgentForm.jsx` | **Underwriting form.** Fields: applicant name, age (slider/input), health conditions (multi-select chips), occupation (dropdown), requested coverage (number). Submit → result card (risk score gauge, premium, decision, reasoning). | ⬜ |
| 93 | `FraudAgentForm.jsx` | **Fraud submission form.** Fields: claim ID, claimant ID, claim description, amount, number of past claims. Submit → result card (fraud score gauge 0-1, evidence list, recommendation badge, escalation status). | ⬜ |
| 94 | `AgentResultCard.jsx` | **Shared result card.** Shows: decision badge (Approved/Rejected/Escalated/Flagged), confidence meter, key metrics (latency, cost, tools used), reasoning text, "View Trace" button. Animated entrance. | ⬜ |

### **Phase 9 Checklist:**
- [ ] Can submit a claim from Claims panel → see result
- [ ] Can submit an applicant from Underwriting panel → see result
- [ ] Can submit claim data to Fraud panel → see result
- [ ] Processing spinner shows during agent execution
- [ ] Result card appears with decision, reasoning, metrics
- [ ] "View Trace" link navigates to correct trace in Trace Viewer
- [ ] Recent runs list updates after each submission

---

---

# PHASE 10: Polish & Demo Prep

> **Goal:** UI polish, responsive design, documentation, demo flow, edge cases.

| # | File | Functionality | Status |
|---|---|---|---|
| 95 | `frontend/src/index.css` | (Update) Final polish: smooth transitions on all widgets, hover effects on cards, loading skeleton animations, empty state designs, consistent spacing and alignment audit | ⬜ |
| 96 | `frontend/src/components/shared/LoadingSkeleton.jsx` | **Loading skeletons.** Animated placeholder cards shown while data loads. Matches shape of each widget type. Prevents layout shift. | ⬜ |
| 97 | `frontend/src/components/shared/EmptyState.jsx` | **Empty state.** Shown when no data exists for a widget/page. Illustration + "No data yet — trigger an agent to get started" message + CTA button. | ⬜ |
| 98 | `README.md` | (Update) Full README: project description, screenshots, architecture diagram, setup guide (step-by-step), environment variables, how to run, how to demo, tech stack, team info | ⬜ |
| 99 | `docs/architecture.md` | **Architecture doc.** System diagram, data flow, component descriptions, design decisions, trade-offs. For judges/evaluators. | ⬜ |
| 100 | `docs/demo_script.md` | **Demo script.** Minute-by-minute walkthrough: what to show, what to say, what to click, expected outcomes. Covering the 5-step demo scenario from PROJECT_IDEA.md. | ⬜ |

### **Phase 10 Checklist:**
- [ ] All pages have loading skeletons (no janky loading)
- [ ] All pages have empty states (no blank screens)
- [ ] Transitions and hover effects feel smooth
- [ ] README has clear setup instructions
- [ ] End-to-end demo flow works without errors
- [ ] Can run the entire project from scratch with documented steps

---

---

# 📎 Complete File Index (Quick Reference)

> **All ~100 files at a glance**, organized by directory.

```
insureops-ai/
│
├── README.md                                    # Project overview + setup guide
├── .env.example                                 # Environment template
├── .gitignore                                   # Git ignores
├── docker-compose.yml                           # Container setup (optional)
│
├── database/
│   ├── schema.sql                               # Full DB schema
│   └── seed_data.sql                            # Initial data population
│
├── backend/                                     # Node.js + Express Backend
│   ├── package.json                             # Node.js dependencies
│   ├── server.js                                # Express entry point
│   └── src/
│       ├── config/
│       │   ├── index.js                         # Settings & env vars
│       │   └── database.js                      # Sequelize + PostgreSQL connection
│       ├── websocket.js                         # WebSocket manager (ws)
│       ├── models/
│       │   ├── index.js                         # Model exports & associations
│       │   └── models.js                        # Sequelize ORM models
│       ├── routes/
│       │   ├── index.js                         # Router registration
│       │   ├── metrics.js                       # /api/metrics/* endpoints
│       │   ├── traces.js                        # /api/traces/* endpoints
│       │   ├── agents.js                        # /api/agents/* endpoints
│       │   └── alerts.js                        # /api/alerts/* endpoints
│       ├── core/
│       │   ├── alertEngine.js                   # Alert evaluation logic
│       │   └── analytics.js                     # Time-series aggregations
│       └── services/
│           ├── metricsService.js                # Metrics business logic
│           └── traceService.js                  # Trace formatting logic
│
├── agents/                                      # Insurance AI Agents (Python)
│   ├── __init__.py                              # Agent exports
│   ├── base_agent.py                            # Shared agent utilities
│   ├── claims_agent/
│   │   ├── __init__.py
│   │   ├── agent.py                             # LangGraph claims workflow
│   │   ├── tools.py                             # Claims tools
│   │   ├── prompts.py                           # Claims prompts
│   │   └── rag.py                               # RAG pipeline (PDF → FAISS)
│   ├── underwriting_agent/
│   │   ├── __init__.py
│   │   ├── agent.py                             # LangGraph underwriting workflow
│   │   ├── tools.py                             # Underwriting tools
│   │   └── prompts.py                           # Underwriting prompts
│   ├── fraud_agent/
│   │   ├── __init__.py
│   │   ├── agent.py                             # LangGraph fraud workflow
│   │   ├── tools.py                             # Fraud detection tools
│   │   └── prompts.py                           # Fraud prompts
│   ├── instrumentation/
│   │   ├── __init__.py
│   │   ├── tracer.py                            # Telemetry capture
│   │   ├── metrics.py                           # Metrics computation
│   │   ├── collector.py                         # Store + forward telemetry
│   │   ├── guardrails.py                        # PII, bias, safety checks
│   │   └── schemas.py                           # Pydantic telemetry models
│   └── data/
│       ├── sample_policy.pdf                    # Sample insurance policy
│       ├── sample_claims.json                   # Test claim inputs
│       ├── sample_applicants.json               # Test applicant profiles
│       └── underwriting_guidelines.json         # Risk factor rules
│
├── simulator/
│   ├── customer_support_sim.py                  # Simulated support agent data
│   └── seed_data.py                             # Historical data seeder
│
├── frontend/                                    # React + Vite Dashboard
│   ├── package.json                             # NPM dependencies
│   ├── vite.config.js                           # Vite configuration
│   ├── index.html                               # Root HTML
│   └── src/
│       ├── main.jsx                             # React entry point
│       ├── App.jsx                              # Root layout + routing
│       ├── index.css                            # Global styles + design system
│       ├── services/
│       │   ├── api.js                           # REST API client
│       │   └── websocket.js                     # WebSocket client
│       ├── hooks/
│       │   ├── useMetrics.js                    # Metrics data hook
│       │   └── useWebSocket.js                  # WebSocket hook
│       ├── pages/
│       │   └── OverviewPage.jsx                 # Dashboard home
│       └── components/
│           ├── shared/
│           │   ├── Sidebar.jsx + .css            # Navigation sidebar
│           │   ├── MetricCard.jsx + .css          # Reusable metric card
│           │   ├── TimeRangeSelector.jsx          # Time range toggle
│           │   ├── AlertBadge.jsx                 # Alert bell icon
│           │   ├── LoadingSkeleton.jsx            # Loading placeholders
│           │   └── EmptyState.jsx                 # Empty data state
│           ├── section1/
│           │   ├── Section1Page.jsx + .css         # Section 1 layout
│           │   ├── PromptQualityWidget.jsx        # Prompt quality gauge
│           │   ├── ResponseAccuracyWidget.jsx     # Accuracy charts
│           │   ├── LatencyWidget.jsx              # Latency histogram
│           │   ├── ApiRatesWidget.jsx             # Success/failure donut
│           │   ├── CostTrackerWidget.jsx          # Cost tracking
│           │   └── DriftWidget.jsx                # Drift detection
│           ├── section2/
│           │   ├── Section2Page.jsx + .css         # Section 2 layout
│           │   ├── ApprovalRatesWidget.jsx        # Human approval funnel
│           │   ├── AgentPerformanceWidget.jsx     # Agent scorecards
│           │   ├── DecisionAccuracyWidget.jsx     # Decision analysis
│           │   ├── ToolUsageWidget.jsx            # Tool analytics
│           │   ├── EscalationWidget.jsx           # Escalation trends
│           │   └── ComplianceWidget.jsx           # Safety & compliance
│           ├── traces/
│           │   ├── TracesPage.jsx + .css           # Trace list
│           │   ├── TraceDetail.jsx + .css          # Full trace view
│           │   ├── TraceTimeline.jsx              # Execution timeline
│           │   ├── TraceStepCard.jsx              # Step detail card
│           │   └── TraceFilters.jsx               # Filter controls
│           ├── alerts/
│           │   ├── AlertsPage.jsx + .css           # Alerts dashboard
│           │   ├── AlertCard.jsx                  # Single alert card
│           │   ├── AlertRulesPanel.jsx            # Rules management
│           │   └── AlertNotificationToast.jsx     # Toast popups
│           └── agents/
│               ├── AgentConsolePage.jsx + .css     # Agent trigger hub
│               ├── ClaimsAgentForm.jsx            # Claims input form
│               ├── UnderwritingAgentForm.jsx      # Underwriting form
│               ├── FraudAgentForm.jsx             # Fraud input form
│               └── AgentResultCard.jsx            # Result display
│
└── docs/
    ├── PROJECT_IDEA.md                          # Project concept document
    ├── PRD.md                                   # Product requirements
    ├── ROADMAP.md                               # This file
    ├── architecture.md                          # Architecture deep-dive
    └── demo_script.md                           # Demo walkthrough
```

---

## 🏁 Definition of Done

The project is **demo-ready** when ALL of the following are true:

- [ ] All 3 real agents accept input and return decisions with telemetry
- [ ] Dashboard Section 1 shows 6 live widgets with real + simulated data
- [ ] Dashboard Section 2 shows 6 live widgets with real + simulated data
- [ ] Trace viewer displays full execution flow with tool calls and decisions
- [ ] Alert system fires and displays notifications for threshold breaches
- [ ] Agent console lets users trigger agents and see results inline
- [ ] WebSocket provides real-time updates without page refresh
- [ ] Seed data ensures dashboard looks populated on first load
- [ ] Demo script can be executed end-to-end without errors
- [ ] README provides clear setup instructions

---

*Last Updated: February 17, 2026*
