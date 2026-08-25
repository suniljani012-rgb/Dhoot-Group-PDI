-- Autoprime Tata PDI Management Platform - Phase 4 & 5: Media, Damage Findings & Repairs
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE attachment_status_enum AS ENUM ('PENDING', 'UPLOADED', 'FAILED', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE finding_status_enum AS ENUM ('OPEN', 'REPAIR_ASSIGNED', 'RESOLVED', 'REINSPECTED', 'WAIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE repair_priority_enum AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE repair_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. ATTACHMENTS (R2 MEDIA METADATA)
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES pdi_sessions(id) ON DELETE SET NULL,
    finding_id UUID,
    slot_code VARCHAR(100) NOT NULL, -- e.g. 'exterior-front', 'interior-dashboard', 'damage-01'
    object_key TEXT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT,
    status attachment_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INSPECTION FINDINGS (DAMAGE & DEFECTS)
CREATE TABLE IF NOT EXISTS inspection_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES checklist_items(id) ON DELETE SET NULL,
    severity severity_level_enum NOT NULL DEFAULT 'MAJOR',
    body_area VARCHAR(100) NOT NULL, -- 'FRONT_BUMPER', 'HOOD', 'LEFT_DOOR', 'WINDSHIELD', etc.
    description TEXT NOT NULL,
    status finding_status_enum NOT NULL DEFAULT 'OPEN',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REPAIR TICKETS (WORKSHOP ASSIGNMENTS)
CREATE TABLE IF NOT EXISTS repair_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID NOT NULL REFERENCES inspection_findings(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    priority repair_priority_enum NOT NULL DEFAULT 'HIGH',
    status repair_status_enum NOT NULL DEFAULT 'OPEN',
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parts_required TEXT,
    work_notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_attachments_vehicle ON attachments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_attachments_session ON attachments(session_id);
CREATE INDEX IF NOT EXISTS idx_findings_session ON inspection_findings(session_id);
CREATE INDEX IF NOT EXISTS idx_findings_vehicle ON inspection_findings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_branch ON repair_tickets(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_technician ON repair_tickets(assigned_technician_id);

-- 5. ENABLE RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users view attachments in branch" ON attachments;
    DROP POLICY IF EXISTS "Users manage attachments" ON attachments;
    DROP POLICY IF EXISTS "Users view findings" ON inspection_findings;
    DROP POLICY IF EXISTS "Engineers manage findings" ON inspection_findings;
    DROP POLICY IF EXISTS "Workshop and Managers view repair tickets" ON repair_tickets;
    DROP POLICY IF EXISTS "Workshop and Managers manage repair tickets" ON repair_tickets;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "Users view attachments in branch" ON attachments FOR SELECT USING (true);
CREATE POLICY "Users manage attachments" ON attachments FOR ALL USING (true);
CREATE POLICY "Users view findings" ON inspection_findings FOR SELECT USING (true);
CREATE POLICY "Engineers manage findings" ON inspection_findings FOR ALL USING (true);
CREATE POLICY "Workshop and Managers view repair tickets" ON repair_tickets FOR SELECT USING (true);
CREATE POLICY "Workshop and Managers manage repair tickets" ON repair_tickets FOR ALL USING (true);
