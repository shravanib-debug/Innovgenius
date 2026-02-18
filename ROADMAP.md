# 🗺️ InsureOps AI — Project Roadmap & File Tracker

> Complete build plan, file-by-file breakdown, and progress tracker for the AI & Agent Observability Dashboard.

---

## 📊 Progress Overview

| Phase | Status | Files | Progress |
|---|---|---|---|
| Phase 1: Foundation & Setup | ✅ Complete | 18 files | 100% |
| Phase 2: Insurance AI Agents | ✅ Complete | 21 files | 100% |
| Phase 3: Telemetry Pipeline | ✅ Complete | 6 files | 100% |
| Phase 4: Backend API | ✅ Complete | 14 files | 100% |
| Phase 5: Dashboard — Section 1 | ✅ Complete | 14 files | 100% |
| Phase 6: Dashboard — Section 2 | ✅ Complete | 7 files | 100% |
| Phase 7: Trace Viewer | ✅ Complete | 5 files | 100% |
| Phase 8: Alert System | ✅ Complete | 6 files | 100% |
| Phase 9: Agent Trigger UI | ✅ Complete | 5 files | 100% |
| Phase 10: Polish & Demo | ✅ Complete | 6 files | 100% |
| **TOTAL** | | **~106 files** | **100%** |

---

## 🔖 Milestone Tracking

- [x] **M1** — Project boots up (frontend + backend + DB) — *End of Phase 1*
- [x] **M2** — All 3 agents work standalone (accept input → produce decision) — *End of Phase 2*
- [x] **M3** — Agent traces flow into database via telemetry pipeline — *End of Phase 3*
- [x] **M4** — Backend API serves metrics to frontend — *End of Phase 4*
- [x] **M5** — Section 1 dashboard live with real data — *End of Phase 5*
- [x] **M6** — Section 2 dashboard live with real data — *End of Phase 6*
- [x] **M7** — Can click any trace and see full execution flow — *End of Phase 7*
- [x] **M8** — Alerts fire when thresholds are breached — *End of Phase 8*
- [x] **M9** — Can trigger agents from the dashboard UI — *End of Phase 9*
- [x] **M10** — Demo-ready, polished, documented — *End of Phase 10*

---

---

# PHASE 1: Foundation & Setup

> **Goal:** Project scaffolding, database, config, and both frontend/backend boot up.

## Root Configuration Files

### `insureops-ai/`

| # | File | Functionality | Status |
|---|---|---|---|
| 1 | `README.md` | Project overview, setup instructions, how to run, API reference | ✅ |
| 2 | `.env.example` | Template for environment variables (API keys, DB URL, ports) | ✅ |
| 3 | `.gitignore` | Ignore node_modules, __pycache__, .env, venv, dist, etc. | ✅ |
| 4 | `docker-compose.yml` | PostgreSQL + backend + frontend container setup | ✅ |

---

## Database Setup

### `database/`

| # | File | Functionality | Status |
|---|---|---|---|
| 5 | `database/schema.sql` | Full PostgreSQL schema — tables: `traces`, `llm_calls`, `tool_calls`, `guardrail_checks`, `alert_rules`, `alerts`, `metrics_snapshot`. Indexes for fast queries on `agent_type`, `timestamp`, `trace_id`. | ✅ |
| 6 | `database/seed_data.sql` | Initial seed data — default alert rules (7 rules), sample historical traces for demo, sample metrics for pre-populated dashboard on first load | ✅ |

---

## Backend Foundation

### `backend/`

| # | File | Functionality | Status |
|---|---|---|---|
| 7 | `backend/package.json` | Node.js dependencies: `express`, `cors`, `dotenv`, `pg`, `sequelize`, `ws`, `uuid`, `joi`, `morgan`, `helmet`, `express-async-errors` | ✅ |
| 8 | `backend/server.js` | Express.js app entry point. Mounts all routers, initializes DB connection pool, starts WebSocket server, configures CORS for frontend. Listens on configured port. | ✅ |
| 9 | `backend/src/config/index.js` | Central configuration: loads `.env` via `dotenv`, exports config object with DB_URL, API keys, port numbers, alert thresholds, model names | ✅ |
| 10 | `backend/src/config/database.js` | Sequelize instance + PostgreSQL connection via `pg`. Connection pooling config. Exports `sequelize` instance and connection test utility. | ✅ |
| 11 | `backend/src/models/index.js` | Exports all Sequelize models and sets up associations | ✅ |
| 12 | `backend/src/models/models.js` | Sequelize ORM models matching `schema.sql`: `Trace`, `LLMCall`, `ToolCall`, `GuardrailCheck`, `AlertRule`, `Alert`, `MetricsSnapshot` | ✅ |

