import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Student
import StudentDashboard from './pages/student/Dashboard'
import StudentApplyLeave from './pages/student/ApplyLeave'
import StudentHistory from './pages/student/History'
import StudentActivity from './pages/student/Activity'
import StudentMessMenu from './pages/student/MessMenu'
import HostelCare from './pages/student/HostelCare'
import StudentQRPass from './pages/student/QRPass'
import StudentNotifications from './pages/student/Notifications'

// Warden
import WardenDashboard from './pages/warden/Dashboard'
import WardenSupervision from './pages/warden/Supervision'
import WardenLeaves from './pages/warden/Leaves'
import WardenMessOperations from './pages/warden/MessOperations'
import WardenIncidents from './pages/warden/Incidents'
import WardenStudents from './pages/warden/Students'
import WardenAnalytics from './pages/warden/Analytics'

// Mentor
import MentorDashboard from './pages/mentor/MentorDashboard'
import MentorApprovals from './pages/mentor/Approvals'

// Parent
import ParentDashboard from './pages/parent/Dashboard'
import ParentApproval from './pages/parent/Approval'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'

// Operations & Messages
import Operations from './pages/Operations'
import MessagesPage from './pages/common/MessagesPage'

// New Feature Extensions
import GateKiosk from './pages/common/GateKiosk'
import RoomMatrix from './pages/common/RoomMatrix'
import VisitorManagement from './pages/common/VisitorManagement'
import FinanceAndNoDues from './pages/common/FinanceAndNoDues'
import CommunityHub from './pages/common/CommunityHub'

function ProtectedRoute({ children, role, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#fff7f7] text-[#7f1d1d]">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const routes = {
    STUDENT: '/student',
    WARDEN: '/warden',
    MENTOR: '/mentor',
    PARENT: '/parent',
    ADMIN: '/admin'
  }
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

          {/* Gate Security Kiosk (Accessible for Guards / Staff / Demo) */}
          <Route path="/security" element={<GateKiosk />} />
          <Route path="/gate" element={<GateKiosk />} />

          {/* Unified Messages Route for Any Authenticated Role */}
          <Route path="/messages" element={
            <ProtectedRoute roles={['STUDENT', 'WARDEN', 'MENTOR', 'PARENT', 'ADMIN']}>
              <MessagesPage />
            </ProtectedRoute>
          } />

          {/* Community Hub (Laundry & Lost and Found) */}
          <Route path="/community" element={
            <ProtectedRoute roles={['STUDENT', 'WARDEN', 'ADMIN']}>
              <CommunityHub />
            </ProtectedRoute>
          } />

          {/* Student Portal */}
          <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/apply" element={<ProtectedRoute role="STUDENT"><StudentApplyLeave /></ProtectedRoute>} />
          <Route path="/student/history" element={<ProtectedRoute role="STUDENT"><StudentHistory /></ProtectedRoute>} />
          <Route path="/student/activity" element={<ProtectedRoute role="STUDENT"><StudentActivity /></ProtectedRoute>} />
          <Route path="/student/mess" element={<ProtectedRoute role="STUDENT"><StudentMessMenu /></ProtectedRoute>} />
          <Route path="/student/care" element={<ProtectedRoute role="STUDENT"><HostelCare /></ProtectedRoute>} />
          <Route path="/student/rooms" element={<ProtectedRoute roles={['STUDENT', 'WARDEN', 'ADMIN']}><RoomMatrix /></ProtectedRoute>} />
          <Route path="/student/visitors" element={<ProtectedRoute roles={['STUDENT', 'PARENT', 'WARDEN', 'ADMIN']}><VisitorManagement /></ProtectedRoute>} />
          <Route path="/student/finance" element={<ProtectedRoute roles={['STUDENT', 'PARENT', 'WARDEN', 'ADMIN']}><FinanceAndNoDues /></ProtectedRoute>} />
          <Route path="/student/qr/:leaveId" element={<ProtectedRoute role="STUDENT"><StudentQRPass /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute role="STUDENT"><StudentNotifications /></ProtectedRoute>} />

          {/* Warden Portal */}
          <Route path="/warden" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><WardenDashboard /></ProtectedRoute>} />
          <Route path="/warden/supervision" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><WardenSupervision /></ProtectedRoute>} />
          <Route path="/warden/leaves" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><WardenLeaves /></ProtectedRoute>} />
          <Route path="/warden/mess" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><WardenMessOperations /></ProtectedRoute>} />
          <Route path="/warden/rooms" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><RoomMatrix /></ProtectedRoute>} />
          <Route path="/warden/visitors" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><VisitorManagement /></ProtectedRoute>} />
          <Route path="/warden/finance" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><FinanceAndNoDues /></ProtectedRoute>} />
          <Route path="/warden/operations" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><Operations /></ProtectedRoute>} />
          <Route path="/warden/incidents" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><WardenIncidents /></ProtectedRoute>} />
          <Route path="/warden/students" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><WardenStudents /></ProtectedRoute>} />
          <Route path="/warden/analytics" element={<ProtectedRoute roles={['WARDEN', 'ADMIN']}><WardenAnalytics /></ProtectedRoute>} />

          {/* Mentor Portal */}
          <Route path="/mentor" element={<ProtectedRoute roles={['MENTOR', 'ADMIN']}><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/approvals" element={<ProtectedRoute roles={['MENTOR', 'ADMIN']}><MentorApprovals /></ProtectedRoute>} />

          {/* Parent Portal */}
          <Route path="/parent" element={<ProtectedRoute role="PARENT"><ParentDashboard /></ProtectedRoute>} />
          <Route path="/parent/approval" element={<ProtectedRoute role="PARENT"><ParentApproval /></ProtectedRoute>} />

          {/* Admin Portal */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/rooms" element={<ProtectedRoute role="ADMIN"><RoomMatrix /></ProtectedRoute>} />
          <Route path="/admin/finance" element={<ProtectedRoute role="ADMIN"><FinanceAndNoDues /></ProtectedRoute>} />
          <Route path="/admin/operations" element={<ProtectedRoute role="ADMIN"><Operations admin /></ProtectedRoute>} />

          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
