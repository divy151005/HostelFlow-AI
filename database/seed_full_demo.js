// HostelFlow AI — 15+ Comprehensive Fake Demo Dataset
// Run: mongosh hostelflow < database/seed_full_demo.js

db = db.getSiblingDB('hostelflow');

const BCRYPT_PASSWORD = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"; // "password"
const now = new Date();

print("🚀 Cleaning and seeding HostelFlow AI with 15+ realistic demo records...");

// ── 1. USERS (15 Diverse Accounts) ──
db.users.drop();
const usersData = [
  // Core Primary Demo Accounts
  {
    _id: ObjectId("65a000000000000000000001"),
    fullName: "Rahul Sharma",
    email: "student@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543210",
    role: "STUDENT",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    hostelBlock: "A",
    course: "B.Tech Computer Science",
    year: "3rd",
    parentEmail: "parent@hostelflow.com",
    parentPhone: "9876500002",
    mentorEmail: "mentor@hostelflow.com",
    lateReturnCount: 1,
    riskLevel: "LOW",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 60*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000002"),
    fullName: "Dr. Suresh Kumar",
    email: "warden@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876500001",
    role: "WARDEN",
    wardenId: "W001",
    assignedBlock: "A",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 120*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000003"),
    fullName: "Ramesh Sharma",
    email: "parent@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876500002",
    role: "PARENT",
    linkedStudentId: "65a000000000000000000001",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 60*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000004"),
    fullName: "Priya Singh",
    email: "student2@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543211",
    role: "STUDENT",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    hostelBlock: "B",
    course: "B.Tech Computer Science",
    year: "3rd",
    parentEmail: "parent2@hostelflow.com",
    parentPhone: "9876500012",
    mentorEmail: "mentor@hostelflow.com",
    lateReturnCount: 4,
    riskLevel: "HIGH",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 60*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000005"),
    fullName: "Prof. Anita Verma",
    email: "mentor@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876500003",
    role: "MENTOR",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 100*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000006"),
    fullName: "Hostel Administrator",
    email: "admin@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876500004",
    role: "ADMIN",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 150*24*60*60*1000)
  },

  // Additional Realistic Students
  {
    _id: ObjectId("65a000000000000000000007"),
    fullName: "Aarav Patel",
    email: "aarav.patel@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543212",
    role: "STUDENT",
    rollNumber: "EC2022015",
    roomNumber: "A-108",
    hostelBlock: "A",
    course: "B.Tech Electronics & Comm.",
    year: "2nd",
    parentEmail: "parent3@hostelflow.com",
    mentorEmail: "mentor@hostelflow.com",
    lateReturnCount: 0,
    riskLevel: "LOW",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 40*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000008"),
    fullName: "Sneha Reddy",
    email: "sneha.reddy@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543213",
    role: "STUDENT",
    rollNumber: "IT2021045",
    roomNumber: "C-302",
    hostelBlock: "C",
    course: "B.Tech Information Tech",
    year: "4th",
    parentEmail: "parent4@hostelflow.com",
    mentorEmail: "mentor@hostelflow.com",
    lateReturnCount: 3,
    riskLevel: "MEDIUM",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 50*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000009"),
    fullName: "Vikram Malhotra",
    email: "vikram.m@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543214",
    role: "STUDENT",
    rollNumber: "ME2023020",
    roomNumber: "B-210",
    hostelBlock: "B",
    course: "B.Tech Mechanical Eng",
    year: "1st",
    parentEmail: "parent5@hostelflow.com",
    mentorEmail: "mentor2@hostelflow.com",
    lateReturnCount: 2,
    riskLevel: "LOW",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 30*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000010"),
    fullName: "Ananya Iyer",
    email: "ananya.iyer@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543215",
    role: "STUDENT",
    rollNumber: "CS2022033",
    roomNumber: "C-104",
    hostelBlock: "C",
    course: "B.Tech Computer Science",
    year: "2nd",
    parentEmail: "parent6@hostelflow.com",
    mentorEmail: "mentor2@hostelflow.com",
    lateReturnCount: 5,
    riskLevel: "HIGH",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 45*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000011"),
    fullName: "Rohan Deshmukh",
    email: "rohan.d@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543216",
    role: "STUDENT",
    rollNumber: "CE2021012",
    roomNumber: "A-305",
    hostelBlock: "A",
    course: "B.Tech Civil Engineering",
    year: "3rd",
    parentEmail: "parent7@hostelflow.com",
    mentorEmail: "mentor@hostelflow.com",
    lateReturnCount: 1,
    riskLevel: "LOW",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 55*24*60*60*1000)
  },
  {
    _id: ObjectId("65a000000000000000000012"),
    fullName: "Meera Nair",
    email: "meera.nair@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876543217",
    role: "STUDENT",
    rollNumber: "EC2023008",
    roomNumber: "B-105",
    hostelBlock: "B",
    course: "B.Tech Electronics & Comm.",
    year: "1st",
    parentEmail: "parent8@hostelflow.com",
    mentorEmail: "mentor@hostelflow.com",
    lateReturnCount: 0,
    riskLevel: "LOW",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 25*24*60*60*1000)
  },

  // Additional Faculty Mentor
  {
    _id: ObjectId("65a000000000000000000013"),
    fullName: "Dr. Rajesh Iyer",
    email: "mentor2@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876500005",
    role: "MENTOR",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 90*24*60*60*1000)
  },

  // Additional Parent (linked to Priya Singh)
  {
    _id: ObjectId("65a000000000000000000014"),
    fullName: "Vikram Singh",
    email: "parent2@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876500012",
    role: "PARENT",
    linkedStudentId: "65a000000000000000000004",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 60*24*60*60*1000)
  },

  // Second Warden (Block B & C)
  {
    _id: ObjectId("65a000000000000000000015"),
    fullName: "Mrs. Sunita Rao",
    email: "warden2@hostelflow.com",
    password: BCRYPT_PASSWORD,
    phone: "9876500006",
    role: "WARDEN",
    wardenId: "W002",
    assignedBlock: "B",
    enabled: true,
    accountNonLocked: true,
    createdAt: new Date(now.getTime() - 80*24*60*60*1000)
  }
];
db.users.insertMany(usersData);
print("✅ Inserted " + usersData.length + " users.");

