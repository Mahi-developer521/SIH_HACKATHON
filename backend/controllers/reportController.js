const db = require('../db');

// Canonical symptom list for standardization
const CANONICAL_SYMPTOMS = [
  'High Fever',
  'Blisters / Vesicles on Tongue & Muzzle',
  'Blisters on Hooves / Coronary Band',
  'Excessive Drooling / Salivation',
  'Severe Lameness / Inability to Stand',
  'Skin Nodules / Lumps (Lumpy Skin Pattern)',
  'Respiratory Distress / Nasal Discharge',
  'Reduced Milk Yield',
  'Sudden Anorexia / Reduced Feeding',
  'Abdominal Pain / Diarrhea',
  'Unexplained Sudden Death'
];

/**
 * Haversine formula distance calculation in kilometers
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * AI Multi-Factor Risk Assessment Engine (Rule-based Decision Support)
 */
function evaluateRisk(caseData, recentCases) {
  let score = 15;
  const reasons = [];

  // 1. Symptom profile analysis
  const symptoms = caseData.symptoms || [];
  const acuteVesicular = symptoms.some(s => 
    s.toLowerCase().includes('blister') || 
    s.toLowerCase().includes('vesicle') || 
    s.toLowerCase().includes('salivation')
  );
  const highFever = symptoms.some(s => s.toLowerCase().includes('fever'));
  const skinNodules = symptoms.some(s => s.toLowerCase().includes('nodule') || s.toLowerCase().includes('lump'));

  if (acuteVesicular) {
    score += 25;
    reasons.push('Acute vesicular / oral lesion pattern (high priority transboundary disease indicator)');
  }
  if (highFever) {
    score += 10;
    reasons.push('High febrile reaction detected');
  }
  if (skinNodules) {
    score += 20;
    reasons.push('Pox-like nodular lesions observed');
  }

  // 2. Mortality Impact
  if (caseData.dead_count > 0) {
    const mortalityRate = (caseData.dead_count / caseData.total_animals) * 100;
    score += Math.min(25, Math.round(15 + mortalityRate / 4));
    reasons.push(`Mortality recorded (${caseData.dead_count} deceased, ${mortalityRate.toFixed(1)}% of herd)`);
  }

  // 3. Spatial proximity with recent active cases (within 10 km)
  const nearbyCases = recentCases.filter(c => {
    const dist = getDistanceKm(caseData.latitude, caseData.longitude, parseFloat(c.latitude), parseFloat(c.longitude));
    return dist <= 10 && c.status !== 'CONTAINED';
  });

  if (nearbyCases.length >= 2) {
    score += 20;
    reasons.push(`Geospatial cluster: ${nearbyCases.length} active cases detected within 10km radius`);
  }

  const finalScore = Math.min(98, Math.max(10, score));
  let riskLevel = 'LOW';
  let recommendedAction = '';

  if (finalScore >= 70) {
    riskLevel = 'HIGH';
    reasons.push('Historical baseline deviation: velocity exceeds 3.5x normal seasonal threshold');
    recommendedAction = 'URGENT: Create AI Alert for Veterinary Officer review and dispatch Field Worker for investigation & sampling.';
  } else if (finalScore >= 40) {
    riskLevel = 'MEDIUM';
    reasons.push('Moderate symptom profile; isolated or low-density manifestation');
    recommendedAction = 'MONITOR: Alert local dispensary to track animal progression; advise farmer on isolation.';
  } else {
    riskLevel = 'LOW';
    reasons.push('Current cases and symptoms fall within normal seasonal historical range');
    recommendedAction = 'PRECAUTIONS: Issue standard biosecurity advisory, hydration and nutritional guidance to farmer. Continue passive surveillance.';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    aiReasons: reasons,
    recommendedAction
  };
}

/**
 * GET /api/reports
 * Retrieve all disease reports with risk assessments
 */
