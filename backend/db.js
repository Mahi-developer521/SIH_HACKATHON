const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

let isPostgresConnected = false;
let connectionAttempted = false;

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Warning]:', err.message);
  isPostgresConnected = false;
});

// Seed data fallback store when PostgreSQL server is starting up, offline, or unconfigured
const memoryReports = [
  {
    id: 'CASE-1020',
    farmerId: 'FARMER-01',
    farmerName: 'Suresh More',
    farmerPhone: '+91 94231 66778',
    village: 'Village A (Rampur)',
    animalType: 'Cattle',
    totalAnimals: 12,
    sickCount: 3,
    deadCount: 0,
    symptoms: ['High Fever', 'Excessive Drooling / Salivation', 'Severe Lameness / Inability to Stand'],
    photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600',
    voiceTranscript: null,
    coordinates: { lat: 18.5320, lng: 73.8710 },
    submittedAt: '2026-09-17 08:30',
    status: 'AI_ANALYZED',
    isValid: true,
    validationNotes: ['Valid counts', 'GPS verified'],
    clusterId: 'CL-001',
    riskScore: 78,
    riskLevel: 'HIGH',
    aiReasons: ['Rapid increase in local incidence', 'Acute vesicular symptoms', 'High cluster density'],
    recommendedAction: 'Immediate field inspection and biological sample collection required.'
  },
  {
    id: 'CASE-1021',
    farmerId: 'FARMER-01',
    farmerName: 'Ganesh Shinde',
    farmerPhone: '+91 94231 77889',
    village: 'Village B (Kalyanpur)',
    animalType: 'Cattle',
    totalAnimals: 15,
    sickCount: 6,
    deadCount: 1,
    symptoms: ['High Fever', 'Blisters / Vesicles on Tongue & Muzzle', 'Severe Lameness / Inability to Stand', 'Sudden Anorexia / Reduced Feeding'],
    photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600',
    voiceTranscript: null,
    coordinates: { lat: 18.5140, lng: 73.8880 },
    submittedAt: '2026-09-18 09:15',
    status: 'MISSION_ASSIGNED',
    isValid: true,
    validationNotes: ['Valid counts', 'GPS verified'],
    clusterId: 'CL-001',
    riskScore: 88,
    riskLevel: 'HIGH',
    aiReasons: ['Mortality reported', 'Low village vaccination coverage (44%)', 'Spatio-temporal alignment with Village A'],
    recommendedAction: 'Urgent veterinary containment team dispatch and quarantine protocol.'
  },
  {
    id: 'CASE-1022',
    farmerId: 'FARMER-01',
    farmerName: 'Kavita Jadhav',
    farmerPhone: '+91 94231 88990',
    village: 'Village C (Shivpuri)',
    animalType: 'Cattle',
    totalAnimals: 6,
    sickCount: 8,
    deadCount: 1,
    symptoms: ['Blisters / Vesicles on Tongue & Muzzle', 'Excessive Drooling / Salivation', 'High Fever'],
    photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600',
    voiceTranscript: null,
    coordinates: { lat: 18.4990, lng: 73.8380 },
    submittedAt: '2026-09-19 14:20',
    status: 'AI_ANALYZED',
    isValid: true,
    validationNotes: ['Valid counts', 'GPS verified'],
    clusterId: 'CL-001',
    riskScore: 84,
    riskLevel: 'HIGH',
    aiReasons: ['Cross-village transmission pattern detected', 'Multiple fatalities', 'High symptom concordance'],
    recommendedAction: 'Establish 5km ring vaccination perimeter and dispatch field teams.'
  }
];

const memoryRiskAssessments = [
  {
    reportId: 'CASE-1020',
    riskScore: 78,
    riskLevel: 'HIGH',
    aiReasons: ['Rapid increase in local incidence', 'Acute vesicular symptoms', 'High cluster density'],
    recommendedAction: 'Immediate field inspection and biological sample collection required.',
    analyzedAt: '2026-09-17 08:31:00'
  },
  {
    reportId: 'CASE-1021',
    riskScore: 88,
    riskLevel: 'HIGH',
    aiReasons: ['Mortality reported', 'Low village vaccination coverage (44%)', 'Spatio-temporal alignment with Village A'],
    recommendedAction: 'Urgent veterinary containment team dispatch and quarantine protocol.',
    analyzedAt: '2026-09-18 09:16:00'
  },
  {
    reportId: 'CASE-1022',
    riskScore: 84,
    riskLevel: 'HIGH',
    aiReasons: ['Cross-village transmission pattern detected', 'Multiple fatalities', 'High symptom concordance'],
    recommendedAction: 'Establish 5km ring vaccination perimeter and dispatch field teams.',
    analyzedAt: '2026-09-19 14:21:00'
  }
];

