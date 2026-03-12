# API Migration - Files to Update

## Files Using Consolidated Endpoints (Need Update)

### 1. Authentication & Profile
- [x] src/RegisterFiles/Signup.jsx - UPDATED
- [x] src/RegisterFiles/ProfileCreation/ProfileCreation.jsx - UPDATED
- [ ] src/components/ProfileData.jsx - NEEDS UPDATE
- [ ] src/components/Header.jsx - NEEDS UPDATE

### 2. Communication Tests
- [ ] src/CommunicationTestsFiles/CommunicationTestBase.jsx - NEEDS UPDATE
- [ ] src/CommunicationTestsFiles/Test.jsx - NEEDS UPDATE
- [ ] src/CommunicationTestsFiles/TestCompletionHandler.jsx - NEEDS UPDATE

### 3. Communication Practice
- [ ] src/CommunicationPraticeFiles/BaseComponentPractice.jsx - NEEDS UPDATE
- [ ] src/CommunicationPraticeFiles/Practice.jsx - NEEDS UPDATE
- [ ] src/CommunicationPraticeFiles/PracticeDashboard.jsx - NEEDS UPDATE

### 4. Dashboard
- [ ] src/Dashboard_LeaderboardFiles/Dashboard.jsx - NEEDS UPDATE
- [ ] src/Dashboard_LeaderboardFiles/BaseDashboard.jsx - NEEDS UPDATE
- [ ] src/Dashboard_LeaderboardFiles/AdvancedDashboard.jsx - NEEDS UPDATE

### 5. Interview Module
- [ ] src/InterviewModule/InterviewPractice.jsx - NEEDS UPDATE
- [ ] src/InterviewModule/InterviewTest.jsx - NEEDS UPDATE
- [ ] src/InterviewModule/InterviewSession.jsx - NEEDS UPDATE
- [ ] src/InterviewModule/useInterviewUserInfo.js - NEEDS UPDATE

### 6. Landing Page
- [ ] src/LandingPageFiles/LandingPage.jsx - NEEDS UPDATE

## API Endpoint Mapping

### Old → New (with action parameter)

| Old Endpoint | New Endpoint | Action |
|-------------|--------------|--------|
| `/student_login` | `/student-auth` | `login` |
| `/student_signup` | `/student-auth` | `signup` |
| `/checkusername-availability` | `/student-auth` | `check_username` |
| `/student_profilecreate` | `/student-profile` | `create_profile` |
| `/student_profilecreate/student_profile_senddata` | `/student-profile` | `get_profile` |
| `/student_surveydata` | `/student-profile` | `submit_survey` |
| `/comm-test-decrement` | `/communication-test` | `decrement_test` |
| `/studentcommunicationtests_recordingapi` | `/communication-test` | `upload_recording` |
| `/studentcommunicationtests_transcribeapi` | `/communication-test` | `get_transcript` |
| `/studentcommunicationtests_idretrivalapi` | `/communication-test` | `get_test_ids` |
| `/studentcommunicationtests_dataretrivalapi` | `/communication-test` | `get_test_data` |
| `/comm-test-feedback-update` | `/communication-results` | `submit_test_result` |
| `/comm-test-send-results` | `/communication-results` | `get_test_results` |
| `/comm-practice-feedback-update` | `/communication-results` | `submit_practice_result` |
| `/comm-practice-send-results` | `/communication-results` | `get_practice_results` |
| `/update-user-streak` | `/platform` | `update_streak` |
| `/skillroute_landingpagecontactsection_api` | `/platform` | `contact_submission` |

## Unchanged Endpoints
- `/audiototranscript-api` - Specialized transcription (unchanged)
- `/razorpay-webhook` - Payment handler (unchanged)
- AI Agent endpoints - Keep as is

## Migration Strategy

### Option 1: Use apiWrapper.js (Recommended)
Import apiWrapper and replace fetch calls:
```javascript
import apiWrapper from '../services/apiWrapper';

// Old
const response = await fetch(url, { method: 'POST', body: JSON.stringify(data) });
const result = await response.json();

// New
const result = await apiWrapper.getProfile(email);
```

### Option 2: Direct API Service
Import specific APIs:
```javascript
import { profileAPI } from '../services/api';

const data = await profileAPI.get(email);
```

### Option 3: Update Environment Variables
Keep using import.meta.env but update .env file (Already done)

## Priority Order
1. HIGH: Authentication & Profile (affects all users)
2. HIGH: Dashboard (main user interface)
3. MEDIUM: Communication Tests & Practice
4. MEDIUM: Interview Module
5. LOW: Landing Page Contact Form

## Testing Checklist
- [ ] Login/Signup flow
- [ ] Profile creation
- [ ] Profile data loading
- [ ] Streak updates
- [ ] Test decrement
- [ ] Test results
- [ ] Practice results
- [ ] Dashboard data
- [ ] Interview module
- [ ] Contact form
