import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner after 2 seconds if consent is not already saved
    const consent = localStorage.getItem("gethotel_cookies_consent");
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem("gethotel_cookies_consent", "accepted");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 max-w-sm md:max-w-md w-[calc(100vw-3rem)] bg-white border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgba(0,82,255,0.08)] p-5 md:p-6 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-[#0052FF]">
                <Cookie className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-[15px] md:text-base leading-snug">
                  We value your privacy
                </h3>
                <span className="text-xs text-slate-400">Cookie Preference</span>
              </div>
            </div>
            <button
              onClick={handleConsent}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed">
            We use cookies to improve your browsing experience, analyze site traffic, and optimize our hotel booking services. By choosing either option, you authorize our collection of cookies.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-1">
            <button
              onClick={handleConsent}
              className="px-4 py-2 text-xs md:text-sm font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              Decline
            </button>
            <button
              onClick={handleConsent}
              className="px-4 py-2 text-xs md:text-sm font-medium text-white bg-[#0052FF] hover:bg-[#0042D9] rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all duration-200"
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
