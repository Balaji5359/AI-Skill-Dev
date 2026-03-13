import React, { useEffect, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import TestList from "./TestList";
import TestModal from "./TestModal";
import { testAPI } from "../services/api";

const toMinutes = (dateValue) => {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
};

const toDateKey = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseScore = (score) => {
  const parsed = Number(score);
  return Number.isFinite(parsed) ? parsed : 0;
};

const AdvancedDashboard = ({ testType, userEmail }) => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
    minScore: "",
    maxScore: "",
    sortScore: "none",
  });

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const data = await testAPI.getIds(userEmail, testType);
        setTests(data?.sessions || []);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [testType, userEmail]);

  useEffect(() => {
    let next = tests.filter((test) => {
      const searchMatch =
        test.sessionId?.toLowerCase().includes(filterText.toLowerCase()) ||
        toDateKey(test.start_time).includes(filterText.toLowerCase());
      if (!searchMatch) return false;

      const score = parseScore(test.score);
      const startDate = toDateKey(test.start_time);
      const startMinutes = toMinutes(test.start_time);

      if (filters.dateFrom && startDate && startDate < filters.dateFrom) return false;
      if (filters.dateTo && startDate && startDate > filters.dateTo) return false;

      if (filters.timeFrom && startMinutes !== null) {
        const [h, m] = filters.timeFrom.split(":").map(Number);
        const min = h * 60 + m;
        if (startMinutes < min) return false;
      }
      if (filters.timeTo && startMinutes !== null) {
        const [h, m] = filters.timeTo.split(":").map(Number);
        const max = h * 60 + m;
        if (startMinutes > max) return false;
      }

      if (filters.minScore !== "" && score < Number(filters.minScore)) return false;
      if (filters.maxScore !== "" && score > Number(filters.maxScore)) return false;

      return true;
    });

    if (filters.sortScore === "high_to_low") {
      next = [...next].sort((a, b) => parseScore(b.score) - parseScore(a.score));
    } else if (filters.sortScore === "low_to_high") {
      next = [...next].sort((a, b) => parseScore(a.score) - parseScore(b.score));
    }

    setFilteredTests(next);
  }, [tests, filterText, filters]);

  const handleTestClick = async (test) => {
    document.body.style.overflow = "hidden";
    if (sessionDetails[test.sessionId]) {
      setSelectedTest({ ...test, ...sessionDetails[test.sessionId] });
      return;
    }
    try {
      const data = await testAPI.getData(userEmail, testType, test.sessionId);
      setSessionDetails((prev) => ({ ...prev, [test.sessionId]: data }));
      setSelectedTest({ ...test, ...data });
    } catch (error) {
      console.error("Error fetching test details:", error);
    }
  };

  const closeModal = () => {
    document.body.style.overflow = "unset";
    setSelectedTest(null);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      timeFrom: "",
      timeTo: "",
      minScore: "",
      maxScore: "",
      sortScore: "none",
    });
  };

  const clearAllFilters = () => {
    setFilterText("");
    clearFilters();
  };

  const hasActiveFilters =
    filterText.trim().length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.timeFrom ||
    filters.timeTo ||
    filters.minScore !== "" ||
    filters.maxScore !== "" ||
    filters.sortScore !== "none";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col md:flex-row gap-3">
        <label className="relative block flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Session ID or date..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <button
          onClick={() => setShowFilterPopup(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
          className="px-3 py-2.5 rounded-lg bg-muted text-foreground text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading tests...</div>
      ) : (
        <TestList tests={filteredTests} onTestClick={handleTestClick} />
      )}

      {showFilterPopup && (
        <div className="fixed inset-0 z-[95] bg-foreground/60 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setShowFilterPopup(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-foreground">Filter Tests</h3>
              <button onClick={() => setShowFilterPopup(false)} className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date From</label>
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date To</label>
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Time From</label>
                <input type="time" value={filters.timeFrom} onChange={(e) => setFilters((prev) => ({ ...prev, timeFrom: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Time To</label>
                <input type="time" value={filters.timeTo} onChange={(e) => setFilters((prev) => ({ ...prev, timeTo: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Score</label>
                <input type="number" min="0" max="10" step="0.1" value={filters.minScore} onChange={(e) => setFilters((prev) => ({ ...prev, minScore: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Score</label>
                <input type="number" min="0" max="10" step="0.1" value={filters.maxScore} onChange={(e) => setFilters((prev) => ({ ...prev, maxScore: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Sort by Score</label>
                <select value={filters.sortScore} onChange={(e) => setFilters((prev) => ({ ...prev, sortScore: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="none">None</option>
                  <option value="high_to_low">High to Low</option>
                  <option value="low_to_high">Low to High</option>
                </select>
              </div>
            </div>
            <div className="px-4 pb-4 flex justify-end gap-2">
              <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm">Reset</button>
              <button onClick={() => setShowFilterPopup(false)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Apply</button>
            </div>
          </div>
        </div>
      )}

      {selectedTest && <TestModal test={selectedTest} onClose={closeModal} testType={testType} userEmail={userEmail} />}
    </div>
  );
};

export default AdvancedDashboard;
