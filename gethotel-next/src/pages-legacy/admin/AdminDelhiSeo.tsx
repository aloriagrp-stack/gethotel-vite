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
            hub: "bg-indigo-100 text-indigo-700 border-indigo-200",
            area: "bg-sky-100 text-sky-700 border-sky-200",
            landmark: "bg-amber-100 text-amber-700 border-amber-200",
            airport: "bg-violet-100 text-violet-700 border-violet-200",
            rail: "bg-teal-100 text-teal-700 border-teal-200",
            hospital: "bg-rose-100 text-rose-700 border-rose-200",
            category: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
        return map[type] || "bg-slate-100 text-slate-700 border-slate-200";
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1400px]">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-950">Delhi SEO Ecosystem Dashboard</h1>
                    <p className="text-sm text-slate-500 font-semibold">
                        Inventory-gated indexability for all {rows.length} Delhi landing pages ({delhiHub().requiredInventory}+ rule).
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                    {loading ? "Refreshing..." : "Refresh Inventory"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm font-bold text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Live Delhi Hotels</p>
                    <p className="text-3xl font-black text-slate-950">{hotels.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Indexable Pages</p>
                    <p className="text-3xl font-black text-emerald-700">{indexableCount}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">Noindex (Awaiting Inventory)</p>
                    <p className="text-3xl font-black text-amber-700">{noindexCount}</p>
                </div>
                <div className="bg-sky-50 rounded-2xl border border-sky-200 p-5 space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-sky-600">Pages with Live From-Price</p>
                    <p className="text-3xl font-black text-sky-700">{priceReadyCount}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                                <th className="px-4 py-3 font-black">Page</th>
                                <th className="px-4 py-3 font-black">URL</th>
                                <th className="px-4 py-3 font-black">Type</th>
                                <th className="px-4 py-3 font-black">Priority</th>
                                <th className="px-4 py-3 font-black">Inventory</th>
                                <th className="px-4 py-3 font-black">Status</th>
                                <th className="px-4 py-3 font-black">From Price</th>
                                <th className="px-4 py-3 font-black">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.slug || "hub"} className="border-t border-slate-100 align-top">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-900">{row.primaryKeyword}</p>
                                        <p className="text-[11px] text-slate-400 font-semibold max-w-[280px] truncate" title={row.title}>{row.title}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <a
                                            href={delhiPagePath("en", row.slug || undefined)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-brand-600 hover:underline font-semibold text-xs break-all"
                                        >
                                            {delhiPagePath("en", row.slug || undefined)}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${typeBadge(row.type)}`}>
                                            {row.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-700">P{row.priority}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-black ${row.count >= row.requiredInventory ? "text-emerald-600" : "text-amber-600"}`}>
                                                {row.count}
                                            </span>
                                            <span className="text-slate-400 font-semibold">/ {row.requiredInventory}</span>
                                        </div>
                                        {row.matched.length > 0 && (
                                            <details className="text-[11px] text-slate-500 font-semibold mt-1">
                                                <summary className="cursor-pointer text-brand-600">hotels</summary>
                                                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                                                    {row.matched.map((h) => (
                                                        <li key={h.id}>{h.name}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.indexable ? (
                                            <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                Indexable
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                                Noindex
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.fromPrice !== null ? (
                                            <span className="font-bold text-slate-900">from {formatInr(row.fromPrice)}</span>
                                        ) : (
                                            <span className="text-slate-400 font-semibold text-xs">no live price</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 font-semibold">{row.lastUpdated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
