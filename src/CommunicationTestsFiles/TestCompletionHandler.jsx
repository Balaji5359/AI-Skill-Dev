import React, { useEffect, useRef, useState } from "react";
import { isCompletionResponse } from "./testUtils";
import { platformAPI, resultsAPI } from "../services/api";

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
        const payload = {
          college_email: email,
          test_type: testTypeMap[testType],
          test_level: testLevel,
          test_id: sessionId,
          final_score: extractScore(aiResponse),
          ai_feedback: aiResponse,
        };
        console.log("[test-completion:submit:start]", payload);

        const response = await resultsAPI.submitTest(payload);
        console.log("[test-completion:submit:response]", response);

        if (response.statusCode !== 200) {
          processedRef.current = false;
          throw new Error(response.message || response.error || "Feedback API failed");
        }

        const streakResponse = await platformAPI.updateStreak(email);
        console.log("[test-completion:streak:response]", streakResponse);

        if (streakResponse.statusCode !== 200) {
          console.warn("[test-completion:streak:nonfatal]", streakResponse);
        }

        if (onComplete) {
          await onComplete(aiResponse);
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
