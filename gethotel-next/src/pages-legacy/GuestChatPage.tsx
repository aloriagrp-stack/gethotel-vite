'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Search, Send, Loader2, ArrowLeft, 
    Hotel, CheckCheck, ShieldCheck, 
    MessageSquare, ExternalLink
} from 'lucide-react';
import { messageApi, bookingApi, hotelApi } from '@/lib/api';
import { cn, getHotelUrl } from '@/lib/utils';
import { useNavigate as useRouter } from '@/lib/navigation';

export default function GuestChatPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingThread, setLoadingThread] = useState(false);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [bookingRef, setBookingRef] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 1. Initial Load: Fetch User's Messages and Bookings
    useEffect(() => {
        const loadInitialData = async () => {
            const hotelsMap: { [hotelId: number]: any } = {};

            // URL Params check: /chat?hotelId=16&bookingRef=GH-10029
            let paramHotelId: number | null = null;
            let paramBookingRef: string | null = null;
            if (typeof window !== 'undefined') {
                const searchParams = new URLSearchParams(window.location.search);
                const hId = searchParams.get('hotelId');
                if (hId) paramHotelId = parseInt(hId);
                paramBookingRef = searchParams.get('bookingRef') || searchParams.get('ref');
                if (paramBookingRef) setBookingRef(paramBookingRef);
            }

            // A. Fetch user messages
            try {
                const msgRes = await messageApi.getMyMessages();
                if (msgRes.success && Array.isArray(msgRes.data)) {
                    msgRes.data.forEach((msg: any) => {
                        const hid = msg.hotelId;
                        if (!hotelsMap[hid]) {
                            hotelsMap[hid] = {
                                hotelId: hid,
                                hotel: msg.hotel || { id: hid, name: `Hotel #${hid}` },
                                lastMessage: msg,
                                unreadCount: (!msg.isRead && msg.sender === 'hotel') ? 1 : 0
                            };
                        } else {
                            if (!msg.isRead && msg.sender === 'hotel') {
                                hotelsMap[hid].unreadCount += 1;
                            }
                        }
                    });
                }
            } catch (err) {
                console.warn('Failed to load user messages:', err);
            }

            // B. Fetch user bookings to include any booked properties
            try {
                const bookRes = await bookingApi.getMyBookings();
                const bookings = bookRes.data || [];
                bookings.forEach((b: any) => {
                    if (b.hotel && b.hotel.id) {
                        const hid = b.hotel.id;
                        const bRef = `GH-${Number(b.id) + 10000}`;
                        if (!hotelsMap[hid]) {
                            hotelsMap[hid] = {
                                hotelId: hid,
                                hotel: b.hotel,
                                lastMessage: null,
                                unreadCount: 0,
                                bookingRef: bRef
                            };
                        } else if (!hotelsMap[hid].bookingRef) {
                            hotelsMap[hid].bookingRef = bRef;
                        }
                    }
                });
            } catch (err) {
                console.warn('Failed to load bookings for chat:', err);
            }

            // C. If paramHotelId is given and not yet in list, fetch its info
            if (paramHotelId && !hotelsMap[paramHotelId]) {
                try {
                    const hRes = await hotelApi.getHotel(String(paramHotelId));
                    if (hRes.success && hRes.data) {
                        hotelsMap[paramHotelId] = {
                            hotelId: paramHotelId,
                            hotel: hRes.data,
                            lastMessage: null,
                            unreadCount: 0,
                            bookingRef: paramBookingRef
                        };
                    }
                } catch (e) {
                    hotelsMap[paramHotelId] = {
                        hotelId: paramHotelId,
                        hotel: { id: paramHotelId, name: 'Hotel Front Desk' },
                        lastMessage: null,
                        unreadCount: 0,
                        bookingRef: paramBookingRef
                    };
                }
            }

            const list = Object.values(hotelsMap);
            setConversations(list);

            if (paramHotelId) {
                setSelectedHotelId(paramHotelId);
            } else if (list.length > 0) {
                setSelectedHotelId(list[0].hotelId);
            }

            setLoadingConversations(false);
        };

        loadInitialData();
    }, []);

    // 2. Fetch thread whenever selectedHotelId changes
    const fetchThread = async () => {
        if (!selectedHotelId) return;
        try {
            const res = await messageApi.getGuestHotelThread(selectedHotelId);
            if (res.success && Array.isArray(res.data)) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error('Failed to load thread:', err);
        } finally {
            setLoadingThread(false);
        }
    };

    useEffect(() => {
        if (selectedHotelId) {
            setLoadingThread(true);
            fetchThread();
            const interval = setInterval(fetchThread, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedHotelId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, selectedHotelId]);

    const activeConv = conversations.find(c => c.hotelId === selectedHotelId);
    const activeHotel = activeConv?.hotel || null;
    const currentBookingRef = bookingRef || activeConv?.bookingRef;

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = newMessage.trim();
        if (!text || !selectedHotelId || sending) return;

        setSending(true);
        try {
            const res = await messageApi.sendMessage({
                hotelId: selectedHotelId,
                content: text
            });

            if (res.success && res.data) {
                setMessages(prev => [...prev, res.data]);
                setNewMessage("");
                setTimeout(scrollToBottom, 50);

                setConversations(prev => prev.map(c => {
                    if (c.hotelId === selectedHotelId) {
                        return { ...c, lastMessage: res.data };
                    }
                    return c;
                }));
            }
        } catch (err: any) {
            alert(err?.message || "Failed to send message. Please log in or check your connection.");
        } finally {
            setSending(false);
        }
    };

    const quickChips = [
        "Early check-in possible?",
        "Parking available?",
        "Breakfast timings?",
        "Luggage drop before check-in?",
        currentBookingRef ? `Inquiry for #${currentBookingRef}` : null
    ].filter(Boolean) as string[];

    const filteredConversations = conversations.filter(c => {
        const name = (c.hotel?.name || "").toLowerCase();
        const city = (c.hotel?.city || "").toLowerCase();
        const q = searchTerm.toLowerCase();
        return name.includes(q) || city.includes(q);
    });

    const handleBackClick = () => {
        if (conversations.length > 1 && selectedHotelId) {
            setSelectedHotelId(null);
        } else {
            router("/my-bookings");
        }
    };

    return (
        <div className="h-[100dvh] w-full flex bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
            {/* ─── LEFT COLUMN: CONVERSATION LIST ─── */}
            <aside className={cn(
                "w-full md:w-80 lg:w-96 bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-10 h-full",
                selectedHotelId ? "hidden md:flex" : "flex"
            )}>
                {/* Clean Header */}
                <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => router("/my-bookings")}
                            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Back to My Bookings"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-base font-black text-slate-950 tracking-tight">Messages</h2>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search properties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-100 border border-transparent rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
                    {loadingConversations ? (
                        <div className="h-40 flex items-center justify-center text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map((conv) => {
                            const isSelected = selectedHotelId === conv.hotelId;
                            const isFromHotel = conv.lastMessage?.sender === 'hotel';

                            return (
                                <div
                                    key={conv.hotelId}
                                    onClick={() => setSelectedHotelId(conv.hotelId)}
                                    className={cn(
                                        "p-3.5 flex items-center gap-3 transition-all cursor-pointer text-left relative",
                                        isSelected 
                                            ? "bg-slate-100/90 border-l-4 border-l-slate-950" 
                                            : "hover:bg-slate-50"
                                    )}
                                >
                                    {conv.hotel?.thumbnail ? (
                                        <img 
                                            src={conv.hotel.thumbnail} 
                                            alt={conv.hotel.name}
                                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                                            <Hotel className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <h4 className="text-xs font-black text-slate-950 truncate">
                                                {conv.hotel?.name || "Hotel Front Desk"}
                                            </h4>
                                            {conv.lastMessage?.createdAt && (
                                                <span className="text-[10px] text-slate-500 shrink-0">
                                                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-500 truncate">
                                            {isFromHotel && <span className="font-bold text-slate-900">Hotel: </span>}
                                            {conv.lastMessage ? conv.lastMessage.content : "Tap to open chat"}
                                        </p>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <span className="w-4 h-4 rounded-full text-[10px] font-black bg-blue-600 text-white flex items-center justify-center shrink-0">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-500 text-xs font-medium">
                            No conversations yet
                        </div>
                    )}
                </div>
            </aside>

            {/* ─── RIGHT COLUMN: ACTIVE CHAT SCREEN ─── */}
            <main className={cn(
                "flex-1 flex flex-col bg-[#f8fafc] h-full overflow-hidden",
                !selectedHotelId ? "hidden md:flex" : "flex"
            )}>
                {activeHotel ? (
                    <>
                        {/* 1. Ultra-clean Header (Only 1 Header on Entire Screen) */}
                        <div className="h-14 px-3 sm:px-5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 z-10 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button 
                                    onClick={handleBackClick}
                                    className="p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                                    title="Back"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                {activeHotel.thumbnail ? (
                                    <img 
                                        src={activeHotel.thumbnail} 
                                        alt={activeHotel.name}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shrink-0 border border-slate-200" 
                                    />
                                ) : (
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                                        <Hotel className="w-4 h-4" />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h3 className="text-xs sm:text-sm font-black text-slate-950 truncate leading-tight">
                                        {activeHotel.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span>Front Desk</span>
                                        {activeHotel.city && <span>• {activeHotel.city}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {currentBookingRef && (
                                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                        #{currentBookingRef}
                                    </span>
                                )}
                                {activeHotel.id && (
                                    <a
                                        href={getHotelUrl(activeHotel.id, activeHotel.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                                        title="View Hotel Details"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* 2. Messages Thread Area */}
                        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-2.5 flex flex-col">
                            {loadingThread ? (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-2 text-slate-500">
                                    <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-500 mb-1">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-900">Direct Chat with {activeHotel.name}</p>
                                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                                        Send a message below. Property front desk will receive your inquiry directly.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isGuest = msg.sender === 'user';

                                    return (
                                        <div 
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col max-w-[85%] sm:max-w-[70%]",
                                                isGuest ? "ml-auto items-end self-end" : "mr-auto items-start self-start"
                                            )}
                                        >
                                            <div 
                                                className={cn(
                                                    "px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-2xs",
                                                    isGuest 
                                                        ? "bg-slate-950 text-white rounded-tr-xs" 
                                                        : "bg-white text-slate-900 rounded-tl-xs border border-slate-200/80"
                                                )}
                                            >
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>

                                            <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400 font-medium">
                                                <span>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isGuest && <CheckCheck className="w-3.5 h-3.5 text-slate-400" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 3. Compact Horizontal Suggestions Chips */}
                        <div className="px-3 py-1.5 bg-white/90 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                            {quickChips.map((sug, i) => (
                                <button
                                    key={i}
                                    onClick={() => setNewMessage(sug)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>

                        {/* 4. Minimal Pinned Bottom Input Bar */}
                        <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200/80 shrink-0 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input 
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent focus:border-slate-300 focus:bg-white rounded-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-9 h-9 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed shadow-xs"
                                    title="Send"
                                >
                                    {sending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-3.5 h-3.5 ml-0.5" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                        Select a conversation from the left to start chatting
                    </div>
                )}
            </main>
        </div>
    );
}
