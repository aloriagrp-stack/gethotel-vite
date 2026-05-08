"use client";

import { useParams, useRouter } from "next/navigation";
import { hotels } from "@/data/hotels";
import { 
    ChevronLeft, ShieldAlert, Flag, 
    CheckCircle2, Loader2, Headphones,
    LifeBuoy, AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function SupportPage() {
    const params = useParams();
    const router = useRouter();
    const [category, setCategory] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const hotel = hotels.find(h => h.id === params.id) || hotels[0];

    // Determine if this is a dispute or a report based on the context
    // For now, we'll make it a universal Support & Dispute center
    const isDispute = true; 

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setTimeout(() => router.push('/bookings'), 2500);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#F4F9FF] pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[60px]" />
                    
                    {submitted ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Case Registered</h2>
                            <p className="text-slate-500 font-bold max-w-sm">Our elite support team has been notified. We will resolve your concern within 24 hours.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Support & Dispute Center</h1>
                                    <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">Property: {hotel.name}</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <p className="font-black text-slate-900 mb-4 tracking-tight">What issue are you facing?</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {["Billing Issue", "Room Quality", "Staff Behavior", "Cancellation Request", "Services Missing", "Other"].map((cat) => (
                                            <button 
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                                                    category === cat 
                                                        ? "border-red-500 bg-red-50/50 shadow-lg shadow-red-500/10" 
                                                        : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300"
                                                }`}
                                            >
                                                <span className={`text-sm font-black ${category === cat ? "text-red-700" : "text-slate-600"}`}>{cat}</span>
                                                {category === cat && <AlertCircle className="w-4 h-4 text-red-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="font-black text-slate-900 mb-4 tracking-tight">Tell us more details</p>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 h-40 focus:bg-white focus:border-red-300 transition-all outline-none font-medium placeholder:text-slate-300"
                                        placeholder="Explain your concern clearly..."
                                    />
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <Headphones className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 italic leading-relaxed">
                                        Your case will be expedited to our <span className="text-slate-900">Priority Support Desk</span>. You'll receive a resolution on your registered email.
                                    </p>
                                </div>

                                <button 
                                    onClick={handleSubmit}
                                    disabled={!category || isSubmitting}
                                    className="w-full py-5 bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LifeBuoy className="w-4 h-4" />}
                                    Register Complaint
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
