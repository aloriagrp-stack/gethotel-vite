

import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    Star, MessageSquare, Reply, 
    Loader2, Search, Filter, 
    User, Calendar, ShieldAlert,
    CheckCircle2, XCircle, MoreVertical,
    TrendingUp, Award, ThumbsUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hotelApi } from "@/lib/api";

export default function PartnerReviewsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await hotelApi.getMyHotels();
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                setReviews(myHotel.reviews || []);
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchReviews();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);

    const handleReply = async (reviewId: number) => {
        if (!replyText.trim()) return;
        setIsSaving(true);
        try {
            const res = await hotelApi.replyToReview(hotel.id, reviewId, replyText);
            if (res.success) {
                setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: replyText } : r));
                setReplyingTo(null);
                setReplyText("");
            }
        } catch (err) {
            alert("Failed to send reply");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const averageRating = hotel?.guestRating || 0;
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Guest Reviews</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Monitor guest feedback and manage your property reputation</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-emerald-100 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Top Rated Property
                    </div>
                </div>
            </div>

            {/* Ratings Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Average Rating</p>
                    <div className="flex items-end gap-3 mb-6">
                        <h3 className="text-6xl font-black">{averageRating.toFixed(1)}</h3>
                        <div className="flex flex-col mb-1">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={cn("w-3 h-3", star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-600")} />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Out of 5 stars</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Based on {reviews.length} verified guest reviews from the last 12 months.</p>
                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Rating Distribution</h4>
                    <div className="space-y-4">
                        {ratingDistribution.map((item) => (
                            <div key={item.star} className="flex items-center gap-6">
                                <div className="flex items-center gap-2 min-w-[60px]">
                                    <span className="text-xs font-black text-slate-900">{item.star}</span>
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                </div>
                                <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 min-w-[40px] text-right">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Review Feed */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" /> All Reviews
                    </h3>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-10 hover:bg-slate-50/30 transition-all group">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left: Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900">{review.user.name}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={cn("w-3 h-3", star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed mb-8 italic">
                                        "{review.comment}"
                                    </p>

                                    {/* Partner Reply Display */}
                                    {review.reply ? (
                                        <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100/50 relative">
                                            <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                                                Property Response
                                            </div>
                                            <p className="text-sm font-bold text-blue-900 leading-relaxed">
                                                {review.reply}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            {replyingTo === review.id ? (
                                                <div className="w-full space-y-4 animate-fade-in">
                                                    <textarea 
                                                        autoFocus
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write a professional response to this guest..."
                                                        className="w-full p-6 bg-slate-50 border-2 border-blue-100 rounded-[32px] text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all min-h-[120px] resize-none"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => handleReply(review.id)}
                                                            disabled={isSaving}
                                                            className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2"
                                                        >
                                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                                                            Post Response
                                                        </button>
                                                        <button 
                                                            onClick={() => setReplyingTo(null)}
                                                            className="px-8 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setReplyingTo(review.id)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                                                >
                                                    <Reply className="w-4 h-4" /> Reply to Guest
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Metadata / Actions */}
                                <div className="md:w-48 shrink-0 flex flex-col gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification</p>
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase">Verified Stay</span>
                                        </div>
                                    </div>
                                    <button className="flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest transition-colors">
                                        <ShieldAlert className="w-4 h-4" /> Report Fake
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="py-32 text-center flex flex-col items-center">
                            <Star className="w-16 h-16 text-slate-100 mb-4" />
                            <h4 className="text-xl font-black text-slate-900 mb-2">No reviews yet</h4>
                            <p className="text-slate-500 font-medium">Reviews from guests will appear here after they complete their stay.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



