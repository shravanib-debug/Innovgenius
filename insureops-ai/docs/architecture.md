# 🏗️ InsureOps AI — Architecture Overview

## System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     InsureOps AI Platform                     │
├──────────────────┬──────────────────┬─────────────────────────┤
│    Frontend      │     Backend      │     AI Agents           │
│   (React+Vite)   │  (Express.js)    │     (Python)            │
│                  │                  │                         │
│  ┌────────────┐  │  ┌────────────┐  │  ┌─────────────────┐   │
│  │ Landing    │  │  │ REST API   │  │  │  Claims Agent   │   │
│  │ Page       │  │  │ Routes     │  │  │  (LangGraph)    │   │
│  ├────────────┤  │  ├────────────┤  │  ├─────────────────┤   │
│  │ Dashboard  │──┼──│ Metrics    │  │  │ Underwriting    │   │
│  │ Overview   │  │  │ Service    │  │  │ Agent           │   │
│  ├────────────┤  │  ├────────────┤  │  ├─────────────────┤   │
│  │ Section 1  │  │  │ Trace      │  │  │  Fraud Agent    │   │
│  │ AI Metrics │  │  │ Service    │  │  │                 │   │
│  ├────────────┤  │  ├────────────┤  │  ├─────────────────┤   │
│  │ Section 2  │  │  │ Alert      │  │  │  Support Sim    │   │
│  │ Agent Mon  │  │  │ Engine     │  │  │  (Simulator)    │   │
│  ├────────────┤  │  ├────────────┤  │  └────────┬────────┘   │
│  │ Traces     │  │  │ WebSocket  │  │           │            │
│  │ Explorer   │  │  │ Server     │◄─┼───────────┘            │
│  ├────────────┤  │  ├────────────┤  │  ┌─────────────────┐   │
│  │ Alerts     │  │  │ Telemetry  │◄─┼──│ Instrumentation │   │
│  │ Manager    │  │  │ Ingestion  │  │  │  ├─ Tracer      │   │
│  ├────────────┤  │  └─────┬──────┘  │  │  ├─ Metrics     │   │
│  │ Agent      │  │        │         │  │  ├─ Collector    │   │
│  │ Console    │  │        ▼         │  │  ├─ Guardrails   │   │
│  └────────────┘  │  ┌────────────┐  │  │  └─ Schemas     │   │
│                  │  │ PostgreSQL │  │  └─────────────────┘   │
│                  │  │ Database   │  │                         │
│                  │  └────────────┘  │                         │
└──────────────────┴──────────────────┴─────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 7 | SPA Dashboard |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Charts** | Recharts 3 | Data visualization |
| **Animation** | Framer Motion | UI transitions |
| **Icons** | Lucide React | Icon system |
| **Backend** | Express.js (Node.js) | REST API + WebSocket |
| **ORM** | Sequelize 6 | Database abstraction |
| **Database** | PostgreSQL 16 | Persistent storage |
| **AI Agents** | Python + LangGraph | Agent workflows |
| **LLM** | OpenRouter (GPT-4o-mini) | Language model API |
| **Telemetry** | Custom instrumentation | Agent observability |

## Data Flow

### 1. Agent Execution Flow
```
User Input → Agent Console (React) 
  → POST /api/agents/:type/run (Express)
  → Python Agent (LangGraph workflow)
  → Instrumentation (Tracer + Metrics)
  → POST /api/telemetry/ingest (Express)
  → PostgreSQL (traces, metrics tables)
  → WebSocket broadcast → Dashboard update
```

### 2. Dashboard Data Flow
```
Dashboard Widget (React)
  → GET /api/metrics/:section (Express)
  → Analytics Service (time-series queries)
  → PostgreSQL (aggregation queries)
  → JSON response → Recharts visualization
```

### 3. Real-time Alert Flow
```
Telemetry Ingestion → Alert Engine evaluation
  → If rule breached: INSERT alert record
  → WebSocket broadcast { channel: 'alerts', payload }
  → AlertNotificationToast (React) → User notification
```

## Directory Structure

```
insureops-ai/
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── section1/  # AI Application Monitoring widgets
│   │   │   ├── section2/  # LLM Agent Monitoring widgets
│   │   │   ├── traces/    # Trace Explorer components
│   │   │   ├── alerts/    # Alert system components
│   │   │   ├── agents/    # Agent Console forms
│   │   │   ├── shared/    # Shared components (MetricCard, etc)
│   │   │   ├── layout/    # Sidebar, DashboardLayout
│   │   │   └── ui/        # Generic UI primitives
│   │   ├── pages/         # Route-level page components
│   │   ├── services/      # API client, WebSocket client
│   │   └── hooks/         # Custom React hooks
│   └── vite.config.js     # Vite + Tailwind + proxy config
│
├── backend/               # Express.js API
│   ├── server.js          # Entry point
│   └── src/
│       ├── config/        # Database + app config
│       ├── models/        # Sequelize models
│       ├── routes/        # API route handlers
│       ├── services/      # Business logic
│       ├── core/          # Alert engine, analytics
│       └── websocket.js   # WebSocket server
│
├── agents/                # Python AI agents
│   ├── base_agent.py      # Shared utilities
│   ├── claims_agent/      # Claims processing agent
│   ├── underwriting_agent/# Risk assessment agent
│   ├── fraud_agent/       # Fraud detection agent
│   ├── instrumentation/   # Telemetry pipeline
│   └── data/              # Sample data files
│
├── simulator/             # Data generation
├── database/              # Schema + seed data
└── docker-compose.yml     # Container orchestration
```

## Security Considerations

- **PII Detection**: Guardrails engine scans all agent outputs for SSN, email, phone, and credit card patterns
- **PII Redaction**: Automatic redaction before responses are stored or displayed
- **API Keys**: OpenRouter API keys stored in `.env`, never committed
- **CORS**: Backend configured for frontend origin only
- **Helmet**: Express security headers enabled
