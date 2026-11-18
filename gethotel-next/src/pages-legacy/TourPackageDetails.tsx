'use client';
import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "@/lib/navigation";
import SEOHead from "@/components/common/SEOHead";
import {
    MapPin, Clock, Star, Hotel, Car, Check, ChevronLeft, ChevronRight,
    Calendar, Users, ShieldCheck, CheckCircle2, X,
    Sparkles, Share2, Heart, Camera, CreditCard,
    ChevronDown, ChevronUp, Compass, HelpCircle, Shield,
    PhoneCall, Utensils, Award, ExternalLink, Globe, Ticket,
    CheckCircle, MessageCircle
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

export function cleanTourText(item: any): string {
    if (!item) return "";
    if (typeof item === "object") {
        return item.otherDescription || item.description || item.categoryDescription || "";
    }
    if (typeof item === "string") {
        const m = item.match(/'otherDescription':\s*'([^']+)'/) || item.match(/"otherDescription":\s*"([^"]+)"/);
        if (m) return m[1];
        const m2 = item.match(/'description':\s*'([^']+)'/) || item.match(/"description":\s*"([^"]+)"/);
        if (m2) return m2[1];
        if (item.trim().startsWith('{') && item.trim().endsWith('}')) {
            try {
                const parsed = JSON.parse(item.replace(/'/g, '"'));
                return parsed.otherDescription || parsed.description || parsed.categoryDescription || item;
            } catch (e) {}
        }
        return item;
    }
    return String(item);
}

const GUEST_OPTIONS = [
    { value: 1, label: "1 Adult", desc: "Solo Traveler" },
    { value: 2, label: "2 Adults", desc: "Couple / Pair" },
    { value: 3, label: "3 Adults", desc: "Triple Sharing" },
    { value: 4, label: "4 Adults", desc: "Small Group" },
    { value: 5, label: "5 Adults", desc: "Family Group" },
    { value: 6, label: "6+ Adults", desc: "Large Group" }
];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const formatLocalDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
};

export const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "Select Date";
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

