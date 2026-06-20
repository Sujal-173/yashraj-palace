import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaWhatsapp } from 'react-icons/fa'
import { Check, ArrowRight, Phone, Users, Music, Utensils, ShieldCheck, Heart, Crown, Star } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

const EVENT_DETAILS = {
  wedding:    { title: 'Wedding',         icon: '💍', eyebrow: 'Dream Weddings',    desc: 'Your dream wedding, hosted with the grandeur it deserves. From the mandap to the feast — we handle every detail so you can simply be present.' },
  reception:  { title: 'Reception',       icon: '🎊', eyebrow: 'Grand Receptions',  desc: 'A spectacular reception for up to 1,000 guests with premium decor, professional lighting, and in-house catering.' },
  engagement: { title: 'Engagement',      icon: '💛', eyebrow: 'Engagements',       desc: 'Intimate to mid-size engagement functions crafted with warmth, personal touches, and thoughtful setup.' },
  birthday:   { title: 'Birthday Party',  icon: '🎂', eyebrow: 'Birthday Parties',  desc: 'Themed birthday celebrations with custom decor, live counters, and all the entertainment you need.' },
  corporate:  { title: 'Corporate Event', icon: '🏢', eyebrow: 'Corporate Events',  desc: 'A professional venue for conferences, seminars, team off-sites, award nights, and product launches.' },
  anniversary:{ title: 'Anniversary',     icon: '🥂', eyebrow: 'Anniversaries',     desc: 'Mark your milestone with a private celebration or a grand gathering — we make every anniversary unforgettable.' },
  family:     { title: 'Family Function', icon: '🏠', eyebrow: 'Family Functions',  desc: 'Griha pravesh, naming ceremony, puja, or any family gathering — handled with the care it deserves.' },
  cultural:   { title: 'Cultural Event',  icon: '🎭', eyebrow: 'Cultural Events',   desc: 'Stage performances, community gatherings, religious programs — our halls and lawns welcome them all.' },
}

const VENUE_SPECS = [
  { icon: '🌿', title: 'Wedding Garden',   val: '10,000 sq ft lawn' },
  { icon: '🏛️', title: 'Banquet Hall',     val: 'AC hall, 500 seated' },
  { icon: '👥', title: 'Total Capacity',   val: '1,000+ guests' },
  { icon: '🎪', title: 'Stage & Mandap',   val: 'Professional setup' },
  { icon: '💡', title: 'Lighting Rig',     val: 'Full LED + decor lights' },
  { icon: '🎵', title: 'Sound System',     val: 'DJ + PA setup' },
  { icon: '🍽️', title: 'In-house Catering',val: '250+ dish menu' },
  { icon: '🅿️', title: 'Free Parking',     val: '100+ vehicles on-site' },
  { icon: '🏨', title: 'Room Bundle',      val: 'Block rooms for family' },
  { icon: '👔', title: 'Event Manager',    val: 'Dedicated coordinator' },
  { icon: '🌸', title: 'Floral Decor',     val: 'Fresh arrangements' },
  { icon: '📸', title: 'Photo Zones',      val: 'Dedicated backdrops' },
]

const PACKAGES = [
  {
    name: 'Silver Celebration',
    guests: '200 guests · 6 hrs',
    price: '₹45,000',
    note: 'Venue + basic setup',
    tag: null,
    features: ['Banquet hall access', 'Basic floral decoration', 'Sound system & mic', 'Parking for 40 vehicles', '1 coordination staff'],
  },
  {
    name: 'Royal Wedding',
    guests: '600 guests · Full day',
    price: '₹1,80,000',
    note: 'Venue + decor + 300-plate catering',
    tag: 'Most Popular',
    features: ['Garden + hall access', 'Premium mandap decor', 'DJ, lights & sound', '300-plate catering', '4 rooms for family', 'Wedding coordinator'],
  },
  {
    name: 'Grand Palace',
    guests: '1,000 guests · 2 days',
    price: '₹4,50,000',
    note: 'All-inclusive · Custom quote available',
    tag: 'All Inclusive',
    features: ['Full property access', 'Custom stage & luxury decor', 'Unlimited catering, live counters', '10 rooms for 2 nights', '2-day event team'],
  },
]

