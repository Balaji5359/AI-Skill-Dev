import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Menu, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { profileAPI } from "../../services/api";
import { INTERVIEW_MODULES } from "../interviewConfig";
import useInterviewUserInfo from "../useInterviewUserInfo";
import InterviewCard from "../InterviewCard";
import "../interview-clone-theme.css";

const LEVELS = ["Basic", "Intermediate", "Advanced"];

const buildTestInstructions = (title) => [
  {
    title: `${title} Test Overview`,
    content: (
      <div className="space-y-3">
        <p>You will be evaluated in a <strong>realistic interview simulation</strong> with <strong>Tara AI</strong>.</p>
        <p>This is a formal test — your responses will be scored and a detailed report will be generated.</p>
      </div>
    ),
  },
  {
    title: "Test Conditions",
    content: (
      <div className="space-y-3">
        <p>The session runs in <strong>fullscreen mode</strong>. Exiting fullscreen 3 times will terminate the test.</p>
        <p>You have a <strong>30-minute time limit</strong> for the test session.</p>
        <p>Ensure a quiet environment and working microphone before starting.</p>
      </div>
    ),
  },
  {
    title: "Test Count",
    content: (
      <div className="space-y-3">
        <p>Your <strong>"Remaining" count</strong> decrements upon successful completion of the test.</p>
        <p>If you exit early, experience internet issues, or exit fullscreen repeatedly, the test is considered <strong>incomplete</strong> and <strong>no count is decremented</strong>.</p>
      </div>
    ),
  },
  {
    title: "Focus Areas",
    content: (
      <div className="space-y-3">
        <p><strong>Clarity:</strong> Speak clearly and structure your answers well.</p>
        <p><strong>Relevance:</strong> Stay focused on the question being asked.</p>
        <p><strong>Confidence:</strong> Project confidence and professionalism throughout.</p>
        <p>Use the <strong>STAR method</strong> for behavioral questions where applicable.</p>
      </div>
    ),
  },
];

