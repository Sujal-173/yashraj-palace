import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { roomsAPI } from '../utils/api'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'
import { FiCheck, FiUsers, FiMaximize2, FiWifi, FiStar, FiShield } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { Calendar, Users, Heart, ChevronDown } from 'lucide-react'

const AMENITIES = ['Free Wi-Fi','AC','Hot Water','24/7 Room Service','TV','Housekeeping','Parking','Power Backup']

const USP = [
  { icon: <FiStar size={16} className="text-gold" />,   label: 'Best Price Guarantee' },
  { icon: <FiShield size={16} className="text-gold" />, label: 'Free Cancellation up to 24 hrs' },
  { icon: <FiWifi size={16} className="text-gold" />,   label: 'Free Wi-Fi in all rooms' },
  { icon: <FiUsers size={16} className="text-gold" />,  label: '24/7 Front Desk' },
]

const ROOMS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: 'Yashraj Palace',
  url: 'https://www.yashrajpalace.com/rooms',
  containsPlace: [
    {
      '@type': 'HotelRoom', name: 'Deluxe Room',
      description: 'A well-appointed room with a queen bed, garden or courtyard view, premium linens, and all essentials for a restful stay near Maheshwar.',
      url: 'https://www.yashrajpalace.com/rooms/deluxe-room',
      bed: [{ '@type': 'BedDetails', typeOfBed: 'Queen size bed', numberOfBeds: 1 }],
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2 },
      offers: { '@type': 'Offer', price: '1800', priceCurrency: 'INR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '1800', priceCurrency: 'INR', unitText: 'night' } },
    },
    {
      '@type': 'HotelRoom', name: 'Premium Room',
      description: 'Elevated comfort with a king-size bed, sitting area, designer bathroom with hot shower, and complimentary breakfast near Mandleshwar.',
      url: 'https://www.yashrajpalace.com/rooms/premium-room',
      bed: [{ '@type': 'BedDetails', typeOfBed: 'King size bed', numberOfBeds: 1 }],
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2 },
      offers: { '@type': 'Offer', price: '2500', priceCurrency: 'INR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '2500', priceCurrency: 'INR', unitText: 'night' } },
    },
    {
      '@type': 'HotelRoom', name: 'Family Suite',
      description: 'Spacious suite with separate living area, two beds for up to 4 guests — ideal for families visiting Maheshwar Fort and Narmada Valley.',
      url: 'https://www.yashrajpalace.com/rooms/family-suite',
      bed: [{ '@type': 'BedDetails', typeOfBed: 'Double bed', numberOfBeds: 2 }],
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 4 },
      offers: { '@type': 'Offer', price: '3800', priceCurrency: 'INR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '3800', priceCurrency: 'INR', unitText: 'night' } },
    },
  ],
}

const IMG_CLASS = { deluxe: 'room-img-deluxe', premium: 'room-img-premium', suite: 'room-img-suite' }

