# 🗺️ InsureOps AI v2 — Implementation Roadmap

> Multi-Insurance Claim Flow & Verification Upgrade — Phase-by-phase build plan with file-level tracking.

---

## 📊 v2 Progress Overview

| Phase | Goal | Files | Est. Effort | Status |
|---|---|---|---|---|
| Phase 1 | Database Schema + Insurance Type Integration | 4 files | 2 days | ✅ Complete |
| Phase 2 | Dynamic Multi-Insurance Claim Wizard (Frontend) | 6 files | 3 days | ✅ Complete |
| Phase 3 | File Upload + Evidence Storage API | 5 files | 2 days | ✅ Complete |
| Phase 4 | Claims Orchestrator + AI Evidence Analyzer + Verifier Modules | 11 files | 5 days | ✅ Complete |
| Phase 5 | Telemetry & XAI Panel Upgrades | 8 files | 2 days | ✅ Complete |
| Phase 6 | Dashboard Domain-Wise Analytics & Testing | 8 files | 3 days | ✅ Complete |
| **TOTAL** | | **~40 files** | **~18 days** | **✅ 100%** |

> [!NOTE]
> These phases build **on top of** the existing v1 system (~85% complete). All v1 functionality is preserved.

---

## 🔖 v2 Milestone Tracking

- [x] **M-v2.1** — Database upgraded with `claims` + `claim_evidence` tables, `traces` extended
- [x] **M-v2.2** — Dynamic claim wizard renders per-type forms in frontend
- [x] **M-v2.3** — Evidence upload pipeline works end-to-end (upload → store → retrieve)
- [x] **M-v2.4** — All 5 verifier modules produce type-specific verification results
- [x] **M-v2.5** — Enhanced telemetry flows into dashboard with verification-level data
- [x] **M-v2.6** — Dashboard shows insurance-type analytics, claim detail with evidence view

---

## ⚠️ Prerequisites (v1 Completion)

> [!IMPORTANT]
> The following v1 items should ideally be completed before starting v2 to avoid integration conflicts:

| v1 Item | Current Status | Impact on v2 |
|---|---|---|
| Section 2 Dashboard wiring | 🟡 60% | Low — v2 adds new widgets alongside |
| Trace Viewer UI | 🟡 50% | Medium — v2 extends trace detail view |
| Alert System UI | 🟡 70% | Low — v2 doesn't modify alerts |
| Agent Console UI | 🟡 60% | High — v2 replaces the claims form |

---

---

# PHASE 1: Database Schema + Insurance Type Integration

> **Goal:** Extend the database to support multi-type claims with evidence tracking. Update backend models and config.

### Database Layer

| # | File | Action | Description |
|---|---|---|---|
| 1 | `database/schema_v2.sql` | **[NEW]** | Migration script: CREATE `claims` table (id, policy_id, insurance_type, claim_type, incident_date, claim_amount, description, location, status, verification_status, evidence_completeness_score). CREATE `claim_evidence` table (id, claim_id FK, file_url, file_type, evidence_category, insurance_type). ALTER `traces` to add insurance_type, claim_id FK, verification_steps_executed, missing_documents, evidence_count, evidence_completeness_score, verification_latency, evidence_used_in_decision. Add ENUM constraint for insurance_type: health, life, vehicle, travel, property. |
| 2 | `database/seed_claims.sql` | **[NEW]** | Seed data: 25+ sample claims across all 5 insurance types with varied statuses. Sample evidence records linked to claims. Ensures dashboard has data on first load. |

### Backend Models

| # | File | Action | Description |
|---|---|---|---|
| 3 | `backend/src/models/models.js` | **[MODIFY]** | Add Sequelize models: `Claim` (maps to `claims` table), `ClaimEvidence` (maps to `claim_evidence`). Update `Trace` model with new columns. Set up associations: Claim hasMany ClaimEvidence, Claim hasOne Trace. |
| 4 | `backend/src/models/index.js` | **[MODIFY]** | Export new `Claim` and `ClaimEvidence` models. Register associations. |

### Phase 1 Checklist
- [x] `claims` table created with all columns and ENUM constraint
- [x] `claim_evidence` table created with FK to claims
- [x] `traces` table altered with new v2 columns
- [x] Sequelize models updated and synced
- [x] Seed data populates claims across 5 insurance types
- [x] `agent_type` constraint in traces updated to include new types if needed

