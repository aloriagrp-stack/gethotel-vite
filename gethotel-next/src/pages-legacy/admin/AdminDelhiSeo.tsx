'use client';
import { useCallback, useEffect, useMemo, useState } from "react";
import { hotelApi } from "@/lib/api";
import {
    buildDelhiContext,
    delhiHub,
    delhiPagePath,
    delhiPages,
    formatInr,
    normalizeDelhiHotels,
    type DelhiHotelInput,
} from "@/lib/delhiSeo";
import { Globe, RefreshCw } from "lucide-react";

interface DelhiSeoRow {
    slug: string;
    type: string;
    priority: number;
    primaryKeyword: string;
    count: number;
    requiredInventory: number;
    indexable: boolean;
    fromPrice: number | null;
    title: string;
    matched: DelhiHotelInput[];
    lastUpdated: string;
    contentQuality: string;
}

export default function AdminDelhiSeo() {
    const [hotels, setHotels] = useState<DelhiHotelInput[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res: any = await hotelApi.searchHotels({ city: "Delhi", limit: 200 });
            if (res?.success && Array.isArray(res.data)) {
                setHotels(normalizeDelhiHotels(res.data));
            } else {
                setError("Search API returned no data.");
            }
        } catch (err: any) {
            setError(err?.message || "Failed to load Delhi inventory.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const rows = useMemo<DelhiSeoRow[]>(() => {
        const hub = delhiHub();
        const entries: DelhiSeoRow[] = [
            {
                slug: hub.slug,
                type: hub.type,
                priority: hub.priority,
                primaryKeyword: hub.primaryKeyword,
                count: hotels.length,
                requiredInventory: hub.requiredInventory,
                indexable: hotels.length >= hub.requiredInventory,
                fromPrice: null,
                title: hub.title.replace("{count}", String(hotels.length)),
                matched: hotels,
                lastUpdated: hub.lastUpdated,
                contentQuality: hub.contentQuality,
            },
        ];
        for (const page of delhiPages()) {
            const ctx = buildDelhiContext(hotels, page.slug);
            if (!ctx) continue;
            entries.push({
                slug: page.slug,
                type: page.type,
                priority: page.priority,
                primaryKeyword: page.primaryKeyword,
                count: ctx.count,
                requiredInventory: page.requiredInventory,
                indexable: ctx.indexable,
                fromPrice: ctx.fromPrice,
                title: ctx.title,
                matched: ctx.matched,
                lastUpdated: page.lastUpdated,
                contentQuality: page.contentQuality,
            });
        }
        return entries;
    }, [hotels]);

    const indexableCount = rows.filter((r) => r.indexable).length;
    const noindexCount = rows.length - indexableCount;
    const priceReadyCount = rows.filter((r) => r.fromPrice !== null).length;

    const typeBadge = (type: string) => {
        const map: Record<string, string> = {
            hub: "bg-indigo-950/80 text-indigo-300 border-indigo-800/40",
            area: "bg-sky-950/80 text-sky-300 border-sky-800/40",
            landmark: "bg-amber-950/80 text-amber-300 border-amber-800/40",
            airport: "bg-violet-950/80 text-violet-300 border-violet-800/40",
            rail: "bg-teal-950/80 text-teal-300 border-teal-800/40",
            hospital: "bg-rose-950/80 text-rose-300 border-rose-800/40",
            category: "bg-emerald-950/80 text-emerald-300 border-emerald-800/40",
        };
        return map[type] || "bg-[#181818] text-neutral-400 border-[#282828]";
    };

    return (
        <div className="space-y-8 max-w-[1400px] text-neutral-100 animate-in fade-in duration-300 pb-16">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1f1f1f]">
                <div>
                    <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        <span>Delhi SEO Ecosystem Dashboard</span>
                    </h1>
                    <p className="text-xs text-neutral-400 font-semibold mt-1">
                        Inventory-gated indexability for all {rows.length} Delhi landing pages ({delhiHub().requiredInventory}+ rule).
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="px-5 py-2.5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>{loading ? "Refreshing..." : "Refresh Inventory"}</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-950/80 border border-red-800/50 rounded-2xl p-4 text-xs font-bold text-red-300">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] p-5 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live Delhi Hotels</p>
                    <p className="text-3xl font-black text-white">{hotels.length}</p>
                </div>
                <div className="bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] p-5 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Indexable Pages</p>
                    <p className="text-3xl font-black text-emerald-400">{indexableCount}</p>
                </div>
                <div className="bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] p-5 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Noindex (Awaiting Inventory)</p>
                    <p className="text-3xl font-black text-amber-400">{noindexCount}</p>
                </div>
                <div className="bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] p-5 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">Pages with Live From-Price</p>
                    <p className="text-3xl font-black text-sky-400">{priceReadyCount}</p>
                </div>
            </div>

            <div className="bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-[#0e0e0e] border-b border-[#1f1f1f] text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                                <th className="px-4 py-3 font-bold">Page</th>
                                <th className="px-4 py-3 font-bold">URL</th>
                                <th className="px-4 py-3 font-bold">Type</th>
                                <th className="px-4 py-3 font-bold">Priority</th>
                                <th className="px-4 py-3 font-bold">Inventory</th>
                                <th className="px-4 py-3 font-bold">Status</th>
                                <th className="px-4 py-3 font-bold">From Price</th>
                                <th className="px-4 py-3 font-bold">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#161616]">
                            {rows.map((row) => (
                                <tr key={row.slug || "hub"} className="hover:bg-[#121212] transition-colors align-top">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-white text-xs">{row.primaryKeyword}</p>
                                        <p className="text-[10px] text-neutral-500 font-medium max-w-[280px] truncate" title={row.title}>{row.title}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <a
                                            href={delhiPagePath("en", row.slug || undefined)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-400 hover:underline font-mono text-xs break-all"
                                        >
                                            {delhiPagePath("en", row.slug || undefined)}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${typeBadge(row.type)}`}>
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-neutral-300 font-bold">P{row.priority}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 font-mono text-xs">
                                            <span className={`font-black ${row.count >= row.requiredInventory ? "text-emerald-400" : "text-amber-400"}`}>
                                                {row.count}
                                            </span>
                                            <span className="text-neutral-500 font-semibold">/ {row.requiredInventory}</span>
                                        </div>
                                        {row.matched.length > 0 && (
                                            <details className="text-[10px] text-neutral-400 font-medium mt-1">
                                                <summary className="cursor-pointer text-emerald-400 hover:underline">hotels</summary>
                                                <ul className="mt-1 space-y-0.5 list-disc list-inside bg-[#141414] p-2 rounded-lg border border-[#222]">
                                                    {row.matched.map((h) => (
                                                        <li key={h.id} className="text-neutral-300">{h.name}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.indexable ? (
                                             <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                                                Indexable
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/40">
                                                Noindex
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.fromPrice !== null ? (
                                            <span className="font-mono font-bold text-white text-xs">from {formatInr(row.fromPrice)}</span>
                                        ) : (
                                            <span className="text-neutral-500 font-medium text-xs">no live price</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{row.lastUpdated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
