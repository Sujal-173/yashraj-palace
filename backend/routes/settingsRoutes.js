const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/auth');
const socket = require('../utils/socket');

// Public — website reads settings to render contact info
router.get('/', asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({});
  if (!settings) {
    // Seed defaults on first access
    settings = await Settings.create({});
  }
  res.json({ success: true, settings });
}));

// Admin only — save settings
router.put('/', protect, admin, asyncHandler(async (req, res) => {
  const { hotelName, tagline, phone, whatsapp, email, address, checkIn, checkOut, tokenAmount, advancePercent } = req.body;
  const settings = await Settings.findOneAndUpdate(
    {},
    { hotelName, tagline, phone, whatsapp, email, address, checkIn, checkOut,
      tokenAmount: Number(tokenAmount) || 10000,
      advancePercent: Number(advancePercent) || 30 },
    { new: true, upsert: true, runValidators: true }
  );
  // Broadcast to all connected clients so every page re-fetches contact info
  socket.emit('content_updated', { type: 'settings' });
  res.json({ success: true, settings });
}));

module.exports = router;
