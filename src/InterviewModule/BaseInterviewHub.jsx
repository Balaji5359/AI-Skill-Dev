import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Menu, Target, X } from "lucide-react";
import { profileAPI } from "../services/api";
import InterviewCard from "./InterviewCard";
import { INTERVIEW_MODULES } from "./interviewConfig";
import "./interview-clone-theme.css";
import useInterviewUserInfo from "./useInterviewUserInfo";

const LEVELS = ["Basic", "Intermediate", "Advanced"];

const BaseInterviewHub = ({ mode = "practice" }) => {
  const navigate = useNavigate();
  const { isPremium, userType, streakData, email } = useInterviewUserInfo();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("Basic");
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const modeLabel = mode === "test" ? "Test" : "Practice";
  const usageType = mode === "test" ? "interview_tests" : "interview_practices";
  const countSuffix = mode === "test" ? "_test" : "_practice";
  const title = mode === "test" ? "Interview Test" : "Interview Practice";
  const subtitle =
    mode === "test"
      ? "Professional AI interview conversations with final evaluation and feedback."
      : "Supportive AI interview conversations to build confidence with structured feedback.";

  const modules = useMemo(
    () =>
      Object.values(INTERVIEW_MODULES).map((module, index) => ({
        ...module,
        count: counts[module[mode === "test" ? "testKey" : "practiceKey"]] || 0,
        index,
      })),
    [counts, mode],
  );

  useEffect(() => {
    const loadCounts = async () => {
      const storedEmail = localStorage.getItem("email");
      if (!storedEmail) {
        setLoading(false);
        return;
      }

      try {
        const usageData = await profileAPI.get(storedEmail, "usage", usageType);
        if (usageData?.statusCode === 200) {
          setCounts(usageData);
        }
      } catch (error) {
        console.error(`[interview-hub:${mode}:load-error]`, error);
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, [mode, usageType]);

  const openLevelModal = (id) => {
    const module = Object.values(INTERVIEW_MODULES).find((item) => item.id === id);
    if (!module) return;

    const interviewKey = module[mode === "test" ? "testKey" : "practiceKey"];
    const remainingCount = counts[interviewKey] || 0;

    if (remainingCount <= 0) {
      setShowLimitModal(true);
      return;
    }

    setActiveModule(module);
    setShowLevelModal(true);
  };

  const handleLevelChoice = (level) => {
    if (!isPremium && level !== "Basic") {
      setShowLimitModal(true);
      setShowLevelModal(false);
      return;
    }

    setSelectedLevel(level);
    setShowLevelModal(false);

    if (!activeModule) return;

    const interviewKey = activeModule[mode === "test" ? "testKey" : "practiceKey"];
    navigate("/interview/session", {
      state: {
        interviewId: activeModule.id,
        interviewKey,
        interviewTitle: activeModule.title,
        interviewLevel: level,
        remainingTests: counts[interviewKey] || 0,
        mode,
        interviewType: "basic-interview",
      },
    });
  };

  if (loading) {
    return (
      <div className="app-loading-container app-bg-free">
        <div className="app-loading-spinner" />
        <p>Loading interview {mode}s...</p>
      </div>
    );
  }

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate("/interview")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mode === "test" ? "bg-accent/10" : "bg-primary/10"}`}>
              {mode === "test" ? <Target className="w-4 h-4 text-accent" /> : <BookOpen className="w-4 h-4 text-primary" />}
            </div>
            <h1 className="font-heading text-lg font-bold text-foreground">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`interview-badge ${mode === "test" ? "accent" : "primary"} hidden md:inline`}>{modeLabel}</span>
            <div className="relative group hidden sm:block">
              <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Menu className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3 space-y-2 z-50">
                <div className="text-xs text-muted-foreground">Streak: {streakData.current_streak || 0}</div>
                <div className="text-xs text-muted-foreground">{userType === "premium" ? "Premium" : "Free"}</div>
                {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
              </div>
            </div>
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="sm:hidden ml-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="sm:hidden border-t border-border bg-card">
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">Streak: {streakData.current_streak || 0}</div>
              <div className="text-xs text-muted-foreground">{userType === "premium" ? "Premium" : "Free"}</div>
              {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">{title} with TaraAI</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          {!isPremium && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Free Plan:</strong> Basic level only. Upgrade to Premium for Intermediate and Advanced levels.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((module) => (
            <InterviewCard
              key={module.id}
              id={module.id}
              title={module.title}
              count={module.count}
              index={module.index}
              variant={mode}
              onLevelSelect={openLevelModal}
              isPremium={isPremium}
            />
          ))}
        </div>
      </div>

      {showLevelModal && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-lg p-6">
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">Select Level</h3>
            <p className="text-sm text-muted-foreground mb-1">{activeModule.title}</p>
            <p className="text-xs text-muted-foreground mb-6">
              Remaining: {counts[activeModule[mode === "test" ? "testKey" : "practiceKey"]] || 0}
              {isPremium ? " (Premium - resets daily)" : " (Free - upgrade for more)"}
            </p>
            <div className="space-y-3">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelChoice(level)}
                  className={`w-full py-3 px-4 rounded-xl text-foreground font-medium transition-colors text-left ${mode === "test" ? "bg-accent/10 hover:bg-accent/20" : "bg-primary/10 hover:bg-primary/20"}`}
                >
                  {level}
                  {!isPremium && level !== "Basic" ? <span className="ml-2 text-xs text-muted-foreground">Premium</span> : null}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowLevelModal(false);
                setActiveModule(null);
              }}
              className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div className="interview-modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="interview-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="interview-modal-header">
              <span>{isPremium ? "Daily Limit Reached" : "Premium Required"}</span>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                X
              </button>
            </div>
            <div className="interview-modal-body">
              <p className="text-sm text-muted-foreground">
                {isPremium
                  ? `You have completed your ${mode} sessions for today. Come back tomorrow for a fresh set.`
                  : "Upgrade to Premium to unlock Intermediate and Advanced interview levels and richer daily access."}
              </p>
            </div>
            <div className="interview-modal-actions">
              <button
                onClick={() => setShowLimitModal(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
              {!isPremium && (
                <button
                  onClick={() => navigate("/payment-plans#pp-duration-section")}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Buy Premium
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseInterviewHub;
