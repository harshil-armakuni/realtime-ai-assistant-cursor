#!/bin/bash

echo "🚀 Starting AI Meeting Assistant Frontend..."

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start the frontend
echo "✅ Starting React frontend on http://localhost:5173"
cd frontend
npm run dev