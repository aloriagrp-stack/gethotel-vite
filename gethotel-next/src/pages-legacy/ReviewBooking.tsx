'use client';


import { useNavigate as useRouter, useParams, Link } from '@/lib/navigation';
import { hotels } from "@/data/hotels";
import { 
    ChevronLeft, Star, MessageSquare, 
    CheckCircle2, Loader2, Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import Image from "@/components/common/Image";

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const hotel = hotels.find(h => h.id === params.id) || hotels[0];

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setTimeout(() => router('/bookings'), 2000);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#F4F9FF] pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => router(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
                    {submitted ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Thank you, traveler!</h2>
                            <p className="text-slate-500 font-bold">Your review helps the elite community stay informed.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0">
                                    <img src={hotel.thumbnail} alt={hotel.name} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">Feedback for</p>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{hotel.name}</h1>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {/* Rating */}
                                <div>
                                    <p className="font-black text-slate-900 mb-4 tracking-tight">How was your overall stay?</p>
                                    <div className="flex gap-3">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button 
                                                key={s} 
                                                onClick={() => setRating(s)}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                    rating >= s ? "bg-amber-400 shadow-lg shadow-amber-400/20" : "bg-slate-50 text-slate-300"
                                                }`}
                                            >
                                                <Star className={`w-6 h-6 ${rating >= s ? "fill-white text-white" : ""}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review Text */}
                                <div>
                                    <p className="font-black text-slate-900 mb-4 tracking-tight">Share your elite experience</p>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 h-40 focus:bg-white focus:border-brand-300 transition-all outline-none font-medium placeholder:text-slate-300"
                                        placeholder="What made your stay special?"
                                    />
                                </div>

                                {/* Media Upload Placeholder */}
                                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all group">
                                    <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-brand-600 transition-colors" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Add Photos of your Stay</p>
                                </div>

                                <button 
                                    onClick={handleSubmit}
                                    disabled={!rating || isSubmitting}
                                    className="w-full py-5 bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                    Submit Review
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
