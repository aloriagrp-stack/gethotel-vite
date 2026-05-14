

import { useState, useEffect } from "react";
import { 
    MessageSquare, Search, User, 
    Send, Loader2, Clock, 
    CheckCheck, ChevronRight,
    MapPin, Mail, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi, messageApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerMessagesPage() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await hotelApi.getMyHotels();
                if (res.success && res.data.length > 0) {
                    setHotels(res.data);
                    setSelectedHotelId(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch hotels", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    useEffect(() => {
        if (selectedHotelId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [selectedHotelId]);

    const fetchMessages = async () => {
        if (!selectedHotelId) return;
        try {
            const res = await messageApi.getHotelMessages(selectedHotelId);
            if (res.success) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedHotelId || sending) return;

        setSending(true);
        try {
            const res = await messageApi.sendMessage({
                hotelId: selectedHotelId,
                content: newMessage
            });
            if (res.success) {
                setMessages([res.data, ...messages]);
                setNewMessage("");
            }
        } catch (err) {
            alert("Bhai, message send nahi hua. Network check karle.");
        } finally {
            setSending(false);
        }
    };

    // Group messages by user to show "conversations"
    const conversations = messages.reduce((acc: any, msg: any) => {
        if (!acc[msg.userId]) {
            acc[msg.userId] = {
                user: msg.user,
                lastMessage: msg,
                unreadCount: messages.filter(m => m.userId === msg.userId && !m.isRead && m.sender === 'user').length
            };
        }
        return acc;
    }, {});

    const conversationList = Object.values(conversations);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Chat with your guests in real-time</p>
                </div>
                {hotels.length > 1 && (
                    <select 
                        value={selectedHotelId || ""} 
                        onChange={(e) => setSelectedHotelId(parseInt(e.target.value))}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600"
                    >
                        {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                )}
            </div>

            <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex">
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-slate-100 flex flex-col">
                    <div className="p-6 border-b border-slate-50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search guests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {conversationList.length > 0 ? (
                            conversationList.map((conv: any) => (
                                <button 
                                    key={conv.user.id}
                                    className="w-full p-6 flex gap-4 hover:bg-slate-50 transition-all text-left border-b border-slate-50 relative group"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-black text-slate-900 truncate">{conv.user.name}</p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(conv.lastMessage.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold truncate pr-4">
                                            {conv.lastMessage.sender === 'hotel' ? 'You: ' : ''}{conv.lastMessage.content}
                                        </p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="absolute right-6 bottom-6 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No conversations yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window Placeholder (Simplified for now - just showing all messages) */}
                <div className="flex-1 flex flex-col bg-slate-50/30">
                    <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">Global Guest Inquiries</p>
                                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Live Channel</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto no-scrollbar space-y-6 flex flex-col-reverse">
                        {messages.map((msg: any) => (
                            <div 
                                key={msg.id} 
                                className={cn(
                                    "flex flex-col max-w-[70%]",
                                    msg.sender === 'hotel' ? "ml-auto items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "p-4 rounded-[28px] shadow-sm",
                                    msg.sender === 'hotel' 
                                        ? "bg-blue-600 text-white rounded-tr-none" 
                                        : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                                )}>
                                    <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2 px-2">
                                    {msg.sender === 'user' && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{msg.user.name}</span>}
                                    <span className="text-[8px] font-bold text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {msg.sender === 'hotel' && <CheckCheck className="w-3 h-3 text-blue-400" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input 
                                type="text"
                                placeholder="Type your response here..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="w-full pl-6 pr-20 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                        <p className="mt-3 text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest">Responses are sent directly to the guest's dashboard</p>
                    </div>
                </div>
            </div>
        </div>
    );
}



