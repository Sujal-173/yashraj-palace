const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
const WA_NUMBER   = process.env.WHATSAPP_NUMBER || '918827039565';
const CONTACT_PHONE = process.env.CONTACT_PHONE || `+${WA_NUMBER}`;
const WA_LINK     = `https://wa.me/${WA_NUMBER}`;

// Escape user-supplied strings before inserting into HTML
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const HEADER = `
  <div style="background:#6B1A2B;padding:24px;text-align:center">
    <h1 style="color:#C9A84C;margin:0;font-size:22px;letter-spacing:2px">YASHRAJ PALACE</h1>
    <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px">Hotel · Wedding Garden · Events · Mandleshwar</p>
  </div>`;

const FOOTER = `
  <div style="background:#F2EDE4;padding:16px;text-align:center">
    <p style="margin:0;color:#8A8480;font-size:12px">© ${new Date().getFullYear()} Yashraj Palace · Near Mandleshwar, Khargone, Madhya Pradesh</p>
    <p style="margin:4px 0 0;color:#8A8480;font-size:11px">📞 ${CONTACT_PHONE} · 💬 <a href="${WA_LINK}" style="color:#6B1A2B">WhatsApp</a></p>
  </div>`;

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !process.env.EMAIL_USER) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Yashraj Palace <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✉ Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

// ─── GUEST: Booking Received (before payment) ────────────────────────────────
const sendBookingReceived = async (booking) => {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">Booking Received — Payment Pending ⏳</h2>
      <p style="color:#4A4A4F">Dear <strong>${esc(booking.guestDetails.name)}</strong>,</p>
      <p style="color:#4A4A4F">Your booking request has been received. Please complete the advance payment to confirm your room.</p>
      <div style="background:#FFF3CD;border:1px solid #FFC107;border-radius:6px;padding:14px;margin:16px 0">
        <p style="margin:0;color:#856404;font-weight:bold">⚠ Your room is held for 20 minutes. Complete payment to confirm.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B;width:40%">Booking ID</td><td style="padding:10px">${esc(booking.bookingId)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Room</td><td style="padding:10px">${esc(booking.room?.name || 'N/A')}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-In</td><td style="padding:10px">${new Date(booking.checkIn).toDateString()}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-Out</td><td style="padding:10px">${new Date(booking.checkOut).toDateString()}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Total Amount</td><td style="padding:10px">₹${booking.pricing.totalAmount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Advance to Pay</td><td style="padding:10px;color:#6B1A2B;font-weight:bold">₹${booking.pricing.advancePaid.toLocaleString('en-IN')}</td></tr>
      </table>
      <p style="color:#4A4A4F;font-size:13px">Balance of ₹${booking.pricing.balanceDue.toLocaleString('en-IN')} will be collected at check-in.</p>
      <div style="background:#FFF9EE;border:1px solid #C9A84C;border-radius:6px;padding:14px;margin:20px 0">
        <p style="margin:0;color:#6B1A2B;font-weight:bold">📍 Yashraj Palace</p>
        <p style="margin:4px 0 0;color:#4A4A4F;font-size:14px">Near Mandleshwar, Khargone, Madhya Pradesh</p>
        <p style="margin:4px 0 0;color:#4A4A4F;font-size:14px">📞 ${CONTACT_PHONE}</p>
      </div>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: booking.guestDetails.email, subject: `Booking Received [${booking.bookingId}] — Complete Payment | Yashraj Palace`, html });
};

// ─── GUEST: Booking Confirmed (after payment) ────────────────────────────────
const sendBookingConfirmation = async (booking) => {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">Booking Confirmed ✅</h2>
      <p style="color:#4A4A4F">Dear <strong>${esc(booking.guestDetails.name)}</strong>,</p>
      <p style="color:#4A4A4F">Your advance payment has been received and your room at Yashraj Palace is confirmed. We look forward to welcoming you!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B;width:40%">Booking ID</td><td style="padding:10px">${esc(booking.bookingId)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Room</td><td style="padding:10px">${esc(booking.room?.name || 'N/A')}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-In</td><td style="padding:10px">${new Date(booking.checkIn).toDateString()}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-Out</td><td style="padding:10px">${new Date(booking.checkOut).toDateString()}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-In Time</td><td style="padding:10px">12:00 PM onwards</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-Out Time</td><td style="padding:10px">11:00 AM</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Total Amount</td><td style="padding:10px">₹${booking.pricing.totalAmount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Advance Paid</td><td style="padding:10px">₹${booking.pricing.advancePaid.toLocaleString('en-IN')}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Balance at Check-In</td><td style="padding:10px">₹${booking.pricing.balanceDue.toLocaleString('en-IN')}</td></tr>
      </table>
      <div style="background:#FFF9EE;border:1px solid #C9A84C;border-radius:6px;padding:14px;margin:20px 0">
        <p style="margin:0;color:#6B1A2B;font-weight:bold">📍 Yashraj Palace</p>
        <p style="margin:4px 0 0;color:#4A4A4F;font-size:14px">Near Mandleshwar, Khargone District, Madhya Pradesh</p>
        <p style="margin:4px 0 0;color:#4A4A4F;font-size:14px">📞 ${CONTACT_PHONE} · 💬 <a href="${WA_LINK}" style="color:#6B1A2B">WhatsApp</a></p>
      </div>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: booking.guestDetails.email, subject: `Booking Confirmed ✅ [${booking.bookingId}] | Yashraj Palace`, html });
};

