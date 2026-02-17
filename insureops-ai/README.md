# 🛡️ InsureOps AI

> AI & Agent Observability Dashboard for Smart Insurance Operations

A real-time observability dashboard that monitors AI applications and LLM-based agents powering modern insurance operations — from underwriting and claims to fraud detection and customer support.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite |
| **Charts** | Recharts |
| **Backend** | Express.js (Node.js) |
| **ORM** | Sequelize |
| **Database** | PostgreSQL |
| **AI Agents** | LangGraph (Python) |
| **LLM Provider** | Google Gemini / OpenAI |
| **Real-time** | WebSocket (ws) |

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 15+
- Python 3.10+ (for agents)

### 1. Clone & Setup Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### 2. Setup Database
```bash
psql -U postgres -c "CREATE DATABASE insureops;"
psql -U postgres -d insureops -f database/schema.sql
psql -U postgres -d insureops -f database/seed_data.sql
```

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open Dashboard
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
insureops-ai/
├── frontend/          # React + Vite Dashboard
├── backend/           # Express.js API Server
├── agents/            # Insurance AI Agents (Python)
├── simulator/         # Data simulation scripts
├── database/          # SQL schema & seed data
└── docs/              # Documentation
```

## 📊 Features

- **Dual-Section Dashboard** — AI Application Metrics + LLM Agent Metrics
- **3 Real AI Agents** — Claims Processing, Underwriting, Fraud Detection
- **Execution Trace Viewer** — Full audit trail of every agent decision
- **Real-time Updates** — WebSocket-powered live dashboard
- **Alert System** — Threshold-based anomaly detection

---

*InsureOps AI — Built for smart insurance operations*
