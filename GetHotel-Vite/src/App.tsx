import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { WishlistProvider } from "./context/WishlistContext";
import { StayModeProvider } from "./context/StayModeContext";
import ConditionalLayout from "./components/layout/ConditionalLayout";
import GlobalTranslator from "./components/layout/GlobalTranslator";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop";

import Loader from "./components/common/Loader";

// Loading Component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-transparent">
    <Loader variant="inline" />
  </div>
);

// Main Pages (Lazy Loaded)
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Hotels = lazy(() => import("./pages/Hotels"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ListProperty = lazy(() => import("./pages/ListProperty"));
const Booking = lazy(() => import("./pages/Booking"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const PartnerLanding = lazy(() => import("./pages/PartnerLanding"));
const ListPropertyRegister = lazy(() => import("./pages/ListPropertyRegister"));

// Destination Landing Pages
const GoaHotels = lazy(() => import("./pages/destinations/GoaHotels"));
const JaipurHotels = lazy(() => import("./pages/destinations/JaipurHotels"));
const ManaliHotels = lazy(() => import("./pages/destinations/ManaliHotels"));
const ShimlaHotels = lazy(() => import("./pages/destinations/ShimlaHotels"));
const UdaipurHotels = lazy(() => import("./pages/destinations/UdaipurHotels"));

// ID based pages
const BookingInvoice = lazy(() => import("./pages/BookingInvoice"));
const WriteReview = lazy(() => import("./pages/WriteReview"));
const ReviewBooking = lazy(() => import("./pages/ReviewBooking"));
const ReportBooking = lazy(() => import("./pages/ReportBooking"));
const BookingInvoiceDetails = lazy(() => import("./pages/BookingInvoiceDetails"));
const DisputeBooking = lazy(() => import("./pages/DisputeBooking"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));
const BookingIDPage = lazy(() => import("./pages/BookingIDPage"));

// Legal Pages
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));
const PricingPolicy = lazy(() => import("./pages/PricingPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin & Partner Layouts
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const PartnerLayout = lazy(() => import("./components/layout/PartnerLayout"));

// Admin Pages
const SuperAdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminHotelDetails = lazy(() => import("./pages/admin/AdminHotelDetails"));

// Partner Pages
const PartnerDashboard = lazy(() => import("./pages/partner-dashboard/Dashboard"));
const PartnerBookings = lazy(() => import("./pages/partner-dashboard/Bookings"));
const PartnerHotel = lazy(() => import("./pages/partner-dashboard/Hotel"));
const PartnerRooms = lazy(() => import("./pages/partner-dashboard/Rooms"));
const PartnerPayments = lazy(() => import("./pages/partner-dashboard/Payments"));
const PartnerCoupons = lazy(() => import("./pages/partner-dashboard/Coupons"));
const PartnerMessages = lazy(() => import("./pages/partner-dashboard/Messages"));
const PartnerReviews = lazy(() => import("./pages/partner-dashboard/Reviews"));
const PartnerSettings = lazy(() => import("./pages/partner-dashboard/Settings"));
const PartnerAnalytics = lazy(() => import("./pages/partner-dashboard/Analytics"));
const PartnerFrontDesk = lazy(() => import("./pages/partner-dashboard/FrontDesk"));
const PartnerInventory = lazy(() => import("./pages/partner-dashboard/Inventory"));
const PartnerNotifications = lazy(() => import("./pages/partner-dashboard/Notifications"));
const PartnerStaff = lazy(() => import("./pages/partner-dashboard/Staff"));
const PartnerChannelSync = lazy(() => import("./pages/partner-dashboard/ChannelSync"));
const PartnerHotelSelect = lazy(() => import("./pages/PartnerHotelSelect"));

export default function App() {
  useEffect(() => {
    try {
      sessionStorage.removeItem("chunk_reload_attempted");
    } catch (e) {
      // Ignore storage block errors
    }
  }, []);

  return (
    <HelmetProvider>
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <GlobalTranslator />
        <AuthProvider>
          <StayModeProvider>
            <BookingProvider>
              <WishlistProvider>
                <ConditionalLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Login />} />
                      <Route path="/hotels" element={<Hotels />} />
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

                      {/* Destination Landing Pages */}
                      <Route path="/goa-hotels" element={<GoaHotels />} />
                      <Route path="/jaipur-hotels" element={<JaipurHotels />} />
                      <Route path="/manali-hotels" element={<ManaliHotels />} />
                      <Route path="/shimla-hotels" element={<ShimlaHotels />} />
                      <Route path="/udaipur-hotels" element={<UdaipurHotels />} />
                      
                      {/* ID-based Routes */}
                      <Route path="/booking/invoice/:id" element={<BookingInvoice />} />
                      <Route path="/hotel/:id/write-review" element={<WriteReview />} />
                      <Route path="/bookings/review/:id" element={<ReviewBooking />} />
                      <Route path="/bookings/report/:id" element={<ReportBooking />} />
                      <Route path="/bookings/invoice/:id" element={<BookingInvoiceDetails />} />
                      <Route path="/bookings/dispute/:id" element={<DisputeBooking />} />
                      <Route path="/bookings/details/:id" element={<BookingDetails />} />
                      <Route path="/booking/details/:id" element={<BookingDetails />} />
                      <Route path="/booking/:id" element={<BookingIDPage />} />
                      
                      {/* Partner Dashboard Routes */}
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
                        <Route path="requests" element={<SuperAdminDashboard />} />
                        <Route path="controlhub" element={<SuperAdminDashboard />} />
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

                      {/* Fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ConditionalLayout>
              </WishlistProvider>
            </BookingProvider>
          </StayModeProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
    </HelmetProvider>
  );
}
