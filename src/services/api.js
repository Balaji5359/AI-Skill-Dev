// Centralized API Service for Updated Backend Endpoints (env-driven)
const {
  VITE_STUDENT_AUTH_API,
  VITE_STUDENT_PROFILE_API,
  VITE_USAGE_API,
  VITE_COMM_TEST_API,
  VITE_COMM_RESULTS_API,
  VITE_COMM_TEST_AGENT_API,
  VITE_COMM_PRACTICE_AGENT_API,
  VITE_BASIC_INTERVIEW_AGENT_API,
  VITE_INTERVIEW_RESULTS_API,
  VITE_AUDIO_TRANSCRIPT_API,
  VITE_PRACTICE_TTS_API,
  VITE_PLATFORM_API,
  VITE_PLATFORM_ENABLED
} = import.meta.env;

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

const apiCall = async (url, action, data = {}) => {
  if (!url) {
    console.error("API url missing for action", action);
    return { statusCode: 500, error: "API url missing. Check .env VITE_* values." };
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    });

    const result = await response.json();

    // Lambda returns data directly (not wrapped in body)
    return { statusCode: response.status, ...result };
  } catch (error) {
    return { statusCode: 500, error: error.message };
  }
};

export const authAPI = {
  login: (college_email, password) =>
    apiCall(VITE_STUDENT_AUTH_API, 'login', { college_email, password }),

  signup: (college_email, full_name, password, college_name) =>
    apiCall(VITE_STUDENT_AUTH_API, 'signup', { college_email, full_name, password, college_name }),

  checkUsername: (username) =>
    apiCall(VITE_STUDENT_AUTH_API, 'check_username', { username })
};

