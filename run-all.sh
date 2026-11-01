#!/bin/bash
# HostelFlow - Simple Dev Command: MongoDB + Backend + Frontend
# FIXED: Maven wrapper + dir checks. Docker best for full stack.

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo '🏨 HostelFlow START (MongoDB + frontend + backend)'
echo '💡 Full: docker-compose up -d'
echo ''

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

# MongoDB
start_mongodb() {
  if nc -z localhost 27017 2>/dev/null; then
    echo -e "${GREEN}MongoDB ✓${NC}"
    return
  fi

  if ! command -v mongod >/dev/null 2>&1; then
    echo -e "${RED}mongod not found. Install/start MongoDB on localhost:27017 first.${NC}"
    exit 1
  fi

  mkdir -p "$ROOT_DIR/.mongo-data" "$ROOT_DIR/logs"
  echo -e "${YELLOW}Starting MongoDB on localhost:27017...${NC}"
  mongod --dbpath "$ROOT_DIR/.mongo-data" \
    --bind_ip 127.0.0.1 \
    --port 27017 \
    --nounixsocket \
    > "$ROOT_DIR/logs/mongod.log" 2>&1 &
  MONGOD_PID=$!
  echo "$MONGOD_PID" > "$ROOT_DIR/.mongod_pid"

  for _ in {1..30}; do
    nc -z localhost 27017 2>/dev/null && {
      echo -e "${GREEN}MongoDB ✓ PID $MONGOD_PID${NC}"
      return
    }
    sleep 1
  done

  echo -e "${RED}MongoDB failed to start. See logs/mongod.log${NC}"
  exit 1
}

seed_mongodb() {
  if ! command -v mongosh >/dev/null 2>&1; then
    echo -e "${YELLOW}mongosh not found; skipping seed check.${NC}"
    return
  fi

  USER_COUNT=$(mongosh --quiet 127.0.0.1:27017/hostelflow --eval 'db.users.countDocuments()' 2>/dev/null || echo 0)
  if [ "$USER_COUNT" = "0" ]; then
    echo -e "${YELLOW}Loading seed data...${NC}"
    mongosh --quiet 127.0.0.1:27017/hostelflow "$ROOT_DIR/database/seed.js"
  fi
}

start_mongodb
seed_mongodb

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
cd frontend && { [ -d node_modules ] || npm i; } && npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend (3000) PID $FRONTEND_PID${NC}"
cd ..

sleep 12
echo ''
echo -e "${GREEN}✅ http://localhost:3000${NC} (login: student@hostelflow.com/password)"
open http://localhost:3000

echo "$BACKEND_PID $FRONTEND_PID" > .hostelflow_pids
echo 'Stop: ./stop-all.sh'