---

## Frontend Foundation

### `frontend/`

| # | File | Functionality | Status |
|---|---|---|---|
| 13 | `frontend/package.json` | Dependencies: `react`, `react-dom`, `react-router-dom`, `recharts`, `axios`, `lucide-react`, `date-fns`, `clsx` | ✅ |
| 14 | `frontend/vite.config.js` | Vite config: React plugin, Tailwind CSS 4, dev server proxy to backend (port 5000), build output config | ✅ |
| 15 | `frontend/index.html` | Root HTML: mounts React app, includes Google Fonts (Inter + Playfair Display), meta tags, SEO description | ✅ |
| 16 | `frontend/src/main.jsx` | React entry point: renders `<App />` into `#root`, wraps with BrowserRouter | ✅ |
| 17 | `frontend/src/App.jsx` | Root component: sidebar navigation layout, React Router routes for all pages (Overview, Section 1, Section 2, Traces, Alerts, Agents) | ✅ |
| 18 | `frontend/src/index.css` | Global styles: CSS variables (dark black/brown theme, orange glow accents), dark mode base, typography (Inter), reset, scrollbar styling, glassmorphism card styles, animation keyframes (pulse, fade-in, slide-up, shimmer, float) | ✅ |

### **Phase 1 Checklist:**
- [x] `npm create vite@latest ./` in frontend
- [x] `npm install` in backend
- [x] PostgreSQL running with schema applied
- [x] Frontend dev server running at `:5173`
- [x] Backend server running at `:5000`
- [x] Backend returns `{"status": "ok"}` on GET `/health`
- [x] Frontend shows sidebar + dashboard layout

---

---

# PHASE 2: Insurance AI Agents

> **Goal:** Build 3 real LangGraph agents + 1 simulated data generator. Each agent accepts input, uses tools, makes decisions, and returns structured output.

## Shared Agent Infrastructure

### `agents/`

| # | File | Functionality | Status |
|---|---|---|---|
| 19 | `agents/__init__.py` | Package init, exports agent runner functions | ✅ |
| 20 | `agents/base_agent.py` | Base agent class/utilities shared across all agents: common input/output schemas (Pydantic models), shared state definition for LangGraph, decorator for telemetry emission, error handling wrapper | ✅ |

---

## Claims Processing Agent

### `agents/claims_agent/`

| # | File | Functionality | Status |
|---|---|---|---|
| 21 | `agents/claims_agent/__init__.py` | Exports `run_claims_agent(claim_input)` | ✅ |
| 22 | `agents/claims_agent/agent.py` | **LangGraph workflow definition.** Nodes: `parse_claim` → `lookup_policy` → `check_coverage` → `analyze_claim` (LLM) → `calculate_payout` → `make_decision` → `check_escalation`. Conditional edge: if amount > $10K → escalate. State schema tracks claim data, tool results, LLM responses, decision. | ✅ |
| 23 | `agents/claims_agent/tools.py` | **Tool definitions** (LangGraph tool format): `policy_lookup(policy_id)`, `coverage_checker(claim_type, policy)`, `payout_calculator(damage_amount, deductible, coverage_limit)`. Each tool returns structured dict. | ✅ |
| 24 | `agents/claims_agent/prompts.py` | Prompt templates: `CLAIM_ANALYSIS_PROMPT`, `CLAIM_SUMMARY_PROMPT` | ✅ |
| 25 | `agents/claims_agent/rag.py` | **RAG pipeline for policy documents.** Loads text → chunks → embeds → stores in FAISS index. `retrieve_relevant_clauses(query, k=5)` returns top matching policy sections. | ✅ |

---

## Underwriting Risk Agent

### `agents/underwriting_agent/`

| # | File | Functionality | Status |
|---|---|---|---|
| 26 | `agents/underwriting_agent/__init__.py` | Exports `run_underwriting_agent(applicant_input)` | ✅ |
| 27 | `agents/underwriting_agent/agent.py` | **LangGraph workflow.** Nodes: `validate_application` → `calculate_risk_score` → `check_medical_risk` → `check_history` → `analyze_risk` (LLM) → `recommend_premium` → `make_decision`. Conditional: risk_score > 0.7 → escalate. | ✅ |
| 28 | `agents/underwriting_agent/tools.py` | **Tool definitions:** `risk_score_calculator`, `medical_risk_lookup`, `historical_data_check`. | ✅ |
| 29 | `agents/underwriting_agent/prompts.py` | Prompt templates: `RISK_ANALYSIS_PROMPT` | ✅ |

