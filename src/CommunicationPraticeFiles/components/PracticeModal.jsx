import React from "react";

export default function PracticeModal({ open, title, message, cancelText, confirmText, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-foreground/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
        <h3 className="font-heading text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

