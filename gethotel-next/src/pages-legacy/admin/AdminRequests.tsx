'use client';

import { useState, useEffect } from "react";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Hotel, 
    User as UserIcon, 
    Mail, 
    Phone, 
    MapPin, 
    Loader2,
    ShieldCheck,
    Search,
    Eye, 
    EyeOff,
    LogIn,
    Sparkles,
    Bed,
    Building2,
    Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi, authApi } from "@/lib/api";
import { motion } from "framer-motion";

export default function PartnerRequestsPage() {
    const { user: authUser } = useAuth();
    const [reqList, setReqList] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [actionIsLoading, setActionIsLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [passVisibility, setPassVisibility] = useState<{ [key: number]: boolean }>({});

    const togglePass = (id: number) => {
        setPassVisibility(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchAllRequests = async () => {
        try {
            const resData = await adminApi.getPartnerRequests();
            if (resData.success) {
                setReqList(resData.data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (authUser?.role === 'super_admin') {
            fetchAllRequests();
        }
    }, [authUser]);

    const handleApproval = async (id: number) => {
        if (!confirm("Are you sure you want to approve this property, create hotel & rooms, and send activation email?")) return;
        
        setActionIsLoading(id.toString());
        try {
            const resData = await adminApi.approvePartnerRequest(id);
            if (resData.success) {
                alert("Approved successfully! Hotel and rooms created, and activation email sent to the partner.");
                fetchAllRequests();
            } else {
                alert(resData.error || "Approval failed.");
            }
        } catch (error) {
            alert("Something went wrong with the approval.");
        } finally {
            setActionIsLoading(null);
        }
    };

    const handleDirectLogin = async (email: string, pass: string) => {
        const newTab = window.open("about:blank", "_blank");
        try {
            setActionIsLoading(`login-${email}`);
            const res = await authApi.login({ email, partnerpassword: pass, portal: 'partner' });
            if (res.success) {
                if (newTab) {
                    newTab.location.href = `/partner-dashboard/?impersonateToken=${res.token}`;
                } else {
                    window.open(`/partner-dashboard/?impersonateToken=${res.token}`, "_blank");
                }
            } else {
                if (newTab) newTab.close();
                alert("Auto-login failed: " + (res.message || "Invalid response"));
            }
        } catch (err: any) {
            if (newTab) newTab.close();
            alert("Auto-login failed: " + (err.message || err));
        } finally {
            setActionIsLoading(null);
        }
    };

    const parseExtra = (descStr: string) => {
        try {
            const parsed = JSON.parse(descStr);
            if (parsed && typeof parsed === 'object') return parsed;
        } catch (e) {}
        return { summary: descStr, rooms: [], hotelAmenities: [], hotelImages: [] };
    };

    const filteredReqs = reqList.filter(r => 
        (r.hotelName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12 font-sans text-neutral-100">
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">Partner Onboarding</h1>
                        <p className="text-neutral-400 text-xs font-semibold">Review and approve new property registration requests live.</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input 
                            type="text" 
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-[#141414] border border-[#282828] rounded-2xl text-xs font-bold w-full md:w-80 outline-none text-white focus:border-neutral-500 transition-all font-mono placeholder:text-neutral-600"
                        />
                    </div>
                </div>

                {pageLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/40 rounded-2xl border border-neutral-800/80 shadow-sm">
                        <Loader2 className="w-10 h-10 text-neutral-400 animate-spin mb-4" />
                        <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider">Loading requests...</p>
                    </div>
                ) : filteredReqs.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900/40 rounded-[32px] border border-neutral-800/80 shadow-sm space-y-3">
                        <Clock className="w-12 h-12 text-neutral-600 mx-auto" />
                        <h3 className="text-base font-black text-white">No pending requests</h3>
                        <p className="text-xs text-neutral-400 font-medium">When partners apply, their requests will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredReqs.map((r) => {
                            const extra = parseExtra(r.description);
                            return (
                                <motion.div 
                                    key={r.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-neutral-900/50 rounded-[28px] p-6 md:p-8 border border-neutral-800 hover:border-neutral-700 transition-all group"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                                        <div className="flex-1 space-y-6">
                                            {/* Hotel Header */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                                                    <Hotel className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h2 className="text-xl font-black text-white">{r.hotelName}</h2>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            r.status === 'pending' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40' : 
                                                            r.status === 'approved' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40' : 'bg-red-950/80 text-red-300 border border-red-800/40'
                                                        }`}>
                                                            {r.status}
                                                        </span>
                                                        {extra.propertyType && (
                                                            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-800 px-2.5 py-0.5 rounded-md">
                                                                {extra.propertyType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-neutral-400 text-xs font-medium italic">
                                                        "{r.tagline || 'Hospitality Partner'}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {/* Property Location & Capacity */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Property Details</h4>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                        <MapPin className="w-4 h-4 text-neutral-500" />
                                                        {r.city}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                        <Building2 className="w-4 h-4 text-neutral-500" />
                                                        {extra.totalRooms || 1} Total Rooms
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                        <span className="text-blue-400 font-mono">₹</span>
                                                        Base Rate: ₹{r.pricePerNight} / night
                                                    </div>
                                                </div>

                                                {/* Owner / Contact */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Host Contact</h4>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                        <UserIcon className="w-4 h-4 text-neutral-500" />
                                                        {r.userName}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                        <Mail className="w-4 h-4 text-neutral-500" />
                                                        <span className="break-all font-mono text-neutral-300">{r.userEmail}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                        <Phone className="w-4 h-4 text-neutral-500" />
                                                        <span className="font-mono">{r.userPhone}</span>
                                                    </div>
                                                </div>

                                                {/* Dynamic AI Pricing Guardrails */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        AI Pricing Guardrails
                                                    </h4>
                                                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 space-y-1 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Min Floor:</span>
                                                            <span className="font-mono font-bold text-emerald-400">₹{extra.minPrice || r.pricePerNight}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Max Ceiling:</span>
                                                            <span className="font-mono font-bold text-sky-400">₹{extra.maxPrice || (r.pricePerNight * 2)}</span>
                                                        </div>
                                                        <span className="text-[10px] text-blue-300/80 block pt-1">
                                                            ✓ Automated AI yield optimization
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Configured Rooms if available */}
                                            {Array.isArray(extra.rooms) && extra.rooms.length > 0 && (
                                                <div className="p-4 bg-neutral-950/60 rounded-2xl border border-neutral-800 space-y-2">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                                        <Bed className="w-3.5 h-3.5 text-blue-400" />
                                                        Rooms Configured ({extra.rooms.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                                                        {extra.rooms.map((rm: any, rmIdx: number) => (
                                                            <div key={rmIdx} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                                                                <span className="font-bold text-white block truncate">{rm.name}</span>
                                                                <span className="text-neutral-400 text-[11px] block">{rm.bedType} • ₹{rm.price}/night</span>
                                                                <span className="text-neutral-500 text-[10px] block">{rm.inventory || 1} units • {rm.images?.length || 0} photos</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hotel Amenities if available */}
                                            {Array.isArray(extra.hotelAmenities) && extra.hotelAmenities.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {extra.hotelAmenities.map((am: string, aIdx: number) => (
                                                        <span key={aIdx} className="text-[10px] font-bold text-neutral-300 bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-700/50">
                                                            ✓ {am}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Address & Summary */}
                                            <div className="p-4 bg-[#121212] rounded-2xl border border-[#222222] text-xs text-neutral-300 space-y-1">
                                                <div className="font-bold text-neutral-400">Address: {r.address}</div>
                                                {extra.summary && <div className="text-neutral-400 italic">"{extra.summary}"</div>}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex lg:flex-col gap-3 shrink-0">
                                            {r.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApproval(r.id)}
                                                        disabled={actionIsLoading === r.id.toString()}
                                                        className="flex-1 lg:flex-none px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {actionIsLoading === r.id.toString() ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                        Approve Property
                                                    </button>
                                                    <button className="flex-1 lg:flex-none px-6 py-3.5 bg-[#181818] text-red-400 border border-red-900/40 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {r.status === 'approved' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-widest py-3 px-5 bg-emerald-950/80 rounded-xl border border-emerald-800/40 mb-3">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        Account Created
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDirectLogin(r.userEmail, r.partnerPassword)}
                                                        disabled={actionIsLoading === `login-${r.userEmail}`}
                                                        className="w-full px-6 py-3.5 bg-neutral-100 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {actionIsLoading === `login-${r.userEmail}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                                                        Login as Partner
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
