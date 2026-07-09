

import { Link } from "react-router-dom";
import { useState } from "react";
import {
    MapPin,
    Mail,
    Phone,
    Twitter,
    Instagram,
    Linkedin,
    Globe,
    ArrowRight,
    Sparkles,
    CheckCircle,
} from "lucide-react";

const footerLinks = {
    Destinations: [
        { label: "Goa Hotels", href: "/goa-hotels" },
        { label: "Mumbai Hotels", href: "/hotels?city=Mumbai" },
        { label: "Jaipur Hotels", href: "/jaipur-hotels" },
        { label: "Shimla Hotels", href: "/shimla-hotels" },
        { label: "Manali Hotels", href: "/manali-hotels" },
        { label: "Udaipur Hotels", href: "/udaipur-hotels" },
    ],
    Support: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms-&-conditions" },
        { label: "Refund & Cancellation", href: "/cancellation-policy" },
        { label: "Pricing Policy", href: "/pricing-policy" },
        { label: "Contact Us", href: "/contact" },
    ],
    Partners: [
        { label: "List Your Property", href: "/list-property" },
        { label: "Partner Central", href: "/partner" },
        { label: "Partner Login", href: "/login" },
    ],
};

const socials = [
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-400" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-500/20 hover:border-pink-500/50 hover:text-pink-400" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400" },
    { icon: Globe, href: "#", label: "Facebook", color: "hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400" },
];

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    return (
        <footer className="relative text-slate-900 overflow-hidden border-t border-black/5">
            {/* Dark tinted glass background */}
            <div
                className="absolute inset-0 -z-10 bg-black/[0.02] backdrop-blur-3xl"
            />
            
            {/* Subtle light orbs for texture */}
            <div
                className="absolute -top-32 left-1/4 w-96 h-96 rounded-full -z-10 blur-[100px] opacity-[0.05]"
                style={{ background: "radial-gradient(circle, #0369c5, transparent)" }}
            />

            {/* Stats section removed */}


            {/* ── Main Footer Grid ── */}
            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
                            <span className="text-2xl font-black text-black tracking-tighter">
                                GetHotelStays
                            </span>
                        </Link>

                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-8 max-w-[240px]">
                            India&apos;s fastest-growing luxury hotel platform. From heritage palaces to hidden beach gems.
                        </p>

                        <div className="space-y-3 mb-8">
                            <a href="tel:+919318485680" className="flex items-center gap-3 text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                                +91 93184 85680
                            </a>
                            <a href="tel:+919999715905" className="flex items-center gap-3 text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                                +91 99997 15905
                            </a>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-2">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="w-10 h-10 rounded-2xl bg-white/60 border border-black/5 flex items-center justify-center text-slate-900 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([group, links]) => (
                        <div key={group}>
                            <h4 className="text-black text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-40">
                                {group}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom Bar ── */}
            <div className="border-t border-black/5 py-8">
                <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-bold text-slate-400 text-center md:text-left">
                    <p>© 2026 GetHotelStays. Owned & operated by Aloria Group, Dwarka Mor, Vipin Garden, New Delhi - 110059.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-1.5 grayscale opacity-60">
                            <span>Made with</span>
                            <span className="text-brand-600">♥</span>
                            <span>in India</span>
                        </div>
                        <div className="h-4 w-px bg-black/5 hidden sm:block" />
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 uppercase tracking-widest">
                            <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                            <Link to="/terms-&-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
                            <Link to="/cancellation-policy" className="hover:text-black transition-colors">Refund & Cancellation</Link>
                            <Link to="/pricing-policy" className="hover:text-black transition-colors">Pricing Policy</Link>
                            <Link to="/cookies" className="hover:text-black transition-colors">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}



