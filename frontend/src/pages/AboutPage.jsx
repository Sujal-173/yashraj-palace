import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Check, Crown, Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const MILESTONES = [
  { year: '2005', title: 'Founded',           desc: 'Yashraj Palace opened its doors as a boutique hotel near Mandleshwar.' },
  { year: '2010', title: 'Wedding Garden',     desc: 'Expanded with a dedicated wedding garden — now hosting 100+ events per year.' },
  { year: '2015', title: 'Banquet Hall Added', desc: 'State-of-the-art AC banquet hall for 500+ seated guests inaugurated.' },
  { year: '2020', title: 'Restaurant Launch',  desc: 'Full-service in-house restaurant with regional MP cuisine launched.' },
  { year: '2024', title: 'Premium Rooms',      desc: 'Complete renovation of all rooms to premium standard completed.' },
]

const VALUES = [
  { icon: '👑', title: 'Royal Hospitality',  desc: 'Every guest is treated with the warmth and care of a palace household.' },
  { icon: '🏡', title: 'Family-Friendly',    desc: 'Built for families — spacious rooms, safe spaces, and a welcoming atmosphere.' },
  { icon: '✨', title: 'Premium Quality',     desc: 'Clean rooms, quality food, reliable service. No compromises, ever.' },
  { icon: '🤝', title: 'Trust-First',         desc: 'Transparent pricing, honest policies, and always reachable by call or WhatsApp.' },
]

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Yashraj Palace',
  url: 'https://www.yashrajpalace.com/',
  logo: 'https://www.yashrajpalace.com/favicon.svg',
  foundingDate: '2005',
  description: 'Yashraj Palace is a premier hotel, wedding garden and event venue near Maheshwar and Mandleshwar, Madhya Pradesh, serving guests with royal hospitality since 2005.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Mandleshwar',
    addressLocality: 'Mandleshwar',
    addressRegion: 'Madhya Pradesh',
    postalCode: '451221',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-70000-00000',
    contactType: 'customer service',
    availableLanguage: ['Hindi', 'English'],
    hoursAvailable: { '@type': 'OpeningHoursSpecification', opens: '09:00', closes: '22:00' },
  },
  sameAs: ['https://www.facebook.com/yashrajpalace', 'https://www.instagram.com/yashrajpalace'],
}

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Yashraj Palace – Hotel &amp; Wedding Venue near Maheshwar | Est. 2005</title>
        <meta name="description" content="Learn about Yashraj Palace — a premier hotel, wedding garden and event venue near Maheshwar and Mandleshwar, Madhya Pradesh. Serving guests with royal hospitality since 2005." />
        <link rel="canonical" href="https://www.yashrajpalace.com/about" />
        <meta property="og:title" content="About Yashraj Palace – Hotel &amp; Wedding Venue near Maheshwar" />
        <meta property="og:description" content="Premier hotel, wedding garden and event venue near Maheshwar, MP. Est. 2005. 500+ events hosted, 4.8★ rating." />
        <meta property="og:url" content="https://www.yashrajpalace.com/about" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(ORG_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yashrajpalace.com/' },
            { '@type': 'ListItem', position: 2, name: 'About Us', item: 'https://www.yashrajpalace.com/about' },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <div className="page-hero">
        <div className="container-palace relative z-10 text-center text-white">
          <span className="eyebrow text-gold">Our Story</span>
          <h1 className="font-serif font-bold text-white mt-3 mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            About Yashraj Palace
          </h1>
          <div className="flex items-center justify-center gap-4 my-5">
            <span className="h-px bg-gold/50 w-16" />
            <Crown size={14} className="text-gold" />
            <span className="h-px bg-gold/50 w-16" />
          </div>
          <p className="text-white/65 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Two decades of hospitality, hundreds of celebrations, and thousands of guests who left with memories they cherish.
          </p>
        </div>
      </div>

      {/* ── STORY ── */}
      <section className="section-lg bg-white">
        <div className="container-palace">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Ornamental image block */}
            <div className="w-full lg:w-[42%] shrink-0">
              <div className="relative" style={{ padding: '10px', border: '1px solid rgba(201,168,76,0.35)' }}>
                <span className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-gold" />
                <span className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-gold" />
                <span className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-gold" />
                <span className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-gold" />
                <div className="h-64 sm:h-80 relative overflow-hidden flex flex-col items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1A0709, #4A0F1D, #6B1A2B)' }}>
                  <p className="font-serif font-semibold" style={{ fontSize: '4rem', color: 'rgba(201,168,76,0.18)' }}>Est.</p>
                  <p className="font-serif font-bold" style={{ fontSize: '5rem', color: 'rgba(201,168,76,0.45)', marginTop: '-1rem' }}>2005</p>
                  <div className="absolute top-4 left-4 w-7 h-7 border-l border-t border-gold/30" />
                  <div className="absolute bottom-4 right-4 w-7 h-7 border-r border-b border-gold/30" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-[58%]">
              <span className="eyebrow">Who We Are</span>
              <h2 className="section-title text-maroon mb-4">A Palace Built on Hospitality</h2>
              <div className="gold-divider mb-6" />
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-4">
                Yashraj Palace was established with a single vision: to offer guests a destination that combines premium accommodation, grand celebration spaces, and genuine hospitality — all under one roof.
              </p>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-4">
                Located near Mandleshwar in the Khargone district, we are perfectly positioned as a base for travellers exploring Maheshwar Fort, the Narmada Ghats, and Omkareshwar temple. For families hosting weddings and special events, our garden and banquet hall have become one of the most trusted names in the region.
              </p>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-8">
                We believe hospitality is not a service — it is an attitude. Every team member is trained to make guests feel genuinely welcomed, cared for, and valued.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {['20+ years of experience','500+ events hosted','4.8★ average guest rating','1,000-guest garden capacity','In-house catering team','24/7 guest support'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-stone-600">
                    <Check size={13} className="text-gold shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ background: '#6B1A2B' }}>
        <div className="container-palace py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[['20+','Years Experience'],['500+','Events Hosted'],['4.8★','Guest Rating'],['1,000+','Max Guests']].map(([n,l]) => (
              <div key={l}>
                <div className="font-serif text-gold font-bold text-2xl md:text-3xl">{n}</div>
                <div className="text-white/50 text-[10px] uppercase tracking-widest mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VALUES ── */}
      <section className="section-lg" style={{ background: '#FAF7F2' }}>
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">What We Stand For</span>
            <h2 className="section-title text-maroon">Our Values</h2>
            <div className="gold-divider-center" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {VALUES.map(v => (
              <div key={v.title}
                className="group bg-white p-7 text-center border border-stone-200 hover:border-gold/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-4xl mb-5">{v.icon}</div>
                <h3 className="font-serif text-lg text-maroon mb-2">{v.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="section-lg bg-white">
        <div className="container-palace">
          <div className="text-center mb-10 md:mb-14">
            <span className="eyebrow">Our Journey</span>
            <h2 className="section-title text-maroon">Milestones</h2>
            <div className="gold-divider-center" />
          </div>
          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-[4.5rem] md:left-20 top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, transparent, #C9A84C 10%, #C9A84C 90%, transparent)' }} />
            <div className="space-y-8 md:space-y-10">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className="flex gap-6 md:gap-8 items-start">
                  <div className="w-16 md:w-20 shrink-0 text-right pt-0.5">
                    <span className="font-serif text-xl md:text-2xl font-bold text-maroon">{m.year}</span>
                  </div>
                  <div className="relative pt-0.5">
                    {/* Dot */}
                    <div className="absolute -left-[1.85rem] md:-left-[2.15rem] top-2 w-3.5 h-3.5 border-2 border-white shadow"
                      style={{ background: 'linear-gradient(135deg, #E8C97A, #C9A84C)' }} />
                    <h3 className="font-serif text-base font-semibold text-maroon mb-1">{m.title}</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM PHILOSOPHY ── */}
      <section className="section-md" style={{ background: '#FAF7F2', borderTop: '1px solid #E8E0D8' }}>
        <div className="container-palace">
          <div className="max-w-3xl mx-auto text-center">
            <span className="eyebrow">Our Philosophy</span>
            <h2 className="section-title text-maroon mb-4">We Are More Than a Venue</h2>
            <div className="gold-divider-center mb-6" />
            <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-5">
              At Yashraj Palace, every celebration is personal to us. We have seen over 500 families celebrate their most cherished moments within our walls — and each one reminds us why we do what we do.
            </p>
            <p className="text-stone-500 text-sm md:text-base leading-relaxed">
              Our team is locally rooted, hospitality-trained, and genuinely invested in making every guest's experience feel extraordinary — whether it's a 3-night stay or a 1,000-guest wedding.
            </p>
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
          <span className="eyebrow text-gold">Come Experience It</span>
          <h2 className="font-serif font-bold mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
            We'd Love to Host You
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Whether you're planning a quiet stay, a grand wedding, or a corporate event — Yashraj Palace is ready.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/book-room" className="btn-gold btn-lg">Book a Room</Link>
            <Link to="/events/book" className="btn-outline-gold btn-lg">Plan an Event</Link>
            <Link to="/contact" className="btn-outline-gold btn-lg">
              <Phone size={14} /> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
