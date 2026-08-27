import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Users, Activity, Globe2, Loader2, ArrowLeft, ArrowUpRight, MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { motion } from "framer-motion";

export default function SuperAdminStatsPage() {
    const { user, loading: authLoading } = useAuth();
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminApi.getAnalytics();
                if (res.success) {
                    setStatsData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'super_admin') fetchStats();
    }, [user]);

    if (loading || authLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-[#050505] text-white">
                <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
            </div>
        );
    }

    const v = statsData?.visitors;
    const trendData = v?.trend || [];
    const maxVal = Math.max(...trendData.map((d: any) => d.visitors), 10); // scale graph
    const width = 800;
    const height = 250;
    const xStep = width / Math.max(trendData.length - 1, 1);
    
    const points = trendData.map((d: any, i: number) => {
        const x = i * xStep;
        const y = height - (d.visitors / maxVal) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 text-white p-8 rounded-sm shadow-xl relative overflow-hidden group">
                    <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 pb-4 border-b border-white/5 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Live Traffic Status
                        </h3>
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Users (last 5 min)</p>
                            <h3 className="text-5xl font-black italic">{v?.live || 0}</h3>
                            <p className="text-[9px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> Updated in real-time
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-8 shadow-sm group">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-600" /> Total Reach
                    </h3>
                    <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Unique Visitors</p>
                        <h3 className="text-5xl font-black italic text-slate-900">{v?.total?.toLocaleString() || 0}</h3>
                        <p className="text-[9px] text-slate-400 font-bold mt-2">All time traffic</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-600" /> 14-Day Traffic Trend
                </h3>
                
                <div className="w-full overflow-x-auto pb-4 no-scrollbar">
                    <div className="min-w-[700px]">
                        <svg width="100%" height={height} viewBox={`0 -20 ${width} ${height + 40}`} preserveAspectRatio="none" className="overflow-visible">
                            {/* Grid lines */}
                            {[0, 1, 2, 3].map(i => {
                                const y = (height / 3) * i;
                                const val = Math.round(maxVal - (maxVal / 3) * i);
                                return (
                                    <g key={i}>
                                        <line x1="0" y1={y} x2={width} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                        <text x="-10" y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontWeight="bold">{val}</text>
                                    </g>
                                );
                            })}
                            
                            {/* Graph Line */}
                            <motion.polyline
                                points={points}
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                            
                            {/* Points and Tooltips */}
                            {trendData.map((d: any, i: number) => {
                                const x = i * xStep;
                                const y = height - (d.visitors / maxVal) * height;
                                return (
                                    <g key={i} className="group cursor-pointer">
                                        <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2" className="transition-all group-hover:r-7 group-hover:stroke-[3px]" />
                                        <text x={x} y={height + 25} fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="bold">{d.label}</text>
                                        
                                        {/* Tooltip */}
                                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <rect x={x - 30} y={y - 35} width="60" height="24" rx="4" fill="#0f172a" />
                                            <text x={x} y={y - 19} fontSize="10" fill="#fff" textAnchor="middle" fontWeight="bold">{d.visitors}</text>
                                        </g>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-blue-600" /> Traffic by Country
                    </h3>
                    <div className="space-y-5">
                        {(v?.countryBreakdown || []).map((c: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">
                                    <span>{c.country || 'Unknown'}</span>
                                    <span className="text-slate-400">{c.count} ({c.percent}%)</span>
                                </div>
                                <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                                    <motion.div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${c.percent}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!v?.countryBreakdown || v.countryBreakdown.length === 0) && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No location data yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" /> Top Regions (India)
                    </h3>
                    <div className="space-y-5">
                        {(v?.regionBreakdown || []).map((r: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">
                                    <span>{r.region || 'Unknown'}</span>
                                    <span className="text-slate-400">{r.count} ({r.percent}%)</span>
                                </div>
                                <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                                    <motion.div 
                                        className="bg-emerald-500 h-1.5 rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${r.percent}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!v?.regionBreakdown || v.regionBreakdown.length === 0) && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No region data yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
