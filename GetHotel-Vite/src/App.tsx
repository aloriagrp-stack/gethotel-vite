import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { WishlistProvider } from "./context/WishlistContext";
import { StayModeProvider } from "./context/StayModeContext";
import { LocaleProvider, useLocale, languages } from "./context/LocaleContext";
import LanguageRedirector from "./components/common/LanguageRedirector";
import ConditionalLayout from "./components/layout/ConditionalLayout";
import GlobalTranslator from "./components/layout/GlobalTranslator";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop";
import Loader from "./components/common/Loader";

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-transparent">
    <Loader variant="inline" />
  </div>
);

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Hotels = lazy(() => import("./pages/Hotels"));
const Flights = lazy(() => import("./pages/Flights"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ListProperty = lazy(() => import("./pages/ListProperty"));
const Booking = lazy(() => import("./pages/Booking"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const PartnerLanding = lazy(() => import("./pages/PartnerLanding"));
const ListPropertyRegister = lazy(() => import("./pages/ListPropertyRegister"));

const GoaHotels = lazy(() => import("./pages/destinations/GoaHotels"));
const JaipurHotels = lazy(() => import("./pages/destinations/JaipurHotels"));
const ManaliHotels = lazy(() => import("./pages/destinations/ManaliHotels"));
const ShimlaHotels = lazy(() => import("./pages/destinations/ShimlaHotels"));
const UdaipurHotels = lazy(() => import("./pages/destinations/UdaipurHotels"));
const DelhiHotels = lazy(() => import("./pages/destinations/DelhiHotels"));
const CityPage = lazy(() => import("./pages/destinations/CityPage"));

const BookingInvoice = lazy(() => import("./pages/BookingInvoice"));
const WriteReview = lazy(() => import("./pages/WriteReview"));
const ReviewBooking = lazy(() => import("./pages/ReviewBooking"));
const ReportBooking = lazy(() => import("./pages/ReportBooking"));
const BookingInvoiceDetails = lazy(() => import("./pages/BookingInvoiceDetails"));
const DisputeBooking = lazy(() => import("./pages/DisputeBooking"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));
const BookingIDPage = lazy(() => import("./pages/BookingIDPage"));

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));
const PricingPolicy = lazy(() => import("./pages/PricingPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const TourPackages = lazy(() => import("./pages/TourPackages"));
const TourPackageDetails = lazy(() => import("./pages/TourPackageDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const PartnerLayout = lazy(() => import("./components/layout/PartnerLayout"));

const SuperAdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminHotelDetails = lazy(() => import("./pages/admin/AdminHotelDetails"));
const AdminPackages = lazy(() => import("./pages/admin/AdminPackages"));

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
function LocalizedLayout() {
  const { lang } = useParams();
  const { langCode, changeLanguage } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  // Guard: if the :lang param is NOT a valid language code, redirect with prefix
  const isValidLang = languages.some(l => l.code === lang);

  useEffect(() => {
    if (!isValidLang) {
      // The URL doesn't have a valid language prefix (e.g. /hotel/xyz instead of /en/hotel/xyz)
      const targetLang = langCode || localStorage.getItem("user-language") || "en";
      const newPath = `/${targetLang}${location.pathname}${location.search}${location.hash}`;
      navigate(newPath, { replace: true });
      return;
    }

    if (lang && lang !== langCode) {
      changeLanguage(lang, false); // sync state without navigation loop
    }
  }, [lang, langCode, changeLanguage, isValidLang, navigate, location]);

  if (!isValidLang) return null; // Don't render children while redirecting

  return <Outlet />;
}

import { CartProvider } from "./context/CartContext";

export default function App() {
  useEffect(() => {
    try {
      sessionStorage.removeItem("chunk_reload_attempted");
    } catch (e) {}
  }, []);

  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ScrollToTop />
        <GlobalTranslator />
        <AuthProvider>
          <CartProvider>
            <StayModeProvider>
              <BookingProvider>
                <WishlistProvider>
                  <ConditionalLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Root Redirector */}
                      <Route path="/" element={<LanguageRedirector />} />

                      {/* Localized routes group */}
                      <Route path="/:lang" element={<LocalizedLayout />}>
                        <Route index element={<Home />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Login />} />
                        <Route path="hotels" element={<Hotels />} />
                        <Route path="flights" element={<Flights />} />
                        <Route path="packages" element={<TourPackages />} />
                        <Route path="packages/:id" element={<TourPackageDetails />} />
                        <Route path="tour-packages" element={<TourPackages />} />
                        <Route path="tour-packages/:id" element={<TourPackageDetails />} />
                        <Route path="hotel/:id" element={<HotelDetails />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="my-bookings" element={<MyBookings />} />
                        <Route path="list-property" element={<ListProperty />} />
                        <Route path="list-property/register" element={<ListPropertyRegister />} />
                        <Route path="booking" element={<Booking />} />
                        <Route path="booking/:id" element={<BookingIDPage />} />
                        <Route path="partner" element={<PartnerLanding />} />
                        <Route path="partner-select" element={<PartnerHotelSelect />} />
                        <Route path=".controlhub" element={<AdminLogin />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="terms-&-conditions" element={<TermsOfService />} />
                        <Route path="cookies" element={<CookiePolicy />} />
                        <Route path="cancellation-policy" element={<CancellationPolicy />} />
                        <Route path="pricing-policy" element={<PricingPolicy />} />
                        <Route path="contact" element={<ContactUs />} />
                        <Route path="goa-hotels" element={<GoaHotels />} />
                        <Route path="jaipur-hotels" element={<JaipurHotels />} />
                        <Route path="manali-hotels" element={<ManaliHotels />} />
                        <Route path="shimla-hotels" element={<ShimlaHotels />} />
                        <Route path="udaipur-hotels" element={<UdaipurHotels />} />
                        <Route path="delhi-hotels" element={<DelhiHotels />} />
                        <Route path="hotels-in/:citySlug" element={<CityPage />} />
                        <Route path="hotels-in/:citySlug/:filterSlug" element={<CityPage />} />
                        <Route path="booking/invoice/:id" element={<BookingInvoice />} />
                        <Route path="hotel/:id/write-review" element={<WriteReview />} />
                        <Route path="bookings/review/:id" element={<ReviewBooking />} />
                        <Route path="bookings/report/:id" element={<ReportBooking />} />
                        <Route path="bookings/invoice/:id" element={<BookingInvoiceDetails />} />
                        <Route path="bookings/dispute/:id" element={<DisputeBooking />} />
                        <Route path="bookings/details/:id" element={<BookingDetails />} />
                        <Route path="booking/details/:id" element={<BookingDetails />} />
                        
                        <Route path="partner-dashboard" element={<PartnerLayout />}>
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
                        
                        <Route path="admin/super" element={<AdminLayout />}>
                          <Route index element={<SuperAdminDashboard />} />
                          <Route path="tour-packages" element={<AdminPackages />} />
                          <Route path="packages" element={<AdminPackages />} />
                          <Route path="ai-chats" element={<SuperAdminDashboard />} />
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
                        
                        <Route path="*" element={<NotFound />} />
                      </Route>
                      
                      {/* Wildcard redirector for un-prefixed paths */}
                      <Route path="*" element={<LanguageRedirector fallback />} />
                    </Routes>
                  </Suspense>
                </ConditionalLayout>
              </WishlistProvider>
            </BookingProvider>
          </StayModeProvider>
        </CartProvider>
      </AuthProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