// ── 2. LEAVE REQUESTS & GATE PASS ACTIVITY (15 Diverse Scenarios) ──
db.leave_requests.drop();
const leaveData = [
  // 1. Rahul Sharma - Currently OUTSIDE (Approved, Scanned Out, On Time)
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Bookstore and project supplies purchase",
    destination: "Crossword Bookstore, Sector 18",
    fromDate: new Date(now.getTime() - 2*60*60*1000),
    toDate: new Date(now.getTime() + 3*60*60*1000),
    expectedReturn: new Date(now.getTime() + 2*60*60*1000),
    status: "APPROVED",
    wardenApproved: true,
    mentorApproved: true,
    parentApproved: true,
    qrToken: "QR_TOKEN_RAHUL_OUT_01",
    qrScannedOut: true,
    qrScannedIn: false,
    scannedOutAt: new Date(now.getTime() - 2*60*60*1000),
    isLate: false,
    escalated: false,
    createdAt: new Date(now.getTime() - 5*60*60*1000)
  },

  // 2. Priya Singh - OVERDUE STUDENT (Scanned out, expected return was 75 minutes ago!)
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Dental checkup at Metro Hospital",
    destination: "City Dental Clinic",
    fromDate: new Date(now.getTime() - 4*60*60*1000),
    toDate: new Date(now.getTime() - 75*60*1000),
    expectedReturn: new Date(now.getTime() - 75*60*1000), // Overdue by 75 mins!
    status: "LATE",
    wardenApproved: true,
    mentorApproved: true,
    parentApproved: true,
    qrToken: "QR_TOKEN_PRIYA_OVERDUE_02",
    qrScannedOut: true,
    qrScannedIn: false,
    scannedOutAt: new Date(now.getTime() - 4*60*60*1000),
    isLate: true,
    lateByMinutes: 75,
    escalated: true,
    createdAt: new Date(now.getTime() - 6*60*60*1000)
  },

  // 3. Sneha Reddy - OVERDUE STUDENT 2 (Scanned out, expected return 45 mins ago)
  {
    studentId: "65a000000000000000000008",
    studentName: "Sneha Reddy",
    rollNumber: "IT2021045",
    roomNumber: "C-302",
    type: "OUTING",
    outingKind: "WORKING_HOURS",
    reason: "Off-campus placement interview round 2",
    destination: "Tech Mahindra Office Park",
    fromDate: new Date(now.getTime() - 5*60*60*1000),
    toDate: new Date(now.getTime() - 45*60*1000),
    expectedReturn: new Date(now.getTime() - 45*60*1000), // Overdue by 45 mins!
    status: "LATE",
    wardenApproved: true,
    mentorApproved: true,
    parentApproved: true,
    qrToken: "QR_TOKEN_SNEHA_OVERDUE_03",
    qrScannedOut: true,
    qrScannedIn: false,
    scannedOutAt: new Date(now.getTime() - 5*60*60*1000),
    isLate: true,
    lateByMinutes: 45,
    escalated: true,
    createdAt: new Date(now.getTime() - 8*60*60*1000)
  },

  // 4. Aarav Patel - Pending Mentor Approval
  {
    studentId: "65a000000000000000000007",
    studentName: "Aarav Patel",
    rollNumber: "EC2022015",
    roomNumber: "A-108",
    type: "OUTING",
    outingKind: "RUNNING_COLLEGE",
    reason: "Robotics club competition workshop",
    destination: "IIT Delhi Campus",
    fromDate: new Date(now.getTime() + 24*60*60*1000),
    toDate: new Date(now.getTime() + 32*60*60*1000),
    expectedReturn: new Date(now.getTime() + 32*60*60*1000),
    status: "PENDING_MENTOR",
    parentApprovalRequired: true,
    createdAt: new Date(now.getTime() - 1*60*60*1000)
  },

  // 5. Rohan Deshmukh - Pending Parent Approval (Multi-day Leave)
  {
    studentId: "65a000000000000000000011",
    studentName: "Rohan Deshmukh",
    rollNumber: "CE2021012",
    roomNumber: "A-305",
    type: "LEAVE",
    outingKind: "HOME_VISIT",
    reason: "Sister's engagement ceremony",
    destination: "Pune, Maharashtra",
    fromDate: new Date(now.getTime() + 48*60*60*1000),
    toDate: new Date(now.getTime() + 120*60*60*1000),
    expectedReturn: new Date(now.getTime() + 120*60*60*1000),
    status: "PENDING_PARENT",
    wardenApproved: true,
    mentorApproved: true,
    parentApproved: false,
    parentApprovalRequired: true,
    createdAt: new Date(now.getTime() - 3*60*60*1000)
  },

  // 6. Meera Nair - Pending Warden Approval
  {
    studentId: "65a000000000000000000012",
    studentName: "Meera Nair",
    rollNumber: "EC2023008",
    roomNumber: "B-105",
    type: "LEAVE",
    outingKind: "HOME_VISIT",
    reason: "Family festival holiday",
    destination: "Cochin, Kerala",
    fromDate: new Date(now.getTime() + 72*60*60*1000),
    toDate: new Date(now.getTime() + 144*60*60*1000),
    expectedReturn: new Date(now.getTime() + 144*60*60*1000),
    status: "PENDING_WARDEN",
    parentApprovalRequired: true,
    createdAt: new Date(now.getTime() - 4*60*60*1000)
  },

  // 7. Vikram Malhotra - Outing Approved & Inside Hostel (Ready for Gate Pass Scan)
  {
    studentId: "65a000000000000000000009",
    studentName: "Vikram Malhotra",
    rollNumber: "ME2023020",
    roomNumber: "B-210",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Grocery and stationery shopping",
    destination: "Central Mall",
    fromDate: new Date(now.getTime() + 1*60*60*1000),
    toDate: new Date(now.getTime() + 5*60*60*1000),
    expectedReturn: new Date(now.getTime() + 5*60*60*1000),
    status: "APPROVED",
    wardenApproved: true,
    mentorApproved: true,
    qrToken: "QR_TOKEN_VIKRAM_APPROVED_07",
    qrScannedOut: false,
    qrScannedIn: false,
    createdAt: new Date(now.getTime() - 2*60*60*1000)
  },

  // 8. Rahul Sharma - Completed Leave (Historical 5 days ago, On Time)
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Coding Hackathon event at Delhi University",
    destination: "North Campus, DU",
    fromDate: new Date(now.getTime() - 5*24*60*60*1000),
    toDate: new Date(now.getTime() - 5*24*60*60*1000 + 8*60*60*1000),
    expectedReturn: new Date(now.getTime() - 5*24*60*60*1000 + 8*60*60*1000),
    actualReturn: new Date(now.getTime() - 5*24*60*60*1000 + 7*60*60*1000 + 45*60*1000),
    status: "COMPLETED",
    wardenApproved: true,
    mentorApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    scannedOutAt: new Date(now.getTime() - 5*24*60*60*1000),
    scannedInAt: new Date(now.getTime() - 5*24*60*60*1000 + 7*60*60*1000 + 45*60*1000),
    isLate: false,
    createdAt: new Date(now.getTime() - 6*24*60*60*1000)
  },

  // 9. Rahul Sharma - Completed Multi-day Leave (Historical 12 days ago, Delayed by 90m)
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    type: "LEAVE",
    outingKind: "HOME_VISIT",
    reason: "Diwali Family Visit",
    destination: "Jaipur, Rajasthan",
    fromDate: new Date(now.getTime() - 14*24*60*60*1000),
    toDate: new Date(now.getTime() - 10*24*60*60*1000),
    expectedReturn: new Date(now.getTime() - 10*24*60*60*1000 + 18*60*60*1000),
    actualReturn: new Date(now.getTime() - 10*24*60*60*1000 + 19*60*60*1000 + 30*60*1000),
    status: "COMPLETED",
    wardenApproved: true,
    mentorApproved: true,
    parentApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    scannedOutAt: new Date(now.getTime() - 14*24*60*60*1000),
    scannedInAt: new Date(now.getTime() - 10*24*60*60*1000 + 19*60*60*1000 + 30*60*1000),
    isLate: true,
    lateByMinutes: 90,
    escalated: true,
    createdAt: new Date(now.getTime() - 15*24*60*60*1000)
  },

  // 10. Priya Singh - Completed Leave (Historical, Late by 110m)
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Evening coaching classes",
    destination: "Kalu Sarai Coaching Centre",
    fromDate: new Date(now.getTime() - 8*24*60*60*1000),
    toDate: new Date(now.getTime() - 8*24*60*60*1000 + 4*60*60*1000),
    expectedReturn: new Date(now.getTime() - 8*24*60*60*1000 + 4*60*60*1000),
    actualReturn: new Date(now.getTime() - 8*24*60*60*1000 + 5*60*60*1000 + 50*60*1000),
    status: "COMPLETED",
    wardenApproved: true,
    mentorApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    scannedOutAt: new Date(now.getTime() - 8*24*60*60*1000),
    scannedInAt: new Date(now.getTime() - 8*24*60*60*1000 + 5*60*60*1000 + 50*60*1000),
    isLate: true,
    lateByMinutes: 110,
    escalated: true,
    createdAt: new Date(now.getTime() - 9*24*60*60*1000)
  },

  // 11. Priya Singh - Completed Leave (Historical, Late by 60m)
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Mall & dinner with school friends",
    destination: "DLF Mall of India",
    fromDate: new Date(now.getTime() - 16*24*60*60*1000),
    toDate: new Date(now.getTime() - 16*24*60*60*1000 + 5*60*60*1000),
    expectedReturn: new Date(now.getTime() - 16*24*60*60*1000 + 5*60*60*1000),
    actualReturn: new Date(now.getTime() - 16*24*60*60*1000 + 6*60*60*1000),
    status: "COMPLETED",
    wardenApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    scannedOutAt: new Date(now.getTime() - 16*24*60*60*1000),
    scannedInAt: new Date(now.getTime() - 16*24*60*60*1000 + 6*60*60*1000),
    isLate: true,
    lateByMinutes: 60,
    createdAt: new Date(now.getTime() - 17*24*60*60*1000)
  },

  // 12. Sneha Reddy - Completed Leave (Historical, On Time)
  {
    studentId: "65a000000000000000000008",
    studentName: "Sneha Reddy",
    rollNumber: "IT2021045",
    roomNumber: "C-302",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Eye specialist appointment",
    destination: "Dr. Shroff Eye Hospital",
    fromDate: new Date(now.getTime() - 3*24*60*60*1000),
    toDate: new Date(now.getTime() - 3*24*60*60*1000 + 4*60*60*1000),
    expectedReturn: new Date(now.getTime() - 3*24*60*60*1000 + 4*60*60*1000),
    actualReturn: new Date(now.getTime() - 3*24*60*60*1000 + 3*60*60*1000 + 30*60*1000),
    status: "COMPLETED",
    wardenApproved: true,
    mentorApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    scannedOutAt: new Date(now.getTime() - 3*24*60*60*1000),
    scannedInAt: new Date(now.getTime() - 3*24*60*60*1000 + 3*60*60*1000 + 30*60*1000),
    isLate: false,
    createdAt: new Date(now.getTime() - 4*24*60*60*1000)
  },

  // 13. Ananya Iyer - Rejected Leave (Reason: Previous late returns pending review)
  {
    studentId: "65a000000000000000000010",
    studentName: "Ananya Iyer",
    rollNumber: "CS2022033",
    roomNumber: "C-104",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Weekend movie outing",
    destination: "PVR Cinemas",
    fromDate: new Date(now.getTime() - 2*24*60*60*1000),
    toDate: new Date(now.getTime() - 2*24*60*60*1000 + 4*60*60*1000),
    expectedReturn: new Date(now.getTime() - 2*24*60*60*1000 + 4*60*60*1000),
    status: "REJECTED",
    wardenApproved: false,
    wardenRemark: "Outing restricted due to 5 previous late returns. Meet warden on Monday.",
    createdAt: new Date(now.getTime() - 3*24*60*60*1000)
  },

  // 14. Aarav Patel - Completed Leave (Historical, On Time)
  {
    studentId: "65a000000000000000000007",
    studentName: "Aarav Patel",
    rollNumber: "EC2022015",
    roomNumber: "A-108",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Blood donation drive at Red Cross",
    destination: "Red Cross Centre",
    fromDate: new Date(now.getTime() - 7*24*60*60*1000),
    toDate: new Date(now.getTime() - 7*24*60*60*1000 + 5*60*60*1000),
    expectedReturn: new Date(now.getTime() - 7*24*60*60*1000 + 5*60*60*1000),
    actualReturn: new Date(now.getTime() - 7*24*60*60*1000 + 4*60*60*1000 + 15*60*1000),
    status: "COMPLETED",
    wardenApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    scannedOutAt: new Date(now.getTime() - 7*24*60*60*1000),
    scannedInAt: new Date(now.getTime() - 7*24*60*60*1000 + 4*60*60*1000 + 15*60*1000),
    isLate: false,
    createdAt: new Date(now.getTime() - 8*24*60*60*1000)
  },

  // 15. Rohan Deshmukh - Completed Leave (Historical, On Time)
  {
    studentId: "65a000000000000000000011",
    studentName: "Rohan Deshmukh",
    rollNumber: "CE2021012",
    roomNumber: "A-305",
    type: "OUTING",
    outingKind: "LOCAL_OUTING",
    reason: "Bank account KYC update",
    destination: "SBI Main Branch",
    fromDate: new Date(now.getTime() - 4*24*60*60*1000),
    toDate: new Date(now.getTime() - 4*24*60*60*1000 + 3*60*60*1000),
    expectedReturn: new Date(now.getTime() - 4*24*60*60*1000 + 3*60*60*1000),
    actualReturn: new Date(now.getTime() - 4*24*60*60*1000 + 2*60*60*1000 + 40*60*1000),
    status: "COMPLETED",
    wardenApproved: true,
    qrScannedOut: true,
    qrScannedIn: true,
    scannedOutAt: new Date(now.getTime() - 4*24*60*60*1000),
    scannedInAt: new Date(now.getTime() - 4*24*60*60*1000 + 2*60*60*1000 + 40*60*1000),
    isLate: false,
    createdAt: new Date(now.getTime() - 5*24*60*60*1000)
  }
];
db.leave_requests.insertMany(leaveData);
print("✅ Inserted " + leaveData.length + " leave requests & gate records.");

