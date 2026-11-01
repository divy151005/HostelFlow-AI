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
  login:    data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data),
  refresh:  data => api.post('/auth/refresh', data),
}

// ── Student ──
export const studentApi = {
  applyLeave:        data  => api.post('/student/leave/apply', data),
  getHistory:        (p=0) => api.get(`/student/leave/history?page=${p}`),
  cancelLeave:       id    => api.delete(`/student/leave/${id}/cancel`),
  getProfile:        ()    => api.get('/student/profile'),
  getActivity:       ()    => api.get('/student/activity'),
  triggerSOS:        data  => api.post('/student/sos', data || {}),
  getNotifs:         (p=0) => api.get(`/student/notifications?page=${p}`),
  getUnreadCount:    ()    => api.get('/student/notifications/unread-count'),
  markAllRead:       ()    => api.patch('/student/notifications/read-all'),
  updateFcm:         token => api.put('/student/fcm-token', { fcmToken: token }),
  getComplaints:     ()    => api.get('/student/complaints'),
  submitComplaint:   data  => api.post('/student/complaints', data),
  reopenComplaint:   (id, data) => api.post(`/student/complaints/${id}/reopen`, data),
  submitFeedback:    data  => api.post('/student/feedback', data),
  getMyFeedback:     ()    => api.get('/student/feedback/my'),
  getMyIncidents:    ()    => api.get('/student/incidents/my'),
  submitExplanation: (id, data) => api.post(`/student/incidents/${id}/explanation`, data),
  getNetworkStatus:  (ssid, simCell) => api.get(`/student/network-status?wifiSsid=${encodeURIComponent(ssid || '')}&simulateCellular=${simCell || false}`),
}

// ── Warden ──
export const wardenApi = {
  getLeaves:              (status, p=0) => api.get(`/warden/leaves?status=${status||''}&page=${p}`),
  actionLeave:            (id, data) => api.post(`/warden/leaves/${id}/action`, data),
  currentlyOut:           ()    => api.get('/warden/leaves/currently-out'),
  getStats:               ()    => api.get('/warden/dashboard/stats'),
  getSupervisionOverview: ()    => api.get('/warden/supervision/overview'),
  getHighRisk:            ()    => api.get('/warden/students/high-risk'),
  getAllStudents:         ()    => api.get('/warden/students/all'),
  getStudentLeaves:       id    => api.get(`/warden/students/${id}/leaves`),
  getStudentActivity:     id    => api.get(`/warden/students/${id}/activity`),
  getNotifs:              (p=0) => api.get(`/warden/notifications?page=${p}`),
  markAllRead:            ()    => api.patch('/warden/notifications/read-all'),
  getComplaints:          (params) => api.get('/warden/complaints', { params }),
  updateComplaint:        (id, data) => api.patch(`/warden/complaints/${id}`, data),
  getFeedback:            ()    => api.get('/warden/feedback'),
  getMaintenance:         ()    => api.get('/warden/maintenance'),
  createMaintenance:      data  => api.post('/warden/maintenance', data),
  updateMaintenance:      (id, data) => api.patch(`/warden/maintenance/${id}`, data),
  getMaintenanceStats:    ()    => api.get('/warden/maintenance/stats'),
  getIncidents:           ()    => api.get('/warden/incidents'),
  registerIncident:       data  => api.post('/warden/incidents', data),
  actionIncident:         (id, data) => api.patch(`/warden/incidents/${id}/action`, data),
}

// ── Mentor ──
export const mentorApi = {
  getLeaves:          (status, p=0) => api.get(`/mentor/leaves?status=${status||''}&page=${p}`),
  actionLeave:        (id, data) => api.post(`/mentor/leaves/${id}/action`, data),
  getStudents:        ()    => api.get('/mentor/students'),
  getAnalytics:       ()    => api.get('/mentor/analytics'),
  getStudentActivity: id    => api.get(`/mentor/students/${id}/activity`),
  getNotifs:          (p=0) => api.get(`/mentor/notifications?page=${p}`),
  markAllRead:        ()    => api.patch('/mentor/notifications/read-all'),
}

// ── Parent ──
export const parentApi = {
  approveLeave:        data  => api.post('/parent/leave/approve', data),
  getLinkedStudent:    ()    => api.get('/parent/student/profile'),
  getStudentActivity:  ()    => api.get('/parent/student/activity'),
  getStudentLeaves:    (p=0) => api.get(`/parent/student/leaves?page=${p}`),
  getIncidents:        ()    => api.get('/parent/incidents'),
  getNotifs:           (p=0) => api.get(`/parent/notifications?page=${p}`),
  markAllRead:         ()    => api.patch('/parent/notifications/read-all'),
}

