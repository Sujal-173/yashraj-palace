const express = require('express');
const misc = require('../controllers/miscControllers');
const { protect, admin, staff } = require('../middleware/auth');
const {
  validateCreateReview,
  validateCreateInquiry,
} = require('../middleware/validate');

// ── Review routes ─────────────────────────────────────────────────────────────
const reviewRouter = express.Router();
reviewRouter.get('/',            misc.getReviews);
reviewRouter.post('/',           validateCreateReview, misc.createReview);
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
inquiryRouter.post('/',           validateCreateInquiry, misc.createInquiry);
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
