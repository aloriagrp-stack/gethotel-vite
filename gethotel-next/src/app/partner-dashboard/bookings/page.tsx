import type { Metadata } from "next";
import Bookings from "@/pages-legacy/partner-dashboard/Bookings";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Partner Bookings | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Bookings />
    </PartnerLayout>
  );
}
