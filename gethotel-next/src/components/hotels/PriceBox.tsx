'use client';


import { useState, useEffect, useRef } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import {
    Calendar,
    Users,
    Shield,
    Check,
    Minus,
    Plus,
    ChevronDown,
    ChevronUp,
    Zap,
    Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, cn, formatDateLocal } from "@/lib/utils";

interface PriceBoxProps {
    hotelId: string;
    pricePerNight: number;
    initialCheckIn?: string;
    initialCheckOut?: string;
    initialGuests?: number;
    totalSelectedRooms?: number;
    totalPrice?: number;
    selectedRooms?: Record<string, number>;
}

export default function PriceBox({
    hotelId,
    pricePerNight,
    initialCheckIn = "",
    initialCheckOut = "",
    initialGuests = 2,
    totalSelectedRooms = 0,
    totalPrice = 0,
    selectedRooms = {},
}: PriceBoxProps) {
    const router = useRouter();
    const today = formatDateLocal(new Date());

    // Default check-in = tomorrow, check-out = day after tomorrow
    const defaultCheckIn = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return formatDateLocal(d);
    })();
    const defaultCheckOut = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return formatDateLocal(d);
    })();

    const [checkIn, setCheckIn] = useState(initialCheckIn || defaultCheckIn);
    const [checkOut, setCheckOut] = useState(initialCheckOut || defaultCheckOut);
    const [guests, setGuests] = useState(initialGuests);
    const [showGuests, setShowGuests] = useState(false);

    const checkInRef = useRef<HTMLInputElement>(null);
    const checkOutRef = useRef<HTMLInputElement>(null);

    // Compute nights
    const nights = (() => {
        if (!checkIn || !checkOut) return 0;
        const diff =
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24);
        return Math.max(0, Math.floor(diff));
    })();

    // Use totalPrice if rooms are selected, otherwise use base pricePerNight
    // Use totalPrice if rooms are selected, otherwise use base pricePerNight
    const activePrice = totalSelectedRooms > 0 ? totalPrice : pricePerNight;
    const total = activePrice * nights;

    // Auto-fix checkout if before check-in
    useEffect(() => {
        if (checkIn && checkOut && checkOut <= checkIn) {
            const d = new Date(checkIn);
            d.setDate(d.getDate() + 2);
            setCheckOut(formatDateLocal(d));
        }
    }, [checkIn, checkOut]);

    const handleBook = () => {
        if (totalSelectedRooms === 0) {
            document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        const params = new URLSearchParams({
            checkIn,
            checkOut,
            guests: String(guests),
        });

        // Add selected rooms
        Object.entries(selectedRooms).forEach(([id, qty]) => {
            if (qty > 0) {
                params.append(`room_${id}`, String(qty));
            }
        });

        router(`/booking/${hotelId}?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-premium relative transition-all duration-500">
            {/* Scarcity Tag */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap z-10">
                <Zap className="w-3 h-3 fill-white" />
                High Demand: 2 Rooms Left
            </div>

            {/* Price Header */}
            <div className="mb-8 min-h-[60px] flex items-end justify-between">
                {totalSelectedRooms > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1"
                    >
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">{totalSelectedRooms} Room{totalSelectedRooms > 1 ? 's' : ''} Selected</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-950 tracking-tight">
                                {formatPrice(totalPrice)}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">/ night</span>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest animate-pulse">Select a room below to book</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">To view exact pricing and availability</p>
                    </div>
                )}
                <div className="bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Best Rate</span>
                </div>
            </div>

            {/* Booking Form */}
            <div className="space-y-4 mb-8">
                {/* Date Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div 
                        onClick={() => checkInRef.current?.showPicker()}
                        className="p-4 bg-slate-50/50 rounded-[24px] border border-slate-100 hover:border-brand-200 transition-colors cursor-pointer group"
                    >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                        <input
                            ref={checkInRef}
                            type="date"
                            value={checkIn}
                            min={today}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-black text-slate-900 w-full cursor-pointer uppercase tracking-tight"
                        />
                    </div>
                    <div 
                        onClick={() => checkOutRef.current?.showPicker()}
                        className="p-4 bg-slate-50/50 rounded-[24px] border border-slate-100 hover:border-brand-200 transition-colors cursor-pointer group"
                    >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                        <input
                            ref={checkOutRef}
                            type="date"
                            value={checkOut}
                            min={checkIn || today}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-black text-slate-900 w-full cursor-pointer uppercase tracking-tight"
                        />
                    </div>
                </div>

                {/* Guests Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowGuests(!showGuests)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50/50 rounded-[24px] border border-slate-100 hover:border-brand-200 transition-all text-left"
                    >
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Occupancy</p>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {guests} {guests === 1 ? "Guest" : "Guests"}
                            </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showGuests ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showGuests && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-[32px] border border-slate-100 shadow-premium p-6 z-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Adults</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Ages 13 or above</p>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <button 
                                            onClick={() => setGuests(Math.max(1, guests - 1))}
                                            className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                                        >
                                            <Minus className="w-4 h-4 text-slate-900" />
                                        </button>
                                        <span className="text-lg font-black text-slate-950 w-4 text-center italic">{guests}</span>
                                        <button 
                                            onClick={() => setGuests(Math.min(10, guests + 1))}
                                            className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 text-slate-900" />
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowGuests(false)}
                                    className="w-full mt-6 py-3 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl"
                                >
                                    Confirm
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Price Summary */}
            {nights > 0 && totalSelectedRooms > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 space-y-3 px-1 overflow-hidden"
                >
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{formatPrice(activePrice)} × {nights} nights</span>
                        <span className="text-slate-900">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                        <span>No Hidden Charges</span>
                        <span>Included</span>
                    </div>
                    <div className="h-px bg-slate-50 my-2" />
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-black text-slate-950 uppercase tracking-tighter italic">All-inclusive Room Total</span>
                        <span className="text-2xl font-black text-slate-950 tracking-tight italic">{formatPrice(total)}</span>
                    </div>

                    {/* Deposit Breakdown */}
                    <div className="bg-brand-50/50 rounded-2xl p-4 border border-brand-100 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Pay Now (12%)</span>
                            <span className="text-lg font-black text-brand-600 italic">{formatPrice(Math.round(total * 0.12))}</span>
                        </div>
                        <div className="flex justify-between items-center opacity-60">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pay at Hotel (88%)</span>
                            <span className="text-sm font-black text-slate-700 italic">{formatPrice(total - Math.round(total * 0.12))}</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* CTA */}
            <button
                onClick={handleBook}
                disabled={nights === 0}
                className={cn(
                    "w-full py-5 text-white font-black rounded-[24px] shadow-xl shadow-brand-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3",
                    totalSelectedRooms > 0 ? "bg-brand-600 hover:bg-brand-700" : "bg-slate-900 hover:bg-black"
                )}
            >
                {nights === 0 
                    ? "Select Dates" 
                    : totalSelectedRooms === 0 
                        ? "Select Room to Proceed" 
                        : "Confirm Booking"
                }
                <Zap className={`w-3.5 h-3.5 fill-white ${totalSelectedRooms === 0 ? 'animate-pulse' : ''}`} />
            </button>

            {/* Trust Footer */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Encrypted Payment</p>
                        <p className="text-[9px] text-slate-400 font-bold">Your data is safe with us</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Free Cancellation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No Hidden Fees</span>
                    </div>
                </div>
            </div>
        </div>
    );
}



