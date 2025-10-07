# 🎯 START HERE - AI Meeting Assistant

Welcome! Your complete AI Meeting Assistant is ready to use.

## ⚡ Super Quick Start (3 Commands)

```bash
# 1. Add your OpenAI API key
nano .env
# Change: OPENAI_API_KEY=your_openai_api_key_here
# To:     OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# 2. Start the app
./start_all.sh

# 3. Open browser
# http://localhost:5173
```

That's it! You're ready to go! 🚀

---

## 📖 What You Got

This is a **production-grade** AI meeting assistant with:

✅ **Real-time Transcription** - Speaks English, Hindi (हिन्दी), Gujarati (ગુજરાતી)
✅ **Screen Capture** - Automatically captures every 2 seconds  
✅ **Smart AI Answers** - Detects questions and provides intelligent responses
✅ **Beautiful UI** - Modern, responsive design with animations
✅ **Local Storage** - Privacy-first, stores everything locally
✅ **WebSocket** - Real-time, low-latency communication

---

## 🗂️ Documentation Guide

Depending on what you need:

| I want to... | Read this |
|--------------|-----------|
| **Get started NOW** | `QUICKSTART.md` (1 page) |
| **Learn how to use it** | `USAGE.md` (detailed guide) |
| **Understand the tech** | `PROJECT_INFO.md` (architecture) |
| **See all features** | `README.md` (overview) |
| **Troubleshoot issues** | `USAGE.md` → Troubleshooting |

---

## 🏃 How to Run

### Option 1: Everything at once (Recommended)
```bash
./start_all.sh
```

### Option 2: Separate terminals
**Terminal 1:**
```bash
./start_backend.sh
```

**Terminal 2:**
```bash
./start_frontend.sh
```

---

## 🎯 First Time Using?

1. **Start Recording** (click the button)
2. **Allow microphone** (browser will ask)
3. **Ask a question** (speak naturally)
4. **Watch the magic** (AI responds in real-time!)

### Example Questions:
- "What is artificial intelligence?"
- "How does blockchain work?"
- "Explain quantum computing"
- "What's the difference between SQL and NoSQL?"

---

## 🛠️ Project Structure

```
ai-meeting-assistant/
├── backend/           # Python FastAPI server
├── frontend/          # React UI
├── storage/           # Screenshots saved here
├── .venv/            # Python packages
├── .env              # ⚠️ ADD YOUR API KEY HERE
└── *.sh              # Startup scripts
```

---

## 🔧 Tech Stack

**Backend:** Python, FastAPI, OpenAI GPT-4o, Screen Capture  
**Frontend:** React, Vite, Web Speech API  
**AI:** OpenAI GPT-4o + Vision API  
**Ports:** Backend (8000), Frontend (5173)

---

## ⚠️ Before First Run

**REQUIRED:** Add your OpenAI API key to `.env`

```bash
nano .env
```

Get your API key here: https://platform.openai.com/api-keys

---

## 📱 Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Full support |
| Edge | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ⚠️ Partial support |

---

## 🆘 Quick Troubleshooting

**App won't start?**
```bash
# Did you add your API key?
cat .env
```

**No audio?**
- Check browser permissions (lock icon in address bar)
- Allow microphone access

**Port already in use?**
```bash
# Kill the process
sudo lsof -t -i:8000 | xargs kill -9  # Backend
sudo lsof -t -i:5173 | xargs kill -9  # Frontend
```

**Need help?** Read `USAGE.md` → Troubleshooting section

---

## 🎓 Learning Path

1. **Day 1:** Read `QUICKSTART.md` → Start using the app
2. **Day 2:** Read `USAGE.md` → Learn all features  
3. **Day 3:** Read `PROJECT_INFO.md` → Understand the architecture
4. **Day 4+:** Customize and enhance!

---

## 🚀 Next Steps After Running

1. **Test it** - Ask various questions
2. **Check screenshots** - Look in `storage/screenshots/`
3. **Customize** - Edit prompts in `backend/main.py`
4. **Enhance** - Add new features!

---

## 💡 Pro Tips

- Use **Chrome** for best experience
- Speak clearly and naturally
- Check the screen capture folder periodically
- Clear old screenshots to save disk space
- Review `USAGE.md` for advanced features

---

## 🎉 You're All Set!

Run this command to get started:

```bash
./start_all.sh
```

Then open: **http://localhost:5173**

**Happy Meeting! 🎙️✨**

---

## 📞 Need Help?

1. Check `USAGE.md` → Troubleshooting
2. Review browser console (F12)
3. Check backend terminal logs
4. Verify `.env` has your API key

---

Built with ❤️ for productive meetings | MIT License | v1.0.0