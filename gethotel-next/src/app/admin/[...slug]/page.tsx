import type { Metadata } from "next";
import SuperAdminDashboard from "@/pages-legacy/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <SuperAdminDashboard />;
}
