import React, { useState, useEffect } from "react";
import {
    Palmtree, Plus, Trash2, Edit, Save, X, Search, MapPin,
    Clock, Check, Image as ImageIcon, Star, CheckCircle2, RefreshCw, AlertCircle,
    Eye, EyeOff, Tag, Sliders, CircleDot, Layers, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { packageApi } from "@/lib/api";

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

const INITIAL_DESTINATIONS = [
    { id: "dest-1", name: "All", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80" },
    { id: "dest-2", name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=200&q=80" },
    { id: "dest-3", name: "Rajasthan", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=200&q=80" },
    { id: "dest-4", name: "Kashmir", image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=200&q=80" },
    { id: "dest-5", name: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=200&q=80" },
    { id: "dest-6", name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=200&q=80" },
    { id: "dest-7", name: "Ladakh", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=200&q=80" }
];

const INITIAL_FILTER_CONFIG = {
    showFilterLine: true,
    filterTags: ["All", "Bestseller", "Trending", "Super Saver", "Top Rated"]
};

export default function AdminTourPackages() {
    // Active Management Sub-Tab
    const [subTab, setSubTab] = useState<"packages" | "banners" | "destinations" | "filters">("packages");

    // Packages State
    const [packages, setPackages] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_packages");
        return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
    });

    // Hero Banners State
    const [banners, setBanners] = useState<any[]>(() => {
        const validOverride = (() => {
            try { return localStorage.getItem("ghs_tour_banners_v2") === "1"; } catch (e) { return false; }
        })();
        const saved = validOverride ? localStorage.getItem("ghs_admin_tour_banners") : null;
        return saved ? JSON.parse(saved) : [];
    });

    // Destination Circle Cards State
    const [destinations, setDestinations] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_destinations");
        return saved ? JSON.parse(saved) : INITIAL_DESTINATIONS;
    });

    // Filter Line Config State
    const [filterConfig, setFilterConfig] = useState<{ showFilterLine: boolean; filterTags: string[] }>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_filter_config");
        return saved ? JSON.parse(saved) : INITIAL_FILTER_CONFIG;
    });

    // UI & Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [newBannerUrl, setNewBannerUrl] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    // Destination Circle Edit / Create Modal State
    const [isDestModalOpen, setIsDestModalOpen] = useState(false);
    const [editingDest, setEditingDest] = useState<any>(null);
    const [destFormData, setDestFormData] = useState({ name: "", image: "" });

    // New Filter Tag State
    const [newTagInput, setNewTagInput] = useState("");

    // Form inputs for tour package creation/edit
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

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem("ghs_admin_tour_packages", JSON.stringify(packages));
        window.dispatchEvent(new Event("ghs_tour_settings_updated"));
    }, [packages]);

    useEffect(() => {
        try {
            localStorage.setItem("ghs_admin_tour_banners", JSON.stringify(banners));
            localStorage.setItem("ghs_tour_banners_v2", "1");
        } catch (e) { console.error("localStorage full, banners not cached locally:", e); }
        window.dispatchEvent(new Event("ghs_tour_settings_updated"));

        // Sync live to MySQL Backend API
        const heroImagesList = banners.map((b: any) => typeof b === 'string' ? b : (b.image || ''));
        packageApi.updateHeroConfig({
            title: "Handcrafted Tour Packages",
            subtitle: "Unforgettable luxury & budget holiday packages across India & global destinations",
            heroImages: heroImagesList,
            banners: banners
        }).then(res => {
            if (res && !res.success) {
                console.error("Failed to sync hero banners to backend DB:", res.message);
            }
        }).catch(err => console.error("Failed to sync hero banners to backend DB:", err));
    }, [banners]);

    useEffect(() => {
        localStorage.setItem("ghs_admin_tour_destinations", JSON.stringify(destinations));
        window.dispatchEvent(new Event("ghs_tour_settings_updated"));
    }, [destinations]);

    useEffect(() => {
        localStorage.setItem("ghs_admin_tour_filter_config", JSON.stringify(filterConfig));
        window.dispatchEvent(new Event("ghs_tour_settings_updated"));
    }, [filterConfig]);

    const compressImage = (file: File, maxWidth = 1400, quality = 0.85): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL("image/jpeg", quality));
                    } else {
                        resolve(event.target?.result as string);
                    }
                };
                img.onerror = () => resolve(event.target?.result as string);
            };
            reader.onerror = () => resolve("");
        });
    };

    const handleBannerDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (banners.length >= 5) {
            alert("Maximum 5 hero banner images allowed.");
            return;
        }
        try {
            const compressedUrl = await compressImage(file, 1400, 0.85);
            if (!compressedUrl) {
                alert("Failed to process image file.");
                return;
            }
            const newB = {
                id: `b-${Date.now()}`,
                image: compressedUrl,
                title: file.name.replace(/\.[^/.]+$/, "") || "Hero Banner"
            };
            setBanners(prev => [...prev, newB]);
            showNotification("Local image banner uploaded and added live!");
        } catch (err) {
            console.error("Upload error", err);
            alert("Error reading file.");
        }
        e.target.value = "";
    };

    const [isSavingBanners, setIsSavingBanners] = useState(false);

    const handleSaveBannersLive = async () => {
        setIsSavingBanners(true);
        try {
            try { localStorage.setItem("ghs_admin_tour_banners", JSON.stringify(banners)); } catch (e) { console.error("localStorage full:", e); }
            try { localStorage.setItem("ghs_tour_banners_v2", "1"); } catch (e) { /* quota */ }
            try { localStorage.setItem("ghs_admin_tour_hero_config", JSON.stringify({
                title: "Handcrafted Tour Packages",
                subtitle: "Unforgettable luxury & budget holiday packages across India & global destinations",
                heroImages: banners.map((b: any) => typeof b === 'string' ? b : (b.image || '')),
                banners: banners
            })); } catch (e) { console.error("localStorage full:", e); }

            window.dispatchEvent(new Event("ghs_tour_settings_updated"));

            const heroImagesList = banners.map((b: any) => typeof b === 'string' ? b : (b.image || ''));
            const res = await packageApi.updateHeroConfig({
                title: "Handcrafted Tour Packages",
                subtitle: "Unforgettable luxury & budget holiday packages across India & global destinations",
                heroImages: heroImagesList,
                banners: banners
            });

            if (res && res.success) {
                showNotification("✅ Hero Banners saved & published live to website!");
            } else {
                console.error("Save error:", res?.message);
                showNotification("⚠️ Banners saved locally, but LIVE sync failed: " + (res?.message || "backend error"));
            }
        } catch (err) {
            console.error("Save error:", err);
            showNotification("⚠️ Failed to save banners. Please try again.");
        } finally {
            setIsSavingBanners(false);
        }
    };

    const showNotification = (msg: string) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(""), 3500);
    };

    // ─── TOUR PACKAGES HANDLERS ──────────────────────────────────────────────
    const handleSavePackage = (e: React.FormEvent) => {
        e.preventDefault();
        const generatedSlug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

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

    // ─── HERO BANNERS HANDLERS ───────────────────────────────────────────────
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

    // ─── DESTINATION STORY CIRCLES HANDLERS ──────────────────────────────────
    const handleSaveDestination = (e: React.FormEvent) => {
        e.preventDefault();
        if (!destFormData.name.trim() || !destFormData.image.trim()) return;

        if (editingDest) {
            setDestinations(prev => prev.map(d => d.id === editingDest.id ? {
                ...d,
                name: destFormData.name.trim(),
                image: destFormData.image.trim()
            } : d));
            showNotification(`Destination "${destFormData.name}" updated!`);
        } else {
            const newDest = {
                id: `dest-${Date.now()}`,
                name: destFormData.name.trim(),
                image: destFormData.image.trim()
            };
            setDestinations(prev => [...prev, newDest]);
            showNotification(`New Destination "${destFormData.name}" added!`);
        }
        setIsDestModalOpen(false);
        setEditingDest(null);
        setDestFormData({ name: "", image: "" });
    };

    const openEditDestModal = (dest: any) => {
        setEditingDest(dest);
        setDestFormData({ name: dest.name, image: dest.image });
        setIsDestModalOpen(true);
    };

    const handleDeleteDestination = (id: string, name: string) => {
        if (confirm(`Delete destination story "${name}"?`)) {
            setDestinations(prev => prev.filter(d => d.id !== id));
            showNotification(`Destination "${name}" deleted.`);
        }
    };

    // ─── FILTER LINE CONFIG HANDLERS ──────────────────────────────────────────
    const toggleFilterLineVisibility = () => {
        setFilterConfig(prev => ({ ...prev, showFilterLine: !prev.showFilterLine }));
        showNotification(filterConfig.showFilterLine ? "Filter tag line hidden." : "Filter tag line is now visible!");
    };

    const handleAddFilterTag = (e: React.FormEvent) => {
        e.preventDefault();
        const tag = newTagInput.trim();
        if (!tag) return;
        if (filterConfig.filterTags.includes(tag)) {
            alert("This filter tag already exists.");
            return;
        }
        setFilterConfig(prev => ({
            ...prev,
            filterTags: [...prev.filterTags, tag]
        }));
        setNewTagInput("");
        showNotification(`Filter tag "${tag}" added!`);
    };

    const handleDeleteFilterTag = (tagToDelete: string) => {
        if (tagToDelete === "All") {
            alert('The "All" filter tag cannot be deleted.');
            return;
        }
        setFilterConfig(prev => ({
            ...prev,
            filterTags: prev.filterTags.filter(t => t !== tagToDelete)
        }));
        showNotification(`Filter tag "${tagToDelete}" deleted.`);
    };

    return (
        <div className="space-y-8 pb-12 font-sans text-neutral-100">
            {/* Top Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)]">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                        <Palmtree className="w-6 h-6 text-emerald-400" />
                        Super Admin Tour Packages & Settings Manager
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 font-semibold">
                        Manage packages, hero banners, popular destination circles & filter line settings live.
                    </p>
                </div>

                {subTab === "packages" && (
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingPackage(null);
                            setIsAddModalOpen(true);
                        }}
                        className="px-5 py-3 bg-neutral-100 hover:bg-white text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 uppercase tracking-wider"
                    >
                        <Plus className="w-4 h-4 text-black" />
                        <span>Add New Tour Package</span>
                    </button>
                )}

                {subTab === "destinations" && (
                    <button
                        onClick={() => {
                            setEditingDest(null);
                            setDestFormData({ name: "", image: "" });
                            setIsDestModalOpen(true);
                        }}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 uppercase tracking-wider"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>Add Destination Circle</span>
                    </button>
                )}
            </div>

            {/* Success Status Toast */}
            {statusMessage && (
                <div className="p-4 bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* MANAGEMENT SUB-TAB NAVIGATION BAR */}
            <div className="flex items-center gap-2 bg-[#0c0c0c] p-2 rounded-2xl border border-[#1c1c1c] overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setSubTab("packages")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        subTab === "packages"
                            ? "bg-neutral-100 text-black shadow-md"
                            : "text-neutral-400 hover:text-white hover:bg-[#181818]"
                    }`}
                >
                    <Palmtree className="w-4 h-4" />
                    <span>Tour Packages ({packages.length})</span>
                </button>

                <button
                    onClick={() => setSubTab("banners")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        subTab === "banners"
                            ? "bg-neutral-100 text-black shadow-md"
                            : "text-neutral-400 hover:text-white hover:bg-[#181818]"
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>Hero Banners ({banners.length})</span>
                </button>

                <button
                    onClick={() => setSubTab("destinations")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        subTab === "destinations"
                            ? "bg-neutral-100 text-black shadow-md"
                            : "text-neutral-400 hover:text-white hover:bg-[#181818]"
                    }`}
                >
                    <CircleDot className="w-4 h-4" />
                    <span>Destination Circles ({destinations.length})</span>
                </button>

                <button
                    onClick={() => setSubTab("filters")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        subTab === "filters"
                            ? "bg-neutral-100 text-black shadow-md"
                            : "text-neutral-400 hover:text-white hover:bg-[#181818]"
                    }`}
                >
                    <Tag className="w-4 h-4" />
                    <span>Filter Line Settings</span>
                </button>
            </div>

            {/* TAB 1: TOUR PACKAGES LIST */}
            {subTab === "packages" && (
                <div className="bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] overflow-hidden">
                    <div className="p-5 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                        <h3 className="text-base font-bold text-white">
                            Active Tour Packages ({packages.length})
                        </h3>
                    </div>

                    <div className="divide-y divide-[#181818]">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#121212] transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <img
                                        src={pkg.image}
                                        alt=""
                                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#282828] shadow-inner"
                                    />
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">{pkg.title}</h4>
                                        <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                            <span>{pkg.destination}</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] font-semibold text-neutral-300 bg-[#161616] border border-[#262626] px-2.5 py-0.5 rounded-lg">{pkg.duration}</span>
                                            <span className="text-[10px] font-bold uppercase text-white bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 rounded-lg">{pkg.badge}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <span className="text-sm font-black text-white block">₹{pkg.price?.toLocaleString()}</span>
                                        <span className="text-[10px] text-neutral-500 line-through">₹{pkg.originalPrice?.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(pkg)}
                                            className="p-2 text-neutral-300 hover:bg-[#1f1f1f] rounded-lg transition-colors cursor-pointer border border-[#282828]"
                                            title="Edit Package"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePackage(pkg.id)}
                                            className="p-2 text-red-400 hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer border border-red-900/40"
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
            )}

            {/* TAB 2: HERO BANNER MANAGEMENT */}
            {subTab === "banners" && (
                <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-emerald-400" />
                                Hero Banner Slides ({banners.length}/5)
                            </h3>
                            <p className="text-xs text-neutral-400 mt-0.5">Curved banner images shown at top of `/packages` page.</p>
                        </div>
                        <button
                            onClick={handleSaveBannersLive}
                            disabled={isSavingBanners}
                            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSavingBanners ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>Save & Publish Banners Live</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {banners.map((banner, index) => (
                            <div key={banner.id} className="relative h-32 rounded-xl overflow-hidden border border-[#262626] group shadow-inner">
                                <img src={banner.image} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                    <button
                                        onClick={() => handleDeleteBanner(banner.id)}
                                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors cursor-pointer shadow-md"
                                        title="Delete Slide"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="absolute bottom-2 left-2 bg-black/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-[#333333]">
                                    Slide #{index + 1}
                                </span>
                            </div>
                        ))}
                    </div>

                    {banners.length < 5 && (
                        <div className="pt-2">
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#2b2b2b] hover:border-emerald-500/50 bg-[#121212] hover:bg-[#161616] rounded-2xl cursor-pointer transition-all group shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-white mb-1">Click to Upload Local Image File</span>
                                <span className="text-[10px] text-neutral-400 font-medium">Select photo from your computer/device to add as Hero Banner slide</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBannerDirectUpload}
                                />
                            </label>
                        </div>
                    )}

                    <div className="pt-4 border-t border-[#1a1a1a] flex justify-end">
                        <button
                            onClick={handleSaveBannersLive}
                            disabled={isSavingBanners}
                            className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSavingBanners ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>Save & Publish Banners Live</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 3: DESTINATION CIRCLES MANAGEMENT */}
            {subTab === "destinations" && (
                <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <CircleDot className="w-4 h-4 text-blue-400" />
                                Popular Destination Story Circles ({destinations.length})
                            </h3>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                Add, edit, or delete circular destination avatars shown on `/packages`.
                            </p>
                        </div>
                    </div>

                    {/* Circles Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
                        {destinations.map((dest) => (
                            <div
                                key={dest.id}
                                className="bg-[#121212] border border-[#222222] rounded-2xl p-4 flex flex-col items-center gap-3 relative group hover:border-blue-500/50 transition-all"
                            >
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 bg-black shadow-md">
                                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                                </div>

                                <span className="text-xs font-bold text-white truncate max-w-full">{dest.name}</span>

                                {/* Quick Actions Overlay */}
                                <div className="flex items-center gap-1.5 mt-1">
                                    <button
                                        onClick={() => openEditDestModal(dest)}
                                        className="p-1.5 bg-[#1f1f1f] text-neutral-300 hover:text-white rounded-lg border border-[#333] transition-colors cursor-pointer"
                                        title="Edit Destination"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDestination(dest.id, dest.name)}
                                        className="p-1.5 bg-red-950/60 text-red-400 hover:text-red-300 rounded-lg border border-red-900/40 transition-colors cursor-pointer"
                                        title="Delete Destination"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: FILTER LINE SETTINGS */}
            {subTab === "filters" && (
                <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-400" />
                            Filter Tag Line Settings
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            Control whether the filter tag line is displayed on `/packages` and manage active filter tags.
                        </p>
                    </div>

                    {/* Toggle Visibility Card */}
                    <div className="p-4 bg-[#121212] border border-[#222] rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                {filterConfig.showFilterLine ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-neutral-500" />}
                                <span>Filter Tag Bar Visibility</span>
                            </h4>
                            <p className="text-[11px] text-neutral-400">
                                {filterConfig.showFilterLine ? "Currently VISIBLE on public page." : "Currently HIDDEN from public page."}
                            </p>
                        </div>

                        <button
                            onClick={toggleFilterLineVisibility}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                filterConfig.showFilterLine
                                    ? "bg-emerald-950 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900"
                                    : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                            }`}
                        >
                            {filterConfig.showFilterLine ? "Visible (Click to Hide)" : "Hidden (Click to Show)"}
                        </button>
                    </div>

                    {/* Manage Filter Tags */}
                    <div className="space-y-3 pt-2 border-t border-[#1f1f1f]">
                        <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                            Active Filter Tags ({filterConfig.filterTags.length})
                        </h4>

                        <div className="flex flex-wrap gap-2">
                            {filterConfig.filterTags.map((tag) => (
                                <div
                                    key={tag}
                                    className="px-3 py-1.5 bg-[#181818] border border-[#2b2b2b] rounded-xl text-xs font-bold text-white flex items-center gap-2 group"
                                >
                                    <span>{tag}</span>
                                    {tag !== "All" && (
                                        <button
                                            onClick={() => handleDeleteFilterTag(tag)}
                                            className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                                            title="Delete Filter Tag"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Filter Tag Form */}
                        <form onSubmit={handleAddFilterTag} className="flex gap-2 pt-2">
                            <input
                                type="text"
                                required
                                placeholder="Type new filter tag name (e.g. Honeymoon, Luxury)..."
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-mono"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 uppercase tracking-wider"
                            >
                                Add Filter Tag
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT DESTINATION CIRCLE MODAL */}
            <AnimatePresence>
                {isDestModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0c0c0c] rounded-2xl shadow-2xl border border-[#1c1c1c] border-t-[#2d2d2d] w-full max-w-md overflow-hidden text-white"
                        >
                            <div className="p-5 bg-[#0e0e0e] border-b border-[#1f1f1f] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    {editingDest ? "Edit Destination Circle" : "Add Destination Circle"}
                                </h3>
                                <button
                                    onClick={() => setIsDestModalOpen(false)}
                                    className="w-7 h-7 rounded-full bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveDestination} className="p-5 space-y-4 text-xs font-medium">
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Destination Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Goa, Manali, Shimla..."
                                        value={destFormData.name}
                                        onChange={e => setDestFormData({ ...destFormData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Destination Thumbnail Image</label>
                                    <label className="flex flex-col items-center justify-center p-5 border border-dashed border-[#333] hover:border-emerald-500/50 bg-[#141414] hover:bg-[#181818] rounded-xl cursor-pointer transition-all">
                                        <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                                        <span className="text-xs font-bold text-neutral-200">Click to Select Local Image File</span>
                                        <span className="text-[10px] text-neutral-500 font-medium mt-0.5">Choose photo from your device</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const compressed = await compressImage(file, 600, 0.85);
                                                    setDestFormData({ ...destFormData, image: compressed });
                                                    showNotification("Destination thumbnail loaded!");
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                {destFormData.image && (
                                    <div className="flex flex-col items-center pt-2">
                                        <span className="text-[10px] text-neutral-400 font-bold mb-1">Thumbnail Preview:</span>
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/50 shadow-md">
                                            <img src={destFormData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md"
                                    >
                                        {editingDest ? "Update Destination Circle" : "Save Destination Circle"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FULL EDIT / CREATE TOUR PACKAGE MODAL */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0c0c0c] rounded-2xl shadow-2xl border border-[#1c1c1c] border-t-[#2d2d2d] w-full max-w-xl overflow-hidden text-white"
                        >
                            <div className="p-5 bg-[#0e0e0e] border-b border-[#1f1f1f] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    {editingPackage ? "Edit Tour Package Details" : "Create New Tour Package"}
                                </h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-7 h-7 rounded-full bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSavePackage} className="p-5 space-y-4 text-xs font-medium max-h-[82vh] overflow-y-auto">
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Package Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Royal Rajasthan Heritage & Fort Trail"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Destinations Covered</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Jaipur • Udaipur • Jodhpur"
                                        value={formData.destination}
                                        onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Duration</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 5 Days / 4 Nights"
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Badge Label</label>
                                        <select
                                            value={formData.badge}
                                            onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                        >
                                            <option className="bg-black text-white">Bestseller</option>
                                            <option className="bg-black text-white">Trending</option>
                                            <option className="bg-black text-white">Popular</option>
                                            <option className="bg-black text-white">Super Saver</option>
                                            <option className="bg-black text-white">Top Rated</option>
                                            <option className="bg-black text-white">Bucket List</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Offer Rate Per Guest (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Original Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.originalPrice}
                                            onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Package Cover Image</label>
                                    <label className="flex flex-col items-center justify-center p-5 border border-dashed border-[#333] hover:border-emerald-500/50 bg-[#141414] hover:bg-[#181818] rounded-xl cursor-pointer transition-all">
                                        <Upload className="w-6 h-6 text-emerald-400 mb-1" />
                                        <span className="text-xs font-bold text-neutral-200">Choose Cover Image File</span>
                                        <span className="text-[10px] text-neutral-500 font-medium mt-0.5">Select photo from your device/computer</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const compressed = await compressImage(file, 1200, 0.85);
                                                    setFormData({ ...formData, image: compressed });
                                                    showNotification("Cover image loaded!");
                                                }
                                            }}
                                        />
                                    </label>

                                    {formData.image && (
                                        <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-[#282828] group">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, image: "" })}
                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                                                >
                                                    Remove / Change Image
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Included Stay</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 4-Star Resort"
                                            value={formData.includedStay}
                                            onChange={e => setFormData({ ...formData, includedStay: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Transport Details</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Private Sedan Cab"
                                            value={formData.transport}
                                            onChange={e => setFormData({ ...formData, transport: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Package Overview</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Write a brief overview describing the highlights of this tour package..."
                                        value={formData.overview}
                                        onChange={e => setFormData({ ...formData, overview: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-500 resize-none font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1.5">Package Inclusions (One per line)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="4-Star Resort Stay with Breakfast&#10;Private Cab for Sightseeing&#10;Airport Pick & Drop"
                                        value={formData.inclusions}
                                        onChange={e => setFormData({ ...formData, inclusions: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none font-mono text-[11px] resize-none"
                                    />
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-neutral-100 hover:bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md"
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