const WHY_YASHRAJ = [
  { icon: <Crown size={22} />,      title: 'Heritage Venue',       desc: 'Traditional architecture with stately pillars, carved details, and palace-inspired aesthetics.' },
  { icon: <Users size={22} />,      title: '1,000+ Capacity',      desc: 'One of the largest event spaces near Maheshwar — garden + hall combined.' },
  { icon: <Utensils size={22} />,   title: 'Royal Catering',       desc: '250+ dish pure-veg menu with live counters, regional MP cuisine, and dessert stations.' },
  { icon: <ShieldCheck size={22} />,title: 'End-to-End Management',desc: 'From first inquiry to final farewell — your dedicated event manager handles it all.' },
  { icon: <Heart size={22} />,      title: 'Bridal Suites',        desc: 'Dedicated rooms for bride, groom, and close family — comfortable and private.' },
  { icon: <Music size={22} />,      title: 'AV & Lighting',        desc: 'Professional DJ, PA system, full LED rig, and decorative lighting — all included.' },
]

const GALLERY_ITEMS = [
  { label: 'Wedding Garden',  color: 'from-[#2E0912] to-[#6B1A2B]',  emoji: '🌿' },
  { label: 'Grand Reception', color: 'from-[#1A0A2E] to-[#4A2070]',  emoji: '🎊' },
  { label: 'Mandap Setup',    color: 'from-[#1A2E0A] to-[#2A6020]',  emoji: '🪔' },
  { label: 'Floral Decor',    color: 'from-[#2E1A0A] to-[#7A4020]',  emoji: '🌸' },
  { label: 'Banquet Dining',  color: 'from-[#0A1A2E] to-[#204060]',  emoji: '🍽️' },
  { label: 'Night Lighting',  color: 'from-[#1A1A1A] to-[#3A3A3A]',  emoji: '✨' },
]

const REVIEWS = [
  { name: 'Suresh Patel',    initials: 'SP', rating: 5, text: 'Our daughter\'s wedding was absolutely perfect. The garden was lit beautifully, food was excellent, and the team handled everything. Highly recommend.' },
  { name: 'Kavita Sharma',   initials: 'KS', rating: 5, text: 'Yashraj Palace made our reception feel like a royal celebration. Every guest was impressed by the decor and the warmth of the staff.' },
  { name: 'Rohit Kulkarni',  initials: 'RK', rating: 4, text: 'Excellent venue for our corporate event. Clean, well-organised, and the catering was on point. Our 300-person team was fully satisfied.' },
]

