import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Loader2, ArrowRight, Hotel, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login, user, loading: authLoading } = useAuth();
    const router = useRouter();

    // If already logged in as hotel_admin, skip login and go to selector
    useEffect(() => {
        if (!authLoading && user?.role === 'hotel_admin') {
            router('/partner-select');
        }
    }, [user, authLoading, router]);

    // Auto-hide error notification
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const cleanEmail = email.trim();
            const user = await login({ 
                email: cleanEmail, 
                password: password,
                pass: password,
                userpassword: password,
                partnerpassword: password,
                partnerPassword: password 
            });
            if (user.role === 'hotel_admin') {
                router("/partner-select");
            } else {
                setError("This account is not authorized for Partner Central.");
            }
        } catch (err: any) {
            setError(err.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans">
            
            {/* Static Wave Background - Darker & Prominent */}
            <div className="absolute inset-0 z-0 opacity-100 pointer-events-none overflow-hidden">
                <svg className="absolute bottom-0 w-full h-[65%] text-blue-100" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path 
                        fill="currentColor" 
                        d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
                <svg className="absolute bottom-0 w-full h-[45%] text-blue-200/60" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path 
                        fill="currentColor" 
                        d="M0,64L48,80C96,96,192,128,288,144C384,160,480,160,576,144C672,128,768,96,864,112C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 mt-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    {/* Branding Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic mb-2">
                            gethotelstays <span className="text-blue-600">partner</span><span className="text-blue-600 not-italic">.</span>
                        </h1>
                    </div>


                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username or Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="email" required placeholder="name@hotel.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="off"
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[20px] pl-14 pr-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type={showPassword ? "text" : "password"} required placeholder="••••••••"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="off"
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[20px] pl-14 pr-14 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all shadow-sm"
                                    />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-6 bg-slate-900 text-white font-black rounded-[20px] shadow-2xl shadow-slate-200 hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>Login <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <Link to="/list-property" className="text-[11px] font-[900] text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                            New Partner Registration <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </main>

            {/* Support Footer */}
            <footer className="relative z-20 p-8 text-center">
                {/* Clean Footer */}
            </footer>

            {/* Cute Bottom-Left Notification */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 24, scale: 1 }}
                        exit={{ opacity: 0, x: -100, scale: 0.8 }}
                        className="fixed bottom-6 left-0 z-50 max-w-sm"
                    >
                        <div className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                                <span className="text-xl">✨</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Oops...</h4>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                                    Those keys don't seem to fit! Please check your credentials and try again.
                                </p>
                            </div>
                            <button 
                                onClick={() => setError("")}
                                className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
