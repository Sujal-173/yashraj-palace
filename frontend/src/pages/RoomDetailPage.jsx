import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { roomsAPI, bookingsAPI } from '../utils/api'
import { useRazorpay } from '../hooks/useRazorpay'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiCheck, FiUsers, FiMaximize2, FiStar, FiPhone } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

const STATIC_ROOMS = {
  'deluxe-room':  { _id: 'deluxe', slug: 'deluxe-room',  name: 'Deluxe Room',  type: 'deluxe',  price: 1800, capacity: 2, bedType: 'Queen Bed', size: 280, description: 'A well-appointed room with a queen bed, garden or courtyard view, premium linens, and all essentials for a restful stay. Perfect for couples and solo travellers visiting Maheshwar and the Narmada Ghats.', amenities: ['Free Wi-Fi','AC','LED TV','Hot & Cold Water','24/7 Room Service','Daily Housekeeping','Free Parking','Power Backup'], policies: { checkIn: '12:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 24 hours before check-in', extraBed: 500, breakfastPrice: 250 } },
  'premium-room': { _id: 'premium', slug: 'premium-room', name: 'Premium Room', type: 'premium', price: 2500, capacity: 2, bedType: 'King Bed',  size: 380, description: 'Elevated comfort with a king-size bed, a dedicated sitting area, designer bathroom with rainfall shower, and complimentary breakfast. Ideal for a special stay or romantic getaway near Maheshwar Fort.', amenities: ['Free Wi-Fi','AC','LED TV','Hot & Cold Water','Breakfast Included','Mini Fridge','24/7 Room Service','Daily Housekeeping','Free Parking','Power Backup'], policies: { checkIn: '12:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 48 hours before check-in', extraBed: 600, breakfastPrice: 0 } },
  'family-suite': { _id: 'suite',   slug: 'family-suite', name: 'Family Suite', type: 'suite',   price: 3800, capacity: 4, bedType: 'Twin Beds', size: 560, description: 'Spacious and warm — a separate living area, two beds, and thoughtful touches that make family stays truly memorable. The suite comfortably fits a family of four with extra space for children.', amenities: ['Free Wi-Fi','AC','LED TV','Hot & Cold Water','Living Room','Mini Kitchen','Mini Fridge','24/7 Room Service','Daily Housekeeping','Free Parking','Power Backup'], policies: { checkIn: '12:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 48 hours before check-in', extraBed: 700, breakfastPrice: 250 } },
}

