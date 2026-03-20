import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Clock, Loader2, MessageSquare, Mic, Square, User } from "lucide-react";
import { activityUsageAPI, interviewAPI, interviewResultsAPI, platformAPI, speechToTextAPI } from "../services/api";
import { createWavRecorder } from "../CommunicationTestsFiles/wavRecorder";
import { getInterviewModuleByKey } from "./interviewConfig";
import { extractInterviewScore, isInterviewCompletionResponse } from "./interviewUtils";
import useInterviewUserInfo from "./useInterviewUserInfo";
import "./interview-clone-theme.css";

const MAX_RECORDING_SECONDS = 90;

const cleanMessage = (message = "") =>
  String(message)
    .replace(/\*\*/g, "")
    .replace(/\r/g, "")
    .trim();

const buildSessionId = (interviewKey = "self_introduction", mode = "practice", level = "basic") =>
  `basicinterview-${interviewKey}-${mode}-${String(level).toLowerCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    interviewTitle = "Interview Session",
    interviewLevel = "Basic",
    mode = "practice",
    remainingTests = 0,
    interviewKey = "self_introduction_practice",
  } = location.state || {};

  const isTestMode = mode === "test";
  const interviewModule = useMemo(() => getInterviewModuleByKey(interviewKey), [interviewKey]);
  const interviewTypeKey = useMemo(() => interviewKey.replace(/_(practice|test)$/i, ""), [interviewKey]);
  const { userType, streakData, email, isPremium } = useInterviewUserInfo();

  const [chatMessages, setChatMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingState, setRecordingState] = useState("idle");
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(MAX_RECORDING_SECONDS);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(isTestMode ? 1800 : 3600);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const chatRef = useRef(null);
  const timerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const wavRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const recordingCounterRef = useRef(0);
  const sessionIdRef = useRef(buildSessionId(interviewTypeKey, mode, interviewLevel));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      wavRecorderRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!interviewStarted) return undefined;

    sessionTimerRef.current = window.setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          completeInterview({
            report: "INTERVIEW ASSESSMENT REPORT\n\nSession ended because the time limit was reached.",
            summary: "Session auto-completed when the time limit ended.",
            score: 0,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [interviewStarted]);

  const appendMessage = (role, content) => {
    const cleaned = cleanMessage(content);
    const message = {
      role,
      content: cleaned,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, message]);
    setConversationHistory((prev) => {
      const next = [...prev, message];
      conversationHistoryRef.current = next;
      return next;
    });
    return message;
  };

  const startInterview = async () => {
    if (interviewStarted) return;

    setInterviewStarted(true);
    setIsLoading(true);

    try {
      const response = await interviewAPI.sendMessage({
        interviewType: interviewTypeKey,
        level: String(interviewLevel || "Basic").toLowerCase(),
        mode,
        sessionId: sessionIdRef.current,
        email: localStorage.getItem("email") || "",
        message: "hi",
      });

      const aiResponse = cleanMessage(response?.aiResponse || response?.message || "Hello, let's begin our interview conversation.");
      appendMessage("ai", aiResponse);
    } catch (error) {
      console.error("[interview-session:start-error]", error);
      appendMessage("ai", "Unable to start the interview right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const generateFallbackFeedback = () => {
    const activeConversation = conversationHistoryRef.current;
    const userMessages = activeConversation.filter((item) => item.role === "user");
    const totalWords = userMessages.reduce((sum, item) => sum + item.content.split(/\s+/).filter(Boolean).length, 0);
    const averageWords = userMessages.length ? Math.round(totalWords / userMessages.length) : 0;
    const score = Math.min(9, Math.max(4, Math.round((averageWords / 12 + userMessages.length) * 10) / 10));

    return {
      score,
      summary: `${interviewTitle} completed with ${userMessages.length} spoken responses.`,
      report: `INTERVIEW ASSESSMENT REPORT

OVERALL PERFORMANCE SUMMARY:
You completed the interview conversation successfully. A fallback report was generated because the AI did not return a final structured assessment in time.

