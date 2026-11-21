'use client';
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_FAQS } from "@/lib/seo";

const SEARCH_DIRECTORY = {
    "Delhi Stays & Transit Hubs": [
        { label: "Hourly Hotels Delhi", href: "/hourly-hotels-in-delhi" },
        { label: "Hotels Near Delhi Airport", href: "/hotels-near-delhi-airport" },
        { label: "Hotels Near NDLS Station", href: "/hotels-near-new-delhi-railway-station" },
        { label: "Couple Friendly Delhi", href: "/couple-friendly-hotels-in-delhi" },
        { label: "Early Check-in Delhi", href: "/early-check-in-hotels-in-delhi" },
        { label: "Hotels in Connaught Place", href: "/hotels-in-connaught-place-delhi" },
        { label: "Hotels in Karol Bagh", href: "/hotels-in-karol-bagh-delhi" },
        { label: "Hotels in Paharganj", href: "/hotels-in-paharganj-delhi" },
        { label: "Hotels in Mahipalpur", href: "/hotels-in-mahipalpur-delhi" },
        { label: "Hotels in South Delhi", href: "/hotels-in-south-delhi" },
        { label: "Hotels Near AIIMS Delhi", href: "/hotels-near-aiims-delhi" },
        { label: "Hotels Near Ganga Ram Hospital", href: "/hotels-near-ganga-ram-hospital" },
        { label: "Hotels Near Yashobhoomi", href: "/hotels-near-yashobhoomi-dwarka" },
        { label: "Hotels in Pitampura", href: "/hotels-in-pitampura-delhi" },
        { label: "All Delhi Hotels", href: "/delhi-hotels" },
    ],
    "Popular Holiday Destinations": [
        { label: "Goa Beach Stays", href: "/goa-hotels" },
        { label: "Jaipur Heritage Hotels", href: "/jaipur-hotels" },
        { label: "Udaipur Palace Resorts", href: "/udaipur-hotels" },
        { label: "Manali Valley Cottages", href: "/manali-hotels" },
        { label: "Shimla Mall Road Stays", href: "/shimla-hotels" },
        { label: "Delhi City Stays", href: "/delhi-hotels" },
    ],
    "Travel & Booking Services": [
        { label: "Verified Hotels Directory", href: "/hotels-directory" },
        { label: "Curated Tour Packages", href: "/tour-packages" },
        { label: "Flight Reservations", href: "/flights" },
        { label: "Hourly Day-Use Stays", href: "/hourly-hotels-in-delhi" },
        { label: "Early Morning Check-in", href: "/early-check-in-hotels-in-delhi" },
        { label: "List Your Property", href: "/list-property" },
    ],
};