export const profileAPI = {
  create: (profileData) =>
    apiCall(VITE_STUDENT_PROFILE_API, 'create_profile', profileData),

  get: async (college_email, type = null, usage_type = null, key = null) => {
    try {
      // For usage requests, skip the filtered API call and go directly to full profile
      // since the backend doesn't seem to support filtered requests yet
      if (type === 'usage') {
        const fullProfileResult = await apiCall(VITE_STUDENT_PROFILE_API, 'get_profile', { college_email });
        
        if (fullProfileResult.statusCode === 200 && fullProfileResult.usage_info) {
          // If a specific key is requested, return just that value
          if (key) {
            if (usage_type === 'communication_tests' && fullProfileResult.usage_info.communication_tests) {
              const value = fullProfileResult.usage_info.communication_tests[key];
              return {
                statusCode: 200,
                [key]: value !== undefined ? value : 0
              };
            } else if (usage_type === 'communication_practices' && fullProfileResult.usage_info.communication_practices) {
              const value = fullProfileResult.usage_info.communication_practices[key];
              return {
                statusCode: 200,
                [key]: value !== undefined ? value : 0
              };
            } else if (usage_type === 'interview_tests' && fullProfileResult.usage_info.basic_interview_tests) {
              const value = fullProfileResult.usage_info.basic_interview_tests[key];
              return {
                statusCode: 200,
                [key]: value !== undefined ? value : 0
              };
            } else if (usage_type === 'interview_practices' && fullProfileResult.usage_info.basic_interview_practices) {
              const value = fullProfileResult.usage_info.basic_interview_practices[key];
              return {
                statusCode: 200,
                [key]: value !== undefined ? value : 0
              };
            }
          }
          
          // Extract the specific usage data from the full profile
          if (usage_type === 'communication_tests' && fullProfileResult.usage_info.communication_tests) {
            return {
              statusCode: 200,
              ...fullProfileResult.usage_info.communication_tests
            };
          } else if (usage_type === 'communication_practices' && fullProfileResult.usage_info.communication_practices) {
            return {
              statusCode: 200,
              ...fullProfileResult.usage_info.communication_practices
            };
          } else if (usage_type === 'interview_tests' && fullProfileResult.usage_info.basic_interview_tests) {
            return {
              statusCode: 200,
              ...fullProfileResult.usage_info.basic_interview_tests
            };
          } else if (usage_type === 'interview_practices' && fullProfileResult.usage_info.basic_interview_practices) {
            return {
              statusCode: 200,
              ...fullProfileResult.usage_info.basic_interview_practices
            };
          }
        }
        
        // If extraction fails, return default values
        if (usage_type === 'communication_tests') {
          return {
            statusCode: 200,
            jam_test: 2,
            pronu_test: 2,
            listen_test: 2,
            situation_test: 2,
            image_speak: 2
          };
        } else if (usage_type === 'communication_practices') {
          return {
            statusCode: 200,
            jam_practice: 5,
            pronu_practice: 5,
            listen_practice: 5,
            situation_practice: 5,
            image_speak_practice: 5
          };
        } else if (usage_type === 'interview_tests') {
          return {
            statusCode: 200,
            self_introduction_test: 3,
            programming_knowledge_test: 3,
            worked_domain_test: 3,
            project_discussion_test: 3,
            future_career_planning_test: 3,
            hobbies_interests_test: 3,
            internship_review_test: 3
          };
        } else if (usage_type === 'interview_practices') {
          return {
            statusCode: 200,
            self_introduction_practice: 10,
            programming_knowledge_practice: 10,
            worked_domain_practice: 10,
            project_discussion_practice: 10,
            future_career_planning_practice: 10,
            hobbies_interests_practice: 10,
            internship_review_practice: 10
          };
        }
      }

      // For non-usage requests, try the filtered API call first
      const params = { college_email };
      if (type) params.type = type;
      if (usage_type) params.usage_type = usage_type;
      if (key) params.key = key;

      const result = await apiCall(VITE_STUDENT_PROFILE_API, 'get_profile', params);

      if (result.statusCode === 200) {
        const personal = result.personal_info || {};
        const userInfo = result.user_info || {};
        return {
          ...result,
          full_name: personal.full_name,
          user_type: userInfo.user_type || result.user_type,
          premium_status: userInfo.premium_status || result.premium_status,
          active_dates: userInfo.active_dates || [],
          last_active_date: userInfo.last_active_date,
          streak: userInfo.streak || {}
        };
      }

      // If filtered request fails, try basic profile request as fallback
      const fallbackResult = await apiCall(VITE_STUDENT_PROFILE_API, 'get_profile', { college_email });

      if (fallbackResult.statusCode === 200) {
        // For full profile requests, restructure the data to match expected format
        const restructuredResult = {
          statusCode: 200,
          college_email: college_email,
          full_name: fallbackResult.personal_info?.full_name || "Student",
          user_type: fallbackResult.personal_info?.user_type || "free",
          premium_status: fallbackResult.personal_info?.premium_status || "inactive",
          college_name: fallbackResult.college_name || fallbackResult.academic_info?.college_name,
          is_registered: fallbackResult.is_registered,

          // Add usage data in the old expected format for backward compatibility
          tests: fallbackResult.usage_info?.communication_tests || {},
          practices: fallbackResult.usage_info?.communication_practices || {},
          basic_interviews_tests: fallbackResult.usage_info?.basic_interview_tests || {},
          basic_interviews_practices: fallbackResult.usage_info?.basic_interview_practices || {},
          advanced_interviews_tests: fallbackResult.usage_info?.advanced_interview_tests || {},
          advanced_interviews_practices: fallbackResult.usage_info?.advanced_interview_practices || {},

          // Include all original data
          personal_info: fallbackResult.personal_info,
          academic_info: fallbackResult.academic_info,
          usage_info: fallbackResult.usage_info
        };

        return restructuredResult;
      }

      // Default full profile if all fails
      return {
        statusCode: 200,
        full_name: "Student",
        user_type: "free",
        premium_status: "inactive",
        college_email: college_email
      };

    } catch (error) {
      // Return default values on error
      if (type === 'usage') {
        if (usage_type === 'communication_tests') {
          return {
            statusCode: 200,
            jam_test: 2,
            pronu_test: 2,
            listen_test: 2,
            situation_test: 2,
            image_speak: 2
          };
        } else if (usage_type === 'communication_practices') {
          return {
            statusCode: 200,
            jam_practice: 5,
            pronu_practice: 5,
            listen_practice: 5,
            situation_practice: 5,
            image_speak_practice: 5
          };
        } else if (usage_type === 'interview_tests') {
          return {
            statusCode: 200,
            self_introduction_test: 3,
            programming_knowledge_test: 3,
            worked_domain_test: 3,
            project_discussion_test: 3,
            future_career_planning_test: 3,
            hobbies_interests_test: 3,
            internship_review_test: 3
          };
        } else if (usage_type === 'interview_practices') {
          return {
            statusCode: 200,
            self_introduction_practice: 10,
            programming_knowledge_practice: 10,
            worked_domain_practice: 10,
            project_discussion_practice: 10,
            future_career_planning_practice: 10,
            hobbies_interests_practice: 10,
            internship_review_practice: 10
          };
        }
      }

      return {
        statusCode: 200,
        full_name: "Student",
        user_type: "free",
        premium_status: "inactive",
        college_email: college_email
      };
    }
  },

  submitSurvey: async (surveyData) => {
    try {
      const result = await apiCall(VITE_STUDENT_PROFILE_API, 'survey', surveyData);

      if (result.statusCode >= 400) {
        return await apiCall(VITE_STUDENT_PROFILE_API, 'submit_survey', surveyData);
      }

      return result;
    } catch (error) {
      try {
        return await apiCall(VITE_STUDENT_PROFILE_API, 'submit_survey', surveyData);
      } catch (fallbackError) {
        return { statusCode: 500, error: fallbackError.message };
      }
    }
  }
};

