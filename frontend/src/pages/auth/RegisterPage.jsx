import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', role: 'STUDENT',
    rollNumber: '', roomNumber: '', hostelBlock: '', course: '', year: '',
    parentEmail: '', mentorEmail: '', assignedBlock: '', linkedStudentId: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await register(form)
      toast.success('Account created!')
      const routes = { STUDENT: '/student', WARDEN: '/warden', MENTOR: '/mentor', PARENT: '/parent' }
      navigate(routes[user.role])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const Input = ({ label, name, type='text', placeholder }) => (
    <div>
      <label className="block text-[#9f1239] text-sm mb-1.5">{label}</label>
      <input type={type} value={form[name]} onChange={e => set(name, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-[#3f0d12] placeholder-[#b91c1c]/50 focus:outline-none focus:border-red-500 text-sm transition-colors" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fff7f7] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-red-300 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-rose-200 rounded-full opacity-40 blur-3xl" />

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg shadow-red-200">HF</div>
          <h1 className="text-2xl font-black text-[#3f0d12]">Create Account</h1>
          <p className="text-[#9f1239] text-sm mt-1">HostelFlow AI Registration</p>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-[0_30px_80px_rgba(127,29,29,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-[#9f1239] text-sm mb-2">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                {['STUDENT','WARDEN','MENTOR','PARENT'].map(r => (
                  <button key={r} type="button" onClick={() => set('role', r)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${form.role === r
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-rose-200 text-[#7f1d1d] hover:border-red-300 hover:bg-rose-50'}`}>
                    {r === 'STUDENT' ? '🎓' : r === 'WARDEN' ? '🛡️' : r === 'MENTOR' ? '🧑‍🏫' : '👨‍👩‍👦'} {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" name="fullName" placeholder="Rahul Sharma" />
              <Input label="Phone" name="phone" placeholder="9876543210" />
            </div>
            <Input label="Email" name="email" type="email" placeholder="you@email.com" />
            <Input label="Password" name="password" type="password" placeholder="Min 6 characters" />

            {form.role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Roll Number" name="rollNumber" placeholder="CS2021001" />
                  <Input label="Room Number" name="roomNumber" placeholder="A-204" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Block" name="hostelBlock" placeholder="A" />
                  <Input label="Course" name="course" placeholder="B.Tech CSE" />
                  <Input label="Year" name="year" placeholder="3rd" />
                </div>
                <Input label="Parent Email" name="parentEmail" placeholder="parent@email.com" />
                <Input label="Mentor Email" name="mentorEmail" placeholder="mentor@college.edu" />
              </>
            )}

            {(form.role === 'WARDEN' || form.role === 'MENTOR') && (
              <Input label="Assigned Block" name="assignedBlock" placeholder="A Block / CSE Hostel" />
            )}

            {form.role === 'PARENT' && (
              <Input label="Student ID (from warden)" name="linkedStudentId" placeholder="Student MongoDB ID" />
            )}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-red-500 to-rose-700 text-white font-bold py-3 rounded-xl mt-2 disabled:opacity-50 shadow-lg shadow-red-200">
              {loading ? 'Creating account...' : 'Create Account →'}
            </motion.button>
          </form>
          <p className="text-center text-[#9f1239] text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
