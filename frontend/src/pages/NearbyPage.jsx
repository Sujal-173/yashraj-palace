import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Crown } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useSiteSettings } from '../context/SiteSettingsContext'

const ATTRACTIONS = [
  {
    name: 'Maheshwar Fort & Temple',
    dist: '12 km · 18 min',
    time: 'Half-day trip',
    desc: 'The iconic Ahilya Fort on the Narmada bank — a must-visit landmark of MP with stunning river views and historic temples.',
    tags: ['Historic Fort','River View','Temples','Photography'],
    color: 'linear-gradient(135deg, #0A1828, #1A3050)',
    icon: '🏯',
  },
  {
    name: 'Narmada Ghat, Maheshwar',
    dist: '14 km · 20 min',
    time: 'Sunrise / Evening',
    desc: 'Sacred ghats along the Narmada River — ideal for sunrise visits, boat rides, and witnessing the Ahilya Ghat aarti.',
    tags: ['Spiritual','Boat Ride','Sunrise','Aarti'],
    color: 'linear-gradient(135deg, #061820, #0A3040)',
    icon: '🌊',
  },
  {
    name: 'Mandleshwar Town',
    dist: '2 km · 5 min',
    time: 'Any time',
    desc: 'A historic town with the Mandleshwar temple complex, local markets, and the famous Narmada bridge with scenic views.',
    tags: ['Temple','Local Market','Scenic Bridge'],
    color: 'linear-gradient(135deg, #1A0A2E, #3A1060)',
    icon: '🕌',
  },
  {
    name: 'Omkareshwar Temple',
    dist: '38 km · 50 min',
    time: 'Full-day trip',
    desc: 'One of the 12 Jyotirlingas of Lord Shiva — a major pilgrimage site on an island in the Narmada River.',
    tags: ['Jyotirlinga','Pilgrimage','Island Temple'],
    color: 'linear-gradient(135deg, #0A1E0A, #153015)',
    icon: '⛩️',
  },
  {
    name: 'Mandu (Mandavgarh)',
    dist: '65 km · 90 min',
    time: 'Full-day trip',
    desc: 'An ancient ruined city of Afghan architecture — palaces, mosques, and baolis spread across a hilltop plateau.',
    tags: ['Heritage','Architecture','Day Trip'],
    color: 'linear-gradient(135deg, #1E1200, #3A2800)',
    icon: '🏰',
  },
  {
    name: 'Indore City',
    dist: '90 km · 2 hrs',
    time: 'Day trip / Departure',
    desc: 'MP\'s largest city — Rajwada Palace, Lal Bagh, Sarafa Bazaar night market, and Indore airport for onward connections.',
    tags: ['City','Shopping','Airport','Food'],
    color: 'linear-gradient(135deg, #1E0A0A, #3A1515)',
    icon: '🌆',
  },
]

const NEARBY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: 'Yashraj Palace – Near Maheshwar and Narmada Valley',
  description: 'Yashraj Palace is ideally located for exploring Maheshwar Fort, Narmada Ghats, Omkareshwar, Mandleshwar and Mandu — all within 90 km.',
  url: 'https://www.yashrajpalace.com/nearby-attractions',
  address: { '@type': 'PostalAddress', addressLocality: 'Mandleshwar', addressRegion: 'Madhya Pradesh', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: '22.1740', longitude: '75.6560' },
  nearbyAttraction: ATTRACTIONS.map(a => ({ '@type': 'TouristAttraction', name: a.name, description: a.desc })),
}

