import type { Review } from "@/types";

export const reviews: Review[] = [
    {
        id: "rev1",
        hotelId: "1",
        guestName: "Arjun Mehta",
        guestAvatar: "https://i.pravatar.cc/150?img=12",
        rating: 9.5,
        title: "Exceptional city escape",
        body: "The service was impeccable — the staff remembered our names from check-in onwards. The room view of Marine Drive at night is simply unforgettable. Will return!",
        date: "2025-12-18",
        verified: true,
        category: "Couple",
    },
    {
        id: "rev2",
        hotelId: "1",
        guestName: "Priya Sharma",
        guestAvatar: "https://i.pravatar.cc/150?img=48",
        rating: 8.8,
        title: "Perfect for business travel",
        body: "Everything you need — fast Wi-Fi, great breakfast, attentive concierge. The conference room was well-equipped. Minor note: the spa was fully booked during our stay.",
        date: "2026-01-05",
        verified: true,
        category: "Business",
    },
    {
        id: "rev3",
        hotelId: "1",
        guestName: "Rohit Kumar",
        guestAvatar: "https://i.pravatar.cc/150?img=33",
        rating: 9.0,
        title: "Kids loved the pool area",
        body: "Fantastic family holiday. The kids' pool was safe and well-maintained. Room service was prompt and the menu had good options for children. Highly recommend the buffet breakfast.",
        date: "2026-02-11",
        verified: true,
        category: "Family",
    },
    {
        id: "rev4",
        hotelId: "2",
        guestName: "Sneha Joshi",
        guestAvatar: "https://i.pravatar.cc/150?img=26",
        rating: 9.8,
        title: "Best holiday of my life!",
        body: "Waking up to the ocean from our villa is something I'll never forget. Private beach, incredible food, immaculate staff. Worth every rupee.",
        date: "2025-11-29",
        verified: true,
        category: "Couple",
    },
    {
        id: "rev5",
        hotelId: "2",
        guestName: "David Wilson",
        guestAvatar: "https://i.pravatar.cc/150?img=52",
        rating: 9.4,
        title: "Paradise found on Earth",
        body: "Came for a week, wanted to stay forever. The sunset from the infinity pool is absolutely magical. The resort shuttle service was very convenient.",
        date: "2026-01-15",
        verified: true,
        category: "Solo",
    },
    {
        id: "rev6",
        hotelId: "7",
        guestName: "Ananya Patel",
        guestAvatar: "https://i.pravatar.cc/150?img=5",
        rating: 9.3,
        title: "Royalty redefined",
        body: "Staying in a 400-year-old palace sounds intimidating, but the blend of heritage and modern comforts was perfectly balanced. The camel ride at sunset was surreal.",
        date: "2026-02-20",
        verified: true,
        category: "Family",
    },
    {
        id: "rev7",
        hotelId: "5",
        guestName: "Kiran Rao",
        guestAvatar: "https://i.pravatar.cc/150?img=60",
        rating: 9.9,
        title: "Magical Kerala backwaters experience",
        body: "The floating villa is one-of-a-kind. Silence, stars, birdsong, and the gentle lap of backwaters. The Ayurvedic massage was transformative. Absolutely flawless stay.",
        date: "2025-12-31",
        verified: true,
        category: "Couple",
    },
    {
        id: "rev8",
        hotelId: "9",
        guestName: "Meera Iyer",
        guestAvatar: "https://i.pravatar.cc/150?img=47",
        rating: 9.6,
        title: "Closest I've felt to wild India",
        body: "Spotted a tiger on the morning safari! The treehouse cottage was cosy and atmospheric. Staff were passionate, knowledgeable guides. Will bring the family next time.",
        date: "2026-01-28",
        verified: true,
        category: "Solo",
    },
];

export const getReviewsByHotelId = (hotelId: string) =>
    reviews.filter((r) => r.hotelId === hotelId);

export const getAverageRating = (hotelId: string): number => {
    const hotelReviews = getReviewsByHotelId(hotelId);
    if (hotelReviews.length === 0) return 0;
    const sum = hotelReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / hotelReviews.length) * 10) / 10;
};
