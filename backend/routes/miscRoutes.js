const express = require('express');
const rateLimit = require('express-rate-limit');
const misc = require('../controllers/miscControllers');
const { protect, admin, staff } = require('../middleware/auth');
const {
  validateCreateReview,
  validateCreateInquiry,
} = require('../middleware/validate');

// Rate limiters for public write endpoints
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many review submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many inquiry submissions. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Review routes ─────────────────────────────────────────────────────────────
const reviewRouter = express.Router();
reviewRouter.get('/',            misc.getReviews);
reviewRouter.post('/',           reviewLimiter, validateCreateReview, misc.createReview);
reviewRouter.get('/admin/all',   protect, staff, misc.getAllReviewsAdmin);
reviewRouter.put('/admin/:id',   protect, staff, misc.updateReview);

// ── Gallery routes ────────────────────────────────────────────────────────────
const galleryRouter = express.Router();
galleryRouter.get('/',        misc.getGallery);
galleryRouter.post('/',       protect, misc.addGalleryImage);
galleryRouter.put('/:id',     protect, admin, misc.updateGalleryImage);
galleryRouter.delete('/:id',  protect, misc.deleteGalleryImage);

// ── Inquiry routes ────────────────────────────────────────────────────────────
const inquiryRouter = express.Router();
inquiryRouter.post('/',           inquiryLimiter, validateCreateInquiry, misc.createInquiry);
inquiryRouter.get('/admin/all',   protect, staff, misc.getAllInquiries);
inquiryRouter.put('/admin/:id',   protect, staff, misc.updateInquiry);

// ── Offer routes ──────────────────────────────────────────────────────────────
const offerRouter = express.Router();
offerRouter.get('/',           misc.getOffers);
offerRouter.post('/validate',  misc.validateOffer);
// Admin routes — must be before /:id to avoid route conflicts
offerRouter.get('/admin/all',  protect, admin, misc.getOffersAdmin);
offerRouter.post('/admin',     protect, admin, misc.createOffer);
offerRouter.put('/admin/:id',  protect, admin, misc.updateOffer);

// ── Admin dashboard ───────────────────────────────────────────────────────────
const adminRouter = express.Router();
adminRouter.get('/dashboard', protect, staff, misc.getDashboardStats);

module.exports = { reviewRouter, galleryRouter, inquiryRouter, offerRouter, adminRouter };
