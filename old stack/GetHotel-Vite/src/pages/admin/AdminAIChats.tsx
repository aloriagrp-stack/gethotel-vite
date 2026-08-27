import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import {
    Bot, MessageSquare, Clock, CheckCircle2, XCircle, Search,
    Loader2, RefreshCw, UserCheck, Calendar, Hotel, ArrowUpRight,
    Sparkles, Eye, X, MessageCircle, ExternalLink, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAIChats() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSession, setSelectedSession] = useState<any>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getAIChatAnalytics(searchQuery);
            if (res.success) {
                setData(res);
            }
        } catch (err) {
            console.error("Failed to load AI chat analytics", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAnalytics();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const summary = data?.summary || {
        totalSessions: 0,
        totalMessages: 0,
        avgDurationFormatted: "0s",
        convertedBookings: 0,
        conversionRatePercent: 0
    };

    const sessions = data?.sessions || [];

    return (
        <div className="p-8 space-y-8 min-w-0 font-sans text-neutral-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f1f] pb-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                        <Bot className="w-7 h-7 text-emerald-400" />
                        AI Chat Analytics & Conversion Tracking
                    </h2>
                    <p className="text-xs font-semibold text-neutral-400 mt-1">
                        Monitor traveler AI chat engagement, chat durations, Google user accounts, and direct booking conversions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search user, email, topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2.5 text-xs font-medium bg-[#141414] border border-[#282828] text-white rounded-xl w-64 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 font-mono"
                        />
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        disabled={loading}
                        className="px-4 py-2.5 bg-[#181818] border border-[#2a2a2a] rounded-xl hover:bg-[#222222] text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Top Metric Cards - Pure Black Skeuomorphic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] relative overflow-hidden group hover:border-[#2a2a2a] transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Chat Sessions</span>
                        <div className="w-9 h-9 rounded-xl bg-[#161616] text-blue-400 flex items-center justify-center border border-[#262626]">
                            <Bot className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-white tracking-tight">{summary.totalSessions}</span>
                        <span className="text-xs font-bold text-neutral-500 ml-2">sessions</span>
                    </div>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] relative overflow-hidden group hover:border-[#2a2a2a] transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Messages Exchanged</span>
                        <div className="w-9 h-9 rounded-xl bg-[#161616] text-indigo-400 flex items-center justify-center border border-[#262626]">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-white tracking-tight">{summary.totalMessages}</span>
                        <span className="text-xs font-bold text-neutral-500 ml-2">dialogs</span>
                    </div>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] relative overflow-hidden group hover:border-[#2a2a2a] transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Avg Chat Duration</span>
                        <div className="w-9 h-9 rounded-xl bg-[#161616] text-amber-400 flex items-center justify-center border border-[#262626]">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-white tracking-tight">{summary.avgDurationFormatted}</span>
                        <span className="text-xs font-bold text-neutral-500 ml-2">per chat</span>
                    </div>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] p-5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] relative overflow-hidden group hover:border-[#2a2a2a] transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">AI Conversion Rate</span>
                        <div className="w-9 h-9 rounded-xl bg-[#161616] text-emerald-400 flex items-center justify-center border border-[#262626]">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-400 tracking-tight">{summary.conversionRatePercent}%</span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                            {summary.convertedBookings} Bookings
                        </span>
                    </div>
                </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Traveler AI Sessions ({sessions.length})
                        </h3>
                        <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                            Real-time traveler chat logs, login providers, durations & booking conversions
                        </p>
                    </div>
                </div>

                {loading && sessions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                        <p className="text-xs font-semibold text-neutral-400">Loading AI chat analytics...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="py-20 text-center space-y-2">
                        <Bot className="w-10 h-10 text-neutral-600 mx-auto" />
                        <p className="text-sm font-bold text-white uppercase tracking-wider">No chat sessions found</p>
                        <p className="text-xs text-neutral-400">No AI conversations match your search criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                                <tr>
                                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Session ID & Topic</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Traveler Profile</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Chat Duration</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Dialogs</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Booking Status</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#181818] text-xs font-medium">
                                {sessions.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-[#121212] transition-colors">
                                        {/* Session ID & Topic */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-1 bg-[#181818] border border-[#2a2a2a] text-white text-[10px] font-bold rounded-lg shrink-0">
                                                    #{s.sessionNumber}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white truncate max-w-[220px]" title={s.title}>
                                                        {s.title}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                                                        {new Date(s.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Traveler Profile */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {s.user?.profileImage ? (
                                                    <img src={s.user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border border-[#282828] shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[#161616] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-[#282828]">
                                                        {(s.user?.name || "G").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-white flex items-center gap-1.5">
                                                        {s.user?.name || "Guest Traveler"}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-neutral-400 font-medium">{s.user?.email || "Guest Mode"}</span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border",
                                                            s.user?.provider === "Google Auth"
                                                                ? "bg-blue-950/80 text-blue-400 border-blue-800/40"
                                                                : s.user?.isRegistered
                                                                    ? "bg-purple-950/80 text-purple-400 border-purple-800/40"
                                                                    : "bg-[#141414] text-neutral-400 border-[#262626]"
                                                        )}>
                                                            {s.user?.provider}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Chat Duration */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
                                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                                <span>{s.durationFormatted}</span>
                                            </div>
                                        </td>

                                        {/* Dialogs */}
                                        <td className="px-6 py-4 font-bold text-neutral-300">
                                            <span className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#262626] text-neutral-300 text-[11px]">
                                                {s.messageCount} msgs
                                            </span>
                                        </td>

                                        {/* Booking Status */}
                                        <td className="px-6 py-4">
                                            {s.isBooked && s.booking ? (
                                                <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-300">
                                                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Booked: {s.booking.hotelName}</span>
                                                    </div>
                                                    <div className="text-[10px] text-emerald-400 font-bold">
                                                        ₹{s.booking.totalPrice.toLocaleString()} • Status: <span className="uppercase">{s.booking.status}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 bg-[#141414] border border-[#262626] px-2.5 py-1 rounded-lg">
                                                    <XCircle className="w-3.5 h-3.5 text-neutral-600" /> No Booking Yet
                                                </span>
                                            )}
                                        </td>

                                        {/* Action: Inspect Transcript */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSession(s)}
                                                className="px-3.5 py-1.5 rounded-lg bg-neutral-100 text-black font-bold text-[11px] hover:bg-white transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5 uppercase tracking-wider"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Dialog
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Full Chat Transcript Inspector */}
            <AnimatePresence>
                {selectedSession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0c0c0c] rounded-3xl shadow-2xl border border-[#1c1c1c] border-t-[#2d2d2d] text-white w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-[#181818] border border-[#2a2a2a] text-white text-xs font-bold rounded-lg">
                                        #{selectedSession.sessionNumber}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{selectedSession.title}</h3>
                                        <p className="text-[11px] text-neutral-400 font-medium">
                                            Traveler: <strong className="text-white">{selectedSession.user?.name}</strong> ({selectedSession.user?.email}) • Duration: <strong>{selectedSession.durationFormatted}</strong>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="w-8 h-8 rounded-full bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Messages Body */}
                            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#050505]">
                                {selectedSession.messages && selectedSession.messages.length > 0 ? (
                                    selectedSession.messages.map((m: any) => (
                                        <div
                                            key={m.id}
                                            className={cn(
                                                "flex flex-col max-w-[80%]",
                                                m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 mb-1 px-1">
                                                <span>{m.role === 'user' ? (selectedSession.user?.name || "Traveler") : "ChatGHS AI Assistant"}</span>
                                                <span>•</span>
                                                <span>{new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>

                                            <div
                                                className={cn(
                                                    "p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-wrap",
                                                    m.role === 'user'
                                                        ? "bg-neutral-100 text-black font-semibold rounded-tr-none"
                                                        : "bg-[#121212] border border-[#262626] text-neutral-200 rounded-tl-none"
                                                )}
                                            >
                                                {m.content}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-neutral-500 text-xs font-medium">
                                        No message logs recorded for this session.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3.5 border-t border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between text-xs font-bold text-neutral-400">
                                <span>Total Dialogs: {selectedSession.messageCount}</span>
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="px-4 py-2 bg-[#181818] border border-[#2a2a2a] text-white rounded-xl hover:bg-[#222222] transition-colors cursor-pointer uppercase tracking-wider"
                                >
                                    Close Transcript
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
