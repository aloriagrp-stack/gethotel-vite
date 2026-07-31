import React, { useState, useEffect } from "react";
import {
    Palmtree, Plus, Trash2, Edit, Save, X, Search, MapPin,
    Clock, Check, Image as ImageIcon, Star, CheckCircle2, RefreshCw, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Default Initial Data
const INITIAL_PACKAGES = [
    {
        id: "pkg-1",
        slug: "royal-rajasthan-heritage-fort-trail",
        title: "Royal Rajasthan Heritage & Fort Trail",
        destination: "Jaipur • Udaipur • Jodhpur",
        duration: "6 Days / 5 Nights",
        rating: 4.9,
        reviewsCount: 142,
        price: 18499,
        originalPrice: 24999,
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        includedStay: "4-Star Heritage Haveli Hotel",
        transport: "Private AC Sedan Included",
        badge: "Bestseller",
        overview: "Immerse yourself in royal Indian hospitality. Visit grand palaces, ancient forts of Amber and Mehrangarh, and enjoy romantic sunset boat cruises on Lake Pichola in Udaipur.",
        inclusions: "4-Star Heritage Haveli stay with swimming pool\nDaily Breakfast & Authentic Rajasthani Dinner\nAmer Fort & City Palace Guided Sightseeing\nLake Pichola Sunset Boat Ride in Udaipur\nPrivate AC Sedan Transfers for entire 6 days\nAll toll taxes, parking & driver allowances",
        itinerary: "Day 1: Arrival in Pink City Jaipur - Pickup from airport, visit Hawa Mahal & Johari Bazaar.\nDay 2: Jaipur Royal Forts - Amer Fort, Nahargarh & City Palace.\nDay 3: Jaipur to Jodhpur - Visit Mehrangarh Fort & Jaswant Thada.\nDay 4: Jodhpur to Udaipur - Enroute Ranakpur Jain Temple.\nDay 5: Udaipur Lakes & Palaces - City Palace & Lake Pichola boat cruise.\nDay 6: Departure from Udaipur - Airport transfer."
    },
    {
        id: "pkg-2",
        slug: "goa-tropical-beach-retreat-watersports",
        title: "Goa Tropical Beach Retreat & Watersports",
        destination: "North Goa • South Goa",
        duration: "4 Days / 3 Nights",
        rating: 4.8,
        reviewsCount: 210,
        price: 12999,
        originalPrice: 17999,
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        includedStay: "Beachfront 4-Star Resort",
        transport: "Airport Pickup & Sightseeing Cab",
        badge: "Trending",
        overview: "Experience Goa's golden beaches, crystal clear watersports, vibrant shacks, and romantic river cruises. Includes 4-star resort stay with pool access.",
        inclusions: "Beachfront resort stay with infinity pool access\nScuba Diving & Parasailing Watersports combo\nMandovi River Sunset Cruise with Goan Dance\nNorth & South Goa Guided Sightseeing tour\nAirport Pickup & Drop transfers included\nBuffet Breakfast included every morning",
        itinerary: "Day 1: Arrival in Goa & Sunset Shack Vibe\nDay 2: North Goa Beaches & Fort Aguada\nDay 3: Watersports & Mandovi River Cruise\nDay 4: South Goa Sightseeing & Departure"
    },
    {
        id: "pkg-3",
        slug: "kashmir-paradise-srinagar-gulmarg-pahalgam",
        title: "Kashmir Paradise: Srinagar, Gulmarg & Pahalgam",
        destination: "Srinagar • Gulmarg • Pahalgam",
        duration: "5 Days / 4 Nights",
        rating: 4.95,
        reviewsCount: 188,
        price: 21999,
        originalPrice: 28999,
        image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80",
        includedStay: "Houseboat + 4-Star Resort",
        transport: "Private SUV Mountain Transfers",
        badge: "Popular",
        overview: "Witness Heaven on Earth! Enjoy a romantic Shikara ride on Dal Lake, stay in a hand-carved cedar houseboat, ride the Gulmarg Gondola cable car, and trek valley pines in Pahalgam.",
        inclusions: "1 Night Luxury Houseboat stay in Dal Lake\n3 Nights 4-Star Mountain Resort stay\nGulmarg Gondola Cable Car Ride pass included\nShikara Ride on Dal Lake at Sunset\nPrivate SUV Transfers (Innova/XYLO) for full trip\nDaily Breakfast & Dinner included",
        itinerary: "Day 1: Arrival Srinagar & Dal Lake Houseboat\nDay 2: Srinagar to Gulmarg Snow Pass & Gondola Ride\nDay 3: Gulmarg to Pahalgam Valley of Shepherds\nDay 4: Betaab & Aru Valley Excursion\nDay 5: Mughal Gardens & Departure"
    }
];

const INITIAL_BANNERS = [
    {
        id: "b1",
        image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1400&q=80",
        title: "Kashmir Paradise: Snow & Houseboat Escapade"
    },
    {
        id: "b2",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=80",
        title: "Goa Tropical Beach Retreat & Watersports"
    },
    {
        id: "b3",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1400&q=80",
        title: "Royal Rajasthan Heritage & Fort Trail"
    }
];

export default function AdminTourPackages() {
    const [packages, setPackages] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_packages");
        return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
    });

    const [banners, setBanners] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_banners");
        return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [newBannerUrl, setNewBannerUrl] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    // Full Form inputs for tour package creation/edit
    const [formData, setFormData] = useState({
        title: "",
        destination: "",
        duration: "5 Days / 4 Nights",
        price: 15000,
        originalPrice: 19999,
        image: "",
        includedStay: "4-Star Hotel Resort",
        transport: "Private AC Cab",
        badge: "Popular",
        overview: "",
        inclusions: "",
        itinerary: ""
    });

    useEffect(() => {
        localStorage.setItem("ghs_admin_tour_packages", JSON.stringify(packages));
    }, [packages]);

    useEffect(() => {
        localStorage.setItem("ghs_admin_tour_banners", JSON.stringify(banners));
    }, [banners]);

    const showNotification = (msg: string) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(""), 3000);
    };

    const handleSavePackage = (e: React.FormEvent) => {
        e.preventDefault();
        const generatedSlug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        // Format inclusions as array
        const formattedInclusions = typeof formData.inclusions === "string"
            ? formData.inclusions.split("\n").filter(i => i.trim().length > 0)
            : formData.inclusions;

        const packageData = {
            ...formData,
            slug: generatedSlug,
            inclusions: formattedInclusions
        };

        if (editingPackage) {
            setPackages(prev => prev.map(p => p.id === editingPackage.id ? {
                ...packageData,
                id: editingPackage.id,
                rating: editingPackage.rating || 4.9,
                reviewsCount: editingPackage.reviewsCount || 100
            } : p));
            showNotification("Tour package updated successfully!");
        } else {
            const newPkg = {
                ...packageData,
                id: `pkg-${Date.now()}`,
                rating: 4.9,
                reviewsCount: 12
            };
            setPackages(prev => [newPkg, ...prev]);
            showNotification("New tour package published successfully!");
        }
        setIsAddModalOpen(false);
        setEditingPackage(null);
        resetForm();
    };

    const handleDeletePackage = (id: string) => {
        if (confirm("Are you sure you want to delete this tour package?")) {
            setPackages(prev => prev.filter(p => p.id !== id));
            showNotification("Tour package deleted.");
        }
    };

    const handleAddBanner = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBannerUrl.trim()) return;
        if (banners.length >= 5) {
            alert("Maximum 5 hero banner images allowed.");
            return;
        }
        const newB = {
            id: `b-${Date.now()}`,
            image: newBannerUrl.trim(),
            title: "Tour Package Hero Banner"
        };
        setBanners(prev => [...prev, newB]);
        setNewBannerUrl("");
        showNotification("Hero banner image added!");
    };

    const handleDeleteBanner = (id: string) => {
        if (banners.length <= 1) {
            alert("At least 1 hero banner image is required.");
            return;
        }
        setBanners(prev => prev.filter(b => b.id !== id));
        showNotification("Hero banner image removed.");
    };

    const resetForm = () => {
        setFormData({
            title: "",
            destination: "",
            duration: "5 Days / 4 Nights",
            price: 15000,
            originalPrice: 19999,
            image: "",
            includedStay: "4-Star Hotel Resort",
            transport: "Private AC Cab",
            badge: "Popular",
            overview: "",
            inclusions: "",
            itinerary: ""
        });
    };

    const openEditModal = (pkg: any) => {
        setEditingPackage(pkg);
        setFormData({
            title: pkg.title || "",
            destination: pkg.destination || "",
            duration: pkg.duration || "5 Days / 4 Nights",
            price: pkg.price || 15000,
            originalPrice: pkg.originalPrice || 19999,
            image: pkg.image || "",
            includedStay: pkg.includedStay || "4-Star Hotel Resort",
            transport: pkg.transport || "Private AC Cab",
            badge: pkg.badge || "Popular",
            overview: pkg.overview || "",
            inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join("\n") : (pkg.inclusions || ""),
            itinerary: typeof pkg.itinerary === "string" ? pkg.itinerary : JSON.stringify(pkg.itinerary || "")
        });
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-12 font-sans text-slate-900">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Palmtree className="w-6 h-6 text-emerald-600" />
                        Super Admin Tour Packages Manager
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        Create, edit & manage all tour packages, prices, overview, itinerary & hero banners live.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setEditingPackage(null);
                        setIsAddModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Tour Package</span>
                </button>
            </div>

            {/* Success Status Toast */}
            {statusMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* SECTION 1: HERO BANNER SLIDER MANAGEMENT */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-emerald-600" />
                            Hero Banner Slides ({banners.length}/5)
                        </h3>
                        <p className="text-xs text-slate-500">Curved banner images shown at top of `/packages` page.</p>
                    </div>
                </div>

                {/* Banner Images Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {banners.map((banner, index) => (
                        <div key={banner.id} className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={banner.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <button
                                    onClick={() => handleDeleteBanner(banner.id)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                                    title="Delete Slide"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                Slide #{index + 1}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Add New Banner Form */}
                <form onSubmit={handleAddBanner} className="flex gap-2 pt-2">
                    <input
                        type="url"
                        required
                        placeholder="Paste image URL for new banner slide..."
                        value={newBannerUrl}
                        onChange={(e) => setNewBannerUrl(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                        Add Banner
                    </button>
                </form>
            </div>

            {/* SECTION 2: ACTIVE TOUR PACKAGES LIST */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                        Active Tour Packages ({packages.length})
                    </h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <img
                                    src={pkg.image}
                                    alt=""
                                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">{pkg.title}</h4>
                                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>{pkg.destination}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{pkg.duration}</span>
                                        <span className="text-[10px] font-black uppercase text-white bg-slate-900 px-2 py-0.5 rounded">{pkg.badge}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right">
                                    <span className="text-sm font-black text-slate-950 block">₹{pkg.price?.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 line-through">₹{pkg.originalPrice?.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(pkg)}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Package"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePackage(pkg.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Package"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FULL EDIT / CREATE TOUR PACKAGE MODAL */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden"
                        >
                            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
                                <h3 className="text-sm font-bold">
                                    {editingPackage ? "Edit Tour Package Details" : "Create New Tour Package"}
                                </h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-7 h-7 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSavePackage} className="p-5 space-y-3.5 text-xs font-medium max-h-[82vh] overflow-y-auto">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Package Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Royal Rajasthan Heritage & Fort Trail"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Destinations Covered</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Jaipur • Udaipur • Jodhpur"
                                        value={formData.destination}
                                        onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Duration</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 5 Days / 4 Nights"
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Badge Label</label>
                                        <select
                                            value={formData.badge}
                                            onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                                        >
                                            <option>Bestseller</option>
                                            <option>Trending</option>
                                            <option>Popular</option>
                                            <option>Super Saver</option>
                                            <option>Top Rated</option>
                                            <option>Bucket List</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Offer Rate Per Guest (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Original Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.originalPrice}
                                            onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Cover Image URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://images.unsplash.com/..."
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Included Stay</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 4-Star Resort"
                                            value={formData.includedStay}
                                            onChange={e => setFormData({ ...formData, includedStay: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Transport Details</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Private Sedan Cab"
                                            value={formData.transport}
                                            onChange={e => setFormData({ ...formData, transport: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Package Overview</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Write a brief overview describing the highlights of this tour package..."
                                        value={formData.overview}
                                        onChange={e => setFormData({ ...formData, overview: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Package Inclusions (One per line)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="4-Star Resort Stay with Breakfast&#10;Private Cab for Sightseeing&#10;Airport Pick & Drop"
                                        value={formData.inclusions}
                                        onChange={e => setFormData({ ...formData, inclusions: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono text-[11px] resize-none"
                                    />
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md"
                                    >
                                        {editingPackage ? "Save All Package Changes" : "Publish Complete Tour Package"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