export default function NearbyPage() {
  const { waHref } = useSiteSettings()
  return (
    <>
      <Helmet>
        <title>Nearby Attractions – Yashraj Palace | Maheshwar Fort, Narmada Ghat, Omkareshwar</title>
        <meta name="description" content="Yashraj Palace is perfectly located near Maheshwar Fort (12 km), Narmada Ghat (14 km), Omkareshwar (38 km), and Mandu (65 km). Explore Narmada Valley from our hotel." />
        <link rel="canonical" href="https://www.yashrajpalace.com/nearby-attractions" />
        <meta property="og:title" content="Nearby Attractions – Yashraj Palace | Maheshwar, Narmada Valley" />
        <meta property="og:description" content="Base yourself at Yashraj Palace to explore Maheshwar Fort, Narmada Ghat, Omkareshwar, and Mandu — all within 90 km." />
        <meta property="og:url" content="https://www.yashrajpalace.com/nearby-attractions" />
        <script type="application/ld+json">{JSON.stringify(NEARBY_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yashrajpalace.com/' },
            { '@type': 'ListItem', position: 2, name: 'Nearby Attractions', item: 'https://www.yashrajpalace.com/nearby-attractions' },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <div className="page-hero">
        <div className="container-palace relative z-10 text-center text-white">
          <span className="eyebrow text-gold">Explore the Region</span>
          <h1 className="font-serif font-bold text-white mt-3 mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Nearby Attractions
          </h1>
          <div className="flex items-center justify-center gap-4 my-5">
            <span className="h-px bg-gold/50 w-16" />
            <Crown size={14} className="text-gold" />
            <span className="h-px bg-gold/50 w-16" />
          </div>
          <p className="text-white/65 max-w-xl mx-auto text-sm md:text-base">
            Yashraj Palace places you at the heart of Madhya Pradesh's most historic and spiritually rich region — the Narmada Valley.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8 text-center">
            {[['2 km','Mandleshwar Town'],['12 km','Maheshwar Fort'],['38 km','Omkareshwar']].map(([d,l]) => (
              <div key={l}>
                <div className="font-serif text-gold font-bold text-lg">{d}</div>
                <div className="text-white/45 text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION HEADER ── */}
      <section className="section-lg" style={{ background: '#FAF7F2' }}>
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Gateway to Narmada Valley</span>
            <h2 className="section-title text-maroon">Places to Explore Near Yashraj Palace</h2>
            <div className="gold-divider-center" />
            <p className="text-stone-500 max-w-xl mx-auto text-sm">
              All distances are from Yashraj Palace, Mandleshwar. Our front desk can help arrange day-trip transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {ATTRACTIONS.map(a => (
              <div key={a.name}
                className="bg-white border border-stone-200 overflow-hidden hover:border-gold/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                {/* Image strip */}
                <div className="h-40 relative flex items-end overflow-hidden"
                  style={{ background: a.color }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-15 group-hover:opacity-30 transition-opacity duration-300">{a.icon}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Corner accents */}
                  <span className="absolute top-3 left-3 w-5 h-5 border-l border-t border-gold/30" />
                  <span className="absolute top-3 right-3 w-5 h-5 border-r border-t border-gold/30" />
                  <div className="relative px-5 pb-4 w-full">
                    <div className="font-serif text-white font-semibold text-base leading-tight">{a.name}</div>
                    <div className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {a.dist}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock size={11} className="text-gold" />
                    <span className="text-[11px] text-gold font-medium uppercase tracking-wider">{a.time}</span>
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed mb-4">{a.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2.5 py-1 bg-[#F2EDE4] text-stone-600 uppercase tracking-wider border border-stone-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAVEL TIPS ── */}
      <section className="section-md bg-white">
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-12">
            <span className="eyebrow">Travel Tips</span>
            <h2 className="section-title text-maroon">Plan Your Narmada Valley Itinerary</h2>
            <div className="gold-divider-center" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: '🚗', title: 'Getting Around',      desc: 'Taxis and autos are easily available near the hotel. Our front desk can arrange private day-trip vehicles.' },
              { emoji: '🌅', title: 'Best Time to Visit',  desc: 'October to March is ideal — cool weather, clear river views, and the Maheshwar festival season is active.' },
              { emoji: '📍', title: 'Recommended Circuit', desc: 'Day 1: Mandleshwar + Maheshwar. Day 2: Omkareshwar. Day 3: Mandu. Perfect for a 3-night stay.' },
              { emoji: '🛶', title: 'Narmada Boat Ride',   desc: 'Take a boat ride from Maheshwar Ghat for stunning views of the fort walls rising from the river.' },
              { emoji: '🍛', title: 'Local Food',          desc: 'Dal Baati Churma, Bhutte ki Kees, and street chaat at Mandleshwar market are must-tries during your trip.' },
              { emoji: '📷', title: 'Photography Spots',   desc: 'Ahilya Fort terrace, Narmada Ghat at sunrise, and Mandu\'s Rani Roopmati Pavilion are unmissable.' },
            ].map(t => (
              <div key={t.title}
                className="p-5 md:p-6 border border-stone-200 bg-stone-50/50 hover:border-gold/40 hover:-translate-y-0.5 transition-all">
                <div className="text-2xl mb-3">{t.emoji}</div>
                <h4 className="font-serif text-base text-maroon mb-2">{t.title}</h4>
                <p className="text-sm text-stone-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-md relative overflow-hidden" style={{ background: '#4A0F1D' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)', backgroundSize: '28px 28px', opacity: 0.06 }} />
        <span className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }} />
        <div className="relative z-10 container-palace text-center text-white">
          <span className="eyebrow text-gold">Stay & Explore</span>
          <h2 className="font-serif font-bold mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
            Plan Your Narmada Valley Stay
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Our front desk team can help arrange transportation, suggest itineraries, and make sure you don't miss any highlight of the Narmada Valley.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/book-room" className="btn-gold btn-lg">Book Your Room</Link>
            <a href={waHref} className="btn-whatsapp btn-lg">
              <FaWhatsapp size={14} /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
