'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle, CreditCard, Clock, RotateCcw, AlertTriangle, HelpCircle, Mail, Phone } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

interface Section {
  id: string;
  title: string;
  icon: any;
}

const sections: Section[] = [
  { id: "model", title: "1. How Bookings Work", icon: CreditCard },
  { id: "categories", title: "2. Cancellation Types", icon: XCircle },
  { id: "howtocancel", title: "3. How to Cancel", icon: Clock },
  { id: "refunds", title: "4. Refund Timelines", icon: RotateCcw },
  { id: "hotelcancellation", title: "5. Cancelled by Hotel", icon: AlertTriangle },
  { id: "noshow", title: "6. No-Show Policy", icon: Shield },
];

// Inline Shield definition since we didn't import it
import { Shield } from "lucide-react";

export default function CancellationPolicy() {
  const [activeSection, setActiveSection] = useState("model");

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
        title="Refund & Cancellation | GetHotelStays"
        description="Understand the cancellation, booking deposit refunds, and timeline rules for GetHotelStays in simple terms."
        keywords={["cancellation policy", "refund policy", "gethotelstays refund", "hotel booking cancellation"]}
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
            <XCircle className="w-3.5 h-3.5" /> Bookings & Refunds
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Refund & Cancellation
          </h1>
          <p className="text-slate-500 max-w-3xl font-medium text-sm md:text-base leading-relaxed">
            We want your booking experience to be flexible and stress-free. Below is a detailed look at how cancellations, booking deposit refunds, and refund timelines are processed on GetHotelStays (operated by Aloria Group).
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

          {/* Detailed Policy Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-8 space-y-12"
          >
            {/* Section 1: The Booking Model */}
            <section id="model" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  1. How Booking Payments Work
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  To secure your stay at any luxury hotel listed on our website, we use a split payment model:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You pay a **12% deposit online** on our website at the time of making the reservation. This confirms your booking request immediately.</li>
                  <li>You pay the remaining **88% balance** directly to the hotel staff when you check in or check out at the property.</li>
                </ul>
                <p className="text-slate-500 text-xs font-semibold">
                  Note: All cancellation refunds apply only to the 12% deposit you paid to GetHotelStays (operated by Aloria Group). The remaining 88% is not collected by us.
                </p>
              </div>
            </section>

            {/* Section 2: Cancellation Categories */}
            <section id="categories" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  2. Cancellation Categories
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Every room listing shows its cancellation policy clearly before you book. These policies are set by the hotels and generally fall into two categories:
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150">
                    <h4 className="font-bold text-slate-950 text-sm">A. Free Cancellation Bookings</h4>
                    <p className="text-xs text-slate-600 mt-1">If you cancel your stay before the hotel's specified free cancellation deadline (e.g. 24 or 48 hours prior to check-in time), you will receive a full 100% refund of your 12% online deposit.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150">
                    <h4 className="font-bold text-slate-950 text-sm">B. Non-Refundable Bookings</h4>
                    <p className="text-xs text-slate-600 mt-1">If your booking is marked as "Non-Refundable," or if you cancel after the free cancellation window has closed, the 12% deposit is forfeited and cannot be refunded.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: How to Cancel */}
            <section id="howtocancel" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  3. How to Cancel Your Stay
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  You can request a cancellation easily from your dashboard:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to your account on **GetHotelStays**.</li>
                  <li>Go to **My Bookings** and locate the reservation you want to cancel.</li>
                  <li>Click on the **Cancel Booking** option.</li>
                  <li>Select the reason for cancellation and confirm. You will receive an automated email confirmation as soon as it is processed.</li>
                </ol>
              </div>
            </section>

            {/* Section 4: Refund Methods & Timelines */}
            <section id="refunds" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  4. Refund Methods & Timelines
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  If you cancel a booking that qualifies for a refund:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We will initiate the refund to your original payment method (the bank account, credit card, debit card, or UPI wallet you used during checkout).</li>
                  <li>We initiate the refund immediately, but it typically takes **5 to 7 business days** to show up in your bank account. This timeline depends on banking procedures.</li>
                  <li>If you do not see the refund within 7 days, please contact our support desk with your Booking ID so we can verify the transaction status.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Cancelled by Hotel */}
            <section id="hotelcancellation" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  5. Bookings Cancelled by the Hotel
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  In extremely rare events (such as unexpected repairs, overbooking errors, or emergencies), a hotel may not be able to honor your reservation.
                </p>
                <p>
                  If this happens:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We will inform you immediately.</li>
                  <li>You will receive a **100% refund** of your 12% deposit immediately, regardless of the booking type.</li>
                  <li>Our support team will proactively assist you in finding similar luxury accommodations nearby to prevent stay disruption.</li>
                </ul>
              </div>
            </section>

            {/* Section 6: No-Show Policy */}
            <section id="noshow" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  6. No-Show Policy
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  A "No-Show" happens when you do not arrive at the hotel on your check-in date without cancelling the booking first.
                </p>
                <p>
                  In the case of a No-Show:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The booking is automatically cancelled by the hotel.</li>
                  <li>Your 12% deposit is forfeited and cannot be refunded.</li>
                  <li>The hotel also reserves the right to release the room to other guests.</li>
                </ul>
              </div>
            </section>

            {/* Support/Questions block */}
            <section id="support" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  7. Still Have Questions?
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  If you need help with a cancellation or refund, or want to modify your dates, please contact our support desk at <strong>Aloria Group</strong>:
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 mb-4 font-semibold leading-relaxed">
                  <strong>Registered Address:</strong><br />
                  Dwarka Mor, Vipin Garden, New Delhi - 110059
                </div>
                <div className="flex flex-col md:flex-row gap-4 pt-2">
                  <a href="mailto:support@gethotelstays.com" className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-brand-600 transition-colors">
                    <Mail className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>support@gethotelstays.com</span>
                  </a>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>+91 93184 85680 / +91 99997 15905</span>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
