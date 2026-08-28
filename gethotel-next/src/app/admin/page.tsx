import type { Metadata } from "next";
import SuperAdminDashboard from "@/pages-legacy/admin/AdminDashboard";
import AdminLayout from "@/components/layout/AdminLayout";

export const metadata: Metadata = {
  title: "Super Admin Command Center | GetHotelStays",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <AdminLayout>
      <SuperAdminDashboard />
    </AdminLayout>
  );
}
