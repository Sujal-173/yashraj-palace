import axios from 'axios'

const api = axios.create({
  baseURL: 'https://yashraj-palace.onrender.com/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('yp_token')
      localStorage.removeItem('yp_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// ─── ROOMS ────────────────────────────────────────────────────────────────────
export const roomsAPI = {
  getAll:              (params) => api.get('/rooms', { params }),
  getBySlug:           (slug)   => api.get(`/rooms/${slug}`),
  checkAvailability:   (data)   => api.post('/rooms/check-availability', data),
  getUnavailableDates: (id)     => api.get(`/rooms/${id}/unavailable-dates`),
  // Admin
  adminGetAll: ()              => api.get('/rooms/admin/all'),
  create:      (data)          => api.post('/rooms', data),
  update:      (id, data)      => api.put(`/rooms/${id}`, data),
  delete:      (id)            => api.delete(`/rooms/${id}`),
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create:       (data)      => api.post('/bookings', data),
  getMy:        ()          => api.get('/bookings/my'),
  getById:      (id)        => api.get(`/bookings/${id}`),               // MongoDB _id, requires auth
  lookup:       (bookingId, phone) => api.get('/bookings/lookup', { params: { bookingId, phone } }), // No auth, uses bookingId + phone
  cancel:       (id, data)  => api.put(`/bookings/${id}/cancel`, data),  // MongoDB _id, requires auth
  // Admin / staff
  getAll:       (params)    => api.get('/bookings/admin/all', { params }),
  updateStatus: (id, data)  => api.put(`/bookings/admin/${id}/status`, data),
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
export const eventsAPI = {
  book:          (data)      => api.post('/events/book', data),
  checkDate:     (data)      => api.post('/events/check-date', data),
  getPackages:   (params)    => api.get('/packages', { params }),
  getPackage:    (slug)      => api.get(`/packages/${slug}`),
  // Admin / staff
  getAll:        (params)    => api.get('/events/admin/all', { params }),
  updateStatus:  (id, data)  => api.put(`/events/admin/${id}/status`, data),
  createPackage: (data)      => api.post('/packages', data),
  updatePackage: (id, data)  => api.put(`/packages/${id}`, data),
  deletePackage: (id)        => api.delete(`/packages/${id}`),
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  // Note: amount is NOT sent — backend computes it from the booking record
  createOrder: (data)      => api.post('/payments/create-order', data),  // { bookingId, bookingType }
  verify:      (data)      => api.post('/payments/verify', data),
  // Admin only
  refund:      (data)      => api.post('/payments/admin/refund', data),  // { paymentId, amount?, reason? }
  getAll:      (params)    => api.get('/payments/admin/all', { params }),
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getAll:      (params)   => api.get('/reviews', { params }),
  create:      (data)     => api.post('/reviews', data),
  // Admin / staff
  adminGetAll: (params)   => api.get('/reviews/admin/all', { params }),
  update:      (id, data) => api.put(`/reviews/admin/${id}`, data),
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
export const galleryAPI = {
  getAll:  (params)   => api.get('/gallery', { params }),
  add:     (data)     => api.post('/gallery', data),
  update:  (id, data) => api.put(`/gallery/${id}`, data),
  delete:  (id)       => api.delete(`/gallery/${id}`),
}

// ─── INQUIRIES ────────────────────────────────────────────────────────────────
export const inquiriesAPI = {
  create:  (data)     => api.post('/inquiries', data),
  getAll:  (params)   => api.get('/inquiries/admin/all', { params }),
  update:  (id, data) => api.put(`/inquiries/admin/${id}`, data),
}

// ─── OFFERS ───────────────────────────────────────────────────────────────────
export const offersAPI = {
  getAll:      ()          => api.get('/offers'),
  adminGetAll: ()          => api.get('/offers/admin/all'),
  validate:    (data)      => api.post('/offers/validate', data),
  create:      (data)      => api.post('/offers/admin', data),
  update:      (id, data)  => api.put(`/offers/admin/${id}`, data),
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export const settingsAPI = {
  get:    ()     => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
}

export default api