---

## Fraud Detection Agent

### `agents/fraud_agent/`

| # | File | Functionality | Status |
|---|---|---|---|
| 30 | `agents/fraud_agent/__init__.py` | Exports `run_fraud_agent(claim_input)` | ✅ |
| 31 | `agents/fraud_agent/agent.py` | **LangGraph workflow.** Nodes: `receive_claim` → `check_duplicates` → `analyze_patterns` → `check_claimant_history` → `evaluate_fraud_risk` (LLM) → `generate_evidence_summary` → `make_recommendation`. Conditional: fraud_score > 0.6 → escalate. | ✅ |
| 32 | `agents/fraud_agent/tools.py` | **Tool definitions:** `duplicate_claim_checker`, `pattern_analyzer`, `claimant_history_lookup`. | ✅ |
| 33 | `agents/fraud_agent/prompts.py` | Prompt templates: `FRAUD_ANALYSIS_PROMPT`, `EVIDENCE_SUMMARY_PROMPT` | ✅ |

---

## Simulated Customer Support Agent

### `simulator/`

| # | File | Functionality | Status |
|---|---|---|---|
| 34 | `simulator/customer_support_sim.py` | **Generates realistic telemetry** for a customer support chatbot. Produces conversation traces with intent classification, response latency, CSAT scores, handoff rates. | ✅ |
| 35 | `simulator/seed_data.py` | **Generates historical seed data** for all 4 agents. Creates 200+ past traces for dashboard population on first load. | ✅ |

---

## Sample Data

### `agents/data/`

| # | File | Functionality | Status |
|---|---|---|---|
| 36 | `agents/data/sample_policy.txt` | Sample insurance policy text used by Claims Agent RAG. Contains sections: coverage types, deductibles, exclusions, claim procedures, payout limits. | ✅ |
| 37 | `agents/data/sample_claims.json` | 20+ sample claim inputs for testing: varied types and amounts, some with fraud indicators. | ✅ |
| 38 | `agents/data/sample_applicants.json` | 15+ sample applicant profiles for underwriting: varied ages, health conditions, occupations. | ✅ |
| 39 | `agents/data/underwriting_guidelines.json` | Underwriting rules: risk factor weights, medical condition multipliers, occupation risk classes. | ✅ |

### **Phase 2 Checklist:**
- [x] Claims agent: input claim → returns Approve/Reject/Escalate with justification
- [x] Underwriting agent: input applicant → returns Accept/Reject with premium
- [x] Fraud agent: input claim → returns fraud score + evidence summary
- [x] Each agent can run standalone from a Python script
- [x] Sample data files created and loaded
- [x] RAG pipeline works for claims agent (policy text → FAISS → retrieval)

---

---

# PHASE 3: Telemetry Pipeline

> **Goal:** Instrument agents to emit structured telemetry. Collect, validate, store, and forward telemetry to WebSocket clients.

### `agents/instrumentation/`

| # | File | Functionality | Status |
|---|---|---|---|
| 40 | `agents/instrumentation/__init__.py` | Exports tracer and collector | ✅ |
| 41 | `agents/instrumentation/tracer.py` | **Telemetry tracer.** Wraps agent execution to capture: LLM calls, tool calls, guardrail checks, final decision + confidence + escalation. Generates unique `trace_id`. Calculates `prompt_quality_score`. Returns complete `TraceRecord`. | ✅ |
| 42 | `agents/instrumentation/metrics.py` | **Metrics calculator.** Computes aggregated metrics: P50/P95/P99 latency, rolling accuracy, cost per agent, escalation rate, tool usage frequency, drift score. | ✅ |
| 43 | `agents/instrumentation/collector.py` | **Telemetry collector.** Receives `TraceRecord` → validates → writes to PostgreSQL → forwards to WebSocket → checks alert rules. | ✅ |
| 44 | `agents/instrumentation/guardrails.py` | **Guardrail checks.** `check_pii(text)`, `check_bias(decision, applicant_data)`, `check_safety(response)`. Returns `GuardrailResult`. | ✅ |
| 45 | `agents/instrumentation/schemas.py` | **Pydantic models** for all telemetry: `TraceRecord`, `LLMCallRecord`, `ToolCallRecord`, `GuardrailResult`, `DecisionRecord`, metrics schemas. | ✅ |

### **Phase 3 Checklist:**
- [x] Run any agent → `TraceRecord` is generated with all fields populated
- [x] `TraceRecord` is saved to PostgreSQL (all 4 tables populated)
- [x] Metrics calculator produces correct aggregates from stored traces
- [x] Guardrail checks detect PII patterns correctly
- [x] WebSocket forward works (trace appears on connected clients)

