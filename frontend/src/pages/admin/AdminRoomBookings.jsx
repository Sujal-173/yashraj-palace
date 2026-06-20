import { useState, useEffect, useCallback } from 'react'
import { bookingsAPI } from '../../utils/api'
import toast from 'react-hot-toast'
import { FiEye, FiRefreshCw } from 'react-icons/fi'
import {
  AdminPageHeader, SearchBar, StatusBadge, Pagination, Modal, EmptyState
} from '../../components/admin/AdminComponents'

const STATUSES = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']

export default function AdminRoomBookings() {
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [page, setPage]           = useState(1)
  const [pages, setPages]         = useState(1)
  const [total, setTotal]         = useState(0)
  const [selected, setSelected]   = useState(null)
  const [updating, setUpdating]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search
      const { data } = await bookingsAPI.getAll(params)
      setBookings(data.bookings)
      setPages(data.pages)
      setTotal(data.total)
    } catch { toast.error('Failed to load bookings') }
    setLoading(false)
  }, [page, statusFilter, search])

  useEffect(() => { load() }, [load])

  const handleStatusUpdate = async (id, status) => {
    setUpdating(true)
    try {
      await bookingsAPI.updateStatus(id, { status })
      toast.success('Status updated')
      setSelected(s => s ? { ...s, status } : s)
      load()
    } catch { toast.error('Update failed') }
    setUpdating(false)
  }

  const nights = (b) => b.checkIn && b.checkOut
    ? Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000) : 0

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader
        title="Room Bookings"
        subtitle={`${total} total bookings`}
        action={
          <button onClick={load} className="btn-outline text-sm px-4 py-2 flex items-center gap-1.5">
            <FiRefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by ID, name, phone…" />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-maroon text-white' : 'bg-white border border-gray-200 text-charcoal-muted hover:border-maroon'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <EmptyState icon="🏨" title="No bookings found" message="Bookings will appear here once guests start booking." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Booking ID','Guest','Room','Check-In','Check-Out','Nights','Amount','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-maroon font-bold whitespace-nowrap">{b.bookingId}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-charcoal">{b.guestDetails?.name}</div>
                        <div className="text-xs text-charcoal-muted">{b.guestDetails?.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal whitespace-nowrap">{b.room?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-charcoal-muted whitespace-nowrap">{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-charcoal-muted whitespace-nowrap">{new Date(b.checkOut).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-center">{nights(b)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-maroon whitespace-nowrap">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(b)} className="text-maroon hover:text-maroon-dark transition-colors">
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination page={page} pages={pages} onPage={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Booking ${selected?.bookingId}`} wide>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Guest Name', selected.guestDetails?.name],
                ['Phone', selected.guestDetails?.phone],
                ['Email', selected.guestDetails?.email],
                ['Room', selected.room?.name || '—'],
                ['Check-In', new Date(selected.checkIn).toDateString()],
                ['Check-Out', new Date(selected.checkOut).toDateString()],
                ['Nights', nights(selected)],
                ['Guests', `${selected.guests?.adults || 1} adults, ${selected.guests?.children || 0} children`],
                ['Total Amount', `₹${selected.pricing?.totalAmount?.toLocaleString('en-IN')}`],
                ['Advance Paid', `₹${selected.pricing?.advancePaid?.toLocaleString('en-IN')}`],
                ['Balance Due', `₹${selected.pricing?.balanceDue?.toLocaleString('en-IN')}`],
                ['Payment Status', selected.paymentStatus],
                ['Source', selected.source],
                ['Booked On', new Date(selected.createdAt).toLocaleDateString('en-IN')],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs text-charcoal-muted uppercase tracking-wider mb-0.5">{k}</div>
                  <div className="font-medium text-charcoal capitalize">{v || '—'}</div>
                </div>
              ))}
            </div>

            {selected.specialRequests && (
              <div className="bg-ivory-dark rounded-lg p-3">
                <div className="text-xs text-charcoal-muted mb-1 uppercase tracking-wider">Special Requests</div>
                <div className="text-sm text-charcoal">{selected.specialRequests}</div>
              </div>
            )}

            <div>
              <div className="text-xs text-charcoal-muted uppercase tracking-wider mb-2">Current Status: <StatusBadge status={selected.status} /></div>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map(s => (
                  <button key={s} onClick={() => handleStatusUpdate(selected._id, s)} disabled={updating || selected.status === s}
                    className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-all disabled:opacity-50 ${selected.status === s ? 'bg-maroon text-white' : 'border border-gray-200 text-charcoal-muted hover:border-maroon'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
