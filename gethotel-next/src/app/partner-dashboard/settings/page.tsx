import type { Metadata } from "next";
import Settings from "@/pages-legacy/partner-dashboard/Settings";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Settings | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Settings />
    </PartnerLayout>
  );
}
