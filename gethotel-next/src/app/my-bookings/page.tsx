import type { Metadata } from "next";
import ClientMyBookingsPage from "@/pages-legacy/MyBookings";

export const metadata: Metadata = {
  title: "My Bookings | GetHotelStays — Manage Your Hotel Reservations",
  description: "View and manage all your hotel bookings in one place. Download vouchers & invoices.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ClientMyBookingsPage />;
}
