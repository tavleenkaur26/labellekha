import { useState } from "react";
import type { NavigateFn } from "../types";

const GLASS = {
  background: "rgba(20,30,40,0.58)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const BTN_PRIMARY = {
  background: "linear-gradient(135deg, #72D8F4, #9C8CFF)",
  boxShadow: "0 8px 24px rgba(114,216,244,0.2)",
};

const roles = [
  { id: "consumer", label: "Consumer", icon: "👤", desc: "Scan and verify product labels" },
  { id: "producer", label: "Producer", icon: "🏭", desc: "Pre-check packaging before release" },
  { id: "inspector", label: "Inspector", icon: "📋", desc: "Review compliance evidence" },
  { id: "admin", label: "Admin", icon: "⚙️", desc: "Manage platform access" },
];

export default function Login({ navigate }: { navigate: NavigateFn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("inspector");

  return (
    <div className="min-h-screen flex" style={{background: "#0B1118"}}>
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{background: "linear-gradient(145deg, #0B1118 0%, #0F1C28 60%, #111A24 100%)", borderRight: "1px solid rgba(255,255,255,0.05)"}}>
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full animate-ambient"
            style={{background: "radial-gradient(circle, rgba(114,216,244,0.1) 0%, transparent 65%)", filter: "blur(40px)"}} />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full animate-ambient"
            style={{background: "radial-gradient(circle, rgba(156,140,255,0.08) 0%, transparent 65%)", filter: "blur(36px)", animationDelay: "2s"}} />
        </div>

        {/* Glass shapes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-72 h-72 rounded-3xl rotate-12"
            style={{background: "rgba(114,216,244,0.03)", border: "1px solid rgba(114,216,244,0.08)"}} />
          <div className="absolute w-56 h-56 rounded-3xl -rotate-12 translate-y-8"
            style={{background: "rgba(156,140,255,0.03)", border: "1px solid rgba(156,140,255,0.06)"}} />

          {/* Mini package */}
          <div className="relative animate-float-slow z-10">
            <div className="w-32 h-44 rounded-2xl"
              style={{
                background: "linear-gradient(145deg, rgba(20,36,52,0.9), rgba(14,26,40,0.85))",
                border: "1px solid rgba(114,216,244,0.15)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(114,216,244,0.08)"
              }}>
              <div className="p-3 flex flex-col gap-2 mt-2">
                {[90, 70, 80, 60, 75].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full"
                    style={{width: `${w}%`, background: `rgba(114,216,244,${0.12 + i * 0.04})`}} />
                ))}
              </div>
            </div>
            <div className="absolute -left-14 top-6 glass rounded-full px-3 py-1 flex items-center gap-1.5"
              style={{...GLASS, background: "rgba(20,30,40,0.8)", border: "1px solid rgba(89,201,157,0.25)"}}>
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#59C99D", fontSize: "7px"}}>✓</div>
              <span className="text-[#F4F7FA] text-xs font-display font-600">MRP</span>
            </div>
            <div className="absolute -right-14 bottom-10 glass rounded-full px-3 py-1 flex items-center gap-1.5"
              style={{...GLASS, background: "rgba(20,30,40,0.8)", border: "1px solid rgba(89,201,157,0.25)"}}>
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#59C99D", fontSize: "7px"}}>✓</div>
              <span className="text-[#F4F7FA] text-xs font-display font-600">Net Qty</span>
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#0B1118" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#0B1118" />
              </svg>
            </div>
            <span className="font-display font-700 text-[#F4F7FA] text-xl">MetriCheck</span>
          </div>
        </div>

        {/* Message */}
        <div className="relative z-10">
          <h2 className="font-display font-700 text-[#F4F7FA] text-3xl leading-tight mb-3">
            Trusted information.<br />Safer choices.
          </h2>
          <p className="text-[#70808E] text-sm leading-relaxed max-w-xs mb-8">
            Every packaged product deserves clear, verifiable declarations. MetriCheck makes that check instant.
          </p>
          {[
            { label: "AI-assisted analysis", color: "#72D8F4" },
            { label: "Rule-based compliance decisions", color: "#64D6C4" },
            { label: "Multi-role access control", color: "#9C8CFF" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 mb-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[#0B1118]" style={{background: f.color, fontSize: "8px"}}>✓</div>
              <span className="text-[#A7B4C0] text-sm">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
        style={{background: "#0B1118"}}>
        <div className="w-full max-w-md">
          <button onClick={() => navigate("landing")}
            className="flex items-center gap-1.5 text-[#70808E] hover:text-[#A7B4C0] text-sm transition-colors mb-8">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </button>

          <h1 className="font-display font-700 text-[#F4F7FA] text-3xl mb-1">Welcome back</h1>
          <p className="text-[#70808E] text-sm mb-8">Sign in to your MetriCheck account</p>

          <form onSubmit={(e) => { e.preventDefault(); navigate("dashboard"); }} className="flex flex-col gap-5">
            {[
              { label: "Email address", value: email, setter: setEmail, type: "email", placeholder: "riya@company.com" },
              { label: "Password", value: password, setter: setPassword, type: "password", placeholder: "••••••••" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[#A7B4C0] text-sm font-medium mb-1.5">{f.label}</label>
                <input type={f.type} value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-[#F4F7FA] text-sm outline-none transition-all"
                  style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)"}}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(114,216,244,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(114,216,244,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.2)"; }}
                />
                {f.type === "password" && (
                  <div className="flex justify-end mt-1.5">
                    <a href="#" className="text-[#72D8F4] text-xs hover:underline">Forgot password?</a>
                  </div>
                )}
              </div>
            ))}

            {/* Role tiles */}
            <div>
              <label className="block text-[#A7B4C0] text-sm font-medium mb-2">Sign in as</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className="flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200"
                    style={{
                      background: role === r.id ? "rgba(114,216,244,0.08)" : "#17222D",
                      borderColor: role === r.id ? "rgba(114,216,244,0.4)" : "rgba(255,255,255,0.07)",
                      boxShadow: role === r.id ? "0 0 0 1px rgba(114,216,244,0.2)" : "none"
                    }}>
                    <span className="text-base mt-0.5">{r.icon}</span>
                    <div>
                      <p className="font-display font-600 text-[#F4F7FA] text-xs">{r.label}</p>
                      <p className="text-[#70808E] text-xs leading-snug mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit"
              className="font-display font-700 text-[#0B1118] py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-1 hover:opacity-90 transition-all"
              style={BTN_PRIMARY}>
              Sign In
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>

          <p className="text-[#53616D] text-xs text-center mt-6">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-[#72D8F4] font-medium hover:underline">Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}
