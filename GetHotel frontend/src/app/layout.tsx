import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import "./globals.css";
import BlueWavesBackground from "@/components/home/BlueWavesBackground";
import GlobalTranslator from "@/components/layout/GlobalTranslator";

// Modern premium sans — now used globally for a clean, consistent look
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GetHotel — Book Premium Hotels in India",
    template: "%s | GetHotel",
  },
  description:
    "Discover and book the best hotels, resorts, and boutique stays across India. Compare prices, read reviews, and secure your perfect stay with GetHotel.",
  keywords: ["hotel booking", "India hotels", "travel", "stay", "resorts", "best hotels"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://gethotel.in",
    siteName: "GetHotel",
    title: "GetHotel — Book Premium Hotels in India",
    description:
      "Discover and book the best hotels, resorts, and boutique stays across India.",
  },
};

import ConditionalLayout from "@/components/layout/ConditionalLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="font-sans bg-white text-slate-900 antialiased overflow-x-hidden">
        <GlobalTranslator />
        <AuthProvider>
          <BookingProvider>
            <WishlistProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </WishlistProvider>
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
