import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, TrendingUp } from "lucide-react";
import "../InterviewModule/interview-clone-theme.css";
import "../CommunicationTestsFiles/test-custom.css";

const formatAIMessage = (content = "") =>
  content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

export default function PracticeFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    practiceTitle = "Communication Practice",
    actualPracticeLevel = "basic",
    sessionId = "",
    score = null,
    aiFeedback = "",
    chatMessages = [],
  } = location.state || {};

  const detailMessages = chatMessages.filter((message) => message?.content);

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-bold text-foreground truncate">Practice Feedback</h1>
            <p className="text-xs text-muted-foreground">{`${practiceTitle} - ${actualPracticeLevel} level`}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {score !== null && <span className="interview-badge accent">{`Score ${score}`}</span>}
            {sessionId && <span className="interview-badge">{sessionId}</span>}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground">AI Feedback Report</h2>
          </div>
          {aiFeedback ? (
            <div
              className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatAIMessage(aiFeedback) }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">AI feedback is not available for this session.</p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h2 className="font-heading text-xl font-bold text-foreground">Conversation History</h2>
          </div>
          <div className="space-y-3">
            {detailMessages.length ? (
              detailMessages.map((message, index) => (
                <div
                  key={`${message.type}-${index}`}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/70 border border-border text-foreground"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase opacity-80 mb-1">
                    {message.type === "user" ? "Student" : "TaraAI"}
                  </p>
                  {message.type === "ai" ? (
                    <div dangerouslySetInnerHTML={{ __html: formatAIMessage(message.content) }} />
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Conversation history is not available for this session.</p>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate("/practice")}
            className="px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            Back to Practice Hub
          </button>
        </div>
      </div>
    </div>
  );
}
