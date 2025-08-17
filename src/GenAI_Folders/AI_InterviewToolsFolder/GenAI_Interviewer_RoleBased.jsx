import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MicOff, Send, Bot, User, Video, VideoOff } from 'lucide-react';
import { speakWithPolly, stopSpeech } from '../PollyPlayer.jsx';
import './GenAI_Interviewer_RoleBased.css';

const GenAI_Interviewer_RoleBased = () => {
    const [isInterviewActive, setIsInterviewActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isCameraEnabled, setIsCameraEnabled] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [stream, setStream] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [showThankYou, setShowThankYou] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const videoRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Generate session ID
    const sessionIdget = () => {
        if (!sessionId) {
            const newSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            setSessionId(newSessionId);
            return newSessionId;
        }
        return sessionId;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup camera stream when component unmounts
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const enableCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false 
            });
            setStream(mediaStream);
            setIsCameraEnabled(true);
            
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const disableCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraEnabled(false);
            
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    };

    const handleStartInterview = async () => {
        setIsInterviewActive(true);
        
        // Automatically enable camera when starting interview
        await enableCamera();
    };

    const handleEndInterview = () => {
        const confirmed = window.confirm('Are you sure you want to end the interview?');
        if (confirmed) {
            setIsInterviewActive(false);
            stopSpeech();
            disableCamera();
            setShowThankYou(true);
            setTimeout(() => {
                window.close();
            }, 5000);
        }
    };

    const sendMessageToAI = async (textMessage) => {
        setIsLoading(true);
        
        try {
            const response = await fetch('https://c9beky98gk.execute-api.ap-south-1.amazonaws.com/dev/activity-role-based-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "body": JSON.stringify({
                        message: textMessage,
                        sessionId: sessionIdget(),
                        email: localStorage.getItem('email') || ''
                    })
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const responseBody = JSON.parse(data.body);
            
            // Update session ID if provided
            if (responseBody.sessionId) {
                setSessionId(responseBody.sessionId);
            }
            
            // Format AI response with proper line breaks and structure
            const formatAIResponse = (text) => {
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
                    .replace(/\n/g, '<br>') // Line breaks
                    .replace(/Q\d+:/g, '<br><strong>$&</strong>') // Question formatting
                    .replace(/^(.+?):/gm, '<strong>$1:</strong>'); // General headings
            };
            
            // Add AI response to messages
            const aiMessage = {
                id: Date.now().toString(),
                text: formatAIResponse(responseBody.response),
                sender: 'ai',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
            
            if (!isMuted && isInterviewActive) {
                speakWithPolly(responseBody.response);
            }
            
        } catch (error) {
            console.error('Error calling AI API:', error);
            
            // Add error message
            const errorMessage = {
                id: Date.now().toString(),
                text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                sender: 'ai',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (message.trim() && isInterviewActive) {
            const userMessage = {
                id: Date.now().toString(),
                text: message.trim(),
                sender: 'user',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, userMessage]);
            setMessage('');

            // Send message to AI
            await sendMessageToAI(userMessage.text);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };



    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true; // Keep recording continuously
        recognition.interimResults = true; // Show interim results
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update message with final + interim transcript
            setMessage(prev => {
                const baseText = prev.replace(/\s*\[.*?\]\s*$/, ''); // Remove previous interim
                return baseText + finalTranscript + (interimTranscript ? ` [${interimTranscript}]` : '');
            });
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech') {
                setIsRecording(false);
            }
        };

        recognition.onend = () => {
            // Only stop if user manually stopped, otherwise restart
            if (isRecording) {
                recognition.start(); // Restart to keep continuous recording
            }
        };

        recognition.start();
        setMediaRecorder(recognition);
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            stopSpeech();
        }
    };

    return (
        <div className="interview-container">
            <div className="main-container"><br></br>
                {/* Main Content */}
                <div className="content-layout">
                    {/* Camera Section */}
                    <div className="camera-section">
                        <div className="camera-card">
                            <h2 className="camera-header">
                                <User className="mr-2 text-blue-600" size={24} />
                                You
                            </h2>
                            
                            <div className="camera-view">
                                {isCameraEnabled ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="camera-video"
                                    />
                                ) : (
                                    <div className="camera-placeholder">
                                        <Video className="mx-auto mb-2 text-gray-400" size={48} />
                                        <p className="text-gray-500 font-medium">Camera View</p>
                                        <p className="text-sm text-gray-400">
                                            {isInterviewActive ? 'Camera will activate automatically' : 'Start interview to enable camera'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="camera-status">
                                <div className={isCameraEnabled ? 'status-active' : 'status-inactive'}>
                                    {isCameraEnabled ? (
                                        <>
                                            <Video className="mr-2" size={20} />
                                            Camera Active
                                        </>
                                    ) : (
                                        <>
                                            <VideoOff className="mr-2" size={20} />
                                            Camera Inactive
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chatbot Section */}
                    <div className="chatbot-section">
                        <div className="chatbot-card">
                            {/* Chat Header */}
                            <div className="chat-header">
                                <h2 className="chat-title">
                                    <Bot className="mr-2" size={24} />
                                    AI Interviewer
                                    {isInterviewActive && (
                                        <span className="live-indicator">
                                            <div className="live-dot"></div>
                                            Live
                                        </span>
                                    )}
                                </h2>
                            </div>

                            {/* Messages Container */}
                            <div className="messages-container">
                                {messages.length === 0 ? (
                                    <div className="empty-state">
                                        <Bot className="mb-2 text-gray-400" size={48} />
                                        <p className="font-medium text-gray-500">
                                            {isInterviewActive ? 'Start the conversation...' : 'Click "Start Interview" to begin'}
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`message ${msg.sender}`}>
                                            <div className="message-content">
                                                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                                <span className="message-time">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {isLoading && (
                                    <div className="loading-message">
                                        AI is thinking
                                        <div className="loading-dots">
                                            <div className="loading-dot"></div>
                                            <div className="loading-dot"></div>
                                            <div className="loading-dot"></div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Section */}
                            <div className="input-section">
                                <div className="input-container">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={isInterviewActive ? "Type your message..." : "Start interview to chat"}
                                        disabled={!isInterviewActive}
                                        className="message-input"
                                        rows={4}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!isInterviewActive || !message.trim() || isLoading}
                                        className="send-button"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="controls-section">
                    {!isInterviewActive ? (
                        <button onClick={handleStartInterview} className="control-button start-button">
                            <Video className="mr-2" size={20} />
                            Start Interview
                        </button>
                    ) : (
                        <>
                            <button onClick={handleEndInterview} className="control-button end-button">
                                <VideoOff className="mr-2" size={20} />
                                End Interview
                            </button>
                            
                            <button 
                                onClick={toggleMute} 
                                className={`control-button mute-button ${isMuted ? 'muted' : ''}`}
                            >
                                {isMuted ? <MicOff className="mr-2" size={20} /> : <Mic className="mr-2" size={20} />}
                                {isMuted ? 'Unmute' : 'Mute'}
                            </button>
                            
                            <button 
                                onClick={toggleRecording} 
                                className={`control-button record-button ${isRecording ? 'recording' : ''}`}
                            >
                                <Mic className="mr-2" size={20} />
                                {isRecording ? 'Stop Recording' : 'Voice Response'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Thank You Card */}
            {showThankYou && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
                        padding: '60px 80px',
                        borderRadius: '30px',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(20px)',
                        maxWidth: '600px'
                    }}>
                        <div style={{
                            fontSize: '80px',
                            marginBottom: '30px'
                        }}>🎉</div>
                        <h2 style={{
                            fontSize: '42px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '20px',
                            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                            lineHeight: '1.2'
                        }}>Thank you for attending Role Based Interview</h2>
                        <p style={{
                            fontSize: '24px',
                            color: 'rgba(255, 255, 255, 0.9)',
                            margin: 0,
                            fontWeight: '500',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}>This tab will close automatically in 5 seconds...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenAI_Interviewer_RoleBased;