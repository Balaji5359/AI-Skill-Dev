import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./test-custom.css";

function Test() {
    const [tests, setTests] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('basic');
    const [instructionIndex, setInstructionIndex] = useState(0);
    const [apiData, setApiData] = useState({});
    const [userType, setUserType] = useState('free');
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showPremiumLockModal, setShowPremiumLockModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (!storedEmail) {
            setLoading(false);
            return;
        }  
        
        Promise.all([
            fetch(import.meta.env.VITE_STUDENT_PROFILE_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ college_email: storedEmail }),
            }),
            fetch(import.meta.env.VITE_TEST_RESULTS_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ college_email: storedEmail })
            })
        ])
        .then(async ([profileResponse, dashboardResponse]) => {
            const profileData = await profileResponse.json();
            const dashboardData = await dashboardResponse.json();
            
            if (profileData?.body) {
                const parsedProfileData = typeof profileData.body === "string" ? JSON.parse(profileData.body) : profileData.body;
                setTests(parsedProfileData.tests || {});
                setUserType(parsedProfileData.user_type === 'premium' && parsedProfileData.premium_status === 'active' ? 'premium' : 'free');
            }
            
            if (dashboardData?.body) {
                const parsedDashboardData = JSON.parse(dashboardData.body).dashboard;
                setApiData(parsedDashboardData);
            }
            
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    const getTestStats = (activityId) => {
        const testMap = {
            'jam': 'jam_test',
            'pronunciation': 'pronu_test', 
            'listening': 'listen_test',
            'situational': 'situation_test',
            'image-speak': 'image_speak'
        };
        
        const testData = apiData[testMap[activityId]];
        if (!testData || !testData.levels) {
            return { avgScore: '0', testCount: 0 };
        }

        const basicLevel = testData.levels.basic || { avgScore: 0, attempts: 0 };
        return {
            avgScore: basicLevel.avgScore?.toFixed(1) || '0',
            testCount: basicLevel.attempts || 0
        };
    };

    const getIntermediateStats = (activityId) => {
        const testMap = {
            'jam': 'jam_test',
            'pronunciation': 'pronu_test', 
            'listening': 'listen_test',
            'situational': 'situation_test',
            'image-speak': 'image_speak'
        };
        
        const testData = apiData[testMap[activityId]];
        if (!testData || !testData.levels) {
            return { avgScore: '0', testCount: 0 };
        }

        const intermediateLevel = testData.levels.intermediate || { avgScore: 0, attempts: 0 };
        return {
            avgScore: intermediateLevel.avgScore?.toFixed(1) || '0',
            testCount: intermediateLevel.attempts || 0
        };
    };

    const getAdvancedStats = (activityId) => {
        const testMap = {
            'jam': 'jam_test',
            'pronunciation': 'pronu_test', 
            'listening': 'listen_test',
            'situational': 'situation_test',
            'image-speak': 'image_speak'
        };
        
        const testData = apiData[testMap[activityId]];
        if (!testData || !testData.levels) {
            return { avgScore: '0', testCount: 0 };
        }

        const advancedLevel = testData.levels.advanced || { avgScore: 0, attempts: 0 };
        return {
            avgScore: advancedLevel.avgScore?.toFixed(1) || '0',
            testCount: advancedLevel.attempts || 0
        };
    };

    const activities = [
        {
            id: 'jam',
            title: 'JAM Sessions',
            description: 'JAM speaking sessions to improve spontaneous communication',
            count: tests.jam_test || 0,
            route: '/test/jam'
        },
        {
            id: 'pronunciation',
            title: 'Pronunciation Test',
            description: 'Perfect your pronunciation with AI-powered feedback',
            count: tests.pronu_test || 0,
            route: '/test/pronunciation'
        },
        {
            id: 'listening',
            title: 'Listening Test',
            description: 'Enhance comprehension with interactive listening exercises',
            count: tests.listen_test || 0,
            route: '/test/listening'
        },
        {
            id: 'situational',
            title: 'Situational Speaking',
            description: 'Practice real-life scenarios to build confidence',
            count: tests.situation_test || 0,
            route: '/test/situation-speak'
        },
        {
            id: 'image-speak',
            title: 'Image-Based Speaking',
            description: 'Describe images to enhance vocabulary and fluency',
            count: tests.image_speak || 0,
            route: '/test/image-speak'
        }
    ];

const testInstructions = {
    jam: [
        {
        title: "Instructions for JAM",
        content: (
            <strong>
            - You will be given a <b>random topic</b> by{" "}
            <b style={{ fontFamily: "Arial", fontSize: "22px" }}>Tara AI</b>.<br />
            - You will have <b>1 minute</b> to speak continuously.<br />
            - Focus on <b>content relevance, clarity, fluency, confidence</b>.
            </strong>
        )
        }
    ],
    pronunciation: [
        {
        title: "Pronunciation Practice Overview",
        content: (
            <strong>
            - You will be given <b>words or sentences</b> to pronounce.<br />
            - Focus on <b>clarity, accuracy, and correct sounds</b>.
            </strong>
        )
        }
    ],
    listening: [
        {
        title: "Listening Test Instructions",
        content: (
            <strong>
            - You will hear <b>audio clips</b> carefully curated by{" "}
            <b>Tara AI</b>.<br />
            - Listen attentively before answering.
            </strong>
        )
        }
    ],
    situational: [
        {
        title: "Situational Speaking Overview",
        content: (
            <strong>
            - You will be given a <b>real-life situation</b>.<br />
            - Respond as you would in an interview or workplace.
            </strong>
        )
        }
    ],
    "image-speak": [
        {
        title: "Image Speaking Instructions",
        content: (
            <strong>
            - You will be shown an <b>image</b>.<br />
            - Describe what you observe clearly and confidently.
            </strong>
        )
        }
    ]
    };

    const handleStartChallenge = (id) => {
        const activity = activities.find(a => a.id === id);
        if (activity?.count === 0) {
            if (userType !== 'premium') {
                setShowPremiumLockModal(true);
            }
            return;
        }
        if (userType !== 'premium' && activity?.count > 0) {
            setActiveChallenge(id);
            setShowPremiumModal(true);
            return;
        }
        setActiveChallenge(id);
        setShowLevelModal(true);
    };

    const handleLevelChoice = (level) => {
        setSelectedLevel(level);
        setShowLevelModal(false);
        setInstructionIndex(0);
    };

    const handleLaunchChallenge = () => {
        const activity = activities.find(a => a.id === activeChallenge);
        if (activity?.route) {
            navigate(activity.route, {
                state: {
                    remainingTests: activity.count || 0,
                    testKey: activeChallenge,
                    testLevel: selectedLevel
                }
            });
        }
    };

    // disable background scroll when modals are open
    useEffect(() => {
        if (showPremiumModal || showPremiumLockModal) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [showPremiumModal, showPremiumLockModal]);

    if (loading) {
        return (
            <div className="app-loading-container app-bg-free">
                <div className="app-loading-spinner"></div>
                <p>Loading tests...</p>
            </div>
        );
    }

    return (
        <div className="test-theme min-h-screen bg-background">
            <div className="sticky top-0 z-40 glass border-b border-border" />

            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                        Test with TaraAI
                    </h2>
                    <p style={{ color: 'hsl(var(--muted-foreground))', maxWidth: '600px', margin: '0 auto' }}>
                        Professional communication evaluation with strict assessment criteria and detailed scoring.
                    </p>
                </div>

                <div className="test-activity-grid">
                    {activities.map((activity) => {
                        return (
                            <div key={activity.id} className="test-activity-card">
                                <h3 className="test-activity-title">{activity.title}</h3>
                                <p className="test-activity-description">{activity.description}</p>
                                <div style={{paddingBottom:"15px", fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))'}}>Remaining: {activity.count}</div>
                                <div className="test-card-content">
                                    <div className="test-activity-buttons">
                                        {activity.id === 'image-speak' ? (
                                            <button className="test-level-button" disabled style={{ opacity: 0.5 }}>
                                                <span>Basic - Coming Soon</span>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleStartChallenge(activity.id)}
                                                className="test-level-button"
                                                style={activity.count === 0 ? { background: '#9ca3af', cursor: 'pointer' } : {}}
                                            >
                                                {activity.count === 0 ? (userType === 'premium' ? '⏰ Come Back Tomorrow' : '🔒 Locked - Buy Premium') : 'Start Test'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="test-activity-stats">
                                        <div className="test-activity-stats-text">
                                            <div>Basic Count: {loading ? '...' : getTestStats(activity.id).testCount}</div>
                                            <div>Basic Avg Score: {loading ? '...' : getTestStats(activity.id).avgScore}</div>
                                            <div>Intermed Count: {loading ? '...' : getIntermediateStats(activity.id).testCount}</div>
                                            <div>Intermed Avg Score: {loading ? '...' : getIntermediateStats(activity.id).avgScore}</div>
                                            <div>Advanced Count: {loading ? '...' : getAdvancedStats(activity.id).testCount}</div>
                                            <div>Advanced Avg Score: {loading ? '...' : getAdvancedStats(activity.id).avgScore}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showLevelModal && (
                <div className="test-modal-overlay">
                    <div className="test-modal" style={{ maxWidth: '400px' }}>
                        <div className="test-modal-header">
                            <h3 className="test-modal-title">Select Level</h3>
                            <button
                                onClick={() => {
                                    setShowLevelModal(false);
                                    setActiveChallenge(null);
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                            >
                                X
                            </button>
                        </div>
                        <div className="test-modal-content">
                            <p style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'hsl(var(--muted-foreground))' }}>
                                Choose difficulty level for this test
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['Basic', 'Intermediate', 'Advanced'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleLevelChoice(level)}
                                        className="test-level-button"
                                        style={{ width: '100%', padding: '12px' }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPremiumLockModal && (
                <div className="test-modal-overlay" onClick={() => setShowPremiumLockModal(false)}>
                    <div className="test-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div className="test-modal-header">
                            <h3 className="test-modal-title">🔒 Premium Required</h3>
                            <button
                                onClick={() => setShowPremiumLockModal(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="test-modal-content">
                            <p style={{ fontSize: '0.95rem', marginBottom: '16px', textAlign: 'center' }}>
                                You've used all your free test attempts. Upgrade to Premium to unlock unlimited tests and advanced features!
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button className="test-level-button" onClick={() => setShowPremiumLockModal(false)}>
                                    Cancel
                                </button>
                                <button className="app-btn-primary" onClick={() => navigate('/profiledata')}>
                                    Buy Premium
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPremiumModal && (
                <div className="test-modal-overlay" onClick={() => { setShowPremiumModal(false); setActiveChallenge(null); }}>
                    <div className="test-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div className="test-modal-header">
                            <h3 className="test-modal-title">Upgrade to Premium</h3>
                            <button
                                onClick={() => { setShowPremiumModal(false); setActiveChallenge(null); }}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="test-modal-content">
                            <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                                You're on the Free plan. Upgrade to Premium to unlock more features, advanced analytics, and unlimited attempts.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button className="test-level-button" onClick={() => { setShowPremiumModal(false); setShowLevelModal(true); }}>
                                    Continue (Use free attempt)
                                </button>
                                <button className="app-btn-primary" onClick={() => navigate('/profiledata')}>
                                    Buy Premium
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeChallenge && !showLevelModal && (
                <div className="test-modal-overlay">
                    <div className="test-modal">
                        <div className="test-modal-header">
                            <h2 className="test-modal-title">
                                {testInstructions[activeChallenge]?.[instructionIndex]?.title}
                            </h2>
                            <button 
                                onClick={() => setActiveChallenge(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                            >
                                X
                            </button>
                        </div>
                        
                        <div className="test-modal-content">
                            {testInstructions[activeChallenge]?.[instructionIndex]?.content}
                        </div>
                        
                        <div className="test-modal-actions">
                            <button 
                                onClick={handleLaunchChallenge}
                                className="test-level-button"
                                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
                            >
                                START TEST
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Test;
