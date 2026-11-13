'use client';

import React, { useState, useRef, useEffect } from "react";
import {
    Phone, Mail, Globe, Plus, Search, Copy, ExternalLink,
    X, Save, ArrowLeft, Eye, Building, RefreshCw, Star,
    Check, Zap, Trash2, Image as ImageIcon, Loader2, Upload
} from "lucide-react";
import Image from "@/components/common/Image";

interface AdminDirectoryProps {
    hotels: any[];
    loading?: boolean;
    onRefresh?: () => void;
}

const POPULAR_AMENITIES = [
    { id: "WiFi", label: "Free Wi-Fi", icon: "📶" },
    { id: "AC", label: "Air Conditioning", icon: "❄️" },
    { id: "Swimming Pool", label: "Swimming Pool", icon: "🏊" },
    { id: "Parking", label: "Free Parking", icon: "🅿️" },
    { id: "Restaurant", label: "Restaurant", icon: "🍽️" },
    { id: "Room Service", label: "24/7 Room Service", icon: "🛎️" },
    { id: "Power Backup", label: "Power Backup", icon: "⚡" },
    { id: "Elevator", label: "Elevator / Lift", icon: "🛗" },
    { id: "CCTV", label: "CCTV Cameras", icon: "📹" },
    { id: "Geyser", label: "Geyser / Hot Water", icon: "🚿" },
    { id: "Couple Friendly", label: "Couple Friendly", icon: "💑" },
    { id: "Breakfast Included", label: "Breakfast Included", icon: "🍳" },
    { id: "Pet Friendly", label: "Pet Friendly", icon: "🐾" },
    { id: "Spa", label: "Spa & Wellness", icon: "💆" },
    { id: "Gym", label: "Gym & Fitness", icon: "🏋️" },
    { id: "Doctor on Call", label: "Doctor on Call", icon: "🩺" },
];

const safeParse = (val: any, fallback: any = []) => {
    if (!val) return fallback;
    if (typeof val !== "string") return Array.isArray(val) ? val : fallback;
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (_) {
        return fallback;
    }
};

