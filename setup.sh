#!/bin/bash

echo "🚀 Setting up AI Meeting Assistant..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv .venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "✅ Backend setup complete"

# Install frontend dependencies
echo "📥 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Frontend setup complete"

# Create storage directory
echo "📁 Creating storage directory..."
mkdir -p storage/screenshots

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your OpenAI API key to .env file"
echo "2. Start backend: source .venv/bin/activate && python backend/main.py"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "Happy meeting! 🎉"