export default function TourPackageDetails() {
    const navParams = useParams<{ id?: string }>();
    const location = useLocation();

    // Dynamic ID / Slug resolution
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
    const KNOWN_DEST_HUBS = new Set([
        "delhi-tours", "agra-tours", "jaipur-tours", "udaipur-tours", "jodhpur-tours",
        "jaisalmer-tours", "ranthambore-tours", "mount-abu-tours", "bikaner-tours",
        "rajasthan-tours", "goa-tours", "kashmir-tours", "manali-tours", "kerala-tours", "ladakh-tours"
    ]);
    const isDestinationRoute = KNOWN_DEST_HUBS.has(cleanId) || cleanId.startsWith("destinations/");

    if (isDestinationRoute) {
        return <DestinationToursLanding />;
    }

    const todayDate = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [packageData, setPackageData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState<string>("");
    const [travelerCount, setTravelerCount] = useState(2);
    const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [travelDate, setTravelDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return formatLocalDate(d);
    });
    const [viewMonth, setViewMonth] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const [copiedToast, setCopiedToast] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [photoModalIndex, setPhotoModalIndex] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [showAllInclusions, setShowAllInclusions] = useState(false);
    const [showAllExclusions, setShowAllExclusions] = useState(false);
    const [showAllItinerary, setShowAllItinerary] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

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

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsGuestDropdownOpen(false);
            }
            if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const canGoPrevMonth = viewMonth.year > todayDate.getFullYear() || viewMonth.month > todayDate.getMonth();

    const handlePrevMonth = () => {
        if (!canGoPrevMonth) return;
        setViewMonth(prev => {
            let m = prev.month - 1;
            let y = prev.year;
            if (m < 0) {
                m = 11;
                y--;
            }
            return { year: y, month: m };
        });
    };

    const handleNextMonth = () => {
        setViewMonth(prev => {
            let m = prev.month + 1;
            let y = prev.year;
            if (m > 11) {
                m = 0;
                y++;
            }
            return { year: y, month: m };
        });
    };

    const applyDatePreset = (daysFromToday: number) => {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() + daysFromToday);
        setTravelDate(formatLocalDate(d));
        setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
        setIsDatePickerOpen(false);
    };

    // Handle Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-500">Loading experience details...</span>
                </div>
            </div>
        );
    }

    // Handle 404 Package Not Found Empty State
    if (!packageData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center font-sans">
                <SEOHead title="Tour Experience Not Found | GetHotelStays" description="Requested tour package could not be found." noIndex />
                <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tour Experience Not Found</h2>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed">
                        This tour might have been updated or moved. Browse all our top-rated tours and experiences across India.
                    </p>
                    <Link
                        to="/packages"
                        className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-600/20"
                    >
                        Browse All India Tours
                    </Link>
                </div>
            </div>
        );
    }

    const pkg = packageData;
    const destinationName = pkg.destination || "India";

    // Gather all unique photos
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
        allPhotos.push("https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/r/33/0b/77/f5/caption.jpg");
    }

    // Rating & Reviews
    const reviewsList = Array.isArray(pkg.reviews) ? pkg.reviews : [];
    const reviewsCount = reviewsList.length > 0 ? reviewsList.length : 2438;
    const calculatedRating = (pkg.rating || 4.9).toFixed(1);

    const pricePerAdult = pkg.price || 1079;
    const originalPricePerAdult = pkg.originalPrice || Math.round(pricePerAdult * 1.25);
    const totalPrice = pricePerAdult * travelerCount;

    const handleDirectBookNow = () => {
        if (pkg.bookingUrl) {
            window.open(pkg.bookingUrl, "_blank", "noopener,noreferrer");
            return;
        }
        navigate(`/packages`);
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            if (navigator.share) {
                navigator.share({
                    title: pkg.title,
                    text: `Check out ${pkg.title} on GetHotelStays`,
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

    const rawInclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
    const inclusionsList: string[] = rawInclusions.length > 0
        ? rawInclusions.map(cleanTourText).filter(Boolean)
        : [
            "Complimentary bottled water",
            "All toll taxes, parking fees, fuel, and road charges",
            "Door-to-door private roundtrip transfer by AC vehicle",
            "Professional licensed private live tour guide",
            `Hotel pickup and drop-off anywhere in ${destinationName}`
        ];
    const displayedInclusions = showAllInclusions ? inclusionsList : inclusionsList.slice(0, 6);

    const rawExclusions = Array.isArray(pkg.exclusions) ? pkg.exclusions : [];
    const exclusionsList: string[] = rawExclusions.length > 0
        ? rawExclusions.map(cleanTourText).filter(Boolean)
        : [
            "Monument entrance fees (unless tickets-included option selected)",
            "Beverages served during lunch",
            "Tips and driver gratuities"
        ];
    const displayedExclusions = showAllExclusions ? exclusionsList : exclusionsList.slice(0, 6);

    // Rich Itinerary Stops
    const rawItinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
    const itineraryList: any[] = rawItinerary.length > 0
        ? rawItinerary.map((item: any, idx: number) => {
            let title = item.title || `Stop ${idx + 1}`;
            if (title.toLowerCase().includes("agra fort") && idx === 4) {
                title = "Tomb of Itimad-ud-Daulah (Baby Taj)";
            }
            return {
                day: item.day || `Stop ${idx + 1}`,
                title: title,
                description: item.description || item.desc || "Sightseeing and guided exploration.",
                duration: item.duration || "",
                admission: item.admission || ""
            };
        })
        : [
            { day: "Stop 1", title: `Pickup & Departure in ${destinationName}`, description: `Convenient pickup from your hotel or preferred address in ${destinationName}. Travel comfortably in a private AC vehicle.`, duration: "1-2 hours", admission: "" },
            { day: "Stop 2", title: "Guided Landmark Sightseeing", description: "Guided tour inside the top iconic heritage attractions with priority entrance.", duration: "2-3 hours", admission: "Admission Ticket Included" },
            { day: "Stop 3", title: "Cultural Highlights & Local Exploration", description: "Explore historic fortresses, palaces, scenic viewpoints, or bustling markets with your expert guide.", duration: "1-2 hours", admission: "Admission Ticket Included" },
            { day: "Stop 4", title: "Scenic Return Transfer & Drop-off", description: `Relax on your comfortable return transfer back to your hotel or airport in ${destinationName}.`, duration: "1 hour", admission: "" }
        ];
    const displayedItinerary = showAllItinerary ? itineraryList : itineraryList.slice(0, 6);

    const isTaj = (pkg.title + " " + destinationName).toLowerCase().includes("taj");
    const faqs = [
        {
            q: `What is the pickup time for this tour in ${destinationName}?`,
            a: `This is a private tour with flexible departure times. Your chauffeur will pick you up directly from your hotel lobby or designated address at your preferred time.`
        },
        {
            q: "Where does the driver pick us up?",
            a: `Traveler pickup is offered from any hotel, residence, Airbnb, or airport in ${destinationName} and surrounding areas.`
        },
        isTaj ? {
            q: "Is the Taj Mahal open every day?",
            a: "The Taj Mahal is closed on Fridays for general visitors. On Fridays, the tour itinerary is tailored to explore Agra Fort, Baby Taj, and picturesque views from Mehtab Bagh across the river."
        } : {
            q: `Are the tour guides licensed and English speaking?`,
            a: `Yes, all local guides are government-approved certified professionals fluent in English (additional languages available upon advance request).`
        },
        {
            q: "What is the cancellation policy?",
            a: "You can cancel up to 24 hours in advance of the experience for a full 100% refund with zero cancellation fees."
        },
        {
            q: "Are monument admission tickets included?",
            a: "Options can be selected with all monument admission tickets included for fast skip-the-line entry, or transport & guide only if you wish to buy tickets locally."
        }
    ];

    // ─── AEO & SEO STRUCTURED DATA SCHEMAS ──────────────────────────────
    const canonicalPageUrl = `https://gethotelstays.com/packages/${pkg.slug || cleanId}`;
    
    const tripSchema = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": pkg.title,
        "description": pkg.overview || `Book ${pkg.title} in ${destinationName}. Verified tour package with private AC transport, guide and instant confirmation.`,
        "touristType": ["Family", "Couple", "Solo Traveler", "International Tourist"],
        "image": allPhotos[0] || pkg.image,
        "offers": {
            "@type": "Offer",
            "price": pricePerAdult.toString(),
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "validFrom": "2026-01-01",
            "url": canonicalPageUrl,
            "seller": {
                "@type": "Organization",
                "name": "GetHotelStays",
                "url": "https://gethotelstays.com"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": calculatedRating,
            "reviewCount": reviewsCount.toString(),
            "bestRating": "5",
            "worstRating": "1"
        },
        "itinerary": {
            "@type": "ItemList",
            "numberOfItems": itineraryList.length,
            "itemListElement": itineraryList.map((item: any, idx: number) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": item.title,
                "description": item.description
            }))
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://gethotelstays.com" },
            { "@type": "ListItem", "position": 2, "name": "Tour Packages", "item": "https://gethotelstays.com/packages" },
            { "@type": "ListItem", "position": 3, "name": `${destinationName} Tours`, "item": "https://gethotelstays.com/packages" },
            { "@type": "ListItem", "position": 4, "name": pkg.title, "item": canonicalPageUrl }
        ]
    };

    // Right Column / Mobile Booking Card Component (Blue Theme)
    const renderBookingCard = () => (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 relative ${isDatePickerOpen || isGuestDropdownOpen ? "z-40" : "z-10"}`}>
            {/* Header: Price & Lowest Price Guarantee */}
            <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">From</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        ₹{pricePerAdult.toLocaleString()}
                    </span>
                    {originalPricePerAdult > pricePerAdult && (
                        <span className="text-sm text-slate-400 line-through font-medium">
                            ₹{originalPricePerAdult.toLocaleString()}
                        </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">per adult</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium mt-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Lowest Price Guarantee</span>
                </div>
            </div>

            {/* Select Date and Travelers */}
            <div className="space-y-3">
                {/* Custom Date Picker */}
                <div className="relative" ref={datePickerRef}>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        Select Date
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            setIsDatePickerOpen(!isDatePickerOpen);
                            setIsGuestDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                            isDatePickerOpen ? "border-blue-600 ring-2 ring-blue-100 bg-white" : "border-slate-200"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-900">{formatDisplayDate(travelDate)}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDatePickerOpen ? "rotate-180 text-blue-600" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isDatePickerOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 space-y-3"
                            >
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
                                    <button
                                        type="button"
                                        onClick={() => applyDatePreset(1)}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                                    >
                                        Tomorrow
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDatePreset(2)}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                                    >
                                        +2 Days
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDatePreset(5)}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                                    >
                                        +5 Days
                                    </button>
                                </div>
                                <div className="flex items-center justify-between px-1 border-t border-slate-100 pt-2">
                                    <span className="text-xs font-bold text-slate-900">
                                        {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={!canGoPrevMonth}
                                            onClick={handlePrevMonth}
                                            className={`p-1 rounded-lg ${canGoPrevMonth ? "hover:bg-slate-100 text-slate-700 cursor-pointer" : "text-slate-200 cursor-not-allowed"}`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextMonth}
                                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 text-center">
                                    {WEEKDAYS.map((w, idx) => (
                                        <span key={idx} className="text-[10px] font-bold text-slate-400 uppercase py-0.5">{w}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: new Date(viewMonth.year, viewMonth.month, 1).getDay() }).map((_, i) => (
                                        <div key={`b-${i}`} className="w-7 h-7" />
                                    ))}
                                    {Array.from({ length: new Date(viewMonth.year, viewMonth.month + 1, 0).getDate() }, (_, i) => i + 1).map((dNum) => {
                                        const cellDate = new Date(viewMonth.year, viewMonth.month, dNum);
                                        cellDate.setHours(0, 0, 0, 0);
                                        const isPast = cellDate < todayDate;
                                        const [sY, sM, sD] = travelDate.split('-').map(Number);
                                        const isSelected = sY === viewMonth.year && (sM - 1) === viewMonth.month && sD === dNum;
                                        return (
                                            <button
                                                key={dNum}
                                                type="button"
                                                disabled={isPast}
                                                onClick={() => {
                                                    const y = viewMonth.year;
                                                    const m = String(viewMonth.month + 1).padStart(2, '0');
                                                    const d = String(dNum).padStart(2, '0');
                                                    setTravelDate(`${y}-${m}-${d}`);
                                                    setIsDatePickerOpen(false);
                                                }}
                                                className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-semibold ${
                                                    isPast ? "text-slate-300 cursor-not-allowed" : isSelected ? "bg-blue-600 text-white font-bold shadow-xs" : "hover:bg-slate-100 text-slate-800 cursor-pointer"
                                                }`}
                                            >
                                                {dNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Travelers Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        Travelers
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            setIsGuestDropdownOpen(!isGuestDropdownOpen);
                            setIsDatePickerOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                            isGuestDropdownOpen ? "border-blue-600 ring-2 ring-blue-100 bg-white" : "border-slate-200"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-900">{selectedOption.label} ({selectedOption.desc})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isGuestDropdownOpen ? "rotate-180 text-blue-600" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isGuestDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-1 space-y-1"
                            >
                                {GUEST_OPTIONS.map((opt) => {
                                    const isSelected = travelerCount === opt.value;
                                    const optTotal = pricePerAdult * opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setTravelerCount(opt.value);
                                                setIsGuestDropdownOpen(false);
                                            }}
                                            className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left ${
                                                isSelected ? "bg-blue-600 text-white font-bold" : "hover:bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            <span className="text-xs">{opt.label} • {opt.desc}</span>
                                            <span className="text-xs font-bold">₹{optTotal.toLocaleString()}</span>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Selected Package Option */}
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Private Car Tour & Live Guide</span>
                    <span className="text-blue-700 font-extrabold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-snug">
                    {travelerCount} Adult{travelerCount > 1 ? 's' : ''} × ₹{pricePerAdult.toLocaleString()} • Private AC Vehicle
                </div>
            </div>

            {/* Primary CTA Button: Reserve Now & Pay Later in GHS Blue */}
            <button
                onClick={handleDirectBookNow}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-all shadow-md shadow-blue-600/25 active:scale-[0.99] flex flex-col items-center justify-center cursor-pointer text-center group"
            >
                <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
                    <span>Reserve Now & Pay Later</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[11px] font-normal text-white/90">Secure your spot while staying flexible</span>
            </button>

            {/* Microcopy & Guarantees */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Free cancellation:</strong> Up to 24 hours in advance for a full refund</span>
                </div>
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Reserve Now & Pay Later:</strong> Book today, pay when you go</span>
                </div>
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Instant confirmation sent to your email / phone</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 lg:pb-16 antialiased">
            <SEOHead
                title={`${pkg.title} | ${destinationName} Tours | GetHotelStays`}
                description={`Book ${pkg.title} in ${destinationName}. Includes ${pkg.duration}, private AC transport, guide, and flexible cancellation. Lowest price guaranteed from ₹${pricePerAdult.toLocaleString()}.`}
                canonicalUrl={canonicalPageUrl}
                ogImage={allPhotos[0] || pkg.image}
                ogType="product"
                schemas={[tripSchema, faqSchema, breadcrumbSchema]}
                keywords={[
                    pkg.title,
                    `${destinationName} tour package`,
                    `${destinationName} sightseeing`,
                    `${destinationName} day trip`,
                    `book ${destinationName} tours`,
                    "India tour packages",
                    "Viator partner tours"
                ]}
            />

            {/* ─── BREADCRUMBS BAR ─────────────────────────── */}
            <div className="border-b border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500">
                <div className="max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <span>›</span>
                        <Link to="/packages" className="hover:text-blue-600 transition-colors">Things to do in India</Link>
                        <span>›</span>
                        <Link to="/packages" className="hover:text-blue-600 transition-colors">Things to do in {destinationName}</Link>
                        <span>›</span>
                        <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-xs">{pkg.title}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{copiedToast ? "Copied!" : "Share"}</span>
                        </button>
                        <button
                            onClick={handleDirectBookNow}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                            <Heart className="w-3.5 h-3.5 text-slate-600 hover:text-rose-500 hover:fill-rose-500" />
                            <span className="hidden sm:inline">Save</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── MAIN CONTAINER ─────────────────────────────────────────── */}
            <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">

                {/* ─── TOUR TITLE & RATING HEADER ─── */}
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {pkg.title}
                    </h1>

                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm text-slate-600">
                        {/* Rating with Gold/Amber Star Icon */}
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span className="flex items-center gap-0.5 text-amber-500">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </span>
                            <span>{calculatedRating}</span>
                            <span className="text-slate-500 underline decoration-slate-300 font-normal cursor-pointer">
                                ({reviewsCount.toLocaleString()} reviews)
                            </span>
                        </div>

                        <span>•</span>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span className="underline decoration-slate-300 cursor-pointer">{destinationName}, India</span>
                        </div>

                        {/* Badges in Blue Theme */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold text-xs">
                            <Award className="w-3.5 h-3.5 text-blue-600" />
                            Badge of Excellence
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                            Instant Confirmation
                        </span>
                    </div>
                </div>

                {/* ─── PHOTO GALLERY COLLAGE (5-PHOTO GRID) ────────────────── */}
                <div className="relative">
                    {/* Desktop 5-photo grid */}
                    <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 h-[420px] lg:h-[480px] rounded-2xl overflow-hidden">
                        {/* Main Left Photo (Col 1-2, Row 1-2) */}
                        <div
                            onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}
                            className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden bg-slate-100"
                        >
                            <img
                                src={allPhotos[0]}
                                alt={pkg.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* 4 Smaller Photos (2x2 on right) */}
                        {allPhotos.slice(1, 5).map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setPhotoModalIndex(idx + 1); setIsPhotoModalOpen(true); }}
                                className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-slate-100"
                            >
                                <img
                                    src={img}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Mobile Single Hero Photo */}
                    <div
                        onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}
                        className="sm:hidden relative h-64 rounded-2xl overflow-hidden bg-slate-100 cursor-pointer"
                    >
                        <img
                            src={selectedImg || allPhotos[0]}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold">
                            1 / {allPhotos.length}
                        </div>
                    </div>

                    {/* Show All Photos Button (Bottom Right) */}
                    <button
                        type="button"
                        onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}
                        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 px-3.5 py-2 bg-white/95 hover:bg-white text-slate-900 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md border border-slate-200 transition-all cursor-pointer hover:border-blue-400"
                    >
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>See all {allPhotos.length} photos</span>
                    </button>
                </div>

                {/* ─── TWO COLUMN LAYOUT (LEFT DETAILS + RIGHT STICKY BOOKING) ─ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start pt-2">

                    {/* ──── LEFT COLUMN (68% / 8 COLS) ─────────────────────────── */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Quick Spec Highlights Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-200 text-xs">
                            <div className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                                    <span className="font-bold text-slate-900">{pkg.duration || "5 to 11 hours"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Car className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pickup</span>
                                    <span className="font-bold text-slate-900">Pickup offered</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Ticket className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ticket</span>
                                    <span className="font-bold text-slate-900">Mobile ticket</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Offered In</span>
                                    <span className="font-bold text-slate-900">English + 4 more</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Inline Booking Card */}
                        <div className="lg:hidden">
                            {renderBookingCard()}
                        </div>

                        {/* Overview Section */}
                        <div className="space-y-3 pb-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h2>
                            <p className="text-sm text-slate-700 leading-relaxed font-normal">
                                {pkg.overview || `Experience the best highlights, culture, and sights of ${destinationName} on this top-rated private tour. Includes private air-conditioned vehicle transport, professional guide, and flexible hotel pickup.`}
                            </p>
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>Private customized tour in {destinationName} by AC car</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>Comfortable, door-to-door roundtrip private transfers</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>Expert licensed live tour guide explaining local heritage</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>Flexible itinerary tailored to your group's pace</span>
                                </div>
                            </div>

                            {/* AEO & AI Overview Fast Facts Block */}
                            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-2 text-xs" aria-label="Key Tour Facts for Travelers and AI Assistants">
                                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Experience Summary & Fast Facts</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-700">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold">Starting Price</span>
                                        <span className="font-extrabold text-slate-900 text-sm">₹{pricePerAdult.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold">Duration</span>
                                        <span className="font-bold text-slate-900">{pkg.duration || "5-11 Hours"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold">Location</span>
                                        <span className="font-bold text-slate-900">{destinationName}, India</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold">Cancellation</span>
                                        <span className="font-bold text-blue-700">100% Free (24h)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What's Included & Excluded */}
                        <div className="space-y-4 pb-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">What's Included</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Inclusions */}
                                <div className="space-y-2.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                                        Included
                                    </span>
                                    <ul className="space-y-2">
                                        {displayedInclusions.map((inc: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                </div>
                                                <span className="leading-snug">{inc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {inclusionsList.length > 6 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllInclusions(!showAllInclusions)}
                                            className="text-xs font-bold text-blue-600 underline hover:text-blue-800 cursor-pointer pt-1"
                                        >
                                            {showAllInclusions ? "Show Less" : `View all ${inclusionsList.length} inclusions`}
                                        </button>
                                    )}
                                </div>

                                {/* Exclusions */}
                                <div className="space-y-2.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block">
                                        Excluded
                                    </span>
                                    <ul className="space-y-2">
                                        {displayedExclusions.map((exc: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                                                <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                                    <X className="w-2.5 h-2.5 stroke-[3]" />
                                                </div>
                                                <span className="leading-snug">{exc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {exclusionsList.length > 6 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllExclusions(!showAllExclusions)}
                                            className="text-xs font-bold text-blue-600 underline hover:text-blue-800 cursor-pointer pt-1"
                                        >
                                            {showAllExclusions ? "Show Less" : `View all ${exclusionsList.length} exclusions`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Meeting and Pickup */}
                        <div className="space-y-3 pb-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Meeting and Pickup</h2>
                            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                                    <div className="flex items-center gap-2 font-bold text-slate-900">
                                        <Car className="w-4 h-4 text-blue-600" />
                                        <span>Traveler pickup is offered</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        We pick up from any hotel, residence, Airbnb, or airport in {destinationName} and nearby surroundings.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <strong className="text-slate-900 text-xs block mb-0.5">Start Time:</strong>
                                        <span className="text-xs text-slate-600">Flexible departure upon request (morning or afternoon)</span>
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 text-xs block mb-0.5">End Point:</strong>
                                        <span className="text-xs text-slate-600">This activity ends back at your original pickup location.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What to Expect (Itinerary Stops) */}
                        <div className="space-y-4 pb-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">What to Expect</h2>
                                <span className="text-xs text-slate-500 font-medium">Itinerary • {itineraryList.length} Stops</span>
                            </div>

                            {/* Itinerary Timeline */}
                            <div className="relative pl-6 space-y-6 pt-2 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                                {displayedItinerary.map((item: any, idx: number) => (
                                    <div key={idx} className="relative">
                                        {/* Stop Number Circle in Blue */}
                                        <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center ring-4 ring-white shadow-xs">
                                            {idx + 1}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-bold text-slate-900">
                                                    {item.title}
                                                </h3>
                                                {item.duration && (
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                        • {item.duration}
                                                    </span>
                                                )}
                                                {item.admission && (
                                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                                        {item.admission}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {itineraryList.length > 6 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllItinerary(!showAllItinerary)}
                                    className="text-xs font-bold text-blue-600 underline hover:text-blue-800 cursor-pointer pt-1"
                                >
                                    {showAllItinerary ? "Show Less" : `View all ${itineraryList.length} stops`}
                                </button>
                            )}
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-3 pb-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Additional Information</h2>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400">•</span>
                                    <span>Confirmation will be received at time of booking.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400">•</span>
                                    <span>Wheelchair and stroller accessible throughout all main tour spots.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400">•</span>
                                    <span>Infant seats available upon advance request at no extra charge.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400">•</span>
                                    <span>Near public transportation links. Most travelers can participate.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400">•</span>
                                    <span>This is a private tour/activity. Only your group will participate.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="space-y-3 pb-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cancellation Policy</h2>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs sm:text-sm">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    <span>Free cancellation up to 24 hours in advance</span>
                                </div>
                                <p className="text-slate-600 text-xs leading-relaxed">
                                    For a full refund, you must cancel at least 24 hours before the experience’s start time. If you cancel less than 24 hours before, the amount paid cannot be refunded.
                                </p>
                            </div>
                        </div>

                        {/* Frequently Asked Questions */}
                        <div className="space-y-3 pb-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <div className="divide-y divide-slate-200 border-y border-slate-200">
                                {faqs.map((faq, idx) => (
                                    <div key={idx}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                            className="w-full py-3.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
                                        >
                                            <span>{faq.q}</span>
                                            {openFaqIndex === idx ? (
                                                <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                            )}
                                        </button>
                                        {openFaqIndex === idx && (
                                            <div className="pb-3.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Traveler Reviews */}
                        <div className="space-y-4 pb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Traveler Reviews</h2>
                                    <p className="text-xs text-slate-500 font-medium">Over {reviewsCount.toLocaleString()} reviews on Viator</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-lg font-extrabold text-slate-900">
                                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    <span>{calculatedRating} of 5</span>
                                </div>
                            </div>

                            {/* Verified Reviews Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                                                M
                                            </span>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 block">Michael S.</span>
                                                <span className="text-[10px] text-slate-400">United States • Oct 2026</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-500">★★★★★ 5.0</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                        {`"Outstanding private tour! Our driver picked us up right on time in a spotless AC vehicle. Our tour guide in ${destinationName} was phenomenal with local knowledge and historical details. Highly recommended!"`}
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                                                E
                                            </span>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 block">Emma L.</span>
                                                <span className="text-[10px] text-slate-400">United Kingdom • Nov 2026</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-500">★★★★★ 5.0</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                        {`"Seamless experience from start to finish. Having private transport and skip-the-line privileges made exploring ${destinationName} effortless and stress-free."`}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ──── RIGHT COLUMN: STICKY BOOKING WIDGET (32% / 4 COLS) ─── */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
                        {renderBookingCard()}
                    </div>
                </div>

                {/* Mobile Sticky Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between shadow-xl lg:hidden">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">From</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-slate-950">₹{pricePerAdult.toLocaleString()}</span>
                            <span className="text-xs text-slate-500 font-medium">/ adult</span>
                        </div>
                    </div>
                    <button
                        onClick={handleDirectBookNow}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                        <span>Reserve Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Footer Note */}
                <div className="pt-8 border-t border-slate-200 text-center space-y-1 text-slate-900 pb-4">
                    <p className="text-xs text-slate-400 font-medium">
                        Experiences fulfilled in partnership with Viator, a Tripadvisor company.
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

        </div>
    );
}
