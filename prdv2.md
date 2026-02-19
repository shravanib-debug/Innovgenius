# Product Requirements Document (PRD) — v2.0

## InsureOps AI — Multi-Insurance Claim Flow & Verification Upgrade

| Field | Detail |
|---|---|
| **Document Version** | 2.0 |
| **Date** | February 19, 2026 |
| **Status** | In Development (Phase 5) |
| **Supersedes** | PRD v1.1 (February 17, 2026) |
| **Project Type** | Domain-Aware Agentic Claim Orchestration System |

---

## 1. Executive Summary

InsureOps AI v1 is a real-time observability platform monitoring AI agents across insurance operations. While v1 established the foundational agent-telemetry-dashboard pipeline with 3 real insurance agents (Claims, Underwriting, Fraud) and a simulated Support agent, the claim intake flow remains generic — accepting only a description and amount with no insurance type differentiation, no evidence management, and no domain-specific verification.

**Antigravity v2** transforms InsureOps AI from a generic claims intake demo into a **Domain-Aware Agentic Claim Orchestration System** supporting **five insurance verticals** — **Health, Life, Vehicle, Travel, and Property** — each with distinct verification pipelines, evidence requirements, and domain-aware agent reasoning.

### What's New in v2

| Capability | v1 (Current) | v2 (Upgrade) |
|---|---|---|
| Insurance Types | Generic | Health, Life, Vehicle, Travel, Property |
| Claim Intake | Single form (description + amount) | Dynamic multi-step wizard per type |
| Evidence Handling | None | Type-specific file upload + validation |
| Verification | Single generic pipeline | 5 specialized verification pipelines |
| Agent Architecture | Monolithic claims agent | Orchestrator + modular verifiers |
| Telemetry Depth | Basic trace metrics | Verification steps, evidence scores, missing docs |
| Explainability | Basic reasoning text | Domain-aware explanation panel with evidence references |

---

## 2. Problem Statement

### 2.1 Current Limitations

- **Generic claim form** with minimal inputs (description, amount, policy ID)
- **No insurance type differentiation** — all claims processed identically
- **No evidence/document management** — decisions lack supporting documentation
- **Uniform agent reasoning** across all claim categories
- **Shallow telemetry** — no visibility into verification steps or evidence completeness
- **Low domain realism** — doesn't reflect real insurance workflows

### 2.2 Real-World Gap

Real insurance ecosystems require:
- **Type-specific verification workflows** (medical claims ≠ vehicle claims)
- **Evidence-heavy documentation** (hospital bills, police reports, damage photos)
- **Regulatory audit trails** with document provenance
- **Fraud-sensitive validation** tailored to each insurance domain
- **Domain-aware decision pipelines** with coverage-specific clause matching

---

## 3. Product Vision

Transform InsureOps AI into a **multi-vertical insurance claim orchestration engine** where each insurance type routes through a specialized verification pipeline with evidence-grounded AI decision-making, producing deep observability telemetry at every step.

---

## 4. Supported Insurance Types

| Type | Key Use Case | Verification Complexity |
|---|---|---|
| **Health** | Hospital bills, medical procedures | High — medical document parsing, coverage eligibility |
| **Life** | Death benefits, nominee claims | High — document authenticity, tenure analysis |
| **Vehicle** | Accident damage, collisions | Medium — image evidence, FIR parsing |
| **Travel** | Delays, cancellations, lost baggage | Medium — ticket validation, incident proof |
| **Property** | Fire, flood, structural damage | High — ownership validation, surveyor reports |

---

## 5. Goals & Objectives

### 5.1 Primary Goals

| # | Goal | Success Criteria |
|---|---|---|
| G1 | Multi-insurance dynamic claim intake | 5 insurance types with distinct form fields |
| G2 | Type-specific verification workflows | 5 verification pipelines, each with ≥3 steps |
| G3 | Evidence-based agent reasoning | Evidence referenced in every decision |
| G4 | Enhanced verification-level telemetry | Verification steps, missing docs, completeness score in traces |
| G5 | Improved explainability | Domain-aware explanation panel with evidence + clauses |

### 5.2 Secondary Goals

- Strengthen fraud detection signals per insurance type
- Improve compliance auditability with evidence trails
- Increase dashboard realism with domain-specific analytics

---

## 6. User Personas

### 6.1 Operations Manager
Submits structured claims with domain-specific documents and evidence. Needs a guided wizard that adapts to the insurance type.

### 6.2 Compliance Officer
Requires audit-ready verification trails and explainable decisions. Needs to see which evidence was used, which policy clauses applied, and what verification steps executed.

