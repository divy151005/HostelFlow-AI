import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import StudentDashboard from './pages/student/Dashboard'
import StudentApplyLeave from './pages/student/ApplyLeave'
import StudentHistory from './pages/student/History'
import StudentQRPass from './pages/student/QRPass'
import StudentNotifications from './pages/student/Notifications'

import WardenDashboard from './pages/warden/Dashboard'
import WardenLeaves from './pages/warden/Leaves'
import WardenStudents from './pages/warden/Students'
import WardenAnalytics from './pages/warden/Analytics'
import MentorApprovals from './pages/mentor/Approvals'

import ParentDashboard from './pages/parent/Dashboard'
import ParentApproval from './pages/parent/Approval'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#fff7f7] text-[#7f1d1d]">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const routes = { STUDENT: '/student', WARDEN: '/warden', MENTOR: '/mentor', PARENT: '/parent' }
  return <Navigate to={routes[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#ffffff', color: '#3f0d12', border: '1px solid #fecdd3' },
          success: { iconTheme: { primary: '#dc2626', secondary: '#fff7f7' } },
          error: { iconTheme: { primary: '#b91c1c', secondary: '#fff7f7' } }
        }} />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/apply" element={<ProtectedRoute role="STUDENT"><StudentApplyLeave /></ProtectedRoute>} />
          <Route path="/student/history" element={<ProtectedRoute role="STUDENT"><StudentHistory /></ProtectedRoute>} />
          <Route path="/student/qr/:leaveId" element={<ProtectedRoute role="STUDENT"><StudentQRPass /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute role="STUDENT"><StudentNotifications /></ProtectedRoute>} />

          {/* Warden */}
          <Route path="/warden" element={<ProtectedRoute role="WARDEN"><WardenDashboard /></ProtectedRoute>} />
          <Route path="/warden/leaves" element={<ProtectedRoute role="WARDEN"><WardenLeaves /></ProtectedRoute>} />
          <Route path="/warden/students" element={<ProtectedRoute role="WARDEN"><WardenStudents /></ProtectedRoute>} />
          <Route path="/warden/analytics" element={<ProtectedRoute role="WARDEN"><WardenAnalytics /></ProtectedRoute>} />

          {/* Mentor */}
          <Route path="/mentor" element={<ProtectedRoute role="MENTOR"><MentorApprovals /></ProtectedRoute>} />

          {/* Parent */}
          <Route path="/parent" element={<ProtectedRoute role="PARENT"><ParentDashboard /></ProtectedRoute>} />
          <Route path="/parent/approval" element={<ProtectedRoute role="PARENT"><ParentApproval /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
