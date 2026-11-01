import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { messApi, messExtApi, studentApi } from '../../api'

const navLinks = [
  { to: '/student', icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply', icon: '✈️', label: 'Apply Leave' },
  { to: '/student/history', icon: '📜', label: 'History' },
  { to: '/student/activity', icon: '📍', label: 'My Gate Activity' },
  { to: '/student/mess', icon: '🍲', label: 'Mess & Food' },
  { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
  { to: '/messages', icon: '💬', label: 'Messages' },
]

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function StudentMessMenu() {
  const [timetables, setTimetables] = useState([])
  const [selectedDay, setSelectedDay] = useState('MONDAY')
  const [foodFeedbackList, setFoodFeedbackList] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    mealType: 'LUNCH',
    foodQualityRating: 4,
    hygieneRating: 4,
    comments: ''
  })
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  // Food Complaint form
  const [complaintForm, setComplaintForm] = useState({
    category: 'FOOD_QUALITY',
    priority: 'NORMAL',
    subject: '',
    description: '',
    attachmentUrl: ''
  })
  const [submittingComplaint, setSubmittingComplaint] = useState(false)

  // Skip-a-Meal & Polling State
  const [optOuts, setOptOuts] = useState([])
  const [totalRebate, setTotalRebate] = useState(0)
  const [skipMealType, setSkipMealType] = useState('DINNER')
  const [skipReason, setSkipReason] = useState('Eating outside / local outing')
  const [skipping, setSkipping] = useState(false)

  const [polls, setPolls] = useState([])
  const [voting, setVoting] = useState(false)

  const loadData = async () => {
    try {
      const [tRes, fRes, cRes, optRes, pRes] = await Promise.all([
        messApi.getTimetable(),
        messApi.getMyFeedback(),
        studentApi.getComplaints(),
        messExtApi.getMyOptOuts().catch(() => ({ data: { data: { optOuts: [], totalRebate: 0 } } })),
        messExtApi.getPolls().catch(() => ({ data: { data: [] } }))
      ])
      setTimetables(tRes.data.data || [])
      setFoodFeedbackList(fRes.data.data || [])
      setOptOuts(optRes.data.data?.optOuts || [])
      setTotalRebate(optRes.data.data?.totalRebate || 0)
      setPolls(pRes.data.data || [])
      // Filter complaints that are food related
      const allC = cRes.data.data || []
      setComplaints(allC.filter(c => c.isFoodRelated || ['FOOD_QUALITY', 'HYGIENE', 'INSECTS', 'INSUFFICIENT_QUANTITY', 'UNDERCOOKED_FOOD'].includes(c.category)))

      // Set today as selectedDay
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      const today = dayNames[new Date().getDay()]
      setSelectedDay(today)
    } catch {
      toast.error('Could not load mess details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const currentMenu = timetables.find(t => t.dayOfWeek?.toUpperCase() === selectedDay)

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmittingFeedback(true)
    try {
      await messApi.submitFeedback(feedbackForm)
      toast.success('Food feedback submitted successfully!')
      setFeedbackForm({ mealType: 'LUNCH', foodQualityRating: 4, hygieneRating: 4, comments: '' })
      const fRes = await messApi.getMyFeedback()
      setFoodFeedbackList(fRes.data.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleSkipMeal = async (e) => {
    e.preventDefault()
    setSkipping(true)
    try {
      await messExtApi.optOut({
        date: new Date().toISOString().split('T')[0],
        mealType: skipMealType,
        reason: skipReason
      })
      toast.success(`Skipped ${skipMealType}! ₹50 mess rebate credited.`)
      const optRes = await messExtApi.getMyOptOuts()
      setOptOuts(optRes.data.data?.optOuts || [])
      setTotalRebate(optRes.data.data?.totalRebate || 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not opt out of meal')
    } finally {
      setSkipping(false)
    }
  }

  const handleVote = async (pollId, option) => {
    setVoting(true)
    try {
      await messExtApi.votePoll(pollId, option)
      toast.success('Vote recorded for special feast!')
      const pRes = await messExtApi.getPolls()
      setPolls(pRes.data.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Vote failed')
    } finally {
      setVoting(false)
    }
  }

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()
    if (!complaintForm.description.trim()) {
      return toast.error('Please describe the food issue')
    }
    setSubmittingComplaint(true)
    try {
      await studentApi.submitComplaint({
        ...complaintForm,
        subject: complaintForm.subject || `${complaintForm.category.replace('_', ' ')} issue`
      })
      toast.success('Food complaint registered with Warden!')
      setComplaintForm({ category: 'FOOD_QUALITY', priority: 'NORMAL', subject: '', description: '', attachmentUrl: '' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit complaint')
    } finally {
      setSubmittingComplaint(false)
    }
  }

  return (
    <Layout navLinks={navLinks} title="Student Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-[#3f0d12] flex items-center gap-2">
            🍲 Hostel Mess & Food Timetable
          </h1>
          <p className="text-sm text-rose-700 mt-1">
            Weekly dining schedule, daily meal items, quality feedback, and food complaint registration.
          </p>
        </div>

        {/* Day Selector Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'bg-white border border-rose-200 text-[#7f1d1d] hover:bg-rose-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Daily Food Menus Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-rose-100/60 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Breakfast */}
            <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="text-2xl mb-2">☕</div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#3f0d12] text-base">Breakfast</h3>
                <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  {currentMenu?.breakfast?.timing || '07:30 - 09:30'}
                </span>
              </div>
              <p className="text-sm text-stone-700 mt-3 font-medium leading-relaxed">
                {currentMenu?.breakfast?.items || 'Fresh items prepared daily.'}
              </p>
            </div>

            {/* Lunch */}
            <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="text-2xl mb-2">🍛</div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#3f0d12] text-base">Lunch</h3>
                <span className="text-[11px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                  {currentMenu?.lunch?.timing || '12:30 - 14:30'}
                </span>
              </div>
              <p className="text-sm text-stone-700 mt-3 font-medium leading-relaxed">
                {currentMenu?.lunch?.items || 'Wholesome balanced lunch.'}
              </p>
            </div>

            {/* Evening Snacks */}
            <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="text-2xl mb-2">🧋</div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#3f0d12] text-base">Evening Snacks</h3>
                <span className="text-[11px] bg-orange-50 text-orange-700 font-semibold px-2 py-0.5 rounded-full border border-orange-200">
                  {currentMenu?.snacks?.timing || '17:00 - 18:00'}
                </span>
              </div>
              <p className="text-sm text-stone-700 mt-3 font-medium leading-relaxed">
                {currentMenu?.snacks?.items || 'Hot snacks and tea.'}
              </p>
            </div>

            {/* Dinner */}
            <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="text-2xl mb-2">🍽️</div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#3f0d12] text-base">Dinner</h3>
                <span className="text-[11px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                  {currentMenu?.dinner?.timing || '19:30 - 21:30'}
                </span>
              </div>
              <p className="text-sm text-stone-700 mt-3 font-medium leading-relaxed">
                {currentMenu?.dinner?.items || 'Nutritious dinner.'}
              </p>
            </div>
          </div>
        )}

        {/* Smart Food Waste: Skip-a-Meal & Rebate & Sunday Polls */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skip-a-Meal Food Waste Reduction */}
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#3f0d12]">🌱 Skip-a-Meal (Food Waste Reduction)</h2>
                <p className="text-xs text-rose-700 mt-0.5">Going out for food? Opt out in advance to save kitchen wastage.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Rebate Earned</span>
                <span className="text-base font-black text-emerald-600">₹{totalRebate}</span>
              </div>
            </div>

            <form onSubmit={handleSkipMeal} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Select Meal</label>
                  <select
                    value={skipMealType}
                    onChange={e => setSkipMealType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                  >
                    <option value="LUNCH">LUNCH (12:30 PM)</option>
                    <option value="SNACKS">SNACKS (05:00 PM)</option>
                    <option value="DINNER">DINNER (07:30 PM)</option>
                    <option value="BREAKFAST">BREAKFAST (Tomorrow)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Reason</label>
                  <input
                    type="text"
                    value={skipReason}
                    onChange={e => setSkipReason(e.target.value)}
                    placeholder="e.g. Eating out with friends"
                    className="w-full px-3 py-2 rounded-xl border border-rose-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={skipping}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all"
              >
                {skipping ? 'Opting Out...' : '✓ Opt-Out & Earn ₹50 Mess Rebate'}
              </button>
            </form>

            {optOuts.length > 0 && (
              <div className="pt-2 border-t border-rose-100 text-xs">
                <div className="font-bold text-[#3f0d12] mb-1">Recent Skipped Meals:</div>
                <div className="space-y-1 text-stone-600">
                  {optOuts.slice(0, 2).map((o, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] bg-rose-50/50 p-2 rounded-lg">
                      <span>{o.mealType} on {o.optOutDate} ({o.reason})</span>
                      <span className="font-bold text-emerald-700">+₹{o.rebateAmount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sunday Special Menu Polling */}
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#3f0d12]">🗳️ Special Feast Community Poll</h2>
              <p className="text-xs text-rose-700 mt-0.5">Vote for next Sunday's special hostel dinner menu.</p>
            </div>

            {polls.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">No active meal polls open today.</div>
            ) : (
              polls.map(p => {
                const totalVotes = Object.values(p.voteCounts || {}).reduce((a, b) => a + b, 0)
                return (
                  <div key={p.id} className="space-y-3">
                    <h3 className="font-bold text-sm text-[#3f0d12]">{p.title}</h3>
                    <div className="space-y-2">
                      {p.options.map((opt, i) => {
                        const count = p.voteCounts?.[opt] || 0
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

                        return (
                          <div key={i} className="p-2.5 rounded-xl border border-rose-100 bg-[#fffdfd] space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-[#3f0d12]">{opt}</span>
                              <span className="text-red-700 font-bold">{pct}% ({count} votes)</span>
                            </div>
                            <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                            </div>
                            <button
                              onClick={() => handleVote(p.id, opt)}
                              disabled={voting}
                              className="mt-1 text-[11px] font-bold text-red-600 hover:text-red-700 underline"
                            >
                              Vote for this item
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Dual Column: Feedback & Food Complaints Form */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Submit Food Feedback */}
          <form onSubmit={handleFeedbackSubmit} className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#3f0d12]">⭐ Rate Today's Food Quality</h2>
              <p className="text-xs text-rose-700 mt-0.5">Your anonymous ratings help improve daily meal standards.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Meal Session</label>
                <select
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                  value={feedbackForm.mealType}
                  onChange={e => setFeedbackForm({ ...feedbackForm, mealType: e.target.value })}
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="SNACKS">Evening Snacks</option>
                  <option value="DINNER">Dinner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Food Quality (1-5)</label>
                <select
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                  value={feedbackForm.foodQualityRating}
                  onChange={e => setFeedbackForm({ ...feedbackForm, foodQualityRating: Number(e.target.value) })}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Bad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Hygiene & Cleanliness (1-5)</label>
              <select
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                value={feedbackForm.hygieneRating}
                onChange={e => setFeedbackForm({ ...feedbackForm, hygieneRating: Number(e.target.value) })}
              >
                <option value="5">5 - Spotless</option>
                <option value="4">4 - Clean</option>
                <option value="3">3 - Acceptable</option>
                <option value="2">2 - Needs Cleaning</option>
                <option value="1">1 - Unhygienic</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Comments (optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa] min-h-20"
                placeholder="Mention taste, temperature, freshness..."
                value={feedbackForm.comments}
                onChange={e => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-200"
            >
              Submit Food Feedback
            </button>
          </form>

          {/* Register Food Complaint */}
          <form onSubmit={handleComplaintSubmit} className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#3f0d12]">🚨 Register Food Complaint</h2>
              <p className="text-xs text-rose-700 mt-0.5">Report urgent food or hygiene issues directly to the Warden.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                  value={complaintForm.category}
                  onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
                >
                  <option value="FOOD_QUALITY">Food Quality</option>
                  <option value="HYGIENE">Hygiene & Cleanliness</option>
                  <option value="INSECTS">Insects / Foreign Objects</option>
                  <option value="INSUFFICIENT_QUANTITY">Insufficient Quantity</option>
                  <option value="UNDERCOOKED_FOOD">Undercooked / Raw Food</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                  value={complaintForm.priority}
                  onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Subject</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                placeholder="E.g. Spoiled milk at breakfast"
                value={complaintForm.subject}
                onChange={e => setComplaintForm({ ...complaintForm, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Description</label>
              <textarea
                required
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa] min-h-20"
                placeholder="Describe exactly what happened..."
                value={complaintForm.description}
                onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Photo / Attachment URL (optional)</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                placeholder="https://... (image link)"
                value={complaintForm.attachmentUrl}
                onChange={e => setComplaintForm({ ...complaintForm, attachmentUrl: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submittingComplaint}
              className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-200"
            >
              Submit Food Complaint
            </button>
          </form>
        </div>

        {/* Existing Food Complaints & History */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#3f0d12] mb-3">
            📋 My Food Complaints ({complaints.length})
          </h2>
          {complaints.length === 0 ? (
            <p className="text-xs text-stone-500">No active food complaints registered.</p>
          ) : (
            <div className="space-y-3">
              {complaints.map(c => (
                <div key={c.id} className="border border-rose-100 rounded-2xl p-4 bg-[#fffbfa]">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-bold text-sm text-[#3f0d12]">{c.subject}</span>
                      <span className="text-xs text-rose-700 ml-2">({c.category?.replace('_', ' ')})</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                      c.status === 'REOPENED' ? 'bg-rose-100 text-rose-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 mt-2">{c.description}</p>
                  {c.attachmentUrl && (
                    <a href={c.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-red-600 hover:underline mt-1 inline-block">
                      📎 View Photo Attachment
                    </a>
                  )}
                  {c.resolutionNotes && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      <b>Warden Response:</b> {c.resolutionNotes}
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
