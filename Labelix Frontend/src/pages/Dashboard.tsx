import { useState } from "react";
import type { NavigateFn } from "../types";

const CARD = { background: "#17222D", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" };
const BTN_PRIMARY = { background: "linear-gradient(135deg, #72D8F4, #9C8CFF)", boxShadow: "0 6px 20px rgba(114,216,244,0.18)" };

const recentInspections = [
  { id: "INS-2411", product: "Parle-G Biscuits 100g", date: "11 Sep 2024", mode: "Inspector Review", status: "pass", issues: 0, img: "🍪" },
  { id: "INS-2410", product: "Aashirvaad Atta 5kg", date: "11 Sep 2024", mode: "Producer Pre-Check", status: "warning", issues: 2, img: "🌾" },
  { id: "INS-2409", product: "Amul Butter 100g", date: "10 Sep 2024", mode: "Consumer Check", status: "pass", issues: 0, img: "🧈" },
  { id: "INS-2408", product: "Tata Salt 1kg", date: "10 Sep 2024", mode: "Inspector Review", status: "fail", issues: 3, img: "🧂" },
  { id: "INS-2407", product: "Britannia Cheese Slices", date: "9 Sep 2024", mode: "Producer Pre-Check", status: "warning", issues: 1, img: "🧀" },
];

const trendData = [
  { month: "Apr", pass: 68, warn: 22, fail: 10 },
  { month: "May", pass: 72, warn: 19, fail: 9 },
  { month: "Jun", pass: 71, warn: 20, fail: 9 },
  { month: "Jul", pass: 75, warn: 17, fail: 8 },
  { month: "Aug", pass: 78, warn: 15, fail: 7 },
  { month: "Sep", pass: 82, warn: 13, fail: 5 },
];

const categories = [
  { name: "MRP Declaration", count: 28, color: "#EF737A" },
  { name: "Consumer Care Details", count: 22, color: "#E6B96A" },
  { name: "Net Quantity", count: 18, color: "#E6B96A" },
  { name: "Month/Year Declaration", count: 14, color: "#70808E" },
  { name: "Readability Issues", count: 12, color: "#70808E" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    pass: { label: "Compliant", bg: "rgba(89,201,157,0.1)", color: "#59C99D", dot: "#59C99D" },
    warning: { label: "Needs Review", bg: "rgba(230,185,106,0.1)", color: "#E6B96A", dot: "#E6B96A" },
    fail: { label: "Non-Compliant", bg: "rgba(239,115,122,0.1)", color: "#EF737A", dot: "#EF737A" },
  };
  const s = map[status] || map.warning;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full font-display"
      style={{background: s.bg, color: s.color, border: `1px solid ${s.dot}25`}}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background: s.dot}} />
      {s.label}
    </span>
  );
};

