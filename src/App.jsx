import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


// Basic Components
import Navigation from "./basic_components/Navigation.jsx";
import LoadingSpinner from "./basic_components/LoadingSpinner.jsx";
import ScrollToTop from "./basic_components/ScrollToTop.jsx";
import Layout from "./components/Layout.jsx";

// Landing page components
const LandingPage = lazy(() => import("./LandingPageFiles/LandingPage.jsx"));

// Registration components
const Signup = lazy(() => import("./RegisterFiles/Signup.jsx"));
const ProfileData = lazy(() => import("./components/ProfileData.jsx"));
const ProfileCreation_Survey = lazy(() => import("./RegisterFiles/ProfileCreation/ProfileCreation.jsx"));

// Pratice Components
const Practice = lazy(() => import("./CommunicationPraticeFiles/Practice.jsx"))

// Test Components
const Test = lazy(() => import("./CommunicationTestsFiles/Test.jsx"));
const JAM1 = lazy(() => import("./CommunicationTestsFiles/JAM.jsx"))
const Pronunciation1 = lazy(() => import("./CommunicationTestsFiles/Pronunciation.jsx"));
const Listening = lazy(() => import("./CommunicationTestsFiles/Listening.jsx"));
const SituationSpeak = lazy(() => import("./CommunicationTestsFiles/SituationSpeak.jsx"));
const TestFeedbackPage = lazy(() => import("./CommunicationTestsFiles/TestFeedbackPage.jsx"));

// Interview Components
const Interview = lazy(() => import("./InterviewModule/Interview.jsx"));
const InterviewPractice = lazy(() => import("./InterviewModule/InterviewPractice.jsx"));
const InterviewTest = lazy(() => import("./InterviewModule/InterviewTest.jsx"));
const BasicInterview = lazy(() => import("./InterviewModule/BasicInterview.jsx"));
const InterviewSession = lazy(() => import("./InterviewModule/InterviewSession.jsx"));
const InterviewFeedback = lazy(() => import("./InterviewModule/InterviewFeedback.jsx"));

// Practice Components - Base
const BaseComponentPractice = lazy(() => import("./CommunicationPraticeFiles/BaseComponentPractice.jsx"));
const PracticeFeedbackPage = lazy(() => import("./CommunicationPraticeFiles/PracticeFeedbackPage.jsx"));

// Student Dashboard and Leaderboard files
const Dashboard = lazy(() => import("./Dashboard_LeaderboardFiles/Dashboard.jsx"));
const JAMDashboard = lazy(() => import("./Dashboard_LeaderboardFiles/JAMDashboard.jsx"));
const SituationSpeakDashboard = lazy(() => import("./Dashboard_LeaderboardFiles/SituationSpeakDashboard.jsx"));
const ListeningDashboard = lazy(() => import("./Dashboard_LeaderboardFiles/ListeningDashboard.jsx"));
const PronunciationDashboard = lazy(() => import("./Dashboard_LeaderboardFiles/PronunciationDashboard.jsx"));
const Leaderboard = lazy(() => import("./Dashboard_LeaderboardFiles/Leaderboard.jsx"))
const BasicInterviewDashboard = lazy(() => import("./Dashboard_LeaderboardFiles/BasicInterviewDashboard.jsx"));
const AdvancedInterviewDashboard = lazy(() => import("./Dashboard_LeaderboardFiles/AdvancedInterviewDashboard.jsx"));


const MainLayout = ({ children }) => (
  <>
    <main className="main-content">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </main>
  </>
);

// Auth layout is not needed as Login/Signup components handle their own layout
const AuthLayout = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

const DashboardLayout = ({ children }) => (
  <>
    {/* <Login_Navbar /> */}
    <main className="dashboard-content">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </main>
  </>
);


const CommunicationPraticeLayout = ({ children }) => (
  <>
    <main className="dashboard-content">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </main>
  </>
);

// Auth guard - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("email");
  return isAuthenticated ? children : <Navigate to="/signup" />;
};

// Protected Layout for authenticated routes
const ProtectedLayout = () => {
  const isAuthenticated = localStorage.getItem("email");
  return isAuthenticated ? <Layout /> : <Navigate to="/signup" />;
};

// Reset global styles when navigating between routes
const RouteChangeHandler = () => {
  useEffect(() => {
    // Reset body styles to default
    document.body.style = "";
    document.body.className = "";

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
};

function ErrorBoundary({ children }) {
  // Minimal client-side error boundary
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    if (error) console.error('ErrorBoundary caught:', error);
  }, [error]);
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Something went wrong rendering the app.</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error && error.stack ? error.stack : error)}</pre>
      </div>
    );
  }
  try {
    return children;
  } catch (e) {
    setError(e);
    return null;
  }
}

