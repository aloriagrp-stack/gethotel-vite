const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const seedData = async () => {
    try {
        console.log('Seeding MySQL database...');

        // Clear existing data (Order matters for FK constraints)
        await prisma.booking.deleteMany();
        await prisma.review.deleteMany();
        await prisma.room.deleteMany();
        await prisma.hotel.deleteMany();
        await prisma.user.deleteMany();

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@gethotel.com',
                password: hashedPassword,
                role: 'super_admin'
            }
        });

        // Hotels Data
        const hotels = [
            {
                name: "The Grand Meridian",
                tagline: "Where luxury meets comfort in the heart of the city",
                description: "An iconic 5-star landmark offering unparalleled luxury, world-class dining, and breathtaking city views. The Grand Meridian defines elegance with its state-of-the-art facilities and personalized service that caters to every guest's needs.",
                city: "Mumbai",
                address: "Nariman Point, Marine Drive, Mumbai 400 021",
                pricePerNight: 12500,
                starRating: 5,
                guestRating: 9.2,
                reviewCount: 1842,
                thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
                images: [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80"
                ],
                amenities: ["wifi", "pool", "spa", "gym", "restaurant"],
                isFeatured: true,
                isTrending: true,
                userId: admin.id,
                dining: {
                    enabled: true,
                    list: [
                        { name: "The Meridian Grill", cuisine: "International", time: "7:00 AM - 11:00 PM" },
                        { name: "Sky Lounge", cuisine: "Cocktails & Tapas", time: "5:00 PM - 1:00 AM" }
                    ]
                },
                wellness: {
                    enabled: true,
                    list: [
                        { name: "Royal Spa", icon: "💆", info: "Full body treatments and sauna" },
                        { name: "Infinity Pool", icon: "🏊", info: "Heated pool with city view" }
                    ]
                },
                faqs: [
                    { question: "Is airport shuttle available?", answer: "Yes, we provide 24/7 airport pick-up and drop-off services." },
                    { question: "Do you allow early check-in?", answer: "Early check-in is subject to availability and may incur additional charges." }
                ],
                policies: {
                    checkIn: "2:00 PM",
                    checkOut: "12:00 PM",
                    cancellation: "Free cancellation 24h before arrival.",
                    children: "Children under 12 stay for free using existing bedding.",
                    payment: "All major credit cards and UPI accepted."
                },
                safety: ["24/7 Security", "Fire Sprinklers", "CCTV in common areas"]
            },
            {
                name: "Serenity Beach Resort",
                tagline: "Wake up to the sound of waves every morning",
                description: "A breathtaking beachfront resort nestled along pristine white sands. Offering private beach access, overwater villas, and a world-class wellness center for the ultimate relaxation.",
                city: "Goa",
                address: "Calangute Beach Road, North Goa, 403516",
                pricePerNight: 18000,
                starRating: 5,
                guestRating: 9.5,
                reviewCount: 2310,
                thumbnail: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
                images: [
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
                    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80",
                    "https://images.unsplash.com/photo-1506929113614-bb90ff947275?w=1200&q=80",
                    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=80"
                ],
                amenities: ["wifi", "pool", "beach_access", "bar", "yoga"],
                isFeatured: true,
                isTrending: true,
                userId: admin.id,
                dining: {
                    enabled: true,
                    list: [
                        { name: "Ocean Breeze", cuisine: "Seafood", time: "12:00 PM - 10:00 PM" },
                        { name: "Sunset Bar", cuisine: "Drinks", time: "4:00 PM - 12:00 AM" }
                    ]
                },
                wellness: {
                    enabled: true,
                    list: [
                        { name: "Zanadu Yoga", icon: "🧘", info: "Daily sunrise yoga sessions" },
                        { name: "Ayurvedic Center", icon: "🌿", info: "Traditional Kerala treatments" }
                    ]
                },
                faqs: [
                    { question: "Is breakfast included?", answer: "Yes, a buffet breakfast is included for all bookings." },
                    { question: "Do you provide water sports?", answer: "Yes, we offer surfing, jet-skiing, and parasailing at the private beach." }
                ],
                policies: {
                    checkIn: "3:00 PM",
                    checkOut: "11:00 AM",
                    cancellation: "Non-refundable for peak season bookings.",
                    children: "Resort is family-friendly with a dedicated kids club.",
                    payment: "Pre-payment required for villa bookings."
                },
                safety: ["Lifeguards on duty", "Emergency Medical Kit", "Secure gated entry"]
            }
        ];

        for (const h of hotels) {
            const createdHotel = await prisma.hotel.create({ data: h });
            
            // Create rooms
            await prisma.room.create({
                data: {
                    name: "Deluxe King Room",
                    hotelId: createdHotel.id,
                    bedConfiguration: "King Size",
                    sizeM2: 45,
                    maxOccupancy: 2,
                    pricePerNight: h.pricePerNight,
                    amenities: ["AC", "TV", "Mini Bar", "Sea View"],
                    images: [h.thumbnail]
                }
            });

            await prisma.room.create({
                data: {
                    name: "Executive Suite",
                    hotelId: createdHotel.id,
                    bedConfiguration: "Super King",
                    sizeM2: 75,
                    maxOccupancy: 3,
                    pricePerNight: h.pricePerNight * 1.5,
                    amenities: ["AC", "TV", "Kitchenette", "Balcony"],
                    images: [h.images[1]]
                }
            });

            // Create some reviews
            await prisma.review.create({
                data: {
                    userId: admin.id,
                    hotelId: createdHotel.id,
                    rating: 5,
                    comment: "An absolutely wonderful experience. The service was top-notch and the views were incredible!"
                }
            });
        }

        console.log('MySQL Database Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
