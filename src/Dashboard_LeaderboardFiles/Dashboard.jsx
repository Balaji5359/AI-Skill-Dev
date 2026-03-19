import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { platformAPI, profileAPI, resultsAPI } from "../services/api";
import "../InterviewModule/interview-clone-theme.css";
import "../CommunicationTestsFiles/test-custom.css";

function Dashboard() {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userEmail] = useState(localStorage.getItem("email"));
  const [userType, setUserType] = useState("free");
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

        const [profile, streak] = await Promise.all([
          profileAPI.get(storedEmail),
          platformAPI.updateStreak(storedEmail, true),
        ]);

        if (profile?.statusCode === 200) {
          const isPremium = profile.user_type === "premium" && profile.premium_status === "active";
          setUserType(isPremium ? "premium" : "free");
        }

        void streak;
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
        const data = await resultsAPI.getTest(userEmail);
        setApiData(data?.dashboard || {});
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
      "interview-basic": "/student-dashboard/interview-basic",
      "interview-advanced": "/student-dashboard/interview-advanced",
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
                    <div className="flex justify-between"><span className="text-muted-foreground">Basic - Avg Score </span><span className="text-foreground font-medium">{loading ? "..." : stats.basicAvgScore}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Intermediate - Avg Score </span><span className="text-foreground font-medium">{loading ? "..." : stats.intermediateAvgScore}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Advanced - Avg Score </span><span className="text-foreground font-medium">{loading ? "..." : stats.advancedAvgScore}</span></div>
                    <div className="flex justify-between pt-2"><span className="text-muted-foreground">Basic - Tests Count</span><span className="text-foreground">{loading ? "..." : stats.basicTestCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Intermediate - Tests Count</span><span className="text-foreground">{loading ? "..." : stats.intermediateTestCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Advanced - Tests Count</span><span className="text-foreground">{loading ? "..." : stats.advancedTestCount}</span></div>
                  </div>
                  <button
                    onClick={() => {
                      if (activity.id === "image-speak") {
                        return;
                      }
                      handleAnalyticsClick(activity);
                    }}
                    disabled={activity.id === "image-speak"}
                    className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                      activity.id === "image-speak"
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {activity.id === "image-speak" ? "Coming Soon" : "View Detailed Dashboard"}
                    {activity.id !== "image-speak" && userType !== "premium" && <Lock className="w-4 h-4" />}
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
                <button
                  onClick={() => handleAnalyticsClick(activity)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                >
                  Open Dashboard
                  {userType !== "premium" && <Lock className="w-4 h-4 ml-2" />}
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
