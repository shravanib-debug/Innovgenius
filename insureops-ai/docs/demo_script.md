# 🎬 InsureOps AI — Presentation Script

> **Total runtime:** ~10–12 minutes  
> *Italics = what you say aloud. Everything else is a stage direction.*

---

## ⚙️ Pre-Demo Checklist (do this before the room fills)

- [ ] Backend running: `cd backend && npm run dev`
- [ ] Frontend running: `cd frontend && npm run dev`
- [ ] Browser open at `http://localhost:5173`
- [ ] Browser zoom at **90%** so all widgets are visible
- [ ] Have the Claims Agent form pre-filled and ready to submit

---

## 🟠 SECTION 1 — Opening Hook (30 sec)

*Stand at the landing page. Don't click anything yet.*

> *"Every day, insurance companies process thousands of claims, underwriting decisions, and fraud checks — and increasingly, those decisions are being made by AI agents. But here's the problem: when an AI agent makes a wrong call, you often don't know until it's too late. There's no visibility. No audit trail. No way to ask — why did it decide that?"*

> *"InsureOps AI solves that. It's a real-time observability and monitoring platform built specifically for AI-powered insurance operations. Think of it as a control room for your AI agents."*

*Click **"Go to Dashboard"**.*

---

## 🟠 SECTION 2 — Dashboard Overview (1 min)

*You're now on `/dashboard`. Let the page load fully.*

> *"This is the command center. The moment you land here, you get a live snapshot of your entire AI operation."*

*Point to the KPI cards at the top.*

> *"These five cards update in real time — total traces processed in the last 24 hours, average latency, total API cost, number of active alerts, and the overall success rate. Right now you can see we've processed [X] traces today at an average latency of [Y] seconds."*

*Point to the LIVE DATA badge.*

> *"That green badge means this is not mock data — this is pulled directly from our Neon PostgreSQL database."*

*Point to the Agent Health section.*

> *"Below that, we have per-agent health cards — Claims, Underwriting, Fraud, and Support — each showing their accuracy, latency, and how recently they ran. And on the right, a live feed of recent agent decisions."*

---

## 🟠 SECTION 3 — AI Application Monitoring (2 min)

*Navigate to `/dashboard/section1`.*

> *"Section 1 is where we monitor the raw LLM layer — the actual API calls to the language model. Six widgets, each tracking a different dimension of LLM health."*

*Point to Prompt Quality.*

> *"Prompt Quality — we score every prompt sent to the model on a 0-to-100 scale. Right now we're sitting at [X]. The sparkline shows the trend over time. A drop here usually means your prompt templates have degraded or your input data quality has changed."*

*Point to Response Accuracy.*

> *"Response Accuracy breaks it down per agent. You can see Claims is at [X]%, Underwriting at [Y]%. This is computed from the ratio of successful, non-escalated decisions."*

*Point to Latency.*

> *"Latency — and this is critical for production systems — we track P50, P95, and P99 percentiles. The P99 is what your worst-case users experience. If P99 goes above 5 seconds, we trigger an SLA breach alert automatically."*

*Point to API Rates.*

> *"API Success vs Failure rates. The donut chart shows our current success rate. Any failures are categorized and logged."*

*Point to Cost Tracker.*

> *"Cost Tracker. Every token costs money. We track total spend, cost per request, and break it down by agent so you know exactly which agent is burning your budget."*

*Point to Model Drift.*

> *"And finally — Model Drift. This is one of the most underrated problems in production AI. Over time, the distribution of your model's outputs shifts. We detect that automatically and alert you before it becomes a real problem."*

---

## 🟠 SECTION 4 — LLM Agent Monitoring (2 min)

*Navigate to `/dashboard/section2`.*

> *"Section 2 goes one level up — instead of monitoring raw LLM calls, we monitor the agents themselves. Their decisions, their behavior, their compliance."*

*Point to Approval Rates.*

> *"Approval Rates — the decision funnel. Of all the cases processed, how many were approved, rejected, escalated, or flagged? This is the business outcome layer."*

*Point to Agent Performance.*

> *"Agent Performance scorecards. Each agent has a success rate, average latency, and average cost per run. If the Fraud agent's success rate drops, this is where you catch it first."*

*Point to Tool Usage.*

> *"Tool Usage — agents don't just call the LLM, they use tools. Policy lookup, coverage checker, fraud screener. This widget shows which tools are being called most, their success rates, and their average execution time."*

*Point to Escalation.*

> *"Escalation rate — how often are agents punting to a human? A high escalation rate means your agents aren't confident. That's a signal to retrain or improve your prompts."*

*Point to Compliance.*

> *"And Safety and Compliance — this is non-negotiable in insurance. Every agent response is run through four guardrail checks: PII detection, bias screening, safety validation, and regulatory compliance. You can see exactly how many checks passed and failed."*

---

## 🟠 SECTION 5 — Trace Explorer (2 min)

*Navigate to `/dashboard/traces`.*

> *"This is the Trace Explorer — the forensic layer of the platform. Every single agent execution is recorded as a trace and stored in the database."*

*Point to the table.*

