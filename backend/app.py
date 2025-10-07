import os
import base64
import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import mss
from PIL import Image
import io
import openai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Meeting Assistant")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create screenshots directory
SCREENSHOTS_DIR = Path("backend/screenshots")
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

# OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

# Global state
class AppState:
    def __init__(self):
        self.is_recording = False
        self.screenshot_task = None
        self.latest_screenshots: List[str] = []
        self.conversation_context: List[Dict] = []
        self.max_screenshots = 10  # Keep last 10 screenshots
        
state = AppState()


async def capture_screenshot():
    """Capture screenshot and save locally"""
    try:
        with mss.mss() as sct:
            # Capture primary monitor
            monitor = sct.monitors[1]
            screenshot = sct.grab(monitor)
            
            # Convert to PIL Image
            img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
            
            # Resize for efficiency (max width 1280px)
            max_width = 1280
            if img.width > max_width:
                ratio = max_width / img.width
                new_size = (max_width, int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Save with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            filename = f"screen_{timestamp}.jpg"
            filepath = SCREENSHOTS_DIR / filename
            img.save(filepath, "JPEG", quality=85)
            
            # Keep only recent screenshots
            state.latest_screenshots.append(str(filepath))
            if len(state.latest_screenshots) > state.max_screenshots:
                old_file = state.latest_screenshots.pop(0)
                try:
                    os.remove(old_file)
                except:
                    pass
            
            logger.info(f"Screenshot saved: {filename}")
            return str(filepath)
    except Exception as e:
        logger.error(f"Screenshot capture error: {e}")
        return None


async def screenshot_loop():
    """Continuously capture screenshots every 2 seconds"""
    while state.is_recording:
        await capture_screenshot()
        await asyncio.sleep(2)


def encode_image_to_base64(image_path: str) -> str:
    """Encode image to base64"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


async def analyze_screen_context(query: str = None) -> str:
    """Analyze recent screenshots with GPT-4 Vision"""
    if not state.latest_screenshots:
        return "No screen data available yet."
    
    try:
        # Get the most recent screenshot
        latest_image = state.latest_screenshots[-1]
        base64_image = encode_image_to_base64(latest_image)
        
        # Prepare message
        messages = [
            {
                "role": "system",
                "content": """You are an AI meeting assistant. Analyze the screen content and provide:
1. Brief summary of what's visible
2. Key topics or data shown
3. Answer any specific questions about the screen content

Respond in a concise, professional manner suitable for client meetings."""
            }
        ]
        
        if query:
            content = [
                {"type": "text", "text": f"Question about the screen: {query}"},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]
        else:
            content = [
                {"type": "text", "text": "Describe what's shown on the screen briefly."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]
        
        messages.append({"role": "user", "content": content})
        
        # Call OpenAI Vision API
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=500
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Screen analysis error: {e}")
        return f"Error analyzing screen: {str(e)}"


@app.get("/")
async def root():
    return {"message": "AI Meeting Assistant API", "status": "running"}


@app.post("/api/session/token")
async def generate_session_token():
    """Generate ephemeral token for OpenAI Realtime API"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # For OpenAI Realtime API, we can use the API key directly
        # or generate ephemeral tokens via the REST API
        import requests
        
        response = requests.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-realtime-preview-2024-10-01",
                "voice": "alloy"
            }
        )
        
        if response.status_code != 200:
            logger.error(f"Token generation failed: {response.text}")
            # Fallback: return the API key itself for direct connection
            return {
                "token": api_key,
                "expires_at": None
            }
        
        data = response.json()
        return {
            "token": data.get("client_secret", {}).get("value", api_key),
            "expires_at": data.get("expires_at")
        }
    except Exception as e:
        logger.error(f"Token generation error: {e}")
        # Fallback: return API key
        api_key = os.getenv("OPENAI_API_KEY")
        return {
            "token": api_key,
            "expires_at": None
        }


@app.post("/api/recording/start")
async def start_recording():
    """Start screen recording"""
    if state.is_recording:
        return {"message": "Recording already in progress", "status": "running"}
    
    state.is_recording = True
    state.screenshot_task = asyncio.create_task(screenshot_loop())
    
    logger.info("Recording started")
    return {"message": "Recording started", "status": "recording"}


@app.post("/api/recording/stop")
async def stop_recording():
    """Stop screen recording"""
    if not state.is_recording:
        return {"message": "No recording in progress", "status": "stopped"}
    
    state.is_recording = False
    if state.screenshot_task:
        state.screenshot_task.cancel()
        try:
            await state.screenshot_task
        except asyncio.CancelledError:
            pass
    
    logger.info("Recording stopped")
    return {"message": "Recording stopped", "status": "stopped"}


@app.get("/api/recording/status")
async def recording_status():
    """Get current recording status"""
    return {
        "is_recording": state.is_recording,
        "screenshots_count": len(state.latest_screenshots)
    }


@app.post("/api/analyze/screen")
async def analyze_screen(request: dict = None):
    """Analyze current screen content"""
    query = request.get("query") if request else None
    analysis = await analyze_screen_context(query)
    return {"analysis": analysis}


@app.get("/api/screenshots/latest")
async def get_latest_screenshot():
    """Get the latest screenshot info"""
    if not state.latest_screenshots:
        raise HTTPException(status_code=404, detail="No screenshots available")
    
    latest = state.latest_screenshots[-1]
    return {
        "path": latest,
        "timestamp": os.path.getmtime(latest),
        "count": len(state.latest_screenshots)
    }


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    if state.is_recording:
        await stop_recording()


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )