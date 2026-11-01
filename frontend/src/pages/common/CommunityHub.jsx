import { useState, useEffect } from 'react'
import { communityApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import toast from 'react-hot-toast'

export default function CommunityHub() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('LAUNDRY') // 'LAUNDRY' or 'LOST_FOUND'

  // Laundry State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMachine, setSelectedMachine] = useState('Machine 1')
  const [bookings, setBookings] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [bookingLoading, setBookingLoading] = useState(false)

  // Lost & Found State
  const [items, setItems] = useState([])
  const [filterType, setFilterType] = useState('ALL') // 'ALL', 'LOST', 'FOUND'
  const [postForm, setPostForm] = useState({
    title: '',
    type: 'FOUND',
    category: 'ELECTRONICS',
    location: '',
    description: ''
  })
  const [posting, setPosting] = useState(false)

  const timeSlots = [
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM'
  ]

  const fetchLaundry = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        communityApi.getLaundrySlots(selectedDate),
        communityApi.getMyLaundry()
      ])
      setBookings(allRes.data.data || [])
      setMyBookings(myRes.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchLostFound = async () => {
    try {
      const res = await communityApi.getLostFound()
      setItems(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchLaundry()
    fetchLostFound()
  }, [selectedDate])

  const handleBookSlot = async (slot) => {
    setBookingLoading(true)
    try {
      await communityApi.bookLaundry({
        machineNumber: selectedMachine,
        date: selectedDate,
        timeSlot: slot
      })
      toast.success(`Reserved ${selectedMachine} for ${slot}!`)
      fetchLaundry()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Slot booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelLaundry = async (id) => {
    try {
      await communityApi.cancelLaundry(id)
      toast.success('Reservation cancelled')
      fetchLaundry()
    } catch (e) {
      toast.error('Failed to cancel')
    }
  }

  const handlePostLostFound = async (e) => {
    e.preventDefault()
    if (!postForm.title || !postForm.location) {
      toast.error('Please enter title and location')
      return
    }
    setPosting(true)
    try {
      await communityApi.postLostFound(postForm)
      toast.success('Notice posted to community bulletin!')
      setPostForm({
        title: '',
        type: 'FOUND',
        category: 'ELECTRONICS',
        location: '',
        description: ''
      })
      fetchLostFound()
    } catch (e) {
      toast.error('Failed to post item')
    } finally {
      setPosting(false)
    }
  }

  const handleClaim = async (id) => {
    try {
      await communityApi.claimLostFound(id)
      toast.success('Item marked as claimed!')
      fetchLostFound()
    } catch (e) {
      toast.error('Action failed')
    }
  }

  const navLinks = user?.role === 'STUDENT'
    ? [
        { to: '/student', icon: '📊', label: 'Dashboard' },
        { to: '/community', icon: '🧺', label: 'Laundry & Community' },
        { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]
    : [
        { to: '/warden', icon: '📊', label: 'Dashboard' },
        { to: '/warden/supervision', icon: '🛡️', label: 'Supervision' },
        { to: '/community', icon: '🧺', label: 'Community Life' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]

  const filteredItems = items.filter(i => {
    if (filterType === 'ALL') return true
    return i.type === filterType
  })

  return (
    <Layout navLinks={navLinks} title="Hostel Community Life">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#3f0d12]">Hostel Amenities & Community Bulletin</h1>
            <p className="text-xs text-[#9f1239] mt-0.5">Washing machine slot booking and community Lost & Found board</p>
          </div>

          <div className="flex bg-rose-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('LAUNDRY')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'LAUNDRY' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              🧺 Laundry Machines
            </button>
            <button
              onClick={() => setActiveTab('LOST_FOUND')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'LOST_FOUND' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              🔍 Lost & Found ({items.length})
            </button>
          </div>
        </div>

        {/* TAB 1: LAUNDRY SLOT BOOKING */}
        {activeTab === 'LAUNDRY' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#7f1d1d]">Select Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-rose-200 bg-[#fffdfd]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4'].map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMachine(m)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        selectedMachine === m
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-rose-50 text-[#7f1d1d] border-rose-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Grid */}
              <div>
                <h3 className="text-xs font-bold text-[#9f1239] uppercase tracking-wider mb-3">
                  Available Slots for {selectedMachine} on {selectedDate}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {timeSlots.map(slot => {
                    const booked = bookings.find(
                      b => b.machineNumber === selectedMachine && b.timeSlot === slot && b.status === 'BOOKED'
                    )
                    const isMyBooking = booked && booked.studentId === user?.id

                    return (
                      <div
                        key={slot}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                          booked
                            ? isMyBooking
                              ? 'bg-blue-50 border-blue-300 text-blue-900'
                              : 'bg-stone-50 border-stone-200 text-stone-500'
                            : 'bg-white border-rose-200 hover:border-red-500 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">{slot}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            booked
                              ? isMyBooking ? 'bg-blue-200 text-blue-900' : 'bg-stone-200 text-stone-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {booked ? (isMyBooking ? 'YOUR SLOT' : 'BOOKED') : 'AVAILABLE'}
                          </span>
                        </div>

                        {booked ? (
                          <div className="text-[11px] text-stone-500">
                            Reserved by {booked.studentName}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBookSlot(slot)}
                            disabled={bookingLoading}
                            className="mt-2 w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
                          >
                            Reserve Slot
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* My Active Laundry Bookings */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#3f0d12]">My Reserved Laundry Slots</h3>
              {myBookings.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">No active laundry reservations.</div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map(b => (
                    <div key={b.id} className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-red-700">{b.machineNumber}</span>
                        <span className="text-stone-500">{b.bookingDate}</span>
                      </div>
                      <div className="text-[#3f0d12]">{b.timeSlot}</div>
                      {b.status === 'BOOKED' && (
                        <button
                          onClick={() => handleCancelLaundry(b.id)}
                          className="mt-2 text-stone-500 hover:text-red-600 text-[11px] underline"
                        >
                          Cancel Reservation
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LOST & FOUND BULLETIN */}
        {activeTab === 'LOST_FOUND' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Post Form */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#3f0d12]">Post to Lost & Found</h3>
              <form onSubmit={handlePostLostFound} className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPostForm({ ...postForm, type: 'FOUND' })}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                      postForm.type === 'FOUND'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    I Found an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostForm({ ...postForm, type: 'LOST' })}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                      postForm.type === 'LOST'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    I Lost an Item
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Item Title</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="e.g. Sony Wireless Earbuds Case"
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Category</label>
                    <select
                      value={postForm.category}
                      onChange={e => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                    >
                      <option value="ELECTRONICS">ELECTRONICS</option>
                      <option value="KEYS">KEYS / LOCKS</option>
                      <option value="ID_CARD">ID CARD / WALLET</option>
                      <option value="CLOTHING">CLOTHING</option>
                      <option value="BOOKS">BOOKS / NOTES</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Location</label>
                    <input
                      type="text"
                      value={postForm.location}
                      onChange={e => setPostForm({ ...postForm, location: e.target.value })}
                      placeholder="e.g. Mess Hall table 4"
                      className="w-full px-3 py-2 rounded-xl border border-rose-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Description</label>
                  <textarea
                    value={postForm.description}
                    onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                    rows={3}
                    placeholder="Provide details (color, brand, distinguishing marks)..."
                    className="w-full px-3 py-2 rounded-xl border border-rose-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={posting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md text-xs"
                >
                  {posting ? 'Posting...' : 'Publish Notice'}
                </button>
              </form>
            </div>

            {/* Items Feed */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <h3 className="font-bold text-sm text-[#3f0d12]">Community Notice Board</h3>
                <div className="flex gap-1.5">
                  {['ALL', 'LOST', 'FOUND'].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                        filterType === t
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-rose-50 text-[#7f1d1d] border-rose-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">No items posted in this category.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map(item => (
                    <div key={item.id} className="p-4 rounded-xl border border-rose-200 bg-[#fffdfd] space-y-2 text-xs shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.type === 'FOUND' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.type} • {item.category}
                        </span>
                        <span className={`text-[10px] font-bold ${item.status === 'CLAIMED' ? 'text-stone-400' : 'text-emerald-600'}`}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#3f0d12]">{item.title}</h4>
                      <p className="text-stone-600 text-xs">{item.description}</p>
                      <div className="text-[11px] text-[#9f1239]">
                        📍 Location: <strong>{item.location}</strong>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Posted by: {item.reporterName} ({item.contactInfo})
                      </div>

                      {item.status === 'OPEN' && (
                        <div className="pt-2 border-t border-rose-100">
                          <button
                            onClick={() => handleClaim(item.id)}
                            className="w-full py-1.5 bg-stone-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs"
                          >
                            🤝 Mark as Claimed / Returned
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