> **Completed:** Feb 19, 2026 — `schema_v2.sql`, `seed_claims.sql`, `models.js` (Claim + ClaimEvidence), `index.js` (associations)

---

---

# PHASE 2: Dynamic Multi-Insurance Claim Wizard (Frontend)

> **Goal:** Build a multi-step claim submission form that dynamically adapts fields and evidence requirements based on selected insurance type.

### New Components

| # | File | Action | Description |
|---|---|---|---|
| 5 | `frontend/src/components/claims/InsuranceTypeSelector.jsx` | **[NEW]** | Card-based selection UI for 5 insurance types. Each card shows: icon, type name, brief description. Selected state with visual highlight. Emits `onSelect(type)`. |
| 6 | `frontend/src/components/claims/DynamicClaimWizard.jsx` | **[NEW]** | Multi-step form orchestrator. Steps: (1) Select Insurance Type, (2) Incident Details (dynamic fields), (3) Evidence Upload, (4) Review & Submit. Progress indicator bar. Manages form state across steps. Submit triggers API call. |
| 7 | `frontend/src/components/claims/EvidenceUploader.jsx` | **[NEW]** | Drag-and-drop file upload using `react-dropzone`. Shows type-specific evidence checklist (required vs uploaded). File preview (thumbnail for images, icon for PDFs). Calculates evidence completeness score. File validation (type + size). |
| 8 | `frontend/src/components/claims/VerificationChecklist.jsx` | **[NEW]** | Displays the verification pipeline steps for the selected insurance type. Shows status per step (pending, in-progress, passed, failed). Used in both the wizard (as preview) and claim detail page. |
| 9 | `frontend/src/components/claims/EvidencePreviewPanel.jsx` | **[NEW]** | Preview panel for uploaded evidence. Image thumbnails with lightbox zoom. PDF icon with filename. Delete button per file. Evidence category label. |

### Pages & Config

| # | File | Action | Description |
|---|---|---|---|
| 10 | `frontend/src/pages/SubmitClaimPage.jsx` | **[NEW]** | Page wrapper for `/submit-claim` route. Hosts `DynamicClaimWizard`. Handles submission success/error states. Redirects to claim detail on success. |
| 11 | `frontend/src/App.jsx` | **[MODIFY]** | Add route `/submit-claim` → `SubmitClaimPage`. Update sidebar to include "Submit Claim" link. |

### Phase 2 Checklist
- [x] Insurance type selector renders all 5 types with icons
- [x] Form fields change dynamically per insurance type
- [x] Evidence uploader validates file types (PDF/JPG/PNG)
- [x] Evidence checklist shows required docs per type
- [x] Completeness score updates in real-time as files are added
- [x] Multi-step wizard navigates forward/back correctly
- [x] Submit sends data to backend API
- [x] Native drag-and-drop (no `react-dropzone` needed)

> **Completed:** Feb 19, 2026 — Wizard integrated into Agents page (replaces old ClaimsAgentForm). 5 new components in `components/claims/`, no new deps. Build verified: 2850 modules, 0 errors.

---

---

# PHASE 3: File Upload + Evidence Storage API

> **Goal:** Backend endpoints for claim submission, evidence file upload, and retrieval. Local file storage (upgradeable to S3/Cloudinary).

### Backend Routes

| # | File | Action | Description |
|---|---|---|---|
| 12 | `backend/src/routes/claims.js` | **[NEW]** | POST `/api/claims` — create claim with insurance_type, returns claim_id. GET `/api/claims` — list claims (filter by insurance_type, status, date). GET `/api/claims/:id` — full claim detail + evidence list + linked trace. PUT `/api/claims/:id/status` — update claim status. |
| 13 | `backend/src/routes/evidence.js` | **[NEW]** | POST `/api/claims/:id/evidence` — multipart file upload (multer), validates file type (PDF/JPG/PNG), stores to `uploads/` directory, creates ClaimEvidence record. GET `/api/claims/:id/evidence` — list all evidence for a claim. DELETE `/api/claims/:id/evidence/:evidenceId` — remove evidence file. |

### Backend Services

| # | File | Action | Description |
|---|---|---|---|
| 14 | `backend/src/services/claimService.js` | **[NEW]** | Business logic for claims CRUD. Calculates evidence_completeness_score based on insurance_type requirements. Maps insurance type to required evidence categories. Triggers orchestrator agent when claim is ready for processing. |
| 15 | `backend/src/services/evidenceService.js` | **[NEW]** | File storage management. Validates file types and sizes. Generates unique filenames. Returns file URLs. Handles cleanup on claim deletion. |

