'use client';
import { useState, useEffect } from "react";
import { 
    Settings, Sliders, Shield, Bell, Key, Save, CheckCircle2,
    DollarSign, Globe, Lock, Mail, Phone, RefreshCcw, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        siteName: "GetHotelStays",
        brandTitle: "Aloria's Admin",
        supportEmail: "support@gethotelstays.com",
        supportPhone: "+91 98765 43210",
        platformFeePercent: 12,
        gstPercent: 18,
        cancellationCutoffHours: 24,
        autoApproveHotels: false,
        enablePaymentGateway: true,
        testMode: false,
        razorpayKey: "rzp_live_9872a8x9c712",
        currency: "INR (₹)",
    });

    useEffect(() => {
        const localConfig = localStorage.getItem("ghs_admin_settings");
        if (localConfig) {
            try {
                setForm(JSON.parse(localConfig));
            } catch (e) {}
        }
    }, []);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem("ghs_admin_settings", JSON.stringify(form));
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f1f]">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                        <Settings className="w-5 h-5 text-emerald-400" />
                        <span>Platform System Settings</span>
                    </h2>
                    <p className="text-neutral-500 text-xs font-semibold mt-1">
                        Configure global booking rules, payment gateway integrations, and support credentials.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                    {loading ? (
                        <RefreshCcw className="w-4 h-4 animate-spin text-black" />
                    ) : saved ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Saved Successfully!</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 text-black" />
                            <span>Save Config</span>
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Column 1: Core Platform & Support Info (7 COLS) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Card 1: Brand & General Details */}
                    <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-[#1a1a1a]">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-widest">Brand & Platform Identity</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Platform Site Name</label>
                                <input
                                    type="text"
                                    value={form.siteName}
                                    onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Admin Portal Header Title</label>
                                <input
                                    type="text"
                                    value={form.brandTitle}
                                    onChange={(e) => setForm({ ...form, brandTitle: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Customer Support Email</label>
                                <div className="relative">
                                    <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        value={form.supportEmail}
                                        onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Support Toll-Free Phone</label>
                                <div className="relative">
                                    <Phone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.supportPhone}
                                        onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Revenue & Booking Commission Controls */}
                    <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-[#1a1a1a]">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-widest">Financial Commission & GST Rules</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Platform Fee (%)</label>
                                <input
                                    type="number"
                                    value={form.platformFeePercent}
                                    onChange={(e) => setForm({ ...form, platformFeePercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-all"
                                />
                                <span className="text-[9px] text-neutral-500 font-semibold mt-1 block">Default: 12% GMV</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Tax / GST Rate (%)</label>
                                <input
                                    type="number"
                                    value={form.gstPercent}
                                    onChange={(e) => setForm({ ...form, gstPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-all"
                                />
                                <span className="text-[9px] text-neutral-500 font-semibold mt-1 block">Government Slab</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Free Cancellation Cutoff (Hrs)</label>
                                <input
                                    type="number"
                                    value={form.cancellationCutoffHours}
                                    onChange={(e) => setForm({ ...form, cancellationCutoffHours: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-neutral-500 transition-all"
                                />
                                <span className="text-[9px] text-neutral-500 font-semibold mt-1 block">Prior to check-in</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Payment Gateway & Security Controls (5 COLS) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Card 3: Payment Gateway Configuration */}
                    <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-[#1a1a1a]">
                            <Key className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-widest">Payment Gateway Status</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3.5 bg-[#121212] border border-[#222222] rounded-xl">
                                <div>
                                    <span className="text-xs font-bold text-white block">Online Payment Gateway</span>
                                    <span className="text-[9px] text-neutral-500">Enable Razorpay / UPI online payments</span>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, enablePaymentGateway: !form.enablePaymentGateway })}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer",
                                        form.enablePaymentGateway ? "bg-emerald-500" : "bg-[#282828]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full bg-white transition-transform",
                                        form.enablePaymentGateway ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3.5 bg-[#121212] border border-[#222222] rounded-xl">
                                <div>
                                    <span className="text-xs font-bold text-white block">Auto-Approve Hotel Registrations</span>
                                    <span className="text-[9px] text-neutral-500">Skip manual verification step</span>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, autoApproveHotels: !form.autoApproveHotels })}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer",
                                        form.autoApproveHotels ? "bg-emerald-500" : "bg-[#282828]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full bg-white transition-transform",
                                        form.autoApproveHotels ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </button>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Active Payment Gateway Key</label>
                                <input
                                    type="password"
                                    value={form.razorpayKey}
                                    onChange={(e) => setForm({ ...form, razorpayKey: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#282828] rounded-xl text-xs font-bold text-neutral-300 font-mono focus:outline-none focus:border-neutral-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: System Status Summary */}
                    <div className="bg-[#0c0c0c] border border-[#1c1c1c] border-t-[#2d2d2d] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.9)] space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span>Security & Audit Status</span>
                        </div>

                        <div className="space-y-2.5 font-mono text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-[#181818]">
                                <span className="text-neutral-500 text-[10px] uppercase">API Status:</span>
                                <span className="text-emerald-400 font-bold">ACTIVE (200 OK)</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-[#181818]">
                                <span className="text-neutral-500 text-[10px] uppercase">Database Sync:</span>
                                <span className="text-white font-bold">CONNECTED</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-neutral-500 text-[10px] uppercase">SSL Certificate:</span>
                                <span className="text-emerald-400 font-bold">VALID (TLS v1.3)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
