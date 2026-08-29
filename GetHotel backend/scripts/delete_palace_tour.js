require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'vgyuvmpi_gethotel_db'
    });

    const [delRes] = await connection.execute(
        "DELETE FROM tour_packages WHERE price = 145000 OR slug LIKE '%palace-on-wheels%' OR title LIKE '%Palace on Wheels%'"
    );
    console.log("DELETED ROWS:", delRes.affectedRows);

    const [rows] = await connection.execute("SELECT id, title, price FROM tour_packages ORDER BY id ASC");
    console.log("TOTAL REMAINING PACKAGES:", rows.length);
    console.log(rows);

    await connection.end();
}

main().catch(console.error);