// ── 3. HOSTEL COMPLAINTS (12 Realistic Grievances) ──
db.hostel_complaints.drop();
const complaintsData = [
  // 1. Rahul Sharma - Reopened Electricity Issue
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    hostelBlock: "A",
    category: "ELECTRICITY",
    priority: "HIGH",
    subject: "Room study lamp switch sparking",
    description: "Switchboard next to study table emits blue sparks and smells burnt when turned on.",
    status: "REOPENED",
    assignedStaffName: "Sharma Electrician",
    resolutionNotes: "Initial wiring fixed on Tuesday.",
    reopenedReason: "Sparking began again yesterday evening when plugging in laptop charger.",
    reopenedAt: new Date(now.getTime() - 6*60*60*1000),
    isFoodRelated: false,
    history: [
      { actorId: "65a000000000000000000001", actorName: "Rahul Sharma", action: "SUBMITTED", note: "Reported spark", at: new Date(now.getTime() - 72*60*60*1000) },
      { actorId: "65a000000000000000000002", actorName: "Dr. Suresh Kumar", action: "RESOLVED", note: "Replaced fuse", at: new Date(now.getTime() - 24*60*60*1000) },
      { actorId: "65a000000000000000000001", actorName: "Rahul Sharma", action: "REOPENED", note: "Sparking resumed", at: new Date(now.getTime() - 6*60*60*1000) }
    ],
    createdAt: new Date(now.getTime() - 72*60*60*1000),
    updatedAt: new Date(now.getTime() - 6*60*60*1000)
  },

  // 2. Priya Singh - Hygiene in Mess
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    hostelBlock: "B",
    category: "HYGIENE",
    priority: "URGENT",
    subject: "Dirty drinking water glasses at mess counter",
    description: "Water tumblers in Block B dining hall have grease and detergent residue on the rims.",
    status: "IN_PROGRESS",
    assignedStaffName: "Chef Anand & Mess Manager",
    isFoodRelated: true,
    history: [
      { actorId: "65a000000000000000000004", actorName: "Priya Singh", action: "SUBMITTED", note: "Reported greasy glasses", at: new Date(now.getTime() - 24*60*60*1000) },
      { actorId: "65a000000000000000000002", actorName: "Dr. Suresh Kumar", action: "IN_PROGRESS", note: "Kitchen audit instructed", at: new Date(now.getTime() - 12*60*60*1000) }
    ],
    createdAt: new Date(now.getTime() - 24*60*60*1000),
    updatedAt: new Date(now.getTime() - 12*60*60*1000)
  },

  // 3. Aarav Patel - Food Quality Complaint
  {
    studentId: "65a000000000000000000007",
    studentName: "Aarav Patel",
    rollNumber: "EC2022015",
    roomNumber: "A-108",
    hostelBlock: "A",
    category: "UNDERCOOKED_FOOD",
    priority: "NORMAL",
    subject: "Raw rotis served at dinner",
    description: "Chapatis served during dinner were doughy inside and uncooked.",
    status: "RESOLVED",
    assignedStaffName: "Chef Anand",
    resolutionNotes: "Tandoor temperature checked and staff instructed to double-check baking time.",
    verifiedBy: "Dr. Suresh Kumar",
    isFoodRelated: true,
    history: [
      { actorId: "65a000000000000000000007", actorName: "Aarav Patel", action: "SUBMITTED", note: "Raw rotis", at: new Date(now.getTime() - 48*60*60*1000) },
      { actorId: "65a000000000000000000002", actorName: "Dr. Suresh Kumar", action: "RESOLVED", note: "Tandoor fixed", at: new Date(now.getTime() - 18*60*60*1000) }
    ],
    createdAt: new Date(now.getTime() - 48*60*60*1000),
    updatedAt: new Date(now.getTime() - 18*60*60*1000)
  },

  // 4. Sneha Reddy - Water Supply & Geyser
  {
    studentId: "65a000000000000000000008",
    studentName: "Sneha Reddy",
    rollNumber: "IT2021045",
    roomNumber: "C-302",
    hostelBlock: "C",
    category: "WATER",
    priority: "HIGH",
    subject: "No hot water in 3rd floor washroom",
    description: "The 50L geyser on Block C 3rd floor is tripping the main MCB switch every morning.",
    status: "ASSIGNED",
    assignedStaffName: "Ramesh Plumber & Electrician",
    isFoodRelated: false,
    history: [
      { actorId: "65a000000000000000000008", actorName: "Sneha Reddy", action: "SUBMITTED", note: "Geyser tripping", at: new Date(now.getTime() - 10*60*60*1000) },
      { actorId: "65a000000000000000000002", actorName: "Dr. Suresh Kumar", action: "ASSIGNED", note: "Assigned Ramesh for inspection", at: new Date(now.getTime() - 4*60*60*1000) }
    ],
    createdAt: new Date(now.getTime() - 10*60*60*1000),
    updatedAt: new Date(now.getTime() - 4*60*60*1000)
  },

  // 5. Vikram Malhotra - Cleanliness
  {
    studentId: "65a000000000000000000009",
    studentName: "Vikram Malhotra",
    rollNumber: "ME2023020",
    roomNumber: "B-210",
    hostelBlock: "B",
    category: "CLEANLINESS",
    priority: "NORMAL",
    subject: "Corridor dustbin overflowing",
    description: "Trash bin near room 210 has not been emptied for two days.",
    status: "SUBMITTED",
    isFoodRelated: false,
    history: [
      { actorId: "65a000000000000000000009", actorName: "Vikram Malhotra", action: "SUBMITTED", note: "Trash overflowing", at: new Date(now.getTime() - 2*60*60*1000) }
    ],
    createdAt: new Date(now.getTime() - 2*60*60*1000),
    updatedAt: new Date(now.getTime() - 2*60*60*1000)
  },

  // 6. Ananya Iyer - Insects in Food
  {
    studentId: "65a000000000000000000010",
    studentName: "Ananya Iyer",
    rollNumber: "CS2022033",
    roomNumber: "C-104",
    hostelBlock: "C",
    category: "INSECTS",
    priority: "URGENT",
    subject: "Small bug found in salad tray",
    description: "Found an insect in the sliced cucumber bowl at lunch.",
    status: "ASSIGNED",
    assignedStaffName: "Mess Hygiene Committee",
    isFoodRelated: true,
    history: [
      { actorId: "65a000000000000000000010", actorName: "Ananya Iyer", action: "SUBMITTED", note: "Bug in salad", at: new Date(now.getTime() - 20*60*60*1000) }
    ],
    createdAt: new Date(now.getTime() - 20*60*60*1000),
    updatedAt: new Date(now.getTime() - 15*60*60*1000)
  },

  // 7. Rohan Deshmukh - Carpentry / Furniture
  {
    studentId: "65a000000000000000000011",
    studentName: "Rohan Deshmukh",
    rollNumber: "CE2021012",
    roomNumber: "A-305",
    hostelBlock: "A",
    category: "MAINTENANCE",
    priority: "NORMAL",
    subject: "Cupboard hinge broken",
    description: "The right door hinge of the steel wardrobe has detached from the frame.",
    status: "RESOLVED",
    assignedStaffName: "Kishore Carpenter",
    resolutionNotes: "Fitted new heavy duty hinge screws.",
    isFoodRelated: false,
    createdAt: new Date(now.getTime() - 96*60*60*1000),
    updatedAt: new Date(now.getTime() - 48*60*60*1000)
  },

  // 8. Meera Nair - Insufficient Quantity in Mess
  {
    studentId: "65a000000000000000000012",
    studentName: "Meera Nair",
    rollNumber: "EC2023008",
    roomNumber: "B-105",
    hostelBlock: "B",
    category: "INSUFFICIENT_QUANTITY",
    priority: "NORMAL",
    subject: "Evening snacks ran out early",
    description: "Samosas and tea ran out by 5:25 PM although snacks time is until 6:00 PM.",
    status: "IN_PROGRESS",
    assignedStaffName: "Mess Supervisor",
    isFoodRelated: true,
    createdAt: new Date(now.getTime() - 28*60*60*1000),
    updatedAt: new Date(now.getTime() - 20*60*60*1000)
  }
];
db.hostel_complaints.insertMany(complaintsData);
print("✅ Inserted " + complaintsData.length + " complaints.");

