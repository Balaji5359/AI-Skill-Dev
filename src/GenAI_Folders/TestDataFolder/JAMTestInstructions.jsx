import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JAMTestInstructions.css';

function JAMTestInstructions() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(null);

    const startTest = () => {
        setCountdown(10);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    navigate('/genai-jam');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="jam-instructions-container">
            <div className="instructions-card">
                <div className="header-section">
                    <h1 className="main-title">🎤 Instructions to Start JAM Test with GenAI Agent</h1>
                    <div className="time-badge">
                        <span className="time-icon">⏱️</span>
                        Total Time: 2 minutes 30 seconds (2½ minutes)
                    </div>
                </div>

                <div className="instructions-content">
                    <div className="instruction-item important">
                        <div className="instruction-icon">📋</div>
                        <div className="instruction-text">
                            <strong>Instructions:</strong> Read the instructions carefully before starting the test.
                        </div>
                    </div>

                    <div className="timeline-section">
                        <h3 className="timeline-title">📅 Test Timeline</h3>
                        
                        <div className="timeline-item">
                            <div className="timeline-badge">30s</div>
                            <div className="timeline-content">
                                <h4>📖 Read Instructions</h4>
                                <p>30 seconds to read the instructions to interact with GenAI Agent at left side of your page.</p>
                            </div>
                        </div>

                        <div className="timeline-item">
                            <div className="timeline-badge">15s</div>
                            <div className="timeline-content">
                                <h4>🤝 Interaction Steps</h4>
                                <div className="interaction-steps">
                                    <div className="step">
                                        <span className="step-number">1</span>
                                        <span className="step-text">Type <code>"hi"</code> - greet the GenAI Agent</span>
                                    </div>
                                    <div className="step">
                                        <span className="step-number">2</span>
                                        <span className="step-text">Next type <code>"yes"</code> - to confirm you are ready to start the test</span>
                                    </div>
                                    <div className="step">
                                        <span className="step-number">3</span>
                                        <span className="step-text">Next type <code>"1 or 2"</code> - to select the topic of your choice</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-item">
                            <div className="timeline-badge">30s</div>
                            <div className="timeline-content">
                                <h4>💭 Think Time</h4>
                                <p>30 seconds to think about the topic you have selected</p>
                            </div>
                        </div>

                        <div className="timeline-item">
                            <div className="timeline-badge">1m</div>
                            <div className="timeline-content">
                                <h4>🗣️ Speaking Time</h4>
                                <p>1 minute to start speaking about the topic</p>
                            </div>
                        </div>

                        <div className="timeline-item">
                            <div className="timeline-badge">15s</div>
                            <div className="timeline-content">
                                <h4>📊 Feedback</h4>
                                <p>15 seconds to receive feedback of your test</p>
                            </div>
                        </div>
                    </div>

                    <div className="tips-section">
                        <h3 className="tips-title">💡 Quick Tips</h3>
                        <div className="tips-grid">
                            <div className="tip-card">
                                <span className="tip-icon">🎯</span>
                                <p>Stay focused and speak clearly</p>
                            </div>
                            <div className="tip-card">
                                <span className="tip-icon">⏰</span>
                                <p>Manage your time effectively</p>
                            </div>
                            <div className="tip-card">
                                <span className="tip-icon">🔊</span>
                                <p>Speak confidently and loudly</p>
                            </div>
                            <div className="tip-card">
                                <span className="tip-icon">📝</span>
                                <p>Structure your thoughts well</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    {countdown !== null ? (
                        <div className="countdown-display">
                            <div className="countdown-circle">
                                <span className="countdown-number">{countdown}</span>
                            </div>
                            <p className="countdown-text">Starting test in {countdown} seconds...</p>
                        </div>
                    ) : (
                        <button className="start-test-btn" onClick={startTest}>
                            <span className="btn-icon">🚀</span>
                            Start JAM Test
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JAMTestInstructions;