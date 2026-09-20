const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

router.get('/samples', labController.getSamples);
router.post('/samples', labController.createSample);
router.get('/results', labController.getResults);
router.post('/results', labController.createResult);

module.exports = router;
