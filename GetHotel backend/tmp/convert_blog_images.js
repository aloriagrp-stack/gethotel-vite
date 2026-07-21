const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', '..', 'blogs.gethotelstays.com', 'assets');

async function convertImages() {
  console.log(`Scanning assets in: ${assetsDir}`);
  if (!fs.existsSync(assetsDir)) {
    console.error(`Directory not found: ${assetsDir}`);
    return;
  }

  const files = fs.readdirSync(assetsDir);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG file(s) to convert.`);

  for (const file of pngFiles) {
    const srcPath = path.join(assetsDir, file);
    const destName = path.basename(file, path.extname(file)) + '.webp';
    const destPath = path.join(assetsDir, destName);

    console.log(`Converting: ${file} -> ${destName}...`);
    try {
      await sharp(srcPath)
        .webp({ quality: 80 })
        .toFile(destPath);
      
      console.log(`Success! File size: ${(fs.statSync(destPath).size / 1024).toFixed(2)} KB (original was ${(fs.statSync(srcPath).size / 1024).toFixed(2)} KB)`);

      // Delete original PNG file
      fs.unlinkSync(srcPath);
      console.log(`Deleted original: ${file}`);
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }

  console.log('Conversion complete!');
}

convertImages();
