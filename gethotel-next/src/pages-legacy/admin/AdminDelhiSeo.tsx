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
            hub: "bg-indigo-50 text-indigo-700 border-indigo-200",
            area: "bg-sky-50 text-sky-700 border-sky-200",
            landmark: "bg-amber-50 text-amber-700 border-amber-200",
            airport: "bg-purple-50 text-purple-700 border-purple-200",
            rail: "bg-teal-50 text-teal-700 border-teal-200",
            hospital: "bg-rose-50 text-rose-700 border-rose-200",
            category: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
        return map[type] || "bg-slate-100 text-slate-600 border-slate-200";
    };

    return (
        <div className="space-y-6 max-w-[1400px] text-slate-800 animate-in fade-in duration-300 pb-16">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-600" />
                        <span>Delhi SEO Ecosystem Dashboard</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Inventory-gated indexability for all {rows.length} Delhi landing pages ({delhiHub().requiredInventory}+ rule).
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>{loading ? "Refreshing..." : "Refresh Inventory"}</span>
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-bold text-rose-800 shadow-2xs">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Delhi Hotels</p>
                    <p className="text-3xl font-black text-slate-900">{hotels.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Indexable Pages</p>
                    <p className="text-3xl font-black text-emerald-600">{indexableCount}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Noindex (Awaiting Inventory)</p>
                    <p className="text-3xl font-black text-amber-600">{noindexCount}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Pages with Live From-Price</p>
                    <p className="text-3xl font-black text-blue-600">{priceReadyCount}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-4 py-3">Page</th>
                                <th className="px-4 py-3">URL</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Inventory</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">From Price</th>
                                <th className="px-4 py-3">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {rows.map((row) => (
                                <tr key={row.slug || "hub"} className="hover:bg-slate-50/70 transition-colors align-top">
                                    <td className="px-4 py-3.5">
                                        <p className="font-bold text-slate-900 text-xs">{row.primaryKeyword}</p>
                                        <p className="text-[10px] text-slate-500 font-medium max-w-[280px] truncate" title={row.title}>{row.title}</p>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <a
                                            href={delhiPagePath("en", row.slug || undefined)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline font-mono text-xs break-all"
                                        >
                                            {delhiPagePath("en", row.slug || undefined)}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border shadow-2xs ${typeBadge(row.type)}`}>
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700 font-bold">P{row.priority}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5 font-mono text-xs">
                                            <span className={`font-black ${row.count >= row.requiredInventory ? "text-emerald-600" : "text-amber-600"}`}>
                                                {row.count}
                                            </span>
                                            <span className="text-slate-400 font-semibold">/ {row.requiredInventory}</span>
                                        </div>
                                        {row.matched.length > 0 && (
                                            <details className="text-[10px] text-slate-500 font-medium mt-1">
                                                <summary className="cursor-pointer text-emerald-600 hover:underline">hotels</summary>
                                                <ul className="mt-1 space-y-0.5 list-disc list-inside bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                    {row.matched.map((h) => (
                                                        <li key={h.id} className="text-slate-700">{h.name}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {row.indexable ? (
                                             <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                                Indexable
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                                                Noindex
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {row.fromPrice !== null ? (
                                            <span className="font-mono font-bold text-slate-900 text-xs">from {formatInr(row.fromPrice)}</span>
                                        ) : (
                                            <span className="text-slate-400 font-medium text-xs">no live price</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{row.lastUpdated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
