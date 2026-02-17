# GitHub Repositories & Existing Implementations
## AI & Agent Observability Dashboard for Insurance Operations

---

## 🔍 CATEGORY 1: LLM OBSERVABILITY PLATFORMS (GitHub Repos)

### 1. **Langfuse** ⭐ HIGHLY RELEVANT
- **GitHub:** https://github.com/langfuse/langfuse
- **Stars:** 6K+
- **License:** MIT (Open Source)
- **Website:** https://langfuse.com
- **What it does:**
  - Complete LLM observability platform with prompt management
  - Trace LLM calls, agent actions, tool usage
  - Built-in evaluations (LLM-as-a-Judge, user feedback, manual labeling)
  - Prompt versioning and playground
  - Cost tracking and token usage monitoring
  - Self-hosted or cloud deployment
- **Key Features for Your Project:**
  - Dashboard UI with traces visualization
  - Metrics: cost, latency, token usage
  - User session tracking
  - Prompt quality management
- **Tech Stack:** TypeScript, React, PostgreSQL, Prisma
- **Why it's relevant:** Complete observability solution with dashboard UI you can learn from

---

### 2. **Helicone** ⭐ RELEVANT
- **GitHub:** https://github.com/Helicone/helicone
- **Stars:** 1K+
- **License:** Apache 2.0
- **Website:** https://helicone.ai
- **What it does:**
  - Open-source LLM observability platform
  - Monitor, evaluate, and experiment with LLMs
  - Track metrics: cost, latency, quality
  - Prompt management with versioning
  - One-line integration
- **Key Features:**
  - Observe: Inspect traces & sessions for agents
  - Analyze: Track cost, latency, quality metrics
  - Playground: Test and iterate on prompts
  - Fine-tune: Integration with fine-tuning partners
- **Free Tier:** 10K requests/month
- **Why it's relevant:** Similar monitoring approach, good UI inspiration

---

### 3. **OpenLIT** ⭐ HIGHLY RELEVANT
- **GitHub:** https://github.com/openlit/openlit
- **Stars:** Significant community
- **License:** Open Source
- **Website:** https://openlit.io
- **What it does:**
  - OpenTelemetry-native LLM observability
  - GPU monitoring, guardrails, evaluations
  - Prompt management, vault, playground
  - Integrates with 50+ LLM providers
- **Key Features:**
  - Cost tracking for custom models
  - Exceptions monitoring dashboard
  - Prompt hub for management
  - API keys and secrets management
  - Fleet Hub for OpAMP management
- **Tech Stack:** Python, OpenTelemetry
- **Why it's relevant:** Comprehensive platform with dashboard at localhost:3000

---

### 4. **Traceloop (OpenLLMetry)** ⭐ RELEVANT
- **GitHub:** https://github.com/traceloop/openllmetry
- **License:** Apache 2.0
- **Website:** https://traceloop.com
- **What it does:**
  - Open-source observability based on OpenTelemetry
  - Extracts traces from LLM providers (OpenAI, Anthropic)
  - Publishes in OTel format
  - Compatible with 10+ visualization tools
- **Key Features:**
  - Universal SDK
  - Multi-language support
  - Framework agnostic (LangChain, LlamaIndex)
- **Free Tier:** 10K monthly traces
- **Why it's relevant:** Good for understanding trace architecture

---

### 5. **AgentNeo** ⭐ HIGHLY RELEVANT FOR MULTI-AGENT
- **GitHub:** https://github.com/VijayRagaAI/agentneo
- **What it does:**
  - Agent AI application observability framework
  - Monitor multi-agentic systems
  - Self-hosted dashboard with React
  - Execution graph visualization
  - Timeline and advanced analytics
- **Key Features:**
  - Project management
  - Execution graph visualization
  - Evaluation tools
  - React dashboard (auto-installs dependencies)
- **Tech Stack:** Python, React, Node.js
- **Why it's relevant:** Purpose-built for agent monitoring with visual dashboard

---

### 6. **AgentOps** ⭐ HIGHLY RELEVANT
- **GitHub:** https://github.com/AgentOps-AI/agentops
- **Website:** https://agentops.ai
- **What it does:**
  - Python SDK for AI agent monitoring
  - LLM cost tracking and benchmarking
  - Integrates with CrewAI, Autogen, LangChain, Camel AI
  - Session replays and metrics
