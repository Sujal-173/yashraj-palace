import { useState, useEffect, useCallback, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { galleryAPI } from '../utils/api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { FiCamera, FiGrid, FiX, FiUpload, FiTrash2, FiImage } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CATEGORIES = ['all','rooms','weddings','garden','banquet','food','property','events']

const CATEGORY_LABELS = {
  all: 'All', rooms: 'Rooms', weddings: 'Weddings', garden: 'Garden',
  banquet: 'Banquet', food: 'Cuisine', property: 'Property', events: 'Events'
}

const CATEGORY_COLORS = {
  rooms:    'from-[#3A0D1A] to-[#6B1A2B]',
  weddings: 'from-[#4A0F1D] to-[#8B2238]',
  garden:   'from-[#2A1A0A] to-[#5C3A1A]',
  banquet:  'from-[#1A0A2A] to-[#4A1A6B]',
  food:     'from-[#1A0E06] to-[#6B3A1A]',
  property: 'from-[#0D1A1A] to-[#1A4A4A]',
  events:   'from-[#1A1A0D] to-[#4A4A1A]',
}

const PLACEHOLDER = [
  ...['rooms','weddings','garden','banquet','food','property','events'].flatMap(cat =>
    Array.from({ length: 6 }, (_, i) => ({
      _id: `${cat}-${i}`, category: cat,
      title: `${CATEGORY_LABELS[cat]} — ${i + 1}`,
      url: '', alt: `Yashraj Palace ${cat}`,
      color: CATEGORY_COLORS[cat]
    }))
  )
]

const MAX_FILE_MB = 4

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      reject(new Error(`Image must be under ${MAX_FILE_MB} MB`))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function GalleryPage() {
  const [images, setImages]         = useState([])
  const [filter, setFilter]         = useState('all')
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)

  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [preview, setPreview]       = useState(null)
  const [uploadForm, setUploadForm] = useState({ title: '', category: 'rooms', alt: '' })
  const [deletingId, setDeletingId] = useState(null)
  const fileRef = useRef()

  const { subscribe } = useSocket() || {}
  const { user } = useAuth()

  const loadGallery = useCallback(() => {
    galleryAPI.getAll()
      .then(r => setImages(r.data.images.length ? r.data.images : PLACEHOLDER))
      .catch(() => setImages(PLACEHOLDER))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadGallery() }, [loadGallery])

  useEffect(() => {
    if (!subscribe) return
    return subscribe('content_updated', (data) => {
      if (data?.type === 'gallery') loadGallery()
    })
  }, [subscribe, loadGallery])

  const shown = filter === 'all' ? images : images.filter(i => i.category === filter)

  const openLightbox = (img, idx) => { setSelected(img); setSelectedIdx(idx) }
  const closeLightbox = () => { setSelected(null); setSelectedIdx(null) }
  const goNext = (e) => { e.stopPropagation(); const next = (selectedIdx + 1) % shown.length; setSelected(shown[next]); setSelectedIdx(next) }
  const goPrev = (e) => { e.stopPropagation(); const prev = (selectedIdx - 1 + shown.length) % shown.length; setSelected(shown[prev]); setSelectedIdx(prev) }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await fileToBase64(file)
      setPreview(b64)
      setUploadForm(p => ({ ...p, alt: file.name.replace(/\.[^.]+$/, '') }))
    } catch (err) {
      toast.error(err.message || 'Failed to read file')
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!preview) { toast.error('Please select an image'); return }
    setUploading(true)
    try {
      await galleryAPI.add({
        url:      preview,
        title:    uploadForm.title || 'My photo',
        alt:      uploadForm.alt   || 'Guest photo',
        category: uploadForm.category,
      })
      toast.success('Photo uploaded successfully!')
      setShowUpload(false)
      setPreview(null)
      setUploadForm({ title: '', category: 'rooms', alt: '' })
      if (fileRef.current) fileRef.current.value = ''
      loadGallery()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleDelete = async (e, img) => {
    e.stopPropagation()
    if (!window.confirm('Delete this photo?')) return
    setDeletingId(img._id)
    try {
      await galleryAPI.delete(img._id)
      toast.success('Photo deleted')
      loadGallery()
      if (selected?._id === img._id) closeLightbox()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete')
    }
    setDeletingId(null)
  }

  const isMyImage = (img) => user && img.uploadedBy && String(img.uploadedBy) === String(user._id)
  const isAdmin   = user?.role === 'admin' || user?.role === 'staff'

  return (
    <>
      <Helmet>
        <title>Gallery – Yashraj Palace | Rooms, Weddings, Garden &amp; Events | Maheshwar</title>
        <meta name="description" content="View photos of rooms, wedding garden, banquet hall, restaurant, and events at Yashraj Palace near Maheshwar and Mandleshwar, Madhya Pradesh." />
        <link rel="canonical" href="https://www.yashrajpalace.com/gallery" />
        <meta property="og:title" content="Gallery – Yashraj Palace | Rooms, Weddings, Garden &amp; Events" />
        <meta property="og:description" content="Browse photos of rooms, wedding garden, banquet hall, food, and events at Yashraj Palace near Maheshwar, MP." />
        <meta property="og:url" content="https://www.yashrajpalace.com/gallery" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.yashrajpalace.com/' },
            { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://www.yashrajpalace.com/gallery' },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden" style={{ background: '#1A0709' }}>
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop')", opacity: 0.16 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,7,9,0.98) 0%, rgba(107,26,43,0.80) 50%, rgba(26,7,9,0.92) 100%)' }} />
        <div className="absolute inset-0 hero-pattern pointer-events-none" style={{ opacity: 0.06 }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #C9A84C 70%, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #C9A84C 70%, transparent)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left: Headline */}
            <div className="w-full lg:w-[52%] text-white">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px bg-gold/60 w-8" />
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Our Story in Photos</span>
                <span className="h-px bg-gold/60 w-8" />
              </div>
              <h1 className="font-serif font-bold leading-[1.12] mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Every Frame,<br />
                <span style={{ background: 'linear-gradient(90deg,#C9A84C,#E8C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  A Memory
                </span>
              </h1>
              <p className="text-white/65 leading-relaxed mb-8 max-w-lg" style={{ fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)' }}>
                Rooms, weddings, events, garden, banquet hall, and cuisine — every frame a memory at Yashraj Palace, near Maheshwar.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={() => { setFilter('weddings'); document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="btn-gold btn-lg text-[0.625rem]">View Weddings</button>
                <button onClick={() => { setFilter('rooms'); document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="btn-outline-gold btn-lg text-[0.625rem]">View Rooms</button>
                {user && (
                  <button onClick={() => { setShowUpload(true); document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-5 py-3 text-[0.625rem] font-bold uppercase tracking-wider hover:bg-white/20 transition-colors">
                    <FiUpload size={13} /> Share a Photo
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-white/10 max-w-sm">
                {[['7+','Venues'],['500+','Events'],['3','Room Types'],['1000+','Guests']].map(([n,l]) => (
                  <div key={l} className="text-center">
                    <div className="font-serif text-gold font-bold text-base">{n}</div>
                    <div className="text-white/45 text-[9px] uppercase tracking-widest mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Category preview mosaic */}
            <div className="w-full lg:w-[44%] max-w-md mx-auto lg:mx-0">
              <div className="grid grid-cols-3 grid-rows-2 gap-2" style={{ height: '340px' }}>
                {[
                  { cat: 'Weddings',  color: 'from-[#4A0F1D] to-[#8B2238]',  span: 'col-span-2 row-span-1' },
                  { cat: 'Rooms',     color: 'from-[#2A1A0A] to-[#5C3A1A]',  span: 'col-span-1 row-span-2' },
                  { cat: 'Garden',    color: 'from-[#0D1A1A] to-[#1A4A4A]',  span: 'col-span-1 row-span-1' },
                  { cat: 'Banquet',   color: 'from-[#1A0A2A] to-[#4A1A6B]',  span: 'col-span-1 row-span-1' },
                  { cat: 'Cuisine',   color: 'from-[#1A0E06] to-[#6B3A1A]',  span: 'col-span-1 row-span-1' },
                ].map(({ cat, color, span }) => (
                  <div key={cat}
                    onClick={() => { setFilter(cat.toLowerCase()); document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className={`${span} bg-gradient-to-br ${color} cursor-pointer group relative overflow-hidden border border-gold/15 hover:border-gold/50 transition-all duration-300`}
                    style={{ borderRadius: 0 }}>
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#C9A84C 0,#C9A84C 1px,transparent 0,transparent 50%)', backgroundSize: '10px 10px' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/70 group-hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors">{cat}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/35 text-xs text-center mt-3 tracking-wider uppercase">Click a category to explore</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#1E0610] border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-gold/15">
          {[['7+','Venue Spaces'],['500+','Events Hosted'],['3','Room Categories'],['1000+','Happy Guests']].map(([n,l]) => (
            <div key={l} className="py-5 text-center">
              <div className="font-serif text-2xl font-bold gold-shimmer-text">{n}</div>
              <div className="text-white/50 text-xs uppercase tracking-widest mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload panel — visible to logged-in users */}
      {user && showUpload && (
        <div id="upload-panel" className="bg-[#FAF7F2] border-b border-gold/30">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg font-semibold text-maroon">Share Your Photo</h3>
                <p className="text-charcoal-muted text-xs mt-0.5">Upload a photo from your visit. Max {MAX_FILE_MB} MB per image.</p>
              </div>
              <button onClick={() => { setShowUpload(false); setPreview(null) }} className="text-charcoal-muted hover:text-charcoal">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              {/* File drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gold/40 hover:border-gold cursor-pointer transition-colors flex flex-col items-center justify-center py-8 bg-white"
                style={{ borderRadius: 0 }}>
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 object-contain" />
                ) : (
                  <>
                    <FiImage size={32} className="text-gold/50 mb-3" />
                    <p className="text-sm text-charcoal font-medium">Click to choose a photo</p>
                    <p className="text-xs text-charcoal-muted mt-1">JPG, PNG, WEBP — max {MAX_FILE_MB} MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              {preview && (
                <button type="button" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="text-xs text-red-500 hover:underline">Remove image</button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category *</label>
                  <select className="input-field" value={uploadForm.category} onChange={e => setUploadForm(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Caption (optional)</label>
                  <input className="input-field" placeholder="e.g. Our wedding day"
                    value={uploadForm.title} onChange={e => setUploadForm(p=>({...p,title:e.target.value}))} />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={uploading || !preview}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <FiUpload size={14} />
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                </button>
                <button type="button" onClick={() => { setShowUpload(false); setPreview(null) }}
                  className="btn-outline text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-[#FAF7F2] border-b py-4 px-4 sticky top-16 z-30 overflow-x-auto" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
        <div className="flex gap-2 max-w-7xl mx-auto min-w-max items-center justify-between">
          <div className="flex gap-2 items-center">
            <FiGrid size={14} className="text-gold shrink-0 mr-1" />
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                  filter === c
                    ? 'text-white border-maroon'
                    : 'bg-white text-stone-600 border-[#E8E0D8] hover:text-maroon hover:border-gold'
                }`}
                style={{ borderRadius: 0, background: filter === c ? 'linear-gradient(135deg,#6B1A2B,#8B2238)' : undefined }}>
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          {user && !showUpload && (
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 bg-maroon text-white text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-[#8A243A] transition-colors shrink-0 ml-4">
              <FiUpload size={12} /> Add Photo
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div id="gallery-grid" className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-24"><div className="spinner" /></div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FiCamera size={40} className="text-gold/40 mb-4" />
            <p className="font-serif text-xl text-charcoal mb-1">No images yet</p>
            <p className="text-charcoal-muted text-sm">Photos in this category are coming soon.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {shown.map((img, i) => (
              <div key={img._id}
                onClick={() => openLightbox(img, i)}
                className={`break-inside-avoid overflow-hidden cursor-zoom-in group relative bg-gradient-to-br ${img.color || CATEGORY_COLORS[img.category] || 'from-[#3A0D1A] to-[#6B1A2B]'} ${
                  i % 7 === 0 ? 'h-64' : i % 4 === 0 ? 'h-44' : 'h-52'
                } border border-transparent hover:border-gold/40 transition-all duration-300`}
                style={{ borderRadius: 0 }}>
                {img.url ? (
                  <>
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <FiCamera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-end justify-end p-3 relative">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#C9A84C 0,#C9A84C 1px,transparent 0,transparent 50%)', backgroundSize: '14px 14px' }} />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    <span className="relative text-gold/70 text-xs capitalize font-semibold tracking-wider">{CATEGORY_LABELS[img.category] || img.category}</span>
                  </div>
                )}

                {/* Delete button — visible on own images or for admin */}
                {(isMyImage(img) || isAdmin) && img.url && !img._id.includes('-') && (
                  <button
                    onClick={e => handleDelete(e, img)}
                    disabled={deletingId === img._id}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 disabled:opacity-50"
                    style={{ borderRadius: 0 }}
                    title="Delete photo">
                    {deletingId === img._id
                      ? <span className="text-[10px]">…</span>
                      : <FiTrash2 size={12} />
                    }
                  </button>
                )}

                {/* "My photo" badge */}
                {isMyImage(img) && img.url && (
                  <span className="absolute bottom-2 left-2 bg-maroon/80 text-white text-[9px] px-1.5 py-0.5 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Your photo
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Login prompt for guests */}
        {!user && !loading && shown.length > 0 && (
          <div className="mt-10 bg-[#FAF7F2] border border-gold/20 p-6 text-center">
            <FiCamera size={28} className="text-gold mx-auto mb-3" />
            <p className="font-serif text-base text-charcoal font-semibold mb-1">Visited Yashraj Palace?</p>
            <p className="text-charcoal-muted text-sm mb-4">Log in to share your photos with other guests.</p>
            <a href="/login" className="btn-primary text-sm">Log In to Upload</a>
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && shown.length > 0 && (
          <div className="mt-16 text-center border-t border-gold/15 pt-12">
            <p className="section-eyebrow text-center">Book a Visit</p>
            <div className="gold-divider-center mb-4" />
            <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">Experience Yashraj Palace in Person</h2>
            <p className="text-charcoal-muted mb-6 max-w-lg mx-auto">Photos tell part of the story — visit us to see the grandeur for yourself. Schedule a site tour or book a room today.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/rooms" className="btn-primary">Book a Room</a>
              <a href="/contact" className="btn-outline">Schedule a Tour</a>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            style={{ borderRadius: 0 }}>
            <FiX size={20} />
          </button>

          {/* Prev */}
          <button onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
            style={{ borderRadius: 0 }}>‹</button>

          {/* Next */}
          <button onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
            style={{ borderRadius: 0 }}>›</button>

          <div className="max-w-3xl w-full max-h-[80vh] overflow-hidden border border-gold/20" style={{ borderRadius: 0 }} onClick={e => e.stopPropagation()}>
            {selected.url ? (
              <img src={selected.url} alt={selected.alt} className="w-full max-h-[75vh] object-contain" />
            ) : (
              <div className={`w-full h-64 bg-gradient-to-br ${selected.color || 'from-[#3A0D1A] to-[#6B1A2B]'} flex items-center justify-center`}>
                <span className="text-gold/40 font-serif text-2xl capitalize">{CATEGORY_LABELS[selected.category] || selected.category}</span>
              </div>
            )}
            <div className="bg-[#1E0610] text-white/80 text-sm p-3 flex items-center justify-between border-t border-gold/20">
              <span>
                {selected.title || ''}
                <span className="ml-2 text-gold/50 text-xs">· {selectedIdx + 1} / {shown.length}</span>
              </span>
              {(isMyImage(selected) || isAdmin) && selected.url && !selected._id.includes('-') && (
                <button onClick={e => handleDelete(e, selected)}
                  disabled={deletingId === selected._id}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs transition-colors disabled:opacity-50">
                  <FiTrash2 size={12} /> {deletingId === selected._id ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
