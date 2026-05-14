

import { useState } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, Zap, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
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
            const user = await login({
                email: email,
                password: password,
                pass: password,
                userpassword: password,
                partnerpassword: password,
                partnerPassword: password
            });
            if (user.role === 'super_admin') {
                router("/admin/super");
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
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono selection:bg-[#00FF41] selection:text-black">
            {/* Matrix Digital Rain Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.07] z-0 overflow-hidden">
                <div className="matrix-rain"></div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

            <div className="max-w-md w-full relative z-20">
                {/* Branding & Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#00FF41]/5 rounded-sm border border-[#00FF41]/20 mb-8 backdrop-blur-md">
                        <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse shadow-[0_0_10px_#00FF41]" />
                        <span className="text-[10px] font-black text-[#00FF41] uppercase tracking-[0.4em]">Global Node 0x7A2</span>
                    </div>

                    <div className="relative inline-block">
                        <h1 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase italic leading-none hacker-glitch" data-text="CONTROLHUB">
                            Control<span className="text-[#00FF41] drop-shadow-[0_0_15px_#00FF41]">Hub</span>
                        </h1>
                        <div className="absolute -right-12 top-0 text-[10px] text-[#00FF41] font-black animate-bounce">v4.0.2</div>
                    </div>
                    <p className="text-[#00FF41]/40 font-bold text-[9px] uppercase tracking-[0.8em] mt-6 flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-[#00FF41]/20" />
                        System Overlord Authentication
                        <span className="w-8 h-[1px] bg-[#00FF41]/20" />
                    </p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md flex items-center gap-3"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>[SECURITY ALERT]: {error}</span>
                    </motion.div>
                )}

                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-10"
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[11px] font-black text-[#00FF41]/60 uppercase tracking-widest">_Identity_</label>
                            <span className="text-[9px] text-[#00FF41]/30">00101101</span>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#00FF41]/5 blur-xl group-focus-within:bg-[#00FF41]/10 transition-all rounded-full pointer-events-none" />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00FF41]/30 group-focus-within:text-[#00FF41] transition-colors" />
                            <input
                                type="email" required placeholder="ROOT@GETHOTEL.SYS"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border-2 border-[#00FF41]/10 hover:border-[#00FF41]/30 rounded-none pl-12 pr-4 py-5 text-sm font-black text-white focus:border-[#00FF41] outline-none transition-all placeholder:text-[#00FF41]/20 uppercase tracking-widest shadow-[inset_0_0_20px_rgba(0,255,65,0.02)]"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[11px] font-black text-[#00FF41]/60 uppercase tracking-widest">_Master_Key_</label>
                            <span className="text-[9px] text-[#00FF41]/30">ENCRYPTED_AES256</span>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#00FF41]/5 blur-xl group-focus-within:bg-[#00FF41]/10 transition-all rounded-full pointer-events-none" />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00FF41]/30 group-focus-within:text-[#00FF41] transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"} required placeholder="********"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border-2 border-[#00FF41]/10 hover:border-[#00FF41]/30 rounded-none pl-12 pr-14 py-5 text-sm font-black text-white focus:border-[#00FF41] outline-none transition-all placeholder:text-[#00FF41]/20 tracking-[0.5em] shadow-[inset_0_0_20px_rgba(0,255,65,0.02)]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00FF41]/30 hover:text-[#00FF41] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 relative group">
                        <div className="absolute -inset-1 bg-[#00FF41] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <button
                            type="submit" disabled={loading}
                            className="relative w-full py-6 bg-[#00FF41] text-black font-black rounded-none shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:bg-[#00FF41] transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.6em]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Bypassing Firewall...</span>
                                </div>
                            ) : (
                                <>Access Terminal <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 text-center flex items-center justify-center gap-6"
                >
                    <div className="w-12 h-[1px] bg-[#00FF41]/10" />
                    <Link to="/" className="text-[#00FF41]/40 font-black text-[10px] uppercase tracking-[0.4em] hover:text-[#00FF41] transition-colors flex items-center gap-2">
                        <X className="w-3 h-3" /> Terminate Session
                    </Link>
                    <div className="w-12 h-[1px] bg-[#00FF41]/10" />
                </motion.div>
            </div>

            {/* Matrix Styling */}
            <style>{`
                .matrix-rain {
                    background: linear-gradient(0deg, rgba(0, 255, 65, 0) 0%, #00FF41 100%);
                    width: 2px;
                    height: 100px;
                    position: absolute;
                    top: -100px;
                    animation: rain 2s linear infinite;
                }
                @keyframes rain {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                .hacker-glitch {
                    position: relative;
                }
                .hacker-glitch::before, .hacker-glitch::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .hacker-glitch::before {
                    left: 2px;
                    text-shadow: -2px 0 #ff00c1;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim 5s infinite linear alternate-reverse;
                }
                .hacker-glitch::after {
                    left: -2px;
                    text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
                    animation: glitch-anim2 1s infinite linear alternate-reverse;
                }
                @keyframes glitch-anim {
                    0% { clip: rect(31px, 9999px, 94px, 0); }
                    100% { clip: rect(70px, 9999px, 71px, 0); }
                }
            `}</style>

            {/* Bottom Status Mark */}
            <div className="absolute bottom-12 w-full text-center">
                <div className="flex items-center justify-center gap-8 opacity-30">
                    <span className="text-[9px] font-black text-[#00FF41] uppercase tracking-[0.5em]">CPU_LOAD: 12%</span>
                    <span className="text-[9px] font-black text-[#00FF41] uppercase tracking-[0.5em]">ENCRYPTION: ACTIVE</span>
                    <span className="text-[9px] font-black text-[#00FF41] uppercase tracking-[0.5em]">IP: UNTRACEABLE</span>
                </div>
            </div>
        </div>
    );
}