- **Key Features:**
  - Comprehensive observability
  - Real-time monitoring
  - Cost control
  - Failure detection
  - Tool usage statistics
  - Session-wide metrics
- **Integration:** 2 lines of code
- **Why it's relevant:** Agent-focused monitoring with dashboard

---

### 7. **VoltAgent** ⭐ RELEVANT
- **GitHub:** https://github.com/VoltAgent/voltagent
- **What it does:**
  - AI agent engineering platform (TypeScript)
  - VoltOps Console for observability
  - Real-time execution traces
  - Performance metrics and visual dashboards
- **Key Features:**
  - Multi-agent systems with supervisors
  - Tool registry and MCP
  - Evals framework
  - Production-ready visibility
- **Tech Stack:** TypeScript
- **Console:** https://console.voltagent.dev
- **Why it's relevant:** Modern TypeScript implementation with console UI

---

### 8. **AI Observer** ⭐ RELEVANT FOR ARCHITECTURE
- **GitHub:** https://github.com/tobilg/ai-observer
- **What it does:**
  - Self-hosted, single-binary observability
  - OpenTelemetry-compatible
  - Monitors Claude Code, Gemini CLI, OpenAI Codex CLI
  - Real-time updates with WebSocket
- **Key Features:**
  - Track token usage, costs, latency, errors
  - DuckDB-powered analytics
  - React dashboard (embedded)
  - Customizable widgets with drag-and-drop
  - Cost tracking for 67+ models
- **Tech Stack:** Go backend, React frontend, DuckDB
- **Ports:** Dashboard at :8080, OTLP at :4318
- **Why it's relevant:** Single-binary architecture, good for reference

---

### 9. **AgentWatch (by CyberArk)** ⭐ RELEVANT
- **GitHub:** https://github.com/cyberark/agentwatch
- **License:** Apache 2.0
- **What it does:**
  - AI observability framework
  - Comprehensive agent interaction insights
  - Minimal integration effort
- **Key Features:**
  - One-liner observability
  - Comprehensive interaction tracking
  - Advanced visualization
  - Metadata capture
  - Multi-framework support
  - MCP support
- **Why it's relevant:** Security-focused observability from CyberArk

---

### 10. **Datadog LLM Observability** (Learning Resources)
- **GitHub:** https://github.com/DataDog/llm-observability
- **What it does:**
  - Example notebooks for Datadog's LLM Observability SDK
  - Hands-on instrumentation guides
- **Includes:**
  - Simple LLM call tracing
  - Static workflows with tool calls
  - Agent workflows with decision-making
  - RAG workflow tracing and evaluation
- **Website:** https://www.datadoghq.com/product/llm-observability/
- **Why it's relevant:** Enterprise-grade examples and patterns

---

### 11. **AIWatch** ⭐ RELEVANT FOR FULL STACK
- **GitHub:** https://github.com/ajeetraina/aiwatch
- **What it does:**
  - AI model management and observability
  - Full observability stack
  - React frontend + Go backend
- **Architecture:**
  - Frontend (React/TS) at :3000
  - Backend (Go) at :8080
  - Model Runner (Llama 3.2) at :12434
  - Grafana at :3001
  - Prometheus at :9091
  - Jaeger at :16686
- **Tech Stack:** Go, React, Prometheus, Grafana, Jaeger
- **Why it's relevant:** Complete observability stack architecture

---

### 12. **Gastown Viewer Intent** ⭐ RELEVANT FOR TUI/WEB
- **GitHub:** https://github.com/intent-solutions-io/gastown-viewer-intent
- **What it does:**
  - Real-time agent observability dashboard
  - TUI and React web interface
  - Monitors tasks, agent activity, system health
- **Features:**
  - Mission control for multi-agent workspaces
  - gvi-tui (Bubbletea TUI)
  - Web UI (React + Vite)
  - gvid daemon at :7070
- **Tech Stack:** Go, React, Vite
- **Why it's relevant:** Dual interface (TUI + web) approach

---

