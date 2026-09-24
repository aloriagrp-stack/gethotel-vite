'use client';
import React, { useState, useEffect, useRef, useId } from "react";
import { useParams, useNavigate, Link, useLocation } from "@/lib/navigation";
import SEOHead from "@/components/common/SEOHead";
import {
    MapPin, Clock, Star, Hotel, Car, Check, ChevronLeft, ChevronRight,
    Calendar, Users, ShieldCheck, CheckCircle2, X,
    Sparkles, Share2, Heart, ShoppingBag, CreditCard,
    ChevronDown, ChevronUp, Compass, HelpCircle, Shield,
    PhoneCall, Utensils, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { packageApi } from "@/lib/api";
import DestinationToursLanding from "./destinations/DestinationToursLanding";

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

// Authentic 3D Dark Blue Diagonal Corner Ribbon Badge (Matches reference ribbon banner)
export function CornerRibbonBadge({ text = "Best Seller" }: { text?: string }) {
    const rawId = useId();
    const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
    const gradientId = `darkBlueCornerRibbon-${id}`;
    const shadowId = `cornerRibbonShadow-${id}`;

    // Normalize: "bestseller" / "BESTSELLER" -> "Best Seller"
    const lower = (text || "").toLowerCase().trim();
    const formattedText = lower === "bestseller" ? "Best Seller" : text || "Best Seller";

    // Adjust font size dynamically based on length
    const fontSize = formattedText.length > 15 ? 6 : formattedText.length > 11 ? 7.2 : 8.5;

    return (
        <svg
            viewBox="0 0 100 100"
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 select-none pointer-events-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0a1845" />
                    <stop offset="25%" stopColor="#102f78" />
                    <stop offset="50%" stopColor="#184399" />
                    <stop offset="75%" stopColor="#102f78" />
                    <stop offset="100%" stopColor="#0a1845" />
                </linearGradient>
                <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.45" />
                </filter>
            </defs>

            {/* Top Dark Fold Flap */}
            <polygon points="85,0 98,0 100,6 80,12" fill="#050e29" />

            {/* Bottom Dark Fold Flap */}
            <polygon points="0,85 0,98 6,100 12,80" fill="#050e29" />

            {/* Main Diagonal Ribbon Body */}
            <polygon
                points="0,54 54,0 85,0 80,12 12,80 0,85"
                fill={`url(#${gradientId})`}
                filter={`url(#${shadowId})`}
            />

            {/* Clean White Bold Ribbon Text at 45 degree angle */}
            <text
                x="36"
                y="37"
                textAnchor="middle"
                dominantBaseline="central"
                transform="rotate(-45 36 37)"
                fill="#ffffff"
                fontSize={fontSize}
                fontWeight="900"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                letterSpacing="0.3"
            >
                {formattedText}
            </text>
        </svg>
    );
}

export default function TourPackageDetails() {
    const navParams = useParams<{ id?: string }>();
    const location = useLocation();

    // ─── DYNAMIC PACKAGE ID / SLUG RESOLUTION ────────────────────────────────
    // In statically exported Next.js, static routes hydrate with default params (e.g. '1').
    // We prioritize the actual browser pathname over static param '1'.
    let extracted = '';
    if (typeof window !== 'undefined') {
        const currentPath = (location?.pathname || window.location.pathname || '').replace(/\/+$/, '');
        const match = currentPath.match(/\/(?:tour-packages|packages|package)\/([^\/\?]+)/i);
        if (match && match[1]) {
            extracted = match[1];
        }
    }

    if (!extracted || extracted === '1') {
        if (typeof navParams?.id === 'string' && navParams.id && navParams.id !== '1') {
            extracted = navParams.id;
        }
    }

    if ((!extracted || extracted === '1') && typeof window !== 'undefined') {
        const segments = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
        const last = segments[segments.length - 1];
        if (last && !['packages', 'tour-packages', 'package'].includes(last)) {
            extracted = last;
        }
    }

    const id = extracted ? decodeURIComponent(extracted).trim() : (typeof navParams?.id === 'string' ? navParams.id : '');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { langCode } = useLocale();
    const { addToCart, cartItems } = useCart();

    const cleanId = (id || "").toLowerCase().trim();
    // Known city destination landing hubs (only redirect if explicitly matching a known city hub)
    const KNOWN_DEST_HUBS = new Set([
        "delhi-tours", "agra-tours", "jaipur-tours", "udaipur-tours", "jodhpur-tours",
        "jaisalmer-tours", "ranthambore-tours", "mount-abu-tours", "bikaner-tours",
        "rajasthan-tours", "goa-tours", "kashmir-tours", "manali-tours", "kerala-tours", "ladakh-tours"
    ]);
    const isDestinationRoute = KNOWN_DEST_HUBS.has(cleanId) || cleanId.startsWith("destinations/");

    if (isDestinationRoute) {
        return <DestinationToursLanding />;
    }

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
    const [copiedToast, setCopiedToast] = useState(false);
    const [showFloatingBar, setShowFloatingBar] = useState(true);
    const [showAllReviewsDrawer, setShowAllReviewsDrawer] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [photoModalIndex, setPhotoModalIndex] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
            const slugify = (s: string) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const targetSlug = slugify(cleanId);
            let foundPkg: any = null;

            // 1. Fetch real package from backend API by ID or Slug
            try {
                const res = await packageApi.getPackage(cleanId);
                if (res && res.success && res.data) {
                    foundPkg = res.data;
                }
            } catch (err) {
                console.warn("Backend API direct fetch failed, attempting list lookup:", err);
            }

            // 2. Fallback: Search all active tour packages from API
            if (!foundPkg) {
                try {
                    const listRes = await packageApi.getPackages();
                    if (listRes && listRes.success && Array.isArray(listRes.data)) {
                        foundPkg = listRes.data.find((p: any) => {
                            if (!p) return false;
                            const pSlug = slugify(p.slug || '');
                            const pTitleSlug = slugify(p.title || '');
                            const pId = String(p.id || '').trim();
                            return (
                                pId === cleanId ||
                                pSlug === targetSlug ||
                                pTitleSlug === targetSlug ||
                                (p.slug && p.slug.toLowerCase().trim() === cleanId) ||
                                (p.title && createPackageSlug(p.title) === cleanId)
                            );
                        });
                    }
                } catch (err) {
                    console.warn("Backend API packages list fallback failed:", err);
                }
            }

            // 3. Fallback: Search local storage for admin saved packages
            if (!foundPkg) {
                try {
                    const saved = localStorage.getItem("ghs_admin_tour_packages");
                    if (saved) {
                        const localPackages = JSON.parse(saved);
                        foundPkg = localPackages.find(
                            (p: any) => 
                                String(p.id) === cleanId ||
                                slugify(p.slug || '') === targetSlug ||
                                slugify(p.title || '') === targetSlug ||
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

    // Gather all unique photos for the package
    const allPhotos: string[] = [];
    if (pkg.image) allPhotos.push(pkg.image);
    if (Array.isArray(pkg.gallery)) {
        pkg.gallery.forEach((g: string) => {
            if (g && !allPhotos.includes(g)) {
                allPhotos.push(g);
            }
        });
    }
    if (allPhotos.length === 0) {
        allPhotos.push("/images/default-tour.jpg");
    }

    // Compute Dynamic Reviews & Rating — only real reviews, no fakes
    const reviewsList = Array.isArray(pkg.reviews) ? pkg.reviews : [];
    const reviewsCount = reviewsList.length;
    const calculatedRating = reviewsList.length > 0
        ? (reviewsList.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
        : (pkg.rating || 4.9).toFixed(1);

    const totalPrice = (pkg.price || 15000) * travelerCount;
    const originalTotalPrice = (pkg.originalPrice || (pkg.price * 1.5)) * travelerCount;
    const totalSavings = originalTotalPrice - totalPrice;

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

    const handleShare = () => {
        if (typeof window !== "undefined") {
            if (navigator.share) {
                navigator.share({
                    title: pkg.title,
                    text: `Check out this tour package: ${pkg.title}`,
                    url: window.location.href
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(window.location.href);
                setCopiedToast(true);
                setTimeout(() => setCopiedToast(false), 2000);
            }
        }
    };

    const isPkgInCart = cartItems.some(item => item.id === pkg.id);
    const selectedOption = GUEST_OPTIONS.find(o => o.value === travelerCount) || GUEST_OPTIONS[1];

    const faqs = [
        {
            q: "Can I customize the hotels or duration of this package?",
            a: "Yes, absolutely! Our holiday specialists can upgrade hotels, add extra days, or adjust sightseeing routes according to your personal preferences."
        },
        {
            q: "Is airport or railway station pickup and drop included?",
            a: "Yes! Your private AC cab will pick you up directly from your arrival point (airport/railway station) and drop you off upon trip completion."
        },
        {
            q: "What is the cancellation and refund policy?",
            a: "We offer flexible cancellation policies. Bookings cancelled 72 hours prior to departure are eligible for a 100% full refund with zero cancellation charges."
        },
        {
            q: "Are entry monument tickets included in this price?",
            a: "Monument entry tickets and guide fees are directly payable at the monuments to give you complete freedom on what you wish to explore."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-12">
            <SEOHead
                title={`${pkg.title} Tour Package | Best Deals in ${pkg.destination} | GetHotelStays`}
                description={`Book ${pkg.title} in ${pkg.destination}. Includes ${pkg.duration}, ${pkg.includedStay}, transfers & sightseeing.`}
            />

            {/* Back Navigation & Breadcrumbs Bar */}
            <div className="bg-white border-b border-slate-100 relative z-30 px-4 py-3">
                <div className="max-w-4xl lg:max-w-7xl xl:max-w-[1380px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer py-1 px-2.5 rounded-xl hover:bg-slate-100"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Packages</span>
                        </button>
                        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400 pl-3 border-l border-slate-200">
                            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                            <span>/</span>
                            <Link to="/packages" className="hover:text-blue-600 transition-colors">Tour Packages</Link>
                            <span>/</span>
                            <span className="text-slate-600 font-bold">{pkg.destination}</span>
                            <span>/</span>
                            <span className="text-slate-900 font-bold truncate max-w-sm">{pkg.title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-xs font-bold"
                            title="Share this package"
                        >
                            <Share2 className="w-4 h-4 text-slate-600" />
                            <span className="hidden sm:inline">{copiedToast ? "Copied Link!" : "Share"}</span>
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className={`p-2 sm:px-3 sm:py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                                isPkgInCart ? "bg-rose-50 text-rose-600" : "hover:bg-slate-100 text-slate-600"
                            }`}
                            title="Add to Wishlist / Cart"
                        >
                            <Heart className={`w-4 h-4 text-rose-500 ${isPkgInCart ? "fill-rose-500" : ""}`} />
                            <span className="hidden sm:inline text-xs font-bold">{isPkgInCart ? "Saved" : "Save"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTAINER */}
            <div className="max-w-4xl lg:max-w-7xl xl:max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 lg:pt-6 space-y-6 lg:space-y-8">
                
                {/* ─── DESKTOP EXCLUSIVE TITLE & OVERVIEW HEADER ──────────────────────── */}
                <div className="hidden lg:block space-y-3 pb-1">
                    <div className="flex items-start justify-between gap-6">
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-wider rounded-lg border border-blue-100 flex items-center gap-1.5 shadow-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                    {pkg.badge || "Verified Tour Package"}
                                </span>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-100 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Instant Confirmation
                                </span>
                                {pkg.discountPercent && (
                                    <span className="px-3 py-1 bg-rose-50 text-rose-700 font-black text-xs uppercase tracking-wider rounded-lg border border-rose-100">
                                        Special {pkg.discountPercent} OFF
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5">
                                    <Car className="w-3.5 h-3.5 text-slate-600" />
                                    Private AC Cab Included
                                </span>
                            </div>

                            <h1 className="text-3xl xl:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                                {pkg.title}
                            </h1>

                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-0.5">
                                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span>{calculatedRating}</span>
                                    <span className="text-slate-400 font-normal">({reviewsCount} reviews)</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                                    <MapPin className="w-4 h-4" />
                                    <span>{pkg.destination}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    <span>{pkg.duration}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                    <Hotel className="w-4 h-4 text-emerald-600" />
                                    <span>{pkg.includedStay || "Hotel Stay Included"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden xl:flex flex-col items-end gap-1.5 shrink-0 pt-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Need Custom Tour Package?</span>
                            <a
                                href="tel:+919999999999"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors border border-blue-200"
                            >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>Call Tour Specialist</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* ─── MOBILE PHOTO GALLERY (UNCHANGED) ─────────────────────────────── */}
                <div className="lg:hidden space-y-3">
                    <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
                        <img
                            src={selectedImg}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Authentic 3D Dark Blue Corner Ribbon Badge */}
                        <div className="absolute top-0 left-0 z-20 pointer-events-none">
                            <CornerRibbonBadge text={pkg.badge || "Best Seller"} />
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

                {/* ─── DESKTOP PHOTO MOSAIC GALLERY ─────────────────────────────────── */}
                <div className="hidden lg:block">
                    {allPhotos.length >= 5 ? (
                        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[460px] xl:h-[500px] rounded-3xl overflow-hidden relative group">
                            {/* Main Featured Photo (Left: 2 cols x 2 rows) */}
                            <div
                                onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}
                                className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden bg-slate-900 group/main"
                            >
                                <img
                                    src={allPhotos[0]}
                                    alt={pkg.title}
                                    className="w-full h-full object-cover group-hover/main:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/main:opacity-100 transition-opacity" />
                                <div className="absolute top-0 left-0 z-20 pointer-events-none">
                                    <CornerRibbonBadge text={pkg.badge || "Best Seller"} />
                                </div>
                            </div>

                            {/* Secondary Photos (Right 2x2 Grid) */}
                            {allPhotos.slice(1, 5).map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => { setPhotoModalIndex(idx + 1); setIsPhotoModalOpen(true); }}
                                    className="col-span-1 row-span-1 relative cursor-pointer overflow-hidden bg-slate-900 group/sub"
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        className="w-full h-full object-cover group-hover/sub:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover/sub:bg-black/0 transition-colors" />
                                </div>
                            ))}

                            {/* Floating 'View All Photos' button */}
                            <button
                                type="button"
                                onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}
                                className="absolute bottom-5 right-5 z-20 px-4 py-2.5 bg-slate-950/80 hover:bg-slate-950 backdrop-blur-md text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xl border border-white/20 transition-all hover:scale-105 cursor-pointer"
                            >
                                <ShoppingBag className="w-4 h-4 text-blue-400" />
                                <span>Show all {allPhotos.length} photos</span>
                            </button>
                        </div>
                    ) : allPhotos.length >= 2 ? (
                        <div className="grid grid-cols-2 gap-3 h-[460px] xl:h-[500px] rounded-3xl overflow-hidden relative">
                            {allPhotos.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => { setPhotoModalIndex(idx); setIsPhotoModalOpen(true); }}
                                    className="relative cursor-pointer overflow-hidden bg-slate-900 group/dual"
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        className="w-full h-full object-cover group-hover/dual:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    {idx === 0 && (
                                        <div className="absolute top-0 left-0 z-20 pointer-events-none">
                                            <CornerRibbonBadge text={pkg.badge || "Best Seller"} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}
                            className="relative h-[460px] xl:h-[500px] rounded-3xl overflow-hidden cursor-pointer bg-slate-900 group/single"
                        >
                            <img
                                src={allPhotos[0] || selectedImg}
                                alt={pkg.title}
                                className="w-full h-full object-cover group-hover/single:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute top-0 left-0 z-20 pointer-events-none">
                                <CornerRibbonBadge text={pkg.badge || "Best Seller"} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── 2-COLUMN MAIN CONTENT & BOOKING GRID ──────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2 relative">
                    
                    {/* LEFT COLUMN (lg:col-span-8): Overview, Inclusions, Itinerary, Reviews */}
                    <div className="lg:col-span-8 space-y-8 lg:space-y-10">
                        
                        {/* Mobile Title Block (Kept untouched for mobile only) */}
                        <div className="lg:hidden">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1">
                                <MapPin className="w-4 h-4" />
                                <span>{pkg.destination}</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-950 leading-snug">
                                {pkg.title}
                            </h1>
                        </div>

                        {/* Mobile Quick Specs Pills (Kept untouched for mobile) */}
                        <div className="grid grid-cols-2 gap-3 text-xs font-semibold lg:hidden">
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

                        {/* DESKTOP EXCLUSIVE: Key Highlights Bento Grid (4 Cards) */}
                        <div className="hidden lg:grid grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                                    <span className="text-sm font-black text-slate-900 block">{pkg.duration}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Guided Sightseeing</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <Hotel className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stay Included</span>
                                    <span className="text-sm font-black text-slate-900 truncate block">{pkg.includedStay || "4-Star Hotel"}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Handpicked Stays</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Car className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Private Cab</span>
                                    <span className="text-sm font-black text-slate-900 block">Dedicated AC Cab</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Driver, Tolls & Fuel Incl.</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meal Plan</span>
                                    <span className="text-sm font-black text-slate-900 block">Daily Breakfast</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Complimentary Dining</span>
                                </div>
                            </div>
                        </div>

                        {/* DESKTOP EXCLUSIVE: Key Tour Assurance Strip */}
                        <div className="hidden lg:flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 rounded-2xl border border-blue-100 text-xs font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span>Instant Confirmation Voucher</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>100% Sanitized & Verified Fleet</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>Best Price Guarantee</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-2">
                                <PhoneCall className="w-4 h-4 text-indigo-600" />
                                <span>24x7 Trip Concierge</span>
                            </div>
                        </div>

                        {/* Package Overview */}
                        <div className="space-y-3 bg-white p-6 lg:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                    <Compass className="w-4.5 h-4.5 text-blue-600" />
                                    Package Story & Overview
                                </h3>
                                <span className="hidden sm:inline-block text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                    {pkg.destination} Getaway
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-normal">
                                {pkg.overview || "Enjoy a premium holiday experience with luxury stay, sightseeing, and private cab transfers included. From breathtaking panoramic viewpoints to rich cultural heritage and local delicacies, this handcrafted itinerary offers seamless comfort throughout your journey."}
                            </p>

                            {/* Aesthetic Tag Pills */}
                            <div className="flex items-center gap-2 flex-wrap pt-2">
                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">#HeritageTour</span>
                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">#PrivateCabSightseeing</span>
                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">#FamilyFriendly</span>
                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">#CoupleSpecial</span>
                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">#AllInclusive</span>
                            </div>
                        </div>

                        {/* What's Included & What's Excluded Dual Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* What's Included */}
                            <div className="space-y-4 bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100 shadow-xs">
                                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                                    What's Included In This Package
                                </h3>
                                <ul className="space-y-2.5">
                                    {(pkg.inclusions || [
                                        "Verified Hotel Stay with Complimentary Breakfast",
                                        "Dedicated Private AC Cab for Sightseeing",
                                        "Airport & Railway Station Pick-up and Drop transfers",
                                        "Toll Taxes, Parking, Driver Allowance & Fuel Included",
                                        "24x7 Dedicated Travel Concierge & On-Trip Support"
                                    ]).map((inc: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800 bg-white/80 p-3 rounded-2xl border border-emerald-100/60 shadow-xs">
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span>{inc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* What's Excluded */}
                            <div className="space-y-4 bg-rose-50/20 p-6 rounded-3xl border border-rose-100 shadow-xs">
                                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                    <X className="w-4.5 h-4.5 text-rose-500" />
                                    What's Excluded
                                </h3>
                                <ul className="space-y-2.5">
                                    {(pkg.exclusions && pkg.exclusions.length > 0 ? pkg.exclusions : [
                                        "Airfare or Train Tickets (Available upon request)",
                                        "Monument Entrance Fees & Camera Charges",
                                        "Personal Expenses, Laundry, Telephone & Room Service",
                                        "Any optional excursions or water sports not specified"
                                    ]).map((exc: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-600 bg-white/80 p-3 rounded-2xl border border-rose-100/50 shadow-xs">
                                            <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                            <span>{exc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Day-Wise Itinerary (Luxury Interactive Timeline) */}
                        <div className="space-y-4 bg-white p-6 lg:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-4.5 h-4.5 text-blue-600" />
                                    Day-Wise Detailed Itinerary
                                </h3>
                                <span className="text-xs font-bold text-slate-500">
                                    {pkg.duration} Complete Experience
                                </span>
                            </div>

                            {/* Timeline layout */}
                            <div className="relative pl-6 space-y-6 pt-2 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-blue-100">
                                {(pkg.itinerary || [
                                    { day: "Day 1", title: "Arrival & Hotel Check-In", desc: "Pickup from airport/railway station by private chauffeur. Check-in to your verified hotel resort, relax and enjoy evening local market sightseeing & sunset views." },
                                    { day: "Day 2", title: "Full Day Guided Sightseeing", desc: "Enjoy lavish breakfast at the hotel followed by a comprehensive guided tour of major monuments, historic landmarks, viewpoint photostops, and authentic regional dining." },
                                    { day: "Day 3", title: "Departure & Sweet Memories", desc: "Morning breakfast, check out from the hotel, and seamless transfer back to airport/railway station for your onward return journey." }
                                ]).map((day: any, idx: number) => (
                                    <div key={idx} className="relative group">
                                        {/* Circular Dot Indicator */}
                                        <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shadow-md ring-4 ring-white">
                                            {idx + 1}
                                        </div>

                                        <div className="p-4 sm:p-5 bg-slate-50/90 group-hover:bg-blue-50/30 rounded-2xl border border-slate-200/80 group-hover:border-blue-200 transition-all space-y-2">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-md tracking-wider">
                                                        {day.day}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-slate-900">{day.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                    <Car className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Private Cab Included</span>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                                {day.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Accommodations & Private Cab Fleet Specifications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                    <Hotel className="w-5 h-5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">Verified Luxury Accommodations</h4>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Handpicked properties rated 4.0+ stars. Equipped with modern air-conditioning, clean en-suite bathrooms, complimentary high-speed Wi-Fi, and daily hot breakfast.
                                </p>
                            </div>

                            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    <Car className="w-5 h-5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">Dedicated AC Sedan / SUV</h4>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Sanitized private vehicle with commercial taxi permit and seasoned local driver. All fuel, parking charges, interstate road taxes, and driver night allowances are fully pre-paid.
                                </p>
                            </div>
                        </div>

                        {/* GUEST REVIEWS & RATINGS SECTION */}
                        <div className="space-y-4 bg-white p-6 lg:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                                        Verified Traveler Reviews
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {reviewsCount} verified traveler reviews for this package
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {reviewsList.slice(0, 4).map((rev: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-slate-50/70 rounded-2xl space-y-2 border border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center">
                                                            {rev.name?.charAt(0) || "U"}
                                                        </span>
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-900 block">{rev.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-800">⭐ {rev.rating}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                                    "{rev.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {reviewsCount > 4 && (
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowAllReviewsDrawer(true)}
                                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <span>View All {reviewsCount} Reviews</span>
                                                <ChevronDown className="w-4 h-4 text-slate-500" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Frequently Asked Questions Accordion */}
                        <div className="space-y-3 bg-white p-6 lg:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                                <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-2.5 pt-1">
                                {faqs.map((faq, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-slate-200/80 rounded-2xl overflow-hidden transition-colors"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                            className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50/50 cursor-pointer"
                                        >
                                            <span>{faq.q}</span>
                                            {openFaqIndex === idx ? (
                                                <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                            )}
                                        </button>
                                        {openFaqIndex === idx && (
                                            <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (lg:col-span-4): Sticky Booking Card (Hook that follows user smoothly on scroll) */}
                    <div className="lg:col-span-4 relative self-stretch" ref={bookingCardRef}>
                        <div className="lg:sticky lg:top-24 z-30 space-y-4">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl space-y-5 p-6 lg:p-7 relative overflow-hidden">
                            {/* Top Accent Gradient Line */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 absolute top-0 left-0 right-0" />

                            {/* Price Header */}
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4 pt-1">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Package Price</span>
                                    <div className="flex items-baseline gap-2 mt-0.5">
                                        <span className="text-3xl font-black text-slate-950 leading-tight">₹{pkg.price?.toLocaleString()}</span>
                                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                            <span className="text-sm text-slate-400 line-through font-semibold">₹{pkg.originalPrice?.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-semibold block mt-1">per guest • All taxes & driver incl.</span>
                                </div>
                                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-black text-[10px] uppercase rounded-lg border border-rose-100 shadow-xs">
                                    {pkg.discountPercent || "50% OFF"}
                                </span>
                            </div>

                            {/* Booking Controls */}
                            <div className="space-y-4 text-xs font-medium">
                                {/* Travel Date Selector */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Select Travel Date
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <div className="w-full px-3.5 py-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 group-hover:border-blue-300 rounded-2xl flex items-center justify-between transition-all shadow-xs">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block font-bold text-slate-900 text-xs">
                                                        {travelDate ? new Date(travelDate).toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) : "Select Date"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Departure / Check-in</span>
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

                                {/* Custom Animated Dropdown Popover for Travelers */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Number of Travelers
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                                            className="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-900 transition-all cursor-pointer shadow-xs"
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
                                <div className="p-4 bg-slate-50/90 rounded-2xl space-y-2 border border-slate-100">
                                    <div className="flex justify-between text-slate-600 text-xs">
                                        <span>₹{pkg.price?.toLocaleString()} × {travelerCount} Guest(s)</span>
                                        <span className="font-semibold text-slate-800">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 text-xs">
                                        <span>Taxes, Tolls & Driver Fee</span>
                                        <span className="font-bold text-emerald-600">INCLUDED</span>
                                    </div>
                                    {totalSavings > 0 && (
                                        <div className="flex justify-between text-xs text-rose-600 font-bold">
                                            <span>Your Savings</span>
                                            <span>- ₹{totalSavings.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-xs pt-2 border-t border-slate-200">
                                        <span className="text-slate-800 text-sm">Total Payable</span>
                                        <span className="text-lg font-black text-blue-600">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="space-y-2.5 pt-2">
                                    <button
                                        onClick={handleDirectBookNow}
                                        className="relative group w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] overflow-hidden text-center flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4 text-white" />
                                        <span>BOOK TOUR PACKAGE NOW</span>
                                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                                    </button>

                                    <button
                                        onClick={handleAddToCart}
                                        className={`w-full py-3.5 border text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5 ${
                                            isPkgInCart
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/20"
                                                : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
                                        }`}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>{isPkgInCart ? "✓ ADDED TO CART" : "ADD TO CART"}</span>
                                    </button>
                                </div>

                                {/* Trust & Guarantee Badges */}
                                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
                                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>100% Safe & Secure Checkout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span>Instant booking voucher via email & WhatsApp</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span>Clean, verified hotels & dedicated private AC cab</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                {/* Minimal Clean Thank You Note */}
                <div className="mt-8 pt-8 border-t border-slate-200 text-center space-y-1 text-slate-900 pb-0">
                    <h3 className="text-base font-bold text-slate-950 tracking-tight">
                        Thank You for choosing GetHotelStays!
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                        Your trusted travel partner for handpicked holiday packages across India.
                    </p>
                </div>
            </div>

            {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
            <AnimatePresence>
                {isPhotoModalOpen && (
                    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between text-white z-10">
                            <span className="text-sm font-bold tracking-wider">
                                {photoModalIndex + 1} / {allPhotos.length} Photos
                            </span>
                            <button
                                onClick={() => setIsPhotoModalOpen(false)}
                                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Main Image with Navigation Arrows */}
                        <div className="relative flex-1 flex items-center justify-center max-h-[80vh] my-auto">
                            <img
                                src={allPhotos[photoModalIndex]}
                                alt=""
                                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                            />

                            {allPhotos.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setPhotoModalIndex((photoModalIndex - 1 + allPhotos.length) % allPhotos.length)}
                                        className="absolute left-2 md:left-6 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110"
                                        title="Previous Photo"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setPhotoModalIndex((photoModalIndex + 1) % allPhotos.length)}
                                        className="absolute right-2 md:right-6 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110"
                                        title="Next Photo"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Bottom Thumbnail Strip */}
                        {allPhotos.length > 1 && (
                            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 no-scrollbar">
                                {allPhotos.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPhotoModalIndex(idx)}
                                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                                            photoModalIndex === idx ? "border-blue-500 scale-110" : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </AnimatePresence>

            {/* BOTTOM SHEET DRAWER FOR ALL REVIEWS */}
            <AnimatePresence>
                {showAllReviewsDrawer && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAllReviewsDrawer(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 280 }}
                            className="relative w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl p-6 z-10 max-h-[85vh] flex flex-col"
                        >
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

                            <div className="overflow-y-auto py-4 space-y-3 pr-1">
                                {reviewsList.map((rev: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center">
                                                    {rev.name?.charAt(0) || "U"}
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

            {/* STICKY BOTTOM FLOATING PRICE BAR (MOBILE ONLY - Hidden on Desktop to keep desktop clean) */}
            <AnimatePresence>
                {showFloatingBar && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-3 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] lg:hidden"
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
