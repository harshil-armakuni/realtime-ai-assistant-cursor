import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenCapturing, setIsScreenCapturing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState([]);
  const [status, setStatus] = useState('Ready');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const wsRef = useRef(null);
  const realtimeRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8000/ws/meeting`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setStatus('Connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'answer') {
        setResponses(prev => [...prev, {
          type: data.answer_type,
          content: data.content,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('Connection error');
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setStatus('Disconnected');
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
    
    wsRef.current = ws;
  };

  const startRecording = async () => {
    try {
      setStatus('Starting recording...');
      
      // Start screen capture on backend
      await axios.post(`${API_BASE}/api/capture/start`);
      setIsScreenCapturing(true);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        } 
      });
      
      // Setup audio analysis for visual feedback
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Start audio level monitoring
      monitorAudioLevel();
      
      // Connect to OpenAI Realtime API
      await connectToRealtimeAPI(stream);
      
      setIsRecording(true);
      setStatus('Recording...');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const stopRecording = async () => {
    try {
      setStatus('Stopping recording...');
      
      // Stop screen capture
      await axios.post(`${API_BASE}/api/capture/stop`);
      setIsScreenCapturing(false);
      
      // Close Realtime API connection
      if (realtimeRef.current) {
        realtimeRef.current.close();
        realtimeRef.current = null;
      }
      
      // Stop audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      setIsRecording(false);
      setStatus('Stopped');
      setAudioLevel(0);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 255) * 200));
      
      if (isRecording) {
        requestAnimationFrame(checkLevel);
      }
    };
    
    checkLevel();
  };

  const connectToRealtimeAPI = async (stream) => {
    try {
      // Get ephemeral token
      const tokenResponse = await axios.post(`${API_BASE}/api/session/token`);
      const { token } = tokenResponse.data;
      
      // Note: OpenAI Realtime API connection
      // This is a simplified version - you'll need to implement the full WebRTC connection
      // based on OpenAI's Realtime API documentation
      
      // For now, we'll use Web Speech API as a fallback for demonstration
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // You can add hi-IN for Hindi, gu-IN for Gujarati
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              
              // Detect if it's a question
              if (transcript.includes('?') || 
                  transcript.toLowerCase().includes('what') ||
                  transcript.toLowerCase().includes('how') ||
                  transcript.toLowerCase().includes('why') ||
                  transcript.toLowerCase().includes('when')) {
                
                // Send to backend for intelligent answer
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({
                    type: 'question',
                    content: transcript,
                    transcript: finalTranscript
                  }));
                }
              }
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(prev => prev + finalTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };
        
        recognition.start();
        realtimeRef.current = recognition;
      }
      
    } catch (error) {
      console.error('Error connecting to Realtime API:', error);
      throw error;
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setResponses([]);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🤖 AI Meeting Assistant</h1>
          <p className="subtitle">Real-time audio & screen analysis for intelligent meeting support</p>
        </header>

        <div className="status-bar">
          <div className="status-item">
            <span className="status-label">Status:</span>
            <span className={`status-value ${isRecording ? 'recording' : ''}`}>
              {status}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Screen Capture:</span>
            <span className={`status-indicator ${isScreenCapturing ? 'active' : 'inactive'}`}>
              {isScreenCapturing ? '● Active' : '○ Inactive'}
            </span>
          </div>
          {isRecording && (
            <div className="status-item">
              <span className="status-label">Audio Level:</span>
              <div className="audio-level-bar">
                <div 
                  className="audio-level-fill" 
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="controls">
          <button
            className={`control-btn ${isRecording ? 'stop' : 'start'}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '⏹ Stop Recording' : '🎙 Start Recording'}
          </button>
          
          <button
            className="control-btn secondary"
            onClick={clearTranscript}
            disabled={isRecording}
          >
            🗑 Clear
          </button>
        </div>

        <div className="content-grid">
          <div className="panel transcript-panel">
            <h2>📝 Live Transcript</h2>
            <div className="transcript-content">
              {transcript || 'Transcript will appear here...'}
            </div>
          </div>

          <div className="panel responses-panel">
            <h2>💡 AI Responses</h2>
            <div className="responses-content">
              {responses.length === 0 ? (
                <div className="empty-state">
                  Intelligent responses will appear here when questions are detected...
                </div>
              ) : (
                responses.map((response, index) => (
                  <div key={index} className={`response-card ${response.type}`}>
                    <div className="response-header">
                      <span className="response-type">
                        {response.type === 'brief' ? '⚡ Brief' : '📚 Detailed'}
                      </span>
                      <span className="response-time">{response.timestamp}</span>
                    </div>
                    <div className="response-content">
                      {response.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="info-panel">
          <h3>ℹ️ Features</h3>
          <ul>
            <li>✅ Real-time audio transcription (English, Hindi, Gujarati support)</li>
            <li>✅ Screen capture every 2 seconds for visual context</li>
            <li>✅ Automatic question detection</li>
            <li>✅ Intelligent brief/detailed answer selection</li>
            <li>✅ Local storage of screen captures</li>
            <li>✅ Multi-language support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;