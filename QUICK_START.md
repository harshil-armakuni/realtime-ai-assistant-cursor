# ⚡ Quick Start - AI Meeting Assistant

**Everything is ready!** You just need to add your OpenAI API key.

## 1️⃣ Add Your API Key (30 seconds)

Open `.env` file and replace with your actual API key:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

Save the file.

## 2️⃣ Start the Application (1 command)

```bash
./start.sh
```

That's it! The script will:
- ✅ Activate Python virtual environment
- ✅ Install any missing dependencies
- ✅ Start backend server (port 8000)
- ✅ Start frontend server (port 5173)

## 3️⃣ Open in Browser

Navigate to: **http://localhost:5173**

## 4️⃣ Use It

1. Click **"Start Recording"**
2. Allow microphone access
3. Start speaking (English, Hindi, or Gujarati)
4. Get AI responses in real-time
5. Click **"Analyze Screen"** for screen insights
6. Click **"Stop Recording"** when done

---

## Alternative: Manual Start

If `./start.sh` doesn't work, use two terminals:

**Terminal 1 - Backend:**
```bash
/workspace/.venv/bin/python backend/app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

---

## Quick Test

Once running, try this:

1. Click "Start Recording"
2. Say: **"Hello, can you hear me?"**
3. You should see:
   - Your text transcribed in blue box
   - AI response in cyan box
   - Status shows "Connected - Listening..."

## Sample Questions to Try

### Brief Answers (Auto-detected)
- "What is Python?"
- "How does Wi-Fi work?"
- "क्या यह सही है?" (Hindi: Is this correct?)

### Detailed Answers (When you ask)
- "Explain machine learning in detail"
- "Tell me more about quantum computing"
- "Give me a detailed breakdown"

### Screen Analysis
1. Open a chart/document/code
2. Click "Analyze Screen"
3. Ask: "What do you see here?"

## Features at a Glance

| Feature | Description |
|---------|-------------|
| 🎤 **Real-time Audio** | Speaks to OpenAI directly via WebRTC |
| 🌍 **Multi-language** | English, Hindi, Gujarati auto-detected |
| 📸 **Screen Capture** | Every 2 seconds, stored locally |
| 🧠 **Smart Responses** | Brief or detailed based on question type |
| 🔒 **Private** | All data local, only sent to OpenAI API |
| ⚡ **Fast** | < 300ms latency for responses |

## Project Structure

```
/workspace/
├── backend/               # Python FastAPI server
│   ├── app.py            # Main server code
│   └── screenshots/      # Screen captures (auto-created)
├── frontend/             # React application
│   ├── src/App.jsx      # Main UI component
│   └── node_modules/    # Dependencies (installed)
├── .venv/               # Python virtual env (ready)
├── .env                 # ⚠️ ADD YOUR API KEY HERE
└── start.sh            # One-command startup
```

## Troubleshooting

### "OpenAI API key not configured"
→ Edit `.env` file, add your API key, restart backend

### "Permission denied: ./start.sh"
→ Run: `chmod +x start.sh`

### "Port 8000 already in use"
→ Stop other services: `lsof -ti:8000 | xargs kill -9`

### Microphone not working
→ Check browser permissions, reload page

## Documentation

- 📖 **Full README**: `README.md` - Complete documentation
- 🚀 **Setup Guide**: `SETUP_GUIDE.md` - Detailed setup instructions
- ✅ **Testing**: `TESTING_CHECKLIST.md` - Complete testing checklist

## Need Help?

1. Check browser console (F12) for errors
2. Check backend logs in terminal
3. Review `SETUP_GUIDE.md` for detailed troubleshooting
4. Ensure OpenAI API key has GPT-4o access

## Cost Estimate

Approximate OpenAI API costs:
- **Audio (Realtime API)**: ~$0.06/minute
- **Screen Analysis (Vision)**: ~$0.01/image
- **Example 1-hour meeting**: ~$3-4 total

## Next Steps

Once comfortable with basic usage:

1. ✅ Test all features (see `TESTING_CHECKLIST.md`)
2. ✅ Customize AI instructions in `frontend/src/App.jsx`
3. ✅ Adjust screenshot interval in `backend/app.py`
4. ✅ Use in real client meeting
5. ✅ Gather feedback and iterate

---

## Production Checklist

Before first client meeting:

- [ ] Tested microphone quality
- [ ] Verified screen capture works
- [ ] Tested sample questions
- [ ] Good internet connection (10+ Mbps)
- [ ] Browser is Chrome/Edge (best WebRTC support)
- [ ] Closed unnecessary applications
- [ ] Reviewed privacy/security settings

---

**Ready?** Add your API key to `.env` and run `./start.sh` 🚀

Questions? Check `SETUP_GUIDE.md` for detailed help.