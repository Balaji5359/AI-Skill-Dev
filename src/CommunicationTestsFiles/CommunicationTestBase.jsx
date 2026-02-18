import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TestNavBar from "./components/TestNavBar";
import TestResultModal from "./components/TestResultModal";
import TestSessionPopup from "./components/TestSessionPopup";
import TestStartCard from "./components/TestStartCard";
import { getTestKey } from "./testUtils";
import "../InterviewModule/interview-clone-theme.css";
import "./test-custom.css";

const profileUrl =
  "https://ntjkr8rnd6.execute-api.ap-south-1.amazonaws.com/dev/student_profilecreate/student_profile_senddata";
const streakUrl = "https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/update-user-streak";
const decrementUrl = "https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/comm-test-decrement";
const transcribeUrl = "https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/audiototranscript-api";
const longRecordUrl =
  "https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/studentcommunicationtests_recordingapi";
const longPollUrl =
  "https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/studentcommunicationtests_transcribeapi";

const isLongRecordingTest = (testType) => testType === "jam" || testType === "situation";

const getRecordingDuration = (testType) => {
  if (isLongRecordingTest(testType)) return 60;
  if (testType === "listening" || testType === "pronunciation") return 10;
  return 10;
};

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

export default function CommunicationTestBase({
  testType,
  testTitle,
  testDescription,
  testLevel = "basic",
  testDuration = 600,
  apiEndpoint,
  autoStartMessage = "hi",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { remainingTests: initialRemainingTests = 0, testLevel: passedTestLevel = "basic" } =
    location.state || {};
  const actualTestLevel = passedTestLevel !== "basic" ? passedTestLevel : testLevel;

  const [activeTab, setActiveTab] = useState(`${testTitle} Dashboard`);
  const [remainingTests, setRemainingTests] = useState(initialRemainingTests);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showTestPopup, setShowTestPopup] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userType, setUserType] = useState("free");
  const [streakData, setStreakData] = useState({ current_streak: 0 });
  const [recordingState, setRecordingState] = useState("idle");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showStartInstruction, setShowStartInstruction] = useState(false);
  const [showFullscreenAlert, setShowFullscreenAlert] = useState(false);
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [clickedButtons, setClickedButtons] = useState(new Set());
  const [testTimeLeft, setTestTimeLeft] = useState(testDuration);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sessionIdRef = useRef(null);
  const chatRef = useRef(null);
  const timerRef = useRef(null);
  const testTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const completionHandledRef = useRef(false);
  const fullscreenWarningsRef = useRef(0);
  const fullscreenTerminationHandledRef = useRef(false);

  const userEmail = useMemo(() => localStorage.getItem("email") || "", []);
  const themeVars = useMemo(() => getThemeVars(theme), [theme]);

  if (!sessionIdRef.current) {
    sessionIdRef.current = `${testType}-test-${actualTestLevel}-${Math.floor(1000000 + Math.random() * 9000000)}`;
  }
  const sessionId = sessionIdRef.current;

  const cleanupMedia = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      console.error("Failed stopping media recorder:", error);
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Failed stopping stream:", error);
      }
      streamRef.current = null;
    }

    setRecording(false);
    setRecordingState("idle");
  };

  const stopTestTimer = () => {
    if (testTimerRef.current) {
      clearInterval(testTimerRef.current);
      testTimerRef.current = null;
    }
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

  const fetchUserData = useCallback(async () => {
    try {
      const storedEmail = localStorage.getItem("email");
      if (!storedEmail) return;

      const [profileResponse, streakResponse] = await Promise.all([
        fetch(profileUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college_email: storedEmail }),
        }),
        fetch(streakUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: JSON.stringify({ college_email: storedEmail, get_streak_data: true }),
          }),
        }),
      ]);

      const profile = await profileResponse.json();
      const streak = await streakResponse.json();

      if (profile?.body) {
        const userData = JSON.parse(profile.body);
        const isPremium = userData?.user_type === "premium" && userData?.premium_status === "active";
        setUserType(isPremium ? "premium" : "free");
      }

      if (streak?.body) {
        setStreakData(JSON.parse(streak.body));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  const fetchTestCounts = useCallback(async () => {
    const email = localStorage.getItem("email");
    if (!email) return;

    try {
      const response = await fetch(profileUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college_email: email }),
      });
      const data = await response.json();
      const parsedData = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      const testKey = getTestKey(testType);
      setRemainingTests(parsedData.tests?.[testKey] || 0);
    } catch (error) {
      console.error("Error fetching test count:", error);
    }
  }, [testType]);

  const decrementTestCount = useCallback(async () => {
    try {
      const email = localStorage.getItem("email");
      const response = await fetch(decrementUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college_email: email,
          type: "test",
          key: getTestKey(testType),
        }),
      });

      const data = await response.json();
      if (data.statusCode === 200) {
        setRemainingTests((prev) => Math.max(0, prev - 1));
        return true;
      }
    } catch (error) {
      console.error("Error decrementing test count:", error);
    }

    return false;
  }, [testType]);

  const sendMessage = async (message) => {
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: {
            message,
            sessionId,
            email: localStorage.getItem("email"),
            level: actualTestLevel,
          },
        }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const decoded = JSON.parse(data.body).response;
      const textarea = document.createElement("textarea");
      textarea.innerHTML = decoded;

      setChatMessages((prev) => [
        ...prev,
        { type: "user", content: message, timestamp: Date.now() },
        { type: "ai", content: textarea.value, timestamp: Date.now() },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { type: "user", content: message, timestamp: Date.now() },
        { type: "ai", content: `Error: ${error.message}. Please try again.`, timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendAudioToDirectAPI = async (audioBlob) => {
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];
        const response = await fetch(transcribeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: JSON.stringify({ data: base64Audio }),
            isBase64Encoded: false,
          }),
        });

        const data = await response.json();
        const transcript = JSON.parse(data.body).transcript;
        if (transcript) {
          await sendMessage(transcript.trim());
        } else {
          setChatMessages((prev) => [
            ...prev,
            { type: "ai", content: "Could not process audio. Please try again.", timestamp: Date.now() },
          ]);
        }
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsLoading(false);
    }
  };

  const sendAudioToLongRecordingAPI = async (audioBlob) => {
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];
        await fetch(longRecordUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: JSON.stringify({
              data: base64Audio,
              sessionId,
              testType,
              testLevel: actualTestLevel,
            }),
          }),
        });

        let attempts = 0;
        const pollTranscript = async () => {
          try {
            const response = await fetch(longPollUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ body: { sessionId } }),
            });
            const data = await response.json();
            const payload = data.body ? JSON.parse(data.body) : data;
            if (payload.status === "completed" && payload.transcript) {
              await sendMessage(payload.transcript.trim());
              return;
            }
            if (attempts < 12 && (payload.status === "processing" || payload.error)) {
              attempts += 1;
              setTimeout(pollTranscript, 2000);
              return;
            }
            setChatMessages((prev) => [
              ...prev,
              { type: "ai", content: "Audio processing timeout. Please try again.", timestamp: Date.now() },
            ]);
            setIsLoading(false);
          } catch {
            if (attempts < 12) {
              attempts += 1;
              setTimeout(pollTranscript, 2000);
            } else {
              setIsLoading(false);
            }
          }
        };
        setTimeout(pollTranscript, 3000);
      };
    } catch (error) {
      console.error("Long recording processing failed:", error);
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    const useLongRecordingApi = isLongRecordingTest(testType);
    if (hasRecorded && useLongRecordingApi) return;
    setRecordingState("preparing");

    setTimeout(async () => {
      const duration = getRecordingDuration(testType);
      setTimeLeft(duration);
      setRecordingState("recording");
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Microphone is not supported in this browser.");
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((device) => device.kind === "audioinput");
        if (!audioInputs.length) {
          throw new Error("No microphone device found. Please connect a mic and retry.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setRecording(true);
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = async () => {
          setRecordingState("processing");
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          setTimeout(async () => {
            if (useLongRecordingApi) {
              await sendAudioToLongRecordingAPI(audioBlob);
              setHasRecorded(true);
            } else {
              await sendAudioToDirectAPI(audioBlob);
            }
            setRecordingState("idle");
          }, 1500);

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        };
        mediaRecorder.start();

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
        console.error("Failed to start recording:", error);
        const micErrorMessage =
          error?.name === "NotFoundError" || /No microphone/i.test(error?.message || "")
            ? "Microphone not found. Please connect/enable your microphone and retry."
            : error?.name === "NotAllowedError"
              ? "Microphone permission denied. Allow mic permission and retry."
              : `Failed to start recording: ${error?.message || "Unknown microphone error."}`;
        setChatMessages((prev) => [...prev, { type: "ai", content: micErrorMessage, timestamp: Date.now() }]);
        setRecording(false);
        setRecordingState("idle");
      }
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  };

  const handleImproperEnd = (message) => {
    stopTestTimer();
    cleanupMedia();
    exitFullscreen();
    setShowEndConfirm(false);
    setShowTestPopup(false);
    setResultType("failed");
    setResultMessage(message);
  };

  const handleCompletion = async () => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;
    stopTestTimer();
    cleanupMedia();
    exitFullscreen();
    const decremented = await decrementTestCount();
    setShowTestPopup(false);
    if (decremented) {
      setResultType("success");
      setResultMessage(`You have successfully completed ${testTitle} - ${actualTestLevel} level.`);
    } else {
      setResultType("failed");
      setResultMessage("Test was completed but count update failed. Please retry later.");
    }
  };

  const startTest = async () => {
    if (remainingTests <= 0) return;

    setShowStartInstruction(true);
  };

  const startTestAfterInstruction = async () => {
    setShowStartInstruction(false);
    await enterFullscreen();
    setIsFullscreen(Boolean(document.fullscreenElement));
    fullscreenWarningsRef.current = 0;
    fullscreenTerminationHandledRef.current = false;
    setFullscreenWarnings(0);
    completionHandledRef.current = false;
    setChatMessages([]);
    setHasRecorded(false);
    setClickedButtons(new Set());
    setResultType(null);
    setShowTestPopup(true);
    setTestTimeLeft(testDuration);

    testTimerRef.current = setInterval(() => {
      setTestTimeLeft((prev) => {
        if (prev <= 1) {
          handleImproperEnd("Test timed out before proper completion. No test was decremented.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    await sendMessage(autoStartMessage);
  };

  useEffect(() => {
    fetchUserData();
    fetchTestCounts();
  }, [fetchTestCounts, fetchUserData]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(
    () => () => {
      stopTestTimer();
      cleanupMedia();
      exitFullscreen();
    },
    []
  );

  useEffect(() => {
    if (!showTestPopup) return;

    const onFullscreenChange = () => {
      if (fullscreenTerminationHandledRef.current) return;
      const fullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(fullscreen);
      if (!fullscreen) {
        const nextWarnings = fullscreenWarningsRef.current + 1;
        fullscreenWarningsRef.current = nextWarnings;
        setFullscreenWarnings(nextWarnings);

        if (nextWarnings >= 3) {
          fullscreenTerminationHandledRef.current = true;
          stopTestTimer();
          cleanupMedia();
          exitFullscreen();
          setShowEndConfirm(false);
          setShowTestPopup(false);
          setResultType("failed");
          setResultMessage("Test ended due to multiple fullscreen violations. One test attempt has been deducted.");
          void decrementTestCount();
          return;
        }
        setShowFullscreenAlert(true);
      }
    };

    const onEscKey = (event) => {
      if (event.key === "Escape" && !document.fullscreenElement) {
        setShowFullscreenAlert(true);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onEscKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onEscKey);
    };
  }, [decrementTestCount, showTestPopup]);

  return (
    <div className="interview-theme min-h-screen bg-background" style={themeVars}>
      <TestNavBar
        testTitle={testTitle}
        actualTestLevel={actualTestLevel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigate={navigate}
        streakData={streakData}
        userType={userType}
        theme={theme}
        setTheme={setTheme}
        userEmail={userEmail}
      />

      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-10">
        {!showTestPopup && (
          <TestStartCard
            testTitle={testTitle}
            testDescription={testDescription}
            actualTestLevel={actualTestLevel}
            remainingTests={remainingTests}
            onStart={startTest}
          />
        )}
      </div>

      <TestSessionPopup
        open={showTestPopup}
        chatRef={chatRef}
        chatMessages={chatMessages}
        isLoading={isLoading}
        recordingState={recordingState}
        recording={recording}
        timeLeft={timeLeft}
        testType={testType}
        hasRecorded={hasRecorded}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onEndTest={() => setShowEndConfirm(true)}
        clickedButtons={clickedButtons}
        onMessageAction={(buttonId, value) => {
          setClickedButtons((prev) => new Set([...prev, buttonId]));
          if (value) sendMessage(value);
        }}
        sessionId={sessionId}
        actualTestLevel={actualTestLevel}
        onComplete={handleCompletion}
        onCompletionError={(msg) => {
          setResultType("failed");
          setResultMessage(msg || "Feedback submission failed. Test not decremented.");
        }}
        testTitle={testTitle}
        testTimeLeft={testTimeLeft}
        isFullscreen={isFullscreen}
      />

      {showStartInstruction && (
        <div className="fixed inset-0 z-[70] bg-foreground/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Before You Start</h3>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6">
              <li>• Fullscreen mode is required during the test.</li>
              <li>• Keep microphone ready before recording.</li>
              <li>• Complete all prompts to get final feedback.</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                onClick={() => setShowStartInstruction(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                onClick={startTestAfterInstruction}
              >
                Enter Fullscreen & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 z-[70] bg-foreground/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">End Test?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              If you end now, this attempt will be marked as not taken properly.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                onClick={() => setShowEndConfirm(false)}
              >
                Continue Test
              </button>
              <button
                className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                onClick={() =>
                  handleImproperEnd("Test not taken properly because it was ended manually. No decrement applied.")
                }
              >
                End Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {showFullscreenAlert && showTestPopup && (
        <div className="fixed inset-0 z-[75] bg-foreground/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-lg p-6 text-center">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Fullscreen Required</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Please return to fullscreen mode to continue this communication test.
            </p>
            <p className="text-xs text-muted-foreground mb-4">{`Warnings: ${fullscreenWarnings}/3`}</p>
            <button
              className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              onClick={async () => {
                setShowFullscreenAlert(false);
                await enterFullscreen();
                setIsFullscreen(Boolean(document.fullscreenElement));
              }}
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}

      <TestResultModal
        open={Boolean(resultType)}
        resultType={resultType}
        title={`${testTitle} - ${actualTestLevel} Level`}
        message={resultMessage}
        onClose={() => {
          setResultType(null);
          window.location.reload();
        }}
      />
    </div>
  );
}
