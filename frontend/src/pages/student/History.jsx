// History.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { studentApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/student',               icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply',         icon: '✈️', label: 'Apply Leave/Outing' },
  { to: '/student/history',       icon: '📜', label: 'History' },
  { to: '/student/notifications', icon: '🔔', label: 'Notifications' },
]

const statusColors = {
  PENDING_WARDEN: 'text-red-700 bg-red-50',
  PENDING_MENTOR: 'text-rose-700 bg-rose-50',
  PENDING_PARENT: 'text-orange-700 bg-orange-50',
  APPROVED:       'text-red-700 bg-red-100',
  REJECTED:       'text-red-800 bg-red-100',
  COMPLETED:      'text-pink-700 bg-pink-50',
  LATE:           'text-red-800 bg-red-100',
  CANCELLED:      'text-stone-600 bg-stone-100',
}

export default function History() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    studentApi.getHistory(0).then(res => {
      setLeaves(res.data.data?.content || [])
    }).finally(() => setLoading(false))
  }, [])

  const cancel = async (id) => {
    setCancelling(id)
    try {
      await studentApi.cancelLeave(id)
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'CANCELLED' } : l))
    } catch (e) {
      alert(e.response?.data?.message || 'Cancel failed')
    } finally { setCancelling(null) }
  }

  return (
    <Layout navLinks={navLinks} title="Leave History">
      <h1 className="text-2xl font-black text-[#3f0d12] mb-6">Leave History</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-rose-100 rounded-2xl animate-pulse" />)}</div>
      ) : leaves.length === 0 ? (
        <div className="text-center text-[#9f1239] mt-20">
          <div className="text-5xl mb-4">📭</div>
          <p>No leave requests yet.</p>
          <Link to="/student/apply" className="text-red-600 text-sm mt-2 inline-block">Apply now →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave, i) => (
            <motion.div key={leave.id}
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
              className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{leave.type === 'LEAVE' ? '✈️' : leave.type === 'EMERGENCY' ? '🚨' : '🚶'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#3f0d12] font-semibold truncate">{leave.reason}</div>
                    {leave.destination && <div className="text-[#9f1239] text-xs">{leave.destination}</div>}
                    {leave.outingKind && <div className="text-red-600 text-xs">{leave.outingKind.replaceAll('_', ' ')}</div>}
                    <div className="text-[#9f1239] text-xs mt-1">
                      {leave.fromDate ? format(new Date(leave.fromDate), 'PPp') : '—'}
                    </div>
                    {leave.isLate && (
                      <span className="text-xs text-red-400">⏰ {Math.round(leave.lateByMinutes)} mins late</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[leave.status]}`}>
                    {leave.status.replace('_',' ')}
                  </span>
                  {leave.status === 'APPROVED' && (
                    <Link to={`/student/qr/${leave.id}`}
                      className="text-xs text-red-600 hover:underline">🔳 QR Pass</Link>
                  )}
                  {(leave.status === 'PENDING_WARDEN' || leave.status === 'PENDING_MENTOR' || leave.status === 'PENDING_PARENT') && (
                    <button onClick={() => cancel(leave.id)} disabled={cancelling === leave.id}
                      className="text-xs text-red-400 hover:underline disabled:opacity-50">
                      {cancelling === leave.id ? '...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  )
}
