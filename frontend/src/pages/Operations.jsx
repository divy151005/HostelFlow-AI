import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/layout/Layout'
import { wardenApi, adminApi } from '../api'
import { format } from 'date-fns'

export default function Operations({ admin = false }) {
  const [complaints, setComplaints] = useState([])
  const [feedback, setFeedback] = useState([])
  const [maintenanceTasks, setMaintenanceTasks] = useState([])
  const [maintStats, setMaintStats] = useState(null)
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState('complaints') // complaints, maintenance, feedback

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [catFilter, setCatFilter] = useState('ALL')

  // Create Maintenance Modal
  const [showMaintModal, setShowMaintModal] = useState(false)
  const [maintForm, setMaintForm] = useState({
    title: '',
    category: 'ELECTRICAL',
    priority: 'NORMAL',
    roomNumber: '',
    hostelBlock: 'A',
    description: '',
    assignedStaffName: '',
    assignedStaffPhone: ''
  })
  const [creatingMaint, setCreatingMaint] = useState(false)

  const load = async () => {
    try {
      if (admin) {
        const [o, s] = await Promise.all([adminApi.getOperations(), adminApi.getStats()])
        const opData = o.data.data || {}
        setComplaints(opData.complaints || [])
        setFeedback(opData.feedback || [])
        setMaintenanceTasks(opData.maintenanceTasks || [])
        setStats({ ...opData, ...s.data.data })
      } else {
        const [c, f, m, ms] = await Promise.all([
          wardenApi.getComplaints(),
          wardenApi.getFeedback(),
          wardenApi.getMaintenance(),
          wardenApi.getMaintenanceStats()
        ])
        setComplaints(c.data.data || [])
        setFeedback(f.data.data || [])
        setMaintenanceTasks(m.data.data || [])
        setMaintStats(ms.data.data || null)
      }
    } catch {
      toast.error('Could not load operations data')
    }
  }

  useEffect(() => { load() }, [])

  const updateComplaintStatus = async (c, status) => {
    const assignedStaff = prompt('Assign to staff member (e.g. Electrician Sharma, Plumber Ramesh):', c.assignedStaffName || 'Staff Member')
    const resolutionNotes = status === 'RESOLVED'
      ? prompt('Resolution notes (visible to student):', c.resolutionNotes || 'Inspected and repaired') || 'Resolved'
      : c.resolutionNotes || ''

    try {
      await wardenApi.updateComplaint(c.id, {
        status,
        assignedStaffName: assignedStaff,
        resolutionNotes,
        note: `Status updated to ${status}. Assigned to: ${assignedStaff}`
      })
      toast.success('Complaint status updated')
      load()
    } catch {
      toast.error('Could not update complaint')
    }
  }

  const handleCreateMaintenance = async (e) => {
    e.preventDefault()
    if (!maintForm.title.trim() || !maintForm.roomNumber.trim()) {
      return toast.error('Title and Room Number are required')
    }
    setCreatingMaint(true)
    try {
      await wardenApi.createMaintenance(maintForm)
      toast.success('Maintenance task logged successfully!')
      setShowMaintModal(false)
      setMaintForm({
        title: '',
        category: 'ELECTRICAL',
        priority: 'NORMAL',
        roomNumber: '',
        hostelBlock: 'A',
        description: '',
        assignedStaffName: '',
        assignedStaffPhone: ''
      })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setCreatingMaint(false)
    }
  }

  const handleUpdateMaintenanceStatus = async (task, newStatus) => {
    const notes = newStatus === 'COMPLETED' ? prompt('Completion notes:', task.resolutionNotes || 'Work completed') || 'Completed' : ''
    try {
      await wardenApi.updateMaintenance(task.id, {
        status: newStatus,
        resolutionNotes: notes,
        note: `Task moved to ${newStatus}`
      })
      toast.success(`Task status changed to ${newStatus}`)
      load()
    } catch {
      toast.error('Failed to update maintenance task')
    }
  }

  const nav = admin
    ? [
        { to: '/admin', label: 'Admin Dashboard', icon: '🏛️' },
        { to: '/admin/users', label: 'User Directory', icon: '👥' },
        { to: '/admin/operations', label: 'Operations & Maint.', icon: '🛠️' },
        { to: '/messages', label: 'Messages', icon: '💬' },
      ]
    : [
        { to: '/warden', label: 'Dashboard', icon: '📊' },
        { to: '/warden/supervision', label: 'Live Supervision', icon: '👁️' },
        { to: '/warden/leaves', label: 'Leave requests', icon: '📝' },
        { to: '/warden/mess', label: 'Mess Operations', icon: '🍲' },
        { to: '/warden/operations', label: 'Complaints & Maint.', icon: '🛠️' },
        { to: '/warden/incidents', label: 'Student Incidents', icon: '⚠️' },
        { to: '/warden/students', label: 'Students', icon: '👥' },
        { to: '/messages', label: 'Messages', icon: '💬' },
      ]

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
    if (catFilter !== 'ALL' && c.category !== catFilter) return false
    return true
  })

  return (
    <Layout title={admin ? 'Admin Portal' : 'Warden Portal'} navLinks={nav}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#3f0d12]">
              {admin ? '🏛️ Institution-Wide Operations' : '🛠️ Central Complaints & Maintenance'}
            </h1>
            <p className="text-sm text-rose-700 mt-1">
              Common tracking system for mess, maintenance, cleanliness, water, electrical and facility feedback.
            </p>
          </div>

          {!admin && (
            <button
              onClick={() => setShowMaintModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 flex items-center gap-1.5"
            >
              <span>➕</span> Create Maintenance Task
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b border-rose-200 pb-2">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'complaints'
                ? 'bg-red-600 text-white shadow-md shadow-red-200'
                : 'bg-white border border-rose-200 text-[#7f1d1d] hover:bg-rose-50'
            }`}
          >
            🚨 Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'maintenance'
                ? 'bg-red-600 text-white shadow-md shadow-red-200'
                : 'bg-white border border-rose-200 text-[#7f1d1d] hover:bg-rose-50'
            }`}
          >
            🔧 Maintenance Tasks ({maintenanceTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'feedback'
                ? 'bg-red-600 text-white shadow-md shadow-red-200'
                : 'bg-white border border-rose-200 text-[#7f1d1d] hover:bg-rose-50'
            }`}
          >
            📋 Weekly Facility Feedback ({feedback.length})
          </button>
        </div>

        {/* TAB 1: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <section className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-[#fffbfa] p-3 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-[#7f1d1d]">Filter Status:</span>
                {['ALL', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      statusFilter === s ? 'bg-red-600 text-white' : 'text-stone-600 hover:bg-rose-100/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7f1d1d]">Category:</span>
                <select
                  className="px-2.5 py-1 border border-rose-200 rounded-lg text-xs bg-white"
                  value={catFilter}
                  onChange={e => setCatFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="CLEANLINESS">Cleanliness</option>
                  <option value="WATER">Water</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="FOOD_QUALITY">Food Quality</option>
                  <option value="HYGIENE">Hygiene</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Complaints list */}
            {filteredComplaints.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">No complaints matching the selected filters.</p>
            ) : (
              <div className="space-y-3">
                {filteredComplaints.map(c => {
                  const isResolved = c.status === 'RESOLVED'
                  return (
                    <article key={c.id} className="border border-rose-100 rounded-2xl p-4 bg-[#fffbfa] space-y-2">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm text-[#3f0d12]">{c.subject}</strong>
                            <span className="text-xs text-rose-700">({c.category})</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.priority === 'URGENT' ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {c.priority}
                            </span>
                          </div>
                          <div className="text-xs text-stone-600 mt-1">
                            Student: <b>{c.studentName}</b> · Room: <b>{c.roomNumber || '—'}</b> · Submitted: {c.createdAt?.slice(0, 10)}
                            {c.assignedStaffName && (
                              <span className="ml-2 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
                                Assigned: {c.assignedStaffName}
                              </span>
                            )}
                          </div>
                        </div>

                        {!admin && (
                          <div className="flex items-center gap-2">
                            <select
                              className="px-3 py-1 border border-rose-200 rounded-xl text-xs bg-white font-bold"
                              value={c.status}
                              onChange={e => updateComplaintStatus(c, e.target.value)}
                            >
                              {['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-stone-700 mt-2 bg-white p-2.5 rounded-xl border border-rose-50">
                        {c.description}
                      </p>

                      {c.attachmentUrl && (
                        <a href={c.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-red-600 hover:underline inline-block">
                          📎 View Attached Media
                        </a>
                      )}

                      {c.resolutionNotes && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                          <b>Resolution Notes:</b> {c.resolutionNotes}
                        </div>
                      )}

                      {c.reopenedReason && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950">
                          <b>Reopened by Student:</b> {c.reopenedReason}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: MAINTENANCE TASKS */}
        {activeTab === 'maintenance' && (
          <section className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#3f0d12]">
                🔧 Hostel Maintenance Log ({maintenanceTasks.length})
              </h2>
            </div>

            {maintenanceTasks.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">No maintenance tasks recorded.</p>
            ) : (
              <div className="space-y-3">
                {maintenanceTasks.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl border border-rose-100 bg-[#fffbfa] flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-[#3f0d12]">{t.title}</strong>
                        <span className="text-xs text-rose-700">({t.category})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600">
                        Room <b>{t.roomNumber}</b> (Block {t.hostelBlock}) · Priority: <b>{t.priority}</b> · Assigned Staff: <b>{t.assignedStaffName || 'Unassigned'}</b>
                      </div>
                      <p className="text-xs text-stone-700 mt-1">{t.description}</p>
                      {t.resolutionNotes && (
                        <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg mt-1 border border-emerald-200">
                          <b>Resolution:</b> {t.resolutionNotes}
                        </div>
                      )}
                    </div>

                    {!admin && (
                      <select
                        className="px-3 py-1 border border-rose-200 rounded-xl text-xs bg-white font-bold"
                        value={t.status}
                        onChange={e => handleUpdateMaintenanceStatus(t, e.target.value)}
                      >
                        {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: WEEKLY HOSTEL FEEDBACK */}
        {activeTab === 'feedback' && (
          <section className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#3f0d12]">
              📋 Weekly Hostel Condition Responses ({feedback.length})
            </h2>

            {feedback.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">No weekly feedback submissions available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-rose-100 text-rose-800 pb-2">
                      <th className="py-2.5">Student</th>
                      <th>Room</th>
                      <th>Week</th>
                      <th>Ratings Overview</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {feedback.map(f => (
                      <tr key={f.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-2.5 font-bold text-[#3f0d12]">{f.studentName}</td>
                        <td>{f.roomNumber || '—'}</td>
                        <td>{f.weekStart}</td>
                        <td>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(f.ratings || {}).map(([k, v]) => (
                              <span key={k} className="bg-rose-50 border border-rose-200 text-rose-800 px-1.5 py-0.5 rounded text-[10px]">
                                {k.replace(/([A-Z])/g, ' $1')}: <b>{v}/5</b>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-stone-700 max-w-xs">{f.comments || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Modal: Create Maintenance Task */}
        {showMaintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <form onSubmit={handleCreateMaintenance} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-rose-300 shadow-2xl">
              <h3 className="font-bold text-base text-[#3f0d12]">Create New Maintenance Task</h3>
              <p className="text-xs text-stone-600">Assign electrical, plumbing, carpentry or civil repair tasks to staff.</p>

              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                  placeholder="E.g. Geyser replacement in Room 204"
                  value={maintForm.title}
                  onChange={e => setMaintForm({ ...maintForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    placeholder="E.g. A-204"
                    value={maintForm.roomNumber}
                    onChange={e => setMaintForm({ ...maintForm, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Hostel Block</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    placeholder="E.g. A"
                    value={maintForm.hostelBlock}
                    onChange={e => setMaintForm({ ...maintForm, hostelBlock: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    value={maintForm.category}
                    onChange={e => setMaintForm({ ...maintForm, category: e.target.value })}
                  >
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="CLEANING">Cleaning & Sanitation</option>
                    <option value="APPLIANCE">Appliance Repair</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    value={maintForm.priority}
                    onChange={e => setMaintForm({ ...maintForm, priority: e.target.value })}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa] min-h-20"
                  placeholder="Task details..."
                  value={maintForm.description}
                  onChange={e => setMaintForm({ ...maintForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Assigned Staff Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    placeholder="E.g. Sharma Electrician"
                    value={maintForm.assignedStaffName}
                    onChange={e => setMaintForm({ ...maintForm, assignedStaffName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Staff Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    placeholder="987654..."
                    value={maintForm.assignedStaffPhone}
                    onChange={e => setMaintForm({ ...maintForm, assignedStaffPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingMaint}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-200"
                >
                  {creatingMaint ? 'Logging Task...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
