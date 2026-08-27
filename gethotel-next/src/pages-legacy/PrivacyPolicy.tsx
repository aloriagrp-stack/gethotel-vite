'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Database, Share2, Lock, UserCheck, Cookie, Mail, Phone, ShieldAlert, Heart, Calendar } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

interface Section {
  id: string;
  title: string;
  icon: any;
}

const sections: Section[] = [
  { id: "introduction", title: "1. About this Privacy Policy", icon: Shield },
  { id: "collect", title: "2. The Information We Collect", icon: Database },
  { id: "use", title: "3. How We Use Your Information", icon: Eye },
  { id: "sharing", title: "4. When We Share Your Details", icon: Share2 },
  { id: "security", title: "5. How We Protect Your Data", icon: Lock },
  { id: "rights", title: "6. Your Rights & Choice of Controls", icon: UserCheck },
  { id: "cookies", title: "7. Cookies & Tracking Settings", icon: Cookie },
  { id: "children", title: "8. Children's Safety & External Links", icon: ShieldAlert },
  { id: "contact", title: "9. How to Contact Our Support Team", icon: Mail },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");

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
        title="Privacy Policy | GetHotelStays"
        description="Read our comprehensive, detailed, yet easy-to-understand Privacy Policy to know how we safeguard your booking data."
        keywords={["privacy policy", "gethotelstays privacy", "data safety rules", "hotel reservation security"]}
      />

      <div className="container-page max-w-5xl">
        {/* Header Block (Card-less, clean text design) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-left mb-12 border-b border-slate-200/80 pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" /> Detailed Privacy Rules
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 max-w-3xl font-medium text-sm md:text-base leading-relaxed">
            At GetHotelStays, we value your privacy and trust. We want to be completely open with you about how we handle your personal data. Below is a detailed, comprehensive description of what we collect, how it is used, and how we protect it in simple words.
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
            {/* Section 1: Introduction */}
            <section id="introduction" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  1. About this Privacy Policy
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  This Privacy Policy applies to the website <strong>GetHotelStays</strong> (owned and operated by <strong>Aloria Group</strong>), our mobile layout, and all reservation and guest support services. It sets out the rules on how we gather, store, and manage your personal details.
                </p>
                <p>
                  By visiting our platform, creating a profile, or reserving accommodation, you agree to the terms described in this policy. If you do not agree with these rules, you should not use this website.
                </p>
              </div>
            </section>

            {/* Section 2: The Information We Collect */}
            <section id="collect" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  2. The Information We Collect
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We gather details to process bookings and give you a smooth check-in experience. We collect three types of information:
                </p>
                <div className="space-y-4 mt-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">A. Details You Share With Us</h4>
                    <p className="text-xs text-slate-500 mt-1">This includes your name, email ID, mobile phone number, login credentials (passwords are stored encrypted), and billing address. It also includes the names of other guests staying with you.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">B. Booking & Transaction Records</h4>
                    <p className="text-xs text-slate-500 mt-1">This includes details of the hotel you want to stay in, stay check-in/out dates, room selection, special requests, and details of the 12% deposit you pay online (transaction ID, payment method used, and amount paid).</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">C. Technical & Browser Usage Info</h4>
                    <p className="text-xs text-slate-500 mt-1">We automatically collect details like your device model, internet browser type, IP address (which indicates your general location), language selection, and which pages you clicked on when searching.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: How We Use Your Information */}
            <section id="use" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  3. How We Use Your Information
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We use your details to make sure you get the room you booked without any problems:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-slate-900">Making & Managing Bookings:</strong> To verify your room availability, lock your dates, collect your 12% deposit, and issue you a booking voucher.</li>
                  <li><strong className="text-slate-900">Hotel Coordination:</strong> To transmit the primary guest list to the hotel manager so your room is prepared.</li>
                  <li><strong className="text-slate-900">Customer Assistance:</strong> To help you modify or cancel bookings, handle refund requests, and answer support calls.</li>
                  <li><strong className="text-slate-900">Profile Management:</strong> To show your active wishlists, recent booking invoices, and account details in one place.</li>
                  <li><strong className="text-slate-900">Security Checks:</strong> To verify registrations, prevent double bookings, detect fake transactions, and stop spam or fraud.</li>
                </ul>
              </div>
            </section>

            {/* Section 4: When We Share Your Details */}
            <section id="sharing" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  4. When We Share Your Details
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We keep your data private. We never sell, rent, or lease your personal information to third-party marketing companies. We only share details in these specific cases:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-slate-900">With Host Hotels:</strong> We send the host hotel your name, phone number, stay dates, guest count, and any special requests you submitted. This is mandatory so they can check you in.
                  </li>
                  <li>
                    <strong className="text-slate-900">With Payment Partners:</strong> When paying the 12% deposit, we securely route transaction logs to verified payment processors (like Razorpay) to complete the checkout safely.
                  </li>
                  <li>
                    <strong className="text-slate-900">For Legal Reasons:</strong> We may share details if required by Indian law, a government order, or a court mandate to protect our legal rights, property, or customer safety.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5: How We Protect Your Data */}
            <section id="security" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  5. How We Protect Your Data
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We are committed to securing your data:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We use secure, encrypted internet connections (HTTPS/SSL) to transfer data between your browser and our servers.</li>
                  <li>We do not store your complete card details, PINs, or CVV codes on our servers. All payments are processed on secure pages managed by licensed gateways.</li>
                  <li>We restrict administrative access. Only authorized staff members can view booking details to resolve issues or help with support.</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Your Rights & Choice of Controls */}
            <section id="rights" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  6. Your Rights & Choice of Controls
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  You have full rights over how your personal details are kept:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-slate-900">Access & Edit:</strong> You can edit your profile information, password, and active wishlist at any time from your user profile dashboard.</li>
                  <li><strong className="text-slate-900">Delete Account:</strong> You can contact our support team to shut down your account. We will erase your personal profile data from our databases, except for payment history records that we must keep for legal or tax audits.</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Cookies & Tracking Settings */}
            <section id="cookies" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  7. Cookies & Tracking Settings
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We use cookies (small text files saved in your browser) to make our platform work faster and better. They help us:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Keep you logged in so you do not have to write your password on every page.</li>
                  <li>Remember your recent hotel searches, selected cities, and filter preferences.</li>
                  <li>Keep track of the hotels in your Wishlist.</li>
                </ul>
                <p>
                  You can choose to turn off cookies in your browser settings. However, doing so will sign you out and stop you from placing new bookings.
                </p>
              </div>
            </section>

            {/* Section 8: Children's Safety & External Links */}
            <section id="children" className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  8. Children's Safety & External Links
                </h2>
              </div>
              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  <strong>Children's Safety:</strong> Our website is designed for adults. We do not knowingly collect personal details from anyone under 18 years of age. If you are under 18, please make bookings through your parents or legal guardians.
                </p>
                <p>
                  <strong>External Links:</strong> Our pages may link to external websites (like local guide links or payment portals). We do not control their privacy policies. We encourage you to read their rules before sharing personal information on those websites.
                </p>
              </div>
            </section>

            {/* Section 9: Contact Information */}
            <section id="contact" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  9. Contact Us
                </h2>
              </div>
              <div className="text-slate-600 space-y-5 text-sm md:text-base leading-relaxed">
                <p>
                  If you have any questions, concerns, or complaints about how we protect your personal details, please reach out to our team at <strong>Aloria Group</strong>:
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 mb-4 font-semibold leading-relaxed">
                  <strong>Registered Address:</strong><br />
                  Dwarka Mor, Vipin Garden, New Delhi - 110059
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
