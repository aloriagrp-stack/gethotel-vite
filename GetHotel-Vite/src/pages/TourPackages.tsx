import React, { useState, useEffect } from "react";
import SEOHead from "@/components/common/SEOHead";
import { Link } from "react-router-dom";
import {
    MapPin, Clock, Check, Star, Hotel, Car, X, CheckCircle2,
    Search, ChevronRight, Sparkles
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
    { name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=200&q=80" },
    { name: "Rajasthan", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=200&q=80" },
    { name: "Kashmir", image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=200&q=80" },
    { name: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=200&q=80" },
    { name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=200&q=80" },
    { name: "Ladakh", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=200&q=80" }
];

// Curved Banner Images
const BANNER_IMAGES = [
    {
        title: "Kashmir Paradise: Snow & Houseboat Escapade",
        subtitle: "Luxury Houseboat stay in Dal Lake & Gondola cable car ride included",
        tag: "Flat 25% OFF",
        image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1400&q=80"
    },
    {
        title: "Goa Tropical Beach Retreat & Watersports",
        subtitle: "Beachfront 4-Star Resort stay with Scuba Diving & Parasailing combo",
        tag: "Bestseller Deal",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=80"
    },
    {
        title: "Royal Rajasthan Heritage & Fort Trail",
        subtitle: "Explore Palaces of Jaipur, Udaipur & Jodhpur with Private AC Sedan",
        tag: "Special Offer",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1400&q=80"
    }
];

// Clean Tour Packages Data with SEO Slugs
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
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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
                            title: hData.title || "Handcrafted Tour Packages",
                            subtitle: hData.subtitle || "Unforgettable journeys designed for your dream vacation",
                            tag: idx === 0 ? "Featured Deal" : "Trending Offer",
                            image: imgUrl
                        }));
                        setBanners(formattedBanners);
                    }
                }
            } catch (e) {
                /* fallback to defaults */
            }
        };
        fetchApiPackages();
    }, []);

    // Auto-advance banner carousel
    useEffect(() => {
        if (!banners || banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [banners]);

    // Filter packages matching search query
    const filteredPackages = packages.filter(pkg => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (pkg.title || "").toLowerCase().includes(q) || (pkg.destination || "").toLowerCase().includes(q) || (pkg.badge || "").toLowerCase().includes(q);
    });

    const activeBanner = banners[currentBannerIndex] || BANNER_IMAGES[0];

    return (
        <div className="min-h-screen bg-white pb-20 font-sans text-slate-900">
            <SEOHead
                title="Tour Packages | Holiday Packages in India | GetHotelStays"
                description="Explore handpicked tour packages across Goa, Rajasthan, Kashmir, Himachal, Kerala and Ladakh with verified hotel stays and private cabs."
            />

            <div className="max-w-3xl mx-auto px-4 pt-2 pb-10">
                {/* Curved Mini Hero Image Banner Slider */}
                {banners && banners.length > 0 && (
                    <div className="mb-4 relative overflow-hidden rounded-[24px] md:rounded-[28px] border border-slate-200/90 shadow-sm aspect-[16/7] md:aspect-[21/8] bg-slate-100 group">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentBannerIndex}
                                src={activeBanner.image}
                                alt="Tour Package Banner"
                                initial={{ opacity: 0, scale: 1.04 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {/* Carousel Navigation Dots */}
                        <div className="absolute bottom-2.5 right-3.5 flex items-center gap-1.5 z-10 bg-slate-950/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentBannerIndex(idx)}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all cursor-pointer",
                                        currentBannerIndex === idx ? "bg-blue-400 w-3.5" : "bg-white/60"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* STICKY SEARCH BAR + INSTAGRAM STORY-STYLE CIRCULAR FILTERS */}
                <div className="sticky top-14 md:top-16 z-30 bg-white/95 backdrop-blur-md py-2.5 mb-4 border-b border-slate-100/90 shadow-sm transition-all -mx-4 px-4 space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Type destination e.g. Goa, Jaipur, Kashmir, Manali..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Instagram/Story-Style Circular Destination Avatars */}
                    <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 touch-pan-x">
                        {DESTINATION_STORIES.map((item) => {
                            const isActive = searchQuery.toLowerCase() === item.name.toLowerCase();
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setSearchQuery(isActive ? "" : item.name)}
                                    className="flex flex-col items-center gap-1 group shrink-0 cursor-pointer"
                                >
                                    <div className={`p-0.5 rounded-full transition-all ${
                                        isActive
                                            ? "bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 scale-105 shadow-md"
                                            : "bg-slate-200 group-hover:bg-slate-400"
                                    }`}>
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-slate-100">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-tight ${
                                        isActive ? "text-blue-600 font-black" : "text-slate-600"
                                    }`}>
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2-COLUMN GRID: SQUARE CARDS WITH BRAND ROYAL BLUE HIGHLIGHTS */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filteredPackages.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-400 space-y-2 bg-slate-50 rounded-3xl border border-slate-200/80">
                            <Search className="w-8 h-8 mx-auto text-slate-300" />
                            <p className="text-xs font-bold text-slate-700">No tour packages found</p>
                            <p className="text-[11px] text-slate-400">Try searching for Goa, Kashmir, Jaipur or Ladakh</p>
                        </div>
                    ) : (
                        filteredPackages.map((pkg) => {
                            const packageSlug = pkg.slug || createPackageSlug(pkg.title) || pkg.id;
                            return (
                                <Link
                                    key={pkg.id}
                                    to={`/packages/${packageSlug}`}
                                    className="group relative rounded-2xl md:rounded-3xl overflow-hidden aspect-square border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end bg-slate-950"
                                >
                                    {/* Full Background Image */}
                                    <img
                                        src={pkg.image}
                                        alt={pkg.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Feathered Smooth Glass Blur Overlay — Pure CSS Gradient Mask for 0% Divider Line */}
                                    <div
                                        className="absolute inset-0 backdrop-blur-md bg-slate-950/70 z-10 pointer-events-none transition-all duration-300"
                                        style={{
                                            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                                            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
                                        }}
                                    />

                                    {/* Top Badge */}
                                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md border border-white/20 z-20 shadow-sm">
                                        {pkg.badge || "Featured"}
                                    </span>

                                    {/* Card Text Content Overlay */}
                                    <div className="relative z-20 p-3 text-white flex flex-col justify-end">
                                        <h3 className="text-xs font-bold leading-snug line-clamp-1 group-hover:text-blue-300 transition-colors drop-shadow-sm">
                                            {pkg.title}
                                        </h3>

                                        <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium mt-0.5 line-clamp-1 opacity-90">
                                            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                                            <span className="truncate">{pkg.destination}</span>
                                        </div>

                                        <div className="flex items-baseline justify-between pt-1.5 mt-1 border-t border-white/15">
                                            <span className="text-[9px] font-bold text-slate-300">{pkg.duration}</span>
                                            <span className="text-xs md:text-sm font-black text-blue-400">
                                                ₹{pkg.price?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
