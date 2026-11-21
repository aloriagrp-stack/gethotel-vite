'use client';

const REASONS = [
    {
        title: "Curated & Verified Rooms",
        description: "Checked on-ground for clean linens, functioning air conditioning, reliable Wi-Fi, and courteous staff.",
    },
    {
        title: "Pay 12% Advance or Full Online",
        description: "Secure your room with a 12% deposit and settle 88% at the front desk, or pay 100% online for contactless check-in.",
    },
    {
        title: "Hourly Stays (3h, 6h, 12h)",
        description: "Book flexible micro-stays near airports and railway stations. Pay only for the hours you need instead of 24 hours.",
    },
    {
        title: "Hassle-Free Couple Check-In",
        description: "Zero moral policing and complete privacy. Consenting adult couples (18+) with valid local IDs are warmly welcomed.",
    },
];

export default function WhyGetHotel() {
    return (
        <section className="pt-8 pb-6 bg-transparent">
            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-5 text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                        Why GetHotelStays
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {REASONS.map((reason, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors text-left"
                        >
                            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1 tracking-tight">
                                {reason.title}
                            </h3>
                            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                                {reason.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
