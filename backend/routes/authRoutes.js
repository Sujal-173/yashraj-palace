const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Strict rate limit for auth endpoints — 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',       authLimiter, validateRegister, register);
router.post('/login',          authLimiter, validateLogin,    login);
router.post('/forgot-password',authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.get('/me',              protect, getMe);
router.put('/profile',         protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
