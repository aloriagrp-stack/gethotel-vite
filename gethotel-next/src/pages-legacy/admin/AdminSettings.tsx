'use client';
import { useState, useEffect } from "react";
import { 
    Settings, Shield, Save, CheckCircle2,
    DollarSign, Globe, Key, Mail, Phone, RefreshCcw
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
        }, 400);
    };

    return (
        <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Platform Settings
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Global booking commission, payment gateways, brand identity, and support channels.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-200 text-black font-medium text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                    {loading ? (
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin text-black" />
                    ) : saved ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Saved Successfully</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-3.5 h-3.5 text-black" />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Column 1: Core Platform & Support Info */}
                <div className="lg:col-span-7 space-y-5">
                    
                    {/* Card 1: Brand & General Details */}
                    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand & Identity</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">Platform Site Name</label>
                                <input
                                    type="text"
                                    value={form.siteName}
                                    onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">Admin Header Title</label>
                                <input
                                    type="text"
                                    value={form.brandTitle}
                                    onChange={(e) => setForm({ ...form, brandTitle: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">Customer Support Email</label>
                                <div className="relative">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        value={form.supportEmail}
                                        onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">Support Phone</label>
                                <div className="relative">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.supportPhone}
                                        onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Commission Controls */}
                    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission & Tax Rules</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">Platform Fee (%)</label>
                                <input
                                    type="number"
                                    value={form.platformFeePercent}
                                    onChange={(e) => setForm({ ...form, platformFeePercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">Default: 12% GMV</span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">GST Rate (%)</label>
                                <input
                                    type="number"
                                    value={form.gstPercent}
                                    onChange={(e) => setForm({ ...form, gstPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">Statutory Slab</span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">Free Cancellation (Hrs)</label>
                                <input
                                    type="number"
                                    value={form.cancellationCutoffHours}
                                    onChange={(e) => setForm({ ...form, cancellationCutoffHours: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">Prior to check-in</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Payment Gateway & Security */}
                <div className="lg:col-span-5 space-y-5">
                    
                    {/* Card 3: Payment Gateway Configuration */}
                    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
                            <Key className="w-3.5 h-3.5 text-emerald-400" />
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Gateway</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/80 border border-slate-200 rounded-lg">
                                <div>
                                    <span className="text-xs font-medium text-slate-900 block">Online Payment Gateway</span>
                                    <span className="text-[11px] text-slate-400">Enable Razorpay / UPI checkout</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, enablePaymentGateway: !form.enablePaymentGateway })}
                                    className={cn(
                                        "w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer",
                                        form.enablePaymentGateway ? "bg-emerald-500" : "bg-neutral-700"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full bg-white transition-transform",
                                        form.enablePaymentGateway ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/80 border border-slate-200 rounded-lg">
                                <div>
                                    <span className="text-xs font-medium text-slate-900 block">Auto-Approve Hotels</span>
                                    <span className="text-[11px] text-slate-400">Skip manual verification step</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, autoApproveHotels: !form.autoApproveHotels })}
                                    className={cn(
                                        "w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer",
                                        form.autoApproveHotels ? "bg-emerald-500" : "bg-neutral-700"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full bg-white transition-transform",
                                        form.autoApproveHotels ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1.5">Razorpay Key ID</label>
                                <input
                                    type="password"
                                    value={form.razorpayKey}
                                    onChange={(e) => setForm({ ...form, razorpayKey: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-mono focus:outline-none focus:border-slate-300 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: System Audit Summary */}
                    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                            <Shield className="w-3.5 h-3.5 text-emerald-400" />
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Health</h3>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-200/40">
                                <span className="text-slate-500">API Status:</span>
                                <span className="text-emerald-400 font-medium">Active (200 OK)</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-200/40">
                                <span className="text-slate-500">Database Sync:</span>
                                <span className="text-slate-900 font-medium">Connected</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500">SSL Certificate:</span>
                                <span className="text-emerald-400 font-medium">Valid (TLS v1.3)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
