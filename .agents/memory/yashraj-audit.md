---
name: Yashraj Palace audit fixes
description: Decisions and patterns applied during the Phase 1–7 security/logic audit so future edits stay consistent.
---

## Patterns established

**Why:** Full audit applied in one session; future edits must not revert these.

**How to apply:** Before touching any of the listed files, check the decision below first.

### Regex escaping
All free-text MongoDB `$regex` queries use `escapeRegex()` (defined at top of each controller).
Files: `bookingController.js`, `eventController.js`, `miscControllers.js`.

### Advance percent
`bookingController.createBooking` reads `advancePercent` from `Settings` collection (not hardcoded 0.3).
Fallback: `settings?.advancePercent || 30`.

### Promo restore on cancel
`bookingController.cancelBooking` decrements `Offer.usedCount` when a booking with a promo is cancelled.
`cron.js` also restores promos for auto-cancelled bookings using ID-scoped updateMany (race-safe).

### Settings singleton
`Settings` model has `_singleton: 1` field with unique index — prevents duplicate documents.
All reads use `Settings.findOne({})`.

### Socket.io admin room
Server verifies JWT in `join_admin` event before adding socket to `admin_room`.
Client (`SocketContext.jsx`) passes `localStorage.getItem('yp_token')` as `{ token }` payload.

### Token key
Frontend stores JWT under `localStorage` key `yp_token`.

### Rate limits applied
- `POST /api/bookings/` — 10/15min
- `POST /api/events/book` — 10/15min
- `POST /api/events/check-date` — 30/5min
- `POST /api/reviews/` — 5/hr
- `POST /api/inquiries/` — 5/15min

### Static room fallback removed
`RoomDetailPage.jsx` no longer has a `STATIC_ROOMS` constant. On API error it shows a toast and redirects to `/rooms`.

### Database seed required
No users exist in a fresh DB. Run `cd backend && npm run seed` to create admin/staff/user accounts before testing login.
