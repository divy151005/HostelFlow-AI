import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { studentApi } from '../../api'
import Layout from '../../components/layout/Layout'
import { format } from 'date-fns'

const navLinks = [
  { to: '/student',               icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply',         icon: '✈️', label: 'Apply Leave/Outing' },
  { to: '/student/history',       icon: '📜', label: 'History' },
  { to: '/student/notifications', icon: '🔔', label: 'Notifications' },
]

export default function QRPass() {
  const { leaveId } = useParams()
  const [leave, setLeave] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentApi.getHistory(0).then(res => {
      const found = (res.data.data?.content || []).find(l => l.id === leaveId)
      setLeave(found)
    }).finally(() => setLoading(false))
  }, [leaveId])

  if (loading) return (
    <Layout navLinks={navLinks} title="QR Pass">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-3xl">⏳</div>
      </div>
    </Layout>
  )

  if (!leave || leave.status !== 'APPROVED') return (
    <Layout navLinks={navLinks} title="QR Pass">
      <div className="text-center text-[#9f1239] mt-20">
        <div className="text-5xl mb-4">🔒</div>
        <p>QR Pass not available — leave must be approved.</p>
      </div>
    </Layout>
  )

  const qrValue = `${window.location.origin}/api/qr/verify?token=${leave.qrToken}`

  return (
    <Layout navLinks={navLinks} title="QR Gate Pass">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        className="max-w-sm mx-auto">

        <h1 className="text-2xl font-black text-[#3f0d12] text-center mb-6">🔳 Gate Pass</h1>

        {/* Pass Card */}
        <div className="bg-gradient-to-br from-white to-rose-50 border border-rose-200 rounded-3xl p-6 shadow-[0_30px_80px_rgba(127,29,29,0.12)]">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1 rounded-full font-semibold mb-3">
              ✅ APPROVED
            </div>
            <h2 className="text-[#3f0d12] font-black text-xl">{leave.studentName}</h2>
            <p className="text-[#9f1239] text-sm">{leave.rollNumber} • Room {leave.roomNumber}</p>
          </div>

          {/* QR Code */}
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(220,38,38,0.08)', '0 0 40px rgba(220,38,38,0.16)', '0 0 20px rgba(220,38,38,0.08)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white rounded-2xl p-4 mx-auto w-fit mb-5">
            <QRCodeSVG value={qrValue} size={200} level="H"
              imageSettings={{
                src: '/icon.svg',
                height: 32, width: 32, excavate: true
              }} />
          </motion.div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {[
              { label: 'Type',     value: leave.type },
              { label: 'Reason',   value: leave.reason },
              { label: 'Return by',value: leave.expectedReturn
                  ? format(new Date(leave.expectedReturn), 'PPp') : '—' },
              { label: 'Status',   value: leave.qrScannedOut ? '🟡 Checked Out' : '🟢 Not Yet Scanned' },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-[#9f1239]">{row.label}</span>
                <span className="text-[#3f0d12] font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-rose-200 text-center text-[#9f1239] text-xs">
            Show this QR code at the hostel gate
          </div>
        </div>

        <p className="text-center text-[#9f1239] text-xs mt-4">
          Token: <code className="text-red-600">{leave.qrToken}</code>
        </p>
      </motion.div>
    </Layout>
  )
}
