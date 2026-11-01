import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { parentApi, announcementApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/parent', icon: '🏠', label: 'Dashboard' },
  { to: '/parent/approval', icon: '✅', label: 'Approve Leave' },
  { to: '/student/visitors', icon: '👥', label: 'Visitor Pass' },
  { to: '/student/finance', icon: '💳', label: 'Fee & Dues' },
  { to: '/messages', icon: '💬', label: 'Warden Chat' },
]

export default function ParentDashboard() {
  const [student, setStudent] = useState(null)
  const [activity, setActivity] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [incidents, setIncidents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      parentApi.getLinkedStudent(),
      parentApi.getStudentActivity(),
      parentApi.getStudentLeaves(),
      parentApi.getIncidents(),
      announcementApi.getAnnouncements()
    ]).then(([sRes, aRes, lRes, iRes, annRes]) => {
      setStudent(sRes.data.data)
      setActivity(aRes.data.data)
      setLeaves(lRes.data.data?.content || [])
      setIncidents(iRes.data.data || [])
      setAnnouncements(annRes.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING_PARENT')
  const isOutside = activity?.currentStatus === 'OUTSIDE'
  const isOverdue = activity?.isOverdue

  return (
    <Layout navLinks={navLinks} title="Parent Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#3f0d12]">
              👨‍👩‍👦 Parent Student Supervision Dashboard
            </h1>
            <p className="text-sm text-rose-700 mt-1">
              Live updates on your child's hostel presence, gate passes, attendance and direct communication with hostel authorities.
            </p>
          </div>

          <Link
            to="/messages"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 flex items-center gap-1.5"
          >
            <span>💬</span> Direct Chat with Warden
          </Link>
        </div>

        {/* OVERDUE OR HIGH RISK WARNING */}
        {isOverdue && (
          <div className="bg-red-100 border border-red-300 rounded-3xl p-5 shadow-sm flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-black text-red-900 text-base">Child Has Not Returned by Expected Time!</h3>
              <p className="text-xs text-red-800 mt-1">
                Your ward has not scanned back into the hostel past the approved curfew time. You can directly message the hostel warden below.
              </p>
              <Link
                to="/messages"
                className="mt-3 inline-block px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Chat with Hostel Warden Now →
              </Link>
            </div>
          </div>
        )}

        {/* Pending Approvals Alert */}
        {pendingLeaves.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-3xl p-5 flex items-center justify-between gap-4 flex-wrap shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="font-bold text-red-900 text-sm">
                  {pendingLeaves.length} Outing / Leave Request(s) Awaiting Your Consent
                </h3>
                <p className="text-xs text-red-700 mt-0.5">Please review destination, timing, and grant approval.</p>
              </div>
            </div>
            <Link
              to="/parent/approval"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200"
            >
              Review Leave Details →
            </Link>
          </div>
        )}

        {/* Child Profile & Live Presence Card */}
        {student && (
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-5 border-b border-rose-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {student.fullName?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-xl text-[#3f0d12]">{student.fullName}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isOutside ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isOutside ? '🟡 Currently Outside Campus' : '🟢 Currently Inside Hostel'}
                    </span>
                  </div>
                  <div className="text-xs text-rose-700 mt-0.5">
                    {student.rollNumber} • Room {student.roomNumber} (Block {student.hostelBlock})
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {student.course} • {student.year} Year
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-rose-700 font-semibold block">Calculated Attendance</span>
                <b className="text-2xl text-red-600">{activity?.attendancePercentage || 95}%</b>
              </div>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-xs">
              <div className="p-3.5 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block text-[11px]">Times Went Outside</span>
                <b className="text-xl text-[#3f0d12]">{activity?.totalExits || 0}</b>
              </div>
              <div className="p-3.5 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block text-[11px]">Times Returned In</span>
                <b className="text-xl text-[#3f0d12]">{activity?.totalReturns || 0}</b>
              </div>
              <div className="p-3.5 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block text-[11px]">Late Returns</span>
                <b className="text-xl text-rose-700">{activity?.lateReturnsCount || 0}</b>
              </div>
              <div className="p-3.5 bg-[#fffbfa] rounded-2xl border border-rose-100">
                <span className="text-rose-700 block text-[11px]">Total Leave Passes</span>
                <b className="text-xl text-stone-800">{leaves.length}</b>
              </div>
            </div>
          </div>
        )}

        {/* Gate Activity Timeline */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#3f0d12] mb-3 flex items-center gap-2">
            📍 Every Exit & Return Date / Time for {student?.fullName}
          </h2>

          {!activity?.timeline || activity.timeline.length === 0 ? (
            <p className="text-xs text-stone-500 py-3">No turnstile movement records found.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {activity.timeline.map((event, idx) => {
                const isExit = event.type === 'GATE_EXIT'
                return (
                  <div key={idx} className="p-3 bg-[#fffbfa] border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{isExit ? '🚪' : '🏠'}</span>
                      <div>
                        <b className="text-[#3f0d12]">{isExit ? 'Hostel Gate Exit' : 'Hostel Gate Return'}</b>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {isExit ? `Destination: ${event.destination || 'City'}` : 'Turnstile Inward Scan'}
                          {event.isLate && <span className="text-red-600 font-bold ml-1">⚠️ Delayed Return by {event.lateByMinutes}m</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 text-[11px]">
                      {event.formattedTime || (event.timestamp ? format(new Date(event.timestamp), 'PPp') : '—')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notices and Disciplinary Incidents */}
        {incidents.length > 0 && (
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#3f0d12] mb-3">
              ⚠️ Official Hostel Notices / Incidents ({incidents.length})
            </h2>
            <div className="space-y-2">
              {incidents.map(inc => (
                <div key={inc.id} className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <b className="text-[#3f0d12]">{inc.title}</b>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-stone-700">{inc.description}</p>
                  {inc.wardenAction && (
                    <div className="text-xs text-emerald-900 bg-emerald-50 p-2 rounded-lg mt-1 border border-emerald-200">
                      <b>Warden Action / Resolution:</b> {inc.wardenAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hostel Announcements */}
        {announcements.length > 0 && (
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#3f0d12] mb-3">
              📢 Hostel Announcements & Bulletins
            </h2>
            <div className="space-y-2">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className="p-3 bg-[#fffbfa] border border-rose-100 rounded-xl text-xs">
                  <b className="text-[#3f0d12]">{ann.title}</b>
                  <p className="text-stone-700 mt-1">{ann.content}</p>
                  <div className="text-[10px] text-stone-400 mt-1">
                    Published by {ann.authorName} ({ann.authorRole}) · {ann.createdAt?.slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
