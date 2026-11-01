import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { wardenApi } from '../../api'
import Layout from '../../components/layout/Layout'

const navLinks = [
  { to: '/warden',            icon: '📊', label: 'Dashboard' },
  { to: '/warden/supervision',icon: '👁️', label: 'Supervision' },
  { to: '/warden/leaves',     icon: '📋', label: 'Leave Requests' },
  { to: '/warden/rooms',      icon: '🏢', label: 'Room Matrix' },
  { to: '/warden/mess',       icon: '🍲', label: 'Mess Operations' },
  { to: '/warden/visitors',   icon: '👥', label: 'Visitor Passes' },
  { to: '/warden/finance',    icon: '💳', label: 'Fees & No-Dues' },
  { to: '/warden/operations', icon: '🛠️', label: 'Operations' },
  { to: '/warden/students',   icon: '👥', label: 'Students' },
  { to: '/messages',          icon: '💬', label: 'Messages' },
  { to: '/security',          icon: '🛡️', label: 'Gate Kiosk' },
]

const COLORS = ['#f87171', '#fb923c', '#b91c1c']

export default function WardenDashboard() {
  const [stats, setStats] = useState(null)
  const [out, setOut] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([wardenApi.getStats(), wardenApi.currentlyOut()])
      .then(([sRes, oRes]) => {
        setStats(sRes.data.data)
        setOut(oRes.data.data || [])
      }).finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { label: 'Currently Out',    value: stats.currentlyOut,    icon: '🚶', color: '#dc2626' },
    { label: 'Pending Approval', value: stats.pendingApproval, icon: '⏳', color: '#f97316' },
    { label: 'Late Returns',     value: stats.totalLateReturns,icon: '⏰', color: '#b91c1c' },
    { label: 'HIGH RISK',        value: stats.highRiskStudents,icon: '🚨', color: '#991b1b' },
    { label: 'Total Students',   value: stats.totalStudents,   icon: '👥', color: '#e11d48' },
  ] : []

  const weeklyData = stats?.weeklyTrend || []
  const riskData = stats ? [
    { name: 'Low',    value: stats.riskDistribution?.LOW    || 0 },
    { name: 'Medium', value: stats.riskDistribution?.MEDIUM || 0 },
    { name: 'High',   value: stats.riskDistribution?.HIGH   || 0 },
  ] : []

  return (
    <Layout navLinks={navLinks} title="Warden Portal">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="text-2xl font-black text-[#3f0d12]">Warden Dashboard</h1>
        <p className="text-[#9f1239] text-sm mt-1">Real-time hostel monitoring & management</p>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-rose-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.07 }}}}
          initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6"
        >
          {statCards.map(s => (
            <motion.div key={s.label}
              variants={{ hidden:{opacity:0,y:20}, show:{opacity:1,y:0} }}
              className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[#9f1239] text-xs mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Alert Banner */}
      {stats?.highRiskStudents > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="text-red-700 font-bold">{stats.highRiskStudents} HIGH RISK student(s)</div>
              <div className="text-red-700/80 text-sm">Immediate attention required</div>
            </div>
          </div>
          <Link to="/warden/students" className="text-red-700 text-sm hover:underline">View →</Link>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Weekly Chart */}
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-[#3f0d12] font-bold mb-4 text-sm">📈 Weekly Leave Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="date" tick={{ fill: '#9f1239', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#9f1239', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #fecdd3', borderRadius: 8, color: '#3f0d12' }} />
              <Bar dataKey="total"    fill="#f87171" radius={[4,4,0,0]} name="Total" />
              <Bar dataKey="approved" fill="#dc2626" radius={[4,4,0,0]} name="Approved" />
              <Bar dataKey="late"     fill="#991b1b" radius={[4,4,0,0]} name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-[#3f0d12] font-bold mb-4 text-sm">🛡️ Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                {riskData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #fecdd3', borderRadius: 8, color: '#3f0d12' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {['Low','Medium','High'].map((l, i) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-[#9f1239]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Currently Out */}
      <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#3f0d12] font-bold text-sm">🚶 Currently Out of Hostel</h2>
          <span className="text-[#9f1239] text-xs">{out.length} students</span>
        </div>
        {out.length === 0 ? (
          <p className="text-[#9f1239] text-sm text-center py-4">✅ All students are in the hostel</p>
        ) : (
          <div className="space-y-2">
            {out.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-rose-200 last:border-0">
                <div>
                  <div className="text-[#3f0d12] text-sm font-medium">{l.studentName}</div>
                  <div className="text-[#9f1239] text-xs">{l.rollNumber} • {l.destination || 'Destination N/A'}</div>
                </div>
                <div className="text-xs text-[#9f1239]">
                  Return: {l.expectedReturn ? new Date(l.expectedReturn).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warden Operations & Services Hub */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-[#3f0d12] uppercase tracking-wider mb-3">Warden Supervision & Management Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/warden/supervision"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🌐
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">3D Campus & Presence</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Live turnstile presence, overdue alerts & 3D twin</p>
            </div>
          </Link>

          <Link
            to="/warden/rooms"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🏢
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Room Matrix & Allocation</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Block floorplans, bed assignments & swap approvals</p>
            </div>
          </Link>

          <Link
            to="/warden/mess"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🍲
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Mess & Headcount Predictor</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Weekly menu editor, food waste savings & Sunday poll</p>
            </div>
          </Link>

          <Link
            to="/warden/visitors"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              👥
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Visitor Pass Approvals</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Review guest requests & gate access codes</p>
            </div>
          </Link>

          <Link
            to="/warden/finance"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              💳
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Fines & No-Dues Signoff</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Issue disciplinary fines & sign institutional clearance</p>
            </div>
          </Link>

          <Link
            to="/warden/operations"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🛠️
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Central Complaints & Maint.</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Assign staff to electrical, plumbing & clean tasks</p>
            </div>
          </Link>

          <Link
            to="/warden/incidents"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              ⚠️
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Student Incident Notices</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Issue formal breach notices & review explanations</p>
            </div>
          </Link>

          <Link
            to="/security"
            className="bg-white border border-rose-200 hover:border-red-400 rounded-2xl p-4 shadow-sm transition-all group flex items-start gap-3.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 text-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              🛡️
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Gate Security Kiosk</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">Main gate guard terminal & live turnstile scanner</p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
