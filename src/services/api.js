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
    apiCall('/student-profile', 'submit_survey', surveyData)
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
  
  uploadRecording: (data, sessionId) => 
    apiCall('/communication-test', 'upload_recording', { data, sessionId }),
  
  getTranscript: (sessionId) => 
    apiCall('/communication-test', 'get_transcript', { sessionId }),
  
  decrement: (college_email, type, key) => 
    apiCall('/communication-test', 'decrement_test', { college_email, type, key })
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
  resultsAPI,
  platformAPI
};
