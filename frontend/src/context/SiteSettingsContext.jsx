import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import { useSocket } from './SocketContext'

const DEFAULT = {
  hotelName:      'Yashraj Palace',
  tagline:        'Heritage Meets Luxury',
  phone:          '+91 70000 00000',
  whatsapp:       '917000000000',
  email:          'info@yashrajpalace.com',
  address:        'Near Mandleshwar, Khargone District, Madhya Pradesh – 451221',
  checkIn:        '12:00 PM',
  checkOut:       '11:00 AM',
  tokenAmount:    10000,
  advancePercent: 30,
}

const SiteSettingsContext = createContext(DEFAULT)

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT)
  const { subscribe } = useSocket() || {}

  const load = useCallback(() => {
    api.get('/settings')
      .then(r => setSettings({ ...DEFAULT, ...r.data.settings }))
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  // Live-update: when admin saves settings, re-fetch immediately
  useEffect(() => {
    if (!subscribe) return
    return subscribe('content_updated', (data) => {
      if (data?.type === 'settings') load()
    })
  }, [subscribe, load])

  // Derived helpers so components don't compute these everywhere
  const phoneHref = `tel:${settings.phone.replace(/[\s()-]/g, '')}`
  const waHref    = `https://wa.me/${settings.whatsapp}`
  const emailHref = `mailto:${settings.email}`

  return (
    <SiteSettingsContext.Provider value={{ ...settings, phoneHref, waHref, emailHref }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => useContext(SiteSettingsContext)
