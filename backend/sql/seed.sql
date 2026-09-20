-- ==========================================================
-- SEED DATA: PASHU-SURAKSHA AI SURVEILLANCE BASELINE
-- ==========================================================

-- 1. USERS
INSERT INTO users (id, name, role, phone_or_email, password_hash, designation, location)
VALUES
  ('FARMER-01', 'Ramesh Patel', 'farmer', '9423144556', '1234', 'Registered Livestock Farmer', 'Village A (Rampur)'),
  ('VET-01', 'Dr. A. Sharma', 'vet', 'vet.sharma@surveillance.gov.in', 'vet123', 'Chief Veterinary Officer', 'District Veterinary Hospital'),
  ('FW-04', 'Pooja Patil', 'field_worker', 'FW-04', 'field123', 'Field Para-Vet Inspector', 'Kalyanpur Rural Sub-Division'),
  ('LAB-01', 'Dr. P. Rao', 'lab_staff', 'lab.rddl@surveillance.gov.in', 'lab123', 'Senior Microbiologist (RDDL)', 'Regional Disease Diagnostic Lab'),
  ('ADMIN-01', 'Lead Evaluator', 'flow_inspector', 'evaluator@sih.gov.in', 'admin123', 'Master System Auditor', 'National Surveillance Command')
ON CONFLICT (id) DO NOTHING;

-- 2. VILLAGES
INSERT INTO villages (name, latitude, longitude, total_livestock, vaccinated_livestock, coverage_percent, active_risk_zone)
VALUES
  ('Village A (Rampur)', 18.5350, 73.8720, 500, 450, 90, 'HIGH'),
  ('Village B (Kalyanpur)', 18.5120, 73.8900, 500, 220, 44, 'HIGH'),
  ('Village C (Shivpuri)', 18.4980, 73.8350, 420, 340, 81, 'HIGH'),
  ('Village D (Belur)', 18.5800, 73.8100, 610, 560, 92, 'LOW'),
  ('Village E (Sonpur)', 18.4600, 73.9100, 380, 350, 92, 'LOW')
ON CONFLICT (name) DO UPDATE SET
  total_livestock = EXCLUDED.total_livestock,
  vaccinated_livestock = EXCLUDED.vaccinated_livestock,
  coverage_percent = EXCLUDED.coverage_percent,
  active_risk_zone = EXCLUDED.active_risk_zone;

-- 3. VETERINARY FACILITIES
INSERT INTO veterinary_facilities (id, name, facility_type, latitude, longitude, contact_person, phone)
VALUES
  ('FAC-01', 'District Veterinary Polyclinic & Hospital', 'VETERINARY_HOSPITAL', 18.5280, 73.8650, 'Dr. A. Sharma (Chief Vet Officer)', '+91 98220 11223'),
  ('FAC-02', 'Regional Disease Diagnostic Laboratory (RDDL)', 'DIAGNOSTIC_LAB', 18.5190, 73.8480, 'Dr. P. Rao (Senior Microbiologist)', '+91 98220 33445'),
  ('FAC-03', 'Sub-Divisional Veterinary Dispensary - Kalyanpur', 'DISPENSARY', 18.5090, 73.8950, 'Dr. Neha Verma (Veterinary Officer)', '+91 98220 55667')
ON CONFLICT (id) DO NOTHING;

-- 4. HERD ANIMALS FOR RAMESH PATEL
INSERT INTO animals (id, farmer_id, tag_number, species, breed, age_years, vaccination_status, last_vaccination_date, last_vaccine_name, treatment_history)
VALUES
  ('ANM-01', 'FARMER-01', 'IND-9021-001', 'Cattle', 'Gir Cow', 4.0, 'UP_TO_DATE', '2026-03-15', 'FMD Oil Adjuvant Vaccine', ARRAY['Routine deworming (Feb 2026)', 'Mastitis treatment (Nov 2025)']),
  ('ANM-02', 'FARMER-01', 'IND-9021-002', 'Cattle', 'Sahiwal Cross', 3.0, 'UP_TO_DATE', '2026-03-15', 'FMD Oil Adjuvant Vaccine', ARRAY['Calcium deficiency supplement (Jan 2026)']),
  ('ANM-03', 'FARMER-01', 'IND-9021-003', 'Cattle', 'HF Cross', 5.0, 'DUE_SOON', '2025-10-10', 'HS + BQ Combined Vaccine', ARRAY['Minor hoof trim (Dec 2025)']),
  ('ANM-04', 'FARMER-01', 'IND-9021-004', 'Buffalo', 'Murrah', 6.0, 'UP_TO_DATE', '2026-02-20', 'FMD Vaccine', ARRAY['Annual health check passed'])
ON CONFLICT (id) DO NOTHING;

-- 5. ACTIVE DISEASE CLUSTER
INSERT INTO disease_clusters (id, name, villages, total_cases, total_deaths, risk_score, risk_level, primary_symptoms, center_lat, center_lng, radius_km, status, containment_notes)
VALUES
  ('CL-001', 'Multi-Village Acute Febrile & Vesicular Cluster', ARRAY['Village A (Rampur)', 'Village B (Kalyanpur)', 'Village C (Shivpuri)'], 21, 2, 86, 'HIGH', ARRAY['High Fever', 'Blisters / Vesicles on Tongue & Muzzle', 'Excessive Salivation', 'Lameness', 'Reduced Feeding'], 18.5200, 73.8680, 6.5, 'ACTIVE_OUTBREAK', 'Ring vaccination and movement containment protocol in progress.')
