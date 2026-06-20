const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Login/register: strict — 15 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot/reset password: more lenient — 10 attempts per 15 minutes
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many password reset requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',       loginLimiter, validateRegister, register);
router.post('/login',          loginLimiter, validateLogin,    login);
router.post('/forgot-password',resetLimiter, forgotPassword);
router.post('/reset-password/:token', resetLimiter, resetPassword);
router.get('/me',              protect, getMe);
router.put('/profile',         protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

