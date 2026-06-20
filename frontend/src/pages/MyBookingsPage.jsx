import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { bookingsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useSiteSettings } from '../context/SiteSettingsContext'

const STATUS_STYLES = {
  pending:     'bg-yellow-100 text-yellow-700',
  confirmed:   'bg-green-100 text-green-700',
  checked_in:  'bg-blue-100 text-blue-700',
  checked_out: 'bg-gray-100 text-gray-600',
  cancelled:   'bg-red-100 text-red-700',
  no_show:     'bg-red-100 text-red-600',
}

export default function MyBookingsPage() {
  const { user }               = useAuth()
  const { phoneHref, waHref }  = useSiteSettings()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]  = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    bookingsAPI.getMy()
      .then(r => setBookings(r.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id, bookingId) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      await bookingsAPI.cancel(id, { reason: 'Cancelled by guest' })
      setBookings(prev => prev.map(b =>
        b._id === id ? { ...b, status: 'cancelled' } : b
      ))
      toast.success('Booking cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
    setCancelling(null)
  }

  const nights = (b) => b.checkIn && b.checkOut
    ? Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000) : 0

  return (
    <>
      <Helmet><title>My Bookings – Yashraj Palace</title></Helmet>
      <div className="min-h-screen bg-ivory-dark py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-charcoal">My Bookings</h1>
              <p className="text-charcoal-muted text-sm mt-1">Welcome back, {user?.name}</p>
            </div>
            <Link to="/rooms" className="btn-primary text-sm px-5">Book a Room</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-16 text-center border border-stone-200" style={{ borderRadius: 0 }}>
              <div className="text-6xl mb-4">🏨</div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-2">No bookings yet</h2>
              <p className="text-charcoal-muted mb-6">Plan your stay or event at Yashraj Palace.</p>
              <div className="flex justify-center gap-3">
                <Link to="/rooms" className="btn-primary text-sm px-6">Browse Rooms</Link>
                <Link to="/events/book" className="btn-outline text-sm px-6">Book an Event</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b._id} className="bg-white border border-stone-200 overflow-hidden flex flex-col md:flex-row" style={{ borderRadius: 0 }}>
                  <div className="md:w-48 h-32 md:h-auto bg-gradient-to-br from-ivory-dark to-[#D5C8B8] flex items-center justify-center shrink-0">
                    <span className="text-4xl opacity-20">🏨</span>
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-maroon font-bold bg-maroon/5 px-2 py-0.5 rounded">{b.bookingId}</span>
                          <span className={`badge text-xs ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'}`}>
                            {b.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-charcoal">{b.room?.name || 'Room'}</h3>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-xl font-semibold text-maroon">
                          ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-charcoal-muted">{nights(b)} night{nights(b) !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <div className="text-xs text-charcoal-muted">Check-In</div>
                        <div className="text-sm font-medium">{new Date(b.checkIn).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                      </div>
                      <div>
                        <div className="text-xs text-charcoal-muted">Check-Out</div>
                        <div className="text-sm font-medium">{new Date(b.checkOut).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                      </div>
                      <div>
                        <div className="text-xs text-charcoal-muted">Guests</div>
                        <div className="text-sm font-medium">{(b.guests?.adults || 1) + (b.guests?.children || 0)} guests</div>
                      </div>
                      <div>
                        <div className="text-xs text-charcoal-muted">Payment</div>
                        <div className="text-sm font-medium capitalize">{b.paymentStatus || 'unpaid'}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-charcoal-muted">
                        Booked {new Date(b.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      <div className="flex gap-3">
                        <Link to={`/booking-confirmation/${b.bookingId}`} className="text-xs text-maroon font-semibold hover:underline">
                          View Details →
                        </Link>
                        {['pending', 'confirmed'].includes(b.status) && (
                          <button
                            onClick={() => handleCancel(b._id, b.bookingId)}
                            disabled={cancelling === b._id}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            {cancelling === b._id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-maroon/5 border border-maroon/15 p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderRadius: 0 }}>
            <div>
              <div className="font-semibold text-charcoal text-sm">Need help with a booking?</div>
              <div className="text-xs text-charcoal-muted mt-0.5">Call or WhatsApp — 9 AM to 10 PM daily</div>
            </div>
            <div className="flex gap-2">
              <a href={phoneHref} className="btn-outline text-xs px-4 py-2">📞 Call</a>
              <a href={waHref} className="btn-whatsapp text-xs px-4 py-2">💬 WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
