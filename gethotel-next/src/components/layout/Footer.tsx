'use client';

import { Link } from "react-router-dom";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
    MapPin,
    Mail,
    Phone,
    Globe,
    ArrowRight,
    Sparkles,
    CheckCircle,
    Share2,
    Send,
} from "lucide-react";

const socials = [
    { icon: Share2, href: "https://twitter.com/gethotelstays", label: "Twitter", color: "hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-400" },
    { icon: Globe, href: "https://instagram.com/gethotelstays", label: "Instagram", color: "hover:bg-pink-500/20 hover:border-pink-500/50 hover:text-pink-400" },
    { icon: Send, href: "https://linkedin.com/company/gethotelstays", label: "LinkedIn", color: "hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400" },
    { icon: Globe, href: "https://facebook.com/gethotelstays", label: "Facebook", color: "hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400" },
];

export default function Footer() {
    const { langCode } = useLocale();
    const currentLang = langCode || "en";
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const footerLinks = {
        Destinations: [
            { label: "Delhi Hotels", href: `/delhi-hotels` },
            { label: "Goa Hotels", href: `/goa-hotels` },
            { label: "Mumbai Hotels", href: `/hotels?city=Mumbai` },
            { label: "Jaipur Hotels", href: `/jaipur-hotels` },
            { label: "Shimla Hotels", href: `/shimla-hotels` },
            { label: "Manali Hotels", href: `/manali-hotels` },
            { label: "Udaipur Hotels", href: `/udaipur-hotels` },
        ],
        Support: [
            { label: "Privacy Policy", href: `/privacy-policy` },
            { label: "Terms & Conditions", href: `/terms-of-service` },
            { label: "Refund & Cancellation", href: `/cancellation-policy` },
            { label: "Pricing Policy", href: `/pricing-policy` },
            { label: "Contact Us", href: `/contact-us` },
        ],
        Partners: [
            { label: "List Your Property", href: `/list-property` },
            { label: "Partner Central", href: `/partner` },
            { label: "Partner Login", href: `/login` },
        ],
    };

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    return (
        <footer className="bg-[#050505] text-slate-300 border-t border-neutral-800/80 pt-16 pb-12 overflow-hidden relative selection:bg-brand-500 selection:text-white">
            <div className="container-page relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                                <span className="text-brand-500">Get</span>HotelStays
                            </span>
                        </Link>
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-sm">
                            India's leading verified hotel booking platform. Pay only 12% online and rest at hotel. Trusted by travelers from India & worldwide.
                        </p>
                        
                        <div className="flex items-center gap-3">
                            {socials.map((s, idx) => {
                                const Icon = s.icon;
                                return (
                                    <a
                                        key={idx}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.label}
                                        className={`w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 transition-all ${s.color}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{category}</h3>
                            <ul className="space-y-2.5">
                                {links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link
                                            to={link.href}
                                            className="text-xs text-neutral-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
                    <p>© {new Date().getFullYear()} GetHotelStays.com. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Designed with <Sparkles className="w-3.5 h-3.5 text-brand-500" /> for Indian & Global Travelers
                    </p>
                </div>
            </div>
        </footer>
    );
}
