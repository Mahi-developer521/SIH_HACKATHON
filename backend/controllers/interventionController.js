const db = require('../db');

let memoryInterventions = [];

async function getInterventions(req, res, next) {
  try {
    if (db.isPostgresConnected()) {
      const query = `
        SELECT 
          id,
          cluster_id AS "clusterId",
          case_id AS "caseId",
          intervention_type AS "type",
          title,
          description,
          target_villages AS "targetVillages",
          authorized_by AS "authorizedBy",
          status,
          doses_required AS "dosesRequired",
          doses_administered AS "dosesAdministered",
          TO_CHAR(start_date, 'YYYY-MM-DD HH24:MI') AS "startDate",
          TO_CHAR(completion_date, 'YYYY-MM-DD HH24:MI') AS "completionDate"
        FROM interventions
        ORDER BY start_date DESC;
      `;
      const result = await db.query(query);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    res.json({ success: true, count: memoryInterventions.length, data: memoryInterventions });
  } catch (err) {
    next(err);
  }
}

async function createIntervention(req, res, next) {
  const {
    clusterId = 'CL-001',
    caseId,
    type,
    title,
    description,
    targetVillages = ['Village A (Rampur)', 'Village B (Kalyanpur)'],
    authorizedBy = 'Dr. A. Sharma (Chief Veterinary Officer)',
    dosesRequired = 1000
  } = req.body;

  try {
    if (!type || !title) {
      return res.status(400).json({ success: false, error: 'type and title are required' });
    }

    const id = `INT-${String(Date.now()).slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const intervention = {
      id,
      clusterId,
      caseId,
      type,
      title,
      description: description || `Containment protocol: ${title}`,
      targetVillages,
      authorizedBy,
      status: 'ACTIVE',
      dosesRequired,
      dosesAdministered: 0,
      startDate: nowStr
    };

    if (db.isPostgresConnected()) {
      const insertQuery = `
        INSERT INTO interventions (
          id, cluster_id, case_id, intervention_type, title, description,
          target_villages, authorized_by, status, doses_required, doses_administered
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', $9, 0)
        RETURNING *;
      `;
      await db.query(insertQuery, [
        id, clusterId, caseId, type, title, intervention.description,
        targetVillages, authorizedBy, dosesRequired
      ]);

      if (caseId) {
        await db.query("UPDATE disease_reports SET status = 'INTERVENED' WHERE id = $1", [caseId]);
      }
    } else {
      memoryInterventions.unshift(intervention);
    }

    res.status(201).json({
      success: true,
      message: `Intervention ${id} authorized and active`,
      data: intervention
    });
  } catch (err) {
    next(err);
  }
}

async function completeIntervention(req, res, next) {
  const { id } = req.params;

  try {
    if (db.isPostgresConnected()) {
      const query = `
        UPDATE interventions
        SET status = 'COMPLETED', completion_date = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
      `;
      const result = await db.query(query, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: `Intervention ${id} not found` });
      }
      return res.json({ success: true, data: result.rows[0] });
    }

    const item = memoryInterventions.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: `Intervention ${id} not found` });
    }
    item.status = 'COMPLETED';
    item.completionDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInterventions,
  createIntervention,
  completeIntervention
};
