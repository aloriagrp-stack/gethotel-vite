import type { Metadata } from "next";
import HotelsDirectory from "@/pages-legacy/HotelsDirectory";

export const metadata: Metadata = {
  title: "Hotel Directory & Reception Desk Bank | GetHotelStays",
  description: "Browse verified hotel front desk phone numbers, direct manager contacts, and live Booking.com & MakeMyTrip rate comparisons across Delhi and top Indian destinations.",
  keywords: [
    "hotel directory",
    "delhi hotel contact numbers",
    "hotel phone numbers",
    "hotel reception desk",
    "booking com comparison",
    "makemytrip hotel comparison",
    "direct hotel contact"
  ],
  alternates: {
    canonical: "https://gethotelstays.com/hotels-directory",
  },
};

export default function Page() {
  return <HotelsDirectory />;
}

