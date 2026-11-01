import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import { chatApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

export default function MessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialPartnerId = searchParams.get('partnerId')

  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const getNavLinks = () => {
    switch (user?.role) {
      case 'STUDENT':
        return [
          { to: '/student', icon: '🏠', label: 'Dashboard' },
          { to: '/student/apply', icon: '✈️', label: 'Apply Leave' },
          { to: '/student/history', icon: '📜', label: 'History' },
          { to: '/student/activity', icon: '📍', label: 'My Gate Activity' },
          { to: '/student/mess', icon: '🍲', label: 'Mess & Food' },
          { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
          { to: '/messages', icon: '💬', label: 'Messages' },
        ]
      case 'MENTOR':
        return [
          { to: '/mentor', icon: '📊', label: 'Supervision & Analytics' },
          { to: '/mentor/approvals', icon: '📝', label: 'Leave Approvals' },
          { to: '/messages', icon: '💬', label: 'Messages' },
        ]
      case 'WARDEN':
        return [
          { to: '/warden', icon: '📊', label: 'Dashboard' },
          { to: '/warden/supervision', icon: '👁️', label: 'Live Supervision' },
          { to: '/warden/leaves', icon: '📋', label: 'Leave Requests' },
          { to: '/warden/mess', icon: '🍲', label: 'Mess Operations' },
          { to: '/warden/operations', icon: '🛠️', label: 'Complaints & Maint.' },
          { to: '/warden/incidents', icon: '⚠️', label: 'Student Incidents' },
          { to: '/warden/students', icon: '👥', label: 'Students' },
          { to: '/messages', icon: '💬', label: 'Messages' },
        ]
      case 'PARENT':
        return [
          { to: '/parent', icon: '🏠', label: 'Dashboard' },
          { to: '/parent/approval', icon: '✅', label: 'Approve Leave' },
          { to: '/messages', icon: '💬', label: 'Messages' },
        ]
      case 'ADMIN':
        return [
          { to: '/admin', icon: '🏛️', label: 'Admin Dashboard' },
          { to: '/admin/users', icon: '👥', label: 'User Directory' },
          { to: '/admin/operations', icon: '🛠️', label: 'Operations & Maint.' },
          { to: '/messages', icon: '💬', label: 'Messages' },
        ]
      default:
        return [{ to: '/', icon: '🏠', label: 'Home' }]
    }
  }

  const loadContacts = async () => {
    try {
      const res = await chatApi.getContacts()
      const list = res.data.data || []
      setContacts(list)

      if (initialPartnerId) {
        const found = list.find(c => c.id === initialPartnerId)
        if (found) {
          setSelectedContact(found)
          loadMessages(found.id)
        } else if (list.length > 0) {
          setSelectedContact(list[0])
          loadMessages(list[0].id)
        }
      } else if (list.length > 0 && !selectedContact) {
        setSelectedContact(list[0])
        loadMessages(list[0].id)
      }
    } catch {
      toast.error('Could not load chat contacts')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (partnerId) => {
    try {
      const res = await chatApi.getMessages(partnerId)
      setMessages(res.data.data || [])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      toast.error('Could not load messages')
    }
  }

  useEffect(() => {
    loadContacts()
    const interval = setInterval(() => {
      if (selectedContact) {
        chatApi.getMessages(selectedContact.id).then(r => setMessages(r.data.data || []))
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedContact?.id])

  const handleSelectContact = (c) => {
    setSelectedContact(c)
    loadMessages(c.id)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedContact || sending) return
    setSending(true)
    try {
      const res = await chatApi.sendMessage({
        recipientId: selectedContact.id,
        content: inputText.trim()
      })
      setMessages(prev => [...prev, res.data.data])
      setInputText('')
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <Layout navLinks={getNavLinks()} title="Direct Messages">
      <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white border border-rose-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-200 flex items-center justify-between bg-gradient-to-r from-rose-50/50 to-white">
          <div>
            <h1 className="text-xl font-black text-[#3f0d12] flex items-center gap-2">
              💬 Direct Messages
            </h1>
            <p className="text-xs text-rose-700">Private one-to-one communication with complete history</p>
          </div>
          {selectedContact && (
            <div className="text-right">
              <div className="text-sm font-bold text-[#3f0d12]">{selectedContact.fullName}</div>
              <div className="text-xs text-rose-600">{selectedContact.roleLabel || selectedContact.role}</div>
            </div>
          )}
        </div>

        {/* Content grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Contacts sidebar */}
          <div className="w-80 border-r border-rose-200 bg-[#fffbfa] flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-rose-100 text-xs font-semibold uppercase tracking-wider text-rose-700">
              Conversations ({contacts.length})
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-rose-100/60 rounded-xl animate-pulse" />)}
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                No active contacts found for your role.
              </div>
            ) : (
              <div className="divide-y divide-rose-100">
                {contacts.map(c => {
                  const isSelected = selectedContact?.id === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectContact(c)}
                      className={`w-full text-left p-3.5 transition-all flex items-center gap-3 ${
                        isSelected ? 'bg-rose-100/70 border-l-4 border-red-600' : 'hover:bg-rose-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                        {c.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#3f0d12] truncate">{c.fullName}</span>
                          {c.unreadCount > 0 && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-rose-700 truncate mt-0.5">{c.roleLabel || c.role}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-[#fff7f7]">
            {!selectedContact ? (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-8">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-sm">Select a contact to begin or view your conversation.</p>
              </div>
            ) : (
              <>
                {/* Messages stream */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-xs text-rose-500 mt-12">
                      No message history yet. Send a greeting to start communicating!
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isMe = m.senderId === user?.id
                      return (
                        <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? 'bg-red-600 text-white rounded-br-none'
                              : 'bg-white text-[#3f0d12] border border-rose-200 rounded-bl-none'
                          }`}>
                            <div className="text-[11px] font-semibold opacity-75 mb-0.5">
                              {isMe ? 'You' : m.senderName}
                            </div>
                            <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>
                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-red-200' : 'text-stone-400'}`}>
                              {m.createdAt ? format(new Date(m.createdAt), 'hh:mm a') : ''}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-rose-200 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-[#fffbfa]"
                    placeholder={`Message ${selectedContact.fullName}...`}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-200 flex items-center gap-1.5"
                  >
                    <span>Send</span> ✈️
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