### 13. **Evidently AI** ⭐ RELEVANT FOR ML MONITORING
- **GitHub:** https://github.com/evidentlyai/evidently
- **Website:** https://www.evidentlyai.com/evidently-oss
- **What it does:**
  - Open-source ML monitoring and LLM observability
  - Data drift detection
  - Model performance tracking
- **Key Features:**
  - Ad hoc reports
  - Automated pipeline checks
  - Live dashboard deployment
  - Pre-configured ML and LLM evaluations
  - Visual reports
- **Why it's relevant:** Drift detection and model monitoring patterns

---

## 🏥 CATEGORY 2: INSURANCE-SPECIFIC AI AGENTS (GitHub Repos)

### 14. **Insurance AI Agent (RAG-Based)** ⭐ HIGHLY RELEVANT
- **GitHub:** https://github.com/ethicalByte1443/Insurance-AI-Agent-RAG-Based
- **License:** MIT
- **What it does:**
  - Full-stack insurance claim decision-making system
  - FastAPI backend + React TypeScript frontend
  - Analyzes insurance clauses and predicts claim outcomes
- **Features:**
  - Uses Llama-3.3-70B model
  - PDF policy parsing with PyMuPDF
  - FAISS vector search with Sentence Transformers
  - NLP for query analysis
  - Drag-and-drop PDF upload
  - Decision: Approve/Reject with justification and amounts
- **Tech Stack:** FastAPI, React, TypeScript, Tailwind, ShadCN UI
- **Why it's relevant:** Insurance domain-specific with decision tracking

---

### 15. **Microsoft Insurance Claims Automation** ⭐ HIGHLY RELEVANT
- **GitHub:** https://github.com/MSUSAzureAccelerators/AI-Powered-Insurance-Claims-Automation-Accelerator
- **What it does:**
  - AI-powered claims processing
  - Cognitive skills for image, ID, document processing
  - Reduces manual effort in claims processing
- **Features:**
  - Intelligent agent with multi-channel input
  - Voice-activated claim filing
  - Document upload via chat bot
  - Instant repair/replacement estimates
- **Tech Stack:** Microsoft Azure, Cognitive Services
- **Why it's relevant:** Production claims automation from Microsoft

---

### 16. **Insurance Agentic AI** ⭐ RELEVANT
- **GitHub:** https://github.com/SamJoeSilvano/Insurance-Agentic-AI
- **What it does:**
  - Insurance AI assistant with specialized agents
  - PostgreSQL + Milvus vector database
  - Multi-domain expertise (Life, Home, Auto)
- **Features:**
  - Real-time database sync
  - Semantic search with OpenAI embeddings
  - Intelligent routing to specialists
  - Streamlit UI
- **Tech Stack:** Python, PostgreSQL, Milvus, Streamlit
- **Why it's relevant:** Multi-agent architecture for insurance

---

### 17. **AWS Agentic Insurance Claims (EKS)** ⭐ HIGHLY RELEVANT
- **GitHub:** https://github.com/aws-samples/sample-agentic-insurance-claims-processing-eks
- **What it does:**
  - Production-ready AI claims processing on Amazon EKS
  - LangGraph multi-agent patterns
  - Fraud detection
- **Features:**
  - 4 Persona Portals (Claimant, Adjuster, SIU, Supervisor)
  - Business KPIs dashboard
  - Real-time fraud risk scoring
  - CloudWatch integration
  - RBAC and AWS Secrets Manager
- **Architecture Docs:** ARCHITECTURE.md, DEPLOYMENT_GUIDE.md
- **Tech Stack:** AWS EKS, LangGraph, Python
- **Why it's relevant:** Production-grade insurance claims with observability

---

### 18. **IBM Virtual Insurance Assistant** ⭐ RELEVANT
- **GitHub:** https://github.com/IBM/virtual-insurance-assistant
- **What it does:**
  - Chatbot for insurance claims processing
  - Watson NLP for understanding and classification
  - Reduces repetitive tasks
- **Features:**
  - Policy question answering with Watson Discovery
  - Mechanic review analysis
  - Natural language understanding
- **Tech Stack:** IBM Watson, Node.js
- **Why it's relevant:** IBM's approach to insurance automation

---

