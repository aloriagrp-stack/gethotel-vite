'use client';
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
    { name: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=200&q=80" },
    { name: "Jaipur", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=200&q=80" },
    { name: "Udaipur", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=200&q=80" },
    { name: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=200&q=80" },
    { name: "Shimla", image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=200&q=80" }
];

export default function TourPackages() {
    const [packages, setPackages] = useState<any[]>([]);
    const [packagesLoading, setPackagesLoading] = useState<boolean>(true);

    const [banners, setBanners] = useState<any[]>(() => {
        if (typeof window === 'undefined') return [];
        const validOverride = (() => {
            try { return localStorage.getItem("ghs_tour_banners_v2") === "1"; } catch (e) { return false; }
        })();
        const saved = validOverride ? localStorage.getItem("ghs_admin_tour_banners") : null;
        return saved ? JSON.parse(saved) : [];
    });

    const [destinationStories, setDestinationStories] = useState<any[]>(() => {
        if (typeof window === 'undefined') return DESTINATION_STORIES;
        const saved = localStorage.getItem("ghs_admin_tour_destinations");
        return saved ? JSON.parse(saved) : DESTINATION_STORIES;
    });

    const [filterConfig, setFilterConfig] = useState<{ showFilterLine: boolean; filterTags: string[] }>(() => {
        if (typeof window === 'undefined') return { showFilterLine: true, filterTags: ["All", "Bestseller", "Trending", "Super Saver", "Top Rated"] };
        const saved = localStorage.getItem("ghs_admin_tour_filter_config");
        return saved ? JSON.parse(saved) : { showFilterLine: true, filterTags: ["All", "Bestseller", "Trending", "Super Saver", "Top Rated"] };
    });

    // Listen to live settings changes from Super Admin
    useEffect(() => {
        const loadSettings = () => {
            const validOverride = (() => {
                try { return localStorage.getItem("ghs_tour_banners_v2") === "1"; } catch (e) { return false; }
            })();
            const savedBanners = validOverride ? localStorage.getItem("ghs_admin_tour_banners") : null;
            if (savedBanners) {
                try {
                    const parsed = JSON.parse(savedBanners);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setBanners(parsed);
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

    // Fetch real tour packages & hero config from backend API
    useEffect(() => {
        const fetchApiPackages = async () => {
            try {
                localStorage.removeItem("ghs_admin_tour_packages");
            } catch (e) {}

            try {
                const res = await packageApi.getPackages();
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    setPackages(res.data);
                }
            } catch (err) {
                console.error("Failed to load tour packages:", err);
            } finally {
                setPackagesLoading(false);
            }

            try {
                const validOverride = (() => {
                    try { return localStorage.getItem("ghs_tour_banners_v2") === "1"; } catch (e) { return false; }
                })();
                const localBanners = validOverride ? localStorage.getItem("ghs_admin_tour_banners") : null;
                const hasLocalOverride = localBanners !== null && localBanners.length > 0;

                const heroRes = await packageApi.getHeroConfig();
                if (heroRes && heroRes.success && heroRes.data && !hasLocalOverride) {
                    const hData = heroRes.data;
                    if (Array.isArray(hData.banners) && hData.banners.length > 0) {
                        setBanners(hData.banners);
                    } else if (Array.isArray(hData.heroImages) && hData.heroImages.length > 0) {
                        const formattedBanners = hData.heroImages.map((imgUrl: string, idx: number) => ({
                            id: `b-${idx}`,
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

    const activeBanner = banners[currentBannerIndex];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-slate-50/50 pb-24 font-sans text-slate-900">
            <SEOHead
                title="Handcrafted Tour Packages | GetHotelStays"
                description="Explore handpicked holiday & tour packages across Goa, Rajasthan, Kashmir, Himachal, Kerala and Ladakh with verified hotel stays and private cabs."
            />

            {/* Main Widescreen Desktop Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
                
                {/* 1. INSTAGRAM-STYLE DESTINATION STORY FILTERS */}
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
                            <span>Available Tour Packages {!packagesLoading && `(${filteredPackages.length})`}</span>
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

                    {packagesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] bg-slate-200 animate-pulse">
                                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-3 bg-white/70 backdrop-blur-sm">
                                        <div className="h-3 w-1/3 bg-slate-300 rounded-full" />
                                        <div className="h-4 w-4/5 bg-slate-300 rounded-full" />
                                        <div className="h-10 w-full bg-slate-300 rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 space-y-3 shadow-sm">
                            <Sparkles className="w-10 h-10 text-brand-600 mx-auto" />
                            <h3 className="text-lg font-black text-slate-900">Custom Tour Packages Coming Soon</h3>
                            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                                Handcrafted holiday packages with verified stays, transfers and itineraries will be available soon.
                            </p>
                        </div>
                    ) : filteredPackages.length === 0 ? (
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
