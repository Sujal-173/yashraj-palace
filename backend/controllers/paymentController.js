const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const RoomBooking = require('../models/RoomBooking');
const EventBooking = require('../models/EventBooking');
const { Payment } = require('../models/index');
const { sendBookingConfirmation, sendRefundNotification, sendAdminNewBookingAlert } = require('../utils/emailService');

let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

// ── Shared: confirm booking after payment ─────────────────────────────────────
async function confirmBookingAfterPayment(bookingId, bookingType, razorpayPaymentId, razorpayOrderId) {
  if (bookingType === 'room') {
    const booking = await RoomBooking.findOneAndUpdate(
      { bookingId, paymentStatus: { $ne: 'paid' } }, // idempotent guard
      {
        paymentStatus: 'partial',
        paymentId: razorpayPaymentId,
        razorpayOrderId,
        status: 'confirmed',
        confirmedAt: new Date(),
      },
      { new: true }
    ).populate('room', 'name type images');

    if (booking) {
      sendBookingConfirmation(booking).catch(console.error);
    }
    return booking;
  }

  if (bookingType === 'event') {
    const booking = await EventBooking.findOneAndUpdate(
      { bookingId, paymentStatus: { $ne: 'paid' } },
      {
        paymentStatus: 'token_paid',
        paymentId: razorpayPaymentId,
        razorpayOrderId,
        status: 'advance_paid',
        confirmedAt: new Date(),
      },
      { new: true }
    );
    return booking;
  }
}

