const db = require('../db');

let memorySamples = [
  {
    id: 'SMP-2045',
    caseId: 'CASE-1021',
    missionId: 'RM-001',
    sampleType: 'Oral Vesicle Swab',
    collectedBy: 'Pooja Patil (FW-04)',
    collectedAt: '2026-09-19 16:30',
    coordinates: { lat: 18.5140, lng: 73.8880 },
    targetLabName: 'Regional Disease Diagnostic Laboratory (RDDL)',
    status: 'DISPATCHED',
    dispatchedAt: '2026-09-19 17:00'
  }
];

let memoryResults = [];

async function getSamples(req, res, next) {
  try {
    if (db.isPostgresConnected()) {
      const query = `
        SELECT 
          id,
          case_id AS "caseId",
          mission_id AS "missionId",
          sample_type AS "sampleType",
          collected_by AS "collectedBy",
          TO_CHAR(collected_at, 'YYYY-MM-DD HH24:MI') AS "collectedAt",
          json_build_object('lat', latitude, 'lng', longitude) AS coordinates,
          target_lab_name AS "targetLabName",
          status,
          TO_CHAR(dispatched_at, 'YYYY-MM-DD HH24:MI') AS "dispatchedAt",
          TO_CHAR(received_at, 'YYYY-MM-DD HH24:MI') AS "receivedAt"
        FROM lab_samples
        ORDER BY collected_at DESC;
      `;
      const result = await db.query(query);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    res.json({ success: true, count: memorySamples.length, data: memorySamples });
  } catch (err) {
    next(err);
  }
}

async function createSample(req, res, next) {
  const {
    caseId,
    missionId,
    sampleType = 'Oral Vesicle Swab',
    collectedBy = 'Pooja Patil (FW-04)',
    coordinates = { lat: 18.5140, lng: 73.8880 },
    targetLabName = 'Regional Disease Diagnostic Laboratory (RDDL)'
  } = req.body;

  try {
    if (!caseId) {
      return res.status(400).json({ success: false, error: 'caseId is required' });
    }

    const sampleId = `SMP-${String(Date.now()).slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const sample = {
      id: sampleId,
      caseId,
      missionId,
      sampleType,
      collectedBy,
      collectedAt: nowStr,
      coordinates,
      targetLabName,
      status: 'DISPATCHED',
      dispatchedAt: nowStr
    };

    if (db.isPostgresConnected()) {
      const insertQuery = `
        INSERT INTO lab_samples (
          id, case_id, mission_id, sample_type, collected_by, latitude, longitude,
          target_lab_name, status, dispatched_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DISPATCHED', CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      await db.query(insertQuery, [
        sampleId, caseId, missionId, sampleType, collectedBy, coordinates.lat, coordinates.lng, targetLabName
      ]);

      await db.query("UPDATE disease_reports SET status = 'SAMPLE_COLLECTED' WHERE id = $1", [caseId]);
    } else {
      memorySamples.unshift(sample);
    }

    res.status(201).json({ success: true, data: sample });
  } catch (err) {
    next(err);
  }
}

async function getResults(req, res, next) {
  try {
    if (db.isPostgresConnected()) {
      const query = `
        SELECT 
          id,
          sample_id AS "sampleId",
          case_id AS "caseId",
          test_method AS "testMethod",
          pathogen_identified AS "pathogenIdentified",
          strain_variant AS "strainVariant",
          result,
          confidence_score AS "confidenceScore",
          lab_technician_name AS "labTechnicianName",
          notes,
          TO_CHAR(tested_at, 'YYYY-MM-DD HH24:MI') AS "testedAt"
        FROM lab_results
        ORDER BY tested_at DESC;
      `;
      const result = await db.query(query);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    res.json({ success: true, count: memoryResults.length, data: memoryResults });
  } catch (err) {
    next(err);
  }
}

async function createResult(req, res, next) {
  const {
    sampleId,
    caseId,
    testMethod = 'RT-PCR / ELISA',
    pathogenIdentified = 'Foot-and-Mouth Disease Virus (FMDV)',
    strainVariant = 'Type O / Ind-2001 lineage',
    result = 'POSITIVE',
    confidenceScore = 99.4,
    labTechnicianName = 'Dr. P. Rao (Senior Microbiologist, RDDL)',
    notes
  } = req.body;

  try {
    if (!sampleId || !caseId) {
      return res.status(400).json({ success: false, error: 'sampleId and caseId are required' });
    }

    const labResult = {
      id: `RES-${String(Date.now()).slice(-4)}`,
      sampleId,
      caseId,
      testMethod,
      pathogenIdentified,
      strainVariant,
      result,
      confidenceScore,
      labTechnicianName,
      notes: notes || 'High copy viral load detected via RT-PCR targeting VP1 region.',
      testedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (db.isPostgresConnected()) {
      const insertQuery = `
        INSERT INTO lab_results (
          sample_id, case_id, test_method, pathogen_identified, strain_variant,
          result, confidence_score, lab_technician_name, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      await db.query(insertQuery, [
        sampleId, caseId, testMethod, pathogenIdentified, strainVariant,
        result, confidenceScore, labTechnicianName, labResult.notes
      ]);

      await db.query("UPDATE lab_samples SET status = 'TESTED' WHERE id = $1", [sampleId]);
      await db.query("UPDATE disease_reports SET status = 'CONFIRMED' WHERE id = $1", [caseId]);
    } else {
      memoryResults.unshift(labResult);
      const sample = memorySamples.find(s => s.id === sampleId);
      if (sample) sample.status = 'TESTED';
    }

    res.status(201).json({
      success: true,
      message: 'Laboratory diagnosis recorded successfully',
      data: labResult
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSamples,
  createSample,
  getResults,
  createResult
};
