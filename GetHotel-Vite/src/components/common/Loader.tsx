import { cn } from "@/lib/utils";

interface LoaderProps {
    variant?: "fullscreen" | "inline" | "element";
    text?: string;
    className?: string;
}

export default function Loader({ variant = "inline", text, className }: LoaderProps) {
    // Trigonometric positioning for 10 elegant glowing dots in a circle
    const totalDots = 10;
    const radius = 32; // Radius in percentage relative to container

    const displayText = text || (variant === "fullscreen" || variant === "element" ? "Loading..." : undefined);

    const loaderContent = (
        <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
            <div className="relative w-20 h-20">
                {[...Array(totalDots)].map((_, i) => {
                    const angle = (i * 2 * Math.PI) / totalDots;
                    const top = 50 + radius * Math.sin(angle);
                    const left = 50 + radius * Math.cos(angle);

                    return (
                        <div
                            key={i}
                            className="absolute w-2.5 h-2.5 bg-brand-600 rounded-full animate-dotted"
                            style={{
                                top: `${top}%`,
                                left: `${left}%`,
                                animationDelay: `${i * 0.12}s`,
                            }}
                        />
                    );
                })}
            </div>
            {displayText && (
                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-500 tracking-wide">
                        {displayText}
                    </p>
                </div>
            )}
        </div>
    );

    if (variant === "fullscreen") {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-xl">
                {loaderContent}
            </div>
        );
    }

    if (variant === "element") {
        return (
            <div className="w-full min-h-[300px] flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/40 shadow-sm p-10">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
}
