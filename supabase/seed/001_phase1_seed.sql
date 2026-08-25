-- Autoprime Tata PDI Management Platform - Seed Data

INSERT INTO roles (code, name, description) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full platform access and cross-organization management'),
('HO_ADMIN', 'Head Office Administrator', 'Head Office administrator with access to all branches'),
('REGIONAL_MANAGER', 'Regional Manager', 'Manages branches within an assigned region'),
('BRANCH_MANAGER', 'Branch Manager', 'Manages vehicle inspection, repairs, and personnel at branch'),
('PDI_ENGINEER', 'PDI Engineer', 'Performs vehicle inspections in stockyard/workshop'),
('WORKSHOP_MANAGER', 'Workshop Manager', 'Manages defect repair tickets and workshop technicians'),
('TECHNICIAN', 'Workshop Technician', 'Executes vehicle repairs and component replacements'),
('QA_MANAGER', 'Quality Assurance Manager', 'Reviews completed inspections and issues PDI certificates'),
('VIEWER', 'Read-Only Viewer', 'Audit and reporting viewer access')
ON CONFLICT (code) DO NOTHING;

INSERT INTO organizations (id, name, code) VALUES
('11111111-1111-1111-1111-111111111111', 'Autoprime Tata - Dhoot Group', 'DHOOT-TATA')
ON CONFLICT (code) DO NOTHING;

INSERT INTO zones (id, organization_id, name, code) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'North Zone', 'ZONE-NORTH'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'West Zone', 'ZONE-WEST')
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO branches (id, organization_id, zone_id, name, code, address, city, state, pincode, phone, email) VALUES
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Autoprime Pune Central', 'PUN-01', 'Plot 45, Nagar Road', 'Pune', 'Maharashtra', '411014', '+912027456789', 'pune.central@autoprimetata.com'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Autoprime Mumbai South', 'MUM-01', 'Sector 12, Worli', 'Mumbai', 'Maharashtra', '400018', '+912224567890', 'mumbai.south@autoprimetata.com')
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO stockyards (id, branch_id, name, code, capacity) VALUES
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Pune Main Stockyard', 'SY-PUN-01', 200),
('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333332', 'Mumbai Central Yard', 'SY-MUM-01', 150)
ON CONFLICT (branch_id, code) DO NOTHING;

INSERT INTO feature_flags (key, name, description, is_enabled) VALUES
('biometric-unlock', 'Biometric App Unlock', 'Enable biometric FaceID/Fingerprint unlock on mobile', true),
('offline-mode', 'Offline PDI Inspection', 'Allow complete offline inspection caching and sync', true),
('vci-diagnostics', 'Bluetooth VCI Diagnostics', 'ECU and DTC diagnostic scanning interface', false),
('ai-damage-detection', 'AI Damage Detection', 'Computer vision damage severity assistance', false)
ON CONFLICT (key) DO NOTHING;
