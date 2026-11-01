import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
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

export default function WardenIncidents() {
  const [incidents, setIncidents] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  // Registration Form
  const [form, setForm] = useState({
    studentId: '',
    type: 'REPEATED_LATE_RETURN',
    severity: 'MEDIUM',
    title: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Action / Resolution Modal
  const [actionTarget, setActionTarget] = useState(null)
  const [actionNote, setActionNote] = useState('')
  const [actionStatus, setActionStatus] = useState('CLOSED')
  const [acting, setActing] = useState(false)

  const loadData = async () => {
    try {
      const [iRes, sRes] = await Promise.all([
        wardenApi.getIncidents(),
        wardenApi.getAllStudents()
      ])
      setIncidents(iRes.data.data || [])
      const studs = sRes.data.data || []
      setStudents(studs)
      if (studs.length > 0 && !form.studentId) {
        setForm(prev => ({ ...prev, studentId: studs[0].id }))
      }
    } catch {
      toast.error('Could not load incident data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.studentId || !form.title.trim() || !form.description.trim()) {
      return toast.error('Please fill all required incident details')
    }
    setSubmitting(true)
    try {
      await wardenApi.registerIncident(form)
      toast.success('Incident notice issued. Notices sent to student, parent & mentor!')
      setForm({
        studentId: students[0]?.id || '',
        type: 'REPEATED_LATE_RETURN',
        severity: 'MEDIUM',
        title: '',
        description: ''
      })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register incident')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async () => {
    if (!actionNote.trim() || !actionTarget) return
    setActing(true)
    try {
      await wardenApi.actionIncident(actionTarget.id, {
        actionNote: actionNote.trim(),
        status: actionStatus
      })
      toast.success('Action recorded and incident status updated')
      setActionTarget(null)
      setActionNote('')
      loadData()
    } catch {
      toast.error('Failed to update incident')
    } finally {
      setActing(false)
    }
  }

  return (
    <Layout navLinks={navLinks} title="Warden Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#3f0d12]">
            ⚠️ Warden-Registered Student Incidents & Disciplinary Record
          </h1>
          <p className="text-sm text-rose-700 mt-1">
            Formal registry for repeated delays, misconduct, or rule infractions with automated student, parent, and mentor notices.
          </p>
        </div>

        {/* 2-Column: Register Form + Recent List */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <form onSubmit={handleRegister} className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#3f0d12]">Register Formal Incident Notice</h2>
              <p className="text-xs text-rose-700">Creates an official inquiry and invites student explanation.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Select Student</label>
              <select
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value })}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.rollNumber} - Room {s.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Incident Type</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg text-xs bg-[#fffbfa]"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="REPEATED_LATE_RETURN">Late Return Pattern</option>
                  <option value="UNAUTHORISED_ABSENCE">Unauthorised Absence</option>
                  <option value="MISCONDUCT">Misconduct / Noise</option>
                  <option value="PROPERTY_DAMAGE">Property Damage</option>
                  <option value="RULE_VIOLATION">Hostel Rule Violation</option>
                  <option value="OTHER">Other Disciplinary Issue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Severity</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg text-xs bg-[#fffbfa]"
                  value={form.severity}
                  onChange={e => setForm({ ...form, severity: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Notice Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                placeholder="E.g. Repeated late arrival past 10 PM"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Specific Details & Observations</label>
              <textarea
                required
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa] min-h-24"
                placeholder="Dates, gate reports, witnesses, or damage notes..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-200"
            >
              {submitting ? 'Issuing Notice...' : 'Issue Incident Notice'}
            </button>
          </form>

          {/* Incident Records Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#3f0d12] mb-3">
                📋 Registered Student Incidents ({incidents.length})
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-28 bg-rose-100/60 rounded-xl animate-pulse" />)}
                </div>
              ) : incidents.length === 0 ? (
                <p className="text-xs text-stone-500 py-4">No incidents have been registered.</p>
              ) : (
                <div className="space-y-3">
                  {incidents.map(inc => (
                    <div key={inc.id} className="p-4 rounded-2xl border border-rose-100 bg-[#fffbfa] space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-[#3f0d12]">{inc.title}</strong>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              {inc.severity}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inc.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                              inc.status === 'EXPLANATION_SUBMITTED' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {inc.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">
                            Student: <b>{inc.studentName}</b> ({inc.rollNumber} · Room {inc.roomNumber || '—'}) · {inc.type?.replace('_', ' ')} · Issued: {inc.createdAt?.slice(0, 10)}
                          </p>
                        </div>

                        <button
                          onClick={() => setActionTarget(inc)}
                          className="px-3 py-1 bg-white hover:bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold shadow-sm"
                        >
                          ⚖️ Record Action
                        </button>
                      </div>

                      <p className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-rose-50">
                        {inc.description}
                      </p>

                      {/* Student explanation if submitted */}
                      {inc.studentExplanation ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                          <b>Student Formal Explanation ({inc.studentExplanationAt ? format(new Date(inc.studentExplanationAt), 'PP') : ''}):</b>
                          <p className="mt-1">{inc.studentExplanation}</p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-400 italic">
                          Awaiting formal written explanation from student.
                        </div>
                      )}

                      {/* Warden action if closed */}
                      {inc.wardenAction && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                          <b>Disciplinary / Advisory Action Recorded:</b>
                          <p className="mt-1">{inc.wardenAction}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action / Close Modal */}
        {actionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-300 shadow-2xl">
              <h3 className="font-bold text-base text-[#3f0d12]">
                Record Action for: {actionTarget.studentName}
              </h3>
              <p className="text-xs text-stone-600">
                Notice: {actionTarget.title}. Record the verified outcome, verbal counselling, penalty, or closure.
              </p>

              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                  value={actionStatus}
                  onChange={e => setActionStatus(e.target.value)}
                >
                  <option value="CLOSED">CLOSED (Resolved with Counselling/Warning)</option>
                  <option value="ACTION_TAKEN">ACTION_TAKEN (Pending verification)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Further inquiry)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Warden Action Notes</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa] min-h-24"
                  placeholder="E.g. Student met with warden and mentor; formal curfew warning acknowledged."
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionTarget(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!actionNote.trim() || acting}
                  onClick={handleAction}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-red-200"
                >
                  {acting ? 'Saving...' : 'Save & Close Case'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
