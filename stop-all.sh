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

echo ""
echo "🔄 Run ./run-all.sh to restart"