// ── 4. MAINTENANCE TASKS (10 Tasks across Blocks & Categories) ──
db.maintenance_tasks.drop();
const maintenanceData = [
  {
    title: "Replace 36W LED Tube Light in Corridor",
    description: "Flickering tube light outside Room A-204 causing headache.",
    category: "ELECTRICAL",
    priority: "NORMAL",
    roomNumber: "A-204",
    hostelBlock: "A",
    status: "ASSIGNED",
    assignedStaffName: "Sharma Electrician",
    assignedStaffPhone: "9876599901",
    reportedBy: "Dr. Suresh Kumar",
    createdAt: new Date(now.getTime() - 18*60*60*1000),
    updatedAt: new Date(now.getTime() - 10*60*60*1000)
  },
  {
    title: "Clear Drainage Clog in Washroom B-2",
    description: "Water backing up in shower stall 3.",
    category: "PLUMBING",
    priority: "HIGH",
    roomNumber: "B-210",
    hostelBlock: "B",
    status: "IN_PROGRESS",
    assignedStaffName: "Ramesh Plumber",
    assignedStaffPhone: "9876599902",
    reportedBy: "Vikram Malhotra",
    createdAt: new Date(now.getTime() - 14*60*60*1000),
    updatedAt: new Date(now.getTime() - 4*60*60*1000)
  },
  {
    title: "Window Latch Repair Against Rain",
    description: "Window does not lock tight in strong wind.",
    category: "CARPENTRY",
    priority: "NORMAL",
    roomNumber: "C-104",
    hostelBlock: "C",
    status: "COMPLETED",
    assignedStaffName: "Kishore Carpenter",
    assignedStaffPhone: "9876599903",
    reportedBy: "Ananya Iyer",
    resolutionNotes: "Installed new brass latch hook.",
    completedAt: new Date(now.getTime() - 30*60*60*1000),
    createdAt: new Date(now.getTime() - 72*60*60*1000),
    updatedAt: new Date(now.getTime() - 30*60*60*1000)
  },
  {
    title: "Sanitize & Refill Water Cooler Filter",
    description: "Monthly filter cartridge change on Block A ground floor.",
    category: "APPLIANCE",
    priority: "NORMAL",
    roomNumber: "A-101",
    hostelBlock: "A",
    status: "COMPLETED",
    assignedStaffName: "AquaCare Tech",
    assignedStaffPhone: "9876599904",
    reportedBy: "Hostel Administrator",
    resolutionNotes: "TDS checked at 85 ppm, UV filter replaced.",
    completedAt: new Date(now.getTime() - 48*60*60*1000),
    createdAt: new Date(now.getTime() - 96*60*60*1000),
    updatedAt: new Date(now.getTime() - 48*60*60*1000)
  },
  {
    title: "Geyser MCB Trip Inspection",
    description: "Investigate electrical load on 3rd floor Block C.",
    category: "ELECTRICAL",
    priority: "HIGH",
    roomNumber: "C-302",
    hostelBlock: "C",
    status: "PENDING",
    reportedBy: "Dr. Suresh Kumar",
    createdAt: new Date(now.getTime() - 6*60*60*1000),
    updatedAt: new Date(now.getTime() - 6*60*60*1000)
  },
  {
    title: "Ceiling Fan Regulator Replacement",
    description: "Fan operates only on speed 5, humming loudly.",
    category: "ELECTRICAL",
    priority: "NORMAL",
    roomNumber: "B-101",
    hostelBlock: "B",
    status: "ASSIGNED",
    assignedStaffName: "Sharma Electrician",
    assignedStaffPhone: "9876599901",
    reportedBy: "Priya Singh",
    createdAt: new Date(now.getTime() - 36*60*60*1000),
    updatedAt: new Date(now.getTime() - 12*60*60*1000)
  }
];
db.maintenance_tasks.insertMany(maintenanceData);
print("✅ Inserted " + maintenanceData.length + " maintenance tasks.");

