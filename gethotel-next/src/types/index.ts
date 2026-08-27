// ─── Domain Types ────────────────────────────────────────────────────────────

export type Amenity =
    | "wifi"
    | "pool"
    | "spa"
    | "gym"
    | "restaurant"
    | "bar"
    | "parking"
    | "airport_shuttle"
    | "pet_friendly"
    | "air_conditioning"
    | "room_service"
    | "laundry"
    | "conference_room"
    | "ev_charging"
    | "beach_access"
    | "kids_club"
    | "boat_transfer"
    | "yoga"
    | "meditation"
    | "river_access"
    | "garden_walk"
    | "fireplace";

export type RoomType = "standard" | "deluxe" | "suite" | "villa";
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type SortOption = "recommended" | "price_asc" | "price_desc" | "rating";

// ─── Hotel ───────────────────────────────────────────────────────────────────

export interface Hotel {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    city: string;
    country: string;
    address: string;
    latitude: number;
    longitude: number;
    starRating: 3 | 4 | 5;
    guestRating: number; // 1-10
    reviewCount: number;
    pricePerNight: number;
    currency: string;
    images: string[];
    thumbnail: string;
    amenities: Amenity[];
    isFeatured: boolean;
    isTrending: boolean;
    badge?: string; // "Deal of the day", "Sold out", etc.
    qualityScore?: number;
    responseSpeed?: string;
    badges?: string;
    cancellationRate?: number;
    noShowRate?: number;
    bookingAcceptanceRate?: number;
    complaintsCount?: number;
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
    id: string;
    hotelId: string;
    name: string;
    type: RoomType;
    description: string;
    maxOccupancy: number;
    bedConfiguration: string;
    sizeM2: number;
    pricePerNight: number;
    images: string[];
    amenities: string[];
    isAvailable: boolean;
}

// ─── Destination ─────────────────────────────────────────────────────────────

export interface Destination {
    id: string;
    city: string;
    country: string;
    image: string;
    hotelCount: number;
    startingPrice: number;
    tag?: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
    id: string;
    hotelId: string;
    guestName: string;
    guestAvatar: string;
    rating: number; // 1-10
    title: string;
    body: string;
    date: string; // ISO date
    verified: boolean;
    category: "Business" | "Couple" | "Family" | "Solo";
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface Booking {
    id: string;
    hotelId: string;
    hotelName: string;
    hotelThumbnail: string;
    roomId: string;
    roomName: string;
    city: string;
    checkIn: string; // ISO date
    checkOut: string; // ISO date
    nights: number;
    guests: number;
    pricePerNight: number;
    totalPrice: number;
    status: BookingStatus;
    bookedAt: string; // ISO date
    confirmationCode: string;
}

// ─── Guest Form ───────────────────────────────────────────────────────────────

export interface GuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    specialRequests?: string;
}

// ─── Search Params ───────────────────────────────────────────────────────────

export interface SearchParams {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
}


// ─── Filter State ────────────────────────────────────────────────────────────

export interface FilterState {
    priceRange: [number, number];
    starRatings: number[];
    amenities: Amenity[];
    guestRatingMin: number;
}
