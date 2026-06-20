import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useSiteSettings } from './context/SiteSettingsContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import { FaWhatsapp } from 'react-icons/fa'

// Public pages
import HomePage              from './pages/HomePage'
import AboutPage             from './pages/AboutPage'
import RoomsPage             from './pages/RoomsPage'
import RoomDetailPage        from './pages/RoomDetailPage'
import EventsPage            from './pages/EventsPage'
import EventBookPage         from './pages/EventBookPage'
import EventPackagesPage     from './pages/EventPackagesPage'
import DiningPage            from './pages/DiningPage'
import GalleryPage           from './pages/GalleryPage'
import NearbyPage            from './pages/NearbyPage'
import ReviewsPage           from './pages/ReviewsPage'
import ContactPage           from './pages/ContactPage'
import BookingConfirmPage    from './pages/BookingConfirmPage'
import LoginPage             from './pages/LoginPage'
import RegisterPage          from './pages/RegisterPage'
import MyBookingsPage        from './pages/MyBookingsPage'
import ForgotPasswordPage    from './pages/ForgotPasswordPage'
import ResetPasswordPage     from './pages/ResetPasswordPage'

// SEO landing pages
import SeoLandingPage        from './pages/SeoLandingPage'

// Admin pages
import AdminLayout           from './pages/admin/AdminLayout'
import AdminDashboard        from './pages/admin/AdminDashboard'
import AdminRoomBookings     from './pages/admin/AdminRoomBookings'
import AdminEventBookings    from './pages/admin/AdminEventBookings'
import AdminRooms            from './pages/admin/AdminRooms'
import AdminGallery          from './pages/admin/AdminGallery'
import AdminReviews          from './pages/admin/AdminReviews'
import AdminInquiries        from './pages/admin/AdminInquiries'
import AdminOffers           from './pages/admin/AdminOffers'
import AdminPackages         from './pages/admin/AdminPackages'
import AdminSettings         from './pages/admin/AdminSettings'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="spinner"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !['admin', 'staff'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

const PublicLayout = ({ children }) => {
  const { waHref } = useSiteSettings()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="wa-float"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={26} color="white" />
      </a>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes with Navbar+Footer */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/rooms" element={<PublicLayout><RoomsPage /></PublicLayout>} />
      <Route path="/rooms/:slug" element={<PublicLayout><RoomDetailPage /></PublicLayout>} />
      <Route path="/book-room" element={<PublicLayout><RoomsPage /></PublicLayout>} />
      <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
      <Route path="/events/book" element={<PublicLayout><EventBookPage /></PublicLayout>} />
      <Route path="/events/packages" element={<PublicLayout><EventPackagesPage /></PublicLayout>} />
      <Route path="/events/:type" element={<PublicLayout><EventsPage /></PublicLayout>} />
      <Route path="/dining" element={<PublicLayout><DiningPage /></PublicLayout>} />
      <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
      <Route path="/nearby-attractions" element={<PublicLayout><NearbyPage /></PublicLayout>} />
      <Route path="/reviews" element={<PublicLayout><ReviewsPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
      <Route path="/reset-password/:token" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
      <Route path="/booking-confirmation/:bookingId" element={<PublicLayout><BookingConfirmPage /></PublicLayout>} />

      {/* SEO landing pages */}
      <Route path="/hotel-in-maheshwar"              element={<PublicLayout><SeoLandingPage slug="hotel-in-maheshwar" /></PublicLayout>} />
      <Route path="/hotel-in-mandleshwar"            element={<PublicLayout><SeoLandingPage slug="hotel-in-mandleshwar" /></PublicLayout>} />
      <Route path="/wedding-garden-in-maheshwar"     element={<PublicLayout><SeoLandingPage slug="wedding-garden-in-maheshwar" /></PublicLayout>} />
      <Route path="/marriage-garden-in-mandleshwar"  element={<PublicLayout><SeoLandingPage slug="marriage-garden-in-mandleshwar" /></PublicLayout>} />
      <Route path="/hotel-near-maheshwar-fort"       element={<PublicLayout><SeoLandingPage slug="hotel-near-maheshwar-fort" /></PublicLayout>} />
      <Route path="/hotel-near-narmada-ghat"         element={<PublicLayout><SeoLandingPage slug="hotel-near-narmada-ghat" /></PublicLayout>} />
      <Route path="/event-venue-in-maheshwar"        element={<PublicLayout><SeoLandingPage slug="event-venue-in-maheshwar" /></PublicLayout>} />
      <Route path="/luxury-hotel-in-khargone"        element={<PublicLayout><SeoLandingPage slug="luxury-hotel-in-khargone" /></PublicLayout>} />

      {/* Protected user routes */}
      <Route path="/my-bookings" element={
        <ProtectedRoute><PublicLayout><MyBookingsPage /></PublicLayout></ProtectedRoute>
      } />

      {/* Admin routes - no public layout */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings"       element={<AdminRoomBookings />} />
        <Route path="event-bookings" element={<AdminEventBookings />} />
        <Route path="rooms"          element={<AdminRooms />} />
        <Route path="gallery"        element={<AdminGallery />} />
        <Route path="reviews"        element={<AdminReviews />} />
        <Route path="inquiries"      element={<AdminInquiries />} />
        <Route path="offers"         element={<AdminOffers />} />
        <Route path="packages"       element={<AdminPackages />} />
        <Route path="settings"       element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <PublicLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="font-serif text-8xl text-maroon/20 mb-4">404</div>
            <h1 className="font-serif text-3xl text-charcoal mb-3">Page Not Found</h1>
            <p className="text-charcoal-muted mb-6">The page you're looking for doesn't exist.</p>
            <a href="/" className="btn-primary">Back to Home</a>
          </div>
        </PublicLayout>
      } />
    </Routes>
  )
}
