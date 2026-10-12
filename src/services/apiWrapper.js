// API Wrapper - Handles updated backend endpoints with backward compatibility
import { authAPI, profileAPI, testAPI, resultsAPI, platformAPI, activityUsageAPI } from './api';

// Wrapper functions that match old API call patterns
export const apiWrapper = {
  // Profile APIs
  async getProfile(college_email) {
    const data = await profileAPI.get(college_email);
    // Return in old format for compatibility
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async createProfile(profileData) {
    const data = await profileAPI.create(profileData);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async submitSurvey(surveyData) {
    const data = await profileAPI.submitSurvey(surveyData);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  // Auth APIs
  async checkUsername(username) {
    const data = await authAPI.checkUsername(username);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async login(college_email, password, college_name) {
    const data = await authAPI.login(college_email, password, college_name);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async signup(college_email, full_name, password, college_name) {
    const data = await authAPI.signup(college_email, full_name, password, college_name);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  // Streak API
  async updateStreak(college_email, get_streak_data = false) {
    const data = await platformAPI.updateStreak(college_email, get_streak_data);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  // Test APIs
  async decrementTest(college_email, type, key) {
    const data = await testAPI.decrement(college_email, type, key);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async getTestResults(college_email) {
    const data = await resultsAPI.getTest(college_email);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async getPracticeResults(college_email) {
    const data = await resultsAPI.getPractice(college_email);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async submitTestResult(resultData) {
    const data = await resultsAPI.submitTest(resultData);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  async submitPracticeResult(resultData) {
    const data = await resultsAPI.submitPractice(resultData);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  // Activity Usage API
  async decrementActivity(college_email, mode, level, interview_key) {
    const data = await activityUsageAPI.decrement(college_email, mode, level, interview_key);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  },

  // Contact API
  async submitContact(name, email, message) {
    const data = await platformAPI.submitContact(name, email, message);
    return {
      statusCode: data.statusCode || 200,
      body: JSON.stringify(data)
    };
  }
};

export default apiWrapper;
