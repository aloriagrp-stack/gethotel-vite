

import { useState, useEffect } from "react";
import { useNavigate as useRouter, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
    Bed, Plus, Edit3, Trash2, Loader2, 
    Users, Maximize2, Coffee, Wifi, 
    Tv, Wind, Shield, CheckCircle2, AlertCircle,
    XCircle, ImageIcon, Info, Save,
    X, ChevronRight, LayoutGrid, List as ListIcon,
    ShieldCheck, BedDouble, Zap, Clock,
    Layers, Globe, Settings, CreditCard, Calendar, 
    Activity, Copy, Hash, Map, Eye, EyeOff,
    Percent, DollarSign, CalendarDays, Lock, Unlock,
    Smartphone, Search, Monitor, Star, Bookmark,
    ArrowLeft
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
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: "", type: null });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: null }), 3000);
    };
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
        "Pay remaining 88% at the hotel during check-in",
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
            "Pay remaining 88% at the hotel during check-in",
            "Secure booking with instant confirmation"
        ],
        minPrice: "",
        maxPrice: "",
        weeklyDiscount: "0",
        monthlyDiscount: "0",
        variants: [] as any[],
        isHourlyEnabled: false,
        hourlyRates: { "3": "", "6": "", "12": "" },

        // New OTA Fields
        status: "active",
        totalInventory: "1",
        viewType: "City View",
        floorNumber: "",
        isCornerRoom: false,
        capacityAdults: "2",
        capacityChildren: "0",
        capacityInfants: "0",
        extraMattress: false,
        extraBedCharge: "0",
        tags: [] as string[],
        isFeatured: false,
        displayPriority: "0",
        videoUrl: "",
        media360Url: "",
        minStay: "1",
        maxStay: "90",
        isInstantBooking: true,
        advanceBookingDays: "0",
        advancePayment: "0",
        securityDeposit: "0",
        isRefundable: true,
        isTaxIncluded: false,
        weekendPricing: [] as any[],
        seasonalPricing: [] as any[],
        addOns: [] as any[],
        petsAllowed: false,
        smokingAllowed: false,
        alcoholAllowed: true,
        partyAllowed: false,
        seoTitle: "",
        seoDescription: "",
        slug: ""
    });
    const [activeEditTab, setActiveEditTab] = useState("general");
    const [customTrustPoint, setCustomTrustPoint] = useState("");

    const commonAmenities = [
        "Free High-Speed WiFi",
        "Smart TV (Netflix/Prime)",
        "Cable/Satellite Channels",
        "Bluetooth Speaker",
        "Direct-Dial Telephone",
        "Air Conditioning",
        "Heating System",
        "Ceiling Fan",
        "Premium Linens",
        "Pillow Menu",
        "Blackout Curtains",
        "Soundproofing",
        "Mini Bar",
        "Espresso Machine",
        "Coffee/Tea Maker",
        "Electric Kettle",
        "Mini Fridge",
        "Microwave",
        "Complimentary Bottled Water",
        "Private Bathroom",
        "Deep Soaking Bathtub",
        "Rain Shower",
        "Premium Toiletries",
        "Hair Dryer",
        "Plush Bathrobes",
        "Slippers",
        "Lighted Makeup Mirror",
        "Executive Work Desk",
        "Ergonomic Chair",
        "Laptop-Friendly Safe",
        "Iron & Ironing Board",
        "Wardrobe & Hangers",
        "Luggage Rack",
        "Private Balcony",
        "Private Terrace",
        "Sea/Ocean View",
        "Mountain/Hill View",
        "City Skyline View",
        "Garden/Pool View",
        "Private Jacuzzi",
        "Private Plunge Pool",
        "Kitchenette",
        "Fireplace",
        "Washing Machine",
        "24/7 Room Service",
        "Daily Housekeeping",
        "Turndown Service",
        "Complimentary Breakfast",
        "Wake-up Service",
        "Baby Crib (On Request)",
        "Universal Power Adapters",
        "USB Charging Ports",
        "Air Purifier",
        "In-room Dining Table",
        "Sofa Bed / Couches",
        "Shoe Shine Kit"
    ];

    const bedOptions = [
        "1 Single Bed", 
        "2 Single Beds", 
        "1 Double Bed", 
        "1 Queen Bed", 
        "1 King Bed", 
        "1 King + 1 Single", 
        "2 Double Beds", 
        "2 Queen Beds",
        "3 Single Beds",
        "2 King Beds",
        "1 King + 2 Single Beds"
    ];

    const viewOptions = [
        "City View",
        "Sea View",
        "Garden View",
        "Mountain View",
        "Pool View",
        "Lake View",
        "River View",
        "Street View"
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await hotelApi.getMyHotels({ light: true });
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
                amenities: Array.from(new Set(
                    robustParse(room.amenities || room.room_amenities).map((am: any) => {
                        const matched = commonAmenities.find(ca => ca.toLowerCase().trim() === String(am).toLowerCase().trim());
                        return matched || am;
                    })
                )),
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
                    "Pay remaining 88% at the hotel during check-in",
                    "Secure booking with instant confirmation"
                ]),
                minPrice: room.minPrice || room.min_price || "",
                maxPrice: room.maxPrice || room.max_price || "",
                weeklyDiscount: room.weeklyDiscount || room.weekly_discount || "0",
                monthlyDiscount: room.monthlyDiscount || room.monthly_discount || "0",
                variants: robustParse(room.variants || room.room_variants || room.variants, []),
                isHourlyEnabled: room.isHourlyEnabled || room.is_hourly_enabled || false,
                hourlyRates: robustParse(room.hourlyRates || room.hourly_rates || room.hourlyRates, { "3": "", "6": "", "12": "" }),

                // New OTA Fields Population
                status: room.status || "active",
                totalInventory: (room.totalInventory || room.total_inventory || "1").toString(),
                viewType: room.viewType || room.view_type || "City View",
                floorNumber: (room.floorNumber || room.floor_number || "").toString(),
                isCornerRoom: room.isCornerRoom || room.is_corner_room || false,
                capacityAdults: (room.capacityAdults || room.capacity_adults || "2").toString(),
                capacityChildren: (room.capacityChildren || room.capacity_children || "0").toString(),
                capacityInfants: (room.capacityInfants || room.capacity_infants || "0").toString(),
                extraMattress: room.extraMattress || room.extra_mattress || false,
                extraBedCharge: (room.extraBedCharge || room.extra_bed_charge || "0").toString(),
                tags: robustParse(room.tags || room.room_tags || room.tags, []),
                isFeatured: room.isFeatured || room.is_featured || false,
                displayPriority: (room.displayPriority || room.display_priority || "0").toString(),
                videoUrl: room.videoUrl || room.video_url || "",
                media360Url: room.media360Url || room.media_360_url || "",
                minStay: (room.minStay || room.min_stay || "1").toString(),
                maxStay: (room.maxStay || room.max_stay || "90").toString(),
                isInstantBooking: room.isInstantBooking !== false,
                advanceBookingDays: (room.advanceBookingDays || room.advance_booking_days || "0").toString(),
                advancePayment: (room.advancePayment || room.advance_payment || "0").toString(),
                securityDeposit: (room.securityDeposit || room.security_deposit || "0").toString(),
                isRefundable: room.isRefundable !== false,
                isTaxIncluded: room.isTaxIncluded || room.is_tax_included || false,
                weekendPricing: robustParse(room.weekendPricing || room.weekend_pricing || room.weekendPricing, []),
                seasonalPricing: robustParse(room.seasonalPricing || room.seasonal_pricing || room.seasonalPricing, []),
                addOns: robustParse(room.addOns || room.add_ons || room.addOns, []),
                petsAllowed: room.petsAllowed || room.pets_allowed || false,
                smokingAllowed: room.smokingAllowed || room.smoking_allowed || false,
                alcoholAllowed: room.alcoholAllowed !== false,
                partyAllowed: room.partyAllowed || room.party_allowed || false,
                seoTitle: room.seoTitle || room.seo_title || "",
                seoDescription: room.seoDescription || room.seo_description || "",
                slug: room.slug || ""
            });
            setActiveEditTab("general");
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
                    "Pay remaining 88% at the hotel during check-in",
                    "Secure booking with instant confirmation"
                ],
                minPrice: "",
                maxPrice: "",
                weeklyDiscount: "0",
                monthlyDiscount: "0",
                variants: [],
                isHourlyEnabled: false,
                hourlyRates: { "3": "", "6": "", "12": "" },

                // New OTA Fields Default
                status: "active",
                totalInventory: "1",
                viewType: "City View",
                floorNumber: "",
                isCornerRoom: false,
                capacityAdults: "2",
                capacityChildren: "0",
                capacityInfants: "0",
                extraMattress: false,
                extraBedCharge: "0",
                tags: [],
                isFeatured: false,
                displayPriority: "0",
                videoUrl: "",
                media360Url: "",
                minStay: "1",
                maxStay: "90",
                isInstantBooking: true,
                advanceBookingDays: "0",
                advancePayment: "0",
                securityDeposit: "0",
                isRefundable: true,
                isTaxIncluded: false,
                weekendPricing: [],
                seasonalPricing: [],
                addOns: [],
                petsAllowed: false,
                smokingAllowed: false,
                alcoholAllowed: true,
                partyAllowed: false,
                seoTitle: "",
                seoDescription: "",
                slug: ""
            });
            setActiveEditTab("general");
        }
        setIsEditing(true);
    };

    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // VALIDATION: Min 1 image
        if (formData.images.length < 1) {
            alert("Please add at least 1 image of the room.");
            return;
        }

        if (formData.amenities.length > 30) {
            alert("Maximum 30 amenities allowed per room category.");
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

        const adultsVal = parseInt(formData.capacityAdults.toString()) || 2;
        if (adultsVal < 1 || adultsVal > 10) {
            alert("Adults Capacity must be between 1 and 10.");
            return;
        }

        // Room and Variant Pricing Validation
        const basePrice = parseFloat(formData.pricePerNight.toString()) || 0;
        const variants = formData.variants || [];
        
        if (variants.length > 0) {
            const epVariant = variants.find(v => {
                const mp = (v.mealPlan || "").toLowerCase();
                return mp.includes("room only") || mp === "ep" || mp === "ep (room only)";
            });
            const cpVariant = variants.find(v => {
                const mp = (v.mealPlan || "").toLowerCase();
                return (mp.includes("breakfast") || mp === "cp") && !mp.includes("meal") && !mp.includes("map");
            });

            const epPrice = epVariant ? (parseFloat(epVariant.price?.toString()) || 0) : null;
            const cpPrice = cpVariant ? (parseFloat(cpVariant.price?.toString()) || 0) : null;

            // 1. One of them must match the base price
            let matchesBase = false;
            if (epPrice !== null && Math.abs(epPrice - basePrice) < 0.01) {
                matchesBase = true;
            }
            if (cpPrice !== null && Math.abs(cpPrice - basePrice) < 0.01) {
                matchesBase = true;
            }

            if (epPrice !== null || cpPrice !== null) {
                if (!matchesBase) {
                    alert(`Validation Error: Either Room Only (EP) price or Breakfast Included (CP) price must match the Room Base Price (₹${basePrice}).`);
                    return;
                }
            }

            // 2. Pricing order logic: Breakfast Included (CP) cannot be cheaper than Room Only (EP)
            if (epPrice !== null && cpPrice !== null) {
                if (cpPrice < epPrice) {
                    alert(`Validation Error: Breakfast Included (CP) price (₹${cpPrice}) cannot be cheaper than Room Only (EP) price (₹${epPrice}).`);
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            // Calculate maxOccupancy dynamically as Adults + Children capacity
            const computedMaxOccupancy = adultsVal + (parseInt(formData.capacityChildren.toString()) || 0);

            // Ensure numbers and JSON are handled correctly
            const dataToSave = {
                ...formData,
                pricePerNight: parseFloat(formData.pricePerNight.toString()) || 0,
                maxOccupancy: computedMaxOccupancy,
                sizeM2: parseInt(formData.sizeM2.toString()) || 0,
                minPrice: parseFloat(formData.minPrice.toString()) || 0,
                maxPrice: parseFloat(formData.maxPrice.toString()) || 0,
                weeklyDiscount: parseInt(formData.weeklyDiscount.toString()) || 0,
                monthlyDiscount: parseInt(formData.monthlyDiscount.toString()) || 0,
                highlights: JSON.stringify(formData.highlights),
                amenities: JSON.stringify(formData.amenities),
                images: JSON.stringify(formData.images),
                trustPoints: JSON.stringify(formData.trustPoints),
                variants: JSON.stringify(formData.variants),
                isHourlyEnabled: formData.isHourlyEnabled,
                hourlyRates: JSON.stringify(formData.hourlyRates),

                // New OTA Fields Mapping
                totalInventory: parseInt(formData.totalInventory.toString()) || 1,
                floorNumber: formData.floorNumber ? parseInt(formData.floorNumber.toString()) : null,
                capacityAdults: parseInt(formData.capacityAdults.toString()) || 2,
                capacityChildren: parseInt(formData.capacityChildren.toString()) || 0,
                capacityInfants: parseInt(formData.capacityInfants.toString()) || 0,
                extraBedCharge: parseFloat(formData.extraBedCharge.toString()) || 0,
                displayPriority: parseInt(formData.displayPriority.toString()) || 0,
                minStay: parseInt(formData.minStay.toString()) || 1,
                maxStay: parseInt(formData.maxStay.toString()) || 90,
                advanceBookingDays: parseInt(formData.advanceBookingDays.toString()) || 0,
                advancePayment: parseInt(formData.advancePayment.toString()) || 0,
                securityDeposit: parseFloat(formData.securityDeposit.toString()) || 0,
                tags: JSON.stringify(formData.tags),
                weekendPricing: JSON.stringify(formData.weekendPricing),
                seasonalPricing: JSON.stringify(formData.seasonalPricing),
                addOns: JSON.stringify(formData.addOns)
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
                    showToast("Room updated successfully!", "success");
                    setIsEditing(false);
                } else {
                    showToast(res.message || "Failed to update room. Please try again.", "error");
                }
            } else {
                const hotelIdToUse = Number(hotel.id);
                const res = await hotelApi.addRoom(hotelIdToUse, dataToSave);
                if (res.success) {
                    setRooms(prev => [...prev, res.data]);
                    showToast("New room category created!", "success");
                    setIsEditing(false);
                } else {
                    showToast(res.message || "Failed to create room. Please try again.", "error");
                }
            }
        } catch (err: any) {
            console.error("Save Error:", err);
            showToast(err.response?.data?.message || err.message || "Failed to save room details", "error");
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
                showToast("Room deleted successfully!", 'success');
            }
        } catch (err: any) {
            showToast(err.message || "Failed to delete room", 'error');
        }
    };

    const toggleAmenity = (amenity: string) => {
        const isAlreadySelected = formData.amenities.includes(amenity);
        if (!isAlreadySelected && formData.amenities.length >= 30) {
            showToast("You can select a maximum of 30 amenities per room category.", "error");
            return;
        }
        setFormData(prev => ({
            ...prev,
            amenities: isAlreadySelected 
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
        const tabs = [
            { id: "general", label: "General", icon: LayoutGrid },
            { id: "occupancy", label: "Occupancy & Location", icon: Users },
            { id: "pricing", label: "Pricing & Inventory", icon: CreditCard },
            { id: "availability", label: "Availability Rules", icon: Calendar },
            { id: "media", label: "Media & Gallery", icon: ImageIcon },
            { id: "amenities", label: "Rules & Features", icon: ShieldCheck },
            { id: "rateplans", label: "Rate Plans", icon: Layers },
            { id: "seo", label: "Search Visibility", icon: Globe },
        ];

        const calculateIntegrity = () => {
            let score = 0;
            const checks = [
                { id: 'name', label: 'Detailed Room Name', met: formData.name.length > 5, weight: 10 },
                { id: 'desc', label: 'Rich Description (100+ chars)', met: formData.description.length > 100, weight: 15 },
                { id: 'img', label: 'Min 5 HD Photos', met: formData.images.length >= 5, weight: 25 },
                { id: 'amen', label: 'Key Amenities Selected', met: formData.amenities.length >= 5, weight: 15 },
                { id: 'occup', label: 'Accurate Occupancy Info', met: parseInt(formData.maxOccupancy) > 0, weight: 10 },
                { id: 'prices', label: 'Pricing Rules Defined', met: parseFloat(formData.pricePerNight) > 0, weight: 15 },
                { id: 'seo', label: 'Search Info Added', met: formData.seoTitle.length > 10, weight: 10 }
            ];
            
            score = checks.reduce((acc, curr) => acc + (curr.met ? curr.weight : 0), 0);
            return { score, checks };
        };

        const handleDuplicateRoom = () => {
            const newName = `${formData.name} (Copy)`;
            setFormData({
                ...formData,
                name: newName,
                slug: `${formData.slug}-copy`
            });
            setEditingRoom(null); // Reset editing room to treat it as a new room
            showToast("Room configuration cloned! Please review and save.", "success");
        };

        const isCustomBed = formData.bedConfiguration !== undefined && !bedOptions.includes(formData.bedConfiguration);
        const isCustomView = formData.viewType !== undefined && !viewOptions.includes(formData.viewType);

        return (
            <div className="animate-fade-in pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-3 md:gap-4">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-none cursor-pointer"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <div className="w-12 h-12 bg-blue-600 rounded-none flex items-center justify-center text-white shadow-xl shadow-blue-100 hidden sm:flex shrink-0">
                                <BedDouble className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {editingRoom ? "Edit Room Category" : "New Room Category"}
                                </h1>
                                <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {formData.name || "Untitled Category"} • {formData.status.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleSaveRoom}
                            disabled={isSaving}
                            className={cn(
                                "px-10 py-4 rounded-none font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl",
                                editingRoom 
                                    ? "bg-amber-400 text-amber-950 shadow-amber-100 hover:bg-amber-500" 
                                    : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
                            )}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingRoom ? "Update Database" : "Push to Live"}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation - Stacked/Wrapped Layout */}
                <div className="bg-white border border-slate-200 rounded-none mb-8 shadow-sm">
                    <div className="flex flex-wrap items-center gap-1 p-1 w-full">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeEditTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveEditTab(tab.id)}
                                    className={cn(
                                        "flex-shrink-0 flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
                                        isActive ? "text-blue-600 bg-blue-50/50" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
                                    {tab.label}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeEditTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        {activeEditTab === 'general' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-none" />
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">General Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category Name</label>
                                            <input type="text" placeholder="e.g. Presidential Suite" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Rooms (Inventory)</label>
                                            <input type="number" min="1" placeholder="e.g. 5" value={formData.totalInventory} onChange={(e) => setFormData({...formData, totalInventory: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner" />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">How many rooms of this type?</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                            <textarea placeholder="Tell guests about the comfort, design, and vibes..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all min-h-[120px] resize-none shadow-inner" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Listing Status</label>
                                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer">
                                                <option value="active">Active (Visible)</option>
                                                <option value="inactive">Inactive (Hidden)</option>
                                                <option value="draft">Draft Mode</option>
                                                <option value="maintenance">Maintenance Mode</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Priority</label>
                                            <input type="number" placeholder="0 (Highest)" value={formData.displayPriority} onChange={(e) => setFormData({...formData, displayPriority: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all" />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">LOWER NUMBER = HIGHER POSITION</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-none border border-dashed border-slate-200 mt-6">
                                            <div className="flex-1">
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase">Featured Category</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Showcase this room at the top</p>
                                            </div>
                                            <button type="button" onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})} className={cn("w-12 h-6 rounded-none transition-all relative", formData.isFeatured ? "bg-blue-600" : "bg-slate-200")}>
                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-none transition-all", formData.isFeatured ? "right-1" : "left-1")} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeEditTab === 'occupancy' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-none" />
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Occupancy & Location</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adults Capacity</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                max="10"
                                                value={formData.capacityAdults} 
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    let adults = parseInt(val) || 0;
                                                    if (adults > 10) {
                                                        adults = 10;
                                                        val = "10";
                                                    }
                                                    if (adults < 1 && val !== "") {
                                                        adults = 1;
                                                        val = "1";
                                                    }
                                                    const children = parseInt(formData.capacityChildren) || 0;
                                                    setFormData({
                                                        ...formData,
                                                        capacityAdults: val,
                                                        maxOccupancy: (adults + children).toString()
                                                    });
                                                }} 
                                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Children</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={formData.capacityChildren} 
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    let children = parseInt(val) || 0;
                                                    if (children < 0) {
                                                        children = 0;
                                                        val = "0";
                                                    }
                                                    const adults = parseInt(formData.capacityAdults) || 0;
                                                    setFormData({
                                                        ...formData,
                                                        capacityChildren: val,
                                                        maxOccupancy: (adults + children).toString()
                                                    });
                                                }} 
                                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Infants</label>
                                            <input type="number" min="0" value={formData.capacityInfants} onChange={(e) => setFormData({...formData, capacityInfants: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bed Configuration</label>
                                            <select 
                                                value={isCustomBed ? "__custom__" : formData.bedConfiguration} 
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "__custom__") {
                                                        setFormData({...formData, bedConfiguration: ""});
                                                    } else {
                                                        setFormData({...formData, bedConfiguration: val});
                                                    }
                                                }} 
                                                className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:border-slate-200 rounded-none text-sm font-bold outline-none cursor-pointer"
                                            >
                                                {bedOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="__custom__">Write your own</option>
                                            </select>
                                            {isCustomBed && (
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter custom bed configuration" 
                                                    value={formData.bedConfiguration} 
                                                    onChange={(e) => setFormData({...formData, bedConfiguration: e.target.value})} 
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-sm font-bold outline-none rounded-none mt-2 animate-fade-in"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area (sq. ft)</label>
                                            <input type="number" value={formData.sizeM2} onChange={(e) => setFormData({...formData, sizeM2: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room View</label>
                                            <select 
                                                value={isCustomView ? "__custom__" : formData.viewType} 
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "__custom__") {
                                                        setFormData({...formData, viewType: ""});
                                                    } else {
                                                        setFormData({...formData, viewType: val});
                                                    }
                                                }} 
                                                className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:border-slate-200 rounded-none text-sm font-bold outline-none cursor-pointer"
                                            >
                                                {viewOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="__custom__">Write your own</option>
                                            </select>
                                            {isCustomView && (
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter custom room view" 
                                                    value={formData.viewType} 
                                                    onChange={(e) => setFormData({...formData, viewType: e.target.value})} 
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 text-sm font-bold outline-none rounded-none mt-2 animate-fade-in"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor Number</label>
                                            <input type="number" placeholder="e.g. 5" value={formData.floorNumber} onChange={(e) => setFormData({...formData, floorNumber: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-none border border-dashed border-slate-200">
                                            <div className="flex-1">
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase">Corner Room</h4>
                                            </div>
                                            <button type="button" onClick={() => setFormData({...formData, isCornerRoom: !formData.isCornerRoom})} className={cn("w-12 h-6 rounded-none transition-all relative", formData.isCornerRoom ? "bg-purple-600" : "bg-slate-200")}>
                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-none transition-all", formData.isCornerRoom ? "right-1" : "left-1")} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase">Extra Mattress Option</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Allow guests to request extra beds</p>
                                            </div>
                                            <button type="button" onClick={() => setFormData({...formData, extraMattress: !formData.extraMattress})} className={cn("w-12 h-6 rounded-none transition-all relative", formData.extraMattress ? "bg-purple-600" : "bg-slate-200")}>
                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-none transition-all", formData.extraMattress ? "right-1" : "left-1")} />
                                            </button>
                                        </div>
                                        {formData.extraMattress && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Extra Bed Charge (₹ Per Night)</label>
                                                <input type="number" placeholder="500" value={formData.extraBedCharge} onChange={(e) => setFormData({...formData, extraBedCharge: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-none text-sm font-bold outline-none" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeEditTab === 'pricing' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-none" />
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Pricing & Inventory</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (Per Night)</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input type="number" value={formData.pricePerNight} onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Allowed Rate (₹)</label>
                                            <input type="number" placeholder="Min limit" value={formData.minPrice} onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Allowed Rate (₹)</label>
                                            <input type="number" placeholder="Max limit" value={formData.maxPrice} onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Deposit (₹)</label>
                                            <input type="number" placeholder="0" value={formData.securityDeposit} onChange={(e) => setFormData({...formData, securityDeposit: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Advance Payment (%)</label>
                                            <input type="number" placeholder="0" value={formData.advancePayment} onChange={(e) => setFormData({...formData, advancePayment: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                                        <div className="flex items-center justify-between bg-slate-50 p-6 rounded-none border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <Percent className="w-4 h-4 text-emerald-600" />
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase">Tax Included</h4>
                                            </div>
                                            <button type="button" onClick={() => setFormData({...formData, isTaxIncluded: !formData.isTaxIncluded})} className={cn("w-12 h-6 rounded-none transition-all relative", formData.isTaxIncluded ? "bg-emerald-500" : "bg-slate-200")}>
                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-none transition-all", formData.isTaxIncluded ? "right-1" : "left-1")} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 p-6 rounded-none border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase">Refundable</h4>
                                            </div>
                                            <button type="button" onClick={() => setFormData({...formData, isRefundable: !formData.isRefundable})} className={cn("w-12 h-6 rounded-none transition-all relative", formData.isRefundable ? "bg-emerald-500" : "bg-slate-200")}>
                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-none transition-all", formData.isRefundable ? "right-1" : "left-1")} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-none border border-slate-100">
                                            <h4 className="text-[10px] font-black text-slate-900 uppercase mb-2">Weekly Discount (%)</h4>
                                            <input type="number" value={formData.weeklyDiscount} onChange={(e) => setFormData({ ...formData, weeklyDiscount: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-none text-sm font-bold outline-none" />
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Automatic for 7+ days stay</p>
                                        </div>
                                        <div className="space-y-3 p-6 bg-slate-50 rounded-none border border-slate-100">
                                            <h4 className="text-[10px] font-black text-slate-900 uppercase mb-2">Monthly Discount (%)</h4>
                                            <input type="number" value={formData.monthlyDiscount} onChange={(e) => setFormData({ ...formData, monthlyDiscount: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-none text-sm font-bold outline-none" />
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Automatic for 30+ days stay</p>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-purple-50/50 rounded-none border border-purple-100 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-purple-600" />
                                                <h4 className="text-sm font-black text-purple-900 uppercase">Hourly Stay Activation</h4>
                                            </div>
                                            <button type="button" onClick={() => setShowHourlyConfirm(true)} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", formData.isHourlyEnabled ? "bg-purple-600 text-white" : "bg-white text-purple-600 border border-purple-200")}>
                                                {formData.isHourlyEnabled ? "Enabled" : "Disabled"}
                                            </button>
                                        </div>
                                        {formData.isHourlyEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95">
                                                {[3, 6, 12].map(hrs => (
                                                    <div key={hrs} className="space-y-2">
                                                        <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{hrs} Hours Rate (₹)</label>
                                                        <input type="number" value={(formData.hourlyRates as any)?.[hrs] || ""} onChange={(e) => setFormData({...formData, hourlyRates: {...(formData.hourlyRates as any), [hrs]: e.target.value}})} className="w-full px-5 py-4 bg-white border border-purple-100 rounded-none text-sm font-bold outline-none focus:border-purple-600" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeEditTab === 'availability' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-amber-500 rounded-none" />
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Availability Rules</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Stay (Nights)</label>
                                            <input type="number" value={formData.minStay} onChange={(e) => setFormData({...formData, minStay: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Stay (Nights)</label>
                                            <input type="number" value={formData.maxStay} onChange={(e) => setFormData({...formData, maxStay: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Advance Booking Window (Days)</label>
                                            <input type="number" value={formData.advanceBookingDays} onChange={(e) => setFormData({...formData, advanceBookingDays: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 p-8 rounded-none border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-amber-100 rounded-none flex items-center justify-center text-amber-600">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase">Instant Booking</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm bookings automatically without review</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setFormData({...formData, isInstantBooking: !formData.isInstantBooking})} className={cn("w-14 h-7 rounded-none transition-all relative shadow-inner", formData.isInstantBooking ? "bg-amber-500" : "bg-slate-200")}>
                                            <div className={cn("absolute top-1 w-5 h-5 bg-white rounded-none transition-all shadow-sm", formData.isInstantBooking ? "right-1" : "left-1")} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeEditTab === 'media' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-rose-500 rounded-none" />
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Media & Gallery</h3>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-none border border-slate-100">{formData.images.length} Images</span>
                                    </div>
                                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={cn("relative h-48 border-2 border-dashed rounded-none flex flex-col items-center justify-center transition-all group cursor-pointer text-center px-8", isDragging ? "border-blue-600 bg-blue-50/50" : "border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-300", isOptimizing && "pointer-events-none")}>
                                        {isOptimizing && (
                                            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md rounded-none flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">High Performance Optimization...</p>
                                            </div>
                                        )}
                                        <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isOptimizing} />
                                        <div className="w-16 h-16 bg-white rounded-none shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Drop images here or click to browse</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Recommended: 1200x800px</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {formData.images.map((url, index) => (
                                            <div key={index} className="relative group aspect-[4/3] rounded-none overflow-hidden bg-slate-100 border border-slate-200">
                                                <img src={url} alt="Room" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => handleRemoveImage(index)} className="p-2.5 bg-white text-red-600 rounded-none hover:bg-red-50 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {index === 0 && <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">Primary</div>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-6 pt-8 border-t border-slate-50">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Tour URL (YouTube/Vimeo)</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2"><Smartphone className="w-4 h-4 text-slate-300" /></span>
                                                <input type="text" placeholder="https://youtube.com/watch?v=..." value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">360° Virtual Tour Link</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2"><Maximize2 className="w-4 h-4 text-slate-300" /></span>
                                                <input type="text" placeholder="https://my.matterport.com/..." value={formData.media360Url} onChange={(e) => setFormData({...formData, media360Url: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeEditTab === 'amenities' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-orange-500 rounded-none" />
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Amenities & Rules</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Amenities</label>
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 border border-blue-100">
                                                Selected: {formData.amenities.length} / 30 Max
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {commonAmenities.map((amenity) => (
                                                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={cn("px-4 py-3.5 rounded-none text-[10px] font-bold uppercase tracking-tight border transition-all text-center", formData.amenities.includes(amenity) ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-slate-50 text-slate-500 border-transparent hover:border-slate-200")}>{amenity}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6 pt-8 border-t border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Level Restrictions</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: 'petsAllowed', label: 'Pets Allowed', icon: Bed },
                                                { id: 'smokingAllowed', label: 'Smoking Allowed', icon: Wind },
                                                { id: 'alcoholAllowed', label: 'Alcohol Allowed', icon: Coffee },
                                                { id: 'partyAllowed', label: 'Parties/Events Allowed', icon: Users }
                                            ].map(rule => (
                                                <div key={rule.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-none border border-slate-100">
                                                    <div className="flex items-center gap-3"><rule.icon className="w-4 h-4 text-slate-400" /><span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{rule.label}</span></div>
                                                    <button type="button" onClick={() => setFormData({...formData, [rule.id]: !(formData as any)[rule.id]})} className={cn("w-11 h-5 rounded-none transition-all relative", (formData as any)[rule.id] ? "bg-orange-500" : "bg-slate-200")}><div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-none transition-all shadow-sm", (formData as any)[rule.id] ? "right-0.5" : "left-0.5")} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6 pt-8 border-t border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Highlights Configuration</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {commonHighlights.map((cat, idx) => {
                                                const h = formData.highlights[idx] || { label: cat.label, value: "", icon: "", isCustom: false };
                                                return (
                                                    <div key={idx} className="space-y-3 p-5 bg-slate-50/50 rounded-none border border-slate-100">
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{cat.label}</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {cat.options.map(opt => (
                                                                <button key={opt} type="button" onClick={() => {
                                                                    const newH = [...formData.highlights]; newH[idx] = { ...newH[idx], label: cat.label, value: opt, isCustom: false }; setFormData({...formData, highlights: newH});
                                                                }} className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all", h.value === opt && !h.isCustom ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-500")}>{opt}</button>
                                                            ))}
                                                        </div>
                                                        <input type="text" placeholder="Custom value..." value={h.isCustom ? h.value : ""} onChange={(e) => {
                                                            const newH = [...formData.highlights]; newH[idx] = { ...newH[idx], label: cat.label, value: e.target.value, isCustom: true }; setFormData({...formData, highlights: newH});
                                                        }} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-none text-[10px] font-bold outline-none" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeEditTab === 'rateplans' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-none" />
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Rate Plans & Meal Packages</h3>
                                        </div>
                                        <button type="button" onClick={() => setFormData({...formData, variants: [...formData.variants, { id: Date.now(), mealPlan: "Breakfast Included", price: formData.pricePerNight, policy: "Free cancellation till 24h" }]})} className="px-5 py-2.5 bg-indigo-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"><Plus className="w-4 h-4" /> Add Plan</button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.variants.map((variant, idx) => (
                                            <div key={variant.id} className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6 relative group border-l-4 border-l-indigo-600 shadow-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Offering</label>
                                                        <select value={variant.mealPlan} onChange={(e) => {
                                                            const nv = [...formData.variants]; nv[idx].mealPlan = e.target.value; setFormData({...formData, variants: nv});
                                                        }} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-none text-[11px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-all">
                                                            <option value="Room Only">EP (Room Only)</option>
                                                            <option value="Breakfast Included">CP (Breakfast Included)</option>
                                                            <option value="Breakfast + Meal">MAP (Breakfast + 1 Meal)</option>
                                                            <option value="All Inclusive">AP (All Meals)</option>
                                                            <option value="Honeymoon Package">Honeymoon Package</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Rate (₹)</label>
                                                        <input type="number" value={variant.price} onChange={(e) => {
                                                            const nv = [...formData.variants]; nv[idx].price = e.target.value; setFormData({...formData, variants: nv});
                                                        }} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-none text-sm font-bold outline-none focus:border-indigo-600 transition-all" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cancellation Rule</label>
                                                        <select value={variant.policy} onChange={(e) => {
                                                            const nv = [...formData.variants]; nv[idx].policy = e.target.value; setFormData({...formData, variants: nv});
                                                        }} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-none text-[10px] font-bold outline-none appearance-none">
                                                            <option value="Non-refundable">Non-refundable</option>
                                                            <option value="Free cancellation till 24h">Free cancellation till 24h</option>
                                                            <option value="Free cancellation till 48h">Free cancellation till 48h</option>
                                                        </select>
                                                    </div>
                                                    <button type="button" onClick={() => setFormData({...formData, variants: formData.variants.filter((_, i) => i !== idx)})} className="mt-6 px-4 py-3 bg-rose-50 text-rose-600 rounded-none hover:bg-rose-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.variants.length === 0 && (
                                            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-none bg-slate-50/50"><Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Add your own rate plans</p></div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeEditTab === 'seo' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-slate-900 rounded-none" />
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Google Search Ranking</h3>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-none border border-slate-200 space-y-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Search className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Google Preview</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-blue-700 text-lg font-medium hover:underline cursor-pointer">{formData.seoTitle || formData.name || "Room Page Title"}</h4>
                                            <p className="text-emerald-700 text-[10px] flex items-center gap-1">gethotelstays.com/rooms/<span className="font-bold">{formData.slug || "deluxe-ocean-view"}</span></p>
                                            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{formData.seoDescription || formData.description || "Enter an SEO description to see how this page appears in search results."}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Focus SEO Title</label>
                                            <input type="text" placeholder="Recommended: 60 characters max" value={formData.seoTitle} onChange={(e) => setFormData({...formData, seoTitle: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-slate-900 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom URL Slug</label>
                                            <div className="relative"><span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs tracking-widest">/</span><input type="text" placeholder="deluxe-suite-pool-view" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full pl-10 pr-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-slate-900 outline-none transition-all" /></div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description</label>
                                            <textarea placeholder="Write a catchy description for search engines..." value={formData.seoDescription} onChange={(e) => setFormData({...formData, seoDescription: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-slate-900 outline-none transition-all min-h-[120px] resize-none" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Sidebar - Integrity & Actions */}
                    <div className="space-y-8">
                        <div className="bg-white border border-slate-200 rounded-none p-8 space-y-8 shadow-sm sticky top-24">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-slate-900 rounded-none" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Setup Quality Score</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-end justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</p>
                                        <p className="text-3xl font-black text-slate-900">{calculateIntegrity().score}%</p>
                                    </div>
                                    <div className="w-24 h-2 text-slate-100 bg-slate-100 rounded-none overflow-hidden">
                                        <div 
                                            className={cn(
                                                "h-full transition-all duration-500",
                                                calculateIntegrity().score > 80 ? "bg-emerald-500" : 
                                                calculateIntegrity().score > 50 ? "bg-amber-400" : "bg-red-500"
                                            )}
                                            style={{ width: `${calculateIntegrity().score}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {calculateIntegrity().checks.map(check => (
                                        <div key={check.id} className="flex items-center gap-3">
                                            {check.met ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-200" />}
                                            <span className={cn("text-[10px] font-bold uppercase tracking-tight", check.met ? "text-slate-600" : "text-slate-300")}>{check.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 space-y-4">
                                <button type="button" onClick={handleDuplicateRoom} className="w-full px-6 py-4 bg-slate-50 text-slate-600 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3"><Copy className="w-4 h-4" /> Clone This Category</button>
                                <div className="p-6 bg-blue-50 rounded-none border border-blue-100">
                                    <div className="flex gap-3">
                                        <Info className="w-4 h-4 text-blue-600 shrink-0" /><p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase">High integrity scores increase your conversion rate by up to 40% on search results.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hourly Stay Confirmation Portal */}
                <AnimatePresence>
                    {showHourlyConfirm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHourlyConfirm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-none p-8 max-w-md w-full shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Clock className="w-32 h-32 text-purple-600" /></div>
                                <div className="relative space-y-6">
                                    <div className="w-14 h-14 bg-purple-50 rounded-none flex items-center justify-center text-purple-600"><Clock className="w-7 h-7" /></div>
                                    <div className="space-y-2"><h3 className="text-2xl font-black text-slate-900 tracking-tight">Enable Hourly Stays?</h3><p className="text-slate-500 text-sm font-medium leading-relaxed">By enabling this, guests will be able to book this room for 3, 6, or 12-hour slots. Please ensure you have set competitive rates for these time durations.</p></div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setShowHourlyConfirm(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                        <button onClick={() => { setFormData({...formData, isHourlyEnabled: true}); setShowHourlyConfirm(false); }} className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all">Enable Now</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Rooms</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Add, edit and manage your property's room categories</p>
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast.type && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className={cn(
                                "fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-none shadow-2xl border flex items-center gap-4 min-w-[300px]",
                                toast.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" : "bg-red-600 border-red-500 text-white"
                            )}
                        >
                            <div className="w-8 h-8 bg-white/20 rounded-none flex items-center justify-center">
                                {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">System Message</p>
                                <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 p-1 rounded-none flex items-center shadow-sm">
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
                        className="px-6 py-3.5 bg-blue-600 text-white text-xs font-bold rounded-none hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Room Category
                    </button>
                </div>
            </div>

            {/* Rooms Display */}
            {rooms.length === 0 ? (
                <div className="py-32 bg-white rounded-none border border-dashed border-slate-200 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-none flex items-center justify-center mb-6 text-slate-200">
                        <Bed className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">No Room Categories Yet</h2>
                    <p className="text-slate-500 mb-8 max-w-sm font-medium">Add your first room category to start receiving bookings.</p>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-8 py-4 bg-slate-900 text-white rounded-none font-black text-[10px] uppercase tracking-widest"
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
                            viewMode === 'grid' ? "rounded-none" : "rounded-none flex flex-col md:flex-row items-center p-6 gap-8"
                        )}>
                            {/* Thumbnail */}
                            <div className={cn(
                                "bg-slate-100 flex items-center justify-center relative",
                                viewMode === 'grid' ? "h-56 w-full" : "h-40 w-64 rounded-none shrink-0"
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
                                        className="p-2.5 bg-white/90 backdrop-blur-md rounded-none text-slate-600 hover:text-blue-600 shadow-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRoom(room.id)}
                                        className="p-2.5 bg-white/90 backdrop-blur-md rounded-none text-slate-600 hover:text-red-600 shadow-sm"
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
                            className="relative bg-white rounded-none p-8 max-w-md w-full shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <Clock className="w-32 h-32 text-purple-600" />
                            </div>
                            
                            <div className="relative space-y-6">
                                <div className="w-14 h-14 bg-purple-50 rounded-none flex items-center justify-center text-purple-600">
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
                                        className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setFormData({...formData, isHourlyEnabled: true});
                                            setShowHourlyConfirm(false);
                                        }}
                                        className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all"
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



