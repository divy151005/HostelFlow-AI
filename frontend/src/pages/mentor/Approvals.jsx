import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { mentorApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/mentor', icon: '🧑‍🏫', label: 'Mentor Approvals' },
]

const statusColors = {
  PENDING_MENTOR: 'text-red-700 bg-red-50',
  PENDING_PARENT: 'text-orange-700 bg-orange-50',
  APPROVED: 'text-red-700 bg-red-100',
  REJECTED: 'text-red-800 bg-red-100',
}

export default function MentorApprovals() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionModal, setActionModal] = useState(null)
  const [remark, setRemark] = useState('')
  const [acting, setActing] = useState(false)

  const fetchLeaves = () => {
    setLoading(true)
    mentorApi.getLeaves('PENDING_MENTOR').then(res => {
      setLeaves(res.data.data?.content || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchLeaves() }, [])

  const doAction = async (action) => {
    setActing(true)
    try {
      await mentorApi.actionLeave(actionModal.id, { action, remark })
      toast.success(`Request ${action.toLowerCase()}d`)
      setActionModal(null)
      setRemark('')
      fetchLeaves()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed')
    } finally {
      setActing(false)
    }
  }

  return (
    <Layout navLinks={navLinks} title="Mentor Portal">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#3f0d12]">Mentor Approvals</h1>
          <p className="text-[#9f1239] text-sm mt-1">Review outing requests before they move to parent approval or final approval.</p>
        </div>
        <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm font-semibold">
          Pending: {leaves.length}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-rose-100 rounded-2xl animate-pulse" />)}</div>
      ) : leaves.length === 0 ? (
        <div className="text-center text-[#9f1239] mt-20">
          <div className="text-5xl mb-4">🧑‍🏫</div>
          <p>No outing requests are waiting for mentor approval.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(leave => (
            <motion.div key={leave.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[#3f0d12] font-bold">{leave.studentName}</span>
                    <span className="text-[#9f1239] text-xs">{leave.rollNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[leave.status]}`}>
                      {leave.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-red-600 text-sm font-semibold mb-1">
                    {leave.outingKind?.replaceAll('_', ' ') || 'OUTING'}
                  </div>
                  <div className="text-[#3f0d12] text-sm">{leave.reason}</div>
                  <div className="text-[#9f1239] text-xs mt-1">
                    Destination: {leave.destination || 'Not specified'}
                  </div>
                  <div className="text-[#9f1239] text-xs mt-1">
                    Return by: {leave.expectedReturn ? format(new Date(leave.expectedReturn), 'PPp') : '—'}
                  </div>
                  <div className="text-xs mt-2 text-orange-400">
                    {['WORKING_HOURS', 'RUNNING_COLLEGE'].includes(leave.outingKind)
                      ? 'Parent approval will also be required after mentor approval.'
                      : 'Mentor approval is the final approval step for this outing.'}
                  </div>
                </div>
                <button onClick={() => setActionModal(leave)}
                  className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-semibold flex-shrink-0">
                  Review →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {actionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-rose-200 rounded-2xl p-6 max-w-md w-full shadow-[0_30px_80px_rgba(127,29,29,0.12)]">
              <h3 className="text-[#3f0d12] font-bold text-lg mb-1">Review Outing Request</h3>
              <p className="text-[#9f1239] text-sm mb-2">{actionModal.studentName} • {actionModal.outingKind?.replaceAll('_', ' ')}</p>
              <p className="text-[#3f0d12] text-sm mb-4">{actionModal.reason}</p>
              <textarea value={remark} onChange={e => setRemark(e.target.value)}
                placeholder="Add remark (optional)..."
                rows={3}
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
