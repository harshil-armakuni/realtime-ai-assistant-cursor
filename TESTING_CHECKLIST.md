# ✅ Testing Checklist - AI Meeting Assistant

Use this checklist to verify everything works before your first client meeting.

## Pre-Flight Checks

### 1. Environment Setup
- [ ] `.env` file exists with valid `OPENAI_API_KEY`
- [ ] Python virtual environment created (`.venv/` directory exists)
- [ ] All Python packages installed: `/workspace/.venv/bin/pip list`
- [ ] All Node packages installed: `ls frontend/node_modules/`
- [ ] Screenshots directory exists: `ls -la backend/screenshots/`

### 2. Backend Health Check

Start the backend:
```bash
cd backend
/workspace/.venv/bin/python app.py
```

Expected output:
```
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test endpoints:
```bash
# In another terminal
curl http://localhost:8000/
# Should return: {"message":"AI Meeting Assistant API","status":"running"}

curl -X POST http://localhost:8000/api/session/token
# Should return token information (or error if API key invalid)
```

### 3. Frontend Health Check

Start the frontend:
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open browser: http://localhost:5173/

- [ ] Page loads without errors
- [ ] UI is visible with header "AI Meeting Assistant"
- [ ] Control panel visible on left
- [ ] Messages panel visible on right

## Feature Testing

### 4. Microphone Permission

- [ ] Click "Start Recording" button
- [ ] Browser asks for microphone permission
- [ ] Grant permission
- [ ] Status changes to "Getting token..."
- [ ] Status changes to "Connecting to OpenAI..."
- [ ] Status changes to "Connected - Listening..."
- [ ] Green dot appears next to status
- [ ] Audio level bar shows activity when you speak

### 5. Audio Recognition (English)

Speak clearly into microphone:
```
"Hello, can you hear me?"
```

Expected:
- [ ] Your speech appears in blue box (user message)
- [ ] Transcription shows "Hello, can you hear me?" or similar
- [ ] AI responds in cyan box (assistant message)
- [ ] Response is appropriate to your greeting

### 6. Question Detection (English)

Ask a simple question:
```
"What is two plus two?"
```

Expected:
- [ ] Question transcribed correctly
- [ ] AI provides brief answer (2-3 sentences)
- [ ] Answer is accurate ("Four" or "2+2=4")

### 7. Detailed Response

Request detailed information:
```
"Explain photosynthesis in detail"
```

Expected:
- [ ] Question transcribed
- [ ] AI provides longer, detailed explanation (5+ sentences)
- [ ] Response includes key concepts

### 8. Hindi Language Support

Speak in Hindi:
```
"क्या आप मुझे सुन सकते हैं?"
(Can you hear me?)
```

Expected:
- [ ] Hindi text transcribed correctly
- [ ] Language badge shows "Hindi"
- [ ] AI responds appropriately (in English or Hindi)

### 9. Gujarati Language Support

Speak in Gujarati:
```
"શું તમે મને સાંભળી શકો છો?"
(Can you hear me?)
```

Expected:
- [ ] Gujarati text transcribed correctly
- [ ] Language badge shows "Gujarati"
- [ ] AI responds appropriately

### 10. Screen Capture

Check screen capture:
```bash
# While recording is active
ls -lh backend/screenshots/
```

Expected:
- [ ] New `.jpg` files appear every ~2 seconds
- [ ] Files named like `screen_20241007_143052_123456.jpg`
- [ ] File sizes reasonable (100KB - 500KB each)
- [ ] After a minute, should have ~30 screenshots

### 11. Screen Analysis

- [ ] Click "Analyze Screen" button
- [ ] Status changes to "Analyzing screen..."
- [ ] Within 3-5 seconds, analysis appears in cyan box
- [ ] Analysis describes what's visible on your screen
- [ ] Badge shows "source: screen-analysis"

### 12. Stop Recording

- [ ] Click "Stop Recording" button
- [ ] Status changes to "Ready"
- [ ] Green dot disappears
- [ ] Audio level bar goes to zero
- [ ] System message appears: "Recording stopped"

### 13. Clear Messages

- [ ] Click "Clear" button
- [ ] All messages disappear
- [ ] Empty state shows: "Click Start Recording to begin"

## Advanced Testing

### 14. Multiple Languages in One Session

- [ ] Start recording
- [ ] Speak English: "Hello"
- [ ] Speak Hindi: "नमस्ते"
- [ ] Speak Gujarati: "નમસ્તે"
- [ ] All three transcribed correctly with language badges
- [ ] AI responds appropriately to each

### 15. Complex Question

Ask something requiring context:
```
"I have a dataset with 1000 rows and 50 columns. 
Some columns have missing values. 
How should I handle this for machine learning?"
```

Expected:
- [ ] Full question transcribed
- [ ] AI provides detailed, thoughtful answer
- [ ] Response mentions multiple strategies
- [ ] Professional tone suitable for client meeting

### 16. Screen Context Question

While displaying a chart/graph on screen:
```
"What patterns do you see in this chart?"
```

- [ ] Click "Analyze Screen" first
- [ ] Then ask the question verbally
- [ ] AI can reference the screen content
- [ ] Response is relevant to what's displayed

### 17. Rapid-Fire Questions

Ask 3 questions in quick succession:
```
"What is Python?"
[wait for response]
"What is JavaScript?"
[wait for response]
"Which one should I learn first?"
```

Expected:
- [ ] All three questions transcribed
- [ ] Three separate AI responses
- [ ] Responses maintain context
- [ ] No errors or crashes

### 18. Long Session Test

- [ ] Start recording
- [ ] Leave running for 5 minutes
- [ ] Speak occasionally
- [ ] Check screenshot count: `ls backend/screenshots/ | wc -l`
- [ ] Should have ~150 screenshots (30 per minute)
- [ ] Memory usage reasonable: `ps aux | grep python`
- [ ] No errors in console

## Performance Checks

### 19. Response Latency

Time the response:
```
Ask: "What time is it?"
```

- [ ] Response starts within 1-2 seconds
- [ ] Complete response within 5 seconds
- [ ] Acceptable for real-time conversation

### 20. UI Responsiveness

- [ ] No lag when scrolling messages
- [ ] Buttons respond immediately
- [ ] No visual glitches
- [ ] Audio level bar updates smoothly

## Error Handling

### 21. Invalid API Key

- [ ] Edit `.env` and change API key to invalid
- [ ] Restart backend
- [ ] Try to start recording
- [ ] Should show clear error message
- [ ] App doesn't crash

### 22. Network Interruption

- [ ] Start recording
- [ ] Disconnect from internet
- [ ] Speak into microphone
- [ ] Should show connection error
- [ ] Reconnect internet
- [ ] Can restart recording

### 23. Microphone Denied

- [ ] Deny microphone permission in browser
- [ ] Should show clear error message
- [ ] Instructions to enable permission

## Production Readiness

### 24. Security Check

- [ ] `.env` file not committed to git: `git status`
- [ ] No API keys in logs
- [ ] Screenshots directory not committed
- [ ] CORS properly configured

### 25. Clean Shutdown

- [ ] Press Ctrl+C on backend
- [ ] Server stops gracefully
- [ ] No error messages
- [ ] Press Ctrl+C on frontend
- [ ] Frontend stops cleanly

### 26. Restart Test

- [ ] Stop both servers
- [ ] Use start script: `./start.sh`
- [ ] Both servers start successfully
- [ ] Can connect and use immediately

## Client Meeting Checklist

Before the meeting:

- [ ] Test microphone quality
- [ ] Test with sample questions
- [ ] Verify screen capture working
- [ ] Check internet speed (>10 Mbps recommended)
- [ ] Close unnecessary applications
- [ ] Clear old screenshots: `rm -rf backend/screenshots/*`
- [ ] Prepare emergency backup (phone, notes)

During the meeting:

- [ ] Start recording before client joins
- [ ] Test audio with "Hello, testing"
- [ ] Keep browser tab active
- [ ] Monitor status indicator
- [ ] Use "Analyze Screen" strategically

After the meeting:

- [ ] Stop recording
- [ ] Save important responses (copy/paste)
- [ ] Review screenshots if needed
- [ ] Clear sensitive screenshots
- [ ] Note any issues for improvement

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| No microphone | Check browser permissions, reload page |
| Can't connect | Verify API key, check internet |
| Slow responses | Check network, close other apps |
| Screen capture fails | Check screenshots directory exists |
| UI frozen | Hard refresh browser (Ctrl+Shift+R) |
| Backend error | Check logs, restart backend |

## Success Criteria

You're ready for production when:

✅ All basic tests pass
✅ All language tests pass  
✅ Screen capture working reliably
✅ Response latency < 3 seconds
✅ No errors in 5-minute session
✅ Clean startup/shutdown
✅ Error messages clear and helpful

---

**Passed all checks?** You're ready for your first client meeting! 🎉