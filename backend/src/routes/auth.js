// backend/routes/auth.js
const express = require('express');
const { register, verifyWallet, getUser } = require('../controllers/authController');
const router = express.Router();

/**
 * Auth routes.
 * POST /api/auth/register
 * POST /api/auth/verify-wallet
 * GET /api/auth/user/:wallet
 */
router.post('/register', register);
router.post('/verify-wallet', verifyWallet);
router.get('/user/:wallet', getUser);

module.exports = router;