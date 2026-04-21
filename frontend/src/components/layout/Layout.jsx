import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export default function Layout({ children, navLinks, title }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const riskColor = {
    LOW: 'text-red-700 bg-red-50',
    MEDIUM: 'text-orange-700 bg-orange-50',
    HIGH: 'text-red-800 bg-red-100 animate-pulse'
  }

  return (
    <div className="min-h-screen bg-[#fff7f7] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/95 backdrop-blur border-r border-rose-200 fixed h-full z-30 shadow-[0_20px_60px_rgba(127,29,29,0.08)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-rose-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-200">HF</div>
          <div>
            <div className="text-[#3f0d12] font-bold text-sm leading-tight">Hostel<span className="text-red-600">Flow</span></div>
            <div className="text-[#9f1239] text-xs">{title}</div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-rose-200">
          <div className="bg-rose-50 rounded-xl p-3 border border-rose-200">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-xs font-bold text-white">
                {user?.fullName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#3f0d12] text-sm font-semibold truncate">{user?.fullName}</div>
                <div className="text-[#9f1239] text-xs truncate">{user?.email}</div>
              </div>
            </div>
            {user?.riskLevel && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${riskColor[user.riskLevel]}`}>
                {user.riskLevel === 'HIGH' ? '🚨' : user.riskLevel === 'MEDIUM' ? '⚠️' : '✅'} {user.riskLevel} RISK
              </span>
            )}
            {user?.rollNumber && <div className="text-[#9f1239] text-xs mt-1">{user.rollNumber} • Room {user.roomNumber}</div>}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(link => {
            const active = location.pathname === link.to
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                    : 'text-[#7f1d1d] hover:text-red-700 hover:bg-rose-50'
                }`}>
                <span>{link.icon}</span>
                {link.label}
                {link.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{link.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-rose-200">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#7f1d1d] hover:text-red-700 hover:bg-red-50 transition-all">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-rose-200 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-black text-xs">HF</div>
          <span className="text-[#3f0d12] font-bold text-sm">Hostel<span className="text-red-600">Flow</span></span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#7f1d1d] p-1">☰</button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            className="lg:hidden fixed inset-0 z-50 bg-[#fff7f7] pt-16 px-4"
          >
            <nav className="space-y-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#7f1d1d] hover:text-red-700 hover:bg-rose-50">
                  <span>{link.icon}</span>{link.label}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400 mt-4">
                🚪 Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
