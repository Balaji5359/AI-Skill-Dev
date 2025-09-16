import React, { useState } from 'react';
import { Bot, ArrowRight, Globe } from 'lucide-react';
import './GenAI_Interviewer_RoleBased.css';
import './LanguageSelector.css';

const LanguageSelector = ({ onLanguageSelect }) => {
    const [selectedLang, setSelectedLang] = useState('');

    const languages = [
        { 
            code: 'en-US', 
            name: 'English', 
            nativeName: 'English',
            flag: '🇺🇸',
            description: 'Start chatting in English',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        { 
            code: 'te-IN', 
            name: 'Telugu', 
            nativeName: 'తెలుగు',
            flag: '🇮🇳',
            description: 'తెలుగులో చాట్ చేయండి',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        { 
            code: 'hi-IN', 
            name: 'Hindi', 
            nativeName: 'हिंदी',
            flag: '🇮🇳',
            description: 'हिंदी में चैट करें',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        { 
            code: 'kn-IN', 
            name: 'Kannada', 
            nativeName: 'ಕನ್ನಡ',
            flag: '🇮🇳',
            description: 'ಕನ್ನಡದಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ',
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }
    ];

    const handleLanguageSelect = (langCode) => {
        setSelectedLang(langCode);
        // Directly proceed when language is selected
        onLanguageSelect(langCode);
    };

    return (
        <div className="interview-container">
            <div className="main-container">
                <div className="language-selection-card">
                    <div className="language-header">
                        <div className="header-icon">
                            <Bot size={64} className="bot-icon" />
                            <Globe size={24} className="globe-icon" />
                        </div>
                        <h1 className="welcome-title">Welcome to MITS College AI Bot</h1>
                        <h2 className="subtitle">MITS కాలేజ్ AI బాట్‌కు స్వాగతం</h2>
                        <p className="description">
                            Choose your preferred language to start your conversation
                            <br />
                            <span className="telugu-text">మీ సంభాషణ ప్రారంభించడానికి మీ ఇష్టమైన భాషను ఎంచుకోండి</span>
                        </p>
                    </div>

                    <div className="language-grid">
                        {languages.map((lang) => (
                            <div
                                key={lang.code}
                                className={`language-card ${selectedLang === lang.code ? 'selected' : ''}`}
                                onClick={() => handleLanguageSelect(lang.code)}
                            >
                                <div className="card-content" style={{background: lang.color}}>
                                    <span className="flag-large">{lang.flag}</span>
                                    <h3 className="lang-name">{lang.name}</h3>
                                    <p className="native-name">{lang.nativeName}</p>
                                    <p className="lang-description">{lang.description}</p>
                                </div>
                                <div className="card-arrow">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="footer-text">
                        <p>Click on any language to start chatting instantly</p>
                        <p className="telugu-footer">తక్షణమే చాట్ చేయడం ప్రారంభించడానికి ఏదైనా భాషపై క్లిక్ చేయండి</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;