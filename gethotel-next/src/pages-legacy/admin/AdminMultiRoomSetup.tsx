'use client';
import { useState, useEffect } from "react";
import { hotelApi } from "@/lib/api";
import { 
    Search, Hotel, Edit3, Save, X, Plus, Trash2, Loader2, Info, Check, AlertTriangle,
    Sliders, Users, IndianRupee, Image, ShieldAlert, Eye, Calendar
} from "lucide-react";
import { cn, safeParse } from "@/lib/utils";

interface HotelSummary {
    id: number;
    name: string;
    city: string;
}

interface RoomItem {
    id: number; // positive for existing, negative for temp local additions
    name: string;
    pricePerNight: number;
    bedConfiguration: string;
    sizeM2: number;
    maxOccupancy: number;
    totalInventory: number;
    status: string;
    isHourlyEnabled: boolean;
    description: string;
    
    // Advanced fields
    amenities: string;
    highlights: string;
    capacityAdults: number;
    capacityChildren: number;
    capacityInfants: number;
    viewType: string;
    floorNumber: number | null;
    isCornerRoom: boolean;
    extraBedCharge: number;
    securityDeposit: number;
    isRefundable: boolean;
    isTaxIncluded: boolean;
    hourlyRates: string;
    images: string[];
    videoUrl: string;
    media360Url: string;
    minStay: number;
    maxStay: number;
    isInstantBooking: boolean;
    advanceBookingDays: number;
    advancePayment: number;
    tags: string;
    isFeatured: boolean;
    displayPriority: number;
    seoTitle: string;
    seoDescription: string;
    slug: string;

    // Meal Plan Rates (EP/CP/MAP/AP variants)
    epPrice: number | null;
    cpPrice: number | null;
    mapPrice: number | null;
    apPrice: number | null;
    cancellationPolicy: string;
}

const TABS = [
    { id: "general", label: "General", icon: Sliders },
    { id: "occupancy-location", label: "Occupancy & Location", icon: Users },
    { id: "pricing", label: "Pricing", icon: IndianRupee },
    { id: "rate-plans", label: "Rate Plans (EP/CP/MAP/AP)", icon: ShieldAlert },
    { id: "booking-rules", label: "Booking Rules", icon: Calendar },
    { id: "media", label: "Media", icon: Image },
    { id: "search-visibility", label: "Search Visibility", icon: Eye }
];

const formatListField = (val: string | null | undefined): string => {
    if (!val) return "";
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.join(", ");
        return val;
    } catch (e) {
        return val || "";
    }
};

const parseImagesArray = (val: string | null | undefined): string[] => {
    if (!val) return [];
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') {
            if (parsed.startsWith('[') && parsed.endsWith(']')) {
                try {
                    const innerParsed = JSON.parse(parsed);
                    if (Array.isArray(innerParsed)) return innerParsed;
                } catch (e) {}
            }
            return parsed.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
        return [];
    } catch (e) {
        return val.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
};

