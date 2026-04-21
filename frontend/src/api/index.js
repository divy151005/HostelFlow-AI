import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 refresh
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const res = await axios.post('/api/auth/refresh', { refreshToken })
        const { accessToken } = res.data.data
        localStorage.setItem('accessToken', accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──
export const authApi = {
  login:   data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data),
  refresh: data => api.post('/auth/refresh', data),
}

// ── Student ──
export const studentApi = {
  applyLeave:     data  => api.post('/student/leave/apply', data),
  getHistory:     (p=0) => api.get(`/student/leave/history?page=${p}`),
  cancelLeave:    id    => api.delete(`/student/leave/${id}/cancel`),
  getProfile:     ()    => api.get('/student/profile'),
  getNotifs:      (p=0) => api.get(`/student/notifications?page=${p}`),
  getUnreadCount: ()    => api.get('/student/notifications/unread-count'),
  markAllRead:    ()    => api.patch('/student/notifications/read-all'),
  updateFcm:      token => api.put('/student/fcm-token', { fcmToken: token }),
}

// ── Warden ──
export const wardenApi = {
  getLeaves:      (status, p=0) => api.get(`/warden/leaves?status=${status||''}&page=${p}`),
  actionLeave:    (id, data) => api.post(`/warden/leaves/${id}/action`, data),
  currentlyOut:   ()    => api.get('/warden/leaves/currently-out'),
  getStats:       ()    => api.get('/warden/dashboard/stats'),
  getHighRisk:    ()    => api.get('/warden/students/high-risk'),
  getAllStudents:  ()    => api.get('/warden/students/all'),
  getStudentLeaves: id  => api.get(`/warden/students/${id}/leaves`),
  getNotifs:      (p=0) => api.get(`/warden/notifications?page=${p}`),
  markAllRead:    ()    => api.patch('/warden/notifications/read-all'),
}

// ── Mentor ──
export const mentorApi = {
  getLeaves:      (status, p=0) => api.get(`/mentor/leaves?status=${status||''}&page=${p}`),
  actionLeave:    (id, data) => api.post(`/mentor/leaves/${id}/action`, data),
  getNotifs:      (p=0) => api.get(`/mentor/notifications?page=${p}`),
  markAllRead:    ()    => api.patch('/mentor/notifications/read-all'),
}

// ── Parent ──
export const parentApi = {
  approveLeave:   data  => api.post('/parent/leave/approve', data),
  getLinkedStudent: () => api.get('/parent/student/profile'),
  getStudentLeaves: (p=0) => api.get(`/parent/student/leaves?page=${p}`),
  getNotifs:      (p=0) => api.get(`/parent/notifications?page=${p}`),
  markAllRead:    ()    => api.patch('/parent/notifications/read-all'),
}

// ── QR ──
export const qrApi = {
  scan: data => api.post('/qr/scan', data),
}

export default api
