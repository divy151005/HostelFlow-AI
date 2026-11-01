import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { adminApi } from '../../api'

const navLinks = [
  { to: '/admin', icon: '🏛️', label: 'Admin Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'User Directory' },
  { to: '/admin/operations', icon: '🛠️', label: 'Operations & Maint.' },
  { to: '/messages', icon: '💬', label: 'Messages' },
]

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  // Edit / Link Modal
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: 'password',
    role: 'STUDENT',
    phone: '',
    roomNumber: '',
    hostelBlock: 'A',
    mentorEmail: '',
    parentEmail: '',
    linkedStudentId: ''
  })
  const [creating, setCreating] = useState(false)

  const loadUsers = async () => {
    try {
      const res = await adminApi.getUsers(roleFilter === 'ALL' ? '' : roleFilter)
      setUsers(res.data.data || [])
    } catch {
      toast.error('Could not load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [roleFilter])

  const handleToggleLock = async (u) => {
    try {
      await adminApi.toggleLock(u.id)
      toast.success(`Account lock status toggled for ${u.fullName}`)
      loadUsers()
    } catch {
      toast.error('Failed to toggle lock')
    }
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to delete ${u.fullName} (${u.email})?`)) return
    try {
      await adminApi.deleteUser(u.id)
      toast.success('User deleted')
      loadUsers()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const openEditModal = (u) => {
    setEditingUser(u)
    setEditForm({
      fullName: u.fullName || '',
      phone: u.phone || '',
      roomNumber: u.roomNumber || '',
      hostelBlock: u.hostelBlock || 'A',
      course: u.course || '',
      year: u.year || '',
      mentorEmail: u.mentorEmail || '',
      parentEmail: u.parentEmail || '',
      linkedStudentId: u.linkedStudentId || '',
      role: u.role || 'STUDENT'
    })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      await adminApi.updateUser(editingUser.id, editForm)
      toast.success(`Profile & relationships updated for ${editingUser.fullName}`)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!createForm.email.trim() || !createForm.fullName.trim()) {
      return toast.error('Full name and email are required')
    }
    setCreating(true)
    try {
      await adminApi.createUser(createForm)
      toast.success(`User ${createForm.fullName} created successfully!`)
      setShowCreateModal(false)
      setCreateForm({
        fullName: '',
        email: '',
        password: 'password',
        role: 'STUDENT',
        phone: '',
        roomNumber: '',
        hostelBlock: 'A',
        mentorEmail: '',
        parentEmail: '',
        linkedStudentId: ''
      })
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  // Pre-filter mentors and students for easy relationship assignment
  const mentorsList = users.filter(u => u.role === 'MENTOR')
  const studentsList = users.filter(u => u.role === 'STUDENT')

  return (
    <Layout navLinks={navLinks} title="Admin Portal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#3f0d12]">
              👥 User Management & Supervisory Relationships
            </h1>
            <p className="text-sm text-rose-700 mt-1">
              Maintain students, faculty mentors, wardens, linked parents, and mentor-student pairing.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 flex items-center gap-1.5"
          >
            <span>➕</span> Add New Account
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {['ALL', 'STUDENT', 'MENTOR', 'WARDEN', 'PARENT', 'ADMIN'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'bg-white border border-rose-200 text-[#7f1d1d] hover:bg-rose-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-rose-100/60 rounded-xl animate-pulse" />)}
            </div>
          ) : users.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">No users found for role: {roleFilter}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rose-100 text-rose-800 pb-2">
                    <th className="py-2.5">User</th>
                    <th>Role</th>
                    <th>Room & Block</th>
                    <th>Assigned Mentor</th>
                    <th>Linked Parent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-[#3f0d12]">{u.fullName}</div>
                        <div className="text-[11px] text-stone-500">{u.email}</div>
                        {u.rollNumber && <div className="text-[10px] text-rose-700 font-mono">Roll: {u.rollNumber}</div>}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'WARDEN' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'MENTOR' ? 'bg-teal-100 text-teal-800' :
                          u.role === 'PARENT' ? 'bg-amber-100 text-amber-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.roomNumber ? `${u.roomNumber} (Block ${u.hostelBlock || 'A'})` : '—'}
                      </td>
                      <td>
                        {u.role === 'STUDENT' ? (
                          <span className="text-stone-700 font-medium">
                            {u.mentorEmail || <i className="text-amber-600">Unassigned</i>}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        {u.role === 'STUDENT' ? (
                          <span className="text-stone-700">{u.parentEmail || '—'}</span>
                        ) : u.role === 'PARENT' && u.linkedStudentId ? (
                          <span className="text-xs text-rose-700 font-semibold">Linked Child ID</span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.accountNonLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'
                        }`}>
                          {u.accountNonLocked ? 'Active' : 'Locked'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="text-red-600 hover:text-red-800 font-bold hover:underline"
                          >
                            Edit / Link
                          </button>
                          <button
                            onClick={() => handleToggleLock(u)}
                            className="text-stone-500 hover:text-stone-800 text-[11px]"
                          >
                            {u.accountNonLocked ? 'Lock' : 'Unlock'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-rose-500 hover:text-rose-800 text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Edit User & Relationships */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-rose-300 shadow-2xl">
              <h3 className="font-bold text-base text-[#3f0d12]">
                Edit Details & Relationships: {editingUser.fullName}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>

              {editingUser.role === 'STUDENT' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Room Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                        value={editForm.roomNumber}
                        onChange={e => setEditForm({ ...editForm, roomNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Hostel Block</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                        value={editForm.hostelBlock}
                        onChange={e => setEditForm({ ...editForm, hostelBlock: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Mentor Assignment */}
                  <div>
                    <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">
                      Assigned Faculty Mentor Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                      placeholder="mentor@hostelflow.com"
                      value={editForm.mentorEmail}
                      onChange={e => setEditForm({ ...editForm, mentorEmail: e.target.value })}
                    />
                  </div>

                  {/* Parent Email Link */}
                  <div>
                    <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">
                      Linked Parent Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                      placeholder="parent@hostelflow.com"
                      value={editForm.parentEmail}
                      onChange={e => setEditForm({ ...editForm, parentEmail: e.target.value })}
                    />
                  </div>
                </>
              )}

              {editingUser.role === 'PARENT' && (
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">
                    Select Linked Student (Ward)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    value={editForm.linkedStudentId}
                    onChange={e => setEditForm({ ...editForm, linkedStudentId: e.target.value })}
                  >
                    <option value="">-- No Linked Student --</option>
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.rollNumber} - Room {s.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-red-200"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Create User */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <form onSubmit={handleCreateUser} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-rose-300 shadow-2xl">
              <h3 className="font-bold text-base text-[#3f0d12]">Create New User Account</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Role</label>
                  <select
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    value={createForm.role}
                    onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MENTOR">MENTOR</option>
                    <option value="WARDEN">WARDEN</option>
                    <option value="PARENT">PARENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    placeholder="password"
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    placeholder="John Doe"
                    value={createForm.fullName}
                    onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                    placeholder="user@hostelflow.com"
                    value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>
              </div>

              {createForm.role === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Room Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                      placeholder="B-102"
                      value={createForm.roomNumber}
                      onChange={e => setCreateForm({ ...createForm, roomNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#7f1d1d] block mb-1">Mentor Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-[#fffbfa]"
                      placeholder="mentor@hostelflow.com"
                      value={createForm.mentorEmail}
                      onChange={e => setCreateForm({ ...createForm, mentorEmail: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-200"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
