import { useState } from "react";
import Sidebar from "./Sidebar";
import type { Page, NavigateFn } from "../types";

interface Props { page: Page; navigate: NavigateFn; children: React.ReactNode; }

export default function AppShell({ page, navigate, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden" style={{background: "#0B1118"}}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full shrink-0">
        <Sidebar page={page} navigate={navigate} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar page={page} navigate={(p) => { navigate(p); setSidebarOpen(false); }} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{background: "rgba(13,22,31,0.95)", borderColor: "rgba(255,255,255,0.05)"}}>
          <button onClick={() => setSidebarOpen(true)} className="text-[#A7B4C0]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-display font-700 text-[#F4F7FA] text-base">MetriCheck</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