### 6.3 Claims Orchestrator Agent
Routes claims to the correct verification pipeline based on insurance type, orchestrating modular verifiers for domain-specific processing.

---

## 7. Functional Requirements

### 7.1 Dynamic Multi-Step Claim Wizard (Frontend)

#### FR-WIZ-01: Insurance Type Selection

| ID | Requirement | Priority |
|---|---|---|
| FR-WIZ-01.1 | Dropdown/card selector for insurance type: Health, Life, Vehicle, Travel, Property | P0 |
| FR-WIZ-01.2 | Selection triggers dynamic form field rendering | P0 |
| FR-WIZ-01.3 | Visual indicator of selected type with relevant icon | P1 |

#### FR-WIZ-02: Incident Details (Dynamic Fields)

Common fields (all types):

| Field | Type | Required |
|---|---|---|
| Policy ID | Text/Select | Yes |
| Incident Date | Date Picker | Yes |
| Claim Amount | Currency Input | Yes |
| Description | Textarea | Yes |
| Location | Text | Yes |

Type-specific fields rendered dynamically based on selection.

#### FR-WIZ-03: Evidence Upload

| ID | Requirement | Priority |
|---|---|---|
| FR-WIZ-03.1 | Drag-and-drop multi-file upload with preview | P0 |
| FR-WIZ-03.2 | File type validation (PDF, JPG, PNG only) | P0 |
| FR-WIZ-03.3 | Type-specific evidence checklist (shows required vs uploaded) | P0 |
| FR-WIZ-03.4 | Evidence completeness score calculation (uploaded/required) | P1 |
| FR-WIZ-03.5 | File size limit: 10MB per file, 50MB total | P1 |

---

### 7.2 Type-Specific Evidence Requirements

#### Health Insurance

| Evidence | Required | Category |
|---|---|---|
| Hospital Bills | ✅ | financial |
| Medical Reports | ✅ | medical |
| Discharge Summary | ✅ | medical |
| Doctor Prescription | Optional | medical |

#### Vehicle Accidental Insurance

| Evidence | Required | Category |
|---|---|---|
| Accident Images | ✅ | visual |
| Police FIR / Report | ✅ | legal |
| Repair Estimates | ✅ | financial |
| Driver Details | ✅ | identity |

#### Travel Insurance

| Evidence | Required | Category |
|---|---|---|
| Flight Tickets / Boarding Pass | ✅ | travel |
| Delay/Cancellation Proof | ✅ | proof |
| Travel Itinerary | Optional | travel |
| Emergency Documents | Conditional | emergency |

#### Property Insurance

| Evidence | Required | Category |
|---|---|---|
| Ownership Proof | ✅ | legal |
| Damage Photos/Videos | ✅ | visual |
| Surveyor Report | ✅ | assessment |
| Repair Cost Estimates | ✅ | financial |

#### Life Insurance

| Evidence | Required | Category |
|---|---|---|
| Death Certificate | ✅ | legal |
| Medical History | ✅ | medical |
| Nominee Details | ✅ | identity |
| Policy Tenure Records | ✅ | policy |

---

### 7.3 Type-Specific Verification Pipelines (AI-Powered)

Each insurance type has a distinct verification pipeline using **real AI evidence analysis**:

> [!IMPORTANT]
> All pipelines use GPT-4o-mini Vision (via OpenRouter) for image analysis, OCR, and document verification. pytesseract serves as a local fallback OCR engine when API calls fail.

#### Health Insurance Pipeline

```
Medical Document Parser (PyMuPDF + LLM)
  → OCR extraction of procedure codes, amounts, dates from bills
    → Coverage Eligibility Check (cross-reference extracted procedures with policy)
      → Fraud Pattern Detection (amount mismatch, duplicate billing flags)
        → Decision
```

**AI Processing:** Hospital bills parsed via PyMuPDF → key fields extracted by LLM → procedure codes matched against policy coverage → billing anomalies flagged.

#### Vehicle Insurance Pipeline

```
Damage Photo Analysis (GPT-4o-mini Vision)
  → FIR OCR Parsing (Vision API / pytesseract fallback)
    → Damage Severity Scoring (0-1 scale from AI)
      → Cross-reference: damage severity vs repair estimate
        → Policy Clause Matching → Decision
```

**AI Processing:** Accident photos sent to Vision API → damage severity rated (0-1) → FIR text extracted via OCR → repair estimate cross-validated against AI-assessed damage level.

#### Travel Insurance Pipeline

```
Boarding Pass / Ticket OCR (Vision API + pytesseract)
  → Extract flight numbers, dates, routes
    → Incident Proof Verification (delay certificate OCR)
      → Date cross-validation (ticket dates vs claimed incident)
        → Coverage Matching → Decision
```

