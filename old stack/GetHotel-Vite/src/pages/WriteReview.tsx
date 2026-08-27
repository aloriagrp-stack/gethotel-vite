import { useState, useEffect } from "react";
import { useNavigate as useRouter, useParams } from 'react-router-dom';
import Image from "@/components/common/Image";
import { Link } from "react-router-dom";
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
import { cn, getHotelUrl } from "@/lib/utils";
import { motion } from "framer-motion";

export default function WriteReviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [hotel, setHotel] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    
    // Sub-ratings
    const [cleanliness, setCleanliness] = useState(0);
    const [comfort, setComfort] = useState(0);
    const [location, setLocation] = useState(0);
    const [staff, setStaff] = useState(0);
    const [valueForMoney, setValueForMoney] = useState(0);

    // Detailed feedback text
    const [likes, setLikes] = useState("");
    const [dislikes, setDislikes] = useState("");

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
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
            router(`/login?redirect=${hotel ? getHotelUrl(hotel.id, hotel.name) : `/hotel/${id}`}/write-review`);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            const combinedComment = `Likes: ${likes}\nDislikes: ${dislikes}\nOverall: ${comment}`;
            await hotelApi.createReview(parseInt(id), { 
                rating, 
                comment: combinedComment,
                cleanliness,
                comfort,
                location,
                staff,
                valueForMoney
            });
            setSuccess(true);
            setTimeout(() => {
                router(hotel ? getHotelUrl(hotel.id, hotel.name) : `/hotel/${id}`);
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to submit review. You might have already reviewed this hotel.");
        } finally {
            setSubmitting(false);
        }
    };

    const StarRatingSelector = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-b-0">
                <span className="text-xs font-bold text-black uppercase tracking-wider">{label}</span>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => onChange(s)}
                            className="transition-transform active:scale-95 cursor-pointer"
                        >
                            <Star 
                                className={cn(
                                    "w-6 h-6 transition-colors duration-250",
                                    value >= s ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                )} 
                            />
                        </button>
                    ))}
                </div>
            </div>
        );
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
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-md p-10 text-center border border-slate-200 shadow-md"
                >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">Review Shared!</h2>
                    <p className="text-black font-medium mb-8 leading-relaxed">
                        Your feedback is highly valuable to us. Redirecting you back to {hotel?.name}...
                    </p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3 }}
                            className="h-full bg-emerald-600"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-12 pb-12">
            <div className="container-page max-w-5xl mx-auto px-6">
                {/* Back Link */}
                <Link 
                    to={hotel ? getHotelUrl(hotel.id, hotel.name) : `/hotel/${id}`} 
                    className="inline-flex items-center gap-2 text-black hover:text-brand-600 font-bold text-sm mb-6 transition-all group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to {hotel?.name}
                </Link>

                <div className="max-w-2xl mx-auto">
                    {/* Flat Review Form */}
                    <div className="bg-white p-0 relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">How was your stay?</h1>
                            <p className="text-black font-medium text-sm mb-8">Share your authentic experience and help other travelers discover the best.</p>
 
                            <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Overall Rating Section */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase text-black tracking-wider block ml-1">Overall Rating</label>
                                        <div className="bg-slate-50 p-6 rounded-md border border-slate-200 flex flex-col items-center justify-center group">
                                            <div className="flex gap-3">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onMouseEnter={() => setHoveredRating(s)}
                                                        onMouseLeave={() => setHoveredRating(0)}
                                                        onClick={() => setRating(s)}
                                                        className="transition-transform active:scale-90 cursor-pointer"
                                                    >
                                                        <Star 
                                                            className={cn(
                                                                "w-10 h-10 transition-all duration-200",
                                                                (hoveredRating || rating) >= s 
                                                                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] scale-105" 
                                                                    : "text-slate-200"
                                                            )} 
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="mt-4 text-sm font-bold text-black uppercase tracking-wider">
                                                {rating === 0 && "Select your rating"}
                                                {rating === 1 && "Poor Experience"}
                                                {rating === 2 && "Fair Stay"}
                                                {rating === 3 && "Good / Decent"}
                                                {rating === 4 && "Very Good Stay"}
                                                {rating === 5 && "Exceptional Vibe"}
                                            </p>
                                        </div>
                                    </div>
 
                                    {/* Category Sub-Ratings */}
                                    <div className="space-y-4 bg-slate-50 p-6 rounded-md border border-slate-200">
                                        <label className="text-xs font-bold uppercase text-black tracking-wider block ml-1 mb-1">Category Ratings</label>
                                        <StarRatingSelector label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
                                        <StarRatingSelector label="Comfort" value={comfort} onChange={setComfort} />
                                        <StarRatingSelector label="Location" value={location} onChange={setLocation} />
                                        <StarRatingSelector label="Staff / Behavior" value={staff} onChange={setStaff} />
                                        <StarRatingSelector label="Value For Money" value={valueForMoney} onChange={setValueForMoney} />
                                    </div>
 
                                    {/* Likes / Dislikes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-black tracking-wider block ml-1">What did you like the most?</label>
                                            <input 
                                                type="text" 
                                                value={likes} 
                                                onChange={(e) => setLikes(e.target.value)}
                                                placeholder="e.g. Room hygiene, staff behavior, monument view"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md font-medium text-slate-950 focus:border-slate-400 outline-none transition-all text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-black tracking-wider block ml-1">What could be improved?</label>
                                            <input 
                                                type="text" 
                                                value={dislikes} 
                                                onChange={(e) => setDislikes(e.target.value)}
                                                placeholder="e.g. WiFi connectivity, breakfast options"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md font-medium text-slate-950 focus:border-slate-400 outline-none transition-all text-xs"
                                                required
                                            />
                                        </div>
                                    </div>
 
                                    {/* Comment Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-xs font-bold uppercase text-black tracking-wider flex items-center gap-1.5">
                                                <MessageSquare className="w-3.5 h-3.5 text-black" />
                                                Share Detailed Feedback
                                            </label>
                                            <span className="text-[10px] font-medium text-black tracking-wider">{comment.length} / 2000 characters</span>
                                        </div>
                                        <textarea 
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md font-medium text-slate-950 focus:border-slate-400 transition-all outline-none min-h-[160px] placeholder:text-slate-300 resize-none text-xs"
                                            placeholder="How was the room size? How was the vibe? How was the staff behavior? Share your experience with us..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            maxLength={2000}
                                        />
                                    </div>
 
                                    {/* Verification Notice */}
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-md border border-emerald-100">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <p className="text-[11px] text-emerald-700 font-medium">
                                            Your review will be published as an authentic user. Fake or offensive content will be moderated and removed.
                                        </p>
                                    </div>
 
                                    {error && (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-md text-xs font-bold border border-red-100 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
 
                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-xs group cursor-pointer shadow-sm disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Submit Review
                                                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
