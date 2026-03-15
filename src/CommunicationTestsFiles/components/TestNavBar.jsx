import React, { useState } from "react";
import { ArrowLeft, LayoutDashboard, Trophy, Menu, X } from "lucide-react";


const getRoute = (tabKey) => {
  if (tabKey === "Back") return "/test";
  if (tabKey === "Practice") return "/practice";
  if (tabKey === "Dashboard") return "/student-dashboard";
  return "#";
};

const navItems = ["Back", "Practice", "Dashboard"];

const tabIcon = (tabName) => {
  if (tabName.includes("Back")) return <ArrowLeft className="w-4 h-4" />;
  if (tabName.includes("Dashboard")) return <LayoutDashboard className="w-4 h-4" />;
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
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  const levelLabel =
    actualTestLevel && typeof actualTestLevel === "string"
      ? `${actualTestLevel.charAt(0).toUpperCase()}${actualTestLevel.slice(1)}`
      : "Basic";

  const handleLeaderboardClick = () => {
    setShowComingSoonModal(true);
  };

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
          <button
            onClick={handleLeaderboardClick}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-muted text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
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
            <button
              onClick={() => {
                setShowMobileMenu(false);
                handleLeaderboardClick();
              }}
              className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-muted text-muted-foreground hover:text-foreground"
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

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

      {showComingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'hsl(var(--foreground)/0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'hsl(var(--primary)/0.1)' }}>
                <Trophy className="w-8 h-8" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <h2 className="font-heading text-xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                Coming Soon
              </h2>
              <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                The leaderboard feature is currently under development. Stay tuned for updates!
              </p>
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
