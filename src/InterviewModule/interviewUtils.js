export const isInterviewCompletionResponse = (response = "") =>
  response.includes("ASSESSMENT REPORT") ||
  response.includes("INTERVIEW READINESS") ||
  response.includes("TECHNICAL READINESS") ||
  response.includes("DOMAIN READINESS") ||
  response.includes("PROJECT READINESS") ||
  response.includes("CAREER READINESS") ||
  response.includes("CULTURAL FIT ASSESSMENT") ||
  response.includes("LEARNING READINESS");

export const extractInterviewScore = (response = "") => {
  const match = response.match(/Overall Score:\s*(\d+\.?\d*)\s*\/\s*10(?:\.0)?/i);
  if (match) {
    return parseFloat(match[1]);
  }

  const finalMatch = response.match(/Final Score:\s*(\d+\.?\d*)\s*\/\s*100/i);
  if (finalMatch) {
    return Number((parseFloat(finalMatch[1]) / 10).toFixed(1));
  }

  return 0;
};
