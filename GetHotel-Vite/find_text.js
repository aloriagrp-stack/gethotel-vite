const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'HotelDetailContent.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const target1 = "sInfo.originalPrice * stayNights";
const idx1 = content.indexOf(target1);
console.log(`Index of "${target1}": ${idx1}`);
if (idx1 !== -1) {
  console.log("Surrounding text 1:", content.slice(idx1 - 100, idx1 + 100));
}

const target2 = "formatPrice(totalStayPrice)";
const idx2 = content.indexOf(target2);
console.log(`Index of "${target2}": ${idx2}`);
if (idx2 !== -1) {
  console.log("Surrounding text 2:", content.slice(idx2 - 100, idx2 + 100));
}

const idx3 = content.lastIndexOf(target2);
console.log(`Last Index of "${target2}": ${idx3}`);
if (idx3 !== -1) {
  console.log("Surrounding text 3:", content.slice(idx3 - 100, idx3 + 100));
}
