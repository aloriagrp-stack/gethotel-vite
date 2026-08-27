'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, UserCheck, CreditCard, XCircle, Home, AlertCircle, Award, Scale, Mail } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

interface Section {
  id: string;
  title: string;
  icon: any;
}

const sections: Section[] = [
  { id: "agreement", title: "1. What are these Rules?", icon: FileText },
  { id: "accounts", title: "2. Your Account", icon: UserCheck },
  { id: "bookings", title: "3. Booking & 12% Payment", icon: CreditCard },
  { id: "cancellations", title: "4. Cancel & Refund Rules", icon: XCircle },
  { id: "conduct", title: "5. Rules at the Hotel", icon: Home },
  { id: "disputes", title: "6. Handling Issues", icon: AlertCircle },
  { id: "intellectual", title: "7. Our Content & Brand", icon: Award },
  { id: "governing", title: "8. Law & Disputes", icon: Scale },
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("agreement");

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
        title="Terms & Conditions | GetHotelStays"
        description="Read our booking rules and terms in simple, easy-to-understand words."
        keywords={["terms and conditions", "booking rules", "gethotelstays terms", "12 percent deposit rules"]}
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
            <FileText className="w-3.5 h-3.5" /> Platform Rules
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-slate-500 max-w-3xl font-medium text-sm md:text-base leading-relaxed">
            Please read these rules carefully before booking a room. They explain how booking works on GetHotelStays, payment methods, and cancellation rules.
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all duration-200 cursor-pointer ${
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

          {/* Simple Terms Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-8 space-y-12"
          >
            {/* Section 1: What are these Rules */}
            <section id="agreement" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  1. What are these Rules?
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  These rules (Terms & Conditions) are a binding agreement between you ("Guest" or "User") and <strong>GetHotelStays</strong> (a brand owned and operated by the legal entity <strong>Aloria Group</strong>). By using our website or booking a hotel through us, you agree to follow these simple rules.
                </p>
              </div>
            </section>

            {/* Section 2: Your Account */}
            <section id="accounts" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  2. Your Account
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  To manage your bookings, save wishlists, or write reviews, you can create a user account. You agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide correct information (like your real name and correct phone number).</li>
                  <li>Keep your password safe.</li>
                  <li>Not let anyone else use your account.</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Booking & 12% Payment */}
            <section id="bookings" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  3. Booking & 12% Payment Model
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  GetHotelStays is a booking platform where you can reserve luxury hotels. We use a simple booking model:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-slate-900">Pay 12% Deposit:</strong> To confirm your booking, you must pay a <strong>12% deposit</strong> online on our website.
                  </li>
                  <li>
                    <strong className="text-slate-900">Pay 88% at Hotel:</strong> You will pay the remaining <strong>88% balance</strong> directly at the hotel when you check in or check out.
                  </li>
                  <li>
                    <strong className="text-slate-900">Receipt:</strong> As soon as you pay the 12% deposit, we will email you a booking voucher with all details.
                  </li>
                </ul>
                <p>
                  Any extra services you buy at the hotel (like laundry, food, or spa) are paid directly to the hotel and are not part of the 12% deposit.
                </p>
              </div>
            </section>

            {/* Section 4: Cancel & Refund Rules */}
            <section id="cancellations" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  4. Cancel & Refund Rules
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Different hotel rooms have different cancellation rules, which are always written on the booking page:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-slate-900">Free Cancellation:</strong> If you cancel within the free cancellation time limit, we will refund your 12% deposit back to your account.
                  </li>
                  <li>
                    <strong className="text-slate-900">Non-Refundable:</strong> If a booking is marked "Non-Refundable," and you cancel or do not show up at the hotel, the 12% deposit will not be refunded.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5: Rules at the Hotel */}
            <section id="conduct" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  5. Rules at the Hotel
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  When you arrive at the hotel to stay:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You must show a valid government-issued photo identity card (like Aadhaar, Passport, or Voter ID) matching the guest name on the booking voucher.</li>
                  <li>You must respect the hotel's rules (like check-in/out timings and pet policies).</li>
                  <li>The hotel has the right to deny you entry if you misbehave or violate hotel policies. GetHotelStays is not responsible if the hotel cancels your room due to misconduct.</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Handling Issues */}
            <section id="disputes" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  6. Handling Issues & Disputes
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  If you face any issues at the hotel (for example, the room size is wrong, or amenities are missing):
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You can go to your dashboard, select the booking, and click **Dispute Booking** to report the issue.</li>
                  <li>We will talk to the hotel manager and try our best to solve the issue for you.</li>
                  <li>You agree to provide true and honest details when lodging any dispute.</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Our Content & Brand */}
            <section id="intellectual" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  7. Our Content & Brand
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Everything on this website (logos, designs, hotel images, written text, code, and features) belongs to **GetHotelStays**. You are not allowed to copy, download, or use our content elsewhere without asking us first.
                </p>
              </div>
            </section>

            {/* Section 8: Law & Disputes */}
            <section id="governing" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  8. Law & Disputes
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  These rules are governed by the laws of India. If there is any legal dispute regarding our services, it will be handled by the courts in New Delhi, India.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 my-4 font-semibold leading-relaxed">
                  <strong>Registered Office Address (Aloria Group):</strong><br />
                  Dwarka Mor, Vipin Garden, New Delhi - 110059
                </div>
                <div className="pt-6 border-t border-slate-200 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 font-semibold text-slate-500">Need help regarding our booking rules?</p>
                  <a
                    href="mailto:support@gethotelstays.com"
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider"
                  >
                    <Mail className="w-4 h-4" /> Message Support
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
