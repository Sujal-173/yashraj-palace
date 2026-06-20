import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Validate token with server on startup — don't trust stale localStorage alone
  useEffect(() => {
    const token = localStorage.getItem('yp_token')
    if (!token) { setLoading(false); return }

    authAPI.getMe()
      .then(({ data }) => {
        localStorage.setItem('yp_user', JSON.stringify(data.user))
        setUser(data.user)
      })
      .catch(() => {
        localStorage.removeItem('yp_token')
        localStorage.removeItem('yp_user')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('yp_token', data.token)
    localStorage.setItem('yp_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData)
    localStorage.setItem('yp_token', data.token)
    localStorage.setItem('yp_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('yp_token')
    localStorage.removeItem('yp_user')
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const isAdmin = user?.role === 'admin' || user?.role === 'staff'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
