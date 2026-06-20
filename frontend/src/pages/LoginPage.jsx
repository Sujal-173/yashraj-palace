import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { Crown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || '/'
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.role !== 'user' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Sign In – Yashraj Palace</title>
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
          <div className="text-center mb-10">
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
              <h1 className="font-serif text-2xl font-bold text-maroon">Welcome Back</h1>
              <div className="flex items-center justify-center gap-3 my-3">
                <span className="h-px bg-gold/40 w-10" />
                <span className="text-gold text-xs">✦</span>
                <span className="h-px bg-gold/40 w-10" />
              </div>
              <p className="text-sm text-stone-500">Sign in to view your bookings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-xs tracking-[0.2em] uppercase disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In…' : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-200 text-center space-y-2">
              <p className="text-sm text-stone-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-maroon font-semibold hover:underline">Create one</Link>
              </p>
              <Link to="/" className="text-xs text-stone-400 hover:text-maroon block transition-colors">← Back to Home</Link>
            </div>
          </div>

          {/* Admin hint */}
          <div className="mt-4 px-4 py-3 text-center" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <p className="text-xs text-gold/80">
              <strong className="text-gold">Admin?</strong> Use your admin credentials to access the dashboard.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
