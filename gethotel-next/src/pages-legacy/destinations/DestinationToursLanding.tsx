'use client';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import { useLocale } from "@/context/LocaleContext";
import {
    MapPin, Clock, Star, Hotel, Car, Check, ChevronLeft, ChevronRight,
    Search, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Heart,
    Filter, Image as ImageIcon, Compass, HelpCircle, ChevronDown, ChevronUp
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

interface DestinationMeta {
    name: string;
    slug: string;
    tagline: string;
    heroImage: string;
    badge: string;
    highlights: string[];
    bestTimeToVisit: string;
    overview: string;
    faqs: { question: string; answer: string }[];
}

const DESTINATION_CONFIGS: Record<string, DestinationMeta> = {
    "agra": {
        name: "Agra",
        slug: "agra-tours",
        tagline: "The City of Taj Mahal & Timeless Mughal Splendor",
        heroImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85",
        badge: "UNESCO World Heritage Circuit",
        highlights: [
            "Sunrise & Sunset at the majestic Taj Mahal",
            "Historic Red Sandstone Agra Fort & Jahangiri Mahal",
            "Ghost City of Fatehpur Sikri & Buland Darwaza",
            "Mehtab Bagh Panoramic Garden Views"
        ],
        bestTimeToVisit: "October to March (Pleasant weather for sightseeing)",
        overview: "Agra is the crowning jewel of India's Golden Triangle, celebrated worldwide for the immortal Taj Mahal. Our handcrafted Agra tour packages combine iconic Mughal architecture, luxury heritage haveli stays, private chauffeur transfers from Delhi, and expert storytelling guides.",
        faqs: [
            {
                question: "Is the Taj Mahal closed on any specific day?",
                answer: "Yes, the Taj Mahal remains closed for general visitors every Friday. Our itineraries are specifically planned so that your sunrise or daytime visit falls on open days."
            },
            {
                question: "Are private transfers from Delhi included in Agra packages?",
                answer: "Yes, all our Golden Triangle and Agra packages include door-to-door private AC sedan transfers from Delhi airport or hotel with experienced drivers."
            },
            {
                question: "Can we combine Agra with Jaipur and Ranthambore?",
                answer: "Absolutely! We offer the classic Golden Triangle Tour, Golden Triangle with Ranthambore Tiger Safari, and Golden Triangle with Udaipur covering Agra seamlessly."
            }
        ]
    },
    "delhi": {
        name: "Delhi",
        slug: "delhi-tours",
        tagline: "Capital Heritage, Mughal Grandeur & Vibrant Bazaars",
        heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85",
        badge: "Capital Gateway Circuit",
        highlights: [
            "Red Fort, Jama Masjid & Chandni Chowk Rickshaw Ride",
            "Qutub Minar & Humayun's Tomb Heritage Walks",
            "India Gate, Rashtrapati Bhavan & Kartavya Path",
            "Authentic Old Delhi Food & Spice Market Trails"
        ],
        bestTimeToVisit: "October to April (Cool & enjoyable sightseeing)",
        overview: "Delhi stands as the vibrant crossroads of ancient empires and modern India. Experience world-renowned monuments, bustling historic alleyways, and seamless departures across Rajasthan circuits.",
        faqs: [
            {
                question: "Do tours start with pickup from Delhi Airport?",
                answer: "Yes! All packages include complimentary pickup from Indira Gandhi International Airport (DEL) or your hotel in Delhi/NCR."
            },
            {
                question: "How many days are recommended for Delhi sightseeing?",
                answer: "A 2-day itinerary covers both Old Delhi (Mughal heritage) and New Delhi (colonial and modern monuments) thoroughly before departing for Agra or Rajasthan."
            }
        ]
    },
    "jaipur": {
        name: "Jaipur",
        slug: "jaipur-tours",
        tagline: "The Royal Pink City of Grand Forts & Regal Palaces",
        heroImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85",
        badge: "Royal Rajputana Capital",
        highlights: [
            "Amber Fort Elephant / 4x4 Jeep Ascent",
            "Iconic Honeycombed Hawa Mahal & City Palace Museum",
            "Astronomical Wonders of UNESCO Jantar Mantar",
            "Johari & Bapu Bazaar Royal Gem & Textile Shopping"
        ],
        bestTimeToVisit: "October to March (Warm sunny days and cool evenings)",
        overview: "Jaipur captivates travelers with its terracotta-pink avenues, hilltop fortifications, and royal Rajput heritage. Enjoy 4-star palace stays, authentic Rajasthani thali dining, and guided monument walks.",
        faqs: [
            {
                question: "Are monument entry tickets included in Jaipur packages?",
                answer: "Yes, our tour packages include entry tickets to Amber Fort, City Palace, Jantar Mantar, and Hawa Mahal as outlined in each itinerary."
            }
        ]
    },
    "udaipur": {
        name: "Udaipur",
        slug: "udaipur-tours",
        tagline: "Romantic City of Shimmering Lakes & Royal Haveli",
        heroImage: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1600&q=85",
        badge: "Venice of the East",
        highlights: [
            "Sunset Boat Cruise across Lake Pichola",
            "Grand City Palace Complex & Crystal Gallery",
            "Bagore Ki Haveli Rajasthani Folk Dance Show",
            "Monsoon Palace (Sajjangarh) Hilltop Panorama"
        ],
        bestTimeToVisit: "September to March",
        overview: "Udaipur is celebrated for its ethereal marble palaces, quiet lake waters, and romantic rooftop dining. Our tour packages include luxury lake-view stays and serene sunset boat cruises.",
        faqs: [
            {
                question: "Is the Lake Pichola boat ride included?",
                answer: "Yes, a scenic private/shared boat ride on Lake Pichola with views of the Lake Palace and Jag Mandir is included in all Udaipur tour itineraries."
            }
        ]
    },
    "jodhpur": {
        name: "Jodhpur",
        slug: "jodhpur-tours",
        tagline: "The Sun City & The Mighty Fort of Mehrangarh",
        heroImage: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1600&q=85",
        badge: "Blue City of Marwar",
        highlights: [
            "Mehrangarh Fort towering over the Blue City",
            "Jaswant Thada Royal White Marble Cenotaph",
            "Clock Tower & Sardar Market Spice Trail",
            "Umaid Bhawan Palace & Heritage Museum"
        ],
        bestTimeToVisit: "October to March",
        overview: "Jodhpur glows in shades of cobalt blue beneath the colossal Mehrangarh Fort. Explore royal Rajput history, colorful markets, and desert transitions.",
        faqs: [
            {
                question: "Can Jodhpur be combined with Jaisalmer desert camps?",
                answer: "Yes, our Desert Triangle and Royal Rajasthan tours seamlessly connect Jodhpur with Jaisalmer's Thar desert dunes."
            }
        ]
    },
    "jaisalmer": {
        name: "Jaisalmer",
        slug: "jaisalmer-tours",
        tagline: "The Golden City & Thar Desert Dune Safaris",
        heroImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=85",
        badge: "Thar Desert Gateway",
        highlights: [
            "Sam Sand Dunes Camel Safari & Sunset View",
            "Living Golden Fort (Sonar Qila) Exploration",
            "Intricate Carved Patwon Ki Haveli & Salim Singh Haveli",
            "Desert Camp Folk Dance & Stargazing Dinner"
        ],
        bestTimeToVisit: "October to March",
        overview: "Jaisalmer rises like a golden mirage from the Thar Desert. Stay inside authentic Swiss desert tents, ride camels into the sunset, and explore a living medieval fortress.",
        faqs: [
            {
                question: "Is overnight desert camping included in Jaisalmer tours?",
                answer: "Yes, our itineraries include an overnight stay in premium desert camps with cultural folk dances, campfires, and buffet dinners."
            }
        ]
    },
    "ranthambore": {
        name: "Ranthambore",
        slug: "ranthambore-tours",
        tagline: "Wild Royal Bengal Tiger Safaris & Ancient Forts",
        heroImage: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1600&q=85",
        badge: "Premier Tiger Reserve",
        highlights: [
            "Open 4x4 Jeep Safari inside Ranthambore National Park",
            "Spotting Royal Bengal Tigers, Leopards & Wildlife",
            "Historic 10th-Century Ranthambore Fort Exploration",
            "Trinetra Ganesha Temple & Surwal Lake Bird Watching"
        ],
        bestTimeToVisit: "October to April (Park open October through June)",
        overview: "Ranthambore blends untamed wilderness with ancient history. Experience morning and evening jungle safaris in search of the legendary Royal Bengal Tiger.",
        faqs: [
            {
                question: "Are safari permits and jeep vehicles included?",
                answer: "Yes, safaris with forest permits, open 4x4 Gypsy jeeps, and government-approved naturalists are included in the package."
            }
        ]
    },
    "mount-abu": {
        name: "Mount Abu",
        slug: "mount-abu-tours",
        tagline: "Rajasthan's Only Hill Station & Dilwara Temples",
        heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",
        badge: "Hilltop Oasis",
        highlights: [
            "World-Famous Intricately Carved Dilwara Marble Temples",
            "Nakki Lake Boating & Sunset Point Views",
            "Guru Shikhar - Highest Peak of the Aravalli Range",
            "Achalgarh Fort & Peaceful Nature Trails"
        ],
        bestTimeToVisit: "Throughout the year (Pleasant climate)",
        overview: "Mount Abu offers a lush, cool escape surrounded by pine-covered hills, serene lakes, and architectural marvels in marble.",
        faqs: [
            {
                question: "Can Mount Abu be visited along with Udaipur?",
                answer: "Yes! Our 9-Day Golden Triangle with Mount Abu tour connects Udaipur and Mount Abu smoothly."
            }
        ]
    },
    "bikaner": {
        name: "Bikaner",
        slug: "bikaner-tours",
        tagline: "Desert Citadels, Camel Breeding & Grand Havelis",
        heroImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85",
        badge: "Desert Heritage Hub",
        highlights: [
            "Unconquered Junagarh Fort & Museum",
            "Lalgarh Palace & Royal Heritage Architecture",
            "National Research Centre on Camels",
            "World-Famous Bikaneri Bhujia & Sweet Bazaars"
        ],
        bestTimeToVisit: "October to March",
        overview: "Bikaner showcases medieval desert charm with grand red sandstone forts, old-world merchant mansions, and vibrant royal culinary traditions.",
        faqs: [
            {
                question: "What is the best way to reach Bikaner?",
                answer: "Bikaner is well-connected by road from Jaipur (approx. 5.5 hours) and Delhi, included in our Golden Triangle with Bikaner tour."
            }
        ]
    }
};

export default function DestinationToursLanding() {
    const params = useParams();
    const navigate = useNavigate();
    const { langCode } = useLocale();

    // Extract destination identifier from param (e.g. "agra-tours" -> "agra" or "delhi-tours" -> "delhi")
    const rawSlug = (params.slug || params.id || "agra-tours").toLowerCase();
    const cityKey = rawSlug.replace(/-tours$/, "").replace(/^destinations?\//, "").trim();

    const destMeta: DestinationMeta = DESTINATION_CONFIGS[cityKey] || {
        name: cityKey.charAt(0).toUpperCase() + cityKey.slice(1),
        slug: `${cityKey}-tours`,
        tagline: `Handcrafted ${cityKey.charAt(0).toUpperCase() + cityKey.slice(1)} Tour Packages & Holiday Circuits`,
        heroImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85",
        badge: "Exclusive Holiday Packages",
        highlights: ["Verified 4-Star Hotel Stays", "Private AC Chauffeur Transfers", "Complete Monument Sightseeing", "24/7 Dedicated Travel Support"],
        bestTimeToVisit: "October to March",
        overview: `Discover the best of ${cityKey.charAt(0).toUpperCase() + cityKey.slice(1)} with handpicked itineraries, private transport, and personalized travel assistance.`,
        faqs: []
    };

    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilterTag, setSelectedFilterTag] = useState("All");
    const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
    const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});
    const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

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
        const searchTarget = destMeta.name.toLowerCase();

        const matchesCity = dest.includes(searchTarget) || title.includes(searchTarget);

        if (!matchesCity) return false;

        if (selectedFilterTag !== "All") {
            const badge = (pkg.badge || "").toLowerCase();
            if (!badge.includes(selectedFilterTag.toLowerCase())) return false;
        }

        return true;
    });

    const otherDestinations = Object.values(DESTINATION_CONFIGS).filter(d => d.slug !== destMeta.slug);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            <SEOHead
                title={`${destMeta.name} Tour Packages | Best Deals & Itineraries | GetHotelStays`}
                description={`Book verified ${destMeta.name} tour packages with hotels, sightseeing transfers, and 24/7 dedicated support. Explore ${destMeta.tagline}.`}
            />

            {/* HERO PANORAMIC BANNER */}
            <div className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] overflow-hidden bg-slate-950">
                <img
                    src={destMeta.heroImage}
                    alt={`${destMeta.name} Tours`}
                    className="w-full h-full object-cover object-center brightness-[0.78] scale-105 animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60 pointer-events-none" />

                {/* Hero Content */}
                <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-6 sm:py-8 z-10">
                    {/* Top Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                        <Link to={`/${langCode}`} className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link to={`/${langCode}/packages`} className="hover:text-white transition-colors">Tour Packages</Link>
                        <span>/</span>
                        <span className="text-white font-bold">{destMeta.name} Tours</span>
                    </div>

                    {/* Main Title & Highlights Banner */}
                    <div className="space-y-3 max-w-3xl">
                        <span className="inline-block px-3 py-1 bg-brand-600/90 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                            ⭐ {destMeta.badge}
                        </span>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                            {destMeta.name} Tour Packages
                        </h1>

                        <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed drop-shadow-sm">
                            {destMeta.tagline}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/15">
                                <Clock className="w-3.5 h-3.5 text-brand-400" />
                                <span>Best Time: {destMeta.bestTimeToVisit}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/15">
                                <Car className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Private AC Transfers Included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-10">
                {/* Highlights Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-4">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        Why Book {destMeta.name} Tour Packages with Us
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {destMeta.overview}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                        {destMeta.highlights.map((hl, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-brand-50/50 border border-brand-100/50 text-xs font-bold text-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                                <span>{hl}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PACKAGES LISTING SECTION */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Available {destMeta.name} Holiday Itineraries
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Showing {destinationPackages.length} handcrafted package(s) covering {destMeta.name}
                            </p>
                        </div>

                        {/* Filter Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {["All", "Bestseller", "Top Rated", "Popular"].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedFilterTag(tag)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedFilterTag === tag
                                            ? "bg-brand-600 text-white shadow-sm"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="rounded-3xl aspect-[4/5] bg-slate-200 animate-pulse" />
                            ))}
                        </div>
                    ) : destinationPackages.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                            <Search className="w-8 h-8 text-slate-300 mx-auto" />
                            <h3 className="text-base font-bold text-slate-800">No Packages Found with Current Filter</h3>
                            <button
                                onClick={() => setSelectedFilterTag("All")}
                                className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl"
                            >
                                Reset Filters
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

                                        {/* Header Row */}
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

                                        {/* Bottom Glass Card */}
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

                {/* EXPLORE OTHER DESTINATIONS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Compass className="w-4.5 h-4.5 text-brand-600" />
                        Explore More Holiday Destinations
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
                        {otherDestinations.map(d => (
                            <Link
                                key={d.slug}
                                to={`/${langCode}/packages/destinations/${d.slug}`}
                                className="group p-3 rounded-2xl bg-slate-50 hover:bg-brand-50/50 border border-slate-100 hover:border-brand-200 transition-all flex items-center gap-3"
                            >
                                <img
                                    src={d.heroImage}
                                    alt={d.name}
                                    className="w-10 h-10 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                                />
                                <div className="min-w-0">
                                    <h4 className="text-xs font-black text-slate-900 group-hover:text-brand-600 truncate">{d.name}</h4>
                                    <span className="text-[10px] text-slate-500 font-medium">View Tours →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* FREQUENTLY ASKED QUESTIONS */}
                {Array.isArray(destMeta.faqs) && destMeta.faqs.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <HelpCircle className="w-4.5 h-4.5 text-brand-600" />
                            {destMeta.name} Tour FAQs
                        </h3>

                        <div className="space-y-3">
                            {destMeta.faqs.map((faq, idx) => {
                                const isOpen = openFaqIdx === idx;
                                return (
                                    <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                                            className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-100/60 transition-colors cursor-pointer"
                                        >
                                            <span>{faq.question}</span>
                                            {isOpen ? <ChevronUp className="w-4 h-4 text-brand-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </button>
                                        {isOpen && (
                                            <div className="p-4 text-xs text-slate-600 font-medium leading-relaxed bg-white border-t border-slate-100">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
