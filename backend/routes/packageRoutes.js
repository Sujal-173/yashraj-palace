const express = require('express');
const router = express.Router();
const { getEventPackages } = require('../controllers/eventController');
const EventPackage = require('../models/EventPackage');
const { protect, admin } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const socket = require('../utils/socket');

router.get('/', getEventPackages);

router.get('/:slug', asyncHandler(async (req, res) => {
  const pkg = await EventPackage.findOne({ slug: req.params.slug, isActive: true });
  if (!pkg) { res.status(404); throw new Error('Package not found'); }
  res.json({ success: true, package: pkg });
}));

router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const { name, ...rest } = req.body;
  const pkg = await EventPackage.create({ name, slug: slugify(name, { lower: true, strict: true }), ...rest });
  socket.emit('content_updated', { type: 'packages', action: 'created' });
  res.status(201).json({ success: true, package: pkg });
}));

router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const pkg = await EventPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!pkg) { res.status(404); throw new Error('Package not found'); }
  socket.emit('content_updated', { type: 'packages', action: 'updated' });
  res.json({ success: true, package: pkg });
}));

router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const pkg = await EventPackage.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!pkg) { res.status(404); throw new Error('Package not found'); }
  socket.emit('content_updated', { type: 'packages', action: 'deleted' });
  res.json({ success: true, message: 'Package deactivated' });
}));

module.exports = router;