### Route Registration

| # | File | Action | Description |
|---|---|---|---|
| 16 | `backend/src/routes/index.js` | **[MODIFY]** | Register new `/api/claims` and evidence routes. Add multer middleware config. |

### Phase 3 Checklist
- [x] POST `/api/claims` creates a claim in DB
- [x] File upload stores files to `uploads/` directory
- [x] File type validation rejects non-PDF/JPG/PNG
- [x] GET `/api/claims/:id` returns claim + evidence list
- [x] Evidence completeness score calculated correctly per type
- [x] `multer` installed and configured for multipart uploads
- [x] Uploaded files retrievable via URL

> **Completed:** Feb 19, 2026 — `claimService.js`, `evidenceService.js`, `routes/claims.js`, `routes/evidence.js` created. 7 API endpoints. Routes verified.

---

---

# PHASE 4: Claims Orchestrator + AI Evidence Analyzer + Verifier Modules

> **Goal:** Refactor the Claims Agent into an orchestrator pattern with an **AI evidence analysis engine** (GPT-4o-mini Vision + pytesseract OCR) and 5 type-specific verifier modules. Each verifier uses real AI-powered document/image analysis.

### Evidence Analysis Engine

| # | File | Action | Description |
|---|---|---|---|
| 17 | `agents/claims_agent/evidence_analyzer.py` | **[NEW]** | Core AI evidence analysis module. (1) `analyze_image()` — sends images to GPT-4o-mini Vision via OpenRouter for OCR, damage severity scoring (0-1), document classification, authenticity checking, and key field extraction. (2) `analyze_pdf()` — uses PyMuPDF to extract text, then LLM for structured parsing. (3) `analyze_evidence_batch()` — processes all evidence for a claim, returns consolidated results. (4) Fallback OCR via pytesseract when Vision API is unavailable. Returns structured `EvidenceAnalysis` output per file. |

### Orchestrator

| # | File | Action | Description |
|---|---|---|---|
| 18 | `agents/claims_agent/orchestrator.py` | **[NEW]** | Central orchestration logic. (1) Receives claim with insurance_type. (2) Runs `evidence_analyzer` on all uploaded files. (3) Selects correct verifier module. (4) Passes evidence analysis results to verifier. (5) Injects analysis (extracted text, key fields, severity scores) into LLM context. (6) Returns structured decision with evidence references. Manages verification_steps tracking for telemetry. |

### Verifier Modules

| # | File | Action | Description |
|---|---|---|---|
| 19 | `agents/claims_agent/verifiers/__init__.py` | **[NEW]** | Exports all verifier classes. Provides `get_verifier(insurance_type)` factory function. |
| 20 | `agents/claims_agent/verifiers/base_verifier.py` | **[NEW]** | Abstract base class. Defines interface: `verify(claim, evidence_analysis) → VerificationResult`. Common utilities: evidence_completeness_check, missing_document_detection. Shared Pydantic models for VerificationResult, VerificationStep, EvidenceAnalysis. |
| 21 | `agents/claims_agent/verifiers/health_verifier.py` | **[NEW]** | Health insurance pipeline. Uses AI-extracted fields from hospital bills (procedure codes, amounts, dates). Steps: (1) Medical Doc Parser — uses LLM-extracted key_fields from bills, (2) Coverage Eligibility — matches procedures to policy, (3) Fraud Detection — flags amount mismatches between bill and claim. |
| 22 | `agents/claims_agent/verifiers/vehicle_verifier.py` | **[NEW]** | Vehicle insurance pipeline. Uses Vision AI for real damage analysis. Steps: (1) Damage Photo Analysis — reads `damage_severity` score (0-1) from evidence_analyzer, (2) FIR OCR Parsing — uses `extracted_text` from police report, (3) Cross-Validation — checks damage severity vs repair estimate amount, (4) Policy Clause Matching. |
| 23 | `agents/claims_agent/verifiers/travel_verifier.py` | **[NEW]** | Travel insurance pipeline. Uses OCR for ticket/certificate analysis. Steps: (1) Boarding Pass OCR — extracts flight numbers, dates from `key_fields`, (2) Delay Certificate Verification — cross-validates dates, (3) Coverage Matching. |
| 24 | `agents/claims_agent/verifiers/property_verifier.py` | **[NEW]** | Property insurance pipeline. Uses Vision AI for damage + OCR for documents. Steps: (1) Ownership OCR — extracts owner name, property ID, (2) Damage Photo Analysis — severity score from Vision API, (3) Surveyor Report Parsing, (4) Cost Validation — AI estimate vs repair quote. |
| 25 | `agents/claims_agent/verifiers/life_verifier.py` | **[NEW]** | Life insurance pipeline. Uses Vision AI for document authenticity. Steps: (1) Death Certificate Analysis — `authenticity_score` + `authenticity_flags`, (2) Key Field Extraction — name, date, cause, hospital, (3) Policy Tenure Analysis, (4) Risk Clause Evaluation + auto-escalation. |