**AI Processing:** Boarding passes OCR'd for flight details → delay/cancellation certificates parsed → dates cross-validated → coverage mapped.

#### Property Insurance Pipeline

```
Ownership Document OCR (Vision API)
  → Damage Photo Analysis (GPT-4o-mini Vision — severity 0-1)
    → Surveyor Report Parsing (PyMuPDF + LLM)
      → Cost Estimation Validation (AI estimate vs repair quote)
        → Coverage Limit Check → Decision
```

**AI Processing:** Ownership deed OCR'd for property details → fire/flood photos analyzed for damage severity → surveyor report parsed → AI cross-validates repair costs.

#### Life Insurance Pipeline

```
Death Certificate Vision Analysis (GPT-4o-mini Vision)
  → Document Authenticity Check (format, font, seal detection)
    → Key Field Extraction (name, date, cause, hospital)
      → Policy Tenure Analysis (dates vs policy records)
        → Risk Clause Evaluation → Escalation / Decision
```

**AI Processing:** Death certificate analyzed for format authenticity → key details extracted → cross-referenced with policy records → auto-escalation for suspicious patterns.

---

### 7.4 AI Evidence Analysis Engine

> Core AI module powering all verification pipelines.

#### Analysis Capabilities

| Capability | Method | Description |
|---|---|---|
| **OCR** | GPT-4o-mini Vision (primary) + pytesseract (fallback) | Extract text from photos of documents |
| **Damage Assessment** | GPT-4o-mini Vision | Rate damage severity (0-1) from vehicle/property photos |
| **Document Classification** | GPT-4o-mini Vision | Identify document type (FIR, medical report, bill, etc.) |
| **Authenticity Check** | GPT-4o-mini Vision | Flag suspicious formatting, inconsistencies, tampering |
| **Key Field Extraction** | LLM structured output | Pull dates, amounts, names, IDs from any document |
| **PDF Parsing** | PyMuPDF + LLM | Extract and structure text from PDF documents |

#### Structured Evidence Analysis Output

| Field | Type | Description |
|---|---|---|
| `detected_document_type` | string | What the AI identifies the document as |
| `type_match` | boolean | Does detected type match the expected category? |
| `extracted_text` | string | Full OCR / PDF text |
| `key_fields` | object | Structured data (dates, amounts, names, IDs) |
| `damage_severity` | float (0-1) | Damage level from photos (vehicle/property only) |
| `authenticity_score` | float (0-1) | How authentic the document appears (1 = genuine) |
| `authenticity_flags` | array | Issues detected: `["low_resolution", "metadata_mismatch"]` |
| `summary` | string | One-line AI summary of evidence content |

#### API & Cost

- **Primary:** GPT-4o-mini via existing OpenRouter API key ($0.15/M input tokens, ~$0.01 per image)
- **Fallback OCR:** pytesseract (local, free, requires Tesseract system install)
- **PDF Parsing:** PyMuPDF (local, free)
- No new API keys or services required

---

## 8. Backend Architecture Changes

### 8.1 Updated Database Schema

#### New Table: `claims`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| policy_id | VARCHAR(50) | Policy reference |
| insurance_type | ENUM | health, life, vehicle, travel, property |
| claim_type | VARCHAR(50) | Sub-type within insurance category |
| incident_date | DATE | When the incident occurred |
| claim_amount | DECIMAL(12,2) | Requested amount |
| description | TEXT | Claim description |
| location | VARCHAR(255) | Incident location |
| status | VARCHAR(20) | pending, in_review, approved, rejected, escalated |
| verification_status | VARCHAR(20) | not_started, in_progress, complete, failed |
| evidence_completeness_score | DECIMAL(3,2) | 0.0–1.0 |
| created_at | TIMESTAMPTZ | |

#### New Table: `claim_evidence`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| claim_id | UUID FK → claims | Parent claim |
| file_url | VARCHAR(500) | Stored file path/URL |
| file_type | VARCHAR(10) | pdf, jpg, png |
| evidence_category | VARCHAR(50) | medical, financial, legal, visual, etc. |
| insurance_type | VARCHAR(20) | Redundant for query performance |
| uploaded_at | TIMESTAMPTZ | |

#### Modified Table: `traces`

New columns added:

