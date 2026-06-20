import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { eventsAPI } from '../utils/api'
import { useRazorpay } from '../hooks/useRazorpay'
import toast from 'react-hot-toast'
import { FiCheck, FiCalendar, FiUsers } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useSiteSettings } from '../context/SiteSettingsContext'

const EVENT_TYPES = ['wedding','reception','engagement','birthday','anniversary','corporate','family','cultural']
const ADD_ONS_LIST = [
  { name: 'Premium Floral Decor', price: 15000, unit: 'flat' },
  { name: 'DJ + Sound System', price: 12000, unit: 'night' },
  { name: 'Professional Photography', price: 20000, unit: 'day' },
  { name: 'Bride & Groom Makeup', price: 8000, unit: 'flat' },
  { name: 'Mehendi Artist', price: 5000, unit: 'flat' },
  { name: 'Horse/Buggy for Baraat', price: 10000, unit: 'flat' },
  { name: 'Guest Rooms (per room)', price: 2500, unit: 'night' },
  { name: 'Live Dhol', price: 3000, unit: 'flat' },
]

export default function EventBookPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const { initiatePayment } = useRazorpay()
  const { phone, phoneHref, waHref } = useSiteSettings()

  const [step, setStep]       = useState(1)
  const [packages, setPackages] = useState([])
  const [dateAvail, setDateAvail] = useState(null)
  const [checking, setChecking]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [booking, setBooking]       = useState(null)

  const [form, setForm] = useState({
    eventType:    sp.get('type') || 'wedding',
    eventDate:    sp.get('date') ? new Date(sp.get('date')) : null,
    guestCount:   sp.get('guests') || '',
    packageId:    '',
    selectedAddOns: [],
    name:         '', email: '', phone: '', altPhone: '',
    address:      '', decorTheme: '', cateringRequired: true,
    roomsRequired: 0, specialRequirements: '',
  })

  useEffect(() => {
    eventsAPI.getPackages({ category: form.eventType })
      .then(r => setPackages(r.data.packages))
      .catch(() => {})
  }, [form.eventType])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const checkDate = async () => {
    if (!form.eventDate) { toast.error('Select an event date first'); return }
    setChecking(true)
    try {
      const { data } = await eventsAPI.checkDate({ date: form.eventDate.toISOString() })
      setDateAvail(data.available)
      if (data.available) toast.success('Date is available!')
      else toast.error('This date is already booked. Please choose another.')
    } catch { toast.error('Could not check availability') }
    setChecking(false)
  }

  const toggleAddOn = (addon) => {
    const exists = form.selectedAddOns.find(a => a.name === addon.name)
    if (exists) set('selectedAddOns', form.selectedAddOns.filter(a => a.name !== addon.name))
    else set('selectedAddOns', [...form.selectedAddOns, { ...addon, quantity: 1 }])
  }

  const selPkg = packages.find(p => p._id === form.packageId)
  const addOnsTotal = form.selectedAddOns.reduce((s, a) => s + a.price, 0)
  const pkgPrice    = selPkg?.price || 0
  const subtotal    = pkgPrice + addOnsTotal
  const taxes       = Math.round(subtotal * 0.12)
  const total       = subtotal + taxes
  const token       = 10000

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Please fill all contact details'); return }
    if (!form.eventDate) { toast.error('Please select event date'); return }
    if (!form.guestCount) { toast.error('Please enter expected guest count'); return }
    setSubmitting(true)
    try {
      const { data } = await eventsAPI.book({
        packageId:  form.packageId || undefined,
        eventType:  form.eventType,
        contactDetails: { name: form.name, email: form.email, phone: form.phone, altPhone: form.altPhone, address: form.address },
        eventDetails: {
          eventDate: form.eventDate.toISOString(),
          guestCount: parseInt(form.guestCount),
          decorTheme: form.decorTheme,
          cateringRequired: form.cateringRequired,
          roomsRequired: parseInt(form.roomsRequired),
          specialRequirements: form.specialRequirements,
        },
        selectedAddOns: form.selectedAddOns,
      })
      setBooking(data.booking)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    }
    setSubmitting(false)
  }

  const handleTokenPayment = async () => {
    if (!booking) return
    // Cache booking in sessionStorage so confirmation page can display without extra API call
    sessionStorage.setItem(`booking_${booking.bookingId}`, JSON.stringify(booking))
    await initiatePayment({
      // amount is NOT passed — backend computes from booking record (security fix)
      bookingId: booking.bookingId, bookingType: 'event',
      guestName: form.name, guestEmail: form.email, guestPhone: form.phone,
      onSuccess: () => navigate(`/booking-confirmation/${booking.bookingId}`),
    })
  }

  return (
    <>
      <Helmet>
        <title>Book Event / Wedding – Yashraj Palace | Maheshwar</title>
        <meta name="description" content="Book wedding garden, banquet hall and event venue at Yashraj Palace near Maheshwar. Capacity 1000+. Fill inquiry form — team calls within 2 hours." />
      </Helmet>

      <div className="page-hero">
        <div className="absolute inset-0 hero-pattern" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <p className="section-eyebrow text-gold">Book Your Event</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white mb-4">Reserve the Venue</h1>
          <p className="text-white/65 max-w-lg mx-auto">Fill in your event details. Our team will call you within 2 hours to confirm availability and finalise your booking.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {['Event Details','Contact & Add-Ons','Confirm & Pay'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-maroon text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span className={`text-sm hidden md:block ${step === i+1 ? 'text-maroon font-semibold' : 'text-charcoal-muted'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Event Details */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-5">Event Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Event Type *</label>
                    <select className="input-field" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Expected Guest Count *</label>
                    <input type="number" className="input-field" placeholder="e.g. 300" value={form.guestCount} onChange={e => set('guestCount', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Event Date *</label>
                    <div className="flex gap-3">
                      <DatePicker
                        selected={form.eventDate}
                        onChange={d => { set('eventDate', d); setDateAvail(null) }}
                        minDate={new Date()}
                        placeholderText="Select date"
                        className="input-field flex-1"
                      />
                      <button onClick={checkDate} disabled={checking} className="btn-outline text-sm px-4 whitespace-nowrap disabled:opacity-50">
                        {checking ? '...' : 'Check Date'}
                      </button>
                    </div>
                    {dateAvail === true  && <p className="text-green-600 text-xs mt-1.5 font-medium">✓ This date is available!</p>}
                    {dateAvail === false && <p className="text-red-500 text-xs mt-1.5 font-medium">✗ This date is already booked. Please choose another.</p>}
                  </div>
                  <div>
                    <label className="label">Decoration Theme</label>
                    <input className="input-field" placeholder="e.g. Royal, Floral, Modern" value={form.decorTheme} onChange={e => set('decorTheme', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Rooms Required for Guests</label>
                    <select className="input-field" value={form.roomsRequired} onChange={e => set('roomsRequired', e.target.value)}>
                      {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===0?'(None)':'room'}{n>1?'s':''}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.cateringRequired} onChange={e => set('cateringRequired', e.target.checked)} className="w-4 h-4 accent-maroon" />
                      <span className="text-sm font-medium text-charcoal">Include In-House Catering</span>
                    </label>
                    <p className="text-xs text-charcoal-muted mt-1 ml-7">Our team will discuss the menu and per-plate pricing with you.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Special Requirements</label>
                    <textarea className="input-field resize-none" rows={3} placeholder="Any special arrangements, accessibility needs, cultural requirements..." value={form.specialRequirements} onChange={e => set('specialRequirements', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Package selection */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-2">Select a Package <span className="text-sm font-sans text-charcoal-muted font-normal">(Optional)</span></h2>
                <p className="text-sm text-charcoal-muted mb-5">Choose a package or leave blank to request a custom quote.</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-maroon/30 transition-colors">
                    <input type="radio" name="pkg" value="" checked={!form.packageId} onChange={() => set('packageId', '')} className="accent-maroon" />
                    <div>
                      <div className="font-semibold text-sm">Custom / No Package</div>
                      <div className="text-xs text-charcoal-muted">Our team will prepare a quote based on your requirements</div>
                    </div>
                  </label>
                  {packages.length > 0 ? packages.map(p => (
                    <label key={p._id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.packageId === p._id ? 'border-maroon bg-maroon/5' : 'border-gray-100 hover:border-maroon/30'}`}>
                      <input type="radio" name="pkg" value={p._id} checked={form.packageId === p._id} onChange={() => set('packageId', p._id)} className="accent-maroon mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="font-semibold text-sm">{p.name} {p.badge && <span className="badge bg-gold text-charcoal ml-2 text-xs">{p.badge}</span>}</div>
                          <div className="font-serif text-maroon font-semibold">₹{p.price?.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="text-xs text-charcoal-muted mt-0.5">Up to {p.capacity?.max} guests · {p.duration} day{p.duration>1?'s':''}</div>
                      </div>
                    </label>
                  )) : (
                    /* Static fallback packages */
                    [
                      { _id: 'silver', name: 'Silver Celebration', price: 45000, capacity: { max: 200 }, duration: 1 },
                      { _id: 'royal',  name: 'Royal Wedding', price: 180000, capacity: { max: 600 }, duration: 1, badge: 'Popular' },
                      { _id: 'grand',  name: 'Grand Palace', price: 450000, capacity: { max: 1000 }, duration: 2 },
                    ].map(p => (
                      <label key={p._id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.packageId === p._id ? 'border-maroon bg-maroon/5' : 'border-gray-100 hover:border-maroon/30'}`}>
                        <input type="radio" name="pkg" value={p._id} checked={form.packageId === p._id} onChange={() => set('packageId', p._id)} className="accent-maroon mt-0.5" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-semibold text-sm">{p.name} {p.badge && <span className="badge bg-gold text-charcoal ml-2">{p.badge}</span>}</div>
                            <div className="font-serif text-maroon font-semibold">₹{p.price.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="text-xs text-charcoal-muted mt-0.5">Up to {p.capacity.max} guests · {p.duration} day{p.duration>1?'s':''}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="btn-primary w-full py-3.5 text-sm">
                Continue to Contact Details →
              </button>
            </div>

            {/* Right sidebar info */}
            <div className="space-y-4">
              <div className="bg-maroon rounded-xl p-5 text-white">
                <div className="font-serif text-lg font-semibold mb-3">Why Book Direct?</div>
                {['Best prices — no agent commission','Dedicated event coordinator assigned','Custom packages available','WhatsApp updates at every step','Token of just ₹10,000 to confirm'].map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-white/75 mb-2">
                    <FiCheck className="text-gold shrink-0 mt-0.5" size={13} /> {f}
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="font-semibold text-charcoal mb-3">Need Help?</div>
                <a href={waHref} className="btn-whatsapp w-full justify-center text-sm mb-2"><FaWhatsapp size={16}/> WhatsApp Us</a>
                <a href={phoneHref} className="btn-outline w-full text-center text-sm py-2.5">📞 {phone}</a>
                <p className="text-xs text-charcoal-muted text-center mt-2">Available 9 AM – 10 PM daily</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Contact + Add-ons */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-5">Your Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input-field" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" className="input-field" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input className="input-field" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Alternate Phone</label>
                    <input className="input-field" placeholder="Optional" value={form.altPhone} onChange={e => set('altPhone', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Address / City</label>
                    <input className="input-field" placeholder="Your city or address" value={form.address} onChange={e => set('address', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-2">Optional Add-Ons</h2>
                <p className="text-sm text-charcoal-muted mb-5">Select any additional services you'd like included.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ADD_ONS_LIST.map(a => {
                    const sel = form.selectedAddOns.find(x => x.name === a.name)
                    return (
                      <label key={a.name} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${sel ? 'border-maroon bg-maroon/5' : 'border-gray-100 hover:border-maroon/20'}`}>
                        <input type="checkbox" checked={!!sel} onChange={() => toggleAddOn(a)} className="accent-maroon shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-charcoal">{a.name}</div>
                          <div className="text-xs text-charcoal-muted">₹{a.price.toLocaleString('en-IN')} / {a.unit}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline text-sm px-5">← Back</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-3 text-sm disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Inquiry →'}
                </button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-24">
                <h3 className="font-semibold text-charcoal mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-charcoal-muted">Event Type</span><span className="capitalize font-medium">{form.eventType}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-muted">Date</span><span>{form.eventDate?.toDateString() || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-muted">Guests</span><span>{form.guestCount || '—'}</span></div>
                  {selPkg && <div className="flex justify-between"><span className="text-charcoal-muted">Package</span><span className="font-medium">{selPkg.name}</span></div>}
                  {pkgPrice > 0 && <div className="flex justify-between"><span className="text-charcoal-muted">Package Price</span><span>₹{pkgPrice.toLocaleString('en-IN')}</span></div>}
                  {addOnsTotal > 0 && <div className="flex justify-between"><span className="text-charcoal-muted">Add-Ons</span><span>₹{addOnsTotal.toLocaleString('en-IN')}</span></div>}
                  {subtotal > 0 && <>
                    <div className="flex justify-between"><span className="text-charcoal-muted">Taxes (12%)</span><span>₹{taxes.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100 text-maroon">
                      <span>Estimated Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </>}
                  <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-xs text-charcoal-muted mt-3">
                    Token to confirm: <strong className="text-maroon">₹10,000</strong>. Balance on event day.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation + Payment */}
        {step === 3 && booking && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎊</div>
              <h2 className="font-serif text-2xl font-semibold mb-2">Inquiry Received!</h2>
              <p className="text-charcoal-muted mb-1">Booking ID: <span className="font-mono font-bold text-maroon">{booking.bookingId}</span></p>
              <p className="text-sm text-charcoal-muted mb-6">Our event team will call you at <strong>{form.phone}</strong> within 2 hours.</p>

              <div className="bg-ivory-dark rounded-xl p-4 text-left space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-charcoal-muted">Event</span><span className="capitalize font-medium">{booking.eventType}</span></div>
                <div className="flex justify-between"><span className="text-charcoal-muted">Date</span><span>{new Date(booking.eventDetails?.eventDate).toDateString()}</span></div>
                <div className="flex justify-between"><span className="text-charcoal-muted">Guests</span><span>{booking.eventDetails?.guestCount}</span></div>
                {booking.pricing?.totalEstimate > 0 && (
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-maroon">
                    <span>Estimated Total</span><span>₹{booking.pricing.totalEstimate.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-charcoal-muted mb-4">Pay <strong>₹10,000 token</strong> now to confirm and block this date.</p>
              <button onClick={handleTokenPayment} className="btn-gold w-full py-3.5 text-sm font-bold mb-3">
                Pay ₹10,000 Token via Razorpay →
              </button>
              <button onClick={() => navigate(`/booking-confirmation/${booking.bookingId}`)} className="text-xs text-charcoal-muted hover:text-maroon underline">
                I'll pay later — show my inquiry details
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
