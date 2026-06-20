const cron = require('node-cron');
const RoomBooking = require('../models/RoomBooking');
const EventBooking = require('../models/EventBooking');
const { Offer } = require('../models/index');

const PENDING_BOOKING_TIMEOUT_MINS = 20;

// Every 5 minutes — cancel unpaid pending room bookings older than the timeout
const expireUnpaidRoomBookings = cron.schedule('*/5 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - PENDING_BOOKING_TIMEOUT_MINS * 60 * 1000);

    // Step 1: Find the specific booking IDs to expire (locks in which bookings we will cancel)
    const expiredBookings = await RoomBooking.find({
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: { $lt: cutoff },
    }).select('_id promoCode').lean();

    if (expiredBookings.length === 0) return;

    const ids = expiredBookings.map(b => b._id);

    // Step 2: Cancel ONLY those specific IDs — re-check status so we don't cancel a booking
    // that was just paid between Step 1 and Step 2
    const result = await RoomBooking.updateMany(
      { _id: { $in: ids }, status: 'pending', paymentStatus: 'unpaid' },
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

      // Step 3: Find which ones were ACTUALLY cancelled (some may have been paid between steps)
      // so we only restore promos for bookings that are now truly cancelled
      const actuallyCancelled = await RoomBooking.find({
        _id: { $in: ids },
        status: 'cancelled',
        promoCode: { $exists: true, $ne: null },
        cancelledAt: { $gte: new Date(Date.now() - 30 * 1000) }, // cancelled in last 30s
      }).select('promoCode').lean();

      if (actuallyCancelled.length > 0) {
        const codeMap = {};
        actuallyCancelled.forEach(b => {
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
