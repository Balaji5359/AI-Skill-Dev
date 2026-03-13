import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Menu, X } from "lucide-react";
import { profileAPI } from "../services/api";
import InterviewCard from "./InterviewCard";
import InstructionModal from "./InstructionModal";
import "./interview-clone-theme.css";
import useInterviewUserInfo from "./useInterviewUserInfo";

const buildInstructions = () => ([
    {
        title: "Interview Practice Guidelines",
        content: (
            <div className="space-y-3">
                <p>You will practice <strong>professional interview questions</strong> with <strong>Tara AI</strong>.</p>
                <p>Focus on <strong>clarity, confidence, and relevance</strong>.</p>
                <p>Use the <strong>STAR method</strong> for behavioral questions.</p>
            </div>
        ),
    },
    {
        title: "Supportive Learning Environment",
        content: (
            <div className="space-y-3">
                <p>Practice in a <strong>friendly, supportive environment</strong>.</p>
                <p>Take your time to <strong>think and respond</strong>.</p>
                <p>Get <strong>helpful feedback</strong> for improvement.</p>
            </div>
        ),
    },
    {
        title: "Practice Benefits",
        content: (
            <div className="space-y-3">
                <p><strong>No time pressure</strong> - learn at your pace.</p>
                <p><strong>Multiple attempts</strong> allowed for improvement.</p>
                <p><strong>Tara AI</strong> provides constructive feedback after each session.</p>
            </div>
        ),
    },
]);

