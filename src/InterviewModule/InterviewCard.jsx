import React from "react";

const InterviewCard = ({
    id,
    title,
    count,
    onStart,
    variant = "practice",
    index = 0,
    comingSoon = false,
    locked = false,
    lockedLabel = "BUY PREMIUM",
    onLevelSelect,
    isPremium = false,
}) => {
    const isTest = variant === "test";
    // Disabled for premium users when they've exhausted today's sessions;
    // free users with 0 sessions should see the Buy Premium action instead.
    const isDisabled = comingSoon || (isPremium && count === 0) || locked;

    const buttonLabel = comingSoon
        ? "COMING SOON"
        : locked
        ? lockedLabel
        : count > 0
        ? isTest
            ? "START TEST"
            : "PRACTICE"
        : isPremium
        ? "NO SESSIONS"
        : "BUY PREMIUM";

    return (
        <div className="group" style={{ animationDelay: `${index * 60}ms` }}>
            <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md ${
                isTest ? "bg-card border-accent/20 hover:border-accent/40" : "bg-card border-border hover:border-primary/40"
            }`}>
                <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                            isTest ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                        }`}>
                            {id}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            comingSoon || locked
                                ? "bg-muted text-muted-foreground"
                                : count > 0
                                ? isTest ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        }`}>
                            {comingSoon ? "Soon" : locked ? "Premium Only" : `${count} ${isTest ? "tests" : "sessions"}`}
                        </span>
                    </div>
                    <h4 className="font-heading font-semibold text-foreground text-sm mb-4 leading-snug min-h-[2.5rem]">
                        {title}
                    </h4>
                    <button
                        onClick={onLevelSelect ? () => onLevelSelect(id, title) : onStart}
                        disabled={isDisabled}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                            locked
                                ? "bg-muted text-muted-foreground hover:opacity-90"
                                : count === 0
                                ? isPremium
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                : isTest
                                ? "bg-accent text-accent-foreground hover:opacity-90"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;
