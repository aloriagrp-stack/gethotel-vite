'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cookie, Info, Compass, BarChart3, Settings, Mail } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

interface Section {
  id: string;
  title: string;
  icon: any;
}

const sections: Section[] = [
  { id: "whatis", title: "1. What are Cookies?", icon: Info },
  { id: "howuse", title: "2. Why We Use Them", icon: Compass },
  { id: "types", title: "3. Types of Cookies", icon: Cookie },
  { id: "preferences", title: "4. Turning Cookies Off", icon: Settings },
];

export default function CookiePolicy() {
  const [activeSection, setActiveSection] = useState("whatis");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/20 py-12 md:py-16">
      <SEOHead
        title="Cookie Policy | GetHotelStays"
        description="Learn how GetHotelStays uses cookies to remember your settings and make booking easier, explained in simple words."
        keywords={["cookie policy", "gethotelstays cookies", "browser cookies", "cookies settings"]}
      />

      <div className="container-page max-w-5xl">
        {/* Header Block (Clean text, card-less design) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-left mb-12 border-b border-slate-200/80 pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Cookie className="w-3.5 h-3.5" /> Browser Settings
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-slate-500 max-w-3xl font-medium text-sm md:text-base leading-relaxed">
            This page explains how GetHotelStays uses cookies (small files stored in your browser) to keep you logged in and save your hotel search settings.
          </p>
        </motion.div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Table of Contents - Clean Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-4 sticky top-28 hidden lg:block"
          >
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider px-3">
                Sections
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all duration-250 cursor-pointer ${
                        isActive
                          ? "bg-brand-600/10 text-brand-700 font-extrabold"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                      <span>{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Simple Cookie Policy Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-8 space-y-12"
          >
            {/* Section 1: What are Cookies */}
            <section id="whatis" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  1. What are Cookies?
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Cookies are very small text files saved on your computer or mobile phone when you visit websites. They help websites remember you, save your settings, and make the website work faster.
                </p>
              </div>
            </section>

            {/* Section 2: Why We Use Cookies */}
            <section id="howuse" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  2. Why We Use Them
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  At <strong>GetHotelStays</strong> (operated by <strong>Aloria Group</strong>), we use cookies to make searching and booking luxury stays easier for you:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To keep you logged into your account so you don't have to enter your password on every page.</li>
                  <li>To remember your search preferences (like the check-in dates, guest count, and city you searched for).</li>
                  <li>To keep your wishlist hotels saved so you can check them later.</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Types of Cookies */}
            <section id="types" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  3. Types of Cookies We Deploy
                </h2>
              </div>
              <div className="text-slate-600 space-y-6 text-sm md:text-base leading-relaxed">
                <p>
                  We use three simple categories of cookies:
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">A. Necessary Cookies</h4>
                    <p className="text-xs text-slate-500 mt-1">These are required for basic functions like logging in and booking rooms. If you block these, the booking system will not work.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">B. Preference Cookies</h4>
                    <p className="text-xs text-slate-500 mt-1">These remember your search settings, dates, and selected filters so you don't have to fill them again.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">C. Website Analytics Cookies</h4>
                    <p className="text-xs text-slate-500 mt-1">These collect anonymous data on how people use our website, helping us find errors and make the pages load faster.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Turning Cookies Off */}
            <section id="preferences" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  4. Turning Cookies Off
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  If you want, you can disable or delete cookies inside your browser settings:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Open your browser settings (Chrome, Safari, Edge, Firefox).</li>
                  <li>Search for "Cookies" in settings.</li>
                  <li>Select the option to block or clear cookies.</li>
                </ul>
                <p className="text-amber-600 font-bold text-xs mt-3 uppercase tracking-wider">
                  Attention: If you block necessary cookies, you will not be able to log in or book a room on our website.
                </p>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 my-4 font-semibold leading-relaxed">
                  <strong>Registered Address (Aloria Group):</strong><br />
                  Dwarka Mor, Vipin Garden, New Delhi - 110059
                </div>
                <div className="pt-6 border-t border-slate-200 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 font-semibold text-slate-500">Questions about cookies?</p>
                  <a
                    href="mailto:support@gethotelstays.com"
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider"
                  >
                    <Mail className="w-4 h-4" /> Support Email
                  </a>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
