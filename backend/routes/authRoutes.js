const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public route: Authenticate with username/email & password
router.post('/login', authController.login);

// Protected route: Get authenticated user profile
router.get('/me', verifyToken, authController.getMe);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;