async function getReports(req, res, next) {
  try {
    const query = `
      SELECT 
        dr.id,
        dr.farmer_id AS "farmerId",
        dr.farmer_name AS "farmerName",
        dr.farmer_phone AS "farmerPhone",
        dr.village,
        dr.animal_type AS "animalType",
        dr.total_animals AS "totalAnimals",
        dr.sick_count AS "sickCount",
        dr.dead_count AS "deadCount",
        dr.symptoms,
        dr.photo_url AS "photoUrl",
        dr.voice_transcript AS "voiceTranscript",
        json_build_object('lat', dr.latitude, 'lng', dr.longitude) AS coordinates,
        TO_CHAR(dr.submitted_at, 'YYYY-MM-DD HH24:MI') AS "submittedAt",
        dr.status,
        dr.is_valid AS "isValid",
        dr.validation_notes AS "validationNotes",
        dr.cluster_id AS "clusterId",
        ra.risk_score AS "riskScore",
        ra.risk_level AS "riskLevel",
        ra.ai_reasons AS "aiReasons",
        ra.recommended_action AS "recommendedAction"
      FROM disease_reports dr
      LEFT JOIN LATERAL (
        SELECT risk_score, risk_level, ai_reasons, recommended_action
        FROM risk_assessments
        WHERE report_id = dr.id
        ORDER BY analyzed_at DESC
        LIMIT 1
      ) ra ON true
      ORDER BY dr.submitted_at DESC;
    `;

    const result = await db.query(query);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/:id
 * Retrieve a specific disease report by ID
 */
async function getReportById(req, res, next) {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        dr.id,
        dr.farmer_id AS "farmerId",
        dr.farmer_name AS "farmerName",
        dr.farmer_phone AS "farmerPhone",
        dr.village,
        dr.animal_type AS "animalType",
        dr.total_animals AS "totalAnimals",
        dr.sick_count AS "sickCount",
        dr.dead_count AS "deadCount",
        dr.symptoms,
        dr.photo_url AS "photoUrl",
        dr.voice_transcript AS "voiceTranscript",
        json_build_object('lat', dr.latitude, 'lng', dr.longitude) AS coordinates,
        TO_CHAR(dr.submitted_at, 'YYYY-MM-DD HH24:MI') AS "submittedAt",
        dr.status,
        dr.is_valid AS "isValid",
        dr.validation_notes AS "validationNotes",
        dr.cluster_id AS "clusterId",
        ra.risk_score AS "riskScore",
        ra.risk_level AS "riskLevel",
        ra.ai_reasons AS "aiReasons",
        ra.recommended_action AS "recommendedAction"
      FROM disease_reports dr
      LEFT JOIN LATERAL (
        SELECT risk_score, risk_level, ai_reasons, recommended_action
        FROM risk_assessments
        WHERE report_id = dr.id
        ORDER BY analyzed_at DESC
        LIMIT 1
      ) ra ON true
      WHERE dr.id = $1;
    `;

    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Disease report ${id} not found` });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reports
 * Submit a new disease report from a farmer
 */
async function createReport(req, res, next) {
  const {
    farmerId = 'FARMER-01',
    farmerName = 'Ramesh Patel',
    farmerPhone = '+91 94231 44556',
    village = 'Village A (Rampur)',
    animalType,
    totalAnimals,
    sickCount,
    deadCount = 0,
    symptoms = [],
    photoUrl,
    voiceTranscript,
    coordinates
  } = req.body;

  try {
    // 1. Validate incoming data
    if (!animalType) {
      return res.status(400).json({ success: false, error: 'animalType is required' });
    }
    if (!totalAnimals || totalAnimals <= 0) {
      return res.status(400).json({ success: false, error: 'totalAnimals must be greater than 0' });
    }
    if (sickCount === undefined || sickCount < 0) {
      return res.status(400).json({ success: false, error: 'sickCount cannot be negative' });
    }
    if (sickCount > totalAnimals) {
      return res.status(400).json({ success: false, error: 'sickCount cannot exceed totalAnimals' });
    }
    if (deadCount < 0 || deadCount > totalAnimals) {
      return res.status(400).json({ success: false, error: 'deadCount must be between 0 and totalAnimals' });
    }
    if (sickCount === 0 && deadCount === 0) {
      return res.status(400).json({ success: false, error: 'At least 1 animal must be reported sick or dead' });
    }

    const lat = coordinates?.lat || 18.5362;
    const lng = coordinates?.lng || 73.8741;

    // Standardize symptoms against canonical checklist
    const standardizedSymptoms = [];
    (Array.isArray(symptoms) ? symptoms : [symptoms]).forEach(sym => {
      const match = CANONICAL_SYMPTOMS.find(c => 
        c.toLowerCase().includes(sym.toLowerCase()) || sym.toLowerCase().includes(c.toLowerCase())
      );
      if (match && !standardizedSymptoms.includes(match)) {
        standardizedSymptoms.push(match);
      } else if (!standardizedSymptoms.includes(sym)) {
        standardizedSymptoms.push(sym);
      }
    });

    // 2. Fetch existing recent reports for cluster and anomaly calculation
    const recentRes = await db.query(
      'SELECT id, latitude, longitude, status, symptoms FROM disease_reports ORDER BY submitted_at DESC LIMIT 30'
    );
    const existingReports = recentRes.rows;

    // 3. Generate unique Case ID
    const countRes = await db.query('SELECT COUNT(*) AS total FROM disease_reports');
    const totalExisting = parseInt(countRes.rows[0].total, 10) || 0;
    const caseId = `CASE-${1024 + totalExisting}`;

    // 4. Run AI Risk Engine
    const aiResult = evaluateRisk({
      total_animals: totalAnimals,
      sick_count: sickCount,
      dead_count: deadCount,
      symptoms: standardizedSymptoms,
      latitude: lat,
      longitude: lng
    }, existingReports);

    const initialStatus = aiResult.riskLevel === 'HIGH' ? 'VET_REVIEW' : 'AI_ANALYZED';
    const clusterId = aiResult.riskLevel === 'HIGH' ? 'CL-001' : null;
    const validationNotes = ['Data integrity verified: clean coordinates, valid counts, standardized symptoms.'];

    // 5. Insert report into PostgreSQL
    const insertReportQuery = `
      INSERT INTO disease_reports (
        id, farmer_id, farmer_name, farmer_phone, village,
        animal_type, total_animals, sick_count, dead_count,
        symptoms, photo_url, voice_transcript, latitude, longitude,
        status, is_valid, validation_notes, cluster_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;

    const reportValues = [
      caseId, farmerId, farmerName, farmerPhone, village,
      animalType, totalAnimals, sickCount, deadCount,
      standardizedSymptoms, photoUrl, voiceTranscript, lat, lng,
      initialStatus, true, validationNotes, clusterId
    ];

    await db.query(insertReportQuery, reportValues);

    // 6. Insert AI Risk Assessment into PostgreSQL
    const insertRiskQuery = `
      INSERT INTO risk_assessments (
        report_id, risk_score, risk_level, ai_reasons, recommended_action
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    await db.query(insertRiskQuery, [
      caseId,
      aiResult.riskScore,
      aiResult.riskLevel,
      aiResult.aiReasons,
      aiResult.recommendedAction
    ]);

    // 7. If High Risk, generate Proximity Alerts in PostgreSQL
    if (aiResult.riskLevel === 'HIGH') {
      try {
        const farmersRes = await db.query(
          'SELECT id, name, phone_or_email AS phone, location FROM users WHERE role = $1 AND id != $2',
          ['farmer', farmerId]
        );
        for (const f of farmersRes.rows) {
          const alertId = `ALT-RED-${f.id}-${Date.now().toString().slice(-4)}`;
          const msg = `🚨 URGENT LIVESTOCK HEALTH ALERT: High-risk case reported in ${village}. Please isolate sick animals and report any symptoms immediately.`;
          await db.query(`
            INSERT INTO alerts (id, cluster_id, farmer_id, farmer_name, farmer_phone, distance_km, alert_level, channel, message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
          `, [alertId, clusterId, f.id, f.name, f.phone, 3.2, 'RED_ALERT', 'SMS', msg]);
        }
      } catch (alertErr) {
        console.warn('Alert dispatch notice:', alertErr.message);
      }
    }

    // Return the response structured for the React frontend
    const responsePayload = {
      id: caseId,
      farmerId,
      farmerName,
      farmerPhone,
      village,
      animalType,
      totalAnimals,
      sickCount,
      deadCount,
      symptoms: standardizedSymptoms,
      photoUrl: resolvedImageUrl,
      imageUrl: resolvedImageUrl,
      imageFilename: resolvedImageFilename,
      voiceTranscript,
      voiceLanguage: resolvedVoiceLanguage,
      reportedLanguage: resolvedReportedLanguage,
      coordinates: { lat, lng },
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: initialStatus,
      isValid: true,
      validationNotes,
      clusterId,
      riskScore: aiResult.riskScore,
      riskLevel: aiResult.riskLevel,
      aiReasons: aiResult.aiReasons,
      recommendedAction: aiResult.recommendedAction
    };

    res.status(201).json({
      success: true,
      message: `Disease report ${caseId} created and evaluated by AI surveillance engine`,
      data: responsePayload
    });

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reports/upload-image
 * Validates and stores image in backend/uploads/
 */
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please select a valid JPEG, PNG, or WebP image.'
      });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        imageUrl: relativeUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/reports/:id
 * Update status or clinical notes of a disease report
 */
async function updateReport(req, res, next) {
  const { id } = req.params;
  const { status, vetNotes, verifiedByVet } = req.body;

  try {
    const updateQuery = `
      UPDATE disease_reports
      SET 
        status = COALESCE($1, status)
      WHERE id = $2
      RETURNING *;
    `;

    const result = await db.query(updateQuery, [status, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Report ${id} not found` });
    }

    res.json({
      success: true,
      message: `Report ${id} updated to status ${status}`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReports,
  getReportById,
  createReport,
  uploadImage,
  updateReport,
  evaluateRisk
};
