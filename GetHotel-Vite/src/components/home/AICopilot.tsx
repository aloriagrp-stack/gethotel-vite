import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, MapPin, Calendar, Compass, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  action?: {
    label: string;
    path: string;
  };
}



export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your AI Travel Copilot. 🌟 Tell me your travel plans in natural language (e.g., 'luxury hotels in Jaipur' or '6-hour hourly stay in Udaipur') and I'll find the perfect fit for you!",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Lock body scroll when full screen overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Thinking
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Parse Message for Keywords
    const query = textToSend.toLowerCase();
    let replyText = "";
    let action = undefined;

    // 1. Destination Parsing
    let city = "";
    if (query.includes("goa")) city = "Goa";
    else if (query.includes("jaipur")) city = "Jaipur";
    else if (query.includes("udaipur")) city = "Udaipur";
    else if (query.includes("shimla")) city = "Shimla";
    else if (query.includes("manali")) city = "Manali";

    // 2. Stay Type Parsing
    let stayType = "nightly";
    let duration = "";
    if (query.includes("hourly") || query.includes("hour") || query.includes("hours") || query.includes("🕒")) {
      stayType = "hourly";
      if (query.includes("3")) duration = "3";
      else if (query.includes("6")) duration = "6";
      else if (query.includes("12")) duration = "12";
    }

    if (city) {
      if (stayType === "hourly") {
        replyText = `I found some excellent options for hourly stays in **${city}**! Staying for ${duration ? `${duration} hours` : "a few hours"} is a great way to refresh and save money. Let me filter properties in ${city} for your hourly stay.`;
        action = {
          label: `Book Hourly in ${city}`,
          path: `/hotels?city=${city}&stayType=hourly&duration=${duration || "6"}`,
        };
      } else {
        replyText = `Great choice! **${city}** is a beautiful destination. I've scanned our inventory and filtered the best nightly stays in ${city} matching your request. Let's head over to the listings!`;
        action = {
          label: `Explore ${city} Stays`,
          path: `/hotels?city=${city}&stayType=nightly`,
        };
      }
    } else {
      // General match fallback
      if (stayType === "hourly") {
        replyText = "I can help you find flexible hourly stays across popular locations like Goa, Jaipur, Udaipur, Shimla, and Manali. Which city would you like to search in?";
      } else {
        replyText = "I couldn't quite catch the destination. I can help you search hotels in Goa, Jaipur, Udaipur, Shimla, or Manali. Where are you heading to next?";
      }
    }

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: replyText,
      timestamp: new Date(),
      action,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleActionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center justify-end">
        {/* Pulsing ring underlay */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute w-16 h-16 rounded-full bg-brand-500/30 blur-[2px] pointer-events-none"
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative flex items-center h-14 rounded-full px-4 text-brand-600 bg-white border-2 border-brand-600 shadow-xl transition-all duration-300 group overflow-hidden z-10 hover:bg-brand-50/50",
            isOpen ? "w-14 justify-center" : ""
          )}
        >
          {isOpen ? (
            <X className="w-5 h-5 animate-spin-once text-brand-600" />
          ) : (
            <span className="text-[12px] font-black uppercase tracking-widest leading-none text-brand-600 px-2">
              AI Mode
            </span>
          )}
        </motion.button>
      </div>

      {/* FULL SCREEN CHAT PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="fixed inset-0 bg-gradient-to-tr from-brand-100 via-white to-brand-50 z-[999] flex flex-col w-screen h-screen text-slate-800"
          >
            {/* Header Area */}
            <div className="w-full bg-white border-b border-brand-100/60 shrink-0 shadow-sm">
              <div className="w-full max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center transition-all text-slate-700 hover:text-slate-900 border border-slate-200"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h3 className="text-base font-black tracking-tight text-slate-900 leading-tight">
                    GetHotelStays AI Assistant
                  </h3>
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest leading-none mt-0.5">
                    Powered by AI Mode
                  </p>
                </div>
              </div>
            </div>

            {/* Message History Container */}
            <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 py-6 scrollbar-thin">
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-[85%] sm:max-w-[75%]",
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-4.5 h-4.5 text-brand-600" />
                      </div>
                    )}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "p-4 rounded-2xl text-[13px] leading-relaxed font-semibold shadow-sm",
                          msg.sender === "user"
                            ? "bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/10"
                            : "bg-white border border-brand-100/80 text-slate-800 rounded-tl-none"
                        )}
                      >
                        {msg.text.split("**").map((part, idx) =>
                          idx % 2 === 1 ? (
                            <strong key={idx} className="font-black text-brand-700">
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </div>

                      {msg.action && (
                        <div className="max-w-xs">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActionClick(msg.action!.path)}
                            className="flex items-center justify-center gap-2 w-full py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all group"
                          >
                            {msg.action.label}
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-4.5 h-4.5 text-brand-600 animate-bounce" />
                    </div>
                    <div className="bg-white border border-brand-100/80 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Bottom Actions and Input Area */}
            <div className="w-full shrink-0 border-t border-brand-100/60 bg-white pb-6 md:pb-8 pt-4">
              <div className="w-full max-w-3xl mx-auto px-4 flex flex-col gap-4">


                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="w-full bg-white border border-brand-100 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10 shadow-lg rounded-[28px] p-2 flex items-center gap-2 transition-all"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI Mode: (e.g. 'Stays in Goa' or 'Hourly palaces in Udaipur')"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none font-bold"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-all shrink-0 shadow-md",
                      input.trim()
                        ? "bg-brand-600 text-white shadow-brand-600/10"
                        : "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-200"
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
