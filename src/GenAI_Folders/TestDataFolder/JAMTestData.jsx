import React, { useState, useEffect } from "react";
import './JAMTestData.css';

function JAMTestData() {
    const [sessions, setSessions] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [selectedAnalytics, setSelectedAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('start');
    const [animateProgress, setAnimateProgress] = useState(false);

    useEffect(() => {
        setAnimateProgress(true);
    }, []);

    useEffect(() => {
        if ((activeTab === 'history' || activeTab === 'analytics') && sessions.length === 0) {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        setLoading(true);
        const email = localStorage.getItem('email');
        try {
            const response = await fetch('https://4b5jtqs0eb.execute-api.ap-south-1.amazonaws.com/dev/jam-test-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            const parsedSessions = JSON.parse(data.body).sessions;
            setSessions(parsedSessions);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const getAverageScore = () => {
        const scores = sessions.map(session => {
            const feedback = extractFeedback(session.conversationHistory);
            return feedback && feedback.score !== 'N/A' ? parseFloat(feedback.score.split('/')[0]) : 0;
        }).filter(score => score > 0);
        
        return scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    };

    const getScoreCategory = (score) => {
        if (score >= 9) return { text: 'Perfect Performance', color: '#4CAF50' };
        if (score >= 8) return { text: 'Good Performance', color: '#2196F3' };
        if (score >= 7) return { text: 'Average Performance', color: '#FF9800' };
        if (score >= 6) return { text: 'Poor Performance', color: '#F44336' };
        return { text: 'No Score Available', color: '#9E9E9E' };
    };

    const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#4CAF50' }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDasharray = `${circumference} ${circumference}`;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="circular-progress" style={{ width: size, height: size }}>
                <svg width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e0e0e0"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={animateProgress ? strokeDashoffset : circumference}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ transition: 'stroke-dashoffset 2s ease-in-out' }}
                    />
                </svg>
                <div className="progress-text">
                    <span className="percentage">{percentage}/10</span>
                </div>
            </div>
        );
    };



    return (
        <div className="jam-dashboard">
            <div className="dashboard-header">
                <h1>Here is your JAM Test with GenAI Agent Details</h1>
                <div className="overall-score">
                    <CircularProgress percentage={getAverageScore()} size={150} color={getScoreCategory(getAverageScore()).color} />
                    <div className="score-details">
                        <h2>Average Score</h2>
                        <p style={{ color: getScoreCategory(getAverageScore()).color, fontWeight: 'bold' }}>
                            {getScoreCategory(getAverageScore()).text}
                        </p>
                    </div>
                </div>
            </div>

            <div className="tab-navigation">
                <button
                    className={`tab-button start-test ${activeTab === 'start' ? 'active' : ''}`}
                    onClick={() => setActiveTab('start')}
                >
                    🚀 Start Test
                </button>
                <button
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📚 History
                </button>
                <button
                    className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📊 Analytics
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'start' && (
                    <div className="start-tab">
                        <h2>🎯 Scheduled Tests</h2>
                        <div className="test-activities">
                            <button 
                                onClick={() => window.location.href = '/jam-test-instructions'}
                                className="test-activity-btn"
                            >
                                🎤 JAM Session Test - Click here to take test
                            </button>
                            {/* <button 
                                onClick={() => window.location.href = '/jam-test-data'}
                                className="test-activity-btn communication"
                            >
                                💬 Communication Skills Test - Click here to take test
                            </button>
                            <button 
                                onClick={() => window.location.href = '/jam-test-data'}
                                className="test-activity-btn interview"
                            >
                                👔 Mock Interview Test - Click here to take test
                            </button> */}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-tab">
                        {loading ? (
                            <div className="empty-state">
                                <h3>Loading...</h3>
                            </div>
                        ) : sessions.length > 0 ? (
                            <div className="split-layout">
                                <div className="sessions-sidebar">
                                    <h3>📚 Session History</h3>
                                    <div className="session-count">Test Count: {sessions.length}</div>
                                    <div className="session-buttons">
                                        {sessions.map((session) => (
                                            <button
                                                key={session.sessionId}
                                                className={`session-btn ${selectedHistory?.sessionId === session.sessionId ? 'active' : ''}`}
                                                onClick={() => setSelectedHistory(selectedHistory?.sessionId === session.sessionId ? null : session)}
                                            >
                                                <div className="session-info">
                                                    <span className="session-time">Session Time: {session.time ? new Date(session.time).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}) : 'N/A'}</span>
                                                    <br />
                                                    <span className="session-id">JAMSessionId: {session.sessionId}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="history-content">
                                    {selectedHistory ? (
                                        <div className="conversation-display">
                                            <h3>💬 {selectedHistory.sessionId}</h3>
                                            <div className="conversation-content">
                                                {Array.isArray(selectedHistory.conversationHistory) ? (
                                                    // Handle array format: [{user: "msg", agent: "response"}]
                                                    selectedHistory.conversationHistory.map((item, index) => (
                                                        <div key={index} className="message-pair">
                                                            <div className="user-message">
                                                                <span className="message-label">You:</span>
                                                                <div className="message-content">{item.user}</div>
                                                            </div>
                                                            <div className="agent-message">
                                                                <span className="message-label">JAM Agent:</span>
                                                                <div className="message-content">{item.agent}</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    // Handle object format: {"user_msg": "agent_response"}
                                                    Object.entries(selectedHistory.conversationHistory).map(([user, agent], index) => (
                                                        <div key={index} className="message-pair">
                                                            <div className="user-message">
                                                                <span className="message-label">You:</span>
                                                                <div className="message-content">{user}</div>
                                                            </div>
                                                            <div className="agent-message">
                                                                <span className="message-label">JAM Agent:</span>
                                                                <div className="message-content">{agent}</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="select-prompt">
                                            <h3>Select a session to view history</h3>
                                            <p>Click on any session from the left to see the conversation</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h3>No history available</h3>
                                <p>Complete some JAM sessions to see your history</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="analytics-tab">
                        {loading ? (
                            <div className="empty-state">
                                <h3>Loading...</h3>
                            </div>
                        ) : sessions.length > 0 ? (
                            <div className="split-layout">
                                <div className="analytics-sidebar">
                                    <h3>📊 Session Analytics</h3>
                                    <div className="session-count">Test Count: {sessions.length}</div>
                                    <div className="analytics-buttons">
                                        {sessions.map((session) => {
                                            const feedback = extractFeedback(session.conversationHistory);
                                            return feedback ? (
                                                <button
                                                    key={session.sessionId}
                                                    className={`analytics-btn ${selectedAnalytics?.sessionId === session.sessionId ? 'active' : ''}`}
                                                    onClick={() => setSelectedAnalytics(selectedAnalytics?.sessionId === session.sessionId ? null : {...session, feedback})}
                                                >
                                                    <div className="session-info">
                                                        <span className="session-time">Session Time: {session.time ? new Date(session.time).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}) : 'N/A'}</span>
                                                        <br />
                                                        <span className="session-id">JAMSessionId: {session.sessionId}</span>
                                                        <span className="score-badge">Score: {feedback.score}</span>
                                                    </div>
                                                </button>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                                
                                <div className="analytics-content">
                                    {selectedAnalytics ? (
                                        <div className="feedback-display">
                                            <h3>🎯 {selectedAnalytics.sessionId}</h3>
                                            <div className="feedback-content">
                                                <div className="score-section">
                                                    <div className="overall-rating">
                                                        <span className="rating-label">Overall Rating:</span>
                                                        <span className="rating-value">{selectedAnalytics.feedback.score}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="feedback-details">
                                                    <h4>📝 Agent Feedback:</h4>
                                                    <div className="feedback-list">
                                                        {selectedAnalytics.feedback.details.map((detail, index) => (
                                                            <div key={index} className="feedback-item">• {detail}</div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {selectedAnalytics.feedback.tip && (
                                                    <div className="tip-section">
                                                        <h4>💡 Tip:</h4>
                                                        <div className="tip-content">{selectedAnalytics.feedback.tip}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="select-prompt">
                                            <h3>Select a session to view analytics</h3>
                                            <p>Click on any session from the left to see detailed feedback</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h3>No analytics available</h3>
                                <p>Complete some JAM sessions to see your analytics</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function extractFeedback(conversationHistory) {
    if (Array.isArray(conversationHistory)) {
        // Handle array format
        for (const item of conversationHistory) {
            if (item.agent && (item.agent.includes('JAM Score:') || item.agent.includes('Overall Rating:'))) {
                // Look for JAM Score format first, then fallback to Overall Rating
                const jamScoreMatch = item.agent.match(/JAM Score:\s*(\d+(?:\.\d+)?)\/10/)
                const overallRatingMatch = item.agent.match(/Overall Rating:\*\*\s*(\d+(?:\.\d+)?)\/10/)
                const scoreMatch = jamScoreMatch || overallRatingMatch
                
                // Extract feedback lines
                const feedbackLines = item.agent.split('\n')
                    .filter(line => line.includes(':') && (line.includes('Grammar') || line.includes('Vocabulary') || line.includes('Content') || line.includes('Flow') || line.includes('Time')))
                    .map(line => line.replace(/\*\*/g, '').trim())
                
                const tipMatch = item.agent.match(/(?:Tip|Remember):\s*(.+?)(?:\n|$)/s)
                
                return {
                    score: scoreMatch ? scoreMatch[1] + '/10' : 'N/A',
                    details: feedbackLines.length > 0 ? feedbackLines : ['Feedback provided'],
                    tip: tipMatch ? tipMatch[1].trim() : null
                }
            }
        }
    } else {
        // Handle object format
        for (const [user, agent] of Object.entries(conversationHistory)) {
            if (agent && (agent.includes('JAM Score:') || agent.includes('Overall Rating:'))) {
                const jamScoreMatch = agent.match(/JAM Score:\s*(\d+(?:\.\d+)?)\/10/)
                const overallRatingMatch = agent.match(/Overall Rating:\*\*\s*(\d+(?:\.\d+)?)\/10/)
                const scoreMatch = jamScoreMatch || overallRatingMatch
                
                const feedbackLines = agent.split('\n')
                    .filter(line => line.includes(':') && (line.includes('Grammar') || line.includes('Vocabulary') || line.includes('Content') || line.includes('Flow') || line.includes('Time')))
                    .map(line => line.replace(/\*\*/g, '').trim())
                
                const tipMatch = agent.match(/(?:Tip|Remember):\s*(.+?)(?:\n|$)/s)
                
                return {
                    score: scoreMatch ? scoreMatch[1] + '/10' : 'N/A',
                    details: feedbackLines.length > 0 ? feedbackLines : ['Feedback provided'],
                    tip: tipMatch ? tipMatch[1].trim() : null
                }
            }
        }
    }
    return null
}

export default JAMTestData;