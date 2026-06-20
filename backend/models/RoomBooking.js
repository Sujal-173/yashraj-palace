const crypto = require('crypto');
const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema({
  bookingId:    { type: String, unique: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room:         { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guestDetails: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String, required: true },
    address: String,
    idType:  String,
    idNumber:String,
  },
  checkIn:  { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights:   { type: Number },
  guests: {
    adults:   { type: Number, default: 1 },
    children: { type: Number, default: 0 },
  },
  addOns: [{ name: String, price: Number, quantity: Number }],
  promoCode: String,
  pricing: {
    roomPrice:   { type: Number, required: true },
    addOnsTotal: { type: Number, default: 0 },
    taxes:       { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    advancePaid: { type: Number, default: 0 },
    balanceDue:  { type: Number, default: 0 },
  },
  specialRequests: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentId:       String,
  razorpayOrderId: String,
  source: { type: String, enum: ['website', 'phone', 'walkin', 'admin'], default: 'website' },
  cancellationReason: String,
  cancelledAt:  Date,
  confirmedAt:  Date,
  notes:        String,
}, { timestamps: true });

// ── Collision-safe booking ID + nights calculation ─────────────────────────────
roomBookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = `YPR${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  if (this.checkIn && this.checkOut) {
    const diff = (new Date(this.checkOut) - new Date(this.checkIn)) / (1000 * 60 * 60 * 24);
    this.nights = Math.max(1, Math.ceil(diff));
  }
  next();
});

// ── Indexes ────────────────────────────────────────────────────────────────────
// Availability conflict check: the most frequent query
roomBookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
// Status-based filtering (admin list, cron job)
roomBookingSchema.index({ status: 1 });
roomBookingSchema.index({ paymentStatus: 1, status: 1, createdAt: 1 });
// User's bookings
roomBookingSchema.index({ user: 1, createdAt: -1 });
// Guest lookup by phone
roomBookingSchema.index({ bookingId: 1, 'guestDetails.phone': 1 });

module.exports = mongoose.model('RoomBooking', roomBookingSchema);
