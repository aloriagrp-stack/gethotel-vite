'use client';

import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import Dashboard from '@/pages-legacy/partner-dashboard/Dashboard';
import Bookings from '@/pages-legacy/partner-dashboard/Bookings';
import Hotel from '@/pages-legacy/partner-dashboard/Hotel';
import Rooms from '@/pages-legacy/partner-dashboard/Rooms';
import Inventory from '@/pages-legacy/partner-dashboard/Inventory';
import Payments from '@/pages-legacy/partner-dashboard/Payments';
import Coupons from '@/pages-legacy/partner-dashboard/Coupons';
import Messages from '@/pages-legacy/partner-dashboard/Messages';
import Reviews from '@/pages-legacy/partner-dashboard/Reviews';
import ChannelSync from '@/pages-legacy/partner-dashboard/ChannelSync';
import Settings from '@/pages-legacy/partner-dashboard/Settings';
import Staff from '@/pages-legacy/partner-dashboard/Staff';
import Analytics from '@/pages-legacy/partner-dashboard/Analytics';
import FrontDesk from '@/pages-legacy/partner-dashboard/FrontDesk';
import Notifications from '@/pages-legacy/partner-dashboard/Notifications';

interface PartnerPageRouterProps {
    forcedSlug?: string;
}

export default function PartnerPageRouter({ forcedSlug }: PartnerPageRouterProps) {
    const location = useLocation();

    const activeTab = useMemo(() => {
        if (forcedSlug) return forcedSlug.toLowerCase();
        
        const path = typeof window !== 'undefined' ? window.location.pathname : (location?.pathname || '');
        const cleanPath = path.replace(/\/+$/, '');
        const segments = cleanPath.split('/').filter(Boolean);
        
        // Example: /partner-dashboard/rooms -> segments = ['partner-dashboard', 'rooms']
        if (segments.length >= 2 && segments[0] === 'partner-dashboard') {
            return segments[1].toLowerCase();
        }
        
        return 'dashboard';
    }, [forcedSlug, location?.pathname]);

    switch (activeTab) {
        case 'bookings':
            return <Bookings />;
        case 'hotel':
            return <Hotel />;
        case 'rooms':
            return <Rooms />;
        case 'inventory':
            return <Inventory />;
        case 'payments':
            return <Payments />;
        case 'coupons':
            return <Coupons />;
        case 'messages':
            return <Messages />;
        case 'reviews':
            return <Reviews />;
        case 'channel':
            return <ChannelSync />;
        case 'settings':
            return <Settings />;
        case 'staff':
            return <Staff />;
        case 'analytics':
            return <Analytics />;
        case 'frontdesk':
            return <FrontDesk />;
        case 'notifications':
            return <Notifications />;
        case 'dashboard':
        default:
            return <Dashboard />;
    }
}
