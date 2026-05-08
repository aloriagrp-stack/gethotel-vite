"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
    Star, 
    ChevronLeft, 
    Send, 
    Loader2, 
    Sparkles, 
    CheckCircle2,
    ShieldCheck,
    MessageSquare,
    Info
} from "lucide-react";
import { hotelApi } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function WriteReviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [hotel, setHotel] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await hotelApi.getHotel(id);
                setHotel(res.data);
            } catch (err: any) {
                setError("Failed to load hotel info.");
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            router.push(`/login?redirect=/hotel/${id}/write-review`);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await hotelApi.createReview(parseInt(id), { rating, comment });
            setSuccess(true);
            setTimeout(() => {
                router.push(`/hotel/${id}`);
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to submit review. You might have already reviewed this hotel.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-2xl border border-white"
                >
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight italic">Review Shared!</h2>
                    <p className="text-slate-600 font-medium mb-10 leading-relaxed">
                        Bhai, aapki feedback humare liye bohot valuable hai. Redirecting you back to {hotel?.name}...
                    </p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3 }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container-page max-w-5xl mx-auto px-6">
                {/* Back Link */}
                <Link 
                    href={`/hotel/${id}`} 
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold text-sm mb-10 transition-all group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to {hotel?.name}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Side: Hotel Info Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-white sticky top-28">
                            <div className="relative h-48 w-full">
                                <Image 
                                    src={hotel?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                                    alt={hotel?.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-xl font-black text-white leading-tight">{hotel?.name}</h3>
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1 italic">{hotel?.city}</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Rating</span>
                                    <div className="px-3 py-1 bg-brand-600 text-white rounded-lg text-sm font-black italic">{hotel?.guestRating}.0</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg">🛋️</div>
                                        <span className="text-sm font-bold">Premium Amenities</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg">🍽️</div>
                                        <span className="text-sm font-bold">Luxury Dining</span>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-start gap-3 bg-brand-50 p-4 rounded-2xl">
                                        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-brand-700 font-bold leading-relaxed">
                                            Aapka review verified travelers ko help karega sahi decision lene me.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Professional Review Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-2xl border border-white relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-60" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-5 h-5 text-brand-600" />
                                    <span className="text-xs font-black uppercase text-brand-600 tracking-[0.2em]">Verified Review</span>
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight italic">How was your stay?</h1>
                                <p className="text-slate-500 font-medium text-lg mb-12">Share your authentic experience and help other travelers discover the best.</p>

                                <form onSubmit={handleSubmit} className="space-y-12">
                                    {/* Rating Section */}
                                    <div className="space-y-6">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest block ml-1">Your Rating</label>
                                        <div className="bg-slate-50/50 p-10 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center transition-all hover:bg-white hover:shadow-lg group">
                                            <div className="flex gap-4">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onMouseEnter={() => setHoveredRating(s)}
                                                        onMouseLeave={() => setHoveredRating(0)}
                                                        onClick={() => setRating(s)}
                                                        className="transition-transform active:scale-90"
                                                    >
                                                        <Star 
                                                            className={cn(
                                                                "w-12 h-12 transition-all duration-300",
                                                                (hoveredRating || rating) >= s 
                                                                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-110" 
                                                                    : "text-slate-200"
                                                            )} 
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="mt-6 text-lg font-black text-slate-900 uppercase tracking-widest italic">
                                                {rating === 1 && "Poor Experience"}
                                                {rating === 2 && "Fair Stay"}
                                                {rating === 3 && "Good / Decent"}
                                                {rating === 4 && "Very Good Stay"}
                                                {rating === 5 && "Exceptional Vibe"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Comment Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Share Detailed Feedback
                                            </label>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{comment.length} / 1000 characters</span>
                                        </div>
                                        <textarea 
                                            className="w-full px-8 py-7 bg-slate-50 border border-slate-100 rounded-[32px] font-bold text-slate-900 focus:bg-white focus:ring-8 focus:ring-brand-500/10 focus:border-brand-600 transition-all outline-none min-h-[220px] placeholder:text-slate-300 resize-none shadow-inner"
                                            placeholder="Room service kaisa tha? Vibe kaisi lagi? Staff helpful tha? Bataye humein..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            maxLength={1000}
                                        />
                                    </div>

                                    {/* Verification Notice */}
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <p className="text-[11px] text-emerald-700 font-bold">
                                            Aapka review real user ke taur par publish hoga. Fake ya offensive content remove kar diya jayega.
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100 flex items-center gap-3"
                                        >
                                            <Info className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-6 bg-slate-900 text-white font-black rounded-[32px] shadow-2xl shadow-slate-900/20 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm group"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                Submit Review
                                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
