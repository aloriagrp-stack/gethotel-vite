'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import { 
    Hotel, 
    User, 
    Mail, 
    Phone, 
    CheckCircle2, 
    Loader2, 
    Lock, 
    Eye, 
    EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { partnerApi } from "@/lib/api";

export default function PartnerRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userPhone: "",
        partnerPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.partnerPassword !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            // Safe fallback defaults for hotel details, required by the database structure
            const finalData = {
                // Account details
                userName: formData.userName,
                userEmail: formData.userEmail.trim(),
                userPhone: formData.userPhone.trim(),
                partnerPassword: formData.partnerPassword,
                confirmPassword: formData.confirmPassword,
                
                // Default placeholders (optional in backend, but sent for backward compatibility)
                hotelName: `${formData.userName}'s Property`,
                hotelUsername: `hotel_${formData.userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`,
                tagline: "Luxury Meets Comfort",
                description: "A beautiful property listed by GetHotel partner.",
                address: "N/A",
                city: "N/A",
                pricePerNight: "0"
            };

            const response = await partnerApi.submitRequest(finalData);
            
            if (response.success && response.token) {
                // Set the token and user state immediately
                localStorage.setItem('token', response.token);
                // Redirect to partner dashboard
                router("/partner-dashboard?status=pending");
                // Force reload to ensure auth state is fresh
                window.location.reload();
            } else {
                router("/partner");
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            if (error.errors && Array.isArray(error.errors)) {
                setError(error.errors.map((e: any) => e.message).join(" | "));
            } else if (error.error) {
                setError(error.error);
            } else {
                setError(error.message || "Something went wrong. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-20 pb-4 px-10">
            <div className="w-full max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-black tracking-tight text-slate-900"
                        >
                            Join Our <span className="text-blue-600 italic">Partner Network</span>
                        </motion.h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Scale your property business with GetHotel Stays.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Professional Dashboard</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Support</div>
                    </div>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[calc(100vh-250px)]">
                    {/* Left Sidebar Info */}
                    <div className="md:w-96 bg-blue-600 p-12 text-white flex flex-col justify-between shrink-0">
                        <div>
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md shadow-xl">
                                <Hotel className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 leading-none italic">Partner Setup</h2>
                            <p className="text-blue-100 text-sm leading-relaxed mb-10">Create your secure partner account to list your hotels, homestays, or villas and start receiving bookings.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <CheckCircle2 className="w-5 h-5 text-blue-200" />
                                Direct Bookings Control
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <CheckCircle2 className="w-5 h-5 text-blue-200" />
                                Add Multiple Properties
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <CheckCircle2 className="w-5 h-5 text-blue-200" />
                                Real-time AI Room Copilot
                            </div>
                        </div>
                    </div>

                    {/* Right Form Area */}
                    <div className="flex-1 p-12 md:p-16 bg-slate-50/30 overflow-y-auto">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" name="userName" required value={formData.userName} onChange={handleChange}
                                            placeholder="e.g. Amit Sharma"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address (Mandatory)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="email" name="userEmail" required value={formData.userEmail} onChange={handleChange}
                                            placeholder="john@example.com"
                                            autoComplete="off"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number (Mandatory)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="tel" name="userPhone" required value={formData.userPhone} onChange={handleChange}
                                            placeholder="+91 99999 99999"
                                            autoComplete="off"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Set Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type={showPassword ? "text" : "password"} name="partnerPassword" required value={formData.partnerPassword} onChange={handleChange}
                                            placeholder="••••••••"
                                            autoComplete="off"
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                        <button 
                                            type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                            placeholder="••••••••"
                                            autoComplete="off"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                                 shoot-btn="true"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                                    ) : (
                                        <>Submit & Register <CheckCircle2 className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm font-medium">By registering, you agree to our <Link to="/terms-&-conditions" className="text-blue-600 hover:underline">Terms & Conditions</Link>.</p>
                </div>
            </div>
        </div>
    );
}
