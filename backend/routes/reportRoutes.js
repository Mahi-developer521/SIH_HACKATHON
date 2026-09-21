const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const upload = require('../middleware/upload');

// GET /api/reports - Fetch all disease reports with risk assessments
router.get('/', reportController.getReports);

// GET /api/reports/:id - Fetch a single report by ID
router.get('/:id', reportController.getReportById);

// POST /api/reports - Submit a new disease report from farmer/field worker
router.post('/', reportController.createReport);

// POST /api/reports/upload-image - Upload disease/lesion photo (JPEG, PNG, WebP, max 5MB)
router.post('/upload-image', upload.single('image'), reportController.uploadImage);

// PUT /api/reports/:id - Update report status or details
router.put('/:id', reportController.updateReport);

module.exports = router;
