import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token }             = useParams()
  const navigate              = useNavigate()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      toast.success('Password reset successfully! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Reset Password | Yashraj Palace</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="font-serif text-2xl text-charcoal mb-2">Set New Password</h1>
          <p className="text-charcoal-muted text-sm mb-6">Choose a strong password (at least 6 characters).</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-maroon"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-maroon"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
            <p className="text-center text-sm text-charcoal-muted">
              <Link to="/login" className="text-maroon hover:underline">Back to Login</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
