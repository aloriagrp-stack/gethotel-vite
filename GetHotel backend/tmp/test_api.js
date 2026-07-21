const fetch = require('node-fetch');

async function test() {
    console.log("Testing local backend API...");
    try {
        console.log("Fetching /api/hotels/trending...");
        const tStart = Date.now();
        const resTrending = await fetch('http://localhost:5000/api/hotels/trending');
        const dTrending = await resTrending.json();
        console.log(`/api/hotels/trending status: ${resTrending.status} (${Date.now() - tStart}ms)`);
        console.log("Trending Data Success:", dTrending.success, "Count:", dTrending.data?.length);

        console.log("Fetching /api/hotels...");
        const hStart = Date.now();
        const resHotels = await fetch('http://localhost:5000/api/hotels');
        const dHotels = await resHotels.json();
        console.log(`/api/hotels status: ${resHotels.status} (${Date.now() - hStart}ms)`);
        console.log("Hotels Data Success:", dHotels.success, "Count:", dHotels.data?.length);
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
