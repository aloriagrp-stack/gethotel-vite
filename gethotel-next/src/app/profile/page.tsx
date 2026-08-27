import type { Metadata } from "next";
import ClientProfilePage from "@/pages-legacy/Profile";

export const metadata: Metadata = {
  title: "My Profile & Account Settings | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ClientProfilePage />;
}
