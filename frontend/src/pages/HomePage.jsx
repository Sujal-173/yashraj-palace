import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaWhatsapp } from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  Calendar, Users, Star, ChevronDown, Check, ArrowRight, Quote,
  Plus, Minus, Crown, MapPin, Heart, Utensils, ShieldCheck, Music,
  Phone, Gift
} from 'lucide-react'
import toast from 'react-hot-toast'

const ROOM_TYPES = [
  { slug: 'deluxe-room',  name: 'Deluxe Room',  price: 1800, capacity: 2, bed: 'Queen Bed', size: '280 sq ft', imgClass: 'room-img-deluxe' },
  { slug: 'premium-room', name: 'Premium Room', price: 2500, capacity: 2, bed: 'King Bed',  size: '380 sq ft', imgClass: 'room-img-premium' },
  { slug: 'family-suite', name: 'Family Suite', price: 3800, capacity: 4, bed: '2 Beds',    size: '560 sq ft', imgClass: 'room-img-suite' },
]

const WHY_ITEMS = [
  { icon: <Crown size={24} />,      title: 'Heritage Architecture', desc: 'Inspired by traditional Indian havelis with intricate carvings and stately pillars.' },
  { icon: <MapPin size={24} />,     title: 'Prime Location',        desc: 'Conveniently located near Maheshwar Fort, easily accessible for all your guests.' },
  { icon: <Utensils size={24} />,   title: 'Culinary Excellence',   desc: 'Our chefs prepare exquisite pure-vegetarian delicacies for every occasion.' },
  { icon: <ShieldCheck size={24} />,title: 'Impeccable Service',    desc: 'Warm Indian hospitality where every guest is treated like royalty, every time.' },
  { icon: <Users size={24} />,      title: 'Vast Spaces',           desc: 'Grand lawns and AC banquet halls for any gathering — 50 to 1,000+ guests.' },
  { icon: <Heart size={24} />,      title: 'Custom Packages',       desc: 'Tailor-made solutions for your specific event requirements and budget.' },
]

const PACKAGES = [
  {
    name: 'Silver Celebration', capacity: '200 guests · 6 hrs', price: '₹45,000',
    note: 'Venue + basic setup · Catering extra', featured: false,
    features: ['Banquet hall access', 'Basic floral decoration', 'Sound system & mic', 'Parking for 40 vehicles', '1 coordination staff'],
  },
  {
    name: 'Royal Wedding', capacity: '600 guests · Full day', price: '₹1,80,000',
    note: 'Venue + full decor + 300-plate catering', featured: true, badge: 'Most Popular',
    features: ['Full garden + hall access', 'Premium floral & mandap decor', 'DJ, lighting & sound', '300-plate in-house catering', '4 rooms for family', 'Dedicated wedding coordinator'],
  },
  {
    name: 'Grand Palace', capacity: '1000 guests · 2 days', price: '₹4,50,000',
    note: 'All-inclusive · Custom quote available', featured: false,
    features: ['Full property — garden + hall + lawn', 'Custom stage & luxury decor', 'Unlimited catering, live counters', '10 rooms for 2 nights', '2-day event team'],
  },
]

const REVIEWS = [
  { name: 'Ramesh Verma',   initials: 'RV', rating: 5, occasion: 'Wedding Reception · March 2025', text: "We hosted my daughter's wedding reception here. The garden was beautifully lit, food was excellent, and the coordination team handled everything flawlessly. Highly recommended." },
  { name: 'Priya Sharma',   initials: 'PS', rating: 5, occasion: 'Room Stay · January 2025',        text: 'Stayed 3 nights while visiting Maheshwar. The room was spotless, staff were incredibly warm, and the food genuinely tasty. This place has a real character to it.' },
  { name: 'Ankit Kulkarni', initials: 'AK', rating: 4, occasion: 'Corporate Event · Nov 2024',      text: 'We held our annual function here for 300 people. Great AV setup, good parking, and catering was well organised. Will return for our next event without hesitation.' },
]