---

---

# PHASE 4: Backend API

> **Goal:** REST API + WebSocket endpoints serving metrics, traces, and alerts to the frontend.

### `backend/src/routes/`

| # | File | Functionality | Status |
|---|---|---|---|
| 46 | `backend/src/routes/index.js` | Registers all routers with Express app | ✅ |
| 47 | `backend/src/routes/metrics.js` | **Metrics endpoints.** `GET /api/metrics/overview`, `GET /api/metrics/section1`, `GET /api/metrics/section2`, `GET /api/metrics/agent/:agent_type`. All accept `?timerange` query param. | ✅ |
| 48 | `backend/src/routes/traces.js` | **Traces endpoints.** `GET /api/traces` (paginated, filterable), `GET /api/traces/:trace_id` (full detail), `GET /api/traces/recent`. | ✅ |
| 49 | `backend/src/routes/agents.js` | **Agent trigger endpoints.** `POST /api/agents/claims/run`, `POST /api/agents/underwriting/run`, `POST /api/agents/fraud/run`, `GET /api/agents/status`. | ✅ |
| 50 | `backend/src/routes/alerts.js` | **Alerts endpoints.** `GET /api/alerts`, `GET /api/alerts/active`, `POST /api/alerts/rules`, `GET /api/alerts/rules`, `PUT /api/alerts/:id/acknowledge`. | ✅ |

### `backend/src/core/`

| # | File | Functionality | Status |
|---|---|---|---|
| 51 | `backend/src/core/alertEngine.js` | **Alert evaluation engine.** Evaluates incoming telemetry against active alert rules. Handles deduplication. Updates `alerts` table. Pushes to WebSocket. | ✅ |
| 52 | `backend/src/core/analytics.js` | **Analytics engine.** Time-series aggregation queries: latency percentiles, cost breakdown, accuracy trends, escalation rates, tool usage, drift scores. | ✅ |

### `backend/src/`

| # | File | Functionality | Status |
|---|---|---|---|
| 53 | `backend/src/websocket.js` | **WebSocket manager.** Manages connected clients using `ws` library. Channels: `dashboard`, `traces`, `alerts`. | ✅ |
| 54 | `backend/src/services/metricsService.js` | **Metrics service layer.** Business logic between API routes and analytics engine. Formats metrics into frontend-expected shapes. | ✅ |
| 55 | `backend/src/services/traceService.js` | **Trace service layer.** Fetches and formats trace data. Builds nested trace detail. Handles pagination, filtering, sorting. | ✅ |

### Bonus Files (beyond original plan)

| # | File | Functionality | Status |
|---|---|---|---|
| B1 | `backend/src/routes/telemetry.js` | Dedicated telemetry ingestion route for agent traces | ✅ |
| B2 | `backend/src/services/agentService.js` | Agent trigger service layer (Node.js ↔ Python bridge) | ✅ |
| B3 | `backend/src/services/llmService.js` | Direct OpenRouter LLM integration from Node.js | ✅ |
| B4 | `backend/scripts/seed.js` | Node.js database seeding script | ✅ |

### **Phase 4 Checklist:**
- [x] `GET /api/metrics/section1` returns valid JSON with all 6 metric groups
- [x] `GET /api/metrics/section2` returns valid JSON with all 6 metric groups
- [x] `GET /api/traces` returns paginated trace list
- [x] `GET /api/traces/:id` returns full nested trace
- [x] `POST /api/agents/claims/run` triggers agent and returns result
- [x] WebSocket `/ws/dashboard` sends metric updates to connected clients
- [x] `GET /api/alerts/active` returns alerts

---

---

# PHASE 5: Dashboard — Section 1 (AI Application Monitoring)

> **Goal:** Build all 6 widgets for AI infrastructure metrics.

### `frontend/src/components/shared/`

| # | File | Functionality | Status |
|---|---|---|---|
| 56 | `Sidebar.jsx` (in `layout/`) | **Navigation sidebar.** Links: Overview, AI Monitoring, Section 1, Section 2, Trace Explorer, Alerts, Agent Console. Active link highlighting. Dark theme. Icons via lucide-react. | ✅ |
| 57 | `MetricCard.jsx` | **Reusable metric card.** Displays: title, large metric value, trend indicator (↑↓), sparkline, subtitle. Glassmorphism card style. Supports success/warning/critical variants. | ✅ |
| 58 | `TimeRangeSelector.jsx` | **Time range selector.** Pill toggle: 1h, 6h, 24h, 7d. Emits `onRangeChange(range)`. | ✅ |
| 59 | `AlertBadge.jsx` | **Alert notification badge.** Bell icon with active alert count. Pulses on new alerts. | ✅ |

