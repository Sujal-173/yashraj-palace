const asyncHandler = require('express-async-handler');
const { Review, Gallery, Inquiry, Offer } = require('../models/index');
const { sendAdminNewInquiryAlert } = require('../utils/emailService');
const socket = require('../utils/socket');

// ─── REVIEWS ────────────────────────────────────────────────────────────────

const createReview = asyncHandler(async (req, res) => {
  const { name, email, rating, title, comment, occasion, stayDate } = req.body;
  const review = await Review.create({ name, email, rating, title, comment, occasion, stayDate });
  res.status(201).json({
    success: true,
    review,
    message: 'Review submitted. It will appear after moderation.',
  });
});

const getReviews = asyncHandler(async (req, res) => {
  const { featured, page = 1, limit = 20 } = req.query;
  const query = { isActive: true, isApproved: true };
  if (featured === 'true') query.isFeatured = true;
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, total, pages: Math.ceil(total / Number(limit)), reviews });
});

const getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const { isApproved } = req.query;
  const query = {};
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';
  const reviews = await Review.find(query).sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

const updateReview = asyncHandler(async (req, res) => {
  const { isApproved, isFeatured, isActive } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { ...(isApproved  !== undefined && { isApproved }),
      ...(isFeatured  !== undefined && { isFeatured }),
      ...(isActive    !== undefined && { isActive }) },
    { new: true }
  );
  if (!review) { res.status(404); throw new Error('Review not found'); }
  socket.emit('content_updated', { type: 'reviews', action: 'updated' });
  res.json({ success: true, review });
});

// ─── GALLERY ────────────────────────────────────────────────────────────────

const getGallery = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  const images = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, images });
});

const addGalleryImage = asyncHandler(async (req, res) => {
  const { title, url, thumbnail, category, alt, caption, isFeatured, sortOrder } = req.body;
  if (!url)      { res.status(400); throw new Error('Image URL is required'); }
  if (!category) { res.status(400); throw new Error('Category is required'); }
  const image = await Gallery.create({
    title, url, thumbnail, category, alt, caption, isFeatured, sortOrder,
    uploadedBy: req.user._id,
  });
  socket.emit('content_updated', { type: 'gallery', action: 'added' });
  res.status(201).json({ success: true, image });
});

// Only update fields that were explicitly provided — prevents undefined overwriting existing values
const updateGalleryImage = asyncHandler(async (req, res) => {
  const { title, url, thumbnail, category, alt, caption, isFeatured, isActive, sortOrder } = req.body;
  const update = {};
  if (title      !== undefined) update.title      = title;
  if (url        !== undefined) update.url        = url;
  if (thumbnail  !== undefined) update.thumbnail  = thumbnail;
  if (category   !== undefined) update.category   = category;
  if (alt        !== undefined) update.alt        = alt;
  if (caption    !== undefined) update.caption    = caption;
  if (isFeatured !== undefined) update.isFeatured = isFeatured;
  if (isActive   !== undefined) update.isActive   = isActive;
  if (sortOrder  !== undefined) update.sortOrder  = sortOrder;

  const image = await Gallery.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!image) { res.status(404); throw new Error('Gallery image not found'); }
  socket.emit('content_updated', { type: 'gallery', action: 'updated' });
  res.json({ success: true, image });
});

const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) { res.status(404); throw new Error('Gallery image not found'); }
  const isOwner    = image.uploadedBy && String(image.uploadedBy) === String(req.user._id);
  const isAdminUser = req.user.role === 'admin' || req.user.role === 'staff';
  if (!isOwner && !isAdminUser) {
    res.status(403); throw new Error('You can only delete your own images');
  }
  await image.deleteOne();
  socket.emit('content_updated', { type: 'gallery', action: 'deleted' });
  res.json({ success: true, message: 'Image deleted' });
});

// ─── INQUIRIES ───────────────────────────────────────────────────────────────

const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, inquiryType, eventDate, guestCount } = req.body;
  const inquiry = await Inquiry.create({ name, email, phone, subject, message, inquiryType, eventDate, guestCount });

  socket.emitToAdmin('new_inquiry', {
    name: inquiry.name,
    phone: inquiry.phone,
    inquiryType: inquiry.inquiryType,
    createdAt: inquiry.createdAt,
  });

  sendAdminNewInquiryAlert(inquiry).catch(console.error);

  res.status(201).json({ success: true, inquiry, message: 'Thank you! We will contact you shortly.' });
});

const getAllInquiries = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const total = await Inquiry.countDocuments(query);
  const inquiries = await Inquiry.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, count: inquiries.length, total, pages: Math.ceil(total / Number(limit)), inquiries });
});

const updateInquiry = asyncHandler(async (req, res) => {
  const { status, assignedTo, followUpDate, adminNotes, isRead } = req.body;
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { ...(status       !== undefined && { status }),
      ...(assignedTo   !== undefined && { assignedTo }),
      ...(followUpDate !== undefined && { followUpDate }),
      ...(adminNotes   !== undefined && { adminNotes }),
      ...(isRead       !== undefined && { isRead }) },
    { new: true }
  );
  if (!inquiry) { res.status(404); throw new Error('Inquiry not found'); }
  res.json({ success: true, inquiry });
});

// ─── OFFERS ──────────────────────────────────────────────────────────────────

const getOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  });
  res.json({ success: true, offers });
});

