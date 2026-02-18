import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function TestResultModal({ open, resultType, title, message, onClose }) {
  if (!open) return null;

  const isSuccess = resultType === "success";

  return (
    <div className="fixed inset-0 z-[80] bg-foreground/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-lg p-6 md:p-8 text-center">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
          )}
        </div>

        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          {isSuccess ? "Congratulations!" : "Test Not Taken Properly"}
        </h2>
        <p className="text-sm text-muted-foreground mb-3">{title}</p>
        <p className="text-sm text-foreground mb-6">{message}</p>

        <button
          className="px-5 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