### `frontend/src/services/`

| # | File | Functionality | Status |
|---|---|---|---|
| 60 | `api.js` | **API client.** Axios instance with centralized functions for all endpoints. Error handling. | ✅ |
| 61 | `websocket.js` | **WebSocket client.** Auto-reconnect. `subscribe(channel, callback)` and `unsubscribe(channel)`. | ✅ |

### `frontend/src/hooks/`

| # | File | Functionality | Status |
|---|---|---|---|
| 62 | `useMetrics.js` | **Custom hook.** Fetches metrics on mount and timerange change. Subscribes to WebSocket. Returns `{ data, loading, error }`. | ✅ |
| 63 | `useWebSocket.js` | **WebSocket hook.** Manages connection lifecycle. Returns `{ connected, lastMessage, subscribe }`. | ✅ |

### `frontend/src/pages/`

| # | File | Functionality | Status |
|---|---|---|---|
| 64 | `DashboardPage.jsx` | **Dashboard overview.** Top KPI row: Total Traces (24h), Avg Latency, Total Cost, Active Alerts, Overall Accuracy. Agent health cards. Recent trace activity feed. Quick access cards to Section 1, Section 2, and Alerts. | ✅ |

### `frontend/src/components/section1/`

| # | File | Functionality | Status |
|---|---|---|---|
| 65 | `Section1Page.jsx` | **Section 1 layout.** Page header: "AI Application Monitoring". TimeRangeSelector. 2×3 grid of widget cards. | ✅ |
| 66 | `PromptQualityWidget.jsx` | **Prompt Quality.** Gauge chart (0-100) + line chart trend. Color: green > 80, yellow 60-80, red < 60. | ✅ |
| 67 | `ResponseAccuracyWidget.jsx` | **Response Accuracy.** Multi-line chart (per agent) with threshold line at 80%. | ✅ |
| 68 | `LatencyWidget.jsx` | **Latency.** P50, P95, P99 metric cards + histogram distribution + real-time line chart. | ✅ |
| 69 | `ApiRatesWidget.jsx` | **API Success/Failure.** Donut chart + error category breakdown over time. | ✅ |
| 70 | `CostTrackerWidget.jsx` | **Cost.** Stacked area chart + daily budget gauge + metric cards. | ✅ |
| 71 | `DriftWidget.jsx` | **Model Drift.** Drift score line chart + distribution comparison + alert threshold. | ✅ |

### Bonus Files

| # | File | Functionality | Status |
|---|---|---|---|
| B5 | `DashboardLayout.jsx` | Layout wrapper with sidebar + outlet for nested routes | ✅ |
| B6 | `LandingPage.jsx` | Marketing-style landing page with hero section and feature cards | ✅ |
| B7 | `AIMonitoringPage.jsx` | AI monitoring overview page with SplitFlap animation | ✅ |

### **Phase 5 Checklist:**
- [x] Sidebar navigation works, routes to all pages
- [x] Section 1 page shows all 6 widgets with real data from API
- [x] TimeRangeSelector changes data across all widgets
- [x] WebSocket updates metrics in real-time (no page refresh needed)
- [x] All charts render correctly with proper tooltips and legends
- [x] Responsive grid layout (2 columns on desktop)

---

---

# PHASE 6: Dashboard — Section 2 (LLM Agent Monitoring)

> **Goal:** Build all 6 widgets for agent behavior metrics.

### `frontend/src/components/section2/`

| # | File | Functionality | Status |
|---|---|---|---|
| 72 | `Section2Page.jsx` | **Section 2 layout.** Page header: "LLM Agent Monitoring". Same grid pattern as Section 1. TimeRangeSelector. | ✅ |
| 73 | `ApprovalRatesWidget.jsx` | **Human Approval Rates.** Funnel chart: Total → Auto-approved → Human Reviewed → Approved → Rejected. | ✅ |
| 74 | `AgentPerformanceWidget.jsx` | **Agent Performance.** Scorecard tiles per agent with sparkline trends and color-coded status. | ✅ |
| 75 | `DecisionAccuracyWidget.jsx` | **Decision Accuracy.** Line chart (accuracy trend per agent). Confusion-matrix style error breakdown. | ✅ |
| 76 | `ToolUsageWidget.jsx` | **Tool Usage.** Horizontal bar chart + heatmap. Per-agent breakdown. | ✅ |
| 77 | `EscalationWidget.jsx` | **Escalation Frequency.** Line chart + reason breakdown pie chart. | ✅ |
| 78 | `ComplianceWidget.jsx` | **Safety & Compliance.** Scorecard: PII checks, Bias flags, Safety violations + violation log table. | ✅ |

