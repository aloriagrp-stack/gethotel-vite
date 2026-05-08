"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
    Bell, CheckCircle2, AlertCircle, 
    Clock, Loader2, Search, Filter,
    Check, Trash2, Info, Zap,
    Calendar, CreditCard, User,
    X, Inbox, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationApi } from "@/lib/api";

export default function PartnerNotificationsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const fetchNotifications = async () => {
        try {
            const res = await notificationApi.getNotifications();
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser) {
            fetchNotifications();
        } else if (!authLoading && !authUser) {
            router.push("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleMarkAsRead = async (id: number) => {
        try {
            const res = await notificationApi.markAsRead(id);
            if (res.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await notificationApi.markAllRead();
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-50 border-emerald-100';
            case 'warning': return 'bg-amber-50 border-amber-100';
            case 'error': return 'bg-red-50 border-red-100';
            default: return 'bg-blue-50 border-blue-100';
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notification Center</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Stay updated with bookings, payments and system alerts</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleMarkAllRead}
                        className="px-6 py-3.5 bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Mark all as read
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] border border-slate-200 w-fit">
                {(['all', 'unread', 'read'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            filter === t ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {t} 
                        {t === 'unread' && unreadCount > 0 && (
                            <span className="bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications Feed */}
            <div className="space-y-4">
                {filteredNotifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className={cn(
                            "p-8 rounded-[40px] border transition-all flex items-start gap-8 group relative overflow-hidden",
                            notif.isRead ? "bg-white border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1"
                        )}
                    >
                        {/* Status Indicator Bar */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-2",
                            notif.type === 'success' ? "bg-emerald-500" :
                            notif.type === 'warning' ? "bg-amber-500" :
                            notif.type === 'error' ? "bg-red-500" : "bg-blue-500"
                        )} />

                        <div className={cn(
                            "w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 shadow-sm",
                            getTypeColor(notif.type)
                        )}>
                            {getTypeIcon(notif.type)}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={cn("text-lg font-black tracking-tight", notif.isRead ? "text-slate-500" : "text-slate-900")}>
                                    {notif.title}
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className={cn("text-sm font-medium leading-relaxed max-w-2xl", notif.isRead ? "text-slate-400" : "text-slate-600")}>
                                {notif.message}
                            </p>
                        </div>

                        {!notif.isRead && (
                            <button 
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="px-5 py-2.5 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                                Mark Read
                            </button>
                        )}
                    </div>
                ))}

                {filteredNotifications.length === 0 && (
                    <div className="py-40 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 text-slate-200">
                            <Inbox className="w-12 h-12" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-2">All caught up!</h4>
                        <p className="text-slate-500 font-medium">You have no new notifications to show.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function XCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    )
}