COMPREHENSIVE SCORES:
- Final Interview Score: ${score} / 10.0
- Total Spoken Responses: ${userMessages.length}
- Average Response Length: ${averageWords} words

PROFESSIONAL RECOMMENDATIONS:
1. Keep answers clear, specific, and role-focused.
2. Add stronger examples and measurable outcomes in each response.
3. Maintain steady fluency and confidence across the full conversation.`,
    };
  };

  const decrementInterviewCount = async () => {
    try {
      const storedEmail = localStorage.getItem("email");
      const levelKey = interviewKey.includes("advanced") ? "advanced_interview" : "basic_interview";
      await activityUsageAPI.decrement(storedEmail, mode, levelKey, interviewKey);
    } catch (error) {
      console.error("[interview-session:decrement-error]", error);
    }
  };

  const completeInterview = async (completionPayload) => {
    if (interviewCompleted) return;
    setInterviewCompleted(true);
    setShowEndConfirm(false);

    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);

    const fallback = generateFallbackFeedback();
    const report = completionPayload?.report || fallback.report;
    const summary = completionPayload?.summary || fallback.summary;
    const score = typeof completionPayload?.score === "number" ? completionPayload.score : fallback.score;

    try {
      const studentEmail = localStorage.getItem("email") || "";
      await interviewResultsAPI.submitSession({
        college_email: studentEmail,
        mode,
        interview_key: interviewKey,
        interview_title: interviewTitle,
        interview_level: String(interviewLevel || "Basic").toLowerCase(),
        interview_session_id: sessionIdRef.current,
        final_score: Number(score.toFixed(1)),
        ai_feedback: report,
        conversationHistory: conversationHistoryRef.current,
      });
      await decrementInterviewCount();
      await platformAPI.updateStreak(studentEmail);
    } catch (error) {
      console.error("[interview-session:submit-error]", error);
    }

    navigate("/interview/feedback", {
      state: {
        score: Math.round(score * 10),
        mode,
        interviewTitle,
        interviewLevel,
        report,
        summary,
        conversationHistory: conversationHistoryRef.current,
      },
    });
  };

  const sendTranscriptToAi = async (transcript) => {
    appendMessage("user", transcript);
    setIsLoading(true);

    try {
      const response = await interviewAPI.sendMessage({
        interviewType: interviewTypeKey,
        level: String(interviewLevel || "Basic").toLowerCase(),
        mode,
        sessionId: sessionIdRef.current,
        email: localStorage.getItem("email") || "",
        message: transcript,
      });

      const aiResponse = cleanMessage(response?.aiResponse || response?.message || "I could not process that response properly.");
      appendMessage("ai", aiResponse);

      if (isInterviewCompletionResponse(aiResponse)) {
        const extracted = extractInterviewScore(aiResponse) || 0;
        await completeInterview({
          score: extracted,
          summary: `${interviewTitle} completed.`,
          report: aiResponse,
        });
      }
    } catch (error) {
      console.error("[interview-session:send-error]", error);
      appendMessage("ai", "There was an issue sending your response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = () => {
    if (!wavRecorderRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const recorder = wavRecorderRef.current;
    wavRecorderRef.current = null;
    setRecordingState("processing");

    void recorder.stop().then(async (audioBlob) => {
      try {
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

        recordingCounterRef.current += 1;
        const transcriptSessionId = `${sessionIdRef.current}-speech-${recordingCounterRef.current}`;
        const transcriptResponse = await speechToTextAPI.transcribeShortAudio(
          base64Audio,
          transcriptSessionId,
          `basic_interview_${interviewTypeKey}`,
        );

        const transcript = cleanMessage(
          transcriptResponse?.transcript ||
          transcriptResponse?.text ||
          transcriptResponse?.result?.transcript ||
          "",
        );

        if (!transcript) {
          appendMessage("ai", "I could not hear a clear response. Please speak again.");
        } else {
          await sendTranscriptToAi(transcript);
        }
      } catch (error) {
        console.error("[interview-session:stt-error]", error);
        appendMessage("ai", "Audio processing failed. Please try again.");
      } finally {
        setRecordingState("idle");
        setRecordingTimeLeft(MAX_RECORDING_SECONDS);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    });
  };

  const startRecording = async () => {
    try {
      setRecordingState("preparing");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      wavRecorderRef.current = await createWavRecorder(stream);
      setRecordingState("recording");
      setRecordingTimeLeft(MAX_RECORDING_SECONDS);

      timerRef.current = window.setInterval(() => {
        setRecordingTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("[interview-session:recording-error]", error);
      setRecordingState("idle");
      appendMessage("ai", "Microphone access is required to continue this interview.");
    }
  };

  if (!interviewStarted) {
    return (
      <div className="interview-theme min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${isTestMode ? "bg-accent/10" : "bg-primary/10"}`}>
            <MessageSquare className={`w-10 h-10 ${isTestMode ? "text-accent" : "text-primary"}`} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">{interviewTitle}</h1>
          <p className="text-muted-foreground mb-1 text-sm">
            {isTestMode ? "Test" : "Practice"} - {interviewLevel} Level
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Remaining sessions: {remainingTests || 0}
          </p>
          <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left">
            <h4 className="text-sm font-semibold text-foreground mb-2">Session Flow</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Talk naturally with Tara AI like a real interview conversation.</li>
              <li>Use the mic button for each spoken response.</li>
              <li>When Tara AI sends the final assessment, feedback opens automatically.</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={startInterview}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${isTestMode ? "bg-accent text-accent-foreground hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"}`}
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
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isTestMode ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                {mode.toUpperCase()}
              </span>
              <span className="text-xs font-medium text-foreground">{interviewModule?.title || interviewTitle}</span>
              <span className="text-xs text-muted-foreground">{interviewLevel}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Conversation-first interview mode. Speak naturally and keep your answers specific.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="interview-badge">Streak: {streakData.current_streak || 0}</span>
            <span className={`interview-badge ${isPremium ? "accent" : ""}`}>
              {userType === "premium" ? "Premium" : "Free"}
            </span>
            {email && <span className="interview-badge">{email}</span>}
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold ${sessionTimeLeft < 300 ? "text-destructive" : "text-muted-foreground"}`}>
            <Clock className="w-4 h-4" />
            {formatTime(sessionTimeLeft)}
          </div>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {chatMessages.map((msg, index) => (
            <div key={`${msg.role}-${msg.timestamp}-${index}`} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === "ai" ? "bg-primary/10" : "bg-muted"}`}>
                {msg.role === "ai" ? (
                  <Bot className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "ai" ? "bg-card border border-border text-foreground" : "bg-primary text-primary-foreground"}`}>
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
                Tara AI is preparing the next response...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border bg-card px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          {recordingState !== "idle" && (
            <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${recordingState === "recording" ? "bg-destructive/10 text-destructive" : recordingState === "preparing" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
              {recordingState === "preparing" && "Preparing microphone..."}
              {recordingState === "recording" && `Recording - ${formatTime(recordingTimeLeft)}`}
              {recordingState === "processing" && "Processing speech..."}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={recordingState === "recording" ? stopRecording : startRecording}
              disabled={isLoading || recordingState === "preparing" || recordingState === "processing" || interviewCompleted}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${recordingState === "recording" ? "bg-destructive text-destructive-foreground shadow-lg" : "bg-primary text-primary-foreground shadow-glow hover:scale-105"}`}
            >
              {recordingState === "recording" ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowEndConfirm(true)}
              disabled={recordingState === "recording" || interviewCompleted}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${isTestMode ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {isTestMode ? "End Test" : "End Interview"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            {recordingState === "idle" ? "Tap the mic and answer naturally. Tara AI will continue the conversation." : ""}
          </p>
        </div>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-lg p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Finish this session?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We will submit the conversation so far and generate feedback from the recorded interview.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => completeInterview()}
                className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;
