const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  isActive: { type: Boolean, default: true },
  avatar:   { type: String },
  address:  {
    street: String, city: String, state: String, pincode: String
  },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
}, { timestamps: true });

// Index for fast password-reset token lookup (tokens are queried per-request)
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
