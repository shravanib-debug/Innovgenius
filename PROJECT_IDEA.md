# 🛡️ InsureOps AI — AI & Agent Observability Dashboard for Smart Insurance Operations

> **A real-time observability dashboard that monitors AI applications and LLM-based agents powering modern insurance operations — from underwriting and claims to fraud detection and customer support.**

---

## 📌 Problem Statement

Insurance organizations increasingly rely on AI applications and LLM-based agents for underwriting, claims processing, customer support, and fraud detection. However, **limited visibility** into their behavior, reliability, and human oversight creates **operational and compliance risks**.

The challenge is to design an **Observability Dashboard** with two clear sections:

1. **AI Application Monitoring** — prompt quality, response accuracy, latency, API success/failure rates, cost, and drift
2. **LLM Agent Monitoring** — human approval rates, agent performance, decision accuracy, tool usage, escalation frequency, and safety compliance

The dashboard enables **real-time monitoring, insights, and actionable alerts** for insurance stakeholders.

---

## 🎯 Our Solution

**InsureOps AI** is a full-stack observability platform that combines:

- **3 real, working insurance AI agents** that process claims, assess risk, and detect fraud
- **1 simulated agent** for customer support telemetry
- **A unified dashboard** with dual-section monitoring (AI Apps + LLM Agents)
- **Real-time telemetry pipeline** capturing every LLM call, tool usage, and agent decision
- **Actionable alerts and compliance tracking** for regulated insurance environments

### What Makes This Unique

