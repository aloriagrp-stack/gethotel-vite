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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    {/* 1. MOBILE VERSION CARD ONLY (lg:hidden) - Matches Alphonso Reference & User Wireframe */}
                                    <Link
                                        to={`/${langCode}/packages/${packageSlug}`}
                                        className="lg:hidden group relative rounded-[32px] overflow-hidden aspect-[3/4.6] border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between bg-slate-950 cursor-pointer"
                                    >
                                        {/* Image In Full Card */}
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={activeImgIdx}
                                                src={displayImg}
                                                alt={pkg.title}
                                                initial={{ opacity: 0.85, scale: 1.04 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0.85 }}
                                                transition={{ duration: 0.4 }}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                                            />
                                        </AnimatePresence>

                                        {/* In this area the area must be blurry and hazy and the blurry area and the real area should be looking like mixed */}
                                        <div
                                            className="absolute inset-x-0 bottom-0 h-[68%] backdrop-blur-xl pointer-events-none"
                                            style={{
                                                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, black 55%)",
                                                maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, black 55%)",
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                                        {/* Top Header: Destination + Discount Pill + Wishlist */}
                                        <div className="relative z-20 p-4 sm:p-5 flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-extrabold border border-white/10 shadow-sm">
                                                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                <span className="truncate max-w-[130px]">{pkg.destination}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {pkg.discountPercent && (
                                                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 shadow-sm">
                                                        {pkg.discountPercent}
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={(e) => toggleWishlist(e, pkg.id)}
                                                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 shadow-sm hover:bg-white hover:text-red-500 transition-all cursor-pointer"
                                                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                >
                                                    <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Bottom Content Area (On Top of Hazy Blurred Area) */}
                                        <div className="relative z-20 p-5 space-y-3">
                                            {/* Pagination Dots (like the Alphonso reference image) */}
                                            {photosList.length > 1 && (
                                                <div className="flex items-center justify-center gap-1.5 pb-1">
                                                    {photosList.slice(0, 5).map((_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`h-1.5 rounded-full transition-all ${
                                                                idx === activeImgIdx ? "w-5 bg-white shadow-xs" : "w-1.5 bg-white/40"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Row 1: Title (Left) + Price Pill (Right) */}
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="font-black text-xl sm:text-2xl text-white leading-tight line-clamp-1 tracking-tight">
                                                    {pkg.title}
                                                </h3>

                                                <div className="px-3.5 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white font-black text-sm sm:text-base shrink-0 border border-white/15 shadow-sm">
                                                    ₹{pkg.price?.toLocaleString("en-IN")}
                                                </div>
                                            </div>

                                            {/* Row 2: "Your paragraph text" (Description) */}
                                            <p className="text-xs sm:text-[13px] text-white/80 line-clamp-2 leading-relaxed font-medium">
                                                {pkg.description || pkg.overview || "Experience iconic heritage, guided sightseeing, and scenic highlights with handpicked stays."}
                                            </p>

                                            {/* Row 3: Pills (like "Best Seller" & "9 left" in reference image) */}
                                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                                {pkg.badge && (
                                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white shadow-xs">
                                                        {pkg.badge}
                                                    </span>
                                                )}
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white shadow-xs flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-white/80" />
                                                    <span>{pkg.duration}</span>
                                                </span>
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white shadow-xs flex items-center gap-1">
                                                    <Car className="w-3 h-3 text-white/80" />
                                                    <span>Private Cab</span>
                                                </span>
                                                {pkg.rating && (
                                                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white shadow-xs flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        <span>{pkg.rating}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Row 4: "the button" (White Full-width Pill Button like Alphonso's "Add to cart") */}
                                            <div className="pt-1">
                                                <div className="w-full py-3.5 px-6 rounded-full bg-white text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider text-center shadow-xl group-hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                                    <span>View Tour Details</span>
                                                    <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
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
