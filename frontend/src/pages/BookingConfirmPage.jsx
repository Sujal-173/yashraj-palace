import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { bookingsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { FaWhatsapp } from 'react-icons/fa'
import { FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function BookingConfirmPage() {
  const { bookingId }    = useParams()
  const { user }         = useAuth()
  const { phoneHref, waHref } = useSiteSettings()
  const [data, setData]  = useState(null)
  const [loading, setLoading]  = useState(true)
  const [showLookup, setShowLookup] = useState(false)
  const [phone, setPhone]      = useState('')
  const [looking, setLooking]  = useState(false)

  useEffect(() => {
    // 1. Try sessionStorage first (populated right after booking creation — instant, no extra request)
    const cached = sessionStorage.getItem(`booking_${bookingId}`)
    if (cached) {
      try { setData(JSON.parse(cached)); setLoading(false); return } catch {}
    }

    // 2. Try API with auth token (logged-in users)
    const loadWithAuth = async () => {
      if (!user) { setLoading(false); setShowLookup(true); return }
      try {
        // Fetch from my bookings list to find by bookingId (auth route uses MongoDB _id)
        const r = await bookingsAPI.getMy()
        const found = r.data.bookings?.find(b => b.bookingId === bookingId)
        if (found) { setData(found) }
        else { setShowLookup(true) }
      } catch {
        setShowLookup(true)
      }
      setLoading(false)
    }
    loadWithAuth()
  }, [bookingId, user])

  const handleGuestLookup = async (e) => {
    e.preventDefault()
    if (!phone.trim()) { toast.error('Enter your phone number'); return }
    setLooking(true)
    try {
      const r = await bookingsAPI.lookup(bookingId, phone.trim())
      setData(r.data.booking)
      setShowLookup(false)
      // Cache for next visit
      sessionStorage.setItem(`booking_${bookingId}`, JSON.stringify(r.data.booking))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking not found. Check your booking ID and phone number.')
    }
    setLooking(false)
  }

  if (loading) return <div className="flex justify-center py-40"><div className="spinner"/></div>

  return (
    <>
      <Helmet><title>Booking {bookingId} – Yashraj Palace</title></Helmet>
      <div className="min-h-screen bg-ivory-dark flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">

          {/* Guest lookup for non-logged-in users */}
          {showLookup && !data && (
            <div className="bg-white p-8 border border-stone-200 shadow-lg mb-4" style={{ borderRadius: 0 }}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔍</div>
                <h2 className="font-serif text-xl font-semibold text-charcoal">Retrieve Your Booking</h2>
                <p className="text-charcoal-muted text-sm mt-1">Enter the phone number used during booking to view details.</p>
              </div>
              <form onSubmit={handleGuestLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Booking ID
                  </label>
                  <input
                    value={bookingId}
                    readOnly
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 font-mono text-maroon"
                    style={{ borderRadius: 0 }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Registered Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-maroon"
                    style={{ borderRadius: 0 }}
                    maxLength={10}
                  />
                </div>
                <button
                  type="submit"
                  disabled={looking}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {looking ? 'Looking up…' : 'Find My Booking →'}
                </button>
              </form>
              <p className="text-center text-xs text-charcoal-muted mt-4">
                Can't find it? <a href={waHref} className="text-maroon font-semibold">WhatsApp us</a>
              </p>
            </div>
          )}

          {/* Booking details */}
          {data && (
            <div className="bg-white p-8 border border-stone-200 shadow-lg text-center mb-4" style={{ borderRadius: 0 }}>
              <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl" style={{ borderRadius: '50%' }}>
                {data.status === 'pending' ? '⏳' : '✅'}
              </div>
              <h1 className="font-serif text-2xl font-semibold text-charcoal mb-1">
                {data.status === 'confirmed' ? 'Booking Confirmed!' : data.status === 'pending' ? 'Payment Pending' : 'Booking ' + data.status}
              </h1>
              <p className="text-charcoal-muted text-xs mb-1">Booking ID</p>
              <p className="font-mono font-bold text-maroon text-lg mb-4">{data.bookingId || bookingId}</p>

              {data.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-4 py-3 mb-4 text-left" style={{ borderRadius: 0 }}>
                  ⏳ Your room is held for 20 minutes. If payment was completed, it will be confirmed shortly.
                </div>
              )}

              <div className="p-4 text-left space-y-2 text-sm mb-6" style={{ background: '#F2EDE4', borderRadius: 0 }}>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Guest</span>
                  <span className="font-medium">{data.guestDetails?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Room</span>
                  <span>{data.room?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Check-In</span>
                  <span>{new Date(data.checkIn).toDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Check-Out</span>
                  <span>{new Date(data.checkOut).toDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Status</span>
                  <span className={`font-semibold ${data.status === 'confirmed' ? 'text-green-600' : data.status === 'cancelled' ? 'text-red-500' : 'text-yellow-600'}`}>
                    {data.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-maroon">₹{data.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                {data.pricing?.advancePaid > 0 && (
                  <div className="flex justify-between text-xs text-charcoal-muted">
                    <span>Advance Paid</span>
                    <span>₹{data.pricing.advancePaid.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {data.pricing?.balanceDue > 0 && (
                  <div className="flex justify-between text-xs text-charcoal-muted">
                    <span>Balance at Check-In</span>
                    <span>₹{data.pricing.balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-charcoal-muted mb-6">
                A confirmation has been sent to your email. Our team will reach you within 2 hours on your registered phone number.
              </p>

              <div className="flex gap-3 justify-center">
                <a href={waHref} className="btn-whatsapp text-sm px-5">
                  <FaWhatsapp size={15}/> WhatsApp Us
                </a>
                <a href={phoneHref} className="btn-outline text-sm px-5 flex items-center gap-1.5">
                  <FiPhone size={14}/> Call
                </a>
              </div>
            </div>
          )}

          <div className="text-center space-y-2">
            <Link to="/" className="text-sm text-charcoal-muted hover:text-maroon block">← Back to Home</Link>
            {user && (
              <Link to="/my-bookings" className="text-sm text-maroon font-semibold hover:underline block">
                View All My Bookings
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
