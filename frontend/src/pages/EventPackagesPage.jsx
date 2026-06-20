import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { eventsAPI } from '../utils/api'
import { Check, Crown, Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useSiteSettings } from '../context/SiteSettingsContext'

const STATIC_PACKAGES = [
  { _id:'s1', name:'Silver Celebration', category:'all',        price:45000,  capacity:{min:50,max:200},   duration:1, badge:'',             venue:'banquet',  inclusions:['Banquet hall access (6 hours)','Basic floral decoration','Sound system & mic setup','Parking for 40 vehicles','1 event coordination staff','Welcome banner'], exclusions:['Catering (priced separately)','Photography','Decoration beyond basics'] },
  { _id:'s2', name:'Royal Wedding',      category:'wedding',    price:180000, capacity:{min:200,max:600},  duration:1, badge:'Most Popular',   venue:'combined', inclusions:['Full garden + hall access (full day)','Premium floral & mandap decor','DJ, lighting & sound system','300-plate in-house catering','4 rooms for family (1 night)','Dedicated wedding coordinator','Welcome gate setup','Bride & groom seating arrangement'], exclusions:['Photography','Mehendi artist','Additional catering beyond 300 plates'] },
  { _id:'s3', name:'Grand Palace',       category:'wedding',    price:450000, capacity:{min:500,max:1000}, duration:2, badge:'All Inclusive',   venue:'combined', inclusions:['Full property — garden + hall + lawn (2 days)','Custom luxury stage & decor','Unlimited catering — all meals + live counters','10 rooms for 2 nights','2-day event coordination team','Baraat welcome setup','Custom lighting rig','Photography & videography coordination'], exclusions:['External entertainment','Legal/govt permissions'] },
  { _id:'s4', name:'Birthday Bash',      category:'birthday',   price:25000,  capacity:{min:30,max:150},  duration:1, badge:'',             venue:'banquet',  inclusions:['Banquet hall (4 hours)','Balloon & ribbon decoration','Birthday cake coordination','Basic sound system','Parking for 30 vehicles'], exclusions:['Catering','Photography','Custom theme decor'] },
  { _id:'s5', name:'Corporate Off-Site', category:'corporate',  price:55000,  capacity:{min:50,max:300},  duration:1, badge:'',             venue:'banquet',  inclusions:['Banquet hall + AV setup','Projector, screen, mics','High-speed Wi-Fi','Welcome snacks & lunch buffet (included)','Tea/coffee station','Coordination support'], exclusions:['Team activities','Outdoor setup'] },
  { _id:'s6', name:'Engagement Garden',  category:'engagement', price:35000,  capacity:{min:50,max:200},  duration:1, badge:'',             venue:'garden',  inclusions:['Garden access (5 hours)','Floral stage setup','Sound system','200 guests capacity','Basic catering coordination'], exclusions:['Full catering','Photography','DJ'] },
]

const PACKAGES_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EventVenue',
  name: 'Yashraj Palace',
  url: 'https://www.yashrajpalace.com/events/packages',
  address: { '@type': 'PostalAddress', streetAddress: 'Near Mandleshwar', addressLocality: 'Mandleshwar', addressRegion: 'Madhya Pradesh', postalCode: '451221', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: '22.1740', longitude: '75.6560' },
  maximumAttendeeCapacity: 1000,
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Wedding Garden', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Banquet Hall', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'In-House Catering', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
  ],
}

const FAQ_PACKAGES_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the cheapest event package at Yashraj Palace?', acceptedAnswer: { '@type': 'Answer', text: 'The Birthday Bash package starts at ₹25,000 for up to 150 guests (4 hours). For corporate events, the Corporate Off-Site package starts at ₹55,000 for up to 300 guests with AV setup and lunch buffet included.' } },
    { '@type': 'Question', name: 'What is included in the Royal Wedding package?', acceptedAnswer: { '@type': 'Answer', text: 'The Royal Wedding package (₹1,80,000) includes: full garden + hall access for the full day, premium floral & mandap decor, DJ, lighting & sound system, 300-plate in-house catering, 4 family rooms for 1 night, and a dedicated wedding coordinator.' } },
    { '@type': 'Question', name: 'Can Yashraj Palace accommodate 1,000 wedding guests?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Grand Palace package accommodates up to 1,000 guests and includes full use of the garden, banquet hall, and lawn for 2 days with unlimited catering, custom stage, luxury decor, and 10 rooms for 2 nights.' } },
    { '@type': 'Question', name: 'Is catering included in event packages?', acceptedAnswer: { '@type': 'Answer', text: 'Catering is included in the Royal Wedding (300 plates), Corporate Off-Site (snacks + lunch), and Grand Palace (unlimited catering with live counters) packages. Other packages can be customised with catering add-ons.' } },
  ],
}

