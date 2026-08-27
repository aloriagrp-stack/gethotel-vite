

import { useNavigate as useRouter, useParams } from 'react-router-dom';;
import { hotels } from "@/data/hotels";
import { 
    ChevronLeft, FileText, Download, 
    Printer, CheckCircle2, QrCode
} from "lucide-react";

export default function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const hotel = hotels.find(h => h.id === params.id) || hotels[0];

    return (
        <div className="min-h-screen bg-[#F4F9FF] pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => router(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2" />
                    
                    {/* Invoice Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 relative z-10">
                        <div>
                            <h1 className="text-5xl font-display font-black text-slate-900 tracking-tighter italic mb-2">Invoice</h1>
                            <p className="text-slate-400 font-mono text-sm tracking-tight">INV-2026-X840B2</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="font-black text-slate-900">GetHotel Elite Services</p>
                            <p className="text-sm text-slate-500 font-bold italic">Mumbai, India HQ</p>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Billed to</p>
                            <p className="text-xl font-black text-slate-900">Premium Traveler</p>
                            <p className="text-sm text-slate-500 font-bold italic mt-1">{hotel.name}, {hotel.city}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Stay Duration</p>
                            <p className="text-lg font-black text-slate-900 italic">May 15 - May 18, 2026</p>
                            <p className="text-sm text-slate-500 font-bold mt-1">3 Nights • Executive Suite</p>
                        </div>
                    </div>

                    {/* Table Placeholder */}
                    <div className="border-y border-slate-100 py-10 mb-10 relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-slate-600 uppercase tracking-widest text-[11px]">Description</span>
                            <span className="font-bold text-slate-600 uppercase tracking-widest text-[11px]">Amount</span>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="font-black text-slate-900">Accommodation Base Rate</span>
                                <span className="font-mono font-bold text-slate-900">₹36,000.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-black text-slate-900 italic">Taxes & Fees (GST)</span>
                                <span className="font-mono font-bold text-slate-900">₹1,800.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-black text-slate-900 italic">Elite Membership Discount</span>
                                <span className="font-mono font-bold text-brand-600">-₹2,000.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-slate-950 rounded-2xl p-10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <p className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-60">Status: Fully Paid</p>
                        </div>
                        <p className="text-4xl font-display font-black text-white italic tracking-tighter">₹40,480.00</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-12 flex gap-4 relative z-10">
                        <button className="flex-1 py-5 bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                        <button className="px-6 py-5 border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
