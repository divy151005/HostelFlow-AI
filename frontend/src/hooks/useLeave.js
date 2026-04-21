import { useState, useEffect, useCallback } from 'react'
import { studentApi } from '../api'
import toast from 'react-hot-toast'

export function useLeaveHistory(pageSize = 10) {
  const [leaves, setLeaves] = useState([])
  const [page, setPage]     = useState(0)
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const res = await studentApi.getHistory(p)
      const data = res.data.data
      setLeaves(data?.content || [])
      setTotal(data?.totalElements || 0)
      setPage(p)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch(0) }, [fetch])

  const cancel = async (id) => {
    try {
      await studentApi.cancelLeave(id)
      toast.success('Leave cancelled')
      fetch(page)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cancel failed')
    }
  }

  return { leaves, page, total, loading, fetch, cancel, hasMore: (page + 1) * pageSize < total }
}

export function useNotifications(role = 'student') {
  const [notifs, setNotifs]   = useState([])
  const [unread, setUnread]   = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const res = await studentApi.getNotifs(0)
      setNotifs(res.data.data?.content || [])
    } catch {}
  }, [])

  const fetchUnread = useCallback(async () => {
    try {
      const res = await studentApi.getUnreadCount()
      setUnread(res.data.data || 0)
    } catch {}
  }, [])

  useEffect(() => {
    Promise.all([fetchAll(), fetchUnread()]).finally(() => setLoading(false))
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [fetchAll, fetchUnread])

  const markAllRead = async () => {
    await studentApi.markAllRead()
    setUnread(0)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  return { notifs, unread, loading, markAllRead, refetch: fetchAll }
}
