import { useState, useEffect } from "react";
import type { NavigateFn } from "../types";

interface Props { navigate: NavigateFn; }

/* ── shared tokens ── */
const GLASS = {
  background: "rgba(20,30,40,0.58)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
} as const;

const BTN_PRIMARY = {
  background: "linear-gradient(135deg, #72D8F4, #9C8CFF)",
  boxShadow: "0 8px 24px rgba(114,216,244,0.22)",
} as const;

function Navbar({ navigate }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between glass rounded-2xl px-5 py-3"
          style={{...GLASS, background: scrolled ? "rgba(11,17,24,0.88)" : "rgba(20,30,40,0.52)"}}>
          {/* Logo */}
          <button onClick={() => navigate("landing")} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#0B1118" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#0B1118" />
              </svg>
            </div>
            <span className="font-display font-700 text-[#F4F7FA] text-base">MetriCheck</span>
          </button>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6">
            {["Home", "How It Works", "For Consumers", "For Producers", "AI Assistant", "About"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-[#A7B4C0] hover:text-[#72D8F4] text-sm font-medium transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("login")}
              className="text-[#A7B4C0] hover:text-[#F4F7FA] text-sm font-medium transition-colors px-3 py-1.5">
              Login
            </button>
            <button onClick={() => navigate("login")}
              className="font-display font-semibold text-[#0B1118] text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:opacity-90"
              style={BTN_PRIMARY}>
              Check a Package →
            </button>
          </div>

          <button className="md:hidden text-[#A7B4C0]" onClick={() => setOpen(!open)}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="mt-1 glass rounded-2xl px-5 py-4 flex flex-col gap-3"
            style={{...GLASS, background: "rgba(11,17,24,0.95)"}}>
            {["Home", "How It Works", "For Consumers", "For Producers", "AI Assistant", "About"].map((item) => (
              <a key={item} href="#" className="text-[#A7B4C0] hover:text-[#72D8F4] text-sm font-medium py-1"
                onClick={() => setOpen(false)}>{item}</a>
            ))}
            <button onClick={() => navigate("login")}
              className="mt-2 font-display font-semibold text-[#0B1118] py-2.5 rounded-xl text-sm"
              style={BTN_PRIMARY}>
              Check a Package →
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function PackageVisual() {
  return (
    <div className="relative w-full h-[480px] flex items-center justify-center select-none">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full animate-ambient"
          style={{background: "radial-gradient(circle, rgba(114,216,244,0.14) 0%, transparent 70%)", filter: "blur(32px)"}} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full animate-ambient"
          style={{background: "radial-gradient(circle, rgba(156,140,255,0.1) 0%, transparent 70%)", filter: "blur(28px)", animationDelay: "2s"}} />
      </div>

      {/* Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-52 h-52 rounded-full border animate-pulse-ring"
          style={{borderColor: "rgba(114,216,244,0.12)"}} />
        <div className="absolute w-72 h-72 rounded-full border animate-pulse-ring"
          style={{borderColor: "rgba(114,216,244,0.07)", animationDelay: "1s"}} />
      </div>

      {/* Package */}
      <div className="animate-float relative">
        <div className="absolute -bottom-3 left-6 right-6 h-6 rounded-full"
          style={{background: "radial-gradient(ellipse, rgba(114,216,244,0.2) 0%, transparent 70%)", filter: "blur(8px)"}} />

        <div className="relative w-48 h-64 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(155deg, #1C2E3D 0%, #162434 60%, #112030 100%)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(114,216,244,0.1), inset 0 1px 0 rgba(114,216,244,0.08)"
          }}>
          {/* Highlight edge */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{background: "linear-gradient(to right, transparent, rgba(114,216,244,0.3), transparent)"}} />

          {/* Label surface */}
          <div className="absolute inset-3 rounded-xl overflow-hidden"
            style={{background: "rgba(20,32,44,0.8)", border: "1px solid rgba(114,216,244,0.1)"}}>
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded flex items-center justify-center"
                  style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#0B1118]" />
                </div>
                <div className="h-1.5 w-16 rounded" style={{background: "rgba(244,247,250,0.25)"}} />
              </div>
              <div className="h-px" style={{background: "rgba(255,255,255,0.06)"}} />
              {[82, 68, 62, 78].map((w, i) => (
                <div key={i} className="h-1.5 rounded"
                  style={{width: `${w}%`, background: i === 3 ? "rgba(230,185,106,0.5)" : "rgba(244,247,250,0.2)"}} />
              ))}
              <div className="mt-1 h-8 rounded flex items-center justify-center gap-px"
                style={{background: "rgba(114,216,244,0.05)", border: "1px solid rgba(114,216,244,0.08)"}}>
                {[14,10,16,8,12,10,14,8,12,16,10,14].map((h, i) => (
                  <div key={i} className="w-0.5 rounded-full"
                    style={{height: `${h}px`, background: "rgba(114,216,244,0.3)"}} />
                ))}
              </div>
            </div>

            {/* Scan line */}
            <div className="absolute top-[8%] left-1 right-1 h-px animate-scan-line pointer-events-none"
              style={{background: "linear-gradient(to right, transparent, #72D8F4, #B8EDEA, #72D8F4, transparent)", boxShadow: "0 0 8px #72D8F4"}} />
            {[20,40,60,80].map((pct) => (
              <div key={pct} className="absolute right-1 w-1.5 h-px"
                style={{top: `${pct}%`, background: "rgba(114,216,244,0.2)"}} />
            ))}
          </div>
        </div>
      </div>

      {/* Glass chips */}
      <div className="chip-1 absolute left-2 top-24 glass rounded-full px-3 py-1.5 flex items-center gap-2"
        style={{background: "rgba(20,30,40,0.7)", border: "1px solid rgba(89,201,157,0.3)", boxShadow: "0 4px 16px rgba(89,201,157,0.1)"}}>
        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#59C99D", fontSize: "9px"}}>✓</span>
        <span className="text-[#F4F7FA] text-xs font-semibold font-display">MRP</span>
      </div>
      <div className="chip-2 absolute left-0 top-52 glass rounded-full px-3 py-1.5 flex items-center gap-2"
        style={{background: "rgba(20,30,40,0.7)", border: "1px solid rgba(89,201,157,0.3)", boxShadow: "0 4px 16px rgba(89,201,157,0.1)"}}>
        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#59C99D", fontSize: "9px"}}>✓</span>
        <span className="text-[#F4F7FA] text-xs font-semibold font-display">Net Quantity</span>
      </div>
      <div className="chip-3 absolute right-2 top-28 glass rounded-full px-3 py-1.5 flex items-center gap-2"
        style={{background: "rgba(20,30,40,0.7)", border: "1px solid rgba(89,201,157,0.3)", boxShadow: "0 4px 16px rgba(89,201,157,0.1)"}}>
        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#59C99D", fontSize: "9px"}}>✓</span>
        <span className="text-[#F4F7FA] text-xs font-semibold font-display">Manufacturer</span>
      </div>
      <div className="chip-4 absolute right-0 top-56 glass rounded-full px-3 py-1.5 flex items-center gap-2"
        style={{background: "rgba(20,30,40,0.7)", border: "1px solid rgba(230,185,106,0.3)", boxShadow: "0 4px 14px rgba(230,185,106,0.1)"}}>
        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#E6B96A", fontSize: "9px"}}>!</span>
        <span className="text-[#F4F7FA] text-xs font-semibold font-display">Consumer Care</span>
      </div>
    </div>
  );
}

const workflowSteps = [
  { n: "01", title: "Upload", desc: "Package images are uploaded", icon: "↑", color: "#72D8F4" },
  { n: "02", title: "Read", desc: "OCR extracts text content", icon: "◎", color: "#64D6C4" },
  { n: "03", title: "Identify", desc: "System recognises declarations", icon: "◈", color: "#9C8CFF" },
  { n: "04", title: "Check", desc: "Rule engine validates them", icon: "✓", color: "#59C99D" },
  { n: "05", title: "Flag", desc: "Possible issues highlighted", icon: "⚑", color: "#E6B96A" },
  { n: "06", title: "Explain", desc: "AI explains findings", icon: "✦", color: "#9C8CFF" },
  { n: "07", title: "Report", desc: "Results saved as report", icon: "▤", color: "#72D8F4" },
];

export default function Landing({ navigate }: Props) {
  return (
    <div className="min-h-screen" style={{background: "linear-gradient(160deg, #0B1118 0%, #101B26 50%, #0B1118 100%)"}}>
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none"
        style={{backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.5}} />

      <Navbar navigate={navigate} />

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full animate-ambient"
            style={{background: "radial-gradient(circle, rgba(114,216,244,0.07) 0%, transparent 65%)", filter: "blur(48px)"}} />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full animate-ambient"
            style={{background: "radial-gradient(circle, rgba(156,140,255,0.06) 0%, transparent 65%)", filter: "blur(48px)", animationDelay: "3s"}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{background: "rgba(114,216,244,0.08)", border: "1px solid rgba(114,216,244,0.2)"}}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#72D8F4] animate-glow-pulse" />
                <span className="text-[#72D8F4] text-xs font-semibold tracking-widest uppercase">AI-Powered Legal Metrology</span>
              </div>

              <h1 className="font-display font-800 leading-[1.05] mb-5"
                style={{fontSize: "clamp(48px, 6vw, 76px)", color: "#F4F7FA"}}>
                Every label<br />
                <span className="gradient-text">tells a story.</span>
              </h1>

              <p className="text-xl font-medium mb-3 font-display tracking-wide"
                style={{color: "#72D8F4"}}>
                Scan. Understand. Validate. Explain. Fix.
              </p>

              <p className="text-base leading-relaxed mb-8 max-w-lg" style={{color: "#A7B4C0"}}>
                Check packaged-commodity declarations faster and more clearly — whether you are buying a product, preparing packaging, or reviewing compliance.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={() => navigate("login")}
                  className="font-display font-semibold text-[#0B1118] px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center gap-2 text-sm"
                  style={BTN_PRIMARY}>
                  Check a Package
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <a href="#how-it-works"
                  className="font-display font-semibold px-6 py-3 rounded-xl text-[#F4F7FA] hover:bg-white/5 transition-all duration-200 text-sm"
                  style={{background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)"}}>
                  See How It Works
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Consumer Verification", "Producer Pre-Check", "AI-Assisted Explanation"].map((chip) => (
                  <span key={chip} className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{background: "rgba(114,216,244,0.08)", color: "#72D8F4", border: "1px solid rgba(114,216,244,0.15)"}}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div><PackageVisual /></div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 relative" style={{background: "#111A24"}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="font-display font-700 text-[#F4F7FA] leading-tight mb-4"
              style={{fontSize: "clamp(32px, 4vw, 48px)"}}>
              Labels carry the information.<br />
              <span className="gradient-text">Finding what is missing</span> shouldn&apos;t be difficult.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: "👤", role: "Consumers", color: "#72D8F4", border: "rgba(114,216,244,0.15)",
                text: "Need a simple way to understand whether key declarations are present on packaged goods they purchase." },
              { icon: "🏭", role: "Producers", color: "#9C8CFF", border: "rgba(156,140,255,0.15)",
                text: "Need to catch packaging mistakes before printing or release — not after a product is already on shelves." },
              { icon: "📋", role: "Compliance Teams", color: "#64D6C4", border: "rgba(100,214,196,0.15)",
                text: "Need faster inspection, clear evidence review, inspection history, and structured reporting." },
            ].map((item) => (
              <div key={item.role}
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{...GLASS, background: "rgba(17,26,36,0.8)", borderColor: item.border}}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{background: `${item.color}12`, border: `1px solid ${item.color}25`}}>
                  {item.icon}
                </div>
                <h3 className="font-display font-700 text-[#F4F7FA] text-lg mb-2">{item.role}</h3>
                <p className="text-[#A7B4C0] text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24" style={{background: "#0B1118"}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
              style={{background: "rgba(114,216,244,0.08)", border: "1px solid rgba(114,216,244,0.18)"}}>
              <span className="text-[#72D8F4] text-xs font-semibold tracking-widest uppercase">The Process</span>
            </div>
            <h2 className="font-display font-700 text-[#F4F7FA]" style={{fontSize: "clamp(32px, 4vw, 48px)"}}>
              How MetriCheck works
            </h2>
            <p className="text-[#A7B4C0] mt-3 text-base max-w-xl mx-auto">
              From image upload to compliance report in seconds — with AI explaining every finding.
            </p>
          </div>

          {/* Connecting line */}
          <div className="relative">
            <div className="hidden lg:block absolute top-9 left-0 right-0 h-px"
              style={{background: "linear-gradient(to right, transparent, rgba(114,216,244,0.2) 10%, rgba(114,216,244,0.2) 90%, transparent)"}} />

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 lg:gap-4">
              {workflowSteps.map((step, i) => (
                <div key={step.n} className="relative flex flex-col items-center text-center group">
                  <div className="relative z-10 rounded-2xl flex flex-col items-center justify-center mb-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                    style={{
                      width: "68px", height: "68px",
                      background: `${step.color}12`,
                      border: `1px solid ${step.color}25`,
                      boxShadow: `0 0 0 0 ${step.color}`,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${step.color}20`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                    <span className="font-display font-700 mb-0.5" style={{color: step.color, fontSize: "10px"}}>{step.n}</span>
                    <span className="text-lg" style={{color: step.color}}>{step.icon}</span>
                  </div>
                  <h4 className="font-display font-700 text-[#F4F7FA] text-sm mb-1">{step.title}</h4>
                  <p className="text-[#70808E] text-xs leading-relaxed">{step.desc}</p>
                  {i < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-3 w-2.5 h-2.5 rounded-full z-20"
                      style={{background: step.color, boxShadow: `0 0 8px ${step.color}`}} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <button onClick={() => navigate("login")}
              className="font-display font-semibold text-[#0B1118] px-6 py-3 rounded-xl hover:opacity-90 transition-all text-sm"
              style={BTN_PRIMARY}>
              Try It Now →
            </button>
          </div>
        </div>
      </section>

      {/* ── DUAL PLATFORM ── */}
      <section id="for-consumers" className="py-24" style={{background: "#111A24"}}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display font-700 text-[#F4F7FA] text-center mb-3"
            style={{fontSize: "clamp(28px, 3.5vw, 44px)"}}>
            Verification on one side.
          </h2>
          <p className="font-display font-700 text-center mb-12 gradient-text"
            style={{fontSize: "clamp(28px, 3.5vw, 44px)"}}>
            Prevention on the other.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Consumer */}
            <div className="relative overflow-hidden rounded-3xl p-8 group cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{background: "linear-gradient(145deg, #0F1C28 0%, #0B1820 100%)", border: "1px solid rgba(114,216,244,0.12)", boxShadow: "0 20px 60px rgba(0,0,0,0.35)"}}>
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
                style={{background: "radial-gradient(circle, rgba(114,216,244,0.08) 0%, transparent 70%)", transform: "translate(30%,-30%)", filter: "blur(24px)"}} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{background: "rgba(114,216,244,0.1)", border: "1px solid rgba(114,216,244,0.2)"}}>👤</div>
                <p className="text-[#72D8F4] text-xs font-semibold tracking-widest uppercase mb-2 font-display">For Consumers</p>
                <h3 className="font-display font-700 text-[#F4F7FA] text-3xl mb-3">Check before you trust.</h3>
                <p className="text-[#A7B4C0] text-sm leading-relaxed mb-6 max-w-sm">
                  Scan packaging and understand whether key declarations appear present and readable — in plain language you can act on.
                </p>
                {["MRP declaration", "Net Quantity", "Manufacturer details"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 mb-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#59C99D", fontSize: "8px"}}>✓</div>
                    <span className="text-[#A7B4C0] text-sm">{item}</span>
                  </div>
                ))}
                <button onClick={() => navigate("login")}
                  className="mt-5 font-display font-semibold text-[#0B1118] px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all"
                  style={BTN_PRIMARY}>
                  Consumer Check →
                </button>
              </div>
            </div>

            {/* Producer */}
            <div className="relative overflow-hidden rounded-3xl p-8 group cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{background: "linear-gradient(145deg, #0E1A26 0%, #0B1520 100%)", border: "1px solid rgba(156,140,255,0.12)", boxShadow: "0 20px 60px rgba(0,0,0,0.35)"}}>
              <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none"
                style={{background: "radial-gradient(circle, rgba(156,140,255,0.08) 0%, transparent 70%)", transform: "translate(20%,20%)", filter: "blur(24px)"}} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{background: "rgba(156,140,255,0.1)", border: "1px solid rgba(156,140,255,0.2)"}}>🏭</div>
                <p className="text-[#9C8CFF] text-xs font-semibold tracking-widest uppercase mb-2 font-display">For Producers</p>
                <h3 className="font-display font-700 text-[#F4F7FA] text-3xl mb-3">Check before you print.</h3>
                <p className="text-[#A7B4C0] text-sm leading-relaxed mb-6 max-w-sm">
                  Upload packaging before release and identify issues early — so nothing reaches the market with missing or incorrect declarations.
                </p>
                {["Pre-release validation", "Issue detection", "Corrective guidance"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 mb-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[#0B1118]" style={{background: "#59C99D", fontSize: "8px"}}>✓</div>
                    <span className="text-[#A7B4C0] text-sm">{item}</span>
                  </div>
                ))}
                <button onClick={() => navigate("login")}
                  className="mt-5 font-display font-semibold text-[#F4F7FA] px-5 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-all"
                  style={{background: "rgba(156,140,255,0.12)", border: "1px solid rgba(156,140,255,0.25)"}}>
                  Start Pre-Check →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT ── */}
      <section id="ai-assistant" className="py-24" style={{background: "#0B1118"}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
                style={{background: "rgba(156,140,255,0.08)", border: "1px solid rgba(156,140,255,0.2)"}}>
                <span className="text-[#9C8CFF] text-xs font-semibold tracking-widest uppercase">Metri AI</span>
              </div>
              <h2 className="font-display font-700 text-[#F4F7FA] leading-tight mb-4"
                style={{fontSize: "clamp(32px, 4vw, 48px)"}}>
                Don&apos;t just flag the issue.<br />
                <span className="gradient-text">Explain it.</span>
              </h2>
              <p className="text-[#A7B4C0] text-base leading-relaxed mb-6 max-w-md">
                The rule engine decides PASS, WARNING, or FAIL. Metri AI explains what it means in simple language and suggests the next step.
              </p>
              {["Why did this fail?", "Explain this in simple language", "What should I correct?", "Summarize this inspection"].map((q) => (
                <div key={q} className="flex items-center gap-2 text-sm text-[#70808E] mb-2">
                  <span style={{color: "#9C8CFF"}}>→</span>
                  <span className="italic">&ldquo;{q}&rdquo;</span>
                </div>
              ))}
              <button onClick={() => navigate("login")}
                className="mt-5 font-display font-semibold text-[#0B1118] px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all"
                style={BTN_PRIMARY}>
                Try Metri AI →
              </button>
            </div>

            {/* Chat mockup */}
            <div className="rounded-3xl overflow-hidden"
              style={{...GLASS, background: "rgba(17,26,36,0.85)", border: "1px solid rgba(156,140,255,0.15)"}}>
              <div className="px-5 py-4 border-b flex items-center gap-3"
                style={{borderColor: "rgba(255,255,255,0.06)", background: "rgba(156,140,255,0.06)"}}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{background: "rgba(156,140,255,0.2)", border: "1px solid rgba(156,140,255,0.25)"}}>✦</div>
                <div>
                  <p className="font-display font-700 text-[#F4F7FA] text-sm">Metri AI</p>
                  <p className="text-[#70808E] text-xs">Your compliance companion</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#59C99D] animate-glow-pulse" />
                  <span className="text-xs text-[#70808E]">Active</span>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="rounded-2xl p-4"
                  style={{background: "rgba(230,185,106,0.07)", border: "1px solid rgba(230,185,106,0.2)"}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-700 text-[#F4F7FA] text-sm">Consumer Care Details</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full font-display"
                      style={{background: "rgba(230,185,106,0.15)", color: "#E6B96A"}}>Needs Review</span>
                  </div>
                  <p className="text-[#A7B4C0] text-xs leading-relaxed">
                    &ldquo;Customer support number detected, but full contact information may be incomplete.&rdquo;
                  </p>
                </div>

                <div className="flex justify-end">
                  <div className="text-[#F4F7FA] text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-xs"
                    style={{background: "rgba(114,216,244,0.12)", border: "1px solid rgba(114,216,244,0.2)"}}>
                    Why does this need review?
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 mt-0.5"
                    style={{background: "rgba(156,140,255,0.2)", border: "1px solid rgba(156,140,255,0.25)"}}>✦</div>
                  <div className="rounded-2xl rounded-bl-sm p-4 text-sm text-[#F4F7FA] leading-relaxed"
                    style={{background: "rgba(20,30,40,0.8)", border: "1px solid rgba(156,140,255,0.15)"}}>
                    <p>Under LM(PC) Rules, manufacturers must provide <strong className="text-[#9C8CFF]">complete consumer care details</strong> — including a physical address or email, not just a phone number.</p>
                    <div className="mt-3 pt-3 border-t" style={{borderColor: "rgba(156,140,255,0.15)"}}>
                      <p className="text-xs font-semibold text-[#9C8CFF] mb-1.5 font-display uppercase tracking-wide">Suggested next step</p>
                      <p className="text-[#A7B4C0] text-xs">Verify that a mailing address or email is present alongside the phone number on the label.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="about" className="py-16 border-t" style={{background: "#111A24", borderColor: "rgba(255,255,255,0.06)"}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#0B1118" />
                    <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
                    <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
                    <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#0B1118" />
                  </svg>
                </div>
                <span className="font-display font-700 text-[#F4F7FA] text-lg">MetriCheck</span>
              </div>
              <p className="text-[#70808E] text-sm leading-relaxed max-w-xs">
                A unified platform for consumers, producers, and compliance teams to check packaged-commodity declarations faster and more clearly.
              </p>
            </div>
            <div>
              <p className="text-[#72D8F4] text-xs font-semibold tracking-widest uppercase mb-4 font-display">Platform</p>
              {["Consumer Check", "Producer Pre-Check", "Inspector Review", "AI Assistant"].map((l) => (
                <button key={l} onClick={() => navigate("login")}
                  className="block text-[#70808E] text-sm hover:text-[#A7B4C0] transition-colors text-left mb-2">{l}</button>
              ))}
            </div>
            <div>
              <p className="text-[#72D8F4] text-xs font-semibold tracking-widest uppercase mb-4 font-display">Company</p>
              {["About", "How It Works", "Privacy Policy", "Terms of Use"].map((l) => (
                <a key={l} href="#" className="block text-[#70808E] text-sm hover:text-[#A7B4C0] transition-colors mb-2">{l}</a>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{borderColor: "rgba(255,255,255,0.06)"}}>
            <p className="text-[#53616D] text-xs">© 2024 MetriCheck. Compliance, simplified.</p>
            <p className="text-[#53616D] text-xs">AI extracts and explains. The rule engine decides compliance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
