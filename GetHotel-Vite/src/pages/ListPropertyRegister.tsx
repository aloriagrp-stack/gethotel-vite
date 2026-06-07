

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Hotel, 
    MapPin, 
    User, 
    Mail, 
    Phone, 
    DollarSign, 
    FileText, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft,
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
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        hotelName: "",
        hotelUsername: "",
        tagline: "",
        description: "",
        address: "",
        city: "",
        pricePerNight: "",
        userName: "",
        userEmail: "",
        userPhone: "",
        partnerPassword: "",
        confirmPassword: ""
    });

    const { login, logout } = useAuth();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            // 1. Submit Registration Request
            const finalData = {
                ...formData,
                hotelUsername: formData.hotelUsername || formData.hotelName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000)
            };

            const response = await partnerApi.submitRequest(finalData);
            
            if (response.success && response.token) {
                // 3. Set the token and user state immediately
                localStorage.setItem('token', response.token);
                // Trigger a re-fetch of user data or update context if possible
                // Since we have the token, we can just redirect
                router("/partner-dashboard?status=pending");
                // Optional: Force reload to ensure context is fresh
                window.location.reload();
            } else {
                router("/partner");
            }
            // Auto-redirect or success handling happens in the try block above
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
                            <p className="text-blue-100 text-sm leading-relaxed mb-10">Register your property details and create your secure admin account to start receiving bookings.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${step === 1 ? 'bg-white text-blue-600 border-white shadow-lg' : 'border-blue-400 opacity-50'}`}>1</div>
                                Property Details
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${step === 2 ? 'bg-white text-blue-600 border-white shadow-lg' : 'border-blue-400 opacity-50'}`}>2</div>
                                Contact Info
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${step === 3 ? 'bg-white text-blue-600 border-white shadow-lg' : 'border-blue-400 opacity-50'}`}>3</div>
                                Admin Account
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
                        <form onSubmit={handleSubmit} className="h-full flex flex-col">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div 
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Hotel Name</label>
                                            <div className="relative">
                                                <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="text" name="hotelName" required value={formData.hotelName} onChange={handleChange}
                                                    placeholder="e.g. Royal Orchid Resort"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tagline</label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="text" name="tagline" required value={formData.tagline} onChange={handleChange}
                                                    placeholder="Luxury Meets Nature"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">City</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="text" name="city" required value={formData.city} onChange={handleChange}
                                                    placeholder="Agra, Uttar Pradesh"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Address</label>
                                            <textarea 
                                                name="address" required value={formData.address} onChange={handleChange}
                                                placeholder="Complete physical address"
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all h-20 resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Base Price per Night (₹)</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</div>
                                                <input 
                                                    type="number" name="pricePerNight" min="0" required value={formData.pricePerNight} onChange={handleChange}
                                                    placeholder="e.g. 2500"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 pb-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Property Description</label>
                                            <textarea 
                                                name="description" required value={formData.description} onChange={handleChange}
                                                placeholder="Describe your property (e.g. amenities, vibe, policy)..."
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all h-24 resize-none"
                                            />
                                        </div>

                                        <button 
                                            type="button" onClick={() => setStep(2)}
                                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                        >
                                            Continue <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div 
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="text" name="userName" required value={formData.userName} onChange={handleChange}
                                                    placeholder="John Doe"
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

                                        <div className="flex gap-4 pt-4">
                                            <button 
                                                type="button" onClick={() => setStep(1)}
                                                className="w-1/3 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Back
                                            </button>
                                            <button 
                                                type="button" onClick={() => setStep(3)}
                                                className="w-2/3 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                            >
                                                Next <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div 
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6">
                                            <p className="text-xs font-bold text-blue-700 leading-relaxed">
                                                This account will be used to access your Partner Dashboard. Choose a strong partnerPassword.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Set partnerPassword</label>
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
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm partnerPassword</label>
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

                                        <div className="flex gap-4 pt-8">
                                            <button 
                                                type="button" onClick={() => setStep(2)}
                                                className="w-1/3 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Back
                                            </button>
                                            <button 
                                                type="submit" disabled={loading}
                                                className="w-2/3 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                                                ) : (
                                                    <>Submit & Register <CheckCircle2 className="w-4 h-4" /></>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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



