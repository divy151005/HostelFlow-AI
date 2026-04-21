// Parent/Dashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { parentApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/parent',          icon: '🏠', label: 'Dashboard' },
  { to: '/parent/approval', icon: '✅', label: 'Approve Leave' },
]

export default function ParentDashboard() {
  const [student, setStudent] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      parentApi.getLinkedStudent(),
      parentApi.getStudentLeaves(),
      parentApi.getNotifs()
    ]).then(([sRes, lRes, nRes]) => {
      setStudent(sRes.data.data)
      setLeaves(lRes.data.data?.content || [])
      setNotifs(nRes.data.data?.content || [])
    }).finally(() => setLoading(false))
  }, [])

  const pending = leaves.filter(l => l.status === 'PENDING_PARENT')
  const riskColors = { LOW: '#ef4444', MEDIUM: '#f97316', HIGH: '#b91c1c' }

  return (
    <Layout navLinks={navLinks} title="Parent Portal">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="text-2xl font-black text-[#3f0d12]">Parent Dashboard 👨‍👩‍👦</h1>
        <p className="text-[#9f1239] text-sm mt-1">Monitor your child's hostel activity</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-rose-100 rounded-2xl animate-pulse"/>)}</div>
      ) : (
        <>
          {/* Student Card */}
          {student && (
            <div className="bg-gradient-to-br from-white to-rose-50 border border-rose-200 rounded-2xl p-5 mb-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-xl font-bold text-white">
                  {student.fullName?.charAt(0)}
                </div>
                <div>
                  <div className="text-[#3f0d12] font-black text-lg">{student.fullName}</div>
                  <div className="text-[#9f1239] text-sm">{student.rollNumber} • Room {student.roomNumber}</div>
                  <div className="text-[#9f1239] text-xs">{student.course} • {student.year}</div>
                </div>
                <div className="ml-auto text-center">
                  <div className="font-black text-xl" style={{ color: riskColors[student.riskLevel || 'LOW'] }}>
                    {student.riskLevel || 'LOW'}
                  </div>
                  <div className="text-[#9f1239] text-xs">Risk Level</div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          {pending.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <div className="text-red-700 font-bold">{pending.length} request(s) need your approval</div>
                    <div className="text-red-700/80 text-sm">Please review and respond</div>
                  </div>
                </div>
                <Link to="/parent/approval" className="bg-white border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                  Review →
                </Link>
              </div>
            </div>
          )}

          {/* Recent Leaves */}
          <h2 className="text-[#3f0d12] font-bold mb-3 text-sm uppercase tracking-wider">Recent Leave Activity</h2>
          <div className="space-y-2">
            {leaves.slice(0,5).map(l => (
              <div key={l.id} className="bg-white border border-rose-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <span className="text-xl">{l.type === 'LEAVE' ? '✈️' : '🚶'}</span>
                <div className="flex-1 min-w-0">
                <div className="text-[#3f0d12] text-sm truncate">{l.reason}</div>
                <div className="text-[#9f1239] text-xs">
                  {l.fromDate ? format(new Date(l.fromDate), 'PP') : '—'}
                  {l.outingKind && <span className="text-red-600 ml-2">{l.outingKind.replaceAll('_', ' ')}</span>}
                  {l.isLate && <span className="text-red-400 ml-2">⏰ Late</span>}
                </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  l.status === 'APPROVED' ? 'text-red-700 bg-red-100' :
                  l.status === 'PENDING_PARENT' ? 'text-orange-700 bg-orange-50' :
                  l.status === 'REJECTED' ? 'text-red-800 bg-red-100' :
                  'text-stone-600 bg-stone-100'
                }`}>
                  {l.status.replace('_',' ')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}
