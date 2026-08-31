import type { Metadata } from "next";
import PartnerPageRouter from "@/components/partner/PartnerPageRouter";
import PartnerLayout from "@/components/layout/PartnerLayout";

export function generateStaticParams() {
  return [
    { slug: ["dashboard"] },
    { slug: ["bookings"] },
    { slug: ["hotel"] },
    { slug: ["rooms"] },
    { slug: ["inventory"] },
    { slug: ["payments"] },
    { slug: ["coupons"] },
    { slug: ["messages"] },
    { slug: ["reviews"] },
    { slug: ["channel"] },
    { slug: ["settings"] },
    { slug: ["staff"] },
    { slug: ["analytics"] },
    { slug: ["frontdesk"] },
    { slug: ["notifications"] }
  ];
}

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