export default function AdminMultiRoomSetup({ hotels }: { hotels: HotelSummary[] }) {
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [originalRooms, setOriginalRooms] = useState<RoomItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteIds, setDeleteIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [currentTab, setCurrentTab] = useState("general");
    const [saveLog, setSaveLog] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

    useEffect(() => {
        if (hotels.length > 0 && selectedHotelId === null) {
            setSelectedHotelId(hotels[0].id);
        }
    }, [hotels, selectedHotelId]);

    const fetchRooms = async (hotelId: number) => {
        setLoading(true);
        setSaveLog({ type: null, message: "" });
        try {
            const res = await hotelApi.getRooms(String(hotelId));
            if (res.success && Array.isArray(res.data)) {
                const normalized = res.data.map((r: any) => {
                    // Extract meal plan variants
                    const variantsArray: any[] = [];
                    if (r.variants) {
                        try {
                            const parsed = typeof r.variants === 'string' ? JSON.parse(r.variants) : r.variants;
                            if (Array.isArray(parsed)) {
                                variantsArray.push(...parsed);
                            }
                        } catch (e) {
                            console.error("Failed to parse variants JSON:", e);
                        }
                    }

                    const epVal = variantsArray.find((v: any) => {
                        const mp = (v.mealPlan || "").toLowerCase();
                        return mp === "room only" || mp.includes("room only") || mp === "ep" || mp === "ep (room only)";
                    });
                    const cpVal = variantsArray.find((v: any) => {
                        const mp = (v.mealPlan || "").toLowerCase();
                        return mp === "breakfast included" || (mp.includes("breakfast") && !mp.includes("meal") && !mp.includes("map"));
                    });
                    const mapVal = variantsArray.find((v: any) => {
                        const mp = (v.mealPlan || "").toLowerCase();
                        return mp === "breakfast + meal" || mp.includes("breakfast + meal") || mp.includes("map") || mp.includes("breakfast + 1 meal");
                    });
                    const apVal = variantsArray.find((v: any) => {
                        const mp = (v.mealPlan || "").toLowerCase();
                        return mp === "all inclusive" || mp.includes("all inclusive") || mp.includes("ap") || mp.includes("all meals");
                    });
                    const policyVal = variantsArray.length > 0 ? variantsArray[0].policy : "Free cancellation till 24h";

                    return {
                        id: r.id,
                        name: r.name || "",
                        pricePerNight: r.pricePerNight || 0,
                        bedConfiguration: r.bedConfiguration || "1 King Bed",
                        sizeM2: r.sizeM2 || 0,
                        maxOccupancy: r.maxOccupancy || 2,
                        totalInventory: r.totalInventory || 1,
                        status: r.status || "active",
                        isHourlyEnabled: r.isHourlyEnabled || false,
                        description: r.description || "",
                        
                        amenities: formatListField(r.amenities),
                        highlights: formatListField(r.highlights),
                        capacityAdults: r.capacityAdults || 2,
                        capacityChildren: r.capacityChildren || 0,
                        capacityInfants: r.capacityInfants || 0,
                        viewType: r.viewType || "City",
                        floorNumber: r.floorNumber !== undefined && r.floorNumber !== null ? r.floorNumber : null,
                        isCornerRoom: r.isCornerRoom || false,
                        extraBedCharge: r.extraBedCharge || 0,
                        securityDeposit: r.securityDeposit || 0,
                        isRefundable: r.isRefundable !== false,
                        isTaxIncluded: r.isTaxIncluded || false,
                        hourlyRates: typeof r.hourlyRates === 'string' ? r.hourlyRates : JSON.stringify(r.hourlyRates || {}),
                        images: parseImagesArray(r.images),
                        videoUrl: r.videoUrl || "",
                        media360Url: r.media360Url || "",
                        minStay: r.minStay || 1,
                        maxStay: r.maxStay || 90,
                        isInstantBooking: r.isInstantBooking !== false,
                        advanceBookingDays: r.advanceBookingDays || 0,
                        advancePayment: r.advancePayment || 0,
                        tags: formatListField(r.tags),
                        isFeatured: r.isFeatured || false,
                        displayPriority: r.displayPriority || 0,
                        seoTitle: r.seoTitle || "",
                        seoDescription: r.seoDescription || "",
                        slug: r.slug || "",

                        // Meal Plan Pricing
                        epPrice: epVal ? (Number(epVal.price) || null) : null,
                        cpPrice: cpVal ? (Number(cpVal.price) || null) : null,
                        mapPrice: mapVal ? (Number(mapVal.price) || null) : null,
                        apPrice: apVal ? (Number(apVal.price) || null) : null,
                        cancellationPolicy: policyVal || "Free cancellation till 24h"
                    };
                });
                setRooms(normalized);
                setOriginalRooms(normalized);
            }
        } catch (err: any) {
            console.error("Failed to fetch rooms:", err);
            setSaveLog({ type: "error", message: "Failed to load rooms for this property." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedHotelId !== null) {
            fetchRooms(selectedHotelId);
            setIsEditing(false);
            setDeleteIds([]);
        }
    }, [selectedHotelId]);

    const handleAddRow = () => {
        const tempId = -Math.floor(Math.random() * 1000000 + 1);
        const newRoom: RoomItem = {
            id: tempId,
            name: "New Room Type",
            pricePerNight: 2000,
            bedConfiguration: "1 King Bed",
            sizeM2: 25,
            maxOccupancy: 2,
            totalInventory: 5,
            status: "active",
            isHourlyEnabled: false,
            description: "",
            
            amenities: "",
            highlights: "",
            capacityAdults: 2,
            capacityChildren: 0,
            capacityInfants: 0,
            viewType: "City",
            floorNumber: 1,
            isCornerRoom: false,
            extraBedCharge: 0,
            securityDeposit: 0,
            isRefundable: true,
            isTaxIncluded: false,
            hourlyRates: "{}",
            images: [],
            videoUrl: "",
            media360Url: "",
            minStay: 1,
            maxStay: 90,
            isInstantBooking: true,
            advanceBookingDays: 0,
            advancePayment: 0,
            tags: "",
            isFeatured: false,
            displayPriority: 0,
            seoTitle: "",
            seoDescription: "",
            slug: "",

            // Meal Plan Default Pricing
            epPrice: 2000,
            cpPrice: 2400,
            mapPrice: 3000,
            apPrice: 3800,
            cancellationPolicy: "Free cancellation till 24h"
        };
        setRooms(prev => [...prev, newRoom]);
    };

    const handleCellChange = (id: number, field: keyof RoomItem, value: any) => {
        setRooms(prev => prev.map(r => {
            if (r.id === id) {
                return { ...r, [field]: value };
            }
            return r;
        }));
    };

    // File selection handler - loads local files to base64 data URLs
    const handleFileChange = (roomId: number, files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (files.length > 20) {
            alert("You can upload a maximum of 20 images at once.");
            return;
        }
        
        const currentImages = rooms.find(r => r.id === roomId)?.images || [];
        
        if (currentImages.length + files.length > 20) {
            alert(`A room category can have a maximum of 20 images. You currently have ${currentImages.length}.`);
            return;
        }
        
        const loaders = Array.from(files).map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        resolve(e.target.result as string);
                    } else {
                        resolve("");
                    }
                };
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(loaders).then(base64s => {
            const cleanBase64s = base64s.filter(Boolean);
            const updatedList = [...currentImages, ...cleanBase64s];
            handleCellChange(roomId, "images", updatedList);
        });
    };

    const handleDeleteRow = (id: number) => {
        if (id > 0) {
            setDeleteIds(prev => [...prev, id]);
        }
        setRooms(prev => prev.filter(r => r.id !== id));
    };

    const handleSave = async () => {
        if (selectedHotelId === null) return;
        
        const invalidRoom = rooms.find(r => !r.name.trim());
        if (invalidRoom) {
            setSaveLog({ type: "error", message: "Room Name cannot be empty." });
            return;
        }

        // Validations
        const totalImagesAcrossRooms = rooms.reduce((sum, r) => sum + (r.images || []).length, 0);
        if (totalImagesAcrossRooms < 1) {
            setSaveLog({ 
                type: "error", 
                message: "Validation Error: Please upload at least 1 image to at least one of the room categories." 
            });
            return;
        }

        for (const room of rooms) {
            // 1. Meal plan pricing validation
            const base = room.pricePerNight;
            const ep = room.epPrice;
            const cp = room.cpPrice;

            if (ep !== null && cp !== null && cp < ep) {
                setSaveLog({ 
                    type: "error", 
                    message: `Validation Error for ${room.name}: CP price (₹${cp}) cannot be cheaper than EP price (₹${ep}).` 
                });
                return;
            }

            if (ep !== null || cp !== null) {
                const matchesBase = (ep !== null && Math.abs(ep - base) < 0.01) || (cp !== null && Math.abs(cp - base) < 0.01);
                if (!matchesBase) {
                    setSaveLog({ 
                        type: "error", 
                        message: `Validation Error for ${room.name}: Either EP price or CP price must match the Room Base Price (₹${base}).` 
                    });
                    return;
                }
            }

            // 2. Images count validation: maximum 20 per category
            const imgList = room.images || [];
            if (imgList.length > 20) {
                setSaveLog({ 
                    type: "error", 
                    message: `Validation Error for ${room.name}: You cannot have more than 20 images. (Currently has ${imgList.length} images).` 
                });
                return;
            }
        }

        setIsSaving(true);
        setSaveLog({ type: null, message: "" });

        try {
            const roomsPayload = rooms.map(r => {
                const clean = { ...r };

                // Reconstruct variants array of objects
                const variantsList = [];
                if (r.epPrice !== null && r.epPrice !== undefined && r.epPrice !== 0) {
                    variantsList.push({
                        id: 1,
                        mealPlan: "Room Only",
                        price: Number(r.epPrice),
                        policy: r.cancellationPolicy || "Free cancellation till 24h"
                    });
                }
                if (r.cpPrice !== null && r.cpPrice !== undefined && r.cpPrice !== 0) {
                    variantsList.push({
                        id: 2,
                        mealPlan: "Breakfast Included",
                        price: Number(r.cpPrice),
                        policy: r.cancellationPolicy || "Free cancellation till 24h"
                    });
                }
                if (r.mapPrice !== null && r.mapPrice !== undefined && r.mapPrice !== 0) {
                    variantsList.push({
                        id: 3,
                        mealPlan: "Breakfast + Meal",
                        price: Number(r.mapPrice),
                        policy: r.cancellationPolicy || "Free cancellation till 24h"
                    });
                }
                if (r.apPrice !== null && r.apPrice !== undefined && r.apPrice !== 0) {
                    variantsList.push({
                        id: 4,
                        mealPlan: "All Inclusive",
                        price: Number(r.apPrice),
                        policy: r.cancellationPolicy || "Free cancellation till 24h"
                    });
                }

                (clean as any).variants = JSON.stringify(variantsList);

                // Clean local helper fields
                delete (clean as any).epPrice;
                delete (clean as any).cpPrice;
                delete (clean as any).mapPrice;
                delete (clean as any).apPrice;
                delete (clean as any).cancellationPolicy;

                (clean as any).images = JSON.stringify(r.images);

                if (clean.id < 0) {
                    delete (clean as any).id; 
                }
                return clean;
            });

            const res = await hotelApi.bulkUpdateRooms(selectedHotelId, roomsPayload, deleteIds);
            if (res.success) {
                setSaveLog({ type: "success", message: "Bulk changes saved successfully!" });
                setIsEditing(false);
                setDeleteIds([]);
                await fetchRooms(selectedHotelId);
            } else {
                setSaveLog({ type: "error", message: res.message || "Failed to save bulk changes." });
            }
        } catch (err: any) {
            setSaveLog({ type: "error", message: err.message || "An unexpected error occurred." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setRooms(originalRooms);
        setDeleteIds([]);
        setIsEditing(false);
        setSaveLog({ type: null, message: "" });
    };

    const filteredRooms = rooms.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.bedConfiguration.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 font-sans text-neutral-100">
            {/* Top Selector Panel - Pure Black Skeuomorphic */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl">
                <div className="text-left">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Room Bulk Setup</h3>
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest mt-0.5">
                        Inline spreadsheet-like batch editor for property room inventories
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Filter rooms..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            disabled={loading}
                            className="pl-9 pr-3 py-2 w-full sm:w-48 bg-[#141414] border border-[#262626] rounded-xl focus:outline-none focus:border-neutral-500 font-mono text-xs text-white placeholder:text-neutral-600 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedHotelId || ""}
                            onChange={e => {
                                setSelectedHotelId(Number(e.target.value));
                            }}
                            disabled={loading || isEditing}
                            className="w-full sm:w-64 pl-3.5 pr-8 py-2 bg-[#141414] border border-[#262626] rounded-xl font-mono text-xs text-white uppercase tracking-wider focus:outline-none focus:border-neutral-500 cursor-pointer disabled:opacity-50"
                        >
                            <option value="" disabled className="bg-black text-white">Choose Property...</option>
                            {hotels.map(h => (
                                <option key={h.id} value={h.id} className="bg-black text-white">
                                    {h.name} ({h.city})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Display */}
            {saveLog.type && (
                <div className={cn(
                    "p-3.5 border text-xs font-bold flex items-start gap-2.5 rounded-xl shadow-md",
                    saveLog.type === "success" ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-300" : "bg-red-950/80 border-red-800/40 text-red-300"
                )}>
                    {saveLog.type === "success" ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{saveLog.message}</span>
                </div>
            )}

            {/* Main Editor Component with High-Density Category Tabs */}
            <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] rounded-2xl overflow-hidden flex flex-col">
                
                {/* Horizontal Scrollable Category Tabs Bar */}
                <div className="border-b border-[#1f1f1f] bg-[#0e0e0e] px-4 pt-3">
                    <div className="flex gap-1 overflow-x-auto scrollbar-none flex-nowrap -mb-px">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setCurrentTab(tab.id)}
                                    className={cn(
                                        "px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                                        currentTab === tab.id
                                            ? "border-white text-white bg-[#141414] rounded-t-xl"
                                            : "border-transparent text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* High Density CSV Spreadsheet Table */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse divide-y divide-[#181818] min-w-[1300px]">
                        <thead className="bg-[#0e0e0e] border-b border-[#1f1f1f]">
                            <tr>
                                {/* Pinned room name column */}
                                <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[170px]">Room Name</th>
                                
                                {currentTab === "general" && (
                                    <>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28">Status</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[200px]">Description</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Inventory</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[200px]">Amenities</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[200px]">Highlights</th>
                                    </>
                                )}

                                {currentTab === "occupancy-location" && (
                                    <>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-36">Bed Configuration</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Size (sq. ft)</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Max Occupancy</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-20 text-center">Adults</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-20 text-center">Children</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-20 text-center">Infants</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-32">View Type</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Floor</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Corner Room</th>
                                    </>
                                )}

                                {currentTab === "pricing" && (
                                    <>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">Price per Night</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Hourly Enabled</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[200px]">Hourly Rates (JSON)</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">Extra Bed Charge</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">Security Deposit</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Refundable</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Tax Included</th>
                                    </>
                                )}

                                {currentTab === "rate-plans" && (
                                    <>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">EP Price (Room Only)</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">CP Price (Breakfast)</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">MAP Price (Breakfast+1)</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">AP Price (All Meals)</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[200px]">Cancellation Policy</th>
                                    </>
                                )}

                                {currentTab === "booking-rules" && (
                                    <>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Min Stay</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Max Stay</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">Instant Booking</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">Advance Days</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-28 text-center">Advance Payment (%)</th>
                                    </>
                                )}

                                {currentTab === "media" && (
                                    <>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[320px]">Room Images (Min 1, Max 20)</th>
                                    </>
                                )}

                                {currentTab === "search-visibility" && (
                                    <>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[200px]">Tags</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Featured</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] w-24 text-center">Display Priority</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[170px]">SEO Title</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[200px]">SEO Description</th>
                                        <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-r border-[#1f1f1f] min-w-[130px]">Slug</th>
                                    </>
                                )}

                                {isEditing && <th className="px-3.5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-wider text-center w-16">Remove</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#181818] text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Fetching room models...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRooms.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider italic">
                                        No room inventories setup for this property yet. Click "Edit All Rooms" to add room categories.
                                    </td>
                                </tr>
                            ) : (
                                filteredRooms.map(room => {
                                    const roomImages = room.images || [];
                                    return (
                                        <tr key={room.id} className="hover:bg-[#121212] transition-colors">
                                            {/* Room Name */}
                                            <td className="px-3.5 py-2.5 border-r border-[#181818]">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={room.name}
                                                        onChange={e => handleCellChange(room.id, "name", e.target.value)}
                                                        className="w-full bg-[#141414] border border-[#262626] px-2.5 py-1 text-xs font-bold text-white focus:border-neutral-500 outline-none rounded-lg"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-white">{room.name}</span>
                                                )}
                                            </td>

                                            {currentTab === "general" && (
                                                <>
                                                    <td className="px-3.5 py-2.5 border-r border-[#181818]">
                                                        {isEditing ? (
                                                            <select
                                                                value={room.status}
                                                                onChange={e => handleCellChange(room.id, "status", e.target.value)}
                                                                className="w-full bg-[#141414] border border-[#262626] px-2 py-1 text-[11px] font-bold text-white focus:border-neutral-500 outline-none rounded-lg uppercase"
                                                            >
                                                                <option value="active" className="bg-black text-white">Active</option>
                                                                <option value="maintenance" className="bg-black text-white">Maintenance</option>
                                                                <option value="inactive" className="bg-black text-white">Inactive</option>
                                                            </select>
                                                        ) : (
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border",
                                                                room.status === "active" ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/40" : "bg-red-950/80 text-red-400 border-red-800/40"
                                                            )}>
                                                                {room.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-2.5 border-r border-[#181818]">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.description}
                                                                onChange={e => handleCellChange(room.id, "description", e.target.value)}
                                                                placeholder="Short description..."
                                                                className="w-full bg-[#141414] border border-[#262626] px-2 py-1 text-[11px] font-medium text-white focus:border-neutral-500 outline-none rounded-lg"
                                                            />
                                                        ) : (
                                                            <p className="text-[11px] text-neutral-400 truncate max-w-[200px]" title={room.description}>{room.description || "—"}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-2.5 border-r border-[#181818] text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.totalInventory}
                                                                onChange={e => handleCellChange(room.id, "totalInventory", Number(e.target.value))}
                                                                className="w-16 bg-[#141414] border border-[#262626] px-1 py-1 text-xs font-bold text-white focus:border-neutral-500 outline-none rounded-lg text-center font-mono"
                                                            />
                                                        ) : (
                                                            <span className="font-bold text-white">{room.totalInventory} U</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-2.5 border-r border-[#181818]">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.amenities}
                                                                onChange={e => handleCellChange(room.id, "amenities", e.target.value)}
                                                                placeholder="AC, WiFi, TV..."
                                                                className="w-full bg-[#141414] border border-[#262626] px-2 py-1 text-[11px] font-medium text-white focus:border-neutral-500 outline-none rounded-lg"
                                                            />
                                                        ) : (
                                                            <span className="text-[11px] text-neutral-400 truncate max-w-[180px] block" title={room.amenities}>{room.amenities || "—"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-2.5 border-r border-[#181818]">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.highlights}
                                                                onChange={e => handleCellChange(room.id, "highlights", e.target.value)}
                                                                placeholder="Balcony, Lake View..."
                                                                className="w-full bg-[#141414] border border-[#262626] px-2 py-1 text-[11px] font-medium text-white focus:border-neutral-500 outline-none rounded-lg"
                                                            />
                                                        ) : (
                                                            <span className="text-[11px] text-neutral-400 truncate max-w-[180px] block" title={room.highlights}>{room.highlights || "—"}</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Tab 2: Occupancy & Location */}
                                            {currentTab === "occupancy-location" && (
                                                <>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.bedConfiguration}
                                                                onChange={e => handleCellChange(room.id, "bedConfiguration", e.target.value)}
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-600">{room.bedConfiguration}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.sizeM2}
                                                                onChange={e => handleCellChange(room.id, "sizeM2", Number(e.target.value))}
                                                                className="w-16 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.sizeM2 || "—"} sq.ft</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.maxOccupancy}
                                                                onChange={e => handleCellChange(room.id, "maxOccupancy", Number(e.target.value))}
                                                                className="w-12 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.maxOccupancy} Pax</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.capacityAdults}
                                                                onChange={e => handleCellChange(room.id, "capacityAdults", Number(e.target.value))}
                                                                className="w-12 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.capacityAdults}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.capacityChildren}
                                                                onChange={e => handleCellChange(room.id, "capacityChildren", Number(e.target.value))}
                                                                className="w-12 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.capacityChildren}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.capacityInfants}
                                                                onChange={e => handleCellChange(room.id, "capacityInfants", Number(e.target.value))}
                                                                className="w-12 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.capacityInfants}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <select
                                                                value={room.viewType}
                                                                onChange={e => handleCellChange(room.id, "viewType", e.target.value)}
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm cursor-pointer"
                                                            >
                                                                <option value="City View">City View</option>
                                                                <option value="Sea View">Sea View</option>
                                                                <option value="Mountain View">Mountain View</option>
                                                                <option value="Garden View">Garden View</option>
                                                                <option value="Pool View">Pool View</option>
                                                                <option value="Lake View">Lake View</option>
                                                                <option value="River View">River View</option>
                                                                <option value="Street View">Street View</option>
                                                            </select>
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.viewType || "City View"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.floorNumber || ""}
                                                                onChange={e => handleCellChange(room.id, "floorNumber", e.target.value === "" ? null : Number(e.target.value))}
                                                                className="w-16 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.floorNumber !== null ? `F ${room.floorNumber}` : "—"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={room.isCornerRoom}
                                                                onChange={e => handleCellChange(room.id, "isCornerRoom", e.target.checked)}
                                                                className="w-3.5 h-3.5 border-slate-300 text-slate-800 rounded focus:ring-slate-400 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <span className={cn(
                                                                "px-1.5 py-0.2 rounded-sm text-[7.5px] font-black uppercase border tracking-wider",
                                                                room.isCornerRoom ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                            )}>
                                                                {room.isCornerRoom ? "Corner" : "No"}
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Tab 3: Pricing Fields */}
                                            {currentTab === "pricing" && (
                                                <>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.pricePerNight}
                                                                onChange={e => handleCellChange(room.id, "pricePerNight", Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-bold text-slate-800">₹{room.pricePerNight.toLocaleString()}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={room.isHourlyEnabled}
                                                                onChange={e => handleCellChange(room.id, "isHourlyEnabled", e.target.checked)}
                                                                className="w-3.5 h-3.5 border-slate-300 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <span className={cn(
                                                                "px-1.5 py-0.2 rounded-sm text-[7.5px] font-black uppercase border tracking-wider",
                                                                room.isHourlyEnabled ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                            )}>
                                                                {room.isHourlyEnabled ? "Hourly" : "No"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.hourlyRates}
                                                                onChange={e => handleCellChange(room.id, "hourlyRates", e.target.value)}
                                                                placeholder='{"3": 1200}'
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm"
                                                            />
                                                        ) : (
                                                            <code className="text-[9.5px] text-slate-500 font-mono truncate max-w-[180px]" title={room.hourlyRates}>{room.hourlyRates || "{}"}</code>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.extraBedCharge}
                                                                onChange={e => handleCellChange(room.id, "extraBedCharge", Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">₹{room.extraBedCharge.toLocaleString()}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.securityDeposit}
                                                                onChange={e => handleCellChange(room.id, "securityDeposit", Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">₹{room.securityDeposit.toLocaleString()}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={room.isRefundable}
                                                                onChange={e => handleCellChange(room.id, "isRefundable", e.target.checked)}
                                                                className="w-3.5 h-3.5 border-slate-300 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <span className={cn(
                                                                "px-1.5 py-0.2 rounded-sm text-[7.5px] font-black uppercase border tracking-wider",
                                                                room.isRefundable ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                                                            )}>
                                                                {room.isRefundable ? "Refundable" : "Non-Ref"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={room.isTaxIncluded}
                                                                onChange={e => handleCellChange(room.id, "isTaxIncluded", e.target.checked)}
                                                                className="w-3.5 h-3.5 border-slate-300 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <span className={cn(
                                                                "px-1.5 py-0.2 rounded-sm text-[7.5px] font-black uppercase border tracking-wider",
                                                                room.isTaxIncluded ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                            )}>
                                                                {room.isTaxIncluded ? "Tax Inc" : "Plus Tax"}
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Tab 4: Rate Plans (Meal Plans EP, CP, MAP, AP) */}
                                            {currentTab === "rate-plans" && (
                                                <>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.epPrice || ""}
                                                                onChange={e => handleCellChange(room.id, "epPrice", e.target.value === "" ? null : Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                                placeholder="₹ Room Only"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-bold text-slate-850">{room.epPrice !== null ? `₹${room.epPrice.toLocaleString()}` : "—"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.cpPrice || ""}
                                                                onChange={e => handleCellChange(room.id, "cpPrice", e.target.value === "" ? null : Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                                placeholder="₹ Breakfast"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-bold text-slate-850">{room.cpPrice !== null ? `₹${room.cpPrice.toLocaleString()}` : "—"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.mapPrice || ""}
                                                                onChange={e => handleCellChange(room.id, "mapPrice", e.target.value === "" ? null : Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                                placeholder="₹ Half Board"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-bold text-slate-850">{room.mapPrice !== null ? `₹${room.mapPrice.toLocaleString()}` : "—"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.apPrice || ""}
                                                                onChange={e => handleCellChange(room.id, "apPrice", e.target.value === "" ? null : Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                                placeholder="₹ Full Board"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-bold text-slate-850">{room.apPrice !== null ? `₹${room.apPrice.toLocaleString()}` : "—"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.cancellationPolicy}
                                                                onChange={e => handleCellChange(room.id, "cancellationPolicy", e.target.value)}
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-medium text-slate-700 focus:border-slate-400 outline-none rounded-sm"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-600 truncate max-w-[200px]" title={room.cancellationPolicy}>{room.cancellationPolicy || "—"}</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Tab 5: Booking Rules */}
                                            {currentTab === "booking-rules" && (
                                                <>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.minStay}
                                                                onChange={e => handleCellChange(room.id, "minStay", Number(e.target.value))}
                                                                className="w-16 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.minStay} N</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.maxStay}
                                                                onChange={e => handleCellChange(room.id, "maxStay", Number(e.target.value))}
                                                                className="w-16 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.maxStay} N</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={room.isInstantBooking}
                                                                onChange={e => handleCellChange(room.id, "isInstantBooking", e.target.checked)}
                                                                className="w-3.5 h-3.5 border-slate-300 text-slate-800 rounded focus:ring-slate-400 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <span className={cn(
                                                                "px-1.5 py-0.2 rounded-sm text-[7.5px] font-black uppercase border tracking-wider",
                                                                room.isInstantBooking ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                            )}>
                                                                {room.isInstantBooking ? "Instant" : "Request"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.advanceBookingDays}
                                                                onChange={e => handleCellChange(room.id, "advanceBookingDays", Number(e.target.value))}
                                                                className="w-20 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.advanceBookingDays} D</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.advancePayment}
                                                                onChange={e => handleCellChange(room.id, "advancePayment", Number(e.target.value))}
                                                                className="w-16 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.advancePayment}%</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Tab 6: Media Fields (With local multiple image uploader gallery) */}
                                            {currentTab === "media" && (() => {
                                                const imgList: string[] = Array.isArray(room.images)
                                                    ? room.images
                                                    : (typeof room.images === 'string' ? safeParse(room.images, []) : []);
                                                return (
                                                    <td className="px-3.5 py-2.5 border-r border-[#181818]">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-1.5 py-0.5 max-w-[320px] overflow-x-auto scrollbar-none flex-nowrap">
                                                                {imgList.map((url: string, idx: number) => (
                                                                    <div key={idx} className="relative shrink-0 w-8 h-8 border border-[#282828] rounded overflow-hidden group">
                                                                        <img src={url} alt="Room" className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updated = imgList.filter((_, i) => i !== idx);
                                                                                handleCellChange(room.id, "images", updated);
                                                                            }}
                                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                                            title="Remove Image"
                                                                        >
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {imgList.length < 20 && (
                                                                    <label className="flex items-center justify-center w-8 h-8 border border-dashed border-[#333333] hover:border-neutral-400 rounded bg-[#141414] hover:bg-[#1a1a1a] cursor-pointer transition-colors shrink-0">
                                                                        <Plus className="w-3.5 h-3.5 text-neutral-400" />
                                                                        <input
                                                                            type="file"
                                                                            multiple
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={e => handleFileChange(room.id, e.target.files)}
                                                                        />
                                                                    </label>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] scrollbar-none py-0.5 flex-nowrap">
                                                                {imgList.length === 0 ? (
                                                                    <span className="text-[10px] text-neutral-500 font-bold italic">No images</span>
                                                                ) : (
                                                                    imgList.slice(0, 4).map((url: string, index: number) => (
                                                                        <img
                                                                            key={index}
                                                                            src={url}
                                                                            alt="Room preview"
                                                                            className="w-7 h-7 object-cover rounded border border-[#282828] shrink-0"
                                                                        />
                                                                    ))
                                                                )}
                                                                {imgList.length > 4 && (
                                                                    <span className="px-1 py-0.5 bg-[#181818] text-neutral-300 rounded text-[7.5px] font-bold uppercase shrink-0">
                                                                        +{imgList.length - 4}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })()}

                                            {/* Tab 7: Search Visibility & SEO Fields */}
                                            {currentTab === "search-visibility" && (
                                                <>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.tags}
                                                                onChange={e => handleCellChange(room.id, "tags", e.target.value)}
                                                                placeholder="Couple Friendly, Best Seller..."
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-medium text-slate-700 focus:border-slate-400 outline-none rounded-sm"
                                                            />
                                                        ) : (
                                                            <p className="text-[10px] text-slate-500 truncate max-w-[180px]" title={room.tags}>{room.tags || "—"}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={room.isFeatured}
                                                                onChange={e => handleCellChange(room.id, "isFeatured", e.target.checked)}
                                                                className="w-3.5 h-3.5 border-slate-300 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
                                                            />
                                                        ) : (
                                                            <span className={cn(
                                                                "px-1.5 py-0.2 rounded-sm text-[7.5px] font-black uppercase border tracking-wider",
                                                                room.isFeatured ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                            )}>
                                                                {room.isFeatured ? "Featured" : "No"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={room.displayPriority}
                                                                onChange={e => handleCellChange(room.id, "displayPriority", Number(e.target.value))}
                                                                className="w-16 bg-white border border-slate-200 px-1 py-0.5 text-[10.5px] font-bold text-slate-800 focus:border-slate-400 outline-none rounded-sm text-center"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-bold text-slate-800">{room.displayPriority}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.seoTitle}
                                                                onChange={e => handleCellChange(room.id, "seoTitle", e.target.value)}
                                                                placeholder="SEO Title..."
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-medium text-slate-700 focus:border-slate-400 outline-none rounded-sm"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-medium text-slate-700">{room.seoTitle || "—"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.seoDescription}
                                                                onChange={e => handleCellChange(room.id, "seoDescription", e.target.value)}
                                                                placeholder="SEO Description..."
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-medium text-slate-700 focus:border-slate-400 outline-none rounded-sm"
                                                            />
                                                        ) : (
                                                            <p className="text-[10px] text-slate-500 truncate max-w-[180px]" title={room.seoDescription}>{room.seoDescription || "—"}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 border-r border-slate-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={room.slug}
                                                                onChange={e => handleCellChange(room.id, "slug", e.target.value)}
                                                                placeholder="seo-room-slug..."
                                                                className="w-full bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-medium text-slate-700 focus:border-slate-400 outline-none rounded-sm"
                                                            />
                                                        ) : (
                                                            <span className="text-[10.5px] font-mono text-slate-600">{room.slug || "—"}</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Delete Action (edit mode only) */}
                                            {isEditing && (
                                                <td className="px-3 py-1.5 text-center">
                                                    <button
                                                        onClick={() => handleDeleteRow(room.id)}
                                                        className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                                                        title="Delete Row"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 justify-between items-center">
                    <div>
                        {deleteIds.length > 0 && (
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                                * {deleteIds.length} categories marked for deletion
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleAddRow}
                                    disabled={loading || isSaving}
                                    className="px-4 py-2 bg-slate-800 text-white hover:bg-black font-black text-[8.5px] uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                >
                                    <Plus className="w-3 h-3" /> Add Row
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading || isSaving}
                                    className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 font-black text-[8.5px] uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3 h-3" /> Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[8.5px] uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={loading || selectedHotelId === null}
                                className="px-4 py-2 bg-slate-900 text-white hover:bg-black font-black text-[8.5px] uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                            >
                                <Edit3 className="w-3 h-3" /> Edit All Rooms
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Note info */}
            <div className="p-3 bg-slate-50 border border-slate-200 text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 rounded-sm">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Note: In media validation, each room category must have at least 1 image (maximum 20). Local uploads are saved safely as compressed WebP assets.
            </div>
        </div>
    );
}
