import React, { useState } from "react";
import { ArrowLeft, LayoutDashboard, Trophy, Menu, X } from "lucide-react";

const getRoute = (tabKey) => {
  if (tabKey === "Back") return "/test";
  if (tabKey === "Practice") return "/practice";
  if (tabKey === "Dashboard") return "/student-dashboard";
  if (tabKey === "Leaderboard") return "/profiledata";
  return "#";
};

const navItems = ["Back", "Practice", "Dashboard", "Leaderboard"];

const tabIcon = (tabName) => {
  if (tabName.includes("Back")) return <ArrowLeft className="w-4 h-4" />;
  if (tabName.includes("Leaderboard")) return <Trophy className="w-4 h-4" />;
  return <LayoutDashboard className="w-4 h-4" />;
};

export default function TestNavBar({
  testTitle,
  actualTestLevel,
  activeTab,
  setActiveTab,
  navigate,
  streakData,
  userType,
  theme,
  setTheme,
  userEmail,
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const levelLabel =
    actualTestLevel && typeof actualTestLevel === "string"
      ? `${actualTestLevel.charAt(0).toUpperCase()}${actualTestLevel.slice(1)}`
      : "Basic";

  return (
    <div className="sticky top-0 z-40 glass border-b border-border">
      <div className="w-full px-4 py-4 flex items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-bold text-foreground truncate">{testTitle}</h1>
            <p className="text-xs text-muted-foreground">{`Level: ${levelLabel}`}</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-3 flex-wrap">
          {navItems.map((tabName) => (
            <button
              key={tabName}
              onClick={() => {
                const route = getRoute(tabName);
                if (route !== "#") {
                  navigate(route);
                  return;
                }
                setActiveTab(tabName);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tabName
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              } whitespace-nowrap`}
            >
              {tabIcon(tabName)}
              <span>{tabName}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="interview-badge accent hidden sm:inline">Streak {streakData.current_streak || 0}</span>
          <span className="interview-badge primary hidden md:inline">{userType === "premium" ? "Premium" : "Free"}</span>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="comm-theme-select hidden sm:block"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>

          <button
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="lg:hidden w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((tabName) => (
              <button
                key={tabName}
                onClick={() => {
                  const route = getRoute(tabName);
                  setShowMobileMenu(false);
                  if (route !== "#") {
                    navigate(route);
                    return;
                  }
                  setActiveTab(tabName);
                }}
                className={`w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tabName
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tabIcon(tabName)}
                <span>{tabName}</span>
              </button>
            ))}

            <div className="pt-2 border-t border-border space-y-2">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="comm-theme-select w-full"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="custom">Custom</option>
              </select>
              <div className="text-xs text-muted-foreground">Streak: {streakData.current_streak || 0}</div>
              <div className="text-xs text-muted-foreground">Plan: {userType === "premium" ? "Premium" : "Free"}</div>
              {userEmail && <div className="text-xs text-muted-foreground truncate">{userEmail}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