function App() {
  return (
    <Router>
      <RouteChangeHandler />
      <ScrollToTop />
      <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          } />

          {/* Auth routes */}
          <Route path="/signup" element={
            <AuthLayout>
              <Signup />
            </AuthLayout>
          } />

          <Route path="/profile-creation-survey" element={
            <AuthLayout>
              <ProfileCreation_Survey />
            </AuthLayout>
          } />

          {/* Protected routes with Layout */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route path="profiledata" element={<ProfileData />} />
            <Route path="practice" element={<Practice />} />
            <Route path="test" element={<Test />} />
            <Route path="student-dashboard" element={<Dashboard />} />
            
            <Route path="student-leaderboard" element={<Leaderboard />} />
          </Route>

          {/* Communication test routes without header */}
          {/* 
          <Route path="student-dashboard/jam" element={<JAMDashboard />} />
            <Route path="student-dashboard/situationspeak" element={<SituationSpeakDashboard />} />
            <Route path="student-dashboard/listening" element={<ListeningDashboard />} />
            <Route path="student-dashboard/pronunciation" element={<PronunciationDashboard />} /> */}
          
          <Route path="student-dashboard/jam" element={
            <ProtectedRoute>
              <JAMDashboard />
            </ProtectedRoute>
          } />

          <Route path="student-dashboard/situationspeak" element={
            <ProtectedRoute>
              <SituationSpeakDashboard />
            </ProtectedRoute>
          } />

          <Route path="student-dashboard/listening" element={
            <ProtectedRoute>
              <ListeningDashboard />
            </ProtectedRoute>
          }/>

          <Route path="student-dashboard/pronunciation" element={
            <ProtectedRoute>
              <PronunciationDashboard />
            </ProtectedRoute>
          }/>
          <Route path="student-dashboard/interview-basic" element={
            <ProtectedRoute>
              <BasicInterviewDashboard />
            </ProtectedRoute>
          }/>
          <Route path="student-dashboard/interview-advanced" element={
            <ProtectedRoute>
              <AdvancedInterviewDashboard />
            </ProtectedRoute>
          }/>

          <Route path="test/jam" element={
            <ProtectedRoute>
              <JAM1 />
            </ProtectedRoute>
          } />
          <Route path="test/pronunciation" element={
            <ProtectedRoute>
              <Pronunciation1 />
            </ProtectedRoute>
          } />
          <Route path="test/listening" element={
            <ProtectedRoute>
              <Listening />
            </ProtectedRoute>
          } />
          <Route path="test/situation-speak" element={
            <ProtectedRoute>
              <SituationSpeak />
            </ProtectedRoute>
          } />
          <Route path="test/feedback" element={
            <ProtectedRoute>
              <TestFeedbackPage />
            </ProtectedRoute>
          } />

          {/* Communication practice routes */}
          <Route path="practice/jam" element={
            <ProtectedRoute>
              <BaseComponentPractice 
                practiceType="jam_practice"
                practiceTitle="JAM Practice"
                practiceDescription="JAM speaking sessions to improve spontaneous communication"
              />
            </ProtectedRoute>
          } />
          <Route path="practice/pronunciation" element={
            <ProtectedRoute>
              <BaseComponentPractice 
                practiceType="pronu_practice"
                practiceTitle="Pronunciation Practice"
                practiceDescription="Perfect your pronunciation with AI-powered feedback"
              />
            </ProtectedRoute>
          } />
          <Route path="practice/listening" element={
            <ProtectedRoute>
              <BaseComponentPractice 
                practiceType="listen_practice"
                practiceTitle="Listening Practice"
                practiceDescription="Enhance comprehension with interactive listening exercises"
              />
            </ProtectedRoute>
          } />
          <Route path="practice/situation" element={
            <ProtectedRoute>
              <BaseComponentPractice 
                practiceType="situation_practice"
                practiceTitle="Situational Speaking Practice"
                practiceDescription="Practice real-life scenarios to build confidence"
              />
            </ProtectedRoute>
          } />
          <Route path="practice/image-speak" element={
            <ProtectedRoute>
              <BaseComponentPractice 
                practiceType="image_speak_practice"
                practiceTitle="Image-Based Speaking Practice"
                practiceDescription="Describe images to enhance vocabulary and fluency"
              />
            </ProtectedRoute>
          } />
          <Route path="practice/feedback" element={
            <ProtectedRoute>
              <PracticeFeedbackPage />
            </ProtectedRoute>
          } />

          {/* Interview routes (no global Header) */}
          <Route path="interview" element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          } />
          <Route path="interview/practice" element={
            <ProtectedRoute>
              <InterviewPractice />
            </ProtectedRoute>
          } />
          <Route path="interview/test" element={
            <ProtectedRoute>
              <InterviewTest />
            </ProtectedRoute>
          } />
          <Route path="interview/session" element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          } />
          <Route path="interview/feedback" element={
            <ProtectedRoute>
              <InterviewFeedback />
            </ProtectedRoute>
          } />
          <Route path="interview/basic" element={
            <ProtectedRoute>
              <BasicInterview />
            </ProtectedRoute>
          } />

          {/* Fallback routes */}
          <Route path="/not-found" element={
            <MainLayout>
              <h1>Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </MainLayout>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
