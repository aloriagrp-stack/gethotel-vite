import type { Metadata } from "next";
import Notifications from "@/pages-legacy/partner-dashboard/Notifications";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Notifications | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Notifications />
    </PartnerLayout>
  );
}