### Existing File Updates

| # | File | Action | Description |
|---|---|---|---|
| 26 | `agents/claims_agent/prompts.py` | **[MODIFY]** | Add type-specific prompt templates: `HEALTH_CLAIM_PROMPT`, `VEHICLE_CLAIM_PROMPT`, `TRAVEL_CLAIM_PROMPT`, `PROPERTY_CLAIM_PROMPT`, `LIFE_CLAIM_PROMPT`. Each includes domain-specific adjuster persona and evaluation criteria. |
| 27 | `agents/requirements.txt` | **[MODIFY]** | Add: `Pillow>=10.0.0` (image processing for base64 encoding), `pytesseract>=0.3.10` (fallback OCR engine). Note: pytesseract requires Tesseract OCR system install on Windows. |

### Phase 4 Checklist
- [x] `evidence_analyzer.py` created with `analyze_image()`, `analyze_pdf()`, `analyze_evidence_batch()`
- [x] GPT-4o-mini Vision integration works via OpenRouter (image → base64 → API)
- [x] pytesseract fallback OCR works when Vision API fails
- [x] Damage severity scoring returns 0-1 float for vehicle/property photos
- [x] Document authenticity check returns score + flags
- [x] Key field extraction produces structured data (dates, amounts, names)
- [x] Orchestrator correctly routes to each of the 5 verifiers
- [x] Each verifier uses real evidence analysis results (not just file existence checks)
- [x] Health verifier: uses LLM-extracted procedure codes, checks coverage
- [x] Vehicle verifier: uses Vision damage score, cross-validates with repair estimate
- [x] Travel verifier: uses OCR-extracted flight details, validates dates
- [x] Property verifier: uses Vision damage score + ownership OCR
- [x] Life verifier: uses authenticity score + flags from Vision AI
- [x] Structured decision output includes evidence_used, damage scores, extracted fields
- [x] Pillow and pytesseract added to requirements.txt

> **Completed:** Feb 19, 2026 — Evidence Analyzer (Vision/OCR), 5 Verifiers (Health, Vehicle, Travel, Property, Life), Orchestrator Refactor, Backend Integration via `child_process`. API verified.

---

---

# PHASE 5: Telemetry & XAI Panel Upgrades

> **Goal:** Extend the telemetry pipeline to capture verification-level data. Upgrade the trace detail view with domain-aware explanation panels.

### Telemetry Updates

| # | File | Action | Description |
|---|---|---|---|
| 26 | `agents/instrumentation/schemas.py` | **[MODIFY]** | Extend TraceRecord with: insurance_type, verification_steps_executed, missing_documents, evidence_count, evidence_completeness_score, verification_latency, evidence_used_in_decision. Add VerificationStepRecord model. |
| 27 | `agents/instrumentation/tracer.py` | **[MODIFY]** | Capture verification pipeline steps. Track per-step latency. Record evidence used in decision. Calculate verification_latency separately from LLM latency. |
| 28 | `agents/instrumentation/collector.py` | **[MODIFY]** | Update POST payload to include new fields. Ensure backward compatibility (new fields optional for v1 agents). |

### Frontend XAI Panel

| # | File | Action | Description |
|---|---|---|---|
| 29 | `frontend/src/components/traces/VerificationPanel.jsx` | **[NEW]** | XAI explanation panel for trace detail view. Shows: Insurance Type badge, Verification Steps timeline (with pass/fail per step), Evidence Referenced (clickable list), Policy Clauses Used, Key Decision Factors, Confidence gauge, Missing Documents warnings. |
| 30 | `frontend/src/pages/ClaimDetailPage.jsx` | **[NEW]** | Page for `/claims/:id` route. Shows: Claim summary header, Evidence gallery, Verification pipeline status, Linked trace with full timeline, Decision explanation panel. |