| Column | Type | Notes |
|---|---|---|
| insurance_type | VARCHAR(20) | Links trace to insurance domain |
| claim_id | UUID FK → claims | Links trace to specific claim |
| verification_steps_executed | JSONB | Array of verification step names |
| missing_documents | JSONB | Array of missing evidence types |
| evidence_count | INTEGER | Number of evidence files provided |
| evidence_completeness_score | DECIMAL(3,2) | Score at time of processing |
| verification_latency | INTEGER | Total verification pipeline time (ms) |
| evidence_used_in_decision | JSONB | List of evidence files referenced |

---

### 8.2 New API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/claims` | Submit a new multi-type claim with evidence |
| GET | `/api/claims` | List claims (filterable by insurance_type, status) |
| GET | `/api/claims/:id` | Full claim detail + evidence + trace |
| POST | `/api/claims/:id/evidence` | Upload evidence files for a claim |
| GET | `/api/claims/:id/verification` | Get verification pipeline status |
| GET | `/api/metrics/by-insurance-type` | Claims distribution per insurance type |
| GET | `/api/metrics/verification-latency` | Verification latency per type |

---

## 9. Claims Agent Architecture Upgrade (Python Layer)

### 9.1 New Directory Structure

```
agents/claims_agent/
├── orchestrator.py          # Central routing + coordination
├── evidence_analyzer.py     # [NEW] AI evidence analysis engine (Vision + OCR)
├── verifiers/
│   ├── __init__.py
│   ├── base_verifier.py     # Abstract verification interface
│   ├── health_verifier.py   # Health insurance verification
│   ├── vehicle_verifier.py  # Vehicle insurance verification
│   ├── travel_verifier.py   # Travel insurance verification
│   ├── property_verifier.py # Property insurance verification
│   └── life_verifier.py     # Life insurance verification
├── agent.py                 # (existing, updated)
├── tools.py                 # (existing, updated)
├── prompts.py               # (existing, updated with type-specific prompts)
└── rag.py                   # (existing, updated)
```

### 9.2 Orchestration Logic

1. **Detect** `insurance_type` from claim input
2. **Run AI Evidence Analyzer** on all uploaded files:
   - Images → GPT-4o-mini Vision for OCR + damage assessment + authenticity check
   - PDFs → PyMuPDF text extraction + LLM structured parsing
   - Fallback → pytesseract for OCR if Vision API unavailable
3. **Route** claim + analysis results to corresponding verifier module
4. **Inject evidence analysis** (extracted text, key fields, severity scores) into RAG context
5. **Execute** type-specific verification pipeline steps using real evidence data
6. **Generate** structured decision + domain-aware explanation with evidence references

### 9.3 Structured Agent Output Format

```json
{
  "decision": "APPROVED",
  "insurance_type": "VEHICLE",
  "confidence": 0.91,
  "reasoning": "Accident covered under Clause 3.2. FIR verified. Damage estimate within coverage limits.",
  "key_factors": [
    "Valid FIR report filed within 48 hours",
    "Damage photos consistent with reported accident",
    "Repair estimate below policy maximum"
  ],
  "evidence_used": [
    "FIR_Report_2026.pdf",
    "accident_photo_front.jpg",
    "repair_estimate_v2.pdf"
  ],
  "missing_documents": [],
  "verification_steps": [
    { "step": "Image Evidence Analysis", "status": "passed", "latency_ms": 1200 },
    { "step": "FIR Parsing", "status": "passed", "latency_ms": 800 },
    { "step": "Damage Validation", "status": "passed", "latency_ms": 950 },
    { "step": "Policy Clause Matching", "status": "passed", "latency_ms": 600 }
  ],
  "policy_clauses_applied": ["Clause 3.2 — Collision Coverage", "Clause 5.1 — Deductible"]
}
```

---

## 10. Telemetry & Observability Enhancements

### 10.1 New TraceRecord Fields

| Field | Type | Description |
|---|---|---|
| insurance_type | string | Insurance domain identifier |
| verification_steps_executed | array | Steps completed in verification pipeline |
| missing_documents | array | Evidence gaps detected |
| evidence_count | int | Files provided |
| evidence_completeness_score | float | Uploaded / required ratio |
| verification_latency | int | Pipeline execution time (ms) |
| evidence_used_in_decision | array | Files referenced in reasoning |

### 10.2 New Dashboard Metrics

| Metric | Visualization | Description |
|---|---|---|
| Claims by Insurance Type | Donut/bar chart | Distribution across 5 domains |
| Verification Latency per Type | Box plot / bar chart | Processing time comparison |
| Evidence Completeness Score | Gauge per type | Average completeness |
| Escalation Rate by Domain | Stacked bar | Domain-specific escalation patterns |
| Fraud Signal Density | Heatmap | Fraud indicators per claim type |

---

## 11. XAI & Explainability Enhancements

### 11.1 Domain-Aware Explanation Panel

