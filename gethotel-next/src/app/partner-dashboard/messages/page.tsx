import type { Metadata } from "next";
import Messages from "@/pages-legacy/partner-dashboard/Messages";
import PartnerLayout from "@/components/layout/PartnerLayout";

export const metadata: Metadata = {
  title: "Guest Messages | GetHotelStays Partner",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <PartnerLayout>
      <Messages />
    </PartnerLayout>
  );
}
