import React, { useState, useEffect } from 'react';
import { hotelImporterApi } from '../../lib/api';

interface ExportHotel {
    id: string;
    name: string;
    description: string;
    starRating: number;
    address: string;
    city: string;
    state: string;
    country: string;
    email: string;
    phone: string;
    coverImageUrl?: string;
    status: string;
    isAlreadyImported?: boolean;
    existingGhsId?: number | null;
    roomTypes?: any[];
    images?: any[];
    policies?: any[];
}

export const AdminHotelImporter: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [importing, setImporting] = useState(false);
    
    // Connection & Pairing State
    const [agentUrl, setAgentUrl] = useState('http://localhost:4000/api/export');
    const [pairingCode, setPairingCode] = useState('ghs-export-key-2024');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatusMsg, setConnectionStatusMsg] = useState('');

    const [stats, setStats] = useState<any>(null);
    const [hotels, setHotels] = useState<ExportHotel[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [sinceDate, setSinceDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Progress Modal State
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [progressLog, setProgressLog] = useState<string[]>([]);
    const [importResultSummary, setImportResultSummary] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [page, cityFilter, sinceDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const statsRes = await hotelImporterApi.getStats();
            if (statsRes.success) {
                setStats(statsRes);
                setIsConnected(statsRes.isConnected !== false);
                setAgentUrl(statsRes.agentUrl || agentUrl);
                setPairingCode(statsRes.pairingCode || pairingCode);
                setConnectionStatusMsg(statsRes.isConnected !== false ? 'Connected & Paired' : 'Exporter Agent Offline or Disconnected');
            } else {
                setIsConnected(false);
                setConnectionStatusMsg(statsRes.message || 'Agent Disconnected');
            }

            const hotelsRes = await hotelImporterApi.getHotels({
                page,
                limit: 25,
                city: cityFilter,
                since: sinceDate
            });

            if (hotelsRes.success) {
                setHotels(hotelsRes.hotels || []);
                setTotalPages(hotelsRes.totalPages || 1);
                setTotalCount(hotelsRes.total || (hotelsRes.hotels || []).length);
            } else {
                setHotels([]);
            }
        } catch (err: any) {
            setIsConnected(false);
            setConnectionStatusMsg('Agent Offline / Connection Error');
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPairing = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setConnectionStatusMsg('Testing connection & verifying pairing code...');

        try {
            const res = await hotelImporterApi.verifyPairing({
                agentUrl,
                pairingCode
            });

            if (res.success) {
                setIsConnected(true);
                setConnectionStatusMsg('🟢 Pairing Successful! Importer Connected.');
                setStats(res);
                loadData();
            } else {
                setIsConnected(false);
                setConnectionStatusMsg(`🔴 ${res.message}`);
            }
        } catch (err: any) {
            setIsConnected(false);
            setConnectionStatusMsg(`🔴 Pairing Failed: Invalid Code or Exporter Offline.`);
        } finally {
            setVerifying(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(hotels.map(h => h.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleToggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleImportSelected = async () => {
        if (selectedIds.size === 0) return;
        await runBatchImport(Array.from(selectedIds));
    };

    const handleImportAll = async () => {
        const allIds = hotels.map(h => h.id);
        if (allIds.length === 0) return;
        await runBatchImport(allIds);
    };

    const handleSingleImport = async (hotel: ExportHotel) => {
        await runBatchImport([hotel.id], [hotel]);
    };

    const handleSyncNewHotels = async () => {
        setSyncing(true);
        setProgressLog([`Initiating sync from Listing Agent (since: ${sinceDate || 'all'})...`]);
        setProgressModalOpen(true);
        setImportResultSummary(null);

        try {
            const res = await hotelImporterApi.syncHotels(sinceDate);
            if (res.success) {
                setProgressLog(prev => [
                    ...prev,
                    `Sync complete. Processed ${res.totalProcessed || 0} hotels (${res.importedCount || 0} imported, ${res.failedCount || 0} failed).`
                ]);
                setImportResultSummary(res);
                loadData();
            } else {
                setProgressLog(prev => [...prev, `Sync failed: ${res.message}`]);
            }
        } catch (err: any) {
            setProgressLog(prev => [...prev, `Sync error: ${err.message}`]);
        } finally {
            setSyncing(false);
        }
    };

    const runBatchImport = async (ids: string[], preloadedObjects?: ExportHotel[]) => {
        setImporting(true);
        setProgressModalOpen(true);
        setImportResultSummary(null);
        setProgressLog([
            `Starting import for ${ids.length} hotel(s)...`,
            `Downloading WebP images, creating room categories & saving to GHS database...`
        ]);

        try {
            const payload: any = { hotelIds: ids };
            if (preloadedObjects && preloadedObjects.length > 0) {
                payload.hotelsToImport = preloadedObjects;
            }

            const res = await hotelImporterApi.importHotels(payload);
            if (res.success) {
                setProgressLog(prev => [
                    ...prev,
                    `Import finished.`,
                    `Imported: ${res.importedCount} | Failed: ${res.failedCount}`
                ]);
                setImportResultSummary(res);
                setSelectedIds(new Set());
                loadData();
            } else {
                setProgressLog(prev => [...prev, `Import error: ${res.message}`]);
            }
        } catch (err: any) {
            setProgressLog(prev => [...prev, `Error: ${err.message}`]);
        } finally {
            setImporting(false);
        }
    };

    const filteredHotels = hotels.filter(h => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 md:p-10 font-sans select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        Hotel Agent Importer
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}>
                            {isConnected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
                        </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Pair Exporter Agent with Code to import scraped hotels, images and room categories into GHS database.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>

                    <button
                        onClick={handleSyncNewHotels}
                        disabled={syncing || !isConnected}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
                    >
                        {syncing ? 'Syncing...' : 'Sync New'}
                    </button>
                </div>
            </div>

            {/* Pairing Code Verification Box */}
            <form onSubmit={handleVerifyPairing} className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                        <div className="w-full md:w-1/2">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                Exporter Agent Base URL
                            </label>
                            <input
                                type="text"
                                value={agentUrl}
                                onChange={(e) => setAgentUrl(e.target.value)}
                                placeholder="http://localhost:4000/api/export"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="w-full md:w-1/2">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                Pairing Code / API Key
                            </label>
                            <input
                                type="text"
                                value={pairingCode}
                                onChange={(e) => setPairingCode(e.target.value)}
                                placeholder="ghs-export-key-2024"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={verifying}
                        className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shrink-0 self-end transition-all"
                    >
                        {verifying ? 'Verifying Code...' : 'Verify Pairing Code'}
                    </button>
                </div>

                {connectionStatusMsg && (
                    <div className={`mt-3 text-[11px] font-semibold ${
                        isConnected ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                        {connectionStatusMsg}
                    </div>
                )}
            </form>

            {/* Ultra Minimal Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[11px] text-slate-400 font-medium">Available on Agent</p>
                    <p className="text-xl font-bold text-white mt-1">
                        {stats?.agentStats?.totalHotels || stats?.agentStats?.total || totalCount || 0}
                    </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[11px] text-slate-400 font-medium">With Images</p>
                    <p className="text-xl font-bold text-white mt-1">
                        {stats?.agentStats?.withImages || totalCount || 0}
                    </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[11px] text-slate-400 font-medium">With Rooms</p>
                    <p className="text-xl font-bold text-white mt-1">
                        {stats?.agentStats?.withRooms || totalCount || 0}
                    </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[11px] text-slate-400 font-medium">Published in GHS</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">
                        {stats?.ghsStats?.totalHotelsInGhs || 0}
                    </p>
                </div>
            </div>

            {/* Minimal Filter Bar */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search hotel or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-700 min-w-[200px]"
                    />

                    <input
                        type="text"
                        placeholder="Filter city..."
                        value={cityFilter}
                        onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-700 min-w-[130px]"
                    />

                    <input
                        type="date"
                        value={sinceDate}
                        onChange={(e) => { setSinceDate(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-slate-700"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={handleImportSelected}
                        disabled={selectedIds.size === 0 || importing || !isConnected}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedIds.size > 0 && !importing && isConnected
                                ? "bg-blue-600 hover:bg-blue-500 text-white"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        Import Selected ({selectedIds.size})
                    </button>

                    <button
                        onClick={handleImportAll}
                        disabled={hotels.length === 0 || importing || !isConnected}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-40"
                    >
                        Import All ({hotels.length})
                    </button>
                </div>
            </div>

            {/* Minimal Preview Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 text-xs font-medium">
                        Checking pairing status & loading hotels...
                    </div>
                ) : !isConnected ? (
                    <div className="p-12 text-center text-amber-400/90 text-xs font-medium space-y-2">
                        <p className="text-sm font-bold text-white">Importer Disconnected from Listing Agent</p>
                        <p className="text-slate-400">Enter the Exporter Base URL & Pairing Code above and click <strong>Verify Pairing Code</strong> to connect.</p>
                    </div>
                ) : filteredHotels.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-medium">
                        No hotels available in agent export queue.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
                                    <th className="p-3 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size === hotels.length && hotels.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600"
                                        />
                                    </th>
                                    <th className="p-3">Hotel</th>
                                    <th className="p-3">City</th>
                                    <th className="p-3">Stars</th>
                                    <th className="p-3">Rooms</th>
                                    <th className="p-3">Photos</th>
                                    <th className="p-3">GHS Status</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs">
                                {filteredHotels.map((h) => {
                                    const isSelected = selectedIds.has(h.id);
                                    const roomCount = h.roomTypes ? h.roomTypes.length : 1;
                                    const imageCount = h.images ? h.images.length : 0;
                                    const coverUrl = h.coverImageUrl || (h.images && h.images.length > 0 ? h.images[0].url : null) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80";
                                    const fullCoverUrl = coverUrl.startsWith('/') ? `${agentUrl.replace(/\/api\/export\/?$/, '')}${coverUrl}` : coverUrl;

                                    return (
                                        <tr 
                                            key={h.id} 
                                            className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-blue-950/30' : ''}`}
                                        >
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(h.id)}
                                                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600"
                                                />
                                            </td>

                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={fullCoverUrl} 
                                                        alt={h.name} 
                                                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-800 shrink-0"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-white text-xs">{h.name}</p>
                                                        <p className="text-[10px] text-slate-500">{h.address || h.city}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-3 text-slate-300 font-medium">
                                                {h.city}
                                            </td>

                                            <td className="p-3 text-amber-400 font-semibold text-[11px]">
                                                {h.starRating || 4}★
                                            </td>

                                            <td className="p-3 text-slate-400">
                                                {roomCount} types
                                            </td>

                                            <td className="p-3 text-slate-400">
                                                {imageCount} photos
                                            </td>

                                            <td className="p-3">
                                                {h.isAlreadyImported ? (
                                                    <span className="text-[10px] text-emerald-400 font-semibold">
                                                        Imported {h.existingGhsId ? `#${h.existingGhsId}` : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500">
                                                        Ready
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleSingleImport(h)}
                                                    disabled={importing}
                                                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] border border-slate-700 transition-all"
                                                >
                                                    {h.isAlreadyImported ? 'Re-Sync' : 'Import'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Minimal Pagination */}
                {totalPages > 1 && (
                    <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <div>Page {page} of {totalPages} ({totalCount} hotels)</div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-2.5 py-1 rounded bg-slate-800 disabled:opacity-40 font-semibold"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-2.5 py-1 rounded bg-slate-800 disabled:opacity-40 font-semibold"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Minimal Progress Modal */}
            {progressModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full">
                        <h3 className="text-base font-bold text-white mb-2">
                            {importing || syncing ? 'Processing Pipeline...' : 'Completed'}
                        </h3>

                        <div className="bg-black/80 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-emerald-400 max-h-48 overflow-y-auto space-y-1.5 mb-5">
                            {progressLog.map((log, idx) => (
                                <div key={idx}>&gt; {log}</div>
                            ))}
                        </div>

                        {importResultSummary && (
                            <div className="flex items-center gap-4 text-xs font-semibold mb-5 text-slate-300">
                                <span>Imported: <strong className="text-emerald-400">{importResultSummary.importedCount || 0}</strong></span>
                                <span>Failed: <strong className="text-rose-400">{importResultSummary.failedCount || 0}</strong></span>
                                <span>Total: <strong className="text-blue-400">{importResultSummary.totalProcessed || 0}</strong></span>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setProgressModalOpen(false)}
                                disabled={importing || syncing}
                                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
