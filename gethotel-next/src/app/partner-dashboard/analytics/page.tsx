import type { Metadata } from "next";
import Analytics from "@/pages-legacy/partner-dashboard/Analytics";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Analytics | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Analytics />
    </PartnerLayout>
  );
}
