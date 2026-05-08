"use client";

import { useParams, useRouter } from "next/navigation";
import { hotels } from "@/data/hotels";
import { 
    ChevronLeft, MapPin, Calendar, 
    ShieldCheck, QrCode, MessageSquare, 
    ArrowRight, Info, CreditCard, Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const hotel = hotels.find(h => h.id === params.id) || hotels[0];

    return (
        <div className="min-h-screen bg-[#F4F9FF] pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Journeys
                </button>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-10">
                        <div className="w-full md:w-1/3 aspect-[4/5] rounded-2xl overflow-hidden shadow-lg shrink-0 relative h-full">
                            <Image src={hotel.thumbnail} alt={hotel.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-100">
                                    Reservation Confirmed
                                </span>
                                <span className="text-slate-400 text-xs font-bold font-mono">ID: #ELT-2918402X</span>
                            </div>
                            
                            <h1 className="text-4xl font-display font-black text-slate-900 tracking-tighter italic mb-2">
                                {hotel.name}
                            </h1>
                            <p className="text-slate-500 flex items-center gap-2 font-bold mb-8">
                                <MapPin className="w-4 h-4" /> {hotel.city}, India
                            </p>

                            <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</p>
                                    <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-brand-600" /> May 15, 2026
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exit Date</p>
                                    <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-brand-600" /> May 18, 2026
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <Info className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Room Assignment</h4>
                                        <p className="text-sm text-slate-500">Executive Suite • High Floor • City View</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <CreditCard className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Payment Status</h4>
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest text-emerald-600">Fully Paid • ₹42,500.00</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex gap-4 pt-10 border-t border-slate-50">
                                <button className="px-8 py-4 bg-slate-950 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-xl transition-all">
                                    Get Mobile Key
                                </button>
                                <button className="px-8 py-4 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                                    Contact Host
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
