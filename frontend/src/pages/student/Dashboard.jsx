import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { studentApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/student',              icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply',        icon: '✈️', label: 'Apply Leave/Outing' },
  { to: '/student/history',      icon: '📜', label: 'History' },
  { to: '/student/notifications',icon: '🔔', label: 'Notifications' },
]

const statusColors = {
  PENDING_WARDEN:  'text-red-700 bg-red-50 border-red-200',
  PENDING_MENTOR:  'text-rose-700 bg-rose-50 border-rose-200',
  PENDING_PARENT:  'text-orange-700 bg-orange-50 border-orange-200',
  APPROVED:        'text-red-700 bg-red-100 border-red-200',
  REJECTED:        'text-red-800 bg-red-100 border-red-300',
  COMPLETED:       'text-pink-700 bg-pink-50 border-pink-200',
  LATE:            'text-red-800 bg-red-100 border-red-300',
  CANCELLED:       'text-stone-600 bg-stone-100 border-stone-200',
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentApi.getHistory(0),
      studentApi.getUnreadCount()
    ]).then(([hRes, uRes]) => {
      setHistory(hRes.data.data?.content || [])
      setUnread(uRes.data.data || 0)
    }).finally(() => setLoading(false))
  }, [])

  navLinks[3].badge = unread > 0 ? unread : null

  const active = history.find(l => ['APPROVED', 'PENDING_WARDEN', 'PENDING_MENTOR', 'PENDING_PARENT'].includes(l.status))
  const lateCount = user?.lateReturnCount || 0
  const riskColors = { LOW: '#ef4444', MEDIUM: '#f97316', HIGH: '#b91c1c' }
  const riskLevel = user?.riskLevel || 'LOW'

  const cardAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <Layout navLinks={navLinks} title="Student Portal">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="text-2xl font-black text-[#3f0d12]">
          Good {new Date().getHours() < 12 ? 'morning' : 'evening'},{' '}
          <span className="text-red-600">{user?.fullName?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-[#9f1239] text-sm mt-1">
          {user?.rollNumber} • Room {user?.roomNumber} • Block {user?.hostelBlock}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: 'Risk Level',      value: riskLevel,  color: riskColors[riskLevel], icon: '🛡️' },
          { label: 'Late Returns',    value: lateCount,  color: '#b91c1c', icon: '⏰' },
          { label: 'Total Leaves',    value: history.length, color: '#dc2626', icon: '📋' },
          { label: 'Notifications',   value: unread,     color: '#f97316', icon: '🔔' },
        ].map(stat => (
          <motion.div key={stat.label} variants={cardAnim}
            className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[#9f1239] text-xs mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* HIGH RISK Banner */}
      {riskLevel === 'HIGH' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-red-700 font-bold">HIGH RISK Status</div>
            <div className="text-red-700/80 text-sm mt-0.5">
              You have been flagged HIGH RISK due to {lateCount} late returns. Please meet the warden.
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }}
        className="mb-6">
        <h2 className="text-[#3f0d12] font-bold mb-3 text-sm uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/student/apply">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-2xl p-5 cursor-pointer shadow-sm">
              <div className="text-3xl mb-2">✈️</div>
              <div className="text-[#3f0d12] font-bold">Apply Leave</div>
              <div className="text-[#9f1239] text-xs mt-1">Multi-day or outing</div>
            </motion.div>
          </Link>
          <Link to="/student/apply?type=OUTING">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-white to-rose-50 border border-rose-200 rounded-2xl p-5 cursor-pointer shadow-sm">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-[#3f0d12] font-bold">Quick Outing</div>
              <div className="text-[#9f1239] text-xs mt-1">One-tap short exit</div>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Active Request */}
      {active && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mb-6">
          <h2 className="text-[#3f0d12] font-bold mb-3 text-sm uppercase tracking-wider">Active Request</h2>
          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{active.type === 'LEAVE' ? '✈️' : '🚶'}</span>
                <span className="text-[#3f0d12] font-semibold">{active.type}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusColors[active.status]}`}>
                {active.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[#9f1239] text-sm mb-2">{active.reason}</p>
            {active.outingKind && (
              <div className="text-red-600 text-xs mb-2">{active.outingKind.replaceAll('_', ' ')}</div>
            )}
            <div className="text-xs text-[#9f1239]">
              Return by: {active.expectedReturn ? format(new Date(active.expectedReturn), 'PPp') : '—'}
            </div>
            {active.status === 'APPROVED' && (
              <Link to={`/student/qr/${active.id}`}
                className="mt-3 flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors">
                🔳 Show QR Gate Pass
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Recent History */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#3f0d12] font-bold text-sm uppercase tracking-wider">Recent Requests</h2>
          <Link to="/student/history" className="text-red-600 text-xs hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-rose-100 rounded-xl animate-pulse" />)}
          </div>
        ) : history.slice(0,3).map(leave => (
          <div key={leave.id} className="bg-white border border-rose-200 rounded-xl p-3 mb-2 flex items-center gap-3 shadow-sm">
            <span className="text-xl">{leave.type === 'LEAVE' ? '✈️' : '🚶'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[#3f0d12] text-sm font-medium truncate">{leave.reason}</div>
              <div className="text-[#9f1239] text-xs">{leave.destination || leave.type}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[leave.status]}`}>
              {leave.status.replace('_',' ')}
            </span>
          </div>
        ))}
      </motion.div>
    </Layout>
  )
}
