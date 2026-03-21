import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, TrendingUp, RotateCcw, LayoutDashboard } from "lucide-react";
import "../interview-clone-theme.css";

const formatMessage = (content = "") =>
  content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

export default function InterviewPracticeFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    score = 0,
    interviewTitle = "Interview Practice",
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

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-bold text-foreground truncate">Practice Feedback</h1>
            <p className="text-xs text-muted-foreground">{`${interviewTitle} - ${interviewLevel} level`}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {score > 0 && <span className="interview-badge primary">{`Score ${score}/100`}</span>}
            <span className="interview-badge">Practice</span>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {hasData ? (
          <>
            {(summary || report) && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-heading text-xl font-bold text-foreground">AI Assessment Report</h2>
                  {score > 0 && <span className="ml-auto text-2xl font-bold" style={{ color: getScoreColor() }}>{score}/100</span>}
                </div>
                {summary && <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 text-sm text-foreground mb-4">{summary}</div>}
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
                    <div key={`${msg.role}-${index}`} className={`rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/70 border border-border text-foreground"}`}>
                      <p className="text-[11px] font-semibold uppercase opacity-80 mb-1">{msg.role === "user" ? "You" : "Tara AI"}</p>
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content || "") }} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h4 className="font-heading text-lg font-semibold text-foreground mb-2">No completed assessment to display</h4>
            <p className="text-sm text-muted-foreground">Complete a full practice session to see your assessment report and conversation here.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => navigate("/interview/practice")} className="px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
            Back to Practice Hub
          </button>
          {!terminated && (
            <>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
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
