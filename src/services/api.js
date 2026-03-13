// Centralized API Service for Consolidated Endpoints
const API_BASE = "https://ntjkr8rnd6.execute-api.ap-south-1.amazonaws.com/dev";

const TEST_CODE_MAP = {
  jam: "JAM",
  JAM: "JAM",
  pronunciation: "PRONUNCIATION",
  PRONUNCIATION: "PRONUNCIATION",
  listen: "LISTENING",
  listening: "LISTENING",
  LISTENING: "LISTENING",
  situation: "SITUATIONSPEAK",
  situational: "SITUATIONSPEAK",
  SITUATIONSPEAK: "SITUATIONSPEAK",
};

const apiCall = async (endpoint, action, data = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data })
  });
  
  const result = await response.json();
  
  // Lambda returns data directly (not wrapped in body)
  return { statusCode: response.status, ...result };
};

export const authAPI = {
  login: (college_email, password, college_name) => 
    apiCall('/student-auth', 'login', { college_email, password, college_name }),
  
  signup: (college_email, full_name, password, college_name) => 
    apiCall('/student-auth', 'signup', { college_email, full_name, password, college_name }),
  
  checkUsername: (username) => 
    apiCall('/student-auth', 'check_username', { username })
};

export const profileAPI = {
  create: (profileData) => 
    apiCall('/student-profile', 'create_profile', profileData),
  
  get: (college_email) => 
    apiCall('/student-profile', 'get_profile', { college_email }),
  
  submitSurvey: (surveyData) => 
    apiCall('/student-profile', 'submit_survey', surveyData),

  decrementInterviewCount: async (college_email, mode, interview_key) => {
    // This endpoint might need direct fetch without the apiCall wrapper
    try {
      const response = await fetch(`${API_BASE}/student-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decrement_interview_count',
          college_email,
          mode,
          interview_key
        })
      });
      
      const result = await response.json();
      return { statusCode: response.status, ...result };
    } catch (error) {
      console.error('Error in decrementInterviewCount:', error);
      return { statusCode: 400, error: error.message };
    }
  }
};

export const testAPI = {
  getIds: (college_email, test_type) => {
    const mapped = TEST_CODE_MAP[test_type] || test_type;
    return apiCall('/communication-test', 'get_test_ids', { college_email, test_type: mapped });
  },
  
  getData: (college_email, test_type, sessionId, role = 'student') => {
    const mapped = TEST_CODE_MAP[test_type] || test_type;
    return apiCall('/communication-test', 'get_test_data', { college_email, test_type: mapped, sessionId, role });
  },
  
  uploadRecording: (data, sessionId) => {
    const audioData =
      typeof data === 'string'
        ? data
        : data?.data;

    const resolvedSessionId =
      sessionId || data?.sessionId;

    return apiCall('/communication-test', 'upload_recording', {
      data: audioData,
      sessionId: resolvedSessionId
    });
  },
  
  getTranscript: (sessionId) => 
    apiCall('/communication-test', 'get_transcript', { sessionId }),
  
  decrement: (college_email, type, key) => 
    apiCall('/communication-test', 'decrement_test', { college_email, type, key })
};

export const speechToTextAPI = {
  transcribeShortAudio: async (data, sessionId, testType) => {
    const response = await fetch('https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/audiototranscript-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: JSON.stringify({
          data,
          sessionId,
          testType
        }),
        isBase64Encoded: false
      })
    });

    const result = await response.json();

    if (typeof result?.body === 'string') {
      try {
        return { statusCode: response.status, ...JSON.parse(result.body) };
      } catch {
        return { statusCode: response.status, body: result.body };
      }
    }

    return { statusCode: response.status, ...result };
  }
};

export const practiceVoiceAPI = {
  synthesize: async (text) => {
    const response = await fetch('https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/practice-text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const result = await response.json();

    if (typeof result?.body === 'string') {
      try {
        return { statusCode: response.status, ...JSON.parse(result.body) };
      } catch {
        return { statusCode: response.status, body: result.body };
      }
    }

    return { statusCode: response.status, ...result };
  }
};

export const resultsAPI = {
  submitTest: (resultData) => 
    apiCall('/communication-results', 'submit_test_result', resultData),
  
  getTest: (college_email) => 
    apiCall('/communication-results', 'get_test_results', { college_email }),
  
  submitPractice: (resultData) => 
    apiCall('/communication-results', 'submit_practice_result', resultData),
  
  getPractice: (college_email) => 
    apiCall('/communication-results', 'get_practice_results', { college_email })
};

export const interviewAPI = {
  sendMessage: async ({ interviewType, level, mode, sessionId, email, message }) => {
    const response = await fetch('https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/basic-interview-agent-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: {
          interviewType,
          level,
          mode,
          sessionId,
          email,
          message
        }
      })
    });

    const result = await response.json();

    // Response comes wrapped in body as JSON string
    if (typeof result?.body === 'string') {
      try {
        const parsedBody = JSON.parse(result.body);
        return { statusCode: response.status, ...parsedBody };
      } catch {
        return { statusCode: response.status, body: result.body };
      }
    }

    return { statusCode: response.status, ...result };
  }
};

export const interviewResultsAPI = {
  submitSession: (resultData) =>
    apiCall('/interview-results', 'submit_interview_result', resultData),

  getDashboard: (college_email, mode = 'all') =>
    apiCall('/interview-results', 'get_interview_results', { college_email, mode })
};

export const platformAPI = {
  updateStreak: (college_email, get_streak_data = false) => 
    apiCall('/platform', 'update_streak', { college_email, get_streak_data }),
  
  submitContact: (name, email, message) => 
    apiCall('/platform', 'contact_submission', { name, email, message })
};

export default {
  authAPI,
  profileAPI,
  testAPI,
  speechToTextAPI,
  practiceVoiceAPI,
  resultsAPI,
  interviewAPI,
  interviewResultsAPI,
  platformAPI
};
