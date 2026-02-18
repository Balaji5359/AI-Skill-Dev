import React, { useEffect, useRef, useState } from "react";
import { isCompletionResponse } from "./testUtils";

const feedbackUrl = "https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/comm-test-feedback-update";
const streakUrl = "https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/update-user-streak";

const testTypeMap = {
  jam: "jam_test",
  pronunciation: "pronu_test",
  listening: "listen_test",
  situation: "situation_test",
  "image-speak": "image_speak",
};

const extractScore = (response = "") => {
  const jam = response.match(/JAM Score:\s*(\d+\.?\d*)\s*\/\s*10\.0/i);
  if (jam) return parseFloat(jam[1]);

  const speaking = response.match(/Final Speaking Score:\s*(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/i);
  if (speaking) return parseFloat(speaking[1]);

  const listening = response.match(/Final Listening Score:\s*(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/i);
  if (listening) return parseFloat(listening[1]);

  const situational = response.match(/Situational Score:\s*(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/i);
  if (situational) return parseFloat(situational[1]);

  return 0;
};

export default function TestCompletionHandler({ aiResponse, sessionId, testType, testLevel, onComplete, onError }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    if (!aiResponse || processedRef.current || !isCompletionResponse(aiResponse) || isProcessing) return;

    const submit = async () => {
      processedRef.current = true;
      setIsProcessing(true);
      try {
        const email = localStorage.getItem("email");
        const response = await fetch(feedbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            college_email: email,
            test_type: testTypeMap[testType],
            test_level: testLevel,
            test_id: sessionId,
            final_score: extractScore(aiResponse),
            ai_feedback: aiResponse,
          }),
        });

        if (!response.ok) {
          processedRef.current = false;
          throw new Error("Feedback API failed");
        }

        await fetch(streakUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: JSON.stringify({ college_email: email }) }),
        });

        if (onComplete) {
          await onComplete();
        }
      } catch (error) {
        console.error("Error submitting test results:", error);
        if (onError) onError("Feedback submission failed. Test not decremented.");
      } finally {
        setIsProcessing(false);
      }
    };

    submit();
  }, [aiResponse, isProcessing, onComplete, onError, sessionId, testLevel, testType]);

  return null;
}
