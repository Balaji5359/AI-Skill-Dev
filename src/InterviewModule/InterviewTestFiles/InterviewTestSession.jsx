import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, Clock, Loader2, MessageSquare, Mic, Square, User } from "lucide-react";
import { activityUsageAPI, interviewAPI, interviewResultsAPI, platformAPI, profileAPI, speechToTextAPI } from "../../services/api";
import { createWavRecorder } from "../../CommunicationTestsFiles/wavRecorder";
import { getInterviewModuleByKey } from "../interviewConfig";
import { extractInterviewScore, isInterviewCompletionResponse } from "../interviewUtils";
import useInterviewUserInfo from "../useInterviewUserInfo";
import "../interview-clone-theme.css";

const MAX_RECORDING_SECONDS = 90;
const SESSION_DURATION_SECONDS = 1800;

const cleanMessage = (msg = "") => String(msg).replace(/\*\*/g, "").replace(/\r/g, "").trim();

const buildSessionId = (typeKey = "self_introduction", level = "basic") =>
  `basicinterview-${typeKey}-test-${String(level).toLowerCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

const InterviewTestSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    interviewTitle = "Interview Test",
    interviewLevel = "Basic",
    remainingTests = 0,
    interviewKey = "self_introduction_test",
  } = location.state || {};

  // base type used for both AI agent and DB: e.g. "self_introduction"
  const interviewTypeKey = useMemo(() => interviewKey.replace(/_(practice|test)$/i, ""), [interviewKey]);
  const interviewModule = useMemo(() => getInterviewModuleByKey(interviewKey), [interviewKey]);
  const levelLower = String(interviewLevel || "Basic").toLowerCase();

  const { userType, streakData, email, isPremium } = useInterviewUserInfo();

  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingState, setRecordingState] = useState("idle");
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(MAX_RECORDING_SECONDS);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_DURATION_SECONDS);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [remainingSessions, setRemainingSessions] = useState(Number(remainingTests) || 0);
  const [showFullscreenAlert, setShowFullscreenAlert] = useState(false);
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
  const [showStartInstruction, setShowStartInstruction] = useState(false);

  const chatRef = useRef(null);
  const timerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const wavRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const recordingCounterRef = useRef(0);
  const completionHandledRef = useRef(false);
  const sessionIdRef = useRef(buildSessionId(interviewTypeKey, levelLower));
  const fullscreenWarningsRef = useRef(0);
  const fullscreenTerminationHandledRef = useRef(false);

  useEffect(() => {
    console.log("[test-session:mount]", {
      interviewKey, interviewTypeKey, levelLower,
      sessionId: sessionIdRef.current, remainingTests
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    const loadCount = async () => {
      const storedEmail = email || localStorage.getItem("email");
      if (!storedEmail || !interviewKey) return;
      try {
        const res = await profileAPI.get(storedEmail, "usage", "interview_tests", interviewKey);
        console.log("[test-session:count-load]", { interviewKey, count: res?.[interviewKey] });
        if (res?.statusCode === 200 && res[interviewKey] !== undefined) {
          setRemainingSessions(Number(res[interviewKey]) || 0);
        }
      } catch (e) { console.error("[test-session:count-load:error]", e); }
    };
    loadCount();
  }, [email, interviewKey]);

  // Block back navigation during active session
  useEffect(() => {
    if (!interviewStarted || interviewCompleted) return;
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowEndConfirm(true);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [interviewStarted, interviewCompleted]);

  // Session timer
  useEffect(() => {
    if (!interviewStarted) return;
    sessionTimerRef.current = window.setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          void completeInterview({ terminated: true, sessionCompleted: false, report: "", summary: "Session time limit reached.", score: 0 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, [interviewStarted]);

  // Fullscreen enforcement
  useEffect(() => {
    if (!interviewStarted) return;
    const onFullscreenChange = () => {
      if (fullscreenTerminationHandledRef.current) return;
      const fullscreen = Boolean(document.fullscreenElement);
      if (!fullscreen && !interviewCompleted) {
        const next = fullscreenWarningsRef.current + 1;
        fullscreenWarningsRef.current = next;
        setFullscreenWarnings(next);
        if (next >= 3) {
          fullscreenTerminationHandledRef.current = true;
          void completeInterview({ terminated: true, sessionCompleted: false, report: "", summary: "Session ended: fullscreen exited multiple times.", score: 0 });
          return;
        }
        setShowFullscreenAlert(true);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [interviewCompleted, interviewStarted]);

  const appendMessage = (role, content) => {
    const msg = { role, content: cleanMessage(content), timestamp: Date.now() };
    setChatMessages((prev) => [...prev, msg]);
    conversationHistoryRef.current = [...conversationHistoryRef.current, msg];
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const generateFallbackFeedback = () => {
    const userMsgs = conversationHistoryRef.current.filter((m) => m.role === "user");
    const totalWords = userMsgs.reduce((sum, m) => sum + m.content.split(/\s+/).filter(Boolean).length, 0);
    const avgWords = userMsgs.length ? Math.round(totalWords / userMsgs.length) : 0;
    const score = Math.min(9, Math.max(4, Math.round((avgWords / 12 + userMsgs.length) * 10) / 10));
    return {
      score,
      summary: `${interviewTitle} test completed with ${userMsgs.length} responses.`,
      report: `INTERVIEW ASSESSMENT REPORT\n\nFinal Interview Score: ${score} / 10.0\nTotal Responses: ${userMsgs.length}\nAverage Response Length: ${avgWords} words`,
    };
  };

  const enterFullscreen = async () => {
    try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); }
    catch (e) { console.error("[test-session:fullscreen:error]", e); }
  };

  const exitFullscreen = async () => {
    try { if (document.exitFullscreen && document.fullscreenElement) await document.exitFullscreen(); }
    catch (e) { console.error("[test-session:exit-fullscreen:error]", e); }
  };

  // Decrement usage — full key e.g. "self_introduction_test"
  const decrementCount = async () => {
    try {
      const storedEmail = localStorage.getItem("email");
      console.log("[test-session:decrement:req]", { storedEmail, mode: "test", level: "basic_interview", interviewKey });
      const res = await activityUsageAPI.decrement(storedEmail, "test", "basic_interview", interviewKey);
      console.log("[test-session:decrement:res]", res);
      if (res?.statusCode === 200) setRemainingSessions((prev) => Math.max(0, prev - 1));
    } catch (e) { console.error("[test-session:decrement:error]", e); }
  };

  const completeInterview = async (payload) => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;
    setInterviewCompleted(true);
    setShowEndConfirm(false);
    setShowFullscreenAlert(false);
    await exitFullscreen();
    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);

    const fallback = generateFallbackFeedback();
    const terminated = Boolean(payload?.terminated);
    const sessionCompleted = Boolean(payload?.sessionCompleted);
    const report = terminated ? (payload?.report || "") : (payload?.report || fallback.report);
    const summary = terminated ? (payload?.summary || "") : (payload?.summary || fallback.summary);
    const rawScore = terminated
      ? (typeof payload?.score === "number" ? payload.score : 0)
      : (typeof payload?.score === "number" ? payload.score : fallback.score);

    console.log("[test-session:complete]", { terminated, sessionCompleted, rawScore, sessionId: sessionIdRef.current });

    if (!terminated) {
      try {
        const studentEmail = localStorage.getItem("email") || "";
        // interview_key = base type e.g. "self_introduction" (confirmed from API test)
        const submitPayload = {
          college_email: studentEmail,
          sessionId: sessionIdRef.current,
          interview_key: interviewTypeKey,
          level: levelLower,
          mode: "test",
          score: Number(rawScore.toFixed(1)),
          ai_feedback: report,
          interview_title: interviewTitle,
        };
        console.log("[test-session:submit:payload]", submitPayload);
        const submitRes = await interviewResultsAPI.submitSession(submitPayload);
        console.log("[test-session:submit:result]", submitRes);
        await decrementCount();
        const streakRes = await platformAPI.updateStreak(studentEmail);
        console.log("[test-session:streak:result]", streakRes);
      } catch (e) { console.error("[test-session:complete:error]", e); }
    }

    navigate("/interview/test/feedback", {
      state: {
        score: Math.round(rawScore * 10),
        interviewTitle, interviewLevel, report, summary,
        conversationHistory: conversationHistoryRef.current,
        sessionCompleted, terminated,
      },
    });
  };

  const startInterview = async () => {
    if (interviewStarted) return;
    setInterviewStarted(true);
    setIsLoading(true);
    console.log("[test-session:start]", { interviewTypeKey, levelLower, sessionId: sessionIdRef.current });
    try {
      const res = await interviewAPI.sendMessage({
        interviewType: interviewTypeKey,
        level: levelLower,
        mode: "test",
        sessionId: sessionIdRef.current,
        email: localStorage.getItem("email") || "",
        message: "hi",
      });
      console.log("[test-session:start:response]", res);
      appendMessage("ai", cleanMessage(res?.aiResponse || res?.message || "Hello! Let's begin your interview test."));
    } catch (e) {
      console.error("[test-session:start:error]", e);
      appendMessage("ai", "Unable to start the test. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleStartTest = () => {
    if (remainingSessions <= 0) return;
    setShowStartInstruction(true);
  };

  const handleConfirmStart = async () => {
    setShowStartInstruction(false);
    fullscreenWarningsRef.current = 0;
    fullscreenTerminationHandledRef.current = false;
    setFullscreenWarnings(0);
    await enterFullscreen();
    await startInterview();
  };

  const sendTranscriptToAi = async (transcript) => {
    appendMessage("user", transcript);
    setIsLoading(true);
    console.log("[test-session:send]", { transcript: transcript.slice(0, 60), sessionId: sessionIdRef.current });
    try {
      const res = await interviewAPI.sendMessage({
        interviewType: interviewTypeKey,
        level: levelLower,
        mode: "test",
        sessionId: sessionIdRef.current,
        email: localStorage.getItem("email") || "",
        message: transcript,
      });
      console.log("[test-session:send:response]", res);
      const aiResponse = cleanMessage(res?.aiResponse || res?.message || "I could not process that response.");
      appendMessage("ai", aiResponse);
      if (isInterviewCompletionResponse(aiResponse)) {
        const extracted = extractInterviewScore(aiResponse) || 0;
        console.log("[test-session:completion-detected]", { extracted, preview: aiResponse.slice(0, 80) });
        await completeInterview({ score: extracted, summary: `${interviewTitle} test completed.`, report: aiResponse, sessionCompleted: true, terminated: false });
      }
    } catch (e) {
      console.error("[test-session:send:error]", e);
      appendMessage("ai", "There was an issue. Please try again.");
    } finally { setIsLoading(false); }
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
          reader.onloadend = () => { try { resolve(reader.result.split(",")[1]); } catch (e) { reject(e); } };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });
        recordingCounterRef.current += 1;
        const sttId = `${sessionIdRef.current}-stt-${recordingCounterRef.current}`;
        console.log("[test-session:stt:req]", { sttId, blobSize: audioBlob.size });
        const res = await speechToTextAPI.transcribeShortAudio(base64Audio, sttId, `basic_interview_${interviewTypeKey}`);
        console.log("[test-session:stt:res]", res);
        const transcript = cleanMessage(res?.transcript || res?.text || "");
        if (!transcript) appendMessage("ai", "I could not hear a clear response. Please speak again.");
        else await sendTranscriptToAi(transcript);
      } catch (e) {
        console.error("[test-session:stt:error]", e);
        appendMessage("ai", "Audio processing failed. Please try again.");
      } finally {
        setRecordingState("idle");
        setRecordingTimeLeft(MAX_RECORDING_SECONDS);
        if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
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
        setRecordingTimeLeft((prev) => { if (prev <= 1) { stopRecording(); return 0; } return prev - 1; });
      }, 1000);
    } catch (e) {
      console.error("[test-session:recording:error]", e);
      setRecordingState("idle");
      appendMessage("ai", "Microphone access is required to continue.");
    }
  };

  return (
    <div className="interview-theme min-h-screen bg-background">

      {/* Pre-start screen */}
      {!interviewStarted && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">{interviewTitle}</h1>
            <p className="text-muted-foreground mb-1 text-sm">Test — {interviewLevel} Level</p>
            <p className="text-muted-foreground mb-8 text-sm">Remaining sessions: {remainingSessions}</p>
            <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left">
              <h4 className="text-sm font-semibold text-foreground mb-2">Test Conditions</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Session runs in fullscreen mode. Exiting 3 times terminates the test.</li>
                <li>• 30-minute time limit applies.</li>
                <li>• Use the mic button for each spoken response.</li>
                <li>• Complete all prompts to receive your final assessment.</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate(-1)} className="px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Go Back</button>
              <button onClick={handleStartTest} disabled={remainingSessions <= 0} className="px-6 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {remainingSessions <= 0 ? "No Sessions Remaining" : "Start Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active session */}
      {interviewStarted && (
        <div className="h-screen flex flex-col">
          <div className="flex-shrink-0 glass border-b border-border px-4 py-3">
            <div className="flex items-center gap-4 max-w-4xl mx-auto flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">TEST</span>
                  <span className="text-xs font-medium text-foreground">{interviewModule?.title || interviewTitle}</span>
                  <span className="text-xs text-muted-foreground">{interviewLevel}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">ID: {sessionIdRef.current}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="interview-badge">Streak: {streakData.current_streak || 0}</span>
                <span className={`interview-badge ${isPremium ? "accent" : ""}`}>{userType === "premium" ? "Premium" : "Free"}</span>
                <span className="interview-badge">Remaining: {remainingSessions}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold ${sessionTimeLeft < 300 ? "text-destructive" : "text-muted-foreground"}`}>
                <Clock className="w-4 h-4" />{formatTime(sessionTimeLeft)}
              </div>
            </div>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={`${msg.role}-${msg.timestamp}-${index}`} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === "ai" ? "bg-accent/10" : "bg-muted"}`}>
                    {msg.role === "ai" ? <Bot className="w-4 h-4 text-accent" /> : <User className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "ai" ? "bg-card border border-border text-foreground" : "bg-accent text-accent-foreground"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Bot className="w-4 h-4 text-accent" /></div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />Tara AI is preparing the next response...
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
                  {recordingState === "recording" && `Recording — ${formatTime(recordingTimeLeft)}`}
                  {recordingState === "processing" && "Processing speech..."}
                </div>
              )}
              <div className="flex items-center gap-4">
                <button
                  onClick={recordingState === "recording" ? stopRecording : startRecording}
                  disabled={isLoading || recordingState === "preparing" || recordingState === "processing" || interviewCompleted}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${recordingState === "recording" ? "bg-destructive text-destructive-foreground shadow-lg" : "bg-accent text-accent-foreground hover:scale-105"}`}
                >
                  {recordingState === "recording" ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button onClick={() => setShowEndConfirm(true)} disabled={recordingState === "recording" || interviewCompleted} className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors disabled:opacity-40">
                  End Test
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{recordingState === "idle" ? "Tap the mic and answer naturally." : ""}</p>
            </div>
          </div>
        </div>
      )}

      {/* Before You Start popup */}
      {showStartInstruction && (
        <div className="fixed inset-0 z-[70] bg-foreground/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Before You Start</h3>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>• Fullscreen mode is required during the test.</li>
              <li>• Exiting fullscreen 3 times will terminate the test.</li>
              <li>• Keep your microphone ready before recording.</li>
              <li>• Complete all prompts to receive your final assessment.</li>
              <li>• Back button is disabled during the test.</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors" onClick={() => setShowStartInstruction(false)}>Cancel</button>
              <button className="px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity" onClick={handleConfirmStart}>Enter Fullscreen & Start</button>
            </div>
          </div>
        </div>
      )}

      {/* End confirm */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">End this test?</h3>
            <p className="text-sm text-muted-foreground mb-6">Only completed sessions show a full assessment report. Ending early will not decrement your count.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Continue</button>
              <button onClick={() => completeInterview({ terminated: true, sessionCompleted: false, score: 0, summary: "Test ended manually.", report: "" })} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Submit Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen warning */}
      {showFullscreenAlert && interviewStarted && !interviewCompleted && (
        <div className="fixed inset-0 z-[75] bg-foreground/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 text-center">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Fullscreen Required</h3>
            <p className="text-sm text-muted-foreground mb-4">Please return to fullscreen mode to continue this test.</p>
            <p className="text-xs text-muted-foreground mb-6">Warnings: {fullscreenWarnings}/3</p>
            <button onClick={async () => { setShowFullscreenAlert(false); await enterFullscreen(); }} className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewTestSession;
