

import { Wallet, ShieldCheck, Headphones, Sparkles } from "lucide-react";

const REASONS = [
    {
        icon: Wallet,
        title: "Best Price Guarantee",
        description: "Experience luxury without the premium tag. We offer the most competitive rates for high-end stays across India.",
        color: "bg-blue-600 shadow-blue-200",
    },
    {
        icon: ShieldCheck,
        title: "Verified Properties",
        description: "Your safety and comfort are our priority. Every hotel on our platform undergoes a rigorous 50-point quality check.",
        color: "bg-emerald-600 shadow-emerald-200",
    },
    {
        icon: Headphones,
        title: "24/7 Concierge",
        description: "From booking to checkout, our dedicated travel experts are available around the clock to ensure a seamless experience.",
        color: "bg-indigo-600 shadow-indigo-200",
    },
    {
        icon: Sparkles,
        title: "Exclusive Rewards",
        description: "Join our community and unlock hidden deals, complementary upgrades, and special seasonal offerings reserved just for you.",
        color: "bg-amber-500 shadow-amber-200",
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                    {REASONS.map((reason, i) => (
                        <div
                            key={i}
                            className="group p-5 lg:p-8 rounded-3xl border border-white/40 hover:border-brand-100 hover:bg-white/80 hover:shadow-2xl hover:shadow-slate-100/60 transition-all duration-300 bg-white/60 backdrop-blur-xl flex flex-row lg:flex-col items-center lg:justify-center gap-6 lg:gap-6 lg:aspect-square lg:text-center"
                        >
                            <div className={`w-14 h-14 lg:w-20 lg:h-20 flex-shrink-0 ${reason.color} rounded-full flex items-center justify-center shadow-lg transition-transform duration-300`}>
                                <reason.icon className="w-7 h-7 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-1 lg:mb-2 tracking-tight leading-tight">{reason.title}</h3>
                                <p className="text-slate-500 text-sm lg:text-[13px] leading-relaxed font-semibold opacity-80">
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