const InterviewTestHub = () => {
  const navigate = useNavigate();
  const { isPremium, userType, streakData, email } = useInterviewUserInfo();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("Basic");
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      const storedEmail = localStorage.getItem("email");
      if (!storedEmail) { setLoading(false); return; }
      try {
        const usageData = await profileAPI.get(storedEmail, "usage", "interview_tests");
        if (usageData?.statusCode === 200) setCounts(usageData);
      } catch (error) {
        console.error("[interview-test-hub:load-error]", error);
      } finally {
        setLoading(false);
      }
    };
    loadCounts();
  }, []);

  const modules = useMemo(
    () => Object.values(INTERVIEW_MODULES).map((module, index) => ({
      ...module,
      count: counts[module.testKey] || 0,
      index,
    })),
    [counts],
  );

  const openLevelModal = (id) => {
    const module = Object.values(INTERVIEW_MODULES).find((item) => item.id === id);
    if (!module) return;
    if ((counts[module.testKey] || 0) <= 0) { setShowLimitModal(true); return; }
    setActiveModule(module);
    setShowLevelModal(true);
  };

  const handleLevelChoice = (level) => {
    if (!isPremium && level !== "Basic") { setShowLimitModal(true); setShowLevelModal(false); return; }
    setSelectedLevel(level);
    setShowLevelModal(false);
    setInstructionIndex(0);
    setShowInstructionModal(true);
  };

  const handleLaunchTest = () => {
    if (!activeModule) return;
    setShowInstructionModal(false);
    navigate("/interview/test/session", {
      state: {
        interviewId: activeModule.id,
        interviewKey: activeModule.testKey,
        interviewTitle: activeModule.title,
        interviewLevel: selectedLevel,
        remainingTests: counts[activeModule.testKey] || 0,
        mode: "test",
      },
    });
  };

  const instructions = activeModule ? buildTestInstructions(activeModule.title) : [];

  if (loading) {
    return (
      <div className="app-loading-container app-bg-free">
        <div className="app-loading-spinner" />
        <p>Loading interview tests...</p>
      </div>
    );
  }

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap">
          <button onClick={() => navigate("/interview")} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <h1 className="font-heading text-lg font-bold text-foreground">Interview Test</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="interview-badge accent hidden md:inline">Test</span>
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
            <button onClick={() => setShowMobileMenu((prev) => !prev)} className="sm:hidden ml-2 p-2 rounded-lg hover:bg-muted transition-colors">
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showMobileMenu && (
          <div className="sm:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-2">
            <div className="text-xs text-muted-foreground">Streak: {streakData.current_streak || 0}</div>
            <div className="text-xs text-muted-foreground">{userType === "premium" ? "Premium" : "Free"}</div>
            {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
          </div>
        )}
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Interview Test with TaraAI</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Professional AI interview conversations with final evaluation and detailed scoring.</p>
          {!isPremium && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800"><strong>Free Plan:</strong> Basic level only. Upgrade to Premium for Intermediate and Advanced levels.</p>
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
              variant="test"
              onLevelSelect={openLevelModal}
              isPremium={isPremium}
            />
          ))}
        </div>
      </div>

      {/* Level Modal */}
      {showLevelModal && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-lg p-6">
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">Select Level</h3>
            <p className="text-sm text-muted-foreground mb-1">{activeModule.title}</p>
            <p className="text-xs text-muted-foreground mb-6">Remaining: {counts[activeModule.testKey] || 0}</p>
            <div className="space-y-3">
              {LEVELS.map((level) => (
                <button key={level} onClick={() => handleLevelChoice(level)} className="w-full py-3 px-4 rounded-xl text-foreground font-medium transition-colors text-left bg-accent/10 hover:bg-accent/20">
                  {level}
                  {!isPremium && level !== "Basic" && <span className="ml-2 text-xs text-muted-foreground">🔒 Premium</span>}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowLevelModal(false); setActiveModule(null); }} className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {/* Instruction Modal */}
      {showInstructionModal && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsl(var(--foreground)/0.5)", backdropFilter: "blur(4px)" }}>
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-lg" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <button onClick={() => { setShowInstructionModal(false); setActiveModule(null); }} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
              <X className="w-4 h-4" />
            </button>
            <div className="p-8">
              <div className="flex gap-1.5 mb-6">
                {instructions.map((_, i) => (
                  <div key={i} className="h-1 rounded-full transition-all" style={{ flex: i === instructionIndex ? "2" : "1", background: i === instructionIndex ? "hsl(var(--accent))" : i < instructionIndex ? "hsl(var(--accent) / 0.3)" : "hsl(var(--muted))" }} />
                ))}
              </div>
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "hsl(var(--foreground))" }}>{instructions[instructionIndex]?.title}</h2>
              <div className="text-sm leading-relaxed mb-8 min-h-[120px]" style={{ color: "hsl(var(--muted-foreground))" }}>{instructions[instructionIndex]?.content}</div>
              <div className="flex items-center gap-3">
                {instructionIndex > 0 && (
                  <button onClick={() => setInstructionIndex(instructionIndex - 1)} className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ color: "hsl(var(--muted-foreground))", background: "hsl(var(--muted))" }}>
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <div className="flex-1" />
                {instructionIndex < instructions.length - 1 ? (
                  <>
                    <button onClick={() => setInstructionIndex(instructions.length - 1)} className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ color: "hsl(var(--muted-foreground))" }}>Skip</button>
                    <button onClick={() => setInstructionIndex(instructionIndex + 1)} className="flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button onClick={handleLaunchTest} className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:opacity-90" style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
                    <Play className="w-4 h-4" /> START TEST
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="interview-modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="interview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="interview-modal-header">
              <span>{isPremium ? "Daily Limit Reached" : "Premium Required"}</span>
              <button onClick={() => setShowLimitModal(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">X</button>
            </div>
            <div className="interview-modal-body">
              <p className="text-sm text-muted-foreground">
                {isPremium ? "You have completed your test sessions for today. Come back tomorrow for a fresh set." : "Upgrade to Premium to unlock Intermediate and Advanced interview levels and richer daily access."}
              </p>
            </div>
            <div className="interview-modal-actions">
              <button onClick={() => setShowLimitModal(false)} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Close</button>
              {!isPremium && (
                <button onClick={() => navigate("/payment-plans")} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Buy Premium</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewTestHub;
