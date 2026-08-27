'use client';
import { useState } from "react";
import { MapPin, ShieldCheck, Clock, Wallet, HelpCircle, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeSEOContent() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="pt-0 pb-16 md:pt-4 md:pb-24 bg-transparent border-t border-white/20">
            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">
                
                {/* ── Section 1: Brand & Platform Overview ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                            About <span className="text-brand-600">GetHotelStays</span> — India's Premier Booking Platform
                        </h2>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                            Welcome to GetHotelStays, the ultimate destination for seamless, flexible, and affordable <Link to="/hotels" className="text-brand-600 hover:underline">hotel booking in India</Link>. 
                            Designed to cater to modern travelers, corporate professionals, and tourists alike, GetHotelStays is redefining the 
                            hospitality landscape across the country.
                            {!isExpanded ? "..." : (
                                <>
                                    {" "}Whether you are searching for a <Link to="/hotels?starRating=5" className="text-brand-600 hover:underline">luxurious resort</Link> for a weekend getaway, a 
                                    budget-friendly hotel for business travel, or a convenient <Link to="/hotels?stayType=hourly" className="text-brand-600 hover:underline">hourly stay</Link> near transit hubs, our platform has you covered. 
                                    We feature a massive directory of verified hotels and properties in India's top cities and scenic hotspots. 
                                    By combining state-of-the-art technology with customer-centric policies, we ensure that booking hotels online is fast, 
                                    secure, and completely transparent. At GetHotelStays, we believe that travel should be flexible, which is why we offer 
                                    both full-day stays and hourly stay options at unbeatable prices. Experience the next generation of lodging services 
                                    with our signature 'Pay 12% Now' model, where you secure your room online with a minimal deposit and settle the 
                                    balance directly at the property upon check-in. Join millions of satisfied travelers who trust us as their go-to 
                                    hotel booking platform in India.
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
                        <div className="relative w-full max-w-[380px] md:max-w-[450px] aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-white/40 shadow-xl group">
                            <img 
                                src="/seo_about_illustration.png" 
                                alt="GetHotelStays Illustration" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                            {/* Ambient overlay matching visual guidelines */}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-600/10 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Stay Categories Grid ── */}
                <div className="space-y-6">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Flexible Stays for Every Type of Traveler
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] hover:shadow-xl transition-all duration-300 space-y-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Compass className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/hotels?starRating=5" className="hover:text-brand-600 hover:underline transition-colors">Luxury Resorts & Boutique Hotels</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Indulge in the finest hospitality India has to offer. Our luxury category features world-class hotels, 
                                heritage palaces, and boutique resorts that offer premium amenities, infinity pools, fine dining restaurants, 
                                and top-tier spa services. Perfect for family holidays, honeymoons, or premium leisure stays.
                            </p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] hover:shadow-xl transition-all duration-300 space-y-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/hotels?priceRange=budget" className="hover:text-brand-600 hover:underline transition-colors">Budget-Friendly Hotels</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Travel smart without compromising on comfort. Our budget category includes highly rated, clean, and safe 
                                rooms equipped with all essential amenities like free Wi-Fi, air conditioning, clean linen, and breakfast 
                                options. Ideal for solo travelers, backpackers, and business executives looking for value-for-money stays.
                            </p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] hover:shadow-xl transition-all duration-300 space-y-3">
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/hotels" className="hover:text-brand-600 hover:underline transition-colors">Couple-Friendly Retreats</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                We prioritize your privacy and peace of mind. Our curated couple-friendly hotels guarantee a welcoming 
                                atmosphere for consenting adults, complete with secure surroundings, hassle-free check-ins using local ID cards, 
                                and exceptional service.
                            </p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] hover:shadow-xl transition-all duration-300 space-y-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">
                                <Link to="/hotels?stayType=hourly" className="hover:text-brand-600 hover:underline transition-colors">Hourly Stays & Transit Rooms</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Why pay for a full day when you only need a room for a few hours? Our pioneering hourly stay booking 
                                service allows you to book micro-stays for 3, 6, or 12 hours. It is the perfect solution for travelers with 
                                long layovers, quick freshen-ups, business meetings, or short transits near major airports.
                            </p>
                        </div>

                    </div>
                </div>

                {/* ── Section 3: The 3-Step Process ── */}
                <div className="space-y-6">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        How It Works — Simple & Transparent Bookings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <div className="space-y-3">
                            <span className="text-5xl font-black text-slate-300">01</span>
                            <h3 className="text-lg font-bold text-slate-950">Search and Filter</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Enter your destination city or search for a specific hotel name. Pick your check-in dates and select 
                                whether you want a 'Full Day Stay' or an 'Hourly Stay'. Use our advanced smart filters to narrow down 
                                options by price range, star rating, verified amenities, or hourly durations.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <span className="text-5xl font-black text-slate-300">02</span>
                            <h3 className="text-lg font-bold text-slate-950">Select Room & Review</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Explore detailed property listings complete with verified high-resolution photo galleries, room 
                                inventories, check-in policies, and authentic guest reviews. Compare room rates, check what amenities 
                                are included, and choose the deal that best fits your itinerary.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <span className="text-5xl font-black text-slate-300">03</span>
                            <h3 className="text-lg font-bold text-slate-950">Pay 12% Deposit & Confirm</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Confirm your reservation by paying a secure 12% booking deposit online using credit/debit cards, UPI, 
                                net banking, or international payment systems. The remaining 88% is paid directly at the hotel front 
                                desk when you check in. Receive instant email confirmation and your booking ID within seconds!
                            </p>
                        </div>

                    </div>
                </div>

                {/* ── Section 4: Destinations & Local Presence ── */}
                <div className="space-y-6">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Top Indian Destinations to Book Stays
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold">
                                    <Link to="/delhi-hotels" className="hover:text-brand-600 hover:underline transition-colors">Delhi</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Budget to luxury hotels in India's capital. Book affordable stays in Paharganj or 5-star luxury in Aerocity & Connaught Place. <Link to="/delhi-hotels" className="text-brand-600 hover:underline">Delhi Hotels</Link> starting ₹699/night.
                            </p>
                        </div>

                        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold">
                                    <Link to="/hotels-in/mumbai" className="hover:text-brand-600 hover:underline transition-colors">Mumbai</Link> & <Link to="/hotels-in/pune" className="hover:text-brand-600 hover:underline transition-colors">Pune</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Financial capital & IT hub. Book business hotels in BKC, luxury stays at Juhu beach, or corporate hotels in Pune. <Link to="/hotels-in/mumbai" className="text-brand-600 hover:underline">Mumbai Hotels</Link> from ₹999.
                            </p>
                        </div>

                        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold">
                                    <Link to="/hotels-in/bangalore" className="hover:text-brand-600 hover:underline transition-colors">Bangalore</Link> & <Link to="/hotels-in/hyderabad" className="hover:text-brand-600 hover:underline transition-colors">Hyderabad</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                India's tech capitals. Find hourly stays near business parks or premium hotels in city centers. <Link to="/hotels-in/bangalore" className="text-brand-600 hover:underline">Bangalore Hotels</Link> & <Link to="/hotels-in/hyderabad" className="text-brand-600 hover:underline">Hyderabad Hotels</Link>.
                            </p>
                        </div>

                        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold">
                                    <Link to="/goa-hotels" className="hover:text-brand-600 hover:underline transition-colors">Goa Beach Resorts</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Beach holiday paradise. Serene resorts in South Goa, party stays in North Goa. <Link to="/goa-hotels" className="text-brand-600 hover:underline">Hotels in Goa</Link> with hourly stays & beach access.
                            </p>
                        </div>

                        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold">
                                    <Link to="/jaipur-hotels" className="hover:text-brand-600 hover:underline transition-colors">Jaipur</Link> & <Link to="/udaipur-hotels" className="hover:text-brand-600 hover:underline transition-colors">Udaipur</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Royal Rajasthan. Heritage properties, palace stays in Udaipur & boutique hotels in Pink City Jaipur. <Link to="/jaipur-hotels" className="text-brand-600 hover:underline">Jaipur Hotels</Link> & <Link to="/hotels-in/jodhpur" className="text-brand-600 hover:underline">Jodhpur Hotels</Link>.
                            </p>
                        </div>

                        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 text-slate-950">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold">
                                    <Link to="/shimla-hotels" className="hover:text-brand-600 hover:underline transition-colors">Shimla</Link> & <Link to="/manali-hotels" className="hover:text-brand-600 hover:underline transition-colors">Manali</Link>
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Himalayan getaways. Forest lodges on Mall Road, luxury mountain resorts in Manali. <Link to="/shimla-hotels" className="text-brand-600 hover:underline">Shimla Hotels</Link> & <Link to="/hotels-in/darjeeling" className="text-brand-600 hover:underline">Darjeeling Hotels</Link>.
                            </p>
                        </div>

                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <Link to="/hotels-in/chennai" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Chennai Hotels</Link>
                        <Link to="/hotels-in/kolkata" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Kolkata Hotels</Link>
                        <Link to="/hotels-in/ahmedabad" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Ahmedabad Hotels</Link>
                        <Link to="/hotels-in/lucknow" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Lucknow Hotels</Link>
                        <Link to="/hotels-in/amritsar" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Amritsar Hotels</Link>
                        <Link to="/hotels-in/varanasi" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Varanasi Hotels</Link>
                        <Link to="/hotels-in/agra" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Agra Hotels</Link>
                        <Link to="/hotels-in/coimbatore" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Coimbatore Hotels</Link>
                        <Link to="/hotels-in/indore" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Indore Hotels</Link>
                        <Link to="/hotels-in/bhopal" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Bhopal Hotels</Link>
                        <Link to="/hotels-in/chandigarh" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Chandigarh Hotels</Link>
                        <Link to="/hotels-in/nagpur" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Nagpur Hotels</Link>
                        <Link to="/hotels-in/kochi" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Kochi Hotels</Link>
                        <Link to="/hotels-in/mysore" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Mysore Hotels</Link>
                        <Link to="/hotels-in/madurai" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Madurai Hotels</Link>
                        <Link to="/hotels-in/surat" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Surat Hotels</Link>
                        <Link to="/hotels-in/srinagar" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Srinagar Hotels</Link>
                        <Link to="/hotels-in/rishikesh" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Rishikesh Hotels</Link>
                        <Link to="/hotels-in/haridwar" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Haridwar Hotels</Link>
                        <Link to="/hotels-in/jaisalmer" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Jaisalmer Hotels</Link>
                        <Link to="/hotels-in/ooty" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Ooty Hotels</Link>
                        <Link to="/hotels-in/munnar" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Munnar Hotels</Link>
                        <Link to="/hotels-in/alleppey" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Alleppey Hotels</Link>
                        <Link to="/hotels-in/coorg" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Coorg Hotels</Link>
                        <Link to="/hotels-in/puducherry" className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all">Puducherry Hotels</Link>
                    </div>
                </div>

                {/* ── Section 4.5: Delhi Hotels — NRI & Budget Focus ── */}
                <div className="space-y-6 bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/60 rounded-[2.5rem] p-8 md:p-12">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                            Book Hotels in Delhi — Affordable Stays for NRIs & International Travelers
                        </h2>
                        <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                            Planning a trip to India this season? <Link to="/delhi-hotels" className="text-brand-600 hover:underline font-bold">Hotels in Delhi</Link> are your gateway to India's rich history, culture, and business opportunities. 
                            Whether you are an NRI flying in from <strong>USA, UK, UAE, Canada, or Australia</strong>, or an international tourist exploring the capital, 
                            GetHotelStays makes it easy to <Link to="/delhi-hotels" className="text-brand-600 hover:underline font-bold">book affordable hotels in Delhi</Link> with just 12% payment online.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-50 space-y-2">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/delhi-hotels" className="hover:text-brand-600">Affordable Hotels Near Delhi Airport</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium">
                                Budget hotels in Mahipalpur & Aerocity from ₹699/night. Free airport pickup, soundproof rooms, hourly stays available for transit travelers. Book from anywhere in the world.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-50 space-y-2">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/delhi-hotels" className="hover:text-brand-600">Budget Hotels in Paharganj & Karol Bagh</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium">
                                Delhi's most affordable areas for budget travelers. Clean rooms starting from ₹500/night. Walking distance to New Delhi Railway Station, local markets & street food. Verified & safe.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-50 space-y-2">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/delhi-hotels" className="hover:text-brand-600">Luxury Hotels in Connaught Place & Aerocity</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium">
                                5-star luxury in central Delhi. World-class hotels near India Gate, shopping districts & business hubs. Premium amenities, fine dining, pool & spa. Pay 12% now, rest at hotel.
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-50 space-y-2">
                            <h3 className="font-bold text-slate-950 text-sm">
                                <Link to="/delhi-hotels" className="hover:text-brand-600">NRI Hotel Booking — Pay in Your Currency</Link>
                            </h3>
                            <p className="text-slate-500 text-xs font-medium">
                                NRIs can book Delhi hotels using international cards, PayPal, or bank transfer. Pay only 12% online in USD, GBP, or AED. Rest at hotel in INR. Trusted by 10,000+ overseas travelers.
                            </p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Link 
                            to="/delhi-hotels" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Explore All Delhi Hotels →
                        </Link>
                    </div>
                </div>

                {/* ── Section 5: Trust Signals & Value Propositions ── */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                            Why Travelers Trust GetHotelStays
                        </h2>
                        <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                            When you choose GetHotelStays for your next hotel booking in India, you are choosing a partner dedicated 
                            to your comfort and security. We maintain absolute transparency to guarantee peace of mind.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-950 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Zero Hidden Booking Charges
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                                What you see is what you pay. We do not add surprise booking fees, service taxes, or processing charges 
                                at checkout. All taxes are clearly detailed upfront so you can stay within your budget.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-950 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Rigorous 50-Point Quality Audit
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                                Every single hotel listed on our platform undergoes strict quality audits. We inspect clean bathrooms, 
                                functioning air conditioning, high-speed Wi-Fi, property safety measures, and staff hospitality to ensure 
                                consistency.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-950 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Zero Risk Booking (Pay 12% Now)
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                                Protect your finances by avoiding massive advance payments. Our unique booking model keeps you in control, 
                                allowing you to pay the majority of the room rate only after verifying the property in person during check-in.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-950 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Flexible Cancellation & Refund Policies
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                                Plans can change unexpectedly. That is why most of our partner hotels offer free cancellation and modification 
                                options up to 24 hours prior to check-in, giving you absolute freedom to adapt.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