// ── 5. WEEKLY HOSTEL FEEDBACK (Multiple Weeks) ──
db.hostel_feedback.drop();
const feedbackData = [
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    hostelBlock: "A",
    weekStart: "2026-10-26",
    ratings: {
      electricity: 4,
      powerSupply: 4,
      fansLightsSwitches: 3,
      roomCleanliness: 4,
      washroomCleanliness: 4,
      waterSupply: 5,
      facilities: 4
    },
    comments: "Power is very stable; study lamp switch needs quick repair.",
    createdAt: new Date(now.getTime() - 4*24*60*60*1000)
  },
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    hostelBlock: "B",
    weekStart: "2026-10-26",
    ratings: {
      electricity: 4,
      powerSupply: 3,
      fansLightsSwitches: 3,
      roomCleanliness: 3,
      washroomCleanliness: 2,
      waterSupply: 4,
      facilities: 3
    },
    comments: "Block B washroom cleaning needs more frequent schedule on weekends.",
    createdAt: new Date(now.getTime() - 3*24*60*60*1000)
  },
  {
    studentId: "65a000000000000000000008",
    studentName: "Sneha Reddy",
    rollNumber: "IT2021045",
    roomNumber: "C-302",
    hostelBlock: "C",
    weekStart: "2026-10-26",
    ratings: {
      electricity: 3,
      powerSupply: 3,
      fansLightsSwitches: 4,
      roomCleanliness: 4,
      washroomCleanliness: 3,
      waterSupply: 3,
      facilities: 4
    },
    comments: "Geyser in C block 3rd floor needs electrical check.",
    createdAt: new Date(now.getTime() - 2*24*60*60*1000)
  },
  {
    studentId: "65a000000000000000000007",
    studentName: "Aarav Patel",
    rollNumber: "EC2022015",
    roomNumber: "A-108",
    hostelBlock: "A",
    weekStart: "2026-10-26",
    ratings: {
      electricity: 5,
      powerSupply: 5,
      fansLightsSwitches: 5,
      roomCleanliness: 4,
      washroomCleanliness: 4,
      waterSupply: 5,
      facilities: 5
    },
    comments: "Everything in Block A ground floor is well maintained.",
    createdAt: new Date(now.getTime() - 4*24*60*60*1000)
  }
];
db.hostel_feedback.insertMany(feedbackData);
print("✅ Inserted " + feedbackData.length + " weekly feedback records.");