export default function HomeSEOContent() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showAllFaqs, setShowAllFaqs] = useState(false);

    const faqs = HOME_FAQS;
    const displayedFaqs = showAllFaqs ? faqs : faqs.slice(0, 6);

    return (
        <section className="pt-6 pb-12 md:pb-16 bg-transparent border-t border-slate-100">
            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                
                {/* ── Brand Overview ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
                    <div className="lg:col-span-7 space-y-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                            Smart, Transparent Hotel Bookings
                        </h2>
                        <div className="text-slate-600 text-sm md:text-base leading-relaxed space-y-3">
                            <p>
                                GetHotelStays offers flexible, verified hotel accommodations across India. Whether you need an overnight family stay, an hourly room (3h, 6h, 12h) during airport transit, or a couple-friendly retreat, every property has verified photos, clear amenities, and transparent pricing.
                            </p>
                            {!isExpanded ? (
                                <p className="text-slate-500 text-sm">
                                    Choose between full-day stays and hourly slots. Pay a 12% deposit or complete payment online.{" "}
                                    <button
                                        onClick={() => setIsExpanded(true)}
                                        className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer underline"
                                    >
                                        Learn more
                                    </button>
                                </p>
                            ) : (
                                <div className="space-y-3 text-slate-600 text-sm">
                                    <p>
                                        <strong>Flexible Payment:</strong> Reserve with a 12% advance deposit online and settle the remaining 88% at hotel check-in via cash, UPI, or card. Alternatively, choose 100% full online payment for instant contactless arrival.
                                    </p>
                                    <p>
                                        <strong>Hourly Micro-Stays:</strong> 3-hour, 6-hour, and 12-hour booking slots near Delhi Airport (T3/Aerocity) and New Delhi Railway Station (NDLS) provide private rooms with clean washrooms, AC, and Wi-Fi at 40% to 70% lower cost than full-day rates.
                                    </p>
                                    <p>
                                        <strong>Couple Privacy:</strong> Consenting adult couples (18+) with valid government-issued photo IDs (including local IDs) can check in without moral policing or intrusive questioning.
                                    </p>
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer underline"
                                    >
                                        Show less
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-[340px] md:max-w-[400px] aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                            <img 
                                src="/seo_about_illustration.png" 
                                alt="GetHotelStays Booking and Transit Rooms" 
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Stay Categories ── */}
                <div className="space-y-4 text-left">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                        Accommodations for Every Need
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">
                                <Link to="/hourly-hotels-in-delhi" className="hover:text-brand-600 transition-colors">Hourly Stays (3h, 6h, 12h)</Link>
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Short-duration rooms for flight layovers, rail transit, and day work. Pay only for the hours you stay.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">
                                <Link to="/couple-friendly-hotels-in-delhi" className="hover:text-brand-600 transition-colors">Couple-Friendly Hotels</Link>
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                100% legal, private check-in for adult couples (18+) with local government photo IDs. Zero moral policing.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">
                                <Link to="/delhi-hotels" className="hover:text-brand-600 transition-colors">Affordable City Hotels</Link>
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Clean rooms with verified amenities: air conditioning, fresh linens, private bathrooms, and fast Wi-Fi.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">
                                <Link to="/jaipur-hotels" className="hover:text-brand-600 transition-colors">Heritage Stays & Resorts</Link>
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Heritage havelis in Rajasthan and mountain cottages in Himachal for leisure and holiday travel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── How It Works ── */}
                <div className="space-y-4 text-left">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                        How Booking Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">1. Choose Stay Type</h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Select your destination city and choose between overnight stays or 3, 6, 12-hour hourly slots.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">2. Select Room & Review</h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Compare authentic property photos, guest reviews, verified amenities, and transparent policies.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">3. 12% Deposit or Full Online</h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Lock your room with 12% advance (balance at check-in) or pay 100% online for instant check-in.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── FAQ Section ── */}
                <div className="space-y-4 text-left">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-2">
                        {displayedFaqs.map((faq, i) => (
                            <div key={i} className="border-b border-slate-100 pb-3">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between py-1.5 text-left font-semibold text-slate-900 text-sm md:text-base cursor-pointer hover:text-brand-600 transition-colors"
                                >
                                    <span className="pr-4">{faq.question}</span>
                                    {openFaq === i ? (
                                        <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                </button>
                                {openFaq === i && (
                                    <div className="pt-1.5 text-slate-600 text-xs md:text-sm leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {faqs.length > 6 && (
                        <div className="pt-1">
                            <button
                                onClick={() => setShowAllFaqs(!showAllFaqs)}
                                className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                            >
                                {showAllFaqs ? "Show fewer questions ↑" : `View all ${faqs.length} questions ↓`}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Popular Searches & Stays Directory (Moved above footer) ── */}
                <div className="pt-6 border-t border-slate-100 text-left space-y-6">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                            Popular Searches & Hotel Directory
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Quick access to transit rooms, hourly stays, and destination listings.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
                        {/* Delhi Stays & Transit */}
                        <div className="md:col-span-6 space-y-2.5">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Delhi Stays & Transit Hubs</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {SEARCH_DIRECTORY["Delhi Stays & Transit Hubs"].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={item.href}
                                        className="text-xs text-slate-500 hover:text-brand-600 transition-colors truncate block"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Popular Holiday Destinations */}
                        <div className="md:col-span-3 space-y-2.5">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Destinations</h3>
                            <div className="space-y-2">
                                {SEARCH_DIRECTORY["Popular Holiday Destinations"].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={item.href}
                                        className="text-xs text-slate-500 hover:text-brand-600 transition-colors truncate block"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Travel & Booking Services */}
                        <div className="md:col-span-3 space-y-2.5">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Services & Explore</h3>
                            <div className="space-y-2">
                                {SEARCH_DIRECTORY["Travel & Booking Services"].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={item.href}
                                        className="text-xs text-slate-500 hover:text-brand-600 transition-colors truncate block"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
