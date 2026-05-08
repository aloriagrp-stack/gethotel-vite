"use client";

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
import { useRouter } from "next/navigation";
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
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partner/requests`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resData = await response.json();
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
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partner/requests/${id}/approve`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resData = await response.json();
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
        try {
            setActionIsLoading(`login-${email}`);
            await login({ email, partnerpassword: pass });
            navigation.push("/partner-dashboard");
        } catch (err) {
            alert("Auto-login failed. Please use credentials manually.");
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
        <div className="p-8 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Partner Onboarding</h1>
                        <p className="text-slate-500 font-medium">Review and approve new property registration requests.</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold w-full md:w-80 outline-none focus:border-brand-600 transition-all"
                        />
                    </div>
                </div>

                {pageLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Loading requests...</p>
                    </div>
                ) : filteredReqs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <Clock className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">No pending requests</h3>
                        <p className="text-slate-400 font-medium">When partners apply, their requests will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredReqs.map((r) => (
                            <motion.div 
                                key={r.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-600/5 transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                                    <div className="flex-1 space-y-6">
                                        {/* Hotel Header */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shrink-0">
                                                <Hotel className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h2 className="text-xl font-black text-slate-900">{r.hotelName}</h2>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                                        r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {r.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium italic">"{r.tagline}"</p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Details</h4>
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {r.city}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <span className="text-brand-600">₹</span>
                                                    {r.pricePerNight} per night
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Information</h4>
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                                    {r.userName}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="break-all">{r.userEmail}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-brand-600">
                                                            {passVisibility[r.id] ? r.partnerPassword : "••••••••"}
                                                        </span>
                                                        <button 
                                                            onClick={() => togglePass(r.id)}
                                                            className="text-slate-400 hover:text-brand-600 transition-colors p-1"
                                                            title={passVisibility[r.id] ? "Hide Password" : "Show Password"}
                                                        >
                                                            {passVisibility[r.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    {r.userPhone}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</h4>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{r.address}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</h4>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed">{r.description}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex lg:flex-col gap-3 shrink-0">
                                        {r.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApproval(r.id)}
                                                    disabled={actionIsLoading === r.id.toString()}
                                                    className="flex-1 lg:flex-none px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                                >
                                                    {actionIsLoading === r.id.toString() ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                    Approve Property
                                                </button>
                                                <button className="flex-1 lg:flex-none px-6 py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {r.status === 'approved' && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest py-4 px-6 bg-emerald-50 rounded-2xl border border-emerald-100 mb-3">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Account Created
                                                </div>
                                                <button 
                                                    onClick={() => handleDirectLogin(r.userEmail, r.partnerPassword)}
                                                    disabled={actionIsLoading === `login-${r.userEmail}`}
                                                    className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-50"
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