// ── Admin ──
export const adminApi = {
  getOverview:   ()     => api.get('/admin/overview'),
  getUsers:      (role) => api.get(`/admin/users${role ? '?role=' + role : ''}`),
  createUser:    data   => api.post('/admin/users', data),
  updateUser:    (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:    id     => api.delete(`/admin/users/${id}`),
  toggleLock:    id     => api.patch(`/admin/users/${id}/toggle-lock`),
  getStats:      ()     => api.get('/admin/stats'),
  getAnalytics:  ()     => api.get('/admin/analytics'),
  getOperations: ()     => api.get('/admin/operations'),
}

// ── Mess & Food ──
export const messApi = {
  getTimetable:    ()         => api.get('/mess/timetable'),
  updateTimetable: (day, data)=> api.put(`/mess/timetable/${day}`, data),
  submitFeedback:  data       => api.post('/mess/feedback', data),
  getMyFeedback:   ()         => api.get('/mess/feedback/my'),
  getAllFeedback:  ()         => api.get('/mess/feedback'),
  getStats:        ()         => api.get('/mess/stats'),
}

// ── Direct Chat ──
export const chatApi = {
  getContacts:     ()         => api.get('/chat/contacts'),
  getMessages:     partnerId  => api.get(`/chat/messages?partnerId=${partnerId}`),
  sendMessage:     data       => api.post('/chat/messages', data),
  getUnreadCount:  ()         => api.get('/chat/unread-count'),
}

// ── Announcements ──
export const announcementApi = {
  getAnnouncements: ()   => api.get('/announcements'),
  createAnnouncement: data => api.post('/announcements', data),
}

// ── AI Assistant ──
export const aiApi = {
  chat:       data => api.post('/ai/assistant', data),
  autoTriage: data => api.post('/ai/triage', data),
}

// ── Gate / Security ──
export const gateApi = {
  lookup:  query => api.get(`/gate/lookup?query=${encodeURIComponent(query)}`),
  scan:    data  => api.post('/gate/scan', data),
  getLogs: ()    => api.get('/gate/logs'),
}

// ── Mess Extension (Waste Reduction & Polling) ──
export const messExtApi = {
  optOut:              data    => api.post('/mess/opt-out', data),
  getMyOptOuts:        ()      => api.get('/mess/opt-outs/my'),
  getKitchenHeadcount: date    => api.get(`/mess/kitchen-headcount${date ? '?date=' + date : ''}`),
  getPolls:            ()      => api.get('/mess/polls'),
  createPoll:          data    => api.post('/mess/polls', data),
  votePoll:            (id, op)=> api.post(`/mess/polls/${id}/vote`, { option: op }),
}

// ── Room Matrix & Swap ──
export const roomApi = {
  getMatrix:        ()          => api.get('/rooms/matrix'),
  requestSwap:      data        => api.post('/rooms/swap/request', data),
  peerAction:       (id, data)  => api.post(`/rooms/swap/${id}/peer-action`, data),
  wardenAction:     (id, data)  => api.post(`/rooms/swap/${id}/warden-action`, data),
  getMySwaps:       ()          => api.get('/rooms/swap/my'),
  getAllSwaps:      ()          => api.get('/rooms/swap/all'),
  saveInventory:    data        => api.post('/rooms/inventory', data),
  getMyInventory:   ()          => api.get('/rooms/inventory/my'),
  getAllInventories:()          => api.get('/rooms/inventory/all'),
}

// ── Visitor Passes ──
export const visitorApi = {
  apply:      data       => api.post('/visitor/apply', data),
  getMyPasses:()         => api.get('/visitor/my'),
  getAllPasses:()        => api.get('/visitor/all'),
  approvePass:(id, data) => api.post(`/visitor/${id}/approve`, data),
  gateAction: data       => api.post('/visitor/gate-action', data),
}

// ── Finance & No-Dues ──
export const financeApi = {
  getMyFees:    ()         => api.get('/finance/my'),
  getAllFees:   ()         => api.get('/finance/all'),
  payFee:       (id, data) => api.post(`/finance/pay/${id}`, data || {}),
  issueFine:    data       => api.post('/finance/issue-fine', data),
  applyNoDues:  data       => api.post('/finance/nodues/apply', data || {}),
  getMyNoDues:  ()         => api.get('/finance/nodues/my'),
  getAllNoDues: ()         => api.get('/finance/nodues/all'),
  signoffNoDues:(id, data) => api.post(`/finance/nodues/${id}/signoff`, data),
}

// ── Community Life (Laundry & Lost & Found) ──
export const communityApi = {
  bookLaundry:    data => api.post('/community/laundry/book', data),
  getLaundrySlots:date => api.get(`/community/laundry/slots${date ? '?date=' + date : ''}`),
  getMyLaundry:   ()   => api.get('/community/laundry/my'),
  cancelLaundry:  id   => api.delete(`/community/laundry/${id}`),
  postLostFound:  data => api.post('/community/lost-found', data),
  getLostFound:   ()   => api.get('/community/lost-found'),
  claimLostFound: id   => api.post(`/community/lost-found/${id}/claim`),
}

// ── QR ──
export const qrApi = {
  scan: data => api.post('/qr/scan', data),
}

export default api
