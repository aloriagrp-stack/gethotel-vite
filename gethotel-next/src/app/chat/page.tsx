import type { Metadata } from 'next';
import GuestChatPage from '@/pages-legacy/GuestChatPage';

export const metadata: Metadata = {
    title: 'Messages & Hotel Chat | GetHotelStays',
    description: 'Chat directly with your hotel front desk in real-time on GetHotelStays.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return <GuestChatPage />;
}

