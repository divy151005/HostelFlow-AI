import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { studentApi, aiApi } from '../../api'

const navLinks = [
  { to: '/student', icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply', icon: '✈️', label: 'Apply Leave' },
  { to: '/student/history', icon: '📜', label: 'History' },
  { to: '/student/activity', icon: '📍', label: 'My Gate Activity' },
  { to: '/student/mess', icon: '🍲', label: 'Mess & Food' },
  { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
  { to: '/messages', icon: '💬', label: 'Messages' },
]

const getMondayOfWeek = () => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

export default function HostelCare() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  // Complaint Form
  const [complaintForm, setComplaintForm] = useState({
    category: 'ELECTRICITY',
    priority: 'NORMAL',
    subject: '',
    description: '',
    attachmentUrl: ''
  })
  const [submittingComplaint, setSubmittingComplaint] = useState(false)
  const [aiTriage, setAiTriage] = useState(null)
  const [triaging, setTriaging] = useState(false)

  const handleAutoTriage = async () => {
    if (!complaintForm.description.trim() && !complaintForm.subject.trim()) {
      return toast.error('Enter subject or description first')
    }
    setTriaging(true)
    try {
      const res = await aiApi.autoTriage({
        title: complaintForm.subject,
        description: complaintForm.description
      })
      setAiTriage(res.data.data)
      toast.success('AI Auto-Triage analysis complete!')
    } catch {
      toast.error('AI Triage currently unavailable')
    } finally {
      setTriaging(false)
    }
  }

  const applyAiRecommendation = () => {
    if (!aiTriage) return
    setComplaintForm(prev => ({
      ...prev,
      category: aiTriage.category || prev.category,
      priority: aiTriage.priority || prev.priority
    }))
    toast.success('Applied AI category and priority!')
  }

  // Weekly Feedback Form
  const [week, setWeek] = useState(getMondayOfWeek())
  const [ratings, setRatings] = useState({
    electricity: 4,
    powerSupply: 4,
    fansLightsSwitches: 4,
    roomCleanliness: 4,
    washroomCleanliness: 3,
    waterSupply: 4,
    facilities: 4
  })
  const [comments, setComments] = useState('')
  const [feedbackAttachment, setFeedbackAttachment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  // Reopen Modal
  const [reopenTarget, setReopenTarget] = useState(null)
  const [reopenReason, setReopenReason] = useState('')
  const [reopening, setReopening] = useState(false)

  const loadData = async () => {
    try {
      const res = await studentApi.getComplaints()
      setComplaints(res.data.data || [])
    } catch {
      toast.error('Could not load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()
    if (!complaintForm.description.trim()) {
      return toast.error('Description is required')
    }
    setSubmittingComplaint(true)
    try {
      await studentApi.submitComplaint({
        ...complaintForm,
        subject: complaintForm.subject || `${complaintForm.category} complaint`
      })
      toast.success('Complaint submitted to Warden & Admin!')
      setComplaintForm({ category: 'ELECTRICITY', priority: 'NORMAL', subject: '', description: '', attachmentUrl: '' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit complaint')
    } finally {
      setSubmittingComplaint(false)
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmittingFeedback(true)
    try {
      await studentApi.submitFeedback({
        weekStart: week,
        ratings,
        comments,
        attachmentUrl: feedbackAttachment
      })
      toast.success('Weekly hostel condition feedback recorded!')
      setComments('')
      setFeedbackAttachment('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Feedback already submitted for this week')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleReopen = async () => {
    if (!reopenReason.trim() || !reopenTarget) return
    setReopening(true)
    try {
      await studentApi.reopenComplaint(reopenTarget.id, { reason: reopenReason.trim() })
      toast.success('Complaint reopened and escalated to Warden!')
      setReopenTarget(null)
      setReopenReason('')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reopen complaint')
    } finally {
      setReopening(false)
    }
  }

  return (
    <Layout navLinks={navLinks} title="Student Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#3f0d12]">🛠️ Hostel Care & Weekly Feedback</h1>
          <p className="text-rose-700 text-sm mt-1">
            Report infrastructure or maintenance issues and complete your mandatory weekly hostel condition review.
          </p>
        </div>

        {/* 2-Column Forms: Complaint + Weekly Feedback */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* New General Complaint */}
          <form onSubmit={handleComplaintSubmit} className="bg-white border border-rose-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="font-bold text-lg text-[#3f0d12]">📝 Register General Complaint</h2>
              <p className="text-xs text-rose-700">Tracked across SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, REOPENED.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                  value={complaintForm.category}
                  onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
                >
                  <option value="ELECTRICITY">Electricity & Lighting</option>
                  <option value="CLEANLINESS">Room / Corridor Cleanliness</option>
                  <option value="WATER">Water Supply & Geyser</option>
                  <option value="MAINTENANCE">Carpentry / Furniture</option>
                  <option value="WASHROOM">Washroom & Plumbing</option>
                  <option value="FOOD_QUALITY">Food Quality</option>
                  <option value="OTHER">Other Grievance</option>
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
                  <option value="URGENT">Urgent (Immediate Safety)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Subject</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                placeholder="Brief summary of issue"
                value={complaintForm.subject}
                onChange={e => setComplaintForm({ ...complaintForm, subject: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#7f1d1d] block">Detailed Description</label>
                <button
                  type="button"
                  onClick={handleAutoTriage}
                  disabled={triaging}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                >
                  {triaging ? '✨ Analyzing...' : '✨ AI Auto-Triage'}
                </button>
              </div>
              <textarea
                required
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa] min-h-24"
                placeholder="Provide room details, fixtures involved, or urgency notes..."
                value={complaintForm.description}
                onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
              />
            </div>

            {aiTriage && (
              <div className="p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-200 text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between font-bold text-[#3f0d12]">
                  <span className="flex items-center gap-1">🤖 AI Smart Recommendation</span>
                  <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    {Math.round(aiTriage.confidence * 100)}% Confidence
                  </span>
                </div>
                <div className="text-stone-700">
                  Detected Category: <strong className="text-red-700">{aiTriage.category}</strong> • Priority: <strong className="text-red-700">{aiTriage.priority}</strong>
                </div>
                <div className="text-stone-600 italic">"{aiTriage.reasoning}" (Assigned: {aiTriage.suggestedStaff})</div>
                <button
                  type="button"
                  onClick={applyAiRecommendation}
                  className="mt-1 px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-[11px] hover:bg-red-700"
                >
                  Apply AI Recommendation
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Attachment / Photo URL (optional)</label>
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
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-200"
            >
              Submit Complaint
            </button>
          </form>

          {/* Weekly Feedback Form */}
          <form onSubmit={handleFeedbackSubmit} className="bg-white border border-rose-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="font-bold text-lg text-[#3f0d12]">📋 Weekly Hostel Facility Review</h2>
              <p className="text-xs text-rose-700">One submission per student per week to prevent duplicate voting.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">
                Week Starting (Monday Date)
              </label>
              <input
                required
                type="date"
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa]"
                value={week}
                onChange={e => setWeek(e.target.value)}
              />
            </div>

            {/* Ratings 1-5 Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">⚡ Electricity & Power</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg bg-[#fffbfa]"
                  value={ratings.electricity}
                  onChange={e => setRatings({ ...ratings, electricity: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">💡 Fans, Lights & Switches</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg bg-[#fffbfa]"
                  value={ratings.fansLightsSwitches}
                  onChange={e => setRatings({ ...ratings, fansLightsSwitches: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">🧹 Room Cleanliness</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg bg-[#fffbfa]"
                  value={ratings.roomCleanliness}
                  onChange={e => setRatings({ ...ratings, roomCleanliness: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">🚿 Washroom Cleanliness</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg bg-[#fffbfa]"
                  value={ratings.washroomCleanliness}
                  onChange={e => setRatings({ ...ratings, washroomCleanliness: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">💧 Water Supply</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg bg-[#fffbfa]"
                  value={ratings.waterSupply}
                  onChange={e => setRatings({ ...ratings, waterSupply: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">🏢 Other Facilities</label>
                <select
                  className="w-full px-2.5 py-1.5 border border-rose-200 rounded-lg bg-[#fffbfa]"
                  value={ratings.facilities}
                  onChange={e => setRatings({ ...ratings, facilities: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Additional Feedback & Comments</label>
              <textarea
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm bg-[#fffbfa] min-h-16"
                placeholder="Mention specific areas or recommendations..."
                value={comments}
                onChange={e => setComments(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-200"
            >
              Submit Weekly Feedback
            </button>
          </form>
        </div>

        {/* My Registered Complaints List with Reopen Support */}
        <section className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#3f0d12] mb-3">
            📋 My Grievances & Complaint Status ({complaints.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-24 bg-rose-100/60 rounded-xl animate-pulse" />)}
            </div>
          ) : complaints.length === 0 ? (
            <p className="text-xs text-stone-500 py-2">No complaints submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {complaints.map(c => {
                const isResolved = c.status === 'RESOLVED'
                return (
                  <article key={c.id} className="border border-rose-100 rounded-2xl p-4 bg-[#fffbfa]">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-[#3f0d12]">{c.subject}</strong>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'REOPENED' ? 'bg-rose-100 text-rose-800' :
                            c.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-rose-700 mt-0.5">
                          Category: {c.category} · Priority: {c.priority} · Submitted: {c.createdAt?.slice(0, 10)}
                          {c.assignedStaffName && <span> · Assigned to: <b>{c.assignedStaffName}</b></span>}
                        </p>
                      </div>

                      {isResolved && (
                        <button
                          onClick={() => setReopenTarget(c)}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold"
                        >
                          🔄 Reopen Issue
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 mt-2">{c.description}</p>

                    {c.attachmentUrl && (
                      <a href={c.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-red-600 hover:underline mt-1 inline-block">
                        📎 View Photo Attachment
                      </a>
                    )}

                    {c.resolutionNotes && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                        <b>Warden Resolution Update:</b> {c.resolutionNotes}
                      </div>
                    )}

                    {c.reopenedReason && (
                      <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950">
                        <b>Reopening Reason:</b> {c.reopenedReason}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Reopen Modal */}
        {reopenTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-300 shadow-2xl">
              <h3 className="font-bold text-base text-[#3f0d12]">Reopen Complaint: {reopenTarget.subject}</h3>
              <p className="text-xs text-stone-600">
                Please specify why this issue is not satisfactorily resolved so the warden can reassign staff.
              </p>
              <textarea
                required
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa] min-h-24"
                placeholder="E.g. The leak started again after repair..."
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReopenTarget(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!reopenReason.trim() || reopening}
                  onClick={handleReopen}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-red-200"
                >
                  {reopening ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
