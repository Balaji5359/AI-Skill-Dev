import React from "react";
import { Loader2, Mic, Square, PhoneOff } from "lucide-react";
import PracticeCompletionHandler from "../PracticeCompletionHandler";

export default function PracticeSessionPopup({
  open,
  practiceTitle,
  actualPracticeLevel,
  chatRef,
  chatMessages,
  isLoading,
  formatAIMessage,
  recordingState,
  recording,
  startRecording,
  stopRecording,
  hasRecorded,
  practiceType,
  onEndPractice,
  sessionId,
  onComplete,
  onCompletionError,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full w-full max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col">
        <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3">
          <h2 className="font-heading text-lg md:text-xl font-bold text-foreground">{practiceTitle}</h2>
          <p className="text-xs text-muted-foreground">{`Level: ${actualPracticeLevel}`}</p>
          <p className="text-[11px] text-muted-foreground break-all">Practice Id: {sessionId}</p>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="min-h-0 rounded-2xl border border-border bg-card p-3 md:p-4 flex flex-col">
            <div ref={chatRef} className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
              <PracticeCompletionHandler
                aiResponse={chatMessages[chatMessages.length - 1]?.content}
                sessionId={sessionId}
                practiceType={practiceType}
                practiceLevel={actualPracticeLevel}
                onComplete={onComplete}
                onError={onCompletionError}
              />

              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/70 text-foreground border border-border"
                    }`}
                  >
                    {msg.type === "ai" ? (
                      formatAIMessage(msg.content, index)
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 bg-muted/70 text-foreground border border-border rounded-xl px-3 py-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 md:p-6 flex flex-col items-center justify-between gap-4">
            <div className="w-full text-center space-y-4">
              <h3 className="font-heading text-lg font-bold text-foreground">Voice Recording</h3>
              <div className="rounded-lg border px-3 py-2 text-sm font-medium bg-muted text-muted-foreground border-border">
                {recordingState === "preparing" && "Preparing to record..."}
                {recordingState === "recording" && "Recording"}
                {recordingState === "processing" && "Processing audio..."}
                {recordingState === "idle" && "Ready to record"}
              </div>

              <button
                className={`mx-auto w-36 h-36 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  recording ? "bg-red-500 text-white scale-95" : "bg-primary text-primary-foreground hover:scale-105"
                }`}
                onClick={recordingState === "recording" ? stopRecording : startRecording}
                disabled={isLoading || recordingState === "preparing" || recordingState === "processing"}
              >
                {recording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>

              <p className="text-xs text-muted-foreground">
                {hasRecorded && (practiceType === "jam_practice" || practiceType === "situation_practice")
                  ? "Waiting for AI feedback..."
                  : "Tap mic to start/stop recording"}
              </p>
            </div>

            <button
              onClick={onEndPractice}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              End Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
