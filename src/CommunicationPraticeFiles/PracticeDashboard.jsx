import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Flame, PlayCircle, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { profileAPI, resultsAPI } from "../services/api";

const EMPTY_PRACTICE_DATA = {};

const PracticeDashboard = ({
  practiceData = EMPTY_PRACTICE_DATA,
  streakData = {},
  practiceType = "",
  practiceTitle = "Practice",
  practiceLevel = "basic",
  onNavigateToPractice = () => {},
  remainingPractices = 0,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");
  const [tests, setTests] = useState(practiceData.tests || practiceData.testHistory || []);
  const [dashboardApiData, setDashboardApiData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedEmail = localStorage.getItem("email");
      if (!storedEmail) return;
      setLoading(true);
      try {
        const [profileRes, dashboardRes] = await Promise.all([
          profileAPI.get(storedEmail),
          resultsAPI.getPractice(storedEmail),
        ]);

        setProfileData(profileRes || null);
        setDashboardApiData(dashboardRes?.dashboard || {});
      } catch (fetchError) {
        console.error("Error fetching dashboard data:", fetchError);
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [practiceType]);

  useEffect(() => {
    setTests(practiceData.tests || practiceData.testHistory || []);
  }, [practiceData]);

  const stats = useMemo(() => {
    if (!dashboardApiData || !practiceType) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: streakData.current_streak || 0,
        bestStreak: streakData.best_streak || 0,
        practicesThisWeek: 0,
        remainingPractices: 0,
      };
    }

    const practiceTypeKey = practiceType.includes("_practice") ? practiceType : `${practiceType}_practice`;
    const practiceTypeData = dashboardApiData[practiceTypeKey];
    if (!practiceTypeData || !practiceTypeData.levels) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: streakData.current_streak || 0,
        bestStreak: streakData.best_streak || 0,
        practicesThisWeek: 0,
        remainingPractices: 0,
      };
    }

    const levelData = practiceTypeData.levels[practiceLevel.toLowerCase()] || {};
    const attempts = levelData.attempts || 0;
    const avgScore = parseFloat(levelData.avgScore) || 0;
    let remainingPracticesFromProfile = remainingPractices;
    if (profileData?.practices) remainingPracticesFromProfile = profileData.practices[practiceTypeKey] || 0;
    return {
      totalAttempts: attempts,
      averageScore: avgScore,
      bestScore: Math.max(avgScore, attempts ? avgScore : 0),
      currentStreak: streakData.current_streak || 0,
      bestStreak: streakData.best_streak || 0,
      practicesThisWeek: attempts,
      remainingPractices: remainingPracticesFromProfile,
    };
  }, [dashboardApiData, practiceType, practiceLevel, streakData, profileData, remainingPractices]);

  const trendData = useMemo(() => {
    const practiceKey = practiceType.includes("_practice") ? practiceType : `${practiceType}_practice`;
    const practiceEntry = dashboardApiData?.[practiceKey];
    const rawTrend = practiceEntry?.trend || [];
    const filtered = rawTrend.filter((t) => (t.level || "").toLowerCase() === practiceLevel.toLowerCase());
    const points = (filtered.length ? filtered : rawTrend).map((t, idx) => ({
      day: t.end_time ? t.end_time.split(" ")[0] : `#${idx + 1}`,
      score: Number(t.score) || 0,
    }));

    const limit = selectedTimeRange === "all" ? points.length : selectedTimeRange === "month" ? 30 : 7;
    const sliced = points.slice(-limit);

    // Fallback if no data
    if (!sliced.length) {
      const base = stats.averageScore || 0;
      return Array.from({ length: limit || 7 }).map((_, i) => ({
        day: `#${i + 1}`,
        score: base,
      }));
    }

    return sliced;
  }, [dashboardApiData, practiceLevel, practiceType, selectedTimeRange, stats.averageScore]);

  const levelLabel = `${practiceLevel.charAt(0).toUpperCase()}${practiceLevel.slice(1)}`;

  if (loading) return <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading dashboard data...</div>;
  if (error) return <div className="rounded-2xl border border-red-400/50 bg-red-500/5 p-8 text-center text-red-600 text-sm">{`Unable to load dashboard: ${error}`}</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              Practice Dashboard
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{practiceTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1">{`Level: ${levelLabel}`}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/60 px-4 py-3 min-w-[190px]">
            <p className="text-xs text-muted-foreground">Remaining Practices</p>
            <p className="text-2xl font-bold text-foreground">{stats.remainingPractices}</p>
            <p className="text-xs text-muted-foreground">available today</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onNavigateToPractice}
            disabled={stats.remainingPractices === 0}
          >
            <PlayCircle className="w-4 h-4" />
            {stats.remainingPractices === 0 ? "No Practices Remaining" : "Start Practice"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="flex flex-wrap gap-2">
          {["overview", "analytics", "insights"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total Attempts</p><p className="text-2xl font-bold text-foreground">{stats.totalAttempts}</p></div>
              <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Average Score</p><p className="text-2xl font-bold text-foreground">{stats.averageScore ? `${stats.averageScore.toFixed(1)}/10` : "—"}</p></div>
              <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Best Score</p><p className="text-2xl font-bold text-foreground">{stats.bestScore ? `${stats.bestScore.toFixed(1)}/10` : "—"}</p></div>
              <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Current Streak</p><p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p></div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-foreground inline-flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Performance Trend</h3>
                <div className="flex gap-1">
                  {["week", "month", "all"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        selectedTimeRange === range ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {range === "all" ? "All" : range}
                    </button>
                  ))}
                </div>
              </div>
              {trendData.length ? (
                <div className="grid grid-cols-7 gap-2 items-end h-40">
                  {trendData.map((point, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="text-[10px] text-muted-foreground">{point.score}</div>
                      <div className="w-full max-w-[28px] rounded-md bg-primary/20 relative h-28 overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-md" style={{ height: `${Math.min(100, point.score * 10)}%` }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[36px]">{point.day}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No practice history yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 inline-flex items-center gap-2"><Flame className="w-4 h-4 text-accent" />Streak Progress</h3>
              <p className="text-xs text-muted-foreground mb-3">Keep consistency to improve communication speed and confidence.</p>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Current</span><span className="font-semibold text-foreground">{stats.currentStreak}</span></div>
              <div className="flex items-center justify-between text-sm mt-1"><span className="text-muted-foreground">Best</span><span className="font-semibold text-foreground">{stats.bestStreak}</span></div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h3>
              <div className="space-y-2 max-h-52 overflow-auto pr-1">
                {tests.length ? (
                  tests.map((t, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/50 px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{t.name || t.title || `Session ${i + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{`${t.attempts || t.attemptCount || t.count || 0} attempts`}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No sessions yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Speaking Quality</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Fluency</span><span className="font-medium text-foreground">{stats.averageScore ? `${stats.averageScore.toFixed(1)}/10` : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-medium text-foreground">{stats.averageScore ? `${stats.averageScore.toFixed(1)}/10` : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span className="font-medium text-foreground">{stats.averageScore ? `${stats.averageScore.toFixed(1)}/10` : "—"}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Consistency</h3>
            <p className="text-3xl font-bold text-foreground">{stats.totalAttempts}</p>
            <p className="text-xs text-muted-foreground mt-1">sessions tracked</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Milestone</h3>
            <div className="flex items-center gap-2 mb-2 text-primary"><Trophy className="w-4 h-4" /><span className="text-sm font-medium">Next target: 20 sessions</span></div>
            <p className="text-xs text-muted-foreground">You are {Math.max(0, 20 - stats.totalAttempts)} sessions away.</p>
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" />Insights</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Maintain daily practice to improve streak momentum.</li>
              <li>Repeat lower-score prompts before moving levels.</li>
              <li>Use short focused sessions for faster gains.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recommended Next Step</h3>
            <p className="text-sm text-muted-foreground mb-4">Start one more session today to consolidate your current level.</p>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onNavigateToPractice}
              disabled={stats.remainingPractices === 0}
            >
              <PlayCircle className="w-4 h-4" />
              {stats.remainingPractices === 0 ? "No Practices Remaining" : "Start Next Practice"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeDashboard;
