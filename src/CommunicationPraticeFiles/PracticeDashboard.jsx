import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Flame, PlayCircle, Sparkles, TrendingUp, Trophy } from "lucide-react";

const PracticeDashboard = ({
  practiceData = {},
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
        const [profileResponse, dashboardResponse] = await Promise.all([
          fetch("https://ntjkr8rnd6.execute-api.ap-south-1.amazonaws.com/dev/student_profilecreate/student_profile_senddata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college_email: storedEmail }),
          }),
          fetch("https://piw6c7f4sf.execute-api.ap-south-1.amazonaws.com/dev/comm-practice-send-results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college_email: storedEmail }),
          }),
        ]);

        const profileRes = await profileResponse.json();
        const dashboardRes = await dashboardResponse.json();
        if (profileRes?.body) {
          const parsedProfileData = typeof profileRes.body === "string" ? JSON.parse(profileRes.body) : profileRes.body;
          setProfileData(parsedProfileData);
        }
        if (dashboardRes?.body) {
          const parsedDashboardData = JSON.parse(dashboardRes.body).dashboard;
          setDashboardApiData(parsedDashboardData);
        }
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
    const days = selectedTimeRange === "month" ? Array.from({ length: 10 }).map((_, i) => `D${i + 1}`) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = stats.averageScore || 5;
    return days.map((day, idx) => ({ day, score: Math.max(1, Math.min(10, Number((base + ((idx % 3) - 1) * 0.6).toFixed(1)))) }));
  }, [selectedTimeRange, stats.averageScore]);

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
            disabled={remainingPractices === 0}
          >
            <PlayCircle className="w-4 h-4" />
            {remainingPractices === 0 ? "No Practices Remaining" : "Start Practice"}
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
              <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Average Score</p><p className="text-2xl font-bold text-foreground">{stats.averageScore.toFixed(1)}/10</p></div>
              <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Best Score</p><p className="text-2xl font-bold text-foreground">{stats.bestScore.toFixed(1)}/10</p></div>
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
              <div className="grid grid-cols-7 gap-2 items-end h-40">
                {trendData.map((point, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="text-[10px] text-muted-foreground">{point.score}</div>
                    <div className="w-full max-w-[28px] rounded-md bg-primary/20 relative h-28 overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-md" style={{ height: `${point.score * 10}%` }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground">{point.day}</div>
                  </div>
                ))}
              </div>
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
              <div className="flex justify-between"><span className="text-muted-foreground">Fluency</span><span className="font-medium text-foreground">{Math.min(10, stats.averageScore + 0.6).toFixed(1)}/10</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-medium text-foreground">{Math.min(10, stats.averageScore + 0.3).toFixed(1)}/10</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span className="font-medium text-foreground">{Math.min(10, stats.averageScore + 0.8).toFixed(1)}/10</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Consistency</h3>
            <p className="text-3xl font-bold text-foreground">{stats.practicesThisWeek}</p>
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
              disabled={remainingPractices === 0}
            >
              <PlayCircle className="w-4 h-4" />
              {remainingPractices === 0 ? "No Practices Remaining" : "Start Next Practice"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeDashboard;
