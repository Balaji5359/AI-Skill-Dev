import React from "react";
import { PlayCircle, Clock3 } from "lucide-react";

export default function PracticeStartCard({
  practiceTitle,
  practiceDescription,
  actualPracticeLevel,
  remainingPractices,
  onStart,
}) {
  const levelLabel = `${actualPracticeLevel?.charAt(0).toUpperCase() || "B"}${(actualPracticeLevel || "basic").slice(1)}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-10 shadow-sm">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(59,151,151,0.12),transparent_40%)]" />
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">{practiceTitle}</h2>
        <p className="text-muted-foreground text-sm md:text-base mb-6">{practiceDescription}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
          <div className="rounded-xl bg-muted/70 border border-border px-4 py-3 flex items-center justify-center gap-2 text-sm text-foreground">
            <Clock3 className="w-4 h-4 text-primary" />
            <span className="font-medium">{`Level: ${levelLabel}`}</span>
          </div>
          <div className="rounded-xl bg-muted/70 border border-border px-4 py-3 flex items-center justify-center gap-2 text-sm text-foreground">
            <PlayCircle className="w-4 h-4 text-accent" />
            <span className="font-medium">{`Remaining Practices: ${remainingPractices}`}</span>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm md:text-base font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          onClick={onStart}
          disabled={remainingPractices <= 0}
        >
          <PlayCircle className="w-4 h-4" />
          {remainingPractices <= 0 ? "No Practices Remaining" : `Start ${practiceTitle}`}
        </button>
      </div>
    </div>
  );
}

