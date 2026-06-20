const express = require('express');
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

// Public
router.get('/packages',    getEventPackages);
router.post('/check-date', checkEventDate);
router.post('/book',       validateCreateEventBooking, createEventBooking);

// Admin / staff
router.get('/admin/all',        protect, staff, getAllEventBookings);
router.put('/admin/:id/status', protect, staff, updateEventStatus);

module.exports = router;
