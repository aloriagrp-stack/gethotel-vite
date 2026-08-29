'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ClientNotFound = dynamic(() => import('@/pages-legacy/NotFound'), { ssr: false });
const TourPackages = dynamic(() => import('@/pages-legacy/TourPackages'), { ssr: false });
const TourPackageDetails = dynamic(() => import('@/pages-legacy/TourPackageDetails'), { ssr: false });
const Hotels = dynamic(() => import('@/pages-legacy/Hotels'), { ssr: false });
const HotelDetailContent = dynamic(() => import('@/pages-legacy/HotelDetailContent'), { ssr: false });
const Flights = dynamic(() => import('@/pages-legacy/Flights'), { ssr: false });
const MyBookings = dynamic(() => import('@/pages-legacy/MyBookings'), { ssr: false });
const Profile = dynamic(() => import('@/pages-legacy/Profile'), { ssr: false });
const Wishlist = dynamic(() => import('@/pages-legacy/Wishlist'), { ssr: false });
const ListProperty = dynamic(() => import('@/pages-legacy/ListProperty'), { ssr: false });
const Login = dynamic(() => import('@/pages-legacy/Login'), { ssr: false });
const ContactUs = dynamic(() => import('@/pages-legacy/ContactUs'), { ssr: false });
const PrivacyPolicy = dynamic(() => import('@/pages-legacy/PrivacyPolicy'), { ssr: false });
const TermsOfService = dynamic(() => import('@/pages-legacy/TermsOfService'), { ssr: false });
const CancellationPolicy = dynamic(() => import('@/pages-legacy/CancellationPolicy'), { ssr: false });
const CookiePolicy = dynamic(() => import('@/pages-legacy/CookiePolicy'), { ssr: false });
const PricingPolicy = dynamic(() => import('@/pages-legacy/PricingPolicy'), { ssr: false });

const SUPPORTED_LANGS = new Set([
  'en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'ru', 'pt',
  'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'
]);

export default function NotFound() {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    let path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const segments = path.split('/').filter(Boolean);

    // Strip leading language prefix if present
    if (segments.length > 0 && SUPPORTED_LANGS.has(segments[0])) {
      segments.shift();
    }

    const cleanPath = '/' + segments.join('/');

    if (cleanPath.startsWith('/packages/') || cleanPath.startsWith('/tour-packages/')) {
      setComponent(() => TourPackageDetails);
    } else if (cleanPath === '/packages' || cleanPath === '/tour-packages') {
      setComponent(() => TourPackages);
    } else if (cleanPath.startsWith('/hotel/')) {
      setComponent(() => HotelDetailContent);
    } else if (cleanPath === '/hotels' || cleanPath.endsWith('-hotels') || cleanPath.startsWith('/hotels/')) {
      setComponent(() => Hotels);
    } else if (cleanPath === '/flights') {
      setComponent(() => Flights);
    } else if (cleanPath === '/my-bookings') {
      setComponent(() => MyBookings);
    } else if (cleanPath === '/profile') {
      setComponent(() => Profile);
    } else if (cleanPath === '/wishlist') {
      setComponent(() => Wishlist);
    } else if (cleanPath === '/list-property') {
      setComponent(() => ListProperty);
    } else if (cleanPath === '/login') {
      setComponent(() => Login);
    } else if (cleanPath === '/contact-us') {
      setComponent(() => ContactUs);
    } else if (cleanPath === '/privacy-policy') {
      setComponent(() => PrivacyPolicy);
    } else if (cleanPath === '/terms-of-service') {
      setComponent(() => TermsOfService);
    } else if (cleanPath === '/cancellation-policy') {
      setComponent(() => CancellationPolicy);
    } else if (cleanPath === '/cookie-policy') {
      setComponent(() => CookiePolicy);
    } else if (cleanPath === '/pricing-policy') {
      setComponent(() => PricingPolicy);
    } else {
      setComponent(() => ClientNotFound);
    }
  }, []);

  if (!mounted || !Component) {
    return null;
  }

  return <Component />;
}
