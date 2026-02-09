import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Menu, X } from "lucide-react";
import "./practice-custom.css";
import '../RegisterFiles/login.css';

function Practice() {
    const [practices, setPractices] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('basic');
    const [instructionIndex, setInstructionIndex] = useState(0);
    const [apiData, setApiData] = useState({});
    const [userType, setUserType] = useState('free');
    const [streakData, setStreakData] = useState({ current_streak: 0 });
    const [showMobileMenu, setShowMobileMenu] = useState(false);
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
            fetch(import.meta.env.VITE_UPDATE_USER_STREAK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    body: JSON.stringify({
                        college_email: storedEmail,
                        get_streak_data: true
                    })
                })
            }),
            fetch(import.meta.env.VITE_PRACTICE_RESULTS_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ college_email: storedEmail })
            })
        ])
        .then(async ([profileResponse, streakResponse, dashboardResponse]) => {
            const profileData = await profileResponse.json();
            const streakDataResult = await streakResponse.json();
            const dashboardData = await dashboardResponse.json();
            
            if (profileData?.body) {
                const parsedProfileData = typeof profileData.body === "string" ? JSON.parse(profileData.body) : profileData.body;
                setPractices(parsedProfileData.practices || {});
                setUserType(parsedProfileData.user_type === 'premium' && parsedProfileData.premium_status === 'active' ? 'premium' : 'free');
            }
            
            if (streakDataResult?.body) {
                const parsedStreakData = typeof streakDataResult.body === "string" ? JSON.parse(streakDataResult.body) : streakDataResult.body;
                setStreakData(parsedStreakData);
            }
            
            if (dashboardData?.body) {
                const parsedDashboardData = JSON.parse(dashboardData.body).dashboard;
                setApiData(parsedDashboardData);
            }
            
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    const getPracticeStats = (activityId) => {
        const practiceMap = {
            'jam_practice': 'jam_practice',
            'pronu_practice': 'pronu_practice', 
            'listen_practice': 'listen_practice',
            'situation_practice': 'situation_practice',
            'image_speak_practice': 'image_speak_practice'
        };
        
        const practiceData = apiData[practiceMap[activityId]];
        if (!practiceData || !practiceData.levels) {
            return { avgScore: '0', practiceCount: 0 };
        }

        const basicLevel = practiceData.levels.basic || { avgScore: 0, attempts: 0 };
        return {
            avgScore: basicLevel.avgScore?.toFixed(1) || '0',
            practiceCount: basicLevel.attempts || 0
        };
    };

    const getIntermediateStats = (activityId) => {
        const practiceMap = {
            'jam_practice': 'jam_practice',
            'pronu_practice': 'pronu_practice', 
            'listen_practice': 'listen_practice',
            'situation_practice': 'situation_practice',
            'image_speak_practice': 'image_speak_practice'
        };
        
        const practiceData = apiData[practiceMap[activityId]];
        if (!practiceData || !practiceData.levels) {
            return { avgScore: '0', practiceCount: 0 };
        }

        const intermediateLevel = practiceData.levels.intermediate || { avgScore: 0, attempts: 0 };
        return {
            avgScore: intermediateLevel.avgScore?.toFixed(1) || '0',
            practiceCount: intermediateLevel.attempts || 0
        };
    };

    const getAdvancedStats = (activityId) => {
        const practiceMap = {
            'jam_practice': 'jam_practice',
            'pronu_practice': 'pronu_practice', 
            'listen_practice': 'listen_practice',
            'situation_practice': 'situation_practice',
            'image_speak_practice': 'image_speak_practice'
        };
        
        const practiceData = apiData[practiceMap[activityId]];
        if (!practiceData || !practiceData.levels) {
            return { avgScore: '0', practiceCount: 0 };
        }

        const advancedLevel = practiceData.levels.advanced || { avgScore: 0, attempts: 0 };
        return {
            avgScore: advancedLevel.avgScore?.toFixed(1) || '0',
            practiceCount: advancedLevel.attempts || 0
        };
    };

    const activities = [
        {
            id: 'jam_practice',
            title: 'JAM Practice',
            description: 'JAM speaking sessions to improve spontaneous communication',
            count: practices.jam_practice || 0
        },
        {
            id: 'pronu_practice',
            title: 'Pronunciation Practice',
            description: 'Perfect your pronunciation with AI-powered feedback',
            count: practices.pronu_practice || 0
        },
        {
            id: 'listen_practice',
            title: 'Listening Practice',
            description: 'Enhance comprehension with interactive listening exercises',
            count: practices.listen_practice || 0
        },
        {
            id: 'situation_practice',
            title: 'Situational Speaking',
            description: 'Practice real-life scenarios to build confidence',
            count: practices.situation_practice || 0
        },
        {
            id: 'image_speak_practice',
            title: 'Image-Based Speaking',
            description: 'Describe images to enhance vocabulary and fluency',
            count: practices.image_speak_practice || 0
        }
    ];

    const practiceInstructions = {
        jam_practice: [{
            title: "Instructions for JAM Practice",
            content: (<strong>- You will be given a <b>random topic</b> by <b>Tara AI</b>.<br />- You will have <b>1 minute</b> to speak continuously.<br />- Focus on <b>content relevance, clarity, fluency, confidence</b>.</strong>)
        }],
        pronu_practice: [{
            title: "Pronunciation Practice Overview",
            content: (<strong>- You will be given <b>words or sentences</b> to pronounce.<br />- Focus on <b>clarity, accuracy, and correct sounds</b>.</strong>)
        }],
        listen_practice: [{
            title: "Listening Practice Instructions",
            content: (<strong>- You will hear <b>audio clips</b> carefully curated by <b>Tara AI</b>.<br />- Listen attentively before responding.</strong>)
        }],
        situation_practice: [{
            title: "Situational Speaking Overview",
            content: (<strong>- You will be given a <b>real-life situation</b>.<br />- Respond as you would in an interview or workplace.</strong>)
        }],
        image_speak_practice: [{
            title: "Image Speaking Instructions",
            content: (<strong>- You will be shown an <b>image</b>.<br />- Describe what you observe clearly and confidently.</strong>)
        }]
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
        if (activity) {
            const routeMap = {
                'jam_practice': 'jam',
                'pronu_practice': 'pronunciation',
                'listen_practice': 'listening',
                'situation_practice': 'situation',
                'image_speak_practice': 'image-speak'
            };

            navigate(`/practice/${routeMap[activeChallenge]}`, {
                state: {
                    remainingPractices: activity.count || 0,
                    practiceType: activeChallenge,
                    practiceLevel: selectedLevel
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
                <p>Loading practices...</p>
            </div>
        );
    }

    return (
        <div className="practice-theme min-h-screen bg-background">
            <div className="sticky top-0 z-40 glass border-b border-border">
                {showMobileMenu && (
                    <div className="sm:hidden border-t" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
                        <div className="px-4 py-3 flex flex-col gap-2">
                            <div className="border-t pt-2 mt-2 space-y-1" style={{ borderColor: 'hsl(var(--border))' }}>
                                <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Streak: {streakData.current_streak || 0}</div>
                                <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{userType === "premium" ? "Premium" : "Free"}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                        Practice with TaraAI
                    </h2>
                    <p style={{ color: 'hsl(var(--muted-foreground))', maxWidth: '600px', margin: '0 auto' }}>
                        Improve your communication skills through guided practice sessions with instant feedback.
                    </p>
                </div>

                <div className="practice-activity-grid">
                    {activities.map((activity) => {
                        const stats = getPracticeStats(activity.id);
                        return (
                            <div key={activity.id} className="practice-activity-card">
                                <h3 className="practice-activity-title">{activity.title}</h3>
                                <p className="practice-activity-description">{activity.description}</p>
                                <div style={{paddingBottom:"15px", fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))'}}>Remaining: {activity.count}</div>
                                <div className="practice-card-content">
                                    <div className="practice-activity-buttons">
                                        {activity.id === 'image_speak_practice' ? (
                                            <button className="practice-level-button" disabled style={{ opacity: 0.5 }}>
                                                <span>Basic - Coming Soon</span>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleStartChallenge(activity.id)}
                                                className="practice-level-button"
                                                style={activity.count === 0 ? { background: '#9ca3af', cursor: 'pointer' } : {}}
                                            >
                                                {activity.count === 0 ? (userType === 'premium' ? '⏰ Come Back Tomorrow' : '🔒 Locked - Buy Premium') : 'Start Practice'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showLevelModal && (
                <div className="practice-modal-overlay">
                    <div className="practice-modal" style={{ maxWidth: '400px' }}>
                        <div className="practice-modal-header">
                            <h3 className="practice-modal-title">Select Level</h3>
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
                        <div className="practice-modal-content">
                            <p style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'hsl(var(--muted-foreground))' }}>
                                Choose difficulty level for this practice
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['Basic', 'Intermediate', 'Advanced'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleLevelChoice(level)}
                                        className="practice-level-button"
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
                <div className="practice-modal-overlay" onClick={() => setShowPremiumLockModal(false)}>
                    <div className="practice-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div className="practice-modal-header">
                            <h3 className="practice-modal-title">🔒 Premium Required</h3>
                            <button
                                onClick={() => setShowPremiumLockModal(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="practice-modal-content">
                            <p style={{ fontSize: '0.95rem', marginBottom: '16px', textAlign: 'center' }}>
                                You've used all your free practice attempts. Upgrade to Premium to unlock unlimited practice sessions and advanced features!
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button className="practice-level-button" onClick={() => setShowPremiumLockModal(false)}>
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
                <div className="practice-modal-overlay" onClick={() => { setShowPremiumModal(false); setActiveChallenge(null); }}>
                    <div className="practice-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div className="practice-modal-header">
                            <h3 className="practice-modal-title">Upgrade to Premium</h3>
                            <button
                                onClick={() => { setShowPremiumModal(false); setActiveChallenge(null); }}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="practice-modal-content">
                            <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                                You're on the Free plan. Upgrade to Premium to unlock more features, advanced analytics, and unlimited practice sessions.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button className="practice-level-button" onClick={() => { setShowPremiumModal(false); setShowLevelModal(true); }}>
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
                <div className="practice-modal-overlay">
                    <div className="practice-modal">
                        <div className="practice-modal-header">
                            <h2 className="practice-modal-title">
                                {practiceInstructions[activeChallenge]?.[instructionIndex]?.title}
                            </h2>
                            <button 
                                onClick={() => setActiveChallenge(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                            >
                                X
                            </button>
                        </div>
                        
                        <div className="practice-modal-content">
                            {practiceInstructions[activeChallenge]?.[instructionIndex]?.content}
                        </div>
                        
                        <div className="practice-modal-actions">
                            <button 
                                onClick={handleLaunchChallenge}
                                className="practice-level-button"
                                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                                START PRACTICE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Practice;
