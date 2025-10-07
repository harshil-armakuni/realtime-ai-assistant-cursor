import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('Ready')
  const [audioLevel, setAudioLevel] = useState(0)
  
  const peerConnectionRef = useRef(null)
  const dataChannelRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (type, content, metadata = {}) => {
    const message = {
      id: Date.now(),
      type, // 'user', 'assistant', 'system', 'transcription'
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    }
    setMessages(prev => [...prev, message])
  }

  const getEphemeralToken = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/session/token`)
      return response.data.token
    } catch (error) {
      console.error('Error getting token:', error)
      addMessage('system', 'Error: Failed to get authentication token')
      throw error
    }
  }

  const setupAudioAnalyser = (stream) => {
    audioContextRef.current = new AudioContext()
    analyserRef.current = audioContextRef.current.createAnalyser()
    const source = audioContextRef.current.createMediaStreamSource(stream)
    source.connect(analyserRef.current)
    analyserRef.current.fftSize = 256
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevel = () => {
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(Math.min(100, (average / 128) * 100))
        requestAnimationFrame(updateLevel)
      }
    }
    updateLevel()
  }

  const connectToRealtimeAPI = async () => {
    try {
      setStatus('Getting token...')
      const token = await getEphemeralToken()
      
      setStatus('Connecting to OpenAI...')
      
      // Create peer connection
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // Setup audio track
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      mediaStreamRef.current = stream
      
      setupAudioAnalyser(stream)
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Setup data channel for receiving responses
      const dataChannel = pc.createDataChannel('oai-events')
      dataChannelRef.current = dataChannel

      dataChannel.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealtimeEvent(data)
        } catch (error) {
          console.error('Error parsing data channel message:', error)
        }
      })

      // Create and set local description
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Send offer to OpenAI Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime'
      const model = 'gpt-4o-realtime-preview-2024-10-01'

      const response = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const answerSdp = await response.text()
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      })

      setIsConnected(true)
      setStatus('Connected - Listening...')
      addMessage('system', 'Connected to AI Assistant. You can now speak in English, Hindi, or Gujarati.')

      // Send initial session configuration
      sendRealtimeEvent({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: `You are an AI assistant for client meetings. 
          
Key capabilities:
- Understand and respond in English, Hindi, and Gujarati
- Detect when a question is being asked vs general discussion
- For QUESTIONS: Provide brief, clear answers (2-3 sentences) unless detail is explicitly requested
- For DETAILED requests: Provide comprehensive explanations with examples
- Analyze screen content when relevant
- Be professional, concise, and helpful

Auto-detect question patterns:
- Questions starting with: what, why, how, when, where, who, can you, could you
- Questions in Hindi: क्या, कैसे, कब, क्यों, कहाँ, कौन
- Questions in Gujarati: શું, કેવી રીતે, ક્યારે, શા માટે, ક્યાં, કોણ

