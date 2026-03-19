import React, { useState, useEffect } from 'react';
import './ProfileCreation.css';
import { authAPI, profileAPI } from '../../services/api';

const ProfileCreation = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    collegeEmail: '',
    personalEmail: '',
    mobileNumber: '',
    profilePicture: null,
    collegeName: '',
    rollNumber: '',
    branch: '',
    year: '',
    sem: '',
    program: '',
    section: '',
    englishLevel: '',
    timeAvailable: '',
    communicationGoals: [],
    otherGoals: '',
    speakingLevel: '',
    speakingFrequency: '',
    notSpeakingReasons: [],
    otherReasons: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated/profile completed
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const isProfileCompleted = localStorage.getItem('profileCompleted') === 'true';

    if (token && isProfileCompleted) {
      // User is already authenticated and profile is completed, redirect to dashboard or home
      window.location.href = '/signup'; // or wherever authenticated users should go
      return;
    }

    // if (!token) {
    //   // User is not authenticated, redirect to login/signup
    //   window.location.href = '/signup';
    //   return;
    // }

    // Get data from localStorage after signup
    const email = localStorage.getItem('email');
    const fullName = localStorage.getItem('fullName') || localStorage.getItem('name');

    if (email) {
      // Extract roll number (first 10 characters of email)
      const rollNumber = email.substring(0, 10);

      setFormData(prev => ({
        ...prev,
        collegeEmail: email,
        fullName: fullName || '',
        rollNumber: rollNumber,
        collegeName: 'MITS University' // Default college name
      }));
    }
  }, []);

  const [currentSection, setCurrentSection] = useState(0);
  const [currentSurveyCard, setCurrentSurveyCard] = useState(0);
  const [profilePreview, setProfilePreview] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => {
        const currentValues = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...currentValues, value] };
        } else {
          return { ...prev, [name]: currentValues.filter(item => item !== value) };
        }
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const sections = ['Personal Information', 'Academic Information', 'Communication Survey'];

  const validateSection = (sectionIndex) => {
    const errors = [];

    if (sectionIndex === 0) {
      // Personal Information validation
      if (!formData.dateOfBirth) errors.push('Date of Birth is required');
      if (!formData.gender) errors.push('Gender is required');
    } else if (sectionIndex === 1) {
      // Academic Information validation
      if (!formData.program) errors.push('Program is required');
      if (!formData.branch) errors.push('Branch is required');
      if (!formData.year) errors.push('Year is required');
      if (!formData.sem) errors.push('Semester is required');
      if (!formData.section) errors.push('Section is required');
    } else if (sectionIndex === 2) {
      // Survey validation - check all required survey fields
      if (!formData.englishLevel) errors.push('English proficiency level is required');
      if (!formData.communicationGoals || formData.communicationGoals.length === 0) errors.push('Communication goals are required');
      if (formData.communicationGoals.includes('public speaking') && !formData.otherGoals.trim()) {
        errors.push('Please specify your public speaking goals');
      }
      if (!formData.speakingLevel) errors.push('Present level of English speaking is required');
      if (!formData.timeAvailable) errors.push('Time available for improvement is required');
      if (!formData.speakingFrequency) errors.push('Speaking frequency is required');
      if (formData.speakingFrequency === 'no' && (!formData.notSpeakingReasons || formData.notSpeakingReasons.length === 0)) {
        errors.push('Please select a reason for not speaking English regularly');
      }
      if (formData.notSpeakingReasons.includes('Other reasons (please specify)') && !formData.otherReasons.trim()) {
        errors.push('Please specify the other reason');
      }
    }

    return errors;
  };

  const nextSurveyCard = () => {
    // Validate current question before moving to next
    const currentQuestion = surveyQuestions[currentSurveyCard];
    const currentValue = formData[currentQuestion.id];

    if (!currentValue || (Array.isArray(currentValue) && currentValue.length === 0)) {
      setError(`Please answer: ${currentQuestion.title}`);
      return;
    }

    // Check conditional validations
    if (currentQuestion.id === 'communicationGoals' && currentValue.includes('public speaking') && !formData.otherGoals.trim()) {
      setError('Please specify your public speaking goals');
      return;
    }

    if (currentQuestion.id === 'speakingFrequency' && currentValue === 'no' && (!formData.notSpeakingReasons || formData.notSpeakingReasons.length === 0)) {
      setError('Please select a reason for not speaking English regularly');
      return;
    }

    if (formData.notSpeakingReasons?.includes('Other reasons (please specify)') && !formData.otherReasons.trim()) {
      setError('Please specify the other reason');
      return;
    }

    setError(''); // Clear errors
    if (currentSurveyCard < surveyQuestions.length - 1) {
      setCurrentSurveyCard(prev => prev + 1);
    }
  };

  const prevSurveyCard = () => {
    setError(''); // Clear errors when going back
    if (currentSurveyCard > 0) {
      setCurrentSurveyCard(prev => prev - 1);
    }
  };

  const nextSection = () => {
    const errors = validateSection(currentSection);
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    setError(''); // Clear any previous errors
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      if (currentSection + 1 === 2) setCurrentSurveyCard(0);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const createProfile = async () => {
    try {
      const profileData = {
        college_email: formData.collegeEmail,
        full_name: formData.fullName,
        college_name: formData.collegeName,
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
        date_of_birth: formData.dateOfBirth,
        program: formData.program || 'B.Tech',
        branch: formData.branch,
        section: formData.section || 'A',
        year: formData.year,
        sem: formData.sem
      };

      const response = await profileAPI.create(profileData);
      return response;
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  };

  const submitSurvey = async () => {
    try {
      const surveyData = {
        action: 'survey',
        college_email: formData.collegeEmail,
        English_Proficiency_Level: formData.englishLevel,
        Communication_Goal: formData.communicationGoals.length > 0 ? formData.communicationGoals.join(', ') : 'Fluency',
        Present_Level_of_English_Speaking: formData.speakingLevel || formData.englishLevel,
        Time_Spent_to_Improve_Communication: formData.timeAvailable === '1-2 hours' ? '1 hour' : formData.timeAvailable,
        Speaking_in_English_Regularly: formData.speakingFrequency === 'no' ? 'No' : 'Yes',
        Reason_Why_not_Speaking_English: formData.speakingFrequency === 'no' ? (formData.notSpeakingReasons.length > 0 ? formData.notSpeakingReasons.join(', ') : (formData.otherReasons || 'Confidence issue')) : 'N/A'
      };

      const response = await profileAPI.submitSurvey(surveyData);
      return response;
    } catch (error) {
      console.error('Survey submission error:', error);
      throw error;
    }
  };

  // Removed handleAutoSubmit function as auto-submit is no longer used

  const submitProfile = async () => {
    setLoading(true);
    setError('');

    try {
      // Create profile first
      await createProfile();

      // Then submit survey
      await submitSurvey();

      // Mark profile as completed in localStorage
      localStorage.setItem('profileCompleted', 'true');

      setIsCompleted(true);

      // Navigate to dashboard or home after success (not back to signup)
      setTimeout(() => {
        window.location.href = '/signup'; // or wherever users should go after profile completion
      }, 3000);

    } catch (error) {
      setError('Failed to complete profile. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all sections before submitting
    for (let i = 0; i < sections.length; i++) {
      const errors = validateSection(i);
      if (errors.length > 0) {
        setError(`Please complete all required fields in ${sections[i]}. ${errors.join('. ')}`);
        setCurrentSection(i);
        if (i === 2) setCurrentSurveyCard(0);
        return;
      }
    }

    setError(''); // Clear any previous errors
    await submitProfile();
  };
  const surveyQuestions = [
    {
      id: 'englishLevel',
      title: "What is your current English proficiency level?",
      options: [
        {
          value: 'Beginner',
          label: (<><strong>Beginner</strong> — I am just starting and need support with basic speaking.</>)
        },
        {
          value: 'Intermediate',
          label: (<><strong>Intermediate</strong> — I can communicate, but I want to improve accuracy and confidence.</>)
        },
        {
          value: 'Advanced',
          label: (<><strong>Advanced</strong> — I can speak fluently and confidently in most situations.</>)
        }
      ]
    },
    {
      id: 'communicationGoals',
      title: 'What are your communication goals?',
      options: [
        { value: 'Improve overall English communication skills', label: 'Improve overall English communication skills' },
        { value: 'public speaking', label: 'Public speaking and presentation skills' }, // value kept lowercase to match existing check
        { value: 'Interview preparation', label: 'Interview preparation' },
        { value: 'Confidence building in speaking English', label: 'Confidence building in speaking English' },
        { value: 'Improve grammar and sentence formation', label: 'Improve grammar and sentence formation' },
        { value: 'Enhance pronunciation and clarity', label: 'Enhance pronunciation and clarity' }
      ]
    },
    {
      id: 'speakingLevel',
      title: 'What is your current level of English speaking ability?',
      options: [
        { value: 'Beginner - I am not able to speak in English due to grammar difficulties.', label: (<><strong>Beginner</strong> - I am not able to speak in English due to grammar difficulties.</>) },
        { value: 'Low Confidence - I understand English but hesitate to speak because of low confidence.', label: (<><strong>Low Confidence</strong> - I understand English but hesitate to speak because of low confidence.</>) },
        { value: 'Very Limited - I find it difficult to speak and often feel shy or nervous.', label: (<><strong>Very Limited</strong> - I find it difficult to speak and often feel shy or nervous.</>) },
        { value: 'Basic Speaker - I can manage basic conversations, but I make frequent grammar mistakes.', label: (<><strong>Basic Speaker</strong> - I can manage basic conversations, but I make frequent grammar mistakes.</>) },
        { value: 'Moderate Speaker - I can communicate reasonably well, but my confidence is low.', label: (<><strong>Moderate Speaker</strong> - I can communicate reasonably well, but my confidence is low.</>) },
        { value: 'Comfortable but Hesitant - I can speak English, but I still feel shy or uncomfortable in some situations.', label: (<><strong>Comfortable but Hesitant</strong> - I can speak English, but I still feel shy or uncomfortable in some situations.</>) },
        { value: 'Fluent Speaker - I can speak English fluently and confidently.', label: (<><strong>Fluent Speaker</strong> - I can speak English fluently and confidently.</>) }
      ]
    },
    {
      id: 'timeAvailable',
      title: 'How much time do you currently spend each day improving your English?',
      options: ['Not spending any time', 'Less than 30 minutes per Day', 'About 30 minutes per Day', 'More than 30 minutes per Day (up to 1 hour)', '1-2 hours per Day', 'More than 2 hours per Day']
    },
    {
      id: 'speakingFrequency',
      title: 'Do you practice English speaking every day?',
      options: ['yes', 'no']
    }
  ];

  return (
    <>
      <div className="profile-creation-container">

        <div className="profile-layout">
          <div className="form-main">
            <div className="progress-header">
              <h1>Complete Your Profile</h1>
              <p className="subtitle">Help us personalize your learning journey</p>
              <div className="progress-bar">
                {sections.map((section, index) => (
                  <div key={index} className={`progress-step ${index <= currentSection ? 'active' : ''}`}>
                    <span className="step-number">{index + 1}</span>
                    <span className="step-label">{section}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {currentSection === 0 && (
                <div className="form-section">
                  <div className="section-card">
                    <h2>Personal Information</h2>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Full Name *</label>
                        <p style={{ fontSize: '12px' }}>Auto captured from Signup</p>
                        <input type="text" name="fullName" value={formData.fullName || ''} readOnly className="readonly-field" placeholder="Full name will be loaded from signup" required />
                      </div>
                      <div className="input-group">
                        <label>Date of Birth *</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                      </div>
                      <div className="input-group">
                        <label>Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>College Email ID *</label>
                        <input type="email" name="collegeEmail" value={formData.collegeEmail} readOnly className="readonly-field" required />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 1 && (
                <div className="form-section">
                  <div className="section-card">
                    <h2>Academic Information</h2>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>College Name *</label>
                        <input type="text" name="collegeName" value={formData.collegeName} readOnly className="readonly-field" required />
                      </div>
                      <div className="input-group">
                        <label>College Roll Number *</label>
                        <input type="text" name="rollNumber" value={formData.rollNumber} readOnly className="readonly-field" required />
                      </div>
                      <div className="input-group">
                        <label>Program *</label>
                        <select name="program" value={formData.program} onChange={handleInputChange} required>
                          <option value="">Select Program</option>
                          <option value="B.Tech">B.Tech</option>
                          <option value="M.Tech">M.Tech</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Branch *</label>
                        <select name="branch" value={formData.branch} onChange={handleInputChange} required>
                          <option value="">Select Branch</option>
                          <option value="CST">Computer Science and Technology</option>
                          <option value="ECE">Electronics and Communication</option>
                          <option value="EEE">Electrical and Electronics</option>
                          <option value="MECH">Mechanical Engineering</option>
                          <option value="CIVIL">Civil Engineering</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Year *</label>
                        <select name="year" value={formData.year} onChange={handleInputChange} required>
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Semester *</label>
                        <select name="sem" value={formData.sem} onChange={handleInputChange} required>
                          <option value="">Select Semester</option>
                          <option value="1">1st Sem</option>
                          <option value="2">2nd Sem</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Section *</label>
                        <select name="section" value={formData.section} onChange={handleInputChange} required>
                          <option value="">Select Section</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 2 && (
                <div className="form-section">
                  <div className="survey-container">
                    <div className="survey-progress">
                      <span className="survey-counter">{currentSurveyCard + 1} of {surveyQuestions.length}</span>
                      <div className="survey-progress-bar">
                        <div
                          className="survey-progress-fill"
                          style={{ width: `${((currentSurveyCard + 1) / surveyQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="survey-card-container">
                      <div className="survey-card-clean">
                        <div className="card-header">
                          <div className="question-number">{currentSurveyCard + 1}</div>
                          <h3>{surveyQuestions[currentSurveyCard]?.title}</h3>
                        </div>

                        <div className="options-container">
                          {surveyQuestions[currentSurveyCard]?.options.map((option) => {
                            const value = typeof option === 'string' ? option : option.value;
                            const label = typeof option === 'string' ? option : option.label;
                            const isMultiSelect = surveyQuestions[currentSurveyCard].id === 'communicationGoals';
                            const isChecked = isMultiSelect
                              ? (formData[surveyQuestions[currentSurveyCard].id] || []).includes(value)
                              : formData[surveyQuestions[currentSurveyCard].id] === value;

                            return (
                              <label key={value} className={`modern-option ${isChecked ? 'selected' : ''}`}>
                                <input
                                  type={isMultiSelect ? 'checkbox' : 'radio'}
                                  name={surveyQuestions[currentSurveyCard].id}
                                  value={value}
                                  checked={isChecked}
                                  onChange={handleInputChange}
                                />
                                <div className="option-content">
                                  <div className="radio-indicator"></div>
                                  <span>{label}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {surveyQuestions[currentSurveyCard]?.id === 'communicationGoals' && formData.communicationGoals.includes('public speaking') && (
                          <input
                            type="text"
                            name="otherGoals"
                            value={formData.otherGoals}
                            onChange={handleInputChange}
                            placeholder="Tell us about other goals..."
                            className="other-goals-input"
                          />
                        )}

                        {surveyQuestions[currentSurveyCard]?.id === 'speakingFrequency' && formData.speakingFrequency === 'no' && (
                          <div className="reason-section">
                            <h4 className="reason-title">Why don't you practice English speaking every day?</h4>
                            <div className="options-container">
                              {[
                                'Lack of confidence',
                                'Fear of friends or others making fun',
                                'Feeling shy or embarrassed to speak in front of others',
                                'Limited knowledge of English grammar and vocabulary',
                                'Lack of awareness of English learning platforms',
                                'No English-speaking practice platform available in college',
                                'Other reasons (please specify)'
                              ].map((reason) => {
                                const isSelected = (formData.notSpeakingReasons || []).includes(reason);
                                return (
                                  <label key={reason} className={`modern-option ${isSelected ? 'selected' : ''}`}>
                                    <input
                                      type="checkbox"
                                      name="notSpeakingReasons"
                                      value={reason}
                                      checked={isSelected}
                                      onChange={handleInputChange}
                                    />
                                    <div className="option-content">
                                      <div className="radio-indicator"></div>
                                      <span>{reason}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            {formData.notSpeakingReasons.includes('Other reasons (please specify)') && (
                              <input
                                type="text"
                                name="otherReasons"
                                value={formData.otherReasons}
                                onChange={handleInputChange}
                                placeholder="Please specify..."
                                className="other-reasons-input"
                                required
                              />
                            )}
                          </div>
                        )}

                        <div className="survey-navigation">
                          {currentSurveyCard > 0 && (
                            <button type="button" onClick={prevSurveyCard} className="btn-survey-nav">
                              ← Previous
                            </button>
                          )}
                          {currentSurveyCard < surveyQuestions.length - 1 && (
                            <button type="button" onClick={nextSurveyCard} className="btn-survey-nav btn-next">
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span>!</span> {error}
                </div>
              )}

              <div className="form-navigation">
                {currentSection > 0 && (
                  <button type="button" onClick={prevSection} className="btn-secondary" disabled={loading}>
                    <span>←</span> Previous
                  </button>
                )}
                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="btn-primary"
                    style={{ backgroundColor: '#034d4d' }}
                  >
                    Next <span>→</span>
                  </button>
                ) : (
                  <button type="submit" className={`btn-complete ${isCompleted ? 'completed' : ''}`} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner">⏳</span>
                        Creating Profile...
                      </>
                    ) : isCompleted ? (
                      <>
                        <span className="checkmark">✓</span>
                        Profile Created!
                      </>
                    ) : (
                      <>
                        <span className="sparkle">✨</span>
                        Complete Profile
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="info-sidebar">
            <div className="info-card">
              <div className="card-glow"></div>
              <h3>🌟 Why complete this?</h3>
              <div className="benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">🎯</div>
                  <div className="benefit-content">
                    <h4>Personalized Learning</h4>
                    <p>AI-powered recommendations tailored just for you</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🔒</div>
                  <div className="benefit-content">
                    <h4>Secure & Private</h4>
                    <p>Your data is encrypted and never shared</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">📈</div>
                  <div className="benefit-content">
                    <h4>Track Progress</h4>
                    <p>Visual insights into your skill development</p>
                  </div>
                </div>
              </div>

              <div className="trust-indicators">
                <div className="trust-item">
                  <span>🏆</span>
                  <small>Built for students</small>
                </div>
                <div className="trust-item">
                  <span>⚡</span>
                  <small>Takes only 2 minutes</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="success-overlay">
            <div className="success-animation">
              <div className="success-circle">
                <div className="checkmark-animation">✓</div>
              </div>
              <h2>Welcome to Skill Route! 🎉</h2>
              <p>Your profile has been created successfully</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileCreation;