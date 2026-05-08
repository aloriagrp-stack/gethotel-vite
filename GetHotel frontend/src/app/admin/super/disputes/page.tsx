"use client";

import { useState, useEffect } from "react";
import { 
    AlertCircle, Search, Filter, 
    Clock, CheckCircle2, XCircle, 
    MessageSquare, Hotel, User, 
    ShieldAlert, Loader2, ChevronRight,
    Gavel, ArrowRight, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bookingApi } from "@/lib/api";

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

    useEffect(() => {
        // Simulated fetch
        setTimeout(() => {
            setDisputes([
                { 
                    id: "DSP-1024", 
                    bookingId: "GH-14205", 
                    hotel: "Grand Palace", 
                    guest: "Aman V.", 
                    reason: "Property Misrepresentation", 
                    status: "open", 
                    priority: "high",
                    date: "2 hours ago"
                },
                { 
                    id: "DSP-1025", 
                    bookingId: "GH-14210", 
                    hotel: "Royal Heritage", 
                    guest: "Deepak S.", 
                    reason: "No-Show Dispute", 
                    status: "resolved", 
                    priority: "medium",
                    date: "1 day ago"
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredDisputes = disputes.filter(d => {
        if (filter === 'open') return d.status === 'open';
        if (filter === 'resolved') return d.status === 'resolved';
        return true;
    });

    return (
        <div className="p-10 space-y-10 bg-slate-50 min-h-screen animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <Gavel className="w-10 h-10 text-brand-600" /> Resolution Center
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1 ml-1">Mediate conflicts and ensure platform integrity</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-sm">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">3 High Priority Cases</span>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Disputes", value: "12", color: "text-amber-600" },
                    { label: "Resolution Rate", value: "94%", color: "text-emerald-600" },
                    { label: "Avg. Resolve Time", value: "4.2h", color: "text-blue-600" }
                ].map(stat => (
                    <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className={cn("text-3xl font-black italic tracking-tighter", stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                        {['all', 'open', 'resolved'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t as any)}
                                className={cn(
                                    "px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border",
                                    filter === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-slate-300" /></div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDisputes.map(dispute => (
                                <div key={dispute.id} className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                                    {dispute.priority === 'high' && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest">Urgent</div>
                                    )}
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest italic">{dispute.id}</span>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dispute.date}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 italic tracking-tight mb-1">{dispute.reason}</h3>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Booking: {dispute.bookingId}</p>
                                            </div>
                                            <div className="flex items-center gap-8 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <Hotel className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{dispute.hotel}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{dispute.guest}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all flex items-center gap-2">
                                                Review Case <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-all">
                                                Quick Resolve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-sm shadow-2xl relative overflow-hidden group">
                        <MessageSquare className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 transform rotate-12" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 border-b border-white/5 pb-4">Resolution Tip</h4>
                        <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                            "Most disputes regarding misrepresentation are resolved by cross-checking guest photos with the property gallery."
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" /> Pending Refunds
                        </h4>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic">Booking #14205</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aman V.</p>
                                    </div>
                                    <span className="text-xs font-black text-emerald-600 italic">₹1,800</span>
                                </div>
                            ))}
                            <button className="w-full mt-4 py-3 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                                View Refund Ledger
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