const getOffersAdmin = asyncHandler(async (req, res) => {
  const offers = await Offer.find({}).sort({ createdAt: -1 });
  res.json({ success: true, offers });
});

const validateOffer = asyncHandler(async (req, res) => {
  const { code, amount, type } = req.body;
  if (!code) { res.status(400); throw new Error('Promo code is required'); }

  const offer = await Offer.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
    $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
  });
  if (!offer) { res.status(404); throw new Error('Invalid or expired promo code'); }
  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
    res.status(400); throw new Error('Promo code usage limit reached');
  }
  if (offer.minAmount && amount < offer.minAmount) {
    res.status(400); throw new Error(`Minimum booking amount ₹${offer.minAmount} required for this code`);
  }
  if (offer.applicableTo !== 'both' && offer.applicableTo !== type) {
    res.status(400); throw new Error(`This code is not valid for ${type} bookings`);
  }

  let discount = 0;
  const sub = Number(amount) || 0;
  if (offer.type === 'percentage') {
    discount = Math.min(Math.round((sub * offer.value) / 100), offer.maxDiscount || Infinity);
  } else if (offer.type === 'fixed') {
    discount = Math.min(offer.value, sub);
  }

  res.json({
    success: true,
    discount: Math.round(discount),
    offer: { name: offer.title, type: offer.type, value: offer.value },
  });
});

const createOffer = asyncHandler(async (req, res) => {
  const { title, description, code, type, value, minAmount, maxDiscount, applicableTo, startDate, endDate, usageLimit } = req.body;
  const offer = await Offer.create({
    title, description, code, type, value, minAmount, maxDiscount, applicableTo, startDate, endDate, usageLimit,
  });
  res.status(201).json({ success: true, offer });
});

const updateOffer = asyncHandler(async (req, res) => {
  const { title, description, type, value, minAmount, maxDiscount, applicableTo, startDate, endDate, usageLimit, isActive } = req.body;
  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    { title, description, type, value, minAmount, maxDiscount, applicableTo, startDate, endDate, usageLimit, isActive },
    { new: true }
  );
  if (!offer) { res.status(404); throw new Error('Offer not found'); }
  res.json({ success: true, offer });
});

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
const RoomBooking  = require('../models/RoomBooking');
const EventBooking = require('../models/EventBooking');
const { Payment }  = require('../models/index');
const User         = require('../models/User');

// Simple 60-second in-memory cache to avoid hammering DB on every admin page load
let _dashCache     = null;
let _dashCacheTime = 0;
const DASH_TTL     = 60 * 1000;

const getDashboardStats = asyncHandler(async (req, res) => {
  if (_dashCache && Date.now() - _dashCacheTime < DASH_TTL) {
    return res.json(_dashCache);
  }

  const now = new Date();
  // Immutable today boundaries — avoid shared-variable mutation bugs
  const todayStart = new Date(now); todayStart.setHours(0,  0,  0,   0);
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRoomBookings, confirmedRoomBookings, pendingRoomBookings,
    totalEventBookings, confirmedEventBookings, pendingInquiries,
    totalRevenue, monthlyRevenue, totalUsers, totalReviews, unreviewedCount,
    todayCheckIns, todayCheckOuts,
  ] = await Promise.all([
    RoomBooking.countDocuments(),
    RoomBooking.countDocuments({ status: 'confirmed' }),
    RoomBooking.countDocuments({ status: 'pending' }),
    EventBooking.countDocuments(),
    EventBooking.countDocuments({ status: { $in: ['confirmed', 'advance_paid'] } }),
    Inquiry.countDocuments({ status: 'new' }),
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: 'captured', createdAt: { $gte: thisMonthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    User.countDocuments({ role: 'user' }),
    Review.countDocuments(),
    Review.countDocuments({ isApproved: false }),
    RoomBooking.countDocuments({ status: 'confirmed',  checkIn:  { $gte: todayStart, $lte: todayEnd } }),
    RoomBooking.countDocuments({ status: 'checked_in', checkOut: { $gte: todayStart, $lte: todayEnd } }),
  ]);

  const recentBookings = await RoomBooking.find()
    .populate('room', 'name type')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('bookingId guestDetails.name checkIn checkOut status pricing.totalAmount');

  const recentEvents = await EventBooking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('bookingId contactDetails.name eventType eventDetails.eventDate status pricing.totalEstimate');

  const response = {
    success: true,
    stats: {
      roomBookings:  { total: totalRoomBookings, confirmed: confirmedRoomBookings, pending: pendingRoomBookings },
      eventBookings: { total: totalEventBookings, confirmed: confirmedEventBookings },
      inquiries:     { pending: pendingInquiries },
      revenue:       { total: totalRevenue[0]?.total || 0, thisMonth: monthlyRevenue[0]?.total || 0 },
      users:         totalUsers,
      reviews:       { total: totalReviews, pending: unreviewedCount },
      today:         { checkIns: todayCheckIns, checkOuts: todayCheckOuts },
    },
    recentBookings,
    recentEvents,
  };

  _dashCache     = response;
  _dashCacheTime = Date.now();

  res.json(response);
});

module.exports = {
  createReview, getReviews, getAllReviewsAdmin, updateReview,
  getGallery, addGalleryImage, updateGalleryImage, deleteGalleryImage,
  createInquiry, getAllInquiries, updateInquiry,
  getOffers, getOffersAdmin, validateOffer, createOffer, updateOffer,
  getDashboardStats,
};
