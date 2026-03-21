// Detect final assessment report in AI response — triggers navigation to feedback page
export const isInterviewCompletionResponse = (response = "") => {
  if (!response) return false;
  return (
    response.includes("SELF-INTRODUCTION ASSESSMENT REPORT") ||
    response.includes("PROGRAMMING KNOWLEDGE ASSESSMENT REPORT") ||
    response.includes("DOMAIN KNOWLEDGE ASSESSMENT REPORT") ||
    response.includes("PROJECT DISCUSSION ASSESSMENT REPORT") ||
    response.includes("CAREER PLANNING ASSESSMENT REPORT") ||
    response.includes("HOBBIES & INTERESTS ASSESSMENT REPORT") ||
    response.includes("CERTIFICATIONS ASSESSMENT REPORT") ||
    response.includes("INTERVIEW ASSESSMENT REPORT") ||
    response.includes("ASSESSMENT REPORT") ||
    response.includes("INTERVIEW READINESS") ||
    response.includes("PLACEMENT EVALUATION")
  );
};

// Extract score from AI assessment report — handles all interview types
export const extractInterviewScore = (response = "") => {
  if (!response) return 0;

  // "Overall Score: 8.5 / 10" or "Overall Score: 8.5/10.0"
  const overall = response.match(/Overall Score:\s*(\d+\.?\d*)\s*\/\s*10(?:\.0)?/i);
  if (overall) return parseFloat(overall[1]);

  // "Final Score: 85 / 100"
  const finalHundred = response.match(/Final Score:\s*(\d+\.?\d*)\s*\/\s*100/i);
  if (finalHundred) return Number((parseFloat(finalHundred[1]) / 10).toFixed(1));

  // "Score: 8.5 / 10"
  const score = response.match(/Score:\s*(\d+\.?\d*)\s*\/\s*10(?:\.0)?/i);
  if (score) return parseFloat(score[1]);

  return 0;
};
