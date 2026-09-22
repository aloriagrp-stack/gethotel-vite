'use client';
import React, { useState, useEffect, useRef, useCallback } from "react";
import SEOHead from "@/components/common/SEOHead";
import { Link, useNavigate } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import {
    MapPin, Clock, Star, Hotel, Car, X, CheckCircle2,
    Search, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Filter,
    Heart, ChevronLeft, Image as ImageIcon, Volume2, VolumeX,
    Compass, Eye, Play, Pause
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
                
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

                {/* 2. AESTHETIC TOUR PACKAGE CARDS (3-COLUMN LUXURY GRID) */}
                <div className="space-y-4" ref={packagesGridRef}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-black text-slate-900 tracking-tight">
                                Available Tour Packages {!packagesLoading && `(${filteredPackages.length})`}
                            </h2>
                            {selectedDestination !== "All" && (
                                <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border border-brand-200">
                                    {selectedDestination}
                                </span>
                            )}
                        </div>
                        {selectedDestination !== "All" && (
                            <button
                                onClick={() => { setSelectedDestination("All"); setSearchQuery(""); setSelectedFilterTag("All"); }}
                                className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
                            {filteredPackages.map((pkg) => {
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
                                        {/* 1. MOBILE VERSION CARD ONLY (lg:hidden) - Preserved 100% Intact */}
                                        <Link
                                            to={`/${langCode}/packages/${packageSlug}`}
                                            className="lg:hidden group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] border border-slate-200/60 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-between bg-slate-950 cursor-pointer"
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={activeImgIdx}
                                                    src={displayImg}
                                                    alt={pkg.title}
                                                    initial={{ opacity: 0.8, scale: 1.05 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0.8 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                                                />
                                            </AnimatePresence>

                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-black/60 pointer-events-none" />

                                            {/* Top Header Row inside Mobile Card */}
                                            <div className="relative z-20 p-4 sm:p-5 flex items-start justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {pkg.badge && (
                                                        <span className="px-3 py-1 bg-brand-600/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg border border-white/20">
                                                            {pkg.badge}
                                                        </span>
                                                    )}
                                                    {photosList.length > 1 && (
                                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold rounded-lg border border-white/10 flex items-center gap-1">
                                                            <ImageIcon className="w-3 h-3" />
                                                            <span>{activeImgIdx + 1}/{photosList.length}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="px-2.5 py-1 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/20 text-white flex items-center gap-1 text-xs font-black shadow-lg">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                        <span>{pkg.rating || 5}</span>
                                                        <span className="text-[10px] text-white/70">({pkg.reviewsCount || 42})</span>
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

                                            {/* Floating Pill at Bottom */}
                                            <div className="relative z-20 m-3 sm:m-4 p-4 sm:p-5 rounded-[28px] bg-white/30 backdrop-blur-2xl border border-white/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_12px_40px_rgba(0,0,0,0.18)] space-y-3 group-hover:bg-white/45 group-hover:border-white transition-all duration-300">
                                                <div className="space-y-1">
                                                    <div className="flex items-start justify-between gap-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                                                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                                            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                                                            <span className="line-clamp-2 leading-tight">{pkg.destination}</span>
                                                        </div>
                                                        {pkg.discountPercent && (
                                                            <span className="px-2 py-0.5 bg-emerald-600 text-white border border-white/50 rounded-lg text-[9px] font-black shadow-xs shrink-0 whitespace-nowrap">
                                                                {pkg.discountPercent}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="font-black text-base sm:text-lg text-slate-950 leading-tight line-clamp-2 tracking-tight group-hover:text-brand-600 transition-colors pt-0.5">
                                                        {pkg.title}
                                                    </h3>
                                                </div>

                                                <div className="pt-2.5 border-t border-slate-900/10 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/25 backdrop-blur-xl rounded-xl text-xs font-extrabold text-slate-900 border border-white/50 shadow-xs">
                                                        <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                                        <span>{pkg.duration}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-tight">
                                                                ₹{pkg.price?.toLocaleString("en-IN")}
                                                            </span>
                                                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                <span className="text-[11px] text-slate-600 line-through font-semibold leading-tight mt-0.5">
                                                                    ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="w-9 h-9 rounded-full bg-brand-600 border border-white/60 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:bg-brand-700 transition-all">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* 2. DESKTOP VERSION CARD ONLY (hidden lg:block) - Matches User Sketch */}
                                        <Link
                                            to={`/${langCode}/packages/${packageSlug}`}
                                            className="hidden lg:block group relative rounded-3xl overflow-hidden p-5 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer bg-slate-950"
                                        >
                                            {/* THIS AREA REMAINS BLURRY AND HAS COLOR OF IMAGE */}
                                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                                <img
                                                    src={displayImg}
                                                    alt=""
                                                    className="w-full h-full object-cover blur-3xl scale-125 opacity-40 group-hover:scale-135 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-slate-950/70" />
                                            </div>

                                            {/* INNER CARD LAYOUT */}
                                            <div className="relative z-10 flex gap-5 items-stretch h-full min-h-[250px]">
                                                {/* LEFT: Sharp, Clear Tour Image (White Box from Sketch) */}
                                                <div className="relative w-[44%] rounded-2xl overflow-hidden shadow-2xl shrink-0 group/img bg-slate-900 border border-white/10">
                                                    <img
                                                        src={displayImg}
                                                        alt={pkg.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />

                                                    {/* Badges on Image */}
                                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                                                        {pkg.badge && (
                                                            <span className="px-2.5 py-0.5 bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md border border-white/20">
                                                                {pkg.badge}
                                                            </span>
                                                        )}
                                                        {pkg.discountPercent && (
                                                            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-lg shadow-md">
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
                                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 hover:bg-brand-600 cursor-pointer border border-white/20"
                                                                title="Previous"
                                                            >
                                                                <ChevronLeft className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleNextImage(e, pkg.id, photosList.length)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 hover:bg-brand-600 cursor-pointer border border-white/20"
                                                                title="Next"
                                                            >
                                                                <ChevronRight className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold rounded-md">
                                                                {activeImgIdx + 1}/{photosList.length}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* RIGHT: "prices and all this sie" */}
                                                <div className="flex-1 flex flex-col justify-between py-1 text-white">
                                                    {/* Location, Rating, Wishlist */}
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-300 uppercase tracking-wider">
                                                                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                                <span className="truncate">{pkg.destination}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5">
                                                                <div className="px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center gap-1 text-[11px] font-bold">
                                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                    <span>{pkg.rating || 5}</span>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => toggleWishlist(e, pkg.id)}
                                                                    className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-white hover:text-red-500 transition-all cursor-pointer"
                                                                >
                                                                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="font-black text-base xl:text-lg text-white leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors">
                                                            {pkg.title}
                                                        </h3>

                                                        {/* Feature pills */}
                                                        <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[11px] font-semibold text-slate-200">
                                                            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                                                                <Clock className="w-3 h-3 text-blue-400" />
                                                                <span>{pkg.duration}</span>
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                                                                <Hotel className="w-3 h-3 text-indigo-400" />
                                                                <span className="truncate max-w-[110px]">{pkg.includedStay || "Hotel Included"}</span>
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                                                                <Car className="w-3 h-3 text-emerald-400" />
                                                                <span>Private Cab</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Price & CTA Section ("prices and all this sie") */}
                                                    <div className="pt-3 border-t border-white/15 flex items-end justify-between gap-3">
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Package Price</span>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-xl xl:text-2xl font-black text-white tracking-tight leading-tight">
                                                                    ₹{pkg.price?.toLocaleString("en-IN")}
                                                                </span>
                                                                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                    <span className="text-xs text-slate-400 line-through font-semibold">
                                                                        ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-slate-300 font-medium block">per guest (all taxes incl.)</span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all group-hover:scale-105 border border-white/20 shrink-0">
                                                            <span>View Tour</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                        </div>
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
