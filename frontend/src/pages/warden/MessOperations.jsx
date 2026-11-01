import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { messApi, messExtApi, wardenApi } from '../../api'

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

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function WardenMessOperations() {
  const [timetables, setTimetables] = useState([])
  const [selectedDay, setSelectedDay] = useState('MONDAY')
  const [foodFeedback, setFoodFeedback] = useState([])
  const [feedbackStats, setFeedbackStats] = useState(null)
  const [foodComplaints, setFoodComplaints] = useState([])
  const [kitchenHeadcount, setKitchenHeadcount] = useState(null)
  const [loading, setLoading] = useState(true)

  // Edit Menu State
  const [editMenuForm, setEditMenuForm] = useState({
    breakfastItems: '',
    breakfastTiming: '07:30 - 09:30',
    lunchItems: '',
    lunchTiming: '12:30 - 14:30',
    snacksItems: '',
    snacksTiming: '17:00 - 18:00',
    dinnerItems: '',
    dinnerTiming: '19:30 - 21:30',
    specialNotes: ''
  })
  const [savingMenu, setSavingMenu] = useState(false)

  const loadData = async () => {
    try {
      const [tRes, fRes, sRes, cRes, kRes] = await Promise.all([
        messApi.getTimetable(),
        messApi.getAllFeedback(),
        messApi.getStats(),
        wardenApi.getComplaints({ foodOnly: true }),
        messExtApi.getKitchenHeadcount().catch(() => ({ data: { data: null } }))
      ])
      const tables = tRes.data.data || []
      setTimetables(tables)
      setFoodFeedback(fRes.data.data || [])
      setFeedbackStats(sRes.data.data || null)
      setFoodComplaints(cRes.data.data || [])
      setKitchenHeadcount(kRes.data.data || null)

      // Initialize form with selected day
      populateEditForm(selectedDay, tables)
    } catch {
      toast.error('Could not load mess operations data')
    } finally {
      setLoading(false)
    }
  }

  const populateEditForm = (day, tables) => {
    const table = tables.find(t => t.dayOfWeek?.toUpperCase() === day)
    if (table) {
      setEditMenuForm({
        breakfastItems: table.breakfast?.items || '',
        breakfastTiming: table.breakfast?.timing || '07:30 - 09:30',
        lunchItems: table.lunch?.items || '',
        lunchTiming: table.lunch?.timing || '12:30 - 14:30',
        snacksItems: table.snacks?.items || '',
        snacksTiming: table.snacks?.timing || '17:00 - 18:00',
        dinnerItems: table.dinner?.items || '',
        dinnerTiming: table.dinner?.timing || '19:30 - 21:30',
        specialNotes: table.specialNotes || ''
      })
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDaySelect = (day) => {
    setSelectedDay(day)
    populateEditForm(day, timetables)
  }

  const handleSaveMenu = async (e) => {
    e.preventDefault()
    setSavingMenu(true)
    try {
      await messApi.updateTimetable(selectedDay, {
        breakfast: { items: editMenuForm.breakfastItems, timing: editMenuForm.breakfastTiming, category: 'Veg' },
        lunch: { items: editMenuForm.lunchItems, timing: editMenuForm.lunchTiming, category: 'Veg/Non-Veg' },
        snacks: { items: editMenuForm.snacksItems, timing: editMenuForm.snacksTiming, category: 'Snacks' },
        dinner: { items: editMenuForm.dinnerItems, timing: editMenuForm.dinnerTiming, category: 'Veg/Non-Veg' },
        specialNotes: editMenuForm.specialNotes
      })
      toast.success(`Menu for ${selectedDay} successfully updated!`)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update menu')
    } finally {
      setSavingMenu(false)
    }
  }

  const handleUpdateComplaint = async (complaint, newStatus) => {
    const staff = window.prompt('Assign staff member (e.g. Chef Ramesh / Mess Supervisor):', complaint.assignedStaffName || 'Mess Supervisor')
    const resolutionNotes = newStatus === 'RESOLVED'
      ? window.prompt('Resolution notes for student:', complaint.resolutionNotes || 'Quality verified and corrected') || 'Resolved'
      : complaint.resolutionNotes || ''

    try {
      await wardenApi.updateComplaint(complaint.id, {
        status: newStatus,
        assignedStaffName: staff,
        resolutionNotes,
        note: `Status updated to ${newStatus}. Assigned to: ${staff}`
      })
      toast.success('Food complaint updated')
      loadData()
    } catch {
      toast.error('Could not update complaint')
    }
  }

  return (
    <Layout navLinks={navLinks} title="Warden Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#3f0d12]">
            🍲 Warden Mess Operations & Meal Management
          </h1>
          <p className="text-sm text-rose-700 mt-1">
            Weekly dining schedule configuration, student food feedback trends, and kitchen complaint resolutions.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-1">⭐</div>
            <div className="font-black text-2xl text-amber-600">{feedbackStats?.avgFoodQuality || '4.2'}/5</div>
            <div className="text-xs text-rose-700 font-medium">Avg Food Quality Rating</div>
          </div>

          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-1">🧼</div>
            <div className="font-black text-2xl text-emerald-600">{feedbackStats?.avgHygiene || '4.0'}/5</div>
            <div className="text-xs text-rose-700 font-medium">Avg Kitchen Hygiene</div>
          </div>

          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-1">📋</div>
            <div className="font-black text-2xl text-[#3f0d12]">{foodFeedback.length}</div>
            <div className="text-xs text-rose-700 font-medium">Student Ratings Received</div>
          </div>

          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-1">🚨</div>
            <div className="font-black text-2xl text-red-600">{foodComplaints.length}</div>
            <div className="text-xs text-rose-700 font-medium">Active Food Complaints</div>
          </div>
        </div>

        {/* Smart Kitchen Headcount Predictor & Food-Waste Metrics */}
        {kitchenHeadcount && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-rose-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#3f0d12] flex items-center gap-2">
                  🌱 Real-Time Kitchen Headcount Predictor (Food Waste Reduction)
                </h2>
                <p className="text-xs text-stone-600">
                  Calculates exact plate requirements factoring approved leaves and in-app meal opt-outs.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Estimated Food Saved</span>
                <span className="text-lg font-black text-emerald-700">{kitchenHeadcount.estimatedFoodSavedKg} kg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-emerald-100">
                <div className="text-xs text-stone-500 font-semibold">Breakfast Plates</div>
                <div className="text-xl font-black text-[#3f0d12] mt-1">{kitchenHeadcount.expectedDiners?.BREAKFAST || 0}</div>
                <div className="text-[10px] text-stone-400">Opted Out: {kitchenHeadcount.optOutCounts?.BREAKFAST || 0}</div>
              </div>

              <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-emerald-100">
                <div className="text-xs text-stone-500 font-semibold">Lunch Plates</div>
                <div className="text-xl font-black text-[#3f0d12] mt-1">{kitchenHeadcount.expectedDiners?.LUNCH || 0}</div>
                <div className="text-[10px] text-stone-400">Opted Out: {kitchenHeadcount.optOutCounts?.LUNCH || 0}</div>
              </div>

              <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-emerald-100">
                <div className="text-xs text-stone-500 font-semibold">Snacks Servings</div>
                <div className="text-xl font-black text-[#3f0d12] mt-1">{kitchenHeadcount.expectedDiners?.SNACKS || 0}</div>
                <div className="text-[10px] text-stone-400">Opted Out: {kitchenHeadcount.optOutCounts?.SNACKS || 0}</div>
              </div>

              <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-emerald-100">
                <div className="text-xs text-stone-500 font-semibold">Dinner Plates</div>
                <div className="text-xl font-black text-[#3f0d12] mt-1">{kitchenHeadcount.expectedDiners?.DINNER || 0}</div>
                <div className="text-[10px] text-stone-400">Opted Out: {kitchenHeadcount.optOutCounts?.DINNER || 0}</div>
              </div>
            </div>

            <div className="text-[11px] text-stone-600 flex items-center justify-between pt-1">
              <span>Total Hostel Residents: <strong>{kitchenHeadcount.totalHostelStudents}</strong></span>
              <span>Currently on Approved Leave: <strong className="text-red-700">{kitchenHeadcount.onApprovedLeave} students away</strong></span>
            </div>
          </div>
        )}

        {/* Menu Editor Section */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-rose-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#3f0d12]">📅 Edit Weekly Dining Timetable</h2>
              <p className="text-xs text-rose-700">Update meal items and scheduled serving hours for students.</p>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => handleDaySelect(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
                    : 'bg-[#fffbfa] border border-rose-200 text-[#7f1d1d] hover:bg-rose-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Form for Selected Day */}
          <form onSubmit={handleSaveMenu} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Breakfast */}
              <div className="p-4 rounded-2xl border border-rose-100 bg-[#fffbfa] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#3f0d12]">☕ Breakfast</span>
                  <input
                    type="text"
                    className="px-2 py-1 text-xs border border-rose-200 rounded-lg w-32 bg-white"
                    placeholder="07:30 - 09:30"
                    value={editMenuForm.breakfastTiming}
                    onChange={e => setEditMenuForm({ ...editMenuForm, breakfastTiming: e.target.value })}
                  />
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white min-h-16"
                  placeholder="Breakfast items..."
                  value={editMenuForm.breakfastItems}
                  onChange={e => setEditMenuForm({ ...editMenuForm, breakfastItems: e.target.value })}
                />
              </div>

              {/* Lunch */}
              <div className="p-4 rounded-2xl border border-rose-100 bg-[#fffbfa] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#3f0d12]">🍛 Lunch</span>
                  <input
                    type="text"
                    className="px-2 py-1 text-xs border border-rose-200 rounded-lg w-32 bg-white"
                    placeholder="12:30 - 14:30"
                    value={editMenuForm.lunchTiming}
                    onChange={e => setEditMenuForm({ ...editMenuForm, lunchTiming: e.target.value })}
                  />
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white min-h-16"
                  placeholder="Lunch items..."
                  value={editMenuForm.lunchItems}
                  onChange={e => setEditMenuForm({ ...editMenuForm, lunchItems: e.target.value })}
                />
              </div>

              {/* Snacks */}
              <div className="p-4 rounded-2xl border border-rose-100 bg-[#fffbfa] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#3f0d12]">🧋 Evening Snacks</span>
                  <input
                    type="text"
                    className="px-2 py-1 text-xs border border-rose-200 rounded-lg w-32 bg-white"
                    placeholder="17:00 - 18:00"
                    value={editMenuForm.snacksTiming}
                    onChange={e => setEditMenuForm({ ...editMenuForm, snacksTiming: e.target.value })}
                  />
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white min-h-16"
                  placeholder="Snacks items..."
                  value={editMenuForm.snacksItems}
                  onChange={e => setEditMenuForm({ ...editMenuForm, snacksItems: e.target.value })}
                />
              </div>

              {/* Dinner */}
              <div className="p-4 rounded-2xl border border-rose-100 bg-[#fffbfa] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#3f0d12]">🍽️ Dinner</span>
                  <input
                    type="text"
                    className="px-2 py-1 text-xs border border-rose-200 rounded-lg w-32 bg-white"
                    placeholder="19:30 - 21:30"
                    value={editMenuForm.dinnerTiming}
                    onChange={e => setEditMenuForm({ ...editMenuForm, dinnerTiming: e.target.value })}
                  />
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white min-h-16"
                  placeholder="Dinner items..."
                  value={editMenuForm.dinnerItems}
                  onChange={e => setEditMenuForm({ ...editMenuForm, dinnerItems: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Special Dietary / Hygiene Notes</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                placeholder="E.g. Clean drinking water tested; vegetarian separate preparation."
                value={editMenuForm.specialNotes}
                onChange={e => setEditMenuForm({ ...editMenuForm, specialNotes: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={savingMenu}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-200"
            >
              {savingMenu ? 'Saving...' : `Save ${selectedDay} Menu`}
            </button>
          </form>
        </div>

        {/* Mess Complaints Resolution Section */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#3f0d12] mb-3">
            🚨 Active Food & Hygiene Complaints ({foodComplaints.length})
          </h2>

          {foodComplaints.length === 0 ? (
            <p className="text-xs text-stone-500 py-3">No active food complaints found.</p>
          ) : (
            <div className="space-y-3">
              {foodComplaints.map(c => (
                <div key={c.id} className="p-4 rounded-2xl border border-rose-100 bg-[#fffbfa]">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-[#3f0d12]">{c.subject}</strong>
                        <span className="text-xs text-rose-700">({c.category})</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        Reported by: <b>{c.studentName}</b> (Room {c.roomNumber || '—'}) · Priority: <b>{c.priority}</b>
                        {c.assignedStaffName && <span> · Assigned: <b>{c.assignedStaffName}</b></span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        className="px-3 py-1.5 border border-rose-200 rounded-xl text-xs bg-white font-bold"
                        value={c.status}
                        onChange={e => handleUpdateComplaint(c, e.target.value)}
                      >
                        {['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 mt-2">{c.description}</p>
                  {c.attachmentUrl && (
                    <a href={c.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-red-600 hover:underline mt-1 inline-block">
                      📎 View Photo
                    </a>
                  )}
                  {c.resolutionNotes && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      <b>Resolution:</b> {c.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
