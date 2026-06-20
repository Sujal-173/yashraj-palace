import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../utils/api'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import {
  FiBookOpen, FiCalendar, FiDollarSign, FiUsers,
  FiMessageSquare, FiStar, FiTrendingUp, FiArrowRight, FiRefreshCw
} from 'react-icons/fi'

const STATUS_BADGE = {
  pending:      'bg-yellow-100 text-yellow-700',
  confirmed:    'bg-green-100 text-green-700',
  checked_in:   'bg-blue-100 text-blue-700',
  checked_out:  'bg-gray-100 text-gray-500',
  cancelled:    'bg-red-100 text-red-600',
  inquiry:      'bg-purple-100 text-purple-700',
  advance_paid: 'bg-green-100 text-green-700',
}

const FALLBACK = {
  stats: {
    roomBookings:  { total: 0, confirmed: 0, pending: 0 },
    eventBookings: { total: 0, confirmed: 0 },
    inquiries:     { pending: 0 },
    revenue:       { total: 0, thisMonth: 0 },
    users:         0,
    reviews:       { total: 0, pending: 0 },
  },
  recentBookings: [],
  recentEvents:   [],
}

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const content = (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">{label}</p>
          <p className={`font-serif text-3xl font-semibold ${color || 'text-charcoal'}`}>{value}</p>
          {sub && <p className="text-xs text-charcoal-muted mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color === 'text-maroon' ? 'bg-maroon/10' : 'bg-gray-50'}`}>
          <Icon size={20} className={color || 'text-charcoal-muted'} />
        </div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [data, setData]       = useState(FALLBACK)
  const [loading, setLoading] = useState(true)
  const { subscribe }         = useSocket()

  const load = useCallback(() => {
    setLoading(true)
    adminAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh on real-time events
  useEffect(() => {
    const unsub1 = subscribe('new_booking', (d) => {
      toast(`🏨 New booking: ${d.guestName}`, { duration: 3000 })
      load()
    })
    const unsub2 = subscribe('new_event', (d) => {
      toast(`🎊 New event inquiry: ${d.guestName}`, { duration: 3000 })
      load()
    })
    const unsub3 = subscribe('new_inquiry', (d) => {
      toast(`📩 New inquiry: ${d.name}`, { duration: 3000 })
      load()
    })
    return () => { unsub1(); unsub2(); unsub3() }
  }, [subscribe, load])

  const { stats, recentBookings, recentEvents } = data
  const fmt = (n) => n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n}`

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal">Dashboard</h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5 disabled:opacity-50">
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={FiDollarSign} label="Total Revenue"      value={fmt(stats.revenue.total)}          sub={`This month: ${fmt(stats.revenue.thisMonth)}`} color="text-maroon" />
        <StatCard icon={FiBookOpen}   label="Room Bookings"      value={stats.roomBookings.total}          sub={`${stats.roomBookings.pending} pending`}         color="text-blue-600" to="/admin/bookings" />
        <StatCard icon={FiCalendar}   label="Event Bookings"     value={stats.eventBookings.total}         sub={`${stats.eventBookings.confirmed} confirmed`}     color="text-purple-600" to="/admin/event-bookings" />
        <StatCard icon={FiMessageSquare} label="New Inquiries"   value={stats.inquiries.pending}           sub="Awaiting response"                               color="text-orange-600" to="/admin/inquiries" />
        <StatCard icon={FiUsers}      label="Registered Users"   value={stats.users}                       sub="Total accounts"                                   color="text-charcoal" />
        <StatCard icon={FiStar}       label="Reviews"            value={stats.reviews.total}               sub={`${stats.reviews.pending} awaiting approval`}     color="text-gold" to="/admin/reviews" />
        <StatCard icon={FiTrendingUp} label="Confirmed Bookings" value={stats.roomBookings.confirmed}      sub="Room bookings"                                    color="text-green-600" />
        <StatCard icon={FiCalendar}   label="Events Confirmed"   value={stats.eventBookings.confirmed}     sub="Paid/confirmed"                                   color="text-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Room Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-charcoal">Recent Room Bookings</h2>
            <Link to="/admin/bookings" className="text-xs text-maroon font-semibold hover:underline flex items-center gap-1">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner" /></div>
          ) : recentBookings.length === 0 ? (
            <div className="py-10 text-center text-sm text-charcoal-muted">No bookings yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBookings.map(b => (
                <div key={b._id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-maroon font-bold">{b.bookingId}</span>
                      <span className={`badge text-xs ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                    </div>
                    <div className="text-sm font-medium text-charcoal truncate">{b.guestDetails?.name}</div>
                    <div className="text-xs text-charcoal-muted">{b.room?.name} · {new Date(b.checkIn).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-sm text-maroon">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Event Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-charcoal">Recent Event Inquiries</h2>
            <Link to="/admin/event-bookings" className="text-xs text-maroon font-semibold hover:underline flex items-center gap-1">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner" /></div>
          ) : recentEvents.length === 0 ? (
            <div className="py-10 text-center text-sm text-charcoal-muted">No event inquiries yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentEvents.map(e => (
                <div key={e._id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-maroon font-bold">{e.bookingId}</span>
                      <span className={`badge text-xs ${STATUS_BADGE[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span>
                    </div>
                    <div className="text-sm font-medium text-charcoal truncate">{e.contactDetails?.name}</div>
                    <div className="text-xs text-charcoal-muted capitalize">{e.eventType} · {e.eventDetails?.eventDate ? new Date(e.eventDetails.eventDate).toLocaleDateString('en-IN') : '—'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-sm text-maroon">
                      {e.pricing?.totalEstimate ? `₹${e.pricing.totalEstimate.toLocaleString('en-IN')}` : 'Quote pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-charcoal mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ Add Room',          to: '/admin/rooms' },
            { label: '+ Add Package',       to: '/admin/packages' },
            { label: '+ Add Gallery Image', to: '/admin/gallery' },
            { label: '+ Add Offer',         to: '/admin/offers' },
            { label: 'Approve Reviews',     to: '/admin/reviews' },
            { label: 'View Inquiries',      to: '/admin/inquiries' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="btn-outline text-xs px-4 py-2">{a.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
