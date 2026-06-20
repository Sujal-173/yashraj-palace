import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Forgot Password | Yashraj Palace</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="font-serif text-2xl text-charcoal mb-2">Forgot Password</h1>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-charcoal-muted mb-4">
                If that email is registered, a reset link has been sent. Please check your inbox.
              </p>
              <Link to="/login" className="text-maroon font-medium hover:underline">Back to Login</Link>
            </div>
          ) : (
            <>
              <p className="text-charcoal-muted text-sm mb-6">
                Enter your registered email and we'll send you a password reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-maroon"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
                <p className="text-center text-sm text-charcoal-muted">
                  <Link to="/login" className="text-maroon hover:underline">Back to Login</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
