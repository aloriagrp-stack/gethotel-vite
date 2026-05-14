

import { useState, useEffect } from "react";
import { 
    Bell, CheckCircle2, AlertCircle, 
    Clock, Loader2, Search, Filter,
    Check, Trash2, Info, Zap,
    Calendar, CreditCard, User,
    X, Inbox, ChevronRight, Activity,
    Hotel, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationApi } from "@/lib/api";

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const fetchNotifications = async () => {
        try {
            const res = await notificationApi.getNotifications();
            if (res.success) {
                setNotifications(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="p-10 space-y-10 animate-fade-in bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Global Activity</h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-1">Real-time platform updates & administrative alerts</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all">
                        Clear All History
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Filters */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Filters</h3>
                        <div className="space-y-2">
                            {(['all', 'unread', 'read'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all",
                                        filter === t ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    {t}
                                    {t === 'unread' && unreadCount > 0 && (
                                        <span className="bg-brand-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] shadow-glow">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-sm shadow-2xl relative overflow-hidden group">
                        <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">System Health</h4>
                        <p className="text-2xl font-black italic mb-2">99.9%</p>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-[99.9%]" />
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((n) => (
                            <div 
                                key={n.id}
                                className={cn(
                                    "bg-white border p-6 rounded-sm transition-all group relative overflow-hidden",
                                    n.isRead ? "border-slate-100 opacity-60" : "border-slate-200 shadow-sm hover:shadow-md"
                                )}
                            >
                                <div className="flex items-start gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-sm flex items-center justify-center shrink-0",
                                        n.type === 'booking' ? "bg-emerald-50 text-emerald-600" :
                                        n.type === 'cancel' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {n.type === 'booking' ? <Hotel className="w-5 h-5" /> : 
                                         n.type === 'cancel' ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">{n.title}</h4>
                                            <span className="text-[9px] font-bold text-slate-400">{n.createdAt}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 leading-relaxed">{n.message}</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-50 rounded-sm">
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white border border-slate-200 border-dashed py-32 rounded-sm text-center">
                            <Inbox className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No activity recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



