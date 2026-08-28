'use client';
import { useState } from "react";
import { MapPin, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeSEOContent() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            q: "Can unmarried couples book hotels with local IDs on GetHotelStays?",
            a: "Yes, 100%. Under Indian law, consenting adult citizens (18+) with valid original government photo IDs (Aadhaar, Voter ID, Passport, DL) are legally entitled to check into our verified couple-friendly partner hotels without moral policing or awkward questioning."
        },
        {
            q: "Why do I only pay 12% online? Is there any hidden surcharge at check-in?",
            a: "Zero hidden surcharges. Our 'Pay 12% Now' model lets you reserve your confirmed room instantly with just a 12% deposit online. The remaining 88% is paid directly at the hotel front desk upon check-in via UPI, cash, or card."
        },
        {
            q: "Can I book hourly rooms for 3 hours or 6 hours near Delhi Airport or Railway Station?",
            a: "Yes! Our flexible micro-stay options allow you to book 3-hour, 6-hour, or 12-hour slots near Indira Gandhi International Airport (T3/T2/T1) and New Delhi Railway Station (NDLS), perfect for transit layovers, fresh-ups, and business meetings."
        },
        {
            q: "Can international tourists and NRIs book hotels in India using overseas cards?",
            a: "Yes. Our secure checkout accepts all major international Visa, Mastercard, American Express, and PayPal payment options in USD, GBP, EUR, and AED with instant booking confirmation."
        }
    ];

    return (
        <section className="pt-4 pb-16 md:pb-24 bg-transparent border-t border-slate-200/40">
            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16">
                
                {/* ── Section 1: Brand & Platform Overview ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 space-y-4 text-left">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                            About <span className="text-brand-600">GetHotelStays</span> — India's Premier Booking Platform
                        </h2>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                            Welcome to GetHotelStays, the ultimate destination for seamless, flexible, and affordable <Link to="/delhi-hotels" className="text-brand-600 hover:underline">hotel booking in India</Link>. 
                            Designed to cater to modern travelers, corporate professionals, and tourists alike, GetHotelStays is redefining the 
                            hospitality landscape across the country.
                            {!isExpanded ? "..." : (
                                <>
                                    {" "}Whether you are searching for a <Link to="/hotels?starRating=5" className="text-brand-600 hover:underline">luxurious boutique stay</Link> for a weekend getaway, a 
                                    budget-friendly hotel in Delhi, or a convenient <Link to="/hourly-hotels-in-delhi" className="text-brand-600 hover:underline">hourly transit stay</Link> near airports and stations, our platform has you covered. 
                                    We feature a curated directory of 100% verified hotels. By combining state-of-the-art technology with customer-first policies, we ensure that booking hotels online is fast, 
                                    secure, and completely transparent. At GetHotelStays, we offer both full-day stays and hourly stay options at unbeatable prices. Experience our signature 'Pay 12% Now' model, where you secure your room online with a minimal deposit and settle the balance directly at the property upon check-in.
                                </>
                            )}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-brand-600 hover:text-brand-500 font-bold ml-1.5 focus:outline-none inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                            >
                                {isExpanded ? "Read Less" : "Read More"}
                            </button>
                        </p>
                    </div>
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-[380px] md:max-w-[450px] aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-200/60 shadow-lg group">
                            <img 
                                src="/seo_about_illustration.png" 
                                alt="GetHotelStays Illustration" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Stay Categories Grid (Clean on Background, No Cards) ── */}
                <div className="space-y-6 text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Flexible Stays for Every Type of Traveler
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-amber-600 uppercase tracking-wider block">Luxury & Heritage</span>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/hotels?starRating=5" className="hover:text-brand-600 hover:underline transition-colors">Luxury Resorts & Boutique Stays</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                World-class hotels, heritage palaces, and boutique resorts with premium amenities, fine dining, 
                                and top-tier hospitality for vacations and leisure stays.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">Affordable Comfort</span>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/hotels?priceRange=budget" className="hover:text-brand-600 hover:underline transition-colors">Budget-Friendly Hotels</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Highly rated, clean, and safe rooms equipped with all essential amenities like high-speed Wi-Fi, air conditioning, and fresh linen at value-for-money prices.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-rose-600 uppercase tracking-wider block">100% Privacy</span>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/couple-friendly-hotels-in-delhi" className="hover:text-brand-600 hover:underline transition-colors">Couple-Friendly Retreats</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Guaranteed zero harassment and welcoming atmosphere for consenting adult couples with hassle-free check-ins using local ID cards.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">Micro-Stays (3h/6h)</span>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/hourly-hotels-in-delhi" className="hover:text-brand-600 hover:underline transition-colors">Hourly Stays & Transit Rooms</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Flexible 3, 6, or 12-hour micro-stay bookings for travelers with flight layovers, short meetings, or quick freshen-ups near transit hubs.
                            </p>
                        </div>

                    </div>
                </div>

                {/* ── Section 3: The 3-Step Process ── */}
                <div className="space-y-6 text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        How It Works — Simple & Transparent Bookings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <div className="space-y-2">
                            <span className="text-4xl md:text-5xl font-black text-slate-300 font-mono">01</span>
                            <h3 className="text-lg font-bold text-slate-950">Search and Filter</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Pick your destination city and check-in dates. Choose between 'Full Day Stay' or 'Hourly Stay' and narrow down 
                                options by price, ratings, and verified amenities.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="text-4xl md:text-5xl font-black text-slate-300 font-mono">02</span>
                            <h3 className="text-lg font-bold text-slate-950">Select Room & Review</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Explore verified photo galleries, room inventories, transparent policies, and real traveler reviews to choose the perfect room.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="text-4xl md:text-5xl font-black text-slate-300 font-mono">03</span>
                            <h3 className="text-lg font-bold text-slate-950">Pay 12% Deposit & Confirm</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Reserve instantly with just 12% deposit online via UPI/Card. Pay the remaining 88% directly at the hotel front desk on arrival.
                            </p>
                        </div>

                    </div>
                </div>

                {/* ── Section 4: Operational Destinations (Clean on Background, No Cards) ── */}
                <div className="space-y-6 text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Featured Operational Destinations
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <h3 className="font-bold text-base">
                                    <Link to="/delhi-hotels" className="hover:text-brand-600 hover:underline transition-colors">Delhi Hotels</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                India's capital hub. Budget stays in Paharganj to 5-star luxury in Aerocity & CP. <Link to="/delhi-hotels" className="text-brand-600 hover:underline">Delhi Hotels</Link> starting ₹499 (Hourly) / ₹899 (Day).
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <h3 className="font-bold text-base">
                                    <Link to="/hotels-near-delhi-airport" className="hover:text-brand-600 hover:underline transition-colors">Near Delhi Airport (T3/Aerocity)</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Transit-friendly hotels in Mahipalpur & Aerocity. Free airport transfers and 3h/6h hourly layover rooms available 24/7.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <h3 className="font-bold text-base">
                                    <Link to="/hotels-near-new-delhi-railway-station" className="hover:text-brand-600 hover:underline transition-colors">Near New Delhi Railway Station</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Safe, clean stays within 2-5 mins walking distance of NDLS station and Paharganj main bazaar with free cloakroom storage.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <h3 className="font-bold text-base">
                                    <Link to="/jaipur-hotels" className="hover:text-brand-600 hover:underline transition-colors">Jaipur (Pink City)</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Royal Rajasthan stays. Heritage havelis, boutique properties near Hawa Mahal & Johari Bazaar with rich traditional hospitality.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <h3 className="font-bold text-base">
                                    <Link to="/udaipur-hotels" className="hover:text-brand-600 hover:underline transition-colors">Udaipur (City of Lakes)</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Romantic palace views & scenic lakeside retreats near Lake Pichola and Fateh Sagar with couple-friendly policies.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <h3 className="font-bold text-base">
                                    <Link to="/manali-hotels" className="hover:text-brand-600 hover:underline transition-colors">Manali & Shimla</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Himalayan mountain getaways. Forest view cottages, riverside resorts in Manali, and Mall Road stays in Shimla.
                            </p>
                        </div>

                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Link to="/delhi-hotels" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">All Delhi Hotels</Link>
                        <Link to="/couple-friendly-hotels-in-delhi" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Couple Friendly Delhi</Link>
                        <Link to="/hourly-hotels-in-delhi" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Hourly Stays Delhi</Link>
                        <Link to="/hotels-near-delhi-airport" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Near Delhi Airport</Link>
                        <Link to="/hotels-near-new-delhi-railway-station" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Near NDLS Station</Link>
                        <Link to="/hotels-in-connaught-place-delhi" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Connaught Place (CP)</Link>
                        <Link to="/hotels-in-karol-bagh-delhi" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Karol Bagh</Link>
                        <Link to="/hotels-in-south-delhi" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">South Delhi</Link>
                        <Link to="/jaipur-hotels" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Jaipur Hotels</Link>
                        <Link to="/udaipur-hotels" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Udaipur Hotels</Link>
                        <Link to="/manali-hotels" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Manali Hotels</Link>
                        <Link to="/shimla-hotels" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all">Shimla Hotels</Link>
                    </div>
                </div>

                {/* ── Section 4.5: Delhi Hotels — NRI & Budget Focus (Clean on Background, No Container Box) ── */}
                <div className="space-y-6 text-left">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                            Book Hotels in Delhi — Affordable Stays for NRIs & International Travelers
                        </h2>
                        <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                            Planning a trip to India this season? <Link to="/delhi-hotels" className="text-brand-600 hover:underline font-bold">Hotels in Delhi</Link> are your gateway to India's rich history, culture, and business opportunities. 
                            Whether you are an NRI flying in from <strong>USA, UK, UAE, Canada, or Australia</strong>, or an international tourist exploring the capital, 
                            GetHotelStays makes it easy to <Link to="/delhi-hotels" className="text-brand-600 hover:underline font-bold">book affordable hotels in Delhi</Link> with just 12% payment online.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/hotels-near-delhi-airport" className="hover:text-brand-600 hover:underline">Affordable Hotels Near Delhi Airport</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Budget hotels in Mahipalpur & Aerocity from ₹499/night. Free airport pickup, soundproof rooms, hourly stays available for transit travelers.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/hotels-near-new-delhi-railway-station" className="hover:text-brand-600 hover:underline">Budget Hotels in Paharganj & Karol Bagh</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Delhi's most affordable areas for budget travelers. Clean rooms starting from ₹500/night. Walking distance to New Delhi Railway Station.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/hotels-in-connaught-place-delhi" className="hover:text-brand-600 hover:underline">Luxury Hotels in Connaught Place & Aerocity</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                5-star luxury in central Delhi near Rajiv Chowk metro and business hubs. Premium amenities, fine dining, pool & spa.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/delhi-hotels" className="hover:text-brand-600 hover:underline">NRI Hotel Booking — Pay 12% Deposit</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                NRIs can book Delhi hotels using international cards, PayPal, or bank transfer in USD, GBP, or AED. Rest paid at hotel in INR.
                            </p>
                        </div>
                    </div>
                    <div className="pt-1">
                        <Link 
                            to="/delhi-hotels" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Explore All Delhi Hotels →
                        </Link>
                    </div>
                </div>

                {/* ── Section 5: Trust Signals & Value Propositions (Clean on Background, No Container Box) ── */}
                <div className="space-y-6 text-left">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                            Why Travelers Trust GetHotelStays
                        </h2>
                        <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                            When you choose GetHotelStays for your next hotel booking in India, you are choosing a partner dedicated 
                            to your comfort and security. We maintain absolute transparency to guarantee peace of mind.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-brand-600 uppercase tracking-wider block">Verified Hospitality</span>
                            <h3 className="font-bold text-slate-950 text-base">50-Point Property Audit</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Every hotel undergoes on-ground verification for cleanliness, functioning AC/Wi-Fi, sanitization, and staff behavior before listing.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">Financial Safety</span>
                            <h3 className="font-bold text-slate-950 text-base">Pay Only 12% Deposit</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                No need to block full payment upfront. Pay 12% to lock your room and pay the remaining 88% after seeing the room at check-in.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">Discretion Guaranteed</span>
                            <h3 className="font-bold text-slate-950 text-base">100% Couple Friendly</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Strict zero moral policing agreement signed by all partner properties. Local ID accepted with complete privacy.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Section 6: FAQ Accordion ── */}
                <div className="space-y-6 text-left">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="w-6 h-6 text-brand-600 shrink-0" />
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                            Frequently Asked Questions
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-slate-200/80 pb-4">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between py-2 text-left font-bold text-slate-900 text-sm md:text-base cursor-pointer hover:text-brand-600 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-brand-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                                </button>
                                {openFaq === i && (
                                    <div className="pt-2 text-slate-600 text-xs md:text-sm leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
