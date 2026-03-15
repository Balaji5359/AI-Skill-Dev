import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { profileAPI } from "../services/api";
import "./practice-custom.css";

const buildPracticeInstructions = () => ({
  jam_practice: [
    {
      title: "JAM Practice Overview",
      content: (
        <div className="space-y-3">
          <p>You will be given a <strong>random topic</strong> by <strong>Tara AI</strong>.</p>
          <p>This is a practice session to help you improve your spontaneous speaking abilities.</p>
        </div>
      )
    },
    {
      title: "Timeline",
      content: (
        <div className="space-y-3">
          <p>You have <strong>1 minute</strong> to speak continuously.</p>
          <p>Make the most of this time to develop your fluency and confidence.</p>
        </div>
      )
    },
    {
      title: "Practice Focus",
      content: (
        <div className="space-y-3">
          <p><strong>Content Relevance:</strong> Stay focused on the topic given.</p>
          <p><strong>Clarity:</strong> Speak clearly and enunciate your words.</p>
          <p><strong>Fluency:</strong> Maintain smooth, continuous speech without long pauses.</p>
          <p><strong>Confidence:</strong> Project confidence in your delivery.</p>
        </div>
      )
    },
    {
      title: "Feedback & Learning",
      content: (
        <div className="space-y-3">
          <p>After each practice session, you'll receive <strong>instant feedback</strong> from Tara AI.</p>
          <p>Use this feedback to improve your communication skills progressively.</p>
          <p>Review the evaluation to identify areas for improvement.</p>
        </div>
      )
    }
  ],
  pronu_practice: [
    {
      title: "Pronunciation Practice Overview",
      content: (
        <div className="space-y-3">
          <p>You will be given <strong>words or sentences</strong> to pronounce.</p>
          <p>This is an excellent way to refine your pronunciation and phonetic accuracy.</p>
        </div>
      )
    },
    {
      title: "Mic Setup",
      content: (
        <div className="space-y-3">
          <p>Grant <strong>microphone permissions</strong> when prompted.</p>
          <p>Speak <strong>clearly</strong> into the receiver.</p>
          <p>Ensure you're in a quiet environment for accurate audio capture.</p>
        </div>
      )
    },
    {
      title: "Practice Attempts",
      content: (
        <div className="space-y-3">
          <p>You can practice each word <strong>multiple times</strong> to perfect your pronunciation.</p>
          <p>Unlimited attempts during practice sessions.</p>
          <p>No credit is deducted - this is for learning and improvement only.</p>
        </div>
      )
    },
    {
      title: "Focus Areas",
      content: (
        <div className="space-y-3">
          <p><strong>Clarity:</strong> Pronounce each word clearly and distinctly.</p>
          <p><strong>Accuracy:</strong> Match the correct pronunciation patterns.</p>
          <p><strong>Phonemic Sounds:</strong> Pay attention to individual phonetic elements.</p>
        </div>
      )
    }
  ],
  listen_practice: [
    {
      title: "Listening Practice Overview",
      content: (
        <div className="space-y-3">
          <p>You will hear <strong>audio clips</strong> carefully curated by <strong>Tara AI</strong>.</p>
          <p>Practice understanding different accents, speech patterns, and contexts.</p>
        </div>
      )
    },
    {
      title: "Audio Playback",
      content: (
        <div className="space-y-3">
          <p>Audio clips can be <strong>replayed as many times</strong> as you need.</p>
          <p>Take your time to understand the content before answering.</p>
          <p>Use this flexibility to develop your listening comprehension.</p>
        </div>
      )
    },
    {
      title: "Practice Approach",
      content: (
        <div className="space-y-3">
          <p>Answer questions about the audio content.</p>
          <p>No time pressure during practice sessions.</p>
          <p>Review correct answers and learn from explanations provided.</p>
        </div>
      )
    },
    {
      title: "Focus Areas",
      content: (
        <div className="space-y-3">
          <p><strong>Context:</strong> Listen for the overall context and meaning.</p>
          <p><strong>Specific Details:</strong> Pay attention to numbers, names, and key information.</p>
          <p><strong>Tone & Intent:</strong> Understand the speaker's tone and purpose.</p>
        </div>
      )
    }
  ],
  situation_practice: [
    {
      title: "Situational Speaking Overview",
      content: (
        <div className="space-y-3">
          <p>You will be given a <strong>real-life workplace scenario</strong>.</p>
          <p>Practice responding professionally in common workplace situations.</p>
        </div>
      )
    },
    {
      title: "Preparation & Response",
      content: (
        <div className="space-y-3">
          <p>You'll have time to <strong>prepare and plan</strong> your response.</p>
          <p>Then deliver your response speaking naturally and professionally.</p>
          <p>Practice helping you develop confidence in real-world scenarios.</p>
        </div>
      )
    },
    {
      title: "No Time Pressure",
      content: (
        <div className="space-y-3">
          <p>During practice, <strong>time limits are relaxed</strong> or extended.</p>
          <p>Focus on developing your response quality rather than speed.</p>
          <p>Learn proper ways to handle workplace communication challenges.</p>
        </div>
      )
    },
    {
      title: "Response Guidelines",
      content: (
        <div className="space-y-3">
          <p>Respond as you would in a <strong>professional setting</strong>.</p>
          <p><strong>Be professional:</strong> Use formal language and courteous tone.</p>
          <p><strong>Be relevant:</strong> Address the scenario directly.</p>
          <p><strong>Be confident:</strong> Practice speaking with clarity and assurance.</p>
        </div>
      )
    }
  ],
  image_speak_practice: [
    {
      title: "Image Speaking Overview",
      content: (
        <div className="space-y-3">
          <p>You will be shown a <strong>visual or chart</strong>.</p>
          <p>Practice describing and analyzing images in detail.</p>
        </div>
      )
    },
    {
      title: "Flexible Timing",
      content: (
        <div className="space-y-3">
          <p>During practice, you have <strong>more time</strong> than in actual tests.</p>
          <p>Take your time to provide thorough descriptions and analysis.</p>
          <p>Learn to structure your response effectively.</p>
        </div>
      )
    },
    {
      title: "No Minimum Requirements",
      content: (
        <div className="space-y-3">
          <p>In practice mode, there are <strong>no minimum speaking time</strong> requirements.</p>
          <p>Focus on quality of description rather than duration.</p>
          <p>Gradually build your speaking stamina and confidence.</p>
        </div>
      )
    },
    {
      title: "Response Guidelines",
      content: (
        <div className="space-y-3">
          <p><strong>Observe:</strong> Describe what you see in the image clearly.</p>
          <p><strong>Analyze:</strong> Explain patterns, relationships, and significance.</p>
          <p><strong>Conclude:</strong> Provide your overall interpretation and conclusions.</p>
          <p>Practice covering all aspects systematically.</p>
        </div>
      )
    }
  ]
});

