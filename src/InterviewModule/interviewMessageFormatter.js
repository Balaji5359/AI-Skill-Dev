/**
 * Interview Message Formatter
 * Handles level-specific UI rendering and message formatting
 * Based on Self-Introduction Interview Agent Instructions
 */

export const formatInterviewMessage = (message, interviewLevel) => {
  if (!message) return message;

  const level = String(interviewLevel).toLowerCase();

  // Parse greeting and button selection
  if (message.includes("Click 'yes' or 'no'")) {
    return {
      type: 'greeting',
      text: message.replace(/Click 'yes' or 'no'\.?/gi, '').trim(),
      buttons: [
        { label: 'Yes', value: 'yes', style: 'primary' },
        { label: 'No', value: 'no', style: 'secondary' }
      ]
    };
  }

  // Parse level selection (1, 2, 3)
  if (message.includes("Click '1'") || message.includes("Click '2'") || message.includes("Click '3'")) {
    return {
      type: 'levelSelection',
      text: message.replace(/Click '[1-3]'[^.]*\./g, '').trim(),
      buttons: [
        { label: 'Basic', value: '1', style: 'primary', description: '30-45 seconds' },
        { label: 'Medium', value: '2', style: 'secondary', description: '60-90 seconds' },
        { label: 'Advanced', value: '3', style: 'tertiary', description: '90-120 seconds' }
      ]
    };
  }

  // Parse assessment instructions based on level
  if (message.includes('Assessment Level:') || message.includes('ASSESSMENT LEVEL:')) {
    return {
      type: 'instructions',
      text: message,
      level: level
    };
  }

  // Parse assessment report (with detailed formatting)
  if (message.includes('SELF-INTRODUCTION ASSESSMENT REPORT') || message.includes('ASSESSMENT REPORT')) {
    return {
      type: 'assessmentReport',
      text: message,
      level: level,
      formatted: formatAssessmentReport(message)
    };
  }

  // Parse level-specific instruction messages
  if (message.includes('Begin when ready') || message.includes('Begin your introduction')) {
    return {
      type: 'readyPrompt',
      text: message,
      level: level,
      button: { label: 'Start Recording', value: 'record', style: 'primary' }
    };
  }

  // Parse next/done button prompts
  if (message.includes("Click 'next'") || message.includes("'next'")) {
    return {
      type: 'nextPrompt',
      text: message.replace(/Click 'next'\.?/gi, '').trim(),
      buttons: [
        { label: 'Next Question', value: 'next', style: 'primary' }
      ]
    };
  }

  if (message.includes("Click 'done'") || message.includes("'done'")) {
    return {
      type: 'donePrompt',
      text: message.replace(/Click 'done'\.?/gi, '').trim(),
      buttons: [
        { label: 'Complete Interview', value: 'done', style: 'primary' }
      ]
    };
  }

  // Default plain message
  return {
    type: 'plain',
    text: message
  };
};

/**
 * Format assessment report with proper structure
 */
export const formatAssessmentReport = (reportText) => {
  const sections = {
    level: extractSection(reportText, 'LEVEL:'),
    impression: extractSection(reportText, 'FIRST IMPRESSION ANALYSIS:'),
    overallScore: extractScore(reportText),
    evaluation: extractEvaluationSection(reportText),
    contentAnalysis: extractContentAnalysis(reportText),
    development: extractDevelopmentPoints(reportText),
    readiness: extractSection(reportText, 'INTERVIEW READINESS:')
  };

  return sections;
};

/**
 * Extract a text section from report
 */
const extractSection = (text, sectionName) => {
  const regex = new RegExp(`${sectionName}\\s*([^\\n]*(?:\\n(?!^[A-Z\\-]+:)[^\\n]*)*)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};

/**
 * Extract overall score
 */
const extractScore = (text) => {
  const scoreMatch = text.match(/Overall Score:\s*([0-9.]+)\s*\/\s*10/i);
  return scoreMatch ? parseFloat(scoreMatch[1]) : null;
};

/**
 * Extract evaluation details
 */
const extractEvaluationSection = (text) => {
  const evaluation = {};
  const metrics = [
    'Content Completeness',
    'Professional Presence',
    'Structure & Flow',
    'Clarity & Articulation',
    'Relevance & Focus',
    'Time Management',
    'Memorable Impact'
  ];

  metrics.forEach(metric => {
    const regex = new RegExp(`${metric}:\\s*([^—\\n]*[^\\n]*)`);
    const match = text.match(regex);
    if (match) {
      evaluation[metric] = match[1].trim();
    }
  });

  return evaluation;
};

/**
 * Extract content analysis points
 */
const extractContentAnalysis = (text) => {
  const analysis = {};
  const items = [
    'Educational Background',
    'Skills Presentation',
    'Experience/Achievements',
    'Career Goals',
    'Unique Value'
  ];

  items.forEach(item => {
    const regex = new RegExp(`${item}:\\s*([^—\\n]*[^\\n]*)`);
    const match = text.match(regex);
    if (match) {
      analysis[item] = match[1].trim();
    }
  });

  return analysis;
};

/**
 * Extract development recommendations
 */
const extractDevelopmentPoints = (text) => {
  const points = [];
  const devSection = text.match(/PROFESSIONAL DEVELOPMENT:([\s\S]*?)(?:INTERVIEW READINESS:|$)/i);
  
  if (devSection) {
    const items = devSection[1].match(/\d+\.\s*([^\n]+)/g);
    if (items) {
      items.forEach(item => {
        points.push(item.replace(/^\d+\.\s*/, '').trim());
      });
    }
  }

  return points;
};

/**
 * Get level-specific greeting
 */
export const getLevelGreeting = (level) => {
  const greetings = {
    basic: "Great! Let's start with a Basic-level introduction (30-45 seconds). Cover your name, education, key skills, and career interests. Begin when ready!",
    medium: "Perfect! Let's move to the Medium level (60-90 seconds). Include your name, education, relevant experience, key skills, an achievement, and career goals. Begin when ready!",
    advanced: "Excellent! Now the Advanced level (90-120 seconds). Deliver an executive-level introduction with your professional identity, comprehensive experience, significant achievements, leadership qualities, and strategic vision. Begin when ready!"
  };

  return greetings[String(level).toLowerCase()] || greetings.basic;
};

/**
 * Format a plain message with proper spacing
 */
export const formatPlainMessage = (text) => {
  if (!text) return text;

  // Add line breaks for better readability
  return text
    .replace(/\n\n+/g, '\n\n')  // Normalize multiple line breaks
    .trim();
};

/**
 * Check if message contains specific prompt type
 */
export const getPromptType = (message) => {
  if (!message) return 'plain';
  
  if (message.includes("Click 'yes' or 'no'")) return 'yesno';
  if (message.includes("Click '1'") || message.includes("Click '2'") || message.includes("Click '3'")) return 'levelselection';
  if (message.includes('ASSESSMENT REPORT')) return 'assessmentreport';
  if (message.includes("Click 'next'")) return 'next';
  if (message.includes("Click 'done'")) return 'done';
  if (message.includes('Begin when ready') || message.includes('Begin your')) return 'readyprompt';
  
  return 'plain';
};
