'use client';


import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
    Save, Loader2, Shield, Settings, User, Hotel, Lock, HelpCircle,
    MapPin, Globe, Phone, Mail, LogOut, Trash2,
    CheckCircle2, AlertCircle, Camera, Users, ChevronRight,
    Clock, BedDouble, Info, Zap, ShieldCheck, Edit3
} from "lucide-react";
import { cn, safeParse } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { hotelApi, authApi } from "@/lib/api";

export default function PartnerSettingsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'policies' | 'support' | 'faqs'>('policies');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: "", type: null });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: null }), 3000);
    };

    // Property Deactivation State
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    const handleDeactivateProperty = async () => {
        const confirmFirst = window.confirm(
            "⚠️ DANGER ZONE: Are you absolutely sure you want to deactivate your property?\n\nThis will permanently delete your hotel profile, all rooms, staff records, coupons, and historical settings from the GetHotel platform. This action is irreversible!"
        );
        if (!confirmFirst) return;

        const confirmSecond = window.confirm(
            "Final verification: Do you really want to permanently deactivate and delete this property? You will be logged out immediately after deletion."
        );
        if (!confirmSecond) return;

        setDeactivateLoading(true);
        try {
            const res = await hotelApi.deleteHotel(hotel.id);
            if (res.success) {
                showToast("Property deactivated and deleted successfully!", 'success');
                setTimeout(() => {
                    if (sessionStorage.getItem('token')) {
                        sessionStorage.removeItem('token');
                    } else {
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                    }
                    sessionStorage.removeItem('activeHotelId');
                    window.location.href = '/partner';
                }, 2000);
            }
        } catch (err: any) {
            showToast(err.message || "Failed to deactivate property", 'error');
            setDeactivateLoading(false);
        }
    };

    // Form States
    const [policyForm, setPolicyForm] = useState({
        // 1. Check-In & Check-Out
        checkIn: "12:00 PM",
        checkOut: "11:00 AM",
        earlyCheckIn: "Subject to availability",
        lateCheckOut: "Subject to availability, charges may apply",

        // 2. Cancellation & Refunds
        cancellation: "Free cancellation up to 24 hours before check-in",
        cancellationDeadline: "24 hours",
        nonRefundableConditions: "No refund for same-day cancellations",
        refundPercentage: "100% refund before deadline",

        // 3. Guest & Identification
        localId: "Accepted",
        couplesAllowed: "Yes",
        guestRestrictions: "None",
        visitorPolicy: "Visitors allowed in lobby only after 8 PM",
        requiredId: "Aadhar, Passport or Driving License",

        // 4. Children & Extra Beds
        childrenPolicy: "Children below 5 years stay for free",
        extraBedCharges: "₹1000 per night",

        // 5. Property Rules & Safety
        smoking: "Not allowed inside rooms",
        parties: "Not allowed",
        outsideFood: "Allowed",
        quietHours: "10:00 PM to 07:00 AM",
        safetyFeatures: "CCTV, 24/7 Security, Fire Safety",

        // 6. Payment & Deposits
        advancePayment: "No advance payment required",
        securityDeposit: "No deposit required",
        paymentMethods: "Cash, UPI, Credit/Debit Cards",

        // 7. Pet Policy
        pets: "Not allowed",

        // 8. Facilities (Parking, WiFi, Pool, Gym)
        parking: "Free private parking available",
        wifi: "Free high-speed WiFi",
        poolGymRules: "Pool timings: 7 AM - 8 PM. Proper swimwear required.",

        // 9. Others
        damagePolicy: "Guest is responsible for any damage to property",
        emergencySupport: "Reception: +91 XXXXX XXXXX",
        additionalNotes: ""
    });

    const [faqForm, setFaqForm] = useState<{question: string, answer: string}[]>([]);

    const fetchHotelData = async () => {
        try {
            const res = await hotelApi.getMyHotels({ light: true });
            if (res.success && res.data && res.data.length > 0) {
                const myHotel = res.data[0];
                setHotel(myHotel);
                if (myHotel.policies) {
                    const parsedPolicies = safeParse(myHotel.policies, {});
                    setPolicyForm(prev => ({ ...prev, ...parsedPolicies }));
                }
                if (myHotel.faqs) {
                    setFaqForm(safeParse(myHotel.faqs, []));
                }
            }
        } catch (err) {
            console.error("Failed to fetch hotel data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && authUser?.role === 'hotel_admin') {
            fetchHotelData();
        } else if (!authLoading && !authUser) {
            router("/partner");
        }
    }, [authUser, authLoading, router]);



    const handleUpdatePolicies = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hotel?.id) return;
        setIsSaving(true);
        try {
            const res = await hotelApi.updateHotel(hotel.id, {
                policies: JSON.stringify(policyForm),
                faqs: JSON.stringify(faqForm)
            });
            if (res.success) {
                showToast("Property information updated successfully!", 'success');
            }
        } catch (err: any) {
            showToast(err.message || "Failed to update information", 'error');
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

    if (!hotel) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-100" />
                <h3 className="text-xl font-black text-slate-900">No Property Found</h3>
                <p className="text-slate-500 font-medium">You need to have an active property to access settings.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'policies', label: 'Hotel Policies', icon: Shield },
        { id: 'faqs', label: 'Manage FAQs', icon: HelpCircle },
        { id: 'support', label: 'Support & Help', icon: Phone },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Property Settings</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your property profile, policies and account preferences</p>
                </div>
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast.type && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className={cn(
                                "fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-none shadow-2xl border flex items-center gap-4 min-w-[300px]",
                                toast.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" : "bg-red-600 border-red-500 text-white"
                            )}
                        >
                            <div className="w-8 h-8 bg-white/20 rounded-none flex items-center justify-center">
                                {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">System Message</p>
                                <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex flex-col gap-10">
                <div className="bg-white border border-slate-200 rounded-none shadow-sm">
                    <div className="flex items-center overflow-x-auto w-full scroll-smooth flex-nowrap border-b border-slate-100 custom-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex-shrink-0 min-w-[160px] flex items-center justify-center gap-3 px-8 py-5 text-xs font-black uppercase tracking-widest transition-all relative group whitespace-nowrap",
                                        isActive ? "text-blue-600 bg-blue-50/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                    {tab.label}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                                        />
                                    )}
                                </button>
                            );
                        })}
                        <div className="border-l border-slate-100 px-4">
                            <button className="flex items-center gap-2 px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all whitespace-nowrap">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Full Width */}
                <div className="w-full bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
                    {/* Policies Tab */}
                    {activeTab === 'policies' && (
                        <>
                            <form onSubmit={handleUpdatePolicies}>
                            <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Property Policies & Rules</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Set up global rules that apply to your entire property</p>
                                    </div>
                                    <div className="bg-blue-50 px-4 py-2 rounded-none border border-blue-100 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase">Global Inheritance Active</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-10 space-y-6">
                                {/* Policy Categories - Grid based layout for better UX */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    
                                    {/* 1. Check-in & Out */}
                                    <div className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center text-blue-600 shadow-sm">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Timing & Access</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Check-In</label>
                                                <input type="text" value={policyForm.checkIn} onChange={(e) => setPolicyForm({...policyForm, checkIn: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Check-Out</label>
                                                <input type="text" value={policyForm.checkOut} onChange={(e) => setPolicyForm({...policyForm, checkOut: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Early Check-In / Late Check-Out</label>
                                            <input type="text" value={policyForm.earlyCheckIn} onChange={(e) => setPolicyForm({...policyForm, earlyCheckIn: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* 2. Cancellation */}
                                    <div className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center text-red-600 shadow-sm">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cancellation & Refunds</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Primary Policy</label>
                                            <textarea rows={2} value={policyForm.cancellation} onChange={(e) => setPolicyForm({...policyForm, cancellation: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all resize-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">No-Show / Refund Percentage</label>
                                            <input type="text" value={policyForm.refundPercentage} onChange={(e) => setPolicyForm({...policyForm, refundPercentage: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* 3. Guest Rules */}
                                    <div className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center text-emerald-600 shadow-sm">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Guest Policies</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Local ID Accepted?</label>
                                                <select value={policyForm.localId} onChange={(e) => setPolicyForm({...policyForm, localId: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all appearance-none">
                                                    <option value="Accepted">Accepted</option>
                                                    <option value="Not Accepted">Not Accepted</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Couples Allowed?</label>
                                                <select value={policyForm.couplesAllowed} onChange={(e) => setPolicyForm({...policyForm, couplesAllowed: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all appearance-none">
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Identification Requirements</label>
                                            <input type="text" value={policyForm.requiredId} onChange={(e) => setPolicyForm({...policyForm, requiredId: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* 4. Children & Beds */}
                                    <div className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center text-purple-600 shadow-sm">
                                                <BedDouble className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Children & Extra Beds</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Children Policy</label>
                                            <input type="text" value={policyForm.childrenPolicy} onChange={(e) => setPolicyForm({...policyForm, childrenPolicy: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Extra Bed Charges (Optional)</label>
                                            <input type="text" value={policyForm.extraBedCharges} onChange={(e) => setPolicyForm({...policyForm, extraBedCharges: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* 5. Property Rules */}
                                    <div className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center text-amber-600 shadow-sm">
                                                <Info className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">House Rules & Restrictions</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Smoking Allowed?</label>
                                                <select value={policyForm.smoking} onChange={(e) => setPolicyForm({...policyForm, smoking: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all appearance-none">
                                                    <option value="Not allowed">No</option>
                                                    <option value="Allowed in smoking areas">Smoking Areas Only</option>
                                                    <option value="Allowed">Yes</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Parties/Events?</label>
                                                <select value={policyForm.parties} onChange={(e) => setPolicyForm({...policyForm, parties: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all appearance-none">
                                                    <option value="Not allowed">No</option>
                                                    <option value="Allowed with permission">With Permission</option>
                                                    <option value="Allowed">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Quiet Hours Policy</label>
                                            <input type="text" value={policyForm.quietHours} onChange={(e) => setPolicyForm({...policyForm, quietHours: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* 6. Facilities & Parking */}
                                    <div className="p-8 bg-slate-50 rounded-none border border-slate-100 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center text-sky-600 shadow-sm">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Facilities & Parking</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Parking Policy</label>
                                            <input type="text" value={policyForm.parking} onChange={(e) => setPolicyForm({...policyForm, parking: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">WiFi & Internet Speed</label>
                                            <input type="text" value={policyForm.wifi} onChange={(e) => setPolicyForm({...policyForm, wifi: e.target.value})} className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* Full width sections for safety and notes */}
                                <div className="space-y-6">
                                    <div className="p-8 bg-blue-50/30 rounded-none border border-blue-100 space-y-4">
                                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" /> Safety & Emergency Contact Info
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Safety Features Available</label>
                                                <input type="text" value={policyForm.safetyFeatures} onChange={(e) => setPolicyForm({...policyForm, safetyFeatures: e.target.value})} placeholder="CCTV, Fire extinguishers, Security etc." className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Emergency Support Details</label>
                                                <input type="text" value={policyForm.emergencySupport} onChange={(e) => setPolicyForm({...policyForm, emergencySupport: e.target.value})} placeholder="Police, Hospital, Front desk numbers..." className="w-full px-4 py-3 bg-white border-transparent rounded-none text-xs font-bold focus:border-blue-600 outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-900 rounded-none shadow-xl shadow-slate-200 space-y-4">
                                        <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Edit3 className="w-4 h-4 text-blue-400" /> Additional Property Notes
                                        </h4>
                                        <textarea rows={3} value={policyForm.additionalNotes} onChange={(e) => setPolicyForm({...policyForm, additionalNotes: e.target.value})} placeholder="Any other specific instructions for guests..." className="w-full px-6 py-4 bg-white/10 border-white/10 rounded-none text-xs font-bold text-white placeholder:text-white/30 focus:bg-white/20 outline-none transition-all resize-none" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="px-12 py-5 bg-blue-600 text-white rounded-none font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 flex items-center gap-3 hover:bg-blue-700 active:scale-95 transition-all"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Update All Policies
                                </button>
                            </div>
                        </form>
                        {/* Danger Zone Section relocated from Account settings */}
                        <div className="p-10 border-t border-slate-100 bg-red-50/20">
                            <div className="max-w-2xl">
                                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Danger Zone
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mb-6">Permanently remove this property from the GetHotel platform. This action is irreversible and will delete all rooms, staff records, and settings associated with this specific property.</p>
                                <button 
                                    type="button"
                                    onClick={handleDeactivateProperty}
                                    disabled={deactivateLoading}
                                    className="px-8 py-4 bg-red-600 text-white rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-red-200"
                                >
                                    {deactivateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Deactivate Property
                                </button>
                            </div>
                        </div>
                    </>
                )}

                    {/* FAQ Tab */}
                    {activeTab === 'faqs' && (
                        <div className="p-10 space-y-10 animate-fade-in pb-20">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Property FAQs</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage common guest queries</p>
                                </div>
                                <button 
                                    onClick={() => setFaqForm([...faqForm, { question: "", answer: "" }])}
                                    className="px-6 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all"
                                >
                                    <HelpCircle className="w-4 h-4" /> Add New FAQ
                                </button>
                            </div>

                            <div className="space-y-6">
                                {faqForm.length === 0 ? (
                                    <div className="py-24 border-2 border-dashed border-slate-100 rounded-none flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50">
                                        <div className="w-20 h-20 bg-white rounded-none flex items-center justify-center text-slate-200 shadow-sm">
                                            <HelpCircle className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-900 font-black text-sm uppercase tracking-widest">No FAQs Configured</p>
                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Click the button above to add your first question</p>
                                        </div>
                                    </div>
                                ) : (
                                    faqForm.map((faq, index) => (
                                        <div key={index} className="bg-white border border-slate-200 rounded-none p-10 space-y-8 shadow-sm relative group animate-slide-up">
                                            <button 
                                                onClick={() => setFaqForm(faqForm.filter((_, i) => i !== index))}
                                                className="absolute top-8 right-8 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-none border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-1.5 h-6 bg-blue-600 rounded-none" />
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Segment #{index + 1}</h4>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Question Text</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. Is parking free at your property?"
                                                        value={faq.question}
                                                        onChange={(e) => {
                                                            const newFaqs = [...faqForm];
                                                            newFaqs[index].question = e.target.value;
                                                            setFaqForm(newFaqs);
                                                        }}
                                                        className="w-full px-6 py-5 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Answer / Response</label>
                                                    <textarea 
                                                        placeholder="e.g. Yes, we provide complimentary private parking for all our guests..."
                                                        value={faq.answer}
                                                        onChange={(e) => {
                                                            const newFaqs = [...faqForm];
                                                            newFaqs[index].answer = e.target.value;
                                                            setFaqForm(newFaqs);
                                                        }}
                                                        className="w-full px-6 py-5 bg-slate-50 border-transparent rounded-none text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all min-h-[120px] resize-none shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-10 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={handleUpdatePolicies}
                                    disabled={isSaving}
                                    className="px-16 py-6 bg-slate-900 text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4 hover:bg-black transition-all active:scale-95"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Deploy FAQ Configuration
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Support Tab */}
                    {activeTab === 'support' && (
                        <div className="p-10 space-y-10 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-blue-50 rounded-none border border-blue-100 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                                        <Mail className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Email Support</h4>
                                    <p className="text-xs text-slate-500 font-medium mb-6">Response within 24 hours</p>
                                    <a href="mailto:support@gethotelstays.com" className="text-blue-600 font-black text-sm hover:underline">support@gethotelstays.com</a>
                                </div>
                                <div className="p-8 bg-purple-50 rounded-none border border-purple-100 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                                        <Phone className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Phone Support</h4>
                                    <p className="text-xs text-slate-500 font-medium mb-6">Available 10 AM - 6 PM</p>
                                    <a href="tel:+919876543210" className="text-purple-600 font-black text-sm hover:underline">+91 98765 43210</a>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-10 rounded-none border border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Frequently Asked Questions</h3>
                                <div className="space-y-6">
                                    {[
                                        "How do I update my bank details?",
                                        "Can I add more than one property?",
                                        "How is the 10% commission calculated?",
                                        "What documents are needed for verification?"
                                    ].map((q, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-white rounded-none transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{q}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
}
