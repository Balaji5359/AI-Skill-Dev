import React, { useState } from "react";
import { ArrowLeft, Menu, X, Sparkles } from "lucide-react";

export default function PracticeNavBar({
  practiceTitle,
  actualPracticeLevel,
  streakData,
  userType,
  theme,
  setTheme,
  onBack,
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const levelLabel = `${actualPracticeLevel?.charAt(0).toUpperCase() || "B"}${(actualPracticeLevel || "basic").slice(1)}`;

  return (
    <div className="sticky top-0 z-40 glass border-b border-border">
      <div className="w-full px-4 py-4 flex items-center gap-3">
        <button
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={onBack}
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-heading text-lg font-bold text-foreground truncate">{practiceTitle}</h1>
          <p className="text-xs text-muted-foreground">{`Level: ${levelLabel}`}</p>
        </div>

        <div className="ml-auto hidden sm:flex items-center gap-2">
          <span className="interview-badge accent">{`Streak ${streakData.current_streak || 0}`}</span>
          <span className="interview-badge primary">{userType === "premium" ? "Premium" : "Free"}</span>
          <div className="relative">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="comm-theme-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="custom">Custom</option>
            </select>
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <button
          className="sm:hidden w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
          onClick={() => setShowMobileMenu((prev) => !prev)}
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {showMobileMenu && (
        <div className="sm:hidden border-t border-border bg-card px-4 py-3 space-y-2">
          <div className="text-xs text-muted-foreground">{`Streak: ${streakData.current_streak || 0}`}</div>
          <div className="text-xs text-muted-foreground">{`Plan: ${userType === "premium" ? "Premium" : "Free"}`}</div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="comm-theme-select w-full"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      )}
    </div>
  );
}