### Phase 5 Checklist
- [x] TraceRecord schema includes all new verification fields (Backend `models.js` + Python `schemas.py` updated)
- [x] Tracer captures verification pipeline steps with latency (`tracer.py` — `set_claim_context`, `record_verification_step`, `verification_timer`)
- [x] Collector sends extended telemetry to backend (`collector.py` — backward compatible v2 payload)
- [x] Verification panel renders in trace detail view (`VerificationPanel.jsx` integrated into `TraceDetailPage`)
- [x] Claim detail page shows evidence + verification + decision (`ClaimDetailPage.jsx`)
- [x] Claims list page with search + filters (`ClaimsListPage.jsx`)
- [x] `/claims` and `/claims/:id` routes registered in `App.jsx`

> **Completed:** Feb 19, 2026 — Python instrumentation extended (schemas, tracer, collector). `VerificationPanel.jsx`, `ClaimDetailPage.jsx`, `ClaimsListPage.jsx` created. Routes wired. Build verified.

---

---

# PHASE 6: Dashboard Domain-Wise Analytics & Testing

> **Goal:** Add insurance-type distribution metrics to the dashboard. End-to-end testing across all 5 insurance types.

### Dashboard Components

| # | File | Action | Description |
|---|---|---|---|
| 31 | `frontend/src/components/section1/InsuranceTypeDistribution.jsx` | **[NEW]** | Donut or stacked bar chart showing claims distribution across 5 insurance types. Clickable segments filter the dashboard. |
| 32 | `frontend/src/components/section1/VerificationLatencyWidget.jsx` | **[NEW]** | Box plot or grouped bar chart showing verification pipeline latency per insurance type. Highlights slowest pipeline. |
| 33 | `frontend/src/components/section1/EvidenceCompletenessWidget.jsx` | **[NEW]** | Gauge charts (one per type) showing average evidence completeness score. Color-coded: green > 0.8, yellow 0.5-0.8, red < 0.5. |

### Backend Analytics

| # | File | Action | Description |
|---|---|---|---|
| 34 | `backend/src/core/analytics.js` | **[MODIFY]** | Add queries: `getClaimsByInsuranceType(timerange)`, `getVerificationLatencyByType(timerange)`, `getEvidenceCompletenessAvg(type)`, `getEscalationRateByDomain(timerange)`, `getFraudSignalsByType(timerange)`. |
| 35 | `backend/src/routes/metrics.js` | **[MODIFY]** | Add endpoint: GET `/api/metrics/by-insurance-type` returning type distribution, verification latency, and completeness metrics. |

### Testing & Seed Data

| # | File | Action | Description |
|---|---|---|---|
| 36 | `simulator/seed_claims_v2.py` | **[NEW]** | Generate 50+ historical claims across all 5 insurance types with evidence records, varied verification statuses, and realistic completeness scores. Populates the v2 tables for dashboard demo. |

### Phase 6 Checklist
- [x] Insurance type distribution donut chart shows data for all 5 types (`InsuranceTypeDistribution.jsx`)
- [x] Verification latency bar chart compares pipeline speeds with slowest warning (`VerificationLatencyWidget.jsx`)
- [x] Evidence completeness SVG gauges render per type with green/yellow/red thresholds (`EvidenceCompletenessWidget.jsx`)
- [x] Analytics queries return correct aggregations (`analytics.js` — `getInsuranceTypeMetrics()`)
- [x] Cached metrics service with 10s TTL (`metricsService.js` — `getInsuranceType()`)
- [x] `GET /api/metrics/by-insurance-type` endpoint returns real data (`metrics.js`)
- [x] Seed script generates 50 claims across all 5 types (`seed_claims_v2.py`)
- [x] Widgets integrated into Section1Page under "Insurance Analytics" section
- [x] Frontend API function added (`api.js` — `getInsuranceTypeMetrics()`)

> **Completed:** Feb 19, 2026 — 3 chart widgets, backend analytics queries, metrics endpoint, seed script, Section1Page integration. API verified returning real data. Build passed.

---

---

## 📎 v2 New File Index

> All ~22 new files and ~18 modified files at a glance.