### **Phase 6 Checklist:**
- [x] Section 2 page shows all 6 widgets with real data
- [x] Agent filter dropdown filters all widgets for a specific agent
- [x] Funnel chart for approval rates is interactive (hover shows counts)
- [x] Tool usage heatmap renders correctly
- [x] Compliance violation log scrolls and shows recent events
- [x] Real-time updates via WebSocket work for all Section 2 widgets

---

---

# PHASE 7: Trace Viewer

> **Goal:** Interactive trace explorer — list traces, click to see full execution flow.

### `frontend/src/components/traces/`

| # | File | Functionality | Status |
|---|---|---|---|
| 79 | `TracesPage.jsx` (in `pages/`) | **Traces list page.** Search bar + filter bar. Sortable trace list (trace_id, agent, timestamp, latency, cost, decision). Click row → opens trace detail panel. | ✅ |
| 80 | `TraceDetail.jsx` | **Trace detail view.** Slide-out panel with header (trace_id, agent, decision badge), key metrics, reasoning block, and full execution timeline. | ✅ |
| 81 | `TraceTimeline.jsx` | **Timeline component.** Vertical step-by-step execution with proportional duration bars. Color-coded by step type (tool=blue, LLM=purple, reasoning=accent). | ✅ |
| 82 | `TraceStepCard.jsx` | **Individual step card.** Expandable card showing: type, name, duration, input/output. | ✅ |
| 83 | `TraceFilters.jsx` | **Filter component.** Agent type pills, decision type checkboxes, status toggle. | ✅ |

### **Phase 7 Checklist:**
- [x] Traces page loads with trace list
- [x] Filters work (agent, decision)
- [x] Click on trace → full detail view with timeline
- [x] All steps (LLM, tool, decision, guardrail) visible in timeline
- [x] Input/output expandable for each step
- [x] Cost and latency shown per step and total

---

---

# PHASE 8: Alert System

> **Goal:** Alert engine fires on threshold breaches, dashboard displays alerts.

### `frontend/src/components/alerts/`

| # | File | Functionality | Status |
|---|---|---|---|
| 84 | `AlertsPage.jsx` (in `pages/`) | **Alerts page.** Filter tabs: All, Active, Acknowledged. Summary cards (total, critical, warnings, acknowledged). Alert card list. Alert rules panel. | ✅ |
| 85 | `AlertCard.jsx` | **Single alert card.** Shows: severity icon, alert rule name, description, current value, threshold, time triggered, acknowledge button. Critical alerts have red border + pulse animation. | ✅ |
| 86 | `AlertRulesPanel.jsx` | **Alert rules management.** Table of all alert rules with name, metric, condition, threshold, severity, enabled toggle. Add new rule form. | ✅ |
| 87 | `AlertNotificationToast.jsx` | **Toast popup.** Appears top-right when new alert fires. Shows severity icon + alert name + action buttons. Auto-dismisses. | ✅ |

### Backend alert integration (verified):

| # | File | Functionality | Status |
|---|---|---|---|
| 88 | `backend/src/core/alertEngine.js` | (Verification) Alert engine correctly evaluates all default rules | ✅ |
| 89 | `backend/src/routes/alerts.js` | (Verification) CRUD endpoints work, acknowledge works | ✅ |

### **Phase 8 Checklist:**
- [x] Alerts page shows active alerts
- [x] Acknowledge button clears alert from active list
- [x] Alert history shows all past alerts
- [x] Toast notification appears when new alert fires (WebSocket)
- [x] Default alert rules are seeded and functional
- [x] Can add new custom alert rule via UI

---

---

# PHASE 9: Agent Trigger UI

> **Goal:** Interface to manually trigger agents from the dashboard and see results.

### `frontend/src/components/agents/`

| # | File | Functionality | Status |
|---|---|---|---|
| 90 | `AgentConsolePage.jsx` (in `pages/`) | **Agent console page.** Three tab panels (Claims, Underwriting, Fraud). Agent selector with status indicators. Form + result in two-column layout. Loading spinner during agent execution. | ✅ |
| 91 | `ClaimsAgentForm.jsx` | **Claims submission form.** Fields: claim description, policy ID, estimated amount. Submit → calls API → displays result card. | ✅ |
| 92 | `UnderwritingAgentForm.jsx` | **Underwriting form.** Fields: applicant name, age, health conditions, occupation, coverage amount. Submit → result card with risk score and premium. | ✅ |
| 93 | `FraudAgentForm.jsx` | **Fraud submission form.** Fields: claim ID, claimant ID, description, amount. Submit → fraud score gauge, evidence list, recommendation. | ✅ |
| 94 | `AgentResultCard.jsx` | **Shared result card.** Shows: decision badge, confidence meter, key metrics (latency, cost, tools used), reasoning text. Animated entrance. | ✅ |

