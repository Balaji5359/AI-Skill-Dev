import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, TrendingUp, RotateCcw, LayoutDashboard, CheckCircle, Target } from "lucide-react";
import "../interview-clone-theme.css";

const formatMessage = (content = "") =>
  content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

export default function InterviewTestFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    score = 0,
    interviewTitle = "Interview Test",
    interviewLevel = "Basic",
    report = "",
    summary = "",
    conversationHistory = [],
    sessionCompleted = false,
    terminated = false,
  } = location.state || {};

  const sections = report.split("\n\n").filter(Boolean);
  const hasData = Boolean(sessionCompleted && !terminated && (report || summary || conversationHistory.length));

  const getScoreColor = () => {
    if (score >= 80) return "hsl(152 60% 40%)";
    if (score >= 70) return "hsl(37 92% 55%)";
    if (score >= 60) return "hsl(25 85% 50%)";
    return "hsl(0 72% 51%)";
  };

  const getScoreLabel = () => {
    if (terminated) return "Terminated";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    return "Needs Improvement";
  };

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-bold text-foreground truncate">Test Feedback</h1>
            <p className="text-xs text-muted-foreground">{`${interviewTitle} - ${interviewLevel} level`}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {score > 0 && <span className="interview-badge accent">{`Score ${score}/100`}</span>}
            <span className="interview-badge">Test</span>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Score Card */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="text-4xl mb-3">{terminated ? "⚠️" : score >= 70 ? "✅" : "⚠️"}</div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-1">{terminated ? "Test Terminated" : "Test Complete!"}</h2>
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">TEST</span>
            <span className="text-sm font-medium text-foreground">{interviewTitle}</span>
            <span className="text-sm text-muted-foreground">{interviewLevel}</span>
          </div>
          {score > 0 && (
            <div className="flex items-center justify-center gap-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={getScoreColor()} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - score / 100)}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl font-bold text-foreground">{score}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-heading text-xl font-bold" style={{ color: getScoreColor() }}>{getScoreLabel()}</h3>
                <p className="text-sm text-muted-foreground mt-1">{score >= 70 ? "Interview Ready" : "More Practice Needed"}</p>
              </div>
            </div>
          )}
        </div>

        {hasData ? (
          <>
            {(summary || report) && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <h2 className="font-heading text-xl font-bold text-foreground">AI Assessment Report</h2>
                </div>
                {summary && <div className="rounded-xl bg-accent/5 border border-accent/15 px-4 py-3 text-sm text-foreground mb-4">{summary}</div>}
                {report && (
                  <div className="text-sm text-muted-foreground leading-relaxed text-left">
                    {sections.map((section, i) => (
                      <div key={i} className={i > 0 ? "mt-4" : ""}>
                        {section.split("\n").map((line, j) => (
                          line.includes(":") && !line.trim().startsWith("-")
                            ? <p key={j} className="font-semibold text-foreground mt-3 mb-1">{line}</p>
                            : <p key={j}>{line}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {conversationHistory.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h2 className="font-heading text-xl font-bold text-foreground">Interview Conversation</h2>
                </div>
                <div className="space-y-3">
                  {conversationHistory.map((msg, index) => (
                    <div key={`${msg.role}-${index}`} className={`rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted/70 border border-border text-foreground"}`}>
                      <p className="text-[11px] font-semibold uppercase opacity-80 mb-1">{msg.role === "user" ? "You" : "Tara AI"}</p>
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content || "") }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Sessions", value: "1", icon: CheckCircle },
                { label: "Score", value: `${score}%`, icon: TrendingUp },
                { label: "Readiness", value: score >= 70 ? "Ready" : "Practice", icon: Target },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="font-heading text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h4 className="font-heading text-lg font-semibold text-foreground mb-2">No completed assessment to display</h4>
            <p className="text-sm text-muted-foreground">Complete a full test session to see your assessment report and conversation here.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => navigate("/interview/test")} className="px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Back to Tests
          </button>
          {!terminated && (
            <>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button onClick={() => navigate("/student-dashboard/interview-basic")} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
