import { format, formatDistanceToNow, isAfter } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

export const formatTimeAgo = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const formatTime = (date) => {
  if (!date) return '—'
  return format(new Date(date), 'hh:mm a')
}

export const isOverdue = (expectedReturn) => {
  if (!expectedReturn) return false
  return isAfter(new Date(), new Date(expectedReturn))
}

export const minutesLate = (expectedReturn) => {
  if (!expectedReturn) return 0
  const diff = new Date() - new Date(expectedReturn)
  return Math.max(0, Math.floor(diff / 60000))
}

export const getRiskColor = (level) => {
  const map = { LOW: '#06D6A0', MEDIUM: '#FFB300', HIGH: '#FF4D6D' }
  return map[level] || '#06D6A0'
}

export const getTypeIcon = (type) => {
  const map = { LEAVE: '✈️', OUTING: '🚶', EMERGENCY: '🚨' }
  return map[type] || '📋'
}

export const getStatusIcon = (status) => {
  const map = {
    PENDING_WARDEN:  '⏳',
    PENDING_MENTOR:  '🧑‍🏫',
    PENDING_PARENT:  '👨‍👩‍👦',
    APPROVED:        '✅',
    REJECTED:        '❌',
    COMPLETED:       '🏁',
    LATE:            '⏰',
    CANCELLED:       '🚫',
  }
  return map[status] || '📋'
}
