import type { Metadata } from "next";
import Payments from "@/pages-legacy/partner-dashboard/Payments";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Earnings & Payments | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Payments />
    </PartnerLayout>
  );
}
