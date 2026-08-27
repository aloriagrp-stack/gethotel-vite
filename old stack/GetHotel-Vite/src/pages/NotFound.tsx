import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-slate-50/20 px-6 py-12 relative overflow-hidden">
      <SEOHead
        title="Page Not Found | GetHotelStays"
        description="The page you are looking for does not exist on GetHotelStays."
      />

      {/* Background Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-400/5 blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-sky-400/5 blur-[120px] -z-10" />

      <div className="text-center max-w-lg w-full relative z-10">
        {/* 404 Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-7xl md:text-9xl font-black tracking-tighter text-slate-900 leading-none italic mb-4"
        >
          404<span className="text-brand-600 not-italic">.</span>
        </motion.h1>

        {/* Error Text */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-4"
        >
          Lost in Paradise?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-slate-500 font-medium text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto"
        >
          The page or hotel stay you are looking for has checked out, or never existed in our directory. Let's get you back on track!
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-950/10 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 group"
          >
            <Home className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    </main>
  );
}
