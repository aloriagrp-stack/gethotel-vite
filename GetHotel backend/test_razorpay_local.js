const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the exact backend .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('--- CREDENTIAL DIAGNOSTICS ---');
console.log('Raw Key ID Length:', keyId ? keyId.length : 0);
console.log('Raw Key Secret Length:', keySecret ? keySecret.length : 0);
console.log('JSON Key ID:', JSON.stringify(keyId));
console.log('JSON Key Secret:', JSON.stringify(keySecret));

if (!keyId || !keySecret) {
    console.error('Error: Credentials not found in environment!');
    process.exit(1);
}

// Strip any carriage returns or newlines to ensure it is clean
const cleanKeyId = keyId.replace(/[\r\n]/g, '').trim();
const cleanKeySecret = keySecret.replace(/[\r\n]/g, '').trim();

console.log('\n--- CLEANED CREDENTIALS ---');
console.log('Clean Key ID Length:', cleanKeyId.length);
console.log('Clean Key Secret Length:', cleanKeySecret.length);
console.log('JSON Clean Key ID:', JSON.stringify(cleanKeyId));
console.log('JSON Clean Key Secret:', JSON.stringify(cleanKeySecret));

const rzp = new Razorpay({
    key_id: cleanKeyId,
    key_secret: cleanKeySecret
});

console.log('\nAttempting to create test order of 100 Paisa (1 INR) via Razorpay...');
rzp.orders.create({
    amount: 100,
    currency: 'INR',
    receipt: 'test_receipt_diag_1'
}).then(order => {
    console.log('\nSUCCESS! Razorpay created the order:', order);
}).catch(err => {
    console.error('\nERROR: Razorpay rejected the request:', err);
});
