import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FiCheck } from 'react-icons/fi'

const SEO_CONTENT = {
  'hotel-in-maheshwar': {
    title: 'Hotel in Maheshwar – Yashraj Palace | Best Stay near Maheshwar Fort',
    metaDesc: 'Looking for a hotel in Maheshwar? Yashraj Palace is 12 km from Maheshwar Fort — premium rooms from ₹1800/night, in-house dining, free parking. Book direct.',
    h1: 'Best Hotel near Maheshwar',
    intro: 'Yashraj Palace is the closest premium hotel to Maheshwar — just 12 km from Maheshwar Fort and the iconic Narmada Ghats. Whether you\'re a pilgrim, tourist, or family traveller, our hotel offers clean rooms, warm hospitality, and everything you need for a comfortable stay.',
    highlights: ['12 km from Maheshwar Fort','Rooms from ₹1,800/night','Free parking · Free Wi-Fi','In-house restaurant serving regional cuisine','Family rooms for 4+ guests','Easy online booking with instant confirmation'],
    cta1: { label: 'Book a Room Near Maheshwar', to: '/book-room' },
    cta2: { label: 'View All Rooms', to: '/rooms' },
  },
  'hotel-in-mandleshwar': {
    title: 'Hotel in Mandleshwar – Yashraj Palace | Hotel near Narmada River',
    metaDesc: 'Best hotel in Mandleshwar — Yashraj Palace. Rooms from ₹1800/night, wedding garden, restaurant. Near Narmada river, Maheshwar and Omkareshwar.',
    h1: 'Premier Hotel in Mandleshwar',
    intro: 'Yashraj Palace is located right in Mandleshwar — the gateway to the Narmada Valley. Our hotel is the perfect base for exploring Maheshwar, Omkareshwar, and the sacred Narmada Ghats, while offering the comfort of a well-equipped modern property with a warm palace-style atmosphere.',
    highlights: ['Located in Mandleshwar town centre','2 km from Mandleshwar ghat','20+ premium rooms','24/7 check-in assistance','Restaurant open 7 AM – 11 PM','Wedding garden & banquet hall on-site'],
    cta1: { label: 'Book Your Stay', to: '/book-room' },
    cta2: { label: 'Contact Us', to: '/contact' },
  },
  'wedding-garden-in-maheshwar': {
    title: 'Wedding Garden in Maheshwar – Yashraj Palace | Book Your Wedding Venue',
    metaDesc: 'Best wedding garden near Maheshwar. Yashraj Palace offers 1000-guest capacity, in-house catering, decoration, DJ, and room bundle. Book now.',
    h1: 'Wedding Garden near Maheshwar',
    intro: 'Looking for the perfect wedding venue near Maheshwar? Yashraj Palace\'s wedding garden is one of the largest and most trusted event venues in the Khargone district — just 12 km from Maheshwar. With a capacity of up to 1,000 guests, full decoration support, in-house catering, and dedicated wedding coordination, we make your wedding truly memorable.',
    highlights: ['Garden capacity: 1,000 guests','Premium mandap & floral decoration','In-house catering — 250+ dish menu','DJ, sound system & lighting rig','4–10 rooms for wedding family','Token booking: only ₹10,000 to confirm'],
    cta1: { label: 'Book Wedding Garden', to: '/events/book?type=wedding' },
    cta2: { label: 'View Wedding Packages', to: '/events/packages' },
  },
  'marriage-garden-in-mandleshwar': {
    title: 'Marriage Garden in Mandleshwar – Yashraj Palace | Event Venue',
    metaDesc: 'Top marriage garden in Mandleshwar. Yashraj Palace — 1000 guests, floral decor, catering, parking, rooms. Call +91 70000 00000 to book.',
    h1: 'Marriage Garden in Mandleshwar',
    intro: 'Yashraj Palace is Mandleshwar\'s most trusted marriage garden and event venue. Hundreds of weddings, receptions, and celebrations have been hosted here — making it the region\'s first choice for families planning a grand function. Our marriage garden combines open lawns, a covered banquet hall, and full-service event management.',
    highlights: ['Centrally located in Mandleshwar','Open lawn + covered hall — combined capacity 1,000','Floral decoration, stage, mandap setup','Catering for 100 to 1,000 guests','Free parking for 100+ vehicles','Easy instalment & token payment system'],
    cta1: { label: 'Check Availability & Book', to: '/events/book?type=wedding' },
    cta2: { label: 'Call for Pricing', to: '/contact' },
  },
  'hotel-near-maheshwar-fort': {
    title: 'Hotel near Maheshwar Fort – Yashraj Palace | Stay close to the Fort',
    metaDesc: 'Stay near Maheshwar Fort at Yashraj Palace — only 12 km away. Premium rooms from ₹1800, free parking, Wi-Fi, dining. Best hotel for Maheshwar tourism.',
    h1: 'Hotel near Maheshwar Fort',
    intro: 'Yashraj Palace is the most convenient hotel for travellers visiting Maheshwar Fort. Located just 12 km from the historic fort on the Narmada banks, our hotel puts you within easy reach of Maheshwar\'s temples, the Ahilya Fort Palace, Narmada Ghats, and the famous Maheshwari saree weavers.',
    highlights: ['12 km from Maheshwar Fort — 18 min drive','Complimentary auto/taxi arrangement help','Rooms available for 1-night to 7-night stays','Early check-in & late check-out on request','Local sightseeing guidance from hotel staff','Breakfast included in Premium Rooms'],
    cta1: { label: 'Book Your Room Now', to: '/book-room' },
    cta2: { label: 'Explore Nearby Attractions', to: '/nearby-attractions' },
  },
  'hotel-near-narmada-ghat': {
    title: 'Hotel near Narmada Ghat – Yashraj Palace | Stay near Narmada River',
    metaDesc: 'Hotel near Narmada Ghat at Maheshwar & Mandleshwar. Yashraj Palace — 14 km from Narmada Ghats, rooms from ₹1800, family-friendly, clean and comfortable.',
    h1: 'Hotel near Narmada Ghat',
    intro: 'The Narmada Ghat at Maheshwar is one of Madhya Pradesh\'s most spiritually significant and visually stunning riverbank locations. Yashraj Palace is just 14 km away — making it the ideal hotel for pilgrims attending the morning or evening aarti, families exploring the river, or travellers seeking a peaceful retreat near the sacred Narmada.',
    highlights: ['14 km from Narmada Ghat, Maheshwar','Car/auto arrangement to ghats available','Ideal for pilgrims visiting Omkareshwar too','Safe and family-friendly property','Pure vegetarian meal options available','Peaceful, quiet, away from city noise'],
    cta1: { label: 'Book a Room', to: '/book-room' },
    cta2: { label: 'View Nearby Attractions', to: '/nearby-attractions' },
  },
  'event-venue-in-maheshwar': {
    title: 'Event Venue in Maheshwar – Yashraj Palace | Wedding, Corporate & Private Events',
    metaDesc: 'Best event venue near Maheshwar. Yashraj Palace — weddings, receptions, corporate events, birthdays. 1000-guest capacity, full catering & decor. Book now.',
    h1: 'Premier Event Venue near Maheshwar',
    intro: 'Yashraj Palace is the region\'s leading event venue — serving Maheshwar, Mandleshwar, Khargone and surrounding areas. From grand weddings with 1,000 guests to intimate corporate off-sites of 50 professionals, our venue is fully equipped to deliver a seamless event experience with in-house catering, decoration, AV, and coordination.',
    highlights: ['Garden + hall — 1,000-guest combined capacity','8 event types: wedding, corporate, birthday & more','Professional AV: projector, mics, DJ, lighting','In-house catering — veg & non-veg, 250+ dishes','Dedicated event coordinator for every booking','Competitive packages from ₹45,000'],
    cta1: { label: 'Book Event Venue', to: '/events/book' },
    cta2: { label: 'View All Packages', to: '/events/packages' },
  },
  'luxury-hotel-in-khargone': {
    title: 'Luxury Hotel in Khargone District – Yashraj Palace | Premium Stay MP',
    metaDesc: 'Best luxury hotel in Khargone district, MP. Yashraj Palace — premium rooms, wedding garden, restaurant. Near Maheshwar, Mandleshwar, Omkareshwar.',
    h1: 'Luxury Hotel in Khargone District',
    intro: 'In the Khargone district of Madhya Pradesh, Yashraj Palace stands apart as the region\'s premier hospitality destination. With palace-inspired interiors, premium room amenities, a grand wedding garden, and an in-house restaurant, we deliver a luxury experience that is rarely found in this region — at honest, transparent pricing.',
    highlights: ['Khargone district\'s top-rated hotel','Premium rooms with AC, hot water, Wi-Fi, TV','In-house chef — regional and North Indian cuisine','Wedding garden for 1,000+ guests','Ideal for business travellers & families','Nearest premium hotel to Omkareshwar (38 km)'],
    cta1: { label: 'Book Your Premium Stay', to: '/book-room' },
    cta2: { label: 'View Rooms & Pricing', to: '/rooms' },
  },
}

