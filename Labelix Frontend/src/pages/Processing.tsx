import { useState, useEffect } from "react";
import type { NavigateFn } from "../types";

const processingSteps = [
  { id: 0, label: "Preparing image", detail: "Normalizing resolution and orientation", icon: "⚙" },
  { id: 1, label: "Extracting text", detail: "Running OCR across all label regions", icon: "◎" },
  { id: 2, label: "Identifying declarations", detail: "Matching text to declaration categories", icon: "◈" },
  { id: 3, label: "Validating rules", detail: "Checking each declaration against rule engine", icon: "✓" },
  { id: 4, label: "Reviewing readability", detail: "Assessing font size, contrast, and clarity", icon: "👁" },
  { id: 5, label: "Checking placement", detail: "Validating position of declarations", icon: "⊞" },
  { id: 6, label: "Generating result", detail: "Compiling findings into compliance report", icon: "▤" },
];

const ocrBoxes = [
  { top: "12%", left: "8%", w: "40%", h: "8%", label: "MRP" },
  { top: "24%", left: "8%", w: "55%", h: "7%", label: "Net Qty" },
  { top: "36%", left: "8%", w: "70%", h: "7%", label: "Manufacturer" },
  { top: "50%", left: "8%", w: "45%", h: "7%", label: "Date" },
  { top: "62%", left: "8%", w: "65%", h: "8%", label: "Consumer Care" },
];

export default function Processing({ navigate }: { navigate: NavigateFn }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [boxesVisible, setBoxesVisible] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= processingSteps.length) { setDone(true); clearInterval(interval); return prev; }
        if (next >= 1) {
          setBoxesVisible((b) => {
            const toAdd = Math.min(next - 1, ocrBoxes.length - 1);
            if (!b.includes(toAdd)) return [...b, toAdd];
            return b;
          });
        }
        return next;
      });
    }, 1100);
    return () => clearInterval(interval);
  }, [done]);

  const progress = done ? 100 : Math.round((currentStep / (processingSteps.length - 1)) * 100);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-700 text-[#F4F7FA] text-2xl">Analysing your package</h1>
        <p className="text-[#70808E] text-sm mt-1">Please wait while MetriCheck processes your submission.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Package visual */}
        <div className="rounded-3xl overflow-hidden relative"
          style={{background: "linear-gradient(145deg, #0F1C28 0%, #111A24 100%)", minHeight: "400px", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)"}}>
          <div className="absolute inset-0"
            style={{background: "radial-gradient(ellipse at 50% 30%, rgba(114,216,244,0.06) 0%, transparent 65%)"}} />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 h-64 rounded-2xl overflow-hidden"
              style={{background: "linear-gradient(145deg, rgba(20,36,52,0.9), rgba(14,26,40,0.85))", border: "1.5px solid rgba(114,216,244,0.2)", backdropFilter: "blur(4px)"}}>
              <div className="absolute inset-2 rounded-xl overflow-hidden"
                style={{background: "rgba(255,255,255,0.03)"}}>
                <div className="p-3 flex flex-col gap-2">
                  {[88, 70, 80, 62, 75].map((w, i) => (
                    <div key={i} className="h-2 rounded-full"
                      style={{width: `${w}%`, background: `rgba(114,216,244,${0.1 + i * 0.04})`}} />
                  ))}
                  <div className="mt-2 h-10 rounded-lg"
                    style={{background: "rgba(114,216,244,0.05)", border: "1px solid rgba(114,216,244,0.1)"}} />
                </div>

                {ocrBoxes.map((box, i) => (
                  <div key={i}
                    className="absolute transition-all duration-500 rounded-sm pointer-events-none"
                    style={{
                      top: box.top, left: box.left, width: box.w, height: box.h,
                      border: `1.5px solid ${boxesVisible.includes(i) ? "#72D8F4" : "transparent"}`,
                      background: boxesVisible.includes(i) ? "rgba(114,216,244,0.06)" : "transparent",
                      opacity: boxesVisible.includes(i) ? 1 : 0,
                    }}>
                    {boxesVisible.includes(i) && (
                      <span className="absolute -top-4 left-0 text-[9px] font-display font-700"
                        style={{color: "#72D8F4", background: "rgba(11,17,24,0.9)", padding: "1px 4px", borderRadius: "3px"}}>
                        {box.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {!done && (
                <div className="absolute top-[8%] left-0 right-0 h-0.5 animate-scan-line pointer-events-none"
                  style={{background: "linear-gradient(to right, transparent, #72D8F4, #B8EDEA, #72D8F4, transparent)", boxShadow: "0 0 10px #72D8F4"}} />
              )}

              {done && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{background: "rgba(11,17,24,0.6)", backdropFilter: "blur(2px)"}}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-[#0B1118] text-2xl shadow-lg"
                    style={{background: "linear-gradient(135deg, #59C99D, #72D8F4)"}}>✓</div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#72D8F4] text-xs font-medium font-display">
                {done ? "Analysis complete" : processingSteps[currentStep]?.label}
              </span>
              <span className="text-xs font-display" style={{color: "rgba(114,216,244,0.6)"}}>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{background: "rgba(255,255,255,0.06)"}}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{width: `${progress}%`, background: "linear-gradient(to right, #72D8F4, #9C8CFF)"}} />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-2xl p-5 flex flex-col gap-1"
          style={{background: "#17222D", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)"}}>
          <h3 className="font-display font-700 text-[#F4F7FA] text-sm mb-3">Processing steps</h3>
          {processingSteps.map((step, i) => {
            const isPast = i < currentStep || done;
            const isCurrent = i === currentStep && !done;
            return (
              <div key={step.id}
                className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300"
                style={{background: isCurrent ? "rgba(114,216,244,0.06)" : "transparent"}}>
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-sm transition-all"
                  style={{
                    background: isPast ? "rgba(89,201,157,0.12)" : isCurrent ? "rgba(114,216,244,0.12)" : "rgba(255,255,255,0.04)",
                    color: isPast ? "#59C99D" : isCurrent ? "#72D8F4" : "#53616D",
                    border: `1px solid ${isPast ? "rgba(89,201,157,0.2)" : isCurrent ? "rgba(114,216,244,0.2)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  {isPast ? "✓" : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-600 text-sm"
                    style={{color: isPast ? "#59C99D" : isCurrent ? "#F4F7FA" : "#53616D"}}>
                    {step.label}
                    {isCurrent && <span className="ml-1.5 text-[#72D8F4] animate-blink">▌</span>}
                  </p>
                  {(isCurrent || isPast) && (
                    <p className="text-xs mt-0.5 text-[#70808E]">{step.detail}</p>
                  )}
                </div>
              </div>
            );
          })}

          {done && (
            <div className="mt-4 pt-4 border-t" style={{borderColor: "rgba(255,255,255,0.05)"}}>
              <button onClick={() => navigate("inspection-result")}
                className="font-display font-700 text-[#0B1118] w-full py-3 rounded-xl text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                style={{background: "linear-gradient(135deg, #72D8F4, #9C8CFF)", boxShadow: "0 6px 20px rgba(114,216,244,0.18)"}}>
                View Inspection Result
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
