import React, { useState, useEffect } from "react";
import { packageApi } from "@/lib/api";
import Loader from "@/components/common/Loader";
import SEOHead from "@/components/common/SEOHead";
import {
    Palmtree, Plus, Edit, Trash2, Search, Check, X,
    Eye, EyeOff, MapPin, Clock, Star, Sparkles, Image, ArrowLeft,
    Calendar, ShieldCheck, ChevronRight, Save, Upload, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPackages() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // View state: 'list' for packages table, 'form' for in-page editor
    const [viewMode, setViewMode] = useState<"list" | "form">("list");
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Image uploading states
    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    // Form state
    const [formData, setFormData] = useState<any>({
        title: "",
        slug: "",
        destination: "",
        duration: "5 Days / 4 Nights",
        price: 15000,
        originalPrice: 19999,
        discountPercent: "25% OFF",
        rating: 4.8,
        reviewsCount: 45,
        badge: "Bestseller",
        includedStay: "4-Star Hotel Stay",
        transport: "Private AC Cab Included",
        image: "",
        gallery: "",
        overview: "",
        inclusions: ["4-Star Hotel Stay with Breakfast", "Airport Transfers Included", "Guided Sightseeing Tour"],
        itinerary: [
            { day: "Day 1", title: "Arrival & Hotel Check-in", desc: "Welcome reception and check-in to your resort." },
            { day: "Day 2", title: "Guided City Sightseeing", desc: "Full day sightseeing tour with private guide." }
        ],
        isActive: true
    });

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await packageApi.getPackages({ includeInactive: true });
            if (res && res.success) {
                setPackages(res.data || []);
            }
        } catch (err: any) {
            console.error("Failed to fetch packages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    // Smart Price & Automatic Discount Calculator
    const handlePriceChange = (field: "price" | "originalPrice", value: any) => {
        setFormData((prev: any) => {
            const updated = { ...prev, [field]: value };
            const original = parseFloat(updated.originalPrice);
            const selling = parseFloat(updated.price);

            if (original && selling && original > selling) {
                const pct = Math.round(((original - selling) / original) * 100);
                updated.discountPercent = `${pct}% OFF`;
            } else if (original && selling && selling >= original) {
                updated.discountPercent = "";
            }
            return updated;
        });
    };

    // Local Image File Upload Handler
    const handleLocalImageUpload = async (file: File, type: "main" | "gallery") => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            if (!base64) return;
            try {
                if (type === "main") setUploadingMain(true);
                else setUploadingGallery(true);

                const res = await packageApi.uploadImage(base64);
                if (res && res.success && res.url) {
                    if (type === "main") {
                        setFormData((prev: any) => ({ ...prev, image: res.url }));
                        showToast("✓ Main cover image uploaded!");
                    } else {
                        setFormData((prev: any) => {
                            const existing = typeof prev.gallery === "string" && prev.gallery
                                ? prev.gallery.split(",").map((s: string) => s.trim()).filter(Boolean)
                                : (prev.gallery || []);
                            const updated = [...existing, res.url].join(", ");
                            return { ...prev, gallery: updated };
                        });
                        showToast("✓ Gallery image added!");
                    }
                }
            } catch (err: any) {
                alert("Image upload failed: " + err.message);
            } finally {
                if (type === "main") setUploadingMain(false);
                else setUploadingGallery(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleOpenCreate = () => {
        setEditingPackage(null);
        setFormData({
            title: "",
            slug: "",
            destination: "",
            duration: "5 Days / 4 Nights",
            price: 15000,
            originalPrice: 19999,
            discountPercent: "25% OFF",
            rating: 4.8,
            reviewsCount: 45,
            badge: "Bestseller",
            includedStay: "4-Star Hotel Stay",
            transport: "Private AC Cab Included",
            image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
            gallery: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80",
            overview: "Immerse yourself in a luxurious holiday experience with handpicked stays, transfers, and sightseeing.",
            inclusions: ["4-Star Hotel Stay with Breakfast", "Private AC Cab Transfers", "Guided Sightseeing Tour"],
            itinerary: [
                { day: "Day 1", title: "Arrival & Resort Check-in", desc: "Pickup from airport/station, transfer to resort, and relax." },
                { day: "Day 2", title: "Full Day Guided Tour", desc: "Explore main heritage sights and local attractions." }
            ],
            isActive: true
        });
        setViewMode("form");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenEdit = (pkg: any) => {
        setEditingPackage(pkg);
        setFormData({
            title: pkg.title || "",
            slug: pkg.slug || "",
            destination: pkg.destination || "",
            duration: pkg.duration || "",
            price: pkg.price || 0,
            originalPrice: pkg.originalPrice || 0,
            discountPercent: pkg.discountPercent || "",
            rating: pkg.rating || 4.8,
            reviewsCount: pkg.reviewsCount || 45,
            badge: pkg.badge || "Bestseller",
            includedStay: pkg.includedStay || "",
            transport: pkg.transport || "",
            image: pkg.image || "",
            gallery: Array.isArray(pkg.gallery) ? pkg.gallery.join(", ") : (pkg.gallery || ""),
            overview: pkg.overview || "",
            inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
            itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary : [],
            isActive: pkg.isActive ?? true
        });
        setViewMode("form");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSavePackage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.destination || !formData.price) {
            alert("Please fill in all required fields (Title, Destination, Price).");
            return;
        }

        setIsSubmitting(true);
        try {
            const galleryArray = typeof formData.gallery === "string" 
                ? formData.gallery.split(",").map((s: string) => s.trim()).filter(Boolean)
                : (formData.gallery || []);

            const payload = {
                ...formData,
                gallery: galleryArray,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                rating: parseFloat(formData.rating || 4.8),
                reviewsCount: parseInt(formData.reviewsCount || 45, 10)
            };

            if (editingPackage) {
                await packageApi.updatePackage(editingPackage.id, payload);
                showToast("✓ Tour Package updated successfully!");
            } else {
                await packageApi.createPackage(payload);
                showToast("✓ New Tour Package created successfully!");
            }

            setViewMode("list");
            fetchPackages();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            alert("Failed to save package: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePackage = async (id: number, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            await packageApi.deletePackage(id);
            showToast("✓ Package deleted successfully!");
            fetchPackages();
        } catch (err: any) {
            alert("Failed to delete package: " + err.message);
        }
    };

    const handleToggleStatus = async (pkg: any) => {
        try {
            await packageApi.updatePackage(pkg.id, { isActive: !pkg.isActive });
            showToast(`✓ Package set to ${!pkg.isActive ? 'Active' : 'Hidden'}!`);
            fetchPackages();
        } catch (err: any) {
            alert("Failed to update status: " + err.message);
        }
    };

    const handleAddInclusion = () => {
        setFormData((prev: any) => ({
            ...prev,
            inclusions: [...prev.inclusions, ""]
        }));
    };

    const handleInclusionChange = (index: number, val: string) => {
        setFormData((prev: any) => {
            const updated = [...prev.inclusions];
            updated[index] = val;
            return { ...prev, inclusions: updated };
        });
    };

    const handleRemoveInclusion = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            inclusions: prev.inclusions.filter((_: any, i: number) => i !== index)
        }));
    };

    const handleAddItineraryDay = () => {
        const nextDayNum = (formData.itinerary?.length || 0) + 1;
        setFormData((prev: any) => ({
            ...prev,
            itinerary: [...(prev.itinerary || []), { day: `Day ${nextDayNum}`, title: "", desc: "" }]
        }));
    };

    const handleItineraryChange = (index: number, field: "day" | "title" | "desc", val: string) => {
        setFormData((prev: any) => {
            const updated = [...prev.itinerary];
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, itinerary: updated };
        });
    };

    const handleRemoveItineraryDay = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            itinerary: prev.itinerary.filter((_: any, i: number) => i !== index)
        }));
    };

    const filteredPackages = packages.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.destination?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 space-y-6 font-sans text-slate-900 max-w-6xl mx-auto">
            <SEOHead title="Manage Tour Packages | Admin Dashboard" description="Manage all tour packages, itineraries, inclusions and prices." noIndex />

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-[300] px-5 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2"
                    >
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========================================================= */}
            {/* VIEW MODE 1: LIST / TABLE VIEW */}
            {/* ========================================================= */}
            {viewMode === "list" && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                                <Palmtree className="w-4 h-4 text-blue-600" />
                                <span>Tour Packages</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Package Directory ({packages.length})
                            </h1>
                        </div>

                        <button
                            onClick={handleOpenCreate}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create New Package</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by package title or destination..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 outline-none shadow-sm transition-all"
                        />
                    </div>

                    {/* Packages List */}
                    {loading ? (
                        <Loader variant="inline" text="Loading tour packages..." />
                    ) : filteredPackages.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-4">
                            <Palmtree className="w-10 h-10 text-slate-300 mx-auto" />
                            <h3 className="text-sm font-bold uppercase text-slate-700">No Tour Packages Found</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                                Click "Create New Package" to add your first tour package!
                            </p>
                            <button
                                onClick={handleOpenCreate}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all inline-flex items-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add First Package</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
                            {filteredPackages.map((pkg) => (
                                <div key={pkg.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <img
                                            src={pkg.image || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=200&q=80"}
                                            alt={pkg.title}
                                            className="w-16 h-14 rounded-xl object-cover shrink-0 border border-slate-200/80"
                                        />
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                                    {pkg.badge || "Package"}
                                                </span>
                                                {!pkg.isActive && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-md border border-red-100">
                                                        Hidden
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 truncate">
                                                {pkg.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1 text-slate-700">
                                                    <MapPin className="w-3 h-3 text-blue-600" />
                                                    {pkg.destination}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-blue-600" />
                                                    {pkg.duration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                        <div className="text-left sm:text-right">
                                            <span className="text-base font-extrabold text-blue-600 block">₹{pkg.price?.toLocaleString()}</span>
                                            {pkg.originalPrice && (
                                                <span className="text-[10px] font-semibold text-slate-400 line-through">₹{pkg.originalPrice?.toLocaleString()}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleToggleStatus(pkg)}
                                                title={pkg.isActive ? "Hide Package" : "Publish Package"}
                                                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                                    pkg.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                                                }`}
                                            >
                                                {pkg.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>

                                            <button
                                                onClick={() => handleOpenEdit(pkg)}
                                                title="Edit Package"
                                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                                                title="Delete Package"
                                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* VIEW MODE 2: IN-PAGE MINIMAL EDITOR VIEW (NO MODALS / POPUPS!) */}
            {/* ========================================================= */}
            {viewMode === "form" && (
                <form onSubmit={handleSavePackage} className="space-y-6 pb-20">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm sticky top-4 z-40">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                                    {editingPackage ? "Edit Package Mode" : "New Package Creator"}
                                </span>
                                <h1 className="text-lg font-black text-slate-900">
                                    {editingPackage ? (editingPackage.title || "Edit Package") : "Create Tour Package"}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer hidden sm:block"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isSubmitting ? "Saving..." : (editingPackage ? "Save Changes" : "Publish Package")}</span>
                            </button>
                        </div>
                    </div>

                    {/* Section 1: Basic Information */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Palmtree className="w-4 h-4 text-blue-600" />
                            <span>1. Basic Details</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Package Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Royal Rajasthan Heritage Trail"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Destination *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    placeholder="e.g. Jaipur • Udaipur • Jodhpur"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Duration *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g. 6 Days / 5 Nights"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Badge Label</label>
                                <input
                                    type="text"
                                    value={formData.badge}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="e.g. Bestseller, Trending, Hot Deal"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Pricing */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <span>₹</span>
                            <span>2. Pricing & Smart Discounts</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Original / Base Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={(e) => handlePriceChange("originalPrice", e.target.value)}
                                    placeholder="e.g. 1000"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Selling / Offer Price (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => handlePriceChange("price", e.target.value)}
                                    placeholder="e.g. 500"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-blue-600"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Discount Tag (Auto-Calculated)</label>
                                <input
                                    type="text"
                                    value={formData.discountPercent}
                                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                    placeholder="e.g. 50% OFF"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>

                            {/* Live Savings Calculation Banner */}
                            {parseFloat(formData.originalPrice) > parseFloat(formData.price) && parseFloat(formData.originalPrice) > 0 && (
                                <div className="md:col-span-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Auto Discount: <strong>{Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}% OFF</strong></span>
                                    </span>
                                    <span className="bg-emerald-600 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-md">
                                        Customer Saves ₹{(parseFloat(formData.originalPrice) - parseFloat(formData.price)).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Media & Accommodation */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Image className="w-4 h-4 text-blue-600" />
                            <span>3. Images & Accommodation</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Main Cover Image with Local Upload */}
                            <div className="space-y-1.5 md:col-span-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <label className="text-xs font-bold text-slate-700">Main Cover Image *</label>
                                    <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                                        {uploadingMain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                        <span>{uploadingMain ? "Uploading..." : "Upload From Computer"}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleLocalImageUpload(e.target.files[0], "main")}
                                            className="hidden"
                                            disabled={uploadingMain}
                                        />
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="Paste Image URL or click 'Upload From Computer' above..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                                {formData.image && (
                                    <div className="pt-1 flex items-center gap-3">
                                        <img src={formData.image} alt="Cover Preview" className="w-24 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
                                        <span className="text-[10px] font-bold text-slate-400">Main Cover Image Preview</span>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Images with Local Upload */}
                            <div className="space-y-1.5 md:col-span-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <label className="text-xs font-bold text-slate-700">Gallery Image URLs (Comma separated)</label>
                                    <label className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                                        {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                        <span>{uploadingGallery ? "Uploading..." : "Upload Local Gallery Files"}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    Array.from(e.target.files).forEach(f => handleLocalImageUpload(f, "gallery"));
                                                }
                                            }}
                                            className="hidden"
                                            disabled={uploadingGallery}
                                        />
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    value={formData.gallery}
                                    onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                                    placeholder="Paste URLs separated by comma or click 'Upload Local Gallery Files'..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                                {formData.gallery && (
                                    <div className="pt-1 flex items-center gap-2 overflow-x-auto">
                                        {(typeof formData.gallery === "string" ? formData.gallery.split(",").map((s: string) => s.trim()).filter(Boolean) : (formData.gallery || [])).map((imgUrl: string, idx: number) => (
                                            <img key={idx} src={imgUrl} alt={`Gallery #${idx + 1}`} className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0 shadow-sm" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Included Stay</label>
                                <input
                                    type="text"
                                    value={formData.includedStay}
                                    onChange={(e) => setFormData({ ...formData, includedStay: e.target.value })}
                                    placeholder="e.g. 4-Star Heritage Resort"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Transport Details</label>
                                <input
                                    type="text"
                                    value={formData.transport}
                                    onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                                    placeholder="e.g. Private AC Cab Included"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Package Overview */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Package Overview Description</label>
                        <textarea
                            rows={3}
                            value={formData.overview}
                            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                            placeholder="Provide a detailed description of the tour package experience..."
                            className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Section 5: Key Inclusions List */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                <span>4. Key Inclusions</span>
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddInclusion}
                                className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Inclusion</span>
                            </button>
                        </div>

                        {formData.inclusions.map((inc: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inc}
                                    onChange={(e) => handleInclusionChange(idx, e.target.value)}
                                    placeholder={`Inclusion #${idx + 1}`}
                                    className="flex-1 px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveInclusion(idx)}
                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Section 6: Day-by-Day Itinerary Builder */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span>5. Day-by-Day Itinerary</span>
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddItineraryDay}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Day</span>
                            </button>
                        </div>

                        {formData.itinerary.map((dayItem: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2 relative">
                                <div className="flex items-center justify-between gap-2">
                                    <input
                                        type="text"
                                        value={dayItem.day}
                                        onChange={(e) => handleItineraryChange(idx, "day", e.target.value)}
                                        placeholder="Day 1"
                                        className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-blue-600 outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={dayItem.title}
                                        onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                                        placeholder="Day Activity Title"
                                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItineraryDay(idx)}
                                        className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 shrink-0 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <textarea
                                    rows={2}
                                    value={dayItem.desc}
                                    onChange={(e) => handleItineraryChange(idx, "desc", e.target.value)}
                                    placeholder="Activity description for this day..."
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none resize-none"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Bottom Action Bar (Clean relative layout inside content area - NO overlapping sidebar!) */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            Cancel & Return
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSubmitting ? "Saving..." : (editingPackage ? "Save Changes" : "Publish Package")}</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
