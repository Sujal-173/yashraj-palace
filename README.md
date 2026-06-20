# Yashraj Palace — Hotel & Wedding Venue Website

A full-stack MERN production website for **Yashraj Palace**, a premium hotel, wedding garden and event venue near Maheshwar and Mandleshwar, Madhya Pradesh.

---

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS              |
| Backend  | Node.js, Express.js                       |
| Database | MongoDB with Mongoose                     |
| Payment  | Razorpay (UPI, Cards, NetBanking)         |
| Email    | Nodemailer (Gmail SMTP)                   |
| Auth     | JWT (JSON Web Tokens) + bcryptjs          |
| Deploy   | Frontend → Vercel · Backend → Railway/Render |

---

## Project Structure

```
yashraj-palace/
├── backend/
│   ├── controllers/        # Business logic
│   ├── middleware/         # JWT auth, error handling
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── utils/              # Email service
│   ├── seed.js             # Database seeder
│   ├── server.js           # Express entry point
│   └── .env.example        # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, Admin components
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # useRazorpay
│   │   ├── pages/          # All pages
│   │   │   └── admin/      # Admin panel pages
│   │   ├── styles/         # Tailwind CSS
│   │   └── utils/          # API service layer
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── package.json            # Root scripts
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourrepo/yashraj-palace.git
cd yashraj-palace
npm run install-all
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

Required `.env` values:
```
MONGO_URI=mongodb://localhost:27017/yashraj_palace
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_hotel@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Seed the database

```bash
cd backend
npm run seed
# or: node seed.js
```

This creates:
- Admin user (credentials from .env)
- 3 rooms (Deluxe, Premium, Family Suite)
- 6 event packages
- 6 sample reviews
- 3 promo offers

### 4. Run development

```bash
# From root — runs both frontend and backend
npm run dev

# Or separately:
npm run server   # Backend on :5000
npm run client   # Frontend on :5173
```

### 5. Access

| URL                              | Description          |
|----------------------------------|----------------------|
| http://localhost:5173            | Public website       |
| http://localhost:5173/admin      | Admin panel          |
| http://localhost:5000/api/health | Backend health check |

**Admin login:** Use credentials from your `.env` file
- Default: `admin@yashrajpalace.com` / `Admin@YP2025`

---

## API Endpoints

### Auth
```
POST /api/auth/register      Register user
POST /api/auth/login         Login
GET  /api/auth/me            Get profile (protected)
PUT  /api/auth/profile       Update profile (protected)
```

### Rooms
```
GET  /api/rooms                    List all rooms
GET  /api/rooms/:slug              Get room detail
POST /api/rooms/check-availability Check availability
GET  /api/rooms/:id/unavailable-dates  Blocked dates
POST /api/rooms                    Create room (admin)
PUT  /api/rooms/:id                Update room (admin)
DELETE /api/rooms/:id              Deactivate room (admin)
```

### Bookings
```
POST /api/bookings                 Create booking
GET  /api/bookings/my              User's bookings (auth)
GET  /api/bookings/:id             Get booking
PUT  /api/bookings/:id/cancel      Cancel booking
GET  /api/bookings/admin/all       All bookings (admin)
PUT  /api/bookings/admin/:id/status Update status (admin)
```

### Events
```
POST /api/events/book              Create event inquiry
POST /api/events/check-date        Check date availability
GET  /api/packages                 List packages
GET  /api/packages/:slug           Get package
GET  /api/events/admin/all         All event bookings (admin)
PUT  /api/events/admin/:id/status  Update status (admin)
```

### Payments
```
POST /api/payments/create-order    Create Razorpay order
POST /api/payments/verify          Verify payment signature
POST /api/payments/webhook         Razorpay webhook
```

### Other
```
GET  /api/reviews                  Public reviews
POST /api/reviews                  Submit review
GET  /api/gallery                  Gallery images
POST /api/inquiries                Contact inquiry
GET  /api/offers                   Active offers
POST /api/offers/validate          Validate promo code
GET  /api/admin/dashboard          Dashboard stats (admin)
```

---

## Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys → Generate Test Key
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`
4. For production, switch to live keys

---

## Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail
2. Go to Google Account → Security → App Passwords
3. Generate an app password for "Mail"
4. Use that password as `EMAIL_PASS` in `.env`

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Or connect GitHub repo to Vercel
```

Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend-url.railway.app
```

Update `vite.config.js` proxy for production.

### Backend → Railway / Render

1. Push to GitHub
2. Connect repo to Railway or Render
3. Add all `.env` variables in the platform dashboard
4. Deploy

### MongoDB → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist your server IP
3. Replace `MONGO_URI` with Atlas connection string

---

## SEO Pages

Eight local SEO landing pages are included:

| URL                                   | Target Keyword                    |
|---------------------------------------|-----------------------------------|
| /hotel-in-maheshwar                   | Hotel in Maheshwar                |
| /hotel-in-mandleshwar                 | Hotel in Mandleshwar              |
| /wedding-garden-in-maheshwar          | Wedding garden Maheshwar          |
| /marriage-garden-in-mandleshwar       | Marriage garden Mandleshwar       |
| /hotel-near-maheshwar-fort            | Hotel near Maheshwar Fort         |
| /hotel-near-narmada-ghat              | Hotel near Narmada Ghat           |
| /event-venue-in-maheshwar             | Event venue Maheshwar             |
| /luxury-hotel-in-khargone             | Luxury hotel Khargone             |

---

## Admin Panel

Located at `/admin` (requires admin login).

| Section        | Features                                    |
|----------------|---------------------------------------------|
| Dashboard      | Revenue, bookings count, recent activity    |
| Room Bookings  | View, search, filter, update status         |
| Event Bookings | View inquiries, update status, add notes    |
| Rooms          | Add/edit/deactivate rooms with pricing      |
| Packages       | Manage event packages and inclusions        |
| Gallery        | Upload/manage gallery images by category   |
| Reviews        | Approve, feature, or remove reviews        |
| Inquiries      | View contact form submissions, mark status  |
| Offers         | Create/manage promo codes                   |
| Settings       | Hotel info, policies, payment config        |

---

## Brand Colors

```css
--maroon:       #6B1A2B   (primary)
--maroon-dark:  #4A0F1D   (dark variant)
--gold:         #C9A84C   (accent)
--gold-light:   #E8C97A   (light accent)
--ivory:        #FAF7F2   (background)
--charcoal:     #1C1C1E   (text)
```

Fonts: **Playfair Display** (headings) + **Inter** (body)

---

## Contact

**Yashraj Palace**
Near Mandleshwar, Khargone District, Madhya Pradesh – 451221
📞 +91 70000 00000
💬 WhatsApp: wa.me/917000000000
✉ info@yashrajpalace.com
