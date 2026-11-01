import { useState, useEffect } from 'react'
import { roomApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import Room3DExplorer from '../../components/3d/Room3DExplorer'
import toast from 'react-hot-toast'

export default function RoomMatrix() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('MATRIX') // 'MATRIX', 'SWAP', 'INVENTORY'
  const [matrixData, setMatrixData] = useState(null)
  const [selectedBlock, setSelectedBlock] = useState('A')
  const [selectedFloor, setSelectedFloor] = useState('ALL')
  const [loading, setLoading] = useState(false)

  // Swaps state
  const [swaps, setSwaps] = useState([])
  const [swapTarget, setSwapTarget] = useState('')
  const [swapReason, setSwapReason] = useState('')
  const [swapSubmitting, setSwapSubmitting] = useState(false)

  // Inventory state
  const [inventory, setInventory] = useState({
    tableCondition: 'GOOD',
    chairCondition: 'GOOD',
    fanCondition: 'WORKING',
    mattressCondition: 'CLEAN',
    wallPaintCondition: 'FRESH',
    keyHandedOver: true,
    remarks: ''
  })
  const [inventorySaving, setInventorySaving] = useState(false)

  const fetchMatrix = async () => {
    setLoading(true)
    try {
      const res = await roomApi.getMatrix()
      setMatrixData(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchSwaps = async () => {
    try {
      const res = (user?.role === 'WARDEN' || user?.role === 'ADMIN')
        ? await roomApi.getAllSwaps()
        : await roomApi.getMySwaps()
      setSwaps(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchInventory = async () => {
    if (user?.role === 'STUDENT') {
      try {
        const res = await roomApi.getMyInventory()
        if (res.data.data) setInventory(res.data.data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    fetchMatrix()
    fetchSwaps()
    fetchInventory()
  }, [])

  const handleRequestSwap = async (e) => {
    e.preventDefault()
    if (!swapTarget.trim()) {
      toast.error('Enter target student roll number or room')
      return
    }
    setSwapSubmitting(true)
    try {
      await roomApi.requestSwap({
        targetRollOrRoom: swapTarget.trim(),
        reason: swapReason
      })
      toast.success('Room swap request submitted!')
      setSwapTarget('')
      setSwapReason('')
      fetchSwaps()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit swap request')
    } finally {
      setSwapSubmitting(false)
    }
  }

  const handlePeerAction = async (swapId, approved) => {
    try {
      await roomApi.peerAction(swapId, { approved, remark: approved ? 'Agreed' : 'Declined' })
      toast.success(`Swap request ${approved ? 'accepted' : 'declined'}`)
      fetchSwaps()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed')
    }
  }

  const handleWardenAction = async (swapId, approved) => {
    try {
      await roomApi.wardenAction(swapId, { approved, remark: approved ? 'Approved by Warden' : 'Rejected by Warden' })
      toast.success(`Swap decision applied: ${approved ? 'APPROVED' : 'REJECTED'}`)
      fetchSwaps()
      fetchMatrix()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Warden action failed')
    }
  }

  const handleSaveInventory = async (e) => {
    e.preventDefault()
    setInventorySaving(true)
    try {
      await roomApi.saveInventory(inventory)
      toast.success('Room inventory audit checklist saved!')
    } catch (e) {
      toast.error('Failed to save room inventory')
    } finally {
      setInventorySaving(false)
    }
  }

  // Filter rooms
  const filteredRooms = (matrixData?.rooms || []).filter(r => {
    if (r.block !== selectedBlock) return false
    if (selectedFloor !== 'ALL' && r.floor !== parseInt(selectedFloor)) return false
    return true
  })

  const navLinks = user?.role === 'STUDENT'
    ? [
        { to: '/student', icon: '📊', label: 'Dashboard' },
        { to: '/student/rooms', icon: '🏢', label: 'Room & Bed Matrix' },
        { to: '/student/mess', icon: '🍲', label: 'Mess & Food' },
        { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]
    : [
        { to: '/warden', icon: '📊', label: 'Dashboard' },
        { to: '/warden/supervision', icon: '🛡️', label: 'Supervision' },
        { to: '/warden/rooms', icon: '🏢', label: 'Room Matrix & Allocation' },
        { to: '/warden/mess', icon: '🍲', label: 'Mess Operations' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]

  return (
    <Layout navLinks={navLinks} title="Room Matrix & Allocation">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#3f0d12]">Hostel Room & Bed Allocation Matrix</h1>
            <p className="text-xs text-[#9f1239] mt-0.5">Interactive visual room map, bed swaps, and digital asset checklist</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-rose-100 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab('MATRIX')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'MATRIX' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              🏢 Visual Matrix
            </button>
            <button
              onClick={() => setActiveTab('SWAP')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'SWAP' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              🔄 Room Swaps ({swaps.length})
            </button>
            <button
              onClick={() => setActiveTab('INVENTORY')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'INVENTORY' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              📋 Room Inventory
            </button>
            <button
              onClick={() => setActiveTab('3D_ROOM')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === '3D_ROOM' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              ✨ 3D Room Explorer
            </button>
          </div>
        </div>

        {/* TAB 1: VISUAL 2D MATRIX */}
        {activeTab === 'MATRIX' && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm text-center">
                <div className="text-xs text-[#9f1239] font-medium">Total Beds</div>
                <div className="text-2xl font-bold text-[#3f0d12] mt-1">{matrixData?.totalBeds || 72}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm text-center">
                <div className="text-xs text-[#9f1239] font-medium">Occupied Beds</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{matrixData?.occupiedBeds || 0}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm text-center">
                <div className="text-xs text-[#9f1239] font-medium">Available Vacancies</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{matrixData?.vacantBeds || 72}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm text-center">
                <div className="text-xs text-[#9f1239] font-medium">Occupancy Rate</div>
                <div className="text-2xl font-bold text-red-600 mt-1">{matrixData?.occupancyRate || 0}%</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7f1d1d]">Block:</span>
                {['A', 'B'].map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBlock(b)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                      selectedBlock === b
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-rose-50 text-[#7f1d1d] border-rose-200'
                    }`}
                  >
                    Block {b}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7f1d1d]">Floor:</span>
                {['ALL', '1', '2', '3'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFloor(f)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                      selectedFloor === f
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-rose-50 text-[#7f1d1d] border-rose-200'
                    }`}
                  >
                    {f === 'ALL' ? 'All Floors' : `Floor ${f}`}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-[#9f1239]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Vacant</span>
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRooms.map(room => (
                <div key={room.roomNumber} className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-100">
                    <span className="font-bold text-sm text-[#3f0d12]">Room {room.roomNumber}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-red-700 font-semibold">
                      Floor {room.floor}
                    </span>
                  </div>

                  {/* 2 Beds */}
                  <div className="space-y-2">
                    {room.beds.map(bed => (
                      <div
                        key={bed.bedNumber}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          bed.status === 'OCCUPIED'
                            ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                            : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🛏️</span>
                          <div>
                            <div className="font-bold">Bed #{bed.bedNumber}</div>
                            {bed.status === 'OCCUPIED' ? (
                              <div className="text-[11px] text-blue-800 font-medium">
                                {bed.studentName} ({bed.rollNumber})
                              </div>
                            ) : (
                              <div className="text-[11px] text-emerald-700 font-medium">Vacant & Ready</div>
                            )}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bed.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {bed.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ROOM SWAP WORKFLOW */}
        {activeTab === 'SWAP' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Student Request Form */}
            {user?.role === 'STUDENT' && (
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#3f0d12]">Request Room Swap</h3>
                <p className="text-xs text-[#9f1239]">
                  Swap rooms with a peer. Requires mutual student agreement and Warden approval.
                </p>

                <form onSubmit={handleRequestSwap} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#7f1d1d] mb-1">Target Student Roll No. or Room</label>
                    <input
                      type="text"
                      value={swapTarget}
                      onChange={e => setSwapTarget(e.target.value)}
                      placeholder="e.g. EC2022015 or A-108"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#7f1d1d] mb-1">Reason for Swap</label>
                    <textarea
                      value={swapReason}
                      onChange={e => setSwapReason(e.target.value)}
                      rows={3}
                      placeholder="e.g. Nearer to academic block, mutual study preference..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={swapSubmitting}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-200 transition-all disabled:opacity-50"
                  >
                    {swapSubmitting ? 'Submitting...' : 'Submit Swap Proposal'}
                  </button>
                </form>
              </div>
            )}

            {/* Swap Requests List */}
            <div className={`${user?.role === 'STUDENT' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4`}>
              <h3 className="font-bold text-sm text-[#3f0d12]">Active Room Swap Proposals</h3>

              {swaps.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">No room swap requests found.</div>
              ) : (
                <div className="divide-y divide-rose-100">
                  {swaps.map(s => {
                    const isTargetPeer = user?.id === s.targetStudentId
                    const isWarden = user?.role === 'WARDEN' || user?.role === 'ADMIN'

                    return (
                      <div key={s.id} className="py-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#3f0d12]">
                            {s.applicantName} ({s.applicantRoom}) ⟷ {s.targetName} ({s.targetRoom})
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                            s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            s.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {s.status}
                          </span>
                        </div>

                        <p className="text-stone-600">Reason: {s.reason}</p>
                        {s.peerRemark && <p className="text-blue-700 font-medium">Peer Note: {s.peerRemark}</p>}
                        {s.wardenRemark && <p className="text-red-700 font-medium">Warden Note: {s.wardenRemark}</p>}

                        {/* Peer Action Buttons */}
                        {isTargetPeer && s.status === 'PENDING_PEER' && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handlePeerAction(s.id, true)}
                              className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                            >
                              ✅ Accept Swap
                            </button>
                            <button
                              onClick={() => handlePeerAction(s.id, false)}
                              className="px-3 py-1.5 bg-stone-200 text-stone-700 font-bold rounded-lg hover:bg-stone-300"
                            >
                              ❌ Decline
                            </button>
                          </div>
                        )}

                        {/* Warden Action Buttons */}
                        {isWarden && s.status === 'PENDING_WARDEN' && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleWardenAction(s.id, true)}
                              className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm"
                            >
                              🏢 Warden Approve & Swap Rooms
                            </button>
                            <button
                              onClick={() => handleWardenAction(s.id, false)}
                              className="px-3 py-1.5 bg-stone-200 text-stone-700 font-bold rounded-lg hover:bg-stone-300"
                            >
                              Reject Swap
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL ROOM INVENTORY */}
        {activeTab === 'INVENTORY' && (
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="font-bold text-base text-[#3f0d12]">Semester Check-in Room Inventory Audit</h3>
              <p className="text-xs text-[#9f1239] mt-0.5">
                Audit condition of room furniture and electrical fixtures to avoid damage liability when vacating.
              </p>
            </div>

            <form onSubmit={handleSaveInventory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Study Table Condition</label>
                  <select
                    value={inventory.tableCondition}
                    onChange={e => setInventory({ ...inventory, tableCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                  >
                    <option value="EXCELLENT">EXCELLENT (No scratches)</option>
                    <option value="GOOD">GOOD (Minor wear)</option>
                    <option value="DAMAGED">DAMAGED (Reported to care)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Study Chair Condition</label>
                  <select
                    value={inventory.chairCondition}
                    onChange={e => setInventory({ ...inventory, chairCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                  >
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="GOOD">GOOD</option>
                    <option value="DAMAGED">DAMAGED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Ceiling Fan & Speed Regulator</label>
                  <select
                    value={inventory.fanCondition}
                    onChange={e => setInventory({ ...inventory, fanCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                  >
                    <option value="WORKING">WORKING PROPERLY</option>
                    <option value="FAULTY">FAULTY / HUMMING NOISE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#7f1d1d] mb-1">Mattress Condition</label>
                  <select
                    value={inventory.mattressCondition}
                    onChange={e => setInventory({ ...inventory, mattressCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                  >
                    <option value="CLEAN">CLEAN & FIRM</option>
                    <option value="STAINED">STAINED</option>
                    <option value="DAMAGED">DAMAGED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#7f1d1d] mb-1">Additional Notes / Observations</label>
                <textarea
                  value={inventory.remarks || ''}
                  onChange={e => setInventory({ ...inventory, remarks: e.target.value })}
                  rows={2}
                  placeholder="e.g. Window latch intact, curtains clean..."
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="keyHandover"
                  checked={inventory.keyHandedOver}
                  onChange={e => setInventory({ ...inventory, keyHandedOver: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="keyHandover" className="text-xs font-semibold text-[#3f0d12]">
                  I confirm the official room door key was handed over in working order.
                </label>
              </div>

              <button
                type="submit"
                disabled={inventorySaving}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-200 transition-all disabled:opacity-50"
              >
                {inventorySaving ? 'Saving...' : '💾 Save & Verify Room Checklist'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: 3D ISOMETRIC ROOM EXPLORER */}
        {activeTab === '3D_ROOM' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#3f0d12]">Interactive 3D Room & Fixtures Visualizer</h3>
                <p className="text-xs text-[#9f1239]">WebGL real-time isometric 3D render of hostel room assets</p>
              </div>
            </div>

            <Room3DExplorer
              roomNumber={user?.roomNumber || 'A-204'}
              inventory={inventory}
              occupants={user ? [user] : []}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
