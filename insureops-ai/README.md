# 🛡️ InsureOps AI

> **AI & Agent Observability Dashboard for Smart Insurance Operations**

A real-time observability dashboard that monitors AI applications and LLM-based agents powering modern insurance operations — from underwriting and claims to fraud detection and customer support.

---

## 📸 Features at a Glance

### Dual-Section Dashboard
- **Section 1 — AI Application Monitoring**: Prompt Quality, Response Accuracy, Latency (P50/P95/P99), API Success/Failure Rates, Cost Tracking, Model Drift Detection
- **Section 2 — LLM Agent Monitoring**: Human Approval Rates, Agent Performance Scorecards, Decision Accuracy, Tool Usage Analytics, Escalation Frequency, Safety & Compliance

### 3 Real AI Agents
- **Claims Processing Agent** — RAG-powered claims evaluation with policy document retrieval
- **Underwriting Risk Agent** — Applicant risk assessment with medical and historical data tools
- **Fraud Detection Agent** — Pattern matching, duplicate checking, and evidence summarization

### Interactive Features
- **Execution Trace Viewer** — Full step-by-step audit trail of every agent decision
- **Real-time Updates** — WebSocket-powered live dashboard (no page refresh needed)
- **Alert System** — Threshold-based anomaly detection with toast notifications
- **Agent Console** — Trigger agents on-demand and inspect results inline

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 7 | Single-page dashboard application |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with custom dark theme |
| **Charts** | Recharts 3 | Data visualization (line, area, bar, pie, gauge) |
| **Animations** | Framer Motion | Smooth UI transitions and micro-interactions |
| **Icons** | Lucide React | Consistent icon system |
| **Backend** | Express.js (Node.js) | REST API server + WebSocket |
| **ORM** | Sequelize 6 | PostgreSQL database abstraction |
| **Database** | PostgreSQL 16 | Persistent storage for traces, metrics, alerts |
| **AI Agents** | Python + LangGraph | Tool-calling agent workflows |
| **LLM Provider** | OpenRouter (GPT-4o-mini) | Language model API for agent reasoning |
| **Real-time** | WebSocket (ws) | Live dashboard updates |
| **Telemetry** | Custom instrumentation | Agent observability pipeline |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** 15+
- **Python** 3.10+ (for AI agents)

### 1. Clone & Configure Environment

```bash
git clone <repository-url>
cd insureops-ai
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/insureops
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insureops
DB_USER=postgres
DB_PASSWORD=password

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# LLM — OpenRouter (get key at https://openrouter.ai)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini

# WebSocket
WS_PORT=5000
```

### 2. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE insureops;"

# Apply schema
psql -U postgres -d insureops -f database/schema.sql

# Seed with demo data
psql -U postgres -d insureops -f database/seed_data.sql
```

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend will start at `http://localhost:5000`. Verify with:
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","service":"InsureOps AI Backend",...}
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at `http://localhost:5173`

### 5. (Optional) Setup Python Agents

```bash
cd agents
pip install -r requirements.txt
```

### 6. Open Dashboard

Navigate to `http://localhost:5173` → Click **"Go to Dashboard"**

---

## 📁 Project Structure

```
insureops-ai/
├── frontend/                    # React + Vite Dashboard
│   ├── src/
│   │   ├── pages/              # Route-level page components
│   │   ├── components/
│   │   │   ├── section1/       # 6 AI Application Monitoring widgets
│   │   │   ├── section2/       # 6 LLM Agent Monitoring widgets
│   │   │   ├── traces/         # Trace Explorer components
│   │   │   ├── alerts/         # Alert system components
│   │   │   ├── agents/         # Agent Console forms
│   │   │   ├── shared/         # Reusable components (MetricCard, etc.)
│   │   │   └── layout/         # Sidebar, DashboardLayout
│   │   ├── services/           # API client, WebSocket client
│   │   └── hooks/              # Custom React hooks
│   └── vite.config.js
│
├── backend/                     # Express.js API Server
│   ├── server.js               # Entry point
│   └── src/
│       ├── config/             # Database + app config
│       ├── models/             # Sequelize ORM models
│       ├── routes/             # API route handlers
│       ├── services/           # Business logic layer
│       ├── core/               # Alert engine, analytics
│       └── websocket.js        # WebSocket server (ws)
│
├── agents/                      # Python AI Agents
│   ├── claims_agent/           # Claims processing (RAG + LLM)
│   ├── underwriting_agent/     # Risk assessment
│   ├── fraud_agent/            # Fraud detection
│   ├── instrumentation/        # Telemetry pipeline
│   └── data/                   # Sample data files
│
├── simulator/                   # Data generation
│   ├── customer_support_sim.py # Simulated support agent data
│   └── seed_data.py            # Historical data seeder
│
├── database/                    # SQL files
│   ├── schema.sql              # Full PostgreSQL schema
│   └── seed_data.sql           # Demo seed data
│
├── docs/                        # Documentation
│   ├── architecture.md         # Architecture deep-dive
│   └── demo_script.md          # Demo walkthrough
│
├── docker-compose.yml           # Container orchestration
├── .env.example                 # Environment template
└── .gitignore                   # Git ignores
```

---

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/metrics/overview` | Dashboard-level KPIs |
| `GET` | `/api/metrics/section1` | AI Application metrics |
| `GET` | `/api/metrics/section2` | LLM Agent metrics |
| `GET` | `/api/metrics/agent/:type` | Per-agent metrics |
| `GET` | `/api/traces` | List traces (paginated) |
| `GET` | `/api/traces/:trace_id` | Full trace detail |
| `POST` | `/api/agents/claims/run` | Trigger Claims Agent |
| `POST` | `/api/agents/underwriting/run` | Trigger Underwriting Agent |
| `POST` | `/api/agents/fraud/run` | Trigger Fraud Agent |
| `GET` | `/api/alerts` | List all alerts |
| `GET` | `/api/alerts/active` | Active alerts only |
| `PUT` | `/api/alerts/:id/acknowledge` | Acknowledge alert |

### WebSocket

| Channel | Description |
|---|---|
| `ws://localhost:5000/ws/dashboard` | Real-time metric updates |
| `ws://localhost:5000/ws/traces` | Live trace feed |
| `ws://localhost:5000/ws/alerts` | Alert notifications |

---

## 🐳 Docker Setup (Alternative)

```bash
docker-compose up -d
```

This starts PostgreSQL, backend, and frontend. Access the dashboard at `http://localhost:5173`.

---

## 🎬 Demo Flow

See [docs/demo_script.md](docs/demo_script.md) for a detailed 10-12 minute demo walkthrough covering:
1. Landing Page → Dashboard Overview
2. AI Application Monitoring (Section 1)
3. LLM Agent Monitoring (Section 2)
4. Trace Explorer
5. Alert System
6. Agent Console (live agent trigger)

---

## 🏗️ Architecture

See [docs/architecture.md](docs/architecture.md) for:
- System architecture diagram
- Data flow documentation
- Technology decisions
- Security considerations

---

*InsureOps AI — Built for smart insurance operations | February 2026*
