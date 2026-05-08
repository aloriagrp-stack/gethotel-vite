const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function seed() {
    const now = new Date();
    
    const hotel = await p.hotel.create({
        data: {
            name: "hotel shriyansh",
            tagline: "A Premium Stay Experience",
            description: "Welcome to Hotel Shriyansh — a premium hospitality experience offering world-class comfort, elegant rooms, and exceptional service. Located in the heart of the city, we provide everything you need for a perfect stay.",
            city: "Delhi",
            address: "New Delhi, India",
            pricePerNight: 10000,
            starRating: 5,
            guestRating: 0,
            reviewCount: 0,
            thumbnail: null,
            images: JSON.stringify([]),
            amenities: JSON.stringify(["wifi", "parking", "room_service", "air_conditioning", "restaurant"]),
            isFeatured: false,
            isTrending: false,
            dining: null,
            wellness: null,
            faqs: null,
            safety: null,
            policies: JSON.stringify({
                checkIn: "14:00",
                checkOut: "11:00",
                cancellation: "Free cancellation until 48h before check-in.",
                children: "Children of all ages are welcome.",
                payment: "Credit cards and cash accepted."
            }),
            userId: 3,
            hotelUsername: "hotel_shriyansh",
            updatedAt: now,
        }
    });

    console.log("✅ Hotel created:", hotel.id, hotel.name);
    await p.$disconnect();
}

seed().catch(e => { console.error(e.message); p.$disconnect(); });
