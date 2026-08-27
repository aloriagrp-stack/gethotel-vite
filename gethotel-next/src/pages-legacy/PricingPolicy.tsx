'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Shield, Clock, HelpCircle, Mail, Phone, Percent, Receipt } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

interface Section {
  id: string;
  title: string;
  icon: any;
}

const sections: Section[] = [
  { id: "model", title: "1. Split Payment Model", icon: CreditCard },
  { id: "gst", title: "2. Indian GST Slabs", icon: Percent },
  { id: "calculation", title: "3. Tariff Calculation", icon: Receipt },
  { id: "hourly", title: "4. Hourly Stay Pricing", icon: Clock },
  { id: "guarantee", title: "5. Best Price Guarantee", icon: Shield },
];

export default function PricingPolicy() {
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
        title="Pricing Policy | GetHotelStays"
        description="Learn how pricing, GST slabs, split payments, and hotel tariffs are calculated on GetHotelStays."
        keywords={["pricing policy", "hotel gst india", "gethotelstays pricing", "split payment model"]}
      />

      <div className="container-page max-w-5xl">
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-left mb-12 border-b border-slate-200/80 pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Percent className="w-3.5 h-3.5" /> Billing & Tariffs
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Pricing & GST Policy
          </h1>
          <p className="text-slate-500 max-w-3xl font-medium text-sm md:text-base leading-relaxed">
            GetHotelStays is committed to absolute billing transparency. Here is a comprehensive breakdown of our split payment model, room tariffs, and the statutory taxes applied.
          </p>
        </motion.div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-4 sticky top-28 hidden lg:block"
          >
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider px-3">
                Pricing Topics
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
            {/* Section 1: Split Payment Model */}
            <section id="model" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">
                1. The Split Payment Model
              </h2>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  To secure a booking on GetHotelStays (operated by Aloria Group), we employ a convenient split payment format that minimizes upfront customer commitment:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-xs font-black uppercase text-brand-600 tracking-wider block mb-1">Payable Online (12%)</span>
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      A small 12% deposit is collected at checkout on our website to secure your reservation with the property immediately.
                    </p>
                  </div>
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">Payable at Hotel (88%)</span>
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      The remaining 88% balance is paid directly to the hotel reception desk during your check-in or checkout.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Indian GST Slabs */}
            <section id="gst" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">
                2. Indian GST Slabs on Room Tariffs
              </h2>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  In compliance with statutory requirements set by the Central Board of Indirect Taxes and Customs (CBIC), Goods and Services Tax (GST) is calculated dynamically based on the room tariff per night:
                </p>
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-widest text-[10px]">Room Tariff (Per Night)</th>
                        <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-widest text-[10px]">Statutory GST Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-700">Up to ₹1,000</td>
                        <td className="px-6 py-4 font-black text-emerald-600">0% GST (Exempt)</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-700">₹1,001 to ₹7,500</td>
                        <td className="px-6 py-4 font-black text-blue-600">5% GST</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-700">Above ₹7,500</td>
                        <td className="px-6 py-4 font-black text-amber-600">18% GST (Luxury Slab)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 font-semibold italic">
                  Note: Tax is calculated based on the room tariff after applying any platform or property coupons. 5% GST does not include Input Tax Credit (ITC) eligibility.
                </p>
              </div>
            </section>

            {/* Section 3: Tariff Calculation */}
            <section id="calculation" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">
                3. Booking Tariff Calculation
              </h2>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  To provide you with a clear breakdown, the final checkout price is calculated as follows:
                </p>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>1. BASE ROOM PRICE:</span>
                    <span>Standard rate per night &times; nights booked</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>2. LESS DISCOUNTS:</span>
                    <span>Deduction of welcome coupons or active deals</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>3. ADD GST SLABS:</span>
                    <span>Taxes calculated at 0%, 5%, or 18% based on the net room price per night</span>
                  </div>
                  <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center text-sm font-black text-slate-900 uppercase">
                    <span>Final Price (Total):</span>
                    <span>Subtotal + Applicable GST</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Hourly Stay Pricing */}
            <section id="hourly" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">
                4. Hourly Stay Slot Pricing
              </h2>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  For business travellers and layover transits, our hotel partners offer hourly-stay accommodations for shorter slot packages:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Slots are available in **3-hour**, **6-hour**, and **12-hour** durations.</li>
                  <li>Slot prices are discounted packages configured by each hotel and are not strict fractions of the nightly room rate.</li>
                  <li>Since hourly slots are generally under ₹7,500, they are typically subjected to the **5% GST** bracket.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Best Price Guarantee */}
            <section id="guarantee" className="scroll-mt-24 pb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">
                5. Best Price Guarantee
              </h2>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We coordinate with our luxury partners to deliver direct-from-property tariffs. If you find a lower rate for the identical room type and dates within 24 hours of booking, contact our billing desk and we will match the rate.
                </p>
              </div>
            </section>

            {/* Contact details */}
            <section id="support" className="scroll-mt-24 border-t border-slate-100 pt-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">
                Need Assistance?
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                If you have questions regarding any transaction line item, tariff details, or tax rates, please contact our billing desk:
              </p>
              <div className="flex flex-col md:flex-row gap-6">
                <a href="mailto:support@gethotelstays.com" className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-brand-600 transition-colors">
                  <Mail className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>support@gethotelstays.com</span>
                </a>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>+91 93184 85680 / +91 99997 15905</span>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
