import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Flame, Lock, Menu, Sparkles, X } from "lucide-react";
import "../InterviewModule/interview-clone-theme.css";
import "../CommunicationTestsFiles/test-custom.css";

function Dashboard() {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userEmail] = useState(localStorage.getItem("email"));
  const [userType, setUserType] = useState("free");
  const [streakData, setStreakData] = useState({ current_streak: 0 });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const interviewActivities = [
    { id: "interview-basic", title: "Basic Interview Skills", description: "Master fundamental interview communication skills" },
    { id: "interview-advanced", title: "Advanced Interview Skills", description: "Advanced interview techniques and complex scenarios" },
  ];

  const activities = [
    { id: "jam", title: "JAM Sessions" },
    { id: "pronunciation", title: "Pronunciation Test" },
    { id: "listening", title: "Listening Test" },
    { id: "situational", title: "Situational Speaking" },
    { id: "image-speak", title: "Image-Based Speaking" },
  ];

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userEmail) return;
      setLoading(true);
      try {
        const response = await fetch("https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/comm-test-send-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college_email: userEmail }),
        });
        const data = await response.json();
        setApiData(JSON.parse(data.body).dashboard);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, [userEmail]);

  const getTestStats = (activityId) => {
    const testMap = { jam: "jam_test", pronunciation: "pronu_test", listening: "listen_test", situational: "situation_test", "image-speak": "image_speak" };
    const testData = apiData[testMap[activityId]];
    if (!testData || !testData.levels) {
      return { basicAvgScore: "0", basicTestCount: 0, intermediateAvgScore: "0", intermediateTestCount: 0, advancedAvgScore: "0", advancedTestCount: 0 };
    }

    const basicLevel = testData.levels.basic || { avgScore: 0, attempts: 0 };
    const intermediateLevel = testData.levels.intermediate || { avgScore: 0, attempts: 0 };
    const advancedLevel = testData.levels.advanced || { avgScore: 0, attempts: 0 };

    return {
      basicAvgScore: basicLevel.avgScore?.toFixed(1) || "0",
      basicTestCount: basicLevel.attempts || 0,
      intermediateAvgScore: intermediateLevel.avgScore?.toFixed(1) || "0",
      intermediateTestCount: intermediateLevel.attempts || 0,
      advancedAvgScore: advancedLevel.avgScore?.toFixed(1) || "0",
      advancedTestCount: advancedLevel.attempts || 0,
    };
  };

  const handleAnalyticsClick = (activity) => {
    if (userType !== "premium") {
      setShowPremiumModal(true);
      return;
    }
    const routes = {
      jam: "/student-dashboard/jam",
      pronunciation: "/student-dashboard/pronunciation",
      listening: "/student-dashboard/listening",
      situational: "/student-dashboard/situationspeak",
      "image-speak": "/student-dashboard/imagespeak",
    };
    navigate(routes[activity.id]);
  };

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-1 space-y-8">
        <section>
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Communication Tests Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activities.map((activity) => {
              const stats = getTestStats(activity.id);
              return (
                <div key={activity.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-semibold text-foreground">{activity.title}</h3>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground"><Sparkles className="w-4 h-4" /></span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Basic Avg</span><span className="text-foreground font-medium">{loading ? "..." : stats.basicAvgScore}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Inter Avg</span><span className="text-foreground font-medium">{loading ? "..." : stats.intermediateAvgScore}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Advanced Avg</span><span className="text-foreground font-medium">{loading ? "..." : stats.advancedAvgScore}</span></div>
                    <div className="flex justify-between pt-2"><span className="text-muted-foreground">Basic Tests</span><span className="text-foreground">{loading ? "..." : stats.basicTestCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Inter Tests</span><span className="text-foreground">{loading ? "..." : stats.intermediateTestCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Advanced Tests</span><span className="text-foreground">{loading ? "..." : stats.advancedTestCount}</span></div>
                  </div>
                  <button
                    onClick={() => handleAnalyticsClick(activity)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                  >
                    View Detailed Dashboard
                    {userType !== "premium" && <Lock className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">Interview Skills Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewActivities.map((activity) => (
              <div key={activity.id} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground mb-2">{activity.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                <button onClick={() => navigate("/test")} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90">
                  View Interview Tests
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showPremiumModal && (
        <div className="fixed inset-0 z-[80] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPremiumModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Premium Feature</h3>
            <p className="text-sm text-muted-foreground mb-5">Detailed analytics are available for Premium users only.</p>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm" onClick={() => setShowPremiumModal(false)}>Close</button>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold" onClick={() => navigate("/profiledata")}>Buy Premium</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
