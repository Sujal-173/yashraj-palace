import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, Mail, MapPin, User, LogOut } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useSiteSettings } from '../../context/SiteSettingsContext'

const navLinks = [
  { label: 'Stay',       to: '/rooms' },
  { label: 'Weddings',   to: '/events/wedding' },
  { label: 'Events',     to: '/events' },
  { label: 'Dining',     to: '/dining' },
  { label: 'Gallery',    to: '/gallery' },
  { label: 'Nearby',     to: '/nearby-attractions' },
  { label: 'Contact',    to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { phone, email, address, phoneHref, waHref } = useSiteSettings()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Top strip */}
      <div className="bg-maroon text-white hidden md:flex">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center w-full text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone size={12} className="text-gold" />
              <a href={phoneHref} className="hover:text-gold transition-colors">{phone}</a>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={12} className="text-gold" />
              <a href={`mailto:${email}`} className="hover:text-gold transition-colors">{email}</a>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70">
            <MapPin size={12} className="text-gold" />
            <span>{address}</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className="bg-[#FAF7F2]/97 border-b transition-all duration-300"
        style={{
          borderColor: 'rgba(201,168,76,0.3)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">

            {/* Logo */}
            <Link to="/" className="flex flex-col leading-none group">
              <span
                className="font-serif font-bold text-maroon tracking-wide transition-colors group-hover:text-[#8A243A]"
                style={{ fontSize: '1.35rem', letterSpacing: '0.06em' }}
              >
                YASHRAJ PALACE
              </span>
              <span className="text-gold text-[10px] tracking-[0.25em] uppercase mt-0.5">
                Heritage Meets Luxury
              </span>
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden lg:flex items-center gap-7">
              {navLinks.map(l => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                        isActive ? 'text-maroon' : 'text-stone-600 hover:text-maroon'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            
              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin" className="text-xs font-bold text-maroon hover:underline px-2 uppercase tracking-wider">
                      Admin
                    </Link>
                  )}
                  <Link to="/my-bookings" className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-maroon transition-colors uppercase tracking-wider">
                    <User size={14} /> {user.name.split(' ')[0]}
                  </Link>
                  <button onClick={logout} className="text-stone-500 hover:text-maroon transition-colors p-1" title="Logout">
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-600 hover:text-maroon transition-colors">
                  Login
                </Link>
              )}

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/events/book"
                className="border border-maroon text-maroon text-xs font-bold uppercase tracking-[0.12em] px-5 py-2.5 transition-all hover:bg-maroon hover:text-white"
              >
                Book Event
              </Link>
              <Link
                to="/book-room"
                className="bg-maroon text-white text-xs font-bold uppercase tracking-[0.12em] px-5 py-2.5 transition-all hover:bg-[#8A243A]"
              >
                Book Room
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-maroon transition-colors"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-gold/20 bg-[#FAF7F2] animate-slide-down">
            <ul className="flex flex-col">
              {navLinks.map(l => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] border-b border-stone-100 transition-colors ${
                        isActive ? 'text-maroon bg-gold/5' : 'text-stone-600 hover:text-maroon hover:bg-gold/5'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2.5 px-6 py-5">
              <Link to="/book-room" onClick={() => setOpen(false)}
                className="bg-maroon text-white text-center text-xs font-bold uppercase tracking-[0.15em] py-3.5 hover:bg-[#8A243A] transition-colors">
                Book Room
              </Link>
              <Link to="/events/book" onClick={() => setOpen(false)}
                className="border border-maroon text-maroon text-center text-xs font-bold uppercase tracking-[0.15em] py-3.5 hover:bg-maroon hover:text-white transition-colors">
                Book Event
              </Link>
              <a href={waHref} className="bg-green-500 text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider py-3.5 rounded-sm hover:bg-green-600 transition-colors">
                <FaWhatsapp size={15} /> WhatsApp Now
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
