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
        console.log("Connected! Checking thumbnail and images sizes...");
        
        const [rows] = await conn.execute(
            "SELECT id, name, LENGTH(thumbnail) as thumb_len, LENGTH(images) as imgs_len, SUBSTRING(thumbnail, 1, 100) as thumb_start FROM hotel"
        );
        
        rows.forEach(r => {
            console.log(`ID: ${r.id} | Name: "${r.name}"`);
            console.log(`  Thumbnail size: ${r.thumb_len || 0} bytes | Images size: ${r.imgs_len || 0} bytes`);
            console.log(`  Thumbnail starts with: "${r.thumb_start}"`);
        });

        await conn.end();
    } catch (err) {
        console.error(err);
    }
}

test();
