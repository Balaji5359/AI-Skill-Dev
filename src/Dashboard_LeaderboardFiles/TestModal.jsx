import React, { useMemo, useState } from "react";
import { AudioLines, ChartColumn, X } from "lucide-react";

const formatAIMessage = (content) => content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return "Not available";
  try {
    return new Date(dateTimeString).toLocaleDateString("en-IN");
  } catch {
    return dateTimeString;
  }
};

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "Not available";
  try {
    return new Date(dateTimeString)
      .toLocaleTimeString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit" })
      .replace(/am|pm/g, (match) => match.toUpperCase());
  } catch {
    return dateTimeString;
  }
};

const TestModal = ({ test, onClose, testType }) => {
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const loadTranscriptData = async (transcriptUrl) => {
    if (!transcriptUrl) return;
    setLoadingTranscript(true);
    try {
      const response = await fetch(transcriptUrl);
      const data = await response.json();
      setTranscriptData(data);
      setShowConfidenceModal(true);
    } catch (error) {
      console.error("Error loading transcript:", error);
    } finally {
      setLoadingTranscript(false);
    }
  };

  const words = useMemo(
    () => transcriptData?.results?.items?.filter((item) => item.type === "pronunciation").slice(0, 20) || [],
    [transcriptData]
  );
  const trendWords = useMemo(() => words.slice(0, 12), [words]);
  const trendPoints = useMemo(() => {
    if (trendWords.length === 0) return "";
    if (trendWords.length === 1) {
      const c = parseFloat(trendWords[0].alternatives?.[0]?.confidence || 0);
      const y = 180 - c * 150;
      return `30,${y.toFixed(1)}`;
    }
    return trendWords
      .map((word, index) => {
        const confidence = parseFloat(word.alternatives?.[0]?.confidence || 0);
        const x = 30 + (index / (trendWords.length - 1)) * 430;
        const y = 180 - confidence * 150;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [trendWords]);

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-foreground/65 backdrop-blur-sm p-4 md:p-6 overflow-auto" onClick={onClose}>
        <div className="max-w-5xl mx-auto rounded-2xl bg-card border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
            <h3 className="font-heading text-base md:text-lg font-bold text-foreground truncate">{`Test Details - ${test.sessionId}`}</h3>
            <button className="w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 md:p-5 space-y-5">
            <section className="rounded-xl border border-border bg-muted/40 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Test Metadata</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">{`Session ID: ${test.sessionId}`}</div>
                <div className="text-muted-foreground">{`Date: ${formatDate(test.start_time)}`}</div>
                <div className="text-muted-foreground">{`Time: ${formatTime(test.start_time)} - ${formatTime(test.end_time)}`}</div>
                <div className="text-muted-foreground">{`Score: ${test.score || "N/A"}`}</div>
              </div>
            </section>

            {(testType === "JAM" || testType === "SITUATIONSPEAK") && test.audioFiles && test.audioFiles.length > 0 && (
              <section className="rounded-xl border border-border bg-muted/40 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 inline-flex items-center gap-2"><AudioLines className="w-4 h-4 text-primary" />Audio Recordings</h4>
                <div className="space-y-3">
                  {test.audioFiles.map((file, index) => (
                    <div key={index} className="rounded-lg border border-border bg-card p-3">
                      <p className="text-sm font-medium text-foreground mb-2">{file.filename || `Audio ${index + 1}`}</p>
                      <audio controls className="w-full" controlsList="nodownload">
                        <source src={file.url} type="audio/mpeg" />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(testType === "JAM" || testType === "SITUATIONSPEAK") && test.transcripts && test.transcripts.length > 0 && (
              <section className="rounded-xl border border-border bg-muted/40 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 inline-flex items-center gap-2"><ChartColumn className="w-4 h-4 text-accent" />Speech Analysis</h4><br></br>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                  onClick={() => test.transcripts[0]?.url && loadTranscriptData(test.transcripts[0].url)}
                  disabled={loadingTranscript}
                >
                  {loadingTranscript ? "Loading..." : "View Confidence score & Speech Analysis"}
                </button>
              </section>
            )}

            <section className="rounded-xl border border-border bg-muted/40 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Conversation History</h4>
              <div className="space-y-3 max-h-[55vh] overflow-auto pr-1">
                {test.conversationHistory && test.conversationHistory.length > 0 ? (
                  test.conversationHistory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      {item.user && (
                        <div className="rounded-lg bg-primary text-primary-foreground p-3 text-sm">
                          <p className="text-[11px] opacity-80 mb-1">User</p>
                          <p>{item.user}</p>
                        </div>
                      )}
                      {item.agent && (
                        <div className="rounded-lg border border-border bg-card p-3 text-sm text-foreground">
                          <p className="text-[11px] text-muted-foreground mb-1">Agent</p>
                          <div dangerouslySetInnerHTML={{ __html: formatAIMessage(item.agent) }} />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No conversation history available.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {showConfidenceModal && (
        <div className="fixed inset-0 z-[100] bg-foreground/70 backdrop-blur-sm p-4 overflow-auto" onClick={() => setShowConfidenceModal(false)}>
          <div className="max-w-6xl min-h-[78vh] mx-auto rounded-2xl bg-card border border-border shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-heading text-lg font-bold text-foreground">Audio & Speech Analysis</h3>
              <button className="w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center" onClick={() => setShowConfidenceModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[64vh]">
              <div className="rounded-xl border border-border bg-muted/40 p-4 overflow-hidden">
                <h4 className="text-sm font-semibold text-foreground mb-3">Word Confidence scores</h4>
                <div className="space-y-2 h-[calc(64vh-64px)] overflow-auto pr-1">
                  {words.map((word, index) => {
                    const confidence = parseFloat(word.alternatives?.[0]?.confidence || 0);
                    return (
                      <div key={index} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">{word.alternatives?.[0]?.content || "Unknown"}</span>
                          <span className="text-foreground font-medium">{`${(confidence * 100).toFixed(1)}%`}</span>
                        </div>
                        <div className="h-2 rounded bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${confidence * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4 overflow-hidden">
                <h4 className="text-sm font-semibold text-foreground mb-3">Trend of speech</h4>
                <div className="h-[calc(64vh-64px)] rounded-lg border border-border bg-card p-3">
                  <svg viewBox="0 0 480 210" className="w-full h-full">
                    <line x1="30" y1="20" x2="30" y2="180" stroke="hsl(var(--border))" strokeWidth="1" />
                    <line x1="30" y1="180" x2="460" y2="180" stroke="hsl(var(--border))" strokeWidth="1" />
                    <line x1="30" y1="30" x2="460" y2="30" stroke="hsl(var(--border))" strokeWidth="0.6" strokeDasharray="4 4" />
                    <line x1="30" y1="105" x2="460" y2="105" stroke="hsl(var(--border))" strokeWidth="0.6" strokeDasharray="4 4" />
                    <line x1="30" y1="142.5" x2="460" y2="142.5" stroke="hsl(var(--border))" strokeWidth="0.6" strokeDasharray="4 4" />
                    <text x="22" y="184" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">0%</text>
                    <text x="22" y="146" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">25%</text>
                    <text x="22" y="109" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">50%</text>
                    <text x="25" y="34" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">100%</text>

                    {trendPoints && (
                      <>
                        <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="3" points={trendPoints} />
                        {trendWords.map((word, index) => {
                          const confidence = parseFloat(word.alternatives?.[0]?.confidence || 0);
                          const x = trendWords.length === 1 ? 30 : 30 + (index / (trendWords.length - 1)) * 430;
                          const y = 180 - confidence * 150;
                          return <circle key={index} cx={x} cy={y} r="4" fill="hsl(var(--accent))" />;
                        })}
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestModal;
