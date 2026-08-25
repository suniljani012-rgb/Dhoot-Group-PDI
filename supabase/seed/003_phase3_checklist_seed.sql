-- Autoprime Tata Motors Standard PDI Master Template & Categories

INSERT INTO checklist_templates (id, organization_id, name, model_pattern, fuel_type, version, is_active) VALUES
('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', 'Tata Motors Standard Passenger Vehicle PDI Template', 'ALL', 'ALL', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 1. Categories
INSERT INTO checklist_categories (id, template_id, code, name, description, display_order) VALUES
('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', 'EXTERIOR_BODY', 'Exterior & Bodywork', 'Inspection of panels, paint, windshield, chrome badges, and mirrors', 1),
('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666661', 'LIGHTING_ELECTRICAL', 'Lighting & Electricals', 'Headlamps, DRLs, taillights, blinkers, hazard, horn, and wiper motors', 2),
('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666661', 'UNDERHOOD_ENGINE', 'Underhood & Fluid Levels', 'Engine oil, coolant, brake fluid, battery health, wire harnesses', 3),
('77777777-7777-7777-7777-777777777774', '66666666-6666-6666-6666-666666666661', 'UNDERBODY_TYRES', 'Underbody, Wheels & Tyres', 'Tyre pressure, tread, alloy condition, suspension, and underbody shield', 4),
('77777777-7777-7777-7777-777777777775', '66666666-6666-6666-6666-666666666661', 'INTERIOR_CABIN', 'Interior Cabin & Comfort', 'Seat upholstery, dashboard, touch infotainment, AC cooling, power windows', 5),
('77777777-7777-7777-7777-777777777776', '66666666-6666-6666-6666-666666666661', 'BOOT_SPARE_WHEEL', 'Boot & Toolkit', 'Spare wheel, jack, wheel spanner, warning triangle, parcel tray', 6),
('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666661', 'BRAKES_ROAD_TEST', 'Brakes & Road Functionality', 'Brake pedal feel, handbrake / EPB hold, steering response, gear shifting', 7),
('77777777-7777-7777-7777-777777777778', '66666666-6666-6666-6666-666666666661', 'DOCUMENTATION_IDENTITY', 'Vehicle Identity & Documentation', 'VIN plate verification, smart keys (2 keys), manual, warranty booklet', 8)
ON CONFLICT (id) DO NOTHING;

-- 2. Items for EXTERIOR_BODY
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777771', 'EXT-01', 'Panel Gaps & Alignment', 'Check hood, doors, tailgate and bumper shutlines for uniform gap.', 'PASS_FAIL', true, 'MAJOR', 1),
('77777777-7777-7777-7777-777777777771', 'EXT-02', 'Paint Finish & Scratch Inspection', 'Inspect for scratches, paint chips, swirl marks, or transit damage.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777771', 'EXT-03', 'Windshield & Glass Integrity', 'Verify front windshield, rear glass, and window panes are crack-free.', 'PASS_FAIL', true, 'CRITICAL', 3),
('77777777-7777-7777-7777-777777777771', 'EXT-04', 'Wiper Blades & Washer Jet', 'Operate front and rear wipers with washer spray. Check blade wiping quality.', 'PASS_FAIL', true, 'MINOR', 4);

-- 3. Items for LIGHTING_ELECTRICAL
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777772', 'LGT-01', 'LED DRLs & Headlamp High/Low Beam', 'Turn on low beam, high beam, and projector lamps. Verify beam leveling.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777772', 'LGT-02', 'Turn Indicators & Hazard Lamps', 'Verify all front, ORVM, and rear indicator LED sequences and hazard switch.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777772', 'LGT-03', 'Tail Lamps & Reverse Parking Lights', 'Check rear signature light bar, brake lights, and reverse camera lamps.', 'PASS_FAIL', true, 'MAJOR', 3),
('77777777-7777-7777-7777-777777777772', 'LGT-04', 'Dual Horn Functionality', 'Test high and low horn pitch and clarity.', 'PASS_FAIL', true, 'MAJOR', 4);

-- 4. Items for UNDERHOOD_ENGINE
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777773', 'ENG-01', 'Engine Oil Level & Quality', 'Pull dipstick; verify oil level is between MIN and MAX marks.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777773', 'ENG-02', 'Coolant Reservoir Level', 'Check coolant tank level (ensure cold engine). Inspect for hose leaks.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777773', 'ENG-03', 'Brake & Clutch Fluid Level', 'Verify brake fluid tank level is at MAX.', 'PASS_FAIL', true, 'CRITICAL', 3),
('77777777-7777-7777-7777-777777777773', 'ENG-04', '12V Battery Voltage Check', 'Measure open circuit terminal voltage with multimeter (target: >= 12.4V).', 'NUMERIC', true, 'MAJOR', 4);

-- 5. Items for UNDERBODY_TYRES
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777774', 'TYR-01', 'Tyre Pressure Calibration (PSI)', 'Measure and calibrate tyre pressure to manufacturer spec (e.g. 33-36 PSI).', 'NUMERIC', true, 'MAJOR', 1),
('77777777-7777-7777-7777-777777777774', 'TYR-02', 'Alloy Wheels & Sidewall Condition', 'Inspect rims for kerb rash, rim dents, or tyre sidewall cuts/bulges.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777774', 'TYR-03', 'Wheel Lug Nuts Torque', 'Check all wheel lug nuts are tightened to spec.', 'PASS_FAIL', true, 'CRITICAL', 3);

-- 6. Items for INTERIOR_CABIN
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777775', 'INT-01', 'Touchscreen Infotainment & Audio', 'Verify Harman/JBL infotainment, Apple CarPlay/Android Auto, and speakers.', 'PASS_FAIL', true, 'MAJOR', 1),
('77777777-7777-7777-7777-777777777775', 'INT-02', 'AC Cooling & Climate Control', 'Run AC at lowest temperature for 3 minutes; verify blower and vents.', 'PASS_FAIL', true, 'CRITICAL', 2),
('77777777-7777-7777-7777-777777777775', 'INT-03', 'All Power Windows & ORVM Controls', 'Test auto up/down, window lock, and electric mirror fold/adjustment.', 'PASS_FAIL', true, 'MAJOR', 3),
('77777777-7777-7777-7777-777777777775', 'INT-04', 'Odometer Reading (KM)', 'Record current odometer reading from instrument cluster (target: < 50 km).', 'NUMERIC', true, 'MAJOR', 4);

-- 7. Items for BOOT_SPARE_WHEEL
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777776', 'BOT-01', 'Spare Wheel & Tool Kit Complete', 'Check presence of spare tyre, jack, tommy bar, spanner, and tow hook.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777776', 'BOT-02', 'Emergency Warning Triangle & First Aid', 'Verify reflective safety triangle and first aid kit in boot compartment.', 'PASS_FAIL', true, 'MAJOR', 2);

-- 8. Items for BRAKES_ROAD_TEST
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777777', 'BRK-01', 'Foot Brake & Electronic Parking Brake (EPB)', 'Test brake firmness, ABS bite, and EPB auto-hold engagement.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777777', 'BRK-02', 'Steering Centering & Alignment', 'Verify steering wheel is dead-center with zero pull during short yard drive.', 'PASS_FAIL', true, 'MAJOR', 2);

-- 9. Items for DOCUMENTATION_IDENTITY
INSERT INTO checklist_items (category_id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order) VALUES
('77777777-7777-7777-7777-777777777778', 'DOC-01', 'Chassis / VIN Plate Match', 'Match physical VIN stamped on driver B-pillar / under-seat with invoice.', 'PASS_FAIL', true, 'CRITICAL', 1),
('77777777-7777-7777-7777-777777777778', 'DOC-02', '2 Smart Keys / Key Fobs Present', 'Test lock, unlock, and boot release buttons on both physical key fobs.', 'PASS_FAIL', true, 'CRITICAL', 2);
