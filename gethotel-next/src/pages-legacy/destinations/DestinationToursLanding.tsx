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
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
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
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-2.5 sm:gap-4 lg:gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <React.Fragment key={i}>
                                {/* Mobile Blinkit Skeleton */}
                                <div className="lg:hidden bg-white rounded-2xl border border-slate-200/80 p-2 sm:p-2.5 space-y-2 animate-pulse flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                                        <div className="h-3 w-14 bg-slate-200 rounded" />
                                        <div className="h-3.5 w-full bg-slate-200 rounded" />
                                        <div className="h-3 w-2/3 bg-slate-100 rounded" />
                                    </div>
                                    <div className="flex justify-between items-end pt-2 border-t border-slate-100">
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
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
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
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-2.5 sm:gap-4 lg:gap-8">
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
                                    {/* 1. MOBILE VERSION CARD ONLY (lg:hidden) - Blinkit Inspired 2-Column Product Card */}
                                    <Link
                                        to={`/${langCode}/packages/${packageSlug}`}
                                        className="lg:hidden group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 p-2 sm:p-2.5 flex flex-col justify-between cursor-pointer overflow-hidden relative"
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
                                        <div className="flex items-end justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100">
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
                                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
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
