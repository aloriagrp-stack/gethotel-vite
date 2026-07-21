const mysql = require('mysql2/promise');

async function test() {
    try {
        console.log("1. Starting connection latency test...");
        const t0 = Date.now();
        const conn = await mysql.createConnection({
            host: '103.108.220.145',
            user: 'vgyuvmpi_gethotel_db',
            password: 'shriyanshking',
            database: 'vgyuvmpi_gethotel_db',
            port: 3306,
            connectTimeout: 60000 // 60 seconds
        });
        const t1 = Date.now();
        console.log(`Connection established in ${t1 - t0}ms`);

        console.log("2. Running simple SELECT 1...");
        const t2 = Date.now();
        await conn.execute("SELECT 1");
        const t3 = Date.now();
        console.log(`SELECT 1 executed in ${t3 - t2}ms`);

        console.log("3. Running SELECT count(*) on hotel table...");
        const t4 = Date.now();
        await conn.execute("SELECT COUNT(*) FROM hotel");
        const t5 = Date.now();
        console.log(`Hotel count query executed in ${t5 - t4}ms`);

        await conn.end();
    } catch (err) {
        console.error("Latency test failed:", err);
    }
}

test();
