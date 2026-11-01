import { useState, useEffect } from 'react'
import { visitorApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import toast from 'react-hot-toast'

export default function VisitorManagement() {
  const { user } = useAuth()
  const isStaff = user?.role === 'WARDEN' || user?.role === 'ADMIN'

  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    relationship: 'PARENT',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM - 05:00 PM'
  })

  const fetchPasses = async () => {
    setLoading(true)
    try {
      const res = isStaff ? await visitorApi.getAllPasses() : await visitorApi.getMyPasses()
      setPasses(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPasses()
  }, [])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!formData.visitorName || !formData.visitorPhone) {
      toast.error('Please enter visitor name and phone number')
      return
    }
    setSubmitting(true)
    try {
      await visitorApi.apply(formData)
      toast.success('Visitor pass application submitted for approval!')
      setFormData({
        visitorName: '',
        visitorPhone: '',
        relationship: 'PARENT',
        purpose: '',
        visitDate: new Date().toISOString().split('T')[0],
        timeSlot: '02:00 PM - 05:00 PM'
      })
      fetchPasses()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to apply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (passId, approved) => {
    try {
      await visitorApi.approvePass(passId, {
        approved,
        remarks: approved ? 'Approved by Warden Office' : 'Declined per hostel policy'
      })
      toast.success(`Pass ${approved ? 'APPROVED' : 'REJECTED'}`)
      fetchPasses()
    } catch (e) {
      toast.error('Action failed')
    }
  }

  const navLinks = user?.role === 'STUDENT'
    ? [
        { to: '/student', icon: '📊', label: 'Dashboard' },
        { to: '/student/visitors', icon: '👥', label: 'Visitor Passes' },
        { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]
    : [
        { to: '/warden', icon: '📊', label: 'Dashboard' },
        { to: '/warden/supervision', icon: '🛡️', label: 'Supervision' },
        { to: '/warden/visitors', icon: '👥', label: 'Visitor Passes' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]

  return (
    <Layout navLinks={navLinks} title="Visitor Pass Management">
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#3f0d12]">Hostel Visitor & Guest Passes</h1>
            <p className="text-xs text-[#9f1239] mt-0.5">Pre-authorize family and official visitors with digital gate OTP codes</p>
          </div>
          <button
            onClick={fetchPasses}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-[#7f1d1d] font-semibold"
          >
            🔄 Refresh Passes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Apply Form (for students/parents) */}
          {!isStaff && (
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#3f0d12]">Request New Visitor Pass</h2>
              <form onSubmit={handleApply} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Visitor Full Name</label>
                  <input
                    type="text"
                    value={formData.visitorName}
                    onChange={e => setFormData({ ...formData, visitorName: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.visitorPhone}
                      onChange={e => setFormData({ ...formData, visitorPhone: e.target.value })}
                      placeholder="e.g. 9876500002"
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Relationship</label>
                    <select
                      value={formData.relationship}
                      onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                    >
                      <option value="PARENT">Parent / Guardian</option>
                      <option value="SIBLING">Sibling</option>
                      <option value="RELATIVE">Relative</option>
                      <option value="FRIEND">Friend</option>
                      <option value="OFFICIAL">Official / Academic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Visit Date</label>
                    <input
                      type="date"
                      value={formData.visitDate}
                      onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Time Window</label>
                    <select
                      value={formData.timeSlot}
                      onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                    >
                      <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                      <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                      <option value="05:00 PM - 07:30 PM">05:00 PM - 07:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Purpose of Visit</label>
                  <textarea
                    value={formData.purpose}
                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                    rows={2}
                    placeholder="e.g. Delivering luggage, parent meeting..."
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-200 transition-all text-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Generate Visitor Pass Application'}
                </button>
              </form>
            </div>
          )}

          {/* Passes List */}
          <div className={`${!isStaff ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4`}>
            <h2 className="text-sm font-bold text-[#3f0d12]">
              {isStaff ? 'All Visitor Passes & Approvals' : 'My Visitor Passes'}
            </h2>

            {passes.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-500">No visitor passes registered.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {passes.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-rose-200 bg-[#fffdfd] shadow-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                      <span className="font-bold text-sm text-[#3f0d12]">{p.visitorName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                        p.status === 'COMPLETED' ? 'bg-stone-100 text-stone-700' :
                        p.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-stone-600">
                      <div>Relationship: <strong className="text-[#3f0d12]">{p.relationship}</strong> ({p.visitorPhone})</div>
                      <div>Visiting: <strong className="text-[#3f0d12]">{p.studentName}</strong> (Room {p.studentRoom})</div>
                      <div>Date & Time: <strong>{p.visitDate} • {p.timeSlot}</strong></div>
                      <div className="text-[11px] text-stone-500">Purpose: {p.purpose}</div>
                    </div>

                    {/* 4-digit Pass Code Badge */}
                    <div className="pt-2 flex items-center justify-between bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                      <span className="text-[11px] text-[#7f1d1d] font-medium">Gate Pass Code:</span>
                      <span className="font-mono text-base font-black tracking-widest text-red-700">
                        {p.passCode}
                      </span>
                    </div>

                    {/* Warden Action Buttons */}
                    {isStaff && p.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2 border-t border-rose-100">
                        <button
                          onClick={() => handleApprove(p.id, true)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                        >
                          ✅ Approve Pass
                        </button>
                        <button
                          onClick={() => handleApprove(p.id, false)}
                          className="flex-1 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg text-xs"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
