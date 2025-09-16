import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Bot } from 'lucide-react';
import { speakWithPolly, stopSpeech } from '../PollyPlayer.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import './GenAI_Interviewer_RoleBased.css';
import './ModernChat.css';

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
    const [hasGreeted, setHasGreeted] = useState(false);
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
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
        // Prevent multiple recordings
        if (isRecording || isProcessingVoice) {
            return;
        }

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false; // Changed to false to prevent multiple triggers
        recognition.interimResults = true;
        recognition.lang = selectedLang;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
            setIsProcessingVoice(true);
            setMessage(''); // Clear previous message
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
            
            const fullTranscript = finalTranscript || interimTranscript;
            setMessage(fullTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            setIsProcessingVoice(false);
            setMediaRecorder(null);
        };

        recognition.onend = () => {
            setIsRecording(false);
            setMediaRecorder(null);
            
            // Auto-send message after a short delay if there's content
            setTimeout(() => {
                if (message.trim() && !isLoading) {
                    handleSendMessage();
                }
                setIsProcessingVoice(false);
            }, 1000);
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
        if (isRecording || isProcessingVoice) {
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

    // Welcome greetings in different languages
    const getWelcomeMessage = (langCode) => {
        const greetings = {
            'en-US': "Welcome to MITS College AI Bot! 🎓\n\nHello! I'm your AI assistant here to help you with any questions about MITS College, courses, admissions, or general queries. How can I assist you today?",
            'te-IN': "MITS కాలేజ్ AI బాట్కు స్వాగతం! 🎓\n\nనమస్కారం! నేను మీ AI సహాయకుడిని. MITS కాలేజ్, కోర్సులు, అడ్మిషన్లు లేదా ఇతర ప్రశ్నలతో మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను. ఈరోజు మీకు ఎలా సహాయం చేయగలను?",
            'hi-IN': "MITS कॉलेज AI बॉट में आपका स्वागत है! 🎓\n\nनमस्ते! मैं आपका AI सहायक हूं। MITS कॉलेज, कोर्स, एडमिशन या अन्य प्रश्नों में आपकी मदद करने के लिए यहां हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
            'kn-IN': "MITS ಕಾಲೇಜ್ AI ಬಾಟ್ಗೆ ಸ್ವಾಗತ! 🎓\n\nನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ. MITS ಕಾಲೇಜ್, ಕೋರ್ಸ್ಗಳು, ಪ್ರವೇಶಗಳು ಅಥವಾ ಇತರ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
        };
        return greetings[langCode] || greetings['en-US'];
    };

    const handleLanguageSelect = (langCode) => {
        setSelectedLang(langCode);
        setShowLanguageSelector(false);
        
        // Add welcome message immediately after language selection
        setTimeout(() => {
            const welcomeMessage = {
                id: Date.now().toString(),
                text: getWelcomeMessage(langCode).replace(/\n/g, '<br>'),
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
            setHasGreeted(true);
            
            // Speak welcome message if not muted
            if (!isMuted) {
                const cleanWelcome = getWelcomeMessage(langCode).replace(/🎓/g, '').replace(/\n/g, ' ');
                speakWithPolly(cleanWelcome, langCode);
            }
        }, 500);
    };

    if (showLanguageSelector) {
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
    }

    return (
        <div className="modern-chat-container">
            <div className="chat-wrapper">
                <div className="chat-layout">
                    <div className="chat-main">
                        <div className="chat-card">
                            <div className="chat-header-modern">
                                <div className="header-content">
                                    <div className="bot-avatar">
                                        <Bot size={28} />
                                    </div>
                                    <div className="header-text">
                                        <h2 className="chat-title-modern">🤖 MITS AI Assistant</h2>
                                        <p className="chat-subtitle">మీ స్మార్ట్ సహాయకుడు</p>
                                    </div>
                                </div>
                                <div className="header-controls">
                                    <select
                                        value={selectedLang}
                                        onChange={(e) => setSelectedLang(e.target.value)}
                                        disabled={isRecording}
                                        className="lang-select-modern"
                                    >
                                        <option value="en-US">🇺🇸 EN</option>
                                        <option value="te-IN">🇮🇳 తె</option>
                                        <option value="hi-IN">🇮🇳 हि</option>
                                        <option value="kn-IN">🇮🇳 ಕನ</option>
                                    </select>
                                    <button 
                                        onClick={toggleMute} 
                                        className={`control-btn ${isMuted ? 'muted' : ''}`}
                                        title={isMuted ? 'Unmute AI' : 'Mute AI'}
                                    >
                                        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="messages-area">
                                {messages.length === 0 ? (
                                    <div className="welcome-state">
                                        <div className="welcome-bot">
                                            <Bot size={48} />
                                        </div>
                                        <h3>👋 Welcome to MITS AI!</h3>
                                        <p>Type a message or use voice to start chatting</p>
                                        <p className="telugu-welcome">మెసేజ్ రాయండి లేదా వాయ్స్ వాడండి</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`msg ${msg.sender}`}>
                                            <div className="msg-content">
                                                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                                <span className="msg-time">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {isLoading && (
                                    <div className="typing-indicator">
                                        <div className="typing-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                        <p>AI is typing...</p>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="input-area">
                                <div className="input-wrapper">
                                    <div className="input-field">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={selectedLang === 'te-IN' ? 'మెసేజ్ రాయండి...' : 'Type your message...'}
                                            disabled={isRecording}
                                            className="modern-input"
                                            rows={2}
                                        />
                                        <div className="input-actions">
                                            <button 
                                                onClick={toggleRecording} 
                                                className={`voice-btn ${isRecording ? 'recording' : ''} ${isProcessingVoice ? 'processing' : ''}`}
                                                disabled={isLoading}
                                                title={isRecording ? 'Stop Recording' : 'Voice Input'}
                                            >
                                                <Mic size={20} />
                                                {isRecording && <div className="recording-pulse"></div>}
                                            </button>
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!message.trim() || isLoading}
                                                className="send-btn"
                                                title="Send Message"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenAI_QueryHandler;