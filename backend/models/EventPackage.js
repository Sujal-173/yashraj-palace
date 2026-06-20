const mongoose = require('mongoose');

const eventPackageSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, unique: true },
  description: { type: String, required: true },
  shortDesc:   String,
  category:    {
    type: String,
    enum: ['wedding', 'reception', 'engagement', 'birthday', 'anniversary', 'corporate', 'family', 'cultural'],
    required: true
  },
  price:           { type: Number, required: true },
  priceType:       { type: String, enum: ['fixed', 'per_plate', 'starting'], default: 'fixed' },
  capacity: {
    min: { type: Number, default: 50 },
    max: { type: Number, required: true }
  },
  duration:        { type: Number, default: 1 }, // days
  inclusions:      [String],
  exclusions:      [String],
  addOns: [{
    name: String, price: Number, unit: String, description: String
  }],
  venue: {
    type: String,
    enum: ['garden', 'banquet', 'lawn', 'combined'],
    required: true
  },
  images:          [{ url: String, alt: String }],
  isFeatured:      { type: Boolean, default: false },
  isActive:        { type: Boolean, default: true },
  badge:           String,
  sortOrder:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('EventPackage', eventPackageSchema);
