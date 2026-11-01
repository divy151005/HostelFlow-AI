import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { mentorApi } from '../../api'
import { format } from 'date-fns'

const navLinks = [
  { to: '/mentor', icon: '📊', label: 'Supervision & Analytics' },
  { to: '/mentor/approvals', icon: '📝', label: 'Leave Approvals' },
  { to: '/messages', icon: '💬', label: 'Student Messages' },
  { to: '/security', icon: '🛡️', label: 'Gate Kiosk' },
]

export default function MentorDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [studentDetails, setStudentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const loadData = async () => {
    try {
      const res = await mentorApi.getAnalytics()
      const data = res.data.data
      setAnalytics(data)
      if (data?.students?.length > 0) {
        const firstStudent = data.students[0].student
        setSelectedStudentId(firstStudent.id)
        loadStudentActivity(firstStudent.id)
      }
    } catch {
      toast.error('Could not load mentor supervision analytics')
    } finally {
      setLoading(false)
    }
  }

  const loadStudentActivity = async (id) => {
    setLoadingDetails(true)
    try {
      const res = await mentorApi.getStudentActivity(id)
      setStudentDetails(res.data.data)
    } catch {
      toast.error('Could not load student details')
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id)
    loadStudentActivity(id)
  }

  return (
    <Layout navLinks={navLinks} title="Mentor Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#3f0d12]">
              🧑‍🏫 Mentor Student Supervision & Analytics
            </h1>
            <p className="text-sm text-rose-700 mt-1">
              Supervision dashboard for your assigned mentees with attendance, gate pass history, and communications.
            </p>
          </div>
          <Link
            to="/mentor/approvals"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 flex items-center gap-1.5"
          >
            <span>📝</span> Review Pending Approvals
          </Link>
        </div>

        {/* Aggregated Analytics for Mentor's Mentees */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-rose-100/60 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">👥</div>
              <div className="font-black text-2xl text-[#3f0d12]">{analytics?.totalStudents || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Assigned Mentees</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">📋</div>
              <div className="font-black text-2xl text-red-600">{analytics?.totalLeaves || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Total Leave Requests</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">🚪</div>
              <div className="font-black text-2xl text-stone-800">{analytics?.totalExits || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Total Campus Exits</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">⏰</div>
              <div className="font-black text-2xl text-rose-700">{analytics?.totalLateReturns || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Late Return Incidents</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">⚠️</div>
              <div className="font-black text-2xl text-amber-700">{analytics?.totalComplaints || 0}</div>
              <div className="text-xs text-rose-700 font-medium">Registered Grievances</div>
            </div>
          </div>
        )}

        {/* Mentees Selector & Detailed Profiles */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mentees List Column */}
          <div className="bg-white border border-rose-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-[#3f0d12] uppercase tracking-wider">
              Assigned Students ({analytics?.students?.length || 0})
            </h2>

            {analytics?.students?.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No students are currently linked to your mentor email.</p>
            ) : (
              <div className="space-y-2">
                {analytics?.students?.map(item => {
                  const s = item.student
                  const isSelected = selectedStudentId === s.id
                  const isOutside = item.currentStatus === 'OUTSIDE'
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectStudent(s.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-rose-50 border-red-500 shadow-sm'
                          : 'border-rose-100 bg-[#fffbfa] hover:bg-rose-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-[#3f0d12] truncate">{s.fullName}</div>
                        <div className="text-xs text-rose-700 truncate">
                          {s.rollNumber} • Room {s.roomNumber}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOutside ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {isOutside ? 'OUTSIDE' : 'INSIDE'}
                        </span>
                        <div className="text-[10px] text-stone-500 mt-1">
                          Att: {item.attendancePercentage}%
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Student Profile & Supervision Detail */}
          <div className="lg:col-span-2 space-y-5">
            {loadingDetails ? (
              <div className="h-64 bg-white border border-rose-200 rounded-3xl p-6 animate-pulse" />
            ) : !studentDetails ? (
              <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-xs text-stone-500">
                Select a student on the left to view comprehensive supervisory data.
              </div>
            ) : (
              <>
                {/* Profile Card */}
                <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                        {studentDetails.student?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-black text-lg text-[#3f0d12] flex items-center gap-2">
                          {studentDetails.student?.fullName}
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            studentDetails.currentStatus === 'INSIDE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {studentDetails.currentStatus === 'INSIDE' ? '🟢 Inside Hostel' : '🟡 Outside Campus'}
                          </span>
                        </h2>
                        <div className="text-xs text-rose-700 mt-0.5">
                          {studentDetails.student?.rollNumber} • Room {studentDetails.student?.roomNumber} (Block {studentDetails.student?.hostelBlock})
                        </div>
                        <div className="text-xs text-stone-600 mt-1">
                          Phone: {studentDetails.student?.phone} · Parent: {studentDetails.student?.parentEmail || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/messages?partnerId=${studentDetails.student?.id}`}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <span>💬</span> Chat With Student
                      </Link>
                    </div>
                  </div>

                  {/* Mentee Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-rose-100 text-xs">
                    <div className="p-3 bg-[#fffbfa] rounded-xl border border-rose-100">
                      <span className="text-rose-700 block text-[11px]">Calculated Attendance</span>
                      <b className="text-base text-red-600">{studentDetails.attendancePercentage}%</b>
                    </div>
                    <div className="p-3 bg-[#fffbfa] rounded-xl border border-rose-100">
                      <span className="text-rose-700 block text-[11px]">Total Gate Exits</span>
                      <b className="text-base text-[#3f0d12]">{studentDetails.totalExits}</b>
                    </div>
                    <div className="p-3 bg-[#fffbfa] rounded-xl border border-rose-100">
                      <span className="text-rose-700 block text-[11px]">Late Returns</span>
                      <b className="text-base text-rose-700">{studentDetails.lateReturnsCount}</b>
                    </div>
                    <div className="p-3 bg-[#fffbfa] rounded-xl border border-rose-100">
                      <span className="text-rose-700 block text-[11px]">Grievance Count</span>
                      <b className="text-base text-stone-800">{studentDetails.complaintCount}</b>
                    </div>
                  </div>
                </div>

                {/* Gate Entry & Exit Activity Timeline */}
                <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-sm text-[#3f0d12] mb-3 flex items-center gap-2">
                    📋 Gate Activity & Timestamps for {studentDetails.student?.fullName}
                  </h3>

                  {!studentDetails.timeline || studentDetails.timeline.length === 0 ? (
                    <p className="text-xs text-stone-500 py-2">No gate movement recorded for this mentee.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {studentDetails.timeline.map((event, idx) => {
                        const isExit = event.type === 'GATE_EXIT'
                        return (
                          <div key={idx} className="p-3 bg-[#fffbfa] border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span>{isExit ? '🚪' : '🏠'}</span>
                              <div>
                                <div className="font-bold text-[#3f0d12]">
                                  {isExit ? 'Campus Exit Scan' : 'Campus Return Scan'}
                                </div>
                                <div className="text-[11px] text-stone-500 mt-0.5">
                                  {isExit ? `Destination: ${event.destination || 'City'}` : 'Turnstile Inward Scan'}
                                  {event.isLate && <span className="text-red-600 font-bold ml-1">⏰ Delayed by {event.lateByMinutes}m</span>}
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
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
