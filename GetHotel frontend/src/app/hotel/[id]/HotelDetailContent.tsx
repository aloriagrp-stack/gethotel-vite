"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    MapPin, 
    ChevronRight, 
    ChevronLeft,
    Check, 
    Loader2,
    Shield,
    Zap,
    TrendingUp,
    ShieldCheck,
    Plus,
    Minus,
    Clock,
    Users,
    X,
    Calendar,
    Phone,
    Star,
    Award,
    Coffee,
    Wifi,
    MessageSquare,
    Send
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ImageGallery from "@/components/hotels/ImageGallery";
import PriceBox from "@/components/hotels/PriceBox";
import { ratingLabel, amenityIcon, amenityLabel, formatDate, formatPrice } from "@/lib/utils";
import { hotelApi, messageApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Room {
    id: string | number;
    name: string;
    description?: string;
    pricePerNight: number;
    capacity?: number;
    maxOccupancy: number;
    sizeM2?: number;
    bedConfiguration?: string;
    isAvailable?: boolean;
    images?: string[];
    amenities?: string[];
}

interface Dining {
    enabled: boolean;
    list: { name: string; cuisine: string; time: string }[];
}

interface Policy {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
    children?: string;
    payment?: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface Review {
    id: string | number;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string } | null;
}

interface Hotel {
    id: string | number;
    name: string;
    tagline?: string;
    description: string;
    city: string;
    address: string;
    starRating: number;
    guestRating: number;
    reviewCount: number;
    pricePerNight: number;
    thumbnail: string;
    images?: string[];
    amenities?: string[];
    badge?: string;
    dining?: Dining;
    wellness?: { enabled: boolean; list: { name: string; icon: string; info: string }[] };
    faqs?: FAQ[];
    safety?: string[];
    policies?: Policy;
    reviews?: Review[];
    review?: Review[]; // backend may return either 'reviews' or 'review'
    qualityScore?: number;
    responseSpeed?: string;
    badges?: string;
    cancellationRate?: number;
    noShowRate?: number;
    bookingAcceptanceRate?: number;
    complaintsCount?: number;
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function HotelDetailContent({ initialHotel, id }: { initialHotel: Hotel, id: string }) {
    const router = useRouter();
    const [hotel] = useState<Hotel>(initialHotel);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});
    const [selectedDetailRoom, setSelectedDetailRoom] = useState<Room | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const { user: authUser } = useAuth();
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const handleSendMessage = async () => {
        if (!authUser) {
            router.push(`/login?redirect=/hotel/${id}`);
            return;
        }
        if (!messageContent.trim()) return;

        setIsSendingMessage(true);
        try {
            const res = await messageApi.sendMessage({
                hotelId: Number(id),
                content: messageContent
            });
            if (res.success) {
                alert("Bhai, message send ho gaya! Property owner jaldi reply karega.");
                setMessageContent("");
                setIsMessageModalOpen(false);
            }
        } catch (err: any) {
            alert(err.message || "Failed to send message");
        } finally {
            setIsSendingMessage(false);
        }
    };

    const totalSelectedRooms = Object.values(selectedRooms).reduce((sum, q) => sum + q, 0);
    const totalPrice = rooms.reduce((sum, room) => sum + (room.pricePerNight * (selectedRooms[room.id] || 0)), 0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 500);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsRes = await hotelApi.getRooms(id);
                setRooms(roomsRes.data || []);
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [id]);


    const safeParse = (data: any, fallback: any = []) => {
        if (!data) return fallback;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : fallback;
            } catch (e) {
                console.error("JSON parse error for field:", e);
                return fallback;
            }
        }
        return data;
    };


    const hotelImages = safeParse(hotel.images).filter((img: any) => typeof img === 'string' && img.trim() !== "");
    if (hotelImages.length === 0 && hotel.thumbnail) {
        if (hotel.thumbnail.trim() !== "") hotelImages.push(hotel.thumbnail);
    }
    // Final fallback
    if (hotelImages.length === 0) hotelImages.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80");

    const hotelAmenities = safeParse(hotel.amenities);
    const policies = safeParse(hotel.policies, {});
    const reviews: Review[] = hotel.review || hotel.reviews || [];


    const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);

    // Safety check for star rating to avoid Array(NaN) error
    const starCount = Math.max(0, Math.floor(Number(hotel.starRating) || 0));

    const [viewers, setViewers] = useState(4);
    useEffect(() => {
        const interval = setInterval(() => {
            setViewers(prev => Math.max(2, Math.min(12, prev + (Math.random() > 0.5 ? 1 : -1))));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Phase 1: Trust System - Badge Logic
    const performanceBadges = () => {
        const badges = [];
        if (hotel.guestRating >= 4.5) badges.push({ text: "Top Rated", icon: Star, color: "bg-gold-50 text-gold-600" });
        if (hotel.pricePerNight < 3000) badges.push({ text: "Best Value", icon: Zap, color: "bg-emerald-50 text-emerald-600" });
        badges.push({ text: "Fast Response", icon: Clock, color: "bg-blue-50 text-blue-600" });
        return badges;
    };

    return (
        <div className="min-h-screen bg-[#fcfdff] pt-12 text-slate-900 pb-20 overflow-x-hidden relative">
            {/* 100 Billion Dollar Sticky Conversion Bar */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div 
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        exit={{ y: -100 }}
                        className="fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-2xl border-b border-slate-100 h-20 flex items-center"
                    >
                        <div className="container-page flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:block">
                                    <h4 className="text-sm font-black text-slate-950 tracking-tight">{hotel.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(starCount)].map((_, i) => (
                                                <Star key={i} className="w-2 h-2 fill-gold-500 text-gold-500" />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{hotel.city}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:block text-right">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        <span className="text-brand-600 animate-pulse">●</span> {viewers} people viewing
                                    </p>
                                    <p className="text-lg font-black text-brand-600 italic">{formatPrice(hotel.pricePerNight)}</p>
                                </div>
                                <button 
                                    onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-3 bg-brand-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-brand-100 active:scale-95 uppercase tracking-[0.2em]"
                                >
                                    Reserve Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Rest of the UI elements */}
            <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-brand-50/40 to-transparent pointer-events-none -z-10" />
            
            <div className="container-page pt-4 pb-8 relative">
                {/* ... existing breadcrumb ... */}
                
                {/* Hotel Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1"
                    >
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-950 mb-4 tracking-tighter leading-[0.9] italic">
                            {hotel.name}
                        </h1>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-500">
                            <div className="flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
                                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                                <span className="text-sm font-bold text-slate-700">{hotel.address}</span>
                            </div>
                            {hotel.tagline && <p className="text-brand-600 font-bold italic text-lg sm:ml-2">"{hotel.tagline}"</p>}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <button 
                                onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-10 py-4 bg-brand-600 text-white text-xs font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-95 uppercase tracking-[0.2em]"
                            >
                                View Available Rooms
                            </button>
                            <button 
                                onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-10 py-4 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-[0.2em]"
                            >
                                Guest Reviews
                            </button>
                            <button 
                                onClick={() => setIsMessageModalOpen(true)}
                                className="px-10 py-4 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black rounded-2xl hover:bg-blue-100 transition-all active:scale-95 uppercase tracking-[0.2em] flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" /> Message Host
                            </button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center gap-5 bg-white p-5 rounded-[32px] shadow-premium border border-slate-50"
                    >
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1">Guest Rating</p>
                            <p className="text-sm font-black text-slate-950 italic">{ratingLabel(hotel.guestRating)}</p>
                            <p className="text-[10px] text-brand-600 font-bold mt-0.5">{(hotel.reviewCount || 0).toLocaleString()} Reviews</p>
                        </div>
                        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white italic shadow-xl shadow-brand-100">
                            {hotel.guestRating}
                        </div>
                    </motion.div>
                </div>

                {/* Main Gallery Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[48px] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100"
                >
                    {hotelImages.length > 0 ? (
                        <ImageGallery images={hotelImages} hotelName={hotel.name} />
                    ) : (
                        <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400 font-bold italic">
                            No imagery available for this property.
                        </div>
                    )}
                </motion.div>

                {/* Content Grid */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                    {/* Left Side: Information */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Highlights Row */}
                        <motion.div 
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                        >
                            {[
                                { icon: Award, label: "Top Rated", sub: "Guest Choice" },
                                { icon: Shield, label: "Secure", sub: "Stay Safe" },
                                { icon: Coffee, label: "Breakfast", sub: "Available" },
                                { icon: Wifi, label: "Fast WiFi", sub: "Free Access" }
                            ].map((item, i) => (
                                <motion.div key={i} variants={fadeInUp} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <item.icon className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.sub}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* About Section */}
                        <motion.section 
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">The Property</h2>
                                <div className="h-px bg-slate-200 flex-1" />
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 leading-[2] text-xl font-medium first-letter:text-7xl first-letter:font-black first-letter:text-brand-600 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] italic">
                                    {hotel.description}
                                </p>
                            </div>
                            
                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Built</p>
                                    <p className="text-lg font-black text-slate-900 italic">2018</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Floors</p>
                                    <p className="text-lg font-black text-slate-900 italic">12</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff</p>
                                    <p className="text-lg font-black text-slate-900 italic">24/7</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                                    <p className="text-lg font-black text-slate-900 italic">14:00</p>
                                </div>
                            </div>
                        </motion.section>

                        {/* Location Highlights - NEW */}
                        <motion.section 
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">Location Highlights</h2>
                                <div className="h-px bg-slate-200 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Zap className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Airport</p>
                                        <p className="text-sm font-black text-slate-900 italic">12.4 km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City Center</p>
                                        <p className="text-sm font-black text-slate-900 italic">2.1 km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Shield className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metro Station</p>
                                        <p className="text-sm font-black text-slate-900 italic">0.5 km</p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Amenities Cloud */}
                        {hotelAmenities && Array.isArray(hotelAmenities) && hotelAmenities.length > 0 && (
                            <motion.section 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-4 flex-1">
                                        <h2 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">Amenities & Perks</h2>
                                        <div className="h-px bg-slate-200 flex-1" />
                                    </div>
                                    <button 
                                        onClick={() => setShowAmenitiesModal(true)}
                                        className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-black transition-all"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                                    {hotelAmenities.slice(0, 6).map((amenity: string, i: number) => (
                                        <motion.div
                                            key={amenity + i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            viewport={{ once: true }}
                                            className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-100 hover:border-brand-200 hover:bg-white transition-all group shadow-sm hover:shadow-md"
                                        >
                                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-125 duration-500">
                                                {amenityIcon(amenity)}
                                            </span>
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                                                {amenityLabel(amenity)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Rooms List */}
                        <section id="rooms" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-10">
                                <h2 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">Available Room Categories</h2>
                                <div className="h-px bg-slate-200 flex-1" />
                            </div>
                            
                            <div className="space-y-6">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center gap-4">
                                        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Finding available suites...</p>
                                    </div>
                                ) : rooms.length > 0 ? (
                                    rooms.map((room, i) => (
                                        <motion.div
                                            key={room.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            viewport={{ once: true }}
                                            onClick={() => {
                                                setSelectedDetailRoom(room);
                                                setActiveImageIndex(0);
                                            }}
                                            className={`group relative overflow-hidden rounded-[40px] border p-1 transition-all duration-500 cursor-pointer ${
                                                room.isAvailable !== false
                                                ? "border-slate-100 bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                                : "border-slate-100 bg-slate-50 opacity-70"
                                            }`}
                                        >
                                            <div className="flex flex-col md:flex-row gap-6 p-5">
                                                {(() => {
                                                    const roomImages = safeParse(room.images);
                                                    const roomAmenities = safeParse(room.amenities);
                                                    
                                                    return (
                                                        <>
                                                            <div className="relative w-full md:w-64 aspect-[4/3] rounded-[32px] overflow-hidden shrink-0 shadow-lg ring-4 ring-slate-50">
                                                                {(() => {
                                                                    const validImages = roomImages.filter((img: any) => typeof img === 'string' && img.trim() !== "");
                                                                    const displayImage = validImages.length > 0 ? validImages[0] : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80";
                                                                    
                                                                    return (
                                                                        <Image
                                                                            src={displayImage}
                                                                            alt={room.name}
                                                                            fill
                                                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                                            sizes="300px"
                                                                            unoptimized
                                                                        />
                                                                    );
                                                                })()}
                                                            </div>
                                                            
                                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex flex-col gap-1">
                                                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{room.name}</h3>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black uppercase rounded animate-pulse">
                                                                                    Only 2 rooms left!
                                                                                </span>
                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Very high demand today</span>
                                                                            </div>
                                                                        </div>
                                                                        {room.isAvailable === false && (
                                                                            <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">Fully Booked</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em] flex items-center gap-3">
                                                                        {room.sizeM2 && <span>{room.sizeM2}m²</span>}
                                                                        {room.sizeM2 && room.bedConfiguration && <span className="w-1 h-1 bg-slate-300 rounded-full" />}
                                                                        {room.bedConfiguration && <span>{room.bedConfiguration}</span>}
                                                                        {room.maxOccupancy && <span className="w-1 h-1 bg-slate-300 rounded-full" />}
                                                                        {room.maxOccupancy && <span>Up to {room.maxOccupancy} Guests</span>}
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2 mt-5">
                                                                        {roomAmenities && Array.isArray(roomAmenities) && roomAmenities.slice(0, 5).map((a: string) => (
                                                                            <span key={a} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100">
                                                                                {a}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between mt-8 md:mt-0 pt-6 border-t border-slate-50">
                                                                    <div>
                                                                        <p className="text-2xl font-black text-slate-950">{formatPrice(room.pricePerNight)}</p>
                                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Price per night</p>
                                                                        <div className="mt-1 flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Pay only {formatPrice(Math.round(room.pricePerNight * 0.18))} now</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        {selectedRooms[room.id] > 0 ? (
                                                                            <div className="flex items-center gap-4 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl">
                                                                                <button 
                                                                                    onClick={() => setSelectedRooms(prev => ({ ...prev, [room.id]: Math.max(0, prev[room.id] - 1) }))}
                                                                                    className="p-1 hover:text-brand-400 transition-colors"
                                                                                >
                                                                                    <Minus className="w-4 h-4" />
                                                                                </button>
                                                                                <span className="text-sm font-black w-4 text-center">{selectedRooms[room.id]}</span>
                                                                                <button 
                                                                                    onClick={() => setSelectedRooms(prev => ({ ...prev, [room.id]: Math.min(10, prev[room.id] + 1) }))}
                                                                                    className="p-1 hover:text-brand-400 transition-colors"
                                                                                >
                                                                                    <Plus className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => setSelectedRooms(prev => ({ ...prev, [room.id]: 1 }))}
                                                                                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-brand-100 active:scale-95 uppercase tracking-[0.2em]"
                                                                            >
                                                                                Select Room
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-12 bg-slate-50 rounded-[40px] text-center border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold italic uppercase tracking-widest">All suites are currently occupied.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Policies & Details */}
                        <motion.section 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-xl"
                        >
                            <h2 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase mb-10">House Policies & Payment</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-100">
                                            <Zap className="w-6 h-6 text-white fill-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">Partial Payment Model</p>
                                            <p className="text-sm font-black text-slate-900 leading-tight">Pay only 18% now to secure your stay.</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">Remaining 82% can be paid directly at the hotel during check-in.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <Coffee className="w-6 h-6 text-brand-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timing</p>
                                            <p className="text-sm font-bold text-slate-800">Check-in: {policies?.checkIn || "14:00"}</p>
                                            <p className="text-sm font-bold text-slate-800">Check-out: {policies?.checkOut || "11:00"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <Check className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cancellation</p>
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                {policies?.cancellation || "Free cancellation until 48h before check-in."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <Shield className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest Safety</p>
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                Property follows premium hygiene protocols. Staff is fully vaccinated.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <Award className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membership</p>
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                StayEase Rewards members get 10% off on all spa treatments.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Review Showcase */}
                        <section className="space-y-10">
                            <div className="flex items-end justify-between">
                                <h2 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">Guest Stories</h2>
                                <Link 
                                    href={`/hotel/${hotel.id}/write-review`}
                                    className="px-6 py-3 bg-slate-950 text-white text-[10px] font-black rounded-2xl hover:bg-black transition-all uppercase tracking-widest shadow-xl shadow-slate-200"
                                >
                                    Share Your Experience
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.length > 0 ? (
                                    reviews.map((review, i) => (
                                        <motion.div 
                                            key={review.id || i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <div className="flex items-center gap-4 mb-6">
                                                {review.user?.name && (
                                                    <Image
                                                        src={`https://i.pravatar.cc/150?u=${review.user.name}`}
                                                        alt={review.user.name}
                                                        width={50}
                                                        height={50}
                                                        className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-500 ring-2 ring-slate-50"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-black text-slate-950 text-sm tracking-tight">{review.user?.name || "Verified Guest"}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, star) => (
                                                                <Star key={star} className={`w-2.5 h-2.5 ${star < review.rating ? 'fill-brand-600 text-brand-600' : 'fill-slate-100 text-slate-100'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{formatDate(review.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed font-medium italic opacity-90">
                                                "{review.comment}"
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full p-16 bg-white rounded-[40px] border border-dashed border-slate-200 text-center">
                                        <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Waiting for its first legend. Will it be you?</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Side: Sticky Pricing Card */}
                    <div className="hidden lg:block relative">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="sticky top-28"
                        >
                            <PriceBox
                                hotelId={hotel.id.toString()}
                                pricePerNight={hotel.pricePerNight}
                                totalSelectedRooms={totalSelectedRooms}
                                totalPrice={totalPrice}
                                selectedRooms={selectedRooms}
                            />
                            
                            {/* Upsell Card */}
                            <div className="mt-6 bg-brand-600 rounded-[32px] p-6 text-white shadow-xl shadow-brand-100 relative overflow-hidden group">
                                <Award className="absolute -right-4 -bottom-4 w-32 h-32 text-brand-500 opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                                <div className="relative z-10">
                                    <h4 className="font-black italic uppercase tracking-tighter text-xl mb-2">Member Perks</h4>
                                    <p className="text-xs font-bold text-brand-100 mb-4 opacity-80 leading-relaxed">
                                        Unlock secret prices and 24/7 VIP concierge support when you sign in.
                                    </p>
                                    <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-[0.2em] bg-white text-brand-600 px-4 py-2 rounded-full inline-block hover:scale-105 transition-transform">
                                        Join Now
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Dynamic Sticky Bottom Summary Bar - NEW */}
                <AnimatePresence>
                    {totalSelectedRooms > 0 && (
                        <motion.div 
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 sm:p-6"
                        >
                            <div className="container-page flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-brand-50 text-brand-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                                            {totalSelectedRooms} {totalSelectedRooms === 1 ? "Room" : "Rooms"} Selected
                                        </span>
                                        <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md animate-pulse">
                                            Pay only 18% Now
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-3 mt-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-950">{formatPrice(totalPrice)}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-base font-black text-emerald-600">{formatPrice(Math.round(totalPrice * 0.18))}</span>
                                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tight">Payable Online</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        const search = new URLSearchParams();
                                        Object.entries(selectedRooms).forEach(([id, qty]) => {
                                            if (qty > 0) search.set(`room_${id}`, qty.toString());
                                        });
                                        // Dynamically generate future dates for testing
                                        const today = new Date();
                                        const checkInDate = new Date(today);
                                        checkInDate.setDate(today.getDate() + 7); // 7 days from now
                                        const checkOutDate = new Date(checkInDate);
                                        checkOutDate.setDate(checkInDate.getDate() + 1); // 1 night stay

                                        search.set("checkIn", checkInDate.toISOString().split('T')[0]); 
                                        search.set("checkOut", checkOutDate.toISOString().split('T')[0]);
                                        search.set("guests", "1");
                                        router.push(`/booking/${hotel.id}?${search.toString()}`);
                                    }}
                                    className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-[0.2em] flex items-center gap-3"
                                >
                                    Proceed to Book
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Room Details Modal - PHASE 11 PREMIUM */}
                <AnimatePresence>
                    {selectedDetailRoom && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedDetailRoom(null)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
                            />
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh] lg:h-[700px]"
                            >
                                {/* Left: High Performance Image Slider */}
                                <div className="w-full lg:w-3/5 h-[300px] sm:h-[400px] lg:h-full bg-slate-100 relative group">
                                    {(() => {
                                        const roomImages = safeParse(selectedDetailRoom.images);
                                        const images = roomImages.length > 0 ? roomImages : ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80"];
                                        
                                        return (
                                            <>
                                                <Image 
                                                    src={images[activeImageIndex]} 
                                                    alt={selectedDetailRoom.name}
                                                    fill
                                                    className="object-cover transition-all duration-700"
                                                    priority
                                                    unoptimized
                                                />
                                                
                                                {/* Navigation Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                                                        }}
                                                        className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 hover:bg-white shadow-lg transition-all"
                                                    >
                                                        <ChevronLeft className="w-6 h-6" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                                                        }}
                                                        className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 hover:bg-white shadow-lg transition-all"
                                                    >
                                                        <ChevronRight className="w-6 h-6" />
                                                    </button>
                                                </div>

                                                {/* Indicators */}
                                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {images.map((_: any, idx: number) => (
                                                        <button 
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveImageIndex(idx);
                                                            }}
                                                            className={`h-1.5 rounded-full transition-all duration-500 ${activeImageIndex === idx ? "w-8 bg-white" : "w-2 bg-white/40"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    })()}
                                    
                                    <button 
                                        onClick={() => setSelectedDetailRoom(null)}
                                        className="absolute top-6 left-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 lg:hidden"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Right: Detailed Specs */}
                                <div className="w-full lg:w-2/5 flex flex-col p-8 sm:p-12 overflow-y-auto custom-scrollbar">
                                    <div className="hidden lg:flex justify-end mb-4">
                                        <button 
                                            onClick={() => setSelectedDetailRoom(null)}
                                            className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Suite Detail</span>
                                            <div className="h-px bg-slate-100 flex-1" />
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic mb-4">{selectedDetailRoom.name}</h2>
                                        
                                        <div className="flex flex-wrap gap-4 mb-8">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                                <Users className="w-4 h-4" /> {selectedDetailRoom.maxOccupancy} Guests
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                                <TrendingUp className="w-4 h-4" /> {selectedDetailRoom.sizeM2 || 250} sq. ft
                                            </div>
                                        </div>

                                        <p className="text-slate-600 leading-relaxed font-medium mb-10">
                                            {selectedDetailRoom.description || "Indulge in pure luxury with our meticulously designed suites. Every corner is crafted to provide you with an unforgettable experience of comfort and elegance."}
                                        </p>

                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Exclusive Amenities</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {safeParse(selectedDetailRoom.amenities).map((a: string) => (
                                                        <div key={a} className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-brand-600 rounded-full" />
                                                            <span className="text-xs font-bold text-slate-700">{a}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nightly Rate</span>
                                                    <span className="text-2xl font-black text-brand-600 italic">{formatPrice(selectedDetailRoom.pricePerNight)}</span>
                                                </div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-right">All-inclusive of taxes & fees</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4">
                                        <button 
                                            onClick={() => {
                                                setSelectedRooms(prev => ({ ...prev, [selectedDetailRoom.id]: (prev[selectedDetailRoom.id] || 0) + 1 }));
                                                setSelectedDetailRoom(null);
                                            }}
                                            className="flex-1 py-5 bg-brand-600 text-white font-black rounded-3xl hover:bg-brand-700 shadow-xl shadow-brand-100 transition-all uppercase tracking-widest text-xs"
                                        >
                                            Select This Room
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Amenities Modal */}
                <AnimatePresence>
                    {showAmenitiesModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAmenitiesModal(false)}
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 sm:p-12">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">All Amenities</h3>
                                        <button onClick={() => setShowAmenitiesModal(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {hotelAmenities.map((amenity: string, i: number) => (
                                            <div key={amenity + i} className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-brand-200 transition-all">
                                                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                                                    {amenityIcon(amenity)}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
                                                    {amenityLabel(amenity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* Message Host Modal */}
                <AnimatePresence>
                    {isMessageModalOpen && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMessageModalOpen(false)}
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 sm:p-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Inquiry</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Send a message to {hotel.name}</p>
                                        </div>
                                        <button onClick={() => setIsMessageModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                            <textarea 
                                                value={messageContent}
                                                onChange={(e) => setMessageContent(e.target.value)}
                                                placeholder="Bhai, kya availability hai? Extra bed mil jayega?..."
                                                className="w-full h-32 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                                            />
                                        </div>
                                        
                                        <button 
                                            onClick={handleSendMessage}
                                            disabled={isSendingMessage || !messageContent.trim()}
                                            className="w-full py-5 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest"
                                        >
                                            {isSendingMessage ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" /> Send Message
                                                </>
                                            )}
                                        </button>
                                        
                                        <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest">
                                            The property typically responds within an hour.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .container-page {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                    }
                    .shadow-premium {
                        box-shadow: 0 20px 80px rgba(0, 0, 0, 0.05);
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f5f9;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 10px;
                    }
                `}</style>
            </div>
        </div>
    );
}
