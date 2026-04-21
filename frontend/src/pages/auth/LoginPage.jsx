import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const roleRoutes = { STUDENT: '/student', WARDEN: '/warden', MENTOR: '/mentor', PARENT: '/parent' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.fullName}!`)
      navigate(roleRoutes[user.role] || '/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    const creds = {
      STUDENT: { email: 'student@hostelflow.com', password: 'password' },
      WARDEN:  { email: 'warden@hostelflow.com',  password: 'password' },
      MENTOR:  { email: 'mentor@hostelflow.com',  password: 'password' },
      PARENT:  { email: 'parent@hostelflow.com',  password: 'password' },
    }
    if (creds[role]) setForm(creds[role])
  }

  return (
    <div className="min-h-screen bg-[#fff7f7] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-red-300 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-rose-200 rounded-full opacity-40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-black text-2xl mb-3 shadow-lg shadow-red-200">
            HF
          </div>
          <h1 className="text-2xl font-black text-[#3f0d12] tracking-tight">
            Hostel<span className="text-red-600">Flow</span> AI
          </h1>
          <p className="text-[#9f1239] text-sm mt-1">Smart Leave Management System</p>
        </motion.div>

        {/* Card */}
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-[0_30px_80px_rgba(127,29,29,0.12)]">
          <h2 className="text-xl font-bold text-[#3f0d12] mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#9f1239] text-sm mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                placeholder="you@hostelflow.com"
                required
                className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-[#3f0d12] placeholder-[#b91c1c]/50 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#9f1239] text-sm mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                placeholder="••••••••"
                required
                className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-[#3f0d12] placeholder-[#b91c1c]/50 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-red-500 to-rose-700 text-white font-bold py-3 rounded-xl mt-2 disabled:opacity-50 transition-all shadow-lg shadow-red-200"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-rose-200">
            <p className="text-[#9f1239] text-xs text-center mb-3">Quick demo login</p>
              <div className="flex gap-2">
                {['STUDENT','WARDEN','MENTOR','PARENT'].map(role => (
                <button key={role} type="button" onClick={() => fillDemo(role)}
                  className="flex-1 text-xs py-2 rounded-lg border border-rose-200 text-[#7f1d1d] hover:border-red-400 hover:text-red-700 hover:bg-rose-50 transition-colors">
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-[#9f1239] text-sm mt-5">
            No account?{' '}
            <Link to="/register" className="text-red-600 hover:underline">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
