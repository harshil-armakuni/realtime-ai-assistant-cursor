#!/bin/bash

echo "🚀 Starting AI Meeting Assistant Backend..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it and add your OPENAI_API_KEY."
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Create storage directory if it doesn't exist
mkdir -p storage/screenshots

# Start the backend
echo "✅ Starting FastAPI backend on http://localhost:8000"
python backend/main.py