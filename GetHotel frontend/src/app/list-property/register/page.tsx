"use client";

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
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partner/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                router.push("/partner-dashboard?status=pending");
            } else {
                const data = await response.json();
                setError(data.error || "Failed to submit request. Please try again.");
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            setError("Something went wrong. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4"
                    >
                        Join Our <span className="text-blue-600 italic">Partner Network</span>
                    </motion.h1>
                    <p className="text-slate-500 font-medium">Create your partner account and start managing your property.</p>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-100 border border-blue-50 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    {/* Left Sidebar Info */}
                    <div className="md:w-1/3 bg-blue-600 p-10 text-white flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                                <Hotel className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black mb-4">Partner Setup</h2>
                            <p className="text-blue-100 text-sm leading-relaxed mb-8">Follow these steps to register your property and create your admin account.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step === 1 ? 'bg-white text-blue-600 border-white' : 'border-blue-400 opacity-50'}`}>1</div>
                                Property Details
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step === 2 ? 'bg-white text-blue-600 border-white' : 'border-blue-400 opacity-50'}`}>2</div>
                                Contact Info
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-blue-50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step === 3 ? 'bg-white text-blue-600 border-white' : 'border-blue-400 opacity-50'}`}>3</div>
                                Admin Account
                            </div>
                        </div>
                    </div>

                    {/* Right Form Area */}
                    <div className="md:w-2/3 p-10 md:p-14">
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Hotel Username (@)</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold">@</div>
                                                    <input 
                                                        type="text" name="hotelUsername" required value={formData.hotelUsername} onChange={handleChange}
                                                        placeholder="royal_orchid"
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Base Price (Per Night)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input 
                                                        type="number" name="pricePerNight" required value={formData.pricePerNight} onChange={handleChange}
                                                        placeholder="2500"
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                                                    />
                                                </div>
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

                                        <div className="space-y-2 pb-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Address</label>
                                            <textarea 
                                                name="address" required value={formData.address} onChange={handleChange}
                                                placeholder="Complete physical address"
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all h-20 resize-none"
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
                    <p className="text-slate-400 text-sm font-medium">By registering, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.</p>
                </div>
            </div>
        </div>
    );
}
