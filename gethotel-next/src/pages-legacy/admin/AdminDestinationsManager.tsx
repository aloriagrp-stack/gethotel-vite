'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
    MapPin,
    Plus,
    Trash2,
    Save,
    Image as ImageIcon,
    Check,
    Search,
    X,
    Hotel,
    Loader2,
    Link as LinkIcon,
    Sparkles,
    Eye,
    ChevronRight,
    ArrowUpDown,
} from "lucide-react";
import { adminApi, homepageApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import AppleEmoji from "@/components/common/AppleEmoji";

interface DestinationItem {
    name: string;
    flag?: string;
    tagline?: string;
    properties?: string;
    image: string;
    url?: string;
    linkedHotelIds?: number[];
}

const DEFAULT_DESTINATIONS: DestinationItem[] = [
    {
        name: "Indonesia",
        flag: "🇮🇩",
        tagline: "1,345+ Verified Stays",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop",
        properties: "1,345+ Verified Stays",
        url: "/hotels?city=Indonesia",
        linkedHotelIds: [],
    },
    {
        name: "Goa",
        flag: "🌴",
        tagline: "1,240+ Verified Stays",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
        properties: "1,240+ Verified Stays",
        url: "/goa-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Delhi",
        flag: "🇮🇳",
        tagline: "2,100+ Verified Stays",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop",
        properties: "2,100+ Verified Stays",
        url: "/delhi-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Jaipur",
        flag: "🏰",
        tagline: "540+ Verified Stays",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        properties: "540+ Verified Stays",
        url: "/jaipur-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Manali",
        flag: "🏔️",
        tagline: "460+ Verified Stays",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop",
        properties: "460+ Verified Stays",
        url: "/manali-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Udaipur",
        flag: "🛶",
        tagline: "380+ Verified Stays",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop",
        properties: "380+ Verified Stays",
        url: "/udaipur-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Shimla",
        flag: "🌲",
        tagline: "420+ Verified Stays",
        image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800&auto=format&fit=crop",
        properties: "420+ Verified Stays",
        url: "/shimla-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Kerala",
        flag: "⛵",
        tagline: "850+ Verified Stays",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
        properties: "850+ Verified Stays",
        url: "/hotels?city=Kerala",
        linkedHotelIds: [],
    },
];

export default function AdminDestinationsManager() {
    const [destinations, setDestinations] = useState<DestinationItem[]>(DEFAULT_DESTINATIONS);
    const [availableHotels, setAvailableHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Modal state for linking properties to a specific destination
    const [assignTargetIndex, setAssignTargetIndex] = useState<number | null>(null);
    const [hotelSearch, setHotelSearch] = useState("");
    const [selectedCityFilter, setSelectedCityFilter] = useState("All");

    // Load existing homepage configuration and full hotel inventory
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [configRes, hotelsRes] = await Promise.all([
                    homepageApi.getConfig(),
                    adminApi.getHotels(),
                ]);

                if (configRes.success && configRes.data?.destinations?.length > 0) {
                    setDestinations(configRes.data.destinations);
                }

                if (hotelsRes.success && Array.isArray(hotelsRes.data)) {
                    setAvailableHotels(hotelsRes.data);
                }
            } catch (err) {
                console.error("Error loading destinations manager data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Save destinations configuration to backend
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await adminApi.updateHomepageConfig({ destinations });
            if (res.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            } else {
                alert("Failed to save destinations. Please try again.");
            }
        } catch (err) {
            console.error("Failed to save destinations:", err);
            alert("Error saving destinations config");
        } finally {
            setSaving(false);
        }
    };

    // Add new destination card
    const handleAddDestination = () => {
        const newDest: DestinationItem = {
            name: "New Destination",
            flag: "✈️",
            tagline: "100+ Hotels • 10 Packages",
            properties: "100+ Hotels • 10 Packages",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
            url: "/hotels",
            linkedHotelIds: [],
        };
        setDestinations([...destinations, newDest]);
    };

    // Update single field of a destination card
    const handleUpdate = (index: number, field: keyof DestinationItem, value: any) => {
        const updated = [...destinations];
        updated[index] = { ...updated[index], [field]: value };
        setDestinations(updated);
    };

    // Remove a destination card
    const handleRemove = (index: number) => {
        if (confirm(`Are you sure you want to remove ${destinations[index]?.name || "this destination"}?`)) {
            const updated = destinations.filter((_, i) => i !== index);
            setDestinations(updated);
        }
    };

    // Filter hotels inside the assign modal
    const filteredHotels = useMemo(() => {
        return availableHotels.filter((hotel) => {
            const matchesSearch =
                !hotelSearch.trim() ||
                (hotel.name || "").toLowerCase().includes(hotelSearch.toLowerCase()) ||
                (hotel.city || "").toLowerCase().includes(hotelSearch.toLowerCase()) ||
                (hotel.address || "").toLowerCase().includes(hotelSearch.toLowerCase());

            const matchesCity =
                selectedCityFilter === "All" ||
                (hotel.city || "").toLowerCase() === selectedCityFilter.toLowerCase();

            return matchesSearch && matchesCity;
        });
    }, [availableHotels, hotelSearch, selectedCityFilter]);

    // Unique cities for quick filter
    const uniqueCities = useMemo(() => {
        const cities = new Set<string>();
        availableHotels.forEach((h) => {
            if (h.city) cities.add(h.city);
        });
        return Array.from(cities);
    }, [availableHotels]);

    // Current target linked IDs
    const currentLinkedIds = useMemo(() => {
        if (assignTargetIndex === null || !destinations[assignTargetIndex]) return [];
        return destinations[assignTargetIndex]?.linkedHotelIds || [];
    }, [destinations, assignTargetIndex]);

    // Toggle hotel link
    const toggleHotelLink = (hotelId: number) => {
        if (assignTargetIndex === null) return;
        const updated = [...destinations];
        const currentIds = updated[assignTargetIndex].linkedHotelIds || [];

        if (currentIds.includes(hotelId)) {
            updated[assignTargetIndex].linkedHotelIds = currentIds.filter((id) => id !== hotelId);
        } else {
            updated[assignTargetIndex].linkedHotelIds = [...currentIds, hotelId];
        }

        // Auto update properties count badge if not manually overridden
        const count = updated[assignTargetIndex].linkedHotelIds?.length || 0;
        if (count > 0) {
            updated[assignTargetIndex].properties = `${count} Hotels • 12 Packages`;
        }

        setDestinations(updated);
    };

    // Select all filtered hotels
    const selectAllFiltered = () => {
        if (assignTargetIndex === null) return;
        const updated = [...destinations];
        const currentIds = new Set(updated[assignTargetIndex].linkedHotelIds || []);
        filteredHotels.forEach((h) => currentIds.add(h.id));
        updated[assignTargetIndex].linkedHotelIds = Array.from(currentIds);
        
        const count = updated[assignTargetIndex].linkedHotelIds?.length || 0;
        updated[assignTargetIndex].properties = `${count} Hotels • 12 Packages`;
        
        setDestinations(updated);
    };

    // Deselect all filtered hotels
    const deselectAllFiltered = () => {
        if (assignTargetIndex === null) return;
        const updated = [...destinations];
        const filteredIdSet = new Set(filteredHotels.map((h) => h.id));
        updated[assignTargetIndex].linkedHotelIds = (updated[assignTargetIndex].linkedHotelIds || []).filter(
            (id) => !filteredIdSet.has(id)
        );
        
        const count = updated[assignTargetIndex].linkedHotelIds?.length || 0;
        updated[assignTargetIndex].properties = count > 0 ? `${count} Hotels • 12 Packages` : "Verified Stays";

        setDestinations(updated);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-3 font-semibold text-sm">Loading destinations manager...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-[1400px] text-white pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f1f]">
                <div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        <h1 className="text-xl font-black text-white tracking-tight">Destinations Cards Manager</h1>
                    </div>
                    <p className="text-xs font-semibold text-neutral-400 mt-1">
                        Manage destination cards (Full-bleed card design with flags, stats line & Explore Now button) and assign properties.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAddDestination}
                        className="px-4 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] text-white border border-[#282828] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Add New Card</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer",
                            saved
                                ? "bg-emerald-600 text-white"
                                : "bg-white hover:bg-neutral-200 text-black shadow-md"
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                                <span>Saving...</span>
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Saved Changes</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 text-black" />
                                <span>Save All Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Destination Cards List with live card preview */}
            <div className="grid grid-cols-1 gap-6">
                {destinations.map((dest, idx) => {
                    const linkedCount = dest.linkedHotelIds?.length || 0;

                    return (
                        <div
                            key={idx}
                            className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] rounded-2xl p-6 transition-all flex flex-col xl:flex-row items-start xl:items-center gap-6"
                        >
                            {/* Live Card Preview (Exact replica of new destination card) */}
                            <div className="relative w-48 h-64 shrink-0 rounded-[24px] overflow-hidden bg-neutral-900 border border-white/10 shadow-lg group select-none">
                                {dest.image ? (
                                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}

                                {/* Hazy Bottom Frosted Glass Blur */}
                                <div 
                                    className="absolute inset-x-0 bottom-0 h-[55%] backdrop-blur-md pointer-events-none"
                                    style={{
                                        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%, black 100%)',
                                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%, black 100%)'
                                    }}
                                />

                                {/* Atmospheric Dark Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-50% to-transparent pointer-events-none" />

                                {/* Card Content */}
                                <div className="absolute inset-x-0 bottom-0 p-3 text-white flex flex-col justify-end z-10">
                                    <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5 drop-shadow-sm">
                                        <span>{dest.name || "Destination"}</span>
                                        {dest.flag && <AppleEmoji emoji={dest.flag} className="w-4 h-4 shrink-0" />}
                                    </h4>
                                    <p className="text-[10px] text-white/80 font-medium mt-0.5 line-clamp-1">
                                        {dest.properties || dest.tagline || "1,200+ Hotels • 24 Packages"}
                                    </p>
                                    <div className="mt-2.5 w-full py-1.5 px-2.5 bg-white/[0.12] backdrop-blur-2xl border border-white/30 rounded-xl flex items-center justify-between text-white text-[10px] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                                        <span>Explore Now</span>
                                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                            <ChevronRight className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Overlay for Image Upload */}
                                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity z-20">
                                    <ImageIcon className="w-5 h-5 mb-1 text-emerald-400" />
                                    <span>Upload Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    handleUpdate(idx, "image", reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Destination Fields Grid */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                {/* Destination Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                                        Destination Name
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.name}
                                        onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                                        placeholder="e.g. Indonesia, Goa, Delhi"
                                        className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-neutral-400"
                                    />
                                </div>

                                {/* Flag / Emoji */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                                        Flag / Icon Emoji
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.flag || ""}
                                        onChange={(e) => handleUpdate(idx, "flag", e.target.value)}
                                        placeholder="e.g. 🇮🇩, 🌴, 🇮🇳, 🏰"
                                        className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-neutral-400"
                                    />
                                </div>

                                {/* Properties / Stats Text */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                                        Stats Line (Hotels • Packages)
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.properties || ""}
                                        onChange={(e) => handleUpdate(idx, "properties", e.target.value)}
                                        placeholder="e.g. 1,345 Hotels • 24 Packages"
                                        className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-neutral-400"
                                    />
                                </div>

                                {/* Image URL */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.image || ""}
                                        onChange={(e) => handleUpdate(idx, "image", e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-neutral-400 font-mono text-[11px]"
                                    />
                                </div>

                                {/* Target URL / Slug */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                                        Target Route / City
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.url || ""}
                                        onChange={(e) => handleUpdate(idx, "url", e.target.value)}
                                        placeholder="e.g. /hotels?city=Indonesia"
                                        className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-neutral-400 font-mono text-[11px]"
                                    />
                                </div>

                                {/* Tagline (optional) */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                                        Tagline / Description
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.tagline || ""}
                                        onChange={(e) => handleUpdate(idx, "tagline", e.target.value)}
                                        placeholder="e.g. Tropical Terraces & Sun"
                                        className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-neutral-400"
                                    />
                                </div>
                            </div>

                            {/* Actions: Assign Properties & Delete */}
                            <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
                                <button
                                    onClick={() => {
                                        setAssignTargetIndex(idx);
                                        setSelectedCityFilter(dest.name || "All");
                                    }}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer",
                                        linkedCount > 0
                                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/50"
                                            : "bg-[#141414] text-neutral-300 border-[#262626] hover:bg-[#1e1e1e]"
                                    )}
                                >
                                    <Hotel className="w-4 h-4 text-emerald-400" />
                                    <span>
                                        {linkedCount > 0 ? `Assigned (${linkedCount} Hotels)` : "Assign Properties"}
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleRemove(idx)}
                                    className="w-10 h-10 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/40 flex items-center justify-center transition-all cursor-pointer"
                                    title="Delete Destination Card"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ASSIGN PROPERTIES MODAL */}
            {assignTargetIndex !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-3xl max-h-[85vh] bg-[#0c0c0c] border border-[#262626] rounded-3xl p-6 shadow-2xl flex flex-col text-white">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Hotel className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                                        Assign Properties to {destinations[assignTargetIndex]?.name} {destinations[assignTargetIndex]?.flag}
                                    </h3>
                                </div>
                                <p className="text-xs text-neutral-400 font-medium mt-0.5">
                                    Select which properties will be returned when users click this destination card.
                                </p>
                            </div>
                            <button
                                onClick={() => setAssignTargetIndex(null)}
                                className="p-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-neutral-400 hover:text-white transition-colors cursor-pointer border border-[#282828]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search & City Filter Toolbar */}
                        <div className="py-4 flex flex-col sm:flex-row gap-3 border-b border-[#1f1f1f]">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={hotelSearch}
                                    onChange={(e) => setHotelSearch(e.target.value)}
                                    placeholder="Search property name, address, city..."
                                    className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-400 placeholder:text-neutral-500"
                                />
                            </div>

                            <select
                                value={selectedCityFilter}
                                onChange={(e) => setSelectedCityFilter(e.target.value)}
                                className="px-3 py-2 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white outline-none focus:border-neutral-400"
                            >
                                <option value="All" className="bg-[#141414]">All Cities ({availableHotels.length})</option>
                                {uniqueCities.map((city) => (
                                    <option key={city} value={city} className="bg-[#141414]">{city}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAllFiltered}
                                    className="px-3 py-2 bg-[#181818] hover:bg-[#222] text-xs font-bold text-emerald-400 rounded-xl transition-all border border-[#282828] cursor-pointer"
                                >
                                    Select All Shown
                                </button>
                                <button
                                    onClick={deselectAllFiltered}
                                    className="px-3 py-2 bg-[#181818] hover:bg-[#222] text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-all border border-[#282828] cursor-pointer"
                                >
                                    Deselect
                                </button>
                            </div>
                        </div>

                        {/* Hotels Checklist Grid */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-2 max-h-[50vh] pr-1">
                            {filteredHotels.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                                    No verified hotels found matching criteria.
                                </div>
                            ) : (
                                filteredHotels.map((hotel) => {
                                    const isLinked = currentLinkedIds.includes(hotel.id);

                                    return (
                                        <div
                                            key={hotel.id}
                                            onClick={() => toggleHotelLink(hotel.id)}
                                            className={cn(
                                                "p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none",
                                                isLinked
                                                    ? "bg-emerald-950/40 border-emerald-800/60 shadow-sm"
                                                    : "bg-[#141414] border-[#222] hover:border-[#333] hover:bg-[#181818]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                        isLinked
                                                            ? "bg-emerald-500 border-emerald-500 text-black"
                                                            : "border-neutral-700 bg-[#1e1e1e]"
                                                    )}
                                                >
                                                    {isLinked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>

                                                <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#222] shrink-0">
                                                    {hotel.images?.[0] ? (
                                                        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                            <Hotel className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-white">{hotel.name}</h4>
                                                    <p className="text-[10px] text-neutral-400">{hotel.city} • {hotel.address}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-xs font-bold font-mono text-emerald-400">
                                                    ₹{hotel.pricePerNight || 1200}
                                                </span>
                                                <span className="text-[10px] text-neutral-500 block">/night</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">
                                <strong className="text-emerald-400 font-mono">{currentLinkedIds.length}</strong> properties assigned to this card
                            </span>

                            <button
                                onClick={() => setAssignTargetIndex(null)}
                                className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
