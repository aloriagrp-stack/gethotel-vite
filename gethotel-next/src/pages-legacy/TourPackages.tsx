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
                
                {/* 1. INSTAGRAM-STYLE DESTINATION STORY AVATARS */}
                <div className="space-y-5 py-3">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Where Do You Want To Travel?
                        </h2>
                    </div>

                    {/* Circular Destination Story Cards (Authentic Instagram Story Ring) */}
                    <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar py-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                        {destinationStories.map((item, idx) => {
                            const isSelected = selectedDestination === item.name;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setActiveStoryIndex(idx);
                                        setStoryProgress(0);
                                    }}
                                    className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer text-center outline-none focus:outline-none"
                                >
                                    {/* Brand Shiny Shimmer Blue Story Ring */}
                                    <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 group-hover:from-sky-400 group-hover:via-cyan-300 group-hover:to-blue-600 group-hover:scale-108 group-active:scale-95 transition-all duration-500 shadow-md shadow-sky-500/20 group-hover:shadow-xl group-hover:shadow-sky-500/40">
                                        <div className="w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white bg-white p-0.5 shadow-inner">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. AESTHETIC TOUR PACKAGE CARDS (2-COLUMN LUXURY GRID) */}
                <div className="space-y-3 sm:space-y-4" ref={packagesGridRef}>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                                Available Tour Packages {!packagesLoading && `(${filteredPackages.length})`}
                            </h2>
                            {selectedDestination !== "All" && (
                                <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[11px] font-bold rounded-md border border-brand-200 shrink-0">
                                    {selectedDestination}
                                </span>
                            )}
                        </div>

                        {/* Small Filter Button right beside Available Tour Packages */}
                        <div className="flex items-center gap-2 shrink-0">
                            {filterConfig.showFilterLine && Array.isArray(filterConfig.filterTags) && filterConfig.filterTags.length > 0 && (
                                <button
                                    onClick={() => setIsFilterOpen(prev => !prev)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        selectedFilterTag !== "All"
                                            ? "bg-brand-50 border-brand-300 text-brand-700 shadow-xs"
                                            : isFilterOpen
                                            ? "bg-slate-100 border-slate-300 text-slate-900 shadow-xs"
                                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                    title="Toggle filter tags"
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-current" />
                                    <span>{selectedFilterTag !== "All" ? selectedFilterTag : "Filters"}</span>
                                    {selectedFilterTag !== "All" ? (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFilterTag("All");
                                            }}
                                            className="ml-0.5 hover:text-red-600 transition-colors p-0.5"
                                            title="Clear filter"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </span>
                                    ) : (
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
                                    )}
                                </button>
                            )}

                            {(selectedDestination !== "All" || (!filterConfig.showFilterLine && selectedFilterTag !== "All")) && (
                                <button
                                    onClick={() => { setSelectedDestination("All"); setSearchQuery(""); setSelectedFilterTag("All"); }}
                                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expandable Filter Bar when user clicks the small filter button */}
                    <AnimatePresence>
                        {isFilterOpen && filterConfig.showFilterLine && Array.isArray(filterConfig.filterTags) && filterConfig.filterTags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -4 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="py-2 px-2.5 sm:px-3 bg-white/95 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                                            <Filter className="w-3 h-3 text-slate-400" />
                                            <span>Filters:</span>
                                        </span>
                                        {filterConfig.filterTags.map((tag) => {
                                            const isSelected = selectedFilterTag === tag;
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => setSelectedFilterTag(tag)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                                        isSelected
                                                            ? "bg-brand-600 text-white shadow-xs shadow-brand-600/30"
                                                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                    }`}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedFilterTag !== "All" && (
                                        <button
                                            onClick={() => setSelectedFilterTag("All")}
                                            className="text-[11px] font-bold text-red-500 hover:text-red-700 cursor-pointer shrink-0 flex items-center gap-0.5 ml-auto"
                                        >
                                            <X className="w-3 h-3" />
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {packagesLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-0 lg:gap-8">
                            {[0, 1, 2, 3].map((i) => (
                                <React.Fragment key={i}>
                                    {/* Mobile Skeleton Directly on Background */}
                                    <div className={`lg:hidden p-2.5 sm:p-3 space-y-2 animate-pulse flex flex-col justify-between border-b border-slate-200/80 ${
                                        i % 2 === 0 ? "border-r border-slate-200/80 pr-2.5 sm:pr-3" : "pl-2.5 sm:pl-3"
                                    }`}>
                                        <div className="space-y-2">
                                            <div className="aspect-[4/3] bg-slate-200/70 rounded-xl" />
                                            <div className="h-3 w-14 bg-slate-200/70 rounded" />
                                            <div className="h-3.5 w-full bg-slate-200/70 rounded" />
                                            <div className="h-3 w-2/3 bg-slate-200/50 rounded" />
                                        </div>
                                        <div className="flex justify-between items-end pt-2">
                                            <div className="h-4 w-12 bg-slate-300 rounded" />
                                            <div className="h-6 w-12 bg-slate-200 rounded-lg" />
                                        </div>
                                    </div>

                                    {/* Desktop Horizontal Skeleton */}
                                    <div className="hidden lg:flex relative rounded-3xl overflow-hidden p-5 bg-white/60 border border-slate-200/80 animate-pulse min-h-[290px] flex-col justify-between gap-4">
                                        <div className="flex gap-4 items-stretch">
                                            <div className="w-[52%] aspect-[16/10] bg-slate-200 rounded-2xl" />
                                            <div className="flex-1 bg-slate-100 rounded-2xl p-3 flex flex-col justify-between space-y-2">
                                                <div className="h-3 w-1/2 bg-slate-200 rounded" />
                                                <div className="h-6 w-3/4 bg-slate-300 rounded" />
                                                <div className="h-7 w-full bg-slate-200 rounded-xl" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            <div className="h-4 w-1/3 bg-slate-200 rounded-lg" />
                                            <div className="h-5 w-4/5 bg-slate-300 rounded-lg" />
                                            <div className="flex gap-2">
                                                <div className="h-4 w-16 bg-slate-200 rounded" />
                                                <div className="h-4 w-20 bg-slate-200 rounded" />
                                                <div className="h-4 w-16 bg-slate-200 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
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
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-0 lg:gap-8">
                            {filteredPackages.map((pkg, idx) => {
                                const packageSlug = pkg.slug || createPackageSlug(pkg.title);
                                
                                // Process gallery photos for card preview
                                const photosList = Array.isArray(pkg.gallery) && pkg.gallery.length > 0
                                    ? pkg.gallery
                                    : [pkg.image || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"];

                                const activeImgIdx = activeImageIndices[pkg.id] || 0;
                                const displayImg = photosList[activeImgIdx] || photosList[0];
                                const isWishlisted = Boolean(wishlist[pkg.id]);

                                return (
                                    <React.Fragment key={pkg.id}>
                                        {/* 1. MOBILE VERSION CARD ONLY (lg:hidden) - Directly on Background with Center & Bottom Dividers */}
                                        <Link
                                            to={`/${langCode}/packages/${packageSlug}`}
                                            className={`lg:hidden group py-3 flex flex-col justify-between cursor-pointer transition-colors border-b border-slate-200/80 relative ${
                                                idx % 2 === 0 ? "border-r border-slate-200/80 pr-2.5 sm:pr-3" : "pl-2.5 sm:pl-3"
                                            }`}
                                        >
                                            <div className="space-y-1.5">
                                                {/* Top Image Box with Blue Discount Pill + Wishlist */}
                                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 group/img">
                                                    <img
                                                        src={displayImg}
                                                        alt={pkg.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />

                                                    {/* Blue Discount Pill on Top-Left (Exact Blinkit Style) */}
                                                    {pkg.discountPercent && (
                                                        <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-md shadow-xs">
                                                            {pkg.discountPercent}
                                                        </div>
                                                    )}

                                                    {/* Wishlist Heart on Top-Right */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleWishlist(e, pkg.id)}
                                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 flex items-center justify-center hover:text-red-500 shadow-xs transition-colors z-10"
                                                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                    >
                                                        <Heart className={`w-3 h-3 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                                    </button>
                                                </div>

                                                {/* Details Below Image */}
                                                <div className="space-y-1">
                                                    {/* Delivery/Duration Pill (like Blinkit's "⏱ 24 MINS") */}
                                                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-900 bg-amber-50/90 border border-amber-200/60 px-1.5 py-0.5 rounded-md w-fit">
                                                        <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                                        <span>{pkg.duration}</span>
                                                    </div>

                                                    {/* Title (2 lines clamp, like Blinkit item title) */}
                                                    <h3 className="font-bold text-xs sm:text-[13px] text-slate-900 line-clamp-2 leading-snug min-h-[30px] group-hover:text-brand-600 transition-colors">
                                                        {pkg.title}
                                                    </h3>

                                                    {/* Location / Destination subtitle (like Blinkit's "1 unit") */}
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium truncate">
                                                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                                        <span className="truncate">{pkg.destination}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Price & Blinkit Action Button */}
                                            <div className="flex items-end justify-between gap-1 mt-2.5 pt-2">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs sm:text-sm font-black text-slate-950 leading-tight">
                                                        ₹{pkg.price?.toLocaleString("en-IN")}
                                                    </span>
                                                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                        <span className="text-[10px] text-slate-400 line-through font-medium leading-none mt-0.5">
                                                            ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Iconic Blinkit-style ADD/VIEW button */}
                                                <div className="px-3 py-1 rounded-lg border border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white font-black text-[11px] uppercase tracking-wider transition-all text-center shrink-0">
                                                    VIEW
                                                </div>
                                            </div>
                                        </Link>

                                        {/* 2. DESKTOP VERSION CARD ONLY (hidden lg:block) - Matches User Sketch */}
                                        <Link
                                            to={`/${langCode}/packages/${packageSlug}`}
                                            className="hidden lg:block group relative rounded-3xl overflow-hidden p-5 border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer bg-[#F8F9FA]"
                                        >
                                            {/* THIS AREA REMAINS BLURRY AND HAS COLOR OF IMAGE (OFF-WHITE THEME) */}
                                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                                <img
                                                    src={displayImg}
                                                    alt=""
                                                    className="w-full h-full object-cover blur-3xl scale-125 opacity-30 group-hover:scale-135 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-[#F8F9FA]/85 backdrop-blur-2xl" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-[#F8F9FA]/70 to-white/80" />
                                            </div>

                                            {/* INNER CARD LAYOUT */}
                                            <div className="relative z-10 flex flex-col justify-between h-full gap-3.5">
                                                {/* TOP ROW: Image on Left + Pricing Wagera on Right */}
                                                <div className="flex items-stretch gap-4">
                                                    {/* LEFT: Sharp, Clear Tour Image (White Box from User Sketch) */}
                                                    <div className="relative w-[54%] rounded-2xl overflow-hidden shadow-sm shrink-0 group/img bg-slate-100 aspect-[16/10]">
                                                        <img
                                                            src={displayImg}
                                                            alt={pkg.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />

                                                        {/* Badges on Image */}
                                                        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                                                            {pkg.badge && (
                                                                <span className="px-2 py-0.5 bg-brand-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                                                    {pkg.badge}
                                                                </span>
                                                            )}
                                                            {pkg.discountPercent && (
                                                                <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-lg shadow-sm">
                                                                    {pkg.discountPercent}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Gallery Arrow Buttons on Hover */}
                                                        {photosList.length > 1 && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handlePrevImage(e, pkg.id, photosList.length)}
                                                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 hover:bg-brand-600 cursor-pointer"
                                                                    title="Previous image"
                                                                >
                                                                    <ChevronLeft className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleNextImage(e, pkg.id, photosList.length)}
                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 hover:bg-brand-600 cursor-pointer"
                                                                    title="Next image"
                                                                >
                                                                    <ChevronRight className="w-3 h-3" />
                                                                </button>
                                                                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold rounded">
                                                                    {activeImgIdx + 1}/{photosList.length}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* RIGHT: "prices and all this side" (Pricing Wagera to right of image, NO BORDER) */}
                                                    <div className="flex-1 flex flex-col justify-between p-3 rounded-2xl bg-white/70 backdrop-blur-md shadow-xs text-slate-900">
                                                        <div className="space-y-0.5">
                                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block">
                                                                Package Price
                                                            </span>
                                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                                <span className="text-xl xl:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                                                                    ₹{pkg.price?.toLocaleString("en-IN")}
                                                                </span>
                                                                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                    <span className="text-[11px] text-slate-400 line-through font-semibold">
                                                                        ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {pkg.discountPercent && (
                                                                <div className="pt-0.5">
                                                                    <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-extrabold">
                                                                        Save {pkg.discountPercent}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <span className="text-[9px] text-slate-500 font-medium block pt-0.5">
                                                                per guest (all taxes incl.)
                                                            </span>
                                                        </div>

                                                        {/* Trust mini-badge & CTA Button */}
                                                        <div className="pt-2 space-y-1.5">
                                                            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                <span>Instant Confirmation</span>
                                                            </div>

                                                            <div className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 group-hover:scale-[1.02] transition-all">
                                                                <span>View Tour</span>
                                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* BOTTOM: "image ke niche tour details honi chaiye card me" (NO BORDER) */}
                                                <div className="space-y-2 text-slate-900 pt-0.5">
                                                    {/* Row 1: Destination Badge, Star Rating, Wishlist Heart */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 rounded-lg text-xs font-extrabold text-brand-700 uppercase tracking-wider">
                                                            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                                            <span className="truncate max-w-[170px]">{pkg.destination}</span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <div className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 flex items-center gap-1 text-xs font-bold">
                                                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                                <span>{pkg.rating || 5}</span>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={(e) => toggleWishlist(e, pkg.id)}
                                                                className="w-7 h-7 rounded-lg bg-white/80 text-slate-600 flex items-center justify-center hover:bg-white hover:text-red-500 transition-all cursor-pointer shadow-xs"
                                                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                            >
                                                                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Tour Title */}
                                                    <h3 className="font-black text-sm xl:text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                                                        {pkg.title}
                                                    </h3>

                                                    {/* Row 3: Feature Pills (Duration, Stay, Cab) - NO BORDER */}
                                                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold text-slate-700">
                                                        <span className="px-2.5 py-1 bg-white/70 rounded-lg flex items-center gap-1 shadow-xs">
                                                            <Clock className="w-3 h-3 text-brand-600" />
                                                            <span>{pkg.duration}</span>
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-white/70 rounded-lg flex items-center gap-1 shadow-xs">
                                                            <Hotel className="w-3 h-3 text-indigo-600" />
                                                            <span className="truncate max-w-[120px]">{pkg.includedStay || "Hotel Included"}</span>
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-white/70 rounded-lg flex items-center gap-1 shadow-xs">
                                                            <Car className="w-3 h-3 text-emerald-600" />
                                                            <span>Private Cab</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </React.Fragment>
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
