import type { Metadata } from "next";
import AdminLogin from "@/pages-legacy/AdminLogin";

export const metadata: Metadata = {
  title: "Super Admin Portal | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminLogin />;
}
