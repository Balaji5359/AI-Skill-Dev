import React, { useEffect, useRef, useState } from "react";
import { isCompletionResponse } from "../CommunicationTestsFiles/testUtils";
import { platformAPI, resultsAPI } from "../services/api";

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

export default function PracticeCompletionHandler({
  aiResponse,
  sessionId,
  practiceType,
  practiceLevel,
  onComplete,
  onError,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!aiResponse || processedRef.current || !isCompletionResponse(aiResponse) || isProcessing) return;

    const submit = async () => {
      processedRef.current = true;
      setIsProcessing(true);

      try {
        const email = localStorage.getItem("email");
        const payload = {
          college_email: email,
          test_type: practiceType,
          test_level: (practiceLevel || "basic").toLowerCase(),
          test_id: sessionId,
          final_score: extractScore(aiResponse),
          ai_feedback: aiResponse,
        };

        console.log("[practice-completion:submit:start]", payload);
        const response = await resultsAPI.submitPractice(payload);
        console.log("[practice-completion:submit:response]", response);

        if (response.statusCode !== 200) {
          processedRef.current = false;
          throw new Error(response.message || response.error || "Practice feedback API failed");
        }

        const streakResponse = await platformAPI.updateStreak(email);
        console.log("[practice-completion:streak:response]", streakResponse);

        if (streakResponse.statusCode !== 200) {
          console.warn("[practice-completion:streak:nonfatal]", streakResponse);
        }

        if (onCompleteRef.current) {
          await onCompleteRef.current(aiResponse);
        }
      } catch (error) {
        console.error("Error submitting practice results:", error);
        if (onErrorRef.current) onErrorRef.current("Feedback submission failed. Practice count not decremented.");
      } finally {
        setIsProcessing(false);
      }
    };

    submit();
  }, [aiResponse, isProcessing, practiceLevel, practiceType, sessionId]);

  return null;
}
