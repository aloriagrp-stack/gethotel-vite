

import { useState, useEffect } from "react";
import { useNavigate as useRouter, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
    Bed, Plus, Edit3, Trash2, Loader2, 
    Users, Maximize2, Coffee, Wifi, 
    Tv, Wind, Shield, CheckCircle2,
    XCircle, ImageIcon, Info, Save,
    X, ChevronRight, LayoutGrid, List as ListIcon,
    ShieldCheck, BedDouble, Zap, Clock
} from "lucide-react";
import { cn, safeParse } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price || 0);
};

// Smart Image Compression Utility
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Max dimensions 1200px
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert to WebP with 0.7 quality
                const webpData = canvas.toDataURL('image/webp', 0.7);
                resolve(webpData);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

// Resilient Image Extraction with Recursive Parsing
const getImages = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    
    if (typeof data === 'string') {
        // Try parsing (handling double-encoding)
        try {
            let parsed = JSON.parse(data);
            if (typeof parsed === 'string') return getImages(parsed); // Recursive parse
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            // Handle comma-separated fallback
            if (data.includes(',')) return data.split(',').map(s => s.trim()).filter(Boolean);
            // Single image string
            if (data.trim().startsWith('http') || data.trim().startsWith('data:image')) return [data.trim()];
        }
    }
    return [];
};

// Generic Robust Parser
const robustParse = (data: any, fallback: any = []) => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') return data;
    
    try {
        let parsed = JSON.parse(data);
        if (typeof parsed === 'string') return robustParse(parsed, fallback);
        return parsed || fallback;
    } catch (e) {
        return fallback;
    }
};

