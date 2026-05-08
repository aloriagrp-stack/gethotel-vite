export function HotelCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl md:rounded-[40px] border border-slate-100 overflow-hidden flex flex-row md:flex-col h-full">
            <div className="w-[130px] sm:w-[180px] md:w-full shrink-0 aspect-[1/1] md:aspect-[1.4/1] bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
            <div className="p-3 md:p-8 space-y-3 flex-1 flex flex-col min-w-0">
                <div className="space-y-2">
                    <div className="h-4 md:h-6 bg-slate-100 rounded-full animate-pulse w-3/4" />
                    <div className="h-3 md:h-4 bg-slate-100 rounded-full animate-pulse w-1/2" />
                </div>
                
                <div className="hidden md:block mt-8 space-y-4">
                    <div className="h-3 bg-slate-100 rounded-full animate-pulse w-2/3" />
                    <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4" />
                </div>

                <div className="mt-auto pt-3 md:pt-10 flex items-center justify-between gap-3 border-t border-slate-50">
                    <div className="space-y-2">
                        <div className="h-2 bg-slate-50 rounded-full animate-pulse w-12" />
                        <div className="h-5 md:h-8 bg-slate-100 rounded-full animate-pulse w-24" />
                    </div>
                    <div className="h-8 md:h-14 bg-slate-100 rounded-lg md:rounded-[24px] animate-pulse w-16 md:w-32" />
                </div>
            </div>
        </div>
    );
}

export function ReviewSkeleton() {
    return (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
                <div className="space-y-1 flex-1">
                    <div className="h-3 bg-slate-200 rounded-full animate-pulse w-24" />
                    <div className="h-3 bg-slate-200 rounded-full animate-pulse w-16" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-full animate-pulse w-5/6" />
                <div className="h-3 bg-slate-200 rounded-full animate-pulse w-3/4" />
            </div>
        </div>
    );
}

export function PageBannerSkeleton() {
    return (
        <div className="w-full h-72 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse rounded-3xl" />
    );
}
