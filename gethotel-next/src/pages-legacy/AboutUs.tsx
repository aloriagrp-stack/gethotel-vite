'use client';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";

// Apple Emoji helper using authentic Apple asset CDN
const appleEmoji = (code: string) => `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${code}.png`;

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-white py-10 md:py-16 text-slate-800">
      <SEOHead
        title="About Us | GetHotelStays"
        description="Learn more about GetHotelStays, our mission, leadership, and our vision to make travel booking flexible, accessible, and seamless."
        keywords={["about us", "gethotelstays", "khushal chand aloria", "shriyansh aloria", "aloria group", "hotel booking platform"]}
      />

      <div className="container-page max-w-4xl mx-auto px-4 sm:px-6 space-y-14 md:space-y-20">
        
        {/* ─── 1. HERO SECTION ─── */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-left space-y-5 pt-2"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Making Travel Easier, <br className="hidden sm:inline" />
            <span className="text-brand-600">One Journey at a Time.</span>
          </h1>

          <div className="space-y-4 text-sm sm:text-base text-slate-600 font-normal leading-relaxed pt-2">
            <p>
              <strong className="text-slate-900 font-semibold">GetHotelStays</strong> is a growing hotel booking and travel platform built with a simple purpose: to make travel planning easier, hotel bookings more flexible and travel experiences more convenient.
            </p>
            <p>
              We believe that booking accommodation should not be complicated. Travellers should have the freedom to explore different properties, choose stays according to their needs and complete their bookings through a simple and reliable process.
            </p>
            <p>
              Our platform brings travellers and hotels together, helping people discover accommodation options for different occasions, travel plans and budgets. Whether someone is planning a short stay, a business trip, a family holiday or a longer journey, we aim to make finding and booking the right stay easier.
            </p>
            <p>
              At GetHotelStays, we are building more than just a hotel booking platform. We are working towards creating a connected travel ecosystem where people can discover, plan and book different parts of their journeys in one place.
            </p>
            <p className="text-slate-500">
              Starting with hotel bookings in India, our long-term vision is to expand into international markets and bring more travel services, including tours, experiences and flight bookings, to our platform. We are driven by technology, customer convenience and the belief that travel booking can always become better.
            </p>
          </div>
        </motion.section>

        {/* ─── 2. OUR STORY ─── */}
        <section className="border-t border-slate-100 pt-10 md:pt-14 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img src={appleEmoji('1f4d6')} alt="Story" className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Our Story</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              A Vision Built on Experience and Technology
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            <p>
              Every business starts with an idea. GetHotelStays started with a vision to build a better and more flexible way for people to book their stays and plan their travels.
            </p>
            <p>
              Our story brings together two important things: years of experience in the travel and hospitality industry and a strong interest in technology, innovation and business development.
            </p>
            <p>
              The idea behind GetHotelStays comes from the long-standing vision of our Co-Founder, <strong className="text-slate-900 font-semibold">Khushal Chand Aloria</strong>, who has spent years connected with the travel and hotel industry. Over time, he developed a vision of building an independent online travel platform that could offer travellers a better booking experience and grow into a recognised name in the industry.
            </p>
            <p>
              The goal was not simply to create another booking website. It was to build a platform that could compete in a changing travel industry, understand the needs of modern travellers and offer solutions that make hotel bookings easier and more flexible.
            </p>
            <p>
              As the next generation became ready to take an active role in the business, this vision found an opportunity to move forward. With a shared interest in building something meaningful, the experience of the hospitality industry and a technology-focused approach came together.
            </p>
            <p>
              <strong className="text-slate-900 font-semibold">Shriyansh Aloria</strong>, our Co-Founder and CEO, took an active role in building the platform and turning the idea into a working business.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm text-slate-700 flex items-center gap-3">
              <img src={appleEmoji('1f680')} alt="Launch" className="w-5 h-5 shrink-0 object-contain" />
              <span>
                In <strong className="text-slate-900 font-semibold">April 2026</strong>, GetHotelStays officially began its journey. Today, we are focused on strengthening our presence across India, expanding our hotel network and continuously improving the platform.
              </span>
            </div>
          </div>
        </section>

        {/* ─── 3. WHAT WE DO ─── */}
        <section className="border-t border-slate-100 pt-10 md:pt-14 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img src={appleEmoji('1f9ed')} alt="Compass" className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">What We Do</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bringing Hotel Bookings and Travel Services Together
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              GetHotelStays is focused on making it easier for people to discover, compare and book travel-related services through one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* 1. Hotel Bookings */}
            <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3 bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <img src={appleEmoji('1f3e8')} alt="Hotel" className="w-6 h-6 object-contain shrink-0" />
                <h3 className="text-base font-bold text-slate-900">1. Hotel Bookings</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Hotel bookings are at the heart of GetHotelStays. We connect travellers with hotels across cities and destinations, giving them the ability to explore properties from budget-friendly stays to premium accommodation with complete clarity.
              </p>
            </div>

            {/* 2. Flexible Stay Options */}
            <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3 bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <img src={appleEmoji('1f55b')} alt="Clock" className="w-6 h-6 object-contain shrink-0" />
                <h3 className="text-base font-bold text-slate-900">2. Flexible Stay Options</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Not every traveller needs a room for an entire day. Whether someone needs accommodation for a few hours, overnight, or for a multi-day holiday, we make different types of stays accessible through flexible booking.
              </p>
            </div>

            {/* 3. Flexible Payment Options */}
            <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3 bg-white hover:border-slate-300 transition-colors md:col-span-2">
              <div className="flex items-center gap-3">
                <img src={appleEmoji('1f4b3')} alt="Payment" className="w-6 h-6 object-contain shrink-0" />
                <h3 className="text-base font-bold text-slate-900">3. Flexible Payment Options</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                We understand that payment flexibility can make a difference when booking a hotel. GetHotelStays offers eligible travellers two payment options:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">Pay 12% Now, Remaining at Hotel</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Confirm an eligible booking by paying just 12% online. The remaining 88% is paid directly to the hotel during check-in.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">Pay 100% Online</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Travellers who prefer completing payment online can pay the full booking amount at the time of reservation.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Tours & Travel Experiences */}
            <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3 bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <img src={appleEmoji('1f5fa-fe0f')} alt="Tours" className="w-6 h-6 object-contain shrink-0" />
                <h3 className="text-base font-bold text-slate-900">4. Tours & Travel Experiences</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Travel is about exploring destinations, experiencing cultures and creating memories. We aim to bring activities, local tours and travel experiences directly into the platform.
              </p>
            </div>

            {/* 5. Flight Bookings */}
            <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3 bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <img src={appleEmoji('2708-fe0f')} alt="Flights" className="w-6 h-6 object-contain shrink-0" />
                <h3 className="text-base font-bold text-slate-900">5. Flight Bookings</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Flights are an important part of travel plans. Our long-term vision includes flight bookings so travellers can manage their complete journey through the GetHotelStays ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 4. WHY CHOOSE GETHOTELSTAYS? ─── */}
        <section className="border-t border-slate-100 pt-10 md:pt-14 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img src={appleEmoji('2728')} alt="Sparkle" className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Why Choose Us</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Built Around Convenience, Flexibility and Better Experiences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200/70 rounded-2xl space-y-2 bg-white">
              <span className="text-xs font-bold text-slate-900 block">Flexible Payment Choices</span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Pay 12% online and 88% at the hotel on eligible bookings, or complete payment in advance with full online payment.
              </p>
            </div>

            <div className="p-4 border border-slate-200/70 rounded-2xl space-y-2 bg-white">
              <span className="text-xs font-bold text-slate-900 block">Stays for Different Needs</span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Whether a business trip, family vacation or weekend getaway, accommodation options suit different travel purposes.
              </p>
            </div>

            <div className="p-4 border border-slate-200/70 rounded-2xl space-y-2 bg-white">
              <span className="text-xs font-bold text-slate-900 block">Simple Booking Experience</span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Explore available properties, understand your options and complete reservations without unnecessary steps.
              </p>
            </div>

            <div className="p-4 border border-slate-200/70 rounded-2xl space-y-2 bg-white">
              <span className="text-xs font-bold text-slate-900 block">Technology at the Core</span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Continuous platform innovation, automated receipts and modern digital interfaces made for speed and simplicity.
              </p>
            </div>

            <div className="p-4 border border-slate-200/70 rounded-2xl space-y-2 bg-white">
              <span className="text-xs font-bold text-slate-900 block">Growing Network of Hotels</span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Building a strong hotel network across India and gradually expanding reach with verified quality partners.
              </p>
            </div>

            <div className="p-4 border border-slate-200/70 rounded-2xl space-y-2 bg-white">
              <span className="text-xs font-bold text-slate-900 block">A Wider Travel Vision</span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Growing into a connected travel ecosystem bringing accommodation, flights, tours and experiences in one place.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 5. TECHNOLOGY & COMMITMENT DUAL SECTION ─── */}
        <section className="border-t border-slate-100 pt-10 md:pt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Approach to Technology */}
          <div className="border border-slate-200/80 rounded-2xl p-6 space-y-4 bg-white flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={appleEmoji('1f4bb')} alt="Technology" className="w-5 h-5 object-contain" />
                <h3 className="text-lg font-bold text-slate-900">Our Approach to Technology</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                We approach technology as a key part of our business. Our focus is on building a platform that can grow, adapt and improve:
              </p>
              <ul className="space-y-2 text-xs text-slate-600 font-normal">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  Simple and user-friendly booking processes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  Flexible booking and payment options
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  Better ways to discover accommodation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  Scalable systems that support future growth
                </li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Make travel booking easier through better digital solutions.
            </div>
          </div>

          {/* Commitment to Travellers */}
          <div className="border border-slate-200/80 rounded-2xl p-6 space-y-4 bg-white flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={appleEmoji('1f91d')} alt="Commitment" className="w-5 h-5 object-contain" />
                <h3 className="text-lg font-bold text-slate-900">Our Commitment to Travellers</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Every booking represents someone&apos;s plan, purpose or experience—a family holiday, business meeting, or personal trip.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                We believe that trust is an important part of every booking. Clear information, transparent payment details and accessible support are essential to creating a better experience.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Focusing on convenience, consistency and service quality.
            </div>
          </div>
        </section>

        {/* ─── 6. PARTNERSHIP WITH HOTELS ─── */}
        <section className="border-t border-slate-100 pt-10 md:pt-14 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img src={appleEmoji('1f91d')} alt="Partnership" className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Our Partnership with Hotels</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Growing Together with the Hospitality Industry
            </h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed font-normal">
            <p>
              Hotels are an important part of the travel ecosystem. Behind every successful travel experience, there is a hospitality business working to provide accommodation and services to its guests.
            </p>
            <p>
              At GetHotelStays, our platform aims to help properties improve their online presence, reach more travellers and become part of a growing digital booking network. As we expand our network across India, we look forward to building long-term relationships based on growth and mutual value.
            </p>
          </div>
        </section>

        {/* ─── 7. MISSION & VISION (MINIMAL CLEAN) ─── */}
        <section className="border-t border-slate-100 pt-10 md:pt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border border-slate-200/80 rounded-2xl p-6 space-y-3 bg-white">
            <div className="flex items-center gap-2.5">
              <img src={appleEmoji('1f3af')} alt="Mission" className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Our Mission</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Making Travel More Accessible & Convenient</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              To make travel easier for everyone by offering convenient booking options, flexible payment choices and a simple digital experience that reduces complications in planning accommodation.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-2xl p-6 space-y-3 bg-white">
            <div className="flex items-center gap-2.5">
              <img src={appleEmoji('1f310')} alt="Vision" className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Our Vision</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Building a Global Travel Platform</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Starting in India with a strong hotel network and expanding into international destinations, uniting hotels, flights, tours and experiences in one seamless platform.
            </p>
          </div>
        </section>

        {/* ─── 8. MEET OUR FOUNDERS ─── */}
        <section className="border-t border-slate-100 pt-10 md:pt-14 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img src={appleEmoji('1f465')} alt="Founders" className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Leadership</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Meet Our Founders
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              The people behind GetHotelStays, combining hospitality industry experience with modern technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Khushal Chand Aloria */}
            <div className="border border-slate-200/80 rounded-2xl p-6 space-y-4 bg-white flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <img src={appleEmoji('1f3e8')} alt="Khushal Chand Aloria" className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Khushal Chand Aloria</h3>
                    <p className="text-xs text-brand-600 font-semibold">Co-Founder</p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 font-normal">
                  <p>
                    With years of experience in the travel and hospitality industry, Khushal Chand Aloria brings valuable industry knowledge and understanding to GetHotelStays.
                  </p>
                  <p>
                    His long-standing vision of building an independent online travel platform has been one of the key inspirations behind the company, laying the foundation upon which GetHotelStays operates.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Hospitality Experience • Strategic Guidance
              </div>
            </div>

            {/* Shriyansh Aloria */}
            <div className="border border-slate-200/80 rounded-2xl p-6 space-y-4 bg-white flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <img src={appleEmoji('1f4bb')} alt="Shriyansh Aloria" className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Shriyansh Aloria</h3>
                    <p className="text-xs text-brand-600 font-semibold">Co-Founder & CEO</p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 font-normal">
                  <p>
                    Shriyansh Aloria leads GetHotelStays with a strong interest in technology, innovation and business growth. As a technology enthusiast, he actively leads product engineering and digital architecture.
                  </p>
                  <p>
                    His focus is on combining technology with practical business ideas to create a travel platform that is simple, flexible and ready for future growth.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Technology Enthusiast • Platform Architecture & CEO
              </div>
            </div>
          </div>
        </section>

        {/* ─── 9. PART OF ALORIA GROUP ─── */}
        <section className="border-t border-slate-100 pt-8 flex items-start gap-3 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          <img src={appleEmoji('1f3e2')} alt="Company" className="w-5 h-5 shrink-0 object-contain mt-0.5" />
          <p>
            <strong className="text-slate-800 font-semibold">Part of Aloria Group:</strong> GetHotelStays is part of Aloria Group, a growing business group founded in 2025 with interests across different industries. GetHotelStays represents the group&apos;s presence in the travel and hospitality sector.
          </p>
        </section>

        {/* ─── 10. LOOKING AHEAD & FINAL CTA ─── */}
        <section className="border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-5 bg-slate-50/50">
          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Looking Ahead</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Let&apos;s Make Your Next Journey Better.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              Whether you are planning a short stay, a business trip, a family holiday or your next adventure, GetHotelStays makes booking easier.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-700 tracking-wider">
            DISCOVER • BOOK • STAY • TRAVEL
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs"
            >
              Explore Hotels
            </Link>
            <Link
              to="/contact-us"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
            >
              Contact Us
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