const slugify = (text: string) => {
    return (text || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};

export default function AdminDirectory({ hotels, loading = false, onRefresh }: AdminDirectoryProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [managedHotel, setManagedHotel] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newPhotoUrl, setNewPhotoUrl] = useState("");
    const [customAmenity, setCustomAmenity] = useState("");
    const [copiedSlug, setCopiedSlug] = useState(false);
    const [isFetchingOta, setIsFetchingOta] = useState(false);
    const [otaStatusMsg, setOtaStatusMsg] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
    const [showManualOverride, setShowManualOverride] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [cloneUrl, setCloneUrl] = useState("");
    const [isCloning, setIsCloning] = useState(false);
    const [directList, setDirectList] = useState<any[]>([]);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const loadDirectList = () => {
        fetch("/api/hotels?listingType=directory")
            .then(r => r.json())
            .then(d => {
                if (d.success && Array.isArray(d.data)) {
                    setDirectList(d.data);
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        loadDirectList();
    }, []);

    // Combine hotels from props and direct endpoint to guarantee all properties appear
    const mergedMap = new Map();
    (hotels || []).filter(h => h.listingType === "directory").forEach(h => mergedMap.set(h.id, h));
    directList.forEach(h => {
        const existing = mergedMap.get(h.id) || {};
        mergedMap.set(h.id, { ...existing, ...h });
    });
    const directoryHotels = Array.from(mergedMap.values());

    // Filter by search query
    const filteredHotels = directoryHotels.filter(hotel => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            hotel.name?.toLowerCase().includes(q) ||
            hotel.city?.toLowerCase().includes(q) ||
            hotel.address?.toLowerCase().includes(q) ||
            hotel.contactPhone?.toLowerCase().includes(q) ||
            hotel.contactEmail?.toLowerCase().includes(q) ||
            String(hotel.id).includes(q)
        );
    });

    // Open Hotel for Management
    const handleOpenManage = (hotel: any) => {
        setManagedHotel({
            ...hotel,
            starRating: hotel.starRating || 5,
            imagesList: safeParse(hotel.images, []),
            amenitiesList: safeParse(hotel.amenities, []),
        });
        setNewPhotoUrl("");
        setCustomAmenity("");
        setCopiedSlug(false);
        setOtaStatusMsg(null);
        setShowManualOverride(false);
    };

    // Open Create New Hotel
    const handleOpenCreate = () => {
        setManagedHotel({
            id: null,
            name: "",
            city: "Delhi",
            address: "",
            description: "",
            contactPhone: "",
            contactEmail: "",
            contactPerson: "",
            starRating: 5,
            thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
            imagesList: [],
            amenitiesList: ["WiFi", "AC", "Power Backup", "Geyser"],
            bookingUrl: "",
            bookingPrice: "",
            mmtUrl: "",
            mmtPrice: "",
            listingType: "directory"
        });
        setNewPhotoUrl("");
        setCustomAmenity("");
        setCopiedSlug(false);
        setOtaStatusMsg(null);
        setShowManualOverride(false);
    };

    // Upload local file from computer to server
    const uploadFileToBackend = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64 = e.target?.result as string;
                    const token = localStorage.getItem("token") || "";
                    const res = await fetch("/api/admin/upload-image", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { "Authorization": `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ image: base64 })
                    });
                    const text = await res.text();
                    let data: any = {};
                    try { data = JSON.parse(text); } catch (_) { data = {}; }
                    if (data.success && data.url) {
                        resolve(data.url);
                    } else {
                        resolve(base64);
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingPhoto(true);
        try {
            const url = await uploadFileToBackend(file);
            setManagedHotel((prev: any) => ({ ...prev, thumbnail: url }));
        } catch (err) {
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploadingPhoto(false);
            if (e.target) e.target.value = "";
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploadingPhoto(true);
        try {
            const newUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const url = await uploadFileToBackend(files[i]);
                newUrls.push(url);
            }
            setManagedHotel((prev: any) => ({
                ...prev,
                imagesList: [...(prev?.imagesList || []), ...newUrls]
            }));
        } catch (err) {
            alert("Failed to upload photos. Please try again.");
        } finally {
            setIsUploadingPhoto(false);
            if (e.target) e.target.value = "";
        }
    };

    // Fetch lowest price from Booking.com
    const handleFetchOtaPrices = async () => {
        if (!managedHotel?.bookingUrl) {
            alert("Please paste a Booking.com listing link first!");
            return;
        }

        setIsFetchingOta(true);
        setOtaStatusMsg({
            type: 'info',
            text: 'Fetching latest starting rate from Booking.com...'
        });

        try {
            const token = localStorage.getItem("token") || "";
            const endpoint = managedHotel.id
                ? `/api/admin/hotels/${managedHotel.id}/fetch-ota-prices`
                : `/api/admin/hotels/fetch-ota-prices`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    bookingUrl: managedHotel.bookingUrl || "",
                    hotelId: managedHotel.id
                })
            });

            const text = await res.text();
            let data: any = {};
            try {
                data = JSON.parse(text);
            } catch (_) {
                data = { success: false, message: "Server connection failed. Retrying..." };
            }

            if (data.success && data.bookingPrice) {
                const newPrice = Number(data.bookingPrice);
                setManagedHotel((prev: any) => ({
                    ...prev,
                    bookingPrice: newPrice,
                    pricePerNight: newPrice,
                    otaLastFetchedAt: new Date().toISOString()
                }));
                setOtaStatusMsg({
                    type: 'success',
                    text: `Booking.com starting price updated: ₹${newPrice.toLocaleString('en-IN')}/night`
                });
            } else if (data.success) {
                setOtaStatusMsg({
                    type: 'success',
                    text: data.message || 'Rates verified successfully.'
                });
            } else {
                setOtaStatusMsg({
                    type: 'error',
                    text: data.message || 'Could not fetch live rate. You can manually enter the price below.'
                });
            }
        } catch (err: any) {
            setOtaStatusMsg({
                type: 'error',
                text: err.message || 'Fetch error'
            });
        } finally {
            setIsFetchingOta(false);
        }
    };

    // Deep clone hotel details & download all photos from Booking.com link
    const handleCloneHotel = async (urlToClone: string) => {
        if (!urlToClone || !urlToClone.trim()) return;
        setIsCloning(true);
        setOtaStatusMsg({ type: 'info', text: 'Connecting to listing, scraping details and downloading high-res photos to server...' });
        try {
            const token = localStorage.getItem("token") || "";
            const res = await fetch("/api/admin/hotels/clone-from-ota", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ url: urlToClone.trim(), maxPhotos: 8 })
            });
            const text = await res.text();
            let data: any = null;
            try {
                data = JSON.parse(text);
            } catch (_) {
                data = { success: false, message: text?.slice(0, 100) || "Invalid server response" };
            }
            if (data && data.success) {
                setManagedHotel((prev: any) => ({
                    ...(prev || {}),
                    name: data.name || prev?.name || "",
                    city: data.city || prev?.city || "Delhi",
                    address: data.address || prev?.address || "",
                    starRating: data.starRating || prev?.starRating || 4,
                    description: data.description || prev?.description || "",
                    thumbnail: data.thumbnail || prev?.thumbnail || "",
                    imagesList: data.imagesList && data.imagesList.length > 0 ? data.imagesList : (prev?.imagesList || []),
                    amenitiesList: data.amenities && data.amenities.length > 0 ? data.amenities : (prev?.amenitiesList || ["WiFi", "AC"]),
                    bookingUrl: data.bookingUrl || urlToClone.trim(),
                    bookingPrice: data.bookingPrice || prev?.bookingPrice || "",
                }));
                setOtaStatusMsg({
                    type: 'success',
                    text: `Successfully cloned "${data.name}" and downloaded ${data.downloadedPhotosCount} high-res photos to server!`
                });
            } else {
                setOtaStatusMsg({
                    type: 'error',
                    text: data?.message || data?.error || "Could not clone details from this URL"
                });
            }
        } catch (err: any) {
            setOtaStatusMsg({
                type: 'error',
                text: err.message || "Network error while cloning hotel"
            });
        } finally {
            setIsCloning(false);
        }
    };

    // Save Changes
    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!managedHotel) return;
        if (!managedHotel.name?.trim() || !managedHotel.city?.trim()) {
            alert("Hotel name and city are required!");
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem("token") || "";
            const isNew = !managedHotel.id;
            const url = isNew ? "/api/admin/hotels/directory" : `/api/admin/hotels/${managedHotel.id}/convert-type`;
            const method = isNew ? "POST" : "PUT";

            const payload = {
                ...managedHotel,
                images: JSON.stringify(managedHotel.imagesList || []),
                amenities: JSON.stringify(managedHotel.amenitiesList || []),
                mainAmenities: JSON.stringify(managedHotel.amenitiesList || []),
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert(isNew ? "New directory listing created successfully!" : "Directory listing updated successfully!");
                setManagedHotel(null);
                if (onRefresh) onRefresh();
                else window.location.reload();
            } else {
                alert(`Error: ${data.message || "Failed to save directory hotel"}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Convert from Directory to Bookable partner
    const handleConvert = async (hotelId: number, hotelName: string) => {
        if (!confirm(`Are you sure you want to convert "${hotelName}" (ID ${hotelId}) from Directory to an Active Bookable Partner?`)) return;
        try {
            const token = localStorage.getItem("token") || "";
            const res = await fetch(`/api/admin/hotels/${hotelId}/convert-type`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ listingType: "bookable" })
            });
            const data = await res.json();
            if (data.success) {
                alert(`"${hotelName}" is now an Active Bookable Partner!`);
                setManagedHotel(null);
                if (onRefresh) onRefresh();
                else window.location.reload();
            } else {
                alert(`Failed: ${data.message}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    // Permanently Delete Directory Hotel
    const handleDeleteHotel = async (hotelId: number, hotelName: string) => {
        if (!confirm(`Are you sure you want to permanently delete "${hotelName}" (ID #${hotelId}) from Directory?`)) {
            return;
        }
        try {
            const token = localStorage.getItem("token") || "";
            const res = await fetch(`/api/admin/hotels/${hotelId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setDirectList(prev => prev.filter(h => h.id !== hotelId));
                if (managedHotel?.id === hotelId) {
                    setManagedHotel(null);
                }
                if (onRefresh) onRefresh();
            } else {
                alert(`Error: ${data.message || "Failed to delete hotel"}`);
            }
        } catch (err: any) {
            alert(`Error deleting hotel: ${err.message}`);
        }
    };

    // Toggle Amenity
    const toggleAmenity = (amenityId: string) => {
        if (!managedHotel) return;
        const current: string[] = managedHotel.amenitiesList || [];
        const exists = current.includes(amenityId);
        const updated = exists ? current.filter(a => a !== amenityId) : [...current, amenityId];
        setManagedHotel({ ...managedHotel, amenitiesList: updated });
    };

    // Add Custom Amenity
    const handleAddCustomAmenity = () => {
        if (!customAmenity.trim() || !managedHotel) return;
        const current: string[] = managedHotel.amenitiesList || [];
        if (!current.includes(customAmenity.trim())) {
            setManagedHotel({ ...managedHotel, amenitiesList: [...current, customAmenity.trim()] });
        }
        setCustomAmenity("");
    };

    // Add Photo to Gallery
    const handleAddPhoto = () => {
        if (!newPhotoUrl.trim() || !managedHotel) return;
        const current: string[] = managedHotel.imagesList || [];
        setManagedHotel({ ...managedHotel, imagesList: [...current, newPhotoUrl.trim()] });
        setNewPhotoUrl("");
    };

    // Remove Photo from Gallery
    const handleRemovePhoto = (index: number) => {
        if (!managedHotel) return;
        const current: string[] = managedHotel.imagesList || [];
        const updated = current.filter((_, i) => i !== index);
        setManagedHotel({ ...managedHotel, imagesList: updated });
    };

    // =========================================================================
    // VIEW 1: DEDICATED FULL-PAGE HOTEL MANAGEMENT VIEW
    // =========================================================================
    if (managedHotel) {
        const hotelSlug = slugify(managedHotel.name);
        const citySlug = slugify(managedHotel.city || "india");
        const dirSlugUrl = `/hotels-directory/${citySlug}/${hotelSlug}`;
        const fullLiveUrl = typeof window !== "undefined" ? `${window.location.origin}${dirSlugUrl}` : dirSlugUrl;

        return (
            <div className="space-y-6 pb-20 max-w-7xl mx-auto">
                {/* Top Sticky Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 bg-slate-50/50 sticky top-0 z-30 backdrop-blur-md pt-2">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setManagedHotel(null)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center cursor-pointer"
                            title="Back to Listings"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                    {managedHotel.id ? `Manage "${managedHotel.name}"` : "Add New Directory Hotel"}
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                                    Directory Listing
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Edit hotel details, direct contacts, Booking.com & MMT links, photos, and amenities.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {managedHotel.id && (
                            <>
                                <a
                                    href={dirSlugUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Preview Live Page</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => handleConvert(managedHotel.id, managedHotel.name)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold transition-colors"
                                    title="Convert this directory hotel to an instant-booking partner"
                                >
                                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Onboard to 12% Partner</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteHotel(managedHotel.id, managedHotel.name)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                    title="Delete this directory hotel permanently"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete</span>
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                        </button>
                    </div>
                </div>

                {/* Engagement & Leads Stats */}
                {managedHotel.id && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                            <div>
                                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phone Calls</div>
                                <div className="text-2xl font-bold text-slate-900 mt-0.5">{managedHotel.callClicks || 0}</div>
                                <div className="text-[10px] text-emerald-600 font-medium">Guests dialed front desk</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Phone className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                            <div>
                                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Leads</div>
                                <div className="text-2xl font-bold text-slate-900 mt-0.5">{managedHotel.emailClicks || 0}</div>
                                <div className="text-[10px] text-blue-600 font-medium">Direct reservation quotes</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                            <div>
                                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Guest Page Views</div>
                                <div className="text-2xl font-bold text-slate-900 mt-0.5">{managedHotel.viewCount || 0}</div>
                                <div className="text-[10px] text-amber-600 font-medium">Organic SEO impressions</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Eye className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                )}

                {/* 1-Click Deep Clone Bar */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <Building className="w-4 h-4 text-slate-700" />
                        <div>
                            <div className="text-xs font-bold text-slate-900">Auto-Clone from Booking.com Link</div>
                            <div className="text-[10px] text-slate-400">Copies Name, Address, Rating, Description, Amenities, Price & downloads HD photos to server</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-xl">
                        <input
                            type="text"
                            value={cloneUrl}
                            onChange={(e) => setCloneUrl(e.target.value)}
                            placeholder="Paste Booking.com hotel URL..."
                            disabled={isCloning}
                            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleCloneHotel(cloneUrl)}
                            disabled={isCloning || !cloneUrl.trim()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                        >
                            {isCloning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            <span>{isCloning ? "Cloning & Downloading Photos..." : "Clone Details & Photos"}</span>
                        </button>
                    </div>
                </div>

                {/* Form Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CARD 1: Basic Hotel Information */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <Building className="w-4 h-4 text-slate-600" />
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Basic Property Info</h3>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Name *</label>
                                <input
                                    type="text"
                                    value={managedHotel.name || ""}
                                    onChange={(e) => setManagedHotel({ ...managedHotel, name: e.target.value })}
                                    placeholder="e.g. Panaji Grand Heritage"
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Destination *</label>
                                    <input
                                        type="text"
                                        value={managedHotel.city || ""}
                                        onChange={(e) => setManagedHotel({ ...managedHotel, city: e.target.value })}
                                        placeholder="e.g. Goa, Delhi, Jaipur"
                                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Star Rating</label>
                                    <select
                                        value={managedHotel.starRating || 5}
                                        onChange={(e) => setManagedHotel({ ...managedHotel, starRating: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5 Star Luxury)</option>
                                        <option value="4">⭐⭐⭐⭐ (4 Star Premium)</option>
                                        <option value="3">⭐⭐⭐ (3 Star Comfort)</option>
                                        <option value="2">⭐⭐ (2 Star Standard)</option>
                                        <option value="1">⭐ (1 Star Basic)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address</label>
                                <input
                                    type="text"
                                    value={managedHotel.address || ""}
                                    onChange={(e) => setManagedHotel({ ...managedHotel, address: e.target.value })}
                                    placeholder="e.g. Fontainhas Latin Quarter, Panaji, Goa 403001"
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                                />
                            </div>

                            {/* SEO Slug URL Preview */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Programmatic SEO Slug URL
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-mono text-blue-700 truncate">
                                        {dirSlugUrl}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(fullLiveUrl);
                                            setCopiedSlug(true);
                                            setTimeout(() => setCopiedSlug(false), 2000);
                                        }}
                                        className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors shrink-0"
                                    >
                                        {copiedSlug ? "Copied!" : "Copy Full URL"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Direct Contact Reception */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <Phone className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Direct Reception Desk</h3>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Reception Phone Number</label>
                                <div className="relative">
                                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={managedHotel.contactPhone || ""}
                                        onChange={(e) => setManagedHotel({ ...managedHotel, contactPhone: e.target.value })}
                                        placeholder="+91 98110 54321"
                                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Guests clicking this button dial the reception directly.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Hotel Reservation Email</label>
                                <div className="relative">
                                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={managedHotel.contactEmail || ""}
                                        onChange={(e) => setManagedHotel({ ...managedHotel, contactEmail: e.target.value })}
                                        placeholder="reception@thetajvilas.com"
                                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">Guests clicking email send reservation enquiries to this inbox.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">General Manager / Contact Person</label>
                                <input
                                    type="text"
                                    value={managedHotel.contactPerson || ""}
                                    onChange={(e) => setManagedHotel({ ...managedHotel, contactPerson: e.target.value })}
                                    placeholder="Mr. Rajesh Sharma (General Manager)"
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: Booking.com Affiliate Link & Rates */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-700" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Booking.com Link & Starting Rate</h3>
                                    <p className="text-[10px] text-slate-400">Lowest room price is fetched from Booking.com or edited directly</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleFetchOtaPrices}
                                disabled={isFetchingOta || !managedHotel.bookingUrl}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-black active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingOta ? 'animate-spin' : ''}`} />
                                <span>{isFetchingOta ? 'Fetching Rates...' : 'Fetch Live Rates'}</span>
                            </button>
                        </div>

                        {/* Status Message */}
                        {otaStatusMsg && (
                            <div className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border ${
                                otaStatusMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : otaStatusMsg.type === 'error'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : 'bg-slate-50 text-slate-800 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {otaStatusMsg.type === 'info' && <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-slate-600" />}
                                    {otaStatusMsg.type === 'success' && <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />}
                                    <span>{otaStatusMsg.text}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOtaStatusMsg(null)}
                                    className="text-slate-400 hover:text-slate-700 text-sm font-bold leading-none px-1"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Booking.com Group */}
                            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-[#003580] text-white flex items-center justify-center font-bold text-[10px]">
                                            B.
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">Booking.com</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                                        Global Partner
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[11px] font-semibold text-slate-700">Booking.com Listing URL</label>
                                        {managedHotel.bookingUrl && (
                                            <a
                                                href={managedHotel.bookingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                                            >
                                                Open Link <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        type="url"
                                        value={managedHotel.bookingUrl || ""}
                                        onChange={(e) => setManagedHotel({ ...managedHotel, bookingUrl: e.target.value })}
                                        placeholder="https://www.booking.com/hotel/..."
                                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                                    />
                                </div>

                                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                    <label className="block text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1.5">
                                        Lowest Room Starting Rate (₹ / night)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                value={managedHotel.bookingPrice ?? managedHotel.pricePerNight ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.value !== "" ? parseFloat(e.target.value) : "";
                                                    setManagedHotel({
                                                        ...managedHotel,
                                                        bookingPrice: val,
                                                        pricePerNight: val !== "" ? val : 0
                                                    });
                                                }}
                                                placeholder="e.g. 2499"
                                                className="w-full pl-7 pr-3 py-2 text-sm font-bold text-slate-900 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">/ night</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5">
                                        Directly editable. Users will see this starting rate on the directory & detail pages.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: Photos & Gallery Management */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-slate-700" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Photos & Gallery</h3>
                            </div>
                            {isUploadingPhoto && (
                                <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                                </span>
                            )}
                        </div>

                        {/* Hidden file inputs */}
                        <input
                            type="file"
                            ref={thumbnailInputRef}
                            onChange={handleThumbnailUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <input
                            type="file"
                            ref={galleryInputRef}
                            onChange={handleGalleryUpload}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />

                        <div className="space-y-5">
                            {/* Primary Cover Photo */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Primary Cover Photo</label>
                                {managedHotel.thumbnail ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-36 h-24 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shrink-0 shadow-2xs">
                                            <Image
                                                src={managedHotel.thumbnail}
                                                alt="Cover Photo"
                                                width={144}
                                                height={96}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => thumbnailInputRef.current?.click()}
                                                disabled={isUploadingPhoto}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Change Photo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setManagedHotel({ ...managedHotel, thumbnail: "" })}
                                                className="block text-[11px] text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                            >
                                                Remove photo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 rounded-xl p-5 text-center cursor-pointer transition-colors"
                                    >
                                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
                                        <div className="text-xs font-semibold text-slate-700">Click to choose cover photo from your computer</div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP from local files</p>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Photos */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Gallery Photos ({managedHotel.imagesList?.length || 0})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => galleryInputRef.current?.click()}
                                        disabled={isUploadingPhoto}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Add Photos from Computer
                                    </button>
                                </div>

                                {managedHotel.imagesList && managedHotel.imagesList.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                                        {managedHotel.imagesList.map((imgUrl: string, idx: number) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 h-20 bg-slate-100">
                                                <Image
                                                    src={imgUrl}
                                                    alt={`Gallery Photo ${idx + 1}`}
                                                    width={96}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePhoto(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    title="Delete photo"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => galleryInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-5 text-center cursor-pointer transition-colors"
                                    >
                                        <ImageIcon className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                                        <div className="text-xs font-medium text-slate-600">No gallery photos uploaded yet</div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Click "Add Photos from Computer" to select local files</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 5: Property Description */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Building className="w-4 h-4 text-slate-700" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Property Description & Highlights</h3>
                    </div>
                    <textarea
                        rows={4}
                        value={managedHotel.description || ""}
                        onChange={(e) => setManagedHotel({ ...managedHotel, description: e.target.value })}
                        placeholder="Provide details about the hotel location, heritage, amenities, and guest experience for SEO and visitors..."
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all leading-relaxed"
                    />
                </div>

                {/* CARD 6: Amenities & Facilities Management */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                Amenities & Facilities ({managedHotel.amenitiesList?.length || 0} Selected)
                            </h3>
                        </div>
                        <span className="text-xs text-slate-400">Click any amenity chip to toggle it on or off</span>
                    </div>

                    {/* Popular Amenities Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {POPULAR_AMENITIES.map((item) => {
                            const isSelected = (managedHotel.amenitiesList || []).includes(item.id) ||
                                (managedHotel.amenitiesList || []).includes(item.label);

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleAmenity(item.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                                        isSelected
                                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                    }`}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span className="truncate flex-1">{item.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Add Custom Amenity */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <input
                            type="text"
                            value={customAmenity}
                            onChange={(e) => setCustomAmenity(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCustomAmenity();
                                }
                            }}
                            placeholder="Add custom amenity (e.g. Infinity Pool, Tennis Court)..."
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomAmenity}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors shrink-0"
                        >
                            + Add Amenity
                        </button>
                    </div>
                </div>

                {/* Bottom Action Footer Bar */}
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                    <button
                        type="button"
                        onClick={() => setManagedHotel(null)}
                        className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                        ← Back to Directory
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // VIEW 2: FULL-WIDTH CLEAN DIRECTORY LISTINGS TABLE
    // =========================================================================
    return (
        <div className="space-y-6">
            {/* Header Toolbar directly on page background */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Hotel Directory & Lead Bank</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                        {directoryHotels.length} Listed Properties
                    </span>
                </div>

                <div className="flex items-center gap-2.5">
                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                            title="Refresh Data"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        title="Import hotel details and download photos from Booking.com link"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                        <span>Clone from Link</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Directory Hotel</span>
                    </button>
                </div>
            </div>

            {/* Spacious, Full-Width Main Table Container */}
            <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by hotel name, city, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        Showing <strong className="text-slate-900">{filteredHotels.length}</strong> of {directoryHotels.length} listings
                    </div>
                </div>

                {/* Listings Table: Super Clean & Spacious */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Property Details</th>
                                <th className="px-6 py-4">Direct Contact Desk</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredHotels.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-16 text-center text-slate-400 text-xs">
                                        No directory hotels found. Click <strong>"Add Directory Hotel"</strong> to create one!
                                    </td>
                                </tr>
                            ) : (
                                filteredHotels.map((hotel) => (
                                    <tr 
                                        key={hotel.id} 
                                        onClick={() => handleOpenManage(hotel)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                    >
                                        {/* 1. Property Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                                                    {hotel.thumbnail ? (
                                                        <Image
                                                            src={hotel.thumbnail}
                                                            alt={hotel.name}
                                                            width={56}
                                                            height={56}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Building className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                                            {hotel.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200/70 uppercase">
                                                            Directory
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        {hotel.city}, {hotel.address || "Address pending"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Direct Contact Desk */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {hotel.contactPhone ? (
                                                    <a
                                                        href={`tel:${hotel.contactPhone}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-emerald-700"
                                                    >
                                                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        <span>{hotel.contactPhone}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No phone set</span>
                                                )}

                                                {hotel.contactEmail ? (
                                                    <a
                                                        href={`mailto:${hotel.contactEmail}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700"
                                                    >
                                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{hotel.contactEmail}</span>
                                                    </a>
                                                ) : null}

                                                {hotel.contactPerson && (
                                                    <div className="text-[11px] text-slate-400 font-medium">
                                                        Manager: {hotel.contactPerson}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 3. Action: Clean Manage & One-Click Delete */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenManage(hotel);
                                                    }}
                                                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-white border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                                >
                                                    Manage →
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteHotel(hotel.id, hotel.name);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all shadow-2xs cursor-pointer"
                                                    title={`Delete "${hotel.name}"`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
