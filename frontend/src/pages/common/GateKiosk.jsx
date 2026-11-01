import { useState, useEffect } from 'react'
import { gateApi, visitorApi } from '../../api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function GateKiosk() {
  const [activeTab, setActiveTab] = useState('STUDENT') // 'STUDENT' or 'VISITOR'
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [logs, setLogs] = useState([])
  const [actionLoading, setActionLoading] = useState(false)

  // Visitor state
  const [visitorCode, setVisitorCode] = useState('')
  const [visitorResult, setVisitorResult] = useState(null)
  const [visitorLoading, setVisitorLoading] = useState(false)

  const fetchLogs = async () => {
    try {
      const res = await gateApi.getLogs()
      setLogs(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchLogs()
    const timer = setInterval(fetchLogs, 15000)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = async (overrideQuery) => {
    const q = overrideQuery || query
    if (!q.trim()) {
      toast.error('Please enter a roll number or QR token')
      return
    }
    setLoading(true)
    try {
      const res = await gateApi.lookup(q.trim())
      setProfile(res.data.data)
      toast.success('Student verified')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Student not found')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleGateAction = async (scanType) => {
    if (!profile) return
    setActionLoading(true)
    try {
      const payload = {
        rollNumber: profile.rollNumber,
        scanType: scanType
      }
      if (profile.activeLeave?.qrToken) {
        payload.qrToken = profile.activeLeave.qrToken
      }
      await gateApi.scan(payload)
      toast.success(`Gate ${scanType === 'OUT' ? 'EXIT' : 'RETURN'} recorded successfully!`)
      // Refresh profile & logs
      handleSearch(profile.rollNumber)
      fetchLogs()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to process gate scan')
    } finally {
      setActionLoading(false)
    }
  }

  const handleVisitorAction = async (action) => {
    if (!visitorCode.trim()) {
      toast.error('Enter 4-digit visitor pass code or token')
      return
    }
    setVisitorLoading(true)
    try {
      const res = await visitorApi.gateAction({ code: visitorCode.trim(), action })
      setVisitorResult(res.data.data)
      toast.success(`Visitor ${action === 'ENTRY' ? 'ENTRY' : 'EXIT'} confirmed!`)
      fetchLogs()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid visitor code or pass expired')
    } finally {
      setVisitorLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7f7] text-[#3f0d12]">
      {/* Top Header */}
      <header className="bg-white border-b border-rose-200 px-6 py-4 flex flex-wrap items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-200">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#3f0d12]">HostelFlow <span className="text-red-600">Gate Security Kiosk</span></h1>
            <p className="text-xs text-[#9f1239]">Campus Main Gate Entry & Exit Verification Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <div className="flex bg-rose-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'STUDENT' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d] hover:text-red-700'
              }`}
            >
              🎓 Student Gate Pass
            </button>
            <button
              onClick={() => setActiveTab('VISITOR')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'VISITOR' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d] hover:text-red-700'
              }`}
            >
              👥 Visitor Verification
            </button>
          </div>
          <Link
            to="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-[#7f1d1d]"
          >
            ← Exit Kiosk
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Verification Scanner / Search */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'STUDENT' ? (
            <>
              {/* Search Card */}
              <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9f1239] mb-2">
                  Verify Student Pass (Roll Number or Token)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. CS2021001 or scan token..."
                    className="flex-1 px-4 py-3 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-[#fffdfd]"
                  />
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-200 transition-all text-sm disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : '🔍 Verify'}
                  </button>
                </div>

                {/* Quick Test Demo Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-rose-100">
                  <span className="text-xs text-[#9f1239] font-medium">Quick Demo:</span>
                  <button
                    onClick={() => { setQuery('CS2021001'); handleSearch('CS2021001') }}
                    className="text-xs px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 font-semibold"
                  >
                    Rahul (Outside)
                  </button>
                  <button
                    onClick={() => { setQuery('CS2021002'); handleSearch('CS2021002') }}
                    className="text-xs px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-300 font-semibold"
                  >
                    🚨 Priya (Overdue)
                  </button>
                  <button
                    onClick={() => { setQuery('EC2022015'); handleSearch('EC2022015') }}
                    className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 font-semibold"
                  >
                    Aarav (Inside)
                  </button>
                </div>
              </div>

              {/* Student Result Card */}
              {profile ? (
                <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-md relative overflow-hidden">
                  {/* Status Banner */}
                  <div className={`py-2 px-4 -mx-6 -mt-6 mb-5 flex items-center justify-between font-bold text-xs uppercase tracking-wider ${
                    profile.isOverdue
                      ? 'bg-red-600 text-white animate-pulse'
                      : profile.isOutside
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    <span>
                      {profile.isOverdue ? '🚨 OVERDUE / LATE RETURN ALERT' : profile.isOutside ? '🟡 CURRENTLY OUTSIDE (GATE PASS SCANNED OUT)' : '🟢 INSIDE HOSTEL PREMISES'}
                    </span>
                    <span>Risk Level: {profile.riskLevel}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-rose-100">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {profile.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-[#3f0d12] truncate">{profile.fullName}</h2>
                      <div className="text-xs text-[#9f1239] space-x-2 mt-0.5">
                        <span className="font-semibold text-red-600">{profile.rollNumber}</span>
                        <span>•</span>
                        <span>Room {profile.roomNumber} (Block {profile.hostelBlock})</span>
                        <span>•</span>
                        <span>Student Phone: {profile.phone}</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        Parent Emergency Contact: <strong className="text-[#3f0d12]">{profile.parentPhone || 'Not available'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Active Pass Section */}
                  {profile.activeLeave ? (
                    <div className="my-5 p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-red-700">Active Gate Authorization</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                          {profile.activeLeave.outingKind || profile.activeLeave.type}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-[#3f0d12] mb-1">
                        Destination: <span className="font-normal">{profile.activeLeave.destination || 'City Outing'}</span>
                      </div>
                      <div className="text-xs text-[#9f1239] mb-3">
                        Reason: {profile.activeLeave.reason}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-rose-100">
                        <div>
                          <span className="text-stone-500">Exit Scanned:</span>
                          <div className="font-semibold text-[#3f0d12]">
                            {profile.activeLeave.scannedOutAt ? new Date(profile.activeLeave.scannedOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending Exit'}
                          </div>
                        </div>
                        <div>
                          <span className="text-stone-500">Expected Curfew:</span>
                          <div className={`font-semibold ${profile.isOverdue ? 'text-red-600 font-bold' : 'text-[#3f0d12]'}`}>
                            {profile.activeLeave.expectedReturn ? new Date(profile.activeLeave.expectedReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="my-5 p-4 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-600">
                      ℹ️ No active approved leave request pending for gate exit right now.
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => handleGateAction('OUT')}
                      disabled={actionLoading || profile.isOutside}
                      className="py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      🚪 Mark Gate EXIT (OUT)
                    </button>
                    <button
                      onClick={() => handleGateAction('IN')}
                      disabled={actionLoading || !profile.isOutside}
                      className="py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      ✅ Mark Gate RETURN (IN)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-rose-200 text-center shadow-sm">
                  <div className="text-5xl mb-3">🔍</div>
                  <h3 className="text-base font-bold text-[#3f0d12]">Ready for Gate Pass Scan</h3>
                  <p className="text-xs text-[#9f1239] max-w-sm mx-auto mt-1">
                    Enter the student roll number above or scan their physical/digital QR gate pass to view status and authorize gate passage.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Visitor Tab */
            <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#3f0d12]">Visitor Pass Gate Check-in / Check-out</h2>
                <p className="text-xs text-[#9f1239] mt-0.5">Enter the 4-digit numeric code provided to approved visitors.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={visitorCode}
                  onChange={e => setVisitorCode(e.target.value)}
                  placeholder="Enter 4-digit code (e.g. 4821 or 7103)..."
                  className="flex-1 px-4 py-3 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-[#fffdfd] font-mono tracking-widest text-center text-lg font-bold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleVisitorAction('ENTRY')}
                  disabled={visitorLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                >
                  🟢 Check In (Visitor ENTRY)
                </button>
                <button
                  onClick={() => handleVisitorAction('EXIT')}
                  disabled={visitorLoading}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                >
                  🚪 Check Out (Visitor DEPARTURE)
                </button>
              </div>

              {visitorResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold text-sm">✅ Pass Verified: {visitorResult.visitorName}</div>
                  <div>Relationship: {visitorResult.relationship} • Phone: {visitorResult.visitorPhone}</div>
                  <div>Visiting Student: {visitorResult.studentName} (Room {visitorResult.studentRoom})</div>
                  <div>Status: <span className="font-bold">{visitorResult.status}</span></div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs text-[#7f1d1d]">
                <strong>💡 Visitor Demo Codes:</strong><br />
                • Code <code className="font-bold">4821</code> — Ramesh Sharma (Parent visiting Rahul Sharma, Room A-204)<br />
                • Code <code className="font-bold">7103</code> — Sunita Singh (Parent visiting Priya Singh, Room B-101)
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Today's Live Gate Activity Stream */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-rose-200 shadow-sm flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div>
              <h3 className="font-bold text-sm text-[#3f0d12]">Live Gate Activity Stream</h3>
              <p className="text-xs text-[#9f1239]">Real-time entry & exit movements</p>
            </div>
            <button
              onClick={fetchLogs}
              className="text-xs px-2.5 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-red-700 font-semibold"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-rose-50 pr-1 mt-2 space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-500">No gate activity logged today.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="pt-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#3f0d12]">{log.studentName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.isLate
                        ? 'bg-red-100 text-red-700'
                        : log.status === 'RETURNED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {log.isLate ? '⚠️ LATE RETURN' : log.status}
                    </span>
                  </div>
                  <div className="text-[#9f1239] flex items-center justify-between">
                    <span>{log.rollNumber} • {log.roomNumber}</span>
                    <span className="text-stone-500 font-mono">
                      {log.actualReturn
                        ? `Returned: ${new Date(log.actualReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : log.scannedOutAt
                        ? `Exited: ${new Date(log.scannedOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
