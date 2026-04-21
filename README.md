# 🏨 HostelFlow AI
### Smart Hostel Leave Management System

> **Full-stack production system** — Spring Boot · React · MongoDB · Python AI · Docker

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Test Accounts](#-test-accounts)
- [API Reference](#-api-reference)
- [AI Service](#-ai-service)
- [Environment Variables](#-environment-variables)
- [Demo Flow](#-demo-flow)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🌟 Overview

**HostelFlow AI** is a production-ready hostel leave management platform designed to digitize and streamline the entire leave lifecycle — from a student's initial application to QR-based gate exit/entry tracking. It combines a robust Spring Boot backend with an intelligent Python-based risk prediction engine to help wardens proactively identify at-risk students before problems escalate.

**Who is this for?**
- 🏫 **Hostels & Boarding Schools** managing 50–5000+ students
- 🏗️ **Developers** looking for a full-stack microservices reference project
- 🔬 **Researchers** exploring ML integration in institutional management

**Key problems it solves:**
- Eliminates paper-based leave registers and manual gate logs
- Provides real-time visibility into student whereabouts for wardens and parents
- Detects repeated late-return patterns using ML before they become disciplinary issues
- Enables parents to approve/track their ward's leaves from any device

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication with refresh token support
- Role-based access control — **Student**, **Warden**, **Parent** roles with separate dashboards
- Secure password hashing (BCrypt) and token blacklisting on logout

### 📝 Leave Management
- Students submit leave applications with destination, reason, duration, and emergency contact
- Multi-level approval chain: **Student → Warden → Parent**
- Warden can approve, reject, or request additional information
- Parent co-approval via email deep link (no login required for parents)
- Leave history with full audit trail and status timestamps

### 🛡️ QR Gate Pass System
- Auto-generated QR code upon full approval, valid only for the leave window
- Gate staff scan QR to record **check-out** and **check-in** timestamps
- Invalid/expired QR attempts are logged and flagged
- Supports both camera scan and manual entry fallback

### 🤖 AI Risk Detection
- FastAPI microservice running a trained ML model (Scikit-learn / XGBoost)
- Risk scoring based on: late-return frequency, leave duration trends, destination patterns, time-of-year factors
- Scores mapped to **HIGH / MEDIUM / LOW** with confidence percentages
- Warden dashboard highlights HIGH-risk students with actionable context
- Model retraining pipeline triggered weekly via cron job

### ⏰ Automated Late Detection
- Background scheduler polls every **5 minutes** for overdue returns
- Sends escalating notifications: student (T+0) → warden (T+30m) → parent (T+1h)
- Auto-marks status as `LATE` and increments risk factors in the AI model

### 📊 Warden Analytics Dashboard
- Live occupancy heatmap (students on campus vs. on leave)
- Weekly/monthly leave volume charts
- Top destinations, peak leave periods, approval turnaround times
- Exportable reports (CSV / PDF)

### 📱 Progressive Web App (PWA)
- Installable on iOS and Android home screens
- Offline-capable leave viewing (cached via Service Worker)
- Push notifications for status updates
- Responsive design — works seamlessly on mobile, tablet, desktop

### 🎨 UI/UX
- Dark mode with system preference detection and manual toggle
- Smooth page transitions and micro-animations (Framer Motion + Tailwind)
- Accessible components (ARIA labels, keyboard navigation, color contrast AA)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   React 18 PWA (Vite) · Tailwind CSS · Framer Motion           │
│   localhost:3000                                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP / REST (JWT Bearer)
┌──────────────────────▼──────────────────────────────────────────┐
│                      BACKEND LAYER                              │
│   Spring Boot 3 · Spring Security · Spring Data MongoDB         │
│   localhost:8080                                                │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│   │  Auth Module │  │ Leave Module │  │  Scheduler / Events  │ │
│   │  JWT · BCrypt│  │ CRUD · Audit │  │  Late Detection · Notif│ │
│   └──────────────┘  └──────────────┘  └──────────────────────┘ │
└──────────┬───────────────────────────────────┬──────────────────┘
           │ MongoDB Driver                    │ HTTP (Internal)
┌──────────▼──────────┐            ┌───────────▼──────────────────┐
│    MongoDB 7.0      │            │      AI SERVICE               │
│    localhost:27017  │            │   Python FastAPI · Uvicorn    │
│                     │            │   Scikit-learn / XGBoost      │
│  Collections:       │            │   localhost:8000              │
│  · users            │            │                               │
│  · leaves           │            │   POST /predict/risk          │
│  · gate_logs        │            │   GET  /model/health          │
│  · notifications    │            │   POST /model/retrain         │
└─────────────────────┘            └──────────────────────────────┘
```

### Technology Choices

| Layer | Technology | Why |
|---|---|---|
| Backend | Spring Boot 3 + Java 17 | Mature ecosystem, strong typing, enterprise-grade security |
| Database | MongoDB 7.0 | Flexible schema for evolving leave/log documents |
| Frontend | React 18 + Vite | Fast HMR dev experience, component reusability |
| Styling | Tailwind CSS v3 | Utility-first, zero runtime CSS overhead |
| Animation | Framer Motion | Declarative, production-quality animations |
| AI Service | FastAPI + Python | Fast async endpoints, easy ML library integration |
| Auth | JWT (RS256) | Stateless, scalable across microservices |
| DevOps | Docker + Compose | Reproducible builds, single-command startup |

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended ✅)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# Clone the repository
git clone https://github.com/your-org/hostelflow-ai.git
cd hostelflow-ai

# Start all services (MongoDB + Backend + Frontend + AI)
docker-compose up -d

# Watch logs (optional)
docker-compose logs -f

# Stop everything
docker-compose down
```

Services started:

| Service | URL | Notes |
|---|---|---|
| Frontend | http://localhost:3000 | React PWA |
| Backend API | http://localhost:8080 | Spring Boot |
| AI Service | http://localhost:8000 | FastAPI |
| MongoDB | localhost:27017 | Auto-seeded |

> **First run** takes ~3–5 minutes to pull images and seed the database.

---

### Option 2 — Dev Mode (Frontend + Backend only)

Best for active development with hot-reload on both frontend and backend.

**Prerequisites:** Java 17, Node 18+, Python 3.10–3.12, MongoDB running locally.

```bash
# Step 1: Start MongoDB and seed test data
brew services start mongodb-community     # macOS
# OR: sudo systemctl start mongod         # Linux

mongosh hostelflow < database/seed.js     # Load test accounts & sample data

# Step 2: Launch backend + frontend together
./run-all.sh

# To stop all processes
./stop-all.sh
```

> `run-all.sh` auto-generates `mvnw` if missing and installs frontend dependencies on first run.

---

### Option 3 — Manual Setup (Legacy)

If you need fine-grained control over each service:

**Prerequisites:** Java 17 · Node 18+ · Python 3.10–3.12 · MongoDB at `localhost:27017`

```bash
# 1. Seed the database
mongosh hostelflow < database/seed.js

# 2. Start the backend
cd backend
./mvnw spring-boot:run
# → http://localhost:8080

# 3. Start the frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000

# 4. Start the AI service (optional)
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000
```

> ⚠️ **Python 3.13 users:** The AI service has a known `pydantic-core` wheel build failure on 3.13. Use Docker (Python 3.10 image) or skip the AI service — the backend falls back to rule-based risk scoring automatically.

---

## 📁 Project Structure

```
hostelflow-ai/
│
├── backend/                        # Spring Boot API
│   ├── src/main/java/com/hostelflow/
│   │   ├── auth/                   # JWT auth, login/register controllers
│   │   ├── leave/                  # Leave CRUD, approval workflow
│   │   ├── gate/                   # QR generation, scan endpoints
│   │   ├── notification/           # Email/push notification service
│   │   ├── scheduler/              # Late detection cron jobs
│   │   ├── ai/                     # AI service client (with fallback)
│   │   └── config/                 # Security, CORS, MongoDB config
│   ├── src/main/resources/
│   │   └── application.yml         # Environment-based config
│   └── pom.xml
│
├── frontend/                       # React 18 PWA
│   ├── src/
│   │   ├── components/             # Shared UI components
│   │   ├── pages/
│   │   │   ├── student/            # Apply leave, QR pass, history
│   │   │   ├── warden/             # Dashboard, approvals, analytics
│   │   │   └── parent/             # View & approve ward's leaves
│   │   ├── hooks/                  # useAuth, useLeave, useNotification
│   │   ├── store/                  # Zustand global state
│   │   └── api/                    # Axios instance + API helpers
│   ├── public/
│   │   └── manifest.json           # PWA manifest
│   └── vite.config.ts
│
├── ai-service/                     # Python FastAPI ML service
│   ├── main.py                     # App entry point, route registration
│   ├── model/
│   │   ├── train.py                # Training pipeline
│   │   ├── predict.py              # Inference logic
│   │   └── hostelflow_model.pkl    # Serialized trained model
│   ├── schemas.py                  # Pydantic request/response schemas
│   └── requirements.txt
│
├── database/
│   └── seed.js                     # MongoDB seed script (test accounts + sample leaves)
│
├── docker-compose.yml              # Full-stack orchestration
├── run-all.sh                      # Dev quickstart script
├── stop-all.sh                     # Kill all dev processes
├── HostelFlow-API.postman_collection.json   # Full API collection
└── README.md
```

---

## 👥 Test Accounts

All accounts use the password: **`password`**

| Role | Email | Access |
|---|---|---|
| 🎓 Student | `student@hostelflow.com` | Apply leave, view QR pass, leave history |
| 🏫 Warden | `warden@hostelflow.com` | Approve/reject leaves, analytics, risk dashboard |
| 👨‍👩‍👧 Parent | `parent@hostelflow.com` | View ward's leaves, co-approve pending requests |

> Additional seeded students (`student2@`, `student3@`) with pre-existing leave history are available for testing the AI risk model and analytics charts.

---

## 🔌 API Reference

Base URL: `http://localhost:8080`

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT + refresh token | ❌ |
| POST | `/api/auth/register` | Create new student account | ❌ |
| POST | `/api/auth/refresh` | Exchange refresh token for new JWT | ❌ |
| POST | `/api/auth/logout` | Blacklist current token | ✅ |

**Login Request:**
```json
POST /api/auth/login
{
  "email": "student@hostelflow.com",
  "password": "password"
}
```

**Login Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "expiresIn": 3600,
  "user": {
    "id": "64a1f...",
    "name": "Arjun Sharma",
    "role": "STUDENT",
    "roomNumber": "B-204"
  }
}
```

---

### Student Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/student/leave/apply` | Submit a new leave application |
| GET | `/api/student/leave/history` | Get own leave history (paginated) |
| GET | `/api/student/leave/{id}` | Get details of a specific leave |
| DELETE | `/api/student/leave/{id}` | Cancel a pending leave |
| GET | `/api/student/leave/{id}/qr` | Get QR pass image (PNG) for approved leave |
| GET | `/api/student/profile` | Get own profile and risk score |

**Apply Leave Request:**
```json
POST /api/student/leave/apply
{
  "destination": "Home - Ludhiana",
  "reason": "Family function",
  "departureDate": "2024-12-20T10:00:00",
  "returnDate": "2024-12-23T18:00:00",
  "parentContact": "+91-9876543210",
  "emergencyContact": "+91-9123456789"
}
```

---

### Warden Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/warden/leaves/pending` | List all pending leave applications |
| POST | `/api/warden/leave/{id}/approve` | Approve a leave |
| POST | `/api/warden/leave/{id}/reject` | Reject with reason |
| GET | `/api/warden/students/high-risk` | List HIGH risk students |
| GET | `/api/warden/analytics/summary` | Dashboard summary stats |
| GET | `/api/warden/analytics/occupancy` | Current hostel occupancy |
| GET | `/api/warden/gate-logs` | Recent gate scan logs |

---

### Parent Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/parent/leaves/pending` | Leaves awaiting parent approval |
| POST | `/api/parent/leave/{id}/approve` | Co-approve a leave |
| POST | `/api/parent/leave/{id}/reject` | Reject a leave |
| GET | `/api/parent/ward/history` | Full leave history of ward |

---

### Gate / QR Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/gate/scan` | Record a QR scan (check-out or check-in) |
| GET | `/api/gate/validate/{qrToken}` | Validate QR token (returns leave details) |

**Full collection:** Import `HostelFlow-API.postman_collection.json` into Postman for all endpoints with pre-configured environments.

---

## 🤖 AI Service

Base URL: `http://localhost:8000`

The AI microservice exposes three endpoints:

### `POST /predict/risk`

Predict risk level for a student based on their historical leave data.

**Request:**
```json
{
  "studentId": "64a1f...",
  "lateReturnCount": 4,
  "totalLeaves": 12,
  "avgOverdueMinutes": 87,
  "consecutiveLateReturns": 2,
  "longestOverdueDays": 1.5,
  "termWeek": 8
}
```

**Response:**
```json
{
  "studentId": "64a1f...",
  "riskLevel": "HIGH",
  "confidence": 0.87,
  "factors": [
    "4 late returns in current term",
    "Consecutive late patterns detected",
    "Average overdue: 87 minutes"
  ],
  "recommendation": "Schedule counselling session. Notify parents."
}
```

### `GET /model/health`
Returns model version, training date, and feature importance summary.

### `POST /model/retrain`
Triggers a retraining pipeline using the latest gate log data from MongoDB.  
> 🔒 Warden-only endpoint, requires `X-Internal-Token` header.

---

## ⚙️ Environment Variables

### Backend (`backend/src/main/resources/application.yml`)

```yaml
spring:
  data:
    mongodb:
      uri: ${MONGO_URI:mongodb://localhost:27017/hostelflow}

hostelflow:
  jwt:
    secret: ${JWT_SECRET:your-256-bit-secret}
    expiry-ms: 3600000         # 1 hour
    refresh-expiry-ms: 604800000  # 7 days
  ai-service:
    url: ${AI_SERVICE_URL:http://localhost:8000}
    enabled: ${AI_ENABLED:true}
  notifications:
    email:
      from: noreply@hostelflow.com
      smtp-host: ${SMTP_HOST:smtp.gmail.com}
      smtp-port: 587
      username: ${SMTP_USER}
      password: ${SMTP_PASS}
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_APP_NAME=HostelFlow AI
```

### Docker (`docker-compose.yml` overrides)

```env
MONGO_URI=mongodb://mongo:27017/hostelflow
AI_SERVICE_URL=http://ai-service:8000
JWT_SECRET=change-this-in-production-use-256-bit-key
```

---

## 📱 Demo Flow

### End-to-End Walkthrough

```
1. Student applies for leave
   └─ Fills form: destination, dates, reason, parent contact

2. Warden reviews application
   └─ AI risk score displayed alongside application
   └─ Approves or rejects with optional notes

3. Parent receives notification
   └─ Email with deep link → one-click approve/reject
   └─ (Or logs in to parent dashboard)

4. QR Pass generated
   └─ Student receives QR code valid for leave window only

5. Gate check-out
   └─ Guard scans QR → timestamp logged → status: ON_LEAVE

6. Gate check-in
   └─ Guard scans QR on return → timestamp logged → status: RETURNED
   └─ If late: LATE flag set, risk factors updated in AI model

7. Warden analytics updated
   └─ Occupancy, risk scores, leave trends refreshed in real-time
```

### High-Risk Escalation Flow

```
Student returns late (>30 min overdue)
         │
         ▼
  Scheduler detects overdue (every 5 min)
         │
         ▼
  Push notification → Student
         │
  Wait 30 minutes — still not returned
         │
         ▼
  Email + Push → Warden
         │
  Wait 60 minutes — still missing
         │
         ▼
  SMS + Email → Parent (emergency contact)
         │
         ▼
  AI risk score recalculated → HIGH
  Warden dashboard alert displayed
```

---

## 🛠️ Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `mvnw: Permission denied` | Missing execute bit | `chmod +x backend/mvnw` |
| `mvnw` not found | First clone, no wrapper | `run-all.sh` auto-generates it; or `mvn wrapper:wrapper` in `/backend` |
| Python 3.13 `pydantic-core` build error | Wheels not yet published for 3.13 | Use Docker (`uses python:3.10`), or `pyenv` to switch to 3.11 |
| `mongosh: command not found` | Mongo tools not installed | `brew install mongodb-database-tools` (macOS) |
| Frontend shows 404 on routes | Node modules missing | `cd frontend && npm ci` |
| Backend `Connection refused :27017` | MongoDB not running | `brew services start mongodb-community` or `sudo systemctl start mongod` |
| JWT `401 Unauthorized` on all requests | Expired token | Re-login; or check `hostelflow.jwt.expiry-ms` |
| AI service not responding | Python deps or port conflict | Check `localhost:8000/docs`; backend falls back automatically |
| Docker `port already in use` | Local service on same port | `lsof -i :8080` then kill, or change port in `docker-compose.yml` |

---

## 🤝 Contributing

Contributions are welcome! Please read the guidelines before submitting a PR.

```bash
# Fork and clone
git clone https://github.com/your-username/hostelflow-ai.git
cd hostelflow-ai

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then test
docker-compose up -d
# Run tests
cd backend && ./mvnw test
cd frontend && npm run test

# Commit with conventional commits
git commit -m "feat: add bulk leave approval for wardens"

# Push and open a PR against main
git push origin feature/your-feature-name
```

**Areas we'd love help with:**
- 📲 React Native mobile app
- 🌐 Multilingual support (Hindi, Tamil, etc.)
- 📊 Advanced analytics (predictive occupancy)
- 🧪 Increasing test coverage (currently ~60%)
- 🔔 WhatsApp / SMS notification channels

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

**HostelFlow AI** — Built with ❤️ for students, wardens, and parents everywhere.

[Report Bug](https://github.com/your-org/hostelflow-ai/issues) · [Request Feature](https://github.com/your-org/hostelflow-ai/issues) · [Documentation](https://hostelflow.dev/docs)

</div>
**Frontend 404:** `npm ci` in frontend/

---

## 📱 Demo Flow
1. Student applies leave → Warden approves → Parent OK → QR generated
2. Gate scans QR (in/out) → Auto risk update
3. Late >5x → HIGH risk → Warden alert

**Production Ready 🚀**

*HostelFlow AI — Complete hostel management system.*

