"use client";

import Link from "next/link";
import { useState } from "react";
import {
    MapPin,
    Mail,
    Phone,
    Twitter,
    Instagram,
    Linkedin,
    Facebook,
    ArrowRight,
    Sparkles,
    CheckCircle,
} from "lucide-react";

const footerLinks = {
    Destinations: [
        { label: "Goa Hotels", href: "/hotels?city=Goa" },
        { label: "Mumbai Hotels", href: "/hotels?city=Mumbai" },
        { label: "Jaipur Hotels", href: "/hotels?city=Jaipur" },
        { label: "Kerala Hotels", href: "/hotels?city=Kerala" },
        { label: "Shimla Hotels", href: "/hotels?city=Shimla" },
    ],
    Company: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Press", href: "#" },
    ],
    Support: [
        { label: "Help Center", href: "#" },
        { label: "Safety Info", href: "#" },
        { label: "Cancellation Policy", href: "#" },
        { label: "Report Issue", href: "#" },
    ],
};

const socials = [
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-400" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-500/20 hover:border-pink-500/50 hover:text-pink-400" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400" },
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400" },
];

const stats = [
    { value: "50K+", label: "Hotels Listed" },
    { value: "2M+", label: "Happy Guests" },
    { value: "500+", label: "Destinations" },
    { value: "4.9★", label: "App Rating" },
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

            {/* ── Stats Strip ── */}
            <div className="border-b border-black/5 bg-black/[0.02]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <p className="text-2xl font-black text-black tracking-tighter" style={{ fontFamily: "var(--font-display, serif)" }}>
                                    {value}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-black tracking-widest">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Newsletter Banner ── */}
            <div className="border-b border-black/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="relative rounded-[32px] overflow-hidden px-5 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 border border-black/5 shadow-sm">
                        <div className="flex items-start gap-4 relative z-10 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-600/10 border border-brand-600/20">
                                <Sparkles className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <h3 className="text-black text-lg font-black">Get exclusive deals</h3>
                                <p className="text-slate-600 text-sm mt-0.5 font-medium leading-tight">
                                    Join 500k+ travellers. Zero spam.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 w-full md:w-auto">
                            {subscribed ? (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-600 font-black text-sm">
                                    <CheckCircle className="w-5 h-5" />
                                    You&apos;re subscribed!
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="flex flex-row w-full md:w-auto gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@email.com"
                                        className="min-w-0 flex-1 md:w-60 px-4 md:px-5 py-3 text-sm text-black placeholder-slate-400 bg-white/60 border border-black/10 rounded-2xl focus:outline-none focus:border-brand-600/50 transition-all shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="group flex items-center justify-center gap-2 px-5 md:px-6 py-3 bg-brand-600 text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-600/20 active:scale-95 shrink-0"
                                    >
                                        Join
                                        <ArrowRight className="hidden xs:block w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Footer Grid ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
                            <span className="text-2xl font-black text-black tracking-tighter">
                                GetHotel<span className="text-brand-600">Stays</span>
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
                                            href={link.href}
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-bold text-slate-400">
                    <p>© 2026 GetHotel Technologies Pvt. Ltd.</p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 grayscale opacity-60">
                            <span>Made with</span>
                            <span className="text-brand-600">♥</span>
                            <span>in India</span>
                        </div>
                        <div className="h-4 w-px bg-black/5 hidden md:block" />
                        <div className="flex items-center gap-4 uppercase tracking-widest">
                            <a href="#" className="hover:text-black transition-colors">Privacy</a>
                            <a href="#" className="hover:text-black transition-colors">Terms</a>
                            <a href="#" className="hover:text-black transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
