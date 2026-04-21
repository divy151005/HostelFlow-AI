import { motion } from 'framer-motion'

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  PENDING_WARDEN:  'text-red-700 bg-red-50 border-red-200',
  PENDING_MENTOR:  'text-rose-700 bg-rose-50 border-rose-200',
  PENDING_PARENT:  'text-orange-700 bg-orange-50 border-orange-200',
  APPROVED:        'text-red-700 bg-red-100 border-red-200',
  REJECTED:        'text-red-800 bg-red-100 border-red-300',
  COMPLETED:       'text-pink-700 bg-pink-50 border-pink-200',
  LATE:            'text-red-800 bg-red-100 border-red-300',
  CANCELLED:       'text-stone-600 bg-stone-100 border-stone-200',
  LOW:             'text-red-700 bg-red-50',
  MEDIUM:          'text-orange-700 bg-orange-50',
  HIGH:            'text-red-800 bg-red-100',
}

export function StatusBadge({ status, className = '' }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[status] || 'text-stone-600 bg-stone-100'} ${className}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = '#dc2626', delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`bg-white border border-rose-200 rounded-2xl p-4 shadow-sm ${onClick ? 'cursor-pointer hover:border-red-300 transition-colors' : ''}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-black text-2xl" style={{ color }}>{value}</div>
      <div className="text-[#9f1239] text-xs mt-1">{label}</div>
    </motion.div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-[#3f0d12] font-semibold text-lg mb-1">{title}</div>
      {subtitle && <p className="text-[#9f1239] text-sm mb-4">{subtitle}</p>}
      {action}
    </motion.div>
  )
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
export function SkeletonList({ count = 4, height = 'h-20' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-rose-100 rounded-2xl animate-pulse`} />
      ))}
    </div>
  )
}

// ── Alert Banner ──────────────────────────────────────────────────────────────
export function AlertBanner({ type = 'info', title, message, action }) {
  const styles = {
    info:    'bg-rose-50 border-rose-200 text-red-700',
    warning: 'bg-orange-50 border-orange-200 text-orange-700',
    danger:  'bg-red-50 border-red-200 text-red-700',
    success: 'bg-red-50 border-red-200 text-red-700',
  }
  const icons = { info: 'ℹ️', warning: '⚠️', danger: '🚨', success: '✅' }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-4 mb-5 flex items-start justify-between gap-3 ${styles[type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div>
          <div className="font-bold">{title}</div>
          {message && <div className="text-sm opacity-80 mt-0.5">{message}</div>}
        </div>
      </div>
      {action}
    </motion.div>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between mb-6 flex-wrap gap-3"
    >
      <div>
        <h1 className="text-2xl font-black text-[#3f0d12]">{title}</h1>
        {subtitle && <p className="text-[#9f1239] text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  )
}
