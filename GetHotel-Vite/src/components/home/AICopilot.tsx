import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Send, ArrowLeft, Plus, Settings, HelpCircle, MessageSquare, Menu, Trash2 } from "lucide-react";
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
  hotels?: {
    id: number;
    name: string;
    city: string;
    thumbnail: string | null;
    pricePerNight: number;
    starRating: number;
    guestRating: number;
    reviewCount: number;
  }[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                   */
/* ------------------------------------------------------------------ */
const TypingDots = memo(function TypingDots() {
  return (
    <div className="flex items-center py-2 select-none">
      <div className="flex items-center gap-1.5 py-2">
        <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Emoji to SVG inline icon parser                                    */
/* ------------------------------------------------------------------ */
const parseTextWithIcons = (text: string) => {
  let parts = text.split("**");
  return parts.map((part, i) => {
    const isBold = i % 2 === 1;
    
    const subParts = [];
    let currentText = part;
    
    const emojiRegex = /(⭐|📍|💰|🏔)/g;
    let match;
    let lastIndex = 0;
    
    while ((match = emojiRegex.exec(currentText)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        subParts.push(currentText.substring(lastIndex, matchIndex));
      }
      
      const emoji = match[0];
      if (emoji === "⭐") {
        subParts.push(
          <span key={`star-${matchIndex}`} className="inline-flex items-center mx-0.5 text-amber-500 align-middle">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </span>
        );
      } else if (emoji === "📍") {
        subParts.push(
          <span key={`pin-${matchIndex}`} className="inline-flex items-center mx-0.5 text-red-500 align-middle">
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </span>
        );
      } else if (emoji === "💰") {
        subParts.push(
          <span key={`money-${matchIndex}`} className="inline-flex items-center mx-0.5 text-emerald-600 align-middle">
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="2" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </span>
        );
      } else if (emoji === "🏔") {
        subParts.push(
          <span key={`mountain-${matchIndex}`} className="inline-flex items-center mx-0.5 text-blue-500 align-middle">
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
            </svg>
          </span>
        );
      }
      
      lastIndex = emojiRegex.lastIndex;
    }
    
    if (lastIndex < currentText.length) {
      subParts.push(currentText.substring(lastIndex));
    }

    return isBold ? (
      <strong key={i} className="font-semibold text-brand-600">
        {subParts}
      </strong>
    ) : (
      <span key={i}>{subParts}</span>
    );
  });
};

/* ------------------------------------------------------------------ */
/*  Assistant message                                                  */
/* ------------------------------------------------------------------ */
const AssistantMessage = memo(function AssistantMessage({ text }: { text: string }) {
  return (
    <div className="w-full py-2.5">
      <div className="text-[16px] leading-[1.75] text-[#1f2937] font-normal max-w-none whitespace-pre-line tracking-wide">
        {parseTextWithIcons(text)}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  User message                                                       */
/* ------------------------------------------------------------------ */
const UserMessage = memo(function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end w-full py-1">
      <div className="max-w-[80%] px-5 py-3.5 bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[16px] leading-[1.6] rounded-2xl rounded-tr-sm shadow-md">
        {text}
      </div>
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
      className="fixed bottom-6 right-6 z-50 flex items-center h-13 rounded-full px-5 bg-brand-600 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#002f87] active:scale-95 transition-all"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed by default
  const [input, setInput] = useState("");
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem("gethotel_ai_sessions");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  /* Load active session messages */
  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find(s => s.id === activeSessionId);
      if (session) {
        setMessages(session.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeSessionId, sessions]);

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

  /* execute API send logic */
  const executeSend = useCallback(async (q: string, currentSessionId: string | null) => {
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: q };
    
    let targetSessionId = currentSessionId;
    let updatedSessions = [...sessions];
    let sessionMessages: Message[] = [];

    if (!targetSessionId) {
      // Create a brand new session
      targetSessionId = `s-${Date.now()}`;
      sessionMessages = [userMsg];
      const newSession: ChatSession = {
        id: targetSessionId,
        title: q.length > 35 ? q.slice(0, 35) + "..." : q,
        messages: sessionMessages
      };
      updatedSessions = [newSession, ...updatedSessions];
      setActiveSessionId(targetSessionId);
    } else {
      // Append to the existing session
      const sessionIndex = updatedSessions.findIndex(s => s.id === targetSessionId);
      if (sessionIndex !== -1) {
        sessionMessages = [...updatedSessions[sessionIndex].messages, userMsg];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          messages: sessionMessages
        };
      } else {
        // Fallback if session wasn't found
        targetSessionId = `s-${Date.now()}`;
        sessionMessages = [userMsg];
        const newSession: ChatSession = {
          id: targetSessionId,
          title: q.length > 35 ? q.slice(0, 35) + "..." : q,
          messages: sessionMessages
        };
        updatedSessions = [newSession, ...updatedSessions];
        setActiveSessionId(targetSessionId);
      }
    }

    setMessages(sessionMessages);
    setSessions(updatedSessions);
    localStorage.setItem("gethotel_ai_sessions", JSON.stringify(updatedSessions));
    setInput("");
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const history = sessionMessages.map((m) => ({ role: m.sender, content: m.text }));
      const data = await aiApi.chat(history);
      const reply = data.reply || "I'm not sure how to respond. Can you tell me more?";
      const action = data.action || undefined;

      // Extract recommended hotel IDs from /hotel/:id links in reply
      const matchedHotels: any[] = [];
      if (data.hotels && Array.isArray(data.hotels)) {
        const regex = /\/hotel\/(\d+)/g;
        let match;
        const hotelIds: number[] = [];
        while ((match = regex.exec(reply)) !== null) {
          hotelIds.push(parseInt(match[1]));
        }
        if (hotelIds.length > 0) {
          data.hotels.forEach((h: any) => {
            if (hotelIds.includes(h.id)) {
              matchedHotels.push(h);
            }
          });
        }
      }

      const aiMsg: Message = { 
        id: `ai-${Date.now()}`, 
        sender: "ai", 
        text: reply, 
        action,
        hotels: matchedHotels.length > 0 ? matchedHotels : undefined
      };
      
      const sessionIndex = updatedSessions.findIndex(s => s.id === targetSessionId);
      if (sessionIndex !== -1) {
        const finalMessages = [...updatedSessions[sessionIndex].messages, aiMsg];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          messages: finalMessages
        };
        setSessions(updatedSessions);
        setMessages(finalMessages);
        localStorage.setItem("gethotel_ai_sessions", JSON.stringify(updatedSessions));
      }
    } catch {
      const errorMsg: Message = { id: `ai-${Date.now()}`, sender: "ai", text: "Sorry, I'm having trouble connecting right now. Please try again!" };
      const sessionIndex = updatedSessions.findIndex(s => s.id === targetSessionId);
      if (sessionIndex !== -1) {
        const finalMessages = [...updatedSessions[sessionIndex].messages, errorMsg];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          messages: finalMessages
        };
        setSessions(updatedSessions);
        setMessages(finalMessages);
        localStorage.setItem("gethotel_ai_sessions", JSON.stringify(updatedSessions));
      }
    } finally {
      setIsTyping(false);
    }
  }, [sessions]);

  /* send handler – triggers from input bar */
  const handleSend = useCallback((text: string) => {
    executeSend(text, activeSessionId);
  }, [executeSend, activeSessionId]);

  /* click recent query in sidebar – loads previous chat history */
  const handleSessionClick = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const handleDeleteSession = useCallback((e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem("gethotel_ai_sessions", JSON.stringify(updated));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [sessions, activeSessionId]);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
  }, []);

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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* ---------- trigger ---------- */}
      {!isOpen && <TriggerButton onClick={() => setIsOpen(true)} />}

      {/* ---------- full-screen chat (Website Whitish Blue Gradient Theme) ---------- */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[999] flex text-slate-800 font-sans overflow-hidden"
          style={{
            background: "radial-gradient(circle at 50% 120%, rgba(30, 64, 175, 0.9) 0%, rgba(191, 219, 254, 0) 75%), linear-gradient(180deg, #ffffff 0%, #9fc3ff 100%)"
          }}
        >
          
          {/* ============ SIDEBAR Drawer Overlay (Mobile) ============ */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/40 z-[1000] md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* ============ SIDEBAR Content ============ */}
          <aside className={`
            fixed top-0 bottom-0 left-0 z-[1001] md:relative md:z-10
            flex flex-col bg-[#f0f4f9] border-r border-slate-200/60 p-4 shrink-0 transition-all duration-300 md:translate-x-0
            ${isSidebarOpen ? "w-[260px] translate-x-0" : "w-[68px] -translate-x-full md:flex"}
          `}>
            {/* Header section (Menu button only, logo removed as requested) */}
            <div className="flex items-center gap-3 h-13 mb-5 shrink-0 justify-between">
              {isSidebarOpen ? (
                <>
                  <div className="w-4" />
                  <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-full hover:bg-slate-200/60 text-slate-600 transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-600 mx-auto"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className={`
                flex items-center justify-center gap-2 mb-6 text-sm font-medium transition-all duration-200 shrink-0
                ${isSidebarOpen 
                  ? "w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 shadow-sm" 
                  : "w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 mx-auto"
                }
              `}
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
              {isSidebarOpen && <span>New Chat</span>}
            </button>

            {/* Recent Queries List */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 scrollbar-thin">
              {isSidebarOpen && sessions.length > 0 && (
                <>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 select-none">
                    Recent
                  </div>
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSessionClick(s.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] hover:bg-slate-200/60 transition-colors text-left group
                        ${activeSessionId === s.id ? "bg-[#d3e3fd] text-[#041e49]" : "text-slate-600"}
                      `}
                      title={s.title}
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-600" />
                      <span className="truncate flex-1">{s.title}</span>
                      <span 
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-300 text-slate-400 hover:text-red-500 transition-all"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Bottom menu links */}
            <div className="pt-4 border-t border-slate-200/60 shrink-0 space-y-1">
              <button className={`flex items-center gap-3 w-full rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ${isSidebarOpen ? "px-3 py-2.5 text-xs" : "h-10 justify-center mx-auto"}`}>
                <Settings className="w-4 h-4" />
                {isSidebarOpen && <span>Settings</span>}
              </button>
              <button className={`flex items-center gap-3 w-full rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ${isSidebarOpen ? "px-3 py-2.5 text-xs" : "h-10 justify-center mx-auto"}`}>
                <HelpCircle className="w-4 h-4" />
                {isSidebarOpen && <span>Help & Activity</span>}
              </button>
            </div>
          </aside>

          {/* ============ MAIN CHAT LAYOUT ============ */}
          <div className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
            
            {/* Header (Text titles removed as requested) */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200/30 bg-white/40 backdrop-blur-md z-10 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-full hover:bg-slate-200/50 text-slate-600 transition-colors md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full hover:bg-slate-200/50 text-slate-600 flex items-center justify-center transition-all"
                  aria-label="Close Assistant"
                  title="Close Assistant"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Chat Content Pane */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
              
              {/* Scrollable messages container */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar px-4">
                
                {/* Collapsible Spacer (only when chat is empty to push heading down) */}
                <div className={`transition-all duration-700 ease-in-out ${messages.length === 0 ? "h-[25vh]" : "h-0"}`} />
                
                {/* Centered Welcome Heading */}
                <h1 className={`text-3xl md:text-4xl font-semibold text-center select-none transition-all duration-500 ease-in-out ${
                  messages.length === 0 
                    ? "mb-8 opacity-100 scale-100 text-slate-800" 
                    : "mb-0 opacity-0 scale-95 h-0 overflow-hidden"
                }`}>
                  What should we focus on?
                </h1>

                {/* Messages list (visible only when messages exist) */}
                {messages.length > 0 && (
                  <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 py-8">
                    {messages.map((msg) => (
                      <div key={msg.id} className="w-full">
                        {msg.sender === "ai" ? (
                          <AssistantMessage text={msg.text} />
                        ) : (
                          <UserMessage text={msg.text} />
                        )}
                        {msg.action && (
                          <div className="mt-3">
                            <button
                              onClick={() => navigateTo(msg.action!.path)}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-sm active:scale-[0.97] transition-all"
                            >
                              {msg.action.label}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {msg.hotels && msg.hotels.length > 0 && (
                          <div className="mt-4 select-none">
                            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin max-w-full">
                              {msg.hotels.map((h) => (
                                <div
                                  key={h.id}
                                  onClick={() => handleSend(`I want to select ${h.name} (ID: ${h.id}) to proceed with booking.`)}
                                  className="relative w-[190px] h-[190px] rounded-2xl overflow-hidden shadow-md cursor-pointer group active:scale-[0.98] transition-all flex-shrink-0 border border-slate-200/40"
                                >
                                  {/* Background Image */}
                                  {h.thumbnail ? (
                                    <img
                                      src={h.thumbnail}
                                      alt={h.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                      <span className="text-slate-400 text-xs">No preview</span>
                                    </div>
                                  )}

                                  {/* Black Gradient Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-1" />

                                  {/* Card Details Overlay */}
                                  <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-2 select-none">
                                    {/* Top row: wishlist icon */}
                                    <div className="flex justify-end">
                                      <div className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-red-500 hover:bg-black/40 transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                      </div>
                                    </div>

                                    {/* Bottom row: details */}
                                    <div className="flex flex-col gap-0.5 text-white">
                                      <h4 className="text-[13px] font-bold leading-tight truncate w-[160px]" title={h.name}>
                                        {h.name}
                                      </h4>
                                      <p className="text-[10px] text-white/70 font-semibold truncate">
                                        {h.city}
                                      </p>
                                      
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-[12px] font-bold">
                                          ₹{h.pricePerNight.toLocaleString()}<span className="text-[9px] font-normal text-white/70">/night</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="w-full">
                        <TypingDots />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Sticky Bottom Input Bar */}
              <footer className="shrink-0 bg-transparent py-4 md:py-6 select-none z-10 px-4">
                <div className={`mx-auto transition-all duration-500 ease-in-out ${
                  messages.length === 0 ? "max-w-2xl" : "max-w-3xl"
                }`}>
                  {/* Glassmorphic Text Box Container */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend(input);
                    }}
                    className="flex items-end gap-2 bg-white/60 backdrop-blur-md border border-white/80 focus-within:ring-2 focus-within:ring-brand-400/20 focus-within:border-brand-400/40 rounded-full px-5 py-2.5 transition-all shadow-lg shadow-slate-100/50"
                  >
                    {/* Plus button */}
                    <button 
                      type="button" 
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 shrink-0 transition-colors"
                      title="Add attachment"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

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
                      className="flex-1 bg-transparent py-1.5 px-1 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none font-normal leading-6 max-h-[160px]"
                    />

                    {/* Send button */}
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all bg-brand-500 text-white hover:bg-brand-600 disabled:bg-slate-200/50 disabled:text-slate-400 active:scale-90"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </form>
                  
                  <div className="text-[10px] text-center text-slate-400 mt-2 select-none">
                    StayBot may display inaccurate info. Double-check important details.
                  </div>
                </div>
              </footer>

            </div>
          </div>

        </div>
      )}
    </>
  );
}
