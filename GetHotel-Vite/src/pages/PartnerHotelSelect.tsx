import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hotelApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Hotel, MapPin, Star, ChevronRight, LogOut, Loader2, BedDouble, Plus } from "lucide-react";

export default function PartnerHotelSelect() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useNavigate();
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [entering, setEntering] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "hotel_admin")) {
            router("/partner");
            return;
        }
        if (user) fetchHotels();
    }, [user, authLoading]);

    const fetchHotels = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            const list = Array.isArray(res) ? res : (res.data || []);
            setHotels(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectHotel = (hotelId: number) => {
        setEntering(hotelId);
        sessionStorage.setItem("activeHotelId", String(hotelId));
        setTimeout(() => {
            router("/partner-dashboard");
        }, 600);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">
                        GetHotel<span className="text-blue-600 italic">Stays</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Portal</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-500 hidden sm:block">
                        Welcome, {user?.name?.split(" ")[0]}
                    </span>
                    <button
                        onClick={() => { logout(); router("/partner"); }}
                        className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-start pt-12 md:pt-20 p-6 md:p-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-4xl"
                >
                    {/* Heading */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Select a Property
                        </h2>
                        <p className="text-slate-400 font-medium mt-2 text-sm">
                            Click on a property to manage its dashboard
                        </p>
                    </div>

                    {hotels.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <BedDouble className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">No properties linked to your account yet.</p>
                            <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest mt-1">Contact support to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {hotels.map((hotel, i) => (
                                <motion.button
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    onClick={() => handleSelectHotel(hotel.id)}
                                    disabled={entering !== null}
                                    className="relative text-left bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group active:scale-[0.98] disabled:opacity-70"
                                >
                                    {/* Hotel Thumbnail */}
                                    <div className="h-36 w-full bg-slate-100 overflow-hidden relative">
                                        {hotel.thumbnail ? (
                                            <img
                                                src={hotel.thumbnail}
                                                alt={hotel.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                                                <Hotel className="w-10 h-10 text-blue-200" />
                                            </div>
                                        )}
                                        {/* Overlay on enter */}
                                        {entering === hotel.id && (
                                            <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            </div>
                                        )}
                                        {/* Rating Badge */}
                                        {hotel.rating && (
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                <span className="text-[10px] font-black text-slate-700">{parseFloat(hotel.rating).toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-5">
                                        <h3 className="font-black text-slate-900 text-base tracking-tight uppercase group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {hotel.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1 line-clamp-1">
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            {hotel.city}{hotel.address ? `, ${hotel.address}` : ""}
                                        </p>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                hotel.status === "active"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-600"
                                            }`}>
                                                {hotel.status || "Active"}
                                            </span>
                                            <div className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Manage</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}

                            {/* '+' Register New Property Card */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: hotels.length * 0.07 }}
                                onClick={() => router("/list-property")}
                                className="relative bg-slate-50/50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-white rounded-2xl overflow-hidden p-6 transition-all duration-300 group flex flex-col justify-between items-center text-center min-h-[300px] active:scale-[0.98]"
                            >
                                <div className="my-auto flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-base tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                                            Register Property
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-bold mt-1 max-w-[200px]">
                                            List a new hotel, villa, or resort in your group account
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full flex items-center justify-center gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest pt-4 border-t border-slate-100 group-hover:gap-2 transition-all">
                                    <span>Get Started</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