| Differentiator | Details |
|---|---|
| **Real agents, not mocks** | We build actual working agents — traces flow to the dashboard live |
| **Dual-section design** | Separate AI infrastructure metrics from agent behavior metrics (as required by the PS) |
| **Insurance-specific context** | Domain-tailored metrics like claim approval rates, fraud detection accuracy, regulatory compliance |
| **Decision traceability** | Full audit trail of every agent decision — critical for regulated industries |
| **Human-in-the-loop visibility** | Track when and why humans override AI — a trust metric most platforms ignore |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT DASHBOARD (Frontend)                   │
│                                                                   │
│  ┌──────────────────────────┐  ┌───────────────────────────────┐ │
│  │  SECTION 1:               │  │  SECTION 2:                   │ │
│  │  AI Application Metrics   │  │  LLM Agent Metrics            │ │
│  │  • Prompt Quality         │  │  • Human Approval Rates       │ │
│  │  • Response Accuracy      │  │  • Agent Performance          │ │
│  │  • Latency (P50/P95/P99)  │  │  • Decision Accuracy          │ │
│  │  • API Success/Failure    │  │  • Tool Usage Analytics       │ │
│  │  • Cost Tracking          │  │  • Escalation Frequency       │ │
│  │  • Model Drift            │  │  • Safety & Compliance        │ │
│  └──────────────────────────┘  └───────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  SHARED: Trace Viewer │ Alert Center │ Compliance │ Insights │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │  REST API + WebSocket (real-time)
┌────────────────────────────▼────────────────────────────────────┐
│               EXPRESS.JS BACKEND (Node.js)                        │
│                                                                   │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────┐ ┌──────────┐ │
│  │  Telemetry   │ │  Alert        │ │  Analytics  │ │  REST    │ │
│  │  Collector   │ │  Engine       │ │  Engine     │ │  API     │ │
│  └──────────────┘ └───────────────┘ └────────────┘ └──────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────┬───────┴────────┬──────────────┐
          ▼          ▼                ▼              ▼
     ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐
     │ Claims  │ │ Under-   │ │ Fraud     │ │ Customer  │
     │ Agent   │ │ writing  │ │ Detection │ │ Support   │
     │ (Real)  │ │ Agent    │ │ Agent     │ │ Agent     │
     │         │ │ (Real)   │ │ (Real)    │ │ (Simulated│
     └─────────┘ └──────────┘ └───────────┘ └───────────┘
          │           │             │             │
          └───────────┴─────────────┴─────────────┘
                  OpenTelemetry-inspired instrumentation
                  (every LLM call, tool use, decision → telemetry)
```

---

## 🤖 The Insurance AI Agents

### Agent 1: Claims Processing Agent *(Real)*

Processes insurance claims end-to-end using RAG (Retrieval-Augmented Generation).

| Component | Implementation |
|---|---|
| **Input** | Claim description + policy document (PDF) |
| **RAG Pipeline** | Parse policy PDF → chunk → embed → FAISS vector store → retrieve relevant clauses |
| **LLM Decision** | Analyze claim against policy terms → Approve / Reject / Escalate |
| **Output** | Decision + justification + estimated payout amount |
| **Human-in-Loop** | Claims above $10,000 threshold → escalate to human adjuster |
| **Tools** | `policy_lookup`, `payout_calculator`, `coverage_checker` |
| **Telemetry** | trace_id, latency, tokens, cost, decision, confidence, escalation_flag |

**Inspired by:** ethicalByte1443's Insurance-AI-Agent + AWS Insurance Claims EKS

---

### Agent 2: Underwriting Risk Agent *(Real)*

Evaluates insurance applications and assesses risk levels.

| Component | Implementation |
|---|---|
| **Input** | Applicant profile (age, health history, occupation, coverage amount) |
| **Risk Assessment** | LLM analyzes applicant data against underwriting guidelines |
| **Tools** | `risk_score_calculator`, `medical_risk_lookup`, `historical_data_check` |
| **Decision** | Accept / Conditional Accept / Reject + recommended premium |
| **Human-in-Loop** | High-risk (score > 0.7) or high-value applications → flag for human underwriter |
| **Telemetry** | trace_id, risk_score, tools_used, decision, latency, cost |

**Inspired by:** Insurance-Underwriting-AI + Moneta Agents

---

### Agent 3: Fraud Detection Agent *(Real)*

Analyzes claims for fraudulent patterns and suspicious activity.

| Component | Implementation |
|---|---|
| **Input** | Claim data + claimant history + similar claims |
| **Analysis** | LLM performs pattern matching, anomaly reasoning, evidence summarization |
| **Tools** | `duplicate_claim_checker`, `pattern_analyzer`, `claimant_history_lookup` |
| **Decision** | Fraud risk score (0-1) + evidence summary + recommendation |
| **Human-in-Loop** | Suspected fraud (score > 0.6) → escalate with evidence package to SIU |
| **Telemetry** | trace_id, fraud_score, anomalies_found, tools_used, escalation, latency |

**Inspired by:** Shift Technology + AWS EKS fraud scoring

---

### Agent 4: Customer Support Agent *(Simulated)*

Simulated telemetry mimicking a customer-facing insurance chatbot.

| Component | Implementation |
|---|---|
| **Data Generation** | Python script generating realistic conversation logs |
| **Simulated Metrics** | Intent classification accuracy, response latency, handoff rate, CSAT scores |
| **Purpose** | Populate dashboard with diverse data without building a full chatbot |

---

## 📊 Dashboard Design — Section 1: AI Application Monitoring

### Widgets & Visualizations

#### 1. Prompt Quality Monitor
- **Metric:** Prompt quality score (0-100) based on structure, clarity, and template adherence
- **Viz:** Gauge chart + historical trend line
- **Alert:** Score drops below 60 → warning

#### 2. Response Accuracy Tracker
- **Metric:** Response correctness measured against expected outcomes
- **Viz:** Line chart (accuracy over time) + per-agent breakdown bar chart
- **Alert:** Accuracy drops below 80% → critical alert

#### 3. Latency Dashboard
- **Metric:** P50, P95, P99 response times, Time-to-First-Token (TTFT)
- **Viz:** Histogram distribution + real-time line chart + SLA breach indicator
- **Alert:** P95 exceeds 5s → warning, P99 exceeds 10s → critical

#### 4. API Success/Failure Rates
- **Metric:** HTTP status codes, timeout rates, retry counts, error categorization
- **Viz:** Donut chart (success vs failure) + error category waterfall
- **Alert:** Failure rate exceeds 5% → critical

#### 5. Cost Tracker
- **Metric:** Token usage (input/output), cost per request, cost per agent, daily/weekly burn rate
- **Viz:** Stacked bar chart (cost by agent) + burn-down trend line + budget utilization gauge
- **Alert:** Daily cost exceeds budget threshold → warning

#### 6. Model Drift Detection
- **Metric:** Output distribution shifts, response pattern changes, confidence score drift
- **Viz:** Distribution comparison charts (baseline vs current) + drift score over time
- **Alert:** Drift score exceeds 0.3 → investigation required

---

## 📊 Dashboard Design — Section 2: LLM Agent Monitoring

### Widgets & Visualizations

#### 1. Human Approval Rates
- **Metric:** % decisions auto-approved vs human-reviewed, override frequency
- **Viz:** Funnel chart (Total → Auto-approved → Human-reviewed → Approved → Rejected) + trend over time
- **Insight:** "Underwriting agent has 40% human override rate — model may need retraining"

#### 2. Agent Performance Scorecard
- **Metric:** Task completion rate, success rate, SLA adherence, per-agent comparison
- **Viz:** Scorecard tiles per agent + performance leaderboard + trend sparklines
- **Insight:** Side-by-side comparison of all 4 agents

#### 3. Decision Accuracy
- **Metric:** Correct vs incorrect decisions, decision distribution, confidence calibration
- **Viz:** Accuracy trend line + confusion matrix (for classification decisions) + error breakdown table
- **Insight:** "Claims agent accuracy dropped 8% this week — investigate prompt changes"

#### 4. Tool Usage Analytics
- **Metric:** Which tools each agent calls, frequency, success rate, avg tool calls per task
- **Viz:** Sankey diagram (agent → tools flow) + tool usage heatmap (tool × time)
- **Insight:** "Fraud agent uses duplicate_checker 95% of the time — is it over-relying?"

#### 5. Escalation Frequency
- **Metric:** Escalation rate per agent, reasons for escalation, time to resolution post-escalation
- **Viz:** Trend line (escalations over time) + reason breakdown pie chart + agent comparison
- **Insight:** "Escalation rate increased 25% after model update — rollback recommended"

#### 6. Safety & Compliance Panel
- **Metric:** Guardrail triggers, PII exposure attempts, bias detection flags, regulatory compliance checks
- **Viz:** Compliance scorecard (green/yellow/red) + violation log with severity + audit timeline
- **Insight:** "3 PII exposure attempts blocked in the last 24 hours"

---

## 🔍 Execution Trace Viewer

A detailed view into any single agent execution — the "debugger" for AI agents.

**What it shows for a single trace:**
1. **Timeline view** — step-by-step execution with timestamps
2. **Input/Output** at each step — what the LLM received and generated
3. **Tool calls** — which tools were called, with what parameters, what they returned
4. **Decision point** — the final decision, confidence score, and reasoning
5. **Escalation details** — if escalated, why and to whom
6. **Cost breakdown** — tokens and cost for this specific execution
7. **Guardrail checks** — any safety flags triggered

```
┌─ Trace #TR-2026-0216-001 ──────────────────────────────┐
│ Agent: Claims Processing │ Duration: 3.2s │ Cost: $0.04 │
├─────────────────────────────────────────────────────────┤
│ ① Received claim: "Water damage to basement..."        │
│ ② Tool: policy_lookup(policy_id="POL-1234") → Found    │
│ ③ Tool: coverage_checker(type="water_damage") → Covered│
│ ④ LLM Analysis: Claim valid, within coverage terms     │
│ ⑤ Tool: payout_calculator(damage=$8,500) → $7,200      │
│ ⑥ Decision: APPROVED │ Confidence: 0.91                │
│ ⑦ Guardrails: ✅ No PII leak │ ✅ No bias detected      │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 Alert System

### Alert Types

| Type | Example | Severity |
|---|---|---|
| **Latency Spike** | Claims agent P95 > 5s for 10 minutes | ⚠️ Warning |
| **Accuracy Drop** | Fraud detection accuracy < 75% | 🔴 Critical |
| **Cost Overrun** | Daily spend exceeds $50 budget | ⚠️ Warning |
| **Compliance Violation** | PII detected in agent response | 🔴 Critical |
| **High Escalation** | Escalation rate > 50% for any agent | ⚠️ Warning |
| **Model Drift** | Drift score > 0.3 detected | 🟡 Investigation |
| **API Failure** | Success rate drops below 95% | 🔴 Critical |

### Alert Delivery
- **Dashboard notifications** — real-time banner + bell icon
- **Alert history log** — searchable, filterable table of all past alerts

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React + Vite | Fast, modern, most common in reference projects |
| **UI Components** | ShadCN UI / Custom | Clean, professional look |
| **Charts** | Recharts + custom D3.js | Flexible charting for complex visualizations |
| **Backend** | Express.js (Node.js) | JavaScript full-stack consistency, fast async I/O, pairs well with React |
| **ORM** | Sequelize | Mature PostgreSQL ORM for Node.js with migration support |
| **Agent Framework** | LangGraph (Python) | Best for tool-calling agents with built-in tracing |
| **LLM Provider** | Google Gemini API / OpenAI | Cost-effective, reliable |
| **Real-time** | WebSocket (ws library) | Live dashboard updates via Node.js WebSocket server |
| **Database** | PostgreSQL | Structured metrics, traces, alerts |
| **Vector Store** | FAISS | For RAG in claims agent |
| **PDF Processing** | PyMuPDF | Policy document parsing |

---

## 📁 Project Structure

```
insureops-ai/
├── frontend/                    # React + Vite Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Main dashboard layout
│   │   │   ├── section1/        # AI Application Monitoring widgets
│   │   │   ├── section2/        # LLM Agent Monitoring widgets
│   │   │   ├── traces/          # Trace viewer components
│   │   │   ├── alerts/          # Alert management UI
│   │   │   └── shared/          # Reusable components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client + WebSocket
│   │   ├── utils/               # Helper functions
│   │   └── App.jsx
│   └── package.json
│
├── backend/                     # Express.js (Node.js) Backend
│   ├── src/
│   │   ├── routes/              # Express route handlers
│   │   │   ├── metrics.js       # Metrics endpoints
│   │   │   ├── traces.js        # Trace endpoints
│   │   │   ├── alerts.js        # Alert endpoints
│   │   │   └── agents.js        # Agent trigger endpoints
│   │   ├── core/                # Core business logic
│   │   │   ├── alertEngine.js   # Alert evaluation logic
│   │   │   └── analytics.js     # Aggregation & insights
│   │   ├── models/              # Sequelize database models
│   │   ├── config/              # App config & DB connection
│   │   ├── services/            # Business logic services
│   │   └── websocket.js         # WebSocket manager (ws)
│   ├── package.json
│   └── server.js
│
├── agents/                      # Insurance AI Agents (Python)
│   ├── claims_agent/            # Claims processing agent
│   │   ├── agent.py
│   │   ├── tools.py
│   │   └── prompts.py
│   ├── underwriting_agent/      # Underwriting risk agent
│   │   ├── agent.py
│   │   ├── tools.py
│   │   └── prompts.py
│   ├── fraud_agent/             # Fraud detection agent
│   │   ├── agent.py
│   │   ├── tools.py
│   │   └── prompts.py
│   ├── instrumentation/         # Shared telemetry instrumentation
│   │   ├── tracer.py
│   │   ├── metrics.py
│   │   └── collector.py
│   └── data/                    # Sample data, policy PDFs, etc.
│
├── simulator/                   # Data simulation
│   ├── customer_support_sim.py  # Customer support agent telemetry
│   └── seed_data.py             # Initial dashboard data
│
├── database/
│   ├── schema.sql               # Database schema
│   └── migrations/
│
├── docs/                        # Documentation
│   ├── PROJECT_IDEA.md
│   ├── PRD.md
│   └── architecture.md
│
├── docker-compose.yml           # Optional containerization
├── .env.example
└── README.md
```

---

## 📅 Implementation Timeline

| Phase | Duration | Deliverables |
|---|---|---|
| **Phase 1: Foundation** | Day 1 | Project scaffolding, DB schema, Express.js backend skeleton, React frontend setup |
| **Phase 2: Agents** | Day 2-3 | 3 working agents (Claims, Underwriting, Fraud) with LangGraph |
| **Phase 3: Telemetry** | Day 3-4 | Instrumentation layer, telemetry collector, data flowing to DB |
| **Phase 4: Dashboard - Section 1** | Day 4-5 | All 6 AI Application Monitoring widgets |
| **Phase 5: Dashboard - Section 2** | Day 5-6 | All 6 LLM Agent Monitoring widgets |
| **Phase 6: Trace Viewer** | Day 7 | Interactive execution trace explorer |
| **Phase 7: Alerts** | Day 8 | Alert engine, compliance panel, notification system |
| **Phase 8: Polish** | Day 9-10 | UI polish, demo flow, documentation, testing |

---

## 🎤 Demo Scenario

1. **"Let me show you InsureOps AI in action"**
   - Open the dashboard — all metrics updating in real-time

2. **"A new claim just came in"**
   - Submit a claim to the Claims Agent
   - Watch the trace appear live on the dashboard
   - Click into the trace → see the full decision flow

3. **"Our AI approved it, but here's the oversight"**
   - Show Section 2 metrics — human approval rates, agent performance
   - Show the escalation that happened for a high-value claim

4. **"Now watch what happens with a suspicious claim"**
   - Submit a potentially fraudulent claim
   - Fraud agent flags it → alert fires on the dashboard
   - Show the compliance panel with the audit trail

5. **"This is the visibility insurance companies need to trust their AI"**
   - Show cost tracking, drift detection, compliance scorecard
   - Emphasize: "Without this, AI in insurance is a black box"

---

## 🧠 Key Inspirations & References

| What We Borrowed | From Where |
|---|---|
| Trace visualization & prompt management | Langfuse (MIT, 6K+ stars) |
| Execution graph for agents | AgentNeo |
| Real-time WebSocket updates | AI Observer |
| RAG-based claims processing | ethicalByte1443's Insurance-AI-Agent |
| 4-persona portal & fraud scoring | AWS Insurance Claims EKS |
| Drift detection methodology | Arize AI / Phoenix |
| Compliance & governance layer | WitnessAI + Elastic |
| Cost tracking & alerts | Braintrust + LangSmith |

---

*Project: InsureOps AI | Version: 1.1 | Last Updated: February 2026*
