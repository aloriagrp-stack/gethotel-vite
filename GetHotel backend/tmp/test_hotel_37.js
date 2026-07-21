const mysql = require('mysql2/promise');

async function test() {
    const conn = await mysql.createConnection({
        host: '103.108.220.145',
        user: 'vgyuvmpi_gethotel_db',
        password: 'shriyanshking',
        database: 'vgyuvmpi_gethotel_db',
        port: 3306
    });

    console.log("Connected. Testing thumbnail fetch...");
    try {
        const start1 = Date.now();
        const [rows1] = await conn.execute("SELECT thumbnail FROM hotel WHERE id = 37");
        console.log(`Thumbnail fetched in ${Date.now() - start1}ms. Size:`, rows1[0]?.thumbnail?.length);
    } catch (e) {
        console.error("Thumbnail fetch failed:", e.message);
    }

    console.log("Testing images fetch...");
    try {
        const start2 = Date.now();
        const [rows2] = await conn.execute("SELECT images FROM hotel WHERE id = 37");
        console.log(`Images fetched in ${Date.now() - start2}ms. Size:`, rows2[0]?.images?.length);
    } catch (e) {
        console.error("Images fetch failed:", e.message);
    }

    await conn.end();
}

test().catch(console.error);
