require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Models
const User         = require('./models/User');
const Room         = require('./models/Room');
const EventPackage = require('./models/EventPackage');
const { Review, Gallery, Offer } = require('./models/index');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    EventPackage.deleteMany({}),
    Review.deleteMany({}),
    Gallery.deleteMany({}),
    Offer.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  // ── Admin User ──────────────────────────────────────────────────────────
  await User.create({
    name:     'Admin',
    email:    process.env.ADMIN_EMAIL || 'admin@yashrajpalace.com',
    phone:    process.env.ADMIN_PHONE || '+917000000000',
    password: process.env.ADMIN_PASSWORD || 'Admin@YP2025',
    role:     'admin',
  });
  console.log('👤 Admin user created');

  // ── Rooms ───────────────────────────────────────────────────────────────
  await Room.insertMany([
    {
      name: 'Deluxe Room', slug: 'deluxe-room', type: 'deluxe',
      price: 1800, capacity: 2, bedType: 'queen', size: 280,
      description: 'A well-appointed room with a queen bed, garden or courtyard view, premium linens, and all essentials for a restful stay. Perfect for couples and solo travellers visiting Maheshwar and the Narmada Ghats.',
      shortDesc: 'Comfortable queen-bed room with modern amenities and warm interiors.',
      amenities: ['Free Wi-Fi','AC','LED TV','Hot & Cold Water','24/7 Room Service','Daily Housekeeping','Free Parking','Power Backup'],
      policies: { checkIn: '12:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 24 hours before check-in', extraBed: 500, breakfastPrice: 250 },
      isAvailable: true, isActive: true, totalRooms: 5, sortOrder: 1,
    },
    {
      name: 'Premium Room', slug: 'premium-room', type: 'premium',
      price: 2500, capacity: 2, bedType: 'king', size: 380,
      description: 'Elevated comfort with a king-size bed, a dedicated sitting area, designer bathroom with rainfall shower, and complimentary breakfast. Ideal for a special stay or romantic getaway near Maheshwar Fort.',
      shortDesc: 'King-bed room with sitting area and complimentary breakfast included.',
      amenities: ['Free Wi-Fi','AC','LED TV','Hot & Cold Water','Breakfast Included','Mini Fridge','24/7 Room Service','Daily Housekeeping','Free Parking','Power Backup'],
      policies: { checkIn: '12:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 48 hours before check-in', extraBed: 600, breakfastPrice: 0 },
      isAvailable: true, isActive: true, totalRooms: 8, sortOrder: 2,
    },
    {
      name: 'Family Suite', slug: 'family-suite', type: 'suite',
      price: 3800, capacity: 4, bedType: 'twin', size: 560,
      description: 'Spacious and warm — a separate living area, two beds, and thoughtful touches that make family stays truly memorable. The suite comfortably fits a family of four with extra space for children.',
      shortDesc: 'Spacious suite with two beds and living area — perfect for families.',
      amenities: ['Free Wi-Fi','AC','LED TV','Hot & Cold Water','Living Room','Mini Kitchen','Mini Fridge','24/7 Room Service','Daily Housekeeping','Free Parking','Power Backup'],
      policies: { checkIn: '12:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 48 hours before check-in', extraBed: 700, breakfastPrice: 250 },
      isAvailable: true, isActive: true, totalRooms: 4, sortOrder: 3,
    },
  ]);
  console.log('🏨 Rooms seeded');

  // ── Event Packages ──────────────────────────────────────────────────────
  await EventPackage.insertMany([
    {
      name: 'Silver Celebration', slug: 'silver-celebration', category: 'birthday',
      description: 'A well-arranged birthday celebration package for up to 200 guests in our banquet hall. Includes hall access, basic decor, sound system, and parking — ideal for milestone birthdays and family gatherings.',
      shortDesc: 'Banquet birthday package for up to 200 guests with decor and sound.',
      price: 45000, priceType: 'fixed', capacity: { min: 50, max: 200 }, duration: 1,
      venue: 'banquet',
      inclusions: ['Banquet hall access (6 hours)','Basic floral decoration','Sound system & mic setup','Parking for 40 vehicles','1 event coordination staff','Welcome banner'],
      exclusions: ['Catering (priced separately)','Photography','Decoration beyond basics'],
      isFeatured: false, isActive: true, sortOrder: 1,
    },
    {
      name: 'Royal Wedding Package', slug: 'royal-wedding-package', category: 'wedding',
      description: 'Our most popular wedding package — a full-day celebration across the garden and banquet hall for up to 600 guests. Includes premium decor, DJ, 300-plate catering, 4 family rooms, and a dedicated coordinator.',
      shortDesc: 'Full-day wedding with premium decor, catering for 300, and 4 family rooms.',
      price: 180000, priceType: 'fixed', capacity: { min: 200, max: 600 }, duration: 1,
      venue: 'combined', badge: 'Most Popular',
      inclusions: ['Full garden + hall access (full day)','Premium floral & mandap decor','DJ, lighting & sound system','300-plate in-house catering','4 rooms for family (1 night)','Dedicated wedding coordinator','Welcome gate setup','Bride & groom seating arrangement'],
      exclusions: ['Photography','Mehendi artist','Additional catering beyond 300 plates'],
      isFeatured: true, isActive: true, sortOrder: 2,
    },
    {
      name: 'Grand Palace Package', slug: 'grand-palace-package', category: 'wedding',
      description: 'The ultimate 2-day celebration across the entire Yashraj Palace property for up to 1000 guests. Unlimited catering, custom luxury decor, 10 rooms for 2 nights, full coordination team, and photography support.',
      shortDesc: '2-day all-inclusive grand wedding for up to 1000 guests across full property.',
      price: 450000, priceType: 'fixed', capacity: { min: 500, max: 1000 }, duration: 2,
      venue: 'combined', badge: 'All Inclusive',
      inclusions: ['Full property — garden + hall + lawn (2 days)','Custom luxury stage & decor','Unlimited catering — all meals + live counters','10 rooms for 2 nights','2-day event coordination team','Baraat welcome setup','Custom lighting rig','Photography & videography coordination'],
      exclusions: ['External entertainment','Legal/govt permissions'],
      isFeatured: true, isActive: true, sortOrder: 3,
    },
    {
      name: 'Corporate Off-Site', slug: 'corporate-off-site', category: 'corporate',
      description: 'A professional corporate event package for 50–300 attendees. Full AV setup, projector, high-speed Wi-Fi, welcome snacks, and a buffet lunch — everything your team needs for a productive off-site.',
      shortDesc: 'Corporate event for up to 300 with full AV, Wi-Fi, and buffet lunch.',
      price: 55000, priceType: 'fixed', capacity: { min: 50, max: 300 }, duration: 1,
      venue: 'banquet',
      inclusions: ['Banquet hall + full AV setup','Projector, screen & mics','High-speed Wi-Fi','Welcome snacks & lunch buffet','Tea/coffee station','Event coordination support'],
      exclusions: ['Team activities','Outdoor setup'],
      isFeatured: false, isActive: true, sortOrder: 4,
    },
    {
      name: 'Engagement Function', slug: 'engagement-function', category: 'engagement',
      description: 'A beautiful garden engagement ceremony for up to 200 guests. Includes floral stage setup, sound system, seating arrangement, and basic catering coordination — perfect for an intimate and elegant function.',
      shortDesc: 'Garden engagement for up to 200 guests with floral stage and sound.',
      price: 35000, priceType: 'fixed', capacity: { min: 50, max: 200 }, duration: 1,
      venue: 'garden',
      inclusions: ['Garden access (5 hours)','Floral stage setup','Sound system','200-guest seating arrangement','Basic catering coordination'],
      exclusions: ['Full catering','Photography','DJ'],
      isFeatured: false, isActive: true, sortOrder: 5,
    },
    {
      name: 'Birthday Bash', slug: 'birthday-bash', category: 'birthday',
      description: 'A fun and festive birthday celebration for up to 150 guests in our banquet hall. Balloon and theme decoration, sound system, and cake coordination included — make it a party to remember.',
      shortDesc: 'Banquet birthday party for up to 150 with theme decor and cake.',
      price: 25000, priceType: 'fixed', capacity: { min: 30, max: 150 }, duration: 1,
      venue: 'banquet',
      inclusions: ['Banquet hall (4 hours)','Balloon & theme decoration','Basic sound system','Parking for 30 vehicles','Birthday cake coordination'],
      exclusions: ['Catering','Photography','Custom theme decor'],
      isFeatured: false, isActive: true, sortOrder: 6,
    },
  ]);
  console.log('📦 Event packages seeded');

  // ── Reviews ─────────────────────────────────────────────────────────────
  await Review.insertMany([
    { name: 'Ramesh Verma',   email: 'ramesh@example.com', rating: 5, occasion: 'Wedding Reception · March 2025',   comment: 'We hosted my daughter\'s wedding reception here. The garden was beautifully lit, food was excellent, and the coordination team handled everything flawlessly. Highly recommended.', isApproved: true, isFeatured: true,  isActive: true },
    { name: 'Priya Sharma',   email: 'priya@example.com',  rating: 5, occasion: 'Room Stay · January 2025',          comment: 'Stayed 3 nights while visiting Maheshwar. Room was spotless, staff were warm, and the food genuinely tasty. The hotel has real character to it.', isApproved: true, isFeatured: true,  isActive: true },
    { name: 'Ankit Kulkarni', email: 'ankit@example.com',  rating: 4, occasion: 'Corporate Event · November 2024',  comment: 'Held our annual function here for 300 people. Great AV setup, good parking, and catering was very well organised. Will return for our next event.', isApproved: true, isFeatured: true,  isActive: true },
    { name: 'Sunita Patel',   email: 'sunita@example.com', rating: 5, occasion: 'Family Stay · December 2024',       comment: 'A family of 6 stayed in two rooms. Spacious, kids were comfortable, and the restaurant served amazing home-style food. Very reasonably priced.', isApproved: true, isFeatured: false, isActive: true },
    { name: 'Mohit Singh',    email: 'mohit@example.com',  rating: 5, occasion: 'Engagement · October 2024',         comment: 'Our engagement function was handled so professionally. The garden setup was beautiful, guests loved the food, and the staff was attentive throughout.', isApproved: true, isFeatured: false, isActive: true },
    { name: 'Deepika Joshi',  email: 'deepika@example.com',rating: 4, occasion: 'Tourist Stay · September 2024',    comment: 'Perfect base for Maheshwar and Omkareshwar. Clean rooms, hot water, good food. The hotel helped arrange an auto for sightseeing. Very helpful team.', isApproved: true, isFeatured: false, isActive: true },
  ]);
  console.log('⭐ Reviews seeded');

  // ── Offers ──────────────────────────────────────────────────────────────
  await Offer.insertMany([
    {
      title: 'Early Bird Discount', code: 'EARLY10', type: 'percentage',
      value: 10, minAmount: 2000, maxDiscount: 500, applicableTo: 'room',
      isActive: true,
    },
    {
      title: 'Wedding Special', code: 'WEDDING5', type: 'percentage',
      value: 5, minAmount: 50000, maxDiscount: 5000, applicableTo: 'event',
      isActive: true,
    },
    {
      title: '₹500 Off First Booking', code: 'WELCOME500', type: 'fixed',
      value: 500, minAmount: 2500, applicableTo: 'room',
      isActive: true,
    },
  ]);
  console.log('🏷  Offers seeded');

  console.log('\n✅ Seed complete!');
  console.log(`\n🔑 Admin Login:`);
  console.log(`   Email:    ${process.env.ADMIN_EMAIL || 'admin@yashrajpalace.com'}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@YP2025'}`);
  console.log(`\n🌐 URLs:`);
  console.log(`   Frontend: http://localhost:5173`);
  console.log(`   Backend:  http://localhost:5000`);
  console.log(`   Admin:    http://localhost:5173/admin\n`);

  mongoose.disconnect();
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
