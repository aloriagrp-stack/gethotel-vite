try {
    console.log("1. Requiring sharp...");
    const sharp = require('sharp');
    console.log("Sharp required successfully.");

    console.log("2. Creating a small 1x1 image buffer...");
    const buffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
    );

    console.log("3. Processing with sharp to WebP...");
    const t0 = Date.now();
    sharp(buffer)
        .webp()
        .toBuffer()
        .then(out => {
            console.log(`Sharp processed successfully in ${Date.now() - t0}ms, output size: ${out.length} bytes`);
        })
        .catch(err => {
            console.error("Sharp promise rejected:", err);
        });
} catch (err) {
    console.error("Sharp failed during execution:", err);
}
