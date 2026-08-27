'use client';
import { Timer } from "lucide-react";

export default function PartnerPayments() {
    return (
        <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic mb-4">
                Coming <span className="text-blue-600">Soon</span>
            </h1>
            
            <p className="text-slate-500 font-bold max-w-sm leading-relaxed uppercase text-[10px] tracking-[0.2em]">
                We are currently refining the financial analytics for your property. 
                Full earnings breakdown and payout history will be available shortly.
            </p>
            
            <div className="mt-12 flex gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse delay-150" />
            </div>
        </div>
    );
}
