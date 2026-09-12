import { useState } from "react";
import type { NavigateFn } from "../types";

interface CheckItem {
  id: string; category: string; detected: string;
  status: "pass" | "correction" | "missing";
  issue?: string; correction?: string; resolved: boolean;
}

const checks: CheckItem[] = [
  { id: "c1", category: "Product / Commodity Identity", detected: "Aashirvaad Whole Wheat Atta", status: "pass", resolved: false },
  { id: "c2", category: "Manufacturer / Packer Details", detected: "ITC Limited, Agri Business Division, Bengaluru 560 001", status: "pass", resolved: false },
  { id: "c3", category: "Net Quantity", detected: "5 kg", status: "pass", resolved: false },
  { id: "c4", category: "MRP Declaration", detected: "MRP ₹270/- (Incl. of all taxes)", status: "correction",
    issue: "MRP is present but the format and currency symbol placement may not follow the prescribed style.",
    correction: "Ensure MRP is printed as 'MRP ₹270.00 (Incl. of all taxes)' with decimal notation as per LM(PC) Rules.", resolved: false },
  { id: "c5", category: "Month / Year Declaration", detected: "Mfg: 08/2024", status: "correction",
    issue: "Manufacturing date uses numeric month format (08/2024) instead of the required month-name format.",
    correction: "Change to 'Mfg: Aug 2024' — spelled out month abbreviation is required.", resolved: false },
  { id: "c6", category: "Consumer Care Details", detected: "1800-102-8000", status: "missing",
    issue: "Only a toll-free number is present. A physical address or email for consumer grievance redressal is missing.",
    correction: "Add a complete consumer care address (building, city, PIN) or a monitored email ID alongside the helpline number.", resolved: false },
  { id: "c7", category: "Readability — Font Size", detected: "Ingredient list at ~0.9mm stroke height", status: "correction",
    issue: "Ingredient declaration text is below the minimum recommended stroke height of 1mm.",
    correction: "Increase font size for ingredient list to ensure minimum 1mm stroke height.", resolved: false },
];

const statusConfig = {
  pass: { label: "Passed", icon: "✓", color: "#59C99D", bg: "rgba(89,201,157,0.08)", border: "rgba(89,201,157,0.18)" },
  correction: { label: "Needs Correction", icon: "!", color: "#E6B96A", bg: "rgba(230,185,106,0.08)", border: "rgba(230,185,106,0.18)" },
  missing: { label: "Missing Information", icon: "✕", color: "#EF737A", bg: "rgba(239,115,122,0.08)", border: "rgba(239,115,122,0.18)" },
};

