// HostelFlow AI — Seed New Features (Gate, Skip-a-Meal, Room Matrix & Swap, Visitors, Finance/No-Dues, Community)
db = db.getSiblingDB('hostelflow');

const now = new Date();
const todayStr = now.toISOString().split('T')[0];

print("🌱 Seeding extension feature records...");

// 1. MEAL POLLS
db.meal_polls.drop();
db.meal_polls.insertMany([
  {
    title: "Special Sunday Feast Voting",
    mealType: "DINNER",
    date: todayStr,
    options: ["Paneer Butter Masala & Naan", "Hyderabadi Veg Biryani with Mirchi ka Salan", "Pav Bhaji & Gulab Jamun"],
    voteCounts: {
      "Paneer Butter Masala & Naan": 42,
      "Hyderabadi Veg Biryani with Mirchi ka Salan": 58,
      "Pav Bhaji & Gulab Jamun": 31
    },
    votedStudentIds: ["65a000000000000000000001", "65a000000000000000000004"],
    active: true,
    createdAt: new Date(now.getTime() - 24*60*60*1000)
  }
]);

// 2. MEAL OPT-OUTS (Skip-a-meal food waste reduction)
db.meal_opt_outs.drop();
db.meal_opt_outs.insertMany([
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    optOutDate: new Date(now.getTime() + 24*60*60*1000),
    mealType: "DINNER",
    reason: "Attending friend's birthday party outside",
    rebateAmount: 50.0,
    createdAt: new Date(now.getTime() - 2*60*60*1000)
  },
  {
    studentId: "65a000000000000000000007",
    studentName: "Aarav Patel",
    rollNumber: "EC2022015",
    roomNumber: "A-108",
    optOutDate: new Date(now.getTime() + 24*60*60*1000),
    mealType: "LUNCH",
    reason: "Robotics workshop lab session",
    rebateAmount: 50.0,
    createdAt: new Date(now.getTime() - 4*60*60*1000)
  }
]);

// 3. ROOM SWAP REQUESTS
db.room_swap_requests.drop();
db.room_swap_requests.insertMany([
  {
    applicantStudentId: "65a000000000000000000001",
    applicantName: "Rahul Sharma",
    applicantRoll: "CS2021001",
    applicantRoom: "A-204",
    applicantBlock: "A",
    targetStudentId: "65a000000000000000000007",
    targetName: "Aarav Patel",
    targetRoll: "EC2022015",
    targetRoom: "A-108",
    targetBlock: "A",
    reason: "Closer to computer laboratory and ground floor study area.",
    status: "PENDING_WARDEN",
    peerRemark: "Agreed, I prefer second floor quiet environment.",
    wardenRemark: "",
    createdAt: new Date(now.getTime() - 12*60*60*1000)
  }
]);

// 4. ROOM INVENTORIES
db.room_inventories.drop();
db.room_inventories.insertMany([
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    roomNumber: "A-204",
    hostelBlock: "A",
    keyHandedOver: true,
    tableCondition: "GOOD",
    chairCondition: "EXCELLENT",
    fanCondition: "WORKING",
    mattressCondition: "CLEAN",
    wallPaintCondition: "FRESH",
    remarks: "Room in immaculate condition upon semester check-in.",
    verifiedByWarden: true,
    verifiedBy: "Dr. Suresh Kumar",
    updatedAt: new Date(now.getTime() - 15*24*60*60*1000)
  }
]);

// 5. VISITOR PASSES
db.visitor_passes.drop();
db.visitor_passes.insertMany([
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    studentRoll: "CS2021001",
    studentRoom: "A-204",
    visitorName: "Ramesh Sharma",
    visitorPhone: "9876500002",
    relationship: "PARENT",
    purpose: "Bringing winter clothes and textbooks",
    visitDate: new Date(),
    timeSlot: "02:00 PM - 05:00 PM",
    passCode: "4821",
    qrToken: "VIS-RMS4821",
    status: "APPROVED",
    wardenRemarks: "Parent visitor pass approved.",
    createdAt: new Date(now.getTime() - 6*60*60*1000)
  },
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    studentRoll: "CS2021002",
    studentRoom: "B-101",
    visitorName: "Sunita Singh",
    visitorPhone: "9876500012",
    relationship: "PARENT",
    purpose: "Parent consultation visit",
    visitDate: new Date(),
    timeSlot: "11:00 AM - 02:00 PM",
    passCode: "7103",
    qrToken: "VIS-SNT7103",
    status: "APPROVED",
    wardenRemarks: "Approved by Warden Office.",
    createdAt: new Date(now.getTime() - 8*60*60*1000)
  }
]);

