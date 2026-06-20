import { useState } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// ── Reusable status badge ──────────────────────────────────────────────────
export const STATUS_COLORS = {
  pending:      'bg-yellow-100 text-yellow-700',
  confirmed:    'bg-green-100 text-green-700',
  checked_in:   'bg-blue-100 text-blue-700',
  checked_out:  'bg-gray-100 text-gray-500',
  cancelled:    'bg-red-100 text-red-600',
  inquiry:      'bg-purple-100 text-purple-700',
  advance_paid: 'bg-teal-100 text-teal-700',
  quote_sent:   'bg-indigo-100 text-indigo-700',
  completed:    'bg-green-100 text-green-700',
  new:          'bg-orange-100 text-orange-700',
  contacted:    'bg-blue-100 text-blue-700',
  converted:    'bg-green-100 text-green-700',
  closed:       'bg-gray-100 text-gray-500',
  approved:     'bg-green-100 text-green-700',
  partial:      'bg-yellow-100 text-yellow-700',
  paid:         'bg-green-100 text-green-700',
  unpaid:       'bg-red-100 text-red-600',
  token_paid:   'bg-teal-100 text-teal-700',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// ── Admin page header ──────────────────────────────────────────────────────
export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">{title}</h1>
        {subtitle && <p className="text-sm text-charcoal-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Search bar ─────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-maroon w-full md:w-64 transition-colors"
      />
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <p className="text-sm text-charcoal-muted">Page {page} of {pages}</p>
      <div className="flex gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="p-2 rounded border border-gray-200 text-charcoal-muted hover:border-maroon disabled:opacity-40">
          <FiChevronLeft size={15} />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const pg = page <= 3 ? i + 1 : page - 2 + i
          if (pg < 1 || pg > pages) return null
          return (
            <button key={pg} onClick={() => onPage(pg)}
              className={`px-3 py-1.5 rounded border text-sm font-medium transition-all ${pg === page ? 'bg-maroon text-white border-maroon' : 'border-gray-200 text-charcoal-muted hover:border-maroon'}`}>
              {pg}
            </button>
          )
        })}
        <button onClick={() => onPage(page + 1)} disabled={page >= pages}
          className="p-2 rounded border border-gray-200 text-charcoal-muted hover:border-maroon disabled:opacity-40">
          <FiChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Confirm modal ──────────────────────────────────────────────────────────
export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
        <p className="text-sm text-charcoal-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
          <button onClick={onConfirm}
            className={`flex-1 text-sm py-2.5 rounded font-semibold text-white transition-all ${danger ? 'bg-red-500 hover:bg-red-600' : 'btn-primary'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal wrapper ──────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-xl my-8 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-charcoal text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📋', title, message, action }) {
  return (
    <div className="py-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-charcoal mb-1">{title}</h3>
      {message && <p className="text-sm text-charcoal-muted mb-4">{message}</p>}
      {action}
    </div>
  )
}
