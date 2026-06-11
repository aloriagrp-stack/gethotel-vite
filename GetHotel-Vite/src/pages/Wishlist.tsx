

import { useWishlist } from "@/context/WishlistContext";
import { hotels } from "@/data/hotels";
import HotelCard from "@/components/hotels/HotelCard";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";

export default function WishlistPage() {
    const { wishlist } = useWishlist();
    
    // Filter hotels that are in the wishlist
    const wishlistedHotels = hotels.filter(hotel => wishlist.includes(hotel.id));

    return (
        <div className="min-h-screen bg-slate-50 pt-6 pb-20 px-4 md:px-8">
            <SEOHead title="My Wishlist | GetHotelStays" description="Your saved favorite hotels." noIndex />
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-gradient-to-br from-brand-200/30 to-transparent blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-gradient-to-br from-blue-200/20 to-transparent blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight">
                            Your <span className="text-brand-600">Wishlist</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            {wishlistedHotels.length} luxurious getaways saved for your next experience.
                        </p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {wishlistedHotels.length > 0 ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {wishlistedHotels.map((hotel, index) => (
                                <motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <HotelCard hotel={hotel} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[48px] border border-slate-100 shadow-sm px-6"
                        >
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 relative">
                                <Heart className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-brand-500/10 rounded-full blur-xl"
                                />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                                Your Wishlist is Empty
                            </h2>
                            <p className="text-slate-400 font-bold max-w-sm mb-10 leading-relaxed">
                                You haven't saved any hotels yet. Explore our collection and tap the heart icon to save your favorites.
                            </p>
                            <Link 
                                to="/hotels"
                                className="group flex items-center gap-3 px-8 py-4 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95"
                            >
                                Discover Elite Hotels
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recommendations Shortcut */}
                {wishlistedHotels.length > 0 && (
                    <div className="mt-24 p-10 bg-slate-950 rounded-[48px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-600/20 to-transparent pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-3xl font-display font-black text-white mb-2 italic">
                                    Want to see <span className="text-brand-400">more?</span>
                                </h3>
                                <p className="text-slate-400 font-bold">Based on your favorites, we have curated exclusive deals for you.</p>
                            </div>
                            <Link 
                                to="/hotels" 
                                className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl"
                            >
                                Explore Recommendations
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