Default to brief answers for questions. Only provide detailed responses when:
1. Explicitly asked for details/explanation
2. The question is complex and requires context
3. User says "explain in detail" or similar phrases`,
          voice: 'alloy',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          }
        }
      })

    } catch (error) {
      console.error('Connection error:', error)
      setStatus('Connection failed')
      addMessage('system', `Error: ${error.message}`)
      setIsConnected(false)
    }
  }

  const sendRealtimeEvent = (event) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify(event))
    }
  }

  const handleRealtimeEvent = (event) => {
    console.log('Realtime event:', event.type)

    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          addMessage('user', event.transcript, { 
            language: detectLanguage(event.transcript) 
          })
        }
        break

      case 'response.audio_transcript.delta':
        // Update ongoing transcription
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last && last.type === 'assistant' && last.isStreaming) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + event.delta }
            ]
          } else {
            return [...prev, {
              id: Date.now(),
              type: 'assistant',
              content: event.delta,
              timestamp: new Date().toISOString(),
              isStreaming: true
            }]
          }
        })
        break

      case 'response.audio_transcript.done':
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last && last.isStreaming) {
            return [
              ...prev.slice(0, -1),
              { ...last, isStreaming: false }
            ]
          }
          return prev
        })
        break

      case 'response.done':
        setStatus('Connected - Listening...')
        break

      case 'error':
        console.error('Realtime API error:', event.error)
        addMessage('system', `Error: ${event.error.message}`)
        break
    }
  }

  const detectLanguage = (text) => {
    // Simple language detection
    if (/[\u0900-\u097F]/.test(text)) return 'Hindi'
    if (/[\u0A80-\u0AFF]/.test(text)) return 'Gujarati'
    return 'English'
  }

  const startRecording = async () => {
    try {
      // Start screen capture on backend
      await axios.post(`${API_BASE_URL}/api/recording/start`)
      
      // Connect to Realtime API
      await connectToRealtimeAPI()
      
      setIsRecording(true)
      addMessage('system', 'Recording started. Screen capture active.')
    } catch (error) {
      console.error('Error starting recording:', error)
      addMessage('system', `Failed to start: ${error.message}`)
    }
  }

  const stopRecording = async () => {
    try {
      // Stop screen capture
      await axios.post(`${API_BASE_URL}/api/recording/stop`)
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      
      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      
      setIsRecording(false)
      setIsConnected(false)
      setStatus('Ready')
      setAudioLevel(0)
      addMessage('system', 'Recording stopped.')
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const analyzeScreen = async () => {
    try {
      setStatus('Analyzing screen...')
      const response = await axios.post(`${API_BASE_URL}/api/analyze/screen`)
      addMessage('assistant', response.data.analysis, { source: 'screen-analysis' })
      setStatus(isConnected ? 'Connected - Listening...' : 'Ready')
    } catch (error) {
      console.error('Error analyzing screen:', error)
      addMessage('system', 'Failed to analyze screen')
      setStatus(isConnected ? 'Connected - Listening...' : 'Ready')
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🤖 AI Meeting Assistant</h1>
        <p className="subtitle">Real-time voice and screen analysis for client meetings</p>
      </header>

      <div className="container">
        <div className="control-panel">
          <div className="status-section">
            <div className={`status-indicator ${isRecording ? 'recording' : ''}`}>
              <div className="status-dot"></div>
              <span>{status}</span>
            </div>
            
            {isRecording && (
              <div className="audio-level">
                <label>Audio Level:</label>
                <div className="level-bar">
                  <div 
                    className="level-fill" 
                    style={{ width: `${audioLevel}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="controls">
            {!isRecording ? (
              <button 
                onClick={startRecording} 
                className="btn btn-start"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button 
                onClick={stopRecording} 
                className="btn btn-stop"
              >
                ⏹️ Stop Recording
              </button>
            )}

            <button 
              onClick={analyzeScreen} 
              className="btn btn-analyze"
              disabled={!isRecording}
            >
              📸 Analyze Screen
            </button>

            <button 
              onClick={clearMessages} 
              className="btn btn-clear"
            >
              🗑️ Clear
            </button>
          </div>

          <div className="info-panel">
            <h3>Features:</h3>
            <ul>
              <li>✅ Real-time voice recognition (English, Hindi, Gujarati)</li>
              <li>✅ Screen capture every 2 seconds</li>
              <li>✅ Smart question detection</li>
              <li>✅ Brief or detailed answers based on context</li>
              <li>✅ Direct WebRTC to OpenAI (low latency)</li>
            </ul>
          </div>
        </div>

        <div className="messages-panel">
          <div className="messages-header">
            <h2>Conversation</h2>
            <span className="message-count">{messages.length} messages</span>
          </div>
          
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>👋 Click "Start Recording" to begin</p>
                <p className="hint">Speak naturally in English, Hindi, or Gujarati</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message message-${message.type}`}
                >
                  <div className="message-header">
                    <span className="message-sender">
                      {message.type === 'user' ? '👤 You' : 
                       message.type === 'assistant' ? '🤖 AI Assistant' : 
                       '⚙️ System'}
                    </span>
                    {message.language && (
                      <span className="message-language">{message.language}</span>
                    )}
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                    {message.isStreaming && <span className="cursor-blink">▋</span>}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App