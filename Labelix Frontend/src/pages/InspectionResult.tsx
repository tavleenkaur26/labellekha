import { useState } from "react";
import type { NavigateFn } from "../types";

const CARD = { background: "#17222D", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" };

type Status = "pass" | "warning" | "fail";

interface Finding {
  id: string; category: string; detected: string; status: Status;
  explanation: string; suggestion: string;
  region: { top: string; left: string; w: string; h: string };
}

const findings: Finding[] = [
  { id: "f1", category: "Product / Commodity Identity", detected: "Parle-G Original Gluco Biscuits", status: "pass",
    explanation: "Product name and commodity description are clearly stated on the front panel.", suggestion: "No action required.",
    region: { top: "8%", left: "10%", w: "70%", h: "10%" } },
  { id: "f2", category: "Manufacturer / Packer Details", detected: "Parle Products Pvt. Ltd., Mumbai - 400 028", status: "pass",
    explanation: "Manufacturer name and address are present and complete.", suggestion: "No action required.",
    region: { top: "35%", left: "10%", w: "75%", h: "10%" } },
  { id: "f3", category: "Net Quantity", detected: "100 g (net)", status: "pass",
    explanation: "Net quantity is declared in standard units and prominently placed.", suggestion: "No action required.",
    region: { top: "22%", left: "10%", w: "40%", h: "8%" } },
  { id: "f4", category: "MRP", detected: "MRP ₹10.00 (Incl. of all taxes)", status: "pass",
    explanation: "MRP is clearly declared with tax inclusion statement.", suggestion: "No action required.",
    region: { top: "50%", left: "10%", w: "65%", h: "8%" } },
  { id: "f5", category: "Month / Year Declaration", detected: "Best Before: Jun 2025", status: "pass",
    explanation: "Best before date is declared in month/year format as required.", suggestion: "No action required.",
    region: { top: "62%", left: "10%", w: "50%", h: "7%" } },
  { id: "f6", category: "Consumer Care Details", detected: "1800-266-1111 (Toll Free)", status: "warning",
    explanation: "Consumer care number is present but a complete mailing address or email contact is not clearly visible.",
    suggestion: "Verify that a full physical address or email ID is also provided for the consumer care contact.",
    region: { top: "74%", left: "10%", w: "60%", h: "8%" } },
  { id: "f7", category: "Readability", detected: "Font size approx. 1mm in ingredient area", status: "warning",
    explanation: "The ingredient declaration text appears to be below the minimum recommended font size.",
    suggestion: "Ensure all mandatory declarations meet the minimum font size requirement of 1mm stroke height.",
    region: { top: "84%", left: "10%", w: "80%", h: "9%" } },
  { id: "f8", category: "Placement / Completeness", detected: "All mandatory panels present", status: "pass",
    explanation: "Front, back, and side panels are accounted for with relevant declarations placed appropriately.", suggestion: "No action required.",
    region: { top: "16%", left: "10%", w: "80%", h: "6%" } },
];

const statusConfig: Record<Status, { label: string; bg: string; color: string; dot: string; icon: string }> = {
  pass: { label: "PASS", bg: "rgba(89,201,157,0.1)", color: "#59C99D", dot: "#59C99D", icon: "✓" },
  warning: { label: "WARNING", bg: "rgba(230,185,106,0.1)", color: "#E6B96A", dot: "#E6B96A", icon: "!" },
  fail: { label: "FAIL", bg: "rgba(239,115,122,0.1)", color: "#EF737A", dot: "#EF737A", icon: "✕" },
};

const imgTabs = ["Front", "Back", "Side", "All Images"];
const resultTabs = ["All", "Passed", "Review", "Failed"];

export default function InspectionResult({ navigate }: { navigate: NavigateFn }) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [resultTab, setResultTab] = useState("All");
  const [selectedFinding, setSelectedFinding] = useState<string | null>("f6");
  const [showAI, setShowAI] = useState(false);

  const filtered = findings.filter((f) => {
    if (resultTab === "All") return true;
    if (resultTab === "Passed") return f.status === "pass";
    if (resultTab === "Review") return f.status === "warning";
    if (resultTab === "Failed") return f.status === "fail";
    return true;
  });

  const activeFinding = findings.find((f) => f.id === selectedFinding);
  const passCount = findings.filter((f) => f.status === "pass").length;
  const warnCount = findings.filter((f) => f.status === "warning").length;
  const failCount = findings.filter((f) => f.status === "fail").length;
  const overallStatus: Status = failCount > 0 ? "fail" : warnCount > 0 ? "warning" : "pass";
  const overall = statusConfig[overallStatus];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <button onClick={() => navigate("products")} className="text-[#53616D] hover:text-[#A7B4C0] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-[#53616D] text-sm">INS-2410</span>
          </div>
          <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">Aashirvaad Atta 5kg</h1>
          <p className="text-[#70808E] text-sm mt-0.5">Inspector Review · 11 Sep 2024 · Food &amp; Beverages</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-display font-700 text-sm"
            style={{background: overall.bg, color: overall.color, border: `1.5px solid ${overall.dot}30`}}>
            <span>{overall.icon}</span>{overall.label}
          </span>
          <button onClick={() => navigate("reports")}
            className="font-display font-semibold text-[#0B1118] px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-all"
            style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
            Download Report
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {[
          { label: "Passed", count: passCount, color: "#59C99D" },
          { label: "Needs Review", count: warnCount, color: "#E6B96A" },
          { label: "Failed", count: failCount, color: "#EF737A" },
        ].map((pill) => (
          <div key={pill.label} className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl"
            style={{background: `${pill.color}12`, border: `1px solid ${pill.color}25`}}>
            <span className="font-display font-700 text-base" style={{color: pill.color}}>{pill.count}</span>
            <span className="text-xs" style={{color: pill.color}}>{pill.label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: evidence viewer */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            {/* Image tabs */}
            <div className="flex border-b" style={{borderColor: "rgba(255,255,255,0.05)"}}>
              {imgTabs.map((tab, i) => (
                <button key={tab} onClick={() => setSelectedImg(i)}
                  className="flex-1 py-2.5 text-xs font-display font-600 transition-all"
                  style={{
                    color: selectedImg === i ? "#72D8F4" : "#53616D",
                    borderBottom: selectedImg === i ? "2px solid #72D8F4" : "2px solid transparent",
                    background: "transparent"
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Package image area */}
            <div className="relative"
              style={{background: "linear-gradient(145deg, #0F1C28 0%, #111A24 100%)", minHeight: "320px"}}>
              <div className="absolute inset-0"
                style={{background: "radial-gradient(ellipse at 50% 40%, rgba(114,216,244,0.05) 0%, transparent 65%)"}} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-44 h-60 rounded-2xl overflow-hidden"
                  style={{background: "rgba(20,36,52,0.9)", border: "1.5px solid rgba(114,216,244,0.2)"}}>
                  <div className="p-3 flex flex-col gap-1.5">
                    {[85, 65, 90, 58, 72, 80, 60, 75].map((w, i) => (
                      <div key={i} className="h-1.5 rounded-full"
                        style={{width: `${w}%`, background: `rgba(114,216,244,${0.08 + (i % 3) * 0.04})`}} />
                    ))}
                  </div>
                  {activeFinding && (
                    <div className="absolute pointer-events-none transition-all duration-400 rounded"
                      style={{
                        top: activeFinding.region.top, left: activeFinding.region.left,
                        width: activeFinding.region.w, height: activeFinding.region.h,
                        border: `2px solid ${statusConfig[activeFinding.status].dot}`,
                        background: `${statusConfig[activeFinding.status].dot}15`,
                        boxShadow: `0 0 10px ${statusConfig[activeFinding.status].dot}40`
                      }} />
                  )}
                </div>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {["+", "−"].map((icon) => (
                  <button key={icon}
                    className="w-7 h-7 rounded-lg text-[#A7B4C0] text-sm flex items-center justify-center transition-colors hover:text-[#F4F7FA]"
                    style={{background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)"}}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {activeFinding && (
              <div className="p-4 border-t" style={{borderColor: "rgba(255,255,255,0.05)"}}>
                <button onClick={() => setShowAI(!showAI)}
                  className="w-full font-display font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  style={{
                    background: showAI ? "rgba(156,140,255,0.12)" : "rgba(156,140,255,0.07)",
                    color: "#9C8CFF",
                    border: "1.5px solid rgba(156,140,255,0.25)"
                  }}>
                  ✦ Ask AI About This Finding
                </button>
                {showAI && (
                  <div className="mt-3 p-3.5 rounded-xl" style={{background: "rgba(156,140,255,0.07)", border: "1px solid rgba(156,140,255,0.18)"}}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs" style={{background: "rgba(156,140,255,0.2)", color: "#9C8CFF"}}>✦</div>
                      <span className="font-display font-600 text-[#A7B4C0] text-xs">Metri AI</span>
                    </div>
                    <p className="text-[#A7B4C0] text-xs leading-relaxed">
                      {activeFinding.explanation}{activeFinding.suggestion !== "No action required." ? " " + activeFinding.suggestion : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: declaration checks */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div className="flex border-b px-4" style={{borderColor: "rgba(255,255,255,0.05)"}}>
              {resultTabs.map((tab) => (
                <button key={tab} onClick={() => setResultTab(tab)}
                  className="py-3 px-3 text-xs font-display font-600 transition-all"
                  style={{
                    color: resultTab === tab ? "#72D8F4" : "#53616D",
                    borderBottom: resultTab === tab ? "2px solid #72D8F4" : "2px solid transparent"
                  }}>
                  {tab}
                  {tab !== "All" && (
                    <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: tab === "Passed" ? "rgba(89,201,157,0.1)" : tab === "Review" ? "rgba(230,185,106,0.1)" : "rgba(239,115,122,0.1)",
                        color: tab === "Passed" ? "#59C99D" : tab === "Review" ? "#E6B96A" : "#EF737A"
                      }}>
                      {tab === "Passed" ? passCount : tab === "Review" ? warnCount : failCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div>
              {filtered.map((f, idx) => {
                const sc = statusConfig[f.status];
                const isSelected = selectedFinding === f.id;
                return (
                  <div key={f.id}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      background: isSelected ? "rgba(114,216,244,0.04)" : "transparent"
                    }}
                    onClick={() => { setSelectedFinding(f.id); setShowAI(false); }}>
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-700 text-[#F4F7FA] text-sm mb-0.5">{f.category}</p>
                          <p className="text-[#70808E] text-xs truncate">{f.detected}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 shrink-0 text-xs font-display font-700 px-2.5 py-1 rounded-full"
                          style={{background: sc.bg, color: sc.color, border: `1px solid ${sc.dot}25`}}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{background: sc.dot}} />
                          {sc.label}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t" style={{borderColor: "rgba(255,255,255,0.05)"}}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="rounded-xl p-3"
                              style={{background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)"}}>
                              <p className="text-[#53616D] text-xs font-semibold uppercase tracking-wide mb-1 font-display">Detected text</p>
                              <p className="text-[#A7B4C0] text-xs leading-relaxed">{f.detected}</p>
                            </div>
                            <div className="rounded-xl p-3"
                              style={{background: `${sc.dot}0D`, border: `1px solid ${sc.dot}25`}}>
                              <p className="text-xs font-semibold uppercase tracking-wide mb-1 font-display" style={{color: sc.color}}>Finding</p>
                              <p className="text-[#A7B4C0] text-xs leading-relaxed">{f.explanation}</p>
                            </div>
                          </div>
                          {f.suggestion !== "No action required." && (
                            <div className="mt-2.5 rounded-xl p-3"
                              style={{background: "rgba(114,216,244,0.06)", border: "1px solid rgba(114,216,244,0.15)"}}>
                              <p className="text-[#72D8F4] text-xs font-semibold uppercase tracking-wide mb-1 font-display">Suggested next step</p>
                              <p className="text-[#A7B4C0] text-xs leading-relaxed">{f.suggestion}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
