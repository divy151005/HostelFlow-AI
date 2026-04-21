#!/bin/bash
# HostelFlow - Simple Dev Command: Backend + Frontend
# FIXED: Maven wrapper + dir checks. Docker best for full stack.

set -e

echo '🏨 HostelFlow START (frontend + backend)'
echo '💡 Full: docker-compose up -d'
echo ''

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

# MongoDB
nc -z localhost 27017 2>/dev/null || { echo -e "${RED}Start MongoDB:27017 first${NC}"; exit 1; }
echo -e "${GREEN}MongoDB ✓${NC}"

# Backend - Maven wrapper
cd backend
if [ ! -f mvnw ]; then
  echo 'Maven wrapper → generating...'
  mvn -N io.takari:maven:wrapper -Dmaven=3.9.6 >/dev/null 2>&1 || mvn -N wrapper:wrapper
fi
./mvnw spring-boot:run &
BACKEND_PID=$!
echo -e "${GREEN}Backend (8080) PID $BACKEND_PID${NC}"
cd ..

# Frontend
if [ ! -d frontend ]; then
  echo -e "${RED}frontend/ missing?${NC}"; exit 1
fi
cd frontend && rm -rf node_modules && npm i && npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend (3000) PID $FRONTEND_PID${NC}"
cd ..

sleep 12
echo ''
echo -e "${GREEN}✅ http://localhost:3000${NC} (login: student@hostelflow.com/password)"
open http://localhost:3000

echo "$BACKEND_PID $FRONTEND_PID" > .hostelflow_pids
echo 'Stop: ./stop-all.sh'

