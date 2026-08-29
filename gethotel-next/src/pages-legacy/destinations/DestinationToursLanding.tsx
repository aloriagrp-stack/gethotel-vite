'use client';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import { useLocale } from "@/context/LocaleContext";
import {
    MapPin, Clock, Star, ArrowRight, Heart,
    Image as ImageIcon, ArrowLeft, Sparkles, Filter
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

    // Extract destination identifier (e.g. "agra-tours" -> "Agra" or "delhi-tours" -> "Delhi")
    const rawSlug = (params.slug || params.id || "delhi-tours").toLowerCase();
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

            {/* CLEAN COMPACT TOP HEADER */}
            <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
                    <Link
                        to={`/${langCode}/packages`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors py-1 px-2.5 rounded-xl hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>All Packages</span>
                    </Link>

                    <div className="text-center">
                        <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {cityName} Tour Packages
                        </h1>
                    </div>

                    <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-[11px] font-black rounded-lg border border-brand-100">
                        {destinationPackages.length} Tours
                    </span>
                </div>

                {/* DESTINATION QUICK-SWITCH BAR */}
                <div className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto no-scrollbar py-2.5 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 max-w-7xl mx-auto">
                        <Link
                            to={`/${langCode}/packages`}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            All Cities
                        </Link>
                        {DESTINATIONS_LIST.map((dest) => {
                            const isCurrent = dest.name.toLowerCase() === cityName.toLowerCase();
                            return (
                                <Link
                                    key={dest.slug}
                                    to={`/${langCode}/packages/${dest.slug}`}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                                        isCurrent
                                            ? "bg-brand-600 text-white shadow-sm font-extrabold"
                                            : "bg-white border border-slate-200/80 text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
                                    }`}
                                >
                                    <span>{dest.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                {/* SUB HEADER & FILTER PILLS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Handcrafted {cityName} Circuits</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Private AC vehicle transfers, heritage stays & monument sightseeing
                        </p>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {["All", "Bestseller", "Top Rated", "Popular"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedFilterTag(tag)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {destinationPackages.map((pkg) => {
                            const packageSlug = pkg.slug || createPackageSlug(pkg.title);
                            const photosList = Array.isArray(pkg.gallery) && pkg.gallery.length > 0
                                ? pkg.gallery
                                : [pkg.image || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"];

                            const activeImgIdx = activeImageIndices[pkg.id] || 0;
                            const displayImg = photosList[activeImgIdx] || photosList[0];
                            const isWishlisted = Boolean(wishlist[pkg.id]);

                            return (
                                <Link
                                    key={pkg.id}
                                    to={`/${langCode}/packages/${packageSlug}`}
                                    className="group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] border border-slate-200/60 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between bg-slate-950 cursor-pointer"
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

                                    {/* Header Badges & Rating */}
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

                                    {/* Bottom Info Glass Card */}
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
