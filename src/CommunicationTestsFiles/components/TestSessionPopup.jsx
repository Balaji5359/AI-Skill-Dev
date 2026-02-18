import React from "react";
import { Mic, Square, Loader2, Clock3, PhoneOff } from "lucide-react";
import TestCompletionHandler from "../TestCompletionHandler";
import { formatTime } from "../testUtils";

const formatMessageText = (content = "") => content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

const ALLOWED_ACTIONS = ["start", "next", "end", "done", "yes", "no", "1", "2"];

const extractActionOptions = (content = "") => {
  const matched = new Set();
  const quotedTokenRegex = /'([^']+)'/g;
  let match = quotedTokenRegex.exec(content);

  while (match) {
    const token = (match[1] || "").trim().toLowerCase();
    if (ALLOWED_ACTIONS.includes(token)) matched.add(token);
    match = quotedTokenRegex.exec(content);
  }

  ALLOWED_ACTIONS.forEach((token) => {
    if (new RegExp(`\\b${token}\\b`, "i").test(content)) matched.add(token);
  });

  return ALLOWED_ACTIONS.filter((token) => matched.has(token));
};

const actionLabel = (action) => {
  if (action === "1" || action === "2") return action;
  if (action === "done") return "End";
  return action.charAt(0).toUpperCase() + action.slice(1);
};

const actionClass = (action) => {
  if (action === "end" || action === "done") {
    return "bg-red-500 text-white hover:bg-red-600";
  }
  if (action === "no") {
    return "bg-muted text-foreground hover:bg-muted/80";
  }
  return "bg-primary text-primary-foreground hover:opacity-90";
};

const ListeningPrompt = ({ sentence, current, total, played, onPlay }) => (
  <div className="space-y-3">
    <div className="text-sm font-semibold text-foreground">{`Listening Sentence (${current}/${total})`}</div>
    <button
      onClick={onPlay}
      disabled={played}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        played ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      {played ? "Audio Played" : "Play Audio"}
    </button>
    <p className="text-xs text-muted-foreground">{sentence}</p>
  </div>
);

function AIMessageContent({ content, messageIndex, clickedButtons, onAction }) {
  const listeningMatch = content.match(/LISTENING ASSESSMENT.*SENTENCE\s*\((\d+)\/(\d+)\):\s*(.+)/i);
  if (listeningMatch) {
    const [, current, total, sentence] = listeningMatch;
    const playId = `audio-${messageIndex}`;
    return (
      <ListeningPrompt
        sentence={sentence}
        current={current}
        total={total}
        played={clickedButtons.has(playId)}
        onPlay={() => {
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(sentence.trim());
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
          }
          onAction(playId, null);
        }}
      />
    );
  }

  const actions = extractActionOptions(content);
  if (actions.length) {
    const isActionGroupLocked = Array.from(clickedButtons).some(
      (id) => id.startsWith("action-") && id.endsWith(`-${messageIndex}`)
    );

    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: formatMessageText(content) }} />
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => {
            const buttonId = `action-${action}-${messageIndex}`;
            return (
              <button
                key={buttonId}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionClass(
                  action
                )}`}
                onClick={() => onAction(buttonId, action)}
                disabled={isActionGroupLocked}
              >
                {actionLabel(action)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: formatMessageText(content) }} />;
}

const statusTone = (recordingState) => {
  if (recordingState === "preparing") return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  if (recordingState === "recording") return "bg-red-500/15 text-red-700 border-red-500/30";
  if (recordingState === "processing") return "bg-sky-500/15 text-sky-700 border-sky-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export default function TestSessionPopup({
  open,
  chatRef,
  chatMessages,
  isLoading,
  recordingState,
  recording,
  timeLeft,
  testType,
  hasRecorded,
  onStartRecording,
  onStopRecording,
  onEndTest,
  clickedButtons,
  onMessageAction,
  sessionId,
  actualTestLevel,
  onComplete,
  testTitle,
  testTimeLeft,
  onCompletionError,
  isFullscreen,
}) {
  if (!open) return null;
  const levelLabel =
    actualTestLevel && typeof actualTestLevel === "string"
      ? `${actualTestLevel.charAt(0).toUpperCase()}${actualTestLevel.slice(1)}`
      : "Basic";

  const disableMic =
    isLoading ||
    recordingState === "preparing" ||
    recordingState === "processing" ||
    (hasRecorded && (testType === "jam" || testType === "situation"));

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full w-full max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col">
        <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg md:text-xl font-bold text-foreground">{testTitle}</h2>
            <p className="text-xs text-muted-foreground">{`Level: ${levelLabel}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isFullscreen ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-700"
              }`}
            >
              {isFullscreen ? "Secured" : "Not Secured"}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
              <Clock3 className="w-4 h-4" />
              {formatTime(testTimeLeft)}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="min-h-0 rounded-2xl border border-border bg-card p-3 md:p-4 flex flex-col">
            <div ref={chatRef} className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
              <TestCompletionHandler
                aiResponse={chatMessages[chatMessages.length - 1]?.content}
                sessionId={sessionId}
                testType={testType}
                testLevel={actualTestLevel}
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
                      <AIMessageContent
                        content={msg.content}
                        messageIndex={index}
                        clickedButtons={clickedButtons}
                        onAction={onMessageAction}
                      />
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

              <div className={`rounded-lg border px-3 py-2 text-sm font-medium ${statusTone(recordingState)}`}>
                {recordingState === "preparing" && "Preparing to record..."}
                {recordingState === "recording" && `Recording: ${timeLeft}s`}
                {recordingState === "processing" && "Processing audio..."}
                {recordingState === "idle" && "Ready to record"}
              </div>

              <button
                className={`mx-auto w-28 h-28 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  recording ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"
                }`}
                onClick={recordingState === "recording" ? onStopRecording : onStartRecording}
                disabled={disableMic}
              >
                {recording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <p className="text-xs text-muted-foreground">
                {hasRecorded && (testType === "jam" || testType === "situation")
                  ? "Waiting for AI feedback..."
                  : "Tap mic to start/stop recording"}
              </p>
            </div>

            <button
              onClick={onEndTest}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              End Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
