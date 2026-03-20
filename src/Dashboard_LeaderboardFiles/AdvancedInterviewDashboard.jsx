import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../InterviewModule/interview-clone-theme.css";

const AdvancedInterviewDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="interview-theme min-h-screen bg-background">
      <div id="top" />
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
            onClick={() => navigate("/interview")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">Advanced Interview Dashboard</h1>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Advanced Interview Dashboard Coming Soon</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Advanced interview analytics are not enabled yet. Basic interview practice analytics are available now.
          </p>
          <button
            onClick={() => navigate("/student-dashboard/interview-basic#top")}
            className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
          >
            Open Basic Interview Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedInterviewDashboard;
