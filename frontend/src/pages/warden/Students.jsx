// ─── Warden/Students.jsx ───────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { wardenApi } from '../../api'
import Layout from '../../components/layout/Layout'

const navLinks = [
  { to: '/warden',           icon: '📊', label: 'Dashboard' },
  { to: '/warden/leaves',    icon: '📋', label: 'Leave Requests' },
  { to: '/warden/students',  icon: '👥', label: 'Students' },
  { to: '/warden/analytics', icon: '📈', label: 'Analytics' },
]

const riskBadge = {
  LOW:    'text-red-700 bg-red-50',
  MEDIUM: 'text-orange-700 bg-orange-50',
  HIGH:   'text-red-800 bg-red-100 animate-pulse',
}

export function WardenStudents() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wardenApi.getAllStudents().then(res => setStudents(res.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.roomNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout navLinks={navLinks} title="Students">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-black text-[#3f0d12]">Students</h1>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, roll no, room..."
          className="bg-white border border-rose-200 rounded-xl px-4 py-2 text-[#3f0d12] placeholder-[#b91c1c]/50 focus:outline-none focus:border-red-500 text-sm w-64" />
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-16 bg-rose-100 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}
              className="bg-white border border-rose-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {s.fullName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#3f0d12] font-semibold">{s.fullName}</div>
                <div className="text-[#9f1239] text-xs">{s.rollNumber} • Room {s.roomNumber} • Block {s.hostelBlock}</div>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-[#3f0d12] font-bold">{s.lateReturnCount || 0}</div>
                <div className="text-[#9f1239] text-xs">Late</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${riskBadge[s.riskLevel || 'LOW']}`}>
                {s.riskLevel || 'LOW'}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default WardenStudents