function Practice() {
    const [practices, setPractices] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('basic');
    const [instructionIndex, setInstructionIndex] = useState(0);
    const [userType, setUserType] = useState('free');
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showPremiumLockModal, setShowPremiumLockModal] = useState(false);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const navigate = useNavigate();
    const practiceInstructions = buildPracticeInstructions();

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (!storedEmail) {
            setLoading(false);
            return;
        }  
        
        profileAPI.get(storedEmail)
        .then(async (profile) => {
            if (profile?.statusCode === 200) {
                setPractices(profile.practices || {});
                setUserType(profile.user_type === 'premium' && profile.premium_status === 'active' ? 'premium' : 'free');
            }
            
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);


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
        setShowInstructionModal(true);
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
        if (showPremiumModal || showPremiumLockModal || showInstructionModal) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [showPremiumModal, showPremiumLockModal, showInstructionModal]);

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
            <div className="sticky top-0 z-40 glass border-b border-border" />

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
                                {practiceInstructions[activeChallenge]?.map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-1 rounded-full transition-all"
                                        style={{
                                            flex: i === instructionIndex ? '2' : '1',
                                            background: i === instructionIndex 
                                                ? 'hsl(var(--primary))' 
                                                : i < instructionIndex 
                                                ? 'hsl(var(--primary) / 0.3)' 
                                                : 'hsl(var(--muted))'
                                        }}
                                    />
                                ))}
                            </div>

                            <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
                                {practiceInstructions[activeChallenge]?.[instructionIndex]?.title}
                            </h2>

                            <div className="text-sm leading-relaxed mb-8 min-h-[120px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                {practiceInstructions[activeChallenge]?.[instructionIndex]?.content}
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

                                {instructionIndex < practiceInstructions[activeChallenge]?.length - 1 ? (
                                    <>
                                        <button
                                            onClick={() => setInstructionIndex(practiceInstructions[activeChallenge]?.length - 1)}
                                            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                            style={{ color: 'hsl(var(--muted-foreground))' }}
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={() => setInstructionIndex(instructionIndex + 1)}
                                            className="flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
                                            style={{
                                                background: 'hsl(var(--primary))',
                                                color: 'hsl(var(--primary-foreground))'
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
                                            background: 'hsl(var(--primary))',
                                            color: 'hsl(var(--primary-foreground))'
                                        }}
                                    >
                                        <Play className="w-4 h-4" />
                                        START PRACTICE
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

export default Practice;
