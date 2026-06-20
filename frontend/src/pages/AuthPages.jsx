// LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || '/'
  const [form, setForm]         = useState({ email:'', password:'' })
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.role !== 'user' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet><title>Login – Yashraj Palace</title></Helmet>
      <div className="min-h-screen bg-ivory-dark flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-2xl font-semibold text-maroon">Yashraj Palace</Link>
            <p className="text-xs text-gold tracking-widest uppercase mt-1">Hotel · Wedding Garden · Events</p>
          </div>
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
            <h1 className="font-serif text-xl font-semibold mb-5 text-center">Sign In</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="your@email.com" required /></div>
              <div><label className="label">Password</label><input type="password" className="input-field" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" required /></div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                {loading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>
            <p className="text-center text-sm text-charcoal-muted mt-4">
              Don't have an account? <Link to="/register" className="text-maroon font-semibold hover:underline">Register</Link>
            </p>
          </div>
          <p className="text-center text-xs text-charcoal-muted mt-4">
            <Link to="/" className="hover:text-maroon">← Back to Home</Link>
          </p>
        </div>
      </div>
    </>
  )
}

// RegisterPage.jsx
export function RegisterPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const [form, setForm]       = useState({ name:'', email:'', phone:'', password:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) { toast.error('All fields required'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to Yashraj Palace.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet><title>Register – Yashraj Palace</title></Helmet>
      <div className="min-h-screen bg-ivory-dark flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-2xl font-semibold text-maroon">Yashraj Palace</Link>
            <p className="text-xs text-gold tracking-widest uppercase mt-1">Hotel · Wedding Garden · Events</p>
          </div>
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
            <h1 className="font-serif text-xl font-semibold mb-5 text-center">Create Account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Full Name *</label><input className="input-field" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Your full name" required /></div>
              <div><label className="label">Email *</label><input type="email" className="input-field" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="your@email.com" required /></div>
              <div><label className="label">Phone *</label><input className="input-field" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 XXXXX XXXXX" required /></div>
              <div><label className="label">Password *</label><input type="password" className="input-field" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters" required /></div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Account →'}
              </button>
            </form>
            <p className="text-center text-sm text-charcoal-muted mt-4">
              Already have an account? <Link to="/login" className="text-maroon font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// MyBookingsPage.jsx
export function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const { useEffect } = require('react')

  useEffect(() => {
    bookingsAPI.getMy()
      .then(r => setBookings(r.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { bookingsAPI } = require('../../utils/api')

  return (
    <>
      <Helmet><title>My Bookings – Yashraj Palace</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-serif text-3xl font-semibold mb-8">My Bookings</h1>
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner"/></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-charcoal-muted">
            <div className="text-5xl mb-4">🏨</div>
            <p className="text-lg font-medium mb-2">No bookings yet</p>
            <p className="text-sm mb-6">Book a room or event to see your bookings here.</p>
            <Link to="/rooms" className="btn-primary text-sm px-6">Browse Rooms</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b._id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-maroon font-bold">{b.bookingId}</span>
                    <span className={`badge text-xs ${b.status==='confirmed'?'bg-green-100 text-green-700':b.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                  </div>
                  <div className="font-semibold text-charcoal">{b.room?.name}</div>
                  <div className="text-sm text-charcoal-muted">{new Date(b.checkIn).toDateString()} → {new Date(b.checkOut).toDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg font-semibold text-maroon">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</div>
                  <Link to={`/booking-confirmation/${b.bookingId}`} className="text-xs text-maroon hover:underline">View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
