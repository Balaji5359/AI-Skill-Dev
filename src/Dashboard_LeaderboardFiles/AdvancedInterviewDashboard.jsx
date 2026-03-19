import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Sparkles } from "lucide-react";
import { interviewResultsAPI, platformAPI, profileAPI } from "../services/api";
import "../InterviewModule/interview-clone-theme.css";
import "../CommunicationTestsFiles/test-custom.css";

const AdvancedInterviewDashboard = () => {
  const navigate = useNavigate();
  const [userEmail] = useState(localStorage.getItem("email"));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [userType, setUserType] = useState("free");
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!userEmail) return;
      try {
        const [profile, streakRes, dash] = await Promise.all([
          profileAPI.get(userEmail),
          platformAPI.updateStreak(userEmail, true),
          interviewResultsAPI.getDashboard(userEmail, "test"),
        ]);
        if (profile?.statusCode === 200) {
          const isPremium = profile.user_type === "premium" && profile.premium_status === "active";
          setUserType(isPremium ? "premium" : "free");
        }
        if (streakRes?.statusCode === 200) {
          setStreak({
            current_streak: streakRes.current_streak || 0,
            longest_streak: streakRes.longest_streak || 0,
          });
        }
        if (dash?.statusCode === 200 && dash.dashboard) {
          setData(dash.dashboard);
        }
      } catch (err) {
        console.error("Advanced interview dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    bootstrap();
  }, [userEmail]);

  const cards = Object.entries(data || {}).map(([key, value]) => ({
    key,
    title: key.replace(/_/g, " ").replace("test", "").trim(),
    attempts: value.attempts || 0,
    avgScore: value.avgScore || 0,
    bestScore: value.bestScore || 0,
    latestScore: value.latestScore || 0,
  }));

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center" onClick={() => navigate("/student-dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">Advanced Interview Dashboard</h1>
            <p className="text-xs text-muted-foreground">Test sessions summary (advanced tracks)</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="interview-badge accent inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Streak {streak.current_streak || 0}</span>
            <span className="interview-badge primary">{userType === "premium" ? "Premium" : "Free"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.key} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-semibold">Test</p>
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                </div>
                <span className="interview-badge subtle">{card.attempts} attempts</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Score</span><span className="font-semibold">{loading ? "..." : card.avgScore}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Best Score</span><span className="font-semibold">{loading ? "..." : card.bestScore}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Latest Score</span><span className="font-semibold">{loading ? "..." : card.latestScore}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedInterviewDashboard;
