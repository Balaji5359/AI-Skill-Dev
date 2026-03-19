import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, LayoutDashboard, Target, Clock, Briefcase, MessageSquare, TrendingUp, CheckCircle, BookOpen } from "lucide-react";
import "./interview-clone-theme.css";
import useInterviewUserInfo from "./useInterviewUserInfo";

const InterviewFeedback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        score = 75,
        mode = "practice",
        interviewTitle = "Interview Session",
        interviewLevel = "Basic",
        report = "",
        summary = "",
        strengths = [],
        improvements = [],
        recommendations = [],
        answers = [],
        terminated = false,
    } = location.state || {};

    const [displayScore, setDisplayScore] = useState(0);
    const { userType, streakData, email, isPremium } = useInterviewUserInfo();

    useEffect(() => {
        const duration = 1500;
        const steps = 40;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    const getScoreColor = () => {
        if (score >= 80) return "hsl(152 60% 40%)";
        if (score >= 70) return "hsl(37 92% 55%)";
        if (score >= 60) return "hsl(25 85% 50%)";
        return "hsl(0 72% 51%)";
    };

    const getScoreLabel = () => {
        if (terminated) return "Terminated";
        if (score >= 80) return "Excellent";
        if (score >= 70) return "Good";
        if (score >= 60) return "Satisfactory";
        return "Needs Improvement";
    };

    const getReadiness = () => {
        if (terminated) return "Practice Required";
        if (score >= 70) return "Interview Ready";
        return "More Practice Needed";
    };

    const tips = [
        { icon: Target, text: "Use STAR method for behavioral questions" },
        { icon: Clock, text: "Keep responses concise yet comprehensive" },
        { icon: Briefcase, text: "Research company and role thoroughly" },
        { icon: MessageSquare, text: "Practice speaking clearly and confidently" },
    ];

    const sections = report.split("\n\n").filter(Boolean);

    return (
        <div className="interview-theme min-h-screen bg-background">
            <div className="sticky top-0 z-40 glass border-b border-border">
                <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => navigate("/interview")}
                        className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-heading text-lg font-bold text-foreground">Interview Results</h1>
                    <div className="ml-auto flex items-center gap-2 flex-wrap">
                        <span className="interview-badge">Streak: {streakData.current_streak || 0}</span>
                        <span className={`interview-badge ${isPremium ? "accent" : ""}`}>
                            {userType === "premium" ? "Premium" : "Free"}
                        </span>
                        {email && <span className="interview-badge">{email}</span>}
                    </div>
                </div>
            </div>

            <div className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
                <div className="text-center">
                    <div className="text-4xl mb-4">
                        {terminated ? "⚠️" : score >= 70 ? "✅" : "⚠️"}
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
                        {terminated ? "Interview Terminated" : "Interview Complete!"}
                    </h2>
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            mode === "test" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                        }`}>
                            {mode.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                            {interviewTitle}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {interviewLevel}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    <div className="relative w-40 h-40">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="hsl(var(--muted))"
                                strokeWidth="8"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke={getScoreColor()}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - score / 100)}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-heading text-4xl font-bold text-foreground">{displayScore}</span>
                            <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                    </div>

                    <div className="text-center sm:text-left">
                        <h3 className="font-heading text-2xl font-bold" style={{ color: getScoreColor() }}>
                            {getScoreLabel()}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Status: <strong className="text-foreground">{getReadiness()}</strong>
                        </p>
                    </div>
                </div>

                {(summary || report) && (
                    <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 space-y-4">
                        <h4 className="font-heading text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Assessment Report
                        </h4>
                        {summary && (
                            <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 text-sm text-foreground">
                                {summary}
                            </div>
                        )}
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line text-left">
                            {sections.map((section, i) => (
                                <div key={i} className={i > 0 ? "mt-4" : ""}>
                                    {section.split("\n").map((line, j) => {
                                        if (line.includes(":") && !line.trim().startsWith("-")) {
                                            return (
                                                <p key={j} className="font-semibold text-foreground mt-3 mb-1">
                                                    {line}
                                                </p>
                                            );
                                        }
                                        return <p key={j}>{line}</p>;
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!!answers.length && (
                    <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 space-y-4">
                        <h4 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-accent" />
                            Interview Transcript
                        </h4>
                        <div className="space-y-4">
                            {answers.map((item) => (
                                <div key={item.sessionId || item.questionNumber} className="rounded-xl border border-border p-4">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                                        Question {item.questionNumber}
                                    </p>
                                    <p className="text-sm font-medium text-foreground mb-2">{item.question}</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!!(strengths.length || improvements.length || recommendations.length) && (
                    <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h4 className="font-heading text-base font-semibold text-foreground mb-3">Strengths</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {strengths.length ? strengths.map((item, index) => <p key={index}>{item}</p>) : <p>No strengths captured.</p>}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h4 className="font-heading text-base font-semibold text-foreground mb-3">Improvements</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {improvements.length ? improvements.map((item, index) => <p key={index}>{item}</p>) : <p>No improvement notes captured.</p>}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h4 className="font-heading text-base font-semibold text-foreground mb-3">Recommendations</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {recommendations.length ? recommendations.map((item, index) => <p key={index}>{item}</p>) : <p>No recommendations captured.</p>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={() => navigate("/interview")}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Interviews
                    </button>
                    {!terminated && (
                        <>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate("/student-dashboard/interview-basic")}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-success text-success-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                    <h4 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-accent" />
                        Quick Tips for Next Time
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tips.map((tip, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                                <tip.icon className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm text-foreground">{tip.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Sessions", value: "1", icon: CheckCircle },
                        { label: "Score", value: `${score}%`, icon: TrendingUp },
                        { label: "Readiness", value: getReadiness().includes("Ready") ? "Ready" : "Practice", icon: Target },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                            <div className="font-heading text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InterviewFeedback;
