-- Autoprime Tata PDI Management Platform - Phase 3: Configurable PDI Checklist Engine
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE response_type_enum AS ENUM (
        'PASS_FAIL',
        'NUMERIC',
        'TEXT',
        'PHOTO_REQUIRED',
        'BOOLEAN',
        'MULTI_SELECT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level_enum AS ENUM (
        'CRITICAL',
        'MAJOR',
        'MINOR',
        'OBSERVATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pdi_session_status_enum AS ENUM (
        'DRAFT',
        'IN_PROGRESS',
        'SUBMITTED',
        'APPROVED',
        'REJECTED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. CHECKLIST TEMPLATES
CREATE TABLE IF NOT EXISTS checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    model_pattern VARCHAR(100) NOT NULL, -- e.g. 'Tata Nexon', 'Tata Harrier', 'ALL'
    fuel_type VARCHAR(50) DEFAULT 'ALL', -- 'PETROL', 'DIESEL', 'EV', 'CNG', 'ALL'
    transmission VARCHAR(50) DEFAULT 'ALL',
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CHECKLIST CATEGORIES
CREATE TABLE IF NOT EXISTS checklist_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(template_id, code)
);

-- 3. CHECKLIST ITEMS
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES checklist_categories(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    response_type response_type_enum NOT NULL DEFAULT 'PASS_FAIL',
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    evidence_required BOOLEAN NOT NULL DEFAULT false,
    failure_severity severity_level_enum NOT NULL DEFAULT 'MAJOR',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category_id, item_code)
);

-- 4. PDI SESSIONS (INSPECTION RUNS)
CREATE TABLE IF NOT EXISTS pdi_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE RESTRICT,
    inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    status pdi_session_status_enum NOT NULL DEFAULT 'IN_PROGRESS',
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_items INT NOT NULL DEFAULT 0,
    passed_items INT NOT NULL DEFAULT 0,
    failed_items INT NOT NULL DEFAULT 0,
    na_items INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CHECKLIST RESPONSES
CREATE TABLE IF NOT EXISTS checklist_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES pdi_sessions(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL, -- 'PASS', 'FAIL', 'NA'
    numeric_value NUMERIC(10, 2),
    text_value TEXT,
    remarks TEXT,
    media_count INT NOT NULL DEFAULT 0,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, item_id)
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_checklist_categories_template ON checklist_categories(template_id, display_order);
CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_pdi_sessions_vehicle ON pdi_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pdi_sessions_inspector ON pdi_sessions(inspector_id, status);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_session ON checklist_responses(session_id);

-- 7. ENABLE RLS
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_responses ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "All users view active checklist templates" ON checklist_templates;
    DROP POLICY IF EXISTS "All users view categories" ON checklist_categories;
    DROP POLICY IF EXISTS "All users view checklist items" ON checklist_items;
    DROP POLICY IF EXISTS "Users view PDI sessions in branch" ON pdi_sessions;
    DROP POLICY IF EXISTS "Engineers create and update own PDI sessions" ON pdi_sessions;
    DROP POLICY IF EXISTS "Users view and manage responses for permitted sessions" ON checklist_responses;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "All users view active checklist templates"
    ON checklist_templates FOR SELECT
    USING (is_active = true);

CREATE POLICY "All users view categories"
    ON checklist_categories FOR SELECT
    USING (true);

CREATE POLICY "All users view checklist items"
    ON checklist_items FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users view PDI sessions in branch"
    ON pdi_sessions FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN')
        OR branch_id = get_auth_user_branch_id()
    );

CREATE POLICY "Engineers create and update own PDI sessions"
    ON pdi_sessions FOR ALL
    USING (
        inspector_id = auth.uid()
        OR get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER', 'QA_MANAGER')
    );

CREATE POLICY "Users view and manage responses for permitted sessions"
    ON checklist_responses FOR ALL
    USING (
        session_id IN (
            SELECT id FROM pdi_sessions 
            WHERE inspector_id = auth.uid() 
               OR branch_id = get_auth_user_branch_id() 
               OR get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN')
        )
    );
