'use client';

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";
import { PAGE_SEO, buildBreadcrumbSchema, SITE } from "@/lib/seo";

export default function ListPropertyLandingPage() {
    // ─── Calculator State ─────────────────────────────────────────────────────
    const [roomsCount, setRoomsCount] = useState<number>(10);
    const [avgDailyRate, setAvgDailyRate] = useState<number>(3000);
    const [occupancyRate, setOccupancyRate] = useState<number>(70);

    // Calculations
    const monthlyRoomNights = Math.round(roomsCount * 30 * (occupancyRate / 100));
    const grossMonthlyRevenue = monthlyRoomNights * avgDailyRate;
    const platformFee = Math.round(grossMonthlyRevenue * 0.12);
    const netTakeHome = grossMonthlyRevenue - platformFee;
    const legacyOtaFee = Math.round(grossMonthlyRevenue * 0.22);
    const extraSavings = legacyOtaFee - platformFee;

    // ─── FAQ State ────────────────────────────────────────────────────────────
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const toggleFaq = (idx: number) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    // ─── Structured SEO Schema ────────────────────────────────────────────────
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to List Your Hotel on GetHotelStays",
        description: "List your hotel or homestay on GetHotelStays. 12% flat commission, direct guest communication, and payout settlement within 2-3 days of payment receipt.",
        totalTime: "PT10M",
        estimatedCost: { "@type": "MonetaryAmount", currency: "INR", value: "0" },
        step: [
            { "@type": "HowToStep", position: 1, name: "Create Account", text: "Submit your basic owner and property details in 2 minutes." },
            { "@type": "HowToStep", position: 2, name: "Add Rooms & Rates", text: "Configure room categories, upload photos, and set nightly or hourly prices." },
            { "@type": "HowToStep", position: 3, name: "Verification", text: "Get verified within 2 hours by our dedicated partner desk." },
            { "@type": "HowToStep", position: 4, name: "Start Receiving Bookings", text: "Accept confirmed bookings with direct guest contact and bank payout settlement within 2-3 days after payment." },
        ],
    };

    // ─── Data Arrays (Pure Typography, Zero Clutter) ──────────────────────────
    const faqs = [
        {
            q: "What is the cost of listing a property?",
            a: "Listing is 100% free. There are no setup fees, no annual contracts, and no subscription charges. We charge a flat 12% commission only on completed, confirmed stays."
        },
        {
            q: "How and when are partner payouts transferred?",
            a: "For Pay-at-Hotel reservations, guests settle their full bill directly with your front desk upon arrival. For online prepaid bookings, payout settlement is transferred directly to your bank account within 2 to 3 business days after payment is received."
        },
        {
            q: "How does GetHotelStays compare to traditional booking portals?",
            a: "Traditional OTAs charge 18% to 25% commission and lock up your payouts for 15 to 30 days. We charge a flat 12%, transfer payouts within 2 to 3 business days after payment is received, and provide direct guest phone and WhatsApp numbers for smooth check-in coordination."
        },
        {
            q: "Can I manage room prices and block specific dates?",
            a: "Yes. Your Partner Dashboard provides real-time calendar and rate controls to update prices, create seasonal discounts, and block maintenance dates anytime."
        },
        {
            q: "Is day-use / hourly booking mandatory?",
            a: "No. Hourly day-use bookings are 100% optional. You can choose to enable or disable daytime slots (e.g., 3-hour or 6-hour transit stays) on individual rooms whenever you want."
        },
        {
            q: "What documents are required to get verified?",
            a: "You only need a valid government ID (Aadhaar or PAN) of the property owner or manager, property address proof or trade license (optional for small homestays), and high-resolution photographs of the property and rooms."
        },
        {
            q: "What happens if a guest cancels a booking?",
            a: "You choose your cancellation policy (Flexible, Moderate, or Strict). For late cancellations or no-shows on prepaid bookings, you receive compensation according to your chosen policy terms."
        }
    ];

    const propertyCategories = [
        {
            number: "01",
            title: "Boutique & City Hotels",
            description: "Independent boutique, business, and city center hotels seeking steady corporate and leisure travelers.",
            badge: "Top Demand"
        },
        {
            number: "02",
            title: "Homestays & Farmstays",
            description: "Authentic family-run homestays, rural cottages, and plantation retreats offering travelers warm local hospitality.",
            badge: "Popular"
        },
        {
            number: "03",
            title: "Guest Houses & B&Bs",
            description: "Cozy bed & breakfasts, transit lodges, and budget-friendly guest houses welcoming solo explorers and families.",
            badge: "High Booking Rate"
        },
        {
            number: "04",
            title: "Luxury Villas & Estates",
            description: "Private pool villas, coastal bungalows, and mountain chalets catering to private family and group getaways.",
            badge: "Fast Growing"
        },
        {
            number: "05",
            title: "Heritage Havelis & Palaces",
            description: "Historic havelis, castles, and experiential heritage retreats in Rajasthan, Varanasi, and Gujarat.",
            badge: "Cultural"
        },
        {
            number: "06",
            title: "Resorts & Wellness Retreats",
            description: "Scenic destination retreats, Ayurvedic spas, and jungle lodges for weekend and holiday getaways.",
            badge: "High ADR"
        },
        {
            number: "07",
            title: "Airport & Transit Stays",
            description: "Properties near airports and railway stations that monetize empty daytime slots with hourly transit stays.",
            badge: "2x Occupancy"
        },
        {
            number: "08",
            title: "Serviced Apartments & Suites",
            description: "Furnished apartments and aparthotels for corporate relocations and extended business stays.",
            badge: "Long Stay"
        }
    ];

    const whyPartnerCards = [
        {
            number: "01",
            title: "Flat 12% Platform Fee",
            desc: "Keep up to 10% more profit per booking compared to 18%–25% legacy OTAs.",
            stat: "88% Net Retention"
        },
        {
            number: "02",
            title: "2–3 Days Payout Settlement",
            desc: "Direct bank transfer within 2 to 3 business days after payment is received. No 30-day holds.",
            stat: "2–3 Days Settlement"
        },
        {
            number: "03",
            title: "Direct WhatsApp & Phone Contact",
            desc: "Communicate directly with your guests before arrival. Coordinate timings and reduce no-shows.",
            stat: "Zero Masked Numbers"
        },
        {
            number: "04",
            title: "Dual Hourly + Nightly Engine",
            desc: "Monetize vacant rooms between 10 AM and 5 PM with hourly bookings without affecting nightly guests.",
            stat: "+35% Day-Use Yield"
        },
        {
            number: "05",
            title: "Zero Setup or Annual Fees",
            desc: "100% free registration. No listing charges, no hidden maintenance deductions, no lock-in.",
            stat: "₹0 Onboarding"
        },
        {
            number: "06",
            title: "Dedicated Partner Desk",
            desc: "Real human account managers available on WhatsApp and phone for immediate assistance.",
            stat: "Direct Line Support"
        }
    ];

    const aiFeatures = [
        {
            number: "01",
            title: "AI Dynamic Rate Optimizer",
            desc: "Machine learning engine scans local events, city flight arrivals, and demand spikes to recommend optimal room rates for maximum RevPAR."
        },
        {
            number: "02",
            title: "Smart AI Guest Matching",
            desc: "Proprietary AI matches high-intent verified travelers to your specific property amenities (couple-friendly, pet-friendly, workspace)."
        },
        {
            number: "03",
            title: "Automated Day-Use Monetizer",
            desc: "Smart slot allocation automatically detects idle afternoon room inventory and sells 3-hour or 6-hour transit slots to business travelers."
        },
        {
            number: "04",
            title: "24/7 Multilingual AI Receptionist",
            desc: "Conversational AI assistant answers prospective guest queries about early check-in, parking, and house rules in 10+ languages instantly."
        }
    ];

    const howItWorksSteps = [
        {
            step: "01",
            title: "Register in 2 Minutes",
            desc: "Submit your basic owner information, property name, and city using our streamlined partner portal."
        },
        {
            step: "02",
            title: "Add Rooms & Pricing",
            desc: "Upload clean room photos, configure your standard nightly tariffs, and optionally turn on daytime hourly slots."
        },
        {
            step: "03",
            title: "Rapid Verification (< 2 Hrs)",
            desc: "Our dedicated onboarding team reviews your listing details and verifies your property for immediate activation."
        },
        {
            step: "04",
            title: "Receive Bookings & Payouts",
            desc: "Get instant WhatsApp booking alerts, welcome verified guests, and receive bank payout transfer within 2 to 3 days after payment."
        }
    ];

    const partnerFeatures = [
        {
            number: "01",
            title: "Real-time PMS & Inventory Sync",
            desc: "Update room availability, pause bookings for maintenance, and adjust tariffs across all categories with a single tap."
        },
        {
            number: "02",
            title: "Instant WhatsApp Booking Alerts",
            desc: "Receive real-time notifications with guest name, phone, check-in time, and payout status as soon as a reservation is made."
        },
        {
            number: "03",
            title: "Pay-at-Hotel & Prepaid Flexibility",
            desc: "Accept advance online payments or collect directly at your front desk upon guest check-in."
        },
        {
            number: "04",
            title: "Guest Identity Pre-Verification",
            desc: "Guests submit verified IDs prior to check-in, accelerating front desk arrival and guaranteeing property security."
        },
        {
            number: "05",
            title: "Comprehensive Revenue Analytics",
            desc: "Track Average Daily Rate (ADR), RevPAR, monthly occupancy trends, and automated settlement invoices."
        },
        {
            number: "06",
            title: "Multi-Property Hub",
            desc: "Manage multiple boutique hotels, homestays, or villa chains seamlessly under one unified partner login."
        }
    ];

    const listingRequirements = [
        {
            number: "01",
            title: "Owner or Manager ID",
            desc: "Government-issued photo identification (Aadhaar Card, PAN Card, or Passport)."
        },
        {
            number: "02",
            title: "Property Registration / Address Proof",
            desc: "Trade license, GST certificate, or electricity bill (optional for homestays)."
        },
        {
            number: "03",
            title: "High-Resolution Room Photos",
            desc: "Clear photos of bedrooms, attached bathrooms, reception lobby, and building facade."
        },
        {
            number: "04",
            title: "Bank Account for Settlements",
            desc: "Bank account number and IFSC code for direct payout transfers within 2 to 3 business days after payment."
        }
    ];

    const testimonials = [
        {
            name: "Vikram Rathore",
            role: "Owner",
            hotel: "Vedas Heritage Haveli",
            city: "Jaipur, Rajasthan",
            quote: "Direct WhatsApp contact with guests eliminated 90% of our previous no-shows. The flat 12% commission saved us over ₹1.4 Lakhs in OTA deductions in our first quarter alone.",
            boost: "+48% Occupancy"
        },
        {
            name: "Priya Fernandez",
            role: "Co-Founder",
            hotel: "Ocean Palms Private Villas",
            city: "North Goa",
            quote: "Settlement within 2 to 3 days of payment transformed our operational cash flow. We no longer wait 30 days like we had to with MakeMyTrip or Booking.com.",
            boost: "2–3 Days Payout"
        },
        {
            name: "Harpreet Singh",
            role: "General Manager",
            hotel: "Grand Aerocity Transit Hotel",
            city: "New Delhi Airport",
            quote: "Day-use hourly bookings between 11 AM and 5 PM allowed us to monetize rooms that used to sit empty during turnover hours. That alone generates ₹1.8L monthly extra profit.",
            boost: "+35% Daytime Yield"
        }
    ];

    const comparisonRows = [
        { feature: "Platform commission", gethotel: "Flat 12%", legacy: "18% – 25%" },
        { feature: "Payout cycle", gethotel: "Direct settlement within 2 to 3 days of payment", legacy: "15 to 30 days hold" },
        { feature: "Guest contact", gethotel: "Direct phone and WhatsApp", legacy: "Masked numbers only" },
        { feature: "Day-use / Hourly stays", gethotel: "Optional daytime monetization (3h/6h)", legacy: "Nightly only (rooms sit idle)" },
        { feature: "Setup & listing fee", gethotel: "₹0 Completely Free", legacy: "Often hidden onboarding fees" },
        { feature: "Partner support", gethotel: "Dedicated account manager on WhatsApp", legacy: "Automated ticket queue" },
        { feature: "Rate & inventory control", gethotel: "Instant 1-click update with zero penalties", legacy: "Complex rate-parity restrictions" },
    ];

    return (
        <div className="min-h-screen bg-transparent text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white no-scrollbar">
            <SEOHead
                title={PAGE_SEO.listProperty.title}
                description={PAGE_SEO.listProperty.description}
                keywords={PAGE_SEO.listProperty.keywords}
                ogUrl={`${SITE.url}/list-property`}
                canonicalUrl={`${SITE.url}/list-property`}
            />

            <main>
                {/* ─── SECTION 1: HERO SECTION (Full-Width Edge-to-Edge Banner) ─────────── */}
                <section className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[560px] md:min-h-[620px] flex items-center bg-neutral-900">
                    <picture className="absolute inset-0 w-full h-full">
                        <source media="(max-width: 639px)" srcSet="/images/list-property-hero-mobile.jpg" />
                        <source media="(min-width: 640px)" srcSet="/images/list-property-hero.jpg" />
                        <img
                            src="/images/list-property-hero.jpg"
                            alt="Partner Luxury Property"
                            className="w-full h-full object-cover object-center"
                            loading="eager"
                        />
                    </picture>

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 sm:from-black/80 sm:via-black/45 sm:to-transparent" />

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                        <div className="max-w-2xl text-left">
                            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3 sm:mb-4">
                                Partner Program
                            </span>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-4 sm:mb-5">
                                List your property on GetHotelStays.
                            </h1>
                            <p className="text-sm sm:text-lg text-neutral-200 leading-relaxed max-w-xl mb-8 sm:mb-10 font-normal">
                                A transparent marketplace for independent hotels, villas, and homestays across India. Flat 12% commission, direct guest communication, and payouts settled within 2 to 3 days.
                            </p>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                                <Link
                                    href="/list-property/register"
                                    className="inline-flex items-center justify-center px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40"
                                >
                                    List your property
                                </Link>
                                <a
                                    href="#calculator"
                                    className="inline-flex items-center justify-center px-7 py-3.5 bg-white/95 hover:bg-white text-neutral-900 text-sm font-medium rounded-lg transition-all shadow-sm backdrop-blur-sm"
                                >
                                    Estimate revenue
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Shimmering Motion Blue Glowing Light Divider ──────────── */}
                <div className="relative w-full h-[3px] overflow-hidden bg-slate-900/40 z-20">
                    <div className="absolute -top-1.5 inset-x-0 h-4 bg-blue-500/25 blur-sm pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400 to-transparent blur-[2px] opacity-90" />
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 2.4,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white via-cyan-300 to-transparent blur-[2px] opacity-100"
                    />
                </div>

                {/* ─── SECTION 2: TRUST BAR ────────────────────────────────────── */}
                <section className="border-b border-neutral-200/60 bg-white/50 backdrop-blur-xs py-10 sm:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                            <div className="p-4 rounded-xl bg-white/60 border border-neutral-200/60 shadow-2xs">
                                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">12%</p>
                                <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">Flat Platform Fee</p>
                                <span className="inline-block mt-2 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">₹0 Hidden Charges</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/60 border border-neutral-200/60 shadow-2xs">
                                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">100%</p>
                                <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">Free Lifetime Listing</p>
                                <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Zero Upfront Cost</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/60 border border-neutral-200/60 shadow-2xs">
                                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">2–3 Days</p>
                                <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">Direct Bank Settlement</p>
                                <span className="inline-block mt-2 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Once Payment Received</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/60 border border-neutral-200/60 shadow-2xs">
                                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">Direct</p>
                                <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">Guest Phone & WhatsApp</p>
                                <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Zero Masked Numbers</span>
                            </div>
                        </div>

                        {/* Trust Badges Bar (Pure Typography) */}
                        <div className="mt-8 pt-6 border-t border-neutral-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-neutral-600 font-medium">
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Payouts Settled within 2–3 Days
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Direct WhatsApp & Phone Guest Connect
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                100% Free Listing & No Lock-In Contracts
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Verified Indian Hospitality Network
                            </span>
                        </div>
                    </div>
                </section>

                {/* ─── SECTION: HOST FACTSHEET (Optimized for AI Engine Citations & Executive Quick Answers) ─── */}
                <section className="py-14 sm:py-16 border-b border-neutral-200/60 bg-neutral-50/60" aria-labelledby="factsheet-heading">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mb-8">
                            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 block mb-1">
                                Executive Factsheet
                            </span>
                            <h2 id="factsheet-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
                                GetHotelStays Host Program at a glance
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                                Key policies, commission rates, and settlement timelines for hoteliers and property hosts.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs">
                                <span className="text-xs font-mono font-bold text-neutral-400 block mb-1">01</span>
                                <h3 className="text-sm font-bold text-neutral-950 mb-1">Commission Model</h3>
                                <p className="text-xs text-neutral-600 leading-relaxed">
                                    Flat 12% on completed reservations only. Zero registration fees, zero annual charges, and no hidden maintenance deductions.
                                </p>
                            </div>
                            <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs">
                                <span className="text-xs font-mono font-bold text-neutral-400 block mb-1">02</span>
                                <h3 className="text-sm font-bold text-neutral-950 mb-1">Payout Timeline</h3>
                                <p className="text-xs text-neutral-600 leading-relaxed">
                                    Direct bank settlement (NEFT/IMPS) within 2 to 3 business days once payment is received. Pay-at-Hotel guests settle 100% on arrival.
                                </p>
                            </div>
                            <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs">
                                <span className="text-xs font-mono font-bold text-neutral-400 block mb-1">03</span>
                                <h3 className="text-sm font-bold text-neutral-950 mb-1">Direct Guest Connect</h3>
                                <p className="text-xs text-neutral-600 leading-relaxed">
                                    Full unmasked access to guest WhatsApp & phone numbers prior to arrival for check-in coordination and no-show prevention.
                                </p>
                            </div>
                            <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs">
                                <span className="text-xs font-mono font-bold text-neutral-400 block mb-1">04</span>
                                <h3 className="text-sm font-bold text-neutral-950 mb-1">Day-Use Monetization</h3>
                                <p className="text-xs text-neutral-600 leading-relaxed">
                                    Optional 3-hour and 6-hour daytime transit booking slots to generate extra revenue from vacant afternoon room turnover.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 3: WHY PARTNER WITH GHS? ────────────────────────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Host Advantage
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                Why partner with GetHotelStays?
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-3">
                                Built specifically for independent Indian hoteliers and villa hosts who are tired of high OTA commissions and delayed settlements.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {whyPartnerCards.map((card, idx) => (
                                <div 
                                    key={idx}
                                    className="border border-neutral-200/80 rounded-xl p-6 sm:p-7 bg-white/70 backdrop-blur-sm shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                                >
                                    <div>
                                        <span className="text-xs font-mono font-bold text-blue-600 mb-3 inline-block">
                                            {card.number}
                                        </span>
                                        <h3 className="text-lg font-semibold text-neutral-950 mb-2">{card.title}</h3>
                                        <p className="text-sm text-neutral-600 leading-relaxed mb-6">{card.desc}</p>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-100 text-xs font-semibold text-blue-600">
                                        <span>{card.stat}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 4: AI-POWERED HOSPITALITY ───────────────────────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60 bg-blue-50/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <div className="inline-block px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold mb-3">
                                GetHotelStays Intelligent Technology
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                AI-powered hospitality built to grow your revenue
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-3">
                                Automate pricing, eliminate vacant rooms during the day, and match high-intent travelers automatically.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {aiFeatures.map((feat, idx) => (
                                <div key={idx} className="border border-blue-100 rounded-xl p-6 bg-white/80 backdrop-blur-sm shadow-xs hover:border-blue-300 transition-colors">
                                    <span className="text-xs font-mono font-bold text-blue-600 mb-3 inline-block">
                                        {feat.number}
                                    </span>
                                    <h3 className="font-semibold text-neutral-950 text-base mb-2">{feat.title}</h3>
                                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 5: HOW IT WORKS ─────────────────────────────────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Simple Setup
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                How it works: Go live in 4 simple steps
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-3">
                                Zero technical hurdles. Our partner desk gets your hotel or homestay ready to take bookings in hours.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {howItWorksSteps.map((step, idx) => (
                                <div key={idx} className="border border-neutral-200/80 rounded-xl p-6 bg-white/70 backdrop-blur-sm shadow-xs relative flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-4 inline-block">
                                            STEP {step.step}
                                        </span>
                                        <h3 className="text-lg font-semibold text-neutral-950 mb-2">{step.title}</h3>
                                        <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-neutral-100 text-xs text-neutral-500 font-medium">
                                        <span>Instant confirmation</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 6: WHO CAN LIST? ────────────────────────────────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Property Categories
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                Who can list on GetHotelStays?
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-3">
                                Whether you run a 50-room city hotel, an authentic family homestay, a cozy guest house, or a luxury beach villa, GetHotelStays is built for you.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {propertyCategories.map((item, idx) => (
                                <div key={idx} className="border border-neutral-200/80 rounded-xl p-6 bg-white/70 backdrop-blur-sm shadow-xs hover:border-blue-200 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-mono font-bold text-neutral-400">
                                            {item.number}
                                        </span>
                                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-neutral-950 text-base mb-1.5">{item.title}</h3>
                                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 7: KEY FEATURES FOR PARTNERS ────────────────────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Partner Tools
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                Complete host control & management tools
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-3">
                                Everything you need to manage bookings, track payouts, and communicate with guests seamlessly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {partnerFeatures.map((feat, idx) => (
                                <div key={idx} className="border border-neutral-200/80 rounded-xl p-6 bg-white/70 backdrop-blur-sm shadow-xs">
                                    <span className="text-xs font-mono font-bold text-blue-600 mb-3 inline-block">
                                        {feat.number}
                                    </span>
                                    <h3 className="font-semibold text-neutral-950 text-base mb-2">{feat.title}</h3>
                                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ─── SECTION 9: LISTING REQUIREMENTS ─────────────────────────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Verification Checklist
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                What you need to list your property
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-3">
                                Keep these 4 basic items ready for rapid verification within 2 hours.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {listingRequirements.map((req, idx) => (
                                <div key={idx} className="border border-neutral-200/80 rounded-xl p-6 bg-white/70 backdrop-blur-sm shadow-xs flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-blue-600 mb-3 inline-block">
                                            {req.number}
                                        </span>
                                        <h3 className="font-semibold text-neutral-950 text-base mb-2">{req.title}</h3>
                                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{req.desc}</p>
                                    </div>
                                    <div className="mt-6 pt-3 border-t border-neutral-100 text-xs text-emerald-600 font-semibold">
                                        <span>Quick verification</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 10: COMMISSION & PAYMENTS (REVENUE CALCULATOR) ──── */}
                <section id="calculator" className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-xl mx-auto mb-14">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Earnings Estimator
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                Commission & payout calculator
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-2">
                                Adjust parameters to see your projected monthly host take-home at our flat 12% fee.
                            </p>
                        </div>

                        <div className="border border-neutral-200/80 rounded-2xl p-6 sm:p-10 bg-white/70 backdrop-blur-sm shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Sliders */}
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-600 font-medium">Rooms to list</span>
                                            <span className="font-bold text-neutral-950 text-base">{roomsCount} {roomsCount === 1 ? 'room' : 'rooms'}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={1}
                                            max={60}
                                            value={roomsCount}
                                            onChange={(e) => setRoomsCount(Number(e.target.value))}
                                            className="w-full accent-blue-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-600 font-medium">Average room rate (ADR)</span>
                                            <span className="font-bold text-neutral-950 text-base">₹{avgDailyRate.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={1000}
                                            max={15000}
                                            step={250}
                                            value={avgDailyRate}
                                            onChange={(e) => setAvgDailyRate(Number(e.target.value))}
                                            className="w-full accent-blue-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-600 font-medium">Estimated occupancy</span>
                                            <span className="font-bold text-neutral-950 text-base">{occupancyRate}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={5}
                                            max={100}
                                            step={5}
                                            value={occupancyRate}
                                            onChange={(e) => setOccupancyRate(Number(e.target.value))}
                                            className="w-full accent-blue-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
                                        />
                                    </div>

                                    <div className="text-xs text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
                                        <span>Estimated Room Nights:</span>
                                        <span className="font-semibold text-neutral-800">{monthlyRoomNights} nights / month</span>
                                    </div>
                                </div>

                                {/* Results Breakdown */}
                                <div className="bg-neutral-50/80 rounded-xl p-6 border border-neutral-200/70 flex flex-col justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Estimated Host Net Take-Home
                                        </p>
                                        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 mt-1">
                                            ₹{netTakeHome.toLocaleString()}
                                            <span className="text-sm font-normal text-neutral-500"> / month</span>
                                        </p>

                                        <div className="mt-6 pt-6 border-t border-neutral-200/70 space-y-3 text-sm">
                                            <div className="flex justify-between text-neutral-600">
                                                <span>Gross booking volume:</span>
                                                <span className="font-semibold text-neutral-900">₹{grossMonthlyRevenue.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-neutral-600">
                                                <span>GHS Platform Fee (12%):</span>
                                                <span className="font-semibold text-blue-600">-₹{platformFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-neutral-500">
                                                <span>Legacy OTA Fee (22%):</span>
                                                <span className="text-neutral-400 line-through">₹{legacyOtaFee.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-neutral-200/70">
                                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/70">
                                            <p className="text-xs text-emerald-800 font-semibold">
                                                You retain ₹{extraSavings.toLocaleString()} more per month vs legacy OTAs.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="mt-12 border border-neutral-200/80 rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm" aria-label="Comparison between GetHotelStays and traditional OTAs">
                                    <caption className="sr-only">Direct comparison of commission, payouts, and control between GetHotelStays and legacy OTAs</caption>
                                    <thead>
                                        <tr className="border-b border-neutral-200/70 bg-neutral-100/50">
                                            <th scope="col" className="py-3.5 px-5 font-semibold text-neutral-900">Feature</th>
                                            <th scope="col" className="py-3.5 px-5 font-semibold text-neutral-950 bg-neutral-100/70">GetHotelStays</th>
                                            <th scope="col" className="py-3.5 px-5 font-medium text-neutral-500">Traditional OTAs</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200/60">
                                        {comparisonRows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-neutral-100/40 transition-colors">
                                                <th scope="row" className="py-4 px-5 text-neutral-800 font-medium text-left">{row.feature}</th>
                                                <td className="py-4 px-5 font-semibold text-blue-700 bg-neutral-50/50">
                                                    {row.gethotel}
                                                </td>
                                                <td className="py-4 px-5 text-neutral-500">{row.legacy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 11: PARTNER TESTIMONIALS / SUCCESS STORIES ──────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Partner Stories
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                Trusted by independent hoteliers across India
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-3">
                                Real hoteliers sharing their experience with our transparent 12% fee and daily payouts.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                            {testimonials.map((t, idx) => (
                                <div key={idx} className="border border-neutral-200/80 rounded-xl p-6 sm:p-7 bg-white/70 backdrop-blur-sm shadow-xs flex flex-col justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-700 leading-relaxed italic mb-6">
                                            "{t.quote}"
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-neutral-950 text-sm">{t.name}</p>
                                                <p className="text-xs text-neutral-500">{t.role}, {t.hotel}</p>
                                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                                    {t.city}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                    {t.boost}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 12: FAQS ────────────────────────────────────────── */}
                <section className="py-20 sm:py-28 border-b border-neutral-200/60">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-xl mx-auto mb-14">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                                Common Inquiries
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
                                Frequently asked questions
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-2">
                                Clear, honest answers to common questions about listing and operations.
                            </p>
                        </div>

                        <div className="divide-y divide-neutral-200/70 border-t border-b border-neutral-200/70">
                            {faqs.map((faq, idx) => (
                                <div 
                                    key={idx} 
                                    className="py-5"
                                    itemScope 
                                    itemProp="mainEntity" 
                                    itemType="https://schema.org/Question"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full flex items-center justify-between text-left group cursor-pointer"
                                        aria-expanded={openFaq === idx}
                                    >
                                        <span itemProp="name" className="text-base font-semibold text-neutral-950 pr-4 group-hover:text-blue-600 transition-colors">
                                            {faq.q}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                                    </button>
                                    <div 
                                        itemScope 
                                        itemProp="acceptedAnswer" 
                                        itemType="https://schema.org/Answer"
                                        className={openFaq === idx ? "block" : "hidden sm:block sm:sr-only"}
                                    >
                                        <p itemProp="text" className="text-sm text-neutral-600 leading-relaxed mt-3 pr-6">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 13: BOTTOM CALL TO ACTION ────────────────────────── */}
                <section className="py-20 sm:py-24 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-block text-xs font-black uppercase tracking-widest text-sky-400 mb-3 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                            Start Hosting Today
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
                            Ready to maximize your hotel revenue with AI dynamic pricing?
                        </h2>
                        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
                            Join independent hotels and homestays across India. Transparent flat 12% commission, 2-3 days direct payout settlement, and direct WhatsApp guest contact.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/list-property/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-blue-600/30"
                            >
                                Register & List Your Property Now →
                            </Link>
                            <Link
                                href="/partner"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-all border border-white/15 backdrop-blur-sm"
                            >
                                Partner Central Login
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── SECTION 15: FOOTER (Handled automatically by ConditionalLayout) ─── */}
            </main>
        </div>
    );
}
