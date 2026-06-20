import { Link } from 'react-router-dom'
import { FaWhatsapp, FaFacebook, FaInstagram, FaGoogle } from 'react-icons/fa'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useSiteSettings } from '../../context/SiteSettingsContext'

const footerLinks = {
  Stay: [
    { label: 'Deluxe Room',    to: '/rooms/deluxe-room' },
    { label: 'Premium Room',   to: '/rooms/premium-room' },
    { label: 'Family Suite',   to: '/rooms/family-suite' },
    { label: 'Room Amenities', to: '/rooms#amenities' },
    { label: 'Book a Room',    to: '/book-room' },
  ],
  Events: [
    { label: 'Wedding Garden',   to: '/events/wedding' },
    { label: 'Reception Venue',  to: '/events/reception' },
    { label: 'Birthday Parties', to: '/events/birthday' },
    { label: 'Corporate Events', to: '/events/corporate' },
    { label: 'Event Packages',   to: '/events/packages' },
    { label: 'Book an Event',    to: '/events/book' },
  ],
  Explore: [
    { label: 'About Us',            to: '/about' },
    { label: 'Restaurant & Dining', to: '/dining' },
    { label: 'Gallery',             to: '/gallery' },
    { label: 'Nearby Attractions',  to: '/nearby-attractions' },
    { label: 'Guest Reviews',       to: '/reviews' },
    { label: 'Contact Us',          to: '/contact' },
  ],
}

const seoLinks = [
  { label: 'Hotel in Maheshwar',           to: '/hotel-in-maheshwar' },
  { label: 'Hotel in Mandleshwar',         to: '/hotel-in-mandleshwar' },
  { label: 'Wedding Garden in Maheshwar',  to: '/wedding-garden-in-maheshwar' },
  { label: 'Marriage Garden Mandleshwar',  to: '/marriage-garden-in-mandleshwar' },
  { label: 'Hotel near Maheshwar Fort',    to: '/hotel-near-maheshwar-fort' },
  { label: 'Hotel near Narmada Ghat',      to: '/hotel-near-narmada-ghat' },
  { label: 'Event Venue in Maheshwar',     to: '/event-venue-in-maheshwar' },
  { label: 'Luxury Hotel Khargone',        to: '/luxury-hotel-in-khargone' },
]

function ColumnHeading({ children }) {
  return (
    <h4 className="flex items-center gap-2 font-serif text-white text-base mb-6">
      <span className="w-5 h-px bg-gold shrink-0" />
      {children}
    </h4>
  )
}

export default function Footer() {
  const { phone, email, address, phoneHref, waHref, emailHref } = useSiteSettings()
  return (
    <footer className="bg-[#1A1A1A] text-stone-300 border-t-4 border-maroon" aria-label="Site footer">

      {/* WhatsApp CTA strip */}
      <div className="bg-maroon py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-serif text-lg font-semibold text-white">Ready to Book? Let's Talk.</p>
            <p className="text-white/65 text-sm mt-0.5">Call or WhatsApp us — we reply within minutes.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href={waHref}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors">
              <FaWhatsapp size={15} /> WhatsApp Now
            </a>
            <a href={phoneHref}
              className="border border-white/40 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center gap-2">
              <Phone size={13} /> Call Us
            </a>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* Brand */}
          <div>
            <h2 className="font-serif text-xl font-bold text-white tracking-wide" style={{ letterSpacing: '0.06em' }}>
              YASHRAJ PALACE
            </h2>
            <p className="text-gold text-[10px] uppercase tracking-[0.25em] mb-5 mt-1">Heritage Meets Luxury</p>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              A premier hospitality destination near Maheshwar and Mandleshwar, MP — offering premium rooms, a majestic wedding garden, and event spaces for every celebration.
            </p>
            <ul className="space-y-3 text-sm text-stone-400 mb-6">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-gold mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
              <li>
                <a href={phoneHref} className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <Phone size={14} className="text-gold shrink-0" /> {phone}
                </a>
              </li>
              <li>
                <a href={emailHref} className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <Mail size={14} className="text-gold shrink-0" /> {email}
                </a>
              </li>
            </ul>
            <div className="flex gap-3">
              {[
                { href: waHref,                                 icon: <FaWhatsapp size={14} />, label: 'WhatsApp' },
                { href: 'https://facebook.com/yashrajpalace',  icon: <FaFacebook size={14} />, label: 'Facebook' },
                { href: 'https://instagram.com/yashrajpalace', icon: <FaInstagram size={14} />, label: 'Instagram' },
                { href: 'https://g.page/yashrajpalace',        icon: <FaGoogle size={14} />,    label: 'Google' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                  className="w-8 h-8 border border-stone-600 flex items-center justify-center transition-all hover:bg-gold hover:border-gold hover:text-maroon">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Stay */}
          <div>
            <ColumnHeading>Stay</ColumnHeading>
            <ul className="space-y-3">
              {footerLinks.Stay.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-stone-400 hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <ColumnHeading>Events</ColumnHeading>
            <ul className="space-y-3">
              {footerLinks.Events.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-stone-400 hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <ColumnHeading>Explore</ColumnHeading>
            <ul className="space-y-3">
              {footerLinks.Explore.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-stone-400 hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {['20+ Yrs', '500+ Events', '4.8★ Rating', '1000 Guests'].map(b => (
                <span key={b} className="text-[10px] px-2.5 py-1 border border-stone-700 text-stone-500">{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* SEO links */}
        <div className="border-t border-stone-800 py-5">
          <p className="text-[10px] text-stone-600 mb-2.5 text-center uppercase tracking-wider">Also find us as:</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center">
            {seoLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-xs text-stone-600 hover:text-stone-400 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} Yashraj Palace, Mandleshwar, Madhya Pradesh. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="hover:text-stone-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-stone-400 transition-colors">Terms &amp; Conditions</Link>
            <Link to="/cancellation-policy" className="hover:text-stone-400 transition-colors">Cancellation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
