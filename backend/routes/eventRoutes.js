const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  createEventBooking,
  checkEventDate,
  getEventPackages,
  getAllEventBookings,
  updateEventStatus,
} = require('../controllers/eventController');
const { protect, admin, staff } = require('../middleware/auth');
const { validateCreateEventBooking } = require('../middleware/validate');

// Rate limit for event booking/inquiry creation
const eventBookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many event inquiries. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for date availability checks
const checkDateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.get('/packages',    getEventPackages);
router.post('/check-date', checkDateLimiter, checkEventDate);
router.post('/book',       eventBookLimiter, validateCreateEventBooking, createEventBooking);

// Admin / staff
router.get('/admin/all',        protect, staff, getAllEventBookings);
router.put('/admin/:id/status', protect, staff, updateEventStatus);

module.exports = router;
