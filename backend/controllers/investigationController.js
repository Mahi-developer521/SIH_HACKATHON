const db = require('../db');

let memoryInvestigations = [];

async function getInvestigations(req, res, next) {
  try {
    if (db.isPostgresConnected()) {
      const query = `
        SELECT 
          id,
          mission_id AS "missionId",
          examined_count AS "examinedCount",
          sick_count AS "sickCount",
          dead_count AS "deadCount",
          observed_symptoms AS "observedSymptoms",
          vaccination_audited AS "vaccinationAudited",
          treatment_history AS "treatmentHistory",
          photos,
          json_build_object('lat', confirmed_lat, 'lng', confirmed_lng) AS coordinates,
          field_notes AS "fieldNotes",
          sample_taken AS "sampleTaken",
          sample_id AS "sampleId",
          TO_CHAR(completed_at, 'YYYY-MM-DD HH24:MI') AS "completedAt"
        FROM field_investigations
        ORDER BY completed_at DESC;
      `;
      const result = await db.query(query);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    res.json({ success: true, count: memoryInvestigations.length, data: memoryInvestigations });
  } catch (err) {
    next(err);
  }
}

async function createInvestigation(req, res, next) {
  const {
    missionId,
    examinedCount = 15,
    sickCount = 5,
    deadCount = 1,
    observedSymptoms = [],
    vaccinationAudited = true,
    treatmentHistory = 'Previous antibiotic administration observed',
    photos = [],
    coordinates = { lat: 18.5140, lng: 73.8880 },
    fieldNotes,
    sampleTaken = true,
    sampleId = 'SMP-2045'
  } = req.body;

  try {
    if (!missionId) {
      return res.status(400).json({ success: false, error: 'missionId is required' });
    }

    const investigation = {
      id: memoryInvestigations.length + 1,
      missionId,
      examinedCount,
      sickCount,
      deadCount,
      observedSymptoms,
      vaccinationAudited,
      treatmentHistory,
      photos,
      coordinates,
      fieldNotes: fieldNotes || 'Clinical verification confirmed acute mucosal lesions.',
      sampleTaken,
      sampleId: sampleTaken ? sampleId : null,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (db.isPostgresConnected()) {
      const insertQuery = `
        INSERT INTO field_investigations (
          mission_id, examined_count, sick_count, dead_count, observed_symptoms,
          vaccination_audited, treatment_history, photos, confirmed_lat, confirmed_lng,
          field_notes, sample_taken, sample_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;
      await db.query(insertQuery, [
        missionId, examinedCount, sickCount, deadCount, observedSymptoms,
        vaccinationAudited, treatmentHistory, photos, coordinates.lat, coordinates.lng,
        investigation.fieldNotes, sampleTaken, investigation.sampleId
      ]);

      // Update mission status to COMPLETED
      await db.query(
        "UPDATE response_missions SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = $1",
        [missionId]
      );
    } else {
      memoryInvestigations.unshift(investigation);
    }

    res.status(201).json({
      success: true,
      message: 'Field investigation successfully recorded',
      data: investigation
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInvestigations,
  createInvestigation
};
