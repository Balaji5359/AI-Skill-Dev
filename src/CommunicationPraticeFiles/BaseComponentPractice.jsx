import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TestResultModal from "../CommunicationTestsFiles/components/TestResultModal";
import { practiceVoiceAPI, profileAPI, platformAPI, speechToTextAPI, testAPI, activityUsageAPI } from "../services/api";
import PracticeDashboard from "./PracticeDashboard";
import PracticeModal from "./components/PracticeModal";
import PracticeNavBar from "./components/PracticeNavBar";
import PracticeSessionPopup from "./components/PracticeSessionPopup";
import PracticeStartCard from "./components/PracticeStartCard";
import { createWavRecorder } from "../CommunicationTestsFiles/wavRecorder";
import "../InterviewModule/interview-clone-theme.css";
import "../CommunicationTestsFiles/test-custom.css";

const getThemeVars = (theme) => {
  if (theme === "dark") {
    return {
      "--background": "222 47% 11%",
      "--foreground": "210 40% 96%",
      "--card": "222 47% 14%",
      "--card-foreground": "210 40% 96%",
      "--popover": "222 47% 14%",
      "--popover-foreground": "210 40% 96%",
      "--secondary": "217 33% 20%",
      "--secondary-foreground": "210 40% 96%",
      "--muted": "217 33% 20%",
      "--muted-foreground": "215 20% 72%",
      "--border": "217 33% 24%",
      "--input": "217 33% 24%",
      "--ring": "172 66% 42%",
      "--primary": "172 66% 42%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "37 92% 58%",
      "--accent-foreground": "0 0% 100%",
    };
  }

  if (theme === "custom") {
    return {
      "--background": "40 40% 97%",
      "--foreground": "30 20% 15%",
      "--card": "0 0% 100%",
      "--card-foreground": "30 20% 15%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "30 20% 15%",
      "--primary": "20 75% 48%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "38 45% 92%",
      "--secondary-foreground": "30 20% 20%",
      "--muted": "38 45% 92%",
      "--muted-foreground": "30 12% 40%",
      "--accent": "172 66% 32%",
      "--accent-foreground": "0 0% 100%",
      "--border": "35 24% 86%",
      "--input": "35 24% 86%",
      "--ring": "20 75% 48%",
    };
  }

  return {
    "--background": "210 20% 98%",
    "--foreground": "215 28% 17%",
    "--card": "0 0% 100%",
    "--card-foreground": "215 28% 17%",
    "--popover": "0 0% 100%",
    "--popover-foreground": "215 28% 17%",
    "--primary": "172 66% 32%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "210 20% 95%",
    "--secondary-foreground": "215 28% 17%",
    "--muted": "210 16% 93%",
    "--muted-foreground": "215 14% 46%",
    "--accent": "37 92% 55%",
    "--accent-foreground": "0 0% 100%",
    "--border": "214 20% 90%",
    "--input": "214 20% 90%",
    "--ring": "172 66% 32%",
  };
};

