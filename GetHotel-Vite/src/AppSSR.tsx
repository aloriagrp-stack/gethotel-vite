import { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { WishlistProvider } from "./context/WishlistContext";
import { StayModeProvider } from "./context/StayModeContext";
import ConditionalLayout from "./components/layout/ConditionalLayout";
import GlobalTranslator from "./components/layout/GlobalTranslator";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop";
import Loader from "./components/common/Loader";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import MyBookings from "./pages/MyBookings";
import ListProperty from "./pages/ListProperty";
import Booking from "./pages/Booking";
import AdminLogin from "./pages/AdminLogin";
import PartnerLanding from "./pages/PartnerLanding";
import ListPropertyRegister from "./pages/ListPropertyRegister";

import GoaHotels from "./pages/destinations/GoaHotels";
import JaipurHotels from "./pages/destinations/JaipurHotels";
import ManaliHotels from "./pages/destinations/ManaliHotels";
import ShimlaHotels from "./pages/destinations/ShimlaHotels";
import UdaipurHotels from "./pages/destinations/UdaipurHotels";
import DelhiHotels from "./pages/destinations/DelhiHotels";
import CityPage from "./pages/destinations/CityPage";

import BookingInvoice from "./pages/BookingInvoice";
import WriteReview from "./pages/WriteReview";
import ReviewBooking from "./pages/ReviewBooking";
import ReportBooking from "./pages/ReportBooking";
import BookingInvoiceDetails from "./pages/BookingInvoiceDetails";
import DisputeBooking from "./pages/DisputeBooking";
import BookingDetails from "./pages/BookingDetails";
import BookingIDPage from "./pages/BookingIDPage";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import PricingPolicy from "./pages/PricingPolicy";
import ContactUs from "./pages/ContactUs";
import TourPackages from "./pages/TourPackages";
import TourPackageDetails from "./pages/TourPackageDetails";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/layout/AdminLayout";
import PartnerLayout from "./components/layout/PartnerLayout";

import SuperAdminDashboard from "./pages/admin/AdminDashboard";
import AdminHotelDetails from "./pages/admin/AdminHotelDetails";

import PartnerDashboard from "./pages/partner-dashboard/Dashboard";
import PartnerBookings from "./pages/partner-dashboard/Bookings";
import PartnerHotel from "./pages/partner-dashboard/Hotel";
import PartnerRooms from "./pages/partner-dashboard/Rooms";
import PartnerPayments from "./pages/partner-dashboard/Payments";
import PartnerCoupons from "./pages/partner-dashboard/Coupons";
import PartnerMessages from "./pages/partner-dashboard/Messages";
import PartnerReviews from "./pages/partner-dashboard/Reviews";
import PartnerSettings from "./pages/partner-dashboard/Settings";
import PartnerAnalytics from "./pages/partner-dashboard/Analytics";
import PartnerFrontDesk from "./pages/partner-dashboard/FrontDesk";
import PartnerInventory from "./pages/partner-dashboard/Inventory";
import PartnerNotifications from "./pages/partner-dashboard/Notifications";
import PartnerStaff from "./pages/partner-dashboard/Staff";
import PartnerChannelSync from "./pages/partner-dashboard/ChannelSync";
import PartnerHotelSelect from "./pages/PartnerHotelSelect";

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-transparent">
    <Loader variant="inline" />
  </div>
);

