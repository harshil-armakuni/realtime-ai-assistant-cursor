#!/bin/bash

echo "🚀 Starting AI Meeting Assistant (Backend + Frontend)..."

# Check prerequisites
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it and add your OPENAI_API_KEY."
    exit 1
fi

# Start backend in background
echo "Starting backend..."
source .venv/bin/activate
mkdir -p storage/screenshots
python backend/main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Stopped all services"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

echo ""
echo "✅ Services started!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait