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


interface DestinationItem {
    name: string;

    tagline?: string;
    properties?: string;
    image: string;
    url?: string;
    linkedHotelIds?: number[];
}

const DEFAULT_DESTINATIONS: DestinationItem[] = [
    {
        name: "Indonesia",

        tagline: "1,345+ Hotels",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop",
        properties: "1,345+ Hotels",
        url: "/hotels?city=Indonesia",
        linkedHotelIds: [],
    },
    {
        name: "Goa",

        tagline: "1,240+ Hotels",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
        properties: "1,240+ Hotels",
        url: "/goa-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Delhi",

        tagline: "2,100+ Hotels",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop",
        properties: "2,100+ Hotels",
        url: "/delhi-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Jaipur",

        tagline: "540+ Hotels",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        properties: "540+ Hotels",
        url: "/jaipur-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Manali",

        tagline: "460+ Hotels",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop",
        properties: "460+ Hotels",
        url: "/manali-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Udaipur",

        tagline: "380+ Hotels",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop",
        properties: "380+ Hotels",
        url: "/udaipur-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Shimla",

        tagline: "420+ Hotels",
        image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800&auto=format&fit=crop",
        properties: "420+ Hotels",
        url: "/shimla-hotels",
        linkedHotelIds: [],
    },
    {
        name: "Kerala",

        tagline: "850+ Hotels",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
        properties: "850+ Hotels",
        url: "/hotels?city=Kerala",
        linkedHotelIds: [],
    },
];

const DEFAULT_HOURLY_DESTINATIONS: DestinationItem[] = [
    {
        name: "Delhi Airport (Aerocity)",
        tagline: "Transit Hub",
        properties: "Hotels",
        image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800&auto=format&fit=crop",
        url: "/hotels-near-delhi-airport?stayType=hourly",
        linkedHotelIds: [],
    },
    {
        name: "Connaught Place Delhi",
        tagline: "Central Transit",
        properties: "Hotels",
        image: "https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=800&auto=format&fit=crop",
        url: "/hotels-in-connaught-place-delhi?stayType=hourly",
        linkedHotelIds: [],
    },
    {
        name: "Gurgaon Cyber City",
        tagline: "Business Transit",
        properties: "Hotels",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Gurgaon&stayType=hourly",
        linkedHotelIds: [],
    },
    {
        name: "Mumbai Airport (T2)",
        tagline: "Airport Transit",
        properties: "Hotels",
        image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Mumbai&stayType=hourly",
        linkedHotelIds: [],
    },
    {
        name: "Bangalore Hub",
        tagline: "Tech Transit",
        properties: "Hotels",
        image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Bangalore&stayType=hourly",
        linkedHotelIds: [],
    },
    {
        name: "Jaipur City Center",
        tagline: "Day Stays",
        properties: "Hotels",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        url: "/hotels?city=Jaipur&stayType=hourly",
        linkedHotelIds: [],
    },
];

