#!/bin/bash

# HostelFlow AI - Stop All Services

if [ -f .hostelflow_pids ]; then
    PIDS=$(cat .hostelflow_pids)
    echo "🛑 Stopping HostelFlow services (PIDs: $PIDS)..."
    kill $PIDS 2>/dev/null || true
    rm -f .hostelflow_pids
    echo "✅ All services stopped"
else
    echo "ℹ️  No PID file found. Killing common processes..."
    pkill -f uvicorn || true
    pkill -f "spring-boot" || true
    pkill -f vite || true
    echo "✅ Manual cleanup complete"
fi

if [ -f .mongod_pid ]; then
    MONGOD_PID=$(cat .mongod_pid)
    echo "🛑 Stopping MongoDB (PID: $MONGOD_PID)..."
    kill "$MONGOD_PID" 2>/dev/null || true
    rm -f .mongod_pid
    echo "✅ MongoDB stopped"
fi

echo ""
echo "🔄 Run ./run-all.sh to restart"
