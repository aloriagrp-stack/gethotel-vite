import type { Metadata } from "next";
import ClientLoginPage from "@/pages-legacy/Login";

export const metadata: Metadata = {
  title: "Login or Sign Up | GetHotelStays — India's Hotel Booking Platform",
  description: "Sign in to GetHotelStays to manage your hotel bookings and view exclusive discounts.",
};

export default function Page() {
  return <ClientLoginPage />;
}