export default function AppSSR() {
  useEffect(() => {
    try {
      sessionStorage.removeItem("chunk_reload_attempted");
    } catch (e) {}
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <GlobalTranslator />
      <AuthProvider>
        <StayModeProvider>
          <BookingProvider>
            <WishlistProvider>
              <ConditionalLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Login />} />
                    <Route path="/hotels" element={<Hotels />} />
                    <Route path="/packages" element={<TourPackages />} />
                    <Route path="/packages/:id" element={<TourPackageDetails />} />
                    <Route path="/tour-packages" element={<TourPackages />} />
                    <Route path="/tour-packages/:id" element={<TourPackageDetails />} />
                    <Route path="/hotel/:id" element={<HotelDetails />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/list-property" element={<ListProperty />} />
                    <Route path="/list-property/register" element={<ListPropertyRegister />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/booking/:id" element={<BookingIDPage />} />
                    <Route path="/partner" element={<PartnerLanding />} />
                    <Route path="/partner-select" element={<PartnerHotelSelect />} />
                    <Route path="/.controlhub" element={<AdminLogin />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms-&-conditions" element={<TermsOfService />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                    <Route path="/pricing-policy" element={<PricingPolicy />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/goa-hotels" element={<GoaHotels />} />
                    <Route path="/jaipur-hotels" element={<JaipurHotels />} />
                    <Route path="/manali-hotels" element={<ManaliHotels />} />
                    <Route path="/shimla-hotels" element={<ShimlaHotels />} />
                    <Route path="/udaipur-hotels" element={<UdaipurHotels />} />
                    <Route path="/delhi-hotels" element={<DelhiHotels />} />
                    <Route path="/hotels-in/:citySlug" element={<CityPage />} />
                    <Route path="/hotels-in/:citySlug/:filterSlug" element={<CityPage />} />
                    <Route path="/booking/invoice/:id" element={<BookingInvoice />} />
                    <Route path="/hotel/:id/write-review" element={<WriteReview />} />
                    <Route path="/bookings/review/:id" element={<ReviewBooking />} />
                    <Route path="/bookings/report/:id" element={<ReportBooking />} />
                    <Route path="/bookings/invoice/:id" element={<BookingInvoiceDetails />} />
                    <Route path="/bookings/dispute/:id" element={<DisputeBooking />} />
                    <Route path="/bookings/details/:id" element={<BookingDetails />} />
                    <Route path="/booking/details/:id" element={<BookingDetails />} />
                    <Route path="/partner-dashboard" element={<PartnerLayout />}>
                      <Route index element={<PartnerDashboard />} />
                      <Route path="bookings" element={<PartnerBookings />} />
                      <Route path="hotel" element={<PartnerHotel />} />
                      <Route path="rooms" element={<PartnerRooms />} />
                      <Route path="payments" element={<PartnerPayments />} />
                      <Route path="coupons" element={<PartnerCoupons />} />
                      <Route path="messages" element={<PartnerMessages />} />
                      <Route path="reviews" element={<PartnerReviews />} />
                      <Route path="settings" element={<PartnerSettings />} />
                      <Route path="analytics" element={<PartnerAnalytics />} />
                      <Route path="frontdesk" element={<PartnerFrontDesk />} />
                      <Route path="inventory" element={<PartnerInventory />} />
                      <Route path="notifications" element={<PartnerNotifications />} />
                      <Route path="staff" element={<PartnerStaff />} />
                      <Route path="channel" element={<PartnerChannelSync />} />
                    </Route>
                    <Route path="/admin/super" element={<AdminLayout />}>
                      <Route index element={<SuperAdminDashboard />} />
                      <Route path="tour-packages" element={<SuperAdminDashboard />} />
                      <Route path="requests" element={<SuperAdminDashboard />} />
                      <Route path="controlhub" element={<SuperAdminDashboard />} />
                      <Route path="ai-chats" element={<SuperAdminDashboard />} />
                      <Route path="hotels" element={<SuperAdminDashboard />} />
                      <Route path="multi-room" element={<SuperAdminDashboard />} />
                      <Route path="ai-copilot" element={<SuperAdminDashboard />} />
                      <Route path="hotels/:id" element={<AdminHotelDetails />} />
                      <Route path="bookings" element={<SuperAdminDashboard />} />
                      <Route path="reviews" element={<SuperAdminDashboard />} />
                      <Route path="users" element={<SuperAdminDashboard />} />
                      <Route path="stats" element={<SuperAdminDashboard />} />
                      <Route path="finance" element={<SuperAdminDashboard />} />
                      <Route path="disputes" element={<SuperAdminDashboard />} />
                      <Route path="notifications" element={<SuperAdminDashboard />} />
                      <Route path="settings" element={<SuperAdminDashboard />} />
                      <Route path="homepage" element={<SuperAdminDashboard />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ConditionalLayout>
            </WishlistProvider>
          </BookingProvider>
        </StayModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
