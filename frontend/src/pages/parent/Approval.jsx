import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { parentApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/parent',          icon: '🏠', label: 'Dashboard' },
  { to: '/parent/approval', icon: '✅', label: 'Approvals' },
]

export default function ParentApproval() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [message, setMessage] = useState('')
  const [activeLeave, setActiveLeave] = useState(null)

  const fetchPending = () => {
    parentApi.getStudentLeaves().then(res => {
      const all = res.data.data?.content || []
      setLeaves(all.filter(l => l.status === 'PENDING_PARENT'))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchPending() }, [])

  const respond = async (leaveId, action) => {
    setActing(leaveId + action)
    try {
      await parentApi.approveLeave({ leaveId, action, message })
      toast.success(action === 'YES' ? '✅ Leave Approved!' : '❌ Leave Rejected')
      setActiveLeave(null)
      setMessage('')
      fetchPending()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed')
    } finally { setActing(null) }
  }

  return (
    <Layout navLinks={navLinks} title="Leave Approval">
      <h1 className="text-2xl font-black text-[#3f0d12] mb-2">Leave Approval</h1>
      <p className="text-[#9f1239] text-sm mb-6">Review and respond to your child's leave and outing requests.</p>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-48 bg-rose-100 rounded-2xl animate-pulse"/>)}</div>
      ) : leaves.length === 0 ? (
        <div className="text-center text-[#9f1239] mt-20">
          <div className="text-5xl mb-4">✅</div>
          <p>No pending approvals. You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map(leave => (
            <motion.div key={leave.id} layout
              initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
              className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm">

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">{leave.type === 'LEAVE' ? '✈️' : '🚶'}</span>
                <div>
                  <div className="text-[#3f0d12] font-bold text-lg">{leave.type} Request</div>
                  <div className="text-[#9f1239] text-sm">{leave.studentName} • {leave.rollNumber}</div>
                  {leave.outingKind && <div className="text-red-600 text-xs mt-1">{leave.outingKind.replaceAll('_', ' ')}</div>}
                </div>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold border border-orange-200">
                  Awaiting Your Approval
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 bg-rose-50 rounded-xl p-4 mb-4 text-sm border border-rose-200">
                {[
                  { label: 'Reason',    value: leave.reason },
                  { label: 'Destination', value: leave.destination || 'N/A' },
                  { label: 'From',      value: leave.fromDate ? format(new Date(leave.fromDate), 'PPp') : '—' },
                  { label: 'Return By', value: leave.expectedReturn ? format(new Date(leave.expectedReturn), 'PPp') : '—' },
                ].map(row => (
                  <div key={row.label}>
                    <div className="text-[#9f1239] text-xs mb-0.5">{row.label}</div>
                    <div className="text-[#3f0d12] font-medium">{row.value}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-red-700 bg-red-50 rounded-xl px-3 py-2 mb-4 border border-red-200">
                ✅ {leave.type === 'OUTING' ? 'Mentor' : 'Warden'} has already approved this request. Your approval is the final step.
              </div>

              {/* Message Input */}
              <AnimatePresence>
                {activeLeave === leave.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Add a message (optional)..."
                      rows={2}
                      className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-[#3f0d12] placeholder-[#b91c1c]/50 focus:outline-none focus:border-red-500 text-sm mb-3 resize-none" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* YES / NO Buttons */}
              <div className="flex gap-3">
                {activeLeave !== leave.id ? (
                  <button onClick={() => setActiveLeave(leave.id)}
                    className="flex-1 bg-red-50 border border-red-200 text-red-700 font-semibold py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm">
                    Respond →
                  </button>
                ) : (
                  <>
                    <motion.button
                      onClick={() => respond(leave.id, 'YES')}
                      disabled={!!acting}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 bg-green-500/20 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl hover:bg-green-500/30 disabled:opacity-50 transition-all text-sm">
                      {acting === leave.id + 'YES' ? '...' : '✅ YES — Approve'}
                    </motion.button>
                    <motion.button
                      onClick={() => respond(leave.id, 'NO')}
                      disabled={!!acting}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 bg-red-500/20 border border-red-500/40 text-red-400 font-bold py-3 rounded-xl hover:bg-red-500/30 disabled:opacity-50 transition-all text-sm">
                      {acting === leave.id + 'NO' ? '...' : '❌ NO — Reject'}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  )
}
