import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SocketProvider>
              <SiteSettingsProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                    success: { iconTheme: { primary: '#6B1A2B', secondary: '#FAF7F2' } },
                  }}
                />
              </SiteSettingsProvider>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