export const testAPI = {
  getIds: (college_email, test_type) => {
    const mapped = TEST_CODE_MAP[test_type] || test_type;
    return apiCall(VITE_COMM_TEST_API, 'get_test_ids', { college_email, test_type: mapped });
  },

  getData: (college_email, test_type, sessionId, role = 'student') => {
    const mapped = TEST_CODE_MAP[test_type] || test_type;
    return apiCall(VITE_COMM_TEST_API, 'get_test_data', { college_email, test_type: mapped, sessionId, role });
  },

  uploadRecording: (data, sessionId) => {
    const audioData =
      typeof data === 'string'
        ? data
        : data?.data;

    const resolvedSessionId =
      sessionId || data?.sessionId;

    return apiCall(VITE_COMM_TEST_API, 'upload_recording', {
      data: audioData,
      sessionId: resolvedSessionId
    });
  },

  getTranscript: (sessionId) =>
    apiCall(VITE_COMM_TEST_API, 'get_transcript', { sessionId })
};

export const speechToTextAPI = {
  transcribeShortAudio: async (data, sessionId, testType) => {
    const response = await fetch(VITE_AUDIO_TRANSCRIPT_API, {
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
    const response = await fetch(VITE_PRACTICE_TTS_API, {
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
    apiCall(VITE_COMM_RESULTS_API, 'submit_test_result', resultData),

  getTest: (college_email) =>
    apiCall(VITE_COMM_RESULTS_API, 'get_test_results', { college_email }),

  submitPractice: (resultData) =>
    apiCall(VITE_COMM_RESULTS_API, 'submit_practice_result', resultData),

  getPractice: (college_email) =>
    apiCall(VITE_COMM_RESULTS_API, 'get_practice_results', { college_email })
};

export const interviewAPI = {
  sendMessage: async ({ interviewType, level, mode, sessionId, email, message }) => {
    const response = await fetch(VITE_BASIC_INTERVIEW_AGENT_API, {
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
    apiCall(VITE_INTERVIEW_RESULTS_API, 'submit_interview_result', resultData),

  getDashboard: (college_email, mode = 'all') =>
    apiCall(VITE_INTERVIEW_RESULTS_API, 'get_interview_results', { college_email, mode })
};

export const activityUsageAPI = {
  decrement: async (college_email, mode, level, interview_key) => {
    try {
      return await apiCall(VITE_USAGE_API, 'decrement', { college_email, mode, level, interview_key });
    } catch (error) {
      console.error('Activity usage API error:', error);
      return { statusCode: 500, error: error.message };
    }
  },
  getRemaining: async (college_email, mode, level, interview_key) => {
    try {
      return await apiCall(VITE_USAGE_API, 'get_remaining', { college_email, mode, level, interview_key });
    } catch (error) {
      console.error('Activity usage API error:', error);
      return { statusCode: 500, error: error.message };
    }
  }
};

const platformAvailableInitial = VITE_PLATFORM_ENABLED === "true" && !!VITE_PLATFORM_API;
let platformAvailable = platformAvailableInitial;

export const platformAPI = {
  updateStreak: async (college_email, get_streak_data = false) => {
    // If platform endpoint is missing or previously 404'd, short-circuit to defaults to avoid console spam
    if (!VITE_PLATFORM_API || !platformAvailable) {
      return { statusCode: 200, current_streak: 0, longest_streak: 0, last_active_date: null, active_dates: [] };
    }
    try {
      const res = await apiCall(VITE_PLATFORM_API, 'update_streak', { college_email, get_streak_data });
      if (res.statusCode === 404) {
        platformAvailable = false;
        return { statusCode: 200, current_streak: 0, longest_streak: 0, last_active_date: null, active_dates: [] };
      }
      return res;
    } catch (error) {
      platformAvailable = false;
      return { statusCode: 200, current_streak: 0, longest_streak: 0, last_active_date: null, active_dates: [] };
    }
  },

  submitContact: (name, email, message) => {
    if (!VITE_PLATFORM_API || !platformAvailable) {
      return Promise.resolve({ statusCode: 200, message: "contact buffered (platform disabled)" });
    }
    return apiCall(VITE_PLATFORM_API, 'contact_submission', { name, email, message });
  }
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
  activityUsageAPI,
  platformAPI
};
