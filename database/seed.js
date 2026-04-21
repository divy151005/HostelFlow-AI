// HostelFlow AI — MongoDB Seed Data
// Run: mongosh hostelflow < seed.js

db = db.getSiblingDB('hostelflow');

// ── Users ──
db.users.drop();
db.users.insertMany([
  {
    _id: ObjectId("65a000000000000000000001"),
    fullName: "Rahul Sharma",
    email: "student@hostelflow.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    phone: "9876543210",
    role: "STUDENT",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    hostelBlock: "A",
    course: "B.Tech CSE",
    year: "3rd",
    parentEmail: "parent@hostelflow.com",
    lateReturnCount: 1,
    riskLevel: "LOW",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId("65a000000000000000000002"),
    fullName: "Dr. Suresh Kumar",
    email: "warden@hostelflow.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876500001",
    role: "WARDEN",
    wardenId: "W001",
    assignedBlock: "A",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId("65a000000000000000000003"),
    fullName: "Ramesh Sharma",
    email: "parent@hostelflow.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876500002",
    role: "PARENT",
    linkedStudentId: "65a000000000000000000001",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId("65a000000000000000000004"),
    fullName: "Priya Singh",
    email: "student2@hostelflow.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    phone: "9876543211",
    role: "STUDENT",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    hostelBlock: "B",
    course: "B.Tech CSE",
    year: "3rd",
    lateReturnCount: 4,
    riskLevel: "HIGH",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date()
  }
]);

// ── Leave Requests ──
db.leave_requests.drop();
db.leave_requests.insertMany([
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    type: "OUTING",
    reason: "Medical checkup",
    destination: "City Hospital",
    fromDate: new Date(),
    toDate: new Date(Date.now() + 3*60*60*1000),
    expectedReturn: new Date(Date.now() + 4*60*60*1000),
    status: "PENDING_WARDEN",
    wardenApproved: false,
    parentApproved: false,
    qrToken: "SAMPLE_QR_TOKEN_001",
    qrScannedOut: false,
    qrScannedIn: false,
    isLate: false,
    escalated: false,
    createdAt: new Date()
  },
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    type: "LEAVE",
    reason: "Home visit for festival",
    destination: "Jaipur",
    fromDate: new Date(Date.now() - 7*24*60*60*1000),
    toDate: new Date(Date.now() - 5*24*60*60*1000),
    expectedReturn: new Date(Date.now() - 5*24*60*60*1000),
    actualReturn: new Date(Date.now() - 5*24*60*60*1000 + 90*60*1000),
    status: "LATE",
    wardenApproved: true,
    parentApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    isLate: true,
    lateByMinutes: 90,
    escalated: true,
    createdAt: new Date(Date.now() - 8*24*60*60*1000)
  }
]);

// ── Indexes ──
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ rollNumber: 1 });
db.leave_requests.createIndex({ studentId: 1 });
db.leave_requests.createIndex({ status: 1 });
db.leave_requests.createIndex({ qrToken: 1 });
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ createdAt: -1 });

print("✅ HostelFlow seed data loaded successfully!");
print("📧 Test accounts: student@hostelflow.com | warden@hostelflow.com | parent@hostelflow.com");
print("🔑 Password for all: password");
