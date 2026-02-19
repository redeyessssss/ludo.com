// Firebase Client Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBtMrxifXhN7nQH26CcMVLO5-8FgvbnKBc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ludo-57759.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ludo-57759-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ludo-57759",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ludo-57759.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "739331687543",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:739331687543:web:1ce0aa76d9d0176ed63272",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MHR6PHH9K8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

console.log('✅ Firebase initialized:', firebaseConfig.projectId);

export default app;
