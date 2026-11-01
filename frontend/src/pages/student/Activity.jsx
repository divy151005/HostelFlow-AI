import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { studentApi } from '../../api'
import { format } from 'date-fns'

const navLinks = [
  { to: '/student', icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply', icon: '✈️', label: 'Apply Leave' },
  { to: '/student/history', icon: '📜', label: 'History' },
  { to: '/student/activity', icon: '📍', label: 'My Gate Activity' },
  { to: '/student/mess', icon: '🍲', label: 'Mess & Food' },
  { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
  { to: '/messages', icon: '💬', label: 'Messages' },
]

export default function StudentActivity() {
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSosModal, setShowSosModal] = useState(false)
  const [sosNote, setSosNote] = useState('')
  const [sosTriggering, setSosTriggering] = useState(false)

  const loadActivity = async () => {
    try {
      const res = await studentApi.getActivity()
      setActivity(res.data.data)
    } catch {
      toast.error('Could not load student activity data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadActivity() }, [])

  const handleSos = async () => {
    setSosTriggering(true)
    try {
      await studentApi.triggerSOS({ note: sosNote || 'Emergency assistance needed on campus' })
      toast.success('🚨 EMERGENCY SOS BROADCASTED TO WARDEN, MENTOR & PARENT!')
      setShowSosModal(false)
      setSosNote('')
      loadActivity()
    } catch {
      toast.error('Failed to trigger SOS alert')
    } finally {
      setSosTriggering(false)
    }
  }

  return (
    <Layout navLinks={navLinks} title="Student Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & SOS Button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#3f0d12] flex items-center gap-2">
              📍 Gate Passes, Attendance & Presence
            </h1>
            <p className="text-sm text-rose-700 mt-1">
              Live tracking of your gate entry/exit scans, inside/outside presence, and activity history.
            </p>
          </div>

          <button
            onClick={() => setShowSosModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-200 flex items-center gap-2 animate-pulse"
          >
            <span>🚨</span> Trigger Emergency SOS
          </button>
        </div>

        {/* Status & Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-rose-100/60 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Live Presence Status */}
            <div className={`p-4 rounded-2xl border ${
              activity?.currentStatus === 'INSIDE'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="text-2xl mb-1">{activity?.currentStatus === 'INSIDE' ? '🟢' : '🟡'}</div>
              <div className="font-black text-xl">{activity?.currentStatus || 'INSIDE'}</div>
              <div className="text-xs font-semibold mt-0.5">Hostel Presence</div>
            </div>

            {/* Attendance % */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-white shadow-sm">
              <div className="text-2xl mb-1">📊</div>
              <div className="font-black text-xl text-red-600">{activity?.attendancePercentage || 95}%</div>
              <div className="text-xs text-rose-700 mt-0.5">Attendance Standing</div>
            </div>

            {/* Gate Exits */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-white shadow-sm">
              <div className="text-2xl mb-1">🚪</div>
              <div className="font-black text-xl text-[#3f0d12]">{activity?.totalExits || 0}</div>
              <div className="text-xs text-rose-700 mt-0.5">Total Gate Exits</div>
            </div>

            {/* Gate Returns */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-white shadow-sm">
              <div className="text-2xl mb-1">📥</div>
              <div className="font-black text-xl text-[#3f0d12]">{activity?.totalReturns || 0}</div>
              <div className="text-xs text-rose-700 mt-0.5">Total Gate Returns</div>
            </div>

            {/* Late Returns */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-white shadow-sm">
              <div className="text-2xl mb-1">⏰</div>
              <div className="font-black text-xl text-rose-700">{activity?.lateReturnsCount || 0}</div>
              <div className="text-xs text-rose-700 mt-0.5">Late Return Incidents</div>
            </div>
          </div>
        )}

        {/* Gate Activity Timeline */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#3f0d12] mb-4 flex items-center gap-2">
            📋 Detailed Gate Scans & Timeline
          </h2>

          {!activity?.timeline || activity.timeline.length === 0 ? (
            <p className="text-xs text-stone-500 py-4">No gate scan activity recorded yet.</p>
          ) : (
            <div className="relative border-l-2 border-rose-200 ml-4 space-y-6 py-2">
              {activity.timeline.map((event, idx) => {
                const isExit = event.type === 'GATE_EXIT'
                return (
                  <div key={idx} className="relative pl-6">
                    <span className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${
                      isExit ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {isExit ? '🚶' : '🏠'}
                    </span>
                    <div className="bg-[#fffbfa] border border-rose-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-sm text-[#3f0d12]">
                          {isExit ? 'Gate Pass Scan — Outing Exit' : 'Gate Pass Scan — Campus Return'}
                        </span>
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {event.formattedTime || (event.timestamp ? format(new Date(event.timestamp), 'PPp') : '—')}
                        </span>
                      </div>
                      {isExit ? (
                        <p className="text-xs text-stone-600 mt-1">
                          <b>Destination:</b> {event.destination || 'City Outing'} · <b>Reason:</b> {event.reason}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-600 mt-1">
                          Verified check-in at security turnstile.
                          {event.isLate && (
                            <span className="text-red-600 font-bold ml-2">
                              ⚠️ Delayed Return by {event.lateByMinutes} minutes
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SOS Emergency Modal */}
        {showSosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-red-300 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600">
                <span className="text-3xl">🚨</span>
                <h3 className="text-lg font-black text-[#3f0d12]">Confirm Emergency SOS</h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                Triggering an Emergency SOS will immediately broadcast a priority notification with your name, room number, and phone number to:
              </p>
              <ul className="text-xs font-semibold text-rose-800 list-disc list-inside space-y-1">
                <li>Hostel Warden</li>
                <li>Assigned Faculty Mentor</li>
                <li>Linked Parent</li>
              </ul>
              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Optional Note / Location Details</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                  placeholder="E.g. Near West Block Gate, Need medical kit"
                  value={sosNote}
                  onChange={e => setSosNote(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSosModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sosTriggering}
                  onClick={handleSos}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-200"
                >
                  {sosTriggering ? 'Broadcasting...' : 'Yes, Broadcast SOS'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