### 19. **Moneta Agents (Azure)** ⭐ RELEVANT
- **GitHub:** https://github.com/Azure-Samples/moneta-agents
- **What it does:**
  - AI-powered assistant for insurance and banking advisors
  - Microsoft Agent Framework
  - Multi-agent orchestration with HandoffBuilder pattern
- **Features:**
  - Specialized agents: CRM, CIO, Funds, News, Policies
  - Azure AI Foundry integration
  - OpenTelemetry tracing with Application Insights
  - CosmosDB for conversation history
- **Tech Stack:** Python, Azure AI Foundry, CosmosDB
- **Why it's relevant:** Enterprise insurance agent architecture with observability

---

### 20. **Insurance Underwriting AI** ⭐ RELEVANT
- **GitHub:** https://github.com/Tai-O/Insurance-Underwriting-AI
- **What it does:**
  - LLM to analyze risks on insurance applications
  - Uses underwriting guidelines
  - Streamlit interface
- **Features:**
  - Risk highlighting on applications
  - GPT-3.5 Turbo model
  - Guidelines + application form analysis
- **Tech Stack:** Python, OpenAI, Streamlit
- **Why it's relevant:** Underwriting-specific AI application

---

## 📊 CATEGORY 3: OBSERVABILITY DASHBOARDS & UI EXAMPLES

### 21. **LangGraph Observer** ⭐ RELEVANT FOR DASHBOARD
- **GitHub:** https://github.com/xbt-a4224j/langgraph-observer
- **What it does:**
  - Streamlit dashboard for LLM LangGraph
  - Interactive prompting
  - Modular services for generation, scoring
- **Features:**
  - Real-time metrics (toxicity, hallucination, emoji score)
  - Recent runs table
  - Full-state JSON output
  - Artifact logging
- **Tech Stack:** Python, Streamlit, FastAPI
- **Endpoints:** POST /run-graph
- **Why it's relevant:** Dashboard design for LLM workflows

---

### 22. **SuperOptiX AI Observability** ⭐ RELEVANT FOR CLI/DASHBOARD
- **Website:** https://superagenticai.github.io/superoptix-ai/guides/observability/
- **What it does:**
  - Observability CLI and dashboard
  - Agent execution tracing
  - Performance analysis
- **Commands:**
  - `super observe traces <agent_id>`
  - `super observe dashboard --port 8502`
  - `super observe analyze <agent_id>`
- **Features:**
  - Real-time trace visualization
  - Performance metrics and charts
  - Tool usage analytics
  - Error tracking
- **Why it's relevant:** CLI-first approach with dashboard

---

## 🌐 CATEGORY 4: COMMERCIAL PLATFORMS (Websites)

### 23. **LangSmith (by LangChain)** ⭐ INDUSTRY LEADER
- **Website:** https://www.langchain.com/langsmith/observability
- **Key Features:**
  - End-to-end tracing for AI agents
  - Real-time monitoring dashboards
  - Custom metrics (token usage, latency P50/P99, cost)
  - Webhook alerts and PagerDuty integration
  - Works with any framework
- **Pricing:** Free tier with 5K traces/month
- **Why it's relevant:** Industry-leading observability solution

---

### 24. **Datadog LLM Observability** ⭐ ENTERPRISE
- **Website:** https://www.datadoghq.com/product/llm-observability/
- **Key Features:**
  - End-to-end tracing across AI agents
  - Inputs, outputs, latency, token usage, errors
  - Structured experiments
  - Cluster visualization for drift
  - Out-of-box dashboards for major providers
- **Pricing:** $8-12 per 10K LLM requests/month
- **Why it's relevant:** Enterprise-grade with full-stack visibility

---

### 25. **Elastic Observability (LLM Monitoring)** ⭐ RELEVANT
- **Website:** https://www.elastic.co/observability/llm-monitoring
- **Key Features:**
  - Prebuilt dashboards for Azure, OpenAI, Bedrock, Vertex AI
  - Tracks invocations, errors, latency, token usage
  - LangChain request tracing
  - Prompt injection detection
  - Monitors for sensitive data leaks, hallucinations
- **Why it's relevant:** Security-focused LLM monitoring

---

