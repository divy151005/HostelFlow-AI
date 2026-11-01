# HostelFlow: Development Workflow and Remaining Work

This repository contains a working full-stack implementation, but it has not yet been verified as production ready. Use this workflow to run and evaluate it locally.

## Local development workflow

### 1. Choose a run mode

**Docker full stack (recommended for a first run):**

```bash
docker compose up --build
```

Open `http://localhost:3000`. Stop the stack with `docker compose down`. Add `-v` only when you intentionally want to delete the MongoDB volume and its data.

**Local development:**

Prerequisites: Java 17, Node.js/npm, MongoDB, and optionally Python for the AI service.

```bash
# Start MongoDB separately, then seed a fresh/local database if needed:
mongosh hostelflow < database/seed.js

# Start frontend and backend:
./run-all.sh
```

The local script starts MongoDB only if `mongod` is installed and port 27017 is unused. It starts the backend and frontend; it does not start the AI service. Stop processes with `./stop-all.sh`. To run AI locally, use a Python environment and `ai-service/requirements.txt`, then start the FastAPI app on port 8000.

### 2. Exercise the end-to-end role flows

Seeded demo accounts use password `password`:

| Role | Account |
| --- | --- |
| Student | `student@hostelflow.com` |
| Mentor | `mentor@hostelflow.com` |
| Warden | `warden@hostelflow.com` |
| Parent | `parent@hostelflow.com` |

Walk through: student applies for leave → mentor reviews (where required) → warden approves → parent approves if applicable → student views pass/history → gate scans QR → warden checks dashboard and analytics. Also check rejection/cancellation, invalid or repeated scans, expired passes, and late-return cases.

### 3. Before calling a release ready

Build each service, run backend/frontend/API and role-flow checks, verify Docker startup from a clean database, inspect logs and failure paths, then deploy only with environment-specific secrets and configuration. Record any failed step as an issue and fix it before release.

## Remaining work (prioritized)

### P0 — Release blockers

- [ ] Add automated backend, frontend, and API integration tests for authentication/authorization and the complete leave approval and QR scan lifecycle.
- [ ] Verify actual behavior against each role flow, especially mentor/parent approval ordering, QR validity and replay handling, and late-return detection; README describes features but that alone is not verification.
- [ ] Remove hard-coded JWT secrets and local-only settings from committed configuration. Require strong environment-provided secrets in deployment and define production CORS/database settings.
- [ ] Review registration and role assignment: confirm users cannot self-register as privileged roles or link themselves to arbitrary students.
- [ ] Make startup/shutdown reliable: `run-all.sh` currently does not start the AI service, while its comments/README describe broader startup behavior. Check child-process cleanup, readiness, and failure handling.
- [ ] Validate Docker build and a clean first boot. Confirm database seeding works as expected and document persistent-volume/reset behavior.

### P1 — Operational readiness

- [ ] Add CI for Java, frontend, and Python builds plus automated checks.
- [ ] Add structured production logging, health/readiness endpoints, and clear AI-service timeout/fallback behavior.
- [ ] Configure real notification delivery or clearly label notifications as in-app only; the current FCM token endpoint does not itself demonstrate delivery setup.
- [ ] Add database indexes, backup/restore guidance, and retention/privacy handling for student data.
- [ ] Review token storage/refresh, rate limiting, input validation, error responses, and security headers before public deployment.
- [ ] Document environment variables, supported runtime versions, deployment steps, and troubleshooting based on verified behavior.

### P2 — Product polish

- [ ] Check every page for loading, empty, error, and mobile states; add a not-found route and accessible form feedback.
- [ ] Confirm analytics definitions and AI risk scoring are understandable and actionable for wardens.
- [ ] Remove stale/temporary files and ensure local database, logs, PID files, build outputs, and secrets are ignored by Git.
- [ ] Align README claims and run instructions with tested functionality and actual startup scripts.

## Current codebase notes

- The app has React role pages, Spring Boot controllers/services, MongoDB seed data, and a FastAPI AI service.
- `run-all.sh` starts MongoDB (when available), backend, and frontend, but not AI; `stop-all.sh` is also present.
- `docker-compose.yml` declares MongoDB, backend, AI, and frontend services.
- The repository currently has no files under `backend/src/test` and no frontend test script in `frontend/package.json`; automated coverage remains to be added.
- Treat demo credentials and the checked-in JWT secret as development-only. Do not deploy them.
