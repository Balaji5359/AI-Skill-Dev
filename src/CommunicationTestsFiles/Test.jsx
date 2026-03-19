import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { profileAPI, resultsAPI, activityUsageAPI } from "../services/api";
import "./test-custom.css";

const buildTestInstructions = () => ({
  jam: [
    {
      title: "JAM Session Overview",
      content: (
        <div className="space-y-3">
          <p>You will be given a <strong>random topic</strong> by <strong>Tara AI</strong>.</p>
          <p>Prepare to demonstrate your spontaneous speaking abilities in this challenging test.</p>
          <ul>
            <li><strong>Tips :-</strong></li>
            <li>- Start with good introduction</li>
            <li>- Maintain good points</li>
            <li>- Close with a conclusion</li>
          </ul>
        </div>
      )
    },
    {
      title: "Timeline",
      content: (
        <div className="space-y-3">
          <p>You have <strong>30 seconds</strong> to think and plan your response.</p>
          <p>You have <strong>60 seconds</strong> to speak continuously.</p>
          <p>Make sure you speak clearly and cover the topic thoroughly within the time limit.</p>
        </div>
      )
    },
    {
      title: "Mic Condition",
      content: (
        <div className="space-y-3">
          <p>Ensure a <strong>quiet environment</strong> for the test.</p>
          <p>Only <strong>1 time recording</strong> is allowed, then mic will be <strong>disabled</strong>.</p>
          <p>Test in a professional, distraction-free setting.</p>
        </div>
      )
    },
    {
      title: "Test Count",
      content: (
        <div className="space-y-3">
          <p>Your <strong>"Remaining" count</strong> decrements <strong>immediately</strong> upon successful completion of the test or if time runs out.</p>
          <p>In case <strong>exit from test</strong>, <strong>internet issue</strong>, <strong>exit full screen</strong> or any <strong>other issue</strong>, the test will be considered <strong>incomplete</strong> and <strong><br></br>no count decrement</strong>, then start new Test</p>
        </div>
      )
    },
    {
      title: "Focus Areas",
      content: (
        <div className="space-y-3">
          <p><strong>Content Relevance:</strong> Stay focused on the topic given.</p>
          <p><strong>Clarity:</strong> Speak clearly and confidently your words.</p>
          <p><strong>Fluency:</strong> Maintain smooth, continuous speech without long pauses.</p>
          <p><strong>Confidence:</strong> Project confidence in your delivery.</p>
        </div>
      )
    }
  ],
  pronunciation: [
    {
      title: "Pronunciation Test Overview",
      content: (
        <div className="space-y-3">
          <p>You will be given <strong>5 sentences</strong> to pronounce (Level based).</p>
          <p>Each sentence will be evaluated for correct pronunciation and phonemic accuracy.</p>
        </div>
      )
    },
    {
      title: "Mic Condition",
      content: (
        <div className="space-y-3">
          <p>Grant <strong>microphone permissions</strong> when prompted.</p>
          <p>Speak <strong>clearly</strong> into the receiver.</p>
          <p>Ensure you're in a quiet environment for accurate audio capture.</p>
        </div>
      )
    },
    {
      title: "Attempts & Scoring",
      content: (
        <div className="space-y-3">
          <p>You have <strong>one attempts</strong> per sentence to achieve a score.</p>
          <p>Each attempt is recorded and evaluated independently.</p>
          <p>Your <strong>average performance</strong> on all <strong>5 sentences</strong> will be the <br></br><strong>final score</strong>.</p>
        </div>
      )
    },
    {
      title: "Test Count",
      content: (
        <div className="space-y-3">
          <p>Your <strong>"Remaining" count</strong> decrements <strong>immediately</strong> upon successful completion of the test or if time runs out.</p>
          <p>In case <strong>exit from test</strong>, <strong>internet issue</strong>, <strong>exit full screen</strong> or any <strong>other issue</strong>, the test will be considered <strong>incomplete</strong> and <strong><br></br>no count decrement</strong>, then start new Test</p>
        </div>
      )
    },
    {
      title: "Focus Areas",
      content: (
        <div className="space-y-3">
          <p><strong>Clarity:</strong> Pronounce each word clearly, distinctly and confidently.</p>
          <p><strong>Accuracy:</strong> Match the correct pronunciation patterns.</p>
          <p><strong>Phonemic Sounds:</strong> Pay attention to individual phonetic elements.</p>
        </div>
      )
    }
  ],
  listening: [
    {
      title: "Listening Test Overview",
      content: (
        <div className="space-y-3">
          <p>You will be listen to <strong>5 sentences</strong> and speak back (Level based).</p>
          <p>Each sentence will be evaluated for <strong>correct pronunciation</strong> of <strong>listened sentences</strong> and phonemic accuracy.</p>
          <p>You have <strong>10 seconds</strong> to speak each sentence.</p>
        </div>
      )
    },
    {
      title: "Timeline",
      content: (
        <div className="space-y-3">
          <p>Audio plays <strong>only once</strong>.</p>
          <p><strong>No pausing or rewinding</strong> allowed during playback.</p>
          <p>Listen attentively the first time as you won't get a second chance.</p>
        </div>
      )
    },
    {
      title: "Test Count",
      content: (
        <div className="space-y-3">
          <p>Your <strong>"Remaining" count</strong> decrements <strong>immediately</strong> upon successful completion of the test or if time runs out.</p>
          <p>In case <strong>exit from test</strong>, <strong>internet issue</strong>, <strong>exit full screen</strong> or any <strong>other issue</strong>, the test will be considered <strong>incomplete</strong> and <strong><br></br>no count decrement</strong>, then start new Test</p>
        </div>
      )
    },
    {
      title: "Focus Areas",
      content: (
        <div className="space-y-3">
          <p><strong>Context:</strong> Listen for the overall context and meaning.</p>
          <p><strong>Specific Details:</strong> Pay attention to words, punctuation, and tone.</p>
          <p><strong>Tone & Intent:</strong> Understand the speaker's tone and purpose.</p>
        </div>
      )
    }
  ],
  situational: [
    {
      title: "Situational Speaking Overview",
      content: (
        <div className="space-y-3">
          <p>You will be given a <strong>real-life workplace scenario</strong> by <strong>Tara AI</strong>.</p>
          <p>Respond as if you were in that actual professional situation.</p>
          <ul>
            <li><strong>Tips :-</strong></li>
            <li>- Begin with a strong introduction.</li>
            <li>- Highlight the positive aspects of the situation.</li>
            <li>- Describe how you act, react, and manage that situation.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Timeline",
      content: (
        <div className="space-y-3">
          <p><strong>30 seconds</strong> preparation time to think and plan your response.</p>
          <p><strong>60 seconds</strong> to deliver your spoken response.</p>
          <p>Use the preparation time wisely to structure your thoughts.</p>
        </div>
      )
    },
    {
      title: "Mic Condition",
      content: (
        <div className="space-y-3">
          <p>Ensure a <strong>quiet environment</strong> for the test.</p>
          <p>Only <strong>1 time recording</strong> is allowed, then mic will be <strong>disabled</strong>.</p>
          <p>Test in a professional, distraction-free setting.</p>
        </div>
      )
    },
    {
      title: "Test Count",
      content: (
        <div className="space-y-3">
          <p>Your <strong>"Remaining" count</strong> decrements <strong>immediately</strong> upon successful completion of the test or if time runs out.</p>
          <p>In case <strong>exit from test</strong>, <strong>internet issue</strong>, <strong>exit full screen</strong> or any <strong>other issue</strong>, the test will be considered <strong>incomplete</strong> and <strong><br></br>no count decrement</strong>, then start new Test</p>
        </div>
      )
    },
    {
      title: "Response Guidelines",
      content: (
        <div className="space-y-3">
          <p>Respond as you would in a <strong>professional interview</strong>.</p>
          <p><strong>Be professional:</strong> Use formal language and courteous tone.</p>
          <p><strong>Be relevant:</strong> Address the scenario directly.</p>
          <p><strong>Be confident:</strong> Speak with clarity and assurance.</p>
        </div>
      )
    }
  ],
  "image-speak": [
    {
      title: "Image Speaking Overview",
      content: (
        <div className="space-y-3">
          <p>You will be shown a <strong>complex visual or chart</strong>.</p>
          <p>Describe and analyze what you see in detail.</p>
        </div>
      )
    },
    {
      title: "Timeline",
      content: (
        <div className="space-y-3">
          <p>Describe the image within the <strong>2-minute</strong> time limit.</p>
          <p>Make full use of the time to provide detailed analysis.</p>
          <p>You cannot pause or extend the time beyond 2 minutes.</p>
        </div>
      )
    },
    {
      title: "Minimum Speaking Time",
      content: (
        <div className="space-y-3">
          <p><strong>45 seconds</strong> minimum speaking time is required for valid scoring.</p>
          <p>If you speak for less than 45 seconds, your response won't be scored.</p>
          <p>Aim to use most of the 2-minute window.</p>
        </div>
      )
    },
    {
      title: "Test Count",
      content: (
        <div className="space-y-3">
          <p>Credit is deducted <strong>upon image reveal</strong>.</p>
          <p>Once you see the image, the test credit is consumed.</p>
          <p>Be ready to begin speaking when the image appears.</p>
        </div>
      )
    },
    {
      title: "Response Guidelines",
      content: (
        <div className="space-y-3">
          <p><strong>Observe:</strong> Describe what you see in the image.</p>
          <p><strong>Analyze:</strong> Explain patterns, relationships, and significance.</p>
          <p><strong>Conclude:</strong> Provide your overall interpretation and conclusions.</p>
          <p>Cover all aspects clearly and systematically.</p>
        </div>
      )
    }
  ]
});

function Test() {
    const [tests, setTests] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('basic');
    const [instructionIndex, setInstructionIndex] = useState(0);
    const [apiData, setApiData] = useState({});
    const [userType, setUserType] = useState('free');
    const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [showPremiumLockModal, setShowPremiumLockModal] = useState(false);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const navigate = useNavigate();
    const testInstructions = buildTestInstructions();

    useEffect(() => {
        // warm start from cached values to avoid showing zeros
        const cachedUserType = localStorage.getItem('user_type');
        if (cachedUserType) setUserType(cachedUserType);
        const cachedCurrent = Number(localStorage.getItem('streak_current') || 0);
        const cachedBest = Number(localStorage.getItem('streak_longest') || 0);
        if (cachedCurrent || cachedBest) setStreak({ current_streak: cachedCurrent, longest_streak: cachedBest });

        const storedEmail = localStorage.getItem("email");
        if (!storedEmail) {
            setLoading(false);
            return;
        }
        
        const loadTestData = async () => {
            try {
                // Try to load usage data first, then fall back to full profile
                const [usageData, profile, dashboard] = await Promise.all([
                    profileAPI.get(storedEmail, 'usage', 'communication_tests').catch(() => ({ statusCode: 400 })),
                    profileAPI.get(storedEmail).catch(() => ({ statusCode: 400 })),
                    resultsAPI.getTest(storedEmail).catch(() => ({ statusCode: 400 }))
                ]);

                // Set user type from profile data
                if (profile?.statusCode === 200) {
                    setUserType(profile.user_type === 'premium' && profile.premium_status === 'active' ? 'premium' : 'free');
                    if (profile?.streak) {
                        setStreak({
                            current_streak: profile.streak.current_streak || 0,
                            longest_streak: profile.streak.longest_streak || 0
                        });
                    }
                }
                
                // Set test counts - try usage data first, then fallback to profile data
                if (usageData?.statusCode === 200) {
                    setTests(usageData);
                } else if (profile?.statusCode === 200 && profile.tests) {
                    // Fallback to old structure
                    setTests(profile.tests);
                } else {
                    // Default test counts if all fails
                    setTests({
                        jam_test: 0,
                        pronu_test: 0,
                        listen_test: 0,
                        situation_test: 0,
                        image_speak: 0
                    });
                }
                
                // Set dashboard data
                if (dashboard?.statusCode === 200) {
                    setApiData(dashboard.dashboard || {});
                }
                
            } catch (error) {
                console.error('Error loading test data:', error);
                // Set default values on error
                setTests({
                    jam_test: 0,
                    pronu_test: 0,
                    listen_test: 0,
                    situation_test: 0,
                    image_speak: 0
                });
                setUserType('free');
            } finally {
                setLoading(false);
            }
        };

        loadTestData();
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

    const handleStartChallenge = (id) => {
        const activity = activities.find(a => a.id === id);
        
        // If no tests remaining, show premium lock modal
        if (activity?.count === 0) {
            setShowPremiumLockModal(true);
            return;
        }
        
        // If user has tests remaining (count > 0), proceed to level selection
        // regardless of user type (free users can use their remaining tests)
        setActiveChallenge(id);
        setShowLevelModal(true);
    };

    const handleLevelChoice = (level) => {
        setSelectedLevel(level);
        setShowLevelModal(false);
        setInstructionIndex(0);
        setShowInstructionModal(true);
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
        if (showPremiumLockModal || showInstructionModal) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [showPremiumLockModal, showInstructionModal]);

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
                                      <p style={{ paddingBottom: '10px' }} className="test-activity-stats-title">Your {activity.title} Progress</p>
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



{showInstructionModal && activeChallenge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'hsl(var(--foreground)/0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-lg" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                        <button
                            onClick={() => {
                                setShowInstructionModal(false);
                                setActiveChallenge(null);
                            }}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8">
                            <div className="flex gap-1.5 mb-6">
                                {testInstructions[activeChallenge]?.map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-1 rounded-full transition-all"
                                        style={{
                                            flex: i === instructionIndex ? '2' : '1',
                                            background: i === instructionIndex 
                                                ? 'hsl(var(--accent))' 
                                                : i < instructionIndex 
                                                ? 'hsl(var(--accent) / 0.3)' 
                                                : 'hsl(var(--muted))'
                                        }}
                                    />
                                ))}
                            </div>

                            <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
                                {testInstructions[activeChallenge]?.[instructionIndex]?.title}
                            </h2>

                            <div className="text-sm leading-relaxed mb-8 min-h-[120px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                {testInstructions[activeChallenge]?.[instructionIndex]?.content}
                            </div>

                            <div className="flex items-center gap-3">
                                {instructionIndex > 0 && (
                                    <button
                                        onClick={() => setInstructionIndex(instructionIndex - 1)}
                                        className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                        style={{
                                            color: 'hsl(var(--muted-foreground))',
                                            background: 'hsl(var(--muted))'
                                        }}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                )}

                                <div className="flex-1" />

                                {instructionIndex < testInstructions[activeChallenge]?.length - 1 ? (
                                    <>
                                        <button
                                            onClick={() => setInstructionIndex(testInstructions[activeChallenge]?.length - 1)}
                                            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                            style={{ color: 'hsl(var(--muted-foreground))' }}
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={() => setInstructionIndex(instructionIndex + 1)}
                                            className="flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
                                            style={{
                                                background: 'hsl(var(--accent))',
                                                color: 'hsl(var(--accent-foreground))'
                                            }}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleLaunchChallenge}
                                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                                        style={{
                                            background: 'hsl(var(--accent))',
                                            color: 'hsl(var(--accent-foreground))'
                                        }}
                                    >
                                        <Play className="w-4 h-4" />
                                        START TEST
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Test;
