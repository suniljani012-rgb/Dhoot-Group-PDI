-- Autoprime Tata PDI Management Platform - Phase 6: QA Approvals & Digital Certificates
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE qa_decision_enum AS ENUM ('APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. QA REVIEWS
CREATE TABLE IF NOT EXISTS qa_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    reviewed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision qa_decision_enum NOT NULL,
    comments TEXT,
    rejection_reason_code VARCHAR(100),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PDI CERTIFICATES
CREATE TABLE IF NOT EXISTS pdi_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    issued_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_qr_token VARCHAR(100) UNIQUE NOT NULL,
    pdf_object_key TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_qa_reviews_vehicle ON qa_reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_session ON qa_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_pdi_certificates_vehicle ON pdi_certificates(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pdi_certificates_token ON pdi_certificates(verification_qr_token);

-- 4. ENABLE RLS
ALTER TABLE qa_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_certificates ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public select qa_reviews" ON qa_reviews;
    DROP POLICY IF EXISTS "Public select certificates" ON pdi_certificates;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "Public select qa_reviews" ON qa_reviews FOR ALL USING (true);
CREATE POLICY "Public select certificates" ON pdi_certificates FOR ALL USING (true);