// 6. FEE RECORDS & FINES
db.fee_records.drop();
db.fee_records.insertMany([
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    title: "Semester Hostel Maintenance & Utility Dues",
    type: "RENT",
    amount: 15000.0,
    status: "PAID",
    dueDate: new Date(now.getTime() - 10*24*60*60*1000),
    paidAt: new Date(now.getTime() - 12*24*60*60*1000),
    receiptNumber: "HF-REC-2026-1049",
    remarks: "Paid via NetBanking UPI ref 9482710492",
    createdAt: new Date(now.getTime() - 30*24*60*60*1000)
  },
  {
    studentId: "65a000000000000000000004",
    studentName: "Priya Singh",
    rollNumber: "CS2021002",
    roomNumber: "B-101",
    title: "Repeated Late Return Disciplinary Penalty",
    type: "FINE",
    amount: 500.0,
    status: "UNPAID",
    dueDate: new Date(now.getTime() + 5*24*60*60*1000),
    remarks: "Late curfew violation on 25th October (overdue 75 mins)",
    createdAt: new Date(now.getTime() - 24*60*60*1000)
  }
]);

// 7. NO DUES CLEARANCE
db.no_dues_requests.drop();
db.no_dues_requests.insertMany([
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2021001",
    roomNumber: "A-204",
    hostelBlock: "A",
    reason: "Final Year Graduation Clearance",
    wardenCleared: true,
    wardenRemarks: "All room assets intact.",
    messCleared: true,
    messRemarks: "No food dues pending. ₹150 rebate adjusted.",
    maintenanceCleared: true,
    maintenanceRemarks: "No damages reported in A-204.",
    accountsCleared: false,
    accountsRemarks: "Pending caution deposit refund calculation.",
    status: "PENDING",
    createdAt: new Date(now.getTime() - 3*24*60*60*1000)
  }
]);

// 8. LAUNDRY BOOKINGS
db.laundry_bookings.drop();
db.laundry_bookings.insertMany([
  {
    studentId: "65a000000000000000000001",
    studentName: "Rahul Sharma",
    roomNumber: "A-204",
    machineNumber: "Machine 1",
    bookingDate: new Date(),
    timeSlot: "08:00 AM - 09:00 AM",
    status: "BOOKED",
    createdAt: new Date(now.getTime() - 5*60*60*1000)
  },
  {
    studentId: "65a000000000000000000007",
    studentName: "Aarav Patel",
    roomNumber: "A-108",
    machineNumber: "Machine 2",
    bookingDate: new Date(),
    timeSlot: "10:00 AM - 11:00 AM",
    status: "BOOKED",
    createdAt: new Date(now.getTime() - 2*60*60*1000)
  }
]);

// 9. LOST AND FOUND
db.lost_and_found_items.drop();
db.lost_and_found_items.insertMany([
  {
    reportedByStudentId: "65a000000000000000000007",
    reporterName: "Aarav Patel",
    contactInfo: "9876543212 (Room A-108)",
    title: "Sony Wireless Noise Cancelling Earbuds Case",
    type: "FOUND",
    category: "ELECTRONICS",
    location: "Block A 1st Floor Study Reading Room",
    description: "Found on study table 4 near the window shelf. Black color case with subtle scratch.",
    status: "OPEN",
    createdAt: new Date(now.getTime() - 18*60*60*1000)
  },
  {
    reportedByStudentId: "65a000000000000000000001",
    reporterName: "Rahul Sharma",
    contactInfo: "9876543210 (Room A-204)",
    title: "Room Key Ring with Marvel Keychain",
    type: "LOST",
    category: "KEYS",
    location: "Path between Hostel Gate and Mess Hall",
    description: "Brass key with a mini Iron Man rubber keychain attached. If found, please ping me.",
    status: "OPEN",
    createdAt: new Date(now.getTime() - 28*60*60*1000)
  }
]);

print("✅ All extension features seeded successfully!");