// ─── GUEST: Event Inquiry Received ──────────────────────────────────────────
const sendEventInquiryConfirmation = async (booking) => {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">Event Inquiry Received 🎊</h2>
      <p style="color:#4A4A4F">Dear <strong>${esc(booking.contactDetails.name)}</strong>,</p>
      <p style="color:#4A4A4F">Thank you for your event inquiry at Yashraj Palace. Our team will call you within 2 hours to discuss your requirements and share a custom quote.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B;width:40%">Inquiry ID</td><td style="padding:10px">${esc(booking.bookingId)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Event Type</td><td style="padding:10px">${esc(booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1))}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Event Date</td><td style="padding:10px">${new Date(booking.eventDetails.eventDate).toDateString()}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Guest Count</td><td style="padding:10px">${booking.eventDetails.guestCount}</td></tr>
        ${booking.pricing.totalEstimate ? `<tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Estimated Cost</td><td style="padding:10px">₹${booking.pricing.totalEstimate.toLocaleString('en-IN')}</td></tr>` : ''}
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Token to Confirm</td><td style="padding:10px">₹${(booking.pricing?.tokenAmount || 10000).toLocaleString('en-IN')}</td></tr>
      </table>
      <div style="background:#FFF9EE;border:1px solid #C9A84C;border-radius:6px;padding:14px;margin:20px 0">
        <p style="margin:0;font-weight:bold;color:#6B1A2B">Our team will reach out on: ${esc(booking.contactDetails.phone)}</p>
        <p style="margin:6px 0 0;color:#4A4A4F;font-size:14px">Or WhatsApp us now: <a href="${WA_LINK}" style="color:#6B1A2B">${WA_LINK}</a></p>
      </div>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: booking.contactDetails.email, subject: `Event Inquiry Received [${booking.bookingId}] | Yashraj Palace`, html });
};

// ─── GUEST: Refund Notification ──────────────────────────────────────────────
const sendRefundNotification = async (booking, refundAmount, reason) => {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">Refund Processed 💚</h2>
      <p style="color:#4A4A4F">Dear <strong>${esc(booking.guestDetails.name)}</strong>,</p>
      <p style="color:#4A4A4F">Your refund has been processed successfully. The amount will be credited to your original payment method within 5–7 business days.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B;width:40%">Booking ID</td><td style="padding:10px">${esc(booking.bookingId)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Room</td><td style="padding:10px">${esc(booking.room?.name || 'N/A')}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Refund Amount</td><td style="padding:10px;color:#1a7a1a;font-weight:bold">₹${Number(refundAmount).toLocaleString('en-IN')}</td></tr>
        ${reason ? `<tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Reason</td><td style="padding:10px">${esc(reason)}</td></tr>` : ''}
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Credit Timeline</td><td style="padding:10px">5–7 business days</td></tr>
      </table>
      <p style="color:#4A4A4F;font-size:13px">For any questions, please WhatsApp or call us. We hope to host you again at Yashraj Palace.</p>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: booking.guestDetails.email, subject: `Refund Processed [${booking.bookingId}] | Yashraj Palace`, html });
};