const CATS = ['all','wedding','reception','engagement','birthday','corporate','family','cultural']

export default function EventPackagesPage() {
  const { phoneHref, waHref } = useSiteSettings()
  const [packages, setPackages] = useState([])
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    eventsAPI.getPackages()
      .then(r => setPackages(r.data.packages?.length ? r.data.packages : STATIC_PACKAGES))
      .catch(() => setPackages(STATIC_PACKAGES))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? packages : packages.filter(p => p.category === filter)

  return (
    <>
      <Helmet>
        <title>Event Packages &amp; Pricing – Yashraj Palace | Wedding Venue Maheshwar</title>
        <meta name="description" content="View wedding, reception, birthday and corporate event packages at Yashraj Palace. Transparent pricing from ₹25,000. Garden for 1,000+ guests. In-house catering included. Book now." />
        <link rel="canonical" href="https://www.yashrajpalace.com/events/packages" />
        <meta property="og:title" content="Event Packages – Yashraj Palace | Wedding Venue Maheshwar from ₹25,000" />
        <meta property="og:description" content="Wedding, birthday, corporate &amp; reception packages at Yashraj Palace. Transparent pricing from ₹25,000. Garden for 1,000+ guests." />
        <meta property="og:url" content="https://www.yashrajpalace.com/events/packages" />
        <script type="application/ld+json">{JSON.stringify(PACKAGES_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_PACKAGES_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yashrajpalace.com/' },
            { '@type': 'ListItem', position: 2, name: 'Events', item: 'https://www.yashrajpalace.com/events' },
            { '@type': 'ListItem', position: 3, name: 'Event Packages', item: 'https://www.yashrajpalace.com/events/packages' },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <div className="page-hero">
        <div className="container-palace relative z-10 text-center text-white">
          <span className="eyebrow text-gold">Packages &amp; Pricing</span>
          <h1 className="font-serif font-bold text-white mt-3 mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Event Packages
          </h1>
          <div className="flex items-center justify-center gap-4 my-5">
            <span className="h-px bg-gold/50 w-16" />
            <Crown size={14} className="text-gold" />
            <span className="h-px bg-gold/50 w-16" />
          </div>
          <p className="text-white/65 max-w-xl mx-auto text-sm md:text-base">
            Transparent, all-inclusive packages designed for every budget and occasion. No hidden costs, no surprises.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8 text-center">
            {[['₹25,000','Starting Price'],['1,000+','Max Guests'],['6','Package Options']].map(([n,l]) => (
              <div key={l}>
                <div className="font-serif text-gold font-bold text-lg">{n}</div>
                <div className="text-white/45 text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="bg-[#FAF7F2] border-b sticky top-[72px] z-30 overflow-x-auto"
        style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
        <div className="flex gap-0 px-4 md:px-8 py-3">
          {CATS.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`filter-pill shrink-0 mr-1.5 capitalize ${filter === c ? 'filter-pill-active' : 'filter-pill-inactive'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── PACKAGES ── */}
      <section className="section-lg" style={{ background: '#FAF7F2' }}>
        <div className="container-palace">
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-stone-500">
              <p className="font-serif text-2xl text-maroon mb-2">No packages in this category</p>
              <p className="text-sm">Try "All" or <button onClick={() => setFilter('all')} className="text-gold underline">view all packages</button>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filtered.map(pkg => (
                <div key={pkg._id}
                  className={`bg-white flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${
                    pkg.badge === 'Most Popular'
                      ? 'border-2 border-gold shadow-xl hover:shadow-2xl'
                      : 'border border-stone-200 hover:border-gold/40 hover:shadow-lg'
                  }`}>
                  {pkg.badge && (
                    <div className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'linear-gradient(135deg, #E8C97A, #C9A84C)', color: '#4A0F1D' }}>
                      {pkg.badge}
                    </div>
                  )}
                  <div className="p-6 md:p-7 flex flex-col flex-1">
                    <h3 className="font-serif text-xl text-maroon mb-1">{pkg.name}</h3>
                    <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-4 pb-4 border-b border-stone-100 capitalize">
                      {pkg.category} · Up to {pkg.capacity?.max} guests · {pkg.duration} day{pkg.duration > 1 ? 's' : ''}
                    </p>
                    <div className="font-serif text-3xl font-bold text-maroon mb-1">
                      ₹{pkg.price?.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-stone-500 mb-5">Starting price · Custom quote available</p>

                    {pkg.inclusions?.length > 0 && (
                      <div className="mb-4 flex-1">
                        <p className="text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-2">Includes</p>
                        <ul className="space-y-1.5">
                          {pkg.inclusions.map(inc => (
                            <li key={inc} className="flex items-start gap-2 text-sm text-stone-600">
                              <Check size={12} className="text-gold shrink-0 mt-0.5" /> {inc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pkg.exclusions?.length > 0 && (
                      <div className="mb-5">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Not Included</p>
                        <ul className="space-y-1">
                          {pkg.exclusions.map(ex => (
                            <li key={ex} className="text-[11px] text-stone-400">× {ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Link to={`/events/book?package=${pkg._id}`}
                      className={`block text-center py-3 text-[10px] uppercase tracking-wider font-bold transition-all ${
                        pkg.badge === 'Most Popular' ? 'btn-primary' : 'btn-outline'
                      }`}>
                      Book This Package
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CUSTOM QUOTE ── */}
      <section className="section-md bg-white">
        <div className="container-palace">
          <div className="border border-stone-200 p-8 md:p-12 text-center relative">
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold" />
            <span className="eyebrow">Custom Packages</span>
            <h2 className="font-serif text-2xl md:text-3xl text-maroon mb-3">Need Something Tailored?</h2>
            <div className="gold-divider-center mb-5" />
            <p className="text-stone-500 max-w-lg mx-auto text-sm md:text-base mb-7">
              Our events team can build a custom package tailored to your exact guest count, budget, venue preferences, and catering requirements.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/events/book" className="btn-primary">Request Custom Quote</Link>
              <a href={phoneHref} className="btn-outline">
                <Phone size={14} /> Call Now
              </a>
              <a href={waHref} className="btn-whatsapp">
                <FaWhatsapp size={14} /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-md" style={{ background: '#FAF7F2', borderTop: '1px solid #E8E0D8' }}>
        <div className="container-palace">
          <div className="text-center mb-10">
            <span className="eyebrow">Common Questions</span>
            <h2 className="section-title text-maroon">Package FAQs</h2>
            <div className="gold-divider-center" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              ['What is the cheapest event package?', 'Birthday Bash starts at ₹25,000 for 150 guests. Silver Celebration is ₹45,000 for 200 guests.'],
              ['Is catering included in packages?', 'Catering is bundled in Royal Wedding (300 plates), Corporate Off-Site (snacks + lunch), and Grand Palace (unlimited). Other packages allow catering add-ons.'],
              ['Can I customise a package?', 'Absolutely. Contact our events team to build a package tailored to your guest count, venue, budget, and catering needs.'],
              ['How far in advance should I book?', 'We recommend 3–6 months ahead for weddings (peak Oct–Feb) and 1–2 months for other events. Call or WhatsApp to check your date.'],
            ].map(([q, a]) => (
              <div key={q} className="p-5 md:p-6 bg-white border border-stone-200 hover:border-gold/40 transition-colors">
                <p className="font-serif text-base text-maroon font-semibold mb-2">{q}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{a}</p>
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
          <span className="eyebrow text-gold">Ready to Celebrate?</span>
          <h2 className="font-serif font-bold mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
            Book Your Event at Yashraj Palace
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Fill out our inquiry form and our events team will call you within 2 hours with availability and a personalised quote.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/events/book" className="btn-gold btn-lg">Book an Event</Link>
            <a href={waHref} className="btn-whatsapp btn-lg">
              <FaWhatsapp size={14} /> WhatsApp Now
            </a>
          </div>
          <p className="text-white/30 text-[11px] mt-6 uppercase tracking-wider">
            500+ events hosted · Transparent pricing · Reply within 2 hours
          </p>
        </div>
      </section>
    </>
  )
}
