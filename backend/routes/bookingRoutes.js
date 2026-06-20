const express = require('express');
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

// Public — guest checkout allowed, user is optional
r.post('/', validateCreateBooking, createBooking);

// Public — lookup by bookingId + phone (no login required)
r.get('/lookup', validateGuestLookup, getBookingByLookup);

// Authenticated — must be logged in
r.get('/my', protect, getMyBookings);
r.get('/:id', protect, getBooking);          // owner or admin only (enforced in controller)
r.put('/:id/cancel', protect, cancelBooking); // owner or admin only (enforced in controller)

// Admin / staff only
r.get('/admin/all', protect, staff, getAllBookings);
r.put('/admin/:id/status', protect, staff, updateBookingStatus);

module.exports = r;
