import React from "react";
import { CalendarDays, Clock3 } from "lucide-react";

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return "Not available";
  try {
    return new Date(dateTimeString).toLocaleDateString("en-IN");
  } catch {
    return dateTimeString;
  }
};

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "Not available";
  try {
    return new Date(dateTimeString)
      .toLocaleTimeString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit" })
      .replace(/am|pm/g, (match) => match.toUpperCase());
  } catch {
    return dateTimeString;
  }
};

const TestList = ({ tests, onTestClick }) => {
  if (!tests.length) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">No tests found</div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">{`Test History (${tests.length})`}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {tests.map((test, index) => (
          <button
            key={test.sessionId || index}
            onClick={() => onTestClick(test)}
            className="text-left rounded-xl border border-border bg-muted/50 hover:bg-muted p-4 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground truncate">{test.sessionId}</p>
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{formatDate(test.start_time)}</div>
              <div className="inline-flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" />{`${formatTime(test.start_time)} - ${formatTime(test.end_time)}`}</div>
            </div>
            <p className="mt-2 text-xs font-medium text-foreground">{`Score: ${test.score || "N/A"}`}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestList;
