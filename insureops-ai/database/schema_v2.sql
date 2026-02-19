-- ============================================
-- InsureOps AI v2 — Database Schema Migration
-- PostgreSQL 15+ | Extends v1 schema
-- ============================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLAIMS — One row per insurance claim
-- ============================================
CREATE TABLE IF NOT EXISTS claims (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id                   VARCHAR(50) NOT NULL,
    insurance_type              VARCHAR(20) NOT NULL CHECK (insurance_type IN ('health', 'life', 'vehicle', 'travel', 'property')),
    claim_type                  VARCHAR(50),
    incident_date               DATE,
    claim_amount                DECIMAL(12,2) NOT NULL DEFAULT 0,
    description                 TEXT,
    location                    VARCHAR(255),
    status                      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'escalated')),
    verification_status         VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (verification_status IN ('not_started', 'in_progress', 'complete', 'failed')),
    evidence_completeness_score DECIMAL(3,2) DEFAULT 0.00,
    type_specific_data          JSONB,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_insurance_type ON claims(insurance_type);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);

-- ============================================
-- CLAIM_EVIDENCE — Evidence files linked to claims
-- ============================================
CREATE TABLE IF NOT EXISTS claim_evidence (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id            UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    file_url            VARCHAR(500) NOT NULL,
    file_name           VARCHAR(255),
    file_type           VARCHAR(10) CHECK (file_type IN ('pdf', 'jpg', 'png')),
    file_size_bytes     INTEGER,
    evidence_category   VARCHAR(50) NOT NULL,
    insurance_type      VARCHAR(20),
    uploaded_at         TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim_id ON claim_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_category ON claim_evidence(evidence_category);

-- ============================================
-- ALTER TRACES — Add v2 verification columns
-- ============================================
-- These columns extend the existing traces table for v2 verification tracking

ALTER TABLE traces ADD COLUMN IF NOT EXISTS insurance_type VARCHAR(20);
ALTER TABLE traces ADD COLUMN IF NOT EXISTS claim_id UUID REFERENCES claims(id) ON DELETE SET NULL;
ALTER TABLE traces ADD COLUMN IF NOT EXISTS verification_steps_executed JSONB;
ALTER TABLE traces ADD COLUMN IF NOT EXISTS missing_documents JSONB;
ALTER TABLE traces ADD COLUMN IF NOT EXISTS evidence_count INTEGER DEFAULT 0;
ALTER TABLE traces ADD COLUMN IF NOT EXISTS evidence_completeness_score DECIMAL(3,2);
ALTER TABLE traces ADD COLUMN IF NOT EXISTS verification_latency INTEGER;
ALTER TABLE traces ADD COLUMN IF NOT EXISTS evidence_used_in_decision JSONB;

CREATE INDEX IF NOT EXISTS idx_traces_insurance_type ON traces(insurance_type);
CREATE INDEX IF NOT EXISTS idx_traces_claim_id ON traces(claim_id);
