import { useState } from "react";
import type { NavigateFn } from "../types";

interface ConsumerFinding { category: string; status: "ok" | "attention" | "missing"; plain: string; }

const findings: ConsumerFinding[] = [
  { category: "Price (MRP)", status: "ok", plain: "The maximum retail price is clearly printed on the packaging." },
  { category: "Weight / Quantity", status: "ok", plain: "The net weight is stated and easy to find on the label." },
  { category: "Manufacturer", status: "ok", plain: "The manufacturer name and address are visible on the back panel." },
  { category: "Best Before", status: "ok", plain: "A best before date is printed in the correct format." },
  { category: "Consumer Helpline", status: "attention", plain: "A helpline number is present, but a full mailing address or email may be missing." },
  { category: "Ingredient List", status: "attention", plain: "Ingredients are listed, but the text may be too small to read comfortably." },
];

const statusConfig = {
  ok: { icon: "✓", label: "Detected correctly", bg: "rgba(89,201,157,0.08)", border: "rgba(89,201,157,0.2)", color: "#59C99D" },
  attention: { icon: "⚠", label: "Needs attention", bg: "rgba(230,185,106,0.08)", border: "rgba(230,185,106,0.2)", color: "#E6B96A" },
  missing: { icon: "✕", label: "Possibly missing", bg: "rgba(239,115,122,0.08)", border: "rgba(239,115,122,0.2)", color: "#EF737A" },
};

export default function ConsumerResult({ navigate }: { navigate: NavigateFn }) {
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  const askAI = () => {
    setShowAI(true); setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setAiText("This package has most key declarations in place. The consumer helpline only shows a phone number — for full compliance, a physical address or email is also needed. The ingredient list font appears small, which could make it hard to read. Overall, the product is mostly fine for purchase, but you may want to note the helpline contact limitation.");
    }, 1400);
  };

  const okCount = findings.filter((f) => f.status === "ok").length;
  const attCount = findings.filter((f) => f.status === "attention").length;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <button onClick={() => navigate("new-scan")}
          className="flex items-center gap-1.5 text-[#53616D] text-sm hover:text-[#A7B4C0] transition-colors mb-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Check
        </button>
        <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">Package Check Result</h1>
        <p className="text-[#70808E] text-sm mt-1">Aashirvaad Atta 5kg · Consumer Check</p>
      </div>

      {/* Summary banner */}
      <div className="rounded-2xl p-5 mb-6"
        style={{background: "linear-gradient(135deg, rgba(114,216,244,0.05), rgba(89,201,157,0.05))", border: "1px solid rgba(114,216,244,0.12)"}}>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{background: "rgba(89,201,157,0.12)", border: "1px solid rgba(89,201,157,0.2)"}}>✓</div>
            <div>
              <p className="font-display font-700 text-[#F4F7FA] text-sm">{okCount} detected correctly</p>
              <p className="text-[#53616D] text-xs">All clear</p>
            </div>
          </div>
          {attCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{background: "rgba(230,185,106,0.12)", border: "1px solid rgba(230,185,106,0.2)"}}>⚠</div>
              <div>
                <p className="font-display font-700 text-[#F4F7FA] text-sm">{attCount} need attention</p>
                <p className="text-[#53616D] text-xs">Review suggested</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Findings */}
      <div className="flex flex-col gap-3 mb-6">
        {findings.map((f) => {
          const sc = statusConfig[f.status];
          return (
            <div key={f.category} className="rounded-2xl p-4 transition-all"
              style={{background: sc.bg, border: `1px solid ${sc.border}`}}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{background: `${sc.color}20`, color: sc.color}}>{sc.icon}</span>
                <span className="font-display font-700 text-[#F4F7FA] text-sm">{f.category}</span>
                <span className="ml-auto text-xs font-medium" style={{color: sc.color}}>{sc.label}</span>
              </div>
              <p className="text-[#A7B4C0] text-sm leading-relaxed pl-9">{f.plain}</p>
            </div>
          );
        })}
      </div>

      {showAI && (
        <div className="rounded-2xl mb-5 overflow-hidden"
          style={{background: "rgba(156,140,255,0.07)", border: "1px solid rgba(156,140,255,0.2)"}}>
          <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{borderColor: "rgba(156,140,255,0.15)"}}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
              style={{background: "rgba(156,140,255,0.2)", color: "#9C8CFF"}}>✦</div>
            <span className="font-display font-700 text-[#A7B4C0] text-sm">Metri AI Explanation</span>
          </div>
          <div className="p-4">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-[#70808E] text-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{background: "#9C8CFF", animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`}} />
                  ))}
                </div>
                Analysing findings...
              </div>
            ) : (
              <p className="text-[#A7B4C0] text-sm leading-relaxed">{aiText}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={askAI}
          className="flex-1 font-display font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          style={{background: "rgba(156,140,255,0.1)", color: "#9C8CFF", border: "1.5px solid rgba(156,140,255,0.25)"}}>
          ✦ Ask AI to Explain
        </button>
        <button onClick={() => navigate("reports")}
          className="flex-1 font-display font-700 text-[#0B1118] py-3 rounded-xl text-sm hover:opacity-90 transition-all"
          style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
          Save Result
        </button>
      </div>
    </div>
  );
}
