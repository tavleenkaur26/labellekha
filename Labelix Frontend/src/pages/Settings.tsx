import { useState } from "react";
import type { NavigateFn } from "../types";

const CARD = { background: "#17222D", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" };

export default function Settings({ navigate: _navigate }: { navigate: NavigateFn }) {
  const [name, setName] = useState("Riya Sharma");
  const [email, setEmail] = useState("riya.sharma@compliance.in");
  const [org, setOrg] = useState("National Weights & Measures Dept.");
  const [role] = useState("Inspector");
  const [notif, setNotif] = useState({ email: true, inspectionComplete: true, weeklyReport: false, systemAlerts: true });
  const [accessibility, setAccessibility] = useState({ reducedMotion: false, highContrast: false, largeText: false });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl p-6" style={CARD}>
      <h2 className="font-display font-700 text-[#F4F7FA] text-base mb-5">{title}</h2>
      {children}
    </div>
  );

  const Toggle = ({ label, sublabel, value, onChange }: { label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0" style={{borderColor: "rgba(255,255,255,0.05)"}}>
      <div>
        <p className="font-display font-500 text-[#F4F7FA] text-sm">{label}</p>
        {sublabel && <p className="text-[#53616D] text-xs mt-0.5">{sublabel}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
        style={{background: value ? "linear-gradient(135deg, #72D8F4, #9C8CFF)" : "rgba(255,255,255,0.08)"}}>
        <div className="absolute top-0.5 transition-all duration-200 w-5 h-5 rounded-full bg-white shadow-sm"
          style={{left: value ? "22px" : "2px"}} />
      </button>
    </div>
  );

  const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange?: (v: string) => void; type?: string }) => (
    <div>
      <label className="block text-[#A7B4C0] text-sm font-medium mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={!onChange}
        className="w-full px-4 py-2.5 rounded-xl text-[#F4F7FA] text-sm outline-none transition-all"
        style={{
          background: onChange ? "#111A24" : "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: onChange ? "text" : "default",
          color: onChange ? "#F4F7FA" : "#53616D"
        }}
        onFocus={(e) => { if (onChange) { e.target.style.borderColor = "rgba(114,216,244,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(114,216,244,0.07)"; } }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">Settings</h1>
        <p className="text-[#70808E] text-sm mt-0.5">Manage your profile, notifications, and preferences.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Profile */}
        <Section title="Profile Details">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#0B1118] font-display font-700 text-xl"
              style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)"}}>R</div>
            <div>
              <p className="font-display font-700 text-[#F4F7FA]">{name}</p>
              <p className="text-[#70808E] text-sm">{email}</p>
              <span className="inline-block mt-1 text-xs font-display font-600 px-2.5 py-0.5 rounded-full"
                style={{background: "rgba(114,216,244,0.1)", color: "#72D8F4"}}>
                {role}
              </span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Email Address" value={email} onChange={setEmail} type="email" />
            <Field label="Organisation" value={org} onChange={setOrg} />
            <Field label="Role" value={role} />
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notification Settings">
          <Toggle label="Email Notifications" sublabel="Receive updates via email"
            value={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
          <Toggle label="Inspection Complete" sublabel="Notify when an analysis finishes"
            value={notif.inspectionComplete} onChange={(v) => setNotif({ ...notif, inspectionComplete: v })} />
          <Toggle label="Weekly Summary Report" sublabel="Weekly digest of inspection activity"
            value={notif.weeklyReport} onChange={(v) => setNotif({ ...notif, weeklyReport: v })} />
          <Toggle label="System Alerts" sublabel="Important platform notifications"
            value={notif.systemAlerts} onChange={(v) => setNotif({ ...notif, systemAlerts: v })} />
        </Section>

        {/* Account */}
        <Section title="Account Settings">
          <div className="flex flex-col gap-2">
            {[
              { label: "Change Password", danger: false },
              { label: "Export My Data", danger: false },
            ].map((btn) => (
              <button key={btn.label}
                className="flex items-center justify-between p-3.5 rounded-xl transition-colors"
                style={{background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)"}}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                <span className="font-display font-500 text-[#A7B4C0] text-sm">{btn.label}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="#53616D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
            <button className="flex items-center justify-between p-3.5 rounded-xl transition-colors"
              style={{background: "rgba(239,115,122,0.06)", border: "1px solid rgba(239,115,122,0.18)"}}>
              <span className="font-display font-500 text-[#EF737A] text-sm">Delete Account</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l5 5-5 5" stroke="#EF737A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </Section>

        {/* Accessibility */}
        <Section title="Accessibility Settings">
          <Toggle label="Reduced Motion" sublabel="Minimise animations throughout the platform"
            value={accessibility.reducedMotion} onChange={(v) => setAccessibility({ ...accessibility, reducedMotion: v })} />
          <Toggle label="High Contrast" sublabel="Increase contrast for better readability"
            value={accessibility.highContrast} onChange={(v) => setAccessibility({ ...accessibility, highContrast: v })} />
          <Toggle label="Larger Text" sublabel="Increase base font size across the interface"
            value={accessibility.largeText} onChange={(v) => setAccessibility({ ...accessibility, largeText: v })} />
        </Section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-[#59C99D] text-sm font-display font-600">✓ Settings saved</span>
          )}
          <button onClick={save}
            className="font-display font-700 text-[#0B1118] px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all"
            style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)", boxShadow: "0 6px 20px rgba(114,216,244,0.18)"}}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
