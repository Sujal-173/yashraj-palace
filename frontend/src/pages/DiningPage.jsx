import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Crown, Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useSiteSettings } from '../context/SiteSettingsContext'

const MENU_HIGHLIGHTS = [
  { cat: 'Breakfast', emoji: '🌅', items: ['Poha & Jalebi', 'Paratha with Butter', 'Idli Sambar', 'Bread Toast & Eggs', 'Fresh Juice', 'Tea / Coffee'] },
  { cat: 'Lunch',     emoji: '🍛', items: ['Dal Baati Churma', 'Vegetable Curries', 'Roti & Rice', 'Salad & Raita', 'Regional MP Thali', 'Seasonal Vegetables'] },
  { cat: 'Dinner',    emoji: '🌙', items: ['Paneer Dishes', 'Non-Veg Curries', 'Tandoori Items', 'Dal Makhani', 'Biryani', 'Desserts & Sweets'] },
  { cat: 'Snacks',    emoji: '☕', items: ['Samosa & Chaat', 'Pakoda', 'Sandwich', 'Maggi', 'Tea & Coffee', 'Cold Drinks'] },
]

const CATERING_ITEMS = [
  ['🍛', '250+ Dish Menu'],['🎪', 'Live Counters'],['🌿', 'Veg & Non-Veg'],['🍰', 'Dessert Stations'],
  ['🥗', 'Salad & Raita Bar'],['☕', 'Tea/Coffee Station'],['🍢', 'Starters & Snacks'],['🎂', 'Custom Cake Orders'],
]

const RESTAURANT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Yashraj Palace Restaurant',
  servesCuisine: ['Indian', 'Madhya Pradesh', 'North Indian', 'South Indian'],
  priceRange: '₹₹',
  url: 'https://www.yashrajpalace.com/dining',
  telephone: '+91-70000-00000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Mandleshwar',
    addressLocality: 'Mandleshwar',
    addressRegion: 'Madhya Pradesh',
    postalCode: '451221',
    addressCountry: 'IN',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    opens: '07:00',
    closes: '23:00',
  },
  hasMenu: 'https://www.yashrajpalace.com/dining',
  acceptsReservations: true,
  currenciesAccepted: 'INR',
  paymentAccepted: ['Cash', 'UPI', 'Credit Card'],
}

