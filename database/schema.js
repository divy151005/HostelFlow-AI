// HostelFlow AI — MongoDB Schema Reference
// ==========================================

// ── Collection: users ──────────────────────────────────────────────────────
{
  _id: ObjectId,
  fullName: String,
  email: String,          // unique index
  password: String,       // bcrypt hashed
  phone: String,
  role: "STUDENT" | "WARDEN" | "PARENT" | "ADMIN",

  // STUDENT-specific
  rollNumber: String,     // index
  roomNumber: String,
  hostelBlock: String,
  course: String,
  year: String,
  parentEmail: String,
  lateReturnCount: Number,  // auto-incremented by system
  riskLevel: "LOW" | "MEDIUM" | "HIGH",  // AI-assessed

  // WARDEN-specific
  wardenId: String,
  assignedBlock: String,

  // PARENT-specific
  linkedStudentId: ObjectId,  // ref: users

  // System fields
  enabled: Boolean,
  accountNonLocked: Boolean,
  fcmToken: String,       // for push notifications
  createdAt: ISODate,
  updatedAt: ISODate
}

// ── Collection: leave_requests ─────────────────────────────────────────────
{
  _id: ObjectId,

  // Student info (denormalized for fast reads)
  studentId: ObjectId,    // ref: users, index
  studentName: String,
  rollNumber: String,
  roomNumber: String,

  // Leave details
  type: "LEAVE" | "OUTING" | "EMERGENCY",
  reason: String,
  destination: String,

  // Dates
  fromDate: ISODate,
  toDate: ISODate,
  expectedReturn: ISODate,
  actualReturn: ISODate,

  // Status flow
  // PENDING_WARDEN → PENDING_PARENT (for LEAVE) → APPROVED
  // PENDING_WARDEN → APPROVED (for OUTING)
  // Any state → REJECTED / CANCELLED
  // APPROVED + late scan → LATE
  // APPROVED + on-time scan → COMPLETED
  status: "PENDING_WARDEN" | "PENDING_PARENT" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "LATE",

  // Approvals
  wardenApproved: Boolean,
  wardenRemark: String,
  parentApproved: Boolean,
  parentRemark: String,
  approvedBy: ObjectId,   // ref: users (warden)

  // QR Gate
  qrToken: String,        // unique, index
  qrCode: String,         // base64 PNG data URL
  qrScannedOut: Boolean,
  qrScannedIn: Boolean,
  scannedOutAt: ISODate,
  scannedInAt: ISODate,

  // Late tracking
  isLate: Boolean,
  lateByMinutes: Number,
  escalated: Boolean,     // true when auto-escalation has fired

  createdAt: ISODate,
  updatedAt: ISODate
}

// ── Collection: notifications ──────────────────────────────────────────────
{
  _id: ObjectId,
  userId: ObjectId,       // ref: users, index
  title: String,
  message: String,
  type: "LEAVE_SUBMITTED" | "LEAVE_APPROVED" | "LEAVE_REJECTED" | "LATE_RETURN" | "HIGH_RISK_ALERT" | "QR_SCANNED" | "ESCALATION" | "PARENT_APPROVAL_NEEDED",
  referenceId: ObjectId,  // ref: leave_requests
  read: Boolean,
  createdAt: ISODate      // index DESC
}

// ── Indexes ────────────────────────────────────────────────────────────────
// users:          email (unique), rollNumber
// leave_requests: studentId, status, qrToken (unique), createdAt
// notifications:  userId, createdAt (desc), userId+read

// ── Status Flow Diagram ────────────────────────────────────────────────────
//
//  [Student applies]
//        │
//        ▼
//  PENDING_WARDEN
//        │
//    ┌───┴───────────────┐
//    │ APPROVE            │ REJECT
//    ▼                    ▼
//  (LEAVE type?)        REJECTED
//    │
//  ┌─┴──────────────────┐
//  │ YES (needs parent)  │ NO (outing/emergency)
//  ▼                     ▼
//  PENDING_PARENT        APPROVED ──► QR generated
//    │
//  ┌─┴────────┐
//  │ YES       │ NO
//  ▼           ▼
//  APPROVED   REJECTED
//    │
//  [QR Scan OUT]
//    │
//  [QR Scan IN]
//    │
//  ┌─┴──────────────────┐
//  │ On time             │ Late
//  ▼                     ▼
//  COMPLETED            LATE
//                         │
//                    [lateReturnCount++]
//                    [Risk reassessed by AI]
//                    [Escalation to warden + parent]
