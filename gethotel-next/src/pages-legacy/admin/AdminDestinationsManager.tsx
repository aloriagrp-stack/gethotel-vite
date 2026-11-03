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
    UploadCloud,
    FolderOpen,
    RotateCcw,
    CheckCircle2,
    Globe,
    Building2,
} from "lucide-react";
import { adminApi, homepageApi, packageApi } from "@/lib/api";
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
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

    const handleFileUpload = async (idx: number, file: File) => {
        if (!file) return;
        setUploadingIdx(idx);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            // Instantly update preview in UI
            handleUpdate(idx, "image", base64);

            try {
                const res = await packageApi.uploadImage(base64);
                if (res && res.success && res.url) {
                    const finalUrl = res.url.startsWith('/uploads/') ? `/api${res.url}` : res.url;
                    handleUpdate(idx, "image", finalUrl);
                }
            } catch (err) {
                console.warn("Server upload failed, using local base64 preview:", err);
            } finally {
                setUploadingIdx(null);
            }
        };
        reader.readAsDataURL(file);
    };
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

    // Modal state for creating a BRAND NEW destination card
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCardCategory, setNewCardCategory] = useState<"nightly" | "hourly">("nightly");
    const [newCardActiveTab, setNewCardActiveTab] = useState<"details" | "properties">("details");
    const [newCardForm, setNewCardForm] = useState<DestinationItem>({
        name: "",
        tagline: "",
        properties: "",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
        url: "/hotels",
        linkedHotelIds: [],
    });
    const [urlManuallyEdited, setUrlManuallyEdited] = useState(false);
    const [isUploadingNewCard, setIsUploadingNewCard] = useState(false);
    const [isSavingNewCard, setIsSavingNewCard] = useState(false);
    const [newCardHotelSearch, setNewCardHotelSearch] = useState("");
    const [newCardCityFilter, setNewCardCityFilter] = useState("All");

    // Open create modal with fresh state
    const handleOpenCreateModal = () => {
        setNewCardCategory(activeCategory);
        setNewCardActiveTab("details");
        setNewCardForm({
            name: "",
            tagline: "",
            properties: "",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
            url: activeCategory === "hourly" ? "/hotels?stayType=hourly" : "/hotels",
            linkedHotelIds: [],
        });
        setUrlManuallyEdited(false);
        setNewCardHotelSearch("");
        setNewCardCityFilter("All");
        setIsCreateModalOpen(true);
    };

    // Auto-update URL when destination name changes in create modal
    const handleNewCardNameChange = (name: string) => {
        setNewCardForm(prev => {
            const trimmed = name.trim();
            const stayQuery = newCardCategory === "hourly" ? "&stayType=hourly" : "";
            const autoUrl = trimmed
                ? `/hotels?city=${encodeURIComponent(trimmed)}${stayQuery}`
                : (newCardCategory === "hourly" ? "/hotels?stayType=hourly" : "/hotels");

            return {
                ...prev,
                name,
                url: urlManuallyEdited ? prev.url : autoUrl,
            };
        });
    };

    // Auto-update URL when category switches in create modal
    const handleNewCardCategorySwitch = (cat: "nightly" | "hourly") => {
        setNewCardCategory(cat);
        if (!urlManuallyEdited) {
            const trimmed = newCardForm.name.trim();
            const stayQuery = cat === "hourly" ? "&stayType=hourly" : "";
            const autoUrl = trimmed
                ? `/hotels?city=${encodeURIComponent(trimmed)}${stayQuery}`
                : (cat === "hourly" ? "/hotels?stayType=hourly" : "/hotels");

            setNewCardForm(prev => ({
                ...prev,
                url: autoUrl,
            }));
        }
    };

    // Reset auto-generated URL
    const handleResetAutoUrl = () => {
        setUrlManuallyEdited(false);
        const trimmed = newCardForm.name.trim();
        const stayQuery = newCardCategory === "hourly" ? "&stayType=hourly" : "";
        const autoUrl = trimmed
            ? `/hotels?city=${encodeURIComponent(trimmed)}${stayQuery}`
            : (newCardCategory === "hourly" ? "/hotels?stayType=hourly" : "/hotels");

        setNewCardForm(prev => ({
            ...prev,
            url: autoUrl,
        }));
    };

    // Upload local image for new card
    const handleNewCardFileUpload = async (file: File) => {
        if (!file) return;
        setIsUploadingNewCard(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setNewCardForm(prev => ({ ...prev, image: base64 }));
            try {
                const res = await packageApi.uploadImage(base64);
                if (res && res.success && res.url) {
                    const finalUrl = res.url.startsWith('/uploads/') ? `/api${res.url}` : res.url;
                    setNewCardForm(prev => ({ ...prev, image: finalUrl }));
                }
            } catch (err) {
                console.warn("New card image upload failed, retaining base64 preview:", err);
            } finally {
                setIsUploadingNewCard(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // Toggle hotel link inside new card modal
    const toggleNewCardHotel = (hotelId: number) => {
        setNewCardForm(prev => {
            const exists = (prev.linkedHotelIds || []).includes(hotelId);
            const nextIds = exists
                ? (prev.linkedHotelIds || []).filter(id => id !== hotelId)
                : [...(prev.linkedHotelIds || []), hotelId];

            const currentProps = prev.properties || "";
            const isDefaultProps = !currentProps || currentProps.includes("Hotels") || currentProps.includes("Verified");
            const updatedProps = isDefaultProps
                ? (nextIds.length > 0 ? `${nextIds.length} Verified Hotels` : "Hotels")
                : currentProps;

            return {
                ...prev,
                linkedHotelIds: nextIds,
                properties: updatedProps,
            };
        });
    };

    // Filter hotels for new card modal
    const filteredHotelsForNewCard = useMemo(() => {
        return availableHotels.filter((hotel) => {
            const matchesSearch =
                !newCardHotelSearch.trim() ||
                (hotel.name || "").toLowerCase().includes(newCardHotelSearch.toLowerCase()) ||
                (hotel.city || "").toLowerCase().includes(newCardHotelSearch.toLowerCase()) ||
                (hotel.address || "").toLowerCase().includes(newCardHotelSearch.toLowerCase());

            const matchesCity =
                newCardCityFilter === "All" ||
                (hotel.city || "").toLowerCase() === newCardCityFilter.toLowerCase();

            return matchesSearch && matchesCity;
        });
    }, [availableHotels, newCardHotelSearch, newCardCityFilter]);

    // Select all filtered hotels in new card modal
    const selectAllNewCardFiltered = () => {
        setNewCardForm(prev => {
            const currentSet = new Set(prev.linkedHotelIds || []);
            filteredHotelsForNewCard.forEach(h => currentSet.add(h.id));
            const nextIds = Array.from(currentSet);
            return {
                ...prev,
                linkedHotelIds: nextIds,
                properties: `${nextIds.length} Verified Hotels`,
            };
        });
    };

    // Deselect all filtered hotels in new card modal
    const deselectAllNewCardFiltered = () => {
        setNewCardForm(prev => {
            const filterSet = new Set(filteredHotelsForNewCard.map(h => h.id));
            const nextIds = (prev.linkedHotelIds || []).filter(id => !filterSet.has(id));
            return {
                ...prev,
                linkedHotelIds: nextIds,
                properties: nextIds.length > 0 ? `${nextIds.length} Verified Hotels` : "Hotels",
            };
        });
    };

    // Submit and publish new card
    const handleCreateCardSubmit = async () => {
        if (!newCardForm.name.trim()) {
            alert("Please enter a Destination Name.");
            return;
        }

        setIsSavingNewCard(true);
        try {
            const finalImage = newCardForm.image?.trim() || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop";
            const finalStats = newCardForm.properties?.trim() || 
                ((newCardForm.linkedHotelIds?.length || 0) > 0 ? `${newCardForm.linkedHotelIds?.length} Verified Hotels` : "Hotels");
            
            const stayQuery = newCardCategory === "hourly" ? "&stayType=hourly" : "";
            const defaultUrl = `/hotels?city=${encodeURIComponent(newCardForm.name.trim())}${stayQuery}`;
            const finalUrl = newCardForm.url?.trim() || defaultUrl;

            const newItem: DestinationItem = {
                name: newCardForm.name.trim(),
                tagline: newCardForm.tagline?.trim() || undefined,
                properties: finalStats,
                image: finalImage,
                url: finalUrl,
                linkedHotelIds: newCardForm.linkedHotelIds || [],
            };

            let updatedDestinations = destinations;
            let updatedHourly = hourlyDestinations;

            if (newCardCategory === "nightly") {
                updatedDestinations = [newItem, ...destinations];
                setDestinations(updatedDestinations);
                setActiveCategory("nightly");
            } else {
                updatedHourly = [newItem, ...hourlyDestinations];
                setHourlyDestinations(updatedHourly);
                setActiveCategory("hourly");
            }

            // Immediately persist changes to backend
            const res = await adminApi.updateHomepageConfig({
                destinations: updatedDestinations,
                hourly_destinations: updatedHourly,
            });

            if (res && res.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }

            setIsCreateModalOpen(false);
        } catch (err) {
            console.error("Failed to create destination card:", err);
            alert("Error saving destination card. Please try again.");
        } finally {
            setIsSavingNewCard(false);
        }
    };

    // Add new destination card (Opens rich popup modal)
    const handleAddDestination = () => {
        handleOpenCreateModal();
    };

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
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Destinations Cards</h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage destination cards and assign properties for overnight & hourly stays.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleAddDestination}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                        <Plus className="w-3.5 h-3.5 text-slate-500" />
                        <span>Add Card</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm",
                            saved
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-900 hover:bg-slate-800 text-white"
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                <span>Saving...</span>
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5 text-white" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Category Sub-Tabs: Overnight vs Hourly Stays */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 border border-slate-200/80 rounded-xl">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setActiveCategory("nightly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                            activeCategory === "nightly"
                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/70"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <span>🌙 Overnight Stays</span>
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold",
                            activeCategory === "nightly" ? "bg-slate-100 text-slate-800" : "bg-slate-200/80 text-slate-600"
                        )}>
                            {destinations.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveCategory("hourly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                            activeCategory === "hourly"
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <span>⏱️ Hourly Stay Destinations</span>
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold",
                            activeCategory === "hourly" ? "bg-blue-800 text-white" : "bg-slate-200/80 text-slate-600"
                        )}>
                            {hourlyDestinations.length}
                        </span>
                    </button>
                </div>

                <div className="text-xs text-slate-500 px-3 font-medium">
                    {activeCategory === "hourly" ? (
                        <span className="text-blue-700 font-semibold">Hourly Stay Destination Cards (Active on Hourly Mode)</span>
                    ) : (
                        <span className="text-slate-600">Overnight Destination Cards (Active on Nightly Mode)</span>
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
                            className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col xl:flex-row items-start xl:items-center gap-6"
                        >
                            {/* Live Card Preview (Exact replica of new destination card) */}
                            <div className="relative w-44 h-60 shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group select-none">
                                {dest.image ? (
                                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
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
                                    <h4 className="text-sm font-bold text-white leading-tight drop-shadow-sm">
                                        <span>{dest.name || "Destination"}</span>
                                    </h4>
                                    <p className="text-[10px] text-white/90 font-medium mt-0.5 line-clamp-1">
                                        {dest.properties || dest.tagline || "Hotels"}
                                    </p>
                                    <div className="mt-2.5 w-full py-1 px-2 bg-white/20 backdrop-blur-2xl border border-white/40 rounded-lg flex items-center justify-between text-white text-[10px] font-semibold">
                                        <span>Explore</span>
                                        <ChevronRight className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                {/* Overlay for Image Upload */}
                                <label className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity z-20">
                                    <ImageIcon className="w-5 h-5 mb-1 text-emerald-400" />
                                    <span>Change Photo</span>
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
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                        Destination Name
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.name}
                                        onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                                        placeholder="e.g. Indonesia, Goa, Delhi"
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                                    />
                                </div>

                                {/* Properties / Stats Text */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                        Stats Line (Hotels)
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.properties || ""}
                                        onChange={(e) => handleUpdate(idx, "properties", e.target.value)}
                                        placeholder="e.g. 1,240+ Hotels"
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                                    />
                                </div>

                                {/* Destination Image / Upload from Folder */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                            Destination Image
                                        </label>
                                        <span className="text-[10px] text-slate-500 font-semibold">Local File or URL</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleFileUpload(idx, f);
                                                }}
                                            />
                                            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 transition-all shadow-2xs">
                                                {uploadingIdx === idx ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                                        <span>Uploading from Device...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FolderOpen className="w-4 h-4 text-blue-600" />
                                                        <span>{dest.image ? "📁 Change Image from Folder" : "📁 Choose Image from Folder"}</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                        {dest.image && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdate(idx, "image", "")}
                                                className="p-2 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                                                title="Remove Image"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={dest.image?.startsWith('data:') ? '✓ Local image uploaded from device' : (dest.image || "")}
                                        onChange={(e) => handleUpdate(idx, "image", e.target.value)}
                                        placeholder="Or paste web image URL here..."
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-600 placeholder:text-slate-400 outline-none focus:border-blue-600 transition-all font-mono truncate"
                                    />
                                </div>

                                {/* Target URL / Slug */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                        Target Route / City
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.url || ""}
                                        onChange={(e) => handleUpdate(idx, "url", e.target.value)}
                                        placeholder="e.g. /hotels?city=Indonesia"
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all font-mono text-[11px]"
                                    />
                                </div>

                                {/* Tagline (optional) */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                        Tagline / Description
                                    </label>
                                    <input
                                        type="text"
                                        value={dest.tagline || ""}
                                        onChange={(e) => handleUpdate(idx, "tagline", e.target.value)}
                                        placeholder="e.g. Tropical Terraces & Sun"
                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
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
                                        "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-2xs",
                                        linkedCount > 0
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                    )}
                                >
                                    <Hotel className="w-4 h-4 text-emerald-600" />
                                    <span>
                                        {linkedCount > 0 ? `Assigned (${linkedCount})` : "Assign Properties"}
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleRemove(idx)}
                                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                                    title="Delete Destination Card"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CREATE DESTINATION CARD POPUP MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="w-full max-w-4xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100/70 border border-blue-200/80 flex items-center justify-center text-blue-700 shadow-2xs">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                                            Create Destination Card
                                        </h3>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                            newCardCategory === "hourly"
                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                : "bg-slate-100 text-slate-700 border-slate-200"
                                        )}>
                                            {newCardCategory === "hourly" ? "⏱️ Hourly Mode" : "🌙 Overnight Mode"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Configure destination details, auto-generate route, assign properties, and upload local photo.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer border border-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Top Sub-Navigation Tabs */}
                        <div className="px-6 pt-3 pb-0 border-b border-slate-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setNewCardActiveTab("details")}
                                    className={cn(
                                        "px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer -mb-[1px]",
                                        newCardActiveTab === "details"
                                            ? "border-blue-600 text-blue-700"
                                            : "border-transparent text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>1. Card Details & Visuals</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewCardActiveTab("properties")}
                                    className={cn(
                                        "px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer -mb-[1px]",
                                        newCardActiveTab === "properties"
                                            ? "border-blue-600 text-blue-700"
                                            : "border-transparent text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    <Hotel className="w-3.5 h-3.5" />
                                    <span>2. Assign Properties</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                                        {newCardForm.linkedHotelIds?.length || 0}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Side: Active Tab Controls */}
                                <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                                    {newCardActiveTab === "details" ? (
                                        <div className="space-y-4">
                                            {/* Stay Category Switcher */}
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                                    Category / Stay Type
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleNewCardCategorySwitch("nightly")}
                                                        className={cn(
                                                            "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                                                            newCardCategory === "nightly"
                                                                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                                        )}
                                                    >
                                                        <span>🌙 Overnight Stays</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleNewCardCategorySwitch("hourly")}
                                                        className={cn(
                                                            "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                                                            newCardCategory === "hourly"
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                                        )}
                                                    >
                                                        <span>⏱️ Hourly Stay Destinations</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Destination Name */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                                        Destination Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                        <Sparkles className="w-2.5 h-2.5" /> Auto-syncs Target Route
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={newCardForm.name}
                                                    onChange={(e) => handleNewCardNameChange(e.target.value)}
                                                    placeholder="e.g. South Goa, Jaipur City Center, Aerocity Delhi"
                                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                                                />
                                            </div>

                                            {/* Auto-Generated Target Route / URL */}
                                            <div className="space-y-1.5 p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-2xl">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                                                        <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                                                            Target Route / URL
                                                        </label>
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                                            ⚡ Auto-Generated
                                                        </span>
                                                    </div>
                                                    {urlManuallyEdited && (
                                                        <button
                                                            type="button"
                                                            onClick={handleResetAutoUrl}
                                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                                                        >
                                                            <RotateCcw className="w-3 h-3" /> Reset to Auto
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={newCardForm.url || ""}
                                                    onChange={(e) => {
                                                        setUrlManuallyEdited(true);
                                                        setNewCardForm(prev => ({ ...prev, url: e.target.value }));
                                                    }}
                                                    placeholder="e.g. /hotels?city=Goa"
                                                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-blue-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                                                />
                                                <p className="text-[10px] text-slate-500 font-medium">
                                                    When visitors click this card on the homepage, they will land on this URL showing the assigned hotels.
                                                </p>
                                            </div>

                                            {/* Stats Line & Tagline in 2 columns */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                                        Stats Line (Hotels)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newCardForm.properties || ""}
                                                        onChange={(e) => setNewCardForm(prev => ({ ...prev, properties: e.target.value }))}
                                                        placeholder={newCardForm.linkedHotelIds?.length ? `${newCardForm.linkedHotelIds.length} Verified Hotels` : "e.g. 1,240+ Hotels"}
                                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                                        Tagline / Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newCardForm.tagline || ""}
                                                        onChange={(e) => setNewCardForm(prev => ({ ...prev, tagline: e.target.value }))}
                                                        placeholder="e.g. Tropical Terraces & Sun"
                                                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Local Image Uploader & URL */}
                                            <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                                        Destination Photo
                                                    </label>
                                                    <span className="text-[10px] text-slate-500 font-semibold">Local File or Online URL</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="flex-1 cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleNewCardFileUpload(file);
                                                            }}
                                                        />
                                                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                                                            {isUploadingNewCard ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                                    <span>Reading & Uploading File...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FolderOpen className="w-4 h-4 text-white" />
                                                                    <span>📁 Choose Image from Local Folder</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </label>
                                                    {newCardForm.image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewCardForm(prev => ({ ...prev, image: "" }))}
                                                            className="p-2.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-300 rounded-xl transition-colors cursor-pointer"
                                                            title="Clear Photo"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        value={newCardForm.image?.startsWith('data:') ? '✓ Local image uploaded from your device' : (newCardForm.image || "")}
                                                        onChange={(e) => setNewCardForm(prev => ({ ...prev, image: e.target.value }))}
                                                        placeholder="Or paste online image URL (https://...)"
                                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-600 truncate"
                                                    />
                                                </div>
                                            </div>

                                            {/* Quick Button to go to Assign Properties */}
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setNewCardActiveTab("properties")}
                                                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Hotel className="w-4 h-4 text-emerald-600" />
                                                        <span>Assign Properties ({newCardForm.linkedHotelIds?.length || 0} selected)</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-emerald-700">Go to Hotels List →</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Search and City Filter Toolbar */}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        value={newCardHotelSearch}
                                                        onChange={(e) => setNewCardHotelSearch(e.target.value)}
                                                        placeholder="Search hotel name, city, address..."
                                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                                                    />
                                                </div>

                                                <select
                                                    value={newCardCityFilter}
                                                    onChange={(e) => setNewCardCityFilter(e.target.value)}
                                                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                                                >
                                                    <option value="All">All Cities ({availableHotels.length})</option>
                                                    {uniqueCities.map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={selectAllNewCardFiltered}
                                                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-700 rounded-xl transition-colors border border-emerald-200 cursor-pointer shadow-2xs"
                                                    >
                                                        Select All
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={deselectAllNewCardFiltered}
                                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors border border-slate-300 cursor-pointer shadow-2xs"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Hotel List */}
                                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                                {filteredHotelsForNewCard.length === 0 ? (
                                                    <div className="text-center py-12 text-slate-400 text-xs font-medium">
                                                        No verified hotels found matching criteria.
                                                    </div>
                                                ) : (
                                                    filteredHotelsForNewCard.map((hotel) => {
                                                        const isLinked = (newCardForm.linkedHotelIds || []).includes(hotel.id);
                                                        return (
                                                            <div
                                                                key={hotel.id}
                                                                onClick={() => toggleNewCardHotel(hotel.id)}
                                                                className={cn(
                                                                    "p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none",
                                                                    isLinked
                                                                        ? "bg-emerald-50/90 border-emerald-300 shadow-2xs"
                                                                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/90"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={cn(
                                                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                                            isLinked
                                                                                ? "bg-emerald-600 border-emerald-600 text-white"
                                                                                : "border-slate-300 bg-white"
                                                                        )}
                                                                    >
                                                                        {isLinked && <Check className="w-3 h-3 stroke-[3]" />}
                                                                    </div>

                                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                                        {hotel.images?.[0] ? (
                                                                            <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                                <Hotel className="w-4 h-4" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-slate-900">{hotel.name}</h4>
                                                                        <p className="text-[11px] text-slate-500 font-medium">{hotel.city} • {hotel.address}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <span className="text-xs font-bold text-slate-900 font-mono">
                                                                        ₹{hotel.pricePerNight || 1200}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-500 block font-medium">/night</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Live Homepage Card Preview */}
                                <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center">
                                    <div className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col items-center">
                                        <div className="flex items-center justify-between w-full mb-3">
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                Live Card Preview
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-500">
                                                Homepage Replica
                                            </span>
                                        </div>

                                        {/* Card Replica */}
                                        <div className="relative w-48 h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group select-none">
                                            {newCardForm.image ? (
                                                <img src={newCardForm.image} alt={newCardForm.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}

                                            {/* Frosted Glass Overlay */}
                                            <div 
                                                className="absolute inset-x-0 bottom-0 h-[55%] backdrop-blur-md pointer-events-none"
                                                style={{
                                                    maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%, black 100%)',
                                                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%, black 100%)'
                                                }}
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-50% to-transparent pointer-events-none" />

                                            {/* Card Content */}
                                            <div className="absolute inset-x-0 bottom-0 p-3.5 text-white flex flex-col justify-end z-10">
                                                <h4 className="text-sm font-bold text-white leading-tight drop-shadow-sm">
                                                    <span>{newCardForm.name || "Destination Name"}</span>
                                                </h4>
                                                <p className="text-[10px] text-white/90 font-medium mt-0.5 line-clamp-1">
                                                    {newCardForm.properties || newCardForm.tagline || (newCardForm.linkedHotelIds?.length ? `${newCardForm.linkedHotelIds.length} Verified Hotels` : "Hotels")}
                                                </p>
                                                <div className="mt-2.5 w-full py-1.5 px-2.5 bg-white/20 backdrop-blur-2xl border border-white/40 rounded-lg flex items-center justify-between text-white text-[10px] font-semibold">
                                                    <span>Explore</span>
                                                    <ChevronRight className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Metadata info badge */}
                                        <div className="w-full mt-4 p-3 bg-white border border-slate-200/90 rounded-xl space-y-1.5 text-[11px]">
                                            <div className="flex items-center justify-between text-slate-600">
                                                <span className="font-medium">Target URL:</span>
                                                <span className="font-mono font-bold text-blue-600 truncate max-w-[150px]">{newCardForm.url || "/hotels"}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-600">
                                                <span className="font-medium">Linked Hotels:</span>
                                                <span className="font-bold text-emerald-600">{newCardForm.linkedHotelIds?.length || 0} Hotels</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-600">
                                                <span className="font-medium">Active Mode:</span>
                                                <span className="font-bold text-slate-800">{newCardCategory === "hourly" ? "Hourly Transit" : "Overnight Stays"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80">
                            <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>
                                    <strong className="text-slate-900 font-bold">{newCardForm.linkedHotelIds?.length || 0}</strong> hotels assigned to this card
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCreateCardSubmit}
                                    disabled={isSavingNewCard || !newCardForm.name.trim()}
                                    className={cn(
                                        "flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md",
                                        !newCardForm.name.trim()
                                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                                    )}
                                >
                                    {isSavingNewCard ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Creating Card...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 text-white" />
                                            <span>Create Destination Card</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ASSIGN PROPERTIES MODAL */}
            {assignTargetIndex !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-3xl max-h-[85vh] bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col text-slate-900">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Hotel className="w-4 h-4 text-emerald-600" />
                                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                                        Assign Properties to {currentDestinations[assignTargetIndex]?.name}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Select properties returned when users click this destination card on homepage.
                                </p>
                            </div>
                            <button
                                onClick={() => setAssignTargetIndex(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search & City Filter Toolbar */}
                        <div className="py-4 flex flex-col sm:flex-row gap-2.5 border-b border-slate-200">
                            <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={hotelSearch}
                                    onChange={(e) => setHotelSearch(e.target.value)}
                                    placeholder="Search property name, address, city..."
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                                />
                            </div>

                            <select
                                value={selectedCityFilter}
                                onChange={(e) => setSelectedCityFilter(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                            >
                                <option value="All">All Cities ({availableHotels.length})</option>
                                {uniqueCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAllFiltered}
                                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-700 rounded-xl transition-colors border border-emerald-200 cursor-pointer shadow-2xs"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAllFiltered}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors border border-slate-300 cursor-pointer shadow-2xs"
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
                                                "p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none",
                                                isLinked
                                                    ? "bg-emerald-50/90 border-emerald-300 shadow-2xs"
                                                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/90"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                        isLinked
                                                            ? "bg-emerald-600 border-emerald-600 text-white"
                                                            : "border-slate-300 bg-white"
                                                    )}
                                                >
                                                    {isLinked && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>

                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                    {hotel.images?.[0] ? (
                                                        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Hotel className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">{hotel.name}</h4>
                                                    <p className="text-[11px] text-slate-500 font-medium">{hotel.city} • {hotel.address}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-xs font-bold text-slate-900 font-mono">
                                                    ₹{hotel.pricePerNight || 1200}
                                                </span>
                                                <span className="text-[10px] text-slate-500 block font-medium">/night</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-600 font-medium">
                                <strong className="text-emerald-700 font-bold">{currentLinkedIds.length}</strong> properties assigned
                            </span>

                            <button
                                onClick={() => setAssignTargetIndex(null)}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
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
