import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { studentApi, chatApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import AiAssistantModal from '../../components/common/AiAssistantModal'
import { format } from 'date-fns'

const navLinks = [
  { to: '/student', icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply', icon: '✈️', label: 'Apply Leave' },
  { to: '/student/history', icon: '📜', label: 'History' },
  { to: '/student/activity', icon: '📍', label: 'Gate Activity' },
  { to: '/student/mess', icon: '🍲', label: 'Mess & Food' },
  { to: '/student/rooms', icon: '🏢', label: 'Room & Swap' },
  { to: '/student/visitors', icon: '👥', label: 'Visitor Pass' },
  { to: '/student/finance', icon: '💳', label: 'Fees & No-Dues' },
  { to: '/community', icon: '🧺', label: 'Laundry & Life' },
  { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
  { to: '/messages', icon: '💬', label: 'Messages' },
  { to: '/security', icon: '🛡️', label: 'Gate Kiosk' },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [activity, setActivity] = useState(null)
  const [unreadMsgCount, setUnreadMsgCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAiModal, setShowAiModal] = useState(false)

  useEffect(() => {
    Promise.all([
      studentApi.getHistory(0),
      studentApi.getActivity(),
      chatApi.getUnreadCount()
    ]).then(([hRes, aRes, mRes]) => {
      setHistory(hRes.data.data?.content || [])
      setActivity(aRes.data.data || null)
      setUnreadMsgCount(mRes.data.data || 0)
    }).finally(() => setLoading(false))
  }, [])

  const activeLeave = history.find(l => ['APPROVED', 'PENDING_WARDEN', 'PENDING_MENTOR', 'PENDING_PARENT'].includes(l.status))
  const lateCount = user?.lateReturnCount || 0
  const riskColors = { LOW: '#ef4444', MEDIUM: '#f97316', HIGH: '#b91c1c' }
  const riskLevel = user?.riskLevel || 'LOW'
  const isInside = activity?.currentStatus !== 'OUTSIDE'

  return (
    <Layout navLinks={navLinks} title="Student Portal">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#3f0d12]">
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'},{' '}
            <span className="text-red-600">{user?.fullName?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-[#9f1239] text-sm mt-1">
            {user?.rollNumber} • Room {user?.roomNumber} • Block {user?.hostelBlock}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Presence Status */}
          <span className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-1.5 shadow-sm ${
            isInside ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span>{isInside ? '🟢' : '🟡'}</span>
            <span>{isInside ? 'Currently Inside Hostel' : 'Currently Outside Campus'}</span>
          </span>

          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2 bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <span>🤖</span> Ask AI Guide
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Risk Evaluation', value: riskLevel, color: riskColors[riskLevel], icon: '🛡️' },
          { label: 'Late Return Incidents', value: lateCount, color: '#b91c1c', icon: '⏰' },
          { label: 'Total Leaves Applied', value: history.length, color: '#dc2626', icon: '📋' },
          { label: 'Unread Messages', value: unreadMsgCount, color: '#f97316', icon: '💬', to: '/messages' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm relative">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[#9f1239] text-xs mt-1 font-medium">{stat.label}</div>
            {stat.to && (
              <Link to={stat.to} className="absolute inset-0 rounded-2xl" />
            )}
          </div>
        ))}
      </div>

      {/* High Risk or Overdue Alerts */}
      {riskLevel === 'HIGH' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-red-700 font-bold">HIGH RISK Status Alert</div>
            <div className="text-red-700/80 text-xs mt-0.5">
              You have been flagged HIGH RISK due to repeated delays ({lateCount} late returns). Please meet your hostel warden.
            </div>
          </div>
        </div>
      )}

      {activity?.isOverdue && (
        <div className="bg-rose-100 border border-rose-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="text-rose-950 font-bold">Return Overdue Warning</div>
            <div className="text-rose-900 text-xs mt-0.5">
              You have exceeded your approved expected return time without scanning in. Return to the hostel immediately.
            </div>
          </div>
        </div>
      )}

      {/* Active Leave / Gate Pass Card */}
      {activeLeave && (
        <div className="bg-gradient-to-br from-white to-rose-50 border border-rose-200 rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✈️</span>
              <h2 className="font-bold text-[#3f0d12]">Active Outing / Leave Pass</h2>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {activeLeave.status}
              </span>
            </div>
            {activeLeave.status === 'APPROVED' && (
              <Link
                to={`/student/qr/${activeLeave.id}`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200"
              >
                View QR Gate Pass 📲
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-stone-700">
            <div>
              <span className="text-rose-700 font-semibold block">Type:</span>
              <b>{activeLeave.outingKind?.replace('_', ' ') || activeLeave.type}</b>
            </div>
            <div>
              <span className="text-rose-700 font-semibold block">Destination:</span>
              <b>{activeLeave.destination || 'Local'}</b>
            </div>
            <div>
              <span className="text-rose-700 font-semibold block">From Date:</span>
              <b>{activeLeave.fromDate ? format(new Date(activeLeave.fromDate), 'PP') : '—'}</b>
            </div>
            <div>
              <span className="text-rose-700 font-semibold block">Expected Return:</span>
              <b>{activeLeave.expectedReturn ? format(new Date(activeLeave.expectedReturn), 'PPp') : '—'}</b>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Tiles - All Student Portal Features */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-[#3f0d12] uppercase tracking-wider mb-3">Student Portal Services & Utilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/student/mess"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🍲
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Mess & Skip-a-Meal</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Dining menu, food rebate & Sunday feast voting</p>
            </div>
          </Link>

          <Link
            to="/student/rooms"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🏢
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Room & 3D Explorer</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Bed allocation matrix, room swap & 3D viewer</p>
            </div>
          </Link>

          <Link
            to="/student/visitors"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              👥
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Visitor & Guest Passes</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Apply for visitor passes with 4-digit gate OTP</p>
            </div>
          </Link>

          <Link
            to="/student/finance"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              💳
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Fees & No-Dues</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Pay dues & 4-department digital clearance certificate</p>
            </div>
          </Link>

          <Link
            to="/community"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🧺
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Laundry & Community</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Book washing machine slots & Lost-and-Found</p>
            </div>
          </Link>

          <Link
            to="/student/care"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🛠️
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Hostel Care & AI Triage</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">File complaints with AI analysis & weekly review</p>
            </div>
          </Link>

          <Link
            to="/student/activity"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              📍
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Gate Activity & SOS</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Check-in/out log history & emergency broadcast</p>
            </div>
          </Link>

          <Link
            to="/messages"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              💬
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Mentor & Warden Chat</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Direct 1-to-1 private messaging with unread alerts</p>
            </div>
          </Link>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AiAssistantModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </Layout>
  )
}
