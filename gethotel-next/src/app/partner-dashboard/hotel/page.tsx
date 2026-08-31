import type { Metadata } from "next";
import Hotel from "@/pages-legacy/partner-dashboard/Hotel";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Property Info | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Hotel />
    </PartnerLayout>
  );
}
