# AI Meeting Assistant - Usage Guide

## Quick Start

### 1. Setup (First Time Only)

1. **Add your OpenAI API Key**
   ```bash
   # Edit .env file and add your API key
   nano .env
   # Change: OPENAI_API_KEY=your_openai_api_key_here
   # To:     OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```
   This will:
   - Create Python virtual environment (.venv)
   - Install all Python dependencies
   - Install all Node.js dependencies
   - Create storage directory for screenshots

### 2. Start the Application

**Option A: Start Everything at Once (Recommended)**
```bash
./start_all.sh
```
This starts both backend and frontend together.

**Option B: Start Services Separately**

Terminal 1 (Backend):
```bash
./start_backend.sh
```

Terminal 2 (Frontend):
```bash
./start_frontend.sh
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### 4. Using the Application

1. **Click "Start Recording"**
   - Your browser will ask for microphone permission - click "Allow"
   - The backend will start capturing your screen every 2 seconds
   - Audio transcription will begin

2. **Have Your Meeting**
   - Speak naturally - the app supports English, Hindi, and Gujarati
   - Questions will be automatically detected
   - AI will provide intelligent answers based on:
     - Your audio conversation
     - Screen content visible at that moment

3. **View Results**
   - **Left Panel**: Live transcript of your conversation
   - **Right Panel**: AI-generated answers
     - ⚡ Brief answers for simple questions
     - 📚 Detailed answers for complex questions

4. **Click "Stop Recording"** when done
   - All screen captures are saved in `storage/screenshots/`

## Features Explained

### Automatic Question Detection

The app automatically detects when you or your client asks a question based on:
- Question marks in speech
- Question words: "what", "how", "why", "when", "where", "who"
- Tone and context

### Smart Answer Types

**Brief Answers** (⚡) - Triggered by:
- "What is..."
- "When..."
- "Who..."
- Simple yes/no questions

**Detailed Answers** (📚) - Triggered by:
- "Explain..."
- "How does..."
- "Why..."
- "Describe..."
- "Tell me about..."

### Multi-Language Support

The application supports speech recognition in:
- **English** (en-US)
- **Hindi** (hi-IN)
- **Gujarati** (gu-IN)

To change the language, modify the `lang` parameter in `frontend/src/App.jsx` (line ~180).

### Screen Capture

- Captures every 2 seconds automatically
- Stores locally in `storage/screenshots/`
- Keeps last 10 screenshots in memory for quick access
- When a question is detected, analyzes the latest screenshot for context

## API Endpoints

The backend provides these endpoints:

- `GET /` - Health check
- `POST /api/session/token` - Get session token
- `POST /api/capture/start` - Start screen capture
- `POST /api/capture/stop` - Stop screen capture
- `GET /api/capture/status` - Get capture status
- `POST /api/analyze/screen` - Analyze screen content
- `POST /api/answer` - Get intelligent answer
- `WS /ws/meeting` - WebSocket for real-time updates

## Troubleshooting

### Backend won't start

**Error: Virtual environment not found**
```bash
./setup.sh
```

**Error: .env file not found**
```bash
cp .env.example .env  # If .env.example exists
# OR
echo "OPENAI_API_KEY=your_key_here" > .env
```

**Error: Port 8000 already in use**
```bash
# Find and kill the process using port 8000
sudo lsof -t -i:8000 | xargs kill -9
```

### Frontend won't start

**Error: node_modules not found**
```bash
cd frontend
npm install
```

**Error: Port 5173 already in use**
```bash
# The frontend will automatically try port 5174 if 5173 is busy
# Or kill the process using port 5173
sudo lsof -t -i:5173 | xargs kill -9
```

### Audio not working

1. **Check browser permissions**
   - Click the lock icon in your browser's address bar
   - Ensure microphone is allowed

2. **Browser compatibility**
   - Chrome/Edge: Full support ✅
   - Firefox: Full support ✅
   - Safari: Partial support ⚠️

3. **Check audio input**
   ```bash
   # Test if microphone is working
   arecord -l  # List recording devices
   ```

### Screen capture not working

1. **Check permissions**
   ```bash
   # Ensure storage directory exists
   ls -la storage/screenshots/
   ```

2. **Check backend logs**
   - Look for errors in the terminal running the backend
   - Common issues:
     - No display server (if running headless)
     - Permission denied for screen access

### Connection errors

**Backend and Frontend not communicating**

1. Check both are running:
   ```bash
   curl http://localhost:8000/
   curl http://localhost:5173/
   ```

2. Check CORS settings in `backend/main.py`

3. Check proxy settings in `frontend/vite.config.js`

### OpenAI API errors

**Invalid API Key**
```bash
# Verify your .env file
cat .env
# Should show: OPENAI_API_KEY=sk-proj-xxxxx
```

**Rate limit exceeded**
- Your OpenAI account has reached its rate limit
- Wait a few minutes or upgrade your plan

**Model not available**
- Ensure your OpenAI account has access to GPT-4o
- Check OpenAI dashboard for model availability

## Performance Tips

1. **Screen Capture Frequency**
   - Default: Every 2 seconds
   - To change: Edit `backend/main.py` line ~82: `await asyncio.sleep(2)`

2. **Screenshot Quality**
   - Default: 85% JPEG quality
   - To change: Edit `backend/main.py` line ~70: `quality=85`

3. **Memory Usage**
   - Default: Keeps last 10 screenshots in memory
   - To change: Edit `backend/main.py` line ~75: `if len(latest_screenshots) > 10`

## Security & Privacy

- ✅ All screen captures stored locally
- ✅ No data sent to third parties (except OpenAI API)
- ✅ API key stored securely in .env file (not in git)
- ⚠️ Remember to clear `storage/screenshots/` periodically
- ⚠️ Never commit .env file to version control

## Cleaning Up

**Clear screenshots**
```bash
rm -rf storage/screenshots/*
```

**Stop all services**
```bash
# If using start_all.sh, press Ctrl+C

# Or manually:
pkill -f "python backend/main.py"
pkill -f "npm run dev"
```

## Advanced Usage

### Custom System Prompts

Edit `backend/main.py` around line ~175 to customize the AI's behavior:
```python
system_prompt = "You are a helpful meeting assistant. [Add your custom instructions here]"
```

### Adding More Languages

In `frontend/src/App.jsx`, modify the speech recognition setup:
```javascript
recognition.lang = 'hi-IN'; // Hindi
// or
recognition.lang = 'gu-IN'; // Gujarati
// or create language selector UI
```

### Export Meeting Notes

Add this function to save transcripts:
```javascript
const exportTranscript = () => {
  const blob = new Blob([transcript], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meeting-${Date.now()}.txt`;
  a.click();
};
```

## Support

For issues:
1. Check this guide's troubleshooting section
2. Check browser console for errors (F12)
3. Check backend terminal for errors
4. Review the README.md file

## Development

**Backend Development**
```bash
source .venv/bin/activate
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Development**
```bash
cd frontend
npm run dev
```

**Production Build**
```bash
cd frontend
npm run build
# Static files in frontend/dist/
```

## License

MIT - Free to use for personal or commercial projects