import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Plus, Settings, HelpCircle, MessageSquare, Menu, Trash2, Calendar, User, Mail, CreditCard, Check, X, ArrowRight, Loader, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { aiApi, authApi, bookingApi, paymentApi } from "./lib/api";
import { auth, googleProvider } from "./lib/firebase";
import { signInWithPopup } from "firebase/auth";

// Dynamic Apple Emoji CDN Parser
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}]/gu;

function parseTextWithIcons(text: string) {
  if (!text) return "";
  const parts = text.split(emojiRegex);
  const emojis = text.match(emojiRegex) || [];

  return parts.reduce((acc: any[], part, i) => {
    acc.push(part);
    if (emojis[i]) {
      const emoji = emojis[i];
      // Exclude brand SVGs from CDN images
      if (emoji === "⭐") {
        acc.push(<span key={`icon-${i}`} className="inline-flex items-center text-amber-500 font-bold mx-0.5">★</span>);
      } else if (emoji === "📍") {
        acc.push(
          <span key={`icon-${i}`} className="inline-flex items-center text-red-500 mx-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
        );
      } else if (emoji === "💰") {
        acc.push(<span key={`icon-${i}`} className="inline-flex items-center text-emerald-600 font-bold mx-0.5">₹</span>);
      } else if (emoji === "🏔") {
        acc.push(<span key={`icon-${i}`} className="inline-flex items-center text-slate-500 font-bold mx-0.5">🏔</span>);
      } else {
        // Parse unicode emoji to Apple datasource hex code
        const codePoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16));
        const hex = codePoints.join("-");
        const cdnUrl = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hex}.png`;

        acc.push(
          <img
            key={`emoji-${i}`}
            src={cdnUrl}
            alt={emoji}
            className="inline-block w-4.5 h-4.5 align-text-top mx-0.5 object-contain"
            onError={(e) => {
              // Fallback to text emoji if CDN load fails
              (e.target as HTMLElement).outerHTML = emoji;
            }}
          />
        );
      }
    }
    return acc;
  }, []);
}

const cleanMsgText = (txt: string) => {
  if (!txt) return "";
  // Strip markdown links [Text](URL) to just Text (removes hotel ID path display)
  let cleaned = txt.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  cleaned = cleaned.replace(/\*\*/g, "");
  // Replace line-start stars (*) with •
  cleaned = cleaned.replace(/^\s*\*\s+/gm, "• ");
  // Replace line-start dashes (-) with •
  cleaned = cleaned.replace(/^\s*-\s+/gm, "• ");
  // Strip all other remaining stars
  cleaned = cleaned.replace(/\*/g, "");
  // Strip hashtags headers
  cleaned = cleaned.replace(/#+\s+/g, "");
  return cleaned;
};

// Typing dots indicator
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

// Single Message Structure
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
    promotionalPrice?: number;
    starRating: number;
    guestRating: number;
    reviewCount: number;
    rooms?: {
      id: number;
      name: string;
      pricePerNight: number;
      promotionalPrice?: number;
      maxOccupancy: number;
      description: string;
      images: string[];
    }[];
  }[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Local authentication states
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  
  // Login modal display state
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Custom overlays display states
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [expandedHotelState, setExpandedHotelState] = useState<{ messageId: string; hotelId: number } | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{ images: string[]; activeIndex: number } | null>(null);
  
  // User preferences states
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('gethotel_ai_theme') as 'light' | 'dark') || 'light');
  const [aiVibe, setAiVibe] = useState<'Precise' | 'Balanced' | 'Creative'>(() => (localStorage.getItem('gethotel_ai_vibe') as 'Precise' | 'Balanced' | 'Creative') || 'Balanced');
  
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

  // In-Chat Checkout Modal state
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch logged-in user profile on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
          localStorage.setItem('token', urlToken);
          sessionStorage.setItem('token', urlToken);
          // clean query params from URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }

        const data = await authApi.getMe();
        if (data.success && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        console.warn("User profile fetch failed", err);
      } finally {
        setLoadingUser(false);
      }
    };
    checkUser();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await authApi.googleLogin(idToken);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        sessionStorage.setItem('token', res.token);
        const profileData = await authApi.getMe();
        if (profileData.success && profileData.data) {
          setUser(profileData.data);
          setShowLoginModal(false);
          setLoginError("");
        } else {
          setLoginError("Failed to load user profile after Google login.");
        }
      } else {
        setLoginError(res.message || "Failed to authenticate Google user on backend.");
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setLoginError("This domain is not authorized in Firebase. Please add ai.gethotelstays.com to authorized domains in Firebase Console.");
      } else {
        setLoginError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

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

  /* focus input */
  useEffect(() => {
    if (loadingUser || !user) return;
    const id = setTimeout(() => textareaRef.current?.focus(), 250);
    return () => clearTimeout(id);
  }, [loadingUser, user]);

  /* keyboard navigation for image slider preview */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewState) return;
      if (e.key === "ArrowLeft") {
        setPreviewState(prev => {
          if (!prev) return null;
          const newIndex = (prev.activeIndex - 1 + prev.images.length) % prev.images.length;
          return { ...prev, activeIndex: newIndex };
        });
      } else if (e.key === "ArrowRight") {
        setPreviewState(prev => {
          if (!prev) return null;
          const newIndex = (prev.activeIndex + 1) % prev.images.length;
          return { ...prev, activeIndex: newIndex };
        });
      } else if (e.key === "Escape") {
        setPreviewState(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewState]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSessionClick = useCallback((id: string) => {
    setActiveSessionId(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleDeleteSession = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
  }, []);

  const executeDeleteSession = useCallback(() => {
    if (!sessionToDelete) return;
    const id = sessionToDelete;
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("gethotel_ai_sessions", JSON.stringify(updated));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
    }
    setSessionToDelete(null);
  }, [sessions, activeSessionId, sessionToDelete]);

  const handleClearAllHistory = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const executeClearHistory = () => {
    setSessions([]);
    localStorage.removeItem("gethotel_ai_sessions");
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setShowClearConfirm(false);
  };

  // Intercept the AI booking button and open the in-chat checkout modal
  const handleActionClick = useCallback((path: string) => {
    try {
      const urlQuery = path.split('?')[1];
      if (!urlQuery) return;

      const params = new URLSearchParams(urlQuery);
      const hotelId = parseInt(params.get('hotelId') || '0');
      const roomType = params.get('rooms') || 'Standard Room';
      const checkInStr = params.get('checkIn') || new Date().toISOString().split('T')[0];
      const checkOutStr = params.get('checkOut') || new Date(Date.now() + 86400000).toISOString().split('T')[0];

      // Find the hotel object from message history to fetch correct pricing
      const hotelObj = messages.flatMap(m => m.hotels || []).find(h => h.id === hotelId);

      const checkInDate = new Date(checkInStr);
      const checkOutDate = new Date(checkOutStr);
      const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

      const roomPrice = hotelObj?.pricePerNight || 2500;
      const subtotal = roomPrice * nights;

      // GST tax dynamic calculations
      let gstRate = 0.05;
      if (roomPrice <= 1000) {
        gstRate = 0;
      } else if (roomPrice <= 7500) {
        gstRate = 0.05;
      } else {
        gstRate = 0.18;
      }
      const taxes = Math.round(subtotal * gstRate);
      const total = subtotal + taxes;

      setCheckoutData({
        hotelId,
        hotelName: hotelObj?.name || 'Selected Hotel',
        hotelCity: hotelObj?.city || 'India',
        roomType,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        nights,
        guestName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || ''),
        guestEmail: user?.email || '',
        guestPhone: user?.phone || '',
        roomPrice,
        subtotal,
        taxes,
        total,
        paymentOption: 'online' // default to Pay Online
      });
      setCheckoutStatus("idle");
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to parse action path for checkout", err);
    }
  }, [messages, user]);

  const executeSend = useCallback(async (q: string, currentSessionId: string | null) => {
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: q };
    
    let targetSessionId = currentSessionId;
    let updatedSessions = [...sessions];
    let sessionMessages: Message[] = [];

    if (!targetSessionId) {
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
      const sessionIndex = updatedSessions.findIndex(s => s.id === targetSessionId);
      if (sessionIndex !== -1) {
        sessionMessages = [...updatedSessions[sessionIndex].messages, userMsg];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          messages: sessionMessages
        };
      } else {
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
      const history = sessionMessages.map((m, idx) => {
        let content = m.text;
        // If this is the latest query, append the vibe instruction dynamically
        if (idx === sessionMessages.length - 1) {
          if (aiVibe === 'Precise') {
            content += "\n\n[Instruction: Keep your response precise, brief, factual, and list prices directly with minimal fluff.]";
          } else if (aiVibe === 'Creative') {
            content += "\n\n[Instruction: Be creative, descriptive, suggest detailed packages/itineraries, tell me about local tourist sights, culture, and make the travel recommendations sound exciting and luxurious.]";
          }
        }
        return { role: m.sender === 'ai' ? 'ai' : 'user', content };
      });
      const historyPayload = history.map(h => ({ role: h.role, content: h.content }));
      const data = await aiApi.chat(historyPayload);
      const reply = data.reply || "I'm not sure how to respond. Can you tell me more?";
      
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "ai",
        text: reply,
        hotels: data.hotels || []
      };

      if (data.action) {
        aiMsg.action = data.action;
        if (data.action.type === 'RAZORPAY_PAYMENT') {
          setTimeout(() => {
            triggerInChatRazorpay(data.action);
          }, 2000);
        }
      }

      // If user query asks for rooms/photos/pics, auto-expand; otherwise collapse
      const qLower = q.toLowerCase();
      const asksForRooms = qLower.includes("room") || qLower.includes("photo") || qLower.includes("detail") || qLower.includes("pic") || qLower.includes("tasveer") || qLower.includes("images") || qLower.includes("tasveere");

      if (asksForRooms) {
        let targetHotels = aiMsg.hotels || [];
        if (targetHotels.length === 0) {
          // Fallback: search past messages for matching recommended hotels
          const allPastHotels = sessionMessages.flatMap(m => m.hotels || []);
          if (allPastHotels.length > 0) {
            let matchedPastHotel = allPastHotels.find(h => qLower.includes(h.name.toLowerCase()) || qLower.includes(h.city.toLowerCase()));
            // If no hotel name is explicitly mentioned in the query (e.g. "room photos?"),
            // fallback to the most recently recommended hotel in the chat history
            if (!matchedPastHotel) {
              matchedPastHotel = allPastHotels[allPastHotels.length - 1];
            }
            if (matchedPastHotel) {
              aiMsg.hotels = [matchedPastHotel];
              targetHotels = [matchedPastHotel];
            }
          }
        }

        if (targetHotels.length > 0) {
          const matchedHotel = targetHotels.find(h => qLower.includes(h.name.toLowerCase()) || qLower.includes(h.city.toLowerCase()));
          if (matchedHotel) {
            setExpandedHotelState({ messageId: aiMsg.id, hotelId: matchedHotel.id });
          } else {
            setExpandedHotelState({ messageId: aiMsg.id, hotelId: targetHotels[0].id });
          }
        }
      } else {
        setExpandedHotelState(null);
      }

      const finalMessages = [...sessionMessages, aiMsg];
      setMessages(finalMessages);

      const sessionIndex = updatedSessions.findIndex(s => s.id === targetSessionId);
      if (sessionIndex !== -1) {
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          messages: finalMessages
        };
        setSessions(updatedSessions);
        localStorage.setItem("gethotel_ai_sessions", JSON.stringify(updatedSessions));
      }
    } catch (err: any) {
      console.error("[AI Chat Error]:", err.message);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "ai",
        text: err.status === 429 
          ? "I'm receiving a lot of requests right now. Please wait a moment and try again! 🙏" 
          : "Oops 😅 I had a small issue connection issue. Please try again in a moment."
      };
      setMessages([...sessionMessages, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [sessions, aiVibe]);

  const handleCardClick = useCallback((messageId: string, hotelId: number) => {
    setExpandedHotelState(prev => {
      if (prev?.messageId === messageId && prev?.hotelId === hotelId) {
        return null;
      }
      return { messageId, hotelId };
    });
  }, []);

  const handleSend = useCallback((textVal: string) => {
    const q = textVal.trim();
    if (!q) return;
    executeSend(q, activeSessionId);
  }, [activeSessionId, executeSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }, [handleSend, input]);

  // Handle in-chat payment execution (Razorpay integration)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmBooking = async () => {
    if (!checkoutData) return;
    setCheckoutStatus("loading");
    setErrorMessage("");

    try {
      // 1. Create booking in local database
      const bookingPayload = {
        hotelId: checkoutData.hotelId,
        guestFirstName: user?.firstName || checkoutData.guestName.split(' ')[0] || 'Valued',
        guestLastName: user?.lastName || checkoutData.guestName.split(' ')[1] || 'Guest',
        guestEmail: checkoutData.guestEmail,
        guestPhone: checkoutData.guestPhone || '9999999999',
        checkIn: checkoutData.checkIn,
        checkOut: checkoutData.checkOut,
        rooms: [{ id: 1, quantity: 1 }], // standard fallback
        paymentMethod: checkoutData.paymentOption === 'online' ? 'online' : 'pay_at_hotel',
        specialRequests: "Booked via GetHotelStays AI"
      };

      const res = await bookingApi.createBooking(bookingPayload);
      if (!res.success || !res.booking) {
        throw new Error(res.message || "Failed to create booking.");
      }

      const booking = res.booking;

      if (checkoutData.paymentOption === 'online') {
        // 2. Load Razorpay script dynamically
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay payment gateway script.");
        }

        // 3. Create Razorpay order
        const orderRes = await paymentApi.createOrder(booking.id);
        if (!orderRes.success || !orderRes.order) {
          throw new Error(orderRes.message || "Failed to create payment gateway order.");
        }

        const order = orderRes.order;

        // 4. Open Razorpay Pop-up Modal
        const rzpOptions = {
          key: orderRes.key || "rzp_test_mockkey",
          amount: order.amount,
          currency: order.currency,
          name: "GetHotelStays",
          description: `Booking for ${checkoutData.hotelName}`,
          order_id: order.id,
          prefill: {
            name: checkoutData.guestName,
            email: checkoutData.guestEmail,
            contact: checkoutData.guestPhone || "9999999999"
          },
          theme: {
            color: "#1087e7"
          },
          handler: async (response: any) => {
            try {
              setCheckoutStatus("loading");
              // Verify Razorpay payment
              const verifyRes = await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id
              });

              if (verifyRes.success) {
                setCheckoutStatus("success");
                // Insert confirmed chat message
                const systemMsg: Message = {
                  id: `sys-${Date.now()}`,
                  sender: "ai",
                  text: `🎉 Thank you! Your booking for **[${checkoutData.hotelName}](/hotel/${checkoutData.hotelId})** (${checkoutData.roomType}) has been paid online and confirmed.\n\nA luxury ticket receipt has been delivered to **${checkoutData.guestEmail}**.`
                };
                setMessages(prev => [...prev, systemMsg]);
              } else {
                setCheckoutStatus("error");
                setErrorMessage("Payment verification failed. Please contact support.");
              }
            } catch (err: any) {
              setCheckoutStatus("error");
              setErrorMessage(err.message || "Payment verification error.");
            }
          },
          modal: {
            ondismiss: () => {
              setCheckoutStatus("idle");
            }
          }
        };

        const razorInstance = new (window as any).Razorpay(rzpOptions);
        razorInstance.open();
      } else {
        // Pay at Hotel flow
        setCheckoutStatus("success");
        const systemMsg: Message = {
          id: `sys-${Date.now()}`,
          sender: "ai",
          text: `✅ Booking confirmed! Your stay at **[${checkoutData.hotelName}](/hotel/${checkoutData.hotelId})** (${checkoutData.roomType}) has been reserved. You can pay the total amount of **₹${checkoutData.total.toLocaleString()}** directly at the hotel desk during check-in.\n\nA confirmation alert details mail has been sent to **${checkoutData.guestEmail}**.`
        };
        setMessages(prev => [...prev, systemMsg]);
      }
    } catch (err: any) {
      console.error("[Booking Error]:", err);
      setCheckoutStatus("error");
      setErrorMessage(err.message || "Something went wrong while confirming booking.");
    }
  };

  const triggerInChatRazorpay = async (actionData: any) => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay payment gateway script.");
      }

      const rzpOptions = {
        key: actionData.keyId || "rzp_test_mockkey",
        amount: actionData.amount,
        currency: actionData.currency,
        name: "GetHotelStays",
        description: `Booking for ${actionData.hotelName}`,
        order_id: actionData.razorpayOrderId,
        prefill: {
          name: actionData.guestName,
          email: actionData.guestEmail,
          contact: actionData.guestPhone || "9999999999"
        },
        theme: {
          color: "#1087e7"
        },
        handler: async (response: any) => {
          const loadingMsgId = `sys-loading-${Date.now()}`;
          try {
            setMessages(prev => [...prev, {
              id: loadingMsgId,
              sender: "ai",
              text: "🔄 Payment verify ho raha hai, please wait..."
            }]);

            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: actionData.bookingId
            });

            setMessages(prev => prev.filter(m => m.id !== loadingMsgId));

            if (verifyRes.success) {
              setMessages(prev => [...prev, {
                id: `sys-success-${Date.now()}`,
                sender: "ai",
                text: `🎉 Bahut bahut dhanyawad! Aapki payment verify ho gayi hai aur booking successfully confirm ho chuki hai! \n\nBooking ID: **#${actionData.bookingId}**\nHotel: **${actionData.hotelName}**\n\nLuxury ticket receipt aapke email **${actionData.guestEmail}** par deliver kar di gayi hai! 📧✨`
              }]);
            } else {
              setMessages(prev => [...prev, {
                id: `sys-error-${Date.now()}`,
                sender: "ai",
                text: "❌ Payment verification failed. Please contact support or try again."
              }]);
            }
          } catch (err: any) {
            setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
            setMessages(prev => [...prev, {
              id: `sys-error-${Date.now()}`,
              sender: "ai",
              text: `❌ Payment verification mein error aayi: ${err.message}`
            }]);
          }
        },
        modal: {
          ondismiss: () => {
            setMessages(prev => [...prev, {
              id: `sys-dismiss-${Date.now()}`,
              sender: "ai",
              text: "⚠️ Payment cancel ho gaya hai. Aap chat mein phir se payment select kar sakte hain."
            }]);
          }
        }
      };

      const razorInstance = new (window as any).Razorpay(rzpOptions);
      razorInstance.open();
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `sys-error-${Date.now()}`,
        sender: "ai",
        text: `❌ Payment script load karne mein issue aaya: ${err.message}`
      }]);
    }
  };

  if (loadingUser) {
    const totalDots = 10;
    const radius = 32; // Radius in percentage relative to container

    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? "bg-[#09090b]" : "bg-slate-50"
      }`}>
        <div className="flex flex-col items-center justify-center gap-7">
          <div className="relative w-16 h-16">
            {[...Array(totalDots)].map((_, i) => {
              const angle = (i * 2 * Math.PI) / totalDots;
              const top = 50 + radius * Math.sin(angle);
              const left = 50 + radius * Math.cos(angle);

              return (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full animate-dotted ${
                    theme === 'dark' ? "bg-brand-400" : "bg-brand-600"
                  }`}
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Guest access allowed, full-screen login card removed as requested

  return (
    <div 
      className={`fixed inset-0 flex font-sans overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? "text-slate-100 bg-[#09090b]" : "text-slate-800 bg-[#ffffff]"
      }`}
      style={{
        background: theme === 'dark'
          ? "radial-gradient(circle at 50% 120%, rgba(37, 99, 235, 0.15) 0%, rgba(9, 9, 11, 0) 70%), linear-gradient(180deg, #09090b 0%, #020203 100%)"
          : "radial-gradient(circle at 50% 120%, rgba(30, 64, 175, 0.6) 0%, rgba(191, 219, 254, 0) 75%), linear-gradient(180deg, #ffffff 0%, #b8d7ff 100%)"
      }}
    >
      {/* ============ SIDEBAR Drawer Overlay (Mobile) ============ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-[1000] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR Content ============ */}
      <aside className={`w-[260px] border-r shrink-0 flex flex-col p-4.5 transition-all duration-300 ${
        theme === 'dark' 
          ? "border-[#1e1e24] bg-[#0f0f12]/95 backdrop-blur-xl text-slate-200" 
          : "border-slate-200/50 bg-slate-100/80 backdrop-blur-xl text-slate-800"
      } ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-[68px]"
      } fixed md:static inset-y-0 left-0 z-[1001] transition-all duration-300`}>
        {/* Toggle Hamburger Button (slim view desktop) */}
        <div className="flex items-center justify-between shrink-0 mb-6 px-1">
          {isSidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-[17px] font-black tracking-tighter transition-colors duration-300 ${
                  theme === 'dark' ? "text-slate-100" : "text-slate-950"
                }`}>
                  GetHotelStays<span className={theme === 'dark' ? "text-brand-400 not-italic" : "text-brand-600 not-italic"}>.</span>
                </span>
              </div>
              <button 
                onClick={toggleSidebar}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  theme === 'dark' ? "hover:bg-[#1e1e22] text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/60 text-slate-500 hover:text-slate-700"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mx-auto cursor-pointer ${
                theme === 'dark' ? "hover:bg-[#1e1e22] text-slate-400" : "hover:bg-slate-200/60 text-slate-600"
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className={`
            flex items-center justify-center gap-2 mb-6 text-sm font-medium transition-all duration-200 shrink-0 cursor-pointer
            ${isSidebarOpen 
              ? (theme === 'dark' ? "w-full py-3 px-4 bg-[#1e1e22] hover:bg-[#28282d] border border-[#2e2e34] rounded-full text-slate-200 shadow-sm" : "w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 shadow-sm")
              : (theme === 'dark' ? "w-10 h-10 bg-[#1e1e22] hover:bg-[#28282d] border border-[#2e2e34] rounded-full text-slate-200 mx-auto" : "w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 mx-auto")
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
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors text-left group cursor-pointer
                    ${activeSessionId === s.id 
                      ? (theme === 'dark' ? "bg-brand-500/20 text-brand-300 border border-brand-500/40" : "bg-[#d3e3fd] text-[#041e49]") 
                      : (theme === 'dark' ? "text-slate-400 hover:bg-[#1e1e22]/50" : "text-slate-600 hover:bg-slate-200/60")
                    }
                  `}
                  title={s.title}
                >
                  <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-500" />
                  <span className="truncate flex-1">{s.title}</span>
                  <span 
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-300/40 text-slate-400 hover:text-red-500 transition-all"
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
        <div className={`pt-4 border-t shrink-0 space-y-1 ${
          theme === 'dark' ? "border-[#1e1e24]" : "border-slate-200/60"
        }`}>
          {isSidebarOpen && sessions.length > 0 && (
            <button 
              onClick={handleClearAllHistory}
              className="flex items-center gap-3 w-full rounded-xl text-red-500 hover:bg-red-50/20 px-3 py-2.5 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
          <button 
            onClick={() => setShowSettingsModal(true)}
            className={`flex items-center gap-3 w-full rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer ${isSidebarOpen ? "px-3 py-2.5 text-xs" : "h-10 justify-center mx-auto"}`}
          >
            <Settings className="w-4 h-4" />
            {isSidebarOpen && <span>Settings</span>}
          </button>
          <button 
            onClick={() => setShowHelpModal(true)}
            className={`flex items-center gap-3 w-full rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer ${isSidebarOpen ? "px-3 py-2.5 text-xs" : "h-10 justify-center mx-auto"}`}
          >
            <HelpCircle className="w-4 h-4" />
            {isSidebarOpen && <span>Help & Activity</span>}
          </button>
        </div>
      </aside>

      {/* ============ MAIN CHAT LAYOUT ============ */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
        
        {/* Header */}
        <header className={`h-14 flex items-center justify-between px-4 border-b z-10 shrink-0 select-none transition-colors duration-300 ${
          theme === 'dark' 
            ? "border-[#1e1e24]/60 bg-[#09090b]/60 backdrop-blur-md" 
            : "border-slate-200/30 bg-white/40 backdrop-blur-md"
        }`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer ${
                theme === 'dark' ? "hover:bg-slate-850 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Header text removed */}
          </div>
          
          <div className="flex items-center gap-2.5">
            {user ? (
              <div 
                title={user.name || user.email}
                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border text-slate-700 font-black text-[13px] uppercase shadow-sm select-none cursor-help hover:scale-105 transition-all ${
                  theme === 'dark' ? "bg-white/70 border-[#2e2e34] text-slate-800 hover:bg-white/85" : "bg-white/50 border-white/80 text-slate-700 hover:bg-white/75"
                }`}
              >
                {(user.firstName || user.name || user.email || "G").charAt(0).toUpperCase()}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className={`text-[11px] font-bold border rounded-full px-3.5 py-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  theme === 'dark'
                    ? "text-slate-200 bg-[#1e1e22] border-[#2e2e34] hover:bg-[#28282d]"
                    : "text-slate-700 bg-white/60 hover:bg-white/80 border-white/85"
                }`}
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Chats Feed Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar px-4">
          {/* Collapsible Spacer (only when chat is empty to push heading down) */}
          <div className={`transition-all duration-700 ease-in-out ${messages.length === 0 ? "h-[25vh]" : "h-0"}`} />
          
          {/* Centered Welcome Heading */}
          <h1 className={`text-3xl md:text-4xl font-semibold text-center select-none transition-all duration-500 ease-in-out ${
            messages.length === 0 
              ? `mb-8 opacity-100 scale-100 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}` 
              : "mb-0 opacity-0 scale-95 h-0 overflow-hidden"
          }`}>
            What are we planning today?
          </h1>

          {messages.length > 0 && (
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 py-8">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Bubble */}
                  {msg.sender === "user" && (
                    <div className="flex justify-end w-full">
                      <div className={`max-w-[80%] px-5 py-3.5 text-[16px] leading-[1.6] rounded-2xl rounded-tr-sm shadow-sm border transition-colors duration-300 animate-fade-in ${
                        theme === 'dark'
                          ? "bg-[#1f1f23] border-[#2d2d34] text-slate-100"
                          : "bg-slate-100 border-slate-200/50 text-slate-800"
                      }`}>
                        {parseTextWithIcons(cleanMsgText(msg.text))}
                      </div>
                    </div>
                  )}

                  {/* AI Assistant Bubble */}
                  {msg.sender === "ai" && (
                    <div className="w-full py-2">
                      <div className={`text-[16px] leading-[1.75] font-medium whitespace-pre-line tracking-wide transition-colors ${
                        theme === 'dark' ? "text-slate-100" : "text-[#1f2937]"
                      }`}>
                        {parseTextWithIcons(cleanMsgText(msg.text))}
                      </div>

                      {/* Render custom Action Button if present */}
                      {msg.action && (
                        <div className="mt-3 flex justify-start">
                          <button
                            onClick={() => handleActionClick(msg.action!.path)}
                            className={`px-4.5 py-2.5 border rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                              theme === 'dark'
                                ? "bg-brand-600 border-brand-500/30 text-white hover:bg-brand-500"
                                : "bg-brand-500 border-brand-400/20 text-white hover:bg-brand-600"
                            }`}
                          >
                            {msg.action.label}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Render Interactive Hotel Cards Grid */}
                      {msg.hotels && msg.hotels.length > 0 && (
                        <div className="mt-4.5 select-none overflow-x-auto no-scrollbar scroll-smooth">
                          <div className="flex gap-4.5 pb-2.5 min-w-max">
                            {msg.hotels.map((h) => (
                              <div
                                key={h.id}
                                onClick={() => handleCardClick(msg.id, h.id)}
                                className={`w-[210px] h-[150px] rounded-3xl overflow-hidden relative shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer ${
                                  theme === 'dark' ? "bg-[#131316] border border-[#232329]" : "bg-white border border-slate-100"
                                }`}
                              >
                                {/* Thumbnail Image */}
                                <div className="w-full h-full overflow-hidden relative shrink-0">
                                  {h.thumbnail ? (
                                    <img
                                      src={h.thumbnail}
                                      alt={h.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                      <span className="text-slate-400 text-xs">No preview</span>
                                    </div>
                                  )}

                                  {/* Black Gradient Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-1" />

                                  {/* Details Overlay */}
                                  <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-2">
                                    <div className="flex justify-end">
                                      <div className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-red-500 hover:bg-black/40 transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-0.5 text-white">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <span className="text-amber-400 text-[10px]">★</span>
                                        <span className="text-[10px] font-bold text-white/90">{h.starRating} Star</span>
                                        <span className="text-[9px] text-white/60">({h.reviewCount})</span>
                                      </div>
                                      <h4 className="text-[13px] font-bold leading-tight truncate w-[160px]" title={h.name}>
                                        {h.name}
                                      </h4>
                                      <p className="text-[10px] text-white/70 font-semibold truncate">
                                        {h.city}
                                      </p>
                                      
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-[12px] font-bold">
                                          {h.promotionalPrice ? (
                                            <>
                                              <span className="line-through text-white/50 text-[10px] mr-1.5">
                                                ₹{h.pricePerNight.toLocaleString()}
                                              </span>
                                              <span className="text-emerald-400 font-extrabold">
                                                ₹{h.promotionalPrice.toLocaleString()}
                                              </span>
                                            </>
                                          ) : (
                                            <span>₹{h.pricePerNight.toLocaleString()}</span>
                                          )}
                                          <span className="text-[9px] font-normal text-white/70">/night</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Available Rooms Grid (Photos, descriptions, prices, booking triggers) */}
                      {msg.hotels && msg.hotels.length > 0 && (() => {
                        // Enrich hotel rooms from all messages if current hotel's rooms are empty
                        const enrichedHotels = msg.hotels.map(h => {
                          if (h.rooms && h.rooms.length > 0) return h;
                          // Search all messages for rooms data for this hotel
                          const allHotels = messages.flatMap(m => m.hotels || []);
                          const matchedHotel = allHotels.find(ph => ph.id === h.id && ph.rooms && ph.rooms.length > 0);
                          if (matchedHotel) {
                            return { ...h, rooms: matchedHotel.rooms };
                          }
                          return h;
                        });
                        const hotelsWithRooms = enrichedHotels.filter(h => h.rooms && h.rooms.length > 0);
                        if (hotelsWithRooms.length === 0) return null;
                        return (
                          <div className="mt-4 space-y-4 select-none">
                            {hotelsWithRooms.map((h) => {
                              const showRooms = (expandedHotelState?.messageId === msg.id && expandedHotelState?.hotelId === h.id) ||
                                                (msg.hotels?.length === 1 && /room|rooms|dikha|dikhao|show|photo|pic/i.test(msg.text || ''));
                              if (!showRooms) return null;

                              return (
                                <div key={`rooms-container-${h.id}`} className="space-y-3 animate-fade-in">
                                  <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                      Available Rooms at {h.name}
                                    </h4>
                                    <button
                                      onClick={() => setExpandedHotelState(null)}
                                      className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      Hide Rooms
                                    </button>
                                  </div>

                                  <div className="overflow-x-auto no-scrollbar scroll-smooth">
                                    <div className="flex gap-4 pb-2.5 min-w-max">
                                      {h.rooms!.map((r) => {
                                        const roomImage = r.images && r.images.length > 0
                                          ? r.images[0]
                                          : "https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=600&q=80";

                                        return (
                                          <div
                                            key={r.id}
                                            className={`w-[260px] rounded-3xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                                              theme === 'dark'
                                                ? "bg-[#131316] border-[#232329]"
                                                : "bg-white border-slate-100"
                                            }`}
                                          >
                                            {/* Room Image */}
                                            <div 
                                              className="w-full h-[120px] overflow-hidden relative cursor-zoom-in"
                                              onClick={() => setPreviewState({
                                                images: r.images && r.images.length > 0 ? r.images : [roomImage],
                                                activeIndex: 0
                                              })}
                                            >
                                              <img
                                                src={roomImage}
                                                alt={r.name}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                              />
                                              <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-md text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white/90">
                                                👥 Max {r.maxOccupancy} Guests
                                              </div>
                                            </div>

                                            {/* Room Info */}
                                            <div className="p-3.5 flex flex-col justify-between h-[110px]">
                                              <div>
                                                <h5 className={`text-[13px] font-bold truncate ${
                                                  theme === 'dark' ? "text-slate-100" : "text-slate-800"
                                                }`} title={r.name}>
                                                  {r.name}
                                                </h5>
                                                <p className={`text-[10px] truncate mt-0.5 ${
                                                  theme === 'dark' ? "text-slate-400" : "text-slate-500"
                                                }`}>
                                                  {r.description || "Beautifully furnished cozy travel space."}
                                                </p>
                                              </div>

                                              <div className="flex items-center justify-between mt-2.5">
                                                <span className={`text-[12px] font-extrabold ${
                                                  theme === 'dark' ? "text-emerald-400" : "text-slate-800"
                                                }`}>
                                                  {r.promotionalPrice ? (
                                                    <>
                                                      <span className="line-through text-slate-400 text-[10px] mr-1.5 font-normal">
                                                        ₹{r.pricePerNight.toLocaleString()}
                                                      </span>
                                                      <span className="text-emerald-500 font-extrabold">
                                                        ₹{r.promotionalPrice.toLocaleString()}
                                                      </span>
                                                    </>
                                                  ) : (
                                                    <span>₹{r.pricePerNight.toLocaleString()}</span>
                                                  )}
                                                  <span className="text-[9px] font-normal text-slate-500">/night</span>
                                                </span>
                                                <button
                                                  onClick={() => handleSend(`I want to book the ${r.name} at ${h.name}`)}
                                                  className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                                                >
                                                  Book Room
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className={`flex items-end gap-2 focus-within:ring-2 focus-within:ring-brand-400/20 focus-within:border-brand-400/40 rounded-full px-5 py-2.5 transition-all shadow-lg ${
                theme === 'dark'
                  ? "bg-[#1e1e22]/95 backdrop-blur-md border border-[#2e2e34] shadow-black/40"
                  : "bg-white/60 backdrop-blur-md border border-white/80 shadow-slate-100/50"
              }`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about hotels..."
                rows={1}
                className={`flex-1 bg-transparent py-1.5 px-1 text-sm outline-none resize-none font-normal leading-6 max-h-[160px] no-scrollbar transition-colors ${
                  theme === 'dark' ? "text-slate-100 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
                }`}
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer ${
                  theme === 'dark'
                    ? "bg-brand-600 text-white hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600"
                    : "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-slate-200/50 disabled:text-slate-400"
                }`}
              >
                <ArrowUp className="w-4.5 h-4.5 rotate-45" />
              </button>
            </form>
            
            <div className={`text-[10px] text-center mt-2 select-none ${
              theme === 'dark' ? "text-slate-500" : "text-slate-400"
            }`}>
              GetHotelStays AI may display inaccurate info. Double-check important details.
            </div>
          </div>
        </footer>

        {/* ============ IN-CHAT CHECKOUT MODAL OVERLAY ============ */}
        {checkoutData && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
              {/* Header */}
              <div className="px-6 py-4.5 bg-[#0f172a] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">Confirm Reservation</h3>
                  <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">In-Chat Secure Checkout</p>
                </div>
                {checkoutStatus !== "loading" && checkoutStatus !== "success" && (
                  <button 
                    onClick={() => setCheckoutData(null)}
                    className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {checkoutStatus === "success" ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                      <Check className="w-8 h-8" strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-xl font-extrabold text-slate-800">Booking Confirmed!</h4>
                      <p className="text-sm font-medium text-slate-500 mt-1 max-w-xs mx-auto">
                        Your ticket details have been delivered to your email: **{checkoutData.guestEmail}**.
                      </p>
                    </div>
                    <button 
                      onClick={() => setCheckoutData(null)}
                      className="px-6 py-2.5 bg-[#0f172a] hover:bg-slate-800 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      Back to Chat
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Destination details card */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest">Stay Selected</span>
                      <h4 className="text-[15px] font-extrabold text-slate-800 mt-0.5">{checkoutData.hotelName}</h4>
                      <p className="text-xs font-medium text-slate-500">📍 {checkoutData.hotelCity}</p>
                      
                      <div className="flex items-center justify-between border-t border-slate-200/50 mt-3 pt-3">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Check-In</span>
                          <p className="text-xs font-bold text-slate-700">{new Date(checkoutData.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Check-Out</span>
                          <p className="text-xs font-bold text-slate-700">{new Date(checkoutData.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-200/50 mt-3 pt-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Room Type Selected</span>
                        <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">{checkoutData.roomType}</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guest Information</h5>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <input 
                            type="text" 
                            value={checkoutData.guestName}
                            onChange={(e) => setCheckoutData({ ...checkoutData, guestName: e.target.value })}
                            className="bg-transparent text-xs font-bold text-slate-700 w-full outline-none"
                            placeholder="Full Name"
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <input 
                            type="email" 
                            value={checkoutData.guestEmail}
                            onChange={(e) => setCheckoutData({ ...checkoutData, guestEmail: e.target.value })}
                            className="bg-transparent text-xs font-bold text-slate-700 w-full outline-none"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setCheckoutData({ ...checkoutData, paymentOption: 'online' })}
                          className={`flex flex-col items-center gap-2 p-4 border rounded-2xl text-center transition-all cursor-pointer ${
                            checkoutData.paymentOption === 'online' 
                              ? 'border-brand-500 bg-brand-50/50 text-brand-600' 
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                          }`}
                        >
                          <CreditCard className="w-5 h-5" />
                          <span className="text-xs font-bold">Pay Online</span>
                        </button>
                        <button
                          onClick={() => setCheckoutData({ ...checkoutData, paymentOption: 'hotel' })}
                          className={`flex flex-col items-center gap-2 p-4 border rounded-2xl text-center transition-all cursor-pointer ${
                            checkoutData.paymentOption === 'hotel' 
                              ? 'border-brand-500 bg-brand-50/50 text-brand-600' 
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                          }`}
                        >
                          <Calendar className="w-5 h-5" />
                          <span className="text-xs font-bold">Pay at Hotel</span>
                        </button>
                      </div>
                    </div>

                    {/* Pricing details breakdown */}
                    <div className="border-t border-slate-200/60 pt-4 space-y-2 select-none">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                        <span>Room Price ({checkoutData.nights} night{checkoutData.nights > 1 ? 's' : ''})</span>
                        <span>₹{(checkoutData.roomPrice * checkoutData.nights).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                        <span>GST Tax</span>
                        <span>₹{checkoutData.taxes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-extrabold text-slate-800 border-t border-slate-200/50 pt-2.5">
                        <span>Grand Total</span>
                        <span>₹{checkoutData.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 text-xs font-semibold">
                        ⚠️ {errorMessage}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {checkoutStatus !== "success" && (
                <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-200/60 flex items-center justify-end gap-2.5">
                  {checkoutStatus !== "loading" && (
                    <button 
                      onClick={() => setCheckoutData(null)}
                      className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    onClick={handleConfirmBooking}
                    disabled={checkoutStatus === "loading"}
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:bg-brand-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    {checkoutStatus === "loading" && <Loader className="w-3.5 h-3.5 animate-spin" />}
                    {checkoutData.paymentOption === 'online' ? 'Proceed to Pay' : 'Confirm Reservation'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ============ LOGIN OVERLAY MODAL ============ */}
        {showLoginModal && !user && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-8 shadow-premium select-none relative animate-slide-up text-center">
              {/* Close Button */}
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Logo / Header */}
              <div className="mb-8">
                <img src="/logo.svg" alt="GetHotelStays Logo" className="w-16 h-16 mx-auto object-contain mb-4 animate-glow rounded-2xl" />
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 tracking-tight">
                  GetHotelStays AI
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1.5 uppercase tracking-wider">
                  Travel Expert Companion
                </p>
              </div>

              <div className="space-y-4">
                {loginError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-500 text-xs font-semibold text-left">
                    ⚠️ {loginError}
                  </div>
                )}

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 active:scale-98 disabled:bg-slate-100 text-slate-700 text-sm font-extrabold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <Loader className="w-5 h-5 animate-spin text-brand-500" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  Sign In with Google
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 select-none">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
              </div>

              {/* Go back */}
              <div className="text-center">
                <a 
                  href="https://gethotelstays.com"
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  Go to Main Website
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============ CLEAR HISTORY CONFIRMATION MODAL ============ */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-sm border rounded-3xl p-6 shadow-premium select-none relative animate-slide-up text-center ${
              theme === 'dark' 
                ? "bg-[#0f0f12]/95 border-[#1e1e24] text-slate-100" 
                : "bg-white/80 backdrop-blur-xl border-white/90 text-slate-800"
            }`}>
              <h3 className="text-lg font-extrabold mb-2 select-none">Clear Chat History</h3>
              <p className={`text-xs mb-6 ${theme === 'dark' ? "text-slate-400" : "text-slate-500"}`}>
                Do you really want to clear all chats? This action cannot be undone.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className={`flex-1 py-3 border text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                    theme === 'dark' 
                      ? "border-[#2e2e34] bg-[#1e1e22] text-slate-300 hover:bg-[#28282d]" 
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={executeClearHistory}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Yes, Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ SINGLE CHAT DELETE CONFIRMATION MODAL ============ */}
        {sessionToDelete && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-sm border rounded-3xl p-6 shadow-premium select-none relative animate-slide-up text-center ${
              theme === 'dark'
                ? "bg-[#0f0f12]/95 border-[#1e1e24] text-slate-100"
                : "bg-white/80 backdrop-blur-xl border-white/90 text-slate-800"
            }`}>
              <h3 className="text-lg font-extrabold mb-2 select-none">Delete Chat Session?</h3>
              <p className={`text-xs mb-6 ${
                theme === 'dark' ? "text-slate-400" : "text-slate-500"
              }`}>
                Do you really want to delete this conversation? This action cannot be undone.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className={`flex-1 py-3 border text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                    theme === 'dark'
                      ? "border-[#2e2e34] bg-[#1e1e22] text-slate-300 hover:bg-[#28282d]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeleteSession}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ SETTINGS MODAL ============ */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-md border rounded-3xl p-7 shadow-premium relative animate-slide-up transition-colors duration-300 ${
              theme === 'dark' 
                ? "bg-[#0f0f12]/95 border-[#1e1e24] text-slate-100" 
                : "bg-white/80 backdrop-blur-xl border-white/90 text-slate-800"
            }`}>
              {/* Close Button */}
              <button 
                onClick={() => setShowSettingsModal(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                  theme === 'dark' ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-500 hover:text-slate-700"
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-extrabold mb-5 select-none">AI Assistant Settings</h3>

              <div className="space-y-6">
                {/* User Info status */}
                <div className={`p-4 border rounded-2xl flex items-center justify-between ${
                  theme === 'dark' ? "bg-[#131316] border-[#232329]" : "bg-white/60 border-slate-100"
                }`}>
                  <div className="flex items-center gap-3">
                    {user ? (
                      <>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-500 text-white font-bold uppercase">
                          {user.email.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{user.name || 'GetHotelStays User'}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{user.email}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold uppercase">
                          G
                        </div>
                        <div>
                          <p className="text-xs font-bold">Guest Session</p>
                          <p className="text-[10px] font-semibold text-slate-400">Sign in to save travel history</p>
                        </div>
                      </>
                    )}
                  </div>
                  {user && (
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                        setUser(null);
                        setShowSettingsModal(false);
                      }}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                </div>

                {/* AI Preferences */}
                <div className="space-y-3.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                    AI Response Vibe
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Precise', 'Balanced', 'Creative'] as const).map((vibe) => (
                      <button
                        key={vibe}
                        onClick={() => {
                          setAiVibe(vibe);
                          localStorage.setItem('gethotel_ai_vibe', vibe);
                        }}
                        className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          vibe === aiVibe
                            ? (theme === 'dark' ? "bg-brand-500/20 border-brand-500/40 text-brand-400" : "bg-brand-50 border-brand-200 text-brand-600")
                            : (theme === 'dark' ? "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                        }`}
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme mode */}
                <div className="space-y-3.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                    App Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Light Theme', 'Dark Theme'].map((themeVal) => {
                      const targetTheme = themeVal === 'Light Theme' ? 'light' : 'dark';
                      return (
                        <button
                          key={themeVal}
                          onClick={() => {
                            setTheme(targetTheme);
                            localStorage.setItem('gethotel_ai_theme', targetTheme);
                          }}
                          className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            theme === targetTheme
                              ? (theme === 'dark' ? "bg-brand-500/20 border-brand-500/40 text-brand-400" : "bg-brand-50 border-brand-200 text-brand-600")
                              : (theme === 'dark' ? "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                          }`}
                        >
                          {themeVal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ HELP & ACTIVITY MODAL ============ */}
        {showHelpModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-md border rounded-3xl p-7 shadow-premium relative animate-slide-up transition-colors duration-300 ${
              theme === 'dark' 
                ? "bg-slate-900 border-slate-800 text-slate-100" 
                : "bg-white/80 backdrop-blur-xl border-white/90 text-slate-800"
            }`}>
              {/* Close Button */}
              <button 
                onClick={() => setShowHelpModal(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                  theme === 'dark' ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-500 hover:text-slate-700"
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-extrabold mb-5 select-none">Help & Activity</h3>

              <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-1.5 no-scrollbar">
                {/* Quick start guides */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold select-none uppercase tracking-wider">What can I ask?</h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-400 list-disc list-inside">
                    <li>"Find luxury hotels with pool in Jaipur"</li>
                    <li>"Compare rooms under ₹5000 in Delhi"</li>
                    <li>"Calculate GST details for a 3-night stay"</li>
                    <li>"Book a room at Toshali Royal Resort"</li>
                  </ul>
                </div>

                {/* FAQ section */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/50">
                  <h4 className="text-xs font-bold select-none uppercase tracking-wider">FAQ</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold">How do booking confirmations work?</p>
                      <p className="text-[11px] font-semibold text-slate-400 leading-relaxed mt-0.5">
                        GetHotelStays AI automatically routes reservation confirmations and split invoices directly to your registered email address.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Is my transaction secure?</p>
                      <p className="text-[11px] font-semibold text-slate-400 leading-relaxed mt-0.5">
                        Yes! Razorpay checkout overlays open directly in the chat, keeping your financial credentials fully encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support details */}
                <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl text-center space-y-1 pt-3">
                  <p className="text-xs font-bold text-brand-700">Need direct human assistance?</p>
                  <p className="text-[10px] font-semibold text-brand-600/80">Our 24/7 client relations cell is here to help.</p>
                  <div className="pt-2">
                    <a 
                      href="mailto:support@gethotelstays.com"
                      className="text-xs font-black text-brand-700 hover:underline inline-block"
                    >
                      support@gethotelstays.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ PREVIEW IMAGE LIGHTBOX MODAL ============ */}
        {previewState && (
          <div 
            className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in"
            onClick={() => setPreviewState(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
              onClick={() => setPreviewState(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Nav Button */}
            {previewState.images.length > 1 && (
              <button
                className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewState(prev => {
                    if (!prev) return null;
                    const newIndex = (prev.activeIndex - 1 + prev.images.length) % prev.images.length;
                    return { ...prev, activeIndex: newIndex };
                  });
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Nav Button */}
            {previewState.images.length > 1 && (
              <button
                className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewState(prev => {
                    if (!prev) return null;
                    const newIndex = (prev.activeIndex + 1) % prev.images.length;
                    return { ...prev, activeIndex: newIndex };
                  });
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image View */}
            <div className="relative max-w-[80vw] max-h-[80vh] flex flex-col items-center justify-center">
              <img 
                src={previewState.images[previewState.activeIndex]} 
                alt={`Room View ${previewState.activeIndex + 1}`} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-premium"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Image Counter Badge */}
              {previewState.images.length > 1 && (
                <div className="absolute bottom-4 bg-black/60 backdrop-blur-md text-[11px] font-bold px-3 py-1 rounded-full text-white/90 select-none">
                  {previewState.activeIndex + 1} / {previewState.images.length}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
