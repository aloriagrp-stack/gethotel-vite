

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
    ChevronRight,
    Loader2,
    ShieldCheck,
    Search,
    Eye,
    EyeOff,
    LogIn
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate as useRouter } from "react-router-dom";
import { adminApi, authApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerRequestsPage() {
    const { user: authUser, loading: authIsLoading, login } = useAuth();
    const navigation = useRouter();
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
        if (!confirm("Are you sure you want to approve this property and create a partner account?")) return;
        
        setActionIsLoading(id.toString());
        try {
            const resData = await adminApi.approvePartnerRequest(id);
            if (resData.success) {
                alert("Approved successfully! Email sent to the partner.");
                fetchAllRequests();
            } else {
                alert(resData.error || "Approval failed.");
            }
        } catch (error) {
            alert("Something went wrong.");
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
                    newTab.location.href = `/partner-dashboard?impersonateToken=${res.token}`;
                } else {
                    window.open(`/partner-dashboard?impersonateToken=${res.token}`, "_blank");
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

    const filteredReqs = reqList.filter(r => 
        r.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <div className="flex flex-col items-center justify-center py-20 bg-[#0c0c0c] rounded-2xl border border-[#1c1c1c] shadow-sm">
                        <Loader2 className="w-10 h-10 text-neutral-400 animate-spin mb-4" />
                        <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider">Loading requests...</p>
                    </div>
                ) : filteredReqs.length === 0 ? (
                    <div className="text-center py-20 bg-[#0c0c0c] rounded-[32px] border border-[#1c1c1c] shadow-sm space-y-3">
                        <Clock className="w-12 h-12 text-neutral-600 mx-auto" />
                        <h3 className="text-base font-black text-white">No pending requests</h3>
                        <p className="text-xs text-neutral-400 font-medium">When partners apply, their requests will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredReqs.map((r) => (
                            <motion.div 
                                key={r.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#0c0c0c] rounded-[28px] p-6 md:p-8 border border-[#1c1c1c] border-t-[#2d2d2d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_25px_rgba(0,0,0,0.95)] hover:border-[#333333] transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                                    <div className="flex-1 space-y-6">
                                        {/* Hotel Header */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-brand-600/20 border border-brand-500/30 text-brand-400 rounded-2xl flex items-center justify-center shrink-0">
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
                                                </div>
                                                <p className="text-neutral-400 text-xs font-medium italic">"{r.tagline}"</p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Property Details</h4>
                                                <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                    <MapPin className="w-4 h-4 text-neutral-500" />
                                                    {r.city}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                    <span className="text-brand-400 font-mono">₹</span>
                                                    {r.pricePerNight} per night
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Owner Information</h4>
                                                <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                    <UserIcon className="w-4 h-4 text-neutral-500" />
                                                    {r.userName}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                    <Mail className="w-4 h-4 text-neutral-500" />
                                                    <span className="break-all font-mono text-neutral-300">{r.userEmail}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                    <ShieldCheck className="w-4 h-4 text-neutral-500" />
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-brand-400">
                                                            {passVisibility[r.id] ? r.partnerPassword : "••••••••"}
                                                        </span>
                                                        <button 
                                                            onClick={() => togglePass(r.id)}
                                                            className="text-neutral-500 hover:text-brand-400 transition-colors p-1"
                                                            title={passVisibility[r.id] ? "Hide Password" : "Show Password"}
                                                        >
                                                            {passVisibility[r.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-neutral-200">
                                                    <Phone className="w-4 h-4 text-neutral-500" />
                                                    <span className="font-mono">{r.userPhone}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Address</h4>
                                                <p className="text-xs font-bold text-neutral-300 leading-relaxed">{r.address}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-[#121212] rounded-2xl border border-[#222222]">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">Description</h4>
                                            <p className="text-xs font-medium text-neutral-300 leading-relaxed">{r.description}</p>
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}



