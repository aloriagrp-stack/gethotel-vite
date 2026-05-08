"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, Zap, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const user = await login({ email, controlpassword: password });
            if (user.role === 'super_admin') {
                router.push("/admin/super");
            } else {
                setError("Authorized personnel only. Access denied.");
            }
        } catch (err: any) {
            setError(err.message || "Invalid administrative credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Minimal Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -tr-20"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -bl-20"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Branding & Header (No Card) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-10 backdrop-blur-md">
                        <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Master Control Hub</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter italic">
                        Control<span className="text-blue-500">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.5em] mt-4">Authorized Entry Only</p>
                </motion.div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-10 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-xs font-bold text-center backdrop-blur-md"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit} 
                    className="space-y-8"
                >
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Admin Identity</label>
                        <div className="relative group">
                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="email" required placeholder="admin@gethotel.in"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 rounded-none pl-10 pr-4 py-5 text-lg font-bold text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Master Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type={showPassword ? "text" : "password"} required placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 rounded-none pl-10 pr-14 py-5 text-lg font-bold text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-800"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-6 bg-white text-slate-950 font-black rounded-3xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.4em]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>Verify Identity <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </motion.form>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 text-center"
                >
                    <Link href="/" className="text-slate-700 font-black text-[10px] uppercase tracking-[0.5em] hover:text-slate-400 transition-colors">
                        &larr; Exit System
                    </Link>
                </motion.div>
            </div>

            {/* Bottom Security Mark */}
            <div className="absolute bottom-12 w-full text-center">
                <div className="inline-block w-1 h-1 bg-blue-500 rounded-full animate-ping mr-2"></div>
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.8em]">Secure Admin Node 01</span>
            </div>
        </div>
    );
}
