// Firebase Admin SDK Configuration
const admin = require('firebase-admin');

// Initialize Firebase Admin
// You can use service account key or environment variables
let firebaseAdmin;

try {
  // Option 1: Using service account key file (for local development)
  // Download from Firebase Console > Project Settings > Service Accounts
  // const serviceAccount = require('./serviceAccountKey.json');
  
  // Option 2: Using environment variables (for production)
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CERT_URL
  };

  // Only initialize if credentials are provided
  if (serviceAccount.project_id && serviceAccount.private_key) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.log('⚠️ Firebase Admin not initialized - missing credentials');
    console.log('💡 App will use in-memory storage for development');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  console.log('💡 App will use in-memory storage');
}

const db = firebaseAdmin ? admin.firestore() : null;
const auth = firebaseAdmin ? admin.auth() : null;

module.exports = { admin, db, auth, isInitialized: !!firebaseAdmin };
