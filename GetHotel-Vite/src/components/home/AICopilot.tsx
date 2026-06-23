import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aiApi } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  action?: {
    label: string;
    path: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                   */
/* ------------------------------------------------------------------ */
const TypingDots = memo(function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Assistant message – plain text, no container / card / avatar       */
/* ------------------------------------------------------------------ */
const AssistantMessage = memo(function AssistantMessage({ text }: { text: string }) {
  return (
    <div className="text-[15px] leading-7 text-[#1a1d23] font-normal">
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-brand-600">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  User message – right-aligned gradient bubble                       */
/* ------------------------------------------------------------------ */
const UserMessage = memo(function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] px-4 py-2.5 bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[15px] leading-7 rounded-2xl rounded-br-sm shadow-sm">
        {text}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Welcome screen placeholder                                         */
/* ------------------------------------------------------------------ */
const WelcomeScreen = memo(function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center select-none">
      <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center mb-5 shadow-sm">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
          <path d="M5 15h14" />
          <path d="M5 19h14" />
          <path d="M15 19v-2a3 3 0 0 0-6 0v2" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[#1a1d23] mb-1.5">AI Travel Assistant</h2>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        Ask me about hotels, hourly stays, or get personalized travel recommendations.
      </p>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Floating trigger button                                            */
/* ------------------------------------------------------------------ */
function TriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center h-13 rounded-full px-5 bg-brand-600 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg hover:bg-brand-700 active:scale-95 transition-all"
    >
      AI Mode
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your AI travel assistant. Tell me what you're looking for — hotels, hourly stays, or get personalized recommendations. Where are you heading?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  /* auto-scroll */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* lock body / focus input */
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const id = setTimeout(() => textareaRef.current?.focus(), 250);
    return () => {
      clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* auto-resize textarea */
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  /* send handler – calls real backend AI */
  const handleSend = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q) return;

    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const history = messages.map((m) => ({ role: m.sender, content: m.text }));
      history.push({ role: "user", content: q });

      const data = await aiApi.chat(history);
      const reply = data.reply || "I'm not sure how to respond. Can you tell me more?";
      const action = data.action || undefined;

      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, sender: "ai", text: reply, action }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, sender: "ai", text: "Sorry, I'm having trouble connecting right now. Please try again!" },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const navigateTo = useCallback((path: string) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend(input);
      }
    },
    [handleSend, input],
  );

  return (
    <>
      {/* ---------- trigger ---------- */}
      {!isOpen && <TriggerButton onClick={() => setIsOpen(true)} />}

      {/* ---------- full-screen chat ---------- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] flex flex-col"
          style={{ background: "linear-gradient(180deg, #f4f8ff 0%, #edf5ff 100%)" }}
        >
          {/* ============ HEADER ============ */}
          <header className="shrink-0 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 h-13 flex items-center justify-between">
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-200/50 flex items-center justify-center text-slate-500 transition-all -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-[#1a1d23]">AI Travel Assistant</span>
              <div className="w-9 h-9" />
            </div>
          </header>

          {/* ============ MESSAGES ============ */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 min-h-full">
              {messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      {msg.sender === "ai" ? (
                        <AssistantMessage text={msg.text} />
                      ) : (
                        <UserMessage text={msg.text} />
                      )}
                      {msg.action && (
                        <div className="mt-3">
                          <button
                            onClick={() => navigateTo(msg.action!.path)}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-sm active:scale-[0.97] transition-all"
                          >
                            {msg.action.label}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div>
                      <TypingDots />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          </main>

          {/* ============ INPUT ============ */}
          <footer className="shrink-0 border-t border-slate-200/60 bg-white/70 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 py-3 md:py-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-end gap-2 bg-white border border-slate-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/10 rounded-xl px-4 py-2.5 transition-all shadow-sm"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about hotels, destinations, or travel tips..."
                  rows={1}
                  className="flex-1 bg-transparent py-1 text-sm text-[#1a1d23] placeholder-slate-400 outline-none resize-none font-normal leading-6 max-h-[160px]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:bg-brand-600 enabled:text-white enabled:shadow-sm active:scale-90"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
