import type { Metadata } from "next";
import CancellationPolicy from "@/pages-legacy/CancellationPolicy";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | GetHotelStays",
  description: "Detailed information on hotel booking cancellations, partial refunds, and 12% deposit terms.",
};

export default function Page() {
  return <CancellationPolicy />;
}
