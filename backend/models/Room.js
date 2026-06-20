const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  type:        { type: String, enum: ['deluxe', 'premium', 'suite', 'family'], required: true },
  description: { type: String, required: true },
  shortDesc:   { type: String },
  price:       { type: Number, required: true },
  discountedPrice: { type: Number },
  capacity:    { type: Number, default: 2 },
  bedType:     { type: String, enum: ['single', 'double', 'queen', 'king', 'twin'], required: true },
  size:        { type: Number }, // in sq ft
  floor:       { type: Number },
  images:      [{ url: String, alt: String, isPrimary: { type: Boolean, default: false } }],
  amenities:   [String],
  features:    [String],
  policies: {
    checkIn:       { type: String, default: '12:00 PM' },
    checkOut:      { type: String, default: '11:00 AM' },
    cancellation:  { type: String, default: 'Free cancellation up to 24 hours before check-in' },
    extraBed:      { type: Number, default: 500 },
    breakfastPrice:{ type: Number, default: 250 },
  },
  addOns: [{
    name: String, price: Number, description: String
  }],
  isAvailable: { type: Boolean, default: true },
  isActive:    { type: Boolean, default: true },
  roomNumber:  { type: String },
  totalRooms:  { type: Number, default: 1 },
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
