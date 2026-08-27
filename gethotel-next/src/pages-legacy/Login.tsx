'use client';


import { useState } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff, User } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import Image from "@/components/common/Image";
import { TravelIllustration } from "@/components/auth/TravelIllustration";
import { Suspense, useEffect } from "react";
import SEOHead from "@/components/common/SEOHead";

const translations: Record<string, Record<string, string>> = {
    en: {
        welcome: "Welcome back", login_desc: "Access your premium travel dashboard.",
        create: "Create an account", join_desc: "Join our elite travel community today.",
        full_name: "Full Name", email: "Email Address", password: "Password",
        forgot: "Forgot password?", sign_in: "Sign In", sign_up: "Sign Up",
        already: "Already have an account?", no_account: "Don't have an account?",
        google: "Continue with Google"
    },
    hi: {
        welcome: "स्वागत है", login_desc: "अपने प्रीमियम यात्रा डैशबोर्ड तक पहुंचें।",
        create: "खाता बनाएं", join_desc: "आज ही हमारे विशिष्ट यात्रा समुदाय में शामिल हों।",
        full_name: "पूरा नाम", email: "ईमेल पता", password: "पासवर्ड",
        forgot: "पासवर्ड भूल गए?", sign_in: "साइन इन करें", sign_up: "साइन अप करें",
        already: "पहले से ही एक खाता है?", no_account: "खाता नहीं है?",
        google: "गूगल के साथ जारी रखें"
    },
    de: {
        welcome: "Willkommen zurück", login_desc: "Greifen Sie auf Ihr Premium-Reise-Dashboard zu.",
        create: "Konto erstellen", join_desc: "Treten Sie noch heute unserer Elite-Reise-Community bei.",
        full_name: "Vollständiger Name", email: "E-Mail-Adresse", password: "Passwort",
        forgot: "Passwort vergessen?", sign_in: "Anmelden", sign_up: "Registrieren",
        already: "Hast du schon ein Konto?", no_account: "Noch kein Konto?",
        google: "Mit Google fortfahren"
    },
    fr: {
        welcome: "Bon retour", login_desc: "Accédez à votre tableau de bord de voyage premium.",
        create: "Créer un compte", join_desc: "Rejoignez notre communauté de voyage d'élite dès aujourd'hui.",
        full_name: "Nom complet", email: "Adresse e-mail", password: "Mot de passe",
        forgot: "Mot de passe oublié ?", sign_in: "Se connecter", sign_up: "S'inscrire",
        already: "Vous avez déjà un compte ?", no_account: "Vous n'avez pas de compte ?",
        google: "Continuer avec Google"
    }
};

