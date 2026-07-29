import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Settings, HelpCircle, MessageSquare, Menu, Trash2, Calendar, User, Mail, CreditCard, Check, X, ArrowRight, Loader, ChevronLeft, ChevronRight, ArrowUp, Bookmark } from "lucide-react";
import { aiApi, authApi, bookingApi, paymentApi, conversationApi } from "./lib/api";
import { auth, googleProvider } from "./lib/firebase";
import { signInWithPopup } from "firebase/auth";
import ErrorBoundary from "./components/ErrorBoundary";
import MarkdownRenderer from "./components/MarkdownRenderer";
import CopyButton from "./components/CopyButton";
import OfflineBanner from "./components/OfflineBanner";
import SearchBar from "./components/SearchBar";
import FlightCard from "./components/FlightCard";
import TourPackageCard from "./components/TourPackageCard";

// Dynamic Apple Emoji CDN Parser
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}]/gu;

const getAppleEmojiUrl = (emoji: string) => {
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16));
  const hex = codePoints.filter(h => h !== 'fe0f').join("-");
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hex}.png`;
};

const AppleEmoji = memo(function AppleEmoji({ symbol, className = "w-4 h-4" }: { symbol: string; className?: string }) {
  const url = getAppleEmojiUrl(symbol);
  return (
    <img
      src={url}
      alt={symbol}
      className={`inline-block align-text-bottom object-contain select-none ${className}`}
      onError={(e) => {
        (e.target as HTMLElement).outerHTML = symbol;
      }}
    />
  );
});

function parseTextWithIcons(text: string) {
  if (!text) return "";
  const parts = text.split(emojiRegex);
  const emojis = text.match(emojiRegex) || [];

  return parts.reduce((acc: any[], part, i) => {
    acc.push(part);
    if (emojis[i]) {
      acc.push(
        <AppleEmoji key={`emoji-${i}`} symbol={emojis[i]} className="w-4.5 h-4.5 mx-0.5" />
      );
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

// Shimmering Text Thinking Indicator (ChatGPT / Claude style - Dynamic per query)
const ThinkingIndicator = memo(function ThinkingIndicator({ theme, lastUserText = '' }: { theme: 'light' | 'dark'; lastUserText?: string }) {
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = useMemo(() => {
    const text = (lastUserText || '').toLowerCase();

    // 1. Booking / Reservation / Details collection
    if (/\b(book|booking|reserve|confirm|name|email|phone|pay|payment)\b/i.test(text)) {
      return [
        "Processing reservation details...",
        "Validating booking information...",
        "Preparing next step..."
      ];
    }

    // 2. Hotel / Room / Search / Price inquiry
    if (/\b(hotel|hotels|room|rooms|stay|resort|city|delhi|goa|mumbai|price|rates|view|search)\b/i.test(text)) {
      return [
        "Searching live hotel inventory...",
        "Filtering top-rated properties...",
        "Formatting best recommendations..."
      ];
    }

    // 3. Personal memory / instructions inquiry
    if (/\b(me|my|know|remember|preference|nickname|name|history)\b/i.test(text)) {
      return [
        "Accessing your travel memory...",
        "Personalizing response..."
      ];
    }

    // 4. General / Clarification / Travel Advice query
    return [
      "Thinking...",
      "Analyzing your question...",
      "Formulating response..."
    ];
  }, [lastUserText]);

  useEffect(() => {
    setStatusIndex(0);
    const timer = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statuses.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [statuses]);

  return (
    <div className="flex items-center py-2.5 select-none animate-fade-in">
      <span className={`text-[15px] font-semibold tracking-wide transition-all ${
        theme === 'dark' ? "text-shimmer-dark" : "text-shimmer-light"
      }`}>
        {statuses[statusIndex] || statuses[0]}
      </span>
    </div>
  );
});

interface HotelAttachment {
  id: number;
  name: string;
  city: string;
  thumbnail: string | null;
  pricePerNight: number;
  starRating: number;
  guestRating: number;
  reviewCount?: number;
  description?: string;
  images?: string[];
  type?: 'hotel' | 'room';
}

// Single Message Structure
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp?: number;
  responseType?: 'hotels' | 'rooms' | 'general';
  action?: {
    label?: string;
    path?: string;
    hotelId?: number;
    hotelName?: string;
    depositAmount?: number;
    balanceAmount?: number;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    razorpayOrderId?: string;
    keyId?: string;
    amount?: number;
    currency?: string;
    [key: string]: any;
  };
  attachments?: HotelAttachment[];
  hotels?: (HotelAttachment & {
    promotionalPrice?: number;
    rooms?: {
      id: number;
      name: string;
      pricePerNight: number;
      promotionalPrice?: number;
      maxOccupancy: number;
      description: string;
      images: string[];
    }[];
  })[];
  flights?: any;
  tourPackage?: any;
}

interface ConversationListItem {
  id: string;
  title: string;
  updatedAt: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [viewportHeight, setViewportHeight] = useState<string>("100vh");

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    const preventWindowScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', preventWindowScroll);
    return () => window.removeEventListener('scroll', preventWindowScroll);
  }, []);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  
  // Login modal display state
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Custom overlays display states
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [composerAttachment, setComposerAttachment] = useState<HotelAttachment | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{ images: string[]; activeIndex: number } | null>(null);
  
  // User preferences states
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('gethotel_ai_theme') as 'light' | 'dark') || 'light');
  const [aiVibe, setAiVibe] = useState<'Precise' | 'Balanced' | 'Creative'>(() => (localStorage.getItem('gethotel_ai_vibe') as 'Precise' | 'Balanced' | 'Creative') || 'Balanced');

  // Sync dark class on documentElement for Tailwind & theme rules
  useEffect(() => {
    localStorage.setItem('gethotel_ai_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  // React Router
  const { conversationId: urlConversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  const [conversationList, setConversationList] = useState<ConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(urlConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Persistent User Travel Memory & Settings state
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'personalization' | 'account'>('general');
  const [accentColor, setAccentColor] = useState(() => (localStorage.getItem('gethotel_accent_color') || 'brand'));
  const [language, setLanguage] = useState(() => (localStorage.getItem('gethotel_language') || 'auto'));
  const [customInstructions, setCustomInstructions] = useState(() => (localStorage.getItem('gethotel_custom_instructions') || ''));
  const [userNickname, setUserNickname] = useState(() => (localStorage.getItem('gethotel_user_nickname') || ''));

  const [userMemory, setUserMemory] = useState(() => {
    try {
      const saved = localStorage.getItem('gethotel_user_memory');
      return saved ? JSON.parse(saved) : {
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        preferredCity: 'Delhi',
        budgetTier: 'Luxury 5-Star',
        roomPreferences: 'Deluxe King Bed, Free Breakfast, Pool',
        personalNotes: 'Prefers quiet high-floor rooms'
      };
    } catch {
      return {
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        preferredCity: 'Delhi',
        budgetTier: 'Luxury 5-Star',
        roomPreferences: 'Deluxe King Bed, Free Breakfast, Pool',
        personalNotes: 'Prefers quiet high-floor rooms'
      };
    }
  });
  const [memorySavedToast, setMemorySavedToast] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

          // Auto-sync guest conversations to user account
          try {
            const guestIds = JSON.parse(localStorage.getItem('gethotel_guest_conversation_ids') || '[]');
            if (Array.isArray(guestIds) && guestIds.length > 0) {
              await conversationApi.syncGuestConversations(guestIds);
              localStorage.removeItem('gethotel_guest_conversation_ids');
            }
          } catch { /* ignore */ }

          // Refresh conversation list from backend
          try {
            const listRes = await conversationApi.list();
            if (listRes.success) setConversationList(listRes.conversations || []);
          } catch { /* ignore */ }
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

  /* Load conversation list (for both signed-in and guest users) */
  useEffect(() => {
    const fetchList = async () => {
      if (user) {
        try {
          const res = await conversationApi.list();
          if (res.success && res.conversations) {
            setConversationList(res.conversations);
            return;
          }
        } catch { /* ignore */ }
      }
      
      // Guest mode or fallback: load stored guest conversations
      try {
        const storedGuests = JSON.parse(localStorage.getItem('gethotel_guest_conversations_meta') || '[]');
        setConversationList(storedGuests);
      } catch {
        setConversationList([]);
      }
    };

    fetchList();
  }, [user]);

  /* Load conversation from URL on mount or URL change */
  useEffect(() => {
    if (!urlConversationId) {
      setActiveConversationId(null);
      setMessages([]);
      return;
    }
    setActiveConversationId(urlConversationId);
    conversationApi.get(urlConversationId)
      .then(res => {
        if (res.success && res.messages) {
          const loadedMessages: Message[] = res.messages.map((m: any) => ({
            id: `db-${m.id}`,
            sender: m.role as 'user' | 'ai',
            text: m.content,
            timestamp: new Date(m.createdAt).getTime(),
            ...(m.metadata?.responseType && { responseType: m.metadata.responseType }),
            ...(m.metadata?.hotels && { hotels: m.metadata.hotels }),
            ...(m.metadata?.flights && { flights: m.metadata.flights }),
            ...(m.metadata?.tourPackage && { tourPackage: m.metadata.tourPackage }),
            ...(m.metadata?.attachments && { attachments: m.metadata.attachments }),
            ...(m.metadata?.action && { action: m.metadata.action }),
          }));
          setMessages(loadedMessages);
        }
      })
      .catch(err => {
        console.warn('[Conversation] Load failed:', err.message);
        if (err.status === 403 || err.status === 404) {
          navigate('/', { replace: true });
        }
      });
  }, [urlConversationId, user, navigate]);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  /* smart scroll listener */
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isFarFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight > 220;
    setShowScrollToBottom(isFarFromBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollToBottom(false);
  }, []);

  /* auto-scroll only if user is near bottom */
  useEffect(() => {
    if (!showScrollToBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, showScrollToBottom]);

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
    const targetHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${targetHeight}px`;

    // Anchor scroll container to bottom when typing long messages
    const container = scrollContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 160;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSessionClick = useCallback((id: string) => {
    navigate(`/c/${id}`);
    setComposerAttachment(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [navigate]);

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    setComposerAttachment(null);
    navigate('/');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [navigate]);

  const handleDeleteSession = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
  }, []);

  const executeDeleteSession = useCallback(async () => {
    if (!sessionToDelete) return;
    const id = sessionToDelete;
    try {
      if (user) {
        await conversationApi.delete(id);
      }
      setConversationList(prev => prev.filter(c => c.id !== id));
      try {
        const storedMeta = JSON.parse(localStorage.getItem('gethotel_guest_conversations_meta') || '[]');
        const updatedMeta = storedMeta.filter((c: any) => c.id !== id);
        localStorage.setItem('gethotel_guest_conversations_meta', JSON.stringify(updatedMeta));
      } catch { /* ignore */ }
      if (activeConversationId === id || urlConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('[Conversation] Delete error:', err);
    } finally {
      setSessionToDelete(null);
    }
  }, [sessionToDelete, user, activeConversationId, urlConversationId, navigate]);

  const handleClearAllHistory = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const executeClearHistory = async () => {
    try {
      if (user && conversationList.length > 0) {
        await Promise.all(conversationList.map(c => conversationApi.delete(c.id)));
      }
      setConversationList([]);
      setActiveConversationId(null);
      setMessages([]);
      setInput("");
      setShowClearConfirm(false);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('[Conversation] Clear history error:', err);
    }
  };

  const executeSend = useCallback(async (q: string, currentSessionId: string | null) => {
    const msgTimestamp = Date.now();
    const userMsg: Message = {
      id: `u-${msgTimestamp}`,
      sender: "user",
      text: q,
      timestamp: msgTimestamp,
      attachments: composerAttachment ? [composerAttachment] : undefined
    };
    
    let targetConversationId = currentSessionId;

    // 1. Create a DB Conversation if this is turn 1 (Supports logged-in & guest users!)
    if (!targetConversationId) {
      try {
        const titleSnippet = q.length > 40 ? q.slice(0, 40) + "..." : q;
        const convRes = await conversationApi.create(titleSnippet);
        if (convRes.success && convRes.conversation?.id) {
          targetConversationId = convRes.conversation.id;
          setActiveConversationId(targetConversationId);
          
          const newConvItem = { id: targetConversationId!, title: titleSnippet, updatedAt: new Date().toISOString() };
          setConversationList(prev => [newConvItem, ...prev.filter(c => c.id !== targetConversationId)]);
          navigate(`/c/${targetConversationId}`, { replace: true });

          // Always track conversation metadata & IDs in localStorage for instant sidebar restoration & auto-syncing
          try {
            const storedMeta = JSON.parse(localStorage.getItem('gethotel_guest_conversations_meta') || '[]');
            const updatedMeta = [newConvItem, ...storedMeta.filter((c: any) => c.id !== targetConversationId)];
            localStorage.setItem('gethotel_guest_conversations_meta', JSON.stringify(updatedMeta));

            const guestIds = JSON.parse(localStorage.getItem('gethotel_guest_conversation_ids') || '[]');
            if (!guestIds.includes(targetConversationId)) {
              localStorage.setItem('gethotel_guest_conversation_ids', JSON.stringify([targetConversationId, ...guestIds]));
            }
          } catch { /* ignore */ }
        }
      } catch (convErr) {
        console.error('[Conversation] Creation failed:', convErr);
      }
    }

    const sessionMessages = [...messages, userMsg];
    setMessages(sessionMessages);
    setInput("");
    setComposerAttachment(null);
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // 2. Save User message to DB
    if (targetConversationId) {
      try {
        await conversationApi.saveMessage(targetConversationId, {
          role: 'user',
          content: q,
          metadata: composerAttachment ? { attachments: [composerAttachment] } : null
        });
      } catch (saveErr) {
        console.warn('[Conversation] Failed to save user message to DB:', saveErr);
      }
    }

    try {
      // ========== BACKEND-DRIVEN WORKFLOW (Single Source of Truth) ==========
      const validMessages = sessionMessages.filter(m => 
        !(m.sender === 'ai' && (m.text.includes("error") || m.text.includes("issue") || m.text.includes("Oops") || m.text.includes("Sorry")))
      );

      const history = validMessages.map((m, idx) => {
        let content = m.text;
        if (idx === validMessages.length - 1) {
          if (aiVibe === 'Precise') {
            content += "\n\n[Instruction: Keep your response precise, brief, factual, and list prices directly with minimal fluff.]";
          } else if (aiVibe === 'Creative') {
            content += "\n\n[Instruction: Be creative, descriptive, suggest detailed packages/itineraries, tell me about local tourist sights, culture, and make the travel recommendations sound exciting and luxurious.]";
          }
          if (composerAttachment) {
            const isRoomAttachment = composerAttachment.type === 'room' || /\b(room|suite|deluxe|standard|executive|king|queen)\b/i.test(composerAttachment.name);
            if (isRoomAttachment) {
              content += `\n\n[SELECTED ROOM: ${composerAttachment.name} (ID: ${composerAttachment.id}, Price: ₹${composerAttachment.pricePerNight}/night)]`;
            } else {
              content += `\n\n[SELECTED HOTEL: ${composerAttachment.name} (ID: ${composerAttachment.id}, City: ${composerAttachment.city}, Price: ₹${composerAttachment.pricePerNight}/night)]`;
            }
          }
        }
        return { role: m.sender === 'ai' ? 'ai' : 'user', content };
      });

      const historyPayload = history.map(h => ({ role: h.role, content: h.content }));
      const userMemoryPayload = {
        ...userMemory,
        guestName: userNickname || userMemory.guestName,
        nickname: userNickname || userMemory.guestName,
        customInstructions,
        languagePreference: language,
        aiVibe
      };

      const data = await aiApi.chat(historyPayload, userMemoryPayload, targetConversationId || undefined);
      console.log('[AI Chat] Raw API Response:', data);

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "ai",
        timestamp: Date.now(),
        text: data.reply || "I'm here to help you plan your trip! Which city or hotel would you like to explore?",
        responseType: data.responseType || 'general',
        hotels: data.hotels || [],
        ...(data.flights && { flights: data.flights }),
        ...(data.tourPackage && { tourPackage: data.tourPackage })
      };

      let actionToTrigger = data.action;
      if (!actionToTrigger && (
        (data.reply || '').includes("Launching your Razorpay payment window") ||
        (data.reply || '').includes("12% deposit payment window") ||
        data.responseType === 'payment_trigger'
      )) {
        actionToTrigger = {
          type: 'RAZORPAY_PAYMENT',
          bookingId: Date.now(),
          razorpayOrderId: null,
          amount: 100, // ₹1 test deposit in paisa
          currency: 'INR',
          keyId: '',
          guestName: 'Shriyansh',
          guestEmail: 'aloriagrp@gmail.com',
          guestPhone: '9318485680',
          hotelName: 'Hotel Haris Court (Lajpat Nagar)',
          depositAmount: 1,
          balanceAmount: 0
        };
      }

      if (actionToTrigger) {
        if (actionToTrigger.type === 'REQUIRE_SIGN_IN') {
          setShowLoginModal(true);
        } else {
          aiMsg.action = actionToTrigger;
        }
      }

      // 3. Save AI response message to DB
      if (targetConversationId) {
        try {
          await conversationApi.saveMessage(targetConversationId, {
            role: 'ai',
            content: aiMsg.text,
            metadata: {
              responseType: aiMsg.responseType,
              hotels: aiMsg.hotels,
              flights: aiMsg.flights,
              tourPackage: aiMsg.tourPackage,
              action: aiMsg.action
            }
          });
        } catch (saveAiErr) {
          console.warn('[Conversation] Failed to save AI response to DB:', saveAiErr);
        }
      }

      const finalMessages = [...sessionMessages, aiMsg];
      setMessages(finalMessages);
      setComposerAttachment(null);
    } catch (err: any) {
      console.error("[AI Chat Error]:", err.message);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "ai",
        timestamp: Date.now(),
        text: "✨ I experienced a brief connection hiccup. Please ask your question again or tap a recommendation to continue your booking!"
      };
      setMessages([...sessionMessages, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [user, messages, aiVibe, composerAttachment, userMemory, userNickname, customInstructions, language, navigate]);

  const handleCardClick = useCallback((_messageId: string, hotelId: number) => {
    const hotel = messages.flatMap(m => m.hotels || []).find(h => h.id === hotelId);
    if (!hotel) return;

    setComposerAttachment(prev => {
      if (prev?.id === hotelId) return null;
      return { id: hotel.id, name: hotel.name, city: hotel.city, thumbnail: hotel.thumbnail, pricePerNight: hotel.pricePerNight, starRating: hotel.starRating, guestRating: hotel.guestRating, reviewCount: hotel.reviewCount, type: 'hotel' };
    });
  }, [messages]);

  const handleRoomSelect = useCallback((room: { id: number; name: string; hotelName: string; pricePerNight: number; images?: string[] }) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    executeSend(`Book room: ${room.name} (Room ID: ${room.id})`, activeConversationId);
  }, [user, activeConversationId, executeSend]);

  const handleSend = useCallback((textVal: string) => {
    const q = textVal.trim();
    if (!q) return;

    // Enforce 5-message limit for unauthenticated (guest) users
    if (!user) {
      const guestUserMsgCount = messages.filter(m => m.sender === 'user').length;
      if (guestUserMsgCount >= 5) {
        setShowLoginModal(true);
        const limitNotice: Message = {
          id: `sys-guest-limit-${Date.now()}`,
          sender: "ai",
          timestamp: Date.now(),
          text: "🔑 **Sign in required**: You have reached the guest limit of 5 messages. Please sign in to continue chatting and unlock unlimited AI travel assistance!"
        };
        setMessages(prev => [...prev, limitNotice]);
        return;
      }
    }

    executeSend(q, activeConversationId);
  }, [user, messages, activeConversationId, executeSend]);

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
    if (!user) {
      setShowLoginModal(true);
      return;
    }
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
        specialRequests: "Booked via ChatGHS"
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
          name: "ChatGHS",
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
              const dismissMsg: Message = {
                id: `sys-dismissed-${Date.now()}`,
                sender: "ai",
                text: `Aapne payment window exit kar di hai. 😅 Agar aapko booking mein koi changes karne hon ya koi issue aaya ho, toh mujhe zaroor bataiye!`
              };
              setMessages(prev => [...prev, dismissMsg]);
              if (user && activeConversationId) {
                conversationApi.saveMessage(activeConversationId, {
                  role: 'ai',
                  content: dismissMsg.text
                }).catch(() => {});
              }
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
    if (!actionData) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    try {
      const scriptLoaded = await loadRazorpayScript();
      const hasOrderId = Boolean(actionData.razorpayOrderId);

      if (!scriptLoaded || !hasOrderId) {
        if (!actionData.hotelName || !actionData.hotelId) {
          console.warn("[Razorpay] Order ID missing and no valid hotel selected. Ignoring payment popup.");
          return;
        }
        console.warn("[Razorpay] Order ID missing or script failed to load. Falling back to In-Chat Checkout Modal for selected hotel.");
        setCheckoutData({
          hotelId: actionData.hotelId,
          hotelName: actionData.hotelName,
          hotelCity: actionData.hotelCity || "India",
          checkIn: new Date().toISOString(),
          checkOut: new Date(Date.now() + 86400000).toISOString(),
          roomType: "Selected Category",
          guestName: user?.name || actionData.guestName || "Valued Guest",
          guestEmail: user?.email || actionData.guestEmail || "",
          guestPhone: actionData.guestPhone || "",
          paymentOption: "online",
          nights: 1,
          roomPrice: actionData.depositAmount || 300,
          taxes: 0,
          total: actionData.depositAmount || 300
        });
        return;
      }

      const rzpOptions = {
        key: actionData.keyId || "rzp_test_mockkey",
        amount: actionData.amount,
        currency: actionData.currency || "INR",
        name: "ChatGHS",
        description: actionData.isFullPayment ? `Full Payment for ${actionData.hotelName}` : `12% Deposit for ${actionData.hotelName}`,
        order_id: actionData.razorpayOrderId,
        prefill: {
          name: user?.name || actionData.guestName,
          email: user?.email || actionData.guestEmail,
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
              const confirmMsgText = `🎉 **BOOKING CONFIRMED!**\n\nAapki payment successfully verify ho gayi hai aur room reserve ho chuka hai!\n\n• **Booking ID**: #${actionData.bookingId}\n• **Hotel**: **${actionData.hotelName}**\n• **Amount Paid**: ₹${actionData.depositAmount ? actionData.depositAmount.toLocaleString() : 'Paid'}\n• **Balance at Check-in**: ₹${actionData.balanceAmount ? actionData.balanceAmount.toLocaleString() : '0'}\n\nLuxury ticket receipt aapke email **${user?.email || actionData.guestEmail}** par deliver kar di gayi hai! 📧✨`;

              setMessages(prev => [...prev, {
                id: `sys-success-${Date.now()}`,
                sender: "ai",
                text: confirmMsgText
              }]);

              if (user && activeConversationId) {
                conversationApi.saveMessage(activeConversationId, {
                  role: 'ai',
                  content: confirmMsgText
                }).catch(() => {});
              }
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
            setCheckoutStatus("idle");
            console.log("[Razorpay] User closed payment window without completing transaction.");
            const dismissMsg: Message = {
              id: `sys-dismissed-${Date.now()}`,
              sender: "ai",
              text: `Lagta hai aapne payment window close kar di hai. 😅 Kya koi issue aaya ya aap koi changes karna chahte hain?\n\nAap jab chahein niche button par click karke 12% deposit pay karke room hold kar sakte hain, ya mujhe bataein main aapki poori madad karunga!`,
              action: actionData
            };
            setMessages(prev => [...prev, dismissMsg]);
            if (user && activeConversationId) {
              conversationApi.saveMessage(activeConversationId, {
                role: 'ai',
                content: dismissMsg.text,
                metadata: { action: actionData }
              }).catch(() => {});
            }
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
    <ErrorBoundary>
    <div 
      className={`fixed top-0 left-0 right-0 flex font-sans overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? "text-slate-100 bg-[#09090b]" : "text-slate-800 bg-[#f4f4f7]"
      }`}
      style={{
        height: viewportHeight
      }}
    >
      {/* ============ BACKGROUND GRADIENTS WITH SMOOTH TRANSITION ============ */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none z-[-1]"
        style={{
          background: theme === 'dark'
            ? "linear-gradient(180deg, #09090b 0%, #020203 100%)"
            : "linear-gradient(180deg, #f4f4f7 0%, #e2e8f0 100%)"
        }}
      />
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none z-[-1] ${
          messages.length === 0 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: theme === 'dark'
            ? "radial-gradient(circle at 50% 120%, rgba(37, 99, 235, 0.15) 0%, rgba(9, 9, 11, 0) 70%), linear-gradient(180deg, #09090b 0%, #020203 100%)"
            : "radial-gradient(circle at 50% 120%, rgba(30, 64, 175, 0.6) 0%, rgba(191, 219, 254, 0) 75%), linear-gradient(180deg, #f4f4f7 0%, #dbeafe 100%)"
        }}
      />
      <OfflineBanner />
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
                  ChatGHS<span className={theme === 'dark' ? "text-brand-400 not-italic" : "text-brand-600 not-italic"}>.</span>
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

        {/* Search Bar (Above New Chat) */}
        {isSidebarOpen && (
          <div className="mb-3 shrink-0">
            <SearchBar conversations={conversationList} onConversationClick={handleSessionClick} theme={theme} />
          </div>
        )}

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
          {isSidebarOpen && conversationList.length > 0 && (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 select-none">
                Recent Chats
              </div>
              {conversationList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSessionClick(c.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors text-left group cursor-pointer
                    ${(activeConversationId === c.id || urlConversationId === c.id) 
                      ? (theme === 'dark' ? "bg-brand-500/20 text-brand-300 border border-brand-500/40" : "bg-[#d3e3fd] text-[#041e49]") 
                      : (theme === 'dark' ? "text-slate-400 hover:bg-[#1e1e22]/50" : "text-slate-600 hover:bg-slate-200/60")
                    }
                  `}
                  title={c.title}
                >
                  <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-500" />
                  <span className="truncate flex-1">{c.title}</span>
                  <span 
                    onClick={(e) => handleDeleteSession(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-300/40 text-slate-400 hover:text-red-500 transition-all"
                    title="Delete Chat"
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
          {isSidebarOpen && conversationList.length > 0 && (
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        
        {/* Header (shrink-0) */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 z-20 select-none bg-transparent">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer ${
                theme === 'dark' ? "hover:bg-slate-850 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
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

        {/* Chats Feed Area (flex-1 min-h-0 overflow-y-auto) */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative no-scrollbar px-4"
        >
          {/* Floating Scroll To Bottom Button */}
          {showScrollToBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-xl active:scale-90 cursor-pointer transition-all border ${
                theme === 'dark'
                  ? "bg-[#1e1e22]/90 border-[#2e2e34] text-slate-200 hover:bg-[#28282d] hover:text-white"
                  : "bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title="Scroll to latest messages"
            >
              <ArrowUp className="w-4 h-4 rotate-180 shrink-0" />
            </button>
          )}
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
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pt-4 pb-36">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Bubble */}
                  {msg.sender === "user" && (
                    <div className="flex justify-end w-full">
                      <div className={`max-w-[80%] px-5 py-3.5 text-[16px] leading-[1.6] rounded-2xl rounded-tr-sm shadow-sm border transition-colors duration-300 animate-fade-in space-y-2 ${
                        theme === 'dark'
                          ? "bg-[#1f1f23] border-[#2d2d34] text-slate-100"
                          : "bg-slate-100 border-slate-200/50 text-slate-800"
                      }`}>
                        {parseTextWithIcons(cleanMsgText(msg.text))}
                        {/* Render attached hotel card inside user message */}
                        {msg.attachments && msg.attachments.length > 0 && msg.attachments.map(att => (
                          <div key={att.id} className={`mt-2 flex items-center gap-3 p-3 rounded-xl border ${
                            theme === 'dark'
                              ? "bg-[#131316] border-[#232329]"
                              : "bg-white border-slate-200/60"
                          }`}>
                            {att.thumbnail ? (
                              <img src={att.thumbnail} alt={att.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-bold shrink-0">
                                {att.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`text-[13px] font-bold truncate ${theme === 'dark' ? "text-slate-100" : "text-slate-800"}`}>
                                🏨 {att.name}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 mt-0.5">
                                <span>📍 {att.city}</span>
                                <span>•</span>
                                <span>⭐ {att.starRating}</span>
                                <span>•</span>
                                <span>₹{att.pricePerNight.toLocaleString()}/night</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Assistant Bubble */}
                  {msg.sender === "ai" && (
                    <div className="w-full py-2">
                      <div className={`text-[16px] leading-[1.75] font-medium tracking-wide transition-colors ${
                        theme === 'dark' ? "text-slate-100" : "text-[#1f2937]"
                      }`}>
                        <MarkdownRenderer text={msg.text} />
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        <CopyButton text={msg.text} theme={theme} />
                      </div>

                      {/* Type-based Renderer: flights | tourPackage | hotels | rooms | general */}
                      {msg.flights && (
                        <FlightCard
                          flightData={msg.flights}
                          theme={theme}
                          onBookFlight={(f) => {
                            executeSend(`Book flight: ${f.airline} (${f.flightNumber}) from ${f.origin} to ${f.destination} at ₹${f.price}`, activeConversationId);
                          }}
                        />
                      )}

                      {msg.tourPackage && (
                        <TourPackageCard
                          tourPackage={msg.tourPackage}
                          theme={theme}
                          onBookPackage={(t) => {
                            executeSend(`Book customized ${t.durationDays}-day tour package for ${t.destination} at ₹${t.bundledTotalPrice}`, activeConversationId);
                          }}
                        />
                      )}

                      {(() => {
                        const responseType = msg.responseType || 'general';

                        // ==================== ROOM CARDS (Phase 4 Premium Experience) ====================
                        if (responseType === 'rooms') {
                          const allRooms = (msg.hotels || []).flatMap(h =>
                            ((h as any).rooms || (h as any).room || []).map((r: any) => ({ ...r, hotelName: h.name, hotelId: h.id }))
                          );
                          if (allRooms.length === 0) return null;
                          console.log('[AI Chat] Rendering room cards:', allRooms.length, 'rooms');
                          return (
                            <div className="mt-4 select-none">
                              {/* Header Title */}
                              <div className="flex items-center justify-between mb-4 px-0.5">
                                <div>
                                  <h3 className={`text-base font-extrabold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                    Available Room Categories ({allRooms.length})
                                  </h3>
                                  <p className="text-[11px] text-slate-400 font-medium">Select a room to begin your instant booking</p>
                                </div>
                              </div>

                              {/* Responsive Room Cards Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {allRooms.map((r, idx) => {
                                  const roomImage = r.images && r.images.length > 0
                                    ? r.images[0]
                                    : "https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=600&q=80";
                                  const isRecommended = idx === 0;
                                  const isSelected = composerAttachment?.id === r.id && composerAttachment?.name.includes(r.name);

                                  return (
                                    <div
                                      key={r.id}
                                      onClick={() => handleRoomSelect(r)}
                                      className={`rounded-3xl overflow-hidden relative border transition-all duration-300 group flex flex-col shadow-md cursor-pointer backdrop-blur-md ${
                                        isSelected
                                          ? "ring-2 ring-blue-500 border-blue-500/50 " + (theme === 'dark' ? "bg-[#121214]/80" : "bg-white/80")
                                          : theme === 'dark'
                                            ? "bg-[#121214]/65 border-white/10 text-white"
                                            : "bg-white/70 border-slate-200/50 text-slate-900"
                                      }`}
                                    >
                                      {/* Top: Image Container */}
                                      <div className="relative w-full h-[190px] overflow-hidden shrink-0">
                                        <img 
                                          src={roomImage} 
                                          alt={r.name} 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const gallery = r.images && r.images.length > 0 ? r.images : [roomImage];
                                            setPreviewState({ images: gallery, activeIndex: 0 });
                                          }}
                                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in" 
                                          title="Click to view photo gallery"
                                        />
                                        
                                        {isRecommended && (
                                          <div className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#10b981]/90 text-white backdrop-blur-md uppercase tracking-wider select-none">
                                            ★ Top Choice
                                          </div>
                                        )}

                                        {/* Save/Bookmark icon on the image */}
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleRoomSelect(r); }}
                                          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 text-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all shadow-md shrink-0 cursor-pointer"
                                        >
                                          <Bookmark className="w-4.5 h-4.5" fill={isSelected ? "currentColor" : "none"} />
                                        </button>
                                      </div>

                                      {/* Bottom: Info Content */}
                                      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                                        <div>
                                          {/* Room Name */}
                                          <h4 className={`text-[15px] font-bold leading-snug tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} title={r.name}>
                                            {r.name}
                                          </h4>

                                          {/* Specs Row */}
                                          <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium mt-3 pb-3 border-b select-none ${
                                            theme === 'dark' ? "text-slate-300 border-white/10" : "text-slate-700 border-slate-100"
                                          }`}>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="👤" className="w-3.5 h-3.5" /> {r.maxOccupancy} Guests</span>
                                            <span className={theme === 'dark' ? "text-white/20" : "text-slate-300"}>|</span>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="🛏️" className="w-3.5 h-3.5" /> King Bed</span>
                                            <span className={theme === 'dark' ? "text-white/20" : "text-slate-300"}>|</span>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="📐" className="w-3.5 h-3.5" /> 320 sq.ft</span>
                                          </div>

                                          {/* Amenity Highlights Row */}
                                          <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium mt-3 pb-3 border-b select-none ${
                                            theme === 'dark' ? "text-slate-300 border-white/10" : "text-slate-700 border-slate-100"
                                          }`}>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="☕" className="w-3.5 h-3.5" /> Breakfast Included</span>
                                            <span className={theme === 'dark' ? "text-white/20" : "text-slate-300"}>|</span>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="🛡️" className="w-3.5 h-3.5" /> Free Cancellation</span>
                                          </div>

                                          {/* Rating / Verified Badge */}
                                          <div className={`flex items-center gap-1 text-[11px] font-bold mt-3 ${theme === 'dark' ? 'text-[#fbbf24]' : 'text-amber-500'}`}>
                                            <AppleEmoji symbol="⭐" className="w-3.5 h-3.5" /> 4.8 Verified Room
                                          </div>
                                        </div>

                                        {/* Pricing and Action Button */}
                                        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 dark:border-white/5">
                                          <div>
                                            {r.promotionalPrice ? (
                                              <div className="text-[10px] line-through text-slate-400 font-medium">
                                                ₹{r.pricePerNight.toLocaleString()}
                                              </div>
                                            ) : null}
                                            <div className={`text-lg font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                              ₹{(r.promotionalPrice || r.pricePerNight).toLocaleString()}
                                              <span className="text-[10px] font-semibold text-slate-500 ml-0.5">/night</span>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRoomSelect(r);
                                            }}
                                            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border ${
                                              isSelected
                                                ? "bg-[#2563eb] text-white border-[#2563eb]"
                                                : theme === 'dark'
                                                  ? "border-blue-500/50 text-[#60a5fa] hover:bg-blue-500/10"
                                                  : "border-blue-600 text-[#2563eb] hover:bg-blue-50"
                                            }`}
                                          >
                                            {isSelected ? "Selected ✓" : "Reserve"} <ArrowRight className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        // ==================== HOTEL CARDS (Responsive: Mobile Horizontal Carousel vs Desktop Cards) ====================
                        if ((responseType as string) !== 'rooms' && msg.hotels && msg.hotels.length > 0) {
                          console.log('[AI Chat] Rendering hotel cards:', msg.hotels.length);
                          return (
                            <div className="mt-4 select-none w-full">
                              
                              {/* ---------------- MOBILE VIEW ONLY (Horizontal Scroll Carousel) ---------------- */}
                              <div className="flex md:hidden overflow-x-auto gap-3.5 pb-2 pt-1 px-1 snap-x snap-mandatory no-scrollbar w-full">
                                {msg.hotels.map((h) => {
                                  const hotelPhoto = h.thumbnail || (h.images && h.images[0]) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";
                                  const hasDiscount = Boolean(h.promotionalPrice && h.promotionalPrice < h.pricePerNight);
                                  const finalPrice = h.promotionalPrice || h.pricePerNight;

                                  return (
                                    <div
                                      key={h.id}
                                      onClick={() => handleCardClick(msg.id, h.id)}
                                      className="w-[210px] aspect-[4/5] shrink-0 snap-start relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-white/10 cursor-pointer group transition-transform active:scale-[0.97]"
                                    >
                                      {/* Photo Background */}
                                      <img
                                        src={hotelPhoto}
                                        alt={h.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />

                                      {/* Top Rating Badge */}
                                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-black/60 text-amber-400 backdrop-blur-md border border-white/10">
                                          ★ {(h.guestRating > 0 ? h.guestRating : (h.starRating || 4.5)).toFixed(1)}
                                        </div>
                                        {hasDiscount && (
                                          <div className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white shadow-md uppercase tracking-wider">
                                            Offer
                                          </div>
                                        )}
                                      </div>

                                      {/* Dark Bottom Gradient Overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent pointer-events-none" />

                                      {/* Bottom Content Area */}
                                      <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex flex-col justify-end gap-1">
                                        {/* Hotel Name */}
                                        <h3 className="text-xs font-bold text-white leading-snug line-clamp-1">
                                          {h.name}
                                        </h3>

                                        <div className="flex items-center justify-between gap-1.5">
                                          {/* City Sub-heading */}
                                          <p className="text-[11px] text-slate-300 font-medium truncate flex-1">
                                            📍 {h.city}
                                          </p>

                                          {/* Right Bottom: Price with Promotional Strikethrough */}
                                          <div className="text-right shrink-0">
                                            {hasDiscount && (
                                              <span className="text-[9px] line-through text-slate-400 font-semibold mr-1">
                                                ₹{h.pricePerNight.toLocaleString()}
                                              </span>
                                            )}
                                            <span className="text-xs font-black text-white">
                                              ₹{finalPrice.toLocaleString()}
                                            </span>
                                            <span className="text-[8px] font-medium text-slate-300 ml-0.5">/night</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* ---------------- DESKTOP VIEW ONLY (Horizontal Full Cards) ---------------- */}
                              <div className="hidden md:flex flex-col w-full space-y-4">
                                {msg.hotels.map((h) => {
                                  const isAttached = composerAttachment?.id === h.id;

                                  return (
                                    <div
                                      key={h.id}
                                      onClick={() => handleCardClick(msg.id, h.id)}
                                      className={`w-full rounded-3xl overflow-hidden relative border transition-all duration-300 group flex flex-row shadow-lg backdrop-blur-md ${
                                        isAttached
                                          ? "ring-2 ring-blue-500 border-blue-500/50 " + (theme === 'dark' ? "bg-[#121214]/80" : "bg-white/80")
                                          : theme === 'dark'
                                            ? "bg-[#121214]/65 border-white/10 text-white"
                                            : "bg-white/70 border-slate-200/50 text-slate-900"
                                      }`}
                                    >
                                      {/* Left Side: Hotel Image */}
                                      <div className="relative w-[32%] min-h-full shrink-0">
                                        {h.thumbnail ? (
                                          <img 
                                            src={h.thumbnail} 
                                            alt={h.name} 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const gallery = h.images && h.images.length > 0 ? h.images : [h.thumbnail!];
                                              setPreviewState({ images: gallery, activeIndex: 0 });
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in"
                                            title="Click to view photo gallery"
                                          />
                                        ) : (
                                          <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? "bg-slate-800/40" : "bg-slate-100/60"}`}>
                                            <span className="text-slate-400 text-xs">No preview</span>
                                          </div>
                                        )}
                                        
                                        {/* AI Pick Badge */}
                                        <div className={`absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md border uppercase tracking-wider select-none ${
                                          theme === 'dark'
                                            ? "bg-[#1e293b]/70 text-[#3b82f6] border-blue-500/20"
                                            : "bg-blue-50/70 text-blue-600 border-blue-100"
                                        }`}>
                                          <AppleEmoji symbol="✨" className="w-3.5 h-3.5" /> AI PICK
                                        </div>
                                      </div>

                                      {/* Right Side: Content info */}
                                      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                                        <div>
                                          {/* Title, rating and save icon */}
                                          <div className="flex items-start justify-between gap-4">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                              <h3 className={`text-lg md:text-xl font-bold tracking-tight ${theme === 'dark' ? "text-white" : "text-slate-900"}`}>{h.name}</h3>
                                              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-[#27272a]/80 text-[#fbbf24] backdrop-blur-sm">
                                                ★ {h.guestRating > 0 ? h.guestRating.toFixed(1) : (h.starRating || 4.5).toFixed(1)}
                                              </div>
                                            </div>
                                            <button 
                                              type="button" 
                                              onClick={(e) => { e.stopPropagation(); handleCardClick(msg.id, h.id); }}
                                              className={`transition-colors shrink-0 ${isAttached ? 'text-blue-500' : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                                            >
                                              <Bookmark className="w-5 h-5" fill={isAttached ? "currentColor" : "none"} />
                                            </button>
                                          </div>

                                          {/* Location Pin */}
                                          <div className={`flex items-center gap-1.5 text-xs mt-2 font-medium ${theme === 'dark' ? "text-slate-400" : "text-slate-500"}`}>
                                            <AppleEmoji symbol="📍" className="w-3.5 h-3.5" />
                                            <span>{h.city}</span>
                                            <span>•</span>
                                            <span>850m from center</span>
                                          </div>

                                          {/* Highlights Row */}
                                          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium mt-4 pb-4 border-b select-none ${
                                            theme === 'dark' ? "text-slate-300 border-white/10" : "text-slate-700 border-slate-100"
                                          }`}>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="☕" className="w-3.5 h-3.5" /> Breakfast Included</span>
                                            <span className={theme === 'dark' ? "text-white/20" : "text-slate-300"}>|</span>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="🛡️" className="w-3.5 h-3.5" /> Free Cancellation</span>
                                            <span className={theme === 'dark' ? "text-white/20" : "text-slate-300"}>|</span>
                                            <span className="flex items-center gap-1"><AppleEmoji symbol="❤️" className="w-3.5 h-3.5" /> Couple Friendly</span>
                                          </div>
                                        </div>

                                        {/* Why ChatGHS Picked & Price/CTA */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mt-4">
                                          {/* Why Picked Block */}
                                          <div className="flex-1 min-w-0 pr-0 md:pr-4">
                                            <div className={`flex items-center gap-1.5 text-xs font-bold ${theme === 'dark' ? "text-[#3b82f6]" : "text-blue-600"}`}>
                                              <AppleEmoji symbol="💙" className="w-3.5 h-3.5" /> Why ChatGHS picked this
                                            </div>
                                            <p className={`text-xs mt-1.5 leading-relaxed ${theme === 'dark' ? "text-slate-400" : "text-slate-500"}`}>
                                              {h.description ? (h.description.slice(0, 140) + (h.description.length > 140 ? '...' : '')) : "Best value stay with excellent reviews, premium rooms, and great hospitality."}
                                            </p>
                                          </div>

                                          {/* Price & CTA Block */}
                                          <div className="flex flex-col items-end shrink-0 w-full md:w-auto text-right">
                                            <div>
                                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">From</span>
                                              <div className={`text-xl md:text-2xl font-black leading-none ${theme === 'dark' ? "text-white" : "text-slate-900"}`}>
                                                ₹{(h.promotionalPrice || h.pricePerNight).toLocaleString()}
                                                <span className="text-xs font-semibold text-slate-500 ml-0.5">/night</span>
                                              </div>
                                            </div>

                                            {/* Buttons Row */}
                                            <div className="flex items-center gap-2 mt-3.5 w-full md:w-auto justify-end">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleSend(`Show room categories for ${h.name} (ID: ${h.id})`);
                                                }}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
                                                  theme === 'dark'
                                                    ? "border-slate-700 text-white hover:bg-[#1e1e22]"
                                                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                                                }`}
                                              >
                                                View Rooms
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleSend(`I want to reserve ${h.name} (ID: ${h.id})`);
                                                }}
                                                className="px-4.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#2563eb] hover:bg-blue-600 text-white active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-sm"
                                              >
                                                Book Now <ArrowRight className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        {/* ==================== IN-CHAT FLIGHT CARDS RENDERER ==================== */}
                        {msg.flights && (
                          <FlightCard
                            flightData={msg.flights}
                            theme={theme}
                            onBookFlight={(f) => {
                              handleSend(`I want to book ${f.airline} flight ${f.flightNumber} from ${f.originCity} to ${f.destinationCity}`);
                            }}
                          />
                        )}

                        {/* ==================== IN-CHAT TOUR PACKAGE CARDS RENDERER ==================== */}
                        {msg.tourPackage && (
                          <TourPackageCard
                            tourPackage={msg.tourPackage}
                            theme={theme}
                            onBookPackage={(pkg) => {
                              handleSend(`I want to book ${pkg.destination} tour package for ${pkg.durationDays} days`);
                            }}
                          />
                        )}

                        {/* ==================== IN-CHAT PAYMENT ACTION CARD ==================== */}
                        {msg.action && (
                          <div className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 select-none animate-slide-up">
                            <div>
                              <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-200">Secure Online Checkout</div>
                              <h4 className="text-base font-extrabold mt-0.5">{msg.action.hotelName || "Hotel Haris Court"}</h4>
                              <p className="text-xs text-white/80 font-medium">12% Deposit: ₹{msg.action.depositAmount?.toLocaleString() || '300'} • Balance at check-in: ₹{msg.action.balanceAmount?.toLocaleString() || '2,200'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => triggerInChatRazorpay(msg.action)}
                              className="px-6 py-3 bg-white text-brand-600 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
                            >
                              💳 Pay 12% Deposit Now
                            </button>
                          </div>
                        )}

                        return null;
                      })()}

                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="w-full">
                  <ThinkingIndicator theme={theme} lastUserText={messages.filter(m => m.sender === 'user').slice(-1)[0]?.text || ''} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Absolute Floating Bottom Overlay Composer Bar */}
        <footer className="absolute bottom-0 left-0 right-0 w-full bg-transparent px-4 pb-4 pt-2 select-none z-30 pointer-events-none">
          <div className={`mx-auto pointer-events-auto transition-all duration-500 ease-in-out ${
            messages.length === 0 ? "max-w-2xl" : "max-w-3xl"
          }`}>
            {/* Floating Glassmorphism Composer Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className={`flex flex-col gap-2.5 rounded-3xl p-3.5 transition-all duration-300 backdrop-blur-2xl ${
                theme === 'dark'
                  ? "bg-[#16161a]/90 border border-white/10 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.7)] focus-within:border-brand-500/50"
                  : "bg-white/85 border border-white/90 shadow-[0_12px_40px_-12px_rgba(0,30,100,0.18)] focus-within:border-brand-400/60"
              }`}
            >
              {/* Compact Glassmorphism Square Attachment Chip inside chat input */}
              {composerAttachment && (
                <div className="flex items-center">
                  <div className={`relative group flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-sm ${
                    theme === 'dark'
                      ? "bg-white/10 border-white/15 text-white"
                      : "bg-white/60 border-white/80 text-slate-900 shadow-slate-200/40"
                  }`}>
                    {/* Square Thumbnail Container */}
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-inner bg-slate-200/50">
                      {composerAttachment.thumbnail ? (
                        <img src={composerAttachment.thumbnail} alt={composerAttachment.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                          {composerAttachment.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Info Text */}
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-[12px] font-extrabold truncate max-w-[160px] md:max-w-[240px]">
                        {composerAttachment.name}
                      </span>
                      <span className="text-[10px] font-semibold opacity-75 truncate">
                        📍 {composerAttachment.city} • ₹{composerAttachment.pricePerNight.toLocaleString()}/night
                      </span>
                    </div>

                    {/* Glass Close 'X' Button */}
                    <button
                      type="button"
                      onClick={() => setComposerAttachment(null)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer ${
                        theme === 'dark'
                          ? "bg-white/15 hover:bg-red-500/80 text-white"
                          : "bg-slate-900/10 hover:bg-red-500 hover:text-white text-slate-700"
                      }`}
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2 w-full">
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
                  className={`flex-1 bg-transparent py-2 px-2 text-sm outline-none resize-none font-normal leading-6 max-h-[160px] overflow-y-auto no-scrollbar align-top transition-colors ${
                    theme === 'dark' ? "text-slate-100 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
                  }`}
                />

                <button
                  type="submit"
                  disabled={!input.trim() && !composerAttachment}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer ${
                    theme === 'dark'
                      ? "bg-brand-600 text-white hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600"
                      : "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-slate-200/50 disabled:text-slate-400"
                  }`}
                >
                  <ArrowUp className="w-4.5 h-4.5 rotate-45" />
                </button>
              </div>
            </form>
            
            <div className={`text-[10px] text-center mt-2 select-none ${
              theme === 'dark' ? "text-slate-500" : "text-slate-400"
            }`}>
              ChatGHS may display inaccurate info. Double-check important details.
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
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className={`w-full max-w-md border rounded-3xl p-8 shadow-premium select-none relative animate-slide-up text-center transition-colors duration-300 ${
              theme === 'dark' 
                ? "bg-[#0f0f12]/95 border-[#1e1e24] text-slate-100" 
                : "bg-white/95 backdrop-blur-xl border-slate-200 text-slate-800"
            }`}>
              {/* Close Button */}
              <button 
                onClick={() => setShowLoginModal(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                  theme === 'dark' ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-500 hover:text-slate-700"
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header (No logo) */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-500 tracking-tight">
                  ChatGHS
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
                  Travel Expert Companion
                </p>
              </div>

              <div className="space-y-4">
                {loginError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs font-semibold text-left">
                    ⚠️ {loginError}
                  </div>
                )}

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className={`w-full py-4 border active:scale-98 text-sm font-extrabold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer ${
                    theme === 'dark'
                      ? "bg-[#16161b] border-[#27272e] hover:bg-[#1e1e26] text-white disabled:bg-slate-900"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 disabled:bg-slate-100"
                  }`}
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
                  <span className={`w-full border-t ${theme === 'dark' ? "border-[#232329]" : "border-slate-200"}`} />
                </div>
              </div>

              {/* Go back */}
              <div className="text-center">
                <a 
                  href="https://gethotelstays.com"
                  className={`text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                    theme === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                  }`}
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

        {/* ============ SETTINGS MODAL (TABBED DESIGN) ============ */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 md:p-6 animate-fade-in">
            <div className={`w-full max-w-3xl max-h-[85vh] h-[600px] border rounded-3xl shadow-premium relative animate-slide-up transition-colors duration-300 flex flex-col overflow-hidden ${
              theme === 'dark' 
                ? "bg-[#0f0f12]/95 border-[#1e1e24] text-slate-100" 
                : "bg-white/95 backdrop-blur-xl border-white/90 text-slate-800"
            }`}>
              {/* Header (No icons) */}
              <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
                theme === 'dark' ? "border-[#1e1e24] bg-[#131316]" : "border-slate-100 bg-slate-50/50"
              }`}>
                <div>
                  <h3 className="text-base font-extrabold select-none">Settings</h3>
                  <p className="text-[11px] font-semibold text-slate-400">Manage appearance, AI persona, and account details</p>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    theme === 'dark' ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/60 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Body: Left Sidebar Tabs + Right Content */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                {/* Left Sidebar Tabs (Text only, no icons) */}
                <div className={`w-full md:w-52 p-3 md:p-4 border-r shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto ${
                  theme === 'dark' ? "border-[#1e1e24] bg-[#0c0c0e]" : "border-slate-100 bg-slate-50/30"
                }`}>
                  {[
                    { id: 'general', label: 'General', desc: 'Theme, colors, language' },
                    { id: 'personalization', label: 'Personalization', desc: 'AI vibe & Memory profile' },
                    { id: 'account', label: 'Account', desc: 'Profile & Sessions' },
                  ].map((tab) => {
                    const isActive = activeSettingsTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSettingsTab(tab.id as any)}
                        className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer ${
                          isActive
                            ? (theme === 'dark' 
                                ? "bg-brand-500/15 border border-brand-500/30 text-brand-400 font-extrabold shadow-sm" 
                                : "bg-white border border-slate-200 text-brand-600 font-extrabold shadow-sm")
                            : (theme === 'dark'
                                ? "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
                                : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900 border border-transparent")
                        }`}
                      >
                        <p className="text-xs font-bold leading-tight">{tab.label}</p>
                        <p className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">{tab.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-6">
                  {/* ================= TAB 1: GENERAL ================= */}
                  {activeSettingsTab === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Theme selection */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
                          Appearance Theme
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'light', label: 'Light Theme', desc: 'Clean & bright interface' },
                            { id: 'dark', label: 'Dark Theme', desc: 'Sleek dark mode' }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setTheme(item.id as any);
                                localStorage.setItem('gethotel_ai_theme', item.id);
                              }}
                              className={`p-3.5 border rounded-2xl text-left transition-all cursor-pointer ${
                                theme === item.id
                                  ? (theme === 'dark' ? "bg-brand-500/20 border-brand-500/50 text-brand-300" : "bg-brand-50 border-brand-300 text-brand-700")
                                  : (theme === 'dark' ? "bg-[#131316] border-[#232329] text-slate-300 hover:bg-slate-800/40" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")
                              }`}
                            >
                              <p className="text-xs font-extrabold">{item.label}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accent Color selection */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
                          Accent Theme Color
                        </label>
                        <div className="flex items-center gap-3">
                          {[
                            { id: 'brand', name: 'Ocean Blue', color: 'bg-[#1087e7]' },
                            { id: 'indigo', name: 'Royal Indigo', color: 'bg-[#6366f1]' },
                            { id: 'emerald', name: 'Emerald Green', color: 'bg-[#10b981]' },
                            { id: 'rose', name: 'Rose Red', color: 'bg-[#f43f5e]' },
                            { id: 'amber', name: 'Amber Gold', color: 'bg-[#f59e0b]' }
                          ].map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setAccentColor(c.id);
                                localStorage.setItem('gethotel_accent_color', c.id);
                              }}
                              title={c.name}
                              className={`w-9 h-9 rounded-full ${c.color} flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                                accentColor === c.id ? "ring-4 ring-brand-400/40 scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                              }`}
                            >
                              {accentColor === c.id && <Check className="w-4 h-4 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language Choice */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
                          Primary Chat Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            localStorage.setItem('gethotel_language', e.target.value);
                          }}
                          className={`w-full px-3.5 py-2.5 text-xs font-bold border rounded-2xl outline-none transition-all ${
                            theme === 'dark' ? "bg-[#131316] border-[#232329] text-white focus:border-brand-500" : "bg-white border-slate-200 text-slate-800 focus:border-brand-500"
                          }`}
                        >
                          <option value="auto">🌐 Auto-Detect (Dynamic Mirroring)</option>
                          <option value="en">🇺🇸 English (US)</option>
                          <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                          <option value="hinglish">🇮🇳 Hinglish (Roman Script)</option>
                          <option value="es">🇪🇸 Spanish (Español)</option>
                          <option value="it">🇮🇹 Italian (Italiano)</option>
                          <option value="fr">🇫🇷 French (Français)</option>
                          <option value="de">🇩🇪 German (Deutsch)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 2: PERSONALIZATION ================= */}
                  {activeSettingsTab === 'personalization' && (
                    <div className="animate-fade-in">
                      {!user ? (
                        <div className={`p-8 border rounded-3xl text-center space-y-4 ${
                          theme === 'dark' ? "bg-[#131316] border-[#232329]" : "bg-white border-slate-200/80"
                        }`}>
                          <div className="space-y-1.5 max-w-xs mx-auto">
                            <h4 className="text-base font-extrabold">Sign In Required</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                              Please sign in first to customize your AI travel companion, save personal instructions, and enable long-term guest memory.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSettingsModal(false);
                              setShowLoginModal(true);
                            }}
                            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                          >
                            Sign In to Continue
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {/* AI Vibe */}
                          <div className="space-y-2.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
                              AI Persona Characteristic
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
                                      : (theme === 'dark' ? "bg-[#131316] border-[#232329] text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                                  }`}
                                >
                                  {vibe}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom System Instructions */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Custom Instructions for AI
                            </label>
                            <textarea
                              rows={2}
                              placeholder="What would you like the AI to keep in mind when responding? (e.g. 'Keep answers short and crisp', 'Always highlight 5-star ratings')"
                              value={customInstructions}
                              onChange={(e) => {
                                setCustomInstructions(e.target.value);
                                localStorage.setItem('gethotel_custom_instructions', e.target.value);
                              }}
                              className={`w-full px-3.5 py-2.5 text-xs font-medium border rounded-2xl outline-none transition-all resize-none ${
                                theme === 'dark' ? "bg-[#131316] border-[#232329] text-white focus:border-brand-500" : "bg-white border-slate-200 text-slate-800 focus:border-brand-500"
                              }`}
                            />
                          </div>

                          {/* Guest Memory & Preferences */}
                          <div className={`p-4 border rounded-2xl space-y-3.5 ${
                            theme === 'dark' ? "bg-[#131316] border-[#232329]" : "bg-white/60 border-slate-100"
                          }`}>
                            <h4 className="text-xs font-extrabold flex items-center gap-1.5 text-brand-500">
                              <span>🧠</span> About You & Travel Memory
                            </h4>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Your Nickname / Full Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Shriyansh"
                                  value={userNickname}
                                  onChange={(e) => {
                                    setUserNickname(e.target.value);
                                    localStorage.setItem('gethotel_user_nickname', e.target.value);
                                    setUserMemory({ ...userMemory, guestName: e.target.value });
                                  }}
                                  className={`w-full px-3 py-2 text-xs font-semibold border rounded-xl outline-none transition-all ${
                                    theme === 'dark' ? "bg-[#09090b] border-[#27272a] text-white focus:border-brand-500" : "bg-white border-slate-200 text-slate-800 focus:border-brand-500"
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Preferred City</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Delhi, Goa"
                                  value={userMemory.preferredCity || ''}
                                  onChange={(e) => setUserMemory({ ...userMemory, preferredCity: e.target.value })}
                                  className={`w-full px-3 py-2 text-xs font-semibold border rounded-xl outline-none transition-all ${
                                    theme === 'dark' ? "bg-[#09090b] border-[#27272a] text-white focus:border-brand-500" : "bg-white border-slate-200 text-slate-800 focus:border-brand-500"
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Budget Tier</label>
                                <select
                                  value={userMemory.budgetTier || 'Luxury 5-Star'}
                                  onChange={(e) => setUserMemory({ ...userMemory, budgetTier: e.target.value })}
                                  className={`w-full px-3 py-2 text-xs font-semibold border rounded-xl outline-none transition-all ${
                                    theme === 'dark' ? "bg-[#09090b] border-[#27272a] text-white focus:border-brand-500" : "bg-white border-slate-200 text-slate-800 focus:border-brand-500"
                                  }`}
                                >
                                  <option value="Luxury 5-Star">Luxury (5-Star)</option>
                                  <option value="Boutique 3-4 Star">Boutique (3-4 Star)</option>
                                  <option value="Budget Friendly">Budget Friendly</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Room & Amenities</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Deluxe King, Pool"
                                  value={userMemory.roomPreferences || ''}
                                  onChange={(e) => setUserMemory({ ...userMemory, roomPreferences: e.target.value })}
                                  className={`w-full px-3 py-2 text-xs font-semibold border rounded-xl outline-none transition-all ${
                                    theme === 'dark' ? "bg-[#09090b] border-[#27272a] text-white focus:border-brand-500" : "bg-white border-slate-200 text-slate-800 focus:border-brand-500"
                                  }`}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">More About You / Travel Notes</label>
                              <textarea
                                rows={2}
                                placeholder="e.g. I usually travel with family. I prefer quiet rooms with city views."
                                value={userMemory.personalNotes || ''}
                                onChange={(e) => setUserMemory({ ...userMemory, personalNotes: e.target.value })}
                                className={`w-full px-3 py-2 text-xs font-semibold border rounded-xl outline-none transition-all resize-none ${
                                  theme === 'dark' ? "bg-[#09090b] border-[#27272a] text-white focus:border-brand-500" : "bg-white border-slate-200 text-slate-800 focus:border-brand-500"
                                }`}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem('gethotel_user_memory', JSON.stringify(userMemory));
                                setMemorySavedToast(true);
                                setTimeout(() => setMemorySavedToast(false), 2500);
                              }}
                              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {memorySavedToast ? "✓ Personalization & Memory Saved!" : "💾 Save Personalization"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================= TAB 3: ACCOUNT ================= */}
                  {activeSettingsTab === 'account' && (
                    <div className="animate-fade-in">
                      {!user ? (
                        <div className={`p-8 border rounded-3xl text-center space-y-4 ${
                          theme === 'dark' ? "bg-[#131316] border-[#232329]" : "bg-white border-slate-200/80"
                        }`}>
                          <div className="space-y-1.5 max-w-xs mx-auto">
                            <h4 className="text-base font-extrabold">Guest Session</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                              You are currently using a guest session. Please sign in with Google to view account settings and sync travel history.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSettingsModal(false);
                              setShowLoginModal(true);
                            }}
                            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                          >
                            Sign In with Google
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {/* User Info status card */}
                          <div className={`p-4 border rounded-2xl flex items-center justify-between ${
                            theme === 'dark' ? "bg-[#131316] border-[#232329]" : "bg-white/60 border-slate-100"
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-500 text-white font-bold text-sm uppercase shadow-sm">
                                {user.email.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-extrabold">{user.name || 'ChatGHS User'}</p>
                                <p className="text-[10px] font-semibold text-slate-400">{user.email}</p>
                              </div>
                            </div>

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
                          </div>

                          {/* Account Security & Storage */}
                          <div className={`p-4 border rounded-2xl space-y-3 ${
                            theme === 'dark' ? "bg-[#131316] border-[#232329]" : "bg-white/60 border-slate-100"
                          }`}>
                            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                              Data & Session Memory
                            </h4>
                            <p className="text-xs font-medium text-slate-400">
                              Your conversation state, AI memory, and travel preferences are stored locally and encrypted in session memory.
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                executeClearHistory();
                                setShowSettingsModal(false);
                              }}
                              className="w-full py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Clear All Chat History
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                        ChatGHS automatically routes reservation confirmations and split invoices directly to your registered email address.
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
    </ErrorBoundary>
  );
}
