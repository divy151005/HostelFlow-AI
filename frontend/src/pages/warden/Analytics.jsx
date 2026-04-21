// Warden/Analytics.jsx
import Layout from '../../components/layout/Layout'
const navLinks = [
  { to: '/warden', icon: '📊', label: 'Dashboard' },
  { to: '/warden/leaves', icon: '📋', label: 'Leave Requests' },
  { to: '/warden/students', icon: '👥', label: 'Students' },
  { to: '/warden/analytics', icon: '📈', label: 'Analytics' },
]
export default function Analytics() {
  return (
    <Layout navLinks={navLinks} title="Analytics">
      <h1 className="text-2xl font-black text-[#3f0d12] mb-2">Analytics</h1>
      <p className="text-[#9f1239] text-sm">Detailed charts are on the Dashboard page. This page can be extended with monthly reports, export features, and AI insights.</p>
    </Layout>
  )
}