export default function ProducerPreCheck({ navigate }: { navigate: NavigateFn }) {
  const [items, setItems] = useState(checks);
  const [expanded, setExpanded] = useState<string | null>("c4");

  const toggleResolved = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, resolved: !item.resolved } : item));
  };

  const passCount = items.filter((i) => i.status === "pass").length;
  const corrCount = items.filter((i) => i.status === "correction").length;
  const missCount = items.filter((i) => i.status === "missing").length;
  const resolvedCount = items.filter((i) => i.resolved && i.status !== "pass").length;
  const totalIssues = corrCount + missCount;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-7">
        <button onClick={() => navigate("new-scan")}
          className="flex items-center gap-1.5 text-[#53616D] text-sm hover:text-[#A7B4C0] transition-colors mb-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Pre-Check
        </button>
        <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">Pre-Check Your Packaging</h1>
        <p className="text-[#70808E] text-sm mt-1">Aashirvaad Atta 5kg · Producer Pre-Check · 11 Sep 2024</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Passed", count: passCount, color: "#59C99D" },
          { label: "Needs Correction", count: corrCount, color: "#E6B96A" },
          { label: "Missing Info", count: missCount, color: "#EF737A" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{background: `${s.color}0D`, border: `1px solid ${s.color}25`}}>
            <p className="font-display font-700 text-2xl" style={{color: s.color}}>{s.count}</p>
            <p className="text-xs text-[#70808E] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalIssues > 0 && (
        <div className="rounded-2xl p-4 mb-5"
          style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.06)"}}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-600 text-[#F4F7FA] text-sm">Issues resolved</p>
            <p className="text-[#70808E] text-sm">{resolvedCount} / {totalIssues}</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{background: "rgba(255,255,255,0.06)"}}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{width: `${(resolvedCount / totalIssues) * 100}%`, background: "linear-gradient(to right, #59C99D, #72D8F4)"}} />
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="flex flex-col gap-3 mb-6">
        {items.map((item) => {
          const sc = statusConfig[item.status];
          const isExpanded = expanded === item.id;
          return (
            <div key={item.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: item.resolved ? "rgba(89,201,157,0.05)" : sc.bg,
                border: `1px solid ${item.resolved ? "rgba(89,201,157,0.18)" : sc.border}`,
                opacity: item.resolved ? 0.7 : 1,
              }}>
              <div className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : item.id)}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{background: `${item.resolved ? "#59C99D" : sc.color}18`, color: item.resolved ? "#59C99D" : sc.color, border: `1px solid ${item.resolved ? "rgba(89,201,157,0.25)" : sc.border}`}}>
                  {item.resolved ? "✓" : sc.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-700 text-[#F4F7FA] text-sm">{item.category}</p>
                  <p className="text-[#70808E] text-xs truncate mt-0.5">{item.detected}</p>
                </div>
                <span className="text-xs font-display font-600 shrink-0" style={{color: item.resolved ? "#59C99D" : sc.color}}>
                  {item.resolved ? "Resolved" : sc.label}
                </span>
                {item.status !== "pass" && (
                  <svg className="shrink-0 transition-transform" width="14" height="14" viewBox="0 0 14 14" fill="none"
                    style={{transform: isExpanded ? "rotate(180deg)" : "none"}}>
                    <path d="M3 5l4 4 4-4" stroke="#53616D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {isExpanded && item.status !== "pass" && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <div className="h-px" style={{background: `${sc.color}20`}} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1 font-display" style={{color: sc.color}}>What was detected</p>
                    <p className="text-[#A7B4C0] text-sm leading-relaxed">{item.detected}</p>
                  </div>
                  {item.issue && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1 font-display" style={{color: sc.color}}>What needs review</p>
                      <p className="text-[#A7B4C0] text-sm leading-relaxed">{item.issue}</p>
                    </div>
                  )}
                  {item.correction && (
                    <div className="rounded-xl p-3" style={{background: "rgba(114,216,244,0.06)", border: "1px solid rgba(114,216,244,0.15)"}}>
                      <p className="text-[#72D8F4] text-xs font-semibold uppercase tracking-wide mb-1 font-display">Suggested corrective step</p>
                      <p className="text-[#A7B4C0] text-sm leading-relaxed">{item.correction}</p>
                    </div>
                  )}
                  <button onClick={() => toggleResolved(item.id)}
                    className="self-end font-display font-semibold text-sm px-4 py-2 rounded-xl transition-all"
                    style={{
                      background: item.resolved ? "rgba(89,201,157,0.1)" : "rgba(255,255,255,0.06)",
                      color: item.resolved ? "#59C99D" : "#A7B4C0",
                      border: `1px solid ${item.resolved ? "rgba(89,201,157,0.25)" : "rgba(255,255,255,0.1)"}`
                    }}>
                    {item.resolved ? "✓ Marked resolved" : "Mark as resolved"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{background: "rgba(114,216,244,0.05)", border: "1px solid rgba(114,216,244,0.12)"}}>
        <div>
          <p className="font-display font-700 text-[#F4F7FA] text-sm">Resolve Issues Before Release</p>
          <p className="text-[#70808E] text-xs mt-0.5">Address all corrections before printing or releasing this packaging.</p>
        </div>
        <button onClick={() => navigate("reports")}
          className="font-display font-700 text-[#0B1118] px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shrink-0"
          style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)", boxShadow: "0 6px 20px rgba(114,216,244,0.18)"}}>
          Download Pre-Check Report
        </button>
      </div>
    </div>
  );
}
