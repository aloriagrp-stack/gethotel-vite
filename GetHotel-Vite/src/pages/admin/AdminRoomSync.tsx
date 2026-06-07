import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { 
    Search, Hotel, User, Mail, Link, AlertTriangle, 
    RefreshCw, Layers, ExternalLink, ShieldCheck, CheckCircle, 
    PlusCircle, Info, Loader2, ArrowRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelRoomOverview {
    id: number;
    name: string;
    city: string;
    address: string;
    pricePerNight: number;
    roomCount: number;
    rooms: Array<{
        id: number;
        name: string;
        pricePerNight: number;
        maxOccupancy: number;
        sizeM2: number | null;
    }>;
    owner: {
        id: number;
        name: string;
        email: string;
    } | null;
    groupHotels: Array<{
        id: number;
        name: string;
        city: string;
    }>;
}

export default function AdminRoomSync() {
    const [hotels, setHotels] = useState<HotelRoomOverview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedHotel, setSelectedHotel] = useState<HotelRoomOverview | null>(null);
    const [otaUrls, setOtaUrls] = useState<string[]>([""]);
    const [syncing, setSyncing] = useState(false);
    const [syncLog, setSyncLog] = useState<{ type: "success" | "error" | "info" | null; message: string }>({ type: null, message: "" });
    const [filterZeroRooms, setFilterZeroRooms] = useState(false);
    const [syncMode, setSyncMode] = useState<"full" | "rooms">("full");
    const [syncGroup, setSyncGroup] = useState<boolean>(false);

    useEffect(() => {
        setSyncGroup(false);
        setSyncMode("full");
        setSyncLog({ type: null, message: "" });
    }, [selectedHotel?.id]);

    const fetchData = async (selectId?: number) => {
        setLoading(true);
        try {
            const res = await adminApi.getRoomsOverview();
            if (res.success && Array.isArray(res.data)) {
                setHotels(res.data);
                
                // If we want to preserve or update the selected hotel
                if (selectId) {
                    const updatedSelected = res.data.find((h: HotelRoomOverview) => h.id === selectId);
                    if (updatedSelected) setSelectedHotel(updatedSelected);
                } else if (res.data.length > 0 && !selectedHotel) {
                    setSelectedHotel(res.data[0]);
                }
            }
        } catch (err: any) {
            console.error("Failed to fetch rooms overview:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImport = async () => {
        if (!selectedHotel) return;
        
        const activeUrls = otaUrls.map(u => u.trim()).filter(Boolean);
        if (activeUrls.length === 0) {
            setSyncLog({ type: "error", message: "Please paste at least one valid OTA URL." });
            return;
        }

        setSyncing(true);
        setSyncLog({ 
            type: "info", 
            message: syncGroup 
                ? `Import starting... Syncing and comparing ${activeUrls.length} platform profiles across all linked group hotels...` 
                : `Import starting... Syncing and comparing ${activeUrls.length} platform profiles...` 
        });

        try {
            const res = await adminApi.importOtaRooms({
                hotelId: selectedHotel.id,
                otaUrls: activeUrls,
                syncMode,
                syncGroup
            });

            if (res.success) {
                setSyncLog({
                    type: "success",
                    message: res.message || "Import and sync completed successfully! Hotel profile and room categories updated."
                });
                setOtaUrls([""]);
                // Refresh overview to update counts and details
                await fetchData(selectedHotel.id);
            } else {
                setSyncLog({
                    type: "error",
                    message: res.message || "Failed to sync profiles. Make sure the URLs are correct."
                });
            }
        } catch (err: any) {
            setSyncLog({
                type: "error",
                message: err.message || "An unexpected error occurred during sync."
            });
        } finally {
            setSyncing(false);
        }
    };

    // Filter hotels
    const filteredHotels = hotels.filter(h => {
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             h.owner?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             h.owner?.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (filterZeroRooms) {
            return matchesSearch && h.roomCount === 0;
        }
        return matchesSearch;
    });

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] animate-in fade-in duration-300">
            {/* Left side - Hotel List */}
            <div className="w-full lg:w-[40%] bg-white border border-slate-200 shadow-sm flex flex-col rounded-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">OTA Room Sync Directory</h3>
                    
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search properties, owners..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 font-medium text-xs shadow-sm transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="zeroRooms"
                            checked={filterZeroRooms}
                            onChange={e => setFilterZeroRooms(e.target.checked)}
                            className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded-sm focus:ring-brand-500 cursor-pointer"
                        />
                        <label htmlFor="zeroRooms" className="text-[10px] font-bold text-slate-600 uppercase tracking-wider select-none cursor-pointer">
                            Show Hotels with 0 Rooms only
                        </label>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-slate-100">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Hotels...</p>
                        </div>
                    ) : filteredHotels.length === 0 ? (
                        <div className="py-20 text-center">
                            <Hotel className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No properties found</p>
                        </div>
                    ) : (
                        filteredHotels.map(h => (
                            <div
                                key={h.id}
                                onClick={() => {
                                    setSelectedHotel(h);
                                    setSyncLog({ type: null, message: "" });
                                }}
                                className={cn(
                                    "p-4 cursor-pointer flex items-center justify-between transition-all border-l-2 hover:bg-slate-50",
                                    selectedHotel?.id === h.id 
                                        ? "bg-slate-50 border-brand-600" 
                                        : "border-transparent"
                                )}
                            >
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{h.name}</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{h.city}</p>
                                    {h.owner && (
                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                                            Owner: {h.owner.name} ({h.owner.email})
                                        </p>
                                    )}
                                </div>

                                <div className="text-right pl-3 shrink-0">
                                    {h.roomCount === 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-red-50 border border-red-100 text-red-700 text-[8px] font-black uppercase tracking-widest shadow-sm">
                                            <AlertTriangle className="w-2.5 h-2.5" /> No Rooms
                                        </span>
                                    ) : (
                                        <span className="inline-flex px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest shadow-sm">
                                            {h.roomCount} {h.roomCount === 1 ? 'Room' : 'Rooms'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right side - Selected Hotel Details & Scraper UI */}
            <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-sm p-6 flex flex-col justify-between">
                {selectedHotel ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest bg-brand-50 text-brand-700 border border-brand-100 mb-2">
                                    Hotel ID: #{selectedHotel.id}
                                </span>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">{selectedHotel.name}</h2>
                                <p className="text-xs text-slate-500 font-medium">{selectedHotel.address}, {selectedHotel.city}</p>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Base Room Price</p>
                                <p className="text-lg font-black text-slate-900">₹{selectedHotel.pricePerNight.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Owner & Group Login Linking Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Owner */}
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-400" /> Owner / Admin Details
                                </h4>
                                {selectedHotel.owner ? (
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-800">{selectedHotel.owner.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-slate-400" /> {selectedHotel.owner.email}
                                        </p>
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase tracking-widest mt-1">
                                            <ShieldCheck className="w-2.5 h-2.5" /> Registered Admin
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No assigned owner</p>
                                )}
                            </div>

                            {/* Group Logins */}
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Linked Group Hotels (Owner)
                                </h4>
                                {selectedHotel.groupHotels && selectedHotel.groupHotels.length > 0 ? (
                                    <div className="space-y-2 max-h-[85px] overflow-y-auto">
                                        {selectedHotel.groupHotels.map(gh => (
                                            <div 
                                                key={gh.id} 
                                                onClick={() => {
                                                    const match = hotels.find(h => h.id === gh.id);
                                                    if (match) setSelectedHotel(match);
                                                }}
                                                className="p-2 bg-white border border-slate-200/60 rounded-sm hover:border-slate-400 cursor-pointer flex items-center justify-between text-[11px] font-bold text-slate-700 transition-colors"
                                            >
                                                <span className="truncate pr-2">{gh.name}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                                                    {gh.city} <ArrowRight className="w-2.5 h-2.5" />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic pt-1">This partner only manages this property.</p>
                                )}
                            </div>
                        </div>

                        {/* Existing Rooms list */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                Current Room Categories ({selectedHotel.roomCount})
                            </h4>
                            {selectedHotel.rooms && selectedHotel.rooms.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto pr-1">
                                    {selectedHotel.rooms.map(room => (
                                        <div key={room.id} className="p-3 border border-slate-200 rounded-sm flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{room.name}</p>
                                                <p className="text-[9px] text-slate-400 font-medium">
                                                    Max Guests: {room.maxOccupancy} • Size: {room.sizeM2 ? room.sizeM2 + ' m²' : '—'}
                                                </p>
                                            </div>
                                            <div className="text-right pl-2 shrink-0">
                                                <p className="text-xs font-black text-slate-900">₹{room.pricePerNight.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 border border-dashed border-red-200 bg-red-50/20 rounded-sm flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">No rooms configured yet</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Auto-import rooms below or add manually in Partner Dashboard.</p>
                                    </div>
                                </div>
                            )}
                                               {/* Scraper / Auto-Import section */}
                        <div className="p-5 border border-slate-200 rounded-sm space-y-4">
                            <div>
                                <h4 className="text-xs font-black text-slate-955 uppercase tracking-wide flex items-center gap-1.5">
                                    <Link className="w-4 h-4 text-brand-600" /> Multi-OTA Profile & Room Sync
                                </h4>
                                <p className="text-[11px] text-slate-500 font-medium mt-1">
                                    Paste up to 4 hotel page links from Booking.com, Agoda, MakeMyTrip, or Expedia. The sync engine will scrape all profiles, compare and download details/photos locally, and automatically configure the hotel and rooms.
                                </p>
                            </div>
 
                            <div className="space-y-3">
                                {otaUrls.map((url, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="url"
                                            placeholder={`Paste OTA URL #${index + 1} (Booking.com, Agoda, MakeMyTrip, Expedia...)`}
                                            value={url}
                                            onChange={e => {
                                                const updated = [...otaUrls];
                                                updated[index] = e.target.value;
                                                setOtaUrls(updated);
                                            }}
                                            disabled={syncing}
                                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400 font-medium text-xs disabled:opacity-50"
                                        />
                                        {otaUrls.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = otaUrls.filter((_, i) => i !== index);
                                                    setOtaUrls(updated);
                                                }}
                                                disabled={syncing}
                                                className="p-2.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-sm transition-all shrink-0 cursor-pointer disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Sync Mode configuration */}
                                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sync Configuration Mode</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSyncMode("full")}
                                            disabled={syncing}
                                            className={cn(
                                                "p-3 border text-left rounded-sm transition-all flex flex-col gap-1 cursor-pointer disabled:opacity-60",
                                                syncMode === "full" 
                                                    ? "border-brand-600 bg-brand-50/20 shadow-sm" 
                                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                            )}
                                        >
                                            <span className="text-xs font-bold text-slate-900">Full Profile Autofill</span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                Autofills metadata, address, photos, policies, amenities, FAQs & rooms.
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSyncMode("rooms")}
                                            disabled={syncing}
                                            className={cn(
                                                "p-3 border text-left rounded-sm transition-all flex flex-col gap-1 cursor-pointer disabled:opacity-60",
                                                syncMode === "rooms" 
                                                    ? "border-brand-600 bg-brand-50/20 shadow-sm" 
                                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                            )}
                                        >
                                            <span className="text-xs font-bold text-slate-900">Rooms Only Sync</span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                Only syncs room categories and sizes. Existing profile information is untouched.
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Group sync option if multiple group hotels exist */}
                                {selectedHotel.groupHotels && selectedHotel.groupHotels.length > 0 && (
                                    <div className="p-3 bg-amber-50/30 border border-amber-200/60 rounded-sm space-y-2">
                                        <div className="flex items-start gap-2.5">
                                            <input
                                                type="checkbox"
                                                id="syncGroupHotels"
                                                checked={syncGroup}
                                                onChange={e => setSyncGroup(e.target.checked)}
                                                disabled={syncing}
                                                className="mt-0.5 w-3.5 h-3.5 text-brand-600 border-slate-300 rounded-sm focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="syncGroupHotels" className="text-xs font-bold text-slate-800 select-none cursor-pointer disabled:opacity-50">
                                                    Apply Sync to All Linked Group Hotels ({selectedHotel.groupHotels.length})
                                                </label>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                    Sync settings will apply to this property and all linked group hotels managed by this owner.
                                                </p>
                                            </div>
                                        </div>
                                        {syncGroup && (
                                            <div className="pl-6 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                Warning: This will sync and update all group hotels in one click!
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-2">
                                    {otaUrls.length < 4 ? (
                                        <button
                                            type="button"
                                            onClick={() => setOtaUrls([...otaUrls, ""])}
                                            disabled={syncing}
                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 disabled:opacity-50 cursor-pointer"
                                        >
                                            <PlusCircle className="w-4 h-4" /> Add Another Link
                                        </button>
                                    ) : (
                                        <div />
                                    )}
 
                                    <button
                                        onClick={handleImport}
                                        disabled={syncing || otaUrls.every(u => !u.trim())}
                                        className="px-6 py-2.5 bg-slate-900 text-white hover:bg-black text-[10px] font-black uppercase tracking-widest rounded-sm transition-all shadow-md hover:shadow-lg shadow-slate-100 disabled:opacity-50 shrink-0 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                                    >
                                        {syncing ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5" /> Start Auto-Sync
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>   </div>

                            {/* Logs Display */}
                            {syncLog.type && (
                                <div className={cn(
                                    "p-3 rounded-sm text-xs font-medium border flex items-start gap-2.5",
                                    syncLog.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                                    syncLog.type === "error" ? "bg-red-50 border-red-100 text-red-800" :
                                    "bg-blue-50 border-blue-100 text-blue-800"
                                )}>
                                    {syncLog.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                                    {syncLog.type === "error" && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                                    {syncLog.type === "info" && <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0 mt-0.5" />}
                                    <span className="leading-relaxed">{syncLog.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-40 text-center space-y-3">
                        <Hotel className="w-12 h-12 text-slate-200 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select a hotel to start syncing</h3>
                    </div>
                )}

                <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-300" />
                    Note: Newly imported room prices are set to the property baseline. Change prices or configure details in Manage Rooms.
                </div>
            </div>
        </div>
    );
}
