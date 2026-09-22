'use client';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "@/lib/navigation";
import SEOHead from "@/components/common/SEOHead";
import { useLocale } from "@/context/LocaleContext";
import {
    MapPin, Clock, Star, ArrowRight, Heart,
    Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight, Hotel, Car
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

interface DestinationStoryItem {
    name: string;
    slug: string;
    avatar: string;
}

const DESTINATIONS_LIST: DestinationStoryItem[] = [
    { name: "Delhi", slug: "delhi-tours", avatar: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=300&q=80" },
    { name: "Agra", slug: "agra-tours", avatar: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=300&q=80" },
    { name: "Jaipur", slug: "jaipur-tours", avatar: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=300&q=80" },
    { name: "Udaipur", slug: "udaipur-tours", avatar: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=300&q=80" },
    { name: "Jodhpur", slug: "jodhpur-tours", avatar: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=300&q=80" },
    { name: "Jaisalmer", slug: "jaisalmer-tours", avatar: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&q=80" },
    { name: "Ranthambore", slug: "ranthambore-tours", avatar: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=300&q=80" },
    { name: "Mount Abu", slug: "mount-abu-tours", avatar: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80" },
    { name: "Bikaner", slug: "bikaner-tours", avatar: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=300&q=80" }
];

export default function DestinationToursLanding() {
    const params = useParams();
    const navigate = useNavigate();
    const { langCode } = useLocale();

    // Extract destination identifier (e.g. "bikaner-tours" -> "Bikaner")
    const rawSlug = (params.slug || params.id || "bikaner-tours").toLowerCase();
    const cityKey = rawSlug.replace(/-tours$/, "").replace(/^destinations?\//, "").trim();

    // Find formatted destination name
    const activeDest = DESTINATIONS_LIST.find(d => d.slug === rawSlug || d.name.toLowerCase() === cityKey);
    const cityName = activeDest ? activeDest.name : cityKey.charAt(0).toUpperCase() + cityKey.slice(1);

    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilterTag, setSelectedFilterTag] = useState("All");
    const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
    const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

    const toggleWishlist = (e: React.MouseEvent, pkgId: string | number) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist(prev => ({ ...prev, [pkgId]: !prev[pkgId] }));
    };

    const handlePrevImage = (e: React.MouseEvent, pkgId: string | number, total: number) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveImageIndices(prev => ({
            ...prev,
            [pkgId]: ((prev[pkgId] || 0) - 1 + total) % total
        }));
    };

    const handleNextImage = (e: React.MouseEvent, pkgId: string | number, total: number) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveImageIndices(prev => ({
            ...prev,
            [pkgId]: ((prev[pkgId] || 0) + 1) % total
        }));
    };

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const res = await packageApi.getPackages();
                if (res && res.success && Array.isArray(res.data)) {
                    setPackages(res.data);
                }
            } catch (err) {
                console.error("Error fetching packages for destination:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [cityKey]);

    // Filter packages that cover this destination
    const destinationPackages = packages.filter(pkg => {
        const title = (pkg.title || "").toLowerCase();
        const dest = (pkg.destination || "").toLowerCase();
        const searchTarget = cityName.toLowerCase();

        const matchesCity = dest.includes(searchTarget) || title.includes(searchTarget);
        if (!matchesCity) return false;

        if (selectedFilterTag !== "All") {
            const badge = (pkg.badge || "").toLowerCase();
            if (!badge.includes(selectedFilterTag.toLowerCase())) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
            <SEOHead
                title={`${cityName} Tour Packages | GetHotelStays`}
                description={`Explore verified ${cityName} tour packages and handcrafted itineraries with hotels and private transfers.`}
            />

            {/* MAIN CONTENT AREA - ZERO TOP CLUTTER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
                {/* HEADER & FILTER PILLS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                {cityName} Tour Packages
                            </h1>
                            {!loading && (
                                <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-black border border-brand-200">
                                    {destinationPackages.length}
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            Private AC vehicle transfers, heritage stays & monument sightseeing
                        </p>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {["All", "Bestseller", "Top Rated", "Popular"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedFilterTag(tag)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedFilterTag === tag
                                        ? "bg-slate-900 text-white shadow-xs"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PACKAGES GRID */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-3xl aspect-[4/5] bg-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : destinationPackages.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-800">No packages found for {cityName} with filter "{selectedFilterTag}"</h3>
                        <button
                            onClick={() => setSelectedFilterTag("All")}
                            className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                            Show All {cityName} Packages
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
                        {destinationPackages.map((pkg) => {
                            const packageSlug = pkg.slug || createPackageSlug(pkg.title);
                            
                            const photosList = Array.isArray(pkg.gallery) && pkg.gallery.length > 0
                                ? pkg.gallery
                                : [pkg.image || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"];

                            const activeImgIdx = activeImageIndices[pkg.id] || 0;
                            const displayImg = photosList[activeImgIdx] || photosList[0];
                            const isWishlisted = Boolean(wishlist[pkg.id]);

                            return (
                                <React.Fragment key={pkg.id}>
                                    {/* 1. MOBILE VERSION CARD ONLY (lg:hidden) - Preserved Intact */}
                                    <Link
                                        to={`/${langCode}/packages/${packageSlug}`}
                                        className="lg:hidden group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] border border-slate-200/60 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-between bg-slate-950 cursor-pointer"
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={activeImgIdx}
                                                src={displayImg}
                                                alt={pkg.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                                            />
                                        </AnimatePresence>

                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-black/60 pointer-events-none" />

                                        <div className="relative z-20 p-4 sm:p-5 flex items-start justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {pkg.badge && (
                                                    <span className="px-3 py-1 bg-brand-600/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg border border-white/20">
                                                        {pkg.badge}
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

                                        <div className="relative z-20 m-3 sm:m-4 p-4 sm:p-5 rounded-[28px] bg-white/30 backdrop-blur-2xl border border-white/70 shadow-lg space-y-3 group-hover:bg-white/45 transition-all">
                                            <div className="space-y-1">
                                                <div className="flex items-start justify-between gap-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                                                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2 leading-tight">{pkg.destination}</span>
                                                    </div>
                                                    {pkg.discountPercent && (
                                                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black shrink-0">
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

                                                    <div className="w-9 h-9 rounded-full bg-brand-600 border border-white/60 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-all">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* 2. DESKTOP VERSION CARD ONLY (hidden lg:block) - Matches User Sketch */}
                                    <Link
                                        to={`/${langCode}/packages/${packageSlug}`}
                                        className="hidden lg:block group relative rounded-3xl overflow-hidden p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer bg-slate-950"
                                    >
                                        {/* THIS AREA REMAINS BLURRY AND HAS COLOR OF IMAGE */}
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <img
                                                src={displayImg}
                                                alt=""
                                                className="w-full h-full object-cover blur-3xl scale-125 opacity-45 group-hover:scale-135 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-2xl" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-slate-950/80" />
                                        </div>

                                        {/* INNER CARD LAYOUT */}
                                        <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                                            {/* TOP ROW: Image on Left + Pricing Wagera on Right */}
                                            <div className="flex items-stretch gap-5">
                                                {/* LEFT: Sharp, Clear Tour Image (White Box from User Sketch) */}
                                                <div className="relative w-[56%] rounded-2xl overflow-hidden shadow-2xl shrink-0 group/img bg-slate-900 border border-white/10 aspect-[16/10]">
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
                                                                title="Previous image"
                                                            >
                                                                <ChevronLeft className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleNextImage(e, pkg.id, photosList.length)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 hover:bg-brand-600 cursor-pointer border border-white/20"
                                                                title="Next image"
                                                            >
                                                                <ChevronRight className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold rounded-md">
                                                                {activeImgIdx + 1}/{photosList.length}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* RIGHT: "prices and all this sie" (Pricing Wagera to right of image) */}
                                                <div className="flex-1 flex flex-col justify-between p-4 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 text-white shadow-inner">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 block">
                                                            Package Price
                                                        </span>
                                                        <div className="flex items-baseline gap-2 flex-wrap">
                                                            <span className="text-2xl xl:text-3xl font-black text-white tracking-tight leading-tight">
                                                                ₹{pkg.price?.toLocaleString("en-IN")}
                                                            </span>
                                                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                <span className="text-xs text-slate-400 line-through font-semibold">
                                                                    ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {pkg.discountPercent && (
                                                            <div className="pt-0.5">
                                                                <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-extrabold">
                                                                    Save {pkg.discountPercent}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <span className="text-[10px] text-slate-300 font-medium block pt-1">
                                                            per guest (all taxes incl.)
                                                        </span>
                                                    </div>

                                                    {/* Trust mini-badge & CTA Button */}
                                                    <div className="pt-3 space-y-2">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            <span>Instant Confirmation</span>
                                                        </div>

                                                        <div className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all border border-white/20">
                                                            <span>View Tour</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BOTTOM: "image ke niche tour details honi chaiye card me" */}
                                            <div className="pt-1 space-y-2 text-white border-t border-white/10">
                                                {/* Row 1: Destination Badge, Star Rating, Wishlist Heart */}
                                                <div className="flex items-center justify-between gap-3 pt-1">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-extrabold text-blue-300 uppercase tracking-wider border border-white/10">
                                                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                        <span className="truncate max-w-[200px]">{pkg.destination}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center gap-1 text-xs font-bold">
                                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                            <span>{pkg.rating || 5}</span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => toggleWishlist(e, pkg.id)}
                                                            className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-white hover:text-red-500 transition-all cursor-pointer"
                                                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                        >
                                                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Row 2: Tour Title */}
                                                <h3 className="font-black text-base xl:text-lg text-white leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors">
                                                    {pkg.title}
                                                </h3>

                                                {/* Row 3: Feature Pills (Duration, Stay, Cab) */}
                                                <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[11px] font-semibold text-slate-200">
                                                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                                                        <Clock className="w-3 h-3 text-blue-400" />
                                                        <span>{pkg.duration}</span>
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                                                        <Hotel className="w-3 h-3 text-indigo-400" />
                                                        <span className="truncate max-w-[140px]">{pkg.includedStay || "Hotel Included"}</span>
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                                                        <Car className="w-3 h-3 text-emerald-400" />
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

                {/* BOTTOM EXPLORE OTHER DESTINATIONS */}
                <div className="pt-10 border-t border-slate-200/80 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Explore Other Destinations</h3>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        <Link
                            to={`/${langCode}/packages`}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                            All Packages
                        </Link>
                        {DESTINATIONS_LIST.map((dest) => {
                            const isCurrent = dest.name.toLowerCase() === cityName.toLowerCase();
                            if (isCurrent) return null;
                            return (
                                <Link
                                    key={dest.slug}
                                    to={`/${langCode}/packages/${dest.slug}`}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all"
                                >
                                    {dest.name} Tours
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
