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
        id: "pkg-golden-triangle-4415",
        slug: "golden-triangle-classic-5d4n-delhi-agra-jaipur-tour-4415",
        title: "Golden Triangle Classic 5D4N Delhi Agra Jaipur Tour",
        destination: "Delhi • Agra • Jaipur",
        duration: "5 Days / 4 Nights",
        rating: 4.85,
        reviewsCount: 218,
        price: 14999,
        originalPrice: 19999,
        discountPercent: "25% OFF",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
        includedStay: "4-Star Hotel Stay Included",
        transport: "Private Chauffeur AC Sedan",
        badge: "Bestseller"
    },
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

    const [destinationStories, setDestinationStories] = useState<any[]>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_destinations");
        return saved ? JSON.parse(saved) : DESTINATION_STORIES;
    });

    const [filterConfig, setFilterConfig] = useState<{ showFilterLine: boolean; filterTags: string[] }>(() => {
        const saved = localStorage.getItem("ghs_admin_tour_filter_config");
        return saved ? JSON.parse(saved) : { showFilterLine: true, filterTags: ["All", "Bestseller", "Trending", "Super Saver", "Top Rated"] };
    });

    // Listen to live settings changes from Super Admin
    useEffect(() => {
        const loadSettings = () => {
            const savedBanners = localStorage.getItem("ghs_admin_tour_banners");
            if (savedBanners) {
                try {
                    const parsed = JSON.parse(savedBanners);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setBanners(parsed);
                    }
                } catch (e) {}
            }

            const savedPkgs = localStorage.getItem("ghs_admin_tour_packages");
            if (savedPkgs) {
                try {
                    const parsed = JSON.parse(savedPkgs);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setPackages(parsed);
                    }
                } catch (e) {}
            }

            const savedDest = localStorage.getItem("ghs_admin_tour_destinations");
            if (savedDest) {
                try { setDestinationStories(JSON.parse(savedDest)); } catch (e) {}
            }

            const savedFilter = localStorage.getItem("ghs_admin_tour_filter_config");
            if (savedFilter) {
                try { setFilterConfig(JSON.parse(savedFilter)); } catch (e) {}
            }
        };

        loadSettings();

        window.addEventListener("ghs_tour_settings_updated", loadSettings);
        window.addEventListener("storage", loadSettings);
        return () => {
            window.removeEventListener("ghs_tour_settings_updated", loadSettings);
            window.removeEventListener("storage", loadSettings);
        };
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("All");
    const [selectedFilterTag, setSelectedFilterTag] = useState("All");
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Auto-slide Hero Banners every 4 seconds
    useEffect(() => {
        if (!banners || banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [banners.length]);

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

    // Fetch real tour packages & hero config from backend API (if no admin local override exists)
    useEffect(() => {
        const fetchApiPackages = async () => {
            try {
                const localPkgs = localStorage.getItem("ghs_admin_tour_packages");
                if (!localPkgs) {
                    const res = await packageApi.getPackages();
                    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                        setPackages(res.data);
                    }
                }
            } catch (err) {
                console.error("Using default packages fallback:", err);
            }

            try {
                const localBanners = localStorage.getItem("ghs_admin_tour_banners");
                if (!localBanners) {
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
        <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-slate-50/50 pb-24 font-sans text-slate-900">
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

                        {/* Subtle vignette — no text overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent z-10" />

                        {/* Minimal Centered Navigation Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentBannerIndex(idx)}
                                    className={cn(
                                        "rounded-full transition-all cursor-pointer",
                                        currentBannerIndex === idx ? "bg-white w-4 h-1.5" : "bg-white/40 w-1.5 h-1.5 hover:bg-white/70"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. INSTAGRAM-STYLE DESTINATION STORY FILTERS */}
                <div className="space-y-5 py-3">
                    <div className="space-y-1">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Explore Popular Destinations
                        </h2>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Select a destination to filter tour packages</p>
                    </div>

                    {/* Circular Destination Story Cards (Large & Prominent) */}
                    <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar py-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                        {destinationStories.map((item) => {
                            const isSelected = selectedDestination === item.name;
                            return (
                                <button
                                    key={item.id || item.name}
                                    onClick={() => setSelectedDestination(item.name)}
                                    className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer"
                                >
                                    <div className={`p-1 rounded-full transition-all duration-300 ${
                                        isSelected
                                            ? "bg-brand-600 scale-105 shadow-md ring-4 ring-brand-500/30"
                                            : "bg-slate-200 group-hover:bg-brand-600 group-hover:scale-105"
                                    }`}>
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-3 border-white bg-white shadow-sm">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-sm sm:text-base font-bold transition-colors ${
                                        isSelected ? "text-brand-600 font-extrabold" : "text-slate-700 group-hover:text-brand-600"
                                    }`}>
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Filter Tag Badges (Controlled by Super Admin Settings) */}
                    {filterConfig.showFilterLine && Array.isArray(filterConfig.filterTags) && filterConfig.filterTags.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 flex-wrap">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                <span>Filter Tag:</span>
                            </span>
                            {filterConfig.filterTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedFilterTag(tag)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedFilterTag === tag
                                            ? "bg-brand-600 text-white shadow-md shadow-brand-600/20 border border-white/30 backdrop-blur-xl"
                                            : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
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
                                className="text-xs font-bold text-brand-600 hover:underline"
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
                                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-700 transition-all inline-flex items-center gap-2 cursor-pointer"
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
                                    <Link
                                        key={pkg.id}
                                        to={`/packages/${packageSlug}`}
                                        className="group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] border border-slate-200/60 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between bg-slate-950 cursor-pointer"
                                    >
                                        {/* Background Image across entire card */}
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={activeImgIdx}
                                                src={displayImg}
                                                alt={pkg.title}
                                                initial={{ opacity: 0.8 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0.8 }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0"
                                            />
                                        </AnimatePresence>

                                        {/* Top Overlay Controls: Badge, Rating & Wishlist */}
                                        <div className="relative z-20 p-4 flex items-center justify-between gap-2">
                                            {/* Top Left Badge: Liquid Glass Sheen */}
                                            <span className="px-3.5 py-1.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider rounded-2xl border border-white/40 shadow-md">
                                                {pkg.badge || "Bestseller"}
                                            </span>

                                            {/* Top Right Rating & Wishlist */}
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 bg-slate-950/75 backdrop-blur-md text-white text-xs font-extrabold rounded-2xl border border-white/20 shadow-lg flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    <span>{pkg.rating || 4.8}</span>
                                                    <span className="text-[10px] text-slate-300">({pkg.reviewsCount || 45})</span>
                                                </div>

                                                <button
                                                    onClick={(e) => toggleWishlist(e, pkg.id)}
                                                    className="w-9 h-9 rounded-2xl bg-slate-950/75 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg hover:bg-white hover:text-red-500 transition-all cursor-pointer"
                                                >
                                                    <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Gallery Navigation Arrows */}
                                        {photosList.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => handlePrevImage(e, pkg.id, photosList.length)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-brand-600 cursor-pointer border border-white/20"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleNextImage(e, pkg.id, photosList.length)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-brand-600 cursor-pointer border border-white/20"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        {/* Floating Glassmorphism Pill Tab at Card Bottom (Bright White Liquid Glass) */}
                                        <div className="relative z-20 m-3 sm:m-4 p-4 sm:p-5 rounded-[28px] bg-white/30 backdrop-blur-2xl border border-white/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_12px_40px_rgba(0,0,0,0.18)] space-y-3 group-hover:bg-white/45 group-hover:border-white transition-all duration-300">
                                            {/* Destination & Title */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                                                    <div className="flex items-center gap-1.5 line-clamp-1">
                                                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                                        <span>{pkg.destination}</span>
                                                    </div>
                                                    {pkg.discountPercent && (
                                                        <span className="px-2 py-0.5 bg-emerald-600 text-white border border-white/50 rounded-lg text-[9px] font-black shadow-xs">
                                                            {pkg.discountPercent}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-black text-base sm:text-lg text-slate-950 leading-tight line-clamp-2 tracking-tight group-hover:text-brand-600 transition-colors">
                                                    {pkg.title}
                                                </h3>
                                            </div>

                                            {/* Duration & Price Footer Row */}
                                            <div className="pt-2.5 border-t border-slate-900/10 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/25 backdrop-blur-xl rounded-xl text-xs font-extrabold text-slate-900 border border-white/50 shadow-xs">
                                                    <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                                    <span>{pkg.duration}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                                                                ₹{pkg.price?.toLocaleString("en-IN")}
                                                            </span>
                                                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                <span className="text-xs text-slate-600 line-through font-semibold">
                                                                    ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Liquid Glass Brand Blue Arrow Button */}
                                                    <div className="w-9 h-9 rounded-full bg-brand-600 border border-white/60 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:bg-brand-700 transition-all">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
