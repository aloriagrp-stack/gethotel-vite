import type { Hotel } from "@/types";

export interface StorySlide {
    title: string;
    description: string;
    image: string;
    type: "intro" | "hotel" | "review";
    hotel?: Hotel;
}

export interface DestinationStory {
    id: string;
    city: string;
    slides: StorySlide[];
}

export const destinationStories: DestinationStory[] = [
    {
        id: "goa",
        city: "Goa",
        slides: [
            {
                title: "Welcome to Goa!",
                description: "Sun, sand, and spice! Discover India's coastal paradise famous for its stunning beaches and vibrant nightlife.",
                image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
                type: "intro"
            },
            {
                title: "Serenity Beach Resort",
                description: "Experience ultimate luxury at our top-rated beachfront resort in North Goa.",
                image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
                type: "hotel"
            },
            {
                title: "What travelers say",
                description: "\"The most relaxing vacation I've had in years. The backwaters are magical!\" - Aman K.",
                image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
                type: "review"
            }
        ]
    },
    {
        id: "udaipur",
        city: "Udaipur",
        slides: [
            {
                title: "The City of Lakes",
                description: "Experience the royal charm of Udaipur, known for its majestic palaces reflected in tranquil waters.",
                image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&q=80",
                type: "intro"
            },
            {
                title: "Lake Palace Majesty",
                description: "Stay in a living palace in the middle of Lake Pichola for a truly royal experience.",
                image: "https://images.unsplash.com/photo-1620801552882-628f62c01997?w=800&q=80",
                type: "hotel"
            },
            {
                title: "Guest Feedback",
                description: "\"Floating in the middle of a lake was a dream come true. 5 stars!\" - Sarah L.",
                image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80",
                type: "review"
            }
        ]
    },
    {
        id: "shimla",
        city: "Shimla",
        slides: [
            {
                title: "Queen of the Hills",
                description: "Enjoy the crisp mountain air and snow-capped peaks in the heart of Himachal Pradesh.",
                image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
                type: "intro"
            },
            {
                title: "The Panorama Palace",
                description: "Luxury at 7,000 feet with breathtaking Himalayan vistas.",
                image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
                type: "hotel"
            },
            {
                title: "Nature's Best",
                description: "\"Waking up to the Himalayas was the best part of our winter trip!\" - Rohan D.",
                image: "https://images.unsplash.com/photo-1516048015710-7a3b4c86be43?w=800&q=80",
                type: "review"
            }
        ]
    },
    {
        id: "munnar",
        city: "Munnar",
        slides: [
            {
                title: "Emerald Tea Gardens",
                description: "Lose yourself in the rolling hills of Munnar, carpeted with lush green tea plantations.",
                image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80",
                type: "intro"
            },
            {
                title: "Hill Station Chalet",
                description: "Cozy boutique stay amidst the tea estates with amazing valley views.",
                image: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=800&q=80",
                type: "hotel"
            },
            {
                title: "Scenic Bliss",
                description: "\"The most peaceful place I've ever visited. A green heaven!\" - Priya M.",
                image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&q=80",
                type: "review"
            }
        ]
    },
    {
        id: "jaipur",
        city: "Jaipur",
        slides: [
            {
                title: "The Pink City",
                description: "Step into history with majestic forts, vibrant bazaars, and iconic architecture.",
                image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
                type: "intro"
            },
            {
                title: "Rajputana Heritage",
                description: "Live like royalty in a meticulously restored 17th-century palace.",
                image: "https://images.unsplash.com/photo-1463288889890-a56b2853c40f?w=800&q=80",
                type: "hotel"
            },
            {
                title: "Royal Review",
                description: "\"Jaipur's hospitality is unmatched. The forts are breathtaking!\" - James B.",
                image: "https://images.unsplash.com/photo-1524226456802-8bb300d720c7?w=800&q=80",
                type: "review"
            }
        ]
    }
];