export default function DiningPage() {
  const { phoneHref, waHref } = useSiteSettings()
  return (
    <>
      <Helmet>
        <title>Restaurant &amp; Dining – Yashraj Palace | Indian Cuisine near Maheshwar</title>
        <meta name="description" content="In-house restaurant at Yashraj Palace serving fresh Indian food, regional MP cuisine (dal baati churma, laal maas), and event catering for 50–1,000 guests. Open 7 AM – 11 PM daily." />
        <link rel="canonical" href="https://www.yashrajpalace.com/dining" />
        <meta property="og:title" content="Restaurant &amp; Dining – Yashraj Palace | Indian Cuisine near Maheshwar" />
        <meta property="og:description" content="Fresh Indian meals, regional MP cuisine, and event catering at Yashraj Palace. Open 7 AM – 11 PM. 250+ dish menu." />
        <meta property="og:url" content="https://www.yashrajpalace.com/dining" />
        <script type="application/ld+json">{JSON.stringify(RESTAURANT_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yashrajpalace.com/' },
            { '@type': 'ListItem', position: 2, name: 'Restaurant & Dining', item: 'https://www.yashrajpalace.com/dining' },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <div className="page-hero">
        <div className="container-palace relative z-10 text-center text-white">
          <span className="eyebrow text-gold">Restaurant &amp; Dining</span>
          <h1 className="font-serif font-bold text-white mt-3 mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Food That Feels Like Home
          </h1>
          <div className="flex items-center justify-center gap-4 my-5">
            <span className="h-px bg-gold/50 w-16" />
            <Crown size={14} className="text-gold" />
            <span className="h-px bg-gold/50 w-16" />
          </div>
          <p className="text-white/65 max-w-xl mx-auto text-sm md:text-base">
            Fresh Indian meals, regional Madhya Pradesh cuisine, and event catering that makes every celebration taste as good as it looks.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8 text-center">
            {[['7 AM – 11 PM','Open Daily'],['250+','Dish Menu'],['50–1,000','Catering Range']].map(([n,l]) => (
              <div key={l}>
                <div className="font-serif text-gold font-bold text-base">{n}</div>
                <div className="text-white/45 text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTRO ── */}
      <section className="section-lg bg-white">
        <div className="container-palace">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Image placeholder */}
            <div className="w-full lg:w-[42%] shrink-0">
              <div className="relative" style={{ padding: '10px', border: '1px solid rgba(201,168,76,0.35)' }}>
                <span className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-gold" />
                <span className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-gold" />
                <span className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-gold" />
                <span className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-gold" />
                <div className="h-64 sm:h-80 flex flex-col items-center justify-center text-center relative"
                  style={{ background: 'linear-gradient(135deg, #2A1008, #4A1E0F, #6B2A10)' }}>
                  <div className="text-7xl mb-3 animate-float">🍛</div>
                  <p className="font-serif text-xl italic" style={{ color: 'rgba(201,168,76,0.6)' }}>Royal Kitchen</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Open 7 AM – 11 PM Daily</p>
                  <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-gold/25" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-gold/25" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-[58%]">
              <span className="eyebrow">Our Restaurant</span>
              <h2 className="section-title text-maroon mb-4">In-House Dining at Yashraj Palace</h2>
              <div className="gold-divider mb-6" />
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-4">
                Our restaurant serves hotel guests throughout the day — from a warm breakfast before your Maheshwar sightseeing to a satisfying dinner after a long day of exploration. The menu draws heavily from regional Madhya Pradesh traditions: dal baati churma, laal maas, bafla, and fresh regional produce.
              </p>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-7">
                For events, our catering team offers a 250+ dish menu with live counters, themed food stations, and full-service catering for 50 to 1,000 guests.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                {[
                  ['🕐', 'Open 7 AM – 11 PM'],
                  ['🍽️', 'Veg & Non-Veg Menu'],
                  ['🎪', 'Live Counters for Events'],
                  ['🌿', 'Regional MP Specialties'],
                  ['🧑‍🍳', 'Trained In-House Chef'],
                  ['📦', 'Catering for 50–1,000'],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <span className="text-base">{icon}</span> {text}
                  </div>
                ))}
              </div>
              <Link to="/events/book" className="btn-primary">Enquire for Event Catering</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU HIGHLIGHTS ── */}
      <section className="section-md" style={{ background: '#FAF7F2', borderTop: '1px solid #E8E0D8' }}>
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Menu Highlights</span>
            <h2 className="section-title text-maroon">What We Serve</h2>
            <div className="gold-divider-center" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {MENU_HIGHLIGHTS.map(m => (
              <div key={m.cat}
                className="bg-white p-6 border border-stone-200 hover:border-gold/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gold/20">
                  <span className="text-xl">{m.emoji}</span>
                  <h3 className="font-serif text-lg font-semibold text-maroon">{m.cat}</h3>
                </div>
                <ul className="space-y-2">
                  {m.items.map(item => (
                    <li key={item} className="text-sm text-stone-500 flex items-center gap-2">
                      <span className="w-1 h-1 shrink-0 bg-gold inline-block" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENT CATERING ── */}
      <section className="section-md bg-white">
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Event Catering</span>
            <h2 className="section-title text-maroon">Catering for 50 to 1,000 Guests</h2>
            <div className="gold-divider-center" />
            <p className="text-stone-500 max-w-xl mx-auto text-sm">
              From simple lunch buffets to multi-course wedding feasts with live counters — our kitchen team handles it all.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
            {CATERING_ITEMS.map(([icon, text]) => (
              <div key={text}
                className="bg-stone-50 p-5 text-center border border-stone-200 hover:border-gold/40 hover:-translate-y-1 hover:shadow-md hover:bg-white transition-all duration-300">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-sm font-medium text-maroon">{text}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/events/book" className="btn-primary btn-lg">Enquire for Event Catering</Link>
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
          <span className="eyebrow text-gold">Taste the Palace</span>
          <h2 className="font-serif font-bold mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
            Book a Room &amp; Dine with Us
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Guests staying at Yashraj Palace enjoy complimentary breakfast, and our restaurant is open to all visitors 7 AM – 11 PM daily.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/book-room" className="btn-gold btn-lg">Book a Room</Link>
            <a href={phoneHref} className="btn-outline-gold btn-lg">
              <Phone size={14} /> Call Us
            </a>
            <a href={waHref} className="btn-whatsapp btn-lg">
              <FaWhatsapp size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
