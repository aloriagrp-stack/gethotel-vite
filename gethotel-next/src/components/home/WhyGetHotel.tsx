'use client';

const REASONS = [
    {
        title: "Best Price Guarantee",
        description: "Experience comfort without the premium tag. We offer the most competitive rates for verified stays across India.",
    },
    {
        title: "Verified Properties",
        description: "Your safety and peace of mind are our priority. Every hotel on our platform undergoes a rigorous 50-point quality check.",
    },
    {
        title: "24/7 Concierge Support",
        description: "From instant booking to check-out, our dedicated team is available around the clock to ensure a smooth stay.",
    },
    {
        title: "Pay 12% Now Model",
        description: "Book instantly by paying just a 12% deposit online. Pay the remaining 88% balance directly at the hotel front desk.",
    },
];

export default function WhyGetHotel() {
    return (
        <section className="pt-12 pb-6 md:pb-12 bg-transparent">
            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 text-left">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-0 tracking-tight">
                        Why <span className="text-brand-600">GetHotel?</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {REASONS.map((reason, i) => (
                        <div
                            key={i}
                            className="group p-6 lg:p-8 rounded-3xl border border-white/60 hover:border-brand-200 hover:bg-white/90 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 bg-white/70 backdrop-blur-xl flex flex-col justify-between gap-3 text-left"
                        >
                            <div>
                                <span className="text-2xl lg:text-3xl font-black text-brand-600/30 block mb-2 font-mono">0{i + 1}</span>
                                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 tracking-tight leading-tight group-hover:text-brand-600 transition-colors">
                                    {reason.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    {reason.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
