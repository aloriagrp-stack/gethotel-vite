const mysql = require('mysql2/promise');

async function test() {
    try {
        const conn = await mysql.createConnection({
            host: '103.108.220.145',
            user: 'vgyuvmpi_gethotel_db',
            password: 'shriyanshking',
            database: 'vgyuvmpi_gethotel_db',
            port: 3306
        });
        console.log("Connected! Checking active transactions...");
        
        const [trx] = await conn.execute("SELECT * FROM information_schema.innodb_trx");
        console.log("Active InnoDB Transactions:", trx.length);
        trx.forEach(t => {
            console.log(`TRX ID: ${t.trx_id} | State: ${t.trx_state} | Started: ${t.trx_started} | Query: ${t.trx_query}`);
        });

        console.log("\nChecking process list including sleeping ones...");
        const [processes] = await conn.execute("SHOW PROCESSLIST");
        processes.forEach(p => {
            console.log(`ID: ${p.Id} | User: ${p.User} | Host: ${p.Host} | db: ${p.db} | Command: ${p.Command} | Time: ${p.Time}s | State: ${p.State} | Info: ${p.Info}`);
        });

        await conn.end();
    } catch (err) {
        console.error(err);
    }
}

test();