### **Phase 9 Checklist:**
- [x] Can submit a claim from Claims panel → see result
- [x] Can submit an applicant from Underwriting panel → see result
- [x] Can submit claim data to Fraud panel → see result
- [x] Processing spinner shows during agent execution
- [x] Result card appears with decision, reasoning, metrics
- [x] "View Trace" link navigates to correct trace in Trace Viewer
- [x] Recent runs list updates after each submission

---

---

# PHASE 10: Polish & Demo Prep

> **Goal:** UI polish, responsive design, documentation, demo flow, edge cases.

| # | File | Functionality | Status |
|---|---|---|---|
| 95 | `frontend/src/index.css` | (Updated) Final polish: smooth transitions, hover effects, loading skeleton animations, glassmorphism cards, Recharts overrides, animation keyframes | ✅ |
| 96 | `frontend/src/components/shared/LoadingSkeleton.jsx` | **Loading skeletons.** Animated placeholder cards + WidgetSkeleton variant. Shimmer animation. Matches widget shape. | ✅ |
| 97 | `frontend/src/components/shared/EmptyState.jsx` | **Empty state.** Icon + message + description + CTA button. Shown when no data exists. | ✅ |
| 98 | `README.md` | (Updated) Full README: project description, features, tech stack, setup guide (step-by-step), environment variables, API reference, Docker setup, demo flow | ✅ |
| 99 | `docs/architecture.md` | **Architecture doc.** System diagram, data flow, component descriptions, tech stack details, security considerations. | ✅ |
| 100 | `docs/demo_script.md` | **Demo script.** 10-12 minute walkthrough covering all pages and features. Step-by-step instructions with talking points. | ✅ |

### **Phase 10 Checklist:**
- [x] All pages have loading skeletons (no janky loading)
- [x] All pages have empty states (no blank screens)
- [x] Transitions and hover effects feel smooth
- [x] README has clear setup instructions
- [x] End-to-end demo flow works without errors
- [x] Can run the entire project from scratch with documented steps

---

---

# 📎 Complete File Index (Quick Reference)

> **All ~106 files at a glance**, organized by directory.

