import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wardenApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/warden',           icon: '📊', label: 'Dashboard' },
  { to: '/warden/leaves',    icon: '📋', label: 'Leave Requests' },
  { to: '/warden/students',  icon: '👥', label: 'Students' },
  { to: '/warden/analytics', icon: '📈', label: 'Analytics' },
]

const statusColors = {
  PENDING_WARDEN:  'text-red-700 bg-red-50',
  PENDING_MENTOR:  'text-rose-700 bg-rose-50',
  PENDING_PARENT:  'text-orange-700 bg-orange-50',
  APPROVED:        'text-red-700 bg-red-100',
  REJECTED:        'text-red-800 bg-red-100',
  COMPLETED:       'text-pink-700 bg-pink-50',
  LATE:            'text-red-800 bg-red-100',
  CANCELLED:       'text-stone-600 bg-stone-100',
}

export default function WardenLeaves() {
  const [leaves, setLeaves] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionModal, setActionModal] = useState(null)
  const [remark, setRemark] = useState('')
  const [acting, setActing] = useState(false)

  const fetchLeaves = (status = '') => {
    setLoading(true)
    wardenApi.getLeaves(status).then(res => {
      setLeaves(res.data.data?.content || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchLeaves(filter) }, [filter])

  const doAction = async (action) => {
    setActing(true)
    try {
      await wardenApi.actionLeave(actionModal.id, { action, remark })
      toast.success(`Leave ${action.toLowerCase()}d!`)
      setActionModal(null)
      setRemark('')
      fetchLeaves(filter)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed')
    } finally { setActing(false) }
  }

  const filters = ['', 'PENDING_WARDEN', 'PENDING_MENTOR', 'PENDING_PARENT', 'APPROVED', 'REJECTED', 'LATE']

  return (
    <Layout navLinks={navLinks} title="Leave Requests">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-[#3f0d12]">Leave Requests</h1>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                filter === f
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'border-rose-200 text-[#7f1d1d] hover:border-red-300 hover:bg-rose-50'
              }`}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-28 bg-rose-100 rounded-2xl animate-pulse"/>)}</div>
      ) : leaves.length === 0 ? (
        <div className="text-center text-[#9f1239] mt-20">
          <div className="text-5xl mb-4">📭</div><p>No requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave, i) => (
            <motion.div key={leave.id}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.03 }}
              className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#3f0d12] font-bold">{leave.studentName}</span>
                    <span className="text-[#9f1239] text-xs">{leave.rollNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[leave.status]}`}>
                      {leave.status.replace('_',' ')}
                    </span>
                  </div>
                  <div className="text-[#9f1239] text-sm mb-1">
                    <span className="mr-3">🏠 Room {leave.roomNumber}</span>
                    <span className="mr-3">{leave.type === 'LEAVE' ? '✈️' : '🚶'} {leave.type}</span>
                    {leave.outingKind && <span className="text-red-600">{leave.outingKind.replaceAll('_', ' ')}</span>}
                  </div>
                  <div className="text-[#3f0d12] text-sm">{leave.reason}</div>
                  {leave.destination && <div className="text-[#9f1239] text-xs mt-0.5">📍 {leave.destination}</div>}
                  <div className="text-[#9f1239] text-xs mt-1">
                    Return: {leave.expectedReturn ? format(new Date(leave.expectedReturn), 'PPp') : '—'}
                    {leave.isLate && <span className="text-red-400 ml-2">⏰ {Math.round(leave.lateByMinutes)}m late</span>}
                  </div>
                </div>
                {leave.status === 'PENDING_WARDEN' && (
                  <button onClick={() => setActionModal(leave)}
                    className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-semibold flex-shrink-0">
                    Review →
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:20 }}
              className="bg-white border border-rose-200 rounded-2xl p-6 max-w-md w-full shadow-[0_30px_80px_rgba(127,29,29,0.12)]">
              <h3 className="text-[#3f0d12] font-bold text-lg mb-1">Review Leave Request</h3>
              <p className="text-[#9f1239] text-sm mb-4">{actionModal.studentName} — {actionModal.reason}</p>
              <textarea value={remark} onChange={e => setRemark(e.target.value)}
                placeholder="Add remark (optional)..." rows={3}
                className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-[#3f0d12] placeholder-[#b91c1c]/50 focus:outline-none focus:border-red-500 text-sm mb-4 resize-none" />
              <div className="flex gap-3">
                <button onClick={() => doAction('APPROVE')} disabled={acting}
                  className="flex-1 bg-green-500/15 border border-green-500/30 text-green-400 font-bold py-2.5 rounded-xl hover:bg-green-500/25 disabled:opacity-50 transition-colors">
                  ✅ Approve
                </button>
                <button onClick={() => doAction('REJECT')} disabled={acting}
                  className="flex-1 bg-red-500/15 border border-red-500/30 text-red-400 font-bold py-2.5 rounded-xl hover:bg-red-500/25 disabled:opacity-50 transition-colors">
                  ❌ Reject
                </button>
              </div>
              <button onClick={() => setActionModal(null)}
                className="w-full mt-3 text-[#9f1239] text-sm hover:text-red-700 transition-colors">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}
