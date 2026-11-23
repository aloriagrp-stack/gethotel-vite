'use client';

import { cn } from "@/lib/utils";

interface LoaderProps {
    variant?: "fullscreen" | "inline" | "element";
    text?: string;
    className?: string;
}

export default function Loader({ variant = "inline", className }: LoaderProps) {
    const loaderContent = (
        <div className={cn("flex items-center justify-center select-none", className)}>
            <div className="flex items-baseline text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 opacity-40 animate-pulse transition-opacity duration-700">
                <span>GetHotelStays</span>
                <span className="text-brand-600 not-italic">.</span>
            </div>
        </div>
    );

    if (variant === "fullscreen") {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95">
                {loaderContent}
            </div>
        );
    }

    if (variant === "element") {
        return (
            <div className="w-full min-h-[220px] flex items-center justify-center">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
}
