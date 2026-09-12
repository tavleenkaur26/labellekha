import type { Page, NavigateFn } from "../types";

interface SidebarItem { id: Page; label: string; icon: React.ReactNode; badge?: string; }

const navItems: SidebarItem[] = [
  { id: "dashboard", label: "Overview", icon: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )},
  { id: "new-scan", label: "New Scan", badge: "New", icon: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
  { id: "producer-precheck", label: "Pre-Check", icon: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L3 5v4c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.5 9l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )},
  { id: "products", label: "Products", icon: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 3V2M12 3V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 9h8M5 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
  { id: "reports", label: "Reports", icon: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M10 2H4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 11h6M6 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
  { id: "ai-assistant", label: "AI Assistant", icon: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 9.5c.5.8 1.4 1.5 2.5 1.5s2-.7 2.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6.5" cy="7" r="0.75" fill="currentColor" />
      <circle cx="11.5" cy="7" r="0.75" fill="currentColor" />
    </svg>
  )},
  { id: "settings", label: "Settings", icon: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.1 1.1M12.8 12.8l1.1 1.1M12.8 5.2l1.1-1.1M4.1 13.9l1.1-1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
];

interface Props { page: Page; navigate: NavigateFn; }

export default function Sidebar({ page, navigate }: Props) {
  return (
    <aside className="flex flex-col h-full w-60 shrink-0"
      style={{background: "rgba(13,22,31,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)"}}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{borderColor: "rgba(255,255,255,0.05)"}}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#0B1118" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#0B1118" opacity="0.6" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#0B1118" />
            </svg>
          </div>
          <div>
            <span className="font-display font-700 text-[#F4F7FA] text-sm">LabelLekha</span>
            <p className="text-[#53616D] text-xs">Compliance platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[#53616D] text-xs font-semibold tracking-widest uppercase px-3 mb-2 font-display">Navigation</p>
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = page === item.id;
            const isAI = item.id === "ai-assistant";
            return (
              <button key={item.id} onClick={() => navigate(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 w-full text-left group"
                style={{
                  background: active
                    ? isAI ? "rgba(156,140,255,0.12)" : "rgba(114,216,244,0.1)"
                    : "transparent",
                  border: active
                    ? isAI ? "1px solid rgba(156,140,255,0.2)" : "1px solid rgba(114,216,244,0.15)"
                    : "1px solid transparent",
                  color: active
                    ? isAI ? "#9C8CFF" : "#72D8F4"
                    : "#70808E",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#A7B4C0"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#70808E"; } }}>
                <span style={{color: active ? (isAI ? "#9C8CFF" : "#72D8F4") : "#53616D"}}>{item.icon}</span>
                <span className="font-display text-sm flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-display font-700 px-1.5 py-0.5 rounded-full"
                    style={{background: "rgba(114,216,244,0.12)", color: "#72D8F4"}}>
                    {item.badge}
                  </span>
                )}
                {active && (
                  <div className="w-1 h-4 rounded-full shrink-0"
                    style={{background: isAI ? "#9C8CFF" : "#72D8F4", boxShadow: `0 0 8px ${isAI ? "#9C8CFF" : "#72D8F4"}`}} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t" style={{borderColor: "rgba(255,255,255,0.05)"}}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-all"
          style={{border: "1px solid transparent"}}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-700 text-[#0B1118] text-sm shrink-0"
            style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>R</div>
          <div className="flex-1 min-w-0">
            <p className="text-[#F4F7FA] text-sm font-medium truncate font-display">Riya Sharma</p>
            <p className="text-[#53616D] text-xs truncate">Inspector</p>
          </div>
          <button onClick={() => navigate("landing")} className="text-[#53616D] hover:text-[#A7B4C0] transition-colors" title="Logout">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
