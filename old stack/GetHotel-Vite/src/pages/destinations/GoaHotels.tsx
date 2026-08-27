import DestinationLanding from "./DestinationLanding";

export default function GoaHotels() {
    return (
        <DestinationLanding
            city="Goa"
            title="Goa Hotels — Book Best Beach Resorts in Goa | GetHotelStays"
            description="Book hotels in Goa online at unbeatable prices. Compare premium beach resorts, budget guest houses & hourly stays. Pay 12% to book, rest at hotel."
            keywords={["hotels in goa", "goa resorts", "book hotel goa", "cheap hotels goa", "hourly stays goa", "beach resorts goa"]}
            h1="Book Best Hotels in Goa — Beach Resorts & Hourly Stays"
            introduction="Goa, India's ultimate coastal paradise, is famous for its sun-kissed beaches, vibrant nightlife, and Portuguese-era architecture. Whether you are planning an action-packed holiday in North Goa or a peaceful, laid-back escape in South Goa, finding the right stay is crucial. GetHotelStays brings you a curated list of verified hotels, beach villas, and luxury resorts in Goa. Enjoy our flexible stay options, including full-day stays and hourly rooms for transit travelers, all backed by our transparent 'Pay 12% Now' booking model."
            sections={[
                {
                    h2: "Choose Your Vibe: North Goa vs. South Goa Hotels",
                    text: "North Goa is the hub for water sports, beach shacks, night markets, and non-stop party action near Baga, Calangute, and Anjuna. On the other hand, South Goa offers quiet, secluded shores, luxury wellness resorts, and heritage properties near Colva, Palolem, and Varca. GetHotelStays has verified properties in both regions to match your travel mood."
                },
                {
                    h2: "Flexible Hourly Bookings for Goa Travelers",
                    text: "For transit travelers arriving at Manohar International Airport (Mopa) or Dabolim Airport, we offer convenient hourly stays for 3, 6, or 12 hours. Freshen up, rest, and check out without paying for a full 24-hour block, giving you absolute budget control."
                }
            ]}
            faqs={[
                {
                    question: "Which area in Goa is best for families?",
                    answer: "South Goa is highly recommended for families due to its quiet, clean beaches and premium family resorts. Areas like Varca, Cavelossim, and Colva provide excellent family-friendly lodging."
                },
                {
                    question: "Can I book couple-friendly hotels in Goa?",
                    answer: "Yes, all hotels listed in Goa on GetHotelStays are couple-friendly, completely secure, and accept local IDs for a hassle-free check-in experience."
                },
                {
                    question: "Are beach-touch properties available?",
                    answer: "Yes, we list verified beach resorts in Calangute, Baga, and Palolem that offer direct beach access and stunning sea views."
                }
            ]}
            internalLinks={[
                { label: "Jaipur Hotels", url: "/jaipur-hotels" },
                { label: "Manali Hotels", url: "/manali-hotels" },
                { label: "Shimla Hotels", url: "/shimla-hotels" },
                { label: "Udaipur Hotels", url: "/udaipur-hotels" }
            ]}
        />
    );
}
