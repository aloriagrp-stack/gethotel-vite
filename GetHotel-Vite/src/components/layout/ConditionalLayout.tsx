

import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlueWavesBackground from "@/components/home/BlueWavesBackground";
import CookieConsent from "@/components/common/CookieConsent";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = useLocation().pathname;
    const isNoLayoutPage = pathname?.startsWith("/admin") || pathname?.startsWith("/partner-dashboard") || pathname === "/.controlhub" || pathname === "/list-property/register" || pathname === "/partner" || pathname === "/partner-select";
    const isNoFooterPage = pathname === "/login" || pathname === "/register";

    if (isNoLayoutPage) {
        return <main className="relative z-10">{children}</main>;
    }

    return (
        <>
            <Navbar />
            <div className="relative min-h-screen">
                <BlueWavesBackground />
                <main className="relative">{children}</main>
            </div>
            {!isNoFooterPage && <Footer />}
            <CookieConsent />
        </>
    );
}




