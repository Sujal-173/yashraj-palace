import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { isAdmin } = useAuth()
  const socketRef = useRef(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const socket = io('/', {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    if (isAdmin) {
      socket.emit('join_admin')
    }

    socket.on('new_inquiry', (data) => {
      setNotifications(prev => [{ type: 'inquiry', ...data, id: Date.now() }, ...prev.slice(0, 19)])
      setUnreadCount(c => c + 1)
    })
    socket.on('new_booking', (data) => {
      setNotifications(prev => [{ type: 'booking', ...data, id: Date.now() }, ...prev.slice(0, 19)])
      setUnreadCount(c => c + 1)
    })
    socket.on('new_event', (data) => {
      setNotifications(prev => [{ type: 'event', ...data, id: Date.now() }, ...prev.slice(0, 19)])
      setUnreadCount(c => c + 1)
    })

    return () => {
      socket.emit('leave_admin')
      socket.disconnect()
    }
  }, [isAdmin])

  const clearUnread = useCallback(() => setUnreadCount(0), [])

  const subscribe = useCallback((event, handler) => {
    const s = socketRef.current
    if (!s) return () => {}
    s.on(event, handler)
    return () => s.off(event, handler)
  }, [])

  return (
    <SocketContext.Provider value={{ notifications, unreadCount, clearUnread, subscribe }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
