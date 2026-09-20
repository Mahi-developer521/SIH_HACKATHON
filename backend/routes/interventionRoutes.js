const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');

router.get('/', interventionController.getInterventions);
router.post('/', interventionController.createIntervention);
router.put('/:id/complete', interventionController.completeIntervention);

module.exports = router;
