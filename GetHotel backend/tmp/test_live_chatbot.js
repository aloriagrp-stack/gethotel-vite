const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
    console.log("Testing live chatbot API /api/ai/chat...");
    try {
        const res = await fetch("https://gethotelstays.com/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "user", content: "hello" },
                    { role: "ai", content: "Hello! I am your GetHotelStays AI travel buddy. 👋 How can I help you today?" },
                    { role: "user", content: "jaipur hotels dikha" },
                    { role: "ai", content: "Here are some hotels in Jaipur: [Hotel Jaisingh Palace](/hotel/30) - Star Rating: 3 - Price: ₹2990/night." },
                    { role: "user", content: "rooms dikha" }
                ]
            })
        });

        console.log("Status Code:", res.status);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("Test failed:", err);
    }
}

main();
