'use client';

import { useState, useEffect, useRef } from "react";
import { 
    X, Send, Loader2, MessageSquare, 
    Hotel, ShieldCheck, CheckCheck, Clock, ExternalLink
} from "lucide-react";
import { messageApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GuestHotelChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotelId: number;
    hotelName: string;
    hotelThumbnail?: string;
    hotelCity?: string;
    initialMessage?: string;
    bookingReference?: string;
}

export default function GuestHotelChatModal({
    isOpen,
    onClose,
    hotelId,
    hotelName,
    hotelThumbnail,
    hotelCity,
    initialMessage = "",
    bookingReference
}: GuestHotelChatModalProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputMessage, setInputMessage] = useState(initialMessage);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchThread = async () => {
        if (!hotelId) return;
        try {
            const res = await messageApi.getGuestHotelThread(hotelId);
            if (res.success && Array.isArray(res.data)) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error("Failed to load chat thread:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && hotelId) {
            setLoading(true);
            fetchThread();
            const timer = setInterval(fetchThread, 6000);
            return () => clearInterval(timer);
        }
    }, [isOpen, hotelId]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const contentToSend = inputMessage.trim();
        if (!contentToSend || sending || !hotelId) return;

        setSending(true);
        try {
            const res = await messageApi.sendMessage({
                hotelId,
                content: contentToSend
            });

            if (res.success && res.data) {
                setMessages((prev) => [...prev, res.data]);
                setInputMessage("");
                setTimeout(scrollToBottom, 50);
            }
        } catch (err: any) {
            alert(err?.message || "Failed to send message. Please log in or check your connection.");
        } finally {
            setSending(false);
        }
    };

    const quickTemplates = [
        "Hi, is early check-in possible?",
        "Do you provide free parking?",
        "What time is breakfast served?",
        bookingReference ? `Inquiry regarding Booking #${bookingReference}` : null
    ].filter(Boolean) as string[];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[640px] max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            {hotelThumbnail ? (
                                <img 
                                    src={hotelThumbnail} 
                                    alt={hotelName} 
                                    className="w-11 h-11 rounded-2xl object-cover border border-white/20 shrink-0" 
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Hotel className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-black truncate">{hotelName}</h3>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>Front Desk • {hotelCity || "Direct Chat"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <a 
                                href={`/chat?hotelId=${hotelId}${bookingReference ? `&bookingRef=${bookingReference}` : ''}`}
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                                title="Open Full Screen Chat"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button 
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Booking Banner (if opened from a booking) */}
                    {bookingReference && (
                        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 font-semibold">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                <span>Verified Reservation: <strong>#{bookingReference}</strong></span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                                Confirmed
                            </span>
                        </div>
                    )}

                    {/* Chat Messages Body */}
                    <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-slate-50/60 space-y-3.5 flex flex-col">
                        {loading && messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
                                <p className="text-xs font-semibold">Connecting to front desk...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">Message the Hotel Directly</h4>
                                    <p className="text-xs text-slate-600 font-medium mt-1 max-w-sm">
                                        Have a question about check-in time, directions, or amenities? The hotel staff receives your message instantly.
                                    </p>
                                </div>

                                <div className="pt-2 flex flex-wrap justify-center gap-2 max-w-md">
                                    {quickTemplates.map((tmpl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInputMessage(tmpl)}
                                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-colors text-left"
                                        >
                                            {tmpl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <div 
                                        key={msg.id}
                                        className={cn(
                                            "flex flex-col max-w-[82%]",
                                            isUser ? "ml-auto items-end self-end" : "mr-auto items-start self-start"
                                        )}
                                    >
                                        <div 
                                            className={cn(
                                                "p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-2xs",
                                                isUser 
                                                    ? "bg-slate-950 text-white rounded-tr-xs" 
                                                    : "bg-white text-slate-900 rounded-tl-xs border border-slate-200"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 font-semibold">
                                            <span>{isUser ? "You" : hotelName}</span>
                                            <span>•</span>
                                            <span>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isUser && <CheckCheck className="w-3 h-3 text-slate-400" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions Chips */}
                    {messages.length > 0 && (
                        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick:</span>
                            {quickTemplates.slice(0, 2).map((tmpl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInputMessage(tmpl)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
                                >
                                    {tmpl}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Footer */}
                    <form 
                        onSubmit={handleSendMessage}
                        className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
                    >
                        <input 
                            type="text"
                            placeholder="Type a message to front desk..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-800 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || sending}
                            className="p-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0"
                            title="Send message"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

