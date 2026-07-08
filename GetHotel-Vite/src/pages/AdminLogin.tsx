import { useState } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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
                partnerPassword: password,
                portal: 'admin'
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
        <div className="min-h-screen bg-[#012456] text-[#eeeee0] p-6 md:p-12 font-mono selection:bg-[#ffeb3b] selection:text-black flex flex-col justify-between select-text text-sm md:text-base leading-relaxed">
            <div className="max-w-4xl w-full">
                {/* GetHotel PowerShell Header */}
                <div className="space-y-4 mb-8">
                    <div>
                        <div>GetHotelStays Administrative PowerShell</div>
                        <div>Copyright (C) 2026 GetHotelStays Corp. All rights reserved.</div>
                    </div>
                    <div>Authorized terminal connection. Monitoring active (session: tty1).</div>
                </div>

                {/* Session Start Prompt */}
                <div className="mb-6">
                    <span className="text-[#eeeeee]">PS C:\Users\DELL\GetHotelStays&gt;</span> <span className="text-white">.\Start-AdminLogin.ps1</span>
                </div>

                {/* Error log styled exactly like PowerShell Error */}
                {error && (
                    <div className="text-[#ff5555] bg-[#012456] mb-6 whitespace-pre-wrap font-mono">
                        <div>.\Start-AdminLogin.ps1 : {error}</div>
                        <div>    + CategoryInfo          : SecurityError: (:) [Start-AdminLogin], UnauthorizedAccessException</div>
                        <div>    + FullyQualifiedErrorId : AccessDenied,GetHotelStays.Admin.Login</div>
                    </div>
                )}

                {/* The Authentication Input Prompts */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Email Input Prompt */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-zinc-300 shrink-0 font-bold">Identity (EmailAddress):</span>
                            <div className="flex-1 flex items-center relative">
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    placeholder="root@gethotelstays.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full md:w-96 bg-transparent border-b border-[#eeeee0]/20 focus:border-white text-white focus:outline-none py-1 font-mono tracking-wider placeholder:text-[#eeeee0]/15"
                                />
                            </div>
                        </div>

                        {/* Password Input Prompt */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-zinc-300 shrink-0 font-bold">AccessKey (Password)  :</span>
                            <div className="flex-grow-0 flex items-center relative w-full md:w-96">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent border-b border-[#eeeee0]/20 focus:border-white text-white focus:outline-none py-1 font-mono tracking-[0.2em] placeholder:tracking-normal placeholder:text-[#eeeee0]/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 text-[#eeeee0]/40 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action trigger button designed like command execution */}
                    <div className="pt-6 space-y-4">
                        <div className="flex items-center gap-2 text-zinc-300">
                            <span>PS C:\Users\DELL\GetHotelStays&gt;</span>
                            <span className="text-white">Submit-Session -Confirm:$true</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#002b5c] hover:bg-[#003875] border border-[#eeeee0]/30 hover:border-white px-8 py-3 text-white font-mono transition-all duration-150 flex items-center gap-3 disabled:opacity-50 cursor-pointer text-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Executing login pipeline...</span>
                                </>
                            ) : (
                                <>
                                    <span>[Press Enter or Click to Authenticate]</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer containing navigation back home */}
            <div className="mt-12 pt-6 border-t border-[#eeeee0]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#eeeee0]/50 select-none">
                <div>Active Host: localhost:5173 | Terminal Session: tty1</div>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1 font-mono text-zinc-300">
                    PS C:\&gt; exit
                </Link>
            </div>
        </div>
    );
}



