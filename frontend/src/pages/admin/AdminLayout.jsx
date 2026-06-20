import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import {
  FiGrid, FiBookOpen, FiCalendar, FiHome, FiImage,
  FiStar, FiMessageSquare, FiTag, FiPackage, FiSettings,
  FiMenu, FiX, FiLogOut, FiExternalLink, FiBell
} from 'react-icons/fi'

const NAV_ITEMS = [
  { to: '/admin',               label: 'Dashboard',      icon: FiGrid,         exact: true },
  { to: '/admin/bookings',      label: 'Room Bookings',  icon: FiBookOpen },
  { to: '/admin/event-bookings',label: 'Event Bookings', icon: FiCalendar },
  { to: '/admin/rooms',         label: 'Rooms',          icon: FiHome },
  { to: '/admin/packages',      label: 'Packages',       icon: FiPackage },
  { to: '/admin/gallery',       label: 'Gallery',        icon: FiImage },
  { to: '/admin/reviews',       label: 'Reviews',        icon: FiStar },
  { to: '/admin/inquiries',     label: 'Inquiries',      icon: FiMessageSquare },
  { to: '/admin/offers',        label: 'Offers',         icon: FiTag },
  { to: '/admin/settings',      label: 'Settings',       icon: FiSettings },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { unreadCount, clearUnread, notifications } = useSocket()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifs, setShowNotifs]   = useState(false)
  const bellRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Show toast on new notification
  useEffect(() => {
    if (notifications.length === 0) return
    const n = notifications[0]
    if (n.type === 'inquiry')  toast(`📩 New inquiry from ${n.name}`, { duration: 4000 })
    if (n.type === 'booking')  toast(`🏨 New room booking: ${n.guestName}`, { duration: 4000 })
    if (n.type === 'event')    toast(`🎊 New event inquiry: ${n.guestName}`, { duration: 4000 })
  }, [notifications.length])

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <div className="font-serif text-lg text-white font-semibold">Yashraj Palace</div>
        <div className="text-xs text-white/40 tracking-wider uppercase mt-0.5">Admin Panel</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <item.icon size={16} className="shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <FiExternalLink size={13} /> View Live Site
        </a>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-white/40 capitalize">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors" title="Logout">
            <FiLogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-56 bg-maroon-dark flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-maroon-dark flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-serif text-white text-base">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white p-1">
                <FiX size={20} />
              </button>
            </div>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4 shrink-0">
          <button
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
              onClick={() => { setShowNotifs(v => !v); clearUnread() }}
              aria-label="Notifications"
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-maroon text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-charcoal">Live Notifications</span>
                  <Link to="/admin/inquiries" onClick={() => setShowNotifs(false)} className="text-xs text-maroon hover:underline">View All</Link>
                </div>
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No new notifications</div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.slice(0, 10).map(n => (
                      <div key={n.id} className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">
                            {n.type === 'inquiry' ? '📩' : n.type === 'booking' ? '🏨' : '🎊'}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-charcoal">
                              {n.type === 'inquiry' && `New inquiry from ${n.name}`}
                              {n.type === 'booking' && `Room booking: ${n.guestName}`}
                              {n.type === 'event' && `Event inquiry: ${n.guestName}`}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                              {n.type === 'event' ? n.eventType : n.type} · {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 font-medium hidden sm:block">{user?.name}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
