# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.10 or higher
- ✅ Node.js 18 or higher  
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 3-Step Setup

### Step 1: Configure API Key

Edit the `.env` file and add your OpenAI API key:

```bash
nano .env
```

Change:
```
OPENAI_API_KEY=your_openai_api_key_here
```

To:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Run Setup

```bash
./setup.sh
```

This will install all dependencies (takes 2-3 minutes).

### Step 3: Start the App

```bash
./start_all.sh
```

Open your browser to: **http://localhost:5173**

## That's It! 🎉

You should see the AI Meeting Assistant interface.

## First Use

1. Click **"Start Recording"**
2. Allow microphone access when prompted
3. Start speaking or ask a question
4. Watch AI responses appear in real-time!

## Example Questions to Try

- "What is artificial intelligence?"
- "How does machine learning work?"
- "Explain the difference between frontend and backend"
- "Who invented Python programming language?"

## Need Help?

- 📖 **Full Documentation**: See `README.md`
- 📘 **Usage Guide**: See `USAGE.md`
- 🔧 **Project Details**: See `PROJECT_INFO.md`

## Troubleshooting

**Backend won't start?**
```bash
# Make sure you added your API key to .env
cat .env
```

**Frontend won't load?**
```bash
# Check if backend is running
curl http://localhost:8000/
```

**Can't hear audio?**
- Check browser permissions (click lock icon in address bar)
- Ensure microphone is connected
- Try Chrome or Firefox browsers

## Stop the Application

Press **Ctrl+C** in the terminal where you ran `./start_all.sh`

---

**Happy Meeting! 🎙️✨**