const EVENT_TYPES = [
  { icon: '💍', name: 'Wedding',        sub: 'Full ceremony & reception' },
  { icon: '🎊', name: 'Reception',      sub: 'Grand receptions, 1000 guests' },
  { icon: '💛', name: 'Engagement',     sub: 'Intimate to mid-size' },
  { icon: '🎂', name: 'Birthday',       sub: 'Theme setups & catering' },
  { icon: '🏢', name: 'Corporate',      sub: 'Conferences & off-sites' },
  { icon: '🥂', name: 'Anniversary',    sub: 'Milestone celebrations' },
  { icon: '🏠', name: 'Family Function',sub: 'Griha pravesh, puja & more' },
  { icon: '🎭', name: 'Cultural',       sub: 'Stage shows & gatherings' },
]

const FAQS = [
  { q: 'Where is Yashraj Palace located?', a: 'Yashraj Palace is located near Mandleshwar in the Khargone District of Madhya Pradesh — approximately 12 km from Maheshwar Fort, 14 km from the Narmada Ghats, and 2 km from Mandleshwar town. Easily accessible from Indore (90 km) and Bhopal (230 km) by road.' },
  { q: 'What is the capacity of your wedding garden?', a: 'Our grand wedding lawn can comfortably accommodate up to 1,000+ guests, making it ideal for large weddings and receptions. We also have AC banquet halls for intimate ceremonies of 100–300 guests.' },
  { q: 'What are the room rates at Yashraj Palace?', a: 'Rooms start at ₹1,800 per night for the Deluxe Room. The Premium Room is ₹2,500/night (King Bed, complimentary breakfast) and the Family Suite is ₹3,800/night (2 beds, up to 4 guests). All prices are + applicable taxes.' },
  { q: 'Do you provide in-house catering?', a: 'Yes. Our in-house culinary team provides a 250+ dish menu covering regional MP cuisine, North Indian, and continental options. For events we offer live counters (chaat, desserts, tandoor) and full buffet setups.' },
  { q: 'Can we bring our own decorators?', a: 'While we have our own empanelled premium decorators who understand the venue best, you are welcome to bring your own decorators subject to management approval and venue guidelines.' },
  { q: 'Are rooms included in wedding packages?', a: 'Our Royal Wedding package includes 4 complimentary rooms (1 night) and the Grand Palace package includes 10 rooms (2 nights). Additional rooms can be booked at a special discounted tariff for your guests.' },
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}
const REVIEW_SCHEMA = {
  '@context': 'https://schema.org', '@type': 'Hotel', name: 'Yashraj Palace',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '200', bestRating: '5' },
}

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-5">
      <span className="h-px bg-gold/60 w-14" />
      <Crown size={14} className="text-gold" />
      <span className="h-px bg-gold/60 w-14" />
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [tab, setTab]               = useState('room')
  const [checkIn, setCheckIn]       = useState(null)
  const [checkOut, setCheckOut]     = useState(null)
  const [roomType, setRoomType]     = useState('')
  const [guests, setGuests]         = useState('2')
  const [eventType, setEventType]   = useState('wedding')
  const [eventDate, setEventDate]   = useState(null)
  const [guestCount, setGuestCount] = useState('')
  const [openFaq, setOpenFaq]       = useState(0)

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal()
  const r4 = useReveal(), r5 = useReveal(), r6 = useReveal()
  const r7 = useReveal(), r8 = useReveal()

  const handleCheckAvailability = () => {
    if (tab === 'room') {
      if (!checkIn || !checkOut) { toast.error('Please select check-in and check-out dates'); return }
      navigate(`/rooms?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&guests=${guests}${roomType ? `&type=${roomType}` : ''}`)
    } else {
      if (!eventDate) { toast.error('Please select your event date'); return }
      navigate(`/events/book?type=${eventType}&date=${eventDate.toISOString()}&guests=${guestCount}`)
    }
  }

  return (
    <>
      <Helmet>
        <title>Yashraj Palace – Hotel, Wedding Garden &amp; Events | Maheshwar | Mandleshwar</title>
        <meta name="description" content="Premium hotel, wedding garden and event venue near Maheshwar and Mandleshwar, MP. Book rooms from ₹1,800/night. Wedding garden for 1,000+ guests. In-house catering, free parking. Call +91 70000 00000." />
        <link rel="canonical" href="https://www.yashrajpalace.com/" />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(REVIEW_SCHEMA)}</script>
      </Helmet>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#1A0709' }}>

        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d142104d?q=80&w=2000&auto=format&fit=crop')", opacity: 0.18 }} />

        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,7,9,0.98) 0%, rgba(107,26,43,0.82) 50%, rgba(26,7,9,0.9) 100%)' }} />

        {/* Diagonal gold pattern */}
        <div className="absolute inset-0 hero-pattern pointer-events-none" style={{ opacity: 0.06 }} />

        {/* Gold line accents */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #C9A84C 70%, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #C9A84C 70%, transparent)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* ── Left: Headline ── */}
            <div className="w-full lg:w-[52%] text-white animate-fade-in-up">

              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px bg-gold/60 w-8" />
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Welcome to Royalty</span>
                <span className="h-px bg-gold/60 w-8" />
              </div>

              {/* Headline */}
              <h1 className="font-serif font-bold leading-[1.12] mb-6"
                style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)' }}>
                A Palace for Grand Stays &amp; Grander Celebrations
              </h1>

              <p className="text-white/65 leading-relaxed mb-8 max-w-xl"
                style={{ fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)' }}>
                Timeless elegance meets modern luxury at Maheshwar's premier estate — near Mandleshwar, Madhya Pradesh.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/book-room" className="btn-gold btn-lg text-[0.625rem]">
                  Explore Rooms
                </Link>
                <Link to="/events/book?type=wedding" className="btn-outline-gold btn-lg text-[0.625rem]">
                  Plan a Wedding
                </Link>
                <a href="https://wa.me/917000000000" className="btn-whatsapp btn-lg text-[0.625rem]">
                  <FaWhatsapp size={14} /> WhatsApp
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-white/10 max-w-sm">
                {[['500+','Events'],['4.8★','Rating'],['1000','Max Guests'],['20+','Years']].map(([n,l]) => (
                  <div key={l} className="text-center">
                    <div className="font-serif text-gold font-bold text-lg">{n}</div>
                    <div className="text-white/45 text-[9px] uppercase tracking-widest mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Booking Widget ── */}
            <div className="w-full lg:w-[44%] max-w-md w-full mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
              <div className="bg-[#FAF7F2] shadow-2xl" style={{ border: '1px solid rgba(201,168,76,0.25)' }}>

                {/* Widget header */}
                <div className="text-center px-7 pt-7 pb-4">
                  <p className="eyebrow">Reserve Your Stay</p>
                  <h2 className="font-serif text-xl text-maroon font-semibold">Check Availability</h2>
                  <GoldDivider />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-200 mx-7 mb-6">
                  {[['room','Room Stay'],['event','Wedding / Event']].map(([v,l]) => (
                    <button key={v} onClick={() => setTab(v)}
                      className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all border-b-2 ${
                        tab === v ? 'border-maroon text-maroon' : 'border-transparent text-stone-400 hover:text-stone-600'
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>

                <div className="px-7 pb-7 space-y-5">
                  {tab === 'room' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Check-In',  val: checkIn,  set: setCheckIn,  min: new Date() },
                          { label: 'Check-Out', val: checkOut, set: setCheckOut, min: checkIn || new Date() },
                        ].map(f => (
                          <div key={f.label}>
                            <label className="label">{f.label}</label>
                            <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
                              <Calendar size={14} className="text-gold shrink-0" />
                              <DatePicker selected={f.val} onChange={f.set} minDate={f.min}
                                placeholderText="Select date" className="w-full bg-transparent outline-none text-sm text-stone-700" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="label">Guests</label>
                        <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
                          <Users size={14} className="text-gold shrink-0" />
                          <select className="w-full bg-transparent outline-none text-sm text-stone-700 appearance-none"
                            value={guests} onChange={e => setGuests(e.target.value)}>
                            {['1','2','3','4','5','6+'].map(g => <option key={g} value={g}>{g} Guest{g!=='1'?'s':''}</option>)}
                          </select>
                          <ChevronDown size={13} className="text-stone-400 shrink-0" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Room Type</label>
                        <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
                          <Heart size={14} className="text-gold shrink-0" />
                          <select className="w-full bg-transparent outline-none text-sm text-stone-700 appearance-none"
                            value={roomType} onChange={e => setRoomType(e.target.value)}>
                            <option value="">Any Room</option>
                            <option value="deluxe">Deluxe Room (₹1,800)</option>
                            <option value="premium">Premium Room (₹2,500)</option>
                            <option value="suite">Family Suite (₹3,800)</option>
                          </select>
                          <ChevronDown size={13} className="text-stone-400 shrink-0" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="label">Event Type</label>
                        <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
                          <Gift size={14} className="text-gold shrink-0" />
                          <select className="w-full bg-transparent outline-none text-sm text-stone-700 appearance-none"
                            value={eventType} onChange={e => setEventType(e.target.value)}>
                            {['wedding','reception','engagement','birthday','anniversary','corporate','family','cultural'].map(t => (
                              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="text-stone-400 shrink-0" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Event Date</label>
                          <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
                            <Calendar size={14} className="text-gold shrink-0" />
                            <DatePicker selected={eventDate} onChange={setEventDate} minDate={new Date()}
                              placeholderText="Select date" className="w-full bg-transparent outline-none text-sm text-stone-700" />
                          </div>
                        </div>
                        <div>
                          <label className="label">Guest Count</label>
                          <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
                            <Users size={14} className="text-gold shrink-0" />
                            <input type="number" placeholder="No. of guests"
                              className="w-full bg-transparent outline-none text-sm text-stone-700"
                              value={guestCount} onChange={e => setGuestCount(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <button onClick={handleCheckAvailability}
                    className="btn-primary w-full py-4 justify-center mt-2">
                    Check Availability <ArrowRight size={14} />
                  </button>
                  <p className="text-center text-[10px] text-stone-400 tracking-wide">Free cancellation · Instant confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float hide-mobile">
          <span className="text-white/30 text-[9px] uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown size={16} className="text-white/30" />
        </div>
      </section>

      {/* ══ TRUST BAR ═════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-6 md:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 md:gap-8">
            {[
              { icon: <Star size={18} className="text-gold" fill="#C9A84C" />, val: '4.8 / 5',   sub: 'Guest Rating' },
              { icon: <Users size={18} className="text-gold" />,               val: '1,000+',    sub: 'Wedding Capacity' },
              { icon: <Music size={18} className="text-gold" />,               val: '500+',      sub: 'Events Hosted' },
              { icon: <Utensils size={18} className="text-gold" />,            val: 'Pure Veg',  sub: 'Royal Dining' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 border border-gold/30 flex items-center justify-center shrink-0 bg-[#FAF7F2]">
                  {t.icon}
                </div>
                <div>
                  <div className="font-serif text-maroon font-semibold text-[0.9375rem] leading-tight">{t.val}</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ROOMS ═════════════════════════════════════════════════════════ */}
      <section ref={r1} className="reveal section-lg bg-[#FAF7F2]">
        <div className="container-palace">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="eyebrow">Accommodation</span>
            <h2 className="section-title text-maroon">Royal Chambers</h2>
            <GoldDivider />
            <p className="text-stone-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Rest in the lap of luxury. Each room crafted with heritage aesthetics and every modern comfort.
            </p>
          </div>

          {/* Room cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {ROOM_TYPES.map(room => (
              <article key={room.slug} className="palace-card group overflow-hidden bg-white">
                {/* Price badge */}
                <div className="absolute top-4 right-4 z-10 bg-maroon text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                  ₹{room.price.toLocaleString('en-IN')}/night
                </div>

                {/* Room image */}
                <div className={`h-52 sm:h-56 ${room.imgClass} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 md:p-7">
                  <h3 className="font-serif text-xl text-maroon mb-1">{room.name}</h3>
                  <div className="flex flex-wrap gap-3 text-[11px] text-stone-500 mb-5 pb-5 border-b border-stone-100">
                    <span className="flex items-center gap-1"><MapPin size={11} className="text-gold" /> {room.size}</span>
                    <span className="flex items-center gap-1"><Users size={11} className="text-gold" /> {room.capacity} Guests</span>
                    <span className="flex items-center gap-1"><Heart size={11} className="text-gold" /> {room.bed}</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-stone-600">
                    {['Complimentary Breakfast','Free Wi-Fi','24/7 Room Service'].map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <Check size={12} className="text-gold shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/rooms/${room.slug}`}
                    className="block w-full text-center btn-outline py-3 text-[10px] group-hover:bg-maroon group-hover:text-white group-hover:border-maroon">
                    View Details &amp; Book
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/rooms" className="btn-primary btn-lg">View All Rooms</Link>
          </div>
        </div>
      </section>

      {/* ══ WEDDING SECTION ═══════════════════════════════════════════════ */}
      <section ref={r2} className="reveal section-lg relative overflow-hidden" style={{ background: '#4A0F1D' }}>
        {/* Dot pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(201,168,76,0.18) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 container-palace">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">

            {/* Image */}
            <div className="w-full lg:w-[45%] shrink-0">
              <div className="relative" style={{ padding: '10px', border: '1px solid rgba(201,168,76,0.35)' }}>
                <span className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-gold" />
                <span className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-gold" />
                <span className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-gold" />
                <span className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-gold" />
                <div className="h-64 sm:h-80 lg:h-[420px] flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(107,26,43,0.6), rgba(26,7,9,0.8))' }}>
                  <div className="text-center">
                    <div className="text-7xl mb-4 animate-float">💍</div>
                    <p className="font-serif text-xl text-gold/80 italic">Wedding Garden</p>
                    <p className="text-white/40 text-sm mt-1">Up to 1,000 Guests</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-[55%] text-white">
              <span className="eyebrow text-gold">Grand Celebrations</span>
              <h2 className="font-serif font-bold text-white leading-tight mb-4"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)' }}>
                The Perfect Setting for Your Royal Wedding
              </h2>
              <div className="gold-divider mb-6" />
              <p className="text-white/65 leading-relaxed mb-8 text-sm md:text-base">
                Our magnificent wedding garden and regal banquet halls provide a breathtaking backdrop for your special day — from intimate ceremonies to grand receptions for 1,000+ guests.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {[
                  { Icon: Users,       title: '1000+ Guests',   sub: 'Sprawling lush lawns' },
                  { Icon: Utensils,    title: 'Royal Catering', sub: 'Authentic veg feasts' },
                  { Icon: ShieldCheck, title: 'Event Planning', sub: 'End-to-end management' },
                  { Icon: Heart,       title: 'Bridal Suites',  sub: 'Dedicated luxury spaces' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
                      <f.Icon size={18} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base text-white leading-tight">{f.title}</h4>
                      <p className="text-white/50 text-xs mt-0.5">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/events/book?type=wedding" className="btn-gold">Book Wedding / Event</Link>
                <Link to="/events/packages" className="btn-outline-gold">View Packages</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ═════════════════════════════════════════════════ */}
      <section ref={r3} className="reveal section-lg bg-white">
        <div className="container-palace">
          <div className="text-center mb-12 md:mb-16">
            <span className="eyebrow">The Yashraj Experience</span>
            <h2 className="section-title text-maroon">Why Choose Us</h2>
            <GoldDivider />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {WHY_ITEMS.map((item, i) => (
              <div key={i} className="group p-6 md:p-8 text-center border border-stone-100 hover:border-gold/40 bg-stone-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-14 h-14 mx-auto border border-gold/30 flex items-center justify-center text-gold mb-5 bg-white group-hover:bg-maroon group-hover:border-maroon group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg text-maroon mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EVENT TYPES ═══════════════════════════════════════════════════ */}
      <section ref={r4} className="reveal section-md" style={{ background: '#FAF7F2', borderTop: '1px solid #E8E0D8' }}>
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Events We Host</span>
            <h2 className="section-title text-maroon">Every Celebration, Perfected</h2>
            <GoldDivider />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {EVENT_TYPES.map(ev => (
              <Link key={ev.name} to={`/events/${ev.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group text-center p-5 md:p-6 bg-white border border-stone-200 hover:border-gold/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <span className="text-3xl md:text-4xl block mb-3">{ev.icon}</span>
                <h4 className="font-serif text-sm md:text-base text-maroon font-semibold mb-1">{ev.name}</h4>
                <p className="text-[11px] text-stone-500 leading-snug">{ev.sub}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:mt-10">
            <Link to="/events" className="btn-primary">Explore All Events</Link>
          </div>
        </div>
      </section>

      {/* ══ PACKAGES ══════════════════════════════════════════════════════ */}
      <section ref={r5} className="reveal section-lg bg-white">
        <div className="container-palace">
          <div className="text-center mb-12 md:mb-16">
            <span className="eyebrow">Packages & Pricing</span>
            <h2 className="section-title text-maroon">Transparent. All-Inclusive. Memorable.</h2>
            <GoldDivider />
            <p className="text-stone-500 max-w-xl mx-auto text-sm">No hidden costs, no surprises — just an unforgettable celebration at a fair price.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {PACKAGES.map(pkg => (
              <div key={pkg.name}
                className={`relative flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  pkg.featured
                    ? 'border-2 border-gold shadow-xl'
                    : 'border border-stone-200 hover:border-gold/40 hover:shadow-lg'
                }`}>
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-maroon text-[10px] font-bold uppercase tracking-wider px-4 py-1 whitespace-nowrap">
                    {pkg.badge}
                  </div>
                )}
                <div className="p-6 md:p-8 flex flex-col flex-1 bg-white">
                  <h3 className="font-serif text-xl text-maroon mb-1">{pkg.name}</h3>
                  <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-5 pb-5 border-b border-stone-100">{pkg.capacity}</p>
                  <div className="font-serif text-3xl md:text-4xl text-maroon font-semibold mb-1">{pkg.price}</div>
                  <p className="text-[11px] text-stone-500 mb-6">{pkg.note}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                        <Check size={13} className="text-gold mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/events/book" className={pkg.featured ? 'btn-primary justify-center' : 'btn-outline justify-center'}>
                    Book This Package
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-12">
            <Link to="/events/packages" className="btn-outline">View All Packages</Link>
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ═══════════════════════════════════════════════════════ */}
      <section ref={r6} className="reveal section-lg" style={{ background: '#1A0709' }}>
        {/* Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(201,168,76,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 container-palace">
          <div className="text-center mb-12 md:mb-16">
            <span className="eyebrow">Guest Stories</span>
            <h2 className="font-serif font-bold text-white" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
              What Our Guests Say
            </h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="#C9A84C" className="text-gold" />)}
              <span className="text-white/50 text-xs ml-2">4.8/5 across 200+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className="glass-card p-6 md:p-8 flex flex-col gap-5">
                <Quote size={24} className="text-gold/50" />
                <p className="text-white/75 text-sm leading-relaxed flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center font-bold text-sm text-maroon" style={{ background: '#C9A84C' }}>
                    {r.initials}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{r.name}</div>
                    <div className="text-white/40 text-[11px]">{r.occasion}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(r.rating)].map((_,j) => <Star key={j} size={11} fill="#C9A84C" className="text-gold" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/reviews" className="btn-outline-gold">Read More Reviews</Link>
          </div>
        </div>
      </section>

      {/* ══ ABOUT STRIP ═══════════════════════════════════════════════════ */}
      <section ref={r7} className="reveal section-md bg-white">
        <div className="container-palace">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            <div className="w-full lg:w-[45%]">
              <span className="eyebrow">About Yashraj Palace</span>
              <h2 className="section-title text-maroon mb-4">Two Decades of Celebration & Legacy</h2>
              <div className="gold-divider mb-6" />
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-6">
                Yashraj Palace has been the backdrop for over 500 weddings, corporate events, and celebrations over two decades. Our commitment to excellence — in hospitality, cuisine, and decor — has made us Maheshwar's most trusted venue.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[['500+','Events Hosted'],['1000+','Max Guests'],['20+ Yrs','Experience'],['4.8★','Guest Rating']].map(([n,l]) => (
                  <div key={l} className="border border-stone-200 p-4">
                    <div className="font-serif text-2xl text-maroon font-bold">{n}</div>
                    <div className="text-[11px] text-stone-500 uppercase tracking-wider mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-primary">Our Story</Link>
            </div>

            <div className="w-full lg:w-[55%] grid grid-cols-2 gap-3">
              {[
                { emoji: '🏛️', title: 'Heritage Architecture', sub: 'Built with traditional craftsmanship' },
                { emoji: '🌿', title: 'Lush Gardens',          sub: 'Sprawling, manicured event lawns' },
                { emoji: '🍛', title: 'Royal Kitchen',         sub: 'Pure-veg culinary mastery' },
                { emoji: '🛎️', title: 'Dedicated Staff',       sub: 'Attentive service, every moment' },
              ].map(item => (
                <div key={item.title} className="p-5 md:p-6 border border-stone-200 bg-stone-50/50 hover:border-gold/40 transition-colors">
                  <span className="text-3xl block mb-3">{item.emoji}</span>
                  <h4 className="font-serif text-base text-maroon mb-1">{item.title}</h4>
                  <p className="text-[11px] text-stone-500">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section ref={r8} className="reveal section-lg" style={{ background: '#FAF7F2', borderTop: '1px solid #E8E0D8' }}>
        <div className="container-palace">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <span className="eyebrow">Frequently Asked</span>
              <h2 className="section-title text-maroon">Questions & Answers</h2>
              <GoldDivider />
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 text-left"
                  >
                    <span className="font-serif text-sm md:text-base text-maroon font-semibold leading-snug">{faq.q}</span>
                    <span className="shrink-0 w-6 h-6 border border-gold/40 flex items-center justify-center text-gold">
                      {openFaq === i ? <Minus size={13} /> : <Plus size={13} />}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer px-5 md:px-6 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100">
                      <div className="pt-4">{faq.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-8 md:mt-12">
              <p className="text-stone-500 text-sm mb-4">Still have questions? We're here to help.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="tel:+917000000000" className="btn-primary"><Phone size={14} /> Call Us</a>
                <a href="https://wa.me/917000000000" className="btn-whatsapp"><FaWhatsapp size={14} /> WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ background: '#6B1A2B' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)', backgroundSize: '28px 28px', opacity: 0.06 }} />
        <span className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }} />

        <div className="relative z-10 container-palace text-center text-white">
          <span className="eyebrow text-gold">Begin Your Journey</span>
          <h2 className="font-serif font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
            Ready to Create Memories?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Whether you're planning a grand wedding or a quiet getaway — Yashraj Palace is ready to exceed every expectation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/book-room" className="btn-gold btn-lg">Book a Room</Link>
            <Link to="/events/book" className="btn-outline-gold btn-lg">Plan an Event</Link>
            <a href="https://wa.me/917000000000" className="btn-whatsapp btn-lg"><FaWhatsapp size={14} /> WhatsApp Now</a>
          </div>
        </div>
      </section>

      {/* ══ FLOATING WHATSAPP ═════════════════════════════════════════════ */}
      <a href="https://wa.me/917000000000" className="wa-float" aria-label="Chat on WhatsApp">
        <FaWhatsapp size={22} className="text-white" />
      </a>
    </>
  )
}
