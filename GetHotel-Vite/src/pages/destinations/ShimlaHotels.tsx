import DestinationLanding from "./DestinationLanding";

export default function ShimlaHotels() {
    return (
        <DestinationLanding
            city="Shimla"
            title="Shimla Hotels — Book Best Resorts near Mall Road | GetHotelStays"
            description="Find and book top hotels in Shimla. Compare luxury heritage resorts, budget stays & Mall Road properties. Pay 12% online, rest at check-in."
            keywords={["hotels in shimla", "shimla resorts", "mall road hotels shimla", "book hotel shimla", "budget stays shimla", "shimla heritage stays"]}
            h1="Book Best Hotels in Shimla — Hill Station Resorts & Mall Road Stays"
            introduction="Shimla, the former summer capital of British India, is one of the most famous hill stations in the country. Known for its colonial architecture, historic toy train railway, and the bustling Ridge, Shimla offers an elegant mountain getaway. GetHotelStays makes booking hotels in Shimla straightforward and transparent. Discover verified forest lodges, luxury view resorts, and pocket-friendly guest houses within walking distance from the Mall Road."
            sections={[
                {
                    h2: "Iconic Mall Road Lodging & Heritage Charms",
                    text: "Staying near the pedestrian-only Mall Road allows you to stroll to the mock-Tudor library, Christ Church, and local cafes without dealing with traffic. Our heritage properties preserve the classic British-era architecture, fireplaces, and hospitality."
                },
                {
                    h2: "Flexible Micro-Stays for Mountain Transits",
                    text: "If you are on a quick weekend trip or transit from Kalka, book a micro-stay for 3 or 6 hours to rest, freshen up, and store your luggage while you explore the scenic pine-wood trails of Jakhoo Hill and Kufri."
                }
            ]}
            faqs={[
                {
                    question: "Can I reach Mall Road hotels by car?",
                    answer: "Vehicles are restricted on the Mall Road to preserve its pedestrian charm. Most hotels provide porter services from the nearest designated parking barriers (like Tourism Lift or High Court)."
                },
                {
                    question: "Is the Shimla Toy Train close to the hotels?",
                    answer: "Yes, we have multiple verified properties near the Shimla Railway Station and bypass roads for easy access to the historic UNESCO World Heritage toy train."
                },
                {
                    question: "What amenities are guaranteed in Shimla hotels?",
                    answer: "Our 50-point audit ensures high-speed Wi-Fi, clean bathrooms, geysers for hot water, and safety measures are fully functional in all our partner properties."
                }
            ]}
            internalLinks={[
                { label: "Goa Hotels", url: "/goa-hotels" },
                { label: "Jaipur Hotels", url: "/jaipur-hotels" },
                { label: "Manali Hotels", url: "/manali-hotels" },
                { label: "Udaipur Hotels", url: "/udaipur-hotels" }
            ]}
        />
    );
}
