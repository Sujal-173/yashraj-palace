import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { Crown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error('All fields are required'); return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      toast.success('Account created! Welcome to Yashraj Palace.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <>
      <Helmet>
        <title>Create Account – Yashraj Palace</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2E0912 0%, #4A0F1D 40%, #6B1A2B 100%)' }}>

        {/* Background ornament pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)',
            backgroundSize: '28px 28px',
            opacity: 0.06,
          }} />

        <div className="w-full max-w-sm relative z-10">

          {/* Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px bg-gold/50 w-10" />
              <Crown size={20} className="text-gold" />
              <span className="h-px bg-gold/50 w-10" />
            </div>
            <Link to="/" className="font-serif text-3xl font-bold text-white tracking-wide" style={{ letterSpacing: '0.06em' }}>
              YASHRAJ PALACE
            </Link>
            <p className="text-gold text-[10px] tracking-[0.3em] uppercase mt-1.5">Hotel · Wedding Garden · Events</p>
          </div>

          {/* Card with ornamental border */}
          <div className="relative bg-[#FAF7F2] p-8" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
            {/* Corner brackets */}
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold -translate-x-1 -translate-y-1" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold translate-x-1 -translate-y-1" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold -translate-x-1 translate-y-1" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold translate-x-1 translate-y-1" />

            <div className="text-center mb-7">
              <h1 className="font-serif text-2xl font-bold text-maroon">Create Account</h1>
              <div className="flex items-center justify-center gap-3 my-3">
                <span className="h-px bg-gold/40 w-10" />
                <span className="text-gold text-xs">✦</span>
                <span className="h-px bg-gold/40 w-10" />
              </div>
              <p className="text-sm text-stone-500">Manage your bookings with ease</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" required />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" className="input-field" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" required />
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" className="input-field" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" required />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 text-xs tracking-[0.2em] uppercase disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Creating Account…' : 'Create Account →'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-stone-200 text-center">
              <p className="text-sm text-stone-500">
                Already have an account?{' '}
                <Link to="/login" className="text-maroon font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
