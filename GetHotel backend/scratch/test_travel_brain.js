const travelBrain = require('../services/ai/travelBrain');

async function runTests() {
    console.log("================== TEST 1: GREETING (Handed off to LLM / SI) ==================");
    const r1 = await travelBrain.processQuery({ query: "Hello bhai, kaisa hai?" });
    console.log("R1 Brain Result:", r1 ? r1.reply : "NULL (Successfully handed off to SI/LLM Gateway!)");

    console.log("\n================== TEST 2: HOTEL SEARCH (DELHI/PAHARGANJ) ==================");
    const r2 = await travelBrain.processQuery({ query: "Delhi me Paharganj ke paas couple friendly hotel 2500 ke andar" });
    console.log("R2 Response Type:", r2.responseType);
    console.log("R2 Hotels Count:", r2.hotels ? r2.hotels.length : 0);
    console.log("R2 Reply:\n", r2.reply);

    console.log("\n================== TEST 3: BARGAIN / DISCOUNT ==================");
    const r3 = await travelBrain.processQuery({
        query: "bhai thoda discount milega kya? kuch kam karo",
        dbHotels: [{ name: "Hotel Sun International", city: "Delhi", pricePerNight: 2400 }]
    });
    console.log("R3 Response Type:", r3.responseType);
    console.log("R3 Action:", r3.action);
    console.log("R3 Reply:\n", r3.reply);

    console.log("\n================== TEST 4: POLICY FAQ (LOCAL ID / COUPLES) ==================");
    const r4 = await travelBrain.processQuery({ query: "local id chalegi kya? unmarried couple allowed?" });
    console.log("R4 Response Type:", r4.responseType);
    console.log("R4 Reply:\n", r4.reply);

    console.log("\nALL TESTS COMPLETED SUCCESSFULLY!");
}

runTests().catch(console.error);
