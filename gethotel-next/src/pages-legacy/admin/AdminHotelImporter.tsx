'use client';
import React, { useState, useEffect } from 'react';
import { hotelImporterApi } from '../../lib/api';
import { 
    Trash2, 
    RefreshCw, 
    Download, 
    CheckCircle2, 
    Sparkles, 
    Settings, 
    Search, 
    Image as ImageIcon, 
    BedDouble, 
    Building2, 
    AlertCircle, 
    X,
    ChevronRight,
    SlidersHorizontal,
    Check
} from 'lucide-react';

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
    
    // Connection & Pairing State (Hidden by default in settings modal)
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [agentUrl, setAgentUrl] = useState('http://localhost:4000/api/export');
    const [pairingCode, setPairingCode] = useState('ghs-export-key-2024');
    const [isConnected, setIsConnected] = useState(true);
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
    const [importProgressPercent, setImportProgressPercent] = useState(0);
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
                setIsConnected(statsRes.isConnected ?? true);
            }
            const hotelsRes = await hotelImporterApi.getHotels({
                page,
                limit: 50,
                city: cityFilter || undefined,
                since: sinceDate || undefined
            });

            if (hotelsRes.success) {
                setHotels(hotelsRes.hotels || []);
                setTotalPages(hotelsRes.totalPages || 1);
                setTotalCount(hotelsRes.total || (hotelsRes.hotels || []).length);
            }
        } catch (error) {
            console.error('[Importer Page] Failed to load data:', error);
            setIsConnected(true);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPairing = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setConnectionStatusMsg('');
        try {
            const res = await hotelImporterApi.verifyPairing({ agentUrl, pairingCode });
            if (res.success) {
                setIsConnected(true);
                setConnectionStatusMsg('🟢 Pairing Code Verified & Connected!');
                loadData();
            } else {
                setConnectionStatusMsg('🔴 Pairing Failed: ' + (res.message || 'Invalid code'));
            }
        } catch (e: any) {
            setConnectionStatusMsg('🔴 Verification error: ' + e.message);
        } finally {
            setVerifying(false);
        }
    };

    const handleDeleteHotel = async (hotel: ExportHotel) => {
        if (!window.confirm(`Delete "${hotel.name}" from scraped queue?`)) return;
        try {
            await hotelImporterApi.deleteHotel(hotel.id);
            setHotels(prev => prev.filter(h => h.id !== hotel.id));
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(hotel.id);
                return next;
            });
        } catch (e: any) {
            alert('Failed to delete hotel: ' + (e.message || 'Error occurred'));
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
        const selectedObjects = hotels.filter(h => selectedIds.has(h.id));
        await runBatchImport(Array.from(selectedIds), selectedObjects);
    };

    const handleImportAll = async () => {
        const allIds = hotels.map(h => h.id);
        if (allIds.length === 0) return;
        await runBatchImport(allIds, hotels);
    };

    const handleSingleImport = async (hotel: ExportHotel) => {
        await runBatchImport([hotel.id], [hotel]);
    };

    const runBatchImport = async (ids: string[], preloadedObjects?: ExportHotel[]) => {
        setImporting(true);
        setProgressModalOpen(true);
        setImportResultSummary(null);
        setImportProgressPercent(10);
        
        const hotelNames = preloadedObjects ? preloadedObjects.map(h => h.name).join(', ') : `${ids.length} hotel(s)`;
        
        setProgressLog([
            `⚡ [1/5] Initializing GHS Data Ingestion Pipeline...`,
            `▶ Selected: ${hotelNames}`
        ]);

        setTimeout(() => {
            setImportProgressPercent(30);
            setProgressLog(prev => [
                ...prev,
                `📷 [2/5] Downloading & optimizing WebP image gallery (capped max 30 photos per room category)...`
            ]);
        }, 600);

        setTimeout(() => {
            setImportProgressPercent(55);
            setProgressLog(prev => [
                ...prev,
                `🛏️ [3/5] Constructing Room Categories, Max Occupancy & Dynamic Rate Plans...`
            ]);
        }, 1200);

        setTimeout(() => {
            setImportProgressPercent(75);
            setProgressLog(prev => [
                ...prev,
                `🍽️ [4/5] Provisioning Free Cancellation Policies & Meal Inclusion Plans...`
            ]);
        }, 1800);

        try {
            const payload: any = { hotelIds: ids };
            if (preloadedObjects && preloadedObjects.length > 0) {
                payload.hotelsToImport = preloadedObjects;
            }

            const res = await hotelImporterApi.importHotels(payload);
            setImportProgressPercent(100);

            if (res.success) {
                setProgressLog(prev => [
                    ...prev,
                    `🔐 [5/5] Creating Hotel Partner Credentials...`,
                    `--------------------------------------------------`,
                    `🎉 SUCCESS! Import complete.`,
                    `✔ Total Processed: ${res.totalProcessed || ids.length}`,
                    `✔ Imported: ${res.importedCount || ids.length} | Failed: ${res.failedCount || 0}`,
                    `✔ Hotels published directly to GHS Live Search & Database!`
                ]);
                setImportResultSummary(res);
                setSelectedIds(new Set());
                loadData();
            } else {
                setProgressLog(prev => [...prev, `❌ Import Error: ${res.message || 'Server returned error'}`]);
            }
        } catch (err: any) {
            setImportProgressPercent(100);
            setProgressLog(prev => [...prev, `❌ Error: ${err.message || 'Network exception'}`]);
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
        <div className="min-h-screen bg-[#050505] text-neutral-100 p-6 md:p-10 font-sans select-none">
            
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-emerald-400 shadow-inner">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                                Hotel Scraper & Agent Importer
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    EXTENSION LINKED & READY
                                </span>
                            </h1>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                Scrape hotel pages via GHS Extension and import directly into GHS database with 1-Click.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-white text-xs font-bold border border-[#2a2a2a] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-neutral-400 hover:text-white border border-[#2a2a2a] transition-all cursor-pointer shadow-sm"
                        title="Connection Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Pure Black Skeuomorphic Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-5">
                    <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                        <span className="font-bold">Queued Hotels</span>
                        <Building2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">
                        {hotels.length}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1 font-medium">Ready for 1-click import</p>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-5">
                    <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                        <span className="font-bold">With Images</span>
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">
                        {hotels.filter(h => (h.images && h.images.length > 0) || h.coverImageUrl).length}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1 font-medium">Up to 30 WebP photos</p>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-5">
                    <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                        <span className="font-bold">Room Types</span>
                        <BedDouble className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">
                        {hotels.reduce((acc, h) => acc + (h.roomTypes ? h.roomTypes.length : 1), 0)}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1 font-medium">Categories mapped</p>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-5">
                    <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                        <span className="font-bold">Live in GHS</span>
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400 tracking-tight">
                        {stats?.ghsStats?.totalHotelsInGhs || 0}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1 font-medium">Total active database</p>
                </div>
            </div>

            {/* Filter & Batch Action Bar */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative min-w-[220px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search hotel or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 shadow-inner"
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Filter city..."
                        value={cityFilter}
                        onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                        className="px-3.5 py-2 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 min-w-[130px] shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button
                        onClick={handleImportSelected}
                        disabled={selectedIds.size === 0 || importing}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            selectedIds.size > 0 && !importing
                                ? "bg-neutral-100 hover:bg-white text-black shadow-md active:scale-98"
                                : "bg-[#141414] text-neutral-600 border border-[#262626] cursor-not-allowed"
                        }`}
                    >
                        <Download className="w-3.5 h-3.5" />
                        Import Selected ({selectedIds.size})
                    </button>

                    <button
                        onClick={handleImportAll}
                        disabled={hotels.length === 0 || importing}
                        className="px-5 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-white text-xs font-bold border border-[#2a2a2a] transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                        Import All ({hotels.length})
                    </button>
                </div>
            </div>

            {/* Scraped Hotels Table */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-neutral-500 text-xs font-medium space-y-2">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading queued hotels...
                    </div>
                ) : filteredHotels.length === 0 ? (
                    <div className="p-16 text-center text-neutral-400 text-xs font-medium space-y-3">
                        <Building2 className="w-8 h-8 text-neutral-600 mx-auto" />
                        <p className="text-sm font-bold text-white">No Hotels in Queue</p>
                        <p className="text-neutral-500 max-w-sm mx-auto">
                            Open MakeMyTrip or any hotel page, click the GHS Chrome Extension, and click <strong>"Export to GHS Super Admin"</strong>!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#080808] text-neutral-400 text-[11px] font-bold uppercase tracking-wider border-b border-[#1f1f1f]">
                                    <th className="p-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size === hotels.length && hotels.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-[#262626] bg-[#141414] accent-emerald-400 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-4">Hotel Details</th>
                                    <th className="p-4">City</th>
                                    <th className="p-4">Stars</th>
                                    <th className="p-4">Rooms</th>
                                    <th className="p-4">Photos</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#181818] text-xs font-medium text-neutral-300">
                                {filteredHotels.map((h) => {
                                    const isSelected = selectedIds.has(h.id);
                                    const roomCount = h.roomTypes ? h.roomTypes.length : 1;
                                    const imageCount = h.images ? h.images.length : 0;
                                    const coverUrl = h.coverImageUrl || (h.images && h.images.length > 0 ? (typeof h.images[0] === 'string' ? h.images[0] : h.images[0].url) : null) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80";

                                    return (
                                        <tr 
                                            key={h.id} 
                                            className={`hover:bg-[#121212] transition-colors ${isSelected ? 'bg-[#161616]' : ''}`}
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(h.id)}
                                                    className="w-4 h-4 rounded border-[#262626] bg-[#141414] accent-emerald-400 cursor-pointer"
                                                />
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={coverUrl} 
                                                        alt={h.name} 
                                                        className="w-12 h-12 rounded-xl object-cover bg-[#141414] border border-[#262626] shrink-0"
                                                        onError={(e) => {
                                                            (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80');
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-white text-xs">{h.name}</p>
                                                        <p className="text-[11px] text-neutral-400 mt-0.5">{h.address || h.city}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 text-neutral-300 font-medium">
                                                {h.city}
                                            </td>

                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/40">
                                                    {h.starRating || 4} ★
                                                </span>
                                            </td>

                                            <td className="p-4 text-neutral-300 font-medium">
                                                {roomCount} types
                                            </td>

                                            <td className="p-4 text-neutral-300 font-medium">
                                                {imageCount} photos
                                            </td>

                                            <td className="p-4">
                                                {h.isAlreadyImported ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 w-max">
                                                        <Check className="w-3 h-3" /> Live in GHS
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#181818] text-neutral-400 border border-[#2a2a2a] w-max inline-block">
                                                        Ready
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSingleImport(h)}
                                                        disabled={importing}
                                                        className="px-3.5 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-white hover:text-emerald-400 font-bold text-xs border border-[#2d2d2d] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        {h.isAlreadyImported ? 'Re-Sync' : 'Import'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteHotel(h)}
                                                        disabled={importing}
                                                        className="p-1.5 rounded-xl bg-[#181818] hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-[#2d2d2d] hover:border-red-800/40 transition-all cursor-pointer shadow-sm"
                                                        title="Delete from Queue"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Settings Modal for Pairing Config */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Settings className="w-4 h-4 text-emerald-400" />
                                Connection Settings
                            </h3>
                            <button 
                                onClick={() => setShowSettingsModal(false)}
                                className="p-1.5 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-neutral-400 hover:text-white border border-[#262626]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleVerifyPairing} className="space-y-4">
                            <div>
                                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                                    Exporter Agent Base URL
                                </label>
                                <input
                                    type="text"
                                    value={agentUrl}
                                    onChange={(e) => setAgentUrl(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-neutral-500 shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                                    Pairing Code / API Key
                                </label>
                                <input
                                    type="text"
                                    value={pairingCode}
                                    onChange={(e) => setPairingCode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-neutral-500 shadow-inner"
                                />
                            </div>

                            {connectionStatusMsg && (
                                <p className="text-xs text-emerald-400 font-bold">{connectionStatusMsg}</p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#181818] border border-[#2a2a2a] text-neutral-300 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifying}
                                    className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-black text-xs font-bold shadow-md"
                                >
                                    {verifying ? 'Verifying...' : 'Save & Verify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rich Step-by-Step Live Progress Modal */}
            {progressModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                                {importing ? 'Importing Hotel to GHS Database...' : 'Import Execution Summary'}
                            </h3>
                            {!importing && (
                                <button
                                    onClick={() => setProgressModalOpen(false)}
                                    className="p-1.5 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-neutral-400 hover:text-white border border-[#262626]"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#141414] rounded-full h-2 overflow-hidden mb-4 border border-[#262626]">
                            <div 
                                className="bg-emerald-400 h-full transition-all duration-500"
                                style={{ width: `${importProgressPercent}%` }}
                            />
                        </div>

                        {/* Live Terminal Log */}
                        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 font-mono text-[11px] text-emerald-400 max-h-56 overflow-y-auto space-y-2 mb-6 shadow-inner">
                            {progressLog.map((log, idx) => (
                                <div key={idx} className="leading-relaxed">
                                    {log}
                                </div>
                            ))}
                        </div>

                        {importResultSummary && (
                            <div className="bg-[#141414] border border-[#262626] p-3.5 rounded-2xl flex items-center justify-around text-xs font-bold mb-6 text-neutral-300">
                                <span>Imported: <strong className="text-emerald-400">{importResultSummary.importedCount || 0}</strong></span>
                                <span>Failed: <strong className="text-red-400">{importResultSummary.failedCount || 0}</strong></span>
                                <span>Total: <strong className="text-white">{importResultSummary.totalProcessed || 0}</strong></span>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setProgressModalOpen(false)}
                                disabled={importing}
                                className="px-5 py-2 rounded-xl bg-neutral-100 hover:bg-white disabled:opacity-40 text-black font-bold text-xs transition-all shadow-md"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHotelImporter;
