const cron = require('node-cron');
const RoomBooking = require('../models/RoomBooking');
const EventBooking = require('../models/EventBooking');
const { Offer } = require('../models/index');

const PENDING_BOOKING_TIMEOUT_MINS = 20;

// Every 5 minutes — cancel unpaid pending room bookings older than the timeout
const expireUnpaidRoomBookings = cron.schedule('*/5 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - PENDING_BOOKING_TIMEOUT_MINS * 60 * 1000);

    // Capture promo codes BEFORE cancellation so we can restore usage counts
    const withPromo = await RoomBooking.find({
      status: 'pending', paymentStatus: 'unpaid', createdAt: { $lt: cutoff },
      promoCode: { $exists: true, $ne: null },
    }).select('promoCode').lean();

    const result = await RoomBooking.updateMany(
      { status: 'pending', paymentStatus: 'unpaid', createdAt: { $lt: cutoff } },
      {
        $set: {
          status: 'cancelled',
          cancellationReason: `Payment not received within ${PENDING_BOOKING_TIMEOUT_MINS} minutes — auto-cancelled`,
          cancelledAt: new Date(),
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Cron: auto-cancelled ${result.modifiedCount} unpaid room booking(s)`);

      // Restore promo code usage counts for cancelled bookings
      if (withPromo.length > 0) {
        const codeMap = {};
        withPromo.forEach(b => {
          if (b.promoCode) codeMap[b.promoCode] = (codeMap[b.promoCode] || 0) + 1;
        });
        for (const [code, count] of Object.entries(codeMap)) {
          await Offer.findOneAndUpdate({ code }, { $inc: { usedCount: -count } });
        }
        console.log(`⏰ Cron: restored promo usage for ${Object.keys(codeMap).length} code(s)`);
      }
    }
  } catch (err) {
    console.error('Cron error (expire room bookings):', err.message);
  }
}, { scheduled: false });

// Every hour — expire provisional event holds (quote_sent older than 72 hours with no payment)
// Uses dedicated quoteSentAt field instead of updatedAt to avoid timer resets on admin edits
const expireEventQuoteHolds = cron.schedule('0 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const result = await EventBooking.updateMany(
      {
        status: 'quote_sent',
        paymentStatus: 'unpaid',
        quoteSentAt: { $lt: cutoff },
      },
      {
        $set: {
          status: 'cancelled',
          cancellationReason: 'Quote not confirmed within 72 hours — auto-expired',
          cancelledAt: new Date(),
        }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ Cron: auto-expired ${result.modifiedCount} unconfirmed event quote(s)`);
    }
  } catch (err) {
    console.error('Cron error (expire event quotes):', err.message);
  }
}, { scheduled: false });

function startCronJobs() {
  expireUnpaidRoomBookings.start();
  expireEventQuoteHolds.start();
  console.log('⏰ Cron jobs started (booking expiry, event quote expiry)');
}

module.exports = { startCronJobs };
