const mongoose = require('mongoose');

// ─── Payment Model ─────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  paymentId:          { type: String, unique: true },
  razorpayPaymentId:  String,
  razorpayOrderId:    String,
  razorpaySignature:  String,
  bookingRef:         String,
  bookingType:        { type: String, enum: ['room', 'event'] },
  amount:             { type: Number, required: true },
  currency:           { type: String, default: 'INR' },
  status:             { type: String, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' },
  method:             String,
  user:               { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:              mongoose.Schema.Types.Mixed,
  refundId:           String,
  refundAmount:       Number,
  refundedAt:         Date,
}, { timestamps: true });

// Index for webhook lookups and admin queries
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ bookingRef: 1, bookingType: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// ─── Review Model ──────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  title:      String,
  comment:    { type: String, required: true },
  occasion:   String,
  stayDate:   String,
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  source:     { type: String, enum: ['website', 'google', 'manual'], default: 'website' },
  room:       { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'RoomBooking' },
}, { timestamps: true });

reviewSchema.index({ isApproved: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ isFeatured: 1, isApproved: 1 });

// ─── Gallery Model ─────────────────────────────────────────────────────────────
const gallerySchema = new mongoose.Schema({
  title:      String,
  url:        { type: String, required: true },
  thumbnail:  String,
  category: {
    type: String,
    enum: ['rooms', 'weddings', 'garden', 'banquet', 'food', 'property', 'events'],
    required: true,
  },
  alt:        String,
  caption:    String,
  isFeatured: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

gallerySchema.index({ category: 1, isActive: 1, sortOrder: 1 });

// ─── Contact Inquiry Model ─────────────────────────────────────────────────────
const inquirySchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String, required: true },
  subject:     String,
  message:     { type: String, required: true },
  inquiryType: { type: String, enum: ['general', 'room', 'event', 'wedding', 'corporate', 'other'], default: 'general' },
  eventDate:   Date,
  guestCount:  Number,
  status:      { type: String, enum: ['new', 'contacted', 'quoted', 'converted', 'closed'], default: 'new' },
  assignedTo:  String,
  followUpDate:Date,
  adminNotes:  String,
  isRead:      { type: Boolean, default: false },
}, { timestamps: true });

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ isRead: 1 });

// ─── Offer Model ───────────────────────────────────────────────────────────────
const offerSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  code:        { type: String, unique: true, uppercase: true },
  type:        { type: String, enum: ['percentage', 'fixed', 'free_addon'], required: true },
  value:       { type: Number, required: true },
  minAmount:   { type: Number, default: 0 },
  maxDiscount: Number,
  applicableTo:{ type: String, enum: ['room', 'event', 'both'], default: 'both' },
  startDate:   Date,
  endDate:     Date,
  usageLimit:  Number,
  usedCount:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// Index for fast promo code validation
offerSchema.index({ code: 1, isActive: 1 });

const Payment  = mongoose.model('Payment',  paymentSchema);
const Review   = mongoose.model('Review',   reviewSchema);
const Gallery  = mongoose.model('Gallery',  gallerySchema);
const Inquiry  = mongoose.model('Inquiry',  inquirySchema);
const Offer    = mongoose.model('Offer',    offerSchema);

module.exports = { Payment, Review, Gallery, Inquiry, Offer };