> *"You can see [X] traces here. Each row shows the agent type, the decision it made, confidence level, latency, cost, and timestamp. You can filter by agent, by decision type, or search by trace ID."*

*Click on any trace row to open the detail page.*

> *"Let me click into one of these. This is the full trace detail."*

*Point to the decision badge at the top.*

> *"At the top — the decision. In this case, [Approved/Rejected/Escalated]. Confidence [X]%. Latency [Y] seconds. Cost [Z] cents."*

*Scroll down to the reasoning block.*

> *"Below that — the agent's reasoning. This is the actual text the LLM generated to justify its decision. Full transparency, full auditability."*

*Scroll to the execution timeline.*

> *"And this is the execution timeline — every step the agent took, in order. You can see the tool calls — policy lookup, coverage checker — each with their duration. Then the LLM call itself. Then the guardrail checks. This is the complete audit trail of a single AI decision."*

> *"If a regulator asks 'why did your AI reject this claim?' — you open this page and show them exactly what happened, step by step."*

---

## 🟠 SECTION 6 — Alerts (1 min)

*Navigate to `/dashboard/alerts`.*

> *"The Alert System. InsureOps AI doesn't just show you what happened — it tells you when something is wrong, before it becomes a crisis."*

*Point to the summary cards.*

> *"Right now we have [X] total alerts — [Y] critical, [Z] warnings. [N] have been acknowledged."*

*Point to an alert card.*

> *"Each alert shows the rule that triggered it, the current value versus the threshold, and when it fired. For example — if P95 latency exceeds 5 seconds, or if the fraud agent's accuracy drops below 85%, or if we're approaching the daily cost budget — we fire an alert immediately."*

*Point to the Alert Rules panel.*

> *"And you can configure your own rules here — set thresholds, choose severity levels, and toggle them on or off."*

---

## 🟠 SECTION 7 — Agent Console (2 min)

*Navigate to `/dashboard/agents`.*

> *"Now for the most interactive part — the Agent Console. This is where you can trigger any of the three AI agents on demand and watch them work in real time."*

*Point to the three agent tabs.*

> *"We have three agents: Claims Processing, Underwriting Risk Assessment, and Fraud Detection. Each is powered by a real LLM call through OpenRouter."*

*Select the Claims Agent tab. Fill in the form — use something interesting like:*
- Description: `"Car accident on highway, rear-ended at traffic light, airbag deployed, vehicle totalled"`
- Policy ID: `POL-2024-001`
- Amount: `$18,500`
- Type: `Auto`

> *"Let me run a Claims agent. I'll fill in a real scenario — a car accident, vehicle totalled, claim amount of $18,500."*

*Click Run.*

> *"The agent is now running — it's calling our tool suite first: policy lookup, coverage checker, payout calculator, fraud screener. Then it sends all of that context to the LLM and asks for a structured decision."*

*Wait for result to appear.*

> *"And there it is. Decision: [X]. Confidence: [Y]%. The agent has reasoned through the claim and given us a structured output in under [Z] seconds."*

*Point to the tools used section.*

> *"You can see exactly which tools it used. And down here — the Trace ID. This execution has already been saved to our database."*

*Click **"View Trace Details"**.*

> *"One click — and we're looking at the full trace. Everything we just saw in the Trace Explorer, but for the run we just triggered. This is end-to-end observability in action."*

---

## 🟠 SECTION 8 — Closing (30 sec)

*Navigate back to `/dashboard`.*

> *"So to summarize what you've just seen:"*

> *"InsureOps AI gives you complete visibility into your AI agents — from the raw LLM call all the way up to the business decision. You can monitor quality, latency, cost, and drift. You can inspect every single agent execution with a full audit trail. You get proactive alerts before problems escalate. And you can trigger agents on demand and trace their reasoning in real time."*

> *"This is what production-grade AI observability looks like for the insurance industry."*

*Pause. Smile. Open the floor.*

> *"Happy to take any questions."*

---

## 💬 Likely Questions & Answers

| Question | Answer |
|---|---|
| **"Is this real data or mock?"** | Real — connected to a live Neon PostgreSQL database. The LIVE DATA badge confirms it. |
| **"Which LLM is powering the agents?"** | OpenRouter API — currently using a capable open-source model. Easily swappable to GPT-4, Claude, or Gemini. |
| **"How does the drift detection work?"** | We compare the decision distribution of the first half vs second half of traces in the window. A divergence above the threshold triggers a drift alert. |
| **"Can this scale to production?"** | The architecture is designed for it — Neon serverless Postgres scales automatically, and the Express backend is stateless. |
| **"What's the tech stack?"** | React 19 + Vite frontend, Express.js backend, Neon PostgreSQL, OpenRouter LLM API, WebSocket for live updates. |
| **"Why insurance specifically?"** | Insurance is one of the highest-stakes domains for AI decisions — claims, fraud, underwriting all have real financial and legal consequences. Observability isn't optional here. |

---

## 🎯 Key Phrases to Remember

- *"Full audit trail for every AI decision"*
- *"From raw LLM call to business outcome"*
- *"Proactive alerting before problems escalate"*
- *"Real-time, not mock — live database"*
- *"If a regulator asks why — you have the answer"*