export default function PartnerRoomsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showHourlyConfirm, setShowHourlyConfirm] = useState(false);

    const commonHighlights = [
        { label: "Cancellation", options: ["Free till 24h", "Non-refundable", "Free till 48h"] },
        { label: "Bedding", options: ["1 King Bed", "1 Queen Bed", "2 Single Beds", "1 Double Bed"] },
        { label: "Meal Plan", options: ["Breakfast Included", "Room Only", "All Meals Included", "Dinner Included"] },
        { label: "Room Size", options: ["250 sq. ft.", "280 sq. ft.", "350 sq. ft.", "500 sq. ft."] }
    ];

    const predefinedTrustPoints = [
        "Free Cancellation until 24 hours before check-in",
        "Pay remaining 82% at the hotel during check-in",
        "Secure booking with instant confirmation",
        "Professionally sanitized & cleaned rooms",
        "Guaranteed best price for this property",
        "No prepayment required",
        "Free early check-in (subject to availability)"
    ];

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        pricePerNight: "",
        maxOccupancy: "2",
        bedConfiguration: "1 King Bed",
        sizeM2: "250",
        amenities: [] as string[],
        images: [] as string[],
        highlights: [
            { icon: "ShieldCheck", label: "Cancellation", value: "Free till 24h", isCustom: false },
            { icon: "BedDouble", label: "Bedding", value: "1 King Bed", isCustom: false },
            { icon: "Coffee", label: "Meal Plan", value: "Breakfast", isCustom: false },
            { icon: "Maximize2", label: "Room Size", value: "280 sq. ft.", isCustom: false }
        ],
        trustPoints: [
            "Free Cancellation until 24 hours before check-in",
            "Pay remaining 82% at the hotel during check-in",
            "Secure booking with instant confirmation"
        ],
        roomPolicies: {
            hotelPolicies: "",
            houseRules: "",
            cancellation: "",
            payment: ""
        },
        minPrice: "",
        maxPrice: "",
        weeklyDiscount: "0",
        monthlyDiscount: "0",
        variants: [] as any[],
        isHourlyEnabled: false,
        hourlyRates: { "3": "", "6": "", "12": "" }
    });
    const [customTrustPoint, setCustomTrustPoint] = useState("");

    const commonAmenities = [
        "WiFi", "TV", "Air Conditioning", "Coffee Maker", 
        "Mini Bar", "Room Service", "Balcony", "Safe Box",
        "Work Desk", "Bathtub", "Premium Toiletries", "Hair Dryer",
        "Ironing Board", "Electric Kettle", "Soundproofing"
    ];

    const bedOptions = ["1 Single Bed", "2 Single Beds", "1 Double Bed", "1 Queen Bed", "1 King Bed", "1 King + 1 Single", "2 Double Beds", "2 Queen Beds"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await hotelApi.getMyHotels();
                if (res.success && res.data && res.data.length > 0) {
                    const myHotel = res.data[0];
                    setHotel(myHotel);
                    // Prisma returns room[] as 'room' singular in the relation
                    setRooms(myHotel.rooms || myHotel.room || []);
                }
            } catch (err) {
                console.error("Failed to fetch rooms", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchData();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleOpenModal = (room: any = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                name: room.name,
                description: room.description || "",
                pricePerNight: room.pricePerNight.toString(),
                maxOccupancy: room.maxOccupancy.toString(),
                bedConfiguration: room.bedConfiguration || "1 King Bed",
                sizeM2: room.sizeM2?.toString() || "250",
                amenities: robustParse(room.amenities || room.room_amenities),
                images: getImages(room.images),
                highlights: (robustParse(room.highlights || room.room_highlights || room.highlights, []).length > 0 
                    ? robustParse(room.highlights || room.room_highlights || room.highlights, []) 
                    : [
                        { icon: "ShieldCheck", label: "Cancellation", value: "Free till 24h", isCustom: false },
                        { icon: "BedDouble", label: "Bedding", value: "1 King Bed", isCustom: false },
                        { icon: "Coffee", label: "Meal Plan", value: "Breakfast", isCustom: false },
                        { icon: "Maximize2", label: "Room Size", value: "280 sq. ft.", isCustom: false }
                    ]
                ).map((h: any) => ({
                    ...h,
                    isCustom: h.isCustom ?? !commonHighlights.find(ch => ch.label === h.label)?.options.includes(h.value)
                })),
                trustPoints: robustParse(room.trustPoints || room.trust_points || room.trustPoints, [
                    "Free Cancellation until 24 hours before check-in",
                    "Pay remaining 82% at the hotel during check-in",
                    "Secure booking with instant confirmation"
                ]),
                roomPolicies: robustParse(room.roomPolicies || room.room_policies || room.policies, {
                    hotelPolicies: "",
                    houseRules: "",
                    cancellation: "",
                    payment: ""
                }),
                minPrice: room.minPrice || room.min_price || "",
                maxPrice: room.maxPrice || room.max_price || "",
                weeklyDiscount: room.weeklyDiscount || room.weekly_discount || "0",
                monthlyDiscount: room.monthlyDiscount || room.monthly_discount || "0",
                variants: robustParse(room.variants || room.room_variants || room.variants, []),
                isHourlyEnabled: room.isHourlyEnabled || room.is_hourly_enabled || false,
                hourlyRates: robustParse(room.hourlyRates || room.hourly_rates || room.hourlyRates, { "3": "", "6": "", "12": "" })
            });
        } else {
            setEditingRoom(null);
            setFormData({
                name: "",
                description: "",
                pricePerNight: "",
                maxOccupancy: "2",
                bedConfiguration: "1 King Bed",
                sizeM2: "250",
                amenities: [],
                images: [],
                highlights: [
                    { icon: "ShieldCheck", label: "Cancellation", value: "Free till 24h", isCustom: false },
                    { icon: "BedDouble", label: "Bedding", value: "1 King Bed", isCustom: false },
                    { icon: "Coffee", label: "Meal Plan", value: "Breakfast", isCustom: false },
                    { icon: "Maximize2", label: "Room Size", value: "280 sq. ft.", isCustom: false }
                ],
                trustPoints: [
                    "Free Cancellation until 24 hours before check-in",
                    "Pay remaining 82% at the hotel during check-in",
                    "Secure booking with instant confirmation"
                ],
                roomPolicies: {
                    hotelPolicies: "",
                    houseRules: "",
                    cancellation: "",
                    payment: ""
                },
                minPrice: "",
                maxPrice: "",
                weeklyDiscount: "0",
                monthlyDiscount: "0",
                variants: [],
                isHourlyEnabled: false,
                hourlyRates: { "3": "", "6": "", "12": "" }
            });
        }
        setIsEditing(true);
    };

    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // VALIDATION: Min 5, Max 15 images
        if (formData.images.length < 5) {
            alert("Please add at least 5 images of the room.");
            return;
        }
        if (formData.images.length > 15) {
            alert("Maximum 15 images allowed.");
            return;
        }

        const currentPrice = parseFloat(formData.pricePerNight.toString()) || 0;
        const minVal = parseFloat(formData.minPrice.toString()) || 0;
        const maxVal = parseFloat(formData.maxPrice.toString()) || 0;

        if (minVal > 0 && currentPrice < minVal) {
            alert(`Wait! The price you set (${currentPrice}) is below your Minimum Allowed Rate (${minVal}). Please adjust the price.`);
            return;
        }
        if (maxVal > 0 && currentPrice > maxVal) {
            alert(`Hold on! The price you set (${currentPrice}) exceeds your Maximum Allowed Rate (${maxVal}). Please adjust the price.`);
            return;
        }

        const weeklyDisc = parseInt(formData.weeklyDiscount.toString()) || 0;
        const monthlyDisc = parseInt(formData.monthlyDiscount.toString()) || 0;

        if (weeklyDisc > 100 || monthlyDisc > 100) {
            alert("Discount cannot be more than 100%. Please check Weekly/Monthly Stay Discounts.");
            return;
        }

        setIsSaving(true);
        try {
            // Ensure numbers are handled
            const dataToSave = {
                ...formData,
                pricePerNight: parseFloat(formData.pricePerNight.toString()) || 0,
                maxOccupancy: parseInt(formData.maxOccupancy.toString()) || 2,
                sizeM2: parseInt(formData.sizeM2.toString()) || 0,
                minPrice: parseFloat(formData.minPrice.toString()) || 0,
                maxPrice: parseFloat(formData.maxPrice.toString()) || 0,
                weeklyDiscount: parseInt(formData.weeklyDiscount.toString()) || 0,
                monthlyDiscount: parseInt(formData.monthlyDiscount.toString()) || 0,
                highlights: JSON.stringify(formData.highlights),
                amenities: JSON.stringify(formData.amenities),
                images: JSON.stringify(formData.images),
                trustPoints: JSON.stringify(formData.trustPoints),
                roomPolicies: JSON.stringify(formData.roomPolicies),
                variants: JSON.stringify(formData.variants),
                isHourlyEnabled: formData.isHourlyEnabled,
                hourlyRates: JSON.stringify(formData.hourlyRates)
            };

            // STRICT: Remove ID and any other non-DB fields
            if ((dataToSave as any).id) delete (dataToSave as any).id;
            if ((dataToSave as any).createdAt) delete (dataToSave as any).createdAt;
            if ((dataToSave as any).updatedAt) delete (dataToSave as any).updatedAt;
            if ((dataToSave as any).hotel) delete (dataToSave as any).hotel;

            if (editingRoom) {
                const hotelIdToUse = Number(editingRoom.hotelId || editingRoom.hotel_id || hotel.id);
                const roomIdToUse = Number(editingRoom.id);
                
                // Add hotelId to body as well just in case backend needs it
                (dataToSave as any).hotelId = hotelIdToUse;

                const res = await hotelApi.updateRoom(hotelIdToUse, roomIdToUse, dataToSave);
                if (res.success) {
                    setRooms(prev => prev.map(r => r.id === editingRoom.id ? res.data : r));
                }
            } else {
                const hotelIdToUse = Number(hotel.id);
                const res = await hotelApi.addRoom(hotelIdToUse, dataToSave);
                if (res.success) {
                    setRooms(prev => [...prev, res.data]);
                }
            }
            setIsEditing(false);
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(`Failed to save room details: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        processFiles(Array.from(files));
    };

    const processFiles = async (files: File[]) => {
        const remainingSlots = 15 - formData.images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        setIsOptimizing(true);
        const optimizedImages: string[] = [];

        try {
            for (const file of files) {
                const webp = await compressImage(file);
                optimizedImages.push(webp);
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...optimizedImages]
            }));
        } catch (err) {
            console.error("Compression failed:", err);
            alert("Some images could not be optimized. Please try again.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (!confirm("Are you sure you want to delete this room type?")) return;
        try {
            const res = await hotelApi.deleteRoom(hotel.id, roomId);
            if (res.success) {
                setRooms(prev => prev.filter(r => r.id !== roomId));
            }
        } catch (err) {
            alert("Failed to delete room");
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity) 
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isEditing) {
        return (
            <>
                <div className="animate-fade-in pb-20">
                {/* Edit Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                        >
                            <X className="w-3.5 h-3.5" /> Back to Rooms
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {editingRoom ? "Edit Room Category" : "Add New Category"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveRoom}
                            disabled={isSaving}
                            className={cn(
                                "px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl",
                                editingRoom 
                                    ? "bg-amber-400 text-amber-950 shadow-amber-100 hover:bg-amber-500" 
                                    : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
                            )}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingRoom ? "Save Updates" : "Create Category"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-8 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Basic Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Deluxe Ocean View"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Per Night (₹)</label>
                                    <input 
                                        type="number" 
                                        required
                                        placeholder="2500"
                                        value={formData.pricePerNight}
                                        onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                                <textarea 
                                    placeholder="Briefly describe this room type..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all min-h-[120px] resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Occupancy</label>
                                    <select 
                                        value={formData.maxOccupancy}
                                        onChange={(e) => setFormData({...formData, maxOccupancy: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                    >
                                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guests</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bed Type</label>
                                    <select 
                                        value={formData.bedConfiguration}
                                        onChange={(e) => setFormData({...formData, bedConfiguration: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                    >
                                        {bedOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area (sq. ft)</label>
                                    <input 
                                        type="number" 
                                        placeholder="250"
                                        value={formData.sizeM2}
                                        onChange={(e) => setFormData({...formData, sizeM2: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hourly Stay Settings - NEW */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Hourly Stay Settings</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!formData.isHourlyEnabled) {
                                            setShowHourlyConfirm(true);
                                        } else {
                                            setFormData({...formData, isHourlyEnabled: false});
                                        }
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        formData.isHourlyEnabled ? "bg-purple-600 text-white shadow-lg shadow-purple-100" : "bg-slate-100 text-slate-400"
                                    )}
                                >
                                    {formData.isHourlyEnabled ? "Enabled" : "Disabled"}
                                </button>
                            </div>

                            {formData.isHourlyEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {[3, 6, 12].map(hours => (
                                        <div key={hours} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{hours} Hours Rate (₹)</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g. 800"
                                                value={(formData.hourlyRates as any)?.[hours] || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    hourlyRates: { ...(formData.hourlyRates as any), [hours]: e.target.value }
                                                })}
                                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-purple-600 outline-none transition-all"
                                            />
                                        </div>
                                    ))}
                                    <div className="col-span-full pt-2">
                                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-3">
                                            <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                                            <p className="text-[10px] font-bold text-purple-700 uppercase leading-relaxed">
                                                By enabling this, this room will be listed in the Hourly Stays section. Please ensure you have different rates for different time slots.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customizations Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-8 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Trust & Highlights (Select Options)</h3>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Highlights (Select or Type)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {commonHighlights.map((cat, idx) => {
                                        const h = formData.highlights[idx] || { label: cat.label, value: "", icon: "", isCustom: false };
                                        return (
                                            <div key={idx} className="space-y-3 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{cat.label}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {cat.options.map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => {
                                                                const newH = [...formData.highlights];
                                                                newH[idx] = { ...newH[idx], label: cat.label, value: opt, isCustom: false };
                                                                setFormData({...formData, highlights: newH});
                                                            }}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight border transition-all",
                                                                h.value === opt && !h.isCustom
                                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                                                            )}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="pt-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder={`Write custom ${cat.label.toLowerCase()}...`}
                                                        value={h.isCustom ? h.value : ""}
                                                        onChange={(e) => {
                                                            const newH = [...formData.highlights];
                                                            newH[idx] = { ...newH[idx], label: cat.label, value: e.target.value, isCustom: true };
                                                            setFormData({...formData, highlights: newH});
                                                        }}
                                                        className={cn(
                                                            "w-full px-4 py-2.5 bg-white border rounded-xl text-[10px] font-bold outline-none transition-all",
                                                            h.isCustom ? "border-blue-600 ring-2 ring-blue-50" : "border-slate-200 focus:border-blue-400"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trust Bullets (Select or Add Custom)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {predefinedTrustPoints.map((point) => (
                                        <button
                                            key={point}
                                            type="button"
                                            onClick={() => {
                                                const isSelected = formData.trustPoints.includes(point);
                                                setFormData({
                                                    ...formData,
                                                    trustPoints: isSelected 
                                                        ? formData.trustPoints.filter(p => p !== point)
                                                        : [...formData.trustPoints, point].slice(0, 10)
                                                });
                                            }}
                                            className={cn(
                                                "px-5 py-4 rounded-lg text-left text-[11px] font-bold border transition-all flex items-center gap-3",
                                                formData.trustPoints.includes(point)
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                                                formData.trustPoints.includes(point) ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-200"
                                            )}>
                                                {formData.trustPoints.includes(point) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                            {point}
                                        </button>
                                    ))}
                                    
                                    {/* Custom Trust Point Input */}
                                    <div className="col-span-full mt-2">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Write your own trust point..."
                                                value={customTrustPoint}
                                                onChange={(e) => setCustomTrustPoint(e.target.value)}
                                                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:bg-white focus:border-blue-600 transition-all"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = customTrustPoint.trim();
                                                        if (val && !formData.trustPoints.includes(val)) {
                                                            setFormData({ ...formData, trustPoints: [...formData.trustPoints, val] });
                                                            setCustomTrustPoint("");
                                                        }
                                                    }
                                                }}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const val = customTrustPoint.trim();
                                                    if (val && !formData.trustPoints.includes(val)) {
                                                        setFormData({ ...formData, trustPoints: [...formData.trustPoints, val] });
                                                        setCustomTrustPoint("");
                                                    }
                                                }}
                                                className="px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.trustPoints.filter(p => !predefinedTrustPoints.includes(p)).map(p => (
                                                <span key={p} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                                                    {p}
                                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFormData({...formData, trustPoints: formData.trustPoints.filter(tp => tp !== p)})} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amenities Card - Moved Up */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Amenities</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {commonAmenities.map((amenity) => (
                                    <button
                                        key={amenity}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity)}
                                        className={cn(
                                            "px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-tight border transition-all text-center",
                                            formData.amenities.includes(amenity)
                                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                : "bg-slate-50 text-slate-500 border-transparent hover:border-slate-200"
                                        )}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Room Specific Advanced Policies Section */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Room Policies & Rules</h3>
                                </div>
                            </div>
                            
                            <div className="space-y-10">
                                {[
                                    { 
                                        id: 'hotelPolicies', 
                                        label: 'Hotel Policies', 
                                        icon: <Shield className="w-4 h-4" />,
                                        presets: ["Standard Check-in 12 PM", "Local IDs accepted", "Valid Govt ID required"]
                                    },
                                    { 
                                        id: 'houseRules', 
                                        label: 'House Rules', 
                                        icon: <Info className="w-4 h-4" />,
                                        presets: ["No smoking", "No pets", "No loud music after 10 PM"]
                                    },
                                    { 
                                        id: 'cancellation', 
                                        label: 'Cancellation & Refund', 
                                        icon: <ShieldCheck className="w-4 h-4" />,
                                        presets: ["Free cancellation till 24h", "Non-refundable", "50% refund till 48h"]
                                    },
                                    { 
                                        id: 'payment', 
                                        label: 'Payment Methods', 
                                        icon: <Zap className="w-4 h-4" />,
                                        presets: ["Pay at Hotel available", "Cards & UPI accepted", "18% advance for confirmation"]
                                    }
                                ].map((cat) => {
                                    const currentVal = formData.roomPolicies?.[cat.id as keyof typeof formData.roomPolicies] || "";
                                    
                                    return (
                                        <div key={cat.id} className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-red-500">
                                                    {cat.icon}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{cat.label}</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {cat.presets.map(preset => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData, 
                                                            roomPolicies: { ...formData.roomPolicies, [cat.id]: preset }
                                                        })}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-tight border transition-all",
                                                            currentVal === preset 
                                                                ? "bg-red-600 border-red-600 text-white shadow-md" 
                                                                : "bg-white border-slate-200 text-slate-500 hover:border-red-300"
                                                        )}
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            <textarea 
                                                placeholder={`Write custom ${cat.label.toLowerCase()} for this room...`}
                                                value={currentVal}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    roomPolicies: { ...formData.roomPolicies, [cat.id]: e.target.value }
                                                })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:bg-white focus:border-red-600 transition-all resize-none min-h-[100px]"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rate Plans / Variants Card - Moved Below Policies */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Room Variants & Meal Plans</h3>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData, 
                                        variants: [...formData.variants, { id: Date.now(), mealPlan: "EP (Room Only)", price: formData.pricePerNight, policy: "Non-refundable" }]
                                    })}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                                >
                                    <Plus className="w-3 h-3" /> Add Variant
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {formData.variants.map((variant, idx) => (
                                    <div key={variant.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative group">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Meal Plan</label>
                                            <select 
                                                value={variant.mealPlan}
                                                onChange={(e) => {
                                                    const newVariants = [...formData.variants];
                                                    newVariants[idx].mealPlan = e.target.value;
                                                    setFormData({...formData, variants: newVariants});
                                                }}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-purple-600 transition-all appearance-none"
                                            >
                                                <option value="Without Breakfast">Without Breakfast</option>
                                                <option value="Breakfast Included">Breakfast Included</option>
                                                <option value="Breakfast + One Meal">Breakfast + One Meal (MAP)</option>
                                                <option value="All Meals Included">All Meals Included (AP)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                            <input 
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => {
                                                    const newVariants = [...formData.variants];
                                                    newVariants[idx].price = e.target.value;
                                                    setFormData({...formData, variants: newVariants});
                                                }}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-purple-600 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Policy</label>
                                            <select 
                                                value={variant.policy}
                                                onChange={(e) => {
                                                    const newVariants = [...formData.variants];
                                                    newVariants[idx].policy = e.target.value;
                                                    setFormData({...formData, variants: newVariants});
                                                }}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-purple-600 transition-all appearance-none"
                                            >
                                                <option value="Non-refundable">Non-refundable</option>
                                                <option value="Free cancellation till 24h">Free cancellation till 24h</option>
                                                <option value="Free cancellation till 48h">Free cancellation till 48h</option>
                                            </select>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                variants: formData.variants.filter((_, i) => i !== idx)
                                            })}
                                            className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                ))}
                                {formData.variants.length === 0 && (
                                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No custom rate plans added. Only the base price will be shown.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="space-y-8">


                        {/* Gallery Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Gallery</h3>
                                </div>
                                <span className="text-[10px] font-black text-slate-400">{formData.images.length}/15</span>
                            </div>
                            
                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all group cursor-pointer text-center px-4",
                                    isDragging ? "border-blue-600 bg-blue-50/50" : "border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-300",
                                    isOptimizing && "pointer-events-none"
                                )}
                            >
                                {isOptimizing && (
                                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-[9px] font-black text-slate-900 animate-pulse uppercase tracking-widest">Optimizing...</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleFileUpload} 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    disabled={isOptimizing}
                                />
                                <ImageIcon className="w-6 h-6 text-slate-300 mb-2" />
                                <p className="text-[10px] font-black text-slate-900 uppercase">Click or Drag Images</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {formData.images.map((url, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={url} alt="Room" className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur-md text-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing & Advanced Stay Discounts - NEW SECTION */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-8 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Pricing & Stay Discounts</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Allowed Rate (₹)</label>
                                    <input 
                                        type="number"
                                        placeholder="Min price for filters"
                                        value={formData.minPrice}
                                        onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Allowed Rate (₹)</label>
                                    <input 
                                        type="number"
                                        placeholder="Max price for filters"
                                        value={formData.maxPrice}
                                        onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">Weekly Stay Discount</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Applied automatically for 7+ days stay</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number"
                                            value={formData.weeklyDiscount}
                                            onChange={(e) => {
                                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                                setFormData({ ...formData, weeklyDiscount: val.toString() });
                                            }}
                                            className="w-20 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-black text-emerald-600 outline-none focus:bg-white focus:border-emerald-600 transition-all"
                                        />
                                        <span className="text-sm font-black text-slate-400">%</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">Monthly Stay Discount</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Applied automatically for 30+ days stay</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number"
                                            value={formData.monthlyDiscount}
                                            onChange={(e) => {
                                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                                setFormData({ ...formData, monthlyDiscount: val.toString() });
                                            }}
                                            className="w-20 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-black text-emerald-600 outline-none focus:bg-white focus:border-emerald-600 transition-all"
                                        />
                                        <span className="text-sm font-black text-slate-400">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Hourly Stays */}
            <AnimatePresence>
                {showHourlyConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHourlyConfirm(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <Clock className="w-32 h-32 text-purple-600" />
                            </div>
                            
                            <div className="relative space-y-6">
                                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                    <Clock className="w-7 h-7" />
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Enable Hourly Stays?</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                        By enabling this, guests will be able to book this room for 3, 6, or 12-hour slots. Please ensure you have set competitive rates for these time durations.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => setShowHourlyConfirm(false)}
                                        className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setFormData({...formData, isHourlyEnabled: true});
                                            setShowHourlyConfirm(false);
                                        }}
                                        className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all"
                                    >
                                        Enable Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Room Categories</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your inventory and room details</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center shadow-sm">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={cn("p-2.5 rounded-lg transition-all", viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-6 py-3.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Room Category
                    </button>
                </div>
            </div>

            {/* Rooms Display */}
            {rooms.length === 0 ? (
                <div className="py-32 bg-white rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                        <Bed className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">No Room Categories Yet</h2>
                    <p className="text-slate-500 mb-8 max-w-sm font-medium">Add your first room category to start receiving bookings.</p>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    >
                        Create Room Category
                    </button>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-8",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {rooms.map((room) => (
                        <div key={room.id} className={cn(
                            "bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden",
                            viewMode === 'grid' ? "rounded-xl" : "rounded-xl flex flex-col md:flex-row items-center p-6 gap-8"
                        )}>
                            {/* Thumbnail */}
                            <div className={cn(
                                "bg-slate-100 flex items-center justify-center relative",
                                viewMode === 'grid' ? "h-56 w-full" : "h-40 w-64 rounded-xl shrink-0"
                            )}>
                                {(() => {
                                    const roomImages = getImages(room.images);
                                    return roomImages && roomImages.length > 0 ? (
                                        <img src={roomImages[0]} alt={room.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                                            <ImageIcon className="w-10 h-10 text-slate-200 mb-2" />
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">No Images Set</span>
                                        </div>
                                    );
                                })()}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(room)}
                                        className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-blue-600 shadow-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRoom(room.id)}
                                        className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-red-600 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className={cn(
                                "p-8 flex-1",
                                viewMode === 'list' ? "p-0" : ""
                            )}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{room.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{room.bedConfiguration}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-blue-600">{formatPrice(room.pricePerNight)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per night</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <Users className="w-4 h-4 text-slate-400" /> {room.maxOccupancy} Max Guests
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <Maximize2 className="w-4 h-4 text-slate-400" /> {room.sizeM2} sq. ft Area
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const amenities = robustParse(room.amenities);
                                        return (
                                            <>
                                                {amenities.slice(0, 4).map((amenity: string) => (
                                                    <span key={amenity} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-lg border border-slate-100">
                                                        {amenity}
                                                    </span>
                                                ))}
                                                {amenities.length > 4 && (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg">
                                                        +{amenities.length - 4} More
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Confirmation Modal for Hourly Stays */}
            <AnimatePresence>
                {showHourlyConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHourlyConfirm(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <Clock className="w-32 h-32 text-purple-600" />
                            </div>
                            
                            <div className="relative space-y-6">
                                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                    <Clock className="w-7 h-7" />
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Enable Hourly Stays?</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                        By enabling this, guests will be able to book this room for 3, 6, or 12-hour slots. Please ensure you have set competitive rates for these time durations.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => setShowHourlyConfirm(false)}
                                        className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setFormData({...formData, isHourlyEnabled: true});
                                            setShowHourlyConfirm(false);
                                        }}
                                        className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all"
                                    >
                                        Enable Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}



