const express = require('express');
const router = express.Router();
const { getRooms, getRoomsAdmin, getRoom, checkAvailability, createRoom, updateRoom, deleteRoom, getUnavailableDates } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/auth');

// Public
router.get('/', getRooms);
router.post('/check-availability', checkAvailability);

// Admin — must come BEFORE /:slug so it doesn't get swallowed
router.get('/admin/all', protect, admin, getRoomsAdmin);

// Public slug / id routes
router.get('/:slug', getRoom);
router.get('/:id/unavailable-dates', getUnavailableDates);

// Admin CRUD
router.post('/', protect, admin, createRoom);
router.put('/:id', protect, admin, updateRoom);
router.delete('/:id', protect, admin, deleteRoom);

module.exports = router;
