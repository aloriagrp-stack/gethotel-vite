import DestinationLanding from "./DestinationLanding";

export default function ManaliHotels() {
    return (
        <DestinationLanding
            city="Manali"
            title="Manali Hotels — Book Mountain Resorts & Cottages | GetHotelStays"
            description="Book hotels in Manali online. Compare luxury snow-view resorts, cozy wooden cottages & budget guest houses. Pay 12% to confirm, rest at hotel."
            keywords={["hotels in manali", "manali cottages", "book hotel manali", "mountain resorts manali", "snow view hotels manali", "old manali hotels"]}
            h1="Book Best Hotels in Manali — Mountain Resorts & Cozy Cottages"
            introduction="Nestled in the Beas River Valley, Manali is India's favorite mountain retreat. Surrounded by pine forests, snow-capped peaks of the Pir Panjal range, and gushing rivers, it is a haven for adventure seekers, honeymooners, and families. Whether you want a cozy wood-and-stone cottage in Old Manali or a luxury resort along the Mall Road, GetHotelStays offers verified listings with guaranteed mountain views. Book with confidence using our minimal deposit policy."
            sections={[
                {
                    h2: "Stay Near the Mall Road vs. Old Manali Cottages",
                    text: "If you prefer quick access to shopping, dining, and local transit, look for hotels near the Mall Road. For a peaceful, bohemian vibe surrounded by apple orchards and local cafes, Old Manali is the perfect choice for backpackers and writers."
                },
                {
                    h2: "Solitude and Adventure in the Himalayas",
                    text: "Plan trips to Solang Valley for paragliding, Rohtang Pass for snow sports, or cross the Atal Tunnel. Our property hosts can assist you in booking local adventure guides, ski equipment, and transit options."
                }
            ]}
            faqs={[
                {
                    question: "Are there snow-view hotels in Manali?",
                    answer: "Yes, we list several premium properties in the log-hut area, Simsa, and Vashisht that offer panoramic snow-view balconies."
                },
                {
                    question: "Do Manali hotels have room heaters?",
                    answer: "Yes, most verified properties provide room heaters, either included in the rate or available for a nominal fee, especially during the cold winter months."
                },
                {
                    question: "Is Old Manali couple-friendly?",
                    answer: "Yes, Old Manali features many boutique retreats and wooden cottages that are extremely welcoming and couple-friendly."
                }
            ]}
            internalLinks={[
                { label: "Goa Hotels", url: "/goa-hotels" },
                { label: "Jaipur Hotels", url: "/jaipur-hotels" },
                { label: "Shimla Hotels", url: "/shimla-hotels" },
                { label: "Udaipur Hotels", url: "/udaipur-hotels" }
            ]}
        />
    );
}
