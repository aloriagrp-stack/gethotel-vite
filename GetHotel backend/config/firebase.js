const admin = require('firebase-admin');

// In a real production app, you'd use a service account JSON file
// For now, we'll initialize it with basic info or check if it's already initialized
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID,
            // If you have a service account JSON, you would use credential: admin.credential.cert(serviceAccount)
            // But for ID token verification, often just the Project ID is enough if running in GCP
            // However, on local/other servers, you NEED a service account.
        });
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase Admin Init Error:', error.stack);
    }
}

module.exports = admin;
