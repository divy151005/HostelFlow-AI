import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { adminApi } from '../../api'

const navLinks = [
  { to: '/admin', icon: '🏛️', label: 'Admin Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'User Directory' },
  { to: '/admin/rooms', icon: '🏢', label: 'Room Matrix' },
  { to: '/admin/finance', icon: '💳', label: 'Fees & No-Dues' },
  { to: '/admin/operations', icon: '🛠️', label: 'Operations & Maint.' },
  { to: '/messages', icon: '💬', label: 'Messages' },
  { to: '/security', icon: '🛡️', label: 'Gate Kiosk' },
]

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [oRes, aRes] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getAnalytics()
      ])
      setOverview(oRes.data.data)
      setAnalytics(aRes.data.data)
    } catch {
      toast.error('Could not load admin institutional dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  return (
    <Layout navLinks={navLinks} title="Admin Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#3f0d12]">
              🏛️ Institutional Administration & Operations Oversight
            </h1>
            <p className="text-sm text-rose-700 mt-1">
              Cross-portal oversight across students, faculty mentors, wardens, dining operations, and facility maintenance.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 flex items-center gap-1.5"
            >
              <span>👥</span> Manage Users
            </Link>
            <Link
              to="/admin/rooms"
              className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <span>🏢</span> Room Matrix
            </Link>
            <Link
              to="/admin/finance"
              className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <span>💳</span> Fees & No-Dues
            </Link>
            <Link
              to="/admin/operations"
              className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <span>🛠️</span> Operations
            </Link>
          </div>
        </div>

        {/* Overview Stat Tiles */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-24 bg-rose-100/60 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">👨‍🎓</div>
              <div className="font-black text-2xl text-[#3f0d12]">{overview?.totalStudents || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Enrolled Students</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">🧑‍🏫</div>
              <div className="font-black text-2xl text-[#3f0d12]">{overview?.totalMentors || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Faculty Mentors</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="font-black text-2xl text-[#3f0d12]">{overview?.totalWardens || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Hostel Wardens</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">🏢</div>
              <div className="font-black text-2xl text-red-600">{overview?.occupancyPercentage || 85}%</div>
              <div className="text-xs text-rose-700 font-medium">Hostel Occupancy</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl mb-1">🟢</div>
              <div className="font-black text-2xl text-emerald-950">{overview?.currentlyInside || 0}</div>
              <div className="text-xs text-emerald-800 font-semibold">Inside Hostel</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-2xl mb-1">🟡</div>
              <div className="font-black text-2xl text-amber-950">{overview?.currentlyOutside || 0}</div>
              <div className="text-xs text-amber-800 font-semibold">Outside Campus</div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="text-2xl mb-1">🚨</div>
              <div className="font-black text-2xl text-red-700">{overview?.overdueCount || 0}</div>
              <div className="text-xs text-red-700 font-semibold">Overdue Students</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">⏳</div>
              <div className="font-black text-2xl text-rose-700">{overview?.pendingLeaves || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Pending Leaves</div>
            </div>
          </div>
        )}

        {/* Institutional Performance Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Operations & Resolution Health */}
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#3f0d12]">
              📈 Grievance & Maintenance Resolution Rates
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block">Complaint Resolution Rate</span>
                <b className="text-2xl text-emerald-600">{analytics?.complaintResolutionRate || 100}%</b>
                <div className="text-[11px] text-stone-500 mt-1">
                  {analytics?.resolvedComplaints || 0} of {analytics?.totalComplaints || 0} resolved
                </div>
              </div>

              <div className="p-4 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block">Maintenance Task Completion</span>
                <b className="text-2xl text-red-600">{analytics?.maintenanceCompletionRate || 100}%</b>
                <div className="text-[11px] text-stone-500 mt-1">
                  {analytics?.completedMaintenanceTasks || 0} of {analytics?.totalMaintenanceTasks || 0} completed
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block">Avg Mess Food Quality</span>
                <b className="text-xl text-amber-600">{analytics?.avgFoodQuality || '4.2'}/5</b>
              </div>
              <div className="p-4 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block">Avg Mess Hygiene</span>
                <b className="text-xl text-emerald-600">{analytics?.avgFoodHygiene || '4.0'}/5</b>
              </div>
            </div>
          </div>

          {/* Student Risk & Welfare Status */}
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#3f0d12]">
              🛡️ Student Risk & Welfare Distribution
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                <div>
                  <b className="text-red-900 block text-sm">High Risk Students: {analytics?.highRiskStudents || 0}</b>
                  <span className="text-red-700 text-xs">Flagged for repeated curfew delay pattern</span>
                </div>
                <Link to="/admin/users?role=STUDENT" className="text-xs font-bold text-red-700 hover:underline">
                  Inspect Students →
                </Link>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <b className="text-amber-900 block text-sm">Medium Risk Students: {analytics?.mediumRiskStudents || 0}</b>
                  <span className="text-amber-700 text-xs">Monitored for periodic attendance gaps</span>
                </div>
                <span className="text-xs font-bold text-amber-700">Active Monitoring</span>
              </div>

              <div className="p-4 bg-[#fffbfa] border border-rose-100 rounded-2xl flex items-center justify-between">
                <div>
                  <b className="text-[#3f0d12] block text-sm">Total Disciplinary Incidents: {overview?.totalIncidents || 0}</b>
                  <span className="text-stone-500 text-xs">Formally logged with parent & mentor notices</span>
                </div>
                <Link to="/admin/operations" className="text-xs font-bold text-red-600 hover:underline">
                  View Cases →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