function LoginContent() {
    const [langCode, setLangCode] = useState("en");

    useEffect(() => {
        const saved = localStorage.getItem('user-language');
        if (saved) setLangCode(saved);

        const handleSync = () => {
            const current = localStorage.getItem('user-language');
            if (current) setLangCode(current);
        };
        window.addEventListener('languageChanged', handleSync);
        return () => window.removeEventListener('languageChanged', handleSync);
    }, []);

    const t = (key: string) => translations[langCode]?.[key] || translations['en'][key] || key;
    const [isRegister, setIsRegister] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get("mode");
        const isRegisterPath = window.location.pathname === "/register";
        
        if (mode === "signup" || isRegisterPath) {
            setIsRegister(true);
        } else {
            setIsRegister(false);
        }
    }, [searchParams]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");
    const [verified, setVerified] = useState(false);
    const { login, googleLogin } = useAuth();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            await googleLogin(idToken);
            const redirectPath = searchParams.get("redirect") || "/profile";
            router(redirectPath);
        } catch (err: any) {
            if (err.code === 'auth/unauthorized-domain') {
                setError("This domain is not authorized. Please contact support.");
            } else {
                setError(err.message || "Failed to login with Google");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (isRegister) {
                // Step 1: send OTP
                await authApi.sendOTP({ name: name || email.split('@')[0], email, password, role: 'user' });
                setOtpStep(true);
                setOtpSuccess(`A 6-digit OTP has been sent to ${email}. Please check your inbox.`);
            } else {
                await login({
                    email,
                    password,
                    userpassword: password,
                    partnerpassword: password,
                    portal: 'user'
                });
                const redirectPath = searchParams.get("redirect") || "/";
                router(redirectPath);
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await authApi.verifyOTP({ email, otp });
            localStorage.setItem('token', res.token);
            // Show success screen for 2 seconds then redirect
            setVerified(true);
            setTimeout(() => {
                const redirectPath = searchParams.get("redirect") || "/";
                router(redirectPath);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Invalid OTP. Please try again.");
            setLoading(false);
        }
    };

    // ── Full-screen success overlay (shown for 2s after OTP verified) ──
    if (verified) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    className="flex flex-col items-center gap-5"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center shadow-xl shadow-emerald-100">
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Created!</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Taking you home...</p>
                    </div>
                    {/* Dotted loader reused */}
                    <div className="relative w-10 h-10 mt-2">
                        {[...Array(8)].map((_, i) => {
                            const angle = (i * 2 * Math.PI) / 8;
                            const top = 50 + 38 * Math.sin(angle);
                            const left = 50 + 38 * Math.cos(angle);
                            return (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-dotted"
                                    style={{ top: `${top}%`, left: `${left}%`, animationDelay: `${i * 0.12}s` }}
                                />
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sky-50/50 flex flex-col md:flex-row overflow-hidden relative">
            <SEOHead title="Login or Sign Up | GetHotelStays" description="Sign in to GetHotelStays to manage bookings, save favorites & get exclusive deals on hotels across India." noIndex />


            {/* Left Panel: Full Screen Image with Focal Point */}
            <div className="hidden md:block w-1/2 h-screen relative bg-slate-50">
                <Image 
                    src="/loginpagephoto.jpg"
                    alt="Travel Illustration"
                    fill
                    className="object-cover object-left"
                    priority
                />
            </div>

            {/* Right Panel: Form Area */}
            <div className="flex-1 min-h-[calc(100vh-80px)] md:h-screen flex items-start md:items-center justify-center p-6 md:p-8 pt-8 md:pt-8 bg-transparent overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-xs w-full"
                >
                    <div className="mb-4 text-center">
                        <AnimatePresence mode="wait">
                            <motion.h1 
                                key={isRegister ? "register" : "login"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-2xl font-black text-slate-900 mb-1 tracking-tight"
                            >
                                {isRegister ? t('create') : "Login"}
                            </motion.h1>
                        </AnimatePresence>
                        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">
                            {isRegister 
                                ? t('join_desc') 
                                : "Access your traveler profile"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {otpStep ? (
                        /* ── OTP Verification Step ── */
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="text-center mb-2">
                                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <ShieldCheck className="w-6 h-6 text-sky-500" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{otpSuccess}</p>
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Enter OTP</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xl font-black text-center text-slate-900 tracking-[0.5em] focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full py-3.5 bg-sky-500 text-white font-black rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Create Account"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setOtpStep(false); setOtp(""); setError(""); setOtpSuccess(""); }}
                                className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                ← Go back
                            </button>
                        </form>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {isRegister && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-0.5"
                            >
                                <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">{t('full_name')}</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-0.5">
                            <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                                <input 
                                    type="email" 
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none pr-12"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3.5 bg-sky-500 text-white font-black rounded-xl shadow-lg shadow-sky-50 hover:bg-sky-600 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest mt-1"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>{isRegister ? "Create Account" : "Sign In"}</>
                            )}
                        </button>
                    </form>
                    )} {/* end of otpStep ternary */}

                    {!otpStep && (
                    <>
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">
                            <span className="bg-white px-3">or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3 border border-slate-100 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm mb-6"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Google</span>
                    </button>

                    <div className="text-center">
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                            {isRegister
                                ? <><span>Already have an account? </span><span className="text-indigo-600 underline">Sign in</span></>
                                : <><span>New to GetHotel? </span><span className="text-indigo-600 underline">Create account</span></>}
                        </button>
                    </div>
                    </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}



