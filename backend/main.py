import os
import time
import base64
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from io import BytesIO

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import mss
import mss.tools
from PIL import Image
from openai import OpenAI

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Meeting Assistant")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Storage setup
STORAGE_DIR = Path("./storage/screenshots")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Global state
screen_capture_active = False
latest_screenshots: List[str] = []
meeting_context: List[Dict] = []


class ScreenCaptureManager:
    def __init__(self):
        self.active = False
        self.task = None
        
    async def start_capture(self):
        """Start capturing screen every 2 seconds"""
        self.active = True
        while self.active:
            try:
                # Capture screenshot
                with mss.mss() as sct:
                    monitor = sct.monitors[1]  # Primary monitor
                    screenshot = sct.grab(monitor)
                    
                    # Convert to PIL Image
                    img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
                    
                    # Resize for efficiency (max 1920x1080)
                    img.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
                    
                    # Save locally
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filepath = STORAGE_DIR / f"screenshot_{timestamp}.jpg"
                    img.save(filepath, "JPEG", quality=85)
                    
                    # Keep only last 10 screenshots in memory
                    global latest_screenshots
                    latest_screenshots.append(str(filepath))
                    if len(latest_screenshots) > 10:
                        latest_screenshots.pop(0)
                    
                    print(f"Screenshot saved: {filepath}")
                    
            except Exception as e:
                print(f"Error capturing screen: {e}")
            
            await asyncio.sleep(2)
    
    def stop_capture(self):
        """Stop screen capture"""
        self.active = False


screen_manager = ScreenCaptureManager()


@app.get("/")
async def root():
    return {"message": "AI Meeting Assistant API", "status": "running"}


@app.post("/api/session/token")
async def generate_ephemeral_token():
    """Generate ephemeral token for OpenAI Realtime API"""
    try:
        # For OpenAI Realtime API, you need to create a session token
        # This endpoint returns the API key for the frontend to connect
        # In production, you should use ephemeral tokens from OpenAI's API
        
        return JSONResponse({
            "token": os.getenv("OPENAI_API_KEY"),
            "expires_at": int(time.time()) + 3600,
            "model": "gpt-4o-realtime-preview-2024-10-01"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/capture/start")
async def start_screen_capture():
    """Start screen capture"""
    global screen_capture_active
    
    if not screen_capture_active:
        screen_capture_active = True
        asyncio.create_task(screen_manager.start_capture())
        return {"status": "started", "message": "Screen capture started"}
    
    return {"status": "already_running", "message": "Screen capture already active"}


@app.post("/api/capture/stop")
async def stop_screen_capture():
    """Stop screen capture"""
    global screen_capture_active
    
    screen_manager.stop_capture()
    screen_capture_active = False
    return {"status": "stopped", "message": "Screen capture stopped"}


@app.get("/api/capture/status")
async def get_capture_status():
    """Get current capture status"""
    return {
        "active": screen_capture_active,
        "screenshots_count": len(latest_screenshots)
    }


@app.post("/api/analyze/screen")
async def analyze_screen_context(query: Optional[str] = None):
    """Analyze latest screenshots for context"""
    if not latest_screenshots:
        return {"context": "No screenshots available", "images_analyzed": 0}
    
    try:
        # Get the latest screenshot
        latest_screenshot_path = latest_screenshots[-1]
        
        # Read and encode image
        with open(latest_screenshot_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")
        
        # Analyze with GPT-4 Vision
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": query or "Analyze this screen capture. What's being shown? Extract any relevant information, text, or context that might be useful for answering questions in a meeting."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        context = response.choices[0].message.content
        
        # Store in meeting context
        global meeting_context
        meeting_context.append({
            "timestamp": datetime.now().isoformat(),
            "type": "screen_analysis",
            "content": context
        })
        
        return {
            "context": context,
            "images_analyzed": 1,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/answer")
async def get_intelligent_answer(data: dict):
    """Generate intelligent answer based on question type"""
    question = data.get("question", "")
    transcript = data.get("transcript", "")
    
    # Analyze latest screen if available
    screen_context = ""
    if latest_screenshots:
        try:
            result = await analyze_screen_context()
            screen_context = result.get("context", "")
        except:
            pass
    
    # Determine if detailed or brief answer is needed
    # Keywords that suggest need for detailed answer
    detailed_keywords = ["explain", "how", "why", "detail", "elaborate", "describe", "process"]
    brief_keywords = ["what is", "when", "who", "yes or no", "quick"]
    
    is_detailed = any(keyword in question.lower() for keyword in detailed_keywords)
    is_brief = any(keyword in question.lower() for keyword in brief_keywords) and not is_detailed
    
    # Build context
    context_parts = []
    if transcript:
        context_parts.append(f"Recent conversation: {transcript}")
    if screen_context:
        context_parts.append(f"Screen context: {screen_context}")
    
    context_str = "\n".join(context_parts)
    
    # Create prompt based on answer type
    if is_brief:
        system_prompt = "You are a helpful meeting assistant. Provide BRIEF, concise answers (1-2 sentences max) to questions. Be direct and to the point."
    else:
        system_prompt = "You are a helpful meeting assistant. Provide DETAILED, comprehensive answers when needed, but keep them professional and meeting-appropriate. For simple questions, be brief."
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context:\n{context_str}\n\nQuestion: {question}"}
            ],
            max_tokens=500 if is_detailed else 150
        )
        
        answer = response.choices[0].message.content
        
        return {
            "answer": answer,
            "type": "detailed" if is_detailed else "brief",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/meeting")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time meeting updates"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get("type") == "transcript":
                # Store transcript
                meeting_context.append({
                    "timestamp": datetime.now().isoformat(),
                    "type": "transcript",
                    "content": data.get("content", "")
                })
                
            elif data.get("type") == "question":
                # Process question and get answer
                result = await get_intelligent_answer({
                    "question": data.get("content", ""),
                    "transcript": data.get("transcript", "")
                })
                
                await websocket.send_json({
                    "type": "answer",
                    "content": result["answer"],
                    "answer_type": result["type"]
                })
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)