### 26. **Braintrust** ⭐ HIGHLY RELEVANT
- **Website:** https://www.braintrust.dev
- **Key Features:**
  - Multi-dimensional monitoring
  - Real-time latency tracking
  - Token usage analytics
  - Error monitoring and quality assessment
  - Alerting for anomalies
  - Automated CI/CD gates
  - Webhook integration
- **Free Tier:** 1M logged events/month
- **Why it's relevant:** Combines monitoring + evaluation + experimentation

---

### 27. **Arize AI & Phoenix** ⭐ RELEVANT FOR DRIFT
- **Website:** https://arize.com | https://phoenix.arize.com
- **Key Features:**
  - Real-time performance monitoring
  - Continuous drift detection
  - LLM evaluation and tracing
  - Multi-agent workflow support
  - AI-assisted root-cause analysis
  - Vector representation tracking
- **Why it's relevant:** Advanced drift detection for embeddings

---

### 28. **Dynatrace AI Observability** ⭐ ENTERPRISE
- **Website:** https://www.dynatrace.com/solutions/ai-observability/
- **Key Features:**
  - Monitor token costs, request duration
  - Intelligent detection for behavior changes
  - AI agent response time optimization
  - A/B testing insights
  - Guardrail metrics for bias/error
- **Why it's relevant:** APM integration with AI monitoring

---

### 29. **PromptLayer** ⭐ RELEVANT FOR PROMPT MANAGEMENT
- **Website:** https://www.promptlayer.com
- **Key Features:**
  - Visual prompt editing and deployment
  - Version control and rollback
  - A/B testing with gradual rollout
  - Human and AI graders for testing
  - Cost and usage analytics
  - Non-technical team enablement
- **Free Tier:** 5 users, 2,500 requests/month
- **Why it's relevant:** Prompt management with observability

---

### 30. **Portkey** ⭐ RELEVANT FOR GATEWAY
- **Website:** https://portkey.ai
- **GitHub:** https://github.com/Portkey-AI/gateway
- **Stars:** 6K+
- **Key Features:**
  - LLM gateway + observability
  - Request and response logging
  - 21+ essential metrics
  - Customizable filters
  - Abstracts 100+ LLM endpoints
- **License:** MIT
- **Why it's relevant:** Gateway pattern with observability

---

## 🎯 CATEGORY 5: SPECIALIZED TOOLS

### 31. **Langtrace** ⭐ RELEVANT
- **Website:** https://langtrace.ai
- **What it does:**
  - Open-source LLM telemetry
  - Built on OpenTelemetry standards
  - Live metrics dashboards
- **Key Features:**
  - Captures token usage, performance, quality
  - Community-driven
  - Broad integrations (LangChain, LlamaIndex, Pinecone, Anthropic)
- **Why it's relevant:** OpenTelemetry standards for LLM

---

### 32. **Langwatch** ⭐ RELEVANT
- **Website:** https://langwatch.ai
- **Key Features:**
  - Unified dashboards
  - Real-time latency tracking
  - Token usage analytics
  - Anomaly detection
  - Automated evaluation gates
- **Why it's relevant:** Similar feature set to your requirements

---

### 33. **Opik (by Comet)** ⭐ RELEVANT
- **Website:** https://comet.com/opik
- **Key Features:**
  - LLM observability with ML workflow integration
  - Native support for OpenAI, LangChain, LlamaIndex
  - Agent-focused monitoring
  - Open-source with self-hosting
- **Why it's relevant:** ML + LLM combined observability

---

## 📚 LEARNING RESOURCES & ARTICLES

### 34. **LLM Observability Tools: 2026 Comparison**
- **URL:** https://lakefs.io/blog/llm-observability-tools/
- **Covers:** Langchain, Portkey, Lunary, Traceloop, Datadog
- **Why useful:** Comparison of 10+ tools

---

### 35. **10 LLM Observability Tools (Coralogix)**
- **URL:** https://coralogix.com/guides/llm-observability-tools/
- **Covers:** Portkey, Langfuse, Helicone, TruLens
- **Why useful:** Technical deep-dives on each tool

---

### 36. **15 AI Agent Observability Tools**
- **URL:** https://research.aimultiple.com/agentic-monitoring/
- **Covers:** AgentOps, Langfuse, AgentNeo, Braintrust, Laminar
- **Why useful:** Agent-specific monitoring focus

