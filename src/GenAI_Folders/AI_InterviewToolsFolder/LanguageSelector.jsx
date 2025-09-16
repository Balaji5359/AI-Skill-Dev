import React, { useState } from 'react';
import { Bot, ArrowRight } from 'lucide-react';
import './GenAI_Interviewer_RoleBased.css';

const LanguageSelector = ({ onLanguageSelect }) => {
    const [selectedLang, setSelectedLang] = useState('');

    const languages = [
        { code: 'en-US', name: 'English', flag: '🇺🇸' },
        { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
        { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
        { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' }
    ];

    const handleProceed = () => {
        if (selectedLang) {
            onLanguageSelect(selectedLang);
        }
    };

    return (
        <div className="interview-container">
            <div className="main-container">
                <div className="language-selection-card">
                    <div className="language-header">
                        <Bot size={48} className="bot-icon" />
                        <h1>AI Query Handler</h1>
                        <p>Select your preferred language to start chatting with AI</p>
                    </div>

                    <div className="language-options">
                        {languages.map((lang) => (
                            <div
                                key={lang.code}
                                className={`language-option ${selectedLang === lang.code ? 'selected' : ''}`}
                                onClick={() => setSelectedLang(lang.code)}
                            >
                                <span className="flag">{lang.flag}</span>
                                <span className="lang-name">{lang.name}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleProceed}
                        disabled={!selectedLang}
                        className="proceed-button"
                    >
                        Start Chatting <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;