```
insureops-ai/
│
├── README.md                                    # Project overview + setup guide
├── .env.example                                 # Environment template
├── .env                                         # Local environment config
├── .gitignore                                   # Git ignores
├── docker-compose.yml                           # Container setup
│
├── database/
│   ├── schema.sql                               # Full DB schema
│   └── seed_data.sql                            # Initial data population
│
├── backend/                                     # Node.js + Express Backend
│   ├── package.json                             # Node.js dependencies
│   ├── server.js                                # Express entry point
│   ├── scripts/
│   │   └── seed.js                              # DB seeding script
│   └── src/
│       ├── config/
│       │   ├── index.js                         # Settings & env vars
│       │   └── database.js                      # Sequelize + PostgreSQL
│       ├── websocket.js                         # WebSocket manager (ws)
│       ├── models/
│       │   ├── index.js                         # Model exports & associations
│       │   └── models.js                        # Sequelize ORM models
│       ├── routes/
│       │   ├── index.js                         # Router registration
│       │   ├── metrics.js                       # /api/metrics/* endpoints
│       │   ├── traces.js                        # /api/traces/* endpoints
│       │   ├── agents.js                        # /api/agents/* endpoints
│       │   ├── alerts.js                        # /api/alerts/* endpoints
│       │   └── telemetry.js                     # /api/telemetry/* endpoints
│       ├── core/
│       │   ├── alertEngine.js                   # Alert evaluation logic
│       │   └── analytics.js                     # Time-series aggregations
│       └── services/
│           ├── metricsService.js                # Metrics business logic
│           ├── traceService.js                  # Trace formatting logic
│           ├── agentService.js                  # Agent trigger service
│           └── llmService.js                    # OpenRouter LLM integration
│
├── agents/                                      # Insurance AI Agents (Python)
│   ├── __init__.py                              # Agent exports
│   ├── base_agent.py                            # Shared agent utilities
│   ├── requirements.txt                         # Python dependencies
│   ├── claims_agent/
│   │   ├── __init__.py
│   │   ├── agent.py                             # LangGraph claims workflow
│   │   ├── tools.py                             # Claims tools
│   │   ├── prompts.py                           # Claims prompts
│   │   └── rag.py                               # RAG pipeline (text → FAISS)
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
│       ├── sample_policy.txt                    # Sample insurance policy
│       ├── sample_claims.json                   # Test claim inputs
│       ├── sample_applicants.json               # Test applicant profiles
│       └── underwriting_guidelines.json         # Risk factor rules
│
├── simulator/
│   ├── __init__.py                              # Package init
│   ├── customer_support_sim.py                  # Simulated support agent data
│   └── seed_data.py                             # Historical data seeder
│
├── frontend/                                    # React + Vite Dashboard
│   ├── package.json                             # NPM dependencies
│   ├── vite.config.js                           # Vite + Tailwind + proxy
│   ├── index.html                               # Root HTML + SEO
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
│       │   ├── LandingPage.jsx                  # Marketing landing page
│       │   ├── DashboardPage.jsx                # AI Observability overview
│       │   ├── AIMonitoringPage.jsx             # AI monitoring animation
│       │   ├── Section1Page.jsx                 # AI Application Monitoring
│       │   ├── Section2Page.jsx                 # LLM Agent Monitoring
│       │   ├── TracesPage.jsx                   # Trace Explorer
│       │   ├── AlertsPage.jsx                   # Alert management
│       │   └── AgentConsolePage.jsx             # Agent trigger console
│       └── components/
│           ├── layout/
│           │   ├── DashboardLayout.jsx          # Sidebar + outlet layout
│           │   └── Sidebar.jsx                  # Navigation sidebar
│           ├── shared/
│           │   ├── MetricCard.jsx               # Reusable metric card
│           │   ├── TimeRangeSelector.jsx        # Time range toggle
│           │   ├── AlertBadge.jsx               # Alert bell icon
│           │   ├── LoadingSkeleton.jsx          # Loading placeholders
│           │   └── EmptyState.jsx               # Empty data state
│           ├── section1/
│           │   ├── PromptQualityWidget.jsx      # Prompt quality gauge
│           │   ├── ResponseAccuracyWidget.jsx   # Accuracy charts
│           │   ├── LatencyWidget.jsx            # Latency histogram
│           │   ├── ApiRatesWidget.jsx           # Success/failure donut
│           │   ├── CostTrackerWidget.jsx        # Cost tracking
│           │   └── DriftWidget.jsx              # Drift detection
│           ├── section2/
│           │   ├── ApprovalRatesWidget.jsx      # Human approval funnel
│           │   ├── AgentPerformanceWidget.jsx   # Agent scorecards
│           │   ├── DecisionAccuracyWidget.jsx   # Decision analysis
│           │   ├── ToolUsageWidget.jsx          # Tool analytics
│           │   ├── EscalationWidget.jsx         # Escalation trends
│           │   └── ComplianceWidget.jsx         # Safety & compliance
│           ├── traces/
│           │   ├── TraceDetail.jsx              # Full trace view
│           │   ├── TraceTimeline.jsx            # Execution timeline
│           │   ├── TraceStepCard.jsx            # Step detail card
│           │   └── TraceFilters.jsx             # Filter controls
│           ├── alerts/
│           │   ├── AlertCard.jsx                # Single alert card
│           │   ├── AlertRulesPanel.jsx          # Rules management
│           │   └── AlertNotificationToast.jsx   # Toast popups
│           ├── agents/
│           │   ├── ClaimsAgentForm.jsx          # Claims input form
│           │   ├── UnderwritingAgentForm.jsx    # Underwriting form
│           │   ├── FraudAgentForm.jsx           # Fraud input form
│           │   └── AgentResultCard.jsx          # Result display
│           └── ui/
│               └── container-scroll-animation.jsx  # Scroll animation
│
└── docs/
    ├── architecture.md                          # Architecture deep-dive
    └── demo_script.md                           # Demo walkthrough
```

---

## 🏁 Definition of Done

The project is **demo-ready** when ALL of the following are true:

- [x] All 3 real agents accept input and return decisions with telemetry
- [x] Dashboard Section 1 shows 6 live widgets with real + simulated data
- [x] Dashboard Section 2 shows 6 live widgets with real + simulated data
- [x] Trace viewer displays full execution flow with tool calls and decisions
- [x] Alert system fires and displays notifications for threshold breaches
- [x] Agent console lets users trigger agents and see results inline
- [x] WebSocket provides real-time updates without page refresh
- [x] Seed data ensures dashboard looks populated on first load
- [x] Demo script can be executed end-to-end without errors
- [x] README provides clear setup instructions

---

*Last Updated: February 18, 2026*
