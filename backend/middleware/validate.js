const { body, param, query, validationResult } = require('express-validator');

// Middleware: run after validation chains, reject if errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const messages = errors.array().map(e => e.msg).join(', ');
    throw new Error(messages);
  }
  next();
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name too long'),
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const validateLogin = [
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ─── ROOM BOOKING ─────────────────────────────────────────────────────────────
const validateCreateBooking = [
  body('roomId').notEmpty().withMessage('Room ID is required').isMongoId().withMessage('Invalid room ID'),
  body('checkIn').isISO8601().withMessage('Valid check-in date required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date required'),
  body('guestDetails.name').trim().notEmpty().withMessage('Guest name is required').isLength({ max: 100 }),
  body('guestDetails.email').normalizeEmail().isEmail().withMessage('Valid guest email required'),
  body('guestDetails.phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile number required'),
  body('guests.adults').optional().isInt({ min: 1, max: 10 }).withMessage('Adults must be between 1 and 10'),
  body('guests.children').optional().isInt({ min: 0, max: 6 }).withMessage('Children must be between 0 and 6'),
  body('addOns').optional().isArray(),
  body('specialRequests').optional().trim().isLength({ max: 500 }),
  body('promoCode').optional().trim().toUpperCase(),
  handleValidation,
];

// ─── EVENT BOOKING ────────────────────────────────────────────────────────────
const validateCreateEventBooking = [
  body('eventType').isIn(['wedding', 'reception', 'engagement', 'birthday', 'anniversary', 'corporate', 'family', 'cultural']).withMessage('Invalid event type'),
  body('contactDetails.name').trim().notEmpty().withMessage('Contact name is required').isLength({ max: 100 }),
  body('contactDetails.email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('contactDetails.phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile number required'),
  body('eventDetails.eventDate').isISO8601().withMessage('Valid event date required'),
  body('eventDetails.guestCount').isInt({ min: 1, max: 5000 }).withMessage('Guest count must be between 1 and 5000'),
  body('selectedAddOns').optional().isArray(),
  handleValidation,
];

// ─── PAYMENT ──────────────────────────────────────────────────────────────────
const validateCreateOrder = [
  body('bookingId').trim().notEmpty().withMessage('Booking ID is required'),
  body('bookingType').isIn(['room', 'event']).withMessage('Booking type must be room or event'),
  handleValidation,
];

const validateVerifyPayment = [
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('bookingType').isIn(['room', 'event']).withMessage('Invalid booking type'),
  handleValidation,
];

// ─── REVIEW ───────────────────────────────────────────────────────────────────
const validateCreateReview = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required').isLength({ min: 10, max: 1000 }),
  body('title').optional().trim().isLength({ max: 100 }),
  body('occasion').optional().trim().isLength({ max: 100 }),
  body('honeypot').custom(val => {
    if (val) throw new Error('Spam detected');
    return true;
  }),
  handleValidation,
];

// ─── INQUIRY ──────────────────────────────────────────────────────────────────
const validateCreateInquiry = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile number required'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10, max: 2000 }),
  body('inquiryType').optional().isIn(['general', 'room', 'event', 'wedding', 'corporate', 'other']),
  body('honeypot').custom(val => {
    if (val) throw new Error('Spam detected');
    return true;
  }),
  handleValidation,
];

// ─── GUEST LOOKUP ─────────────────────────────────────────────────────────────
const validateGuestLookup = [
  query('bookingId').trim().notEmpty().withMessage('Booking ID is required'),
  query('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile number required'),
  handleValidation,
];

// ─── REFUND ───────────────────────────────────────────────────────────────────
const validateRefund = [
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('amount').optional().isFloat({ min: 1 }).withMessage('Refund amount must be positive'),
  body('reason').optional().trim().isLength({ max: 200 }),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateBooking,
  validateCreateEventBooking,
  validateCreateOrder,
  validateVerifyPayment,
  validateCreateReview,
  validateCreateInquiry,
  validateGuestLookup,
  validateRefund,
  handleValidation,
};
