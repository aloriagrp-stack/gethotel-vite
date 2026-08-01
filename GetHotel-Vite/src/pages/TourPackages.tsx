import React, { useState, useEffect } from "react";
import SEOHead from "@/components/common/SEOHead";
import { Link } from "react-router-dom";
import {
    MapPin, Clock, Check, Star, Hotel, Car, X, CheckCircle2,
    Search, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Filter,
    Heart, ChevronLeft, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { packageApi } from "@/lib/api";

// SEO Slug Helper
export function createPackageSlug(title: string): string {
    if (!title) return "tour-package";
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

// Circle Story Avatars Data
const DESTINATION_STORIES = [
    { name: "All", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80" },
    { name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=200&q=80" },
    { name: "Rajasthan", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=200&q=80" },
    { name: "Kashmir", image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=200&q=80" },
    { name: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=200&q=80" },
    { name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=200&q=80" },
    { name: "Ladakh", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=200&q=80" }
];

// Fallback Banner Images
const BANNER_IMAGES = [
    {
        title: "Kashmir Paradise: Snow & Houseboat Escapade",
        subtitle: "Luxury Houseboat stay in Dal Lake & Gondola cable car ride included",
        tag: "Flat 25% OFF",
        image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1600&q=80"
    },
    {
        title: "Goa Tropical Beach Retreat & Watersports",
        subtitle: "Beachfront 4-Star Resort stay with Scuba Diving & Parasailing combo",
        tag: "Bestseller Deal",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80"
    },
    {
        title: "Royal Rajasthan Heritage & Fort Trail",
        subtitle: "Explore Palaces of Jaipur, Udaipur & Jodhpur with Private AC Sedan",
        tag: "Special Offer",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80"
    }
];

// Fallback Tour Packages
const POPULAR_PACKAGES = [
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
        discountPercent: "26% OFF",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        includedStay: "4-Star Heritage Haveli Hotel",
        transport: "Private AC Sedan Included",
        badge: "Bestseller"
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
        discountPercent: "28% OFF",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        includedStay: "Beachfront 4-Star Resort",
        transport: "Airport Pickup & Sightseeing Cab",
        badge: "Trending"
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
        discountPercent: "24% OFF",
        image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80",
        includedStay: "Houseboat + 4-Star Resort",
        transport: "Private SUV Mountain Transfers",
        badge: "Popular"
    },
    {
        id: "pkg-4",
        slug: "himachal-scenic-escapade-shimla-manali",
        title: "Himachal Scenic Escapade: Shimla & Manali",
        destination: "Shimla • Kullu • Manali • Solang",
        duration: "7 Days / 6 Nights",
        rating: 4.85,
        reviewsCount: 320,
        price: 16499,
        originalPrice: 22999,
        discountPercent: "28% OFF",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
        includedStay: "Mountain View Deluxe Resort",
        transport: "AC Volvo + Private Cab",
        badge: "Super Saver"
    },
    {
        id: "pkg-5",
        slug: "serene-kerala-backwaters-tea-gardens",
        title: "Serene Kerala Backwaters & Tea Gardens",
        destination: "Munnar • Thekkady • Alleppey",
        duration: "5 Days / 4 Nights",
        rating: 4.9,
        reviewsCount: 165,
        price: 19499,
        originalPrice: 26999,
        discountPercent: "27% OFF",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
        includedStay: "Houseboat + Hill Resort",
        transport: "Private Chauffeur Sedan",
        badge: "Top Rated"
    },
    {
        id: "pkg-6",
        slug: "ladakh-high-passes-pangong-tso-odyssey",
        title: "Ladakh High Passes & Pangong Tso Odyssey",
        destination: "Leh • Nubra Valley • Pangong Tso",
        duration: "6 Days / 5 Nights",
        rating: 4.92,
        reviewsCount: 98,
        price: 24999,
        originalPrice: 32999,
        discountPercent: "24% OFF",
        image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
        includedStay: "Deluxe Hotel + Glamping Camps",
        transport: "4x4 Mountain SUV",
        badge: "Bucket List"
    }
];

export default function TourPackages() {
    const [packages, setPackages] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_packages");
        return saved ? JSON.parse(saved) : POPULAR_PACKAGES;
    });

    const [banners, setBanners] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_banners");
        return saved ? JSON.parse(saved) : BANNER_IMAGES;
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("All");
    const [selectedFilterTag, setSelectedFilterTag] = useState("All");
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Wishlist Heart Toggle state
    const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

    // Card Gallery Image Index State per Package ID
    const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

    const toggleWishlist = (e: React.MouseEvent, pkgId: string | number) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist(prev => ({ ...prev, [pkgId]: !prev[pkgId] }));
    };

    const handlePrevImage = (e: React.MouseEvent, pkgId: string | number, maxPhotos: number) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveImageIndices(prev => {
            const current = prev[pkgId] || 0;
            const nextIdx = current === 0 ? maxPhotos - 1 : current - 1;
            return { ...prev, [pkgId]: nextIdx };
        });
    };

    const handleNextImage = (e: React.MouseEvent, pkgId: string | number, maxPhotos: number) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveImageIndices(prev => {
            const current = prev[pkgId] || 0;
            const nextIdx = (current + 1) % maxPhotos;
            return { ...prev, [pkgId]: nextIdx };
        });
    };

    // Fetch real tour packages & hero config from backend API
    useEffect(() => {
        const fetchApiPackages = async () => {
            try {
                const res = await packageApi.getPackages();
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    setPackages(res.data);
                }
            } catch (err) {
                console.error("Using default packages fallback:", err);
            }

            try {
                const heroRes = await packageApi.getHeroConfig();
                if (heroRes && heroRes.success && heroRes.data) {
                    const hData = heroRes.data;
                    if (Array.isArray(hData.heroImages) && hData.heroImages.length > 0) {
                        const formattedBanners = hData.heroImages.map((imgUrl: string, idx: number) => ({
                            title: hData.title || "Explore Handcrafted Tour Packages",
                            subtitle: hData.subtitle || "Unforgettable luxury & budget holiday packages across India & global destinations",
                            tag: idx === 0 ? "Featured Deal" : "Trending Offer",
                            image: imgUrl
                        }));
                        setBanners(formattedBanners);
                    }
                }
            } catch (e) {
                /* fallback */
            }
        };
        fetchApiPackages();
    }, []);

    // Auto-advance hero carousel
    useEffect(() => {
        if (!banners || banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners]);

    // Filter packages matching search query, selected destination & filter tag
    const filteredPackages = packages.filter(pkg => {
        const title = (pkg.title || "").toLowerCase();
        const dest = (pkg.destination || "").toLowerCase();
        const badge = (pkg.badge || "").toLowerCase();

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (!title.includes(q) && !dest.includes(q) && !badge.includes(q)) {
                return false;
            }
        }

        if (selectedDestination !== "All") {
            const d = selectedDestination.toLowerCase();
            if (!title.includes(d) && !dest.includes(d)) {
                return false;
            }
        }

        if (selectedFilterTag !== "All") {
            const tag = selectedFilterTag.toLowerCase();
            if (!badge.includes(tag)) return false;
        }

        return true;
    });

    const activeBanner = banners[currentBannerIndex] || BANNER_IMAGES[0];

    return (
        <div className="min-h-screen bg-slate-50/70 pb-24 font-sans text-slate-900">
            <SEOHead
                title="Handcrafted Tour Packages | GetHotelStays"
                description="Explore handpicked holiday & tour packages across Goa, Rajasthan, Kashmir, Himachal, Kerala and Ladakh with verified hotel stays and private cabs."
            />

            {/* Main Widescreen Desktop Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
                
                {/* 1. HERO WIDESCREEN BANNER SLIDER */}
                {banners && banners.length > 0 && (
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-lg aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/9] bg-slate-950 group">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentBannerIndex}
                                src={activeBanner.image}
                                alt="Tour Banner"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="w-full h-full object-cover opacity-85"
                            />
                        </AnimatePresence>

                        {/* Rich Dark Gradient Overlay for Maximum Legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                        {/* Banner Content Text */}
                        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 z-20 space-y-2 text-white">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg border border-white/20 shadow-sm inline-flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                                    <span>{activeBanner.tag || "Featured Holiday"}</span>
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md text-white max-w-3xl leading-tight">
                                {activeBanner.title}
                            </h1>

                            <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl line-clamp-2 drop-shadow">
                                {activeBanner.subtitle}
                            </p>
                        </div>

                        {/* Navigation Dots */}
                        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentBannerIndex(idx)}
                                    className={cn(
                                        "h-2 rounded-full transition-all cursor-pointer",
                                        currentBannerIndex === idx ? "bg-blue-400 w-5" : "bg-white/50 w-2 hover:bg-white"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. MINIMAL SEARCH & INSTAGRAM-STYLE DESTINATION STORY FILTERS */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <span>Explore Popular Destinations</span>
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Select a destination or search to filter tour packages</p>
                        </div>

                        {/* Minimal Search Bar */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Goa, Kashmir, Jaipur..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Circular Destination Story Pills */}
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
                        {DESTINATION_STORIES.map((item) => {
                            const isSelected = selectedDestination === item.name;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setSelectedDestination(item.name)}
                                    className="flex flex-col items-center gap-1.5 group shrink-0 cursor-pointer"
                                >
                                    <div className={`p-0.5 rounded-full transition-all ${
                                        isSelected
                                            ? "bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 scale-105 shadow-md ring-2 ring-blue-500/20"
                                            : "bg-slate-200 group-hover:bg-blue-400"
                                    }`}>
                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-slate-100">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold ${
                                        isSelected ? "text-blue-600 font-extrabold" : "text-slate-700"
                                    }`}>
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Filter Tag Badges */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <span>Filter Tag:</span>
                        </span>
                        {["All", "Bestseller", "Trending", "Super Saver", "Top Rated"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedFilterTag(tag)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    selectedFilterTag === tag
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. AESTHETIC TOUR PACKAGE CARDS (3-COLUMN LUXURY GRID) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Available Tour Packages ({filteredPackages.length})</span>
                        </h2>
                        {selectedDestination !== "All" && (
                            <button
                                onClick={() => { setSelectedDestination("All"); setSearchQuery(""); setSelectedFilterTag("All"); }}
                                className="text-xs font-bold text-blue-600 hover:underline"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    {filteredPackages.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 space-y-4 shadow-sm">
                            <Search className="w-10 h-10 text-slate-300 mx-auto" />
                            <h3 className="text-base font-bold text-slate-800">No Tour Packages Found</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Try clearing search filters or selecting another destination avatar.
                            </p>
                            <button
                                onClick={() => { setSelectedDestination("All"); setSearchQuery(""); setSelectedFilterTag("All"); }}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all inline-flex items-center gap-2 cursor-pointer"
                            >
                                <span>View All Packages</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {filteredPackages.map((pkg) => {
                                const packageSlug = pkg.slug || createPackageSlug(pkg.title) || pkg.id;
                                
                                // Process gallery photos for card preview
                                const photosList = Array.isArray(pkg.gallery) && pkg.gallery.length > 0
                                    ? pkg.gallery
                                    : [pkg.image || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"];

                                const activeImgIdx = activeImageIndices[pkg.id] || 0;
                                const displayImg = photosList[activeImgIdx] || photosList[0];
                                const isWishlisted = Boolean(wishlist[pkg.id]);

                                return (
                                    <div
                                        key={pkg.id}
                                        className="group bg-white rounded-3xl border border-slate-200/90 hover:border-blue-500/40 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col justify-between"
                                    >
                                        {/* Cover Image Container */}
                                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={activeImgIdx}
                                                    src={displayImg}
                                                    alt={pkg.title}
                                                    initial={{ opacity: 0.8 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0.8 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </AnimatePresence>

                                            {/* Gradient Mask for legibility */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-black/20 z-10 pointer-events-none" />

                                            {/* Top Left Badge: Vibrant Gradient Pill */}
                                            <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl border border-white/20 shadow-md z-20">
                                                {pkg.badge || "Bestseller"}
                                            </span>

                                            {/* Top Right Wishlist & Rating */}
                                            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                                                {/* Rating Pill */}
                                                <div className="px-2.5 py-1 bg-slate-950/75 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 shadow-md flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    <span>{pkg.rating || 4.8}</span>
                                                    <span className="text-[10px] text-slate-300">({pkg.reviewsCount || 45})</span>
                                                </div>

                                                {/* Wishlist Button */}
                                                <button
                                                    onClick={(e) => toggleWishlist(e, pkg.id)}
                                                    className="w-8 h-8 rounded-xl bg-slate-950/75 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md hover:bg-white hover:text-red-500 transition-all cursor-pointer"
                                                >
                                                    <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                                </button>
                                            </div>

                                            {/* Multi-Photo Swiper Arrows & Photo Counter (if gallery has > 1 photos) */}
                                            {photosList.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => handlePrevImage(e, pkg.id, photosList.length)}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-blue-600 cursor-pointer"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleNextImage(e, pkg.id, photosList.length)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-blue-600 cursor-pointer"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>

                                                    <div className="absolute bottom-2.5 right-3 z-20 px-2 py-0.5 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold rounded-md border border-white/10 flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3 text-sky-400" />
                                                        <span>{activeImgIdx + 1}/{photosList.length}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                {/* Destination Header */}
                                                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-extrabold uppercase tracking-wider">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                    <span className="line-clamp-1">{pkg.destination}</span>
                                                </div>

                                                {/* Package Title */}
                                                <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug tracking-tight">
                                                    {pkg.title}
                                                </h3>

                                                {/* Soft Amenity Spec Chips */}
                                                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                                                    <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-lg flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-sky-600" />
                                                        {pkg.duration}
                                                    </span>

                                                    {pkg.includedStay && (
                                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-lg flex items-center gap-1 line-clamp-1">
                                                            <Hotel className="w-3 h-3 text-indigo-600" />
                                                            {pkg.includedStay}
                                                        </span>
                                                    )}

                                                    {pkg.transport && (
                                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg flex items-center gap-1 line-clamp-1">
                                                            <Car className="w-3 h-3 text-emerald-600" />
                                                            {pkg.transport}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer Price & Action */}
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-black text-slate-900 tracking-tight">
                                                            ₹{pkg.price?.toLocaleString("en-IN")}
                                                        </span>
                                                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                            <span className="text-xs text-slate-400 line-through font-semibold">
                                                                ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-slate-400 font-semibold">Per person • Taxes included</span>
                                                        {pkg.discountPercent && (
                                                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                                                {pkg.discountPercent}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Link
                                                    to={`/packages/${packageSlug}`}
                                                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 group-hover:translate-x-0.5 cursor-pointer shrink-0"
                                                >
                                                    <span>Explore</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
