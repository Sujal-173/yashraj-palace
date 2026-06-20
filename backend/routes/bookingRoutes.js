const express = require('express');
const rateLimit = require('express-rate-limit');
const r = express.Router();
const {
  createBooking,
  getBookingByLookup,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, admin, staff } = require('../middleware/auth');
const { validateCreateBooking, validateGuestLookup } = require('../middleware/validate');

// Stricter rate limit for the unauthenticated lookup endpoint (prevents enumeration)
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many lookup attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for booking creation — prevents room-availability flooding attacks
const bookingCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many booking attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public — guest checkout allowed, user is optional
r.post('/', bookingCreateLimiter, validateCreateBooking, createBooking);

// Public — lookup by bookingId + phone (rate limited)
r.get('/lookup', lookupLimiter, validateGuestLookup, getBookingByLookup);

// Authenticated — must be logged in
r.get('/my', protect, getMyBookings);
r.get('/:id', protect, getBooking);
r.put('/:id/cancel', protect, cancelBooking);

// Admin / staff only
r.get('/admin/all', protect, staff, getAllBookings);
r.put('/admin/:id/status', protect, staff, updateBookingStatus);

module.exports = r;
