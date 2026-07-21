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
        
        console.log("Fetching Hotel ID 17...");
        const [rows] = await conn.execute("SELECT id, name, thumbnail, images FROM hotel WHERE id = 17");
        const h = rows[0];
        
        console.log("Type of thumbnail:", typeof h.thumbnail);
        console.log("Is thumbnail Buffer?", Buffer.isBuffer(h.thumbnail));
        if (h.thumbnail) {
            console.log("Thumbnail starts with:", h.thumbnail.slice(0, 100));
            if (typeof h.thumbnail === 'string') {
                console.log("StartsWith data:image/?", h.thumbnail.startsWith('data:image/'));
            } else if (Buffer.isBuffer(h.thumbnail)) {
                console.log("Buffer startsWith exists?", typeof h.thumbnail.startsWith);
                console.log("Buffer converted to string startsWith data:image/?", h.thumbnail.toString('utf8').startsWith('data:image/'));
            }
        }

        console.log("\nType of images:", typeof h.images);
        console.log("Is images Buffer?", Buffer.isBuffer(h.images));
        if (h.images) {
            const strImgs = Buffer.isBuffer(h.images) ? h.images.toString('utf8') : h.images;
            console.log("Images includes data:image/?", strImgs.includes('data:image/'));
        }

        await conn.end();
    } catch (err) {
        console.error(err);
    }
}

test();
