'use client';

import { Link } from "react-router-dom";

// Crisp brand SVGs for social media
const TwitterIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.66 1.66 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66.92 0 1.66-.74 1.66-1.66 0-.92-.74-1.66-1.66-1.66z" />
    </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
    </svg>
);

const socials = [
    { icon: InstagramIcon, href: "https://instagram.com/get.hotel.stays", label: "Instagram", color: "hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600" },
    { icon: FacebookIcon, href: "https://facebook.com/gethotelstays", label: "Facebook", color: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600" },
    { icon: TwitterIcon, href: "https://x.com/gethotelstays", label: "X (Twitter)", color: "hover:bg-slate-100 hover:border-slate-400 hover:text-slate-950" },
    { icon: LinkedInIcon, href: "https://linkedin.com/company/gethotelstays", label: "LinkedIn", color: "hover:bg-blue-50 hover:border-blue-300 hover:text-brand-600" },
];

export default function Footer() {
    const footerLinks = {
        "Destinations": [
            { label: "Delhi Hotels", href: `/delhi-hotels` },
            { label: "Couple Friendly Delhi", href: `/couple-friendly-hotels-in-delhi` },
            { label: "Hourly Stays Delhi", href: `/hourly-hotels-in-delhi` },
            { label: "Hotels Near Delhi Airport", href: `/hotels-near-delhi-airport` },
            { label: "Hotels Near NDLS Station", href: `/hotels-near-new-delhi-railway-station` },
            { label: "Jaipur Hotels", href: `/jaipur-hotels` },
            { label: "Udaipur Hotels", href: `/udaipur-hotels` },
            { label: "Manali Hotels", href: `/manali-hotels` },
            { label: "Shimla Hotels", href: `/shimla-hotels` },
        ],
        "Support & Legal": [
            { label: "Privacy Policy", href: `/privacy-policy` },
            { label: "Terms of Service", href: `/terms-of-service` },
            { label: "Refund & Cancellation", href: `/cancellation-policy` },
            { label: "Pricing Policy", href: `/pricing-policy` },
            { label: "Contact Us", href: `/contact-us` },
        ],
        "Partners": [
            { label: "List Your Property", href: `/list-property` },
            { label: "Partner Central", href: `/partner` },
            { label: "Partner Login", href: `/login` },
        ],
    };

    return (
        <footer className="bg-transparent text-slate-700 pt-0 pb-12 overflow-hidden relative">
            {/* Shiny Blue Divider Line */}
            <div className="relative w-full h-[2px] mb-10 md:mb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[2px] opacity-90 animate-pulse" />
            </div>

            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-4">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-950 group-hover:text-brand-600 transition-colors">
                                GetHotelStays<span className="text-brand-600 not-italic">.</span>
                            </span>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                            India's leading verified hotel booking platform. Pay only 12% online and rest at hotel. Trusted by travelers from India & worldwide.
                        </p>
                        
                        <div className="flex items-center gap-2.5 pt-1">
                            {socials.map((s, idx) => {
                                const Icon = s.icon;
                                return (
                                    <a
                                        key={idx}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.label}
                                        title={s.label}
                                        className={`w-8 h-8 rounded-lg bg-white/80 border border-slate-200 flex items-center justify-center text-slate-600 transition-all shadow-sm ${s.color}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links Columns (Aamne-Samne Grid layout) */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category} className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">{category}</h3>
                                <ul className="space-y-2">
                                    {links.map((link, idx) => (
                                        <li key={idx}>
                                            <Link
                                                to={link.href}
                                                className="text-xs text-slate-600 hover:text-brand-600 transition-colors font-medium block"
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

                <div className="border-t border-slate-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} GetHotelStays.com. All rights reserved.</p>
                    <p className="font-medium text-slate-600">
                        Managed by <span className="font-bold text-slate-800">Aloria Group</span> and Developed by <a href="https://alorialabs.in" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-600 hover:underline">alorialabs.in</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
