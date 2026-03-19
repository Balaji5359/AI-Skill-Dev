import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Square, Clock, MessageSquare, Bot, User, Loader2 } from "lucide-react";
import { interviewAPI, interviewResultsAPI, platformAPI, profileAPI, speechToTextAPI, testAPI, activityUsageAPI } from "../services/api";
import "./interview-clone-theme.css";
import useInterviewUserInfo from "./useInterviewUserInfo";
import { createWavRecorder } from "../CommunicationTestsFiles/wavRecorder";
import { getInterviewModuleByKey } from "./interviewConfig";
import { extractInterviewScore, isInterviewCompletionResponse } from "./interviewUtils";
import FormattedInterviewMessage from "./FormattedInterviewMessage";

const SHORT_TRANSCRIPT_MAX_ATTEMPTS = 45;
const TRANSCRIPT_POLL_INTERVAL_MS = 2000;

const logInterviewFlow = (stage, details) => {
    console.log(`[interview:${stage}]`, details);
};

const InterviewSession = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        interviewTitle,
        interviewLevel = "Basic",
        mode = "practice",
        remainingTests = 0,
        interviewType = "basic-interview",
        interviewKey,
    } = location.state || {};

    const isTestMode = mode === "test";
    const interviewModule = useMemo(() => getInterviewModuleByKey(interviewKey), [interviewKey]);
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
    const [clickedButtons, setClickedButtons] = useState([]);
    const { userType, streakData, email, isPremium } = useInterviewUserInfo();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
    const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
    const [answerHistory, setAnswerHistory] = useState([]);

    const interviewTypeKey = interviewKey
        ? interviewKey.replace(/_(practice|test)$/i, "")
        : "self_introduction";

    const chatRef = useRef(null);
    const timerRef = useRef(null);
    const sessionTimerRef = useRef(null);
    const wavRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const fullscreenTimeoutRef = useRef(null);
    const visibilityTimeoutRef = useRef(null);
    const interviewSessionIdRef = useRef(
        `basicinterview-${(interviewTypeKey || "self_introduction").toLowerCase()}-${String(interviewLevel || "basic").toLowerCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            wavRecorderRef.current = null;
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
            if (!interviewKey) {
                console.warn("[interview:decrement:missing-key]", { interviewType, interviewTitle });
                return;
            }
            
            // Determine the level based on interview key
            const level = interviewKey.includes('advanced') ? 'advanced_interview' : 'basic_interview';
            
            const response = await activityUsageAPI.decrement(email, mode, level, interviewKey);
            if (response.statusCode !== 200) {
                console.warn("[interview:decrement-count:warning]", { status: response.statusCode, error: response.error || response.message });
            }
            logInterviewFlow("decrement-count:success", response);
        } catch (error) {
            console.error("[interview:decrement-count:error]", error.message);
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

    const handleMessageButtonClick = async (buttonValue) => {
        // Mark button as clicked
        setClickedButtons(prev => [...prev, buttonValue]);

        // Add user response to chat
        setChatMessages(prev => [...prev, {
            type: "user",
            content: buttonValue,
            timestamp: Date.now()
        }]);

        setIsLoading(true);

        try {
            // Send user response to AI
            const response = await interviewAPI.sendMessage({
                interviewType: interviewTypeKey,
                level: interviewLevel.toLowerCase(),
                mode,
                sessionId: interviewSessionIdRef.current,
                email: localStorage.getItem("email") || "",
                message: buttonValue,
            });

            const aiResponse = response.aiResponse || response?.result?.aiResponse || response?.body?.aiResponse;
            
            if (response.statusCode === 200 && aiResponse) {
                // Add AI response to chat
                setChatMessages(prev => [...prev, {
                    type: "ai",
                    content: aiResponse,
                    timestamp: Date.now(),
                }]);

                // Check if interview completed
                if (isInterviewCompletionResponse(aiResponse)) {
                    await completeInterview();
                } else {
                    // Move to next question if applicable
                    if (buttonValue === 'next' && currentQuestion < totalQuestions) {
                        setCurrentQuestion(prev => prev + 1);
                    }
                }
            } else {
                const errorMsg = response.message || response.error || "Failed to get response";
                setChatMessages(prev => [...prev, {
                    type: "ai",
                    content: `Error: ${errorMsg}. Please try again.`,
                    timestamp: Date.now(),
                }]);
            }
        } catch (error) {
            console.error("Error handling button click:", error);
            setChatMessages(prev => [...prev, {
                type: "ai",
                content: "An error occurred. Please try again.",
                timestamp: Date.now(),
            }]);
        } finally {
            setIsLoading(false);
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
            const response = await interviewAPI.sendMessage({
                interviewType: interviewTypeKey,
                level: interviewLevel.toLowerCase(),
                mode,
                sessionId: interviewSessionIdRef.current,
                email: localStorage.getItem("email") || "",
                message: "hi",
            });

            // Handle successful response
            const aiResponse = response.aiResponse || response?.result?.aiResponse || response?.body?.aiResponse;
            
            if (response.statusCode !== 200 || !aiResponse) {
                const errorMsg = response.message || response.error || response?.result?.error || "Failed to initialize interview";
                console.error("Interview API Error:", { statusCode: response.statusCode, response });
                throw new Error(errorMsg);
            }

            logInterviewFlow("question:initial", { interviewTitle, interviewLevel, response });
            setChatMessages([
                {
                    type: "ai",
                    content: aiResponse,
                    timestamp: Date.now(),
                },
            ]);
        } catch (error) {
            console.error("Error initializing interview:", error.message);
            setChatMessages([
                {
                    type: "ai",
                    content: "Unable to start the interview right now. Please try again.",
                    timestamp: Date.now(),
                },
            ]);
        } finally {
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

    const buildQuestionSessionId = () =>
        `${interviewSessionIdRef.current}-q${currentQuestion}-${Date.now()}`;

    const pollTranscript = async (sessionId, attempts = 0) => {
        try {
            logInterviewFlow("poll-transcript:start", { sessionId, attempts });
            const resp = await testAPI.getTranscript(sessionId);
            logInterviewFlow("poll-transcript:response", { sessionId, attempts, resp });
            if (resp.statusCode === 200 && resp.transcript) {
                return resp.transcript.trim();
            }
            if (attempts >= SHORT_TRANSCRIPT_MAX_ATTEMPTS) {
                return "";
            }
            await new Promise((resolve) => setTimeout(resolve, TRANSCRIPT_POLL_INTERVAL_MS));
            return pollTranscript(sessionId, attempts + 1);
        } catch (error) {
            console.error("[interview:poll-transcript:error]", { sessionId, attempts, error });
            if (attempts >= SHORT_TRANSCRIPT_MAX_ATTEMPTS) {
                return "";
            }
            await new Promise((resolve) => setTimeout(resolve, TRANSCRIPT_POLL_INTERVAL_MS));
            return pollTranscript(sessionId, attempts + 1);
        }
    };

    const startRecording = async () => {
        try {
            setRecordingState("preparing");
            logInterviewFlow("recording:prepare", { currentQuestion, interviewTitle, interviewLevel });

            setTimeout(async () => {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                wavRecorderRef.current = await createWavRecorder(stream);
                setRecordingState("recording");
                
                // Set recording time to 90 seconds for all levels
                setTimeLeft(90);

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
        if (!wavRecorderRef.current) return;
        if (timerRef.current) clearInterval(timerRef.current);
        const recorder = wavRecorderRef.current;
        wavRecorderRef.current = null;
        setRecordingState("processing");

        void recorder.stop().then(async (audioBlob) => {
            logInterviewFlow("recording:stop", { currentQuestion, blobSize: audioBlob.size });
            await processAudioResponse(audioBlob);
            setRecordingState("idle");
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        });
    };

    const processAudioResponse = async (audioBlob) => {
        try {
            const questionSessionId = buildQuestionSessionId();
            const base64Audio = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    try {
                        resolve(reader.result.split(",")[1]);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            logInterviewFlow("audio-upload:start", {
                questionSessionId,
                currentQuestion,
                size: audioBlob.size,
                base64Length: base64Audio.length,
            });

            let transcript = "";
            if (isTestMode) {
                await testAPI.uploadRecording(base64Audio, questionSessionId);
                transcript = await pollTranscript(questionSessionId);
            } else {
                const sttResponse = await speechToTextAPI.transcribeShortAudio(
                    base64Audio,
                    questionSessionId,
                    `basicinterview_${interviewTypeKey}`,
                );
                transcript = sttResponse?.transcript?.trim() || "";
            }

            const userTranscript =
                transcript || "Response captured, but transcript could not be generated clearly.";

            const lastAiMessage = chatMessages.filter((msg) => msg.type === "ai").slice(-1)[0]?.content || "";

            setChatMessages((prev) => [
                ...prev,
                {
                    type: "user",
                    content: userTranscript,
                    timestamp: Date.now(),
                },
            ]);

            setAnswerHistory((prev) => [
                ...prev,
                {
                    questionNumber: currentQuestion,
                    question: lastAiMessage,
                    answer: userTranscript,
                    sessionId: questionSessionId,
                },
            ]);

            setIsLoading(true);
            const aiResponse = await interviewAPI.sendMessage({
                interviewType: interviewTypeKey,
                level: interviewLevel.toLowerCase(),
                mode,
                sessionId: interviewSessionIdRef.current,
                email: localStorage.getItem("email") || "",
                message: userTranscript,
            });

            if (aiResponse.statusCode !== 200 || !aiResponse.aiResponse) {
                throw new Error(aiResponse.message || aiResponse.error || "Interview AI response failed");
            }

            setChatMessages((prev) => [
                ...prev,
                {
                    type: "ai",
                    content: aiResponse.aiResponse,
                    timestamp: Date.now(),
                },
            ]);

            if (isInterviewCompletionResponse(aiResponse.aiResponse) || currentQuestion >= totalQuestions) {
                completeInterview(aiResponse.aiResponse);
                return;
            }

            setCurrentQuestion((prev) => prev + 1);
        } catch (error) {
            console.error("Error processing audio:", error);
            setChatMessages((prev) => [
                ...prev,
                {
                    type: "ai",
                    content: "I could not process that response correctly. Please try again.",
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateScore = () => {
        const answers = answerHistory.length || 1;
        const averageAnswerLength =
            answerHistory.reduce((sum, item) => sum + (item.answer?.split(/\s+/).filter(Boolean).length || 0), 0) / answers;
        const completionRatio = Math.min(1, answers / totalQuestions);
        const depthScore = Math.min(35, averageAnswerLength * 1.4);
        const structureScore = Math.min(25, answerHistory.filter((item) => (item.answer || "").includes("because")).length * 8);
        const consistencyScore = Math.round(20 * completionRatio);
        const baseScore = isTestMode ? 30 : 40;
        return Math.max(0, Math.min(100, Math.round(baseScore + depthScore + structureScore + consistencyScore)));
    };

    const generateFinalReport = (score) => {
        const performance = score >= 80 ? "Excellent" : score >= 70 ? "Good" : score >= 60 ? "Satisfactory" : "Needs Improvement";
        const totalAnswered = answerHistory.length;
        const averageWords = totalAnswered
            ? Math.round(
                answerHistory.reduce((sum, item) => sum + (item.answer?.split(/\s+/).filter(Boolean).length || 0), 0) /
                totalAnswered
            )
            : 0;
        const strengths = [];
        const improvements = [];

        if (averageWords >= 20) strengths.push("You provided reasonably detailed responses.");
        else improvements.push("Expand answers with more specifics and outcomes.");

        if (answerHistory.some((item) => /example|experience|project|because/i.test(item.answer || ""))) {
            strengths.push("You supported answers with examples or reasoning.");
        } else {
            improvements.push("Support your answers with examples, evidence, or projects.");
        }

        if (totalAnswered >= totalQuestions) strengths.push("You completed the full interview flow.");
        else improvements.push("Complete all questions to improve consistency and scoring.");

        const recommendations = [
            "Use the STAR method for behavioral responses.",
            "Keep each answer specific, outcome-focused, and structured.",
            "Practice role-specific vocabulary before the next interview.",
        ];

        return {
            summary: `${performance} performance with ${totalAnswered}/${totalQuestions} questions answered.`,
            report: `INTERVIEW ASSESSMENT REPORT

OVERALL PERFORMANCE: ${performance}
Final Score: ${score}/100

ANSWERED QUESTIONS: ${totalAnswered}/${totalQuestions}
AVERAGE RESPONSE LENGTH: ${averageWords} words

STRENGTHS IDENTIFIED:
${strengths.length ? strengths.map((item) => `- ${item}`).join("\n") : "- Participation completed"}

AREAS FOR IMPROVEMENT:
${improvements.length ? improvements.map((item) => `- ${item}`).join("\n") : "- Keep practicing to maintain consistency"}

RECOMMENDATIONS:
${recommendations.map((item) => `- ${item}`).join("\n")}`,
            strengths,
            improvements,
            recommendations,
            answers: answerHistory,
        };
    };

    const completeInterview = async (overrideReport) => {
        if (interviewCompleted) return;
        setInterviewCompleted(true);
        if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        exitFullscreen();

        const score = typeof overrideReport === "string" && isInterviewCompletionResponse(overrideReport)
            ? Math.round(extractInterviewScore(overrideReport) * 10)
            : calculateScore();
        const reportPayload = typeof overrideReport === "string"
            ? {
                summary: `${interviewTitle} completed.`,
                report: overrideReport,
                strengths: [],
                improvements: [],
                recommendations: [],
                answers: answerHistory,
            }
            : (overrideReport || generateFinalReport(score));

        try {
            const studentEmail = localStorage.getItem("email") || "";
            if (interviewResultsAPI?.submitSession) {
                await interviewResultsAPI.submitSession({
                    college_email: studentEmail,
                    mode,
                    interview_key: interviewKey,
                    interview_title: interviewTitle,
                    interview_level: String(interviewLevel || "basic").toLowerCase(),
                    interview_session_id: interviewSessionIdRef.current,
                    final_score: Number((score / 10).toFixed(1)),
                    ai_feedback: reportPayload.report,
                    answers: answerHistory,
                });
            }
            await platformAPI.updateStreak(studentEmail);
        } catch (error) {
            console.error("Error submitting interview results:", error);
        }

        navigate("/interview/feedback", {
            state: {
                score,
                mode,
                interviewTitle,
                interviewLevel,
                report: reportPayload.report,
                summary: reportPayload.summary,
                strengths: reportPayload.strengths,
                improvements: reportPayload.improvements,
                recommendations: reportPayload.recommendations,
                answers: reportPayload.answers,
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
                        {isTestMode ? "Test" : "Practice"} - {interviewLevel} Level - {(interviewModule?.title || interviewTitle)} - {totalQuestions} questions
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
                                    <li key={i}>{"\u2022"} {tip}</li>
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
                                {msg.type === "ai" ? (
                                    <FormattedInterviewMessage 
                                        message={msg.content}
                                        interviewLevel={interviewLevel}
                                        onButtonClick={handleMessageButtonClick}
                                        isLoading={isLoading}
                                        clickedButtons={clickedButtons}
                                    />
                                ) : (
                                    msg.content
                                )}
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
