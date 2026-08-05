import { useState, useEffect } from "react";
import { 
    Sparkles, RefreshCw, CheckCircle2, AlertCircle, 
    Star, Globe, Link2, ChevronDown, Hotel
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";

interface AdminReviewImporterProps {
    hotels: any[];
    loadingHotels?: boolean;
    hotelId?: number | "";
    onHotelIdChange?: (id: number | "") => void;
    onImportSuccess?: () => void;
}

export default function AdminReviewImporter({
    hotels,
    loadingHotels = false,
    hotelId: propHotelId,
    onHotelIdChange,
    onImportSuccess
}: AdminReviewImporterProps) {
    const [localHotelId, setLocalHotelId] = useState<number | "">("");
    const [reviewsUrl, setReviewsUrl] = useState("");
    const [importingReviews, setImportingReviews] = useState(false);
    const [importStatusSteps, setImportStatusSteps] = useState<string[]>([]);
    const [activeImportStepIndex, setActiveImportStepIndex] = useState(0);
    const [importedReviews, setImportedReviews] = useState<any[]>([]);
    const [reviewsError, setReviewsError] = useState("");
    const [importSuccessMsg, setImportSuccessMsg] = useState("");

    // Determine selected hotel ID based on prop or local state
    const isControlled = propHotelId !== undefined;
    const selectedHotelId = isControlled ? propHotelId : localHotelId;

    const activeHotel = hotels.find(h => h.id === selectedHotelId);

    const handleHotelChange = (id: number | "") => {
        if (!isControlled) {
            setLocalHotelId(id);
        }
        if (onHotelIdChange) {
            onHotelIdChange(id);
        }
    };

    const handleImportReviews = async () => {
        if (!selectedHotelId) {
            alert("Please select a target hotel first.");
            return;
        }
        if (!reviewsUrl.trim() || !reviewsUrl.startsWith("http")) {
            alert("Please enter a valid HTTP/HTTPS URL.");
            return;
        }
        setImportingReviews(true);
        setReviewsError("");
        setImportSuccessMsg("");
        setImportedReviews([]);
        
        const steps = [
            "Connecting to Booking.com translate proxy...",
            "Downloading webpage listing contents...",
            "Cleaning HTML and extracting readable text content...",
            "Running Gemini 2.5 flash review parsing engine...",
            "Creating virtual reviewer accounts in database...",
            "Storing reviews and recalculating average hotel rating..."
        ];
        
        setActiveImportStepIndex(0);
        setImportStatusSteps([`⏳ ${steps[0]}`]);
        
        const stepInterval = setInterval(() => {
            setActiveImportStepIndex(prev => {
                const next = prev + 1;
                if (next < steps.length) {
                    setImportStatusSteps(current => [...current.slice(0, -1), `✓ ${steps[prev]}`, `⏳ ${steps[next]}`]);
                    return next;
                } else {
                    clearInterval(stepInterval);
                    return prev;
                }
            });
        }, 2200);

        try {
            const res = await adminApi.importReviews({
                hotelId: Number(selectedHotelId),
                url: reviewsUrl.trim()
            });
            
            clearInterval(stepInterval);
            setImportStatusSteps(steps.map(s => `✓ ${s}`));
            
            if (res.success) {
                setImportSuccessMsg(res.message || "Reviews imported successfully!");
                setImportedReviews(res.data || []);
                setReviewsUrl("");
                if (onImportSuccess) {
                    onImportSuccess();
                }
            } else {
                setReviewsError(res.message || "Failed to import reviews.");
            }
        } catch (err: any) {
            clearInterval(stepInterval);
            setReviewsError(err.message || "Something went wrong while importing reviews.");
        } finally {
            setImportingReviews(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto items-start p-2 text-white font-sans">
            {/* Left Side: Form & Logs */}
            <div className="lg:col-span-5 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-6 space-y-6">
                <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>Import OTA Reviews</span>
                    </h4>
                    <p className="text-[10px] font-bold text-neutral-400 leading-normal uppercase tracking-wider">
                        Scrape verified reviews from Booking.com or TripAdvisor in one click
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Hotel Selector */}
                    {!isControlled && (
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider block">Target Property</label>
                            <div className="relative">
                                <select
                                    value={selectedHotelId}
                                    onChange={(e) => handleHotelChange(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={importingReviews || loadingHotels}
                                    className="appearance-none w-full pl-4 pr-10 py-3 bg-[#141414] border border-[#262626] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer disabled:opacity-90 disabled:cursor-not-allowed"
                                >
                                    {loadingHotels ? (
                                        <option value="" className="bg-black text-white">Loading properties list...</option>
                                    ) : (
                                        <>
                                            <option value="" className="bg-black text-white">-- Select Property --</option>
                                            {hotels.map((h) => (
                                                <option key={h.id} value={h.id} className="bg-black text-white">
                                                    {h.name} ({h.city})
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider block">OTA Hotel URL</label>
                        <div className="relative">
                            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="url"
                                placeholder="https://www.booking.com/hotel/in/hotel-slug.html"
                                value={reviewsUrl}
                                onChange={(e) => setReviewsUrl(e.target.value)}
                                disabled={importingReviews || !selectedHotelId}
                                className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#262626] rounded-xl text-xs font-mono text-white focus:border-neutral-500 outline-none transition-all placeholder:text-neutral-600 disabled:opacity-75 disabled:cursor-not-allowed shadow-inner"
                            />
                        </div>
                        {!selectedHotelId && (
                            <p className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Select a target hotel above to enable importing.
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleImportReviews}
                        disabled={importingReviews || !selectedHotelId || !reviewsUrl.trim()}
                        className="w-full py-3.5 bg-neutral-100 text-black rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white disabled:bg-[#181818] disabled:text-neutral-600 disabled:border disabled:border-[#262626] disabled:cursor-not-allowed transition-all cursor-pointer shadow-md active:scale-98"
                    >
                        {importingReviews ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                                <span>Fetching Reviews...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5 text-black" />
                                <span>Fetch & Import Reviews</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Status Steps Tracker */}
                {importStatusSteps.length > 0 && (
                    <div className="border-t border-[#1f1f1f] pt-4 space-y-3">
                        <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider">Sync Log / Status:</span>
                        <div className="bg-[#121212] border border-[#242424] text-neutral-200 p-4 rounded-xl font-mono text-[9px] leading-relaxed space-y-1.5 shadow-inner">
                            {importStatusSteps.map((stepMsg, idx) => (
                                <div key={idx} className={cn(
                                    "transition-opacity duration-300",
                                    stepMsg.includes("⏳") ? "text-amber-400 font-bold" : "text-emerald-400"
                                )}>
                                    {stepMsg}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message Banners */}
                {reviewsError && (
                    <div className="p-4 bg-red-950/60 border border-red-800/40 text-red-300 text-[10px] font-bold rounded-xl leading-normal flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{reviewsError}</span>
                    </div>
                )}

                {importSuccessMsg && (
                    <div className="p-4 bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-bold rounded-xl leading-normal flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{importSuccessMsg}</span>
                    </div>
                )}
            </div>

            {/* Right Side: Imported Preview Grid */}
            <div className="lg:col-span-7 bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] p-6 min-h-[400px]">
                <div className="pb-4 border-b border-[#1f1f1f] mb-6 flex justify-between items-center">
                    <div>
                        <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                            Imported Reviews Preview ({importedReviews.length})
                        </h4>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                            Freshly imported database records
                        </p>
                    </div>
                    {selectedHotelId && activeHotel && (
                        <div className="text-right">
                            <div className="text-[11px] font-bold text-white uppercase">
                                ⭐ {activeHotel.guestRating || "N/A"}
                            </div>
                            <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">
                                {activeHotel.reviewCount || 0} Total Reviews
                            </div>
                        </div>
                    )}
                </div>

                {importedReviews.length > 0 ? (
                    <div className="space-y-4">
                        {importedReviews.map((rev, rIdx) => (
                            <div key={rIdx} className="p-4 border border-[#242424] bg-[#141414] rounded-xl space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#222222] border border-[#333333] text-white text-[10px] font-bold flex items-center justify-center uppercase">
                                            {rev.user?.name ? rev.user.name.slice(0, 2) : (rev.userName ? rev.userName.slice(0, 2) : "G")}
                                        </div>
                                        <div>
                                            <h5 className="text-[11px] font-bold text-white">{rev.user?.name || rev.userName || "Verified Guest"}</h5>
                                            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">
                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: rev.rating || 5 }).map((_, starIdx) => (
                                            <Star key={starIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-[11px] font-medium text-neutral-300 leading-relaxed italic">
                                    "{rev.comment}"
                                </p>

                                {/* Subscores Grid */}
                                <div className="grid grid-cols-5 gap-2 pt-2 border-t border-[#1f1f1f] text-center">
                                    <div className="bg-[#0c0c0c] border border-[#222222] p-1.5 rounded-lg">
                                        <div className="text-[10px] font-bold text-white">{rev.cleanliness || 5}/5</div>
                                        <div className="text-[7px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Clean</div>
                                    </div>
                                    <div className="bg-[#0c0c0c] border border-[#222222] p-1.5 rounded-lg">
                                        <div className="text-[10px] font-bold text-white">{rev.comfort || 5}/5</div>
                                        <div className="text-[7px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Comfort</div>
                                    </div>
                                    <div className="bg-[#0c0c0c] border border-[#222222] p-1.5 rounded-lg">
                                        <div className="text-[10px] font-bold text-white">{rev.location || 5}/5</div>
                                        <div className="text-[7px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Loc</div>
                                    </div>
                                    <div className="bg-[#0c0c0c] border border-[#222222] p-1.5 rounded-lg">
                                        <div className="text-[10px] font-bold text-white">{rev.staff || 5}/5</div>
                                        <div className="text-[7px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Staff</div>
                                    </div>
                                    <div className="bg-[#0c0c0c] border border-[#222222] p-1.5 rounded-lg">
                                        <div className="text-[10px] font-bold text-white">{rev.valueForMoney || 5}/5</div>
                                        <div className="text-[7px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Value</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="w-12 h-12 bg-[#141414] border border-[#262626] rounded-2xl flex items-center justify-center">
                            <Hotel className="w-6 h-6 text-neutral-500" />
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-[11px] font-bold uppercase text-white tracking-wider">No reviews fetched yet</h5>
                            <p className="text-[10px] font-bold text-neutral-400 leading-normal max-w-sm">
                                Select a hotel, paste an OTA hotel URL on the left panel, and click fetch to sync real user reviews instantly.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