function TrendChart() {
  const max = 100; const w = 480; const h = 140;
  const padL = 32; const padR = 12; const padT = 10; const padB = 28;
  const cW = w - padL - padR; const cH = h - padT - padB; const n = trendData.length;

  const area = (key: "pass" | "warn" | "fail", color: string) => {
    const pts = trendData.map((d, i) => ({ x: padL + (i / (n - 1)) * cW, y: padT + cH - (d[key] / max) * cH }));
    const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
    return (
      <g key={key}>
        <defs>
          <linearGradient id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polygon points={`${pts[0].x},${padT + cH} ${line} ${pts[n-1].x},${padT + cH}`}
          fill={`url(#g-${key})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />)}
      </g>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{maxHeight: "140px"}}>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padT + cH - (v / max) * cH;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#53616D">{v}</text>
            </g>
          );
        })}
        {trendData.map((d, i) => {
          const x = padL + (i / (n - 1)) * cW;
          return <text key={i} x={x} y={h - 6} textAnchor="middle" fontSize="9" fill="#53616D">{d.month}</text>;
        })}
        {area("pass", "#59C99D")}
        {area("warn", "#E6B96A")}
        {area("fail", "#EF737A")}
      </svg>
    </div>
  );
}

export default function Dashboard({ navigate }: { navigate: NavigateFn }) {
  const [searchQ, setSearchQ] = useState("");

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex-1 max-w-sm relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#53616D" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="#53616D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search inspections..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[#F4F7FA] text-sm outline-none transition-all"
            style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.07)"}}
            onFocus={(e) => { e.target.style.borderColor = "rgba(114,216,244,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(114,216,244,0.08)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 rounded-xl transition-colors"
            style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.07)"}}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a7 7 0 100 14A7 7 0 009 2zM9 6v4l2.5 2" stroke="#70808E" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF737A]" />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-700 text-[#0B1118] text-sm cursor-pointer"
            style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>R</div>
          <button onClick={() => navigate("new-scan")}
            className="font-display font-semibold text-[#0B1118] px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all flex items-center gap-1.5"
            style={BTN_PRIMARY}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Scan
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display font-700 text-[#F4F7FA] text-3xl">Good morning, Riya ☀️</h1>
        <p className="text-[#70808E] text-sm mt-1">Let&apos;s make packaging safer together.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Total Inspections", value: "1,248", change: "+12 this week", icon: "📦", accent: "#72D8F4" },
          { label: "Compliant", value: "1,024", change: "82.1%", icon: "✓", accent: "#59C99D" },
          { label: "Needs Review", value: "162", change: "13.0%", icon: "!", accent: "#E6B96A" },
          { label: "Non-Compliant", value: "62", change: "4.9%", icon: "✕", accent: "#EF737A" },
        ].map((stat) => (
          <div key={stat.label}
            className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
            style={{...CARD, borderColor: `${stat.accent}18`}}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#70808E] font-medium">{stat.label}</span>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{background: `${stat.accent}12`, color: stat.accent}}>{stat.icon}</span>
            </div>
            <p className="font-display font-700 text-[#F4F7FA] text-2xl">{stat.value}</p>
            <p className="text-xs mt-1 font-medium" style={{color: stat.accent}}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Trend chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-700 text-[#F4F7FA] text-base">Compliance Trend</h3>
              <p className="text-[#53616D] text-xs mt-0.5">Apr — Sep 2024</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: "Compliant", c: "#59C99D" }, { label: "Review", c: "#E6B96A" }, { label: "Non-Compliant", c: "#EF737A" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{background: l.c}} />
                  <span className="text-xs text-[#70808E]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <TrendChart />
        </div>

        {/* Issue categories */}
        <div className="rounded-2xl p-5" style={CARD}>
          <h3 className="font-display font-700 text-[#F4F7FA] text-base mb-4">Frequent Issues</h3>
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#A7B4C0] font-medium">{c.name}</span>
                  <span className="text-xs text-[#70808E]">{c.count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{background: "rgba(255,255,255,0.05)"}}>
                  <div className="h-full rounded-full" style={{width: `${(c.count / 28) * 100}%`, background: c.color}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent inspections */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={CARD}>
          <div className="px-5 py-4 border-b flex items-center justify-between"
            style={{borderColor: "rgba(255,255,255,0.05)"}}>
            <h3 className="font-display font-700 text-[#F4F7FA] text-base">Recent Inspections</h3>
            <button onClick={() => navigate("products")} className="text-[#72D8F4] text-xs font-medium hover:underline">View all →</button>
          </div>
          <div>
            {recentInspections.map((ins, idx) => (
              <div key={ins.id}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors"
                style={{borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none"}}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                onClick={() => navigate("inspection-result")}>
                <span className="text-xl w-8 text-center shrink-0">{ins.img}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#F4F7FA] text-sm truncate font-display">{ins.product}</p>
                  <p className="text-[#53616D] text-xs mt-0.5">{ins.id} · {ins.date}</p>
                </div>
                <span className="text-xs text-[#70808E] hidden sm:block shrink-0">{ins.mode}</span>
                <StatusBadge status={ins.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Latest reports */}
        <div className="rounded-2xl p-5" style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-700 text-[#F4F7FA] text-base">Latest Reports</h3>
            <button onClick={() => navigate("reports")} className="text-[#72D8F4] text-xs font-medium hover:underline">View all →</button>
          </div>
          <div className="flex flex-col gap-2">
            {recentInspections.slice(0, 4).map((ins) => (
              <div key={ins.id}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                style={{background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)"}}
                onClick={() => navigate("reports")}>
                <span className="text-base">{ins.img}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#F4F7FA] text-xs truncate font-display">{ins.product}</p>
                  <p className="text-[#53616D] text-xs">{ins.date}</p>
                </div>
                <StatusBadge status={ins.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