export default function RoomsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [rooms, setRooms]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [checkIn, setCheckIn]       = useState(searchParams.get('checkIn')  ? new Date(searchParams.get('checkIn'))  : null)
  const [checkOut, setCheckOut]     = useState(searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : null)
  const [guests, setGuests]         = useState(searchParams.get('guests') || '2')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [heroRoomType, setHeroRoomType] = useState('')
  const { subscribe } = useSocket() || {}

  const loadRooms = useCallback(() => {
    roomsAPI.getAll(typeFilter ? { type: typeFilter } : {})
      .then(r => setRooms(r.data.rooms))
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setLoading(false))
  }, [typeFilter])

  useEffect(() => { loadRooms() }, [loadRooms])

  // Live update: reload when admin changes rooms
  useEffect(() => {
    if (!subscribe) return
    return subscribe('content_updated', (data) => {
      if (data?.type === 'rooms') loadRooms()
    })
  }, [subscribe, loadRooms])

  const handleHeroSearch = () => {
    if (!checkIn || !checkOut) { toast.error('Please select check-in and check-out dates'); return }
    const params = new URLSearchParams({ checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), guests })
    if (heroRoomType) params.set('type', heroRoomType)
    document.getElementById('rooms-list')?.scrollIntoView({ behavior: 'smooth' })
    setTypeFilter(heroRoomType)
  }

  return (
    <>
      <Helmet>
        <title>Rooms &amp; Suites – Yashraj Palace | Hotel in Maheshwar from ₹1,800/night</title>
        <meta name="description" content="Book Deluxe Rooms (from ₹1,800/night), Premium Rooms (from ₹2,500/night) and Family Suites (from ₹3,800/night) at Yashraj Palace near Maheshwar and Mandleshwar. Free parking, Wi-Fi, in-house dining." />
        <link rel="canonical" href="https://www.yashrajpalace.com/rooms" />
        <meta property="og:title" content="Rooms &amp; Suites – Yashraj Palace | Hotel near Maheshwar from ₹1,800" />
        <meta property="og:description" content="Deluxe, Premium &amp; Family Suite rooms at Yashraj Palace, Mandleshwar. From ₹1,800/night. Free Wi-Fi, parking, in-house catering." />
        <meta property="og:url" content="https://www.yashrajpalace.com/rooms" />
        <script type="application/ld+json">{JSON.stringify(ROOMS_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yashrajpalace.com/' },
            { '@type': 'ListItem', position: 2, name: 'Rooms & Suites', item: 'https://www.yashrajpalace.com/rooms' },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden" style={{ background: '#1A0709' }}>
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2000&auto=format&fit=crop')", opacity: 0.16 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,7,9,0.98) 0%, rgba(107,26,43,0.80) 50%, rgba(26,7,9,0.92) 100%)' }} />
        <div className="absolute inset-0 hero-pattern pointer-events-none" style={{ opacity: 0.06 }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #C9A84C 70%, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #C9A84C 70%, transparent)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left: Headline */}
            <div className="w-full lg:w-[52%] text-white">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px bg-gold/60 w-8" />
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Comfort &amp; Elegance</span>
                <span className="h-px bg-gold/60 w-8" />
              </div>
              <h1 className="font-serif font-bold leading-[1.12] mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Rooms &amp; Suites<br />
                <span style={{ background: 'linear-gradient(90deg,#C9A84C,#E8C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Crafted for Royalty
                </span>
              </h1>
              <p className="text-white/65 leading-relaxed mb-8 max-w-lg" style={{ fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)' }}>
                Premium accommodation near Maheshwar Fort and the Narmada Ghats. Every room offers palace-style comfort, quiet luxury, and warm hospitality.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#rooms-list" className="btn-gold btn-lg text-[0.625rem]">View All Rooms</a>
                <a href="https://wa.me/917000000000" className="btn-whatsapp btn-lg text-[0.625rem]">
                  <FaWhatsapp size={14} /> WhatsApp
                </a>
              </div>
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-white/10 max-w-sm">
                {[['₹1,800','From/Night'],['3','Room Types'],['4.8★','Rating'],['24/7','Service']].map(([n,l]) => (
                  <div key={l} className="text-center">
                    <div className="font-serif text-gold font-bold text-base">{n}</div>
                    <div className="text-white/45 text-[9px] uppercase tracking-widest mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Booking widget */}
            <div className="w-full lg:w-[44%] max-w-md mx-auto lg:mx-0">
              <div className="bg-[#FAF7F2] shadow-2xl" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
                <div className="text-center px-7 pt-7 pb-4">
                  <p className="eyebrow">Check Availability</p>
                  <h2 className="font-serif text-xl text-maroon font-semibold">Reserve Your Room</h2>
                  <div className="flex items-center justify-center gap-4 my-4">
                    <span className="h-px bg-gold/60 w-10" />
                    <span className="text-gold text-xs">✦</span>
                    <span className="h-px bg-gold/60 w-10" />
                  </div>
                </div>
                <div className="px-7 pb-7 space-y-5">
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
                        value={heroRoomType} onChange={e => setHeroRoomType(e.target.value)}>
                        <option value="">Any Room</option>
                        <option value="deluxe">Deluxe Room (₹1,800)</option>
                        <option value="premium">Premium Room (₹2,500)</option>
                        <option value="suite">Family Suite (₹3,800)</option>
                      </select>
                      <ChevronDown size={13} className="text-stone-400 shrink-0" />
                    </div>
                  </div>
                  <button onClick={handleHeroSearch} className="btn-primary w-full py-4 text-sm">
                    Check Availability →
                  </button>
                  <p className="text-xs text-center text-stone-400">Free cancellation · Best price guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search / Filter bar */}
      <div className="bg-[#FAF7F2] border-b py-5 px-4 sticky top-16 z-30 shadow-sm" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">Check-In</label>
            <DatePicker selected={checkIn} onChange={setCheckIn} minDate={new Date()} placeholderText="Select date" className="input-field w-40" />
          </div>
          <div>
            <label className="label">Check-Out</label>
            <DatePicker selected={checkOut} onChange={setCheckOut} minDate={checkIn || new Date()} placeholderText="Select date" className="input-field w-40" />
          </div>
          <div>
            <label className="label">Guests</label>
            <select className="input-field w-32" value={guests} onChange={e => setGuests(e.target.value)}>
              {['1','2','3','4','5','6+'].map(g => <option key={g} value={g}>{g} Guest{g !== '1' ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Room Type</label>
            <select className="input-field w-40" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Rooms</option>
              <option value="deluxe">Deluxe</option>
              <option value="premium">Premium</option>
              <option value="suite">Family Suite</option>
            </select>
          </div>
          <button className="btn-primary text-xs px-6 py-3 uppercase tracking-wider">Search</button>
        </div>
      </div>

      <div id="rooms-list" className="max-w-7xl mx-auto px-4 py-16">

        {/* Amenities strip */}
        <div className="palace-card bg-white p-6 mb-12">
          <span className="text-xs font-bold text-maroon uppercase tracking-widest block text-center mb-4">All rooms include</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {AMENITIES.map(a => (
              <div key={a} className="flex items-center gap-1.5 text-sm text-charcoal bg-[#FAF7F2] px-3 py-1.5 border border-[#E8E0D8]">
                <FiCheck className="text-gold" size={12} /> {a}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : rooms.length === 0 ? (
          <StaticRooms checkIn={checkIn} checkOut={checkOut} guests={guests} />
        ) : (
          <div className="space-y-8">
            {rooms.map(room => (
              <RoomCard key={room._id} room={room} checkIn={checkIn} checkOut={checkOut} guests={guests} />
            ))}
          </div>
        )}

        {/* WhatsApp help strip */}
        <div className="mt-16 bg-[#1E0610] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold/20">
          <div>
            <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Need Help Choosing?</p>
            <p className="text-white/80 text-sm">Our team can help you pick the perfect room and dates. Chat with us now.</p>
          </div>
          <a href="https://wa.me/917000000000" className="btn-whatsapp shrink-0">
            <FaWhatsapp size={16} /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </>
  )
}

function RoomCard({ room, checkIn, checkOut, guests }) {
  const nights  = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / 86400000) : null
  const total   = nights ? (room.discountedPrice || room.price) * nights : null
  const imgClass = IMG_CLASS[room.type] || 'room-img-default'
  const discount = room.discountedPrice ? Math.round(((room.price - room.discountedPrice) / room.price) * 100) : null

  return (
    <div className="palace-card bg-white overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      {/* Image panel */}
      <div className={`md:w-80 lg:w-96 h-56 md:h-auto ${imgClass} flex items-center justify-center shrink-0 relative`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {discount && (
          <div className="absolute top-3 left-3 badge bg-green-500 text-white">{discount}% OFF</div>
        )}
        <div className="absolute top-3 right-3 badge bg-maroon text-white capitalize">{room.type}</div>
        <div className="absolute bottom-4 left-4">
          <div className="font-serif text-white text-xl font-semibold drop-shadow">{room.name}</div>
          {room.size && <div className="text-white/65 text-xs mt-0.5">{room.size} sq ft</div>}
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 p-7 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal">{room.name}</h2>
              <div className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                <FiCheck size={11} /> Free cancellation up to 24 hrs before check-in
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              {room.discountedPrice ? (
                <>
                  <div className="text-sm text-gray-400 line-through">₹{room.price.toLocaleString('en-IN')}</div>
                  <div className="font-serif text-2xl font-bold text-maroon">₹{room.discountedPrice.toLocaleString('en-IN')}</div>
                </>
              ) : (
                <div className="font-serif text-2xl font-bold text-maroon">₹{room.price.toLocaleString('en-IN')}</div>
              )}
              <div className="text-xs text-charcoal-muted">per night + taxes</div>
            </div>
          </div>

          <p className="text-charcoal-muted text-sm leading-relaxed mb-5">{room.description || room.shortDesc}</p>

          <div className="flex flex-wrap gap-5 text-sm text-charcoal-muted mb-5">
            <span className="flex items-center gap-1.5"><FiUsers size={14} className="text-gold" /> {room.capacity} Guests</span>
            <span className="flex items-center gap-1.5">🛏 {room.bedType}</span>
            {room.size && <span className="flex items-center gap-1.5"><FiMaximize2 size={14} className="text-gold" /> {room.size} sq ft</span>}
          </div>

          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 6).map(a => (
                <span key={a} className="text-xs bg-[#F2EDE4] text-charcoal-muted px-2.5 py-1 border border-[#E8E0D8]">{a}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
          <div>
            {total && (
              <div className="text-sm text-charcoal-muted">
                {nights} night{nights > 1 ? 's' : ''} · <span className="font-semibold text-charcoal">₹{total.toLocaleString('en-IN')}</span> + taxes
              </div>
            )}
          </div>
          <Link
            to={`/rooms/${room.slug}${checkIn ? `?checkIn=${checkIn.toISOString()}&checkOut=${checkOut?.toISOString()}&guests=${guests}` : ''}`}
            className="btn-primary text-xs px-7">
            Book Now →
          </Link>
        </div>
      </div>
    </div>
  )
}

function StaticRooms({ checkIn, checkOut, guests }) {
  const rooms = [
    {
      slug: 'deluxe-room',  name: 'Deluxe Room',  price: 1800, type: 'deluxe',
      capacity: 2, bedType: 'Queen Bed', size: 280,
      description: 'A well-appointed room with a queen bed, garden or courtyard view, premium linens, and all essentials for a restful stay.',
      amenities: ['Free Wi-Fi','AC','TV','Hot Water','Room Service','Housekeeping']
    },
    {
      slug: 'premium-room', name: 'Premium Room', price: 2500, type: 'premium',
      capacity: 2, bedType: 'King Bed', size: 380,
      description: 'Elevated comfort with a king-size bed, sitting area, designer bathroom with hot shower, and complimentary breakfast included.',
      amenities: ['Free Wi-Fi','AC','TV','Hot Water','Breakfast Included','Mini Fridge','Room Service']
    },
    {
      slug: 'family-suite', name: 'Family Suite', price: 3800, type: 'suite',
      capacity: 4, bedType: 'Twin Beds', size: 560,
      description: 'Spacious and warm — a separate living area, two beds, and thoughtful touches that make family stays truly memorable.',
      amenities: ['Free Wi-Fi','AC','TV','Hot Water','Living Area','Mini Kitchen','Room Service','Housekeeping']
    },
  ]
  return (
    <div className="space-y-8">
      {rooms.map(room => <RoomCard key={room.slug} room={room} checkIn={checkIn} checkOut={checkOut} guests={guests} />)}
    </div>
  )
}
