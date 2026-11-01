import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiApi } from '../../api'

export default function AiAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your HostelFlow AI Assistant. How can I help you today? You can ask about curfew timings, leave approval rules, mess schedules, or emergency protocols.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const quickQuestions = [
    'What is the hostel curfew time?',
    'How do I apply for multi-day leave?',
    'What are the mess timings?',
    'How does the emergency SOS work?'
  ]

  const sendQuery = async (queryText) => {
    const q = queryText || input
    if (!q.trim() || loading) return

    const userMsg = { sender: 'user', text: q.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiApi.chat({ query: q.trim() })
      const aiReply = res.data.data?.response || 'I have noted your inquiry. Please consult your hostel warden or mentor for specific permissions.'
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }])
    } catch {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'HostelFlow Advisory: Curfew is 08:00 PM. All gate exits and returns require QR scans. Contact warden for urgent issues.'
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-rose-200 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[560px] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">🤖</div>
            <div>
              <div className="font-bold text-base">HostelFlow AI Assistant</div>
              <div className="text-xs text-rose-100">Advisory & Hostel Operations Guide</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
        </div>

        {/* Message area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fff7f7]">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm ${
                m.sender === 'user'
                  ? 'bg-red-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white text-[#3f0d12] border border-rose-200 rounded-bl-none shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-rose-700 border border-rose-200 px-4 py-2 rounded-2xl text-xs animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Quick buttons */}
        <div className="px-4 py-2 bg-white border-t border-rose-100 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {quickQuestions.map(q => (
            <button
              key={q}
              onClick={() => sendQuery(q)}
              className="whitespace-nowrap px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg hover:bg-rose-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={e => { e.preventDefault(); sendQuery() }} className="p-4 bg-white border-t border-rose-200 flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-[#fffbfa]"
            placeholder="Ask about leave rules, mess, curfew..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-200"
          >
            Send
          </button>
        </form>
      </motion.div>
    </div>
  )
}
