const db = require('../db');

// In-memory fallback missions
let memoryMissions = [
  {
    id: 'RM-001',
    caseId: 'CASE-1021',
    clusterId: 'CL-001',
    assignedToWorkerId: 'FW-04',
    workerName: 'Pooja Patil (Field Inspector)',
    targetVillage: 'Village B (Kalyanpur)',
    coordinates: { lat: 18.5140, lng: 73.8880 },
    priority: 'HIGH',
    instructions: 'Investigate oral blisters and sudden mortality in cattle herd. Verify vaccination records and collect epithelial tissue/swab samples.',
    status: 'ASSIGNED',
    dispatchedAt: '2026-09-19 15:00'
  }
];

async function getMissions(req, res, next) {
  try {
    if (db.isPostgresConnected()) {
      const query = `
        SELECT 
          id,
          case_id AS "caseId",
          cluster_id AS "clusterId",
          assigned_worker_id AS "assignedToWorkerId",
          worker_name AS "workerName",
          target_village AS "targetVillage",
          json_build_object('lat', latitude, 'lng', longitude) AS coordinates,
          priority,
          instructions,
          status,
          TO_CHAR(dispatched_at, 'YYYY-MM-DD HH24:MI') AS "dispatchedAt",
          TO_CHAR(completed_at, 'YYYY-MM-DD HH24:MI') AS "completedAt"
        FROM response_missions
        ORDER BY dispatched_at DESC;
      `;
      const result = await db.query(query);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    res.json({ success: true, count: memoryMissions.length, data: memoryMissions });
  } catch (err) {
    next(err);
  }
}

async function createMission(req, res, next) {
  const {
    caseId,
    clusterId = 'CL-001',
    assignedToWorkerId = 'FW-04',
    workerName = 'Pooja Patil (Field Inspector)',
    targetVillage = 'Village B (Kalyanpur)',
    coordinates = { lat: 18.5140, lng: 73.8880 },
    priority = 'HIGH',
    instructions
  } = req.body;

  try {
    if (!caseId) {
      return res.status(400).json({ success: false, error: 'caseId is required' });
    }
    if (!instructions) {
      return res.status(400).json({ success: false, error: 'instructions are required' });
    }

    const missionId = `RM-${String(Date.now()).slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newMission = {
      id: missionId,
      caseId,
      clusterId,
      assignedToWorkerId,
      workerName,
      targetVillage,
      coordinates,
      priority,
      instructions,
      status: 'ASSIGNED',
      dispatchedAt: nowStr
    };

    if (db.isPostgresConnected()) {
      const insertQuery = `
        INSERT INTO response_missions (
          id, case_id, cluster_id, assigned_worker_id, worker_name,
          target_village, latitude, longitude, priority, instructions, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ASSIGNED')
        RETURNING *;
      `;
      await db.query(insertQuery, [
        missionId, caseId, clusterId, assignedToWorkerId, workerName,
        targetVillage, coordinates.lat, coordinates.lng, priority, instructions
      ]);

      // Also update disease_reports status to MISSION_ASSIGNED
      await db.query(
        "UPDATE disease_reports SET status = 'MISSION_ASSIGNED' WHERE id = $1",
        [caseId]
      );
    } else {
      memoryMissions.unshift(newMission);
    }

    res.status(201).json({
      success: true,
      message: `Mission ${missionId} created successfully`,
      data: newMission
    });
  } catch (err) {
    next(err);
  }
}

async function updateMissionStatus(req, res, next) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (db.isPostgresConnected()) {
      const updateQuery = `
        UPDATE response_missions
        SET 
          status = $1,
          completed_at = CASE WHEN $1 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE id = $2
        RETURNING *;
      `;
      const result = await db.query(updateQuery, [status, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: `Mission ${id} not found` });
      }
      return res.json({ success: true, data: result.rows[0] });
    }

    const mission = memoryMissions.find(m => m.id === id);
    if (!mission) {
      return res.status(404).json({ success: false, error: `Mission ${id} not found` });
    }
    mission.status = status;
    res.json({ success: true, data: mission });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMissions,
  createMission,
  updateMissionStatus
};