export default function AdminDestinationsManager() {
    const [activeCategory, setActiveCategory] = useState<"nightly" | "hourly">("nightly");
    const [destinations, setDestinations] = useState<DestinationItem[]>(DEFAULT_DESTINATIONS);
    const [hourlyDestinations, setHourlyDestinations] = useState<DestinationItem[]>(DEFAULT_HOURLY_DESTINATIONS);
    const [availableHotels, setAvailableHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Current active list based on category
    const currentDestinations = activeCategory === "nightly" ? destinations : hourlyDestinations;
    const setCurrentDestinations = (updater: DestinationItem[] | ((prev: DestinationItem[]) => DestinationItem[])) => {
        if (activeCategory === "nightly") {
            setDestinations(updater);
        } else {
            setHourlyDestinations(updater);
        }
    };

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
                    adminApi.getAllHotels(),
                ]);

                if (configRes.success) {
                    if (configRes.data?.destinations?.length > 0) {
                        setDestinations(configRes.data.destinations);
                    }
                    if (configRes.data?.hourly_destinations?.length > 0) {
                        setHourlyDestinations(configRes.data.hourly_destinations);
                    }
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
            const res = await adminApi.updateHomepageConfig({ 
                destinations,
                hourly_destinations: hourlyDestinations
            });
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
            name: activeCategory === "hourly" ? "New Hourly Transit Hub" : "New Destination",
            tagline: "Hotels",
            properties: "Hotels",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
            url: activeCategory === "hourly" ? "/hotels?stayType=hourly" : "/hotels",
            linkedHotelIds: [],
        };
        setCurrentDestinations((prev: DestinationItem[]) => [...prev, newDest]);
    };

    // Update single field of a destination card
    const handleUpdate = (index: number, field: keyof DestinationItem, value: any) => {
        setCurrentDestinations((prev: DestinationItem[]) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Remove a destination card
    const handleRemove = (index: number) => {
        if (confirm(`Are you sure you want to remove ${currentDestinations[index]?.name || "this destination"}?`)) {
            setCurrentDestinations((prev: DestinationItem[]) => prev.filter((_, i) => i !== index));
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
        if (assignTargetIndex === null || !currentDestinations[assignTargetIndex]) return [];
        return currentDestinations[assignTargetIndex]?.linkedHotelIds || [];
    }, [currentDestinations, assignTargetIndex]);

    // Toggle hotel link
    const toggleHotelLink = (hotelId: number) => {
        if (assignTargetIndex === null) return;
        setCurrentDestinations((prev: DestinationItem[]) => {
            const updated = [...prev];
            const currentIds = updated[assignTargetIndex].linkedHotelIds || [];

            if (currentIds.includes(hotelId)) {
                updated[assignTargetIndex].linkedHotelIds = currentIds.filter((id) => id !== hotelId);
            } else {
                updated[assignTargetIndex].linkedHotelIds = [...currentIds, hotelId];
            }

            const count = updated[assignTargetIndex].linkedHotelIds?.length || 0;
            if (count > 0) {
                updated[assignTargetIndex].properties = `${count} Hotels • 12 Packages`;
            }

            return updated;
        });
    };

    // Select all filtered hotels
    const selectAllFiltered = () => {
        if (assignTargetIndex === null) return;
        setCurrentDestinations((prev: DestinationItem[]) => {
            const updated = [...prev];
            const currentIds = new Set(updated[assignTargetIndex].linkedHotelIds || []);
            filteredHotels.forEach((h) => currentIds.add(h.id));
            updated[assignTargetIndex].linkedHotelIds = Array.from(currentIds);
            
            const count = updated[assignTargetIndex].linkedHotelIds?.length || 0;
            updated[assignTargetIndex].properties = `${count} Hotels • 12 Packages`;
            
            return updated;
        });
    };

    // Deselect all filtered hotels
    const deselectAllFiltered = () => {
        if (assignTargetIndex === null) return;
        setCurrentDestinations((prev: DestinationItem[]) => {
            const updated = [...prev];
            const filteredIdSet = new Set(filteredHotels.map((h) => h.id));
            updated[assignTargetIndex].linkedHotelIds = (updated[assignTargetIndex].linkedHotelIds || []).filter(
                (id) => !filteredIdSet.has(id)
            );
            
            const count = updated[assignTargetIndex].linkedHotelIds?.length || 0;
            updated[assignTargetIndex].properties = count > 0 ? `${count} Hotels • 12 Packages` : "Hotels";

            return updated;
        });
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
        <div className="space-y-6 animate-in fade-in duration-300 max-w-[1400px] text-slate-900 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Destinations Cards</h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage destination cards and assign properties for overnight & hourly stays.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleAddDestination}
                        className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Add Card</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer",
                            saved
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-2xs"
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                                <span>Saving...</span>
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5 text-black" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Category Sub-Tabs: Overnight vs Hourly Stays */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-neutral-900 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setActiveCategory("nightly")}
                        className={cn(
                            "px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer",
                            activeCategory === "nightly"
                                ? "bg-white text-slate-900 shadow-xs font-semibold"
                                : "text-slate-600 hover:text-slate-900 font-medium"
                        )}
                    >
                        <span>🌙 Overnight Stays</span>
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded font-medium",
                            activeCategory === "nightly" ? "bg-slate-100 text-slate-900" : "bg-slate-200/70 text-slate-600"
                        )}>
                            {destinations.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveCategory("hourly")}
                        className={cn(
                            "px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer",
                            activeCategory === "hourly"
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 hover:text-slate-900 font-medium"
                        )}
                    >
                        <span>⏱️ Hourly Stay Destinations</span>
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded font-medium",
                            activeCategory === "hourly" ? "bg-blue-800 text-white" : "bg-slate-200/70 text-slate-600"
                        )}>
                            {hourlyDestinations.length}
                        </span>
                    </button>
                </div>

                <div className="text-xs text-slate-500 px-2">
                    {activeCategory === "hourly" ? (
                        <span className="text-blue-400 font-medium">Hourly Stay Destination Cards (Active on Hourly Mode)</span>
                    ) : (
                        <span className="text-neutral-400">Overnight Destination Cards (Active on Nightly Mode)</span>
                    )}
                </div>
            </div>

            {/* Destination Cards List with live card preview */}
            <div className="grid grid-cols-1 gap-6">
                {currentDestinations.map((dest, idx) => {
                    const linkedCount = dest.linkedHotelIds?.length || 0;

                    return (
                        <div
                            key={idx}
                            className="bg-neutral-900/40 border border-slate-200/80 rounded-xl p-5 transition-colors flex flex-col xl:flex-row items-start xl:items-center gap-6"
                        >
                            {/* Live Card Preview (Exact replica of new destination card) */}
                            <div className="relative w-44 h-60 shrink-0 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-lg group select-none">
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
                                    <h4 className="text-sm font-semibold text-white leading-tight drop-shadow-sm">
                                        <span>{dest.name || "Destination"}</span>
                                    </h4>
                                    <p className="text-[10px] text-white/80 font-medium mt-0.5 line-clamp-1">
                                        {dest.properties || dest.tagline || "Hotels"}
                                    </p>
                                    <div className="mt-2.5 w-full py-1 px-2 bg-white/[0.12] backdrop-blur-2xl border border-white/30 rounded-lg flex items-center justify-between text-white text-[10px] font-medium">
                                        <span>Explore</span>
                                        <ChevronRight className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                {/* Overlay for Image Upload */}
                                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer transition-opacity z-20">
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
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
                                {/* Destination Name */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                                        Destination Name
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.name}
                                        onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                                        placeholder="e.g. Indonesia, Goa, Delhi"
                                        className="w-full bg-neutral-950 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none focus:border-neutral-700"
                                    />
                                </div>

                                {/* Properties / Stats Text */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                                        Stats Line (Hotels)
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.properties || ""}
                                        onChange={(e) => handleUpdate(idx, "properties", e.target.value)}
                                        placeholder="e.g. 1,345 Hotels"
                                        className="w-full bg-neutral-950 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none focus:border-neutral-700"
                                    />
                                </div>

                                {/* Image URL */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.image || ""}
                                        onChange={(e) => handleUpdate(idx, "image", e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full bg-neutral-950 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none focus:border-neutral-700 font-mono text-[11px]"
                                    />
                                </div>

                                {/* Target URL / Slug */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                                        Target Route / City
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.url || ""}
                                        onChange={(e) => handleUpdate(idx, "url", e.target.value)}
                                        placeholder="e.g. /hotels?city=Indonesia"
                                        className="w-full bg-neutral-950 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none focus:border-neutral-700 font-mono text-[11px]"
                                    />
                                </div>

                                {/* Tagline (optional) */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                                        Tagline / Description
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.tagline || ""}
                                        onChange={(e) => handleUpdate(idx, "tagline", e.target.value)}
                                        placeholder="e.g. Tropical Terraces & Sun"
                                        className="w-full bg-neutral-950 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none focus:border-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Actions: Assign Properties & Delete */}
                            <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-center">
                                <button
                                    onClick={() => {
                                        setAssignTargetIndex(idx);
                                        setSelectedCityFilter(dest.name || "All");
                                    }}
                                    className={cn(
                                        "px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border transition-colors cursor-pointer",
                                        linkedCount > 0
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                                            : "bg-neutral-900 text-neutral-300 border-slate-200 hover:bg-neutral-800"
                                    )}
                                >
                                    <Hotel className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>
                                        {linkedCount > 0 ? `Assigned (${linkedCount})` : "Assign Properties"}
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleRemove(idx)}
                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors cursor-pointer"
                                    title="Delete Destination Card"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ASSIGN PROPERTIES MODAL */}
            {assignTargetIndex !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
                    <div className="w-full max-w-3xl max-h-[85vh] bg-neutral-900 border border-slate-200 rounded-2xl p-5 shadow-2xl flex flex-col text-white">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Hotel className="w-4 h-4 text-emerald-400" />
                                    <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                                        Assign Properties to {currentDestinations[assignTargetIndex]?.name}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Select properties returned when users click this destination card.
                                </p>
                            </div>
                            <button
                                onClick={() => setAssignTargetIndex(null)}
                                className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search & City Filter Toolbar */}
                        <div className="py-3.5 flex flex-col sm:flex-row gap-2.5 border-b border-slate-200/80">
                            <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={hotelSearch}
                                    onChange={(e) => setHotelSearch(e.target.value)}
                                    placeholder="Search property name, address, city..."
                                    className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-slate-200 rounded-lg text-xs text-white outline-none focus:border-neutral-700 placeholder:text-neutral-500"
                                />
                            </div>

                            <select
                                value={selectedCityFilter}
                                onChange={(e) => setSelectedCityFilter(e.target.value)}
                                className="px-3 py-1.5 bg-neutral-950 border border-slate-200 rounded-lg text-xs text-white outline-none focus:border-neutral-700"
                            >
                                <option value="All" className="bg-white text-slate-900">All Cities ({availableHotels.length})</option>
                                {uniqueCities.map((city) => (
                                    <option key={city} value={city} className="bg-white text-slate-900">{city}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAllFiltered}
                                    className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-xs font-medium text-emerald-400 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAllFiltered}
                                    className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors border border-slate-200 cursor-pointer"
                                >
                                    Deselect
                                </button>
                            </div>
                        </div>

                        {/* Hotels Checklist Grid */}
                        <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-[50vh] pr-1">
                            {filteredHotels.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-xs font-medium">
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
                                                "p-3 rounded-lg border transition-colors flex items-center justify-between cursor-pointer select-none",
                                                isLinked
                                                    ? "bg-emerald-50/80 border-emerald-200 shadow-2xs"
                                                    : "bg-neutral-950/60 border-slate-200/80 hover:bg-neutral-800/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                        isLinked
                                                            ? "bg-emerald-500 border-emerald-500 text-black"
                                                            : "border-neutral-700 bg-neutral-900"
                                                    )}
                                                >
                                                    {isLinked && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>

                                                <div className="w-10 h-9 rounded-md overflow-hidden bg-neutral-900 shrink-0">
                                                    {hotel.images?.[0] ? (
                                                        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                            <Hotel className="w-3.5 h-3.5" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-medium text-slate-900">{hotel.name}</h4>
                                                    <p className="text-[11px] text-slate-500">{hotel.city} • {hotel.address}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-xs font-medium text-emerald-400">
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
                        <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="text-xs text-neutral-400">
                                <strong className="text-emerald-400 font-medium">{currentLinkedIds.length}</strong> properties assigned
                            </span>

                            <button
                                onClick={() => setAssignTargetIndex(null)}
                                className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
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
