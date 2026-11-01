import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { studentApi } from '../../api'
import Layout from '../../components/layout/Layout'
import HolographicPass3D from '../../components/3d/HolographicPass3D'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/student',               icon: '🏠', label: 'Dashboard' },
  { to: '/student/apply',         icon: '✈️', label: 'Apply Leave/Outing' },
  { to: '/student/history',       icon: '📜', label: 'History' },
  { to: '/student/notifications', icon: '🔔', label: 'Notifications' },
]

export default function QRPass() {
  const { user } = useAuth()
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

  return (
    <Layout navLinks={navLinks} title="QR Gate Pass">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        className="max-w-md mx-auto text-center">

        <h1 className="text-2xl font-black text-[#3f0d12] mb-1">🔳 Interactive 3D Gate Pass</h1>
        <p className="text-xs text-[#9f1239] mb-4">Move mouse or tilt on mobile for dynamic 3D holographic shimmer effect.</p>

        {/* 3D Holographic Pass Component */}
        <HolographicPass3D leave={leave} student={user} />
      </motion.div>
    </Layout>
  )
}
