const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

// Setup uploads path
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Convert base64 function
async function processBase64(base64Str) {
    if (!base64Str || typeof base64Str !== 'string') return base64Str;
    if (!base64Str.startsWith('data:image/')) return base64Str;

    try {
        const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (!matches) return base64Str;

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
        const filename = `img_${Date.now()}_${hash}.webp`;
        const filePath = path.join(UPLOADS_DIR, filename);

        await sharp(buffer).webp({ quality: 80 }).toFile(filePath);
        return `/uploads/${filename}`;
    } catch (err) {
        console.warn("Sharp error, using fallback raw save:", err.message);
        try {
            const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                const ext = mimeType.split('/')[1] || 'png';
                const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
                const filename = `img_${Date.now()}_${hash}.${ext}`;
                const filePath = path.join(UPLOADS_DIR, filename);
                fs.writeFileSync(filePath, buffer);
                return `/uploads/${filename}`;
            }
        } catch (e) {
            console.error("Fallback save failed:", e.message);
        }
        return base64Str;
    }
}

async function recursiveProcess(obj) {
    if (typeof obj === 'string') {
        if (obj.startsWith('data:image/')) {
            return await processBase64(obj);
        }
        if (obj.startsWith('[') || obj.startsWith('{')) {
            try {
                const parsed = JSON.parse(obj);
                const processed = await recursiveProcess(parsed);
                return JSON.stringify(processed);
            } catch (e) {
                return obj;
            }
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        const res = [];
        for (const item of obj) {
            res.push(await recursiveProcess(item));
        }
        return res;
    }
    if (obj !== null && typeof obj === 'object') {
        const res = {};
        for (const k of Object.keys(obj)) {
            res[k] = await recursiveProcess(obj[k]);
        }
        return res;
    }
    return obj;
}

async function migrate() {
    console.log("Starting resilient connection-pooled mysql2 DB image migration...");
    const pool = mysql.createPool({
        host: '103.108.220.145',
        user: 'vgyuvmpi_gethotel_db',
        password: 'shriyanshking',
        database: 'vgyuvmpi_gethotel_db',
        port: 3306,
        connectionLimit: 3,
        connectTimeout: 60000,
        enableKeepAlive: true
    });

    pool.on('connection', function (connection) {
        console.log("[Pool] Configuring database session timeouts for new connection...");
        connection.query("SET SESSION net_read_timeout = 600");
        connection.query("SET SESSION net_write_timeout = 600");
        connection.query("SET SESSION wait_timeout = 600");
    });

    // 1. Process Hotels
    console.log("Fetching hotels that need base64 migration...");
    const [hotelIds] = await pool.execute(
        "SELECT id, name FROM hotel WHERE thumbnail LIKE 'data:image/%' OR images LIKE '%data:image/%' OR images LIKE '%base64%'"
    );
    console.log(`Found ${hotelIds.length} hotels needing migration. Processing...`);

    for (const hInfo of hotelIds) {
        console.log(`\n[Hotel] Processing ID ${hInfo.id} ("${hInfo.name}")...`);
        
        // 1.1 Process Thumbnail
        console.log(`  -> Querying thumbnail for ID ${hInfo.id}...`);
        let hThumb;
        let successThumb = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const [rows] = await pool.execute({
                    sql: "SELECT thumbnail FROM hotel WHERE id = ?",
                    values: [hInfo.id],
                    timeout: 180000 // 3 minutes timeout for thumbnail
                });
                if (rows.length > 0) {
                    hThumb = rows[0].thumbnail;
                    successThumb = true;
                    break;
                }
            } catch (queryErr) {
                console.error(`     [Attempt ${attempt}/3] ⚠️ Fetch thumbnail failed:`, queryErr.message);
                if (attempt === 3) break;
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        if (successThumb && hThumb && hThumb.startsWith('data:image/')) {
            try {
                console.log(`  -> Converting thumbnail (size: ${hThumb.length} chars)...`);
                const newThumb = await processBase64(hThumb);
                
                // Update thumbnail
                let updateSuccess = false;
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        await pool.execute({
                            sql: "UPDATE hotel SET thumbnail = ? WHERE id = ?",
                            values: [newThumb, hInfo.id],
                            timeout: 180000
                        });
                        console.log(`  -> ✅ Successfully updated thumbnail for Hotel ID ${hInfo.id}`);
                        updateSuccess = true;
                        break;
                    } catch (updateErr) {
                        console.error(`     [Attempt ${attempt}/3] ⚠️ Update thumbnail failed:`, updateErr.message);
                        if (attempt === 3) break;
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
            } catch (processErr) {
                console.error(`  -> ⚠️ Thumbnail process failed:`, processErr.message);
            }
        } else {
            console.log("  -> Thumbnail is already migrated or empty.");
        }

        // 1.2 Process Images
        console.log(`  -> Querying images for ID ${hInfo.id}...`);
        let hImgs;
        let successImgs = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const [rows] = await pool.execute({
                    sql: "SELECT images FROM hotel WHERE id = ?",
                    values: [hInfo.id],
                    timeout: 600000 // 10 minutes timeout for images
                });
                if (rows.length > 0) {
                    hImgs = rows[0].images;
                    successImgs = true;
                    break;
                }
            } catch (queryErr) {
                console.error(`     [Attempt ${attempt}/3] ⚠️ Fetch images failed:`, queryErr.message);
                if (attempt === 3) break;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (successImgs && hImgs && (hImgs.includes('data:image/') || hImgs.includes('base64'))) {
            try {
                console.log(`  -> Converting images (size: ${hImgs.length} chars)...`);
                const newImgs = await recursiveProcess(hImgs);
                
                // Update images
                let updateSuccess = false;
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        await pool.execute({
                            sql: "UPDATE hotel SET images = ? WHERE id = ?",
                            values: [newImgs, hInfo.id],
                            timeout: 600000
                        });
                        console.log(`  -> ✅ Successfully updated images for Hotel ID ${hInfo.id}`);
                        updateSuccess = true;
                        break;
                    } catch (updateErr) {
                        console.error(`     [Attempt ${attempt}/3] ⚠️ Update images failed:`, updateErr.message);
                        if (attempt === 3) break;
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
            } catch (processErr) {
                console.error(`  -> ⚠️ Images process failed:`, processErr.message);
            }
        } else {
            console.log("  -> Images are already migrated or empty.");
        }
    }

    // 2. Process Rooms
    console.log("\nFetching rooms that need base64 migration...");
    const [roomIds] = await pool.execute(
        "SELECT id, name FROM room WHERE images LIKE '%data:image/%' OR images LIKE '%base64%'"
    );
    console.log(`Found ${roomIds.length} rooms needing migration. Processing...`);

    for (const rInfo of roomIds) {
        console.log(`\n[Room] Querying base64 fields for Room ID ${rInfo.id} ("${rInfo.name}")...`);
        let r;
        let success = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const [rows] = await pool.execute({
                    sql: "SELECT images FROM room WHERE id = ?",
                    values: [rInfo.id],
                    timeout: 300000 // 5 minutes timeout
                });
                if (rows.length === 0) break;
                r = rows[0];
                success = true;
                break;
            } catch (queryErr) {
                console.error(`[Room]  -> [Attempt ${attempt}/3] ⚠️ Fetch failed for Room ID ${rInfo.id}:`, queryErr.message);
                if (attempt === 3) break;
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        if (!success || !r) continue;

        let updated = false;
        let newImgs = r.images;

        try {
            if (r.images && (r.images.includes('data:image/') || r.images.includes('base64'))) {
                console.log(`[Room] Converting images for Room ID ${rInfo.id} ("${rInfo.name}", size: ${r.images.length} chars)...`);
                newImgs = await recursiveProcess(r.images);
                updated = true;
            }
        } catch (processErr) {
            console.error(`[Room] ⚠️ Image process failed for Room ID ${rInfo.id}:`, processErr.message);
            continue;
        }

        if (updated) {
            let updateSuccess = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    await pool.execute({
                        sql: "UPDATE room SET images = ? WHERE id = ?",
                        values: [newImgs, rInfo.id],
                        timeout: 300000
                    });
                    console.log(`  -> ✅ Successfully updated Room ID ${rInfo.id}`);
                    updateSuccess = true;
                    break;
                } catch (updateErr) {
                    console.error(`[Room]  -> [Attempt ${attempt}/3] ⚠️ Update failed for Room ID ${rInfo.id}:`, updateErr.message);
                    if (attempt === 3) break;
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }
    }

    console.log("\nMigration completed successfully!");
    await pool.end();
}

migrate().catch(console.error);
