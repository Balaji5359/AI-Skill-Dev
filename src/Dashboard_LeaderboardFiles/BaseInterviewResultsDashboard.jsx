import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { interviewResultsAPI, platformAPI, profileAPI } from "../services/api";
import { INTERVIEW_MODULES } from "../InterviewModule/interviewConfig";
import "../InterviewModule/interview-clone-theme.css";
import "./dashboard-styles.css";
import TestList from "./TestList";
import InterviewSessionModal from "./InterviewSessionModal";

const BaseInterviewResultsDashboard = ({ mode = "practice", title }) => {
  const navigate = useNavigate();
  const [userEmail] = useState(localStorage.getItem("email"));
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [userType, setUserType] = useState("free");
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [selectedModuleKey, setSelectedModuleKey] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const modeLabel = mode === "test" ? "Test" : "Practice";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const relevantModules = useMemo(
    () =>
      Object.values(INTERVIEW_MODULES).map((module) => ({
        ...module,
        resultKey: mode === "test" ? module.testKey : module.practiceKey,
      })),
    [mode],
  );
  const selectedModule = relevantModules.find((module) => module.resultKey === selectedModuleKey);

  useEffect(() => {
    const bootstrap = async () => {
      if (!userEmail) return;
      setLoading(true);
      try {
        const cachedUserType = localStorage.getItem("user_type");
        const cachedCurrent = Number(localStorage.getItem("streak_current") || 0);
        const cachedLongest = Number(localStorage.getItem("streak_longest") || 0);

        if (cachedUserType) {
          setUserType(cachedUserType === "premium" ? "premium" : "free");
        }
        if (cachedCurrent || cachedLongest) {
          setStreak({
            current_streak: cachedCurrent,
            longest_streak: cachedLongest,
          });
        }

        const [profile, streakRes, dash] = await Promise.all([
          profileAPI.get(userEmail),
          platformAPI.updateStreak(userEmail, true),
          interviewResultsAPI.getDashboard(userEmail, mode),
        ]);

        if (profile?.statusCode === 200) {
          const resolvedUserType = profile?.user_info?.user_type || profile?.user_type || "free";
          const paymentDetails = profile?.user_info?.payment_details || profile?.payment_details || {};
          const isPremium = resolvedUserType === "premium" && paymentDetails?.status === "success";
          setUserType(isPremium ? "premium" : "free");
          localStorage.setItem("user_type", isPremium ? "premium" : "free");
        }

        if (streakRes?.statusCode === 200) {
          const nextStreak = {
            current_streak: streakRes.current_streak || 0,
            longest_streak: streakRes.longest_streak || 0,
          };
          setStreak(nextStreak);
          localStorage.setItem("streak_current", String(nextStreak.current_streak || 0));
          localStorage.setItem("streak_longest", String(nextStreak.longest_streak || 0));
        }

        if (dash?.statusCode === 200 && dash.dashboard) {
          setDashboardData(dash.dashboard);
        }
      } catch (error) {
        console.error("[interview-dashboard:load-error]", error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [mode, userEmail]);

  const openModuleHistory = async (moduleKey) => {
    setSelectedModuleKey(moduleKey);
    setSessions([]);
    setSessionsLoading(true);

    try {
      const response = await interviewResultsAPI.getIds(userEmail, moduleKey, mode);
      if (response?.statusCode === 200) {
        setSessions(response.sessions || []);
      }
    } catch (error) {
      console.error("[interview-dashboard:get-ids-error]", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const openSessionDetail = async (session) => {
    try {
      const response = await interviewResultsAPI.getData(userEmail, selectedModuleKey, session.sessionId, mode);
      if (response?.statusCode === 200) {
        setSelectedSession({ ...session, ...response });
      }
    } catch (error) {
      console.error("[interview-dashboard:get-data-error]", error);
    }
  };

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div id="top" />
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center" onClick={() => navigate("/interview")}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">Structured analytics and session history</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="interview-badge accent inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Streak {streak.current_streak || 0}</span>
            <span className="interview-badge primary">{userType === "premium" ? "Premium" : "Free"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {relevantModules.map((module) => {
            const stats = dashboardData[module.resultKey]?.levels || {};
            return (
              <button
                key={module.resultKey}
                onClick={() => openModuleHistory(module.resultKey)}
                className={`text-left rounded-2xl border p-5 bg-card transition-colors ${selectedModuleKey === module.resultKey ? "border-primary" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-semibold">{modeLabel}</p>
                    <h3 className="font-semibold text-foreground">{module.title}</h3>
                  </div>
                  <span className="interview-badge subtle">
                    {(stats.basic?.attempts || 0) + (stats.intermediate?.attempts || 0) + (stats.advanced?.attempts || 0)} sessions
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Basic Avg</span><span className="font-semibold">{loading ? "..." : stats.basic?.avgScore || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Intermediate Avg</span><span className="font-semibold">{loading ? "..." : stats.intermediate?.avgScore || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Advanced Avg</span><span className="font-semibold">{loading ? "..." : stats.advanced?.avgScore || 0}</span></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {selectedModule ? `${selectedModule.title} session history` : `Select a ${modeLabel.toLowerCase()} module to view session history`}
          </h3>
          {sessionsLoading ? (
            <div className="text-sm text-muted-foreground p-6 text-center">Loading sessions...</div>
          ) : selectedModuleKey ? (
            <TestList tests={sessions} onTestClick={openSessionDetail} />
          ) : (
            <div className="text-sm text-muted-foreground p-6 text-center">Choose a card above to inspect stored interview sessions.</div>
          )}
        </div>
      </div>

      {selectedSession ? <InterviewSessionModal session={selectedSession} onClose={() => setSelectedSession(null)} /> : null}
    </div>
  );
};

export default BaseInterviewResultsDashboard;
