import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Campus3DView from '../../components/3d/Campus3DView'
import { wardenApi } from '../../api'
import { format } from 'date-fns'

const navLinks = [
  { to: '/warden', icon: '📊', label: 'Dashboard' },
  { to: '/warden/supervision', icon: '👁️', label: 'Live Supervision' },
  { to: '/warden/leaves', icon: '📋', label: 'Leave Requests' },
  { to: '/warden/mess', icon: '🍲', label: 'Mess Operations' },
  { to: '/warden/operations', icon: '🛠️', label: 'Complaints & Maint.' },
  { to: '/warden/incidents', icon: '⚠️', label: 'Student Incidents' },
  { to: '/warden/students', icon: '👥', label: 'Students' },
  { to: '/messages', icon: '💬', label: 'Messages' },
]

export default function WardenSupervision() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // ALL, OUTSIDE, OVERDUE
  const [show3DCampus, setShow3DCampus] = useState(true)

  const loadData = async () => {
    try {
      const res = await wardenApi.getSupervisionOverview()
      setOverview(res.data.data)
    } catch {
      toast.error('Could not load supervision data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const outsideStudents = overview?.outsideStudents || []
  const overdueStudents = overview?.overdueStudents || []

  return (
    <Layout navLinks={navLinks} title="Warden Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#3f0d12]">
              👁️ Real-Time Hostel Supervision & Presence
            </h1>
            <p className="text-sm text-rose-700 mt-1">
              Live turnstile presence, gate check-in status, expected returns, and overdue student workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShow3DCampus(!show3DCampus)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border shadow-sm transition-all ${
                show3DCampus ? 'bg-red-600 text-white border-red-600' : 'bg-white text-rose-800 border-rose-200'
              }`}
            >
              {show3DCampus ? '🌐 3D Campus View Active' : '🌐 Show 3D Campus Digital Twin'}
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 rounded-xl text-xs font-bold shadow-sm"
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>

        {/* 3D Campus Digital Twin */}
        {show3DCampus && (
          <Campus3DView
            stats={overview}
            onBuildingSelect={(buildingId) => {
              if (buildingId === 'SECURITY_GATE') setFilter('OUTSIDE')
            }}
          />
        )}

        {/* Supervision Counters */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-rose-100/60 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">👥</div>
              <div className="font-black text-2xl text-[#3f0d12]">{overview?.totalStudents || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Total Registered Residents</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl mb-1">🟢</div>
              <div className="font-black text-2xl text-emerald-950">{overview?.currentlyInside || 0}</div>
              <div className="text-xs text-emerald-800 font-semibold">Currently Inside Hostel</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-2xl mb-1">🟡</div>
              <div className="font-black text-2xl text-amber-950">{overview?.currentlyOutside || 0}</div>
              <div className="text-xs text-amber-800 font-semibold">Currently Outside Campus</div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="text-2xl mb-1">🚨</div>
              <div className="font-black text-2xl text-red-700">{overview?.overdueCount || 0}</div>
              <div className="text-xs text-red-700 font-semibold">Overdue Delayed Students</div>
            </div>
          </div>
        )}

        {/* OVERDUE ALERTS BANNER WITH ONE-CLICK PARENT MESSAGING */}
        {overdueStudents.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-300 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              <div>
                <h2 className="text-base font-black text-red-900">
                  {overdueStudents.length} Student(s) Have Exceeded Expected Return Time!
                </h2>
                <p className="text-xs text-red-700">
                  No return turnstile scan detected after the expected curfew. Direct parent communication enabled below.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {overdueStudents.map((stud, idx) => (
                <div key={idx} className="bg-white border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-[#3f0d12]">{stud.studentName}</strong>
                      <span className="text-xs text-rose-700 font-mono">({stud.rollNumber})</span>
                      <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Overdue by {stud.minutesLate} mins
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      Room: <b>{stud.roomNumber || '—'}</b> · Phone: <b>{stud.phone || '—'}</b> · Parent: <b>{stud.parentEmail || '—'}</b>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Expected return: {stud.expectedReturn ? format(new Date(stud.expectedReturn), 'PPp') : '—'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/messages"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 flex items-center gap-1.5"
                    >
                      <span>💬</span> Direct Message Parent
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outside Students Directory */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <h2 className="text-base font-bold text-[#3f0d12]">
              🚶 Active Outings & Outside Residents ({outsideStudents.length})
            </h2>
          </div>

          {outsideStudents.length === 0 ? (
            <p className="text-xs text-stone-500 py-4">All students are currently checked in inside the hostel.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rose-100 text-rose-800 pb-2">
                    <th className="py-2.5">Student</th>
                    <th>Room</th>
                    <th>Destination & Reason</th>
                    <th>Exit Timestamp</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {outsideStudents.map((s, idx) => {
                    const isLate = s.minutesLate > 0
                    return (
                      <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-3 font-semibold text-[#3f0d12]">
                          {s.studentName}
                          <div className="text-[10px] text-stone-500 font-normal">{s.rollNumber}</div>
                        </td>
                        <td>{s.roomNumber || '—'}</td>
                        <td>
                          <div className="font-medium text-stone-800">{s.destination || 'City Outing'}</div>
                          <div className="text-[10px] text-stone-500">{s.reason}</div>
                        </td>
                        <td>
                          {s.scannedOutAt ? format(new Date(s.scannedOutAt), 'hh:mm a') : '—'}
                        </td>
                        <td>
                          {s.expectedReturn ? format(new Date(s.expectedReturn), 'hh:mm a') : '—'}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isLate ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isLate ? `OVERDUE (${s.minutesLate}m)` : 'OUTSIDE'}
                          </span>
                        </td>
                        <td>
                          <Link
                            to="/messages"
                            className="text-red-600 hover:text-red-700 font-bold hover:underline"
                          >
                            Chat Parent →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
