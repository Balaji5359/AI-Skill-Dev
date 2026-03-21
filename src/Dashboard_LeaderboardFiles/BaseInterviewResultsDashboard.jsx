import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, TrendingUp, MessageSquare } from "lucide-react";
import { interviewResultsAPI, platformAPI, profileAPI } from "../services/api";
import { INTERVIEW_MODULES } from "../InterviewModule/interviewConfig";
import "../InterviewModule/interview-clone-theme.css";
import "./dashboard-styles.css";

// Compute stats from sessions array returned by get_ids
const computeStats = (sessions = []) => {
  if (!sessions.length) return { totalSessions: 0, levels: {} };
  const levels = {};
  for (const s of sessions) {
    const lvl = (s.level || "basic").toLowerCase();
    if (!levels[lvl]) levels[lvl] = { attempts: 0, totalScore: 0, avgScore: 0 };
    levels[lvl].attempts += 1;
    levels[lvl].totalScore += Number(s.score) || 0;
  }
  for (const lvl of Object.keys(levels)) {
    const d = levels[lvl];
    d.avgScore = d.attempts ? Number((d.totalScore / d.attempts).toFixed(2)) : 0;
  }
  return { totalSessions: sessions.length, levels };
};

const BaseInterviewResultsDashboard = ({ mode = "practice", title, onModeChange }) => {
  const navigate = useNavigate();
  const [userEmail] = useState(localStorage.getItem("email"));
  const [userType, setUserType] = useState("free");
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });

  // moduleStats: { [resultKey]: { totalSessions, levels } }
  const [moduleStats, setModuleStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  // Selected module session list
  const [selectedModuleKey, setSelectedModuleKey] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Selected session detail
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetailLoading, setSessionDetailLoading] = useState(false);

  const modeLabel = mode === "test" ? "Test" : "Practice";

  const relevantModules = useMemo(
    () => Object.values(INTERVIEW_MODULES).map((m) => ({
      ...m,
      resultKey: mode === "test" ? m.testKey : m.practiceKey,
    })),
    [mode],
  );

  const selectedModule = relevantModules.find((m) => m.resultKey === selectedModuleKey);

  // Load user info + per-module stats using get_ids
  useEffect(() => {
    if (!userEmail) return;

    const bootstrap = async () => {
      setStatsLoading(true);
      setModuleStats({});
      setSelectedModuleKey("");
      setSessions([]);
      setSelectedSession(null);

      // Warm from cache
      const cachedUserType = localStorage.getItem("user_type");
      const cachedCurrent = Number(localStorage.getItem("streak_current") || 0);
      const cachedLongest = Number(localStorage.getItem("streak_longest") || 0);
      if (cachedUserType) setUserType(cachedUserType === "premium" ? "premium" : "free");
      setStreak({ current_streak: cachedCurrent, longest_streak: cachedLongest });

      try {
        const [profile, streakRes] = await Promise.all([
          profileAPI.get(userEmail),
          platformAPI.updateStreak(userEmail, true),
        ]);

        if (profile?.statusCode === 200) {
          const resolvedType = profile?.user_info?.user_type || profile?.user_type || "free";
          const payment = profile?.user_info?.payment_details || profile?.payment_details || {};
          const isPremium = resolvedType === "premium" && payment?.status === "success";
          setUserType(isPremium ? "premium" : "free");
          localStorage.setItem("user_type", isPremium ? "premium" : "free");
        }

        const profileStreak = profile?.user_info?.streak || profile?.streak || {};
        const nextStreak = streakRes?.statusCode === 200
          ? { current_streak: streakRes.current_streak || profileStreak.current_streak || 0, longest_streak: streakRes.longest_streak || profileStreak.longest_streak || 0 }
          : { current_streak: profileStreak.current_streak || 0, longest_streak: profileStreak.longest_streak || 0 };
        setStreak(nextStreak);
        localStorage.setItem("streak_current", String(nextStreak.current_streak || 0));
        localStorage.setItem("streak_longest", String(nextStreak.longest_streak || 0));

        const statsMap = {};
        for (const m of relevantModules) {
          const baseKey = m.resultKey.replace(/_(practice|test)$/i, "");
          console.log("[dashboard:get_ids:req]", { email: userEmail, interview_key: baseKey, mode });
          try {
            const res = await interviewResultsAPI.getIds(userEmail, baseKey, mode);
            console.log("[dashboard:get_ids:res]", { baseKey, sessions: res?.sessions?.length ?? 0, statusCode: res?.statusCode });
            statsMap[m.resultKey] = computeStats(res?.sessions || []);
          } catch (e) {
            console.error("[dashboard:get_ids:error]", { baseKey, e });
            statsMap[m.resultKey] = { totalSessions: 0, levels: {} };
          }
        }
        setModuleStats(statsMap);
      } catch (e) {
        console.error("[dashboard:bootstrap:error]", e);
      } finally {
        setStatsLoading(false);
      }
    };

    bootstrap();
  }, [mode, userEmail]); // relevantModules is derived from mode, no need to add it

  // Load session list for a module
  const openModuleHistory = async (moduleKey) => {
    setSelectedModuleKey(moduleKey);
    setSelectedSession(null);
    setSessions([]);
    setSessionsLoading(true);
    const baseKey = moduleKey.replace(/_(practice|test)$/i, "");
    console.log("[dashboard:openModuleHistory]", { moduleKey, baseKey, mode });
    try {
      const res = await interviewResultsAPI.getIds(userEmail, baseKey, mode);
      console.log("[dashboard:openModuleHistory:res]", { baseKey, sessions: res?.sessions?.length ?? 0 });
      setSessions(res?.sessions || []);
    } catch (e) {
      console.error("[dashboard:openModuleHistory:error]", e);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Load full session detail
  const openSessionDetail = async (session) => {
    setSessionDetailLoading(true);
    const baseKey = selectedModuleKey.replace(/_(practice|test)$/i, "");
    console.log("[dashboard:openSessionDetail]", { baseKey, sessionId: session.sessionId, mode });
    try {
      const res = await interviewResultsAPI.getData(userEmail, baseKey, session.sessionId, mode);
      console.log("[dashboard:openSessionDetail:res]", { statusCode: res?.statusCode, hasSession: !!res?.session });
      if (res?.statusCode === 200) setSelectedSession({ ...session, ...res });
    } catch (e) {
      console.error("[dashboard:openSessionDetail:error]", e);
    } finally {
      setSessionDetailLoading(false);
    }
  };

  const formatScore = (v) => (v ? Number(v).toFixed(1) : "—");

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div id="top" />
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3 flex-wrap">
          <button className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center" onClick={() => navigate("/interview")}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">Session analytics and history</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <span className="interview-badge accent inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Streak {streak.current_streak || 0}</span>
            <span className="interview-badge primary">{userType === "premium" ? "Premium" : "Free"}</span>
          </div>
        </div>

        {/* Mode tabs */}
        {onModeChange && (
          <div className="px-4 pb-3 flex gap-2">
            {["practice", "test"].map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {m === "practice" ? "Practice" : "Test"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Module cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {relevantModules.map((module) => {
            const stats = moduleStats[module.resultKey] || { totalSessions: 0, levels: {} };
            const isSelected = selectedModuleKey === module.resultKey;
            return (
              <button
                key={module.resultKey}
                onClick={() => openModuleHistory(module.resultKey)}
                className={`text-left rounded-2xl border p-5 bg-card transition-colors ${isSelected ? "border-primary" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-semibold">{modeLabel}</p>
                    <h3 className="font-semibold text-foreground">{module.title}</h3>
                  </div>
                  <span className="interview-badge subtle">
                    {statsLoading ? "..." : `${stats.totalSessions} sessions`}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  {["basic", "intermediate", "advanced"].map((lvl) => (
                    <div key={lvl} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{lvl} Avg</span>
                      <span className="font-semibold">{statsLoading ? "..." : formatScore(stats.levels[lvl]?.avgScore)}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Session list */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {selectedModule ? `${selectedModule.title} — ${modeLabel} session history` : `Select a ${modeLabel.toLowerCase()} module above to view sessions`}
          </h3>
          {sessionsLoading ? (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading sessions...</p>
          ) : selectedModuleKey && sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No sessions found for this module.</p>
          ) : selectedModuleKey ? (
            <div className="space-y-2">
              {sessions.map((s, i) => (
                <button
                  key={s.sessionId || i}
                  onClick={() => openSessionDetail(s)}
                  className="w-full text-left rounded-xl border border-border bg-muted/40 hover:bg-muted/70 px-4 py-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{s.sessionId}</p>
                      <p className="text-sm font-medium text-foreground capitalize">{s.level || "basic"} level</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{s.score != null ? `${Number(s.score).toFixed(1)} / 10` : "—"}</p>
                      <p className="text-xs text-muted-foreground">{s.end_time || "In progress"}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-6 text-center">Choose a card above to inspect stored interview sessions.</p>
          )}
        </div>

        {/* Session detail */}
        {selectedSession && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">{selectedModule?.title} — Session Detail</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedSession.sessionId}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {selectedSession.score != null && (
                  <span className="interview-badge accent text-base font-bold">{Number(selectedSession.score).toFixed(1)} / 10</span>
                )}
                <button onClick={() => setSelectedSession(null)} className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
                  Close
                </button>
              </div>
            </div>

            {sessionDetailLoading ? (
              <p className="text-sm text-muted-foreground">Loading session details...</p>
            ) : (
              <>
                {selectedSession.session?.ai_feedback && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">AI Feedback</h4>
                    </div>
                    <div className="rounded-xl bg-muted/50 border border-border p-4 text-sm text-foreground whitespace-pre-line leading-relaxed">
                      {selectedSession.session.ai_feedback}
                    </div>
                  </section>
                )}

                {selectedSession.conversationHistory?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-accent" />
                      <h4 className="text-sm font-semibold text-foreground">Conversation</h4>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {selectedSession.conversationHistory.map((msg, idx) => (
                        <div key={idx} className={`rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/70 border border-border text-foreground"}`}>
                          <p className="text-[11px] font-semibold uppercase opacity-70 mb-1">{msg.role === "user" ? "You" : "Tara AI"}</p>
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {[
                    { label: "Level", value: selectedSession.level || selectedSession.session?.level || "—" },
                    { label: "Score", value: selectedSession.score != null ? `${Number(selectedSession.score).toFixed(1)} / 10` : "—" },
                    { label: "Start", value: selectedSession.session?.start_time || "—" },
                    { label: "End", value: selectedSession.session?.end_time || "—" },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-semibold text-foreground capitalize">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseInterviewResultsDashboard;
