const express = require('express');
const router = express.Router();
const investigationController = require('../controllers/investigationController');

router.get('/', investigationController.getInvestigations);
router.post('/', investigationController.createInvestigation);

module.exports = router;
