import React from "react";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN");
};

const formatTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const InterviewSessionModal = ({ session, onClose }) => {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-foreground/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-xl max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">Interview Session Details</h3>
            <p className="text-xs text-muted-foreground">{session.interview_title || session.interview_key}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
            X
          </button>
        </div>

        <div className="p-4 space-y-4">
          <section className="rounded-xl border border-border bg-muted/40 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Session Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Session ID:</span> <span className="text-foreground">{session.sessionId}</span></div>
              <div><span className="text-muted-foreground">Level:</span> <span className="text-foreground">{session.level || "N/A"}</span></div>
              <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{formatDate(session.start_time)}</span></div>
              <div><span className="text-muted-foreground">Time:</span> <span className="text-foreground">{`${formatTime(session.start_time)} - ${formatTime(session.end_time)}`}</span></div>
              <div><span className="text-muted-foreground">Score:</span> <span className="text-foreground">{session.score ?? "N/A"}</span></div>
              <div><span className="text-muted-foreground">Mode:</span> <span className="text-foreground">{session.mode || "N/A"}</span></div>
            </div>
          </section>

          {session.ai_feedback ? (
            <section className="rounded-xl border border-border bg-card p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">AI Feedback</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{session.ai_feedback}</div>
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Conversation History</h4>
            {session.conversationHistory?.length ? (
              <div className="space-y-3">
                {session.conversationHistory.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`rounded-xl p-3 ${message.role === "user" ? "bg-primary/10" : "bg-muted/60"}`}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {message.role === "user" ? "You" : "Tara AI"}
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-line">{message.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No conversation history available.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionModal;
