import { useState, useEffect, useCallback } from 'react'
import { eventsAPI, roomsAPI, galleryAPI, reviewsAPI, inquiriesAPI, offersAPI, settingsAPI } from '../../utils/api'
import toast from 'react-hot-toast'
import { FiEye, FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi'
import {
  AdminPageHeader, SearchBar, StatusBadge, Pagination, Modal, EmptyState, ConfirmModal
} from '../../components/admin/AdminComponents'

// ─── EVENT BOOKINGS ─────────────────────────────────────────────────────────
export function AdminEventBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [total, setTotal]       = useState(0)
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search
      const { data } = await eventsAPI.getAll(params)
      setBookings(data.bookings)
      setPages(data.pages)
      setTotal(data.total)
    } catch { toast.error('Failed to load event bookings') }
    setLoading(false)
  }, [page, statusFilter, search])

  useEffect(() => { load() }, [load])

  const handleUpdate = async () => {
    if (!selected || !newStatus) return
    setUpdating(true)
    try {
      await eventsAPI.updateStatus(selected._id, { status: newStatus, adminNotes })
      toast.success('Event booking updated')
      setSelected(null)
      load()
    } catch { toast.error('Update failed') }
    setUpdating(false)
  }

  const STATUSES = ['all', 'inquiry', 'quote_sent', 'confirmed', 'advance_paid', 'completed', 'cancelled']

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader title="Event Bookings" subtitle={`${total} total inquiries & bookings`}
        action={<button onClick={load} className="btn-outline text-sm px-4 py-2 flex items-center gap-1.5"><FiRefreshCw size={14} /> Refresh</button>}
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by ID, name, phone…" />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === s ? 'bg-maroon text-white' : 'bg-white border border-gray-200 text-charcoal-muted hover:border-maroon'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner" /></div>
        : bookings.length === 0 ? <EmptyState icon="🎊" title="No event bookings yet" />
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Booking ID','Contact','Event Type','Date','Guests','Estimate','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-maroon font-bold">{b.bookingId}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{b.contactDetails?.name}</div>
                      <div className="text-xs text-charcoal-muted">{b.contactDetails?.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{b.eventType}</td>
                    <td className="px-4 py-3 text-sm text-charcoal-muted whitespace-nowrap">{b.eventDetails?.eventDate ? new Date(b.eventDetails.eventDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-center">{b.eventDetails?.guestCount || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-maroon">{b.pricing?.totalEstimate ? `₹${b.pricing.totalEstimate.toLocaleString('en-IN')}` : 'TBD'}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(b); setNewStatus(b.status); setAdminNotes(b.adminNotes||'') }} className="text-maroon hover:text-maroon-dark">
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 pb-4"><Pagination page={page} pages={pages} onPage={setPage} /></div>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Event Booking ${selected?.bookingId}`} wide>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Contact', selected.contactDetails?.name],
                ['Phone', selected.contactDetails?.phone],
                ['Email', selected.contactDetails?.email],
                ['Event Type', selected.eventType],
                ['Date', selected.eventDetails?.eventDate ? new Date(selected.eventDetails.eventDate).toDateString() : '—'],
                ['Guest Count', selected.eventDetails?.guestCount],
                ['Venue', selected.eventDetails?.venue || '—'],
                ['Catering', selected.eventDetails?.cateringRequired ? 'Yes' : 'No'],
                ['Rooms Required', selected.eventDetails?.roomsRequired || 0],
                ['Package', selected.package?.name || 'Custom'],
                ['Estimate', selected.pricing?.totalEstimate ? `₹${selected.pricing.totalEstimate.toLocaleString('en-IN')}` : 'TBD'],
                ['Token Paid', selected.paymentStatus === 'token_paid' ? 'Yes' : 'No'],
              ].map(([k,v]) => (
                <div key={k}><div className="text-xs text-charcoal-muted mb-0.5">{k}</div><div className="font-medium capitalize">{v || '—'}</div></div>
              ))}
            </div>
            {selected.eventDetails?.specialRequirements && (
              <div className="bg-ivory-dark rounded-lg p-3">
                <div className="text-xs text-charcoal-muted mb-1">Special Requirements</div>
                <div className="text-sm">{selected.eventDetails.specialRequirements}</div>
              </div>
            )}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div>
                <label className="label">Update Status</label>
                <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {['inquiry','quote_sent','confirmed','advance_paid','completed','cancelled'].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Admin Notes</label>
                <textarea className="input-field resize-none" rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Notes visible only to admin…" />
              </div>
              <button onClick={handleUpdate} disabled={updating} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ─── ROOMS ───────────────────────────────────────────────────────────────────
export function AdminRooms() {
  const [rooms, setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [delConfirm, setDelConfirm] = useState(null)

  const EMPTY = { name:'', type:'deluxe', price:'', discountedPrice:'', capacity:2, bedType:'queen', size:'', description:'', shortDesc:'', amenities:'Free Wi-Fi, AC, TV, Hot Water, Room Service', isActive:true }
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    setLoading(true)
    try { const { data } = await roomsAPI.adminGetAll(); setRooms(data.rooms) }
    catch { toast.error('Failed to load rooms') }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (r) => {
    setForm({ ...r, amenities: (r.amenities || []).join(', '), price: r.price?.toString(), discountedPrice: r.discountedPrice?.toString() || '', size: r.size?.toString() || '' })
    setEditing(r._id); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.type) { toast.error('Name, type and price are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined, size: form.size ? Number(form.size) : undefined, amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean) }
      if (editing) await roomsAPI.update(editing, payload)
      else await roomsAPI.create(payload)
      toast.success(editing ? 'Room updated' : 'Room added')
      setShowForm(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try { await roomsAPI.delete(id); toast.success('Room deactivated'); load() }
    catch { toast.error('Failed') }
    setDelConfirm(null)
  }

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader title="Rooms" subtitle={`${rooms.length} rooms`}
        action={<button onClick={openAdd} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"><FiPlus size={14}/> Add Room</button>}
      />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner"/></div>
        : rooms.length === 0 ? <EmptyState icon="🏨" title="No rooms yet" message="Add your first room to get started." action={<button onClick={openAdd} className="btn-primary text-sm px-5">Add Room</button>} />
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr>{['Room','Type','Price','Discounted','Capacity','Bed','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {rooms.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-charcoal-muted">{r.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{r.type}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-maroon">₹{r.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{r.discountedPrice ? `₹${r.discountedPrice.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-center">{r.capacity}</td>
                    <td className="px-4 py-3 text-sm capitalize">{r.bedType}</td>
                    <td className="px-4 py-3"><span className={`badge ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(r)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15}/></button>
                      <button onClick={() => setDelConfirm(r._id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={15}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Room' : 'Add New Room'} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Room Name *</label><input className="input-field" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Deluxe Room" /></div>
            <div><label className="label">Type *</label><select className="input-field" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}><option value="deluxe">Deluxe</option><option value="premium">Premium</option><option value="suite">Suite</option><option value="family">Family</option></select></div>
            <div><label className="label">Bed Type</label><select className="input-field" value={form.bedType} onChange={e => setForm(p=>({...p,bedType:e.target.value}))}>{['single','double','queen','king','twin'].map(b=><option key={b} value={b}>{b}</option>)}</select></div>
            <div><label className="label">Price (₹) *</label><input type="number" className="input-field" value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} placeholder="1800" /></div>
            <div><label className="label">Discounted Price (₹)</label><input type="number" className="input-field" value={form.discountedPrice} onChange={e => setForm(p=>({...p,discountedPrice:e.target.value}))} placeholder="Optional" /></div>
            <div><label className="label">Capacity (guests)</label><input type="number" className="input-field" value={form.capacity} onChange={e => setForm(p=>({...p,capacity:e.target.value}))} /></div>
            <div><label className="label">Size (sq ft)</label><input type="number" className="input-field" value={form.size} onChange={e => setForm(p=>({...p,size:e.target.value}))} placeholder="280" /></div>
          </div>
          <div><label className="label">Short Description</label><input className="input-field" value={form.shortDesc} onChange={e => setForm(p=>({...p,shortDesc:e.target.value}))} placeholder="One-line summary" /></div>
          <div><label className="label">Full Description *</label><textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Detailed room description…" /></div>
          <div><label className="label">Amenities (comma-separated)</label><input className="input-field" value={form.amenities} onChange={e => setForm(p=>({...p,amenities:e.target.value}))} placeholder="Free Wi-Fi, AC, TV, Hot Water" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p=>({...p,isActive:e.target.checked}))} className="accent-maroon" /><label className="text-sm text-charcoal">Active (visible on website)</label></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Room'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!delConfirm} title="Deactivate Room?" message="This will hide the room from the website. You can reactivate it later." onConfirm={() => handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} danger />
    </div>
  )
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
export function AdminGallery() {
  const [images, setImages]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [catFilter, setCat]   = useState('all')
  const CATS = ['all','rooms','weddings','garden','banquet','food','property','events']
  const [form, setForm] = useState({ url:'', alt:'', title:'', category:'rooms', caption:'', isFeatured:false, sortOrder:0 })

  const load = async () => {
    setLoading(true)
    try { const { data } = await galleryAPI.getAll(); setImages(data.images) }
    catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const shown = catFilter === 'all' ? images : images.filter(i => i.category === catFilter)

  const handleAdd = async () => {
    if (!form.url || !form.category) { toast.error('URL and category required'); return }
    setSaving(true)
    try { await galleryAPI.add(form); toast.success('Image added'); setShowForm(false); load() }
    catch { toast.error('Failed to add image') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return
    try { await galleryAPI.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader title="Gallery" subtitle={`${images.length} images`}
        action={<button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"><FiPlus size={14}/> Add Image</button>}
      />
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${catFilter===c?'bg-maroon text-white':'bg-white border border-gray-200 text-charcoal-muted hover:border-maroon'}`}>{c}</button>)}
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="spinner"/></div>
      : shown.length === 0 ? <EmptyState icon="🖼" title="No images" message="Add gallery images to display on the website." />
      : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {shown.map(img => (
            <div key={img._id} className="relative group rounded-xl overflow-hidden bg-ivory-dark aspect-square">
              {img.url ? <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-charcoal-muted/30 text-xs capitalize">{img.category}</div>}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => handleDelete(img._id)} className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"><FiTrash2 size={14}/></button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-1.5 text-white text-xs capitalize opacity-0 group-hover:opacity-100 transition-opacity">{img.category}</div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Gallery Image">
        <div className="space-y-4">
          <div><label className="label">Image URL *</label><input className="input-field" value={form.url} onChange={e => setForm(p=>({...p,url:e.target.value}))} placeholder="https://…" /></div>
          <div><label className="label">Category *</label><select className="input-field" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>{['rooms','weddings','garden','banquet','food','property','events'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Title</label><input className="input-field" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} /></div>
            <div><label className="label">Alt Text</label><input className="input-field" value={form.alt} onChange={e => setForm(p=>({...p,alt:e.target.value}))} /></div>
          </div>
          <div><label className="label">Caption</label><input className="input-field" value={form.caption} onChange={e => setForm(p=>({...p,caption:e.target.value}))} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p=>({...p,isFeatured:e.target.checked}))} className="accent-maroon"/><label className="text-sm">Feature on homepage</label></div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">{saving?'Adding…':'Add Image'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const load = async () => {
    setLoading(true)
    try { const { data } = await reviewsAPI.adminGetAll(); setReviews(data.reviews) }
    catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggle = async (id, field, val) => {
    setUpdating(id)
    try {
      await reviewsAPI.update(id, { [field]: val })
      setReviews(prev => prev.map(r => r._id === id ? { ...r, [field]: val } : r))
      toast.success('Updated')
    } catch { toast.error('Failed') }
    setUpdating(null)
  }

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader title="Reviews" subtitle={`${reviews.filter(r=>!r.isApproved).length} pending approval`} />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner"/></div>
        : reviews.length === 0 ? <EmptyState icon="⭐" title="No reviews yet" />
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr>{['Name','Rating','Occasion','Review','Approved','Featured','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-muted uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {reviews.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="text-sm font-medium">{r.name}</div><div className="text-xs text-charcoal-muted">{r.email}</div></td>
                    <td className="px-4 py-3"><div className="flex text-gold text-xs">{[...Array(r.rating||5)].map((_,i)=><span key={i}>★</span>)}</div></td>
                    <td className="px-4 py-3 text-xs text-charcoal-muted max-w-[120px] truncate">{r.occasion}</td>
                    <td className="px-4 py-3 text-xs text-charcoal-muted max-w-[200px]"><div className="truncate">{r.comment}</div></td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(r._id,'isApproved',!r.isApproved)} disabled={updating===r._id}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${r.isApproved?'bg-green-100 text-green-600 hover:bg-green-200':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                        {r.isApproved ? <FiCheck size={14}/> : <FiX size={14}/>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(r._id,'isFeatured',!r.isFeatured)} disabled={updating===r._id}
                        className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${r.isFeatured?'bg-gold/20 text-gold':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                        {r.isFeatured?'★ Featured':'Feature'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(r._id,'isActive',false)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── INQUIRIES ───────────────────────────────────────────────────────────────
export function AdminInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [statusFilter, setStatus] = useState('all')
  const STATUSES = ['all','new','contacted','quoted','converted','closed']

  const load = async () => {
    setLoading(true)
    try { const { data } = await inquiriesAPI.getAll(); setInquiries(data.inquiries) }
    catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try {
      await inquiriesAPI.update(id, { status, isRead: true })
      setInquiries(prev => prev.map(i => i._id === id ? { ...i, status, isRead: true } : i))
      if (selected?._id === id) setSelected(s => ({ ...s, status, isRead: true }))
      toast.success('Updated')
    } catch { toast.error('Failed') }
  }

  const shown = statusFilter === 'all' ? inquiries : inquiries.filter(i => i.status === statusFilter)

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader title="Inquiries" subtitle={`${inquiries.filter(i=>i.status==='new').length} new`}
        action={<button onClick={load} className="btn-outline text-sm px-4 py-2 flex items-center gap-1.5"><FiRefreshCw size={14}/> Refresh</button>}
      />
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map(s => <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${statusFilter===s?'bg-maroon text-white':'bg-white border border-gray-200 text-charcoal-muted hover:border-maroon'}`}>{s}</button>)}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner"/></div>
        : shown.length === 0 ? <EmptyState icon="💬" title="No inquiries" />
        : (
          <div className="divide-y divide-gray-50">
            {shown.map(i => (
              <div key={i._id} onClick={() => setSelected(i)} className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!i.isRead?'border-l-4 border-maroon':''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-charcoal">{i.name}</span>
                      {!i.isRead && <span className="badge bg-maroon text-white text-xs">NEW</span>}
                      <StatusBadge status={i.status} />
                      <span className="badge bg-gray-100 text-gray-500 text-xs capitalize">{i.inquiryType}</span>
                    </div>
                    <div className="text-xs text-charcoal-muted">{i.phone} · {i.email}</div>
                    <div className="text-sm text-charcoal-muted mt-1 truncate">{i.message}</div>
                  </div>
                  <div className="text-xs text-charcoal-muted shrink-0">{new Date(i.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Inquiry Detail">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[['Name',selected.name],['Phone',selected.phone],['Email',selected.email],['Type',selected.inquiryType],['Date',new Date(selected.createdAt).toDateString()]].map(([k,v])=>(
                <div key={k}><div className="text-xs text-charcoal-muted mb-0.5">{k}</div><div className="font-medium">{v}</div></div>
              ))}
            </div>
            {selected.subject && <div><div className="text-xs text-charcoal-muted mb-0.5">Subject</div><div className="font-medium">{selected.subject}</div></div>}
            <div className="bg-ivory-dark rounded-lg p-3">
              <div className="text-xs text-charcoal-muted mb-1">Message</div>
              <div>{selected.message}</div>
            </div>
            <div>
              <div className="text-xs text-charcoal-muted mb-2">Update Status</div>
              <div className="flex flex-wrap gap-2">
                {['new','contacted','quoted','converted','closed'].map(s=>(
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-all ${selected.status===s?'bg-maroon text-white':'border border-gray-200 text-charcoal-muted hover:border-maroon'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t flex gap-2">
              <a href={`tel:${selected.phone}`} className="btn-primary flex-1 text-center text-sm py-2.5">📞 Call</a>
              <a href={`https://wa.me/91${selected.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-whatsapp flex-1 justify-center text-sm py-2.5">💬 WhatsApp</a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ─── OFFERS ──────────────────────────────────────────────────────────────────
export function AdminOffers() {
  const [offers, setOffers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]   = useState(false)
  const EMPTY = { title:'', code:'', type:'percentage', value:'', minAmount:'', maxDiscount:'', applicableTo:'both', isActive:true }
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    setLoading(true)
    try { const { data } = await offersAPI.adminGetAll(); setOffers(data.offers) }
    catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.title||!form.code||!form.value) { toast.error('Title, code and value required'); return }
    setSaving(true)
    try {
      await offersAPI.create({ ...form, code: form.code.toUpperCase(), value: Number(form.value), minAmount: Number(form.minAmount||0), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined })
      toast.success('Offer created'); setShowForm(false); load()
    } catch (err) { toast.error(err.response?.data?.message||'Failed') }
    setSaving(false)
  }

  const toggleActive = async (id, isActive) => {
    try { await offersAPI.update(id, { isActive }); load(); toast.success(isActive?'Activated':'Deactivated') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader title="Offers & Promo Codes" subtitle={`${offers.length} offers`}
        action={<button onClick={()=>{setForm(EMPTY);setShowForm(true)}} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"><FiPlus size={14}/>Create Offer</button>}
      />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner"/></div>
        : offers.length === 0 ? <EmptyState icon="🏷" title="No offers yet" action={<button onClick={()=>setShowForm(true)} className="btn-primary text-sm px-5">Create First Offer</button>} />
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr>{['Code','Title','Type','Value','Min Amount','Applies To','Used','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {offers.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-bold text-maroon">{o.code}</td>
                    <td className="px-4 py-3 text-sm font-medium">{o.title}</td>
                    <td className="px-4 py-3 text-sm capitalize">{o.type}</td>
                    <td className="px-4 py-3 text-sm">{o.type==='percentage'?`${o.value}%`:`₹${o.value}`}</td>
                    <td className="px-4 py-3 text-sm">{o.minAmount?`₹${o.minAmount}`:'—'}</td>
                    <td className="px-4 py-3 text-sm capitalize">{o.applicableTo}</td>
                    <td className="px-4 py-3 text-sm text-center">{o.usedCount||0}</td>
                    <td className="px-4 py-3"><span className={`badge ${o.isActive?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{o.isActive?'Active':'Inactive'}</span></td>
                    <td className="px-4 py-3"><button onClick={()=>toggleActive(o._id,!o.isActive)} className={`text-xs font-semibold ${o.isActive?'text-red-400 hover:text-red-600':'text-green-500 hover:text-green-700'}`}>{o.isActive?'Disable':'Enable'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Promo Offer">
        <div className="space-y-4">
          <div><label className="label">Offer Title *</label><input className="input-field" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Summer Special" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Promo Code *</label><input className="input-field uppercase" value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value.toUpperCase()}))} placeholder="SUMMER20" /></div>
            <div><label className="label">Type *</label><select className="input-field" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
            <div><label className="label">Value *</label><input type="number" className="input-field" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} placeholder={form.type==='percentage'?'20':'500'} /></div>
            <div><label className="label">Min Amount (₹)</label><input type="number" className="input-field" value={form.minAmount} onChange={e=>setForm(p=>({...p,minAmount:e.target.value}))} placeholder="1000" /></div>
            {form.type==='percentage' && <div><label className="label">Max Discount (₹)</label><input type="number" className="input-field" value={form.maxDiscount} onChange={e=>setForm(p=>({...p,maxDiscount:e.target.value}))} placeholder="2000" /></div>}
            <div><label className="label">Applies To</label><select className="input-field" value={form.applicableTo} onChange={e=>setForm(p=>({...p,applicableTo:e.target.value}))}><option value="both">Both</option><option value="room">Room Only</option><option value="event">Event Only</option></select></div>
          </div>
          <div className="flex gap-3"><button onClick={()=>setShowForm(false)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button><button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">{saving?'Creating…':'Create Offer'}</button></div>
        </div>
      </Modal>
    </div>
  )
}

// ─── PACKAGES ────────────────────────────────────────────────────────────────
export function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const EMPTY = { name:'', category:'wedding', price:'', capacity:{min:50,max:500}, duration:1, venue:'garden', badge:'', isFeatured:false, inclusions:'', exclusions:'', isActive:true }
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    setLoading(true)
    try { const { data } = await eventsAPI.getPackages(); setPackages(data.packages) }
    catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.name||!form.price) { toast.error('Name and price required'); return }
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), inclusions: form.inclusions.split('\n').filter(Boolean), exclusions: form.exclusions.split('\n').filter(Boolean) }
      if (editing) await eventsAPI.updatePackage(editing, payload)
      else await eventsAPI.createPackage(payload)
      toast.success(editing?'Package updated':'Package added'); setShowForm(false); load()
    } catch (err) { toast.error(err.response?.data?.message||'Failed') }
    setSaving(false)
  }

  const togglePackageActive = async (id, isActive) => {
    try {
      await eventsAPI.updatePackage(id, { isActive })
      load()
      toast.success(isActive ? 'Package activated' : 'Package deactivated')
    } catch { toast.error('Failed') }
  }

  const deletePackage = async (id) => {
    if (!window.confirm('Deactivate this package?')) return
    try { await eventsAPI.deletePackage(id); toast.success('Package deactivated'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="p-6 max-w-7xl">
      <AdminPageHeader title="Event Packages" subtitle={`${packages.length} packages`}
        action={<button onClick={()=>{setForm(EMPTY);setEditing(null);setShowForm(true)}} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"><FiPlus size={14}/>Add Package</button>}
      />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner"/></div>
        : packages.length === 0 ? <EmptyState icon="📦" title="No packages yet" />
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr>{['Package','Category','Price','Capacity','Duration','Venue','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {packages.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium text-sm">{p.name}</div>{p.badge&&<span className="badge bg-gold/20 text-gold-dark text-xs">{p.badge}</span>}</td>
                    <td className="px-4 py-3 text-sm capitalize">{p.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-maroon">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm">{p.capacity?.min}–{p.capacity?.max}</td>
                    <td className="px-4 py-3 text-sm">{p.duration} day{p.duration>1?'s':''}</td>
                    <td className="px-4 py-3 text-sm capitalize">{p.venue}</td>
                    <td className="px-4 py-3"><span className={`badge ${p.isActive?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{p.isActive?'Active':'Inactive'}</span></td>
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button onClick={()=>{setForm({...p,price:p.price?.toString(),inclusions:(p.inclusions||[]).join('\n'),exclusions:(p.exclusions||[]).join('\n')});setEditing(p._id);setShowForm(true)}} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15}/></button>
                      <button onClick={()=>togglePackageActive(p._id,!p.isActive)} className={`text-xs font-semibold ${p.isActive?'text-orange-400 hover:text-orange-600':'text-green-500 hover:text-green-700'}`}>{p.isActive?'Hide':'Show'}</button>
                      <button onClick={()=>deletePackage(p._id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={15}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Package' : 'Add Package'} wide>
        <div className="space-y-4">
          <div><label className="label">Package Name *</label><input className="input-field" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Royal Wedding" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Category</label><select className="input-field" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{['wedding','reception','engagement','birthday','anniversary','corporate','family','cultural'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label">Venue</label><select className="input-field" value={form.venue} onChange={e=>setForm(p=>({...p,venue:e.target.value}))}><option value="garden">Garden</option><option value="banquet">Banquet</option><option value="lawn">Lawn</option><option value="combined">Combined</option></select></div>
            <div><label className="label">Price (₹) *</label><input type="number" className="input-field" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} /></div>
            <div><label className="label">Duration (days)</label><input type="number" className="input-field" value={form.duration} onChange={e=>setForm(p=>({...p,duration:Number(e.target.value)}))} /></div>
            <div><label className="label">Min Guests</label><input type="number" className="input-field" value={form.capacity?.min} onChange={e=>setForm(p=>({...p,capacity:{...p.capacity,min:Number(e.target.value)}}))} /></div>
            <div><label className="label">Max Guests</label><input type="number" className="input-field" value={form.capacity?.max} onChange={e=>setForm(p=>({...p,capacity:{...p.capacity,max:Number(e.target.value)}}))} /></div>
          </div>
          <div><label className="label">Badge (optional)</label><input className="input-field" value={form.badge} onChange={e=>setForm(p=>({...p,badge:e.target.value}))} placeholder="e.g. Most Popular" /></div>
          <div><label className="label">Inclusions (one per line)</label><textarea className="input-field resize-none" rows={4} value={form.inclusions} onChange={e=>setForm(p=>({...p,inclusions:e.target.value}))} placeholder="Full garden access&#10;Premium decor&#10;DJ & sound" /></div>
          <div><label className="label">Exclusions (one per line)</label><textarea className="input-field resize-none" rows={2} value={form.exclusions} onChange={e=>setForm(p=>({...p,exclusions:e.target.value}))} placeholder="Photography&#10;External artists" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(p=>({...p,isFeatured:e.target.checked}))} className="accent-maroon"/><label className="text-sm">Featured package</label></div>
          <div className="flex gap-3"><button onClick={()=>setShowForm(false)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button><button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">{saving?'Saving…':editing?'Save Changes':'Add Package'}</button></div>
        </div>
      </Modal>
    </div>
  )
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export function AdminSettings() {
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm]     = useState({
    hotelName: 'Yashraj Palace',
    tagline: 'Heritage Meets Luxury',
    phone: '+91 88270 39565',
    whatsapp: '918827039565',
    email: 'info@yashrajpalace.com',
    address: 'Near Mandleshwar, Khargone District, Madhya Pradesh – 451221',
    checkIn: '12:00 PM',
    checkOut: '11:00 AM',
    tokenAmount: '10000',
    advancePercent: '30',
  })

  useEffect(() => {
    settingsAPI.get()
      .then(r => {
        const s = r.data.settings
        setForm({
          hotelName:      s.hotelName      || 'Yashraj Palace',
          tagline:        s.tagline        || 'Heritage Meets Luxury',
          phone:          s.phone          || '+91 88270 39565',
          whatsapp:       s.whatsapp       || '918827039565',
          email:          s.email          || 'info@yashrajpalace.com',
          address:        s.address        || 'Near Mandleshwar, Khargone District, Madhya Pradesh – 451221',
          checkIn:        s.checkIn        || '12:00 PM',
          checkOut:       s.checkOut       || '11:00 AM',
          tokenAmount:    String(s.tokenAmount    ?? 10000),
          advancePercent: String(s.advancePercent ?? 30),
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsAPI.update(form)
      toast.success('Settings saved — website updated instantly!')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <AdminPageHeader title="Settings" subtitle="Hotel configuration and contact details" />
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-charcoal border-b border-gray-100 pb-3">Hotel Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Hotel Name</label><input className="input-field" value={form.hotelName} onChange={e=>setForm(p=>({...p,hotelName:e.target.value}))} /></div>
            <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} /></div>
            <div><label className="label">WhatsApp Number (with country code)</label><input className="input-field" value={form.whatsapp} onChange={e=>setForm(p=>({...p,whatsapp:e.target.value}))} /></div>
            <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
            <div className="md:col-span-2"><label className="label">Address</label><textarea className="input-field resize-none" rows={2} value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-charcoal border-b border-gray-100 pb-3">Booking Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Default Check-In Time</label><input className="input-field" value={form.checkIn} onChange={e=>setForm(p=>({...p,checkIn:e.target.value}))} /></div>
            <div><label className="label">Default Check-Out Time</label><input className="input-field" value={form.checkOut} onChange={e=>setForm(p=>({...p,checkOut:e.target.value}))} /></div>
            <div><label className="label">Room Advance Payment (%)</label><input type="number" className="input-field" value={form.advancePercent} onChange={e=>setForm(p=>({...p,advancePercent:e.target.value}))} /></div>
            <div><label className="label">Event Token Amount (₹)</label><input type="number" className="input-field" value={form.tokenAmount} onChange={e=>setForm(p=>({...p,tokenAmount:e.target.value}))} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-charcoal border-b border-gray-100 pb-3">Payment Gateway</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            ⚠️ Razorpay keys must be set in the backend <code className="font-mono">.env</code> file for security — they cannot be changed from this panel.
          </div>
        </div>

        <button type="submit" disabled={saving || loading}
          className={`btn-primary px-8 py-3 text-sm ${saved ? '!bg-green-500' : ''} disabled:opacity-60`}>
          {saving ? 'Saving…' : saved ? '✓ Saved! Website updated.' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