ON CONFLICT (id) DO NOTHING;

-- 6. INITIAL CASES
INSERT INTO disease_reports (id, farmer_id, farmer_name, farmer_phone, village, animal_type, total_animals, sick_count, dead_count, symptoms, photo_url, latitude, longitude, status, is_valid, validation_notes, cluster_id, submitted_at)
VALUES
  ('CASE-1020', 'FARMER-01', 'Suresh More', '+91 94231 66778', 'Village A (Rampur)', 'Cattle', 12, 3, 0, ARRAY['High Fever', 'Excessive Drooling / Salivation', 'Severe Lameness / Inability to Stand'], 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600', 18.5320, 73.8710, 'AI_ANALYZED', TRUE, ARRAY['Valid counts', 'GPS verified'], 'CL-001', '2026-09-17 08:30:00+00'),
  ('CASE-1021', 'FARMER-01', 'Ganesh Shinde', '+91 94231 77889', 'Village B (Kalyanpur)', 'Cattle', 15, 6, 1, ARRAY['High Fever', 'Blisters / Vesicles on Tongue & Muzzle', 'Severe Lameness / Inability to Stand', 'Sudden Anorexia / Reduced Feeding'], 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600', 18.5140, 73.8880, 'MISSION_ASSIGNED', TRUE, ARRAY['Valid counts', 'GPS verified'], 'CL-001', '2026-09-18 09:15:00+00'),
  ('CASE-1022', 'FARMER-01', 'Kavita Jadhav', '+91 94231 88990', 'Village C (Shivpuri)', 'Cattle', 6, 8, 1, ARRAY['Blisters / Vesicles on Tongue & Muzzle', 'Excessive Drooling / Salivation', 'High Fever'], 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600', 18.4990, 73.8380, 'AI_ANALYZED', TRUE, ARRAY['Valid counts', 'GPS verified'], 'CL-001', '2026-09-19 14:20:00+00')
ON CONFLICT (id) DO NOTHING;

-- 7. RISK ASSESSMENTS
INSERT INTO risk_assessments (report_id, risk_score, risk_level, ai_reasons, recommended_action, analyzed_at)
VALUES
  ('CASE-1020', 78, 'HIGH', ARRAY['Rapid increase in local incidence', 'Acute vesicular symptoms', 'High cluster density'], 'Immediate field inspection and biological sample collection required.', '2026-09-17 08:31:00+00'),
  ('CASE-1021', 88, 'HIGH', ARRAY['Mortality reported', 'Low village vaccination coverage (44%)', 'Spatio-temporal alignment with Village A'], 'Urgent veterinary containment team dispatch and quarantine protocol.', '2026-09-18 09:16:00+00'),
  ('CASE-1022', 84, 'HIGH', ARRAY['Cross-village transmission pattern detected', 'Multiple fatalities', 'High symptom concordance'], 'Establish 5km ring vaccination perimeter and dispatch field teams.', '2026-09-19 14:21:00+00')
ON CONFLICT DO NOTHING;

-- 8. INITIAL MISSION
INSERT INTO response_missions (id, case_id, cluster_id, assigned_worker_id, worker_name, target_village, latitude, longitude, priority, instructions, status, dispatched_at)
VALUES
  ('RM-001', 'CASE-1021', 'CL-001', 'FW-04', 'Pooja Patil (Field Inspector)', 'Village B (Kalyanpur)', 18.5140, 73.8880, 'HIGH', 'Investigate oral blisters and sudden mortality in cattle herd. Verify vaccination records and collect epithelial tissue/swab samples.', 'ASSIGNED', '2026-09-19 15:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 9. INITIAL LAB SAMPLE
INSERT INTO lab_samples (id, case_id, mission_id, sample_type, collected_by, collected_at, latitude, longitude, target_lab_name, status, dispatched_at)
VALUES
  ('SMP-2045', 'CASE-1021', 'RM-001', 'Oral Vesicle Swab', 'Pooja Patil (FW-04)', '2026-09-19 16:30:00+00', 18.5140, 73.8880, 'Regional Disease Diagnostic Laboratory (RDDL)', 'DISPATCHED', '2026-09-19 17:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 10. INITIAL PROXIMITY ALERTS
INSERT INTO alerts (id, cluster_id, farmer_id, farmer_name, farmer_phone, distance_km, alert_level, channel, message, sent_at)
VALUES
  ('ALT-RED-FARMER-01-01', 'CL-001', 'FARMER-01', 'Ramesh Patel', '+91 94231 44556', 2.3, 'RED_ALERT', 'SMS', '🚨 URGENT LIVESTOCK HEALTH ALERT: High-risk outbreak reported within 2.3 km of your farm in Village A (Rampur). Please isolate sick animals, suspend shared grazing, disinfect footwear, and report any mouth/hoof blisters immediately.', '2026-09-19 10:00:00+00'),
  ('ALT-AMB-FARMER-01-02', 'CL-001', 'FARMER-01', 'Ramesh Patel', '+91 94231 44556', 5.8, 'AMBER_ADVISORY', 'APP', '⚠️ BIOSECURITY ADVISORY: Active disease surveillance zone detected 5.8 km away. Check your herd vaccination status, restrict animal visitors, and maintain vigilance.', '2026-09-19 10:00:00+00')
ON CONFLICT (id) DO NOTHING;
