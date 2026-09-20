const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');

router.get('/', missionController.getMissions);
router.post('/', missionController.createMission);
router.put('/:id', missionController.updateMissionStatus);

module.exports = router;
