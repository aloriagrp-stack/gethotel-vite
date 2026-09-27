'use client';

import { cn } from "@/lib/utils";

interface LoaderProps {
    variant?: "fullscreen" | "inline" | "element";
    text?: string;
    className?: string;
}

export default function Loader({ variant = "inline", text, className }: LoaderProps) {
    const loaderContent = (
        <div className={cn("flex flex-col items-center justify-center gap-3 select-none", className)}>
            <div className="flex items-baseline text-2xl sm:text-3xl font-black tracking-tighter text-slate-950 animate-pulse">
                <span>GetHotelStays</span>
                <span className="text-brand-600 not-italic">.</span>
            </div>
            <div className="w-14 h-0.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-brand-600 rounded-full animate-pulse" />
            </div>
            {text && (
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {text}
                </p>
            )}
        </div>
    );

    if (variant === "fullscreen") {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-md">
                {loaderContent}
            </div>
        );
    }

    if (variant === "element") {
        return (
            <div className="w-full min-h-[300px] flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[32px] p-8">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
}