// @desc  Create Razorpay order — amount always fetched from DB, never from client
// @route POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, bookingType, currency = 'INR' } = req.body;

  // Resolve amount from DB — never trust client-supplied amount
  let amount;
  if (bookingType === 'room') {
    const booking = await RoomBooking.findOne({ bookingId });
    if (!booking) { res.status(404); throw new Error('Room booking not found'); }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      res.status(400); throw new Error('Booking is not in a payable state');
    }
    if (booking.paymentStatus === 'paid') {
      res.status(400); throw new Error('Booking is already fully paid');
    }
    amount = booking.pricing.advancePaid;
  } else if (bookingType === 'event') {
    const booking = await EventBooking.findOne({ bookingId });
    if (!booking) { res.status(404); throw new Error('Event booking not found'); }
    if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'token_paid') {
      res.status(400); throw new Error('Token/advance already paid for this event');
    }
    amount = booking.pricing.tokenAmount || 10000;
  } else {
    res.status(400); throw new Error('Invalid booking type');
  }

  if (!amount || amount < 1) {
    res.status(400); throw new Error('Invalid payable amount');
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt: `rcpt_${bookingId}`,
    notes: { bookingId, bookingType, hotelName: 'Yashraj Palace' },
  };

  const order = await getRazorpay().orders.create(options);

  await Payment.create({
    paymentId: `PAY${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    razorpayOrderId: order.id,
    bookingRef: bookingId,
    bookingType,
    amount,
    status: 'created',
    user: req.user?._id,
    notes: options.notes,
  });

  res.json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc  Verify Razorpay payment signature and confirm booking
// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, bookingType } = req.body;

  // Cryptographic signature verification
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    res.status(400); throw new Error('Payment verification failed — invalid signature');
  }

  // Verify amount with Razorpay directly (prevents order amount tampering)
  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.fetch(razorpay_order_id);
  } catch (e) {
    res.status(400); throw new Error('Could not verify order with Razorpay');
  }

  // Fetch expected amount from our Payment record
  const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (paymentRecord && razorpayOrder.amount !== Math.round(paymentRecord.amount * 100)) {
    res.status(400); throw new Error('Order amount mismatch — possible tampering detected');
  }

  // Update Payment record
  await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'captured' }
  );

  // Confirm booking and send confirmation email
  const booking = await confirmBookingAfterPayment(bookingId, bookingType, razorpay_payment_id, razorpay_order_id);

  res.json({
    success: true,
    message: 'Payment verified! Your booking is now confirmed.',
    paymentId: razorpay_payment_id,
    bookingId,
  });
});

// @desc  Razorpay webhook — mandatory signature verification
// @route POST /api/payments/webhook
const paymentWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set — webhook rejected');
    return res.status(400).json({ success: false, message: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  // req.body is a Buffer when express.raw() is applied to /webhook
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSig !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  // Parse body (Buffer → object)
  let parsed;
  try {
    parsed = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  }
  const { event, payload } = parsed;

  if (event === 'payment.captured') {
    const entity = payload?.payment?.entity;
    if (entity?.order_id) {
      // Update payment record
      await Payment.findOneAndUpdate(
        { razorpayOrderId: entity.order_id },
        { status: 'captured', method: entity.method, razorpayPaymentId: entity.id }
      );

      // Sync booking status (handles browser-crash case where /verify was never called)
      const paymentRecord = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (paymentRecord?.bookingRef && paymentRecord?.bookingType) {
        await confirmBookingAfterPayment(
          paymentRecord.bookingRef,
          paymentRecord.bookingType,
          entity.id,
          entity.order_id
        );
      }
    }
  }

  if (event === 'payment.failed') {
    const entity = payload?.payment?.entity;
    if (entity?.order_id) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: entity.order_id },
        { status: 'failed' }
      );
    }
  }

  if (event === 'refund.processed') {
    const entity = payload?.refund?.entity;
    if (entity?.payment_id) {
      await Payment.findOneAndUpdate(
        { razorpayPaymentId: entity.payment_id },
        { status: 'refunded', refundId: entity.id, refundedAt: new Date(), refundAmount: entity.amount / 100 }
      );
    }
  }

  res.json({ success: true });
});

// @desc  Initiate refund (admin only)
// @route POST /api/payments/admin/refund
const initiateRefund = asyncHandler(async (req, res) => {
  const { paymentId, amount, reason } = req.body;

  const paymentRecord = await Payment.findById(paymentId).populate('user', 'name email');
  if (!paymentRecord) { res.status(404); throw new Error('Payment record not found'); }
  if (paymentRecord.status === 'refunded') {
    res.status(400); throw new Error('Payment already refunded');
  }
  if (!paymentRecord.razorpayPaymentId) {
    res.status(400); throw new Error('No Razorpay payment ID on record — cannot refund');
  }

  const refundAmount = amount ? Math.round(amount * 100) : undefined; // paise; undefined = full refund

  let refund;
  try {
    refund = await getRazorpay().payments.refund(paymentRecord.razorpayPaymentId, {
      amount: refundAmount,
      notes: { reason: reason || 'Refund initiated by admin', hotelName: 'Yashraj Palace' },
    });
  } catch (err) {
    res.status(502); throw new Error(`Razorpay refund failed: ${err.message}`);
  }

  // Update payment record
  await Payment.findByIdAndUpdate(paymentId, {
    status: 'refunded',
    refundId: refund.id,
    refundAmount: refund.amount / 100,
    refundedAt: new Date(),
  });

  // Update booking paymentStatus
  const refundedAmount = refund.amount / 100;
  if (paymentRecord.bookingType === 'room') {
    const booking = await RoomBooking.findOneAndUpdate(
      { bookingId: paymentRecord.bookingRef },
      { paymentStatus: 'refunded' },
      { new: true }
    ).populate('room', 'name type');

    if (booking) {
      sendRefundNotification(booking, refundedAmount, reason).catch(console.error);
    }
  } else if (paymentRecord.bookingType === 'event') {
    await EventBooking.findOneAndUpdate(
      { bookingId: paymentRecord.bookingRef },
      { paymentStatus: 'refunded' }
    );
  }

  res.json({
    success: true,
    message: `Refund of ₹${refundedAmount.toLocaleString('en-IN')} initiated successfully`,
    refundId: refund.id,
    refundAmount: refundedAmount,
  });
});

// @desc  Get payment history (admin only)
// @route GET /api/payments/admin/all
const getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json({ success: true, total, pages: Math.ceil(total / limit), payments });
});

module.exports = { createOrder, verifyPayment, paymentWebhook, initiateRefund, getAllPayments };