---

### 37. **Best Prompt Management Tools (ZenML)**
- **URL:** https://www.zenml.io/blog/best-prompt-management-tools
- **Covers:** PromptLayer, Langfuse, prst.ai, ZenML
- **Why useful:** Prompt quality and versioning patterns

---

### 38. **Datadog Prompt Tracking Blog**
- **URL:** https://www.datadoghq.com/blog/llm-prompt-tracking/
- **Why useful:** Enterprise patterns for prompt observability

---

### 39. **LLM Monitoring with Langfuse (Towards Data Science)**
- **URL:** https://towardsdatascience.com/llm-monitoring-and-observability-hands-on-with-langfuse/
- **Why useful:** Hands-on tutorial with code examples

---

### 40. **5 Best LLM Monitoring Tools 2026 (Braintrust)**
- **URL:** https://www.braintrust.dev/articles/best-llm-monitoring-tools-2026
- **Why useful:** Feature comparison and decision framework

---

### 41. **Awesome AI Agents List**
- **GitHub:** https://github.com/slavakurilyak/awesome-ai-agents
- **What it is:** Curated list of 300+ agentic AI resources
- **Includes:** AgentBench, AgentGPT, AgentOps, LangSmith
- **Why useful:** Comprehensive resource directory

---

### 42. **500 AI Agents Projects**
- **GitHub:** https://github.com/ashishpatel26/500-AI-Agents-Projects
- **What it is:** AI agent use cases across industries
- **Includes:** Insurance claiming workflow agents
- **Why useful:** Real-world agent examples

---

## 🎨 DASHBOARD DESIGN INSPIRATION

### 43. **Data Quality Dashboard Guide (DQOps)**
- **URL:** https://dqops.com/how-to-make-a-data-quality-dashboard/
- **Why useful:** Dashboard design patterns and KPIs

---

### 44. **Metrics for Prompt Collaboration (Latitude)**
- **URL:** https://latitude-blog.ghost.io/blog/ultimate-guide-to-metrics-for-prompt-collaboration/
- **Key Metrics:**
  - Task definition clarity
  - Instruction clarity
  - Format requirements
  - Response accuracy
  - Generation speed
- **Why useful:** Prompt quality metrics framework

---

## 💡 KEY TAKEAWAYS FOR YOUR PROJECT

### What to Study:
1. **Langfuse** - Most complete open-source solution
2. **AgentNeo** - Multi-agent monitoring with React dashboard
3. **AI Observer** - Single-binary architecture inspiration
4. **AIWatch** - Full observability stack with Prometheus/Grafana
5. **AWS Insurance Claims EKS** - Production insurance agent patterns
6. **Insurance AI Agent (RAG)** - Insurance-specific decision tracking

### Architecture Patterns to Use:
- **Frontend:** React + TypeScript (most common)
- **Backend:** FastAPI (Python) or Go
- **Real-time:** WebSocket or Server-Sent Events
- **Metrics:** OpenTelemetry standard
- **Storage:** PostgreSQL + Redis + DuckDB for analytics
- **Visualization:** Recharts or D3.js

### Key Features to Implement:
1. **Trace visualization** (like Langfuse)
2. **Cost tracking dashboard** (like Braintrust)
3. **Prompt quality scores** (like PromptLayer)
4. **Agent-specific metrics** (like AgentOps)
5. **Real-time alerts** (like LangSmith)
6. **Decision traceability** (like AWS Insurance sample)

---

## 🚀 RECOMMENDED STARTING POINTS

**For Learning:**
1. Clone Langfuse and run locally
2. Try AgentNeo for multi-agent patterns
3. Study AI Observer's single-binary approach

**For Your Hackathon:**
1. Use React + FastAPI architecture (proven pattern)
2. Implement OpenTelemetry for traces
3. Build on insurance-specific repos (ethicalByte1443's work)
4. Reference Datadog/Elastic for dashboard layouts

**For Demo:**
1. Study AWS Insurance Claims for 4-persona UI
2. Look at AgentNeo's execution graphs
3. Reference Braintrust's evaluation patterns

---

*Last Updated: February 2026*
*Total Resources: 44 platforms, repos, and articles*
