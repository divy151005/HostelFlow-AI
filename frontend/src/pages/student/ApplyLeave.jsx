import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { studentApi } from '../../api'
import Layout from '../../components/layout/Layout'

const navLinks = [
  { to: '/student',               icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply',         icon: '✈️', label: 'Apply Leave/Outing' },
  { to: '/student/history',       icon: '📜', label: 'History' },
  { to: '/student/notifications', icon: '🔔', label: 'Notifications' },
]

export default function ApplyLeave() {
  const [searchParams] = useSearchParams()
  const defaultType = searchParams.get('type') || 'LEAVE'
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: defaultType,
    outingKind: 'LOCAL_OUTING',
    reason: '',
    destination: '',
    fromDate: '',
    toDate: '',
    expectedReturn: ''
  })

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.reason.trim()) return toast.error('Please enter a reason')
    setLoading(true)
    try {
      const payload = {
        ...form,
        fromDate: new Date(form.fromDate).toISOString(),
        toDate: new Date(form.toDate).toISOString(),
        expectedReturn: new Date(form.expectedReturn).toISOString()
      }
      await studentApi.applyLeave(payload)
      toast.success('Leave request submitted!')
      navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  const types = [
    { id: 'LEAVE',     label: 'Leave',    icon: '✈️', desc: 'Multi-day absence' },
    { id: 'OUTING',    label: 'Outing',   icon: '🚶', desc: 'Short-duration exit' },
    { id: 'EMERGENCY', label: 'Emergency',icon: '🚨', desc: 'Urgent situation' },
  ]

  const outingKinds = [
    { id: 'LOCAL_OUTING', label: 'Local Outing', desc: 'Short personal errand' },
    { id: 'WORKING_HOURS', label: 'Working Hours', desc: 'Out during class or duty hours' },
    { id: 'RUNNING_COLLEGE', label: 'Running College', desc: 'Academic or campus-running work' },
    { id: 'MEDICAL_VISIT', label: 'Medical Visit', desc: 'Doctor, clinic, or pharmacy' },
    { id: 'HOME_VISIT', label: 'Home Visit', desc: 'Brief family visit' },
    { id: 'OTHER', label: 'Other', desc: 'Any other outing reason' },
  ]

  const inp = 'w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-[#3f0d12] placeholder-[#b91c1c]/45 focus:outline-none focus:border-red-500 transition-colors text-sm'

  return (
    <Layout navLinks={navLinks} title="Apply Leave">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="max-w-xl">
        <h1 className="text-2xl font-black text-[#3f0d12] mb-1">Apply for Leave</h1>
        <p className="text-[#9f1239] text-sm mb-6">Fill in the details below to submit your request.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selector */}
          <div>
            <label className="block text-[#9f1239] text-sm mb-2">Leave Type</label>
            <div className="grid grid-cols-3 gap-2">
              {types.map(t => (
                <motion.button key={t.id} type="button" onClick={() => set('type', t.id)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    form.type === t.id
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'bg-white border-rose-200 text-[#7f1d1d] hover:border-red-300'
                  }`}>
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="font-semibold text-xs">{t.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{t.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {form.type === 'OUTING' && (
            <div>
              <label className="block text-[#9f1239] text-sm mb-2">Outing Kind</label>
              <div className="grid grid-cols-2 gap-2">
                {outingKinds.map(kind => (
                  <button key={kind.id} type="button" onClick={() => set('outingKind', kind.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.outingKind === kind.id
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'bg-white border-rose-200 text-[#7f1d1d] hover:border-red-300'
                    }`}>
                    <div className="font-semibold text-xs">{kind.label}</div>
                    <div className="text-[11px] opacity-70 mt-1">{kind.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-[#9f1239] text-sm mb-1.5">Reason *</label>
            <textarea value={form.reason} onChange={e => set('reason', e.target.value)} rows={3}
              placeholder="Describe the reason for your leave..."
              className={inp + ' resize-none'} required />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-[#9f1239] text-sm mb-1.5">Destination</label>
            <input value={form.destination} onChange={e => set('destination', e.target.value)}
              placeholder="City, Hospital, Home, etc." className={inp} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9f1239] text-sm mb-1.5">From Date</label>
              <input type="datetime-local" value={form.fromDate}
                onChange={e => set('fromDate', e.target.value)} className={inp} required />
            </div>
            <div>
              <label className="block text-[#9f1239] text-sm mb-1.5">To Date</label>
              <input type="datetime-local" value={form.toDate}
                onChange={e => set('toDate', e.target.value)} className={inp} required />
            </div>
          </div>

          <div>
            <label className="block text-[#9f1239] text-sm mb-1.5">Expected Return *</label>
            <input type="datetime-local" value={form.expectedReturn}
              onChange={e => set('expectedReturn', e.target.value)} className={inp} required />
          </div>

          {/* Info Box */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-[#7f1d1d]">
            <p className="text-red-700 font-semibold mb-1">📋 Approval Flow</p>
            {form.type === 'LEAVE' && '1. Warden reviews → 2. Parent approves → 3. QR gate pass generated'}
            {form.type === 'EMERGENCY' && '1. Warden reviews → 2. QR gate pass generated'}
            {form.type === 'OUTING' && ['WORKING_HOURS', 'RUNNING_COLLEGE'].includes(form.outingKind)
              && '1. Mentor reviews → 2. Parent approves → 3. QR gate pass generated'}
            {form.type === 'OUTING' && !['WORKING_HOURS', 'RUNNING_COLLEGE'].includes(form.outingKind)
              && '1. Mentor reviews → 2. QR gate pass generated'}
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-red-500 to-rose-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 shadow-lg shadow-red-200 text-sm">
            {loading ? 'Submitting...' : '🚀 Submit Request'}
          </motion.button>
        </form>
      </motion.div>
    </Layout>
  )
}
