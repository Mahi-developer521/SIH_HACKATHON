-- ==========================================================
-- PASHU-SURAKSHA AI | POSTGRESQL RELATIONAL SCHEMA
-- Department of Animal Husbandry & Dairying (DAHD)
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'vet', 'field_worker', 'lab_staff', 'flow_inspector', 'admin')),
  phone_or_email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  designation VARCHAR(150),
  location VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VILLAGES & DEMOGRAPHICS TABLE
CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  total_livestock INTEGER NOT NULL DEFAULT 0,
  vaccinated_livestock INTEGER NOT NULL DEFAULT 0,
  coverage_percent INTEGER NOT NULL DEFAULT 0,
  active_risk_zone VARCHAR(20) DEFAULT 'LOW' CHECK (active_risk_zone IN ('LOW', 'MEDIUM', 'HIGH')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VETERINARY FACILITIES
CREATE TABLE IF NOT EXISTS veterinary_facilities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN ('VETERINARY_HOSPITAL', 'DISPENSARY', 'DIAGNOSTIC_LAB')),
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  contact_person VARCHAR(150),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. REGISTERED ANIMALS / HERD
CREATE TABLE IF NOT EXISTS animals (
  id VARCHAR(50) PRIMARY KEY,
  farmer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  tag_number VARCHAR(100) UNIQUE NOT NULL,
  species VARCHAR(50) NOT NULL CHECK (species IN ('Cattle', 'Buffalo', 'Sheep', 'Goat', 'Poultry', 'Pig')),
  breed VARCHAR(100) NOT NULL,
  age_years NUMERIC(4,1) NOT NULL,
  vaccination_status VARCHAR(50) NOT NULL DEFAULT 'UP_TO_DATE' CHECK (vaccination_status IN ('UP_TO_DATE', 'DUE_SOON', 'OVERDUE')),
  last_vaccination_date DATE,
  last_vaccine_name VARCHAR(150),
  treatment_history TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DISEASE CLUSTERS
CREATE TABLE IF NOT EXISTS disease_clusters (
  id VARCHAR(50) PRIMARY KEY, -- e.g. CL-001
  name VARCHAR(150) NOT NULL,
  villages TEXT[] NOT NULL,
  total_cases INTEGER NOT NULL DEFAULT 0,
  total_deaths INTEGER NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  primary_symptoms TEXT[] NOT NULL DEFAULT '{}',
  center_lat DECIMAL(9,6) NOT NULL,
  center_lng DECIMAL(9,6) NOT NULL,
  radius_km NUMERIC(5,2) NOT NULL DEFAULT 5.0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE_OUTBREAK' CHECK (status IN ('ACTIVE_OUTBREAK', 'CONTROLLED', 'CONTAINED')),
  containment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. DISEASE REPORTS (PRIMARY CASE TABLE)
CREATE TABLE IF NOT EXISTS disease_reports (
  id VARCHAR(50) PRIMARY KEY, -- e.g. CASE-1020
  farmer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  farmer_name VARCHAR(150) NOT NULL,
  farmer_phone VARCHAR(50) NOT NULL,
  village VARCHAR(100) NOT NULL,
  animal_type VARCHAR(50) NOT NULL CHECK (animal_type IN ('Cattle', 'Buffalo', 'Sheep', 'Goat', 'Poultry', 'Pig')),
  total_animals INTEGER NOT NULL CHECK (total_animals > 0),
  sick_count INTEGER NOT NULL CHECK (sick_count >= 0),
  dead_count INTEGER NOT NULL CHECK (dead_count >= 0),
  symptoms TEXT[] NOT NULL,
  photo_url TEXT,
  image_url TEXT,
  image_filename VARCHAR(255),
  image_uploaded_at TIMESTAMP WITH TIME ZONE,
  voice_transcript TEXT,
  voice_language VARCHAR(20) DEFAULT 'en-IN',
  reported_language VARCHAR(10) DEFAULT 'en',
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (
    status IN (
      'SUBMITTED', 'VALIDATED', 'AI_ANALYZED', 'VET_REVIEW',
      'MISSION_ASSIGNED', 'INVESTIGATED', 'SAMPLE_COLLECTED',
      'LAB_TESTING', 'CONFIRMED', 'INTERVENED', 'CONTAINED', 'MONITORING'
    )
  ),
  is_valid BOOLEAN NOT NULL DEFAULT TRUE,
  validation_notes TEXT[],
  cluster_id VARCHAR(50) REFERENCES disease_clusters(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. RISK ASSESSMENTS (AI ENGINE OUTPUTS)
CREATE TABLE IF NOT EXISTS risk_assessments (
  id SERIAL PRIMARY KEY,
  report_id VARCHAR(50) NOT NULL REFERENCES disease_reports(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  ai_reasons TEXT[] NOT NULL DEFAULT '{}',
  recommended_action TEXT NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. RESPONSE MISSIONS (VET DISPATCH)
CREATE TABLE IF NOT EXISTS response_missions (
  id VARCHAR(50) PRIMARY KEY, -- e.g. RM-001
  case_id VARCHAR(50) NOT NULL REFERENCES disease_reports(id) ON DELETE CASCADE,
  cluster_id VARCHAR(50) REFERENCES disease_clusters(id) ON DELETE SET NULL,
  assigned_worker_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  worker_name VARCHAR(150) NOT NULL,
  target_village VARCHAR(100) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
  instructions TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED')),
  dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. FIELD INVESTIGATIONS (PARA-VET OBSERVATIONS)
CREATE TABLE IF NOT EXISTS field_investigations (
  id SERIAL PRIMARY KEY,
  mission_id VARCHAR(50) NOT NULL REFERENCES response_missions(id) ON DELETE CASCADE,
  examined_count INTEGER NOT NULL CHECK (examined_count >= 0),
  sick_count INTEGER NOT NULL CHECK (sick_count >= 0),
  dead_count INTEGER NOT NULL CHECK (dead_count >= 0),
  observed_symptoms TEXT[] NOT NULL DEFAULT '{}',
  vaccination_audited BOOLEAN NOT NULL DEFAULT FALSE,
  treatment_history TEXT,
  photos TEXT[],
  confirmed_lat DECIMAL(9,6) NOT NULL,
  confirmed_lng DECIMAL(9,6) NOT NULL,
  field_notes TEXT NOT NULL,
  sample_taken BOOLEAN NOT NULL DEFAULT FALSE,
  sample_id VARCHAR(50),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. LAB SAMPLES (SPECIMEN TRACKING)
CREATE TABLE IF NOT EXISTS lab_samples (
  id VARCHAR(50) PRIMARY KEY, -- e.g. SMP-2045
  case_id VARCHAR(50) NOT NULL REFERENCES disease_reports(id) ON DELETE CASCADE,
  mission_id VARCHAR(50) REFERENCES response_missions(id) ON DELETE SET NULL,
  sample_type VARCHAR(100) NOT NULL CHECK (sample_type IN ('Whole Blood', 'Serum', 'Nasal Swab', 'Oral Vesicle Swab', 'Tissue Biopsy', 'Milk')),
  collected_by VARCHAR(150) NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  target_lab_name VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'COLLECTED', 'DISPATCHED', 'RECEIVED', 'TESTING', 'COMPLETED')),
  dispatched_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE
);

-- 11. LAB RESULTS (DIAGNOSTIC ASSAYS)
CREATE TABLE IF NOT EXISTS lab_results (
  id VARCHAR(50) PRIMARY KEY, -- e.g. RES-101
  sample_id VARCHAR(50) NOT NULL REFERENCES lab_samples(id) ON DELETE CASCADE,
  case_id VARCHAR(50) NOT NULL REFERENCES disease_reports(id) ON DELETE CASCADE,
  test_type VARCHAR(100) NOT NULL CHECK (test_type IN ('RT-PCR', 'ELISA', 'Rapid Antigen', 'Virus Isolation', 'Bacterial Culture')),
  pathogen_identified VARCHAR(150) NOT NULL,
  result VARCHAR(20) NOT NULL CHECK (result IN ('POSITIVE', 'NEGATIVE', 'INCONCLUSIVE')),
  cycle_threshold NUMERIC(5,2),
  remarks TEXT,
  tested_by VARCHAR(150) NOT NULL,
  tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. VACCINATIONS & CAMPAIGNS
CREATE TABLE IF NOT EXISTS vaccinations (
  id SERIAL PRIMARY KEY,
  village VARCHAR(100) NOT NULL,
  target_species VARCHAR(50) NOT NULL,
  vaccine_name VARCHAR(150) NOT NULL,
  doses_target INTEGER NOT NULL DEFAULT 0,
  doses_completed INTEGER NOT NULL DEFAULT 0,
  coverage_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  campaign_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 13. INTERVENTIONS & CONTAINMENT
CREATE TABLE IF NOT EXISTS interventions (
  id VARCHAR(50) PRIMARY KEY, -- e.g. INT-101
  cluster_id VARCHAR(50) REFERENCES disease_clusters(id) ON DELETE SET NULL,
  case_id VARCHAR(50) REFERENCES disease_reports(id) ON DELETE SET NULL,
  intervention_type VARCHAR(50) NOT NULL CHECK (
    intervention_type IN ('RING_VACCINATION', 'EMERGENCY_TREATMENT', 'HERD_QUARANTINE', 'MOVEMENT_RESTRICTION', 'BIOSECURITY_ADVISORY')
  ),
  target_village VARCHAR(100) NOT NULL,
  doses_administered INTEGER DEFAULT 0,
  animals_quarantined INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED')),
  authorized_by_vet VARCHAR(150) NOT NULL,
  notes TEXT,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. PROXIMITY ALERTS
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(100) PRIMARY KEY, -- e.g. ALT-RED-FARMER-01-1024
  cluster_id VARCHAR(50) REFERENCES disease_clusters(id) ON DELETE SET NULL,
  farmer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  farmer_name VARCHAR(150) NOT NULL,
  farmer_phone VARCHAR(50) NOT NULL,
  distance_km NUMERIC(5,2) NOT NULL,
  alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('RED_ALERT', 'AMBER_ADVISORY', 'NORMAL')),
  channel VARCHAR(20) NOT NULL DEFAULT 'SMS' CHECK (channel IN ('SMS', 'IVR', 'APP')),
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  user_role VARCHAR(50),
  action VARCHAR(150) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST EPIDEMIOLOGICAL QUERYING
CREATE INDEX IF NOT EXISTS idx_users_email ON users(phone_or_email);
CREATE INDEX IF NOT EXISTS idx_disease_reports_farmer ON disease_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_status ON disease_reports(status);
CREATE INDEX IF NOT EXISTS idx_disease_reports_village ON disease_reports(village);
CREATE INDEX IF NOT EXISTS idx_disease_reports_created ON disease_reports(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_response_missions_worker ON response_missions(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_lab_samples_case ON lab_samples(case_id);
CREATE INDEX IF NOT EXISTS idx_alerts_farmer ON alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
