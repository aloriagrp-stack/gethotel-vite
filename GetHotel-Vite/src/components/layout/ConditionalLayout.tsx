

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlueWavesBackground from "@/components/home/BlueWavesBackground";
import CookieConsent from "@/components/common/CookieConsent";
import { paymentApi } from "@/lib/api";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = useLocation().pathname;
    const navigate = useNavigate();
    const isNoLayoutPage = pathname?.startsWith("/admin") || pathname?.startsWith("/partner-dashboard") || pathname === "/.controlhub" || pathname === "/list-property/register" || pathname === "/partner" || pathname === "/partner-select";
    const isNoFooterPage = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        const runAutoRecovery = async () => {
            const bookingIdStr = localStorage.getItem("active_checkout_booking_id");
            const bookingTimeStr = localStorage.getItem("active_checkout_booking_time");

            if (!bookingIdStr) return;

            const bookingId = parseInt(bookingIdStr);
            const bookingTime = bookingTimeStr ? parseInt(bookingTimeStr) : 0;

            // 1. Expire if older than 45 minutes
            if (Date.now() - bookingTime > 45 * 60 * 1000) {
                localStorage.removeItem("active_checkout_booking_id");
                localStorage.removeItem("active_checkout_booking_time");
                return;
            }

            // 2. Do not intercept if already on the details page (let the details page auto-verify handle it)
            if (pathname.includes(`/booking/details/${bookingId}`) || pathname.includes(`/bookings/details/${bookingId}`)) {
                return;
            }

            // 3. Prevent multiple calls in the same page session to avoid spamming
            const attemptedSessionKey = `auto_recovery_attempted_${bookingId}`;
            if (sessionStorage.getItem(attemptedSessionKey)) {
                return;
            }
            sessionStorage.setItem(attemptedSessionKey, "true");

            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            if (!token) return;

            try {
                console.log(`[Global Auto-Recovery] Checking payment status for booking ${bookingId}`);
                const res = await paymentApi.fetchPaymentStatus(bookingId);
                if (res.success) {
                    console.log(`[Global Auto-Recovery] Payment confirmed! Redirecting to booking confirmation.`);
                    localStorage.removeItem("active_checkout_booking_id");
                    localStorage.removeItem("active_checkout_booking_time");
                    
                    navigate(`/booking/details/${bookingId}?success=true`);
                } else {
                    console.log(`[Global Auto-Recovery] Booking is still pending/held.`);
                }
            } catch (err) {
                console.error("[Global Auto-Recovery] Error during status check:", err);
            }
        };

        runAutoRecovery();
    }, [pathname, navigate]);

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




