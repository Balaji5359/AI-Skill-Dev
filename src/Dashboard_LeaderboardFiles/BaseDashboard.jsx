import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, LayoutDashboard } from "lucide-react";
import AdvancedDashboard from "./AdvancedDashboard";
import "../InterviewModule/interview-clone-theme.css";
import "../CommunicationTestsFiles/test-custom.css";

const BaseDashboard = ({ testTitle, apiTestType, children }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("main");
  const [userType, setUserType] = useState("free");
  const [streakData, setStreakData] = useState({ current_streak: 0 });
  const [userEmail] = useState(localStorage.getItem("email"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = localStorage.getItem("email");
        if (!storedEmail) return;
        const [profileResponse, streakResponse] = await Promise.all([
          fetch("https://ntjkr8rnd6.execute-api.ap-south-1.amazonaws.com/dev/student_profilecreate/student_profile_senddata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college_email: storedEmail }),
          }),
          fetch("https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/update-user-streak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: JSON.stringify({ college_email: storedEmail, get_streak_data: true }) }),
          }),
        ]);
        const profile = await profileResponse.json();
        const streak = await streakResponse.json();
        if (profile?.body) {
          const userData = JSON.parse(profile.body);
          const isPremium = userData?.user_type === "premium" && userData?.premium_status === "active";
          setUserType(isPremium ? "premium" : "free");
        }
        if (streak?.body) setStreakData(JSON.parse(streak.body));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center" onClick={() => navigate("/student-dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-bold text-foreground truncate">{`${testTitle} Dashboard`}</h1>
            <p className="text-xs text-muted-foreground">Main and advanced analytics</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="interview-badge accent inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{`Streak ${streakData.current_streak || 0}`}</span>
            <span className="interview-badge primary">{userType === "premium" ? "Premium" : "Free"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Switch to advanced mode to inspect session-level details and conversation history.</p>
          {activeSection !== "advanced" ? (
            <button onClick={() => setActiveSection("advanced")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              Open Advanced Dashboard
            </button>
          ) : (
            <button onClick={() => setActiveSection("main")} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold">
              Close Advanced Dashboard
            </button>
          )}
        </div>

        {activeSection === "advanced" ? (
          <AdvancedDashboard testType={apiTestType} userEmail={userEmail} onBack={() => setActiveSection("main")} />
        ) : (
          React.cloneElement(children, { activeSection, userType, testType: apiTestType, userEmail })
        )}
      </div>
    </div>
  );
};

export default BaseDashboard;
