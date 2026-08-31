import type { Metadata } from "next";
import PartnerPageRouter from "@/components/partner/PartnerPageRouter";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Partner Operations Dashboard | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <PartnerPageRouter />
    </PartnerLayout>
  );
}