function InterviewPractice() {
    const [interviews, setInterviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState("");
    const [instructionIndex, setInstructionIndex] = useState(0);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showPremiumLockModal, setShowPremiumLockModal] = useState(false);
    const [premiumModalMessage, setPremiumModalMessage] = useState("");
    const [showLevelModal, setShowLevelModal] = useState(false);
    const navigate = useNavigate();
    const { isPremium, userType, streakData, email } = useInterviewUserInfo();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (!storedEmail) {
            setLoading(false);
            return;
        }

        profileAPI.get(storedEmail)
            .then((profile) => {
                if (profile?.statusCode === 200) {
                    setInterviews(profile.basic_interviews_practices || {});
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const basicInterviews = [
        { id: 1, title: "Self Introduction", count: interviews.self_introduction_practice || 0 },
        { id: 2, title: "Programming Knowledge", count: interviews.programming_knowledge_practice || 0 },
        { id: 3, title: "Worked Domain", count: interviews.worked_domain_practice || 0 },
        { id: 4, title: "Project Discussion", count: interviews.project_discussion_practice || 0 },
        { id: 5, title: "Future Career Planning", count: interviews.future_career_planning_practice || 0 },
        { id: 6, title: "Hobbies & Interests", count: interviews.hobbies_interests_practice || 0 },
        { id: 7, title: "Certifications Exploration", count: interviews.certifications_exploration_practice || 0 }
    ];

    const advancedInterviews = [
        { id: 8, title: "Project Reviews", count: interviews.project_reviews_practice || 0 },
        { id: 9, title: "Role-Based Interview", count: interviews.role_based_practice || 0 },
        { id: 10, title: "Resume-Based Interview", count: interviews.resume_based_practice || 0 },
        { id: 11, title: "Technical Interview", count: interviews.technical_practice || 0 },
        { id: 12, title: "Follow-Up Questioning", count: interviews.followup_practice || 0 },
        { id: 13, title: "Stress/Pressure Questions", count: interviews.stress_practice || 0 },
        { id: 14, title: "Logical Puzzles", count: interviews.logical_practice || 0 },
    ];

    const instructions = buildInstructions();

    const handleLevelSelect = (interviewId, title) => {
        const remainingCount = interviews[getInterviewKey(interviewId)] || 0;

        // If no remaining practice sessions, show modal and do not set activeChallenge
        if (remainingCount === 0) {
            if (userType === 'premium') {
                setShowPremiumLockModal(true);
            } else {
                setPremiumModalMessage("You've used all your free practice attempts for today. Upgrade to Premium to unlock unlimited practice!");
                setShowPremiumModal(true);
            }
            return;
        }

        // There are remaining sessions — set active challenge and show level modal.
        setSelectedTitle(title);
        setActiveChallenge(interviewId);

        if (userType !== 'premium' && remainingCount < 5) {
            setPremiumModalMessage("You're on the Free plan with limited daily attempts. Upgrade to Premium for unlimited sessions!");
            setShowPremiumModal(true);
            setShowLevelModal(true);
        } else {
            setShowLevelModal(true);
        }
    };

    const handleLevelChoice = (level) => {
        setSelectedLevel(level);
        setShowLevelModal(false);
        setInstructionIndex(0);
    };

    const getInterviewKey = (id) => {
        const keyMap = {
            1: "self_introduction_practice",
            2: "programming_knowledge_practice",
            3: "worked_domain_practice",
            4: "project_discussion_practice",
            5: "future_career_planning_practice",
            6: "hobbies_interests_practice",
            7: "certifications_exploration_practice",
            8: "project_reviews_practice"
        };
        return keyMap[id];
    };

    const handleLaunch = () => {
        const interviewKey = getInterviewKey(activeChallenge);
        navigate("/interview/session", {
            state: {
                interviewId: activeChallenge,
                interviewKey,
                interviewTitle: selectedTitle,
                interviewLevel: selectedLevel,
                remainingTests: interviews[interviewKey] || 0,
                mode: "practice",
                interviewType: "basic-interview",
            },
        });
    };

    if (loading) {
        return (
            <div className="app-loading-container app-bg-free">
                <div className="app-loading-spinner"></div>
                <p>Loading interview practice...</p>
            </div>
        );
    }

    return (
        <div className="interview-theme min-h-screen bg-background">
            <div className="sticky top-0 z-40 glass border-b border-border">
                <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => navigate("/interview")}
                        className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <h1 className="font-heading text-lg font-bold text-foreground">Interview Practice</h1>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="interview-badge primary hidden md:inline">Practice</span>
                        <div className="relative group hidden sm:block">
                            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                <Menu className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3 space-y-2 z-50">
                                <div className="text-xs text-muted-foreground">Streak: {streakData.current_streak || 0}</div>
                                <div className="text-xs text-muted-foreground">{userType === "premium" ? "Premium" : "Free"}</div>
                                {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="sm:hidden ml-2 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {showMobileMenu && (
                    <div className="sm:hidden border-t border-border bg-card">
                        <div className="px-4 py-3 flex flex-col gap-2">
                            <div className="border-t border-border pt-2 mt-2 space-y-1">
                                <div className="text-xs text-muted-foreground">Streak: {streakData.current_streak || 0}</div>
                                <div className="text-xs text-muted-foreground">{userType === "premium" ? "Premium" : "Free"}</div>
                                {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Practice with TaraAI
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Build confidence through step-by-step practice sessions with supportive <b>TaraAI</b> feedback.
                    </p>
                </div>

                <div className="mb-12">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Basic Interview Practice
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {basicInterviews.map((item, i) => (
                            <InterviewCard
                                key={item.id}
                                {...item}
                                index={i}
                                variant="practice"
                                comingSoon={false}
                                locked={false}
                                lockedLabel="BUY PREMIUM"
                                onLevelSelect={handleLevelSelect}
                                isPremium={userType === 'premium'}
                            />
                        ))}
                    </div>
                </div>


                <div className="mb-12">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Advanced Interview Practice
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {advancedInterviews.map((item, i) => (
                            <InterviewCard
                                key={item.id}
                                {...item}
                                index={i}
                                variant="practice"
                                comingSoon={true}
                                onStart={() => {}}
                                isPremium={userType === 'premium'}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <InstructionModal
                isOpen={activeChallenge !== null && !showLevelModal}
                instructions={instructions}
                currentIndex={instructionIndex}
                onNext={() => setInstructionIndex((i) => Math.min(i + 1, instructions.length - 1))}
                onPrev={() => setInstructionIndex((i) => Math.max(i - 1, 0))}
                onSkip={() => setInstructionIndex(instructions.length - 1)}
                onLaunch={handleLaunch}
                onClose={() => {
                    setActiveChallenge(null);
                    setSelectedLevel(null);
                }}
                variant="practice"
            />

            {showLevelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-lg p-6">
                        <h3 className="font-heading text-xl font-bold text-foreground mb-2">Select Level</h3>
                        <p className="text-sm text-muted-foreground mb-1">{selectedTitle}</p>
                        <p className="text-xs text-muted-foreground mb-6">Remaining: {interviews[getInterviewKey(activeChallenge)] || 0} {isPremium ? "(Premium - Resets daily)" : "(Free - Upgrade for more)"}</p>
                        <div className="space-y-3">
                            {["Basic", "Intermediate", "Advanced"].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => handleLevelChoice(level)}
                                    disabled={interviews[getInterviewKey(activeChallenge)] === 0 && isPremium}
                                    className="w-full py-3 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-foreground font-medium transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setShowLevelModal(false);
                                setActiveChallenge(null);
                            }}
                            className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showPremiumModal && (
                <div className="interview-modal-overlay" onClick={() => setShowPremiumModal(false)}>
                    <div className="interview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="interview-modal-header">
                            <span>Premium Access</span>
                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                                X
                            </button>
                        </div>
                        <div className="interview-modal-body">
                            <p className="text-sm text-muted-foreground">{premiumModalMessage}</p>
                        </div>
                        <div className="interview-modal-actions">
                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => navigate("/profiledata")}
                                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Buy Premium
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPremiumLockModal && (
                <div className="interview-modal-overlay" onClick={() => setShowPremiumLockModal(false)}>
                    <div className="interview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="interview-modal-header">
                            <span>Practice Unavailable</span>
                            <button
                                onClick={() => setShowPremiumLockModal(false)}
                                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                                X
                            </button>
                        </div>
                        <div className="interview-modal-body">
                            <p className="text-sm text-muted-foreground">You've used all your practice sessions for today. Come back tomorrow to continue practicing! ☀️</p>
                        </div>
                        <div className="interview-modal-actions">
                            <button
                                onClick={() => setShowPremiumLockModal(false)}
                                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default InterviewPractice;