export default function EventsPage() {
  const { type } = useParams()
  const currentEvent = EVENT_DETAILS[type] || null
  const { phoneHref, waHref } = useSiteSettings()
  const isWedding = type === 'wedding'

  const seoTitle = currentEvent
    ? `${currentEvent.title} Venue – Yashraj Palace | Maheshwar`
    : 'Events & Celebrations – Yashraj Palace | Wedding Garden Maheshwar'
  const seoDesc = currentEvent
    ? `Book ${currentEvent.title} at Yashraj Palace near Maheshwar. Garden for 1,000+ guests, in-house catering, full decoration. Call +91 70000 00000.`
    : 'Wedding garden, banquet hall, and event venue near Maheshwar and Mandleshwar. 1,000+ capacity. Weddings, receptions, corporate events, birthdays. Book now.'

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={`https://www.yashrajpalace.com/events${type ? `/${type}` : ''}`} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={`https://www.yashrajpalace.com/events${type ? `/${type}` : ''}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div className="page-hero" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="container-palace relative z-10 text-center text-white">
          {currentEvent ? (
            <>
              <div className="text-5xl md:text-6xl mb-5 animate-float">{currentEvent.icon}</div>
              <span className="eyebrow text-gold">{currentEvent.eyebrow}</span>
              <h1 className="font-serif font-bold text-white mt-3 mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                {currentEvent.title} at Yashraj Palace
              </h1>
              <div className="flex items-center justify-center gap-4 my-5">
                <span className="h-px bg-gold/50 w-16" />
                <Crown size={14} className="text-gold" />
                <span className="h-px bg-gold/50 w-16" />
              </div>
              <p className="text-white/65 max-w-xl mx-auto leading-relaxed text-sm md:text-base">{currentEvent.desc}</p>
            </>
          ) : (
            <>
              <span className="eyebrow text-gold">Events & Celebrations</span>
              <h1 className="font-serif font-bold text-white mt-3 mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Wedding Garden &amp; Event Venue
              </h1>
              <div className="flex items-center justify-center gap-4 my-5">
                <span className="h-px bg-gold/50 w-16" />
                <Crown size={14} className="text-gold" />
                <span className="h-px bg-gold/50 w-16" />
              </div>
              <p className="text-white/65 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
                One destination for weddings, receptions, corporate events, birthdays, and every occasion worth celebrating — near Maheshwar, Madhya Pradesh.
              </p>
            </>
          )}

          {/* Hero stats row */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8 mb-8 text-center">
            {[['1,000+','Guest Capacity'],['500+','Events Hosted'],['20+','Years Experience']].map(([n,l]) => (
              <div key={l}>
                <div className="font-serif text-gold font-bold text-xl">{n}</div>
                <div className="text-white/45 text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/events/book" className="btn-gold btn-lg">Book This Venue</Link>
            <a href={waHref} className="btn-whatsapp btn-lg">
              <FaWhatsapp size={15} /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* ══ EVENT TYPE TABS ═══════════════════════════════════════════════ */}
      <div className="bg-[#FAF7F2] border-b sticky top-[72px] z-30 overflow-x-auto"
        style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
        <div className="flex gap-0 max-w-full px-4 md:px-8 py-3">
          <Link to="/events"
            className={`filter-pill shrink-0 mr-1.5 ${!type ? 'filter-pill-active' : 'filter-pill-inactive'}`}>
            All Events
          </Link>
          {Object.entries(EVENT_DETAILS).map(([slug, ev]) => (
            <Link key={slug} to={`/events/${slug}`}
              className={`filter-pill shrink-0 mr-1.5 ${type === slug ? 'filter-pill-active' : 'filter-pill-inactive'}`}>
              <span className="mr-1.5 text-sm">{ev.icon}</span>
              {ev.title}
            </Link>
          ))}
        </div>
      </div>

      {/* ══ WEDDING SPECIAL SECTION (only on /events/wedding) ═══════════ */}
      {isWedding && (
        <section className="section-md" style={{ background: '#FAF7F2' }}>
          <div className="container-palace">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
              {/* Image placeholder */}
              <div className="w-full lg:w-[42%] shrink-0">
                <div className="relative" style={{ padding: '10px', border: '1px solid rgba(201,168,76,0.35)' }}>
                  <span className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-gold" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-gold" />
                  <span className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-gold" />
                  <span className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-gold" />
                  <div className="h-64 sm:h-80 lg:h-[420px] flex flex-col items-center justify-center text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1A0709, #4A0F1D, #6B1A2B)' }}>
                    <div className="text-7xl mb-4 animate-float">💍</div>
                    <p className="font-serif text-xl text-gold/80 italic">Wedding Garden</p>
                    <p className="text-white/40 text-sm mt-1">Up to 1,000 Guests</p>
                    <div className="absolute top-4 left-4 w-7 h-7 border-l border-t border-gold/30" />
                    <div className="absolute bottom-4 right-4 w-7 h-7 border-r border-b border-gold/30" />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="w-full lg:w-[58%]">
                <span className="eyebrow">Dream Weddings</span>
                <h2 className="font-serif font-bold text-maroon leading-tight mb-4"
                  style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
                  The Perfect Setting for Your Royal Wedding
                </h2>
                <div className="gold-divider mb-6" />
                <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-8">
                  Yashraj Palace has been the backdrop for hundreds of weddings over two decades. Our magnificent garden and regal banquet hall provide a breathtaking setting — from the sacred mandap ceremony to the grand reception feast, every moment feels timeless.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    ['💍', 'Mandap & Ceremony', 'Traditional setups with floral mandap'],
                    ['🌿', 'Lush Garden', '10,000 sq ft open-air event lawn'],
                    ['🏛️', 'Indoor Banquet', 'AC hall for up to 500 seated guests'],
                    ['🍛', 'Wedding Feast', '250+ dish pure-veg royal menu'],
                    ['🛎️', 'Full Coordination', 'End-to-end wedding management'],
                    ['🏨', 'Family Rooms', 'Block rooms for bridal party & family'],
                  ].map(([emoji, title, sub]) => (
                    <div key={title} className="flex items-start gap-3">
                      <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
                      <div>
                        <div className="font-semibold text-sm text-maroon">{title}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/events/book?type=wedding" className="btn-primary">Book Wedding Venue</Link>
                  <Link to="/events/packages" className="btn-outline">View Packages</Link>
                  <a href={waHref} className="btn-whatsapp"><FaWhatsapp size={14} /> WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ VENUE HIGHLIGHTS ══════════════════════════════════════════════ */}
      <section className="section-md bg-white">
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Venue Highlights</span>
            <h2 className="section-title text-maroon">
              {isWedding ? 'Everything Your Wedding Needs' : 'Everything You Need, Right Here'}
            </h2>
            <div className="gold-divider-center" />
            <p className="text-stone-500 max-w-lg mx-auto text-sm">
              Yashraj Palace is a full-service event venue. From stage to catering to overnight stays — we handle it all.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {VENUE_SPECS.map(f => (
              <div key={f.title}
                className="bg-stone-50 p-5 border border-stone-200 hover:border-gold/50 hover:bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="font-semibold text-sm text-maroon mb-1">{f.title}</div>
                <div className="text-[11px] text-stone-500 leading-relaxed">{f.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY YASHRAJ ═══════════════════════════════════════════════════ */}
      <section className="section-md" style={{ background: '#FAF7F2', borderTop: '1px solid #E8E0D8' }}>
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Why Choose Us</span>
            <h2 className="section-title text-maroon">
              {isWedding ? 'Why Couples Choose Yashraj Palace' : 'The Yashraj Difference'}
            </h2>
            <div className="gold-divider-center" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {WHY_YASHRAJ.map((item, i) => (
              <div key={i}
                className="group p-6 md:p-7 bg-white border border-stone-200 hover:border-gold/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center text-gold mb-5 bg-stone-50 group-hover:bg-maroon group-hover:border-maroon group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg text-maroon mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PACKAGES ══════════════════════════════════════════════════════ */}
      <section className="section-md bg-white">
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Packages &amp; Pricing</span>
            <h2 className="section-title text-maroon">Transparent. All-Inclusive. Memorable.</h2>
            <div className="gold-divider-center" />
            <p className="text-stone-500 max-w-xl mx-auto text-sm">No hidden costs, no surprises — just an unforgettable celebration at a fair price.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-10">
            {PACKAGES.map(pkg => (
              <div key={pkg.name}
                className={`flex flex-col bg-white transition-all duration-300 hover:-translate-y-1 relative ${
                  pkg.tag === 'Most Popular'
                    ? 'border-2 border-gold shadow-xl'
                    : 'border border-stone-200 hover:border-gold/40 hover:shadow-lg'
                }`}>
                {pkg.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-maroon text-[10px] font-bold uppercase tracking-wider px-4 py-1 whitespace-nowrap">
                    {pkg.tag}
                  </div>
                )}
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <h3 className="font-serif text-xl text-maroon mb-1">{pkg.name}</h3>
                  <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-4 pb-4 border-b border-stone-100">{pkg.guests}</p>
                  <div className="font-serif text-3xl text-maroon font-bold mb-1">{pkg.price}</div>
                  <p className="text-[11px] text-stone-500 mb-5">{pkg.note}</p>
                  <ul className="space-y-2 mb-7 flex-1">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                        <Check size={12} className="text-gold mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/events/book"
                    className={`text-center py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      pkg.tag === 'Most Popular' ? 'btn-primary justify-center' : 'btn-outline justify-center'
                    }`}>
                    Book This Package
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/events/packages" className="btn-outline inline-flex items-center gap-2">
              View Full Package Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ GALLERY TEASER ════════════════════════════════════════════════ */}
      <section className="section-md" style={{ background: '#FAF7F2', borderTop: '1px solid #E8E0D8' }}>
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">See It to Believe It</span>
            <h2 className="section-title text-maroon">
              {isWedding ? 'Weddings We\'ve Hosted' : 'Events We\'ve Hosted'}
            </h2>
            <div className="gold-divider-center" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {GALLERY_ITEMS.map((item) => (
              <div key={item.label}
                className={`overflow-hidden h-40 sm:h-52 flex flex-col items-center justify-center relative bg-gradient-to-br ${item.color} group cursor-pointer hover:opacity-90 transition-opacity`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                {/* Corner accent */}
                <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-gold/40" />
                <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-gold/40" />
                <div className="relative text-center p-4">
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-white font-semibold text-sm tracking-wide">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <Link to="/gallery" className="btn-outline">View Full Gallery <ArrowRight size={14} className="inline ml-1" /></Link>
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ═══════════════════════════════════════════════════════ */}
      <section className="section-md bg-white">
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">What Our Guests Say</span>
            <h2 className="section-title text-maroon">
              {isWedding ? 'Couples Who Celebrated Here' : 'Trusted by 500+ Events'}
            </h2>
            <div className="gold-divider-center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className="p-6 md:p-7 border border-stone-200 bg-stone-50/50 hover:border-gold/40 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(r.rating)].map((_, j) => <Star key={j} size={13} fill="#C9A84C" className="text-gold" />)}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-5 flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-200">
                  <div className="w-9 h-9 flex items-center justify-center font-bold text-xs text-maroon shrink-0"
                    style={{ background: '#E8C97A' }}>
                    {r.initials}
                  </div>
                  <div className="font-semibold text-sm text-maroon">{r.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/reviews" className="btn-outline">Read All Reviews</Link>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="section-md relative overflow-hidden" style={{ background: '#4A0F1D' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)', backgroundSize: '28px 28px', opacity: 0.06 }} />
        <span className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }} />

        <div className="relative z-10 container-palace text-center text-white">
          <span className="eyebrow text-gold">
            {isWedding ? 'Begin Your Forever' : 'Begin Your Celebration'}
          </span>
          <h2 className="font-serif font-bold mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
            {isWedding
              ? 'Ready to Book Your Dream Wedding?'
              : 'Ready to Book the Venue?'}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm md:text-base">
            {isWedding
              ? 'Fill out our inquiry form and our wedding coordinator will call you within 2 hours with availability, pricing, and a personal consultation.'
              : 'Fill out our quick inquiry form and our event team will call you within 2 hours with availability and a custom quote.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/events/book" className="btn-gold btn-lg">
              {isWedding ? 'Book Wedding Venue' : 'Book This Venue'}
            </Link>
            <a href={phoneHref} className="btn-outline-gold btn-lg">
              <Phone size={14} /> Call Directly
            </a>
            <a href={waHref} className="btn-whatsapp btn-lg">
              <FaWhatsapp size={14} /> WhatsApp Now
            </a>
          </div>

          {/* Trust note */}
          <p className="text-white/35 text-[11px] mt-6 uppercase tracking-wider">
            500+ events hosted · 4.8/5 rating · 20+ years experience
          </p>
        </div>
      </section>
    </>
  )
}
