'use client';

import { useWishlist } from "@/context/WishlistContext";
import { hotels } from "@/data/hotels";
import HotelCard from "@/components/hotels/HotelCard";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "@/lib/navigation";
import SEOHead from "@/components/common/SEOHead";

export default function WishlistPage() {
    const { wishlist } = useWishlist();
    
    // Filter hotels that are in the wishlist
    const wishlistedHotels = hotels.filter(hotel => wishlist.includes(hotel.id));

    return (
        <div className="min-h-screen bg-slate-50/60 py-5 sm:py-8 md:py-12 px-3.5 sm:px-6 md:px-8">
            <SEOHead title="My Wishlist | GetHotelStays" description="Your saved favorite hotels." noIndex />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-200/70">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-slate-900 tracking-tight">
                            Saved Stays
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            {wishlistedHotels.length} {wishlistedHotels.length === 1 ? 'property' : 'properties'} saved
                        </p>
                    </div>
                    {wishlistedHotels.length > 0 && (
                        <Link 
                            to="/hotels"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors w-fit"
                        >
                            <span>Explore More Hotels</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {wishlistedHotels.length > 0 ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                        >
                            {wishlistedHotels.map((hotel, index) => (
                                <motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                                >
                                    <HotelCard hotel={hotel} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 sm:py-24 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm px-4 sm:px-6"
                        >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-300 border border-slate-100">
                                <Heart className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5 tracking-tight">
                                No Saved Stays Yet
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-sm mb-6 leading-relaxed">
                                Tap the heart icon on any hotel to save your favorite stays here.
                            </p>
                            <Link 
                                to="/hotels"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                            >
                                <span>Explore Hotels</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Minimal Bottom Banner */}
                {wishlistedHotels.length > 0 && (
                    <div className="mt-10 sm:mt-14 p-5 sm:p-7 bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                        <div>
                            <h3 className="text-base sm:text-lg font-black tracking-tight">
                                Looking for more options?
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                                Browse our complete collection of top-rated hotels and stays.
                            </p>
                        </div>
                        <Link 
                            to="/hotels" 
                            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl text-center transition-all shrink-0"
                        >
                            Browse All Hotels
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
