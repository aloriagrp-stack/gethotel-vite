import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hotelApi, authApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Hotel, MapPin, Star, ChevronRight, LogOut, Loader2, BedDouble, Plus, X,
    Lock, Shield, ShieldCheck, Mail, Clock, AlertCircle, CheckCircle2, KeyRound,
    Settings
} from "lucide-react";
import { cn, safeParse } from "@/lib/utils";

export default function PartnerHotelSelect() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useNavigate();
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [entering, setEntering] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [newProperty, setNewProperty] = useState({
        name: "",
        city: "",
        address: "",
        tagline: ""
    });

    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: "", type: null });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: null }), 3000);
    };

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
        }
    }, [user]);

    // ── Account Security States ──
    const [accountForm, setAccountForm] = useState({ newPassword: "", confirmPassword: "" });
    const [otpCode, setOtpCode] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [accountLoading, setAccountLoading] = useState(false);

    // Send OTP for Password Change
    const handleSendChangePasswordOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountForm.newPassword || !accountForm.confirmPassword) {
            showToast("New password and confirm password are required.", 'error');
            return;
        }
        if (accountForm.newPassword.length < 6) {
            showToast("Password must be at least 6 characters long.", 'error');
            return;
        }
        if (accountForm.newPassword !== accountForm.confirmPassword) {
            showToast("Passwords do not match.", 'error');
            return;
        }
        setAccountLoading(true);
        try {
            const res = await authApi.sendChangePasswordOTP({
                newPassword: accountForm.newPassword,
                confirmPassword: accountForm.confirmPassword
            });
            if (res.success) {
                setIsOtpSent(true);
                showToast("OTP sent to your registered email!", 'success');
            }
        } catch (err: any) {
            showToast(err.message || "Failed to send OTP", 'error');
        } finally {
            setAccountLoading(false);
        }
    };

    // Verify OTP & Save Password
    const handleVerifyChangePasswordOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode) {
            showToast("Please enter the 6-digit OTP code.", 'error');
            return;
        }
        setAccountLoading(true);
        try {
            const res = await authApi.verifyChangePasswordOTP(otpCode);
            if (res.success) {
                showToast("Password updated successfully!", 'success');
                if (res.data) {
                    setCurrentUser((prev: any) => ({
                        ...prev,
                        passwordLastChangedAt: res.data.passwordLastChangedAt,
                        passwordChangeHistory: res.data.passwordChangeHistory
                    }));
                }
                setAccountForm({ newPassword: "", confirmPassword: "" });
                setOtpCode("");
                setIsOtpSent(false);
            }
        } catch (err: any) {
            showToast(err.message || "Invalid OTP code", 'error');
            setAccountLoading(false);
        }
    };

    // ── Email Change States ──
    const [newEmail, setNewEmail] = useState("");
    const [emailOtpCode, setEmailOtpCode] = useState("");
    const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);

    const getEmailChangesLeft = () => {
        if (!currentUser?.emailChangeHistory) return 2;
        try {
            const history = JSON.parse(currentUser.emailChangeHistory);
            if (!Array.isArray(history)) return 2;
            const currentYear = new Date().getFullYear();
            const changesThisYear = history.filter((d: string) => new Date(d).getFullYear() === currentYear);
            return Math.max(0, 2 - changesThisYear.length);
        } catch {
            return 2;
        }
    };

    // Send OTP for Email Change
    const handleSendChangeEmailOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) {
            showToast("New email address is required.", 'error');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showToast("Please enter a valid email address.", 'error');
            return;
        }
        setAccountLoading(true);
        try {
            const res = await authApi.sendChangeEmailOTP({ newEmail });
            if (res.success) {
                setIsEmailOtpSent(true);
                showToast("OTP sent to your new email address!", 'success');
            }
        } catch (err: any) {
            showToast(err.message || "Failed to send OTP", 'error');
        } finally {
            setAccountLoading(false);
        }
    };

    // Verify OTP & Save New Email
    const handleVerifyChangeEmailOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailOtpCode) {
            showToast("Please enter the 6-digit OTP code.", 'error');
            return;
        }
        setAccountLoading(true);
        try {
            const res = await authApi.verifyChangeEmailOTP(emailOtpCode);
            if (res.success) {
                showToast("Email address updated successfully!", 'success');
                if (res.data) {
                    setCurrentUser((prev: any) => ({
                        ...prev,
                        email: res.data.email,
                        emailChangeHistory: res.data.emailChangeHistory
                    }));
                }
                setNewEmail("");
                setEmailOtpCode("");
                setIsEmailOtpSent(false);
                setIsChangingEmail(false);
            }
        } catch (err: any) {
            showToast(err.message || "Email verification failed", 'error');
        } finally {
            setAccountLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "hotel_admin")) {
            router("/partner");
            return;
        }
        if (user) fetchHotels();
    }, [user, authLoading]);

    const fetchHotels = async () => {
        try {
            const res = await hotelApi.getMyHotels({ light: true });
            const list = Array.isArray(res) ? res : (res.data || []);
            setHotels(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectHotel = (hotelId: number) => {
        setEntering(hotelId);
        sessionStorage.setItem("activeHotelId", String(hotelId));
        localStorage.setItem("activeHotelId", String(hotelId));
        setTimeout(() => {
            router("/partner-dashboard");
        }, 600);
    };

    const handleCreateProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError("");
        if (!newProperty.name.trim() || !newProperty.city.trim() || !newProperty.address.trim()) {
            setCreateError("Property name, city, and address are required.");
            return;
        }
        setCreating(true);
        try {
            const res = await hotelApi.createHotel({
                name: newProperty.name.trim(),
                city: newProperty.city.trim(),
                address: newProperty.address.trim(),
                tagline: newProperty.tagline.trim() || "New property setup in progress",
                description: "This property is being set up by the partner.",
                pricePerNight: 0,
                starRating: 3,
                images: [],
                amenities: [],
                dining: [],
                wellness: [],
                faqs: [],
                safety: [],
                policies: [],
                mainAmenities: [],
                isDraft: true
            });
            if (res.success && res.data?.id) {
                sessionStorage.setItem("activeHotelId", String(res.data.id));
                localStorage.setItem("activeHotelId", String(res.data.id));
                setHotels((current) => [res.data, ...current]);
                setShowAddModal(false);
                router("/partner-dashboard/hotel");
            }
        } catch (err: any) {
            setCreateError(err.message || "Could not create property. Please try again.");
            console.error("CREATE_DRAFT_PROPERTY_ERROR:", err);
        } finally {
            setCreating(false);
        }
    };

    const addPropertyCard = (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hotels.length * 0.07 }}
            onClick={() => setShowAddModal(true)}
            className="relative bg-slate-50/50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-white rounded-2xl overflow-hidden p-6 transition-all duration-300 group flex flex-col justify-between items-center text-center min-h-[300px] active:scale-[0.98]"
        >
            <div className="my-auto flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Plus className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 text-base tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                        Add New Property
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-1 max-w-[220px]">
                        Create a draft property inside this group account
                    </p>
                </div>
            </div>
            <div className="w-full flex items-center justify-center gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest pt-4 border-t border-slate-100 group-hover:gap-2 transition-all">
                <span>Create Draft</span>
                <ChevronRight className="w-3.5 h-3.5" />
            </div>
        </motion.button>
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative pb-24">

            {/* ── Top Bar ── */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">
                        GetHotel<span className="text-blue-600 italic">Stays</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Portal</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-500 hidden sm:block">
                        Welcome, {user?.name?.split(" ")[0]}
                    </span>
                    <button
                        id="partner-logout-btn"
                        onClick={() => { logout(); router("/partner"); }}
                        className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col items-center justify-start pt-10 md:pt-16 p-6 md:p-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-4xl"
                >
                    {/* Page Title */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Partner Portal
                        </h2>
                        <p className="text-slate-400 font-medium mt-2 text-sm">
                            Manage your properties and account credentials
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key="properties"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                        >
                            {hotels.length === 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                                    <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                                        <BedDouble className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 font-black">No properties linked yet.</p>
                                        <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest mt-1">Create your first draft property</p>
                                    </div>
                                    {addPropertyCard}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {hotels.map((hotel, i) => (
                                        <motion.button
                                            key={hotel.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                            onClick={() => handleSelectHotel(hotel.id)}
                                            disabled={entering !== null}
                                            className="relative text-left bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group active:scale-[0.98] disabled:opacity-70"
                                        >
                                            <div className="h-36 w-full bg-slate-100 overflow-hidden relative">
                                                {hotel.thumbnail ? (
                                                    <img
                                                        src={hotel.thumbnail}
                                                        alt={hotel.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                                                        <Hotel className="w-10 h-10 text-blue-200" />
                                                    </div>
                                                )}
                                                {entering === hotel.id && (
                                                    <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                    </div>
                                                )}
                                                {hotel.rating && (
                                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                        <span className="text-[10px] font-black text-slate-700">{parseFloat(hotel.rating).toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-black text-slate-900 text-base tracking-tight uppercase group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {hotel.name}
                                                </h3>
                                                <p className="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1 line-clamp-1">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    {hotel.city}{hotel.address ? `, ${hotel.address}` : ""}
                                                </p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                        hotel.isActive
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-amber-50 text-amber-600"
                                                    }`}>
                                                        {hotel.isActive ? "Active" : "Draft"}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Manage</span>
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                    {addPropertyCard}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </main>

            {/* ── Floating Settings Button (Bottom Right) ── */}
            <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block"
                >
                    Account Settings
                </motion.div>
                <motion.button
                    id="account-settings-btn"
                    whileHover={{ scale: 1.08, rotate: 45 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSecurityModal(true)}
                    className="w-14 h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/20 transition-colors duration-300"
                >
                    <Settings className="w-6 h-6" />
                </motion.button>
            </div>

            {/* ── Account Security Settings Modal ── */}
            <AnimatePresence>
                {showSecurityModal && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 15 }}
                            className="w-full max-w-4xl bg-[#F8FAFC] rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Account Security Settings</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Credentials apply globally across all your properties
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowSecurityModal(false);
                                        // Reset inner states on close
                                        setIsOtpSent(false);
                                        setOtpCode("");
                                        setIsEmailOtpSent(false);
                                        setNewEmail("");
                                        setEmailOtpCode("");
                                        setIsChangingEmail(false);
                                    }}
                                    className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body: Side by Side Cards */}
                            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                
                                {/* ── Password Card ── */}
                                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Change Password</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">OTP verification required</p>
                                                </div>
                                            </div>
                                            <button
                                                id="password-history-btn"
                                                onClick={() => setShowHistoryModal(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                                            >
                                                <Clock className="w-3 h-3" />
                                                History
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            {currentUser?.passwordLastChangedAt && (
                                                <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                                                        Last changed: {new Date(currentUser.passwordLastChangedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            )}

                                            {!isOtpSent ? (
                                                <form id="change-password-form" onSubmit={handleSendChangePasswordOTP} className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Min. 6 characters"
                                                            value={accountForm.newPassword}
                                                            onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Re-enter password"
                                                            value={accountForm.confirmPassword}
                                                            onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={accountLoading}
                                                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-60 shadow-md"
                                                    >
                                                        {accountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                                                        Send OTP to Email
                                                    </button>
                                                </form>
                                            ) : (
                                                <form id="verify-password-otp-form" onSubmit={handleVerifyChangePasswordOTP} className="space-y-4">
                                                    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                                                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                                        <p className="text-[10px] font-bold text-blue-700 leading-normal">
                                                            OTP sent to registered email. Enter it below to confirm.
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enter 6-Digit OTP</label>
                                                        <input
                                                            id="password-otp-input"
                                                            type="text"
                                                            placeholder="— — — — — —"
                                                            maxLength={6}
                                                            value={otpCode}
                                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black tracking-[0.5em] text-center focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={accountLoading}
                                                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60"
                                                        >
                                                            {accountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                            Confirm Password
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setIsOtpSent(false); setOtpCode(""); }}
                                                            className="px-4 py-3.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Email Card ── */}
                                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-full">
                                    <div>
                                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex items-center gap-3">
                                            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Change Email Address</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Max 2 changes per calendar year</p>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {/* Current Email */}
                                            <div className="flex items-center justify-between mb-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Email</p>
                                                    <p className="text-xs font-bold text-slate-900 break-all">{currentUser?.email || user?.email}</p>
                                                </div>
                                                <div className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0">
                                                    <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Verified</p>
                                                </div>
                                            </div>

                                            <div className="mb-4 inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg">
                                                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                                                    Remaining this year: {getEmailChangesLeft()} / 2
                                                </p>
                                            </div>

                                            {isEmailOtpSent ? (
                                                <form id="verify-email-otp-form" onSubmit={handleVerifyChangeEmailOTP} className="space-y-4 mt-2">
                                                    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                                                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                                        <p className="text-[10px] font-bold text-blue-700 leading-normal">
                                                            OTP sent to <strong>{newEmail}</strong>. Enter below.
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enter 6-Digit OTP</label>
                                                        <input
                                                            id="email-otp-input"
                                                            type="text"
                                                            placeholder="— — — — — —"
                                                            maxLength={6}
                                                            value={emailOtpCode}
                                                            onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black tracking-[0.5em] text-center focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={accountLoading}
                                                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-60"
                                                        >
                                                            {accountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                            Confirm Email
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setIsEmailOtpSent(false); setNewEmail(""); setEmailOtpCode(""); }}
                                                            className="px-4 py-3.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : isChangingEmail ? (
                                                <form id="change-email-form" onSubmit={handleSendChangeEmailOTP} className="space-y-4 mt-2">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Email Address</label>
                                                        <input
                                                            type="email"
                                                            placeholder="new-email@example.com"
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={accountLoading || getEmailChangesLeft() === 0}
                                                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-60 shadow-md"
                                                        >
                                                            {accountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                                                            Send Verification OTP
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsChangingEmail(false)}
                                                            className="px-4 py-3.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button
                                                    id="start-change-email-btn"
                                                    type="button"
                                                    disabled={getEmailChangesLeft() === 0}
                                                    onClick={() => setIsChangingEmail(true)}
                                                    className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-[10px] text-slate-600 uppercase tracking-widest hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    {getEmailChangesLeft() === 0 ? "Limit Reached for This Year" : "Change Email Address"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Add Property Modal ── */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Add New Property</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Same partner login, new draft property</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                disabled={creating}
                                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProperty} className="p-6 space-y-5">
                            {createError && (
                                <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold">
                                    {createError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Name</label>
                                <input
                                    type="text"
                                    value={newProperty.name}
                                    onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                                    placeholder="Example: Hotel Grand View"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                                    <input
                                        type="text"
                                        value={newProperty.city}
                                        onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                                        placeholder="New Delhi"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagline</label>
                                    <input
                                        type="text"
                                        value={newProperty.tagline}
                                        onChange={(e) => setNewProperty({ ...newProperty, tagline: e.target.value })}
                                        placeholder="Optional"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                                <textarea
                                    value={newProperty.address}
                                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                                    placeholder="Full property address"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 resize-none"
                                />
                            </div>
                            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-[11px] font-bold text-amber-700 leading-relaxed">
                                This creates a draft property. It will stay hidden from public search until rooms, pricing, images, and details are completed.
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={creating}
                                    className="px-5 py-3 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-black shadow-lg shadow-blue-100 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create Draft
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* ── Toast Notification ── */}
            <AnimatePresence>
                {toast.type && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={cn(
                            "fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[280px] border",
                            toast.type === 'success'
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "bg-red-600 border-red-500 text-white"
                        )}
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">System Message</p>
                            <p className="text-sm font-bold">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Password History Modal ── */}
            <AnimatePresence>
                {showHistoryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowHistoryModal(false)}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 20, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white max-w-md w-full shadow-2xl rounded-2xl border border-slate-100 flex flex-col max-h-[80vh] overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Password History</h3>
                                </div>
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="text-slate-400 hover:text-slate-900 px-3 py-1.5 border border-transparent hover:border-slate-200 hover:bg-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                {(() => {
                                    const historyList = currentUser?.passwordChangeHistory
                                        ? safeParse(currentUser.passwordChangeHistory, [])
                                        : [];
                                    if (!historyList || historyList.length === 0) {
                                        return (
                                            <div className="text-center py-10 space-y-3">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                                    <Shield className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">No History Found</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password hasn't been changed yet.</p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="space-y-6">
                                            {historyList.slice().reverse().map((timestamp: string, idx: number) => (
                                                <div key={idx} className="flex gap-4 relative">
                                                    {idx !== historyList.length - 1 && (
                                                        <div className="absolute top-8 bottom-[-24px] left-[15px] w-px bg-slate-200" />
                                                    )}
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex-shrink-0 flex items-center justify-center z-10">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div className="pt-1">
                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Password Changed</p>
                                                        <p className="text-[10px] font-bold text-slate-500 mt-1 tracking-wider uppercase">
                                                            {new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
