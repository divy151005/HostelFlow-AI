import { useState, useEffect } from 'react'
import { financeApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import toast from 'react-hot-toast'

export default function FinanceAndNoDues() {
  const { user } = useAuth()
  const isStaff = user?.role === 'WARDEN' || user?.role === 'ADMIN'

  const [activeTab, setActiveTab] = useState('FEES') // 'FEES' or 'NODUES'
  const [fees, setFees] = useState([])
  const [noDues, setNoDues] = useState(null)
  const [allNoDues, setAllNoDues] = useState([])
  const [loading, setLoading] = useState(false)

  // Payment Modal
  const [payingFee, setPayingFee] = useState(null)
  const [paymentRef, setPaymentRef] = useState('')
  const [paying, setPaying] = useState(false)

  // Issue Fine Form (for staff)
  const [fineForm, setFineForm] = useState({
    studentId: '65a000000000000000000004', // Priya Singh
    title: 'Repeated Curfew Late Return Penalty',
    type: 'FINE',
    amount: '500',
    remarks: 'Disciplinary fine issued per hostel rules'
  })

  // Clearance Request
  const [clearanceReason, setClearanceReason] = useState('Final Year Graduation Clearance')
  const [applyingClearance, setApplyingClearance] = useState(false)

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = isStaff ? await financeApi.getAllFees() : await financeApi.getMyFees()
      setFees(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchNoDues = async () => {
    try {
      if (isStaff) {
        const res = await financeApi.getAllNoDues()
        setAllNoDues(res.data.data || [])
      } else {
        const res = await financeApi.getMyNoDues()
        setNoDues(res.data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchFees()
    fetchNoDues()
  }, [])

  const handlePayFee = async (e) => {
    e.preventDefault()
    if (!payingFee) return
    setPaying(true)
    try {
      await financeApi.payFee(payingFee.id, { paymentRef: paymentRef || 'UPI_' + Date.now() })
      toast.success('Payment processed! Official receipt generated.')
      setPayingFee(null)
      setPaymentRef('')
      fetchFees()
    } catch (e) {
      toast.error('Payment failed')
    } finally {
      setPaying(false)
    }
  }

  const handleIssueFine = async (e) => {
    e.preventDefault()
    try {
      await financeApi.issueFine(fineForm)
      toast.success('Fine recorded and student notified!')
      fetchFees()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to issue fine')
    }
  }

  const handleApplyNoDues = async () => {
    setApplyingClearance(true)
    try {
      const res = await financeApi.applyNoDues({ reason: clearanceReason })
      setNoDues(res.data.data)
      toast.success('No-Dues clearance application submitted!')
      fetchNoDues()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to apply')
    } finally {
      setApplyingClearance(false)
    }
  }

  const handleSignoff = async (requestId, dept, cleared) => {
    try {
      await financeApi.signoffNoDues(requestId, {
        department: dept,
        cleared: cleared,
        remarks: cleared ? 'Cleared without liabilities' : 'Outstanding items found'
      })
      toast.success(`${dept} signoff recorded!`)
      fetchNoDues()
    } catch (e) {
      toast.error('Signoff failed')
    }
  }

  const navLinks = user?.role === 'STUDENT'
    ? [
        { to: '/student', icon: '📊', label: 'Dashboard' },
        { to: '/student/finance', icon: '💳', label: 'Fees & No-Dues' },
        { to: '/student/care', icon: '🛠️', label: 'Hostel Care' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]
    : [
        { to: '/warden', icon: '📊', label: 'Dashboard' },
        { to: '/warden/supervision', icon: '🛡️', label: 'Supervision' },
        { to: '/warden/finance', icon: '💳', label: 'Fees & No-Dues' },
        { to: '/messages', icon: '💬', label: 'Messages' },
      ]

  return (
    <Layout navLinks={navLinks} title="Hostel Finance & No-Dues">
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#3f0d12]">Hostel Dues, Fines & Digital No-Dues Clearance</h1>
            <p className="text-xs text-[#9f1239] mt-0.5">Automated fee ledger, receipts, and 4-tier digital institutional clearance</p>
          </div>

          <div className="flex bg-rose-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('FEES')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'FEES' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              💳 Dues & Fines ({fees.length})
            </button>
            <button
              onClick={() => setActiveTab('NODUES')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'NODUES' ? 'bg-red-600 text-white shadow-sm' : 'text-[#7f1d1d]'
              }`}
            >
              🎓 Digital No-Dues
            </button>
          </div>
        </div>

        {/* TAB 1: FEES & FINES */}
        {activeTab === 'FEES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Staff Issue Fine Panel */}
            {isStaff && (
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-[#3f0d12]">Issue Disciplinary Fine or Charge</h2>
                <form onSubmit={handleIssueFine} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Target Student</label>
                    <select
                      value={fineForm.studentId}
                      onChange={e => setFineForm({ ...fineForm, studentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                    >
                      <option value="65a000000000000000000004">Priya Singh (CS2021002 - Room B-101)</option>
                      <option value="65a000000000000000000001">Rahul Sharma (CS2021001 - Room A-204)</option>
                      <option value="65a000000000000000000007">Aarav Patel (EC2022015 - Room A-108)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Charge Title</label>
                    <input
                      type="text"
                      value={fineForm.title}
                      onChange={e => setFineForm({ ...fineForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#7f1d1d] mb-1">Type</label>
                      <select
                        value={fineForm.type}
                        onChange={e => setFineForm({ ...fineForm, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-[#fffdfd]"
                      >
                        <option value="FINE">DISCIPLINARY FINE</option>
                        <option value="RENT">ROOM RENT</option>
                        <option value="MESS">MESS DUES</option>
                        <option value="UTILITY">ELECTRICITY/UTILITY</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#7f1d1d] mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={fineForm.amount}
                        onChange={e => setFineForm({ ...fineForm, amount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-rose-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#7f1d1d] mb-1">Remarks</label>
                    <textarea
                      value={fineForm.remarks}
                      onChange={e => setFineForm({ ...fineForm, remarks: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-rose-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md text-xs"
                  >
                    Issue Fine & Notify Student/Parent
                  </button>
                </form>
              </div>
            )}

            {/* Fees Table */}
            <div className={`${isStaff ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4`}>
              <h2 className="text-sm font-bold text-[#3f0d12]">
                {isStaff ? 'All Hostel Fee Records & Penalties' : 'My Fee Ledger & Receipts'}
              </h2>

              {fees.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">No fee records found.</div>
              ) : (
                <div className="divide-y divide-rose-100">
                  {fees.map(f => (
                    <div key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#3f0d12]">{f.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.type === 'FINE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {f.type}
                          </span>
                        </div>
                        <div className="text-stone-500 text-[11px] mt-0.5">
                          {isStaff && <span>Student: <strong>{f.studentName} ({f.rollNumber})</strong> • </span>}
                          Due Date: {f.dueDate} {f.remarks && `• ${f.remarks}`}
                        </div>
                        {f.receiptNumber && (
                          <div className="text-emerald-700 font-mono text-[10px] mt-0.5">
                            Receipt: {f.receiptNumber} (Paid on {new Date(f.paidAt).toLocaleDateString()})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="font-bold text-base text-[#3f0d12]">₹{f.amount}</span>
                        {f.status === 'PAID' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                            ✅ PAID
                          </span>
                        ) : (
                          <button
                            onClick={() => setPayingFee(f)}
                            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            💳 Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL NO-DUES CLEARANCE */}
        {activeTab === 'NODUES' && (
          <div className="space-y-6">
            {!isStaff ? (
              /* Student View */
              <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm max-w-3xl mx-auto space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#3f0d12]">Institutional No-Dues Clearance Workflow</h2>
                  <p className="text-xs text-[#9f1239] mt-0.5">
                    End-of-term digital clearance across Warden, Mess, Maintenance, and Accounts.
                  </p>
                </div>

                {!noDues ? (
                  <div className="p-8 text-center bg-rose-50/50 rounded-xl border border-rose-200 space-y-4">
                    <div className="text-4xl">📜</div>
                    <h3 className="font-bold text-sm text-[#3f0d12]">Ready to Apply for Clearance</h3>
                    <p className="text-xs text-stone-600 max-w-md mx-auto">
                      Initiate digital clearance. Each department will review your records and digitally sign off.
                    </p>
                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        value={clearanceReason}
                        onChange={e => setClearanceReason(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 mb-3"
                      />
                      <button
                        onClick={handleApplyNoDues}
                        disabled={applyingClearance}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-200"
                      >
                        {applyingClearance ? 'Submitting...' : 'Initiate No-Dues Application'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between pb-4 border-b border-rose-100">
                      <div>
                        <div className="text-xs text-stone-500">Application Status</div>
                        <div className={`font-black text-lg ${noDues.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {noDues.status === 'APPROVED' ? '🎉 ALL DEPARTMENTS CLEARED' : '⏳ IN PROGRESS (AWAITING SIGN-OFFS)'}
                        </div>
                      </div>
                      {noDues.certificateId && (
                        <div className="text-right">
                          <div className="text-xs text-stone-500">Certificate ID</div>
                          <div className="font-mono font-bold text-red-600">{noDues.certificateId}</div>
                        </div>
                      )}
                    </div>

                    {/* 4 Department Tracker Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* 1. Warden */}
                      <div className={`p-4 rounded-xl border ${noDues.wardenCleared ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>🏛️ Warden Office</span>
                          <span>{noDues.wardenCleared ? '✅ CLEARED' : '⏳ PENDING'}</span>
                        </div>
                        <div className="text-stone-600">{noDues.wardenRemarks || 'Verifying key return & student conduct'}</div>
                      </div>

                      {/* 2. Mess */}
                      <div className={`p-4 rounded-xl border ${noDues.messCleared ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>🍲 Mess Department</span>
                          <span>{noDues.messCleared ? '✅ CLEARED' : '⏳ PENDING'}</span>
                        </div>
                        <div className="text-stone-600">{noDues.messRemarks || 'Checking food advance & rebate balance'}</div>
                      </div>

                      {/* 3. Maintenance */}
                      <div className={`p-4 rounded-xl border ${noDues.maintenanceCleared ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>🛠️ Hostel Care & Assets</span>
                          <span>{noDues.maintenanceCleared ? '✅ CLEARED' : '⏳ PENDING'}</span>
                        </div>
                        <div className="text-stone-600">{noDues.maintenanceRemarks || 'Checking furniture and room fixtures'}</div>
                      </div>

                      {/* 4. Accounts */}
                      <div className={`p-4 rounded-xl border ${noDues.accountsCleared ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>💳 Accounts & Finance</span>
                          <span>{noDues.accountsCleared ? '✅ CLEARED' : '⏳ PENDING'}</span>
                        </div>
                        <div className="text-stone-600">{noDues.accountsRemarks || 'Verifying fee ledger & deposit settlement'}</div>
                      </div>
                    </div>

                    {/* Certificate Preview if Approved */}
                    {noDues.status === 'APPROVED' && (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border-2 border-amber-300 text-center space-y-3">
                        <div className="text-xs uppercase tracking-widest text-amber-900 font-bold">HostelFlow Official Institutional Credential</div>
                        <h3 className="text-xl font-black text-[#3f0d12]">DIGITAL HOSTEL CLEARANCE CERTIFICATE</h3>
                        <p className="text-xs text-stone-700 max-w-md mx-auto">
                          This certifies that <strong>{noDues.studentName}</strong> (Roll: {noDues.rollNumber}) has settled all hostel dues, returned room keys for Room {noDues.roomNumber}, and holds zero liabilities.
                        </p>
                        <div className="font-mono text-xs font-bold text-red-700">Verification Seal: {noDues.certificateId}</div>
                        <button
                          onClick={() => window.print()}
                          className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md shadow-red-200 hover:bg-red-700"
                        >
                          🖨️ Print / Save Official Certificate
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Staff View: Sign off pending applications */
              <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-[#3f0d12]">Pending Student No-Dues Applications</h2>
                {allNoDues.length === 0 ? (
                  <div className="text-center py-12 text-xs text-stone-500">No clearance requests pending.</div>
                ) : (
                  <div className="divide-y divide-rose-100">
                    {allNoDues.map(nd => (
                      <div key={nd.id} className="py-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-[#3f0d12]">{nd.studentName}</span>
                            <span className="text-stone-500 ml-2">({nd.rollNumber} • Room {nd.roomNumber})</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                            nd.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {nd.status}
                          </span>
                        </div>

                        {/* Sign-off Actions */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            onClick={() => handleSignoff(nd.id, 'WARDEN', !nd.wardenCleared)}
                            className={`p-2 rounded-lg font-bold border ${
                              nd.wardenCleared ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-red-700 border-rose-200'
                            }`}
                          >
                            Warden: {nd.wardenCleared ? '✅ Signed' : 'Sign Off'}
                          </button>
                          <button
                            onClick={() => handleSignoff(nd.id, 'MESS', !nd.messCleared)}
                            className={`p-2 rounded-lg font-bold border ${
                              nd.messCleared ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-red-700 border-rose-200'
                            }`}
                          >
                            Mess: {nd.messCleared ? '✅ Signed' : 'Sign Off'}
                          </button>
                          <button
                            onClick={() => handleSignoff(nd.id, 'MAINTENANCE', !nd.maintenanceCleared)}
                            className={`p-2 rounded-lg font-bold border ${
                              nd.maintenanceCleared ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-red-700 border-rose-200'
                            }`}
                          >
                            Maintenance: {nd.maintenanceCleared ? '✅ Signed' : 'Sign Off'}
                          </button>
                          <button
                            onClick={() => handleSignoff(nd.id, 'ACCOUNTS', !nd.accountsCleared)}
                            className={`p-2 rounded-lg font-bold border ${
                              nd.accountsCleared ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-red-700 border-rose-200'
                            }`}
                          >
                            Accounts: {nd.accountsCleared ? '✅ Signed' : 'Sign Off'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payment Modal */}
        {payingFee && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-rose-200">
              <h3 className="font-bold text-base text-[#3f0d12]">Simulated Fee Checkout</h3>
              <div className="p-3 bg-rose-50 rounded-xl text-xs space-y-1">
                <div>Item: <strong>{payingFee.title}</strong></div>
                <div className="text-base font-black text-red-600">Total: ₹{payingFee.amount}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7f1d1d] mb-1">UPI / Transaction Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. UPI-9847291049"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePayFee}
                  disabled={paying}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {paying ? 'Processing...' : 'Confirm Payment'}
                </button>
                <button
                  onClick={() => setPayingFee(null)}
                  className="px-4 py-2.5 bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
