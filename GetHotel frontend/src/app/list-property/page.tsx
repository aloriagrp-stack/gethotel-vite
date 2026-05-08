"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, ShieldCheck, Globe, ArrowRight, Sparkles, Hotel } from "lucide-react";

export default function ListPropertyLandingPage() {
    return (
        <div className="font-sans text-slate-900">
            <main className="pb-20">
                {/* Hero Section with Waves */}
                <section className="relative px-6 pt-16 pb-40 md:pt-24 md:pb-56 overflow-hidden bg-transparent text-slate-900">
                    {/* Local Abstract Waves for extra flair */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-300/20 to-cyan-300/20 blur-3xl opacity-60 mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
                        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-sky-300/20 to-indigo-300/20 blur-3xl opacity-60 mix-blend-multiply animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
                    </div>

                    <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black tracking-tighter leading-[1.05] text-slate-900">
                                Are you ready to list your <br className="hidden md:block"/> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic pr-2">property with us?</span>
                            </h1>
                            <p className="max-w-2xl mx-auto mt-8 text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
                                Join thousands of hoteliers maximizing their bookings and revenue with our premium platform. Get global reach and powerful management tools today.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12"
                        >
                            <Link href="/list-property/register" className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all hover:scale-105 shadow-[0_20px_40px_rgba(37,99,235,0.25)] flex items-center justify-center gap-3 border border-blue-500">
                                Get Started Now <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#benefits" className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center shadow-sm">
                                Learn More
                            </a>
                        </motion.div>
                    </div>

                    {/* SVG Bottom Wave */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 translate-y-[1px]">
                        <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.93,195.2,110.8,238.45,104.66,281.33,83.9,321.39,56.44Z" className="fill-slate-50"></path>
                        </svg>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="benefits" className="py-24 px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Why list with <span className="italic text-brand-600">GetHotelStays?</span></h2>
                        <p className="text-slate-500 font-medium">Everything you need to grow your hospitality business.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="bg-white p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Globe className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-3">Global Exposure</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Reach millions of travelers worldwide. Our platform puts your property in front of guests looking for premium stays.</p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-white p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-3">Maximize Revenue</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Smart pricing tools, dynamic rate management, and high-conversion booking engines designed to boost your income.</p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-white p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-3">Secure Payments</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Guaranteed secure payouts, fraud protection, and instant booking confirmations for peace of mind.</p>
                        </div>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-24 px-6 bg-white border-y border-slate-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Start earning in <br/><span className="italic text-brand-600">3 simple steps</span></h2>
                                <p className="text-slate-500 font-medium leading-relaxed">Listing your property is fast and entirely free. You only pay a small commission when you get a confirmed booking.</p>
                                
                                <div className="space-y-6 pt-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">1</div>
                                        <div>
                                            <h4 className="font-black text-lg">Create your account</h4>
                                            <p className="text-sm text-slate-500 mt-1">Sign up and verify your basic details.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">2</div>
                                        <div>
                                            <h4 className="font-black text-lg">Add property details</h4>
                                            <p className="text-sm text-slate-500 mt-1">Upload high-quality photos, set your prices, and define room types.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">3</div>
                                        <div>
                                            <h4 className="font-black text-lg">Go live and get bookings</h4>
                                            <p className="text-sm text-slate-500 mt-1">Your property becomes visible to millions of users instantly.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full aspect-square md:aspect-[4/5] rounded-[40px] relative overflow-hidden border border-slate-200 shadow-2xl">
                                <img 
                                    src="/list property photo.jpeg" 
                                    alt="Hotel Management Dashboard"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-6 max-w-4xl mx-auto text-center">
                    <div className="bg-brand-600 rounded-[40px] p-12 md:p-20 shadow-[0_20px_60px_rgba(79,70,229,0.2)] text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "30px 30px" }}></div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight relative z-10">Ready to boost your bookings?</h2>
                        <p className="mt-4 mb-10 text-brand-100 font-medium relative z-10">Join our network of premium properties and start earning more.</p>
                        <Link href="/list-property/register" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-brand-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform relative z-10">
                            Create Your Listing <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
