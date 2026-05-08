"use client";

import { useParams, useRouter } from "next/navigation";
import { hotels } from "@/data/hotels";
import { 
    ChevronLeft, Flag, 
    CheckCircle2, Loader2, Camera,
    MessageSquare, AlertTriangle
} from "lucide-react";
import { useState } from "react";

export default function ReportIssuePage() {
    const params = useParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const hotel = hotels.find(h => h.id === params.id) || hotels[0];

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
            <div className="max-w-xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 overflow-hidden relative">
                    {submitted ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Issue Reported</h2>
                            <p className="text-slate-500 font-bold max-w-sm">We've locked in your report. The on-site manager for {hotel.name} will be contacted immediately.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Flag className="w-6 h-6" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Report On-site Issue</h1>
                            </div>

                            <div className="space-y-8">
                                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold text-amber-700 leading-relaxed italic">
                                        Use this for real-time issues at the property (e.g. cleanliness, broken amenities, etc). For billing issues, please use our Dispute Center.
                                    </p>
                                </div>

                                <div>
                                    <p className="font-black text-slate-900 mb-4 tracking-tight">What is the problem?</p>
                                    <input 
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 focus:bg-white focus:border-brand-300 transition-all outline-none font-bold placeholder:text-slate-300"
                                        placeholder="Headline: e.g. AC not working"
                                    />
                                </div>

                                <div>
                                    <p className="font-black text-slate-900 mb-4 tracking-tight">Provide more details</p>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 h-32 focus:bg-white focus:border-brand-300 transition-all outline-none font-medium placeholder:text-slate-300"
                                        placeholder="Explain the situation briefly..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <button className="flex items-center justify-center gap-3 p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                                        <Camera className="w-5 h-5 text-slate-300 group-hover:text-brand-600 transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attach Evidence Photo</span>
                                    </button>
                                </div>

                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                    Send Report
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