For each trace, the detail view will display:

| Section | Content |
|---|---|
| Insurance Type | Badge with icon |
| Verification Logic | List of pipeline steps with pass/fail |
| Evidence Referenced | Clickable evidence files used in decision |
| Policy Clauses Used | Specific clauses that applied |
| Key Decision Factors | Bullet-point reasoning |
| Confidence Score | Visual gauge with breakdown |
| Missing Documents | Warning list if evidence incomplete |

---

## 12. Frontend Architecture Updates

### 12.1 New Components

| Component | Purpose |
|---|---|
| `InsuranceTypeSelector.jsx` | Card/dropdown to choose insurance type |
| `DynamicClaimWizard.jsx` | Multi-step form orchestrator |
| `EvidenceUploader.jsx` | Drag-drop file upload with type-specific checklist |
| `VerificationChecklist.jsx` | Shows pipeline steps + status |
| `EvidencePreviewPanel.jsx` | Preview uploaded evidence files |

### 12.2 New/Updated Pages

| Route | Page | Description |
|---|---|---|
| `/submit-claim` | Dynamic Multi-Insurance Form | Replaces generic claim form |
| `/claims/:id` | Claim Detail View | Trace + Evidence + Verification View |

### 12.3 Libraries

| Library | Purpose |
|---|---|
| `react-dropzone` | File drag-and-drop upload |
| `shadcn/ui` | UI components |
| `axios` | API calls (existing) |
| `recharts` | Charts (existing) |

---

## 13. Security & Compliance

| Requirement | Priority |
|---|---|
| File type validation (PDF/JPG/PNG only) | P0 |
| PII guardrail scanning on uploaded documents | P0 |
| Audit logging for all claim submissions | P0 |
| File size limits enforced server-side | P0 |
| RBAC for claim access (future) | P2 |
| Encrypted file storage (S3/Cloudinary — recommended) | P2 |

---

## 14. Performance Targets

| Metric | Target |
|---|---|
| End-to-end claim processing | < 8s (includes AI analysis) |
| Evidence file upload | < 2s per file |
| AI image analysis per file | < 3s |
| OCR text extraction success rate | > 90% |
| Damage severity scoring accuracy | > 80% agreement with human assessment |
| Evidence parsing success rate | > 95% |
| Telemetry loss during multi-claim ingestion | 0 |
| Dashboard load with new metrics | < 2s |

---

## 15. Acceptance Criteria

### Must Have (P0)

- [ ] Dynamic claim wizard renders different fields per insurance type
- [ ] Evidence upload works with drag-drop and type validation
- [x] 5 verifier modules produce type-specific verification results
- [x] Orchestrator correctly routes claims to matching verifier
- [ ] New trace fields (insurance_type, verification_steps, evidence_score) populated
- [ ] Claims-by-type metric visible on dashboard
- [ ] Claim detail page shows evidence + verification pipeline status
- [x] AI evidence analyzer processes uploaded images via GPT-4o-mini Vision
- [x] OCR extracts text from document photos (Vision primary, pytesseract fallback)
- [x] Damage severity scoring (0-1) for vehicle/property photos
- [x] Document authenticity check flags suspicious documents
- [x] Key field extraction from medical bills, FIRs, certificates

### Should Have (P1)

- [ ] Evidence completeness score displayed during claim submission
- [ ] Evidence preview (thumbnail for images, icon for PDFs)
- [ ] Verification latency per insurance type metric on dashboard
- [ ] Domain-aware explanation panel on trace detail view
- [ ] Missing document warnings on claim detail
- [ ] pytesseract fallback works when Vision API is unavailable

### Nice to Have (P2)

- [ ] Cross-policy multi-claim correlation
- [ ] External insurer API integrations

---

## 16. Changes from v1 PRD

> [!IMPORTANT]
> This PRD extends (not replaces) the v1 system. All existing v1 functionality (3 agents, telemetry pipeline, dashboard Sections 1 & 2, traces, alerts) is preserved. v2 adds the multi-insurance layer on top.

| Area | v1 Behavior (Preserved) | v2 Addition |
|---|---|---|
| Claims Agent | Generic claim processing | Orchestrator + 5 verifiers |
| Database | traces, llm_calls, tool_calls, etc. | + claims, claim_evidence tables; traces extended |
| Frontend | Single claim form in Agent Console | Multi-step wizard at /submit-claim |
| Dashboard | 12 widgets (Section 1 + 2) | + Insurance type distribution, verification metrics |
| Telemetry | Basic trace fields | + verification steps, evidence, completeness |

---

*Document Version: 2.0 | Last Updated: February 19, 2026*
