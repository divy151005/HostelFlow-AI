import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { studentApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { formatDistanceToNow } from 'date-fns'

const navLinks = [
  { to: '/student',               icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply',         icon: '✈️', label: 'Apply Leave/Outing' },
  { to: '/student/history',       icon: '📜', label: 'History' },
  { to: '/student/notifications', icon: '🔔', label: 'Notifications' },
]

const typeIcons = {
  LEAVE_SUBMITTED:      '📤',
  LEAVE_APPROVED:       '✅',
  LEAVE_REJECTED:       '❌',
  LATE_RETURN:          '⏰',
  HIGH_RISK_ALERT:      '🚨',
  QR_SCANNED:           '🔳',
  ESCALATION:           '📢',
  PARENT_APPROVAL_NEEDED: '👨‍👩‍👦',
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentApi.getNotifs(0).then(res => {
      setNotifs(res.data.data?.content || [])
      studentApi.markAllRead()
    }).finally(() => setLoading(false))
  }, [])

  return (
    <Layout navLinks={navLinks} title="Notifications">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#3f0d12]">Notifications</h1>
        <span className="text-[#9f1239] text-sm">{notifs.length} total</span>
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-rose-100 rounded-xl animate-pulse" />)}</div>
      ) : notifs.length === 0 ? (
        <div className="text-center text-[#9f1239] mt-20">
          <div className="text-5xl mb-4">🔕</div>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <motion.div key={n.id}
              initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}
              className={`rounded-xl p-4 border flex items-start gap-3 ${
                !n.read ? 'bg-red-50 border-red-200' : 'bg-white border-rose-200'
              }`}>
              <span className="text-xl flex-shrink-0">{typeIcons[n.type] || '📬'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[#3f0d12] text-sm font-semibold">{n.title}</div>
                <div className="text-[#9f1239] text-xs mt-0.5 leading-relaxed">{n.message}</div>
              </div>
              <div className="text-[#9f1239] text-xs flex-shrink-0">
                {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  )
}
