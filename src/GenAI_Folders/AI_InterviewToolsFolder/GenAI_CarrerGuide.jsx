import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Bot, RotateCcw } from 'lucide-react';
import { speakWithPolly, stopSpeech } from '../PollyPlayer.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import './GenAI_Interviewer_RoleBased.css';

const GenAI_CarrerGuide = () => {
    const [showLanguageSelector, setShowLanguageSelector] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [selectedLang, setSelectedLang] = useState('en-US');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);

    // Generate new session ID
    const generateNewSessionId = () => {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    };

    // Get or create session ID
    const getSessionId = () => {
        if (!sessionId) {
            const newSessionId = generateNewSessionId();
            setSessionId(newSessionId);
            return newSessionId;
        }
        return sessionId;
    };

    // Start new conversation
    const startNewConversation = () => {
        setMessages([]);
        setMessage('');
        setSessionId(generateNewSessionId());
        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
        }
        if (isRecording) {
            stopRecording();
        }
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
            if (recognition && isRecording) {
                recognition.stop();
            }
        };
    }, [recognition, isRecording]);



    const sendMessageToAI = async (textMessage) => {
        setIsLoading(true);
        
        try {
            const response = await fetch('https://8112eqras9.execute-api.ap-south-1.amazonaws.com/dev/team04_carrer_agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "body": JSON.stringify({
                        message: textMessage,
                        sessionId: getSessionId(),
                        lang: selectedLang,
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
                setIsSpeaking(true);
                const cleanResponse = responseBody.response.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();
                speakWithPolly(cleanResponse, selectedLang)
                    .then(() => setIsSpeaking(false))
                    .catch(() => setIsSpeaking(false));
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

        // Stop any ongoing speech
        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const newRecognition = new SpeechRecognition();
        
        newRecognition.continuous = false;
        newRecognition.interimResults = true;
        newRecognition.lang = selectedLang;
        newRecognition.maxAlternatives = 1;

        let finalTranscript = '';

        newRecognition.onstart = () => {
            setIsRecording(true);
            setMessage('');
        };

        newRecognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            setMessage(finalTranscript + (interimTranscript ? ` [${interimTranscript}]` : ''));
        };

        newRecognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            setRecognition(null);
        };

        newRecognition.onend = () => {
            setIsRecording(false);
            setRecognition(null);
            
            // Clean up the message and auto-send if there's content
            if (finalTranscript.trim()) {
                setMessage(finalTranscript.trim());
                setTimeout(() => {
                    const userMessage = {
                        id: Date.now().toString(),
                        text: finalTranscript.trim(),
                        sender: 'user',
                        timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, userMessage]);
                    setMessage('');
                    sendMessageToAI(finalTranscript.trim());
                }, 100);
            }
        };

        newRecognition.start();
        setRecognition(newRecognition);
    };

    const stopRecording = () => {
        if (recognition && isRecording) {
            recognition.stop();
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
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        
        if (newMutedState && isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
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
                                    AI Career Guide
                                </h2>

                                <div className="header-controls">
                                    {/* New Conversation Button */}
                                    <button 
                                        onClick={startNewConversation}
                                        className="new-conversation-btn"
                                        disabled={isRecording || isLoading}
                                        title="Start new conversation"
                                    >
                                        <RotateCcw size={16} />
                                        New Chat
                                    </button>

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
                        title={isMuted ? 'Enable AI voice' : 'Disable AI voice'}
                    >
                        {isMuted ? <MicOff className="mr-2" size={20} /> : <Mic className="mr-2" size={20} />}
                        {isMuted ? 'Unmute AI' : 'Mute AI'}
                        {isSpeaking && !isMuted && <span className="speaking-indicator">🔊</span>}
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

export default GenAI_CarrerGuide;
