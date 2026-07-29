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
        <div className="p-8 space-y-8 min-w-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                        <Bot className="w-7 h-7 text-brand-600" />
                        AI Chat Analytics & Conversion Tracking
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Monitor traveler AI chat engagement, chat durations, Google user accounts, and direct booking conversions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search user, email, topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        disabled={loading}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Chat Sessions</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Bot className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{summary.totalSessions}</span>
                        <span className="text-xs font-bold text-slate-400 ml-2">sessions</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Messages Exchanged</span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{summary.totalMessages}</span>
                        <span className="text-xs font-bold text-slate-400 ml-2">dialogs</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Avg Chat Duration</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{summary.avgDurationFormatted}</span>
                        <span className="text-xs font-bold text-slate-400 ml-2">per chat</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">AI Conversion Rate</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-600 tracking-tight">{summary.conversionRatePercent}%</span>
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {summary.convertedBookings} Bookings
                        </span>
                    </div>
                </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            Traveler AI Sessions ({sessions.length})
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            Real-time traveler chat logs, login providers, durations & booking conversions
                        </p>
                    </div>
                </div>

                {loading && sessions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                        <p className="text-xs font-semibold text-slate-500">Loading AI chat analytics...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="py-20 text-center space-y-2">
                        <Bot className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-700">No chat sessions found</p>
                        <p className="text-xs text-slate-400">No AI conversations match your search criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Session ID & Topic</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Traveler Profile</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Chat Duration</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Dialogs</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Booking Status</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                {sessions.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Session ID & Topic */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg shrink-0">
                                                    #{s.sessionNumber}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate max-w-[220px]" title={s.title}>
                                                        {s.title}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                        {new Date(s.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Traveler Profile */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {s.user?.profileImage ? (
                                                    <img src={s.user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                                                        {(s.user?.name || "G").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                                        {s.user?.name || "Guest Traveler"}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-slate-500 font-medium">{s.user?.email || "Guest Mode"}</span>
                                                        <span className={cn(
                                                            "px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase",
                                                            s.user?.provider === "Google Auth"
                                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                : s.user?.isRegistered
                                                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                                    : "bg-slate-100 text-slate-600"
                                                        )}>
                                                            {s.user?.provider}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Chat Duration */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-700 font-extrabold">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                <span>{s.durationFormatted}</span>
                                            </div>
                                        </td>

                                        {/* Dialogs */}
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                                                {s.messageCount} msgs
                                            </span>
                                        </td>

                                        {/* Booking Status */}
                                        <td className="px-6 py-4">
                                            {s.isBooked && s.booking ? (
                                                <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900">
                                                    <div className="flex items-center gap-1.5 font-black text-[11px] text-emerald-700">
                                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Booked: {s.booking.hotelName}</span>
                                                    </div>
                                                    <div className="text-[10px] text-emerald-600 font-bold">
                                                        ₹{s.booking.totalPrice.toLocaleString()} • Status: <span className="uppercase">{s.booking.status}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                                                    <XCircle className="w-3.5 h-3.5 text-slate-300" /> No Booking Yet
                                                </span>
                                            )}
                                        </td>

                                        {/* Action: Inspect Transcript */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSession(s)}
                                                className="px-3.5 py-1.5 rounded-lg bg-brand-600 text-white font-extrabold text-[11px] hover:bg-brand-700 transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg">
                                        #{selectedSession.sessionNumber}
                                    </span>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm">{selectedSession.title}</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Traveler: <strong className="text-slate-800">{selectedSession.user?.name}</strong> ({selectedSession.user?.email}) • Duration: <strong>{selectedSession.durationFormatted}</strong>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Messages Body */}
                            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/30">
                                {selectedSession.messages && selectedSession.messages.length > 0 ? (
                                    selectedSession.messages.map((m: any) => (
                                        <div
                                            key={m.id}
                                            className={cn(
                                                "flex flex-col max-w-[80%]",
                                                m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1 px-1">
                                                <span>{m.role === 'user' ? (selectedSession.user?.name || "Traveler") : "ChatGHS AI Assistant"}</span>
                                                <span>•</span>
                                                <span>{new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>

                                            <div
                                                className={cn(
                                                    "p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-wrap",
                                                    m.role === 'user'
                                                        ? "bg-brand-600 text-white rounded-tr-none"
                                                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                                )}
                                            >
                                                {m.content}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-xs font-medium">
                                        No message logs recorded for this session.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                                <span>Total Dialogs: {selectedSession.messageCount}</span>
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
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
