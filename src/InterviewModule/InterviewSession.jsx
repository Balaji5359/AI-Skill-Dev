import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Square, Clock, MessageSquare, Bot, User, Loader2 } from "lucide-react";
import { testAPI } from "../services/api";
import "./interview-clone-theme.css";
import useInterviewUserInfo from "./useInterviewUserInfo";

const InterviewSession = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        interviewTitle,
        interviewLevel = "Basic",
        mode = "practice",
        remainingTests = 0,
        interviewType = "basic-interview",
    } = location.state || {};

    const isTestMode = mode === "test";
    const totalQuestions = isTestMode ? 5 : 3;

    const [chatMessages, setChatMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recordingState, setRecordingState] = useState("idle");
    const [timeLeft, setTimeLeft] = useState(30);
    const [sessionTimeLeft, setSessionTimeLeft] = useState(isTestMode ? 1800 : 3600);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [interviewCompleted, setInterviewCompleted] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showFullscreenAlert, setShowFullscreenAlert] = useState(false);
    const { userType, streakData, email, isPremium } = useInterviewUserInfo();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
    const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);

    const chatRef = useRef(null);
    const timerRef = useRef(null);
    const sessionTimerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const fullscreenTimeoutRef = useRef(null);
    const visibilityTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            clearTimeouts();
        };
    }, []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chatMessages]);

    useEffect(() => {
        if (!interviewStarted || !isTestMode) return;

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("keydown", handleEscKey);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [interviewStarted, isTestMode, fullscreenWarnings, tabSwitchWarnings]);

    const clearTimeouts = () => {
        if (fullscreenTimeoutRef.current) clearTimeout(fullscreenTimeoutRef.current);
        if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    };

    const handleEscKey = (e) => {
        if (e.key === "Escape" && isTestMode && !document.fullscreenElement) {
            setShowFullscreenAlert(true);
        }
    };

    const handleFullscreenChange = () => {
        if (!interviewStarted || !isTestMode) return;
        const isCurrentlyFullscreen = document.fullscreenElement !== null;
        setIsFullscreen(isCurrentlyFullscreen);

        if (!isCurrentlyFullscreen) {
            setShowFullscreenAlert(true);
            const nextWarnings = fullscreenWarnings + 1;
            setFullscreenWarnings(nextWarnings);
            if (nextWarnings >= 3) {
                terminateInterview("Multiple fullscreen violations");
            } else {
                showWarning("Fullscreen mode required. Please return to fullscreen.");
                fullscreenTimeoutRef.current = setTimeout(() => {
                    if (!document.fullscreenElement) {
                        enterFullscreen();
                    }
                }, 5000);
            }
        }
    };

    const handleVisibilityChange = () => {
        if (!interviewStarted || !isTestMode || !document.hidden) return;
        const nextWarnings = tabSwitchWarnings + 1;
        setTabSwitchWarnings(nextWarnings);
        if (nextWarnings >= 2) {
            terminateInterview("Tab switching detected");
        } else {
            showWarning("Tab switching detected. Interview will terminate on next violation.");
        }
    };

    const handleWindowBlur = () => {
        if (!interviewStarted || !isTestMode) return;
        const nextWarnings = tabSwitchWarnings + 1;
        setTabSwitchWarnings(nextWarnings);
        if (nextWarnings >= 2) {
            terminateInterview("Window focus lost");
        }
    };

    const handleBeforeUnload = (e) => {
        if (interviewStarted) {
            e.preventDefault();
            e.returnValue = "Interview in progress. Are you sure you want to leave?";
        }
    };

    const showWarning = (message) => {
        const warningDiv = document.createElement("div");
        warningDiv.className = "interview-warning-overlay";
        warningDiv.innerHTML = `
            <div class="interview-warning-content">
                <h3>Warning</h3>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(warningDiv);
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.parentNode.removeChild(warningDiv);
            }
        }, 3000);
    };

    const terminateInterview = (reason) => {
        exitFullscreen();
        navigate("/interview/feedback", {
            state: {
                score: 0,
                mode,
                interviewTitle,
                report: `Interview terminated due to: ${reason}`,
                terminated: true,
            },
        });
    };

    const enterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.error("Error entering fullscreen:", error);
        }
    };

    const exitFullscreen = async () => {
        try {
            if (document.exitFullscreen && document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error("Error exiting fullscreen:", error);
        }
    };

    const decrementInterviewCount = async () => {
        try {
            const email = localStorage.getItem("email");
            await testAPI.decrement(email, "interview", interviewType);
        } catch (error) {
            console.error("Error decrementing interview count:", error);
        }
    };

    const startSessionTimer = () => {
        sessionTimerRef.current = setInterval(() => {
            setSessionTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleTimeUp = () => {
        if (isTestMode) {
            completeInterview("Interview time limit reached. Session auto-submitted.");
        }
    };

    const startInterview = async () => {
        if (interviewStarted) return;
        await decrementInterviewCount();
        if (isTestMode) {
            await enterFullscreen();
        }
        setInterviewStarted(true);
        initializeInterview();
        startSessionTimer();
    };

    const initializeInterview = async () => {
        try {
            setIsLoading(true);
            const welcomeMessage = getWelcomeMessage();
            setChatMessages([
                {
                    type: "ai",
                    content: welcomeMessage,
                    timestamp: Date.now(),
                },
            ]);

            setTimeout(() => {
                const firstQuestion = getFirstQuestion();
                setChatMessages((prev) => [
                    ...prev,
                    {
                        type: "ai",
                        content: firstQuestion,
                        timestamp: Date.now(),
                    },
                ]);
                setIsLoading(false);
            }, 2000);
        } catch (error) {
            console.error("Error initializing interview:", error);
            setIsLoading(false);
        }
    };

    const getLevelTips = () => {
        const tips = {
            Basic: [
                "Keep your answers clear and concise",
                "Focus on basic concepts and fundamentals",
                "Take your time to think before responding",
                "Be honest about your experience level"
            ],
            Intermediate: [
                "Provide specific examples from your experience",
                "Demonstrate problem-solving abilities",
                "Show understanding of industry practices",
                "Connect your skills to real-world applications"
            ],
            Advanced: [
                "Showcase leadership and strategic thinking",
                "Discuss complex technical or domain challenges",
                "Demonstrate thought leadership and innovation",
                "Provide measurable impact and outcomes"
            ]
        };
        return tips[interviewLevel] || tips.Basic;
    };

    const getWelcomeMessage = () => {
        const modeText = isTestMode ? "formal interview test" : "practice interview session";
        return `Welcome to your ${modeText} for ${interviewTitle} at ${interviewLevel} level! I am TaraAI. We will cover ${totalQuestions} questions today. Are you ready to begin?`;
    };

    const getFirstQuestion = () => {
        const questions = {
            "hr-interview": [
                "Tell me about yourself and why you are interested in this role.",
                "Walk me through your background and what brings you here today.",
                "Please introduce yourself professionally.",
            ],
            "technical-interview": [
                "What programming languages are you most comfortable with?",
                "Tell me about a challenging technical project you worked on recently.",
                "How do you approach solving complex technical problems?",
            ],
            "managerial-interview": [
                "Describe your leadership style and how you motivate team members.",
                "Tell me about a time you made a difficult management decision.",
                "How do you handle conflicts within your team?",
            ],
        };

        const typeQuestions = questions[interviewType] || questions["hr-interview"];
        return typeQuestions[Math.floor(Math.random() * typeQuestions.length)];
    };

    const startRecording = async () => {
        try {
            setRecordingState("preparing");

            setTimeout(async () => {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                audioChunksRef.current = [];

                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    setRecordingState("processing");
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

                    setTimeout(async () => {
                        await processAudioResponse(audioBlob);
                        setRecordingState("idle");
                    }, 2000);
                };

                mediaRecorder.start();
                setRecordingState("recording");
                setTimeLeft(isTestMode ? 120 : 180);

                timerRef.current = setInterval(() => {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            stopRecording();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }, 1500);
        } catch (error) {
            console.error("Error starting recording:", error);
            setRecordingState("idle");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
    };

    const processAudioResponse = async () => {
        try {
            const mockTranscript = "Thank you for the question. I believe my experience in this area makes me a strong candidate.";

            setChatMessages((prev) => [
                ...prev,
                {
                    type: "user",
                    content: mockTranscript,
                    timestamp: Date.now(),
                },
            ]);

            setTimeout(() => {
                const followUp = generateFollowUpQuestion();
                setChatMessages((prev) => [
                    ...prev,
                    {
                        type: "ai",
                        content: followUp,
                        timestamp: Date.now(),
                    },
                ]);

                setCurrentQuestion((prev) => {
                    const next = prev + 1;
                    if (next > totalQuestions) {
                        completeInterview();
                    }
                    return next;
                });
            }, 2000);
        } catch (error) {
            console.error("Error processing audio:", error);
        }
    };

    const generateFollowUpQuestion = () => {
        if (currentQuestion >= totalQuestions) {
            return "Thank you for your responses. That concludes our interview.";
        }

        const followUps = [
            "That is interesting. Can you give a specific example?",
            "Good response. What would you say is your greatest strength?",
            "Thank you. Where do you see yourself in 5 years?",
            "Excellent. What questions do you have for me?",
            "Thank you for your responses. That concludes our interview.",
        ];

        return followUps[currentQuestion - 1] || followUps[0];
    };

    const calculateScore = () => {
        const baseScore = isTestMode ? 75 : 85;
        const randomVariation = Math.floor(Math.random() * 20) - 10;
        return Math.max(0, Math.min(100, baseScore + randomVariation));
    };

    const generateFinalReport = (score) => {
        const performance = score >= 80 ? "Excellent" : score >= 70 ? "Good" : score >= 60 ? "Satisfactory" : "Needs Improvement";
        return `
INTERVIEW ASSESSMENT REPORT

OVERALL PERFORMANCE: ${performance}
Final Score: ${score}/100

STRENGTHS IDENTIFIED:
- Clear communication and articulation
- Professional demeanor throughout
- Relevant experience and examples

AREAS FOR IMPROVEMENT:
- Could provide more specific examples
- Consider expanding on technical details
- Practice concise yet comprehensive answers

RECOMMENDATIONS:
- Continue practicing with similar questions
- Focus on STAR method for behavioral questions
- Research company-specific information
        `;
    };

    const completeInterview = (overrideReport) => {
        if (interviewCompleted) return;
        setInterviewCompleted(true);
        if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        exitFullscreen();

        const score = calculateScore();
        const report = overrideReport || generateFinalReport(score);

        navigate("/interview/feedback", {
            state: {
                score,
                mode,
                interviewTitle,
                report,
                terminated: false,
            },
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progressPercent = Math.min(100, (currentQuestion / totalQuestions) * 100);

    if (!interviewStarted) {
        return (
            <div className="interview-theme min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                        isTestMode ? "bg-accent/10" : "bg-primary/10"
                    }`}>
                        <MessageSquare className={`w-10 h-10 ${isTestMode ? "text-accent" : "text-primary"}`} />
                    </div>
                    <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                        {interviewTitle || "Interview Session"}
                    </h1>
                    <p className="text-muted-foreground mb-1 text-sm">
                        {isTestMode ? "Test" : "Practice"} - {interviewLevel} Level - {totalQuestions} questions
                    </p>
                    <p className="text-muted-foreground mb-8 text-sm">
                        Remaining sessions: {remainingTests || 0}
                    </p>

                    {!isTestMode && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-left">
                            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                {interviewLevel} Level Tips
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                {getLevelTips().map((tip, i) => (
                                    <li key={i}>• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {isTestMode && (
                        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6 text-left">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Test Mode Rules</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>Fullscreen mode required</li>
                                <li>No tab switching allowed</li>
                                <li>Strict time limits</li>
                                <li>Auto-termination on violations</li>
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={startInterview}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                                isTestMode
                                    ? "bg-accent text-accent-foreground hover:opacity-90"
                                    : "bg-primary text-primary-foreground hover:opacity-90"
                            }`}
                        >
                            Start {isTestMode ? "Test" : "Practice"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="interview-theme h-screen flex flex-col bg-background">
            <div className="flex-shrink-0 glass border-b border-border px-4 py-3">
                <div className="flex items-center gap-4 max-w-4xl mx-auto flex-wrap">
                    <button
                        onClick={() => navigate(-1)}
                        disabled={isTestMode}
                        className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isTestMode ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                            }`}>
                                {mode.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-foreground">
                                {interviewTitle}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {interviewLevel}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                                Q{currentQuestion}/{totalQuestions}
                            </span>
                            {isTestMode && (
                                <span className="text-xs text-muted-foreground">
                                    {isFullscreen ? "Secured" : "Not Secured"}
                                </span>
                            )}
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${isTestMode ? "bg-accent" : "bg-primary"}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="interview-badge">Streak: {streakData.current_streak || 0}</span>
                        <span className={`interview-badge ${isPremium ? "accent" : ""}`}>
                            {userType === "premium" ? "Premium" : "Free"}
                        </span>
                        {email && <span className="interview-badge">{email}</span>}
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold ${
                        sessionTimeLeft < 300 ? "text-destructive" : "text-muted-foreground"
                    }`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(sessionTimeLeft)}
                    </div>
                </div>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-4">
                    {chatMessages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                                msg.type === "ai" ? "bg-primary/10" : "bg-muted"
                            }`}>
                                {msg.type === "ai" ? (
                                    <Bot className="w-4 h-4 text-primary" />
                                ) : (
                                    <User className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.type === "ai"
                                    ? "bg-card border border-border text-foreground"
                                    : "bg-primary text-primary-foreground"
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="bg-card border border-border rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                TaraAI is thinking...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 border-t border-border bg-card px-4 py-4">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
                    {recordingState !== "idle" && (
                        <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                            recordingState === "recording"
                                ? "bg-destructive/10 text-destructive"
                                : recordingState === "preparing"
                                ? "bg-accent/10 text-accent"
                                : "bg-primary/10 text-primary"
                        }`}>
                            {recordingState === "preparing" && "Preparing..."}
                            {recordingState === "recording" && `Recording - ${formatTime(timeLeft)}`}
                            {recordingState === "processing" && "Processing..."}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={recordingState === "recording" ? stopRecording : startRecording}
                            disabled={isLoading || recordingState === "preparing" || recordingState === "processing"}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                                recordingState === "recording"
                                    ? "bg-destructive text-destructive-foreground shadow-lg"
                                    : "bg-primary text-primary-foreground shadow-glow hover:scale-105"
                            }`}
                        >
                            {recordingState === "recording" ? (
                                <Square className="w-5 h-5" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                        </button>

                        {!isTestMode && (
                            <button
                                onClick={() => setShowEndConfirm(true)}
                                disabled={recordingState === "recording"}
                                className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:text-foreground transition-colors disabled:opacity-40"
                            >
                                End Interview
                            </button>
                        )}
                        {isTestMode && (
                            <button
                                onClick={() => setShowEndConfirm(true)}
                                disabled={recordingState === "recording"}
                                className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-40"
                            >
                                End Test
                            </button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {recordingState === "idle" ? "Tap the mic to record your response" : ""}
                    </p>
                </div>
            </div>

            {showEndConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-lg p-6">
                        <h3 className="font-heading text-lg font-bold text-foreground mb-2">End Interview?</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to end this {isTestMode ? "test" : "practice session"}? Your progress will be evaluated.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowEndConfirm(false);
                                    completeInterview();
                                }}
                                className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                End Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFullscreenAlert && isTestMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-lg p-6 text-center">
                        <h3 className="font-heading text-lg font-bold text-foreground mb-2">Fullscreen Required</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Please return to fullscreen mode to continue the test.
                        </p>
                        <button
                            onClick={() => {
                                setShowFullscreenAlert(false);
                                enterFullscreen();
                            }}
                            className="w-full py-3 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            Enter Fullscreen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewSession;
