import { useState, useRef, useEffect } from "react";
import type { NavigateFn } from "../types";

interface Message { id: number; role: "user" | "ai"; text: string; }

const prompts = ["Why did this fail?", "Explain this in simple language", "What should I correct?", "Summarize this inspection", "What needs review next?"];

const aiResponses: Record<string, string> = {
  "Why did this fail?": "A finding is marked FAIL when the rule engine determines that a mandatory declaration is absent, incorrect, or does not meet the format requirements set under the Legal Metrology (Packaged Commodities) Rules. For example, if the MRP is missing entirely, or if the net quantity is not declared in the prescribed unit of measurement, the rule engine will return a FAIL status for that specific check.",
  "Explain this in simple language": "In simple terms: this packaging has some information that is either missing or not quite right. The rules require every packaged product to clearly show its price, weight, manufacturer details, and contact information for consumers. One of those details either wasn't found on the label, or the format used doesn't follow the standard requirement.",
  "What should I correct?": "Based on the current inspection, the following items need attention:\n\n1. Consumer Care Details — Add a full mailing address or email alongside the helpline number.\n2. MRP Format — Use decimal notation (e.g., ₹270.00) as prescribed.\n3. Manufacturing Date — Write the month in abbreviated text form (e.g., Aug 2024) instead of numeric format.\n\nAddressing these before printing will help the packaging pass a full compliance review.",
  "Summarize this inspection": "This inspection checked 8 declarations on the Aashirvaad Atta 5kg packaging.\n\n• 5 declarations passed — product identity, manufacturer details, net quantity, best-before date, and placement.\n• 3 declarations need attention — consumer care contact details are incomplete, MRP format does not follow the prescribed style, and the ingredient list font size may be below the minimum requirement.\n\nNo declarations were entirely missing. The issues are correctable before release.",
  "What needs review next?": "The highest-priority item to review is the Consumer Care Details — a complete contact address or email is required alongside the helpline number and is currently absent. Following that, review the MRP format and the ingredient list font size. Once those are corrected, a re-scan is recommended to confirm all declarations pass.",
};

export default function AIAssistant({ navigate: _navigate }: { navigate: NavigateFn }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "ai", text: "Hello. I'm Metri AI — your compliance companion. I can explain inspection findings, clarify rule requirements, and suggest corrective steps. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const matchKey = Object.keys(aiResponses).find((k) =>
        text.toLowerCase().includes(k.toLowerCase().split(" ").slice(0, 2).join(" ").toLowerCase())
      );
      const response = matchKey
        ? aiResponses[matchKey]
        : "That is a thoughtful question. Under the Legal Metrology framework, declarations on packaged commodities must meet specific format, placement, and legibility requirements. If you share the specific finding or declaration you are asking about, I can give you a more targeted explanation and suggested next step.";
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", text: response }]);
      setLoading(false);
    }, 1200 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center gap-3 shrink-0"
        style={{background: "rgba(11,17,24,0.9)", borderColor: "rgba(255,255,255,0.05)"}}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
          style={{background: "rgba(156,140,255,0.15)", border: "1.5px solid rgba(156,140,255,0.3)"}}>
          <span style={{color: "#9C8CFF"}}>✦</span>
        </div>
        <div>
          <h1 className="font-display font-700 text-[#F4F7FA] text-lg">Metri AI</h1>
          <p className="text-[#70808E] text-xs">Your compliance companion</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#59C99D] animate-pulse" />
          <span className="text-xs text-[#70808E] font-medium">Active</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 py-2 text-center shrink-0">
        <p className="text-xs text-[#53616D] inline-block px-3 py-1.5 rounded-lg"
          style={{background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)"}}>
          Metri AI explains findings. The rule engine makes all compliance decisions.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-3`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm"
                  style={{background: "rgba(156,140,255,0.15)", border: "1px solid rgba(156,140,255,0.25)", color: "#9C8CFF"}}>✦</div>
              )}
              <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-lg"
                style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, rgba(114,216,244,0.2), rgba(156,140,255,0.2))"
                    : "rgba(23,34,45,0.9)",
                  color: "#F4F7FA",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  border: msg.role === "user" ? "1px solid rgba(114,216,244,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  whiteSpace: "pre-wrap"
                }}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm"
                style={{background: "rgba(156,140,255,0.15)", border: "1px solid rgba(156,140,255,0.25)", color: "#9C8CFF"}}>✦</div>
              <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
                style={{background: "rgba(23,34,45,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px 18px 18px 4px"}}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{background: "#9C8CFF", animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`}} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Example prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button key={p} onClick={() => send(p)}
                className="text-xs font-display font-500 px-3.5 py-2 rounded-xl transition-all hover:border-[rgba(156,140,255,0.4)]"
                style={{background: "rgba(156,140,255,0.07)", color: "#9C8CFF", border: "1px solid rgba(156,140,255,0.2)"}}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-5 pt-2 border-t shrink-0"
        style={{borderColor: "rgba(255,255,255,0.05)"}}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 rounded-2xl border overflow-hidden pl-4 pr-2 py-2 transition-all"
            style={{background: "#17222D", borderColor: "rgba(255,255,255,0.08)"}}
            onFocusCapture={(e) => { e.currentTarget.style.borderColor = "rgba(156,140,255,0.4)"; }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
              placeholder="Ask about a finding, rule, or corrective step..."
              className="flex-1 bg-transparent text-[#F4F7FA] text-sm outline-none placeholder-[#53616D]"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: input.trim() && !loading ? "linear-gradient(135deg, #9C8CFF, #72D8F4)" : "rgba(255,255,255,0.06)",
                color: input.trim() && !loading ? "#0B1118" : "#53616D"
              }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7l11-5-4 10-2-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
