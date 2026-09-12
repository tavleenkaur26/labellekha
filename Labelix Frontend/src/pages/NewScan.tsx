import { useState, useRef } from "react";
import type { NavigateFn } from "../types";

const CARD = { background: "#17222D", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" };
const BTN_PRIMARY = { background: "linear-gradient(135deg, #72D8F4, #9C8CFF)", boxShadow: "0 6px 20px rgba(114,216,244,0.18)" };

interface UploadBlock { id: string; label: string; emoji: string; desc: string; }
const uploadBlocks: UploadBlock[] = [
  { id: "front", label: "Front Image", emoji: "📷", desc: "Main product face with label" },
  { id: "back", label: "Back Image", emoji: "🔄", desc: "Reverse side with ingredients" },
  { id: "side", label: "Side Image", emoji: "◻", desc: "Side panel declarations" },
  { id: "listing", label: "Online Listing", emoji: "🖼", desc: "Marketplace screenshot" },
];

const categories = ["Food & Beverages", "Personal Care", "Household Products", "Pharmaceuticals", "Cosmetics", "Other"];
const modes = [
  { id: "consumer", label: "Consumer Check", icon: "👤", desc: "Understand key declarations", accent: "#64D6C4" },
  { id: "producer", label: "Producer Pre-Check", icon: "🏭", desc: "Validate before printing", accent: "#9C8CFF" },
  { id: "inspector", label: "Inspector Review", icon: "📋", desc: "Full compliance assessment", accent: "#72D8F4" },
];

export default function NewScan({ navigate }: { navigate: NavigateFn }) {
  const [uploads, setUploads] = useState<Record<string, string | null>>({ front: null, back: null, side: null, listing: null });
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Food & Beverages");
  const [mode, setMode] = useState("inspector");
  const [dragging, setDragging] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<string | null>(null);

  const handleFile = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setUploads((prev) => ({ ...prev, [id]: url }));
  };

  const handleDrop = (id: string, e: React.DragEvent) => {
    e.preventDefault(); setDragging(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(id, file);
  };

  const openPicker = (id: string) => { setActiveUpload(id); fileInput.current?.click(); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUpload) handleFile(activeUpload, file);
    e.target.value = "";
  };

  const hasAnyUpload = Object.values(uploads).some(Boolean);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />

      <div className="mb-8">
        <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">New Inspection</h1>
        <p className="text-[#70808E] text-sm mt-1">Upload packaging images to begin AI-assisted compliance analysis.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Upload blocks */}
        <div className="rounded-2xl p-6" style={CARD}>
          <h2 className="font-display font-700 text-[#F4F7FA] text-base mb-4">Package Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {uploadBlocks.map((block) => {
              const uploaded = uploads[block.id];
              return (
                <div key={block.id}
                  className="relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden"
                  style={{
                    borderColor: dragging === block.id ? "rgba(114,216,244,0.5)" : uploaded ? "rgba(89,201,157,0.4)" : "rgba(255,255,255,0.08)",
                    background: dragging === block.id ? "rgba(114,216,244,0.06)" : uploaded ? "rgba(89,201,157,0.04)" : "#111A24",
                    minHeight: "120px"
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(block.id); }}
                  onDragLeave={() => setDragging(null)}
                  onDrop={(e) => handleDrop(block.id, e)}
                  onClick={() => openPicker(block.id)}>
                  {uploaded ? (
                    <div className="relative h-full min-h-[120px]">
                      <img src={uploaded} alt={block.label} className="w-full h-full object-cover" style={{minHeight: "120px"}} />
                      <div className="absolute inset-0 flex items-end p-2" style={{background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)"}}>
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                          style={{background: "rgba(20,30,40,0.85)", border: "1px solid rgba(89,201,157,0.3)"}}>
                          <span className="text-[#59C99D] text-xs">✓</span>
                          <span className="text-[#F4F7FA] text-xs font-medium font-display">{block.label}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 min-h-[120px] text-center gap-2">
                      <span className="text-2xl">{block.emoji}</span>
                      <p className="font-display font-600 text-[#A7B4C0] text-xs">{block.label}</p>
                      <p className="text-[#53616D] text-xs leading-snug">{block.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[#53616D] text-xs mt-3 flex items-center gap-1.5">
            <span>💡</span>
            Drag and drop images, or click to upload. Front image required; others are optional.
          </p>
        </div>

        {/* Product details */}
        <div className="rounded-2xl p-6" style={CARD}>
          <h2 className="font-display font-700 text-[#F4F7FA] text-base mb-4">Product Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#A7B4C0] text-sm font-medium mb-1.5">Product Name</label>
              <input value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Parle-G Biscuits 100g"
                className="w-full px-4 py-2.5 rounded-xl text-[#F4F7FA] text-sm outline-none transition-all"
                style={{background: "#111A24", border: "1px solid rgba(255,255,255,0.08)"}}
                onFocus={(e) => { e.target.style.borderColor = "rgba(114,216,244,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(114,216,244,0.07)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-[#A7B4C0] text-sm font-medium mb-1.5">Product Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-[#F4F7FA] text-sm outline-none appearance-none cursor-pointer"
                style={{background: "#111A24", border: "1px solid rgba(255,255,255,0.08)"}}>
                {categories.map((c) => <option key={c} style={{background: "#17222D"}}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Inspection mode */}
        <div className="rounded-2xl p-6" style={CARD}>
          <h2 className="font-display font-700 text-[#F4F7FA] text-base mb-4">Inspection Mode</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {modes.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200"
                style={{
                  background: mode === m.id ? `rgba(${m.accent === "#72D8F4" ? "114,216,244" : m.accent === "#9C8CFF" ? "156,140,255" : "100,214,196"},0.07)` : "#111A24",
                  border: `1px solid ${mode === m.id ? m.accent + "40" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: mode === m.id ? `0 0 0 1px ${m.accent}20` : "none"
                }}>
                <span className="text-xl mt-0.5">{m.icon}</span>
                <div>
                  <p className="font-display font-700 text-[#F4F7FA] text-sm">{m.label}</p>
                  <p className="text-[#70808E] text-xs mt-0.5">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("dashboard")}
            className="text-[#70808E] text-sm hover:text-[#A7B4C0] transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
            style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.07)"}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cancel
          </button>
          <button onClick={() => navigate("processing")}
            className="font-display font-700 text-[#0B1118] px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all flex items-center gap-2"
            style={{...BTN_PRIMARY, opacity: hasAnyUpload ? 1 : 0.5}}>
            Start Analysis
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