```
insureops-ai/
│
├── database/
│   ├── schema_v2.sql                    # [NEW] Migration: claims + claim_evidence tables
│   └── seed_claims.sql                  # [NEW] Seed data for 5 insurance types
│
├── backend/src/
│   ├── models/
│   │   ├── models.js                    # [MODIFY] + Claim, ClaimEvidence models
│   │   └── index.js                     # [MODIFY] + new model exports
│   ├── routes/
│   │   ├── index.js                     # [MODIFY] + claims/evidence routes
│   │   ├── claims.js                    # [NEW] Claims CRUD endpoints
│   │   ├── evidence.js                  # [NEW] File upload endpoints
│   │   └── metrics.js                   # [MODIFY] + insurance-type metrics
│   ├── services/
│   │   ├── claimService.js              # [NEW] Claims business logic
│   │   └── evidenceService.js           # [NEW] File storage management
│   └── core/
│       └── analytics.js                 # [MODIFY] + type-based queries
│
├── agents/claims_agent/
│   ├── orchestrator.py                  # [NEW] Central claim routing
│   ├── evidence_analyzer.py             # [NEW] AI evidence analysis (Vision + OCR)
│   ├── prompts.py                       # [MODIFY] + type-specific prompts
│   └── verifiers/
│       ├── __init__.py                  # [NEW] Verifier exports
│       ├── base_verifier.py             # [NEW] Abstract verifier
│       ├── health_verifier.py           # [NEW] Health pipeline
│       ├── vehicle_verifier.py          # [NEW] Vehicle pipeline
│       ├── travel_verifier.py           # [NEW] Travel pipeline
│       ├── property_verifier.py         # [NEW] Property pipeline
│       └── life_verifier.py             # [NEW] Life pipeline
│
├── agents/instrumentation/
│   ├── schemas.py                       # [MODIFY] + verification fields
│   ├── tracer.py                        # [MODIFY] + verification tracking
│   └── collector.py                     # [MODIFY] + extended payload
│
├── frontend/src/
│   ├── App.jsx                          # [MODIFY] + new routes
│   ├── components/claims/
│   │   ├── InsuranceTypeSelector.jsx    # [NEW] Type selector UI
│   │   ├── DynamicClaimWizard.jsx       # [NEW] Multi-step form
│   │   ├── EvidenceUploader.jsx         # [NEW] File upload
│   │   ├── VerificationChecklist.jsx    # [NEW] Pipeline status
│   │   └── EvidencePreviewPanel.jsx     # [NEW] File preview
│   ├── components/traces/
│   │   └── VerificationPanel.jsx        # [NEW] XAI explanation panel
│   ├── components/section1/
│   │   ├── InsuranceTypeDistribution.jsx # [NEW] Type distribution chart
│   │   ├── VerificationLatencyWidget.jsx # [NEW] Latency comparison
│   │   └── EvidenceCompletenessWidget.jsx # [NEW] Completeness gauges
│   └── pages/
│       ├── SubmitClaimPage.jsx          # [NEW] /submit-claim page
│       └── ClaimDetailPage.jsx          # [NEW] /claims/:id page
│
└── simulator/
    └── seed_claims_v2.py                # [NEW] v2 seed data generator
```

---

## 🏁 v2 Definition of Done

The v2 upgrade is **complete** when ALL of the following are true:

- [x] Dynamic claim wizard accepts claims for all 5 insurance types
- [x] Evidence upload works with type-specific validation and preview
- [x] All 5 verifier modules execute correct verification pipelines
- [x] Orchestrator routes claims to correct verifier based on type
- [x] Enhanced telemetry captures verification steps, evidence, and completeness
- [x] Dashboard shows claims-by-type distribution metric
- [x] Claim detail page shows evidence gallery + verification pipeline + decision
- [x] XAI panel shows domain-aware explanation with evidence references
- [x] End-to-end flow: Submit → Upload → Verify → Trace → Dashboard ✅
- [x] Seed data populates v2 tables for demo readiness

---

## 🔮 Future Scope (Post-v2)

| Feature | Description | Priority |
|---|---|---|
| External APIs | Integration with insurer verification APIs | P3 |
| Cross-Policy Correlation | Multi-claim pattern detection across policies | P3 |
| RBAC | Role-based access control for claim management | P2 |
| Cloud Storage | S3/Cloudinary for encrypted file storage | P2 |
| Advanced Fraud Models | Custom-trained fraud detection models per vertical | P3 |

---

*Last Updated: February 19, 2026 — All 6 Phases complete (100%) ✅*
