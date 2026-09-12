import { useState } from "react";
import type { NavigateFn } from "../types";

const products = [
  { id: "INS-2411", name: "Parle-G Biscuits 100g", date: "11 Sep 2024", mode: "Inspector Review", status: "pass", issues: 0, category: "Food", img: "🍪" },
  { id: "INS-2410", name: "Aashirvaad Atta 5kg", date: "11 Sep 2024", mode: "Producer Pre-Check", status: "warning", issues: 2, category: "Food", img: "🌾" },
  { id: "INS-2409", name: "Amul Butter 100g", date: "10 Sep 2024", mode: "Consumer Check", status: "pass", issues: 0, category: "Food", img: "🧈" },
  { id: "INS-2408", name: "Tata Salt 1kg", date: "10 Sep 2024", mode: "Inspector Review", status: "fail", issues: 3, category: "Food", img: "🧂" },
  { id: "INS-2407", name: "Britannia Cheese Slices", date: "9 Sep 2024", mode: "Producer Pre-Check", status: "warning", issues: 1, category: "Food", img: "🧀" },
  { id: "INS-2406", name: "Dove Body Lotion 200ml", date: "8 Sep 2024", mode: "Inspector Review", status: "pass", issues: 0, category: "Personal Care", img: "🧴" },
  { id: "INS-2405", name: "Dettol Handwash 220ml", date: "8 Sep 2024", mode: "Consumer Check", status: "pass", issues: 0, category: "Personal Care", img: "🧼" },
  { id: "INS-2404", name: "Surf Excel Matic 2kg", date: "7 Sep 2024", mode: "Producer Pre-Check", status: "fail", issues: 2, category: "Household", img: "🫧" },
  { id: "INS-2403", name: "Maggi Noodles 70g", date: "6 Sep 2024", mode: "Inspector Review", status: "warning", issues: 1, category: "Food", img: "🍜" },
  { id: "INS-2402", name: "Colgate MaxFresh 150g", date: "5 Sep 2024", mode: "Inspector Review", status: "pass", issues: 0, category: "Personal Care", img: "🪥" },
];

const statusConfig = {
  pass: { label: "Compliant", bg: "rgba(89,201,157,0.1)", color: "#59C99D", dot: "#59C99D" },
  warning: { label: "Needs Review", bg: "rgba(230,185,106,0.1)", color: "#E6B96A", dot: "#E6B96A" },
  fail: { label: "Non-Compliant", bg: "rgba(239,115,122,0.1)", color: "#EF737A", dot: "#EF737A" },
};

const CARD = { background: "#17222D", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" };

export default function Products({ navigate }: { navigate: NavigateFn }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const filtered = products
    .filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== "All") {
        if (filterStatus === "Compliant" && p.status !== "pass") return false;
        if (filterStatus === "Review" && p.status !== "warning") return false;
        if (filterStatus === "Non-Compliant" && p.status !== "fail") return false;
      }
      if (filterCategory !== "All" && p.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : b.id.localeCompare(a.id));

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-7 gap-4">
        <div>
          <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">Products & History</h1>
          <p className="text-[#70808E] text-sm mt-0.5">{products.length} inspections total</p>
        </div>
        <button onClick={() => navigate("new-scan")}
          className="font-display font-semibold text-[#0B1118] px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all flex items-center gap-1.5"
          style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)", boxShadow: "0 6px 20px rgba(114,216,244,0.18)"}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Scan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#53616D" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="#53616D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or inspection ID..."
            className="w-full pl-8 pr-4 py-2.5 rounded-xl text-[#F4F7FA] text-sm outline-none transition-all"
            style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.07)"}}
            onFocus={(e) => { e.target.style.borderColor = "rgba(114,216,244,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(114,216,244,0.07)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        {[
          { label: "Status", value: filterStatus, setter: setFilterStatus, options: ["All", "Compliant", "Review", "Non-Compliant"] },
          { label: "Category", value: filterCategory, setter: setFilterCategory, options: ["All", "Food", "Personal Care", "Household"] },
          { label: "Sort", value: sortBy, setter: setSortBy, options: ["date", "name"] },
        ].map((f) => (
          <select key={f.label} value={f.value} onChange={(e) => f.setter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl text-[#F4F7FA] text-sm outline-none appearance-none cursor-pointer"
            style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.07)"}}>
            {f.options.map((o) => (
              <option key={o} value={o} style={{background: "#17222D"}}>
                {f.label === "Sort" ? (o === "date" ? "Newest first" : "Name A-Z") : o}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3 border-b"
          style={{borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)"}}>
          {["Product", "Date", "Mode", "Status", "Action"].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wide text-[#53616D] font-display">{h}</span>
          ))}
        </div>

        <div>
          {filtered.map((p, idx) => {
            const sc = statusConfig[p.status as keyof typeof statusConfig];
            return (
              <div key={p.id}
                className="grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-4 cursor-pointer gap-3 transition-colors"
                style={{borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none"}}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                onClick={() => navigate("inspection-result")}>
                <div className="flex items-center gap-3">
                  <span className="text-xl w-9 text-center shrink-0">{p.img}</span>
                  <div>
                    <p className="font-display font-600 text-[#F4F7FA] text-sm">{p.name}</p>
                    <p className="text-[#53616D] text-xs">{p.id} · {p.category}</p>
                  </div>
                </div>
                <p className="text-[#70808E] text-sm">{p.date}</p>
                <p className="text-[#A7B4C0] text-sm">{p.mode}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full font-display"
                    style={{background: sc.bg, color: sc.color, border: `1px solid ${sc.dot}25`}}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{background: sc.dot}} />
                    {sc.label}
                  </span>
                  {p.issues > 0 && (
                    <span className="text-xs text-[#53616D]">{p.issues} issue{p.issues > 1 ? "s" : ""}</span>
                  )}
                </div>
                <button className="text-[#72D8F4] text-xs font-medium hover:underline transition-colors whitespace-nowrap"
                  onClick={(e) => { e.stopPropagation(); navigate("reports"); }}>
                  Report →
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[#53616D] text-sm">No inspections match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
