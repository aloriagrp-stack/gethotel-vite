'use client';
import React, { useState, useEffect, useRef, useCallback } from "react";
import SEOHead from "@/components/common/SEOHead";
import { Link, useNavigate } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import {
    MapPin, Clock, Star, Hotel, Car, X, CheckCircle2,
    Search, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Filter,
    Heart, ChevronLeft, Image as ImageIcon, Volume2, VolumeX,
    Compass, Eye, Play, Pause, SlidersHorizontal, ChevronDown
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

export interface DestinationStory {
    id?: string;
    name: string;
    slug?: string;
    tagline: string;
    image: string;
    storyImage: string;
    highlights: string[];
    startingPrice: string;
    badge?: string;
    tourCountText: string;
}

// Curated Instagram Destination Stories Data (Without "All")
const DEFAULT_DESTINATION_STORIES: DestinationStory[] = [
    {
        name: "Delhi",
        slug: "delhi-tours",
        tagline: "Capital Heritage & Mughal Grandeur",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Red Fort & Jama Masjid", "Qutub Minar & Humayun's Tomb", "Chandni Chowk Food Trail"],
        startingPrice: "₹18,999",
        badge: "Heritage Hub",
        tourCountText: "6 Packages Available"
    },
    {
        name: "Agra",
        slug: "agra-tours",
        tagline: "The City of Taj & Mughal Wonders",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Taj Mahal Sunrise Tour", "Historic Agra Fort", "Mehtab Bagh Sunset Views"],
        startingPrice: "₹18,999",
        badge: "Wonder of World",
        tourCountText: "5 Packages Available"
    },
    {
        name: "Jaipur",
        slug: "jaipur-tours",
        tagline: "The Royal Pink City of Forts & Palaces",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Amber Fort Jeep Ride", "Hawa Mahal & City Palace", "Johari Bazaar Royal Shopping"],
        startingPrice: "₹18,999",
        badge: "Royal Rajasthan",
        tourCountText: "8 Packages Available"
    },
    {
        name: "Udaipur",
        slug: "udaipur-tours",
        tagline: "Romantic City of Lakes & Royal Haveli",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Lake Pichola Sunset Boat Cruise", "Grand City Palace Complex", "Bagore Ki Haveli Folk Show"],
        startingPrice: "₹27,999",
        badge: "Venice of East",
        tourCountText: "4 Packages Available"
    },
    {
        name: "Jodhpur",
        slug: "jodhpur-tours",
        tagline: "The Sun City & Mighty Mehrangarh Fort",
        image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Mehrangarh Fort Panorama", "Jaswant Thada Royal Cenotaph", "Blue City Heritage Walking Tour"],
        startingPrice: "₹21,999",
        badge: "Blue City",
        tourCountText: "3 Packages Available"
    },
    {
        name: "Jaisalmer",
        slug: "jaisalmer-tours",
        tagline: "The Golden City & Thar Desert Safaris",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Sam Sand Dunes Camel Safari", "Living Golden Fort Exploration", "Cultural Folk Music Camp"],
        startingPrice: "₹21,999",
        badge: "Desert Safari",
        tourCountText: "3 Packages Available"
    },
    {
        name: "Ranthambore",
        slug: "ranthambore-tours",
        tagline: "Wild Royal Bengal Tiger Safaris",
        image: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Open 4x4 Jeep Tiger Safari", "Historic Ranthambore Fort", "Wildlife Nature Photography"],
        startingPrice: "₹26,499",
        badge: "Tiger Reserve",
        tourCountText: "2 Packages Available"
    },
    {
        name: "Mount Abu",
        slug: "mount-abu-tours",
        tagline: "Oasis Hill Station & Dilwara Temples",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Intricate Dilwara Marble Temples", "Nakki Lake Boating", "Sunset Point & Guru Shikhar"],
        startingPrice: "₹34,999",
        badge: "Hill Station",
        tourCountText: "2 Packages Available"
    },
    {
        name: "Bikaner",
        slug: "bikaner-tours",
        tagline: "Desert Citadels & Camel Breeding Hub",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80",
        storyImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1080&q=85",
        highlights: ["Junagarh Fort & Museum", "Karni Mata Temple", "Laxmi Niwas Royal Palace"],
        startingPrice: "₹28,999",
        badge: "Heritage Haven",
        tourCountText: "2 Packages Available"
    }
];

export default function TourPackages() {
    const navigate = useNavigate();
    const { langCode } = useLocale();
    const [packages, setPackages] = useState<any[]>([]);
    const [packagesLoading, setPackagesLoading] = useState<boolean>(true);

    const [destinationStories, setDestinationStories] = useState<DestinationStory[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_DESTINATION_STORIES;
        try {
            const saved = localStorage.getItem("ghs_admin_tour_destinations_v4");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.filter(item => item.name !== "All");
                }
            }
        } catch (e) {}
        return DEFAULT_DESTINATION_STORIES;
    });

    const [filterConfig, setFilterConfig] = useState<{ showFilterLine: boolean; filterTags: string[] }>(() => {
        if (typeof window === 'undefined') return { showFilterLine: true, filterTags: ["All", "Bestseller", "Trending", "Super Saver", "Top Rated"] };
        const saved = localStorage.getItem("ghs_admin_tour_filter_config");
        return saved ? JSON.parse(saved) : { showFilterLine: true, filterTags: ["All", "Bestseller", "Trending", "Super Saver", "Top Rated"] };
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("All");
    const [selectedFilterTag, setSelectedFilterTag] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Instagram Story Modal State
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [storyProgress, setStoryProgress] = useState(0);
    const [isStoryPaused, setIsStoryPaused] = useState(false);
    const storyTimerRef = useRef<NodeJS.Timeout | null>(null);
    const packagesGridRef = useRef<HTMLDivElement | null>(null);

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

    // Fetch real tour packages from backend API
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
        };

        fetchApiPackages();
    }, []);

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

    // Handle Story Next / Previous
    const handleNextStory = useCallback(() => {
        if (activeStoryIndex === null) return;
        if (activeStoryIndex < destinationStories.length - 1) {
            setActiveStoryIndex(prev => (prev !== null ? prev + 1 : 0));
            setStoryProgress(0);
        } else {
            setActiveStoryIndex(null);
            setStoryProgress(0);
        }
    }, [activeStoryIndex, destinationStories.length]);

    const handlePrevStory = useCallback(() => {
        if (activeStoryIndex === null) return;
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => (prev !== null ? prev - 1 : 0));
            setStoryProgress(0);
        } else {
            setStoryProgress(0);
        }
    }, [activeStoryIndex]);

    // Story Auto-Progress Timer (5 seconds per slide)
    useEffect(() => {
        if (activeStoryIndex === null || isStoryPaused) {
            if (storyTimerRef.current) clearInterval(storyTimerRef.current);
            return;
        }

        const interval = 50; // update every 50ms
        const step = (interval / 5000) * 100; // 5000ms duration

        storyTimerRef.current = setInterval(() => {
            setStoryProgress(prev => {
                if (prev >= 100) {
                    handleNextStory();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => {
            if (storyTimerRef.current) clearInterval(storyTimerRef.current);
        };
    }, [activeStoryIndex, isStoryPaused, handleNextStory]);

    // Handle Explore Click in Story Modal - Navigates to dedicated destination tours page
    const handleExploreFromStory = (story: DestinationStory) => {
        setActiveStoryIndex(null);
        const destSlug = story.slug || `${story.name.toLowerCase()}-tours`;
        navigate(`/${langCode}/packages/${destSlug}`);
    };

    const currentStory = activeStoryIndex !== null ? destinationStories[activeStoryIndex] : null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-slate-50/50 pb-24 font-sans text-slate-900">
            <SEOHead
                title="Tour Packages | GetHotelStays"
                description="Explore handpicked holiday & tour packages across Rajasthan, Delhi, Agra, Jaipur, Udaipur and iconic Golden Triangle circuits."
            />

            {/* Main Widescreen Desktop Container */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
                
                {/* 2. VIATOR-STYLE HEADER & TOUR PACKAGE CARDS */}
                <div className="space-y-4 sm:space-y-5" ref={packagesGridRef}>
                    {/* Header Title */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                            All India Tours & Excursions in 2026
                        </h1>
                    </div>

                    {/* Quick Filter Pill Buttons (Exact Viator Style) */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(prev => !prev)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                                isFilterOpen
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white border-slate-300 text-slate-800 hover:border-slate-400"
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Filters</span>
                        </button>

                        {/* Destination Pills */}
                        {["All", "Delhi", "Agra", "Jaipur", "Udaipur", "Varanasi", "Goa", "Mumbai"].map((dest) => {
                            const isSelected = selectedDestination === dest;
                            return (
                                <button
                                    key={dest}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDestination(dest);
                                        setSearchQuery("");
                                    }}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                                        isSelected
                                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                            : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                                    }`}
                                >
                                    {dest === "All" ? "All Tours" : dest}
                                </button>
                            );
                        })}
                    </div>

                    {/* Results Count & Sort By */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 pt-1 pb-1">
                        <span className="font-semibold text-slate-900">
                            {!packagesLoading ? `${filteredPackages.length} results` : "Loading tours..."}
                        </span>
                        <div className="flex items-center gap-1 font-medium text-slate-700 cursor-pointer">
                            <span>Sort by: <strong className="text-slate-900">Featured</strong></span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    {packagesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs animate-pulse">
                                    <div className="aspect-[4/3] bg-slate-200" />
                                    <div className="p-3.5 sm:p-4 space-y-2.5">
                                        <div className="h-4 bg-slate-200 rounded w-full" />
                                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded w-1/2 pt-1" />
                                        <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                                            <div className="h-4 bg-slate-200 rounded w-16" />
                                            <div className="h-5 bg-slate-200 rounded w-20" />
                                        </div>
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
                                We couldn't find any packages matching "{selectedDestination !== "All" ? selectedDestination : searchQuery}". Try selecting another destination.
                            </p>
                            <button
                                onClick={() => { setSelectedDestination("All"); setSearchQuery(""); setSelectedFilterTag("All"); }}
                                className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-brand-700 transition-all inline-block"
                            >
                                View All Available Packages
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                            {filteredPackages.map((pkg) => {
                                const packageSlug = pkg.slug || createPackageSlug(pkg.title);
                                const photosList = Array.isArray(pkg.gallery) && pkg.gallery.length > 0
                                    ? pkg.gallery
                                    : [pkg.image || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"];
                                const displayImg = photosList[0];
                                const isWishlisted = Boolean(wishlist[pkg.id]);
                                const isDiscounted = Boolean(pkg.originalPrice && pkg.originalPrice > pkg.price);
                                const badgeText = pkg.badge || (isDiscounted ? "Special Offer" : "Best Seller");
                                const isSpecialOffer = badgeText.toLowerCase().includes("offer") || badgeText.toLowerCase().includes("special");

                                return (
                                    <Link
                                        key={pkg.id}
                                        to={`/${langCode}/packages/${packageSlug}`}
                                        className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                                    >
                                        {/* 1. Image Box (Aspect 4:3) */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                                            <img
                                                src={displayImg}
                                                alt={pkg.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />

                                            {/* Badge on Top-Left (Viator Style Pill) */}
                                            {badgeText && (
                                                <div className="absolute top-2.5 left-2.5 z-10">
                                                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full shadow-xs ${
                                                        isSpecialOffer
                                                            ? "bg-rose-100 text-rose-800"
                                                            : "bg-emerald-100 text-emerald-800"
                                                    }`}>
                                                        {badgeText}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Wishlist Heart on Top-Right */}
                                            <button
                                                type="button"
                                                onClick={(e) => toggleWishlist(e, pkg.id)}
                                                className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
                                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                            >
                                                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                                            </button>

                                            {/* Carousel Indicator Dots */}
                                            <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 pointer-events-none z-10">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                            </div>
                                        </div>

                                        {/* 2. Card Content Body */}
                                        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
                                            <div className="space-y-1">
                                                {/* Title (2 lines clamp) */}
                                                <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[40px]">
                                                    {pkg.title}
                                                </h3>

                                                {/* Specs (Duration • Free Cancellation) */}
                                                <p className="text-xs text-slate-500 font-normal">
                                                    {pkg.duration} • Free Cancellation
                                                </p>
                                            </div>

                                            {/* Bottom Row: Rating on Left, Price on Right */}
                                            <div className="flex items-end justify-between pt-2 border-t border-slate-100 mt-auto">
                                                {/* Rating */}
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                                        ★ {pkg.rating ? Number(pkg.rating).toFixed(1) : "4.9"}
                                                    </span>
                                                    <span className="text-slate-400 font-normal">
                                                        ({(pkg.reviewsCount || 120).toLocaleString()})
                                                    </span>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal block leading-tight">
                                                        from
                                                    </span>
                                                    <div className="flex items-baseline justify-end gap-1">
                                                        {isDiscounted && (
                                                            <span className="text-xs text-slate-400 line-through font-normal">
                                                                ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                            </span>
                                                        )}
                                                        <span className={`text-sm sm:text-base font-extrabold ${isDiscounted ? "text-rose-600" : "text-slate-950"}`}>
                                                            ₹{pkg.price?.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">
                                                        Price varies by group size
                                                    </span>
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

            {/* 3. FULLSCREEN INSTAGRAM-STYLE STORY VIEWER MODAL */}
            <AnimatePresence>
                {activeStoryIndex !== null && currentStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center select-none"
                    >
                        {/* Center Story Container (Aspect Ratio 9:16 Mobile View on all devices) */}
                        <motion.div
                            initial={{ scale: 0.92, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-md h-[92vh] max-h-[820px] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl flex flex-col justify-between"
                            onMouseDown={() => setIsStoryPaused(true)}
                            onMouseUp={() => setIsStoryPaused(false)}
                            onTouchStart={() => setIsStoryPaused(true)}
                            onTouchEnd={() => setIsStoryPaused(false)}
                        >
                            {/* Background Story Image */}
                            <img
                                src={currentStory.storyImage || currentStory.image}
                                alt={currentStory.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Cinematic Top & Bottom Gradients */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/80 pointer-events-none" />

                            {/* Top Instagram Progress Bars */}
                            <div className="relative z-30 pt-3 px-3.5 space-y-3">
                                <div className="flex items-center gap-1.5">
                                    {destinationStories.map((_, i) => (
                                        <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white transition-all duration-75 ease-linear"
                                                style={{
                                                    width:
                                                        i < activeStoryIndex
                                                            ? "100%"
                                                            : i === activeStoryIndex
                                                            ? `${storyProgress}%`
                                                            : "0%"
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Story Header Bar */}
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 shadow-md shadow-sky-500/30">
                                            <img
                                                src={currentStory.image}
                                                alt={currentStory.name}
                                                className="w-full h-full rounded-full object-cover border border-white"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-extrabold text-sm tracking-tight text-white">{currentStory.name}</h3>
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                                            </div>
                                            <span className="text-[10px] text-white/75 font-medium">{currentStory.tourCountText}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveStoryIndex(null);
                                        }}
                                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer"
                                        aria-label="Close Story"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Left & Right Interactive Tap Zones */}
                            <div className="absolute inset-0 z-20 flex">
                                <div
                                    className="w-1/3 h-full cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrevStory();
                                    }}
                                />
                                <div
                                    className="w-2/3 h-full cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNextStory();
                                    }}
                                />
                            </div>

                            {/* Minimal Bottom Story Content & Action */}
                            <div className="relative z-30 p-4 sm:p-6 space-y-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                                        {currentStory.name}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-white/80 font-medium drop-shadow-sm mt-0.5">
                                        {currentStory.tagline}
                                    </p>
                                </div>

                                {/* Minimal Direct Explore Button */}
                                <div className="pt-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExploreFromStory(currentStory);
                                        }}
                                        className="w-full py-3 px-5 bg-white/20 hover:bg-white text-white hover:text-slate-950 backdrop-blur-xl border border-white/40 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <span>Explore {currentStory.name} Tours</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Outside Desktop Navigation Chevrons */}
                        {activeStoryIndex > 0 && (
                            <button
                                onClick={handlePrevStory}
                                className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-xl border border-white/20 transition-all cursor-pointer"
                                aria-label="Previous Destination"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {activeStoryIndex < destinationStories.length - 1 && (
                            <button
                                onClick={handleNextStory}
                                className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-xl border border-white/20 transition-all cursor-pointer"
                                aria-label="Next Destination"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