export default function RoomDetailPage() {
  const { slug }          = useParams()
  const [searchParams]    = useSearchParams()
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const { initiatePayment } = useRazorpay()

  const [room, setRoom]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [checkIn, setCheckIn]   = useState(searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null)
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : null)
  const [guests, setGuests]     = useState({ adults: parseInt(searchParams.get('guests')) || 2, children: 0 })
  const [addOns, setAddOns]     = useState([])
  const [unavailDates, setUnavailDates] = useState([])
  const [step, setStep]         = useState(1) // 1=details, 2=guest info, 3=payment
  const [guestInfo, setGuestInfo] = useState({ name: user?.name||'', email: user?.email||'', phone: user?.phone||'', specialRequests: '' })
  const [booking, setBooking]   = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [promoCode, setPromoCode]   = useState('')
  const [discount, setDiscount]     = useState(0)
  const [extraBreakfast, setExtraBreakfast] = useState(false)
  const [extraBed, setExtraBed]             = useState(false)

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const { data } = await roomsAPI.getBySlug(slug)
        setRoom(data.room)
        const dates = await roomsAPI.getUnavailableDates(data.room._id)
        setUnavailDates(dates.data.unavailableDates.map(d => new Date(d)))
      } catch {
        // Use static fallback
        const staticRoom = STATIC_ROOMS[slug]
        if (staticRoom) setRoom(staticRoom)
        else navigate('/rooms')
      }
      setLoading(false)
    }
    loadRoom()
  }, [slug])

  const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / 86400000) : 0
  const roomTotal = nights * (room?.discountedPrice || room?.price || 0)
  const addOnsTotal = addOns.reduce((s, a) => s + a.price, 0)
  const breakfastCost = extraBreakfast ? (room?.policies?.breakfastPrice || 250) * guests.adults * nights : 0
  const extraBedCost  = extraBed ? (room?.policies?.extraBed || 500) * nights : 0
  const subtotal = roomTotal + addOnsTotal + breakfastCost + extraBedCost
  const taxes    = Math.round(subtotal * 0.12)
  const total    = subtotal + taxes - discount
  const advance  = Math.round(total * 0.3)

  const handleGuestInfoChange = e => setGuestInfo(p => ({ ...p, [e.target.name]: e.target.value }))

  const proceedToStep2 = () => {
    if (!checkIn || !checkOut) { toast.error('Please select check-in and check-out dates'); return }
    if (nights < 1) { toast.error('Check-out must be after check-in'); return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const proceedToPayment = async () => {
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      toast.error('Please fill in all required guest details'); return
    }
    setSubmitting(true)
    try {
      const addOnsPayload = []
      if (extraBreakfast) addOnsPayload.push({ name: 'Breakfast', price: breakfastCost, quantity: guests.adults })
      if (extraBed) addOnsPayload.push({ name: 'Extra Bed', price: extraBedCost, quantity: 1 })

      const { data } = await bookingsAPI.create({
        roomId: room._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
        guestDetails: { name: guestInfo.name, email: guestInfo.email, phone: guestInfo.phone },
        addOns: addOnsPayload,
        specialRequests: guestInfo.specialRequests,
      })
      setBooking(data.booking)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    }
    setSubmitting(false)
  }

  const handlePayment = async () => {
    if (!booking) return
    // Cache booking in sessionStorage so confirmation page can display without extra API call
    sessionStorage.setItem(`booking_${booking.bookingId}`, JSON.stringify(booking))
    await initiatePayment({
      // amount is NOT passed — backend computes from booking record (security fix)
      bookingId: booking.bookingId,
      bookingType: 'room',
      guestName: guestInfo.name,
      guestEmail: guestInfo.email,
      guestPhone: guestInfo.phone,
      onSuccess: () => navigate(`/booking-confirmation/${booking.bookingId}`),
      onFailure: () => {},
    })
  }

  if (loading) return <div className="flex justify-center py-40"><div className="spinner" /></div>
  if (!room)   return <div className="text-center py-40 text-charcoal-muted">Room not found</div>

  return (
    <>
      <Helmet>
        <title>{room.name} – Yashraj Palace | {room.price.toLocaleString('en-IN')}/night</title>
        <meta name="description" content={`${room.name} at Yashraj Palace near Maheshwar. ${room.description?.slice(0,140)}`} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-ivory-dark border-b border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto text-sm text-charcoal-muted">
          <a href="/" className="hover:text-maroon">Home</a> / <a href="/rooms" className="hover:text-maroon">Rooms</a> / <span className="text-charcoal">{room.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Room info */}
          <div className="lg:col-span-2">
            {/* Image placeholder */}
            <div className="h-72 md:h-96 bg-gradient-to-br from-ivory-dark to-[#D5C8B8] rounded-xl flex items-center justify-center mb-6 relative">
              <span className="text-8xl opacity-10">🏨</span>
              <div className="absolute top-4 left-4 badge bg-maroon text-white capitalize">{room.type}</div>
              {room.discountedPrice && (
                <div className="absolute top-4 right-4 badge bg-green-500 text-white">
                  {Math.round(((room.price - room.discountedPrice) / room.price) * 100)}% OFF
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl font-semibold mb-2">{room.name}</h1>
            <div className="flex flex-wrap gap-5 text-sm text-charcoal-muted mb-5">
              <span className="flex items-center gap-1"><FiUsers size={14} /> {room.capacity} Guests</span>
              <span>🛏 {room.bedType}</span>
              {room.size && <span><FiMaximize2 size={14} className="inline mr-1" />{room.size} sq ft</span>}
              <span className="flex items-center gap-1"><FiStar size={14} className="text-gold" /> 4.8 (120+ reviews)</span>
            </div>

            <p className="text-charcoal-muted leading-relaxed mb-8">{room.description}</p>

            {/* Amenities */}
            <h2 className="font-serif text-xl font-semibold mb-4">Room Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
              {(room.amenities || []).map(a => (
                <div key={a} className="flex items-center gap-2 text-sm text-charcoal-muted bg-ivory-dark rounded-lg px-3 py-2">
                  <FiCheck size={13} className="text-gold shrink-0" /> {a}
                </div>
              ))}
            </div>

            {/* Policies */}
            <h2 className="font-serif text-xl font-semibold mb-4">Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {[
                ['Check-In', room.policies?.checkIn || '12:00 PM'],
                ['Check-Out', room.policies?.checkOut || '11:00 AM'],
                ['Cancellation', room.policies?.cancellation || 'Free up to 24 hrs'],
                ['Extra Bed', `₹${room.policies?.extraBed || 500}/night`],
                ['Breakfast', room.policies?.breakfastPrice === 0 ? 'Included' : `₹${room.policies?.breakfastPrice || 250}/person`],
                ['Pets', 'Not allowed'],
              ].map(([k,v]) => (
                <div key={k} className="flex gap-2 text-sm">
                  <span className="font-semibold text-charcoal w-28 shrink-0">{k}:</span>
                  <span className="text-charcoal-muted">{v}</span>
                </div>
              ))}
            </div>

            {/* Need help */}
            <div className="bg-maroon/5 border border-maroon/15 rounded-xl p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <div className="font-semibold text-charcoal mb-1">Need help booking?</div>
                <div className="text-sm text-charcoal-muted">Our team is available 9 AM – 10 PM daily</div>
              </div>
              <div className="flex gap-2">
                <a href="tel:+917000000000" className="btn-outline text-xs px-4 py-2 flex items-center gap-1"><FiPhone size={13}/> Call Us</a>
                <a href="https://wa.me/917000000000" className="btn-whatsapp text-xs px-4 py-2"><FaWhatsapp size={14}/> WhatsApp</a>
              </div>
            </div>
          </div>

          {/* Right: Booking widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-24">
              {/* Step indicator */}
              <div className="flex items-center gap-1 mb-5">
                {['Select Dates','Guest Info','Payment'].map((s,i) => (
                  <div key={s} className="flex-1 flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-maroon text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {step > i+1 ? '✓' : i+1}
                    </div>
                    <span className={`text-xs truncate ${step === i+1 ? 'text-maroon font-semibold' : 'text-gray-400'}`}>{s}</span>
                    {i < 2 && <div className="flex-1 h-px bg-gray-100" />}
                  </div>
                ))}
              </div>

              {/* STEP 1: Dates */}
              {step === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Check-In</label>
                      <DatePicker selected={checkIn} onChange={setCheckIn} minDate={new Date()} excludeDates={unavailDates} placeholderText="Date" className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="label">Check-Out</label>
                      <DatePicker selected={checkOut} onChange={setCheckOut} minDate={checkIn || new Date()} excludeDates={unavailDates} placeholderText="Date" className="input-field text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Adults</label>
                      <select className="input-field text-sm" value={guests.adults} onChange={e => setGuests(p => ({...p, adults: +e.target.value}))}>
                        {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Children</label>
                      <select className="input-field text-sm" value={guests.children} onChange={e => setGuests(p => ({...p, children: +e.target.value}))}>
                        {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Add-ons */}
                  {nights > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Add-Ons</p>
                      {room.policies?.breakfastPrice !== 0 && (
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-charcoal-muted">Breakfast (+₹{room.policies?.breakfastPrice || 250}/person/night)</span>
                          <input type="checkbox" checked={extraBreakfast} onChange={e => setExtraBreakfast(e.target.checked)} className="rounded" />
                        </label>
                      )}
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-charcoal-muted">Extra Bed (+₹{room.policies?.extraBed || 500}/night)</span>
                        <input type="checkbox" checked={extraBed} onChange={e => setExtraBed(e.target.checked)} className="rounded" />
                      </label>
                    </div>
                  )}

                  {/* Price summary */}
                  {nights > 0 && (
                    <div className="bg-ivory-dark rounded-lg p-3 space-y-1.5 text-sm">
                      <div className="flex justify-between text-charcoal-muted">
                        <span>₹{(room.discountedPrice || room.price).toLocaleString('en-IN')} × {nights} night{nights>1?'s':''}</span>
                        <span>₹{roomTotal.toLocaleString('en-IN')}</span>
                      </div>
                      {breakfastCost > 0 && <div className="flex justify-between text-charcoal-muted"><span>Breakfast</span><span>₹{breakfastCost.toLocaleString('en-IN')}</span></div>}
                      {extraBedCost > 0 && <div className="flex justify-between text-charcoal-muted"><span>Extra Bed</span><span>₹{extraBedCost.toLocaleString('en-IN')}</span></div>}
                      <div className="flex justify-between text-charcoal-muted"><span>Taxes (12%)</span><span>₹{taxes.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between font-bold text-charcoal pt-1 border-t border-gray-200">
                        <span>Total</span><span className="text-maroon">₹{total.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-xs text-green-600 font-medium">30% advance: ₹{advance.toLocaleString('en-IN')}</div>
                    </div>
                  )}

                  <button onClick={proceedToStep2} className="btn-primary w-full py-3 text-sm">
                    {nights > 0 ? `Continue to Book (₹${advance.toLocaleString('en-IN')} advance)` : 'Select Dates to Continue'}
                  </button>
                  <p className="text-xs text-center text-charcoal-muted">✓ Free cancellation · Secure payment</p>
                </div>
              )}

              {/* STEP 2: Guest info */}
              {step === 2 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-charcoal mb-3">Guest Details</h3>
                  <div>
                    <label className="label">Full Name *</label>
                    <input name="name" value={guestInfo.name} onChange={handleGuestInfoChange} placeholder="As on ID proof" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input name="email" type="email" value={guestInfo.email} onChange={handleGuestInfoChange} placeholder="Confirmation sent here" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input name="phone" value={guestInfo.phone} onChange={handleGuestInfoChange} placeholder="+91 XXXXX XXXXX" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="label">Special Requests</label>
                    <textarea name="specialRequests" value={guestInfo.specialRequests} onChange={handleGuestInfoChange} placeholder="Room preferences, dietary needs, etc." rows={3} className="input-field text-sm resize-none" />
                  </div>
                  <div className="bg-ivory-dark rounded-lg p-3 text-sm">
                    <div className="flex justify-between font-bold text-charcoal">
                      <span>Advance to Pay</span>
                      <span className="text-maroon">₹{advance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-charcoal-muted mt-1">Balance ₹{(total-advance).toLocaleString('en-IN')} due at check-in</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(1)} className="btn-outline text-sm px-4 py-2.5">Back</button>
                    <button onClick={proceedToPayment} disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
                      {submitting ? 'Processing...' : 'Proceed to Payment →'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && booking && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <h3 className="font-semibold text-charcoal">Booking Created!</h3>
                    <p className="text-sm text-charcoal-muted">ID: <span className="font-mono font-bold text-maroon">{booking.bookingId}</span></p>
                  </div>
                  <div className="bg-ivory-dark rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-charcoal-muted">Room</span><span className="font-medium">{room.name}</span></div>
                    <div className="flex justify-between"><span className="text-charcoal-muted">Check-In</span><span>{checkIn?.toDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-charcoal-muted">Check-Out</span><span>{checkOut?.toDateString()}</span></div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-200"><span>Advance Due</span><span className="text-maroon">₹{advance.toLocaleString('en-IN')}</span></div>
                  </div>
                  <button onClick={handlePayment} className="btn-gold w-full py-3.5 text-sm font-bold">
                    Pay ₹{advance.toLocaleString('en-IN')} via Razorpay →
                  </button>
                  <p className="text-xs text-center text-charcoal-muted">256-bit SSL secured · UPI, Cards, NetBanking accepted</p>
                  <button onClick={() => navigate(`/booking-confirmation/${booking.bookingId}`)} className="text-xs text-center w-full text-charcoal-muted hover:text-maroon underline">
                    Pay later / Pay at hotel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
