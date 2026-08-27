'use client';
import DestinationLanding from "./DestinationLanding";

export default function JaipurHotels() {
    return (
        <DestinationLanding
            city="Jaipur"
            title="Jaipur Hotels — Book Best Heritage Stays in Jaipur | GetHotelStays"
            description="Find and book top hotels in Jaipur. Compare royal palaces, boutique heritage properties & budget stays. Pay 12% now, rest at check-in."
            keywords={["hotels in jaipur", "jaipur heritage hotels", "book hotel jaipur", "jaipur palaces", "budget stays jaipur", "pink city hotels"]}
            h1="Book Best Hotels in Jaipur — Heritage Palaces & Budget Stays"
            introduction="Jaipur, the capital of Rajasthan, is globally renowned as the 'Pink City'. Rich in history, majestic fortresses, and royal culture, it attracts millions of domestic and international travelers. From heritage Haveli conversions to modern luxury hotels near the Hawa Mahal, Jaipur offers diverse lodging options. GetHotelStays makes booking hotels in Jaipur online fast and secure. Book verified properties near top tourist spots and experience royal Rajasthani hospitality."
            sections={[
                {
                    h2: "Heritage Havelis vs. Modern Business Hotels in Jaipur",
                    text: "Experience the grandeur of ancient Rajput royalty by booking one of our verified heritage Havelis, featuring traditional frescoes and courtyard dinners. If you are traveling for business, we also list high-end corporate hotels near Malviya Nagar, C-Scheme, and Tonk Road with advanced conference amenities."
                },
                {
                    h2: "Explore the Wonders of the Pink City",
                    text: "Choose a hotel close to the walled city for easy access to City Palace, Jantar Mantar, and Johari Bazar. Our map listings help you find stays near Amer Fort and Jal Mahal, allowing you to optimize your sightseeing itinerary."
                }
            ]}
            faqs={[
                {
                    question: "What is the best time to visit Jaipur?",
                    answer: "The winter months from October to March are the best times to visit Jaipur, as the weather is pleasant for sightseeing and outdoor exploring."
                },
                {
                    question: "Do Jaipur hotels offer authentic Rajasthani food?",
                    answer: "Yes, most of our heritage hotel partners serve local specialties like Dal Baati Churma, Gatte ki Sabzi, and Laal Maas in their in-house restaurants."
                },
                {
                    question: "Can I book hourly rooms near Jaipur Junction?",
                    answer: "Yes, we offer flexible 3-hour, 6-hour, and 12-hour transit stays near Jaipur Railway Station for business travelers and tourists in transit."
                }
            ]}
            internalLinks={[
                { label: "Goa Hotels", url: "/goa-hotels" },
                { label: "Manali Hotels", url: "/manali-hotels" },
                { label: "Shimla Hotels", url: "/shimla-hotels" },
                { label: "Udaipur Hotels", url: "/udaipur-hotels" }
            ]}
        />
    );
}
