const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const EventBooking = require('../models/EventBooking');
const EventPackage = require('../models/EventPackage');
const { sendEventInquiryConfirmation, sendAdminNewEventAlert } = require('../utils/emailService');
const socket = require('../utils/socket');

// @desc  Create event booking / inquiry
// @route POST /api/events/book
const createEventBooking = asyncHandler(async (req, res) => {
  const { packageId, eventType, contactDetails, eventDetails, selectedAddOns } = req.body;

  const eventDate = new Date(eventDetails?.eventDate);
  if (eventDate < new Date()) {
    res.status(400); throw new Error('Event date cannot be in the past');
  }

  // Package lookup and capacity validation
  let packageData  = null;
  let packagePrice = 0;

  if (packageId) {
    packageData = await EventPackage.findById(packageId);
    if (!packageData || !packageData.isActive) {
      res.status(404); throw new Error('Event package not found');
    }

    // ── Capacity validation ──────────────────────────────────────────────────
    const guestCount = parseInt(eventDetails?.guestCount, 10);
    if (guestCount < packageData.capacity.min) {
      res.status(400);
      throw new Error(`This package requires a minimum of ${packageData.capacity.min} guests`);
    }
    if (guestCount > packageData.capacity.max) {
      res.status(400);
      throw new Error(`This package supports a maximum of ${packageData.capacity.max} guests. Please contact us for a custom quote.`);
    }

    packagePrice = packageData.price;
  }

  // ── Event date conflict check ────────────────────────────────────────────────
  // Block if the same venue is confirmed or advance_paid OR has an active quote_sent
  const dateStart = new Date(eventDate); dateStart.setHours(0,  0,  0,   0);
  const dateEnd   = new Date(eventDate); dateEnd.setHours(23, 59, 59, 999);

  const venueConflict = await EventBooking.findOne({
    'eventDetails.eventDate': { $gte: dateStart, $lte: dateEnd },
    ...(packageData?.venue ? { 'eventDetails.venue': packageData.venue } : {}),
    status: { $in: ['confirmed', 'advance_paid', 'quote_sent'] },
  });

  // For quote_sent, soft-warn but don't hard-block (inquiry still goes through)
  const isProvisionallyHeld = venueConflict?.status === 'quote_sent';
  const isHardConflict      = venueConflict && !isProvisionallyHeld;

  if (isHardConflict) {
    res.status(409);
    throw new Error('This date is already booked. Please choose a different date or contact us for availability.');
  }

  // ── Pricing ─────────────────────────────────────────────────────────────────
  const addOnsTotal    = (selectedAddOns || []).reduce((s, a) => s + (a.price * (a.quantity || 1)), 0);
  const subtotal       = packagePrice + addOnsTotal;
  const taxes          = Math.round(subtotal * 0.12);
  const totalEstimate  = subtotal + taxes;

  const booking = await EventBooking.create({
    package: packageId || undefined,
    eventType,
    contactDetails,
    eventDetails: { ...eventDetails, venue: packageData?.venue },
    selectedAddOns: selectedAddOns || [],
    user: req.user?._id || undefined,
    pricing: {
      packagePrice,
      addOnsTotal,
      taxes,
      totalEstimate,
      tokenAmount: 10000,
      balanceDue: totalEstimate - 10000,
      isCustomQuote: !packageId,
    },
    status: 'inquiry',
  });

  await booking.populate('package', 'name category capacity venue');

  // Real-time admin notification
  socket.emitToAdmin('new_event', {
    bookingId: booking.bookingId,
    guestName: contactDetails?.name,
    eventType,
    eventDate: eventDetails?.eventDate,
    guestCount: eventDetails?.guestCount,
    createdAt: booking.createdAt,
  });

  sendEventInquiryConfirmation(booking).catch(console.error);
  sendAdminNewEventAlert(booking).catch(console.error);

  res.status(201).json({
    success: true,
    booking,
    message: isProvisionallyHeld
      ? 'Inquiry received. Note: this date has a pending quote. Our team will contact you within 2 hours to confirm availability.'
      : 'Inquiry received. Our team will contact you within 2 hours.',
  });
});

// @desc  Check event date availability
// @route POST /api/events/check-date
const checkEventDate = asyncHandler(async (req, res) => {
  const { date, venue } = req.body;
  if (!date) { res.status(400); throw new Error('Date is required'); }

  const eventDate = new Date(date);
  const dateStart = new Date(eventDate); dateStart.setHours(0,  0,  0,   0);
  const dateEnd   = new Date(eventDate); dateEnd.setHours(23, 59, 59, 999);

  const query = {
    'eventDetails.eventDate': { $gte: dateStart, $lte: dateEnd },
    status: { $in: ['confirmed', 'advance_paid'] },
  };
  if (venue) query['eventDetails.venue'] = venue;

  const existing = await EventBooking.countDocuments(query);

  // Also check provisional holds
  const provisionalQuery = {
    'eventDetails.eventDate': { $gte: dateStart, $lte: dateEnd },
    status: 'quote_sent',
    updatedAt: { $gte: new Date(Date.now() - 72 * 60 * 60 * 1000) },
  };
  if (venue) provisionalQuery['eventDetails.venue'] = venue;
  const provisional = await EventBooking.countDocuments(provisionalQuery);

  const fullyBooked = existing > 0;
  const provisionallyHeld = !fullyBooked && provisional > 0;

  res.json({
    success: true,
    available: !fullyBooked,
    provisionallyHeld,
    message: fullyBooked
      ? 'This date is already booked. Please choose another date.'
      : provisionallyHeld
        ? 'This date has a pending quote. Contact us to confirm availability.'
        : 'This date is available!',
  });
});

// @desc  Get event packages
// @route GET /api/events/packages
const getEventPackages = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  const packages = await EventPackage.find(query).sort({ sortOrder: 1 });
  res.json({ success: true, packages });
});

// ── ADMIN ──────────────────────────────────────────────────────────────────────

// @desc  Admin - Get all event bookings
// @route GET /api/events/admin/all
const getAllEventBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { bookingId: { $regex: search, $options: 'i' } },
      { 'contactDetails.name':  { $regex: search, $options: 'i' } },
      { 'contactDetails.phone': { $regex: search, $options: 'i' } },
    ];
  }
  const total    = await EventBooking.countDocuments(query);
  const bookings = await EventBooking.find(query)
    .populate('package', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json({ success: true, total, pages: Math.ceil(total / limit), bookings });
});

// @desc  Admin - Update event booking status
// @route PUT /api/events/admin/:id/status
const updateEventStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes, totalEstimate, followUpDate } = req.body;

  const allowedStatuses = ['inquiry', 'quote_sent', 'confirmed', 'advance_paid', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    res.status(400); throw new Error('Invalid status value');
  }

  const update = {
    status,
    ...(adminNotes     && { adminNotes }),
    ...(totalEstimate  && { 'pricing.totalEstimate': totalEstimate, 'pricing.balanceDue': totalEstimate - 10000 }),
    ...(followUpDate   && { followUpDate }),
    ...(status === 'confirmed'    && { confirmedAt: new Date() }),
    ...(status === 'cancelled'    && { cancelledAt: new Date() }),
  };

  const booking = await EventBooking.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate('package', 'name');
  if (!booking) { res.status(404); throw new Error('Event booking not found'); }

  socket.emitToAdmin('event_updated', { bookingId: booking.bookingId, status });

  res.json({ success: true, booking });
});

module.exports = { createEventBooking, checkEventDate, getEventPackages, getAllEventBookings, updateEventStatus };
