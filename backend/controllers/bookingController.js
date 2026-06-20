const crypto = require('crypto');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const RoomBooking = require('../models/RoomBooking');
const Room = require('../models/Room');
const { Offer } = require('../models/index');
const { sendBookingReceived, sendBookingConfirmation, sendAdminNewBookingAlert } = require('../utils/emailService');
const socket = require('../utils/socket');

// Collision-safe booking ID using crypto
const generateBookingId = (prefix) =>
  `${prefix}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// @desc  Create room booking (guest checkout supported — user optional)
// @route POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const { roomId, checkIn, checkOut, guestDetails, guests, addOns, specialRequests, promoCode } = req.body;

  // Date validation
  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const now          = new Date(); now.setHours(0, 0, 0, 0);

  if (checkInDate < now)             { res.status(400); throw new Error('Check-in date cannot be in the past'); }
  if (checkOutDate <= checkInDate)   { res.status(400); throw new Error('Check-out must be after check-in'); }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  if (nights < 1)                    { res.status(400); throw new Error('Minimum 1 night stay required'); }

  // Room lookup
  const room = await Room.findById(roomId);
  if (!room || !room.isActive || !room.isAvailable) {
    res.status(404); throw new Error('Room not found or not available');
  }

  // ── INVENTORY-AWARE availability check ──────────────────────────────────────
  const overlappingCount = await RoomBooking.countDocuments({
    room: roomId,
    status: { $in: ['pending', 'confirmed', 'checked_in'] },
    $and: [
      { checkIn:  { $lt: checkOutDate } },
      { checkOut: { $gt: checkInDate  } },
    ],
  });

  if (overlappingCount >= room.totalRooms) {
    res.status(400);
    throw new Error('Room not available for the selected dates. Please choose different dates.');
  }

  // ── Pricing — resolve add-ons from server-side room data (never trust client prices) ──
  const resolvedAddOns = [];
  for (const a of (addOns || [])) {
    const srv = room.addOns.find(x => x.name === a.name);
    if (!srv) { res.status(400); throw new Error(`Invalid add-on: ${a.name}`); }
    resolvedAddOns.push({ name: srv.name, price: srv.price, quantity: a.quantity || 1 });
  }

  const basePrice   = room.discountedPrice || room.price;
  const roomPrice   = basePrice * nights;
  const addOnsTotal = resolvedAddOns.reduce((sum, a) => sum + (a.price * a.quantity), 0);
  const subtotal    = roomPrice + addOnsTotal;
  const taxes       = Math.round(subtotal * 0.12);
  let   discount    = 0;
  let   appliedOffer = null;
  let   offerId     = null;

  // ── Server-side promo code validation & atomic increment ────────────────────
  if (promoCode) {
    const code = promoCode.trim().toUpperCase();
    const offer = await Offer.findOneAndUpdate(
      {
        code,
        isActive: true,
        applicableTo: { $in: ['room', 'both'] },
        $and: [
          { $or: [{ endDate: null }, { endDate: { $gte: new Date() } }] },
          { $or: [{ usageLimit: { $exists: false } }, { usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
          { $or: [{ minAmount: null }, { minAmount: { $lte: subtotal } }] },
        ],
      },
      { $inc: { usedCount: 1 } },
      { new: false }
    );

    if (!offer) {
      res.status(400); throw new Error('Invalid, expired, or usage-limit-reached promo code');
    }
    if (offer.type === 'percentage') {
      discount = Math.min(Math.round((subtotal * offer.value) / 100), offer.maxDiscount || Infinity);
    } else if (offer.type === 'fixed') {
      discount = Math.min(offer.value, subtotal);
    }
    offerId      = offer._id;
    appliedOffer = { code: offer.code, title: offer.title, discount };
  }

  const totalAmount = subtotal + taxes - discount;
  const advancePaid = Math.round(totalAmount * 0.3); // 30% advance

  // ── Create booking — roll back promo if DB write fails ──────────────────────
  let booking;
  try {
    booking = await RoomBooking.create({
      room: roomId,
      user: req.user?._id || undefined,
      guestDetails,
      checkIn:  checkInDate,
      checkOut: checkOutDate,
      guests,
      addOns: resolvedAddOns,
      specialRequests,
      promoCode:  promoCode ? promoCode.trim().toUpperCase() : undefined,
      pricing: {
        roomPrice,
        addOnsTotal,
        taxes,
        discount,
        totalAmount,
        advancePaid,
        balanceDue: totalAmount - advancePaid,
      },
      source: 'website',
    });
  } catch (err) {
    if (offerId) {
      await Offer.findByIdAndUpdate(offerId, { $inc: { usedCount: -1 } }).catch(() => {});
    }
    throw err;
  }

  await booking.populate('room', 'name type images');

  // Real-time admin notification
  socket.emitToAdmin('new_booking', {
    bookingId: booking.bookingId,
    guestName: guestDetails?.name,
    room: room.name,
    amount: totalAmount,
    createdAt: booking.createdAt,
  });

  sendBookingReceived(booking).catch(console.error);
  sendAdminNewBookingAlert(booking).catch(console.error);

  res.status(201).json({
    success: true,
    booking,
    advanceToPay: advancePaid,
    appliedOffer,
    message: 'Booking received. Please complete the advance payment to confirm your room.',
  });
});

// @desc  Guest lookup — find booking by bookingId + phone (no login required)
// @route GET /api/bookings/lookup?bookingId=YPR...&phone=98765...
const getBookingByLookup = asyncHandler(async (req, res) => {
  const { bookingId, phone } = req.query;

  const booking = await RoomBooking.findOne({ bookingId })
    .populate('room', 'name type images');

  // Return identical error whether booking doesn't exist or phone is wrong (prevents enumeration)
  if (!booking || booking.guestDetails.phone !== phone.trim()) {
    res.status(404); throw new Error('Booking not found');
  }

  res.json({ success: true, booking });
});

// @desc  Get user's bookings
// @route GET /api/bookings/my
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await RoomBooking.find({ user: req.user._id })
    .populate('room', 'name type images price')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// @desc  Get single booking (authenticated — owner or admin only)
// @route GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await RoomBooking.findById(req.params.id)
    .populate('room', 'name type images price');
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const isOwner = booking.user && booking.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

  if (!isOwner && !isAdmin) {
    res.status(403); throw new Error('Not authorized to view this booking');
  }

  res.json({ success: true, booking });
});

// @desc  Cancel booking (authenticated — owner only, no refund auto-triggered here)
// @route PUT /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const booking = mongoose.Types.ObjectId.isValid(id)
    ? await RoomBooking.findById(id)
    : await RoomBooking.findOne({ bookingId: id });
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const isOwner = booking.user && booking.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

  if (!isOwner && !isAdmin) {
    res.status(403); throw new Error('Not authorized to cancel this booking');
  }

  if (['cancelled', 'checked_out', 'completed'].includes(booking.status)) {
    res.status(400); throw new Error(`Booking is already ${booking.status}`);
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by guest';
  booking.cancelledAt = new Date();
  await booking.save();

  socket.emitToAdmin('booking_updated', { bookingId: booking.bookingId, status: 'cancelled' });

  res.json({ success: true, message: 'Booking cancelled successfully', booking });
});

// ── ADMIN ──────────────────────────────────────────────────────────────────────

// @desc  Get all bookings (admin/staff)
// @route GET /api/bookings/admin/all
const getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { bookingId:           { $regex: search, $options: 'i' } },
      { 'guestDetails.name': { $regex: search, $options: 'i' } },
      { 'guestDetails.phone':{ $regex: search, $options: 'i' } },
    ];
  }
  const total    = await RoomBooking.countDocuments(query);
  const bookings = await RoomBooking.find(query)
    .populate('room', 'name type')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc  Update booking status (admin/staff)
// @route PUT /api/bookings/admin/:id/status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const allowedStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];
  if (!allowedStatuses.includes(status)) {
    res.status(400); throw new Error('Invalid status value');
  }

  const update = { status };
  if (notes)                    update.notes = notes;
  if (status === 'confirmed')   update.confirmedAt = new Date();
  if (status === 'cancelled')   update.cancelledAt = new Date();

  const booking = await RoomBooking.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  ).populate('room', 'name type');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  if (status === 'confirmed' && booking.paymentStatus !== 'unpaid') {
    sendBookingConfirmation(booking).catch(console.error);
  }

  socket.emitToAdmin('booking_updated', { bookingId: booking.bookingId, status });

  res.json({ success: true, booking });
});

module.exports = {
  createBooking,
  getBookingByLookup,
  getMyBookings,
  getBooking: getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