// ── 6. FOOD QUALITY & HYGIENE FEEDBACK ──
db.food_feedback.drop();
const foodFeedbackData = [
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    mealType: "LUNCH",
    date: "2026-10-31",
    foodQualityRating: 5,
    hygieneRating: 4,
    comments: "Special weekend feast was very delicious. Naan and paneer were fresh.",
    createdAt: new Date(now.getTime() - 6*60*60*1000)
  },
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    mealType: "BREAKFAST",
    date: "2026-10-31",
    foodQualityRating: 3,
    hygieneRating: 2,
    comments: "Puri was too oily and tumblers were not washed well.",
    createdAt: new Date(now.getTime() - 10*60*60*1000)
  },
  {
    studentId: "65a000000000000000000007",
    studentName: "Aarav Patel",
    rollNumber: "EC2022015",
    roomNumber: "A-108",
    mealType: "LUNCH",
    date: "2026-10-31",
    foodQualityRating: 4,
    hygieneRating: 4,
    comments: "Kadhi pakora and rice tasted great.",
    createdAt: new Date(now.getTime() - 5*60*60*1000)
  },
  {
    studentId: "65a000000000000000000010",
    studentName: "Ananya Iyer",
    rollNumber: "CS2022033",
    roomNumber: "C-104",
    mealType: "SNACKS",
    date: "2026-10-30",
    foodQualityRating: 4,
    hygieneRating: 4,
    comments: "Veg cutlets and mint chutney were warm and crunchy.",
    createdAt: new Date(now.getTime() - 26*60*60*1000)
  }
];
db.food_feedback.insertMany(foodFeedbackData);
print("✅ Inserted " + foodFeedbackData.length + " food feedback reviews.");