async function testConnection() {
  if (!connectionString) {
    console.warn('[PostgreSQL]: DATABASE_URL not set in backend/.env. Running with built-in seeded fallback storage.');
    isPostgresConnected = false;
    connectionAttempted = true;
    return false;
  }

  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release();
    isPostgresConnected = true;
    connectionAttempted = true;
    console.log(`[PostgreSQL]: Successfully connected to database [${res.rows[0].db_name}] at ${res.rows[0].current_time}`);
    return true;
  } catch (err) {
    isPostgresConnected = false;
    connectionAttempted = true;
    console.warn(`[PostgreSQL Status]: Unable to connect to PostgreSQL at ${connectionString} (${err.message}).`);
    console.warn('[PostgreSQL Status]: Running with built-in seeded storage until PostgreSQL service is started.');
    return false;
  }
}

// Initial connection check
testConnection();

/**
 * Resilient query wrapper:
 * 1. Tries real PostgreSQL pool first.
 * 2. If PostgreSQL is offline/unreachable, gracefully executes against memoryReports.
 */
async function query(text, params = []) {
  if (isPostgresConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
        isPostgresConnected = false;
        console.warn('[PostgreSQL Disconnected]: Falling back to in-memory store:', err.message);
      } else {
        throw err;
      }
    }
  } else if (!connectionAttempted) {
    await testConnection();
    if (isPostgresConnected) {
      return await pool.query(text, params);
    }
  }

  // In-Memory Fallback Query Simulator
  const normalizedText = text.trim().toLowerCase();

  // 1. SELECT all reports
  if (normalizedText.includes('from disease_reports dr') && !normalizedText.includes('where dr.id')) {
    return {
      rows: memoryReports.map(r => ({ ...r })),
      rowCount: memoryReports.length
    };
  }

  // 2. SELECT single report by ID
  if (normalizedText.includes('where dr.id = $1') || normalizedText.includes('where id = $1')) {
    const id = params[0];
    const found = memoryReports.find(r => r.id === id);
    return {
      rows: found ? [{ ...found }] : [],
      rowCount: found ? 1 : 0
    };
  }

  // 3. SELECT COUNT(*) AS total FROM disease_reports
  if (normalizedText.includes('count(*)') && normalizedText.includes('disease_reports')) {
    return {
      rows: [{ total: memoryReports.length }],
      rowCount: 1
    };
  }

  // 4. SELECT recent reports for cluster / anomaly calculation
  if (normalizedText.includes('select id, latitude, longitude') || normalizedText.includes('order by submitted_at desc limit')) {
    const rows = memoryReports.slice(-30).map(r => ({
      id: r.id,
      latitude: r.coordinates?.lat,
      longitude: r.coordinates?.lng,
      status: r.status,
      symptoms: r.symptoms
    }));
    return { rows, rowCount: rows.length };
  }

  // 5. INSERT INTO disease_reports
  if (normalizedText.startsWith('insert into disease_reports')) {
    const [
      id, farmer_id, farmer_name, farmer_phone, village,
      animal_type, total_animals, sick_count, dead_count,
      symptoms, photo_url, voice_transcript, latitude, longitude,
      status, is_valid, validation_notes, cluster_id
    ] = params;

    const newReport = {
      id,
      farmerId: farmer_id,
      farmerName: farmer_name,
      farmerPhone: farmer_phone,
      village,
      animalType: animal_type,
      totalAnimals: total_animals,
      sickCount: sick_count,
      deadCount: dead_count,
      symptoms,
      photoUrl: photo_url,
      voiceTranscript: voice_transcript,
      coordinates: { lat: latitude, lng: longitude },
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status,
      isValid: is_valid,
      validationNotes: validation_notes,
      clusterId: cluster_id,
      riskScore: 0,
      riskLevel: 'LOW',
      aiReasons: [],
      recommendedAction: ''
    };

    memoryReports.unshift(newReport);
    return { rows: [newReport], rowCount: 1 };
  }

  // 6. INSERT INTO risk_assessments
  if (normalizedText.startsWith('insert into risk_assessments')) {
    const [report_id, risk_score, risk_level, ai_reasons, recommended_action] = params;
    const assessment = {
      reportId: report_id,
      riskScore: risk_score,
      riskLevel: risk_level,
      aiReasons: ai_reasons,
      recommendedAction: recommended_action,
      analyzedAt: new Date().toISOString()
    };
    memoryRiskAssessments.push(assessment);

    // Also update memoryReport risk fields
    const target = memoryReports.find(r => r.id === report_id);
    if (target) {
      target.riskScore = risk_score;
      target.riskLevel = risk_level;
      target.aiReasons = ai_reasons;
      target.recommendedAction = recommended_action;
    }

    return { rows: [assessment], rowCount: 1 };
  }

  // 7. UPDATE disease_reports
  if (normalizedText.startsWith('update disease_reports')) {
    const status = params[0];
    const id = params[1];
    const target = memoryReports.find(r => r.id === id);
    if (target) {
      if (status) target.status = status;
      return { rows: [target], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  return { rows: [], rowCount: 0 };
}

module.exports = {
  pool,
  query,
  testConnection,
  isPostgresConnected: () => isPostgresConnected,
  getMemoryReports: () => memoryReports
};