// ─── ADMIN: New Booking Alert ─────────────────────────────────────────────────
const sendAdminNewBookingAlert = async (booking) => {
  if (!ADMIN_EMAIL) return;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">🏨 New Room Booking</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B;width:40%">Booking ID</td><td style="padding:10px">${esc(booking.bookingId)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Guest</td><td style="padding:10px">${esc(booking.guestDetails?.name)}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Phone</td><td style="padding:10px">${esc(booking.guestDetails?.phone)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Room</td><td style="padding:10px">${esc(booking.room?.name || 'N/A')}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-In</td><td style="padding:10px">${new Date(booking.checkIn).toDateString()}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Check-Out</td><td style="padding:10px">${new Date(booking.checkOut).toDateString()}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Total</td><td style="padding:10px;color:#6B1A2B;font-weight:bold">₹${booking.pricing?.totalAmount?.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Status</td><td style="padding:10px">Payment Pending</td></tr>
      </table>
      <a href="${process.env.FRONTEND_URL}/admin/bookings" style="display:inline-block;background:#6B1A2B;color:#C9A84C;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:4px;margin-top:8px">View in Admin</a>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: ADMIN_EMAIL, subject: `🏨 New Booking ${booking.bookingId} – ${booking.guestDetails?.name}`, html });
};

// ─── ADMIN: New Event Alert ───────────────────────────────────────────────────
const sendAdminNewEventAlert = async (booking) => {
  if (!ADMIN_EMAIL) return;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">🎊 New Event Inquiry</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B;width:40%">Inquiry ID</td><td style="padding:10px">${esc(booking.bookingId)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Contact</td><td style="padding:10px">${esc(booking.contactDetails?.name)}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Phone</td><td style="padding:10px">${esc(booking.contactDetails?.phone)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Event Type</td><td style="padding:10px;text-transform:capitalize">${esc(booking.eventType)}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Event Date</td><td style="padding:10px">${new Date(booking.eventDetails?.eventDate).toDateString()}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Guests</td><td style="padding:10px">${booking.eventDetails?.guestCount}</td></tr>
        ${booking.pricing?.totalEstimate ? `<tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Est. Value</td><td style="padding:10px;color:#6B1A2B;font-weight:bold">₹${booking.pricing.totalEstimate.toLocaleString('en-IN')}</td></tr>` : ''}
      </table>
      <a href="${process.env.FRONTEND_URL}/admin/event-bookings" style="display:inline-block;background:#6B1A2B;color:#C9A84C;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:4px;margin-top:8px">View in Admin</a>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: ADMIN_EMAIL, subject: `🎊 New Event Inquiry ${booking.bookingId} – ${booking.contactDetails?.name}`, html });
};

// ─── ADMIN: Contact Inquiry Alert ────────────────────────────────────────────
const sendAdminNewInquiryAlert = async (inquiry) => {
  if (!ADMIN_EMAIL) return;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">📩 New Contact Inquiry</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B;width:40%">Name</td><td style="padding:10px">${esc(inquiry.name)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Phone</td><td style="padding:10px">${esc(inquiry.phone)}</td></tr>
        <tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Email</td><td style="padding:10px">${esc(inquiry.email)}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Type</td><td style="padding:10px;text-transform:capitalize">${esc(inquiry.inquiryType || 'general')}</td></tr>
        ${inquiry.subject ? `<tr style="background:#FAF7F2"><td style="padding:10px;font-weight:bold;color:#6B1A2B">Subject</td><td style="padding:10px">${esc(inquiry.subject)}</td></tr>` : ''}
        <tr><td style="padding:10px;font-weight:bold;color:#6B1A2B">Message</td><td style="padding:10px">${esc(inquiry.message)}</td></tr>
      </table>
      <a href="${process.env.FRONTEND_URL}/admin/inquiries" style="display:inline-block;background:#6B1A2B;color:#C9A84C;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:4px;margin-top:8px">View in Admin</a>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: ADMIN_EMAIL, subject: `📩 New Inquiry from ${inquiry.name} – ${inquiry.inquiryType || 'General'}`, html });
};

// ─── Password Reset Email ─────────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    ${HEADER}
    <div style="padding:28px">
      <h2 style="color:#1C1C1E;margin-top:0">Password Reset Request 🔒</h2>
      <p style="color:#4A4A4F">Dear <strong>${esc(user.name)}</strong>,</p>
      <p style="color:#4A4A4F">You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <div style="text-align:center;margin:28px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#6B1A2B;color:#C9A84C;padding:14px 32px;text-decoration:none;font-weight:bold;border-radius:4px;font-size:16px">Reset My Password</a>
      </div>
      <p style="color:#8A8480;font-size:13px">If you did not request this, please ignore this email. Your password will not change.</p>
    </div>
    ${FOOTER}
  </div>`;
  await sendEmail({ to: user.email, subject: 'Password Reset | Yashraj Palace', html });
};

module.exports = {
  sendEmail,
  sendBookingReceived,
  sendBookingConfirmation,
  sendEventInquiryConfirmation,
  sendRefundNotification,
  sendAdminNewBookingAlert,
  sendAdminNewEventAlert,
  sendAdminNewInquiryAlert,
  sendPasswordResetEmail,
};
