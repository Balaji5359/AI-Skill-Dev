export const getTestKey = (testType) => {
  if (testType === "pronunciation") return "pronu_test";
  if (testType === "listening") return "listen_test";
  if (testType === "situation") return "situation_test";
  return `${testType}_test`;
};

export const getPracticeKey = (testType) => {
  if (testType === "pronunciation") return "pronu_practice";
  if (testType === "listening") return "listen_practice";
  if (testType === "situation") return "situation_practice";
  return `${testType}_practice`;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const isCompletionResponse = (response = "") =>
  response.includes("ASSESSMENT REPORT") ||
  response.includes("FINAL SPEAKING ASSESSMENT REPORT") ||
  response.includes("COMPREHENSIVE LISTENING ASSESSMENT REPORT") ||
  response.includes("SITUATIONAL ASSESSMENT REPORT");
