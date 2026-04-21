y# 🏨 HostelFlow AI — Smart Hostel Leave Management System

> Full-stack production system | Spring Boot + React + MongoDB + Python AI + Docker

---

## 🎯 One-Command Start

### **Recommended: Docker (Everything!)** 
```bash
docker-compose up -d
```
- ✅ MongoDB + Backend (8080) + Frontend (3000) + AI (8000)
- ✅ No local deps/Python/Java issues
- `docker-compose down` to stop

### **Dev Mode (Frontend + Backend only)**
```bash
# 1. MongoDB
brew services start mongodb-community  # macOS
mongosh hostelflow < database/seed.js  # Test accounts

# 2. Run (auto deps)
./run-all.sh
```
**Stop:** `./stop-all.sh`

**Test:** http://localhost:3000 → `student@hostelflow.com` / `password`

---

## 📁 Structure

```
.
├── backend/           # Spring Boot API (JWT, Mongo)
├── frontend/          # React/Vite PWA (Tailwind)
├── ai-service/        # Python FastAPI ML (risk prediction)
├── database/seed.js   # Test data
├── docker-compose.yml # Full stack
└── run-all.sh         # Dev quickstart
```

**Tech:** Java 17 • React 18 • MongoDB • FastAPI • Tailwind • Docker

---

## 🚀 Manual Setup (Legacy)

**Prerequisites:** Java17 • Node18 • Python3.10+ • MongoDB localhost:27017

1. **DB** `mongosh hostelflow < database/seed.js`

2. **Backend** `cd backend && ./mvnw spring-boot:run` → localhost:8080

3. **Frontend** `cd frontend && npm i && npm run dev` → localhost:3000

4. **AI** (optional) `cd ai-service && pip i -r requirements.txt && uvicorn main:app --port 8000`

**⚠️ Python 3.13:** AI skip (pydantic-core wheel fail) - backend fallback OK.

---

## 👥 Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Student | student@hostelflow.com | password |
| Warden | warden@hostelflow.com | password |
| Parent | parent@hostelflow.com | password |

---

## 🔌 API (localhost:8080)

**Auth** `/api/auth/login` (JWT Bearer)

**Student** `/api/student/*` Apply leave, QR, history

**Warden** `/api/warden/*` Approve, analytics, high-risk list

**Parent** `/api/parent/*` Approve child leaves

**AI** localhost:8000 `/predict/risk` (ML risk score)

Full docs: Postman `HostelFlow-API.postman_collection.json`

---

## 🚀 Features

- 🔐 JWT + Role-Based Access (Student/Warden/Parent)
- 📱 PWA Mobile App (installable)
- 🛡️ QR Gate Pass System (in/out scan)
- 🤖 AI Risk Detection (late patterns → HIGH/MEDIUM/LOW)
- ⏰ Auto Late Detection (every 5min)
- 📊 Warden Analytics Dashboard
- 📧 Notification Chain (student→warden→parent)
- 🎨 Dark Mode + Animations (Framer/Tailwind)

---

## 🛠️ Troubleshooting

**mvnw missing:** `./run-all.sh` auto-generates

**Python 3.13 error:** Skip AI (`docker-compose` uses Python3.10 image)

**Mongo not found:** `brew install mongodb-community && brew services start mongodb-community`

**Frontend 404:** `npm ci` in frontend/

---

## 📱 Demo Flow
1. Student applies leave → Warden approves → Parent OK → QR generated
2. Gate scans QR (in/out) → Auto risk update
3. Late >5x → HIGH risk → Warden alert

**Production Ready 🚀**

*HostelFlow AI — Complete hostel management system.*

