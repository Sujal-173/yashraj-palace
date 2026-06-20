const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  hotelName:      { type: String, default: 'Yashraj Palace' },
  tagline:        { type: String, default: 'Heritage Meets Luxury' },
  phone:          { type: String, default: '+91 70000 00000' },
  whatsapp:       { type: String, default: '917000000000' },
  email:          { type: String, default: 'info@yashrajpalace.com' },
  address:        { type: String, default: 'Near Mandleshwar, Khargone District, Madhya Pradesh – 451221' },
  checkIn:        { type: String, default: '12:00 PM' },
  checkOut:       { type: String, default: '11:00 AM' },
  tokenAmount:    { type: Number, default: 10000 },
  advancePercent: { type: Number, default: 30 },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
