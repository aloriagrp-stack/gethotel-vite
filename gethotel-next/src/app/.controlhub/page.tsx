import type { Metadata } from "next";
import ControlHubGateway from "@/pages-legacy/admin/ControlHubGateway";

export const metadata: Metadata = {
  title: "Super Admin ControlHub | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ControlHubGateway />;
}
