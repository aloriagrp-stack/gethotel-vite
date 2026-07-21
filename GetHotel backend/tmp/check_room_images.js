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
        
        console.log("Checking room images...");
        const [rows] = await conn.execute(
            "SELECT COUNT(*) as cnt FROM room WHERE images LIKE '%data:image/%' OR images LIKE '%base64%'"
        );
        console.log("Rooms with base64 images:", rows[0].cnt);
        
        await conn.end();
    } catch (err) {
        console.error(err);
    }
}

test();
