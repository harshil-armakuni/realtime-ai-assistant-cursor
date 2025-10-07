# 🚀 Quick Setup Guide - AI Meeting Assistant

## One-Time Setup (5 minutes)

### Step 1: Add Your OpenAI API Key

Open the `.env` file and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important**: Make sure your OpenAI account has access to:
- GPT-4o Realtime API (for audio)
- GPT-4o Vision API (for screen analysis)

### Step 2: Install Dependencies

The Python virtual environment and all dependencies are already installed in `.venv/`

If you need to reinstall:

```bash
# Python dependencies (already done)
/workspace/.venv/bin/pip install -r backend/requirements.txt

# Node.js dependencies (already done)
cd frontend && npm install
```

## Running the Application

### Option 1: Using the Start Script (Recommended)

```bash
./start.sh
```

This will:
- Activate Python virtual environment
- Start backend on `http://localhost:8000`
- Start frontend on `http://localhost:5173`
- Open both in parallel

Press `Ctrl+C` to stop all servers.

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
/workspace/.venv/bin/python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Using the Application

1. **Open Browser**: Navigate to `http://localhost:5173`

2. **Click "Start Recording"**:
   - Grants microphone permission (browser will ask)
   - Starts screen capture (every 2 seconds)
   - Connects to OpenAI Realtime API via WebRTC

3. **Start Speaking**:
   - Speak naturally in English, Hindi, or Gujarati
   - Ask questions like:
     - "What is this chart showing?"
     - "Explain this in detail"
     - "क्या यह सही है?" (Hindi)
     - "આ શું છે?" (Gujarati)

4. **View Responses**:
   - Transcriptions appear in real-time
   - AI responses stream back
   - Brief answers for simple questions
   - Detailed explanations when requested

5. **Analyze Screen** (Optional):
   - Click "Analyze Screen" button
   - AI analyzes current screen content
   - Provides summary and insights

6. **Stop Recording**:
   - Click "Stop Recording" when done
   - Closes connections and stops capture

## Features in Action

### Smart Question Detection

The AI automatically detects:

**English**: what, why, how, when, where, who, can you, could you
**Hindi**: क्या, कैसे, कब, क्यों, कहाँ, कौन
**Gujarati**: શું, કેવી રીતે, ક્યારે, શા માટે, ક્યાં, કોણ

### Response Intelligence

- **Brief Mode** (Default): 2-3 sentence answers
- **Detailed Mode**: Triggered by:
  - "Explain in detail"
  - "Tell me more"
  - Complex multi-part questions
  - "Give me a detailed explanation"

### Screen Capture

- Automatic: Every 2 seconds while recording
- Storage: `backend/screenshots/` directory
- Auto-cleanup: Keeps last 10 screenshots
- Privacy: All stored locally, only sent to OpenAI when analyzing

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   React App     │◄────────│  FastAPI Backend │
│  (Port 5173)    │  HTTP   │   (Port 8000)    │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ WebRTC                    │ Screen
         │ (Audio)                   │ Capture
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│  OpenAI         │         │ Local Screenshots│
│  Realtime API   │         │   (backend/      │
│  (gpt-4o)       │         │   screenshots/)  │
└─────────────────┘         └──────────────────┘
```

### Why This Architecture?

1. **WebRTC Direct to OpenAI**: Ultra-low latency (< 300ms) for audio
2. **Local Screen Capture**: Privacy-first, you control the data
3. **Ephemeral Tokens**: Secure, temporary authentication
4. **Separate Frontend/Backend**: Scalable, production-ready design

## Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution**: 
1. Check `.env` file exists in project root
2. Verify `OPENAI_API_KEY=sk-...` is set
3. Restart backend server

### Issue: Microphone not working

**Solution**:
1. Grant browser microphone permission
2. Check browser console for errors
3. Try different browser (Chrome recommended)
4. Check system audio settings

### Issue: "Failed to connect to Realtime API"

**Solution**:
1. Verify API key has Realtime API access
2. Check OpenAI account has sufficient credits
3. Review browser console for detailed errors
4. Check network connectivity

### Issue: Screen capture failing

**Solution**:
1. Check backend logs: `backend/screenshots/` directory exists
2. Verify `mss` package installed: `/workspace/.venv/bin/pip list | grep mss`
3. On Linux: May need X11 or Wayland support
4. Check file permissions

### Issue: Slow responses

**Possible causes**:
1. Network latency to OpenAI servers
2. API rate limits
3. Screen analysis with large images
4. Check backend logs for timing info

## Best Practices

### For Client Meetings

1. **Test Before Meeting**:
   - Start app 5 minutes before
   - Test microphone with sample question
   - Verify screen capture working

2. **Privacy Considerations**:
   - All screenshots stored locally in `backend/screenshots/`
   - Only sent to OpenAI when "Analyze Screen" clicked
   - Clear screenshots after meeting if needed: `rm -rf backend/screenshots/*`

3. **Language Switching**:
   - No configuration needed
   - Just speak in any supported language
   - AI auto-detects and responds appropriately

4. **Optimize Performance**:
   - Close unnecessary applications
   - Use wired internet connection
   - Keep browser tab active

### Production Deployment

For actual production use:

1. **Security**:
   - Use HTTPS (Let's Encrypt)
   - Set strong CORS policies
   - Implement rate limiting
   - Use environment-specific configs

2. **Scaling**:
   - Use Gunicorn/uWSGI for Python backend
   - Build frontend: `npm run build`
   - Serve with nginx
   - Consider Redis for session management

3. **Monitoring**:
   - Setup logging aggregation
   - Monitor API usage and costs
   - Track response times
   - Alert on errors

## API Endpoints

### Backend (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/session/token` | POST | Generate OpenAI ephemeral token |
| `/api/recording/start` | POST | Start screen capture |
| `/api/recording/stop` | POST | Stop screen capture |
| `/api/recording/status` | GET | Get recording status |
| `/api/analyze/screen` | POST | Analyze current screen with GPT-4o Vision |
| `/api/screenshots/latest` | GET | Get latest screenshot info |

### Frontend (Port 5173)

Single-page React application with WebRTC integration.

## File Structure

```
/workspace/
├── backend/
│   ├── app.py                 # FastAPI server
│   ├── requirements.txt       # Python dependencies
│   └── screenshots/           # Auto-created, local storage
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── App.css           # Styling
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite config
│   └── index.html            # HTML template
├── .venv/                     # Python virtual environment
├── .env                       # Your API key (DO NOT COMMIT)
├── .env.example              # Template
├── start.sh                  # Startup script
├── README.md                 # Main documentation
└── SETUP_GUIDE.md           # This file
```

## Cost Estimation

Approximate costs for OpenAI API:

- **Realtime API**: ~$0.06/minute of audio
- **Vision API**: ~$0.01 per image analyzed
- **Example**: 1-hour meeting with 5 screen analyses ≈ $3.60 + $0.05 = ~$3.65

Check current pricing: https://openai.com/pricing

## Support & Resources

- **OpenAI Realtime API**: https://platform.openai.com/docs/guides/realtime
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **WebRTC**: https://webrtc.org/

## Next Steps

Once you're comfortable:

1. Customize the AI instructions in `frontend/src/App.jsx` (line ~173)
2. Adjust screenshot interval in `backend/app.py` (line ~95)
3. Add custom analysis prompts for your specific use case
4. Integrate with your existing tools (CRM, notes, etc.)

---

**Ready to start?** Run `./start.sh` and open http://localhost:5173 🚀