// ── 7. STUDENT INCIDENTS (Disciplinary & Safety Records) ──
db.student_incidents.drop();
const incidentData = [
  // 1. Priya Singh - Repeated Late Curfew
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    hostelBlock: "B",
    reportedById: "65a000000000000000000002",
    reportedByName: "Dr. Suresh Kumar",
    type: "REPEATED_LATE_RETURN",
    severity: "HIGH",
    title: "4th Late Return Past 10:00 PM Curfew",
    description: "Student has exceeded approved return times 4 times this month without emergency justification.",
    status: "EXPLANATION_SUBMITTED",
    studentExplanation: "I attend GRE preparation classes at Connaught Place which finish at 8:30 PM. The metro was delayed. I will apply for working hours pass henceforth.",
    studentExplanationAt: new Date(now.getTime() - 12*60*60*1000),
    parentNotified: true,
    mentorNotified: true,
    history: [
      { actorId: "65a000000000000000000002", actorName: "Dr. Suresh Kumar", action: "REPORTED", note: "Notice issued to student & parent", at: new Date(now.getTime() - 24*60*60*1000) },
      { actorId: "65a000000000000000000004", actorName: "Priya Singh", action: "EXPLANATION_SUBMITTED", note: "GRE classes delay explanation", at: new Date(now.getTime() - 12*60*60*1000) }
    ],
    createdAt: new Date(now.getTime() - 24*60*60*1000),
    updatedAt: new Date(now.getTime() - 12*60*60*1000)
  },

  // 2. Ananya Iyer - Noise & Misconduct
  {
    studentId: "65a000000000000000000010",
    studentName: "Ananya Iyer",
    rollNumber: "CS2022033",
    roomNumber: "C-104",
    hostelBlock: "C",
    reportedById: "65a000000000000000000002",
    reportedByName: "Dr. Suresh Kumar",
    type: "MISCONDUCT",
    severity: "MEDIUM",
    title: "Excessive Noise During Study Hours",
    description: "Loud Bluetooth speaker played past midnight violating quiet hours.",
    status: "CLOSED",
    studentExplanation: "Apologies, it was my roommate's birthday. We turned it off when security knocked.",
    studentExplanationAt: new Date(now.getTime() - 72*60*60*1000),
    wardenAction: "Verbal counselling provided; student signed acknowledgement of quiet hours policy.",
    wardenActionAt: new Date(now.getTime() - 48*60*60*1000),
    resolvedBy: "Dr. Suresh Kumar",
    parentNotified: true,
    mentorNotified: true,
    createdAt: new Date(now.getTime() - 96*60*60*1000),
    updatedAt: new Date(now.getTime() - 48*60*60*1000)
  }
];
db.student_incidents.insertMany(incidentData);
print("✅ Inserted " + incidentData.length + " disciplinary incidents.");

