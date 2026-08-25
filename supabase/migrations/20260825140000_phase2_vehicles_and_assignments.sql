-- Autoprime Tata PDI Management Platform - Phase 2: Vehicles & Assignments
-- Version: 1.0.0

DO $$ BEGIN
    CREATE TYPE vehicle_status_enum AS ENUM (
        'RECEIVED',
        'PDI_PENDING',
        'PDI_IN_PROGRESS',
        'PDI_FAILED',
        'REPAIR_PENDING',
        'REPAIR_IN_PROGRESS',
        'REPAIR_COMPLETED',
        'REINSPECTION',
        'QA_PENDING',
        'QA_REJECTED',
        'PDI_APPROVED',
        'DELIVERY_READY',
        'DELIVERED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status_enum AS ENUM (
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED',
        'REASSIGNED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    stockyard_id UUID REFERENCES stockyards(id) ON DELETE SET NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    chassis_number VARCHAR(50) NOT NULL,
    engine_number VARCHAR(50),
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    manufacturing_year INT NOT NULL CHECK (manufacturing_year >= 2020),
    status vehicle_status_enum NOT NULL DEFAULT 'RECEIVED',
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VEHICLE STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS vehicle_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    from_status vehicle_status_enum,
    to_status vehicle_status_enum NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PDI ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS pdi_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status assignment_status_enum NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_status ON vehicles(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);
CREATE INDEX IF NOT EXISTS idx_status_history_vehicle ON vehicle_status_history(vehicle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON pdi_assignments(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_assignments_vehicle ON pdi_assignments(vehicle_id);

-- 5. ENABLE RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_assignments ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view vehicles within branch/HO scope" ON vehicles;
    DROP POLICY IF EXISTS "Managers can insert/update vehicles" ON vehicles;
    DROP POLICY IF EXISTS "Users can view status history" ON vehicle_status_history;
    DROP POLICY IF EXISTS "Users can view assignments" ON pdi_assignments;
    DROP POLICY IF EXISTS "Managers can create assignments" ON pdi_assignments;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE POLICY "Users can view vehicles within branch/HO scope"
    ON vehicles FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN') 
        OR branch_id = get_auth_user_branch_id()
    );

CREATE POLICY "Managers can insert/update vehicles"
    ON vehicles FOR ALL
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER')
    );

CREATE POLICY "Users can view status history"
    ON vehicle_status_history FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN')
        OR vehicle_id IN (SELECT id FROM vehicles WHERE branch_id = get_auth_user_branch_id())
    );

CREATE POLICY "Users can view assignments"
    ON pdi_assignments FOR SELECT
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER', 'QA_MANAGER')
        OR assigned_to = auth.uid()
    );

CREATE POLICY "Managers can create assignments"
    ON pdi_assignments FOR ALL
    USING (
        get_auth_user_role() IN ('SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER')
    );
