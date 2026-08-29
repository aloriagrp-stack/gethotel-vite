'use client';
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import {
    MapPin, Clock, Star, Hotel, Car, Check, ChevronLeft, ChevronRight,
    Phone, Calendar, Users, ShieldCheck, CheckCircle2, X,
    Sparkles, ArrowRight, Share2, Heart, ShoppingBag, CreditCard,
    ChevronDown, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { packageApi } from "@/lib/api";

// Helper function to generate clean SEO Slugs
export function createPackageSlug(title: string): string {
    if (!title) return "tour-package";
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

const GUEST_OPTIONS = [
    { value: 1, label: "1 Guest", desc: "Solo Traveler" },
    { value: 2, label: "2 Guests", desc: "Couple / Pair" },
    { value: 3, label: "3 Guests", desc: "Triple Sharing" },
    { value: 4, label: "4 Guests", desc: "Family / Group" },
    { value: 5, label: "5+ Guests", desc: "Large Tour Group" }
];

export default function TourPackageDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { langCode } = useLocale();
    const { addToCart, cartItems } = useCart();

    const [packageData, setPackageData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState<string>("");
    const [travelerCount, setTravelerCount] = useState(2);
    const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
    const [travelDate, setTravelDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        return tomorrow.toISOString().split("T")[0];
    });
    const [addedToCartToast, setAddedToCartToast] = useState(false);
    const [showFloatingBar, setShowFloatingBar] = useState(true);
    const [showAllReviewsDrawer, setShowAllReviewsDrawer] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const bookingCardRef = useRef<HTMLDivElement>(null);

    // Dynamic Package Resolution from API
    useEffect(() => {
        const loadPackage = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const cleanId = id.toLowerCase().trim();
            let foundPkg: any = null;

            // 1. Fetch real package from backend API
            try {
                const res = await packageApi.getPackage(id);
                if (res && res.success && res.data) {
                    foundPkg = res.data;
                }
            } catch (err) {
                console.warn("Backend API package detail fetch failed:", err);
            }

            // 2. Search local storage for admin saved packages
            if (!foundPkg) {
                try {
                    const saved = localStorage.getItem("ghs_admin_tour_packages");
                    if (saved) {
                        const localPackages = JSON.parse(saved);
                        foundPkg = localPackages.find(
                            (p: any) => 
                                p.slug === cleanId || 
                                String(p.id) === cleanId || 
                                createPackageSlug(p.title) === cleanId
                        );
                    }
                } catch (e) {
                    console.error("Localstorage search error", e);
                }
            }

            if (foundPkg) {
                setPackageData(foundPkg);
                setSelectedImg(foundPkg.image || foundPkg.gallery?.[0] || "");
            } else {
                setPackageData(null);
            }
            setLoading(false);
        };

        loadPackage();
    }, [id]);

    // Scroll listener: Hide floating bottom bar when booking card is in view!
    useEffect(() => {
        const handleScroll = () => {
            if (bookingCardRef.current) {
                const rect = bookingCardRef.current.getBoundingClientRect();
                const isCardInViewport = rect.top < window.innerHeight && rect.bottom > 0;
                setShowFloatingBar(!isCardInViewport);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsGuestDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider">Loading Package Details...</span>
                </div>
            </div>
        );
    }

    // Handle 404 Package Not Found Empty State
    if (!packageData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
                <SEOHead title="Package Not Found | GetHotelStays" description="Requested tour package could not be found." noIndex />
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-brand-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Tour Package Not Found</h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        The requested package might have been updated, moved, or is no longer listed. Check out our other popular tour packages across India!
                    </p>
                    <Link
                        to="/packages"
                        className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
                    >
                        Explore All Tour Packages
                    </Link>
                </div>
            </div>
        );
    }

    const pkg = packageData;

    // Compute Dynamic Reviews & Rating — only real reviews, no fakes
    const reviewsList = Array.isArray(pkg.reviews) ? pkg.reviews : [];
    const reviewsCount = reviewsList.length;
    const calculatedRating = reviewsList.length > 0
        ? (reviewsList.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
        : (pkg.rating || 0).toFixed(1);

    const totalPrice = (pkg.price || 15000) * travelerCount;

    const handleDirectBookNow = () => {
        if (!user) {
            navigate(`/${langCode}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }

        const queryParams = new URLSearchParams({
            type: "package",
            packageId: pkg.id || "pkg-1",
            title: pkg.title,
            destination: pkg.destination,
            price: pkg.price.toString(),
            totalAmount: totalPrice.toString(),
            travelers: travelerCount.toString(),
            checkIn: travelDate
        }).toString();

        navigate(`/${langCode}/booking?${queryParams}`);
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate(`/${langCode}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }

        addToCart({
            id: pkg.id || "pkg-1",
            type: "package",
            title: pkg.title,
            subtitle: `${pkg.destination} • ${travelerCount} Guest(s)`,
            image: pkg.image,
            price: totalPrice,
            details: {
                packageId: pkg.id || "pkg-1",
                checkIn: travelDate,
                travelers: travelerCount
            }
        });

        const savedWishlist = JSON.parse(localStorage.getItem("ghs_user_wishlist") || "[]");
        if (!savedWishlist.some((item: any) => item.id === pkg.id)) {
            savedWishlist.push({ ...pkg, addedAt: new Date().toISOString() });
            localStorage.setItem("ghs_user_wishlist", JSON.stringify(savedWishlist));
        }
        setAddedToCartToast(true);
        setTimeout(() => setAddedToCartToast(false), 2000);
    };

    const isPkgInCart = cartItems.some(item => item.id === pkg.id);

    const selectedOption = GUEST_OPTIONS.find(o => o.value === travelerCount) || GUEST_OPTIONS[1];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 pb-6">
            <SEOHead
                title={`${pkg.title} Tour Package | Best Deals in ${pkg.destination} | GetHotelStays`}
                description={`Book ${pkg.title} in ${pkg.destination}. Includes ${pkg.duration}, ${pkg.includedStay}, transfers & sightseeing.`}
            />

            {/* Back Navigation Bar */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-40 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Packages</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddToCart}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="Add to Wishlist / Cart"
                        >
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* UNBOXED CLEAN LAYOUT */}
            <div className="max-w-4xl mx-auto px-4 pt-4 space-y-6">
                {/* Hero Gallery with Frosted Left/Right Navigation Arrow Buttons */}
                <div className="space-y-3">
                    <div className="relative h-64 sm:h-96 rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 shadow-md group">
                        <img
                            src={selectedImg}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Cutting-edge ribbon badge at top-left corner */}
                        <div className="absolute top-0 left-0 z-10">
                            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-wider pl-3 pr-4 py-1.5 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)' }}>
                                {pkg.badge || "Bestseller"}
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-slate-950/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{calculatedRating} ({reviewsCount} Reviews)</span>
                        </div>

                        {/* FROSTED LEFT & RIGHT IMAGE NAVIGATION ARROWS */}
                        {pkg.gallery && pkg.gallery.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = pkg.gallery.indexOf(selectedImg);
                                        const prevIndex = (currentIndex - 1 + pkg.gallery.length) % pkg.gallery.length;
                                        setSelectedImg(pkg.gallery[prevIndex]);
                                    }}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 z-20"
                                    title="Previous Image"
                                >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = pkg.gallery.indexOf(selectedImg);
                                        const nextIndex = (currentIndex + 1) % pkg.gallery.length;
                                        setSelectedImg(pkg.gallery[nextIndex]);
                                    }}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 z-20"
                                    title="Next Image"
                                >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {pkg.gallery && pkg.gallery.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {pkg.gallery.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImg(img)}
                                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                        selectedImg === img ? "border-blue-600 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content & Booking Card Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                    {/* Left 2 Columns: Title, Overview, Inclusions, Itinerary */}
                    <div className="lg:col-span-2 space-y-7">
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1">
                                <MapPin className="w-4 h-4" />
                                <span>{pkg.destination}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-950 leading-snug">
                                {pkg.title}
                            </h1>
                        </div>

                        {/* Quick Specs Pills */}
                        <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                            <div className="p-3.5 bg-blue-50/50 rounded-2xl flex items-center gap-3 border border-blue-100/60">
                                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                                    <span className="text-slate-900 font-bold">{pkg.duration}</span>
                                </div>
                            </div>

                            <div className="p-3.5 bg-blue-50/50 rounded-2xl flex items-center gap-3 border border-blue-100/60">
                                <Hotel className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Stay Included</span>
                                    <span className="text-slate-900 font-bold truncate block">{pkg.includedStay || "4-Star Hotel"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Package Overview */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Package Overview</h3>
                            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                                {pkg.overview || "Enjoy a premium holiday experience with luxury stay, sightseeing, and private cab transfers included."}
                            </p>
                        </div>

                        {/* What's Included */}
                        <div className="space-y-3 pt-2">
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                                What's Included In This Package
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {(pkg.inclusions || [
                                    "Verified Hotel Stay with Breakfast",
                                    "Private AC Cab for Sightseeing",
                                    "Airport & Station Pick-up and Drop",
                                    "24x7 Dedicated Travel Support"
                                ]).map((inc: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-800 bg-blue-50/40 p-3 rounded-2xl border border-blue-100/40">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <span>{inc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* What's Excluded */}
                        {Array.isArray(pkg.exclusions) && pkg.exclusions.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                    <X className="w-4.5 h-4.5 text-rose-500" />
                                    What's Excluded
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {pkg.exclusions.map((exc: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-600 bg-rose-50/40 p-3 rounded-2xl border border-rose-100/40">
                                            <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                            <span>{exc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Day-Wise Itinerary */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="w-4.5 h-4.5 text-blue-600" />
                                Day-Wise Itinerary
                            </h3>

                            <div className="space-y-3">
                                {(pkg.itinerary || [
                                    { day: "Day 1", title: "Arrival & Hotel Check-In", desc: "Pickup from airport/station, check-in to resort & evening local tour." },
                                    { day: "Day 2", title: "Full Day Guided Sightseeing", desc: "Explore top tourist spots, monuments, markets, and sunset views." },
                                    { day: "Day 3", title: "Departure & Memories", desc: "Breakfast at hotel and drop transfer for onward journey." }
                                ]).map((day: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-md">
                                                {day.day}
                                            </span>
                                            <h4 className="text-xs font-bold text-slate-900">{day.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium pl-1">{day.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: BOOKING CARD (Hides floating bar when visible) */}
                    <div className="space-y-4" ref={bookingCardRef}>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl sticky top-20 space-y-5">
                            {/* Price Header */}
                            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Package Rate</span>
                                    <div className="flex flex-col mt-0.5">
                                        <span className="text-2xl font-black text-slate-950 leading-tight">₹{pkg.price?.toLocaleString()}</span>
                                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                            <span className="text-xs text-slate-400 line-through font-semibold mt-0.5">₹{pkg.originalPrice?.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-semibold block mt-1">per guest (all taxes incl.)</span>
                                </div>
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-black text-[10px] rounded-lg border border-blue-100">
                                    {pkg.discountPercent || "BEST DEAL"}
                                </span>
                            </div>

                            {/* Booking Controls */}
                            <div className="space-y-4 text-xs font-medium">
                                {/* Custom Travel Date Selector UI — Click Anywhere to Open Picker */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Select Travel Date
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <div className="w-full px-3.5 py-3 bg-slate-50/90 hover:bg-blue-50/50 border border-slate-200 group-hover:border-blue-300 rounded-2xl flex items-center justify-between transition-all shadow-sm">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block font-bold text-slate-900 text-xs">
                                                        {travelDate ? new Date(travelDate).toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) : "Select Date"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Check-in / Departure Date</span>
                                                </div>
                                            </div>
                                            <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                        </div>

                                        <input
                                            type="date"
                                            value={travelDate}
                                            onChange={(e) => setTravelDate(e.target.value)}
                                            onClick={(e: any) => e.target.showPicker?.()}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        />
                                    </div>
                                </div>

                                {/* Custom Animated Dropdown Popover */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Number of Travelers
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                                            className="w-full px-3.5 py-3 bg-slate-50/90 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-900 transition-all cursor-pointer shadow-sm"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                                                    <Users className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block font-bold text-slate-900">{selectedOption.label}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{selectedOption.desc}</span>
                                                </div>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isGuestDropdownOpen ? "rotate-180 text-blue-600" : ""}`} />
                                        </button>

                                        {/* Floating Popover Options Menu */}
                                        <AnimatePresence>
                                            {isGuestDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-1 space-y-1"
                                                >
                                                    {GUEST_OPTIONS.map((opt) => {
                                                        const isSelected = travelerCount === opt.value;
                                                        const optTotal = (pkg.price || 15000) * opt.value;
                                                        return (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    setTravelerCount(opt.value);
                                                                    setIsGuestDropdownOpen(false);
                                                                }}
                                                                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left ${
                                                                    isSelected
                                                                        ? "bg-blue-600 text-white font-bold"
                                                                        : "hover:bg-slate-100 text-slate-700 font-medium"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {isSelected ? (
                                                                        <Check className="w-4 h-4 text-white shrink-0" />
                                                                    ) : (
                                                                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                                                                    )}
                                                                    <div>
                                                                        <span className="block text-xs">{opt.label}</span>
                                                                        <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                                                                            {opt.desc}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                                                                    ₹{optTotal.toLocaleString()}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Dynamic Price Calculation Summary */}
                                <div className="p-3.5 bg-slate-50/90 rounded-2xl space-y-1.5 border border-slate-100">
                                    <div className="flex justify-between text-slate-600 text-xs">
                                        <span>₹{pkg.price?.toLocaleString()} × {travelerCount} Guest(s)</span>
                                        <span>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-slate-200">
                                        <span className="text-slate-800">Total Amount</span>
                                        <span className="text-sm font-black text-blue-600">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* BUTTONS */}
                                <div className="space-y-2.5 pt-2">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`w-full py-3.5 border text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer shadow-md text-center flex items-center justify-center ${
                                            isPkgInCart
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/30"
                                                : "bg-brand-600 hover:bg-brand-700 text-white border-white/30 shadow-brand-600/30"
                                        }`}
                                    >
                                        <span>{isPkgInCart ? "✓ ADDED TO CART" : "ADD TO CART"}</span>
                                    </button>

                                    <button
                                        onClick={handleDirectBookNow}
                                        className="relative group w-full py-3.5 bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-brand-600 hover:border-brand-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] overflow-hidden text-center"
                                    >
                                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                                        <span>BOOK NOW</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GUEST REVIEWS & RATINGS SECTION — Placed Below Booking Card & Price Section, Above Thank You Note */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                                Guest Reviews & Ratings
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {reviewsCount} verified traveler reviews for this package
                            </p>
                        </div>
                        {/* Minimal Rating Text (No Heavy Background Card) */}
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{calculatedRating} / 5.0</span>
                        </div>
                    </div>

                    {/* Show Reviews or Empty State */}
                    {reviewsList.length === 0 ? (
                        <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-xs">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">No Reviews Yet</h4>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                                Be the first verified traveler to experience this package and leave a review!
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {reviewsList.slice(0, 2).map((rev: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50/70 rounded-2xl space-y-1.5 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center">
                                                    {rev.name.charAt(0)}
                                                </span>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 block">{rev.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-slate-800">⭐ {rev.rating}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium pl-9 leading-relaxed">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Minimal View All Reviews Button */}
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAllReviewsDrawer(true)}
                                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <span>View All Reviews ({reviewsCount})</span>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* MINIMAL CLEAN UNBOXED THANK YOU NOTE — Positioned Below Reviews */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-1 text-slate-900 pb-0">
                    <h3 className="text-sm md:text-base font-bold text-slate-950 tracking-tight">
                        Thank You for choosing GetHotelStays!
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-500 font-medium">
                        Your trusted travel partner for handpicked holiday packages across India.
                    </p>
                </div>
            </div>

            {/* BOTTOM SHEET DRAWER FOR ALL REVIEWS */}
            <AnimatePresence>
                {showAllReviewsDrawer && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAllReviewsDrawer(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />

                        {/* Bottom Sheet Container */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 280 }}
                            className="relative w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl p-6 z-10 max-h-[85vh] flex flex-col"
                        >
                            {/* Drag Handle & Header */}
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">
                                        Verified Traveler Reviews ({reviewsCount})
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-0.5">
                                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                                        <span>{calculatedRating} / 5.0 Average Rating</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAllReviewsDrawer(false)}
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Reviews List */}
                            <div className="overflow-y-auto py-4 space-y-3 pr-1">
                                {reviewsList.map((rev: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center">
                                                    {rev.name.charAt(0)}
                                                </span>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 block">{rev.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-slate-800">⭐ {rev.rating}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium pl-10 leading-relaxed">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* STICKY BOTTOM FLOATING PRICE BAR (Only shown when scrolling top/reading content, hides when booking card is in view!) */}
            <AnimatePresence>
                {showFloatingBar && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-3 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]"
                    >
                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Rate ({travelerCount} Guests)</span>
                                <span className="text-base sm:text-lg font-black text-brand-600">₹{totalPrice.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className={`py-2.5 px-5 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center ${
                                    isPkgInCart
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "bg-brand-600 hover:bg-brand-700 text-white"
                                }`}
                            >
                                <span>{isPkgInCart ? "✓ ADDED TO CART" : "ADD TO CART"}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
