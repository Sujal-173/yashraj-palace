const express = require('express');
const r = express.Router();
const {
  createOrder,
  verifyPayment,
  paymentWebhook,
  initiateRefund,
  getAllPayments,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');
const { validateCreateOrder, validateVerifyPayment, validateRefund } = require('../middleware/validate');

// Webhook must be raw body for signature verification — no auth middleware
r.post('/webhook', paymentWebhook);

// Authenticated — user must be logged in to pay
r.post('/create-order', protect, validateCreateOrder, createOrder);
r.post('/verify',       protect, validateVerifyPayment, verifyPayment);

// Admin only
r.post('/admin/refund', protect, admin, validateRefund, initiateRefund);
r.get('/admin/all',     protect, admin, getAllPayments);

module.exports = r;
