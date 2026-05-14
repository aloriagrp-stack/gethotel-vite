

import { Wallet, ShieldCheck, Headphones, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
        <section className="pt-12 pb-24 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 text-left">
                    <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-0 tracking-tight">
                        Why <span className="text-brand-600">GetHotel?</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                    {REASONS.map((reason, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -8 }}
                            className="group p-5 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/40 hover:border-brand-100 hover:bg-white/80 hover:shadow-2xl hover:shadow-slate-100/60 transition-all duration-300 bg-white/60 backdrop-blur-xl flex flex-row lg:flex-col items-center lg:justify-center gap-6 lg:gap-6 lg:aspect-square lg:text-center"
                        >
                            <div className={`w-14 h-14 lg:w-20 lg:h-20 flex-shrink-0 ${reason.color} rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <reason.icon className="w-7 h-7 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg lg:text-xl font-black text-slate-900 mb-1 lg:mb-2 tracking-tight leading-tight">{reason.title}</h3>
                                <p className="text-slate-500 text-sm lg:text-[13px] leading-relaxed font-semibold opacity-80">
                                    {reason.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}



