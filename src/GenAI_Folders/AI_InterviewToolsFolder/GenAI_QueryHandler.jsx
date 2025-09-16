import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Bot } from 'lucide-react';
import { speakWithPolly, stopSpeech } from '../PollyPlayer.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import './GenAI_Interviewer_RoleBased.css';

const GenAI_QueryHandler = () => {
    const [showLanguageSelector, setShowLanguageSelector] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [selectedLang, setSelectedLang] = useState('en-US');
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

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopSpeech();
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
            }
        };
    }, [mediaRecorder, isRecording]);



    const sendMessageToAI = async (textMessage) => {
        setIsLoading(true);
        
        try {
            const response = await fetch('https://8112eqras9.execute-api.ap-south-1.amazonaws.com/dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "body": JSON.stringify({
                        message: textMessage,
                        sessionId: sessionIdget(),
                        lang: selectedLang, // send chosen language
                        email: localStorage.getItem('email') || ''
                    })
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const responseBody = JSON.parse(data.body);
            
            if (responseBody.sessionId) {
                setSessionId(responseBody.sessionId);
            }
            
            const formatAIResponse = (text) => {
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>')
                    .replace(/Q\d+:/g, '<br><strong>$&</strong>')
                    .replace(/^(.+?):/gm, '<strong>$1:</strong>');
            };
            
            const aiMessage = {
                id: Date.now().toString(),
                text: formatAIResponse(responseBody.response),
                sender: 'ai',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
            
            if (!isMuted) {
                // Clean the response text and speak in selected language
                const cleanResponse = responseBody.response.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();
                speakWithPolly(cleanResponse, selectedLang);
            }
            
        } catch (error) {
            console.error('Error calling AI API:', error);
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
        if (message.trim()) {
            const userMessage = {
                id: Date.now().toString(),
                text: message.trim(),
                sender: 'user',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, userMessage]);
            setMessage('');

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
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLang; // use chosen language

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
            
            setMessage(prev => {
                const baseText = prev.replace(/\s*\[.*?\]\s*$/, '');
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
            setIsRecording(false);
            setMediaRecorder(null);
            // Auto-send message when recording stops
            setTimeout(() => {
                if (message.trim()) {
                    handleSendMessage();
                }
            }, 500);
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

    const handleLanguageSelect = (langCode) => {
        setSelectedLang(langCode);
        setShowLanguageSelector(false);
    };

    if (showLanguageSelector) {
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
    }

    return (
        <div className="interview-container">
            <div className="main-container"><br></br>
                <div className="content-layout">
                    {/* Chatbot Section */}
                    <div className="chatbot-section">
                        <div className="chatbot-card">
                            <div className="chat-header">
                                <h2 className="chat-title">
                                    <Bot className="mr-2" size={34} />
                                    AI Query Handler
                                </h2>

                                {/* Language Selector */}
                                <div className="lang-selector">
                                    <label className="mr-2">Language:</label>
                                    <select
                                        value={selectedLang}
                                        onChange={(e) => setSelectedLang(e.target.value)}
                                        disabled={isRecording}
                                    >
                                        <option value="en-US">English</option>
                                        <option value="te-IN">Telugu</option>
                                        <option value="hi-IN">Hindi</option>
                                        <option value="kn-IN">Kannada</option>
                                    </select>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="messages-container">
                                {messages.length === 0 ? (
                                    <div className="empty-state">
                                        <Bot className="mb-2 text-gray-400" size={58} />
                                        <p className="font-medium text-gray-500">
                                            Start the conversation by typing or speaking...
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
                                        placeholder="Type your message or use voice..."
                                        disabled={isRecording}
                                        className="message-input"
                                        rows={4}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || isLoading}
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
                    <button 
                        onClick={toggleMute} 
                        className={`control-button mute-button ${isMuted ? 'muted' : ''}`}
                    >
                        {isMuted ? <MicOff className="mr-2" size={20} /> : <Mic className="mr-2" size={20} />}
                        {isMuted ? 'Unmute AI' : 'Mute AI'}
                    </button>
                    
                    <button 
                        onClick={toggleRecording} 
                        className={`control-button record-button ${isRecording ? 'recording' : ''}`}
                        disabled={isLoading}
                    >
                        <Mic className="mr-2" size={20} />
                        {isRecording ? 'Stop & Send' : 'Speak with AI'}
                    </button>
                </div>
            </div>
        </div>

    );
};

export default GenAI_QueryHandler;
