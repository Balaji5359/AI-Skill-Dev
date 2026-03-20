import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Target, Sparkles, Code, Rocket, Brain, Briefcase, MessageSquare, ArrowRight, ArrowLeft, Menu, X } from "lucide-react";
import "./interview-clone-theme.css";
import useInterviewUserInfo from "./useInterviewUserInfo";

const topics = [
    { icon: MessageSquare, label: "Self Introduction" },
    { icon: Code, label: "Technical Skills" },
    { icon: Briefcase, label: "Worked Domain" },
    { icon: ArrowRight, label: "Project Discussion" },
    { icon: Target, label: "Career Goals" },
    { icon: Sparkles, label: "Hobbies and Interests" },
    { icon: Briefcase, label: "Internship Review" },
    { icon: Brain, label: "Certification Exploration" }, 
    { icon: Rocket, label: "More Advanced Interviews..." },
];

function Interview() {
    const navigate = useNavigate();
    const { userType, streakData, email, isPremium } = useInterviewUserInfo();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/signup");
    };

    return (
        <div className="interview-theme min-h-screen" style={{ background: "var(--gradient-hero)" }}>
            <div className="sticky top-0 z-40 glass border-b border-border">
                <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-5 flex-wrap">
                        <span className="font-heading text-lg font-bold text-foreground"
                            style={{fontSize:"25px"}}>
                                Skill Route</span>
                        <button
                            onClick={() => navigate("/profiledata")}
                            className="px-3 py-3 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors hidden sm:block"
                        >
                            Home
                        </button>

                        <button
                            onClick={() => navigate("/student-dashboard/interview-basic")}
                            className="px-3 py-3 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors hidden sm:block"
                        >
                            Dashboard
                        </button>

                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="interview-badge primary hidden md:inline">Interview Hub</span>
                        <button
                            onClick={handleLogout}
                            className="hidden sm:inline-flex px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                        >
                            Logout
                        </button>
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
                    </div>
                    
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="sm:hidden ml-2 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {showMobileMenu && (
                    <div className="sm:hidden border-t border-border bg-card">
                        <div className="px-4 py-3 flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    navigate("/profiledata");
                                    setShowMobileMenu(false);
                                }}
                                className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors text-left"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => {
                            navigate("/student-dashboard/interview-basic");
                                    setShowMobileMenu(false);
                                }}
                                className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors text-left"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setShowMobileMenu(false);
                                }}
                                className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors text-left"
                            >
                                Logout
                            </button>
                            <div className="border-t border-border pt-2 mt-2 space-y-1">
                                <div className="text-xs text-muted-foreground">Streak: {streakData.current_streak || 0}</div>
                                <div className="text-xs text-muted-foreground">{userType === "premium" ? "Premium" : "Free"}</div>
                                {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Interview Prep
                    </div>
                    <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
                        Professional Interview
                        <span className="text-gradient-primary"> Preparation</span>
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Choose your interview mode to start practicing with <b>TaraAI</b>
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto mb-20">
                    <div
                        className="group cursor-pointer"
                        onClick={() => navigate("/interview/practice")}
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 transition-shadow duration-300 hover:shadow-lg hover:shadow-glow">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <BookOpen className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-3">
                                    Interview Practice
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
                                    Learn and improve your interview skills in a supportive environment with flexible guidance.
                                </p>
                                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                                    {[
                                        "Friendly learning environment",
                                        "Flexible interaction",
                                        "Supportive TaraAI feedback",
                                        "No time pressure",
                                        "Multiple attempts allowed",
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-xs sm:text-sm text-foreground">
                                            <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                                                <span className="w-2 h-2 rounded-full bg-success" />
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm group-hover:shadow-glow transition-all">
                                    Start Practice Mode
                                    <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="group cursor-pointer"
                        onClick={() => navigate("/interview/test")}
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-foreground text-background p-6 sm:p-8 transition-shadow duration-300 hover:shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                                    <Target className="w-7 h-7 text-accent" />
                                </div>
                                <h2 className="font-heading text-xl sm:text-2xl font-bold mb-3">
                                    Interview Test
                                </h2>
                                <p className="text-background/70 text-sm sm:text-base mb-6 leading-relaxed">
                                    Experience realistic interview conditions with professional evaluation and strict assessment.
                                </p>
                                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                                    {[
                                        "Professional evaluation",
                                        "Timed responses",
                                        "Detailed scoring & Performance certificates",
                                        "Progress reports, viewed by real mentors",
                                        "Real interview simulation with TaraAI",
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-xs sm:text-sm text-background/90">
                                            <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                                <span className="w-2 h-2 rounded-full bg-accent" />
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-xs sm:text-sm transition-all">
                                    Start Test Mode
                                    <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground text-center mb-8">
                        What You'll Practice
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {topics.map((topic) => (
                            <div
                                key={topic.label}
                                className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                            >
                                <topic.icon className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-foreground">{topic.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Interview;
