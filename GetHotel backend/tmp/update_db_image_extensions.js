const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'blogs.gethotelstays.com', 'articles_db.js');

function updateExtensions() {
  console.log(`Reading database at: ${dbPath}`);
  if (!fs.existsSync(dbPath)) {
    console.error('articles_db.js not found!');
    return;
  }

  let content = fs.readFileSync(dbPath, 'utf8');

  // We want to replace all occurrences of assets/...png with assets/...webp
  // To be safe, we can target "assets/anything.png"
  const regex = /"assets\/([^"]+)\.png"/g;
  
  let match;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    count++;
  }

  console.log(`Found ${count} occurrences of local PNG assets in articles_db.js.`);

  if (count > 0) {
    content = content.replace(regex, '"assets/$1.webp"');
    fs.writeFileSync(dbPath, content, 'utf8');
    console.log('Successfully updated all PNG references to WebP!');
  } else {
    console.log('No PNG references found or already updated.');
  }
}

updateExtensions();
