'use client';
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, ArrowRight, HelpCircle, AlertCircle, Landmark, Train, Bus, Wallet, ShieldCheck } from "lucide-react";
import { hotelApi } from "@/lib/api";
import SEOHead from "@/components/common/SEOHead";
import HotelCard from "@/components/hotels/HotelCard";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import {
    buildDelhiContext,
    buildDelhiSchemas,
    delhiCanonicalUrl,
    delhiPagePath,
    delhiPages,
    delhiHub,
    getDelhiInventory,
    getDelhiPage,
    isHubPage,
    normalizeDelhiHotels,
    formatInr,
    type DelhiHotelInput,
} from "@/lib/delhiSeo";

interface DelhiLandingPageProps {
    slugOverride?: string;
}

export default function DelhiLandingPage({ slugOverride }: DelhiLandingPageProps) {
    const { slug: routeSlug, lang: routeLang } = useParams();
    const lang = routeLang || "en";
    const slug = slugOverride !== undefined ? slugOverride : (routeSlug || "");

    const [hotels, setHotels] = useState<DelhiHotelInput[]>(() => getDelhiInventory());
    const [loading, setLoading] = useState(() => getDelhiInventory().length === 0);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res: any = await hotelApi.searchHotels({ city: "Delhi", limit: 200 });
                if (!cancelled && res?.data) setHotels(normalizeDelhiHotels(res.data));
            } catch (err) {
                console.error("Failed to fetch Delhi inventory:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        window.scrollTo(0, 0);
        return () => {
            cancelled = true;
        };
    }, []);

    const ctx = useMemo(() => buildDelhiContext(hotels, slug), [hotels, slug]);

    if (!ctx) {
        return (
            <div className="min-h-screen pt-3 pb-8 md:pt-6 md:pb-12 px-4">
                <SEOHead
                    title="Page Not Found — Delhi Hotels | GetHotelStays"
                    description="This Delhi hotel page could not be found. Browse all verified hotels in Delhi."
                    noIndex
                    canonicalUrl={delhiCanonicalUrl(lang)}
                />
                <div className="max-w-4xl mx-auto text-center space-y-4 py-20">
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-950">Page Not Found</h1>
                    <p className="text-slate-500 text-sm font-semibold">This Delhi hotel page does not exist.</p>
                    <Link
                        to={delhiPagePath(lang)}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                    >
                        Hotels in Delhi <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const { page } = ctx;
    const isHub = isHubPage(page);
    const path = delhiPagePath(lang, page.slug);
    const canonical = delhiCanonicalUrl(lang, page.slug);

    const related = [delhiHub(), ...delhiPages()].filter(
        (p) => p.slug !== page.slug && (page.relatedSlugs || []).includes(p.slug)
    );
    const allSlugs = new Set(delhiPages().map((p) => p.slug));
    const categorySlugs = ["budget", "luxury", "family", "business", "with-breakfast", "with-parking", "with-airport-transfer"];
    const areaSlugs = delhiPages().filter((p) => p.type === "area").map((p) => p.slug);

    const intro = ctx.introduction;
    const showExpand = intro.length > 200;

    return (
        <div className="min-h-screen pt-3 pb-8 md:pt-6 md:pb-12 bg-transparent px-0">
            <SEOHead
                title={ctx.title}
                description={ctx.metaDescription}
                keywords={page.keywords}
                ogUrl={canonical}
                canonicalUrl={canonical}
                schemas={buildDelhiSchemas(ctx, lang)}
                noIndex={!ctx.indexable}
            />

            <div className="w-full max-w-none mx-auto px-4 md:px-10 space-y-8 md:space-y-12">

                <div className="max-w-4xl space-y-2 md:space-y-3">
                    <nav className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-xs font-bold text-slate-500" aria-label="Breadcrumb">
                        <Link to={`/${lang}`} className="hover:text-brand-600">Home</Link>
                        <span>/</span>
                        <Link to={`/${lang}/hotels`} className="hover:text-brand-600">Hotels</Link>
                        <span>/</span>
                        <Link to={delhiPagePath(lang)} className="hover:text-brand-600">Hotels in Delhi</Link>
                        {!isHub && (
                            <>
                                <span>/</span>
                                <span className="text-slate-800">{ctx.h1.split("—")[0].trim()}</span>
                            </>
                        )}
                    </nav>

                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                        {ctx.h1}
                    </h1>
                    <p className="text-slate-600 text-xs md:text-sm lg:text-base leading-relaxed font-medium">
                        {showExpand && !expanded ? `${intro.slice(0, 200)}...` : intro}
                        {showExpand && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-brand-600 hover:text-brand-500 font-bold ml-1.5 focus:outline-none inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                            >
                                {expanded ? "Read Less" : "Read More"}
                            </button>
                        )}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified properties — Pay 12% now, rest at hotel
                        </span>
                        {ctx.fromPrice !== null ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-full text-[11px] font-bold text-brand-700">
                                <Wallet className="w-3.5 h-3.5" />
                                From {formatInr(ctx.fromPrice)} depending on dates
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600">
                                <Wallet className="w-3.5 h-3.5" />
                                Prices vary by dates — confirmed at booking
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <MapPin className="w-5 h-5 md:w-6 h-6 text-brand-600" />
                        {isHub ? "Available properties in Delhi" : `Available properties in ${page.primaryKeyword.replace("hotels in ", "").replace("hotels near ", "near ").replace(/ delhi$/i, "").replace(/^\w/, (c) => c.toUpperCase())}`}
                        {!loading && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-600 text-white">{ctx.count}</span>
                        )}
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <HotelCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : ctx.matched.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {ctx.matched.map((hotel) => (
                                <HotelCard key={hotel.id} hotel={hotel as any} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-8 text-center max-w-2xl">
                            <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {ctx.indexable ? "No active properties listed yet" : "More hotels being onboarded"}
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-md">
                                {ctx.indexable
                                    ? "We are currently onboarding verified hotel partners for this area. Check back soon or browse all hotels in Delhi."
                                    : "This page is live but waiting for more verified inventory. Browse all Delhi hotels while partner properties are onboarded."}
                            </p>
                            <Link
                                to={delhiPagePath(lang)}
                                className="mt-6 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                            >
                                Browse All Delhi Hotels
                            </Link>
                        </div>
                    )}
                </div>

                {page.whyStay && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-8 md:p-10 text-slate-900 space-y-3">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Why Stay Here</h2>
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">{page.whyStay}</p>
                    </div>
                )}

                {page.sections.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pt-6">
                        {page.sections.map((sec, i) => (
                            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 space-y-4 hover:shadow-xl transition-all duration-300">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{sec.h2}</h2>
                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">{sec.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {page.landmarks.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-brand-600" /> Nearby Landmarks
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {page.landmarks.map((l, i) => (
                                <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                                    {typeof l === "string" ? l : `${l.name} — ${l.distance}`}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {(page.metros.length > 0 || page.transport.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                        {page.metros.length > 0 && (
                            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 space-y-4">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <Train className="w-5 h-5 text-brand-600" /> Metro Access
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {page.metros.map((m, i) => (
                                        <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {page.transport.length > 0 && (
                            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 space-y-4">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <Bus className="w-5 h-5 text-brand-600" /> Getting Around
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {page.transport.map((t, i) => (
                                        <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {"medicalNote" in page && page.medicalNote && (
                    <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-6 md:p-8 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-blue-800 text-xs md:text-sm font-semibold leading-relaxed">
                            This page lists accommodation options only. For medical advice, appointments or treatment decisions, please consult your treating doctor or the hospital directly.
                        </p>
                    </div>
                )}

                {related.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 text-slate-900 space-y-6">
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-950">
                            {isHub ? "Explore Delhi by Area, Landmark & Category" : "Related Delhi Hotel Pages"}
                        </h3>
                        <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-2xl leading-relaxed">
                            {isHub
                                ? "Find the perfect Delhi hotel by neighbourhood, landmark, airport terminal, railway station or travel style."
                                : "Keep exploring the Delhi hotel network — every page lists only verified, bookable inventory."}
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            {related.map((p, i) => {
                                const pPath = delhiPagePath(lang, p.slug || undefined);
                                return (
                                    <Link
                                        key={i}
                                        to={pPath}
                                        className="px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                                    >
                                        {p.primaryKeyword}
                                    </Link>
                                );
                            })}
                            {!isHub && (
                                <Link
                                    to={delhiPagePath(lang)}
                                    className="px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100"
                                >
                                    Hotels in Delhi
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {page.faqs.length > 0 && (
                    <div className="space-y-6 max-w-4xl pt-6">
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <HelpCircle className="w-6 h-6 text-blue-600" />
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {ctx.faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-3xl p-6 space-y-2">
                                    <h3 className="font-bold text-slate-950 text-sm md:text-base">{faq.question}</h3>
                                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {page.tours.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 md:p-12 text-slate-900 space-y-6">
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-blue-950">
                            Pair Your Delhi Stay with a Tour
                        </h3>
                        <div className="flex flex-wrap gap-4 pt-2">
                            {page.tours.map((tour, i) => (
                                <Link
                                    key={i}
                                    to={tour.url}
                                    className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-sm"
                                >
                                    {tour.label}
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                        to={`/${lang}/hotels?city=Delhi`}
                        className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                    >
                        Search All Hotels in Delhi
                    </Link>
                    <Link
                        to={`/${lang}/hotels`}
                        className="px-8 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        Browse All India Hotels
                    </Link>
                </div>

                {!isHub && (
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 space-y-4">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900">More Delhi Hotel Categories</h3>
                        <div className="flex flex-wrap gap-3">
                            {categorySlugs
                                .filter((s) => s !== page.slug && allSlugs.has(s))
                                .map((s) => {
                                    const p = getDelhiPage(s)!;
                                    return (
                                        <Link
                                            key={s}
                                            to={delhiPagePath(lang, s)}
                                            className="px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                                        >
                                            {p.primaryKeyword}
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {isHub && (
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-10 space-y-4">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900">Hotels by Area in Delhi</h3>
                        <div className="flex flex-wrap gap-3">
                            {areaSlugs.map((s) => {
                                const p = getDelhiPage(s)!;
                                return (
                                    <Link
                                        key={s}
                                        to={delhiPagePath(lang, s)}
                                        className="px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-300 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-brand-600"
                                    >
                                        {p.primaryKeyword}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