const BaseComponentPractice = ({ practiceType, practiceTitle, practiceDescription, practiceLevel = "basic" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { remainingPractices: initialRemainingPractices = 0, practiceLevel: passedPracticeLevel = "basic" } =
    location.state || {};

  const actualPracticeLevel = passedPracticeLevel !== "basic" ? passedPracticeLevel : practiceLevel;
  const sessionIdRef = useRef(null);
  if (!sessionIdRef.current) {
    sessionIdRef.current = `${practiceType}-${actualPracticeLevel}-${Math.floor(1000000 + Math.random() * 9000000)}`;
  }
  const sessionId = sessionIdRef.current;

  const [userEmail] = useState(localStorage.getItem("email"));
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showPracticePopup, setShowPracticePopup] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userType, setUserType] = useState("free");
  const [streakData, setStreakData] = useState({ current_streak: 0 });
  const [recordingState, setRecordingState] = useState("idle");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [remainingPractices, setRemainingPractices] = useState(initialRemainingPractices);
  const [clickedButtons, setClickedButtons] = useState(new Set());
  const [playCounts, setPlayCounts] = useState({});
  const [showDashboard, setShowDashboard] = useState(true);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const [resultFeedback, setResultFeedback] = useState("");
  const [resultScore, setResultScore] = useState(null);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState(null);

  const chatRef = useRef(null);
  const timerRef = useRef(null);
  const wavRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const practiceAudioRef = useRef(null);
  const practiceAudioUrlRef = useRef(null);

  const themeVars = useMemo(() => getThemeVars(theme), [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const localUserEmail = localStorage.getItem("email") || localStorage.getItem("userEmail");
        // preload cached values
        const cachedUserType = localStorage.getItem("user_type");
        if (cachedUserType) setUserType(cachedUserType);
        const cachedCurrent = Number(localStorage.getItem("streak_current") || 0);
        const cachedBest = Number(localStorage.getItem("streak_longest") || 0);
        if (cachedCurrent || cachedBest) {
          setStreakData({ current_streak: cachedCurrent, best_streak: cachedBest });
        }

        const [profile, streak] = await Promise.all([
          profileAPI.get(localUserEmail),
          platformAPI.updateStreak(localUserEmail, true)
        ]);

        const normalizeStreak = (src = {}) => ({
          current_streak: parseInt(src.current_streak ?? src.current ?? 0, 10) || 0,
          best_streak: parseInt(src.best_streak ?? src.longest_streak ?? src.longest ?? 0, 10) || 0,
          active_dates: src.active_dates || []
        });

        const profileStreak = profile?.user_info?.streak || profile?.streak;

        if (profile?.statusCode === 200) {
          setUserType(profile.user_type || "free");
          localStorage.setItem("user_type", profile.user_type || "free");
        }

        if (profileStreak) {
          const ns = normalizeStreak(profileStreak);
          setStreakData(ns);
          localStorage.setItem("streak_current", String(ns.current_streak));
          localStorage.setItem("streak_longest", String(ns.best_streak));
          localStorage.setItem("active_dates", JSON.stringify(ns.active_dates || []));
        } else if (streak?.statusCode === 200) {
          const ns = normalizeStreak(streak);
          setStreakData(ns);
          localStorage.setItem("streak_current", String(ns.current_streak));
          localStorage.setItem("streak_longest", String(ns.best_streak));
          localStorage.setItem("active_dates", JSON.stringify(ns.active_dates || []));
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [practiceType]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    return () => {
      if (practiceAudioRef.current) {
        practiceAudioRef.current.pause();
        practiceAudioRef.current = null;
      }

      if (practiceAudioUrlRef.current) {
        URL.revokeObjectURL(practiceAudioUrlRef.current);
        practiceAudioUrlRef.current = null;
      }
    };
  }, []);

  const stopPracticeVoice = () => {
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current.currentTime = 0;
      practiceAudioRef.current = null;
    }

    if (practiceAudioUrlRef.current) {
      URL.revokeObjectURL(practiceAudioUrlRef.current);
      practiceAudioUrlRef.current = null;
    }

    setPlayingMessageIndex(null);
  };

  const playPracticeVoice = async (text, messageIndex) => {
    try {
      stopPracticeVoice();
      const response = await practiceVoiceAPI.synthesize(text);

      if (response.statusCode !== 200 || !response.audioBase64) {
        throw new Error(response.message || response.error || "Voice playback failed");
      }

      const byteCharacters = atob(response.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const audioBlob = new Blob([new Uint8Array(byteNumbers)], {
        type: response.contentType || "audio/mpeg",
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.muted = isVoiceMuted;
      audio.onended = () => {
        if (practiceAudioUrlRef.current === audioUrl) {
          URL.revokeObjectURL(audioUrl);
          practiceAudioUrlRef.current = null;
        }
        if (practiceAudioRef.current === audio) {
          practiceAudioRef.current = null;
        }
        setPlayingMessageIndex(null);
      };
      audio.onerror = () => {
        stopPracticeVoice();
        setChatMessages((prev) => [
          ...prev,
          { type: "ai", content: "Unable to play practice audio right now. Please try again.", timestamp: Date.now() },
        ]);
      };

      practiceAudioUrlRef.current = audioUrl;
      practiceAudioRef.current = audio;
      setPlayingMessageIndex(messageIndex);
      await audio.play();
    } catch (error) {
      console.error("Error playing practice voice:", error);
      stopPracticeVoice();
      setChatMessages((prev) => [
        ...prev,
        { type: "ai", content: "Could not play the practice audio. Please try again.", timestamp: Date.now() },
      ]);
    }
  };

  const togglePracticeMute = () => {
    setIsVoiceMuted((prev) => {
      const nextMuted = !prev;
      if (practiceAudioRef.current) {
        practiceAudioRef.current.muted = nextMuted;
      }
      return nextMuted;
    });
  };

  const decrementPracticeCount = async () => {
    try {
      const email = localStorage.getItem("email");
      
      // Use the new activity usage API
      const response = await activityUsageAPI.decrement(email, "practice", "communication", practiceType);
      if (response.statusCode === 200) {
        // After successful decrement, get the updated count from backend
        try {
          const updatedCountResp = await profileAPI.get(email, "usage", "communication_practices", practiceType);
          if (updatedCountResp.statusCode === 200 && updatedCountResp[practiceType] !== undefined) {
            setRemainingPractices(updatedCountResp[practiceType]);
          } else {
            // Fallback to local decrement if specific key API fails
            setRemainingPractices((prev) => Math.max(0, prev - 1));
          }
        } catch (error) {
          // Fallback to local decrement if API call fails
          setRemainingPractices((prev) => Math.max(0, prev - 1));
        }
        return true;
      }
    } catch (error) {
      console.error("Error decrementing practice count:", error);
    }

    return false;
  };

      const formatMessageText = (text) => {
        return text
            // Listening Assessment headers and formatting
            .replace(/LISTENING COMPREHENSION ANALYSIS/g, '<div style="background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); color: white; padding: 16px 20px; border-radius: 12px; font-weight: 700; font-size: 18px; margin: 15px 0; text-align: center; font-family: Inter, sans-serif; box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4);">?? LISTENING COMPREHENSION ANALYSIS</div>')
            .replace(/SENTENCE \((\d+)\/(\d+)\):/g, '<div style="background: linear-gradient(135deg, #34d399 0%, #10b981 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #34d399;">?? SENTENCE ($1/$2):</div>')
            .replace(/YOUR REPETITION:/g, '<div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #f97316;">??? YOUR REPETITION:</div>')
            .replace(/COMPREHENSION ANALYSIS:/g, '<div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #ef4444;">?? COMPREHENSION ANALYSIS:</div>')
            .replace(/LISTENING PERFORMANCE:/g, '<div style="background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #a855f7;">?? LISTENING PERFORMANCE:</div>')
            .replace(/LISTENING FOCUS:/g, '<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #3b82f6;">?? LISTENING FOCUS:</div>')
            .replace(/SENTENCE SCORE:\s*(\d+\.\d+)\s*\/\s*(\d+\.\d+)/g, '<div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 12px 20px; border-radius: 20px; display: inline-block; font-weight: 700; margin: 10px 0; font-family: Inter, sans-serif; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);">SENTENCE SCORE: $1/$2</div>')
            .replace(/• Words Heard Correctly:/g, '<div style="color: #10b981; font-weight: 600; margin: 8px 0;">? WORDS HEARD CORRECTLY:</div>')
            .replace(/• Missing Words:/g, '<div style="color: #ef4444; font-weight: 600; margin: 8px 0;">? MISSING WORDS:</div>')
            .replace(/• Incorrect Words:/g, '<div style="color: #f59e0b; font-weight: 600; margin: 8px 0;">? INCORRECT WORDS:</div>')
            .replace(/• Extra Words Added:/g, '<div style="color: #8b5cf6; font-weight: 600; margin: 8px 0;">? EXTRA WORDS ADDED:</div>')
            .replace(/• Sequence Errors:/g, '<div style="color: #06b6d4; font-weight: 600; margin: 8px 0;">?? SEQUENCE ERRORS:</div>')
            .replace(/• Comprehension Accuracy:/g, '<div style="color: #10b981; font-weight: 600; margin: 8px 0;">?? COMPREHENSION ACCURACY:</div>')
            .replace(/• Listening Quality:/g, '<div style="color: #3b82f6; font-weight: 600; margin: 8px 0;">?? LISTENING QUALITY:</div>')
            .replace(/• Repetition Completeness:/g, '<div style="color: #8b5cf6; font-weight: 600; margin: 8px 0;">?? REPETITION COMPLETENESS:</div>')
            .replace(/• Audio Processing:/g, '<div style="color: #06b6d4; font-weight: 600; margin: 8px 0;">?? AUDIO PROCESSING:</div>')
            
            // Final Assessment headers
            .replace(/FINAL SPEAKING/g, '<div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 16px 20px; border-radius: 12px; font-weight: 700; font-size: 20px; margin: 15px 0; text-align: center; font-family: Inter, sans-serif; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);">?? FINAL SPEAKING</div>')
            .replace(/OVERALL/g, '<div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 18px; border-radius: 10px; font-weight: 700; font-size: 16px; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #059669;">?? OVERALL</div>')
            .replace(/COMPREHENSIVE SCORES:/g, '<div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #dc2626;">?? COMPREHENSIVE SCORES:</div>')
            .replace(/DETAILED ANALYSIS:/g, '<div style="background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #7c2d12;">?? DETAILED ANALYSIS:</div>')
            .replace(/STRENGTHS IDENTIFIED:/g, '<div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #16a34a;">?? STRENGTHS IDENTIFIED:</div>')
            .replace(/PROFESSIONAL RECOMMENDATIONS:/g, '<div style="background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); color: white; padding: 12px 16px; border-radius: 10px; font-weight: 700; margin: 12px 0; font-family: Inter, sans-serif; border-left: 4px solid #1d4ed8;">?? PROFESSIONAL RECOMMENDATIONS:</div>')
            .replace(/(Final Speaking Score:)\s*(\d+\.\d+)\s*\/\s*(\d+\.\d+)/g, '<div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 10px 16px; border-radius: 20px; display: inline-block; font-weight: 700; margin: 8px 0; font-family: Inter, sans-serif; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">?? $1 $2/$3</div>')
            
            // Better paragraph spacing
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');
    };

    const formatAIMessage = (content, messageIndex) => {
        const handleButtonClick = (value, buttonId) => {
            setClickedButtons(prev => new Set([...prev, buttonId]));
            sendMessage(value);
        };

        // Check for listening practice sentences - ALLOW MULTIPLE PLAYS
        // Handle both single-line and multi-line formats with flexible whitespace
        const listeningMatch = content.match(/LISTENING\s+ASSESSMENT.*?SENTENCE\s*\((\d+)\/(\d+)\)\s*:\s*([\s\S]+?)(?:\n\n|$)/i);
        if (listeningMatch) {
            const [, current, total, sentence] = listeningMatch;
            const playCount = playCounts[messageIndex] || 0;
            const isCurrentAudioPlaying = playingMessageIndex === messageIndex;

            const handlePlayAudio = async () => {
                setPlayCounts(prev => ({ ...prev, [messageIndex]: (prev[messageIndex] || 0) + 1 }));
                await playPracticeVoice(sentence.trim(), messageIndex);
            };
            
            return (
                <div>
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '16px',
                        margin: '15px 0',
                        textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                    }}>
                        ?? LISTENING ASSESSMENT – SENTENCE ({current}/{total})
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px',
                        margin: '20px 0'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                onClick={() => void handlePlayAudio()}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '15px 30px',
                                    borderRadius: '25px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                {playCount > 0 ? `Play Again (${playCount})` : 'Play Audio'}
                            </button>
                            {isCurrentAudioPlaying && (
                                <button
                                    onClick={togglePracticeMute}
                                    style={{
                                        background: isVoiceMuted
                                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                            : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '15px 24px',
                                        borderRadius: '25px',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.25)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isVoiceMuted ? 'Unmute Voice' : 'Mute Voice'}
                                </button>
                            )}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: 'var(--muted)',
                            textAlign: 'center',
                            fontStyle: 'italic'
                        }}>
                            Listen carefully and then repeat what you heard. You can play the audio as many times as you need.
                        </div>
                    </div>
                </div>
            );
        }

        // Check for start button
        if (content.includes("Click 'start'") || content.includes("'start'")) {
            const parts = content.split("Click 'start'");
            const startButtonId = `start-${messageIndex}`;
            
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: formatMessageText(parts[0]) }} />
                    <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button 
                            onClick={() => handleButtonClick('start', startButtonId)}
                            disabled={clickedButtons.has(startButtonId)}
                            style={{
                                background: clickedButtons.has(startButtonId)
                                    ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '20px',
                                fontWeight: '600',
                                cursor: clickedButtons.has(startButtonId) ? 'not-allowed' : 'pointer',
                                boxShadow: clickedButtons.has(startButtonId)
                                    ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s ease',
                                opacity: clickedButtons.has(startButtonId) ? 0.6 : 1
                            }}
                        >
                            START
                        </button>
                    </div>
                </div>
            );
        }
        
        // Check for next/done buttons
        if (content.includes("Click 'next'") || content.includes("'next'") || content.includes("Click 'done'") || content.includes("'done'")) {
            const hasNext = content.includes("next");
            const hasDone = content.includes("done");
            const parts = content.split(/Click '(next|done)'/)[0];
            const nextButtonId = `next-${messageIndex}`;
            const doneButtonId = `done-${messageIndex}`;
            
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: formatMessageText(parts) }} />
                    <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
                        {hasNext && (
                            <button 
                                onClick={() => handleButtonClick('next', nextButtonId)}
                                disabled={clickedButtons.has(nextButtonId)}
                                style={{
                                    background: clickedButtons.has(nextButtonId)
                                        ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    cursor: clickedButtons.has(nextButtonId) ? 'not-allowed' : 'pointer',
                                    boxShadow: clickedButtons.has(nextButtonId)
                                        ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.3s ease',
                                    opacity: clickedButtons.has(nextButtonId) ? 0.6 : 1
                                }}
                            >
                                NEXT
                            </button>
                        )}
                        {hasDone && (
                            <button 
                                onClick={() => handleButtonClick('done', doneButtonId)}
                                disabled={clickedButtons.has(doneButtonId)}
                                style={{
                                    background: clickedButtons.has(doneButtonId)
                                        ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                        : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    cursor: clickedButtons.has(doneButtonId) ? 'not-allowed' : 'pointer',
                                    boxShadow: clickedButtons.has(doneButtonId)
                                        ? 'none' : '0 4px 15px rgba(220, 38, 38, 0.3)',
                                    transition: 'all 0.3s ease',
                                    opacity: clickedButtons.has(doneButtonId) ? 0.6 : 1
                                }}
                            >
                                DONE
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        // Check for yes/no buttons
        if (content.includes("Click 'yes' or 'no'") || content.includes("'yes' or 'no'")) {
            const parts = content.split("Click 'yes' or 'no'.");
            const yesButtonId = `yes-${messageIndex}`;
            const noButtonId = `no-${messageIndex}`;
            
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: formatMessageText(parts[0]) }} />
                    <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button 
                            onClick={() => handleButtonClick('yes', yesButtonId)}
                            disabled={clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId)}
                            style={{
                                background: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId) 
                                    ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                    : 'linear-gradient(135deg, #ffd93d 0%, #ff9500 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                fontWeight: '600',
                                cursor: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId) ? 'not-allowed' : 'pointer',
                                boxShadow: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId) 
                                    ? 'none' : '0 4px 15px rgba(255, 217, 61, 0.3)',
                                transition: 'all 0.3s ease',
                                opacity: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId) ? 0.6 : 1
                            }}
                        >
                            Yes
                        </button>
                        <button 
                            onClick={() => handleButtonClick('no', noButtonId)}
                            disabled={clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId)}
                            style={{
                                background: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId)
                                    ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                    : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                fontWeight: '600',
                                cursor: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId) ? 'not-allowed' : 'pointer',
                                boxShadow: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId)
                                    ? 'none' : '0 4px 15px rgba(255, 107, 107, 0.3)',
                                transition: 'all 0.3s ease',
                                opacity: clickedButtons.has(yesButtonId) || clickedButtons.has(noButtonId) ? 0.6 : 1
                            }}
                        >
                            No
                        </button>
                    </div>
                </div>
            );
        }
        
        // Check for topic selection (1 or 2)
        if (content.includes("Click '1' or '2'") || content.includes("'1' or '2'")) {
            const parts = content.split("Click '1' or '2'.");
            const button1Id = `topic1-${messageIndex}`;
            const button2Id = `topic2-${messageIndex}`;
            
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: formatMessageText(parts[0]) }} />
                    <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button 
                            onClick={() => handleButtonClick('1', button1Id)}
                            disabled={clickedButtons.has(button1Id) || clickedButtons.has(button2Id)}
                            style={{
                                background: clickedButtons.has(button1Id) || clickedButtons.has(button2Id)
                                    ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                    : 'linear-gradient(135deg, #ffd93d 0%, #ff9500 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                fontWeight: '600',
                                cursor: clickedButtons.has(button1Id) || clickedButtons.has(button2Id) ? 'not-allowed' : 'pointer',
                                boxShadow: clickedButtons.has(button1Id) || clickedButtons.has(button2Id)
                                    ? 'none' : '0 4px 15px rgba(255, 217, 61, 0.3)',
                                transition: 'all 0.3s ease',
                                opacity: clickedButtons.has(button1Id) || clickedButtons.has(button2Id) ? 0.6 : 1
                            }}
                        >
                            1
                        </button>
                        <button 
                            onClick={() => handleButtonClick('2', button2Id)}
                            disabled={clickedButtons.has(button1Id) || clickedButtons.has(button2Id)}
                            style={{
                                background: clickedButtons.has(button1Id) || clickedButtons.has(button2Id)
                                    ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                    : 'linear-gradient(135deg, #ffd93d 0%, #ff9500 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                fontWeight: '600',
                                cursor: clickedButtons.has(button1Id) || clickedButtons.has(button2Id) ? 'not-allowed' : 'pointer',
                                boxShadow: clickedButtons.has(button1Id) || clickedButtons.has(button2Id)
                                    ? 'none' : '0 4px 15px rgba(255, 217, 61, 0.3)',
                                transition: 'all 0.3s ease',
                                opacity: clickedButtons.has(button1Id) || clickedButtons.has(button2Id) ? 0.6 : 1
                            }}
                        >
                            2
                        </button>
                    </div>
                </div>
            );
        }
        
        return <div dangerouslySetInnerHTML={{ __html: formatMessageText(content) }} />;
    };


  const initializeAIAgent = async () => {
    try {
      setIsLoading(true);
      setChatMessages([]);
      const response = await fetch(import.meta.env.VITE_PRACTICE_AI_AGENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: { testType: practiceType, level: actualPracticeLevel, sessionId, email: userEmail, message: "hi" },
        }),
      });
      const data = await response.json();
      const bodyData = JSON.parse(data.body);
      if (bodyData.aiResponse) {
        setChatMessages([{ type: "ai", content: bodyData.aiResponse, timestamp: Date.now() }]);
      }
    } catch (error) {
      console.error("Error initializing AI agent:", error);
      setChatMessages([{ type: "ai", content: "Error connecting to AI agent. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      setRecordingState("preparing");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      wavRecorderRef.current = await createWavRecorder(stream);
      setRecording(true);
      setRecordingState("recording");
      setHasRecorded(true);
      setTimeLeft(10);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setChatMessages((prev) => [...prev, { type: "ai", content: "Unable to access microphone. Please check permissions.", timestamp: Date.now() }]);
      setRecordingState("idle");
    }
  };

  const stopRecording = () => {
    if (wavRecorderRef.current && recording) {
      const recorder = wavRecorderRef.current;
      wavRecorderRef.current = null;
      setRecording(false);
      setRecordingState("processing");
      if (timerRef.current) clearInterval(timerRef.current);
      void recorder.stop().then(async (audioBlob) => {
        await sendAudioToTranscript(audioBlob);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      });
    }
  };

  const sendAudioToTranscript = async (audioBlob) => {
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result.split(",")[1];
          const response = await speechToTextAPI.transcribeShortAudio(base64Audio, sessionId, practiceType);
          console.log("[practice:audio-upload:transcript-response]", { sessionId, practiceType, response });

          if (response.statusCode === 200 && response.transcript) {
            await sendMessage(response.transcript.trim());
          } else {
            const failureMessage =
              response.message ||
              response.error ||
              (response.status === "completed" ? "No speech detected clearly. Please speak louder and try again." : null) ||
              "Could not process audio. Please try again.";
            setChatMessages((prev) => [...prev, { type: "ai", content: failureMessage, timestamp: Date.now() }]);
          }
        } catch (error) {
          console.error("Error transcribing audio:", error);
          setChatMessages((prev) => [...prev, { type: "ai", content: "Error processing audio. Please try again.", timestamp: Date.now() }]);
        }
        setIsLoading(false);
        setRecordingState("idle");
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setChatMessages((prev) => [...prev, { type: "ai", content: "Error processing audio. Please try again.", timestamp: Date.now() }]);
      setIsLoading(false);
      setRecordingState("idle");
    }
  };

  const sendMessage = async (userMessage) => {
    setChatMessages((prev) => [...prev, { type: "user", content: userMessage, timestamp: Date.now() }]);
    try {
      setIsLoading(true);
      const response = await fetch(import.meta.env.VITE_COMM_PRACTICE_AGENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: { testType: practiceType, level: actualPracticeLevel, sessionId, email: userEmail, message: userMessage },
        }),
      });
      const data = await response.json();
      const bodyData = JSON.parse(data.body);
      if (bodyData.aiResponse) {
        setChatMessages((prev) => [...prev, { type: "ai", content: bodyData.aiResponse, timestamp: Date.now() }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [...prev, { type: "ai", content: "Error communicating with AI. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = () => setShowStartConfirm(true);
  const confirmStartPractice = () => {
    stopPracticeVoice();
    setIsVoiceMuted(false);
    setShowStartConfirm(false);
    setShowDashboard(false);
    setShowPracticePopup(true);
    setHasRecorded(false);
    setClickedButtons(new Set());
    setResultType(null);
    setResultMessage("");
    setResultFeedback("");
    setResultScore(null);
    initializeAIAgent();
  };
  const handleEndPractice = () => setShowEndConfirm(true);
  const confirmEndPractice = (shouldClose) => {
    setShowEndConfirm(false);
    if (shouldClose) {
      stopPracticeVoice();
      setShowPracticePopup(false);
      setResultType("failed");
      setResultMessage("Practice not completed properly because it was ended manually. No decrement applied.");
      setResultFeedback("");
      setResultScore(null);
    }
  };

  const extractFinalScore = (feedback = "") => {
    const patterns = [
      /JAM Score:\s*(\d+\.?\d*)\s*\/\s*10/i,
      /Final Speaking Score:\s*(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/i,
      /Final Listening Score:\s*(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/i,
      /Situational Score:\s*(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/i,
    ];

    for (const pattern of patterns) {
      const match = feedback.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const handlePracticeComplete = async (finalFeedback = "") => {
    stopPracticeVoice();
    const decremented = await decrementPracticeCount();
    setShowPracticePopup(false);

    if (decremented) {
      setResultType("success");
      setResultMessage(`You have successfully completed ${practiceTitle} - ${actualPracticeLevel} level.`);
      setResultFeedback(finalFeedback);
      setResultScore(extractFinalScore(finalFeedback));
      return;
    }

    setResultType("failed");
    setResultMessage("Practice was completed but count update failed. Please retry later.");
    setResultFeedback("");
    setResultScore(null);
  };

  return (
    <div className="practice-theme min-h-screen bg-background" style={themeVars}>
      <PracticeNavBar
        practiceTitle={practiceTitle}
        actualPracticeLevel={actualPracticeLevel}
        streakData={streakData}
        userType={userType}
        theme={theme}
        setTheme={setTheme}
        onBack={() => navigate(-1)}
        remainingPractices={remainingPractices}
      />

      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-10">
        {!showPracticePopup &&
          (showDashboard ? (
            <PracticeDashboard
              streakData={streakData}
              practiceType={practiceType}
              practiceTitle={practiceTitle}
              practiceLevel={actualPracticeLevel}
              remainingPractices={remainingPractices}
              onNavigateToPractice={handleStartPractice}
            />
          ) : (
            <PracticeStartCard
              practiceTitle={practiceTitle}
              practiceDescription={practiceDescription}
              actualPracticeLevel={actualPracticeLevel}
              remainingPractices={remainingPractices}
              onStart={handleStartPractice}
            />
          ))}
      </div>

      <PracticeSessionPopup
        open={showPracticePopup}
        practiceTitle={practiceTitle}
        actualPracticeLevel={actualPracticeLevel}
        chatRef={chatRef}
        chatMessages={chatMessages}
        isLoading={isLoading}
        formatAIMessage={formatAIMessage}
        recordingState={recordingState}
        recording={recording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        hasRecorded={hasRecorded}
        practiceType={practiceType}
        onEndPractice={handleEndPractice}
        timeLeft={timeLeft}
        sessionId={sessionId}
        onComplete={handlePracticeComplete}
        onCompletionError={(msg) => {
          setShowPracticePopup(false);
          setResultType("failed");
          setResultMessage(msg || "Feedback submission failed. Practice count not decremented.");
          setResultFeedback("");
          setResultScore(null);
        }}
      />

      <PracticeModal
        open={showStartConfirm}
        title="Ready to Start?"
        message={`Are you ready to start the ${practiceTitle} practice session at ${actualPracticeLevel} level?`}
        cancelText="Cancel"
        confirmText="Start Practice"
        onCancel={() => setShowStartConfirm(false)}
        onConfirm={confirmStartPractice}
      />

      <PracticeModal
        open={showEndConfirm}
        title="End Practice?"
        message="Are you sure you want to end this practice session?"
        cancelText="Continue"
        confirmText="End Practice"
        onCancel={() => confirmEndPractice(false)}
        onConfirm={() => confirmEndPractice(true)}
      />

      <TestResultModal
        open={Boolean(resultType)}
        resultType={resultType}
        title={`${practiceTitle} - ${actualPracticeLevel} Level`}
        message={resultMessage}
        feedbackPreview={resultFeedback}
        closeLabel={resultType === "success" ? "View Detailed Feedback" : "Close"}
        onClose={() => {
          stopPracticeVoice();
          if (resultType === "success") {
            navigate("/practice/feedback", {
              state: {
                practiceTitle,
                practiceType,
                actualPracticeLevel,
                sessionId,
                score: resultScore,
                aiFeedback: resultFeedback,
                chatMessages,
              },
            });
            setResultType(null);
            return;
          }

          setResultType(null);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default BaseComponentPractice;