// ── 8. DIRECT CHAT MESSAGES ──
db.chat_messages.drop();
const chatMessagesData = [
  // Rahul Sharma & Mentor Anita Verma
  {
    conversationId: "65a000000000000000000001_65a000000000000000000005",
    senderId: "65a000000000000000000001",
    senderName: "Rahul Sharma",
    senderRole: "STUDENT",
    recipientId: "65a000000000000000000005",
    recipientName: "Prof. Anita Verma",
    recipientRole: "MENTOR",
    content: "Good afternoon Ma'am. I have submitted an outing request for the coding hackathon this weekend.",
    isRead: true,
    createdAt: new Date(now.getTime() - 48*60*60*1000)
  },
  {
    conversationId: "65a000000000000000000001_65a000000000000000000005",
    senderId: "65a000000000000000000005",
    senderName: "Prof. Anita Verma",
    senderRole: "MENTOR",
    recipientId: "65a000000000000000000001",
    recipientName: "Rahul Sharma",
    recipientRole: "STUDENT",
    content: "Hello Rahul. I have reviewed your application and approved it. Best of luck for the competition!",
    isRead: true,
    createdAt: new Date(now.getTime() - 46*60*60*1000)
  },
  {
    conversationId: "65a000000000000000000001_65a000000000000000000005",
    senderId: "65a000000000000000000001",
    senderName: "Rahul Sharma",
    senderRole: "STUDENT",
    recipientId: "65a000000000000000000005",
    recipientName: "Prof. Anita Verma",
    recipientRole: "MENTOR",
    content: "Thank you so much Ma'am! I will return before the 8 PM gate curfew.",
    isRead: true,
    createdAt: new Date(now.getTime() - 45*60*60*1000)
  },

  // Warden Suresh Kumar & Parent Ramesh Sharma
  {
    conversationId: "65a000000000000000000002_65a000000000000000000003",
    senderId: "65a000000000000000000002",
    senderName: "Dr. Suresh Kumar",
    senderRole: "WARDEN",
    recipientId: "65a000000000000000000003",
    recipientName: "Ramesh Sharma",
    recipientRole: "PARENT",
    content: "Greetings Mr. Sharma. This is regarding Rahul's upcoming Diwali vacation leave pass.",
    isRead: true,
    createdAt: new Date(now.getTime() - 72*60*60*1000)
  },
  {
    conversationId: "65a000000000000000000002_65a000000000000000000003",
    senderId: "65a000000000000000000003",
    senderName: "Ramesh Sharma",
    senderRole: "PARENT",
    recipientId: "65a000000000000000000002",
    recipientName: "Dr. Suresh Kumar",
    recipientRole: "WARDEN",
    content: "Hello Dr. Suresh. Yes, we have booked his train ticket and granted parental approval in the portal.",
    isRead: true,
    createdAt: new Date(now.getTime() - 70*60*60*1000)
  },
  {
    conversationId: "65a000000000000000000002_65a000000000000000000003",
    senderId: "65a000000000000000000002",
    senderName: "Dr. Suresh Kumar",
    senderRole: "WARDEN",
    recipientId: "65a000000000000000000003",
    recipientName: "Ramesh Sharma",
    recipientRole: "PARENT",
    content: "Noted with thanks. The digital QR gate pass is generated and ready for his departure.",
    isRead: false,
    createdAt: new Date(now.getTime() - 2*60*60*1000)
  }
];
db.chat_messages.insertMany(chatMessagesData);
print("✅ Inserted " + chatMessagesData.length + " chat messages.");

// ── 9. NOTIFICATIONS ──
db.notifications.drop();
const notifsData = [
  {
    userId: "65a000000000000000000001", // Rahul
    title: "Gate Pass Active",
    message: "Your local outing pass is approved and valid for gate exit.",
    type: "LEAVE_APPROVED",
    read: false,
    createdAt: new Date(now.getTime() - 2*60*60*1000)
  },
  {
    userId: "65a000000000000000000003", // Parent Ramesh
    title: "Curfew & Safe Return Notice",
    message: "Rahul checked out at 04:00 PM for Bookstore visit.",
    type: "QR_SCANNED",
    read: true,
    createdAt: new Date(now.getTime() - 2*60*60*1000)
  },
  {
    userId: "65a000000000000000000002", // Warden
    title: "⚠️ Overdue Student Alert",
    message: "Priya Singh is 75 minutes past her approved expected return time.",
    type: "OVERDUE_ALERT",
    read: false,
    createdAt: new Date(now.getTime() - 70*60*1000)
  },
  {
    userId: "65a000000000000000000005", // Mentor Anita
    title: "New Outing Review Needed",
    message: "Aarav Patel applied for Robotics Workshop outing.",
    type: "MENTOR_APPROVAL_NEEDED",
    read: false,
    createdAt: new Date(now.getTime() - 1*60*60*1000)
  }
];
db.notifications.insertMany(notifsData);
print("✅ Inserted " + notifsData.length + " notifications.");

// ── 10. INDEXES ──
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ rollNumber: 1 });
db.leave_requests.createIndex({ studentId: 1 });
db.leave_requests.createIndex({ status: 1 });
db.leave_requests.createIndex({ qrToken: 1 });
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ createdAt: -1 });
db.chat_messages.createIndex({ conversationId: 1 });
db.student_incidents.createIndex({ studentId: 1 });
db.maintenance_tasks.createIndex({ roomNumber: 1 });
db.hostel_complaints.createIndex({ studentId: 1 });
db.hostel_feedback.createIndex({ studentId: 1, weekStart: 1 }, { unique: true });

print("🎉 DONE! All 15+ comprehensive demo records successfully seeded into 'hostelflow'!");
