import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

export default function HolographicPass3D({ leave, student }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Max 18 deg tilt
    const rX = ((y - centerY) / centerY) * -16
    const rY = ((x - centerX) / centerX) * 16

    setRotateX(rX)
    setRotateY(rY)
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    })
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  const qrValue = leave?.qrToken || `HF-PASS-${leave?.id || 'DEMO'}`

  return (
    <div className="flex flex-col items-center select-none py-6 perspective-1000">
      {/* 3D Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${isFlipped ? rotateY + 180 : rotateY}deg)`,
          transition: 'transform 0.15s ease-out'
        }}
        className="relative w-80 sm:w-96 h-[480px] rounded-3xl cursor-pointer transform-3d shadow-[0_25px_60px_rgba(220,38,38,0.22)]"
      >
        {/* FRONT OF 3D CARD */}
        <div className={`absolute inset-0 rounded-3xl p-6 bg-gradient-to-br from-white via-rose-50/70 to-red-50 border-2 border-rose-300 backface-hidden overflow-hidden flex flex-col justify-between ${isFlipped ? 'pointer-events-none' : ''}`}>
          {/* Dynamic Holographic Foil Glare */}
          <div
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.85) 0%, rgba(255,182,193,0.3) 30%, transparent 60%)`
            }}
            className="absolute inset-0 pointer-events-none mix-blend-overlay z-20"
          />

          {/* Header (Floating in 3D Layer) */}
          <div style={{ transform: 'translateZ(35px)' }} className="flex items-center justify-between pb-3 border-b border-rose-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-200">
                HF
              </div>
              <div>
                <div className="font-black text-sm text-[#3f0d12] tracking-tight">HostelFlow <span className="text-red-600">3D Pass</span></div>
                <div className="text-[10px] text-[#9f1239] font-medium tracking-wider uppercase">Gate Authorization</div>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black border border-red-200">
              {leave?.status || 'APPROVED'}
            </span>
          </div>

          {/* QR Code Section (High 3D Elevation) */}
          <div style={{ transform: 'translateZ(50px)' }} className="flex flex-col items-center my-auto py-2">
            <div className="p-3.5 bg-white rounded-2xl shadow-xl border-2 border-rose-200 relative group">
              <QRCodeSVG
                value={qrValue}
                size={160}
                level="H"
                fgColor="#3f0d12"
                bgColor="#ffffff"
              />
              <div className="absolute inset-0 border-2 border-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-pulse" />
            </div>
            <div className="mt-2 font-mono text-[11px] font-bold tracking-widest text-[#9f1239]">
              {leave?.qrToken || 'QR_TOKEN_AUTH_ACTIVE'}
            </div>
          </div>

          {/* Student Info (3D Layer) */}
          <div style={{ transform: 'translateZ(30px)' }} className="space-y-1.5 pt-2 border-t border-rose-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#3f0d12]">{student?.fullName || 'Rahul Sharma'}</span>
              <span className="font-semibold text-red-700">{student?.rollNumber || 'CS2021001'}</span>
            </div>
            <div className="text-[11px] text-[#9f1239] flex items-center justify-between">
              <span>Room {student?.roomNumber || 'A-204'} (Block {student?.hostelBlock || 'A'})</span>
              <span className="font-bold">{leave?.outingKind || leave?.type || 'LOCAL_OUTING'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] bg-white/70 p-2 rounded-xl border border-rose-100 mt-1">
              <span className="text-stone-500">Expected Curfew:</span>
              <span className="font-bold text-red-600">
                {leave?.expectedReturn ? new Date(leave.expectedReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:30 PM'}
              </span>
            </div>
          </div>
        </div>

        {/* BACK OF 3D CARD */}
        <div
          style={{ transform: 'rotateY(180deg)' }}
          className={`absolute inset-0 rounded-3xl p-6 bg-gradient-to-br from-stone-900 to-rose-950 text-white border-2 border-rose-500/40 backface-hidden overflow-hidden flex flex-col justify-between ${!isFlipped ? 'pointer-events-none' : ''}`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-900/50">
              <span className="font-black text-sm tracking-widest uppercase text-rose-400">Security Regulations</span>
              <span className="text-xs">🔒 256-bit Token</span>
            </div>

            <div className="text-[11px] space-y-2 text-rose-100/80 leading-relaxed">
              <p>1. Present this digital 3D pass at the campus gate scanner for both exit and return.</p>
              <p>2. Returns beyond the authorized expected curfew time trigger an automated Overdue Alert to the Chief Warden and Guardian.</p>
              <p>3. This pass is strictly non-transferable and tied to Roll No {student?.rollNumber || 'CS2021001'}.</p>
            </div>
          </div>

          <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-rose-900/40 text-xs">
            <div className="text-[10px] uppercase font-bold text-rose-400">Emergency Contacts</div>
            <div className="flex justify-between text-[11px]">
              <span>Warden Office:</span>
              <strong>+91 98765 00001</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Campus Security:</span>
              <strong>Ext. 108 / 100</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Flip Card Toggle Button */}
      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="mt-4 px-5 py-2 bg-white hover:bg-rose-50 text-[#7f1d1d] font-bold rounded-xl text-xs border border-rose-200 shadow-sm transition-all flex items-center gap-2"
      >
        <span>🔄</span> {isFlipped ? 'View Pass Front (QR Code)' : 'Flip to Security Details (3D Back)'}
      </button>
    </div>
  )
}