const COMMON_FEATURES = [
  '20+ premium rooms', 'Free parking', 'Free Wi-Fi', 'In-house restaurant',
  'Wedding garden (1,000 guests)', 'Event packages from ₹45,000', '24/7 front desk', 'WhatsApp support',
]

export default function SeoLandingPage({ slug }) {
  const content = SEO_CONTENT[slug]

  if (!content) return (
    <div className="text-center py-32 text-charcoal-muted">
      <h1 className="font-serif text-3xl mb-4">Page Not Found</h1>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{content.title}</title>
        <meta name="description" content={content.metaDesc} />
        <link rel="canonical" href={`https://yashrajpalace.com/${slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Hotel',
          name: 'Yashraj Palace',
          description: content.metaDesc,
          address: { '@type': 'PostalAddress', streetAddress: 'Near Mandleshwar', addressLocality: 'Mandleshwar', addressRegion: 'Madhya Pradesh', postalCode: '451221', addressCountry: 'IN' },
          telephone: '+917000000000',
          url: 'https://yashrajpalace.com',
          priceRange: '₹₹',
          starRating: { '@type': 'Rating', ratingValue: '4' },
        })}</script>
      </Helmet>

      {/* Hero */}
      <div className="page-hero">
        <div className="absolute inset-0 hero-pattern" />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="section-eyebrow text-gold">Yashraj Palace · Mandleshwar, MP</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white mb-4">{content.h1}</h1>
          <p className="text-white/65 max-w-xl mx-auto text-lg">{content.intro.slice(0, 160)}…</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to={content.cta1.to} className="btn-gold text-sm px-7">{content.cta1.label}</Link>
            <Link to={content.cta2.to} className="border-2 border-white/40 text-white px-6 py-3 rounded font-semibold text-sm hover:bg-white/10 transition-all">{content.cta2.label}</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Intro */}
        <section>
          <h2 className="font-serif text-2xl font-semibold text-charcoal mb-4">{content.h1}</h2>
          <p className="text-charcoal-muted leading-relaxed text-lg">{content.intro}</p>
        </section>

        {/* Highlights */}
        <section>
          <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">Why Choose Yashraj Palace?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.highlights.map(h => (
              <div key={h} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <FiCheck className="text-gold shrink-0 mt-0.5" size={16} />
                <span className="text-charcoal-muted text-sm">{h}</span>
              </div>
            ))}
          </div>
        </section>

        {/* All features */}
        <section className="bg-ivory-dark rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6 text-center">Everything at Yashraj Palace</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COMMON_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-charcoal-muted bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                <FiCheck className="text-gold shrink-0" size={13} /> {f}
              </div>
            ))}
          </div>
        </section>

        {/* Rooms preview */}
        <section>
          <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">Our Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Deluxe Room', price: '₹1,800/night', guests: '2 guests', bed: 'Queen bed' },
              { name: 'Premium Room', price: '₹2,500/night', guests: '2 guests', bed: 'King bed + breakfast' },
              { name: 'Family Suite', price: '₹3,800/night', guests: '4 guests', bed: '2 beds + living area' },
            ].map(r => (
              <div key={r.name} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="h-28 bg-gradient-to-br from-ivory-dark to-[#D5C8B8] rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl opacity-20">🏨</span>
                </div>
                <h3 className="font-serif text-lg font-semibold mb-1">{r.name}</h3>
                <div className="text-xs text-charcoal-muted mb-3">{r.bed} · {r.guests}</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-maroon">{r.price}</span>
                  <Link to="/book-room" className="text-xs text-maroon font-semibold hover:underline">Book →</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="bg-maroon rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-4">Location & Directions</h2>
              <div className="space-y-2 text-white/75 text-sm">
                <p>📍 Near Mandleshwar, Khargone District, MP – 451221</p>
                <p>🏯 12 km from Maheshwar Fort (18 min drive)</p>
                <p>🌊 14 km from Narmada Ghat, Maheshwar</p>
                <p>⛩ 38 km from Omkareshwar (50 min drive)</p>
                <p>🚂 35 km from Barwaha Railway Station</p>
                <p>✈ 90 km from Indore Airport</p>
              </div>
            </div>
            <div className="space-y-3">
              <Link to={content.cta1.to} className="btn-gold block text-center text-sm py-3.5 px-6">{content.cta1.label}</Link>
              <a href="tel:+917000000000" className="border-2 border-white/40 text-white block text-center py-3 rounded font-semibold text-sm hover:bg-white/10 transition-all">📞 +91 70000 00000</a>
              <a href="https://wa.me/917000000000" className="bg-green-500 text-white block text-center py-3 rounded font-semibold text-sm hover:bg-green-600 transition-all">💬 WhatsApp Now</a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
