const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Validate critical env vars at startup
const REQUIRED_ENV = ['JWT_SECRET', 'MONGO_URI'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}
if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.warn('⚠ RAZORPAY_WEBHOOK_SECRET not set — webhook endpoint will reject all requests');
}

const jwt = require('jsonwebtoken');
const socketUtil = require('./utils/socket');
const { startCronJobs } = require('./utils/cron');

const app    = express();
const server = http.createServer(app);

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://yashraj-palace-zbaw.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    if (origin.includes('.replit.dev') || origin.includes('.repl.co')) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// ── Socket.IO ──────────────────────────────────────────────────────────────────
const io = new Server(server, { cors: corsOptions });
socketUtil.init(io);

// Socket.IO: require valid admin/staff JWT before allowing join of admin_room
io.on('connection', (socket) => {
  socket.on('join_admin', ({ token } = {}) => {
    if (!token) return;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (['admin', 'staff'].includes(decoded.role)) {
        socket.join('admin_room');
      }
    } catch {
      // Invalid or expired token — silently ignore, do not join admin_room
    }
  });
  socket.on('leave_admin', () => socket.leave('admin_room'));
});

// Trust proxy — required for Replit + rate limiter
app.set('trust proxy', 1);

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Raw body for Razorpay webhook (must come before json parser) ──────────────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ── General API rate limit (200 req / 15 min) ──────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

// ── CORS + body parsing ────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files (uploads) ─────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/rooms',     require('./routes/roomRoutes'));
app.use('/api/bookings',  require('./routes/bookingRoutes'));
app.use('/api/events',    require('./routes/eventRoutes'));
app.use('/api/packages',  require('./routes/packageRoutes'));
app.use('/api/payments',  require('./routes/paymentRoutes'));
app.use('/api/reviews',   require('./routes/reviewRoutes'));
app.use('/api/gallery',   require('./routes/galleryRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/offers',    require('./routes/offerRoutes'));
app.use('/api/settings',  require('./routes/settingsRoutes'));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  message: 'Yashraj Palace API running',
  ts: Date.now(),
  env: process.env.NODE_ENV || 'development',
}));

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`[${req.method}] ${req.path} — ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── MongoDB + startup ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startCronJobs(); // Start booking expiry and event quote expiry cron jobs
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };
