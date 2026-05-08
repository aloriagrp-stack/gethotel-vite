"use client";

import { useState } from "react";
import { X, Star, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hotelApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotelId: number;
    hotelName: string;
    onReviewAdded: (newReview: any) => void;
}

export default function ReviewModal({ isOpen, onClose, hotelId, hotelName, onReviewAdded }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please login to write a review.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await hotelApi.createReview(hotelId, { rating, comment });
            onReviewAdded(res.data);
            setComment("");
            setRating(5);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-white overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-brand-600" />
                                    <span className="text-[10px] font-black uppercase text-brand-600 tracking-widest">Share Experience</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Review {hotelName}</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-8">
                            {/* Rating Stars */}
                            <div className="flex flex-col items-center py-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">How was your stay?</p>
                                <div className="flex gap-2">
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
                                                    "w-10 h-10 transition-all duration-300",
                                                    (hoveredRating || rating) >= s 
                                                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" 
                                                        : "text-slate-200"
                                                )} 
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-4 text-xs font-black text-slate-900 uppercase">
                                    {rating === 1 && "Poor"}
                                    {rating === 2 && "Fair"}
                                    {rating === 3 && "Good"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 5 && "Excellent"}
                                </p>
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Your Feedback</label>
                                <textarea 
                                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 transition-all outline-none min-h-[140px] placeholder:text-slate-300"
                                    placeholder="Tell us about the service, amenities, and your overall vibe..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-brand-600 text-white font-black rounded-3xl shadow-xl shadow-brand-600/30 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    "Submit My Review"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
