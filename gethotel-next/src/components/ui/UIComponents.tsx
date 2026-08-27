'use client';
import { cn, ratingColor } from "@/lib/utils";

interface RatingBadgeProps {
    value: number;
    label?: string;
    size?: "sm" | "md" | "lg";
}

export function RatingBadge({ value, label, size = "md" }: RatingBadgeProps) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    "font-bold text-white rounded-xl",
                    ratingColor(value),
                    size === "sm" && "text-xs px-2 py-1",
                    size === "md" && "text-sm px-2.5 py-1.5",
                    size === "lg" && "text-base px-3 py-2"
                )}
            >
                {value}
            </span>
            {label && (
                <span className={cn(
                    "font-bold text-black",
                    size === "sm" && "text-xs",
                    size === "md" && "text-sm",
                    size === "lg" && "text-base"
                )}>
                    {label}
                </span>
            )}
        </div>
    );
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
    size?: "sm" | "md";
    className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
    const variants = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border border-amber-200",
        danger: "bg-red-50 text-red-700 border border-red-200",
        info: "bg-sky-50 text-sky-700 border border-sky-200",
        outline: "bg-white text-slate-700 border border-slate-200",
    };
    return (
        <span
            className={cn(
                "inline-flex items-center font-semibold rounded-full",
                variants[variant],
                size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1",
                className
            )}
        >
            {children}
        </span>
    );
}

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center" }: SectionHeaderProps) {
    return (
        <div className={cn("mb-10", align === "center" ? "text-center" : "text-left")}>
            {eyebrow && (
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
                    {eyebrow}
                </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-black text-black mb-3 leading-tight">{title}</h2>
            {subtitle && (
                <p className={cn(
                    "text-black/80 text-base max-w-2xl font-medium",
                    align === "center" ? "mx-auto" : ""
                )}>{subtitle}</p>
            )}
        </div>
    );
}



