const mysql = require('mysql2/promise');

async function check() {
    try {
        console.log("Connecting to remote database...");
        const conn = await mysql.createConnection({
            host: '103.108.220.145',
            user: 'vgyuvmpi_gethotel_db',
            password: 'shriyanshking',
            database: 'vgyuvmpi_gethotel_db',
            port: 3306,
            connectTimeout: 20000
        });
        console.log("Connected! Running SHOW PROCESSLIST...");
        const [rows] = await conn.execute("SHOW PROCESSLIST");
        console.log("Active processes:", rows.length);
        rows.forEach(r => {
            if (r.Command !== 'Sleep' || r.Time > 10) {
                console.log(`ID: ${r.Id} | User: ${r.User} | Host: ${r.Host} | Command: ${r.Command} | Time: ${r.Time}s | State: ${r.State} | Info: ${r.Info}`);
            }
        });

        console.log("\nCounting records in tables...");
        const tables = ['hotel', 'room', 'booking', 'review'];
        for (const table of tables) {
            const [countRes] = await conn.execute(`SELECT COUNT(*) as cnt FROM \`${table}\``);
            console.log(`Table \`${table}\` count: ${countRes[0].cnt}`);
        }

        await conn.end();
    } catch (err) {
        console.error("Database status check failed:", err);
    }
}

check();
