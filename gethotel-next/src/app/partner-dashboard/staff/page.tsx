import type { Metadata } from "next";
import Staff from "@/pages-legacy/partner-dashboard/Staff";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Staff Management | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Staff />
    </PartnerLayout>
  );
}
