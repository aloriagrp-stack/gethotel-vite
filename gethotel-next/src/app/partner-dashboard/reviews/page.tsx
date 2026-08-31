import type { Metadata } from "next";
import Reviews from "@/pages-legacy/partner-dashboard/Reviews";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Guest Reviews | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Reviews />
    </PartnerLayout>
  );
}
