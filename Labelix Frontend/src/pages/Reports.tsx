import { useState } from "react";
import type { NavigateFn } from "../types";

const CARD = { background: "#17222D", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" };

const reports = [
  { id: "RPT-2411", product: "Parle-G Biscuits 100g", date: "11 Sep 2024", mode: "Inspector Review",
    status: "pass", passed: 8, warned: 0, failed: 0, img: "🍪", category: "Food & Beverages",
    summary: "All 8 declarations are present and compliant. No issues identified." },
  { id: "RPT-2410", product: "Aashirvaad Atta 5kg", date: "11 Sep 2024", mode: "Producer Pre-Check",
    status: "warning", passed: 5, warned: 3, failed: 0, img: "🌾", category: "Food & Beverages",
    summary: "3 declarations require correction before release. No missing declarations." },
  { id: "RPT-2408", product: "Tata Salt 1kg", date: "10 Sep 2024", mode: "Inspector Review",
    status: "fail", passed: 5, warned: 1, failed: 2, img: "🧂", category: "Food & Beverages",
    summary: "2 mandatory declarations are non-compliant. Immediate review required." },
  { id: "RPT-2406", product: "Dove Body Lotion 200ml", date: "8 Sep 2024", mode: "Inspector Review",
    status: "pass", passed: 8, warned: 0, failed: 0, img: "🧴", category: "Personal Care",
    summary: "All declarations are present and in the correct format." },
  { id: "RPT-2404", product: "Surf Excel Matic 2kg", date: "7 Sep 2024", mode: "Producer Pre-Check",
    status: "fail", passed: 6, warned: 0, failed: 2, img: "🫧", category: "Household",
    summary: "2 declarations failed compliance check. Corrective action needed." },
];

const statusConfig = {
  pass: { label: "Compliant", bg: "rgba(89,201,157,0.1)", color: "#59C99D", dot: "#59C99D" },
  warning: { label: "Needs Review", bg: "rgba(230,185,106,0.1)", color: "#E6B96A", dot: "#E6B96A" },
  fail: { label: "Non-Compliant", bg: "rgba(239,115,122,0.1)", color: "#EF737A", dot: "#EF737A" },
};

export default function Reports({ navigate: _navigate }: { navigate: NavigateFn }) {
  const [preview, setPreview] = useState<string | null>(null);
  const previewReport = reports.find((r) => r.id === preview);

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">Reports</h1>
        <p className="text-[#70808E] text-sm mt-0.5">{reports.length} compliance reports available</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Reports list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {reports.map((r) => {
            const sc = statusConfig[r.status as keyof typeof statusConfig];
            const isActive = preview === r.id;
            return (
              <div key={r.id}
                className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  ...CARD,
                  borderColor: isActive ? "rgba(114,216,244,0.25)" : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? "0 0 0 1px rgba(114,216,244,0.15), 0 8px 24px rgba(0,0,0,0.25)" : "0 8px 24px rgba(0,0,0,0.2)"
                }}
                onClick={() => setPreview(isActive ? null : r.id)}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{r.img}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <h3 className="font-display font-700 text-[#F4F7FA] text-sm truncate">{r.product}</h3>
                      <span className="inline-flex items-center gap-1.5 shrink-0 text-xs font-display font-600 px-2.5 py-1 rounded-full"
                        style={{background: sc.bg, color: sc.color, border: `1px solid ${sc.dot}25`}}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{background: sc.dot}} />
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-[#53616D] text-xs mb-2">{r.id} · {r.date} · {r.mode}</p>
                    <p className="text-[#70808E] text-xs leading-relaxed">{r.summary}</p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        {[
                          { v: r.passed, label: "Passed", c: "#59C99D" },
                          { v: r.warned, label: "Review", c: "#E6B96A" },
                          { v: r.failed, label: "Failed", c: "#EF737A" },
                        ].map((pill) => (
                          <span key={pill.label} className="text-xs font-medium" style={{color: pill.c}}>
                            {pill.v} {pill.label}
                          </span>
                        ))}
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {["↓ PDF", "↓ Editable"].map((btn) => (
                          <button key={btn}
                            className="text-xs font-display font-semibold px-3 py-1.5 rounded-lg transition-colors hover:text-[#F4F7FA]"
                            style={{background: "rgba(255,255,255,0.06)", color: "#A7B4C0", border: "1px solid rgba(255,255,255,0.07)"}}
                            onClick={(e) => e.stopPropagation()}>
                            {btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview panel */}
        <div>
          {previewReport ? (
            <div className="rounded-2xl overflow-hidden sticky top-5" style={CARD}>
              <div className="px-5 py-4 border-b"
                style={{background: "linear-gradient(135deg, rgba(114,216,244,0.12), rgba(156,140,255,0.12))", borderColor: "rgba(114,216,244,0.1)"}}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{previewReport.img}</span>
                  <div>
                    <p className="font-display font-700 text-[#F4F7FA] text-sm">{previewReport.product}</p>
                    <p className="text-[#70808E] text-xs">{previewReport.id} · {previewReport.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { v: previewReport.passed, c: "#59C99D", label: "Passed" },
                    { v: previewReport.warned, c: "#E6B96A", label: "Review" },
                    { v: previewReport.failed, c: "#EF737A", label: "Failed" },
                  ].map((pill) => (
                    <span key={pill.label} className="text-xs px-2.5 py-1 rounded-full font-display font-600"
                      style={{background: `${pill.c}18`, color: pill.c}}>
                      {pill.v} {pill.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {[
                  { label: "Inspection Mode", value: previewReport.mode },
                  { label: "Category", value: previewReport.category },
                  { label: "Summary", value: previewReport.summary },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#53616D] mb-1 font-display">{row.label}</p>
                    <p className="text-[#A7B4C0] text-sm leading-relaxed">{row.value}</p>
                  </div>
                ))}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#53616D] mb-2 font-display">Declaration Breakdown</p>
                  <div className="h-2.5 rounded-full overflow-hidden flex">
                    <div style={{width: `${(previewReport.passed / 8) * 100}%`, background: "#59C99D"}} />
                    <div style={{width: `${(previewReport.warned / 8) * 100}%`, background: "#E6B96A"}} />
                    <div style={{width: `${(previewReport.failed / 8) * 100}%`, background: "#EF737A"}} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="w-full font-display font-700 text-[#0B1118] py-2.5 rounded-xl text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v8M3 9l4 4 4-4M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download PDF
                  </button>
                  <button className="w-full font-display font-semibold text-[#A7B4C0] py-2.5 rounded-xl text-sm transition-all hover:text-[#F4F7FA]"
                    style={{background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)"}}>
                    Download Editable
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
              style={{...CARD, borderStyle: "dashed", minHeight: "200px"}}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3"
                style={{background: "rgba(255,255,255,0.04)"}}>📄</div>
              <p className="font-display font-600 text-[#A7B4C0] text-sm">Select a report</p>
              <p className="text-[#53616D] text-xs mt-1">Click any report to preview it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
