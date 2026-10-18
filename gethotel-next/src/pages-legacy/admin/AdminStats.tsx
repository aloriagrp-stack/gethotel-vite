'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Users, Activity, Globe2, Loader2, ArrowUpRight, MapPin
} from "lucide-react";
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
            <div className="min-h-[50vh] flex items-center justify-center bg-transparent text-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    const v = statsData?.visitors;
    const trendData = v?.trend || [];
    const maxVal = Math.max(...trendData.map((d: any) => d.visitors), 10);
    const width = 800;
    const height = 220;
    const xStep = width / Math.max(trendData.length - 1, 1);
    
    const points = trendData.map((d: any, i: number) => {
        const x = i * xStep;
        const y = height - (d.visitors / maxVal) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="space-y-6 text-slate-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Traffic & Analytics
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time visitor counts, regional demand, and audience retention metrics.</p>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/40 p-5 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-slate-500">Live Active Traffic (last 5 min)</span>
                        <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{v?.live || 0}</h3>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Now
                        </span>
                    </div>
                </div>

                <div className="bg-white/40 p-5 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-slate-500">Total Unique Visitors</span>
                        <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{v?.total?.toLocaleString() || 0}</h3>
                        <span className="text-[11px] text-slate-400 font-medium">All time</span>
                    </div>
                </div>
            </div>

            {/* 14-Day Traffic Trend */}
            <div className="bg-white/40 p-5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" /> 14-Day Traffic Trend
                    </h3>
                </div>
                
                <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                    <div className="min-w-[650px]">
                        <svg width="100%" height={height} viewBox={`0 -20 ${width} ${height + 40}`} preserveAspectRatio="none" className="overflow-visible">
                            {/* Grid lines */}
                            {[0, 1, 2, 3].map(i => {
                                const y = (height / 3) * i;
                                const val = Math.round(maxVal - (maxVal / 3) * i);
                                return (
                                    <g key={i}>
                                        <line x1="0" y1={y} x2={width} y2={y} stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />
                                        <text x="-10" y={y + 4} fontSize="10" fill="#737373" textAnchor="end">{val}</text>
                                    </g>
                                );
                            })}
                            
                            {/* Graph Line */}
                            <motion.polyline
                                points={points}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                            />
                            
                            {/* Points */}
                            {trendData.map((d: any, i: number) => {
                                const x = i * xStep;
                                const y = height - (d.visitors / maxVal) * height;
                                return (
                                    <g key={i} className="group cursor-pointer">
                                        <circle cx={x} cy={y} r="3.5" fill="#09090b" stroke="#10b981" strokeWidth="2" className="transition-all group-hover:r-5" />
                                        <text x={x} y={height + 22} fontSize="10" fill="#737373" textAnchor="middle">{d.label}</text>
                                        
                                        {/* Tooltip */}
                                        <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <rect x={x - 25} y={y - 30} width="50" height="20" rx="4" fill="#18181b" stroke="#27272a" />
                                            <text x={x} y={y - 16} fontSize="10" fill="#fff" textAnchor="middle">{d.visitors}</text>
                                        </g>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Geographical Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white/40 p-5 rounded-xl border border-slate-200/80">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 pb-3 border-b border-slate-200/60 flex items-center gap-2">
                        <Globe2 className="w-3.5 h-3.5 text-blue-400" /> Traffic by Country
                    </h3>
                    <div className="space-y-4">
                        {(v?.countryBreakdown || []).map((c: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs text-slate-700 mb-1.5">
                                    <span>{c.country || 'Unknown'}</span>
                                    <span className="text-slate-400">{c.count} ({c.percent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                    <motion.div 
                                        className="bg-blue-500 h-full rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${c.percent}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!v?.countryBreakdown || v.countryBreakdown.length === 0) && (
                            <p className="text-xs text-slate-400">No country location data yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white/40 p-5 rounded-xl border border-slate-200/80">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 pb-3 border-b border-slate-200/60 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Top Regions (India)
                    </h3>
                    <div className="space-y-4">
                        {(v?.regionBreakdown || []).map((r: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs text-slate-700 mb-1.5">
                                    <span>{r.region || 'Unknown'}</span>
                                    <span className="text-slate-400">{r.count} ({r.percent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                    <motion.div 
                                        className="bg-emerald-500 h-full rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${r.percent}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!v?.regionBreakdown || v.regionBreakdown.length === 0) && (
                            <p className="text-xs text-slate-400">No regional data yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
