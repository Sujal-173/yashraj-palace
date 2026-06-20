const asyncHandler = require('express-async-handler');
const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');
const slugify = require('slugify');
const socket = require('../utils/socket');

const ALLOWED_UPDATE_FIELDS = [
  'name','description','shortDesc','price','discountedPrice','capacity','bedType',
  'size','floor','images','amenities','features','policies','addOns','isAvailable',
  'isActive','totalRooms','sortOrder','roomNumber',
];

// @desc  Get all active rooms (public)
// @route GET /api/rooms
const getRooms = asyncHandler(async (req, res) => {
  const { type, minPrice, maxPrice, capacity } = req.query;
  const query = { isActive: true };
  if (type) query.type = type;
  if (capacity) query.capacity = { $gte: parseInt(capacity) };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }
  const rooms = await Room.find(query).sort({ sortOrder: 1, price: 1 });
  res.json({ success: true, count: rooms.length, rooms });
});

// @desc  Get ALL rooms including inactive (admin only)
// @route GET /api/rooms/admin/all
const getRoomsAdmin = asyncHandler(async (req, res) => {
  const rooms = await Room.find({}).sort({ isActive: -1, sortOrder: 1, price: 1 });
  res.json({ success: true, count: rooms.length, rooms });
});

// @desc  Get single room
// @route GET /api/rooms/:slug
const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug, isActive: true });
  if (!room) { res.status(404); throw new Error('Room not found'); }
  res.json({ success: true, room });
});

// @desc  Check room availability (respects totalRooms inventory)
// @route POST /api/rooms/check-availability
const checkAvailability = asyncHandler(async (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;
  if (!roomId || !checkIn || !checkOut) {
    res.status(400); throw new Error('Room ID, check-in and check-out dates are required');
  }
  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Reject past dates
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (checkInDate < today) {
    res.status(400); throw new Error('Check-in date cannot be in the past');
  }
  if (checkInDate >= checkOutDate) {
    res.status(400); throw new Error('Check-out must be after check-in');
  }

  const room = await Room.findById(roomId);
  if (!room) { res.status(404); throw new Error('Room not found'); }

  const overlapping = await RoomBooking.countDocuments({
    room: roomId,
    status: { $in: ['pending', 'confirmed', 'checked_in'] },
    checkIn:  { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  res.json({
    success: true,
    available: overlapping < room.totalRooms,
    room: { _id: room._id, name: room.name, price: room.price }
  });
});

// @desc  Create room (Admin)
// @route POST /api/rooms
const createRoom = asyncHandler(async (req, res) => {
  const { name, ...rest } = req.body;
  const slug = slugify(name, { lower: true, strict: true });
  const room = await Room.create({ name, slug, ...rest });
  socket.emit('content_updated', { type: 'rooms', action: 'created', roomId: room._id });
  res.status(201).json({ success: true, room });
});

// @desc  Update room (Admin) — whitelisted fields only
// @route PUT /api/rooms/:id
const updateRoom = asyncHandler(async (req, res) => {
  const update = {};
  ALLOWED_UPDATE_FIELDS.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  if (update.name) update.slug = slugify(update.name, { lower: true, strict: true });

  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    { new: true, runValidators: true }
  );
  if (!room) { res.status(404); throw new Error('Room not found'); }
  socket.emit('content_updated', { type: 'rooms', action: 'updated', roomId: room._id });
  res.json({ success: true, room });
});

// @desc  Delete/deactivate room (Admin)
// @route DELETE /api/rooms/:id
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!room) { res.status(404); throw new Error('Room not found'); }
  socket.emit('content_updated', { type: 'rooms', action: 'deleted', roomId: room._id });
  res.json({ success: true, message: 'Room deactivated' });
});

// @desc  Get unavailable dates for a room (respects totalRooms inventory)
// @route GET /api/rooms/:id/unavailable-dates
const getUnavailableDates = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).select('totalRooms');
  if (!room) { res.status(404); throw new Error('Room not found'); }

  const bookings = await RoomBooking.find({
    room: req.params.id,
    status: { $in: ['confirmed', 'checked_in'] },
    checkOut: { $gte: new Date() }
  }).select('checkIn checkOut');

  // Build a date → booking count map; mark unavailable when count >= totalRooms
  const dateCount = {};
  bookings.forEach(b => {
    let d = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    while (d < end) {
      const key = d.toISOString().split('T')[0];
      dateCount[key] = (dateCount[key] || 0) + 1;
      d.setDate(d.getDate() + 1);
    }
  });

  const unavailableDates = Object.entries(dateCount)
    .filter(([, count]) => count >= room.totalRooms)
    .map(([date]) => date);

  res.json({ success: true, unavailableDates });
});

module.exports = { getRooms, getRoomsAdmin, getRoom, checkAvailability, createRoom, updateRoom, deleteRoom, getUnavailableDates };
