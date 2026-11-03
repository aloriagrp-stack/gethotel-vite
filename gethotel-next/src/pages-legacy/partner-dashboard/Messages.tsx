'use client';

import { useState, useEffect, useRef } from "react";
import { 
    MessageSquare, Search, User, 
    Send, Loader2, Clock, CheckCheck, 
    Hotel, Sparkles, RefreshCw, ChevronRight,
    Mail, Phone, ShieldCheck, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, messageApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerMessagesPage() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Fetch partner hotels
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await hotelApi.getMyHotels({ light: true });
                if (res.success && res.data.length > 0) {
                    setHotels(res.data);
                    // Check URL params for active hotel if any
                    const params = new URLSearchParams(window.location.search);
                    const paramHotelId = Number(params.get("activeHotelId"));
                    const found = res.data.find((h: any) => h.id === paramHotelId);
                    setSelectedHotelId(found ? found.id : res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch hotels", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    // 2. Fetch messages for selected hotel
    const fetchMessages = async (isManual = false) => {
        if (!selectedHotelId) return;
        if (isManual) setRefreshing(true);
        try {
            const res = await messageApi.getHotelMessages(selectedHotelId, selectedGuestId || undefined);
            if (res.success && Array.isArray(res.data)) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        if (selectedHotelId) {
            fetchMessages();
            const interval = setInterval(() => fetchMessages(), 6000);
            return () => clearInterval(interval);
        }
    }, [selectedHotelId, selectedGuestId]);

    // Group messages by user (guest)
    const conversationsMap: { [userId: number]: { user: any; messages: any[]; lastMessage: any; unreadCount: number } } = {};

    messages.forEach((msg) => {
        const uid = msg.userId;
        if (!conversationsMap[uid]) {
            conversationsMap[uid] = {
                user: msg.user || { id: uid, name: "Guest Traveler", email: `guest_${uid}@gethotel.in` },
                messages: [],
                lastMessage: msg,
                unreadCount: 0
            };
        }
        conversationsMap[uid].messages.push(msg);
        conversationsMap[uid].lastMessage = msg;
        if (!msg.isRead && msg.sender === 'user') {
            conversationsMap[uid].unreadCount += 1;
        }
    });

    const conversationList = Object.values(conversationsMap).sort((a, b) => {
        const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
        const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
        return timeB - timeA;
    });

    // Auto-select first conversation if none selected
    useEffect(() => {
        if (!selectedGuestId && conversationList.length > 0) {
            setSelectedGuestId(conversationList[0].user.id);
        }
    }, [conversationList.length, selectedGuestId]);

    // Scroll to bottom when conversation or message changes
    useEffect(() => {
        scrollToBottom();
    }, [selectedGuestId, messages.length]);

    // Filter by search
    const filteredConversations = conversationList.filter((c) => {
        const name = (c.user?.name || "").toLowerCase();
        const email = (c.user?.email || "").toLowerCase();
        const q = searchTerm.toLowerCase();
        return name.includes(q) || email.includes(q);
    });

    const activeConversation = selectedGuestId ? conversationsMap[selectedGuestId] : null;
    const currentHotel = hotels.find((h) => h.id === selectedHotelId) || hotels[0];

    // Handle sending reply
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = newMessage.trim();
        if (!text || !selectedHotelId || !selectedGuestId || sending) return;

        setSending(true);
        try {
            const res = await messageApi.sendMessage({
                hotelId: selectedHotelId,
                content: text,
                targetUserId: selectedGuestId
            });

            if (res.success && res.data) {
                setMessages((prev) => [...prev, res.data]);
                setNewMessage("");
                setTimeout(scrollToBottom, 50);
            }
        } catch (err: any) {
            alert(err?.message || "Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    // Quick replies presets
    const quickReplies = [
        "Yes, early check-in is available based on room readiness!",
        "Free parking and high-speed Wi-Fi are provided on premise.",
        "Breakfast is served daily from 7:30 AM to 10:30 AM.",
        "Thank you for contacting us! Looking forward to hosting you."
    ];

    // Demo message generator so partner can test without needing a second device
    const handleSendDemoMessage = async () => {
        if (!selectedHotelId) return;
        setSending(true);
        try {
            await messageApi.sendMessage({
                hotelId: selectedHotelId,
                content: "Hello! What time is check-in? Can we request a room on a higher floor?",
                targetUserId: undefined // sent as guest
            });
            await fetchMessages(true);
        } catch (err) {
            console.error("Demo failed", err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
                <p className="text-xs text-slate-600 font-bold">Loading guest messages...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-12 max-w-7xl mx-auto animate-fade-in">
            {/* Header Greeting & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                        Guest Messages & Inquiries
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-600 font-bold">• {currentHotel?.name || "Your Property"}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[11px] text-emerald-700 font-semibold">Live Real-time Sync</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hotels.length > 1 && (
                        <select 
                            value={selectedHotelId || ""} 
                            onChange={(e) => {
                                setSelectedHotelId(parseInt(e.target.value));
                                setSelectedGuestId(null);
                            }}
                            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-slate-900 shadow-2xs"
                        >
                            {hotels.map((h) => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => fetchMessages(true)}
                        disabled={refreshing}
                        className="p-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 hover:text-slate-950 transition-colors shadow-2xs cursor-pointer"
                        title="Refresh messages"
                    >
                        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-blue-600")} />
                    </button>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100vh-210px)] min-h-[580px]">
                {/* ─── LEFT: CONVERSATIONS SIDEBAR ─── */}
                <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-white">
                    {/* Search Bar */}
                    <div className="p-3.5 border-b border-slate-200">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search guests by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Conversation Items */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const isSelected = selectedGuestId === conv.user.id;
                                const isFromHotel = conv.lastMessage?.sender === 'hotel';

                                return (
                                    <div 
                                        key={conv.user.id}
                                        onClick={() => setSelectedGuestId(conv.user.id)}
                                        className={cn(
                                            "p-4 flex items-start gap-3.5 transition-all cursor-pointer text-left relative",
                                            isSelected 
                                                ? "bg-slate-100/80 border-l-4 border-l-slate-950" 
                                                : "hover:bg-slate-50"
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
                                            {conv.user?.name ? conv.user.name.charAt(0).toUpperCase() : "G"}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <h4 className="text-xs font-black text-slate-950 truncate">
                                                    {conv.user?.name || "Guest"}
                                                </h4>
                                                <span className="text-[10px] font-semibold text-slate-600 whitespace-nowrap">
                                                    {conv.lastMessage?.createdAt 
                                                        ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                        : ""}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-600 font-medium truncate leading-snug">
                                                {isFromHotel && <span className="font-bold text-slate-950">You: </span>}
                                                {conv.lastMessage?.content || "No message content"}
                                            </p>

                                            <p className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                                                {conv.user?.email || "Direct guest chat"}
                                            </p>
                                        </div>

                                        {conv.unreadCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shrink-0 shadow-2xs">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-950">No guest inquiries yet</p>
                                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                                        When travelers reach out about your rooms or bookings, conversations will appear here.
                                    </p>
                                </div>

                                <button
                                    onClick={handleSendDemoMessage}
                                    disabled={sending}
                                    className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-[11px] font-bold text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Send Demo Guest Inquiry</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT: ACTIVE CONVERSATION PANE ─── */}
                <div className="flex-1 flex flex-col bg-slate-50/50">
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0">
                                        {activeConversation.user?.name ? activeConversation.user.name.charAt(0).toUpperCase() : "G"}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-slate-950 truncate">
                                                {activeConversation.user?.name || "Guest Traveler"}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                Verified Guest
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                                            {activeConversation.user?.email || "Guest"} • Replying as Front Desk
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Scroll Area */}
                            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-3.5">
                                {activeConversation.messages.map((msg: any) => {
                                    const isHotel = msg.sender === 'hotel';

                                    return (
                                        <div 
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col max-w-[80%]",
                                                isHotel ? "ml-auto items-end" : "items-start"
                                            )}
                                        >
                                            <div 
                                                className={cn(
                                                    "p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-2xs",
                                                    isHotel 
                                                        ? "bg-slate-950 text-white rounded-tr-xs" 
                                                        : "bg-white text-slate-900 rounded-tl-xs border border-slate-200"
                                                )}
                                            >
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>

                                            <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-600 font-bold">
                                                <span>{isHotel ? "You (Front Desk)" : (msg.user?.name || "Guest")}</span>
                                                <span>•</span>
                                                <span>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isHotel && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Presets Bar */}
                            <div className="px-5 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider shrink-0">Quick Replies:</span>
                                {quickReplies.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setNewMessage(reply)}
                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>

                            {/* Chat Input Bar */}
                            <div className="p-4 bg-white border-t border-slate-200">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        placeholder={`Reply to ${activeConversation.user?.name || "guest"}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-colors"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="px-5 py-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Send</span>
                                                <Send className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-300 shadow-2xs flex items-center justify-center text-slate-400">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-black text-slate-950">Select a Guest Conversation</h3>
                            <p className="text-xs text-slate-600 font-medium max-w-sm">
                                Choose a guest inquiry from the left sidebar to read their message history and reply directly.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
