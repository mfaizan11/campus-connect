
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log("[Firebase Config] Raw env values:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Loaded' : 'MISSING!',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Loaded' : 'MISSING!',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Loaded' : 'MISSING!',
  // Add other checks as needed
});

console.log("[Firebase Config] Using effective config:", firebaseConfig);

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    try {
      console.log("[Firebase] Attempting to initialize app...");
      app = initializeApp(firebaseConfig);
      console.log(`[Firebase] App initialized successfully. Project ID from app.options: ${app.options.projectId || 'Not found in app.options'}`);
      
      console.log("[Firebase] Attempting to get Firestore instance...");
      db = getFirestore(app);
      if (db) {
        console.log("[Firebase] Firestore instance (db) obtained successfully.");
      } else {
        console.error("[Firebase] FAILED to get Firestore instance (db is null).");
      }
      
      console.log("[Firebase] Attempting to get Auth instance...");
      auth = getAuth(app);
      if (auth) {
        console.log("[Firebase] Auth instance obtained successfully.");
      } else {
        console.error("[Firebase] FAILED to get Auth instance (auth is null).");
      }

    } catch (error) {
      console.error("[Firebase] INITIALIZATION ERROR:", error);
      console.error("[Firebase] Config used during error:", firebaseConfig);
    }
  } else {
    app = getApp();
    console.log(`[Firebase] Re-using existing app. Project ID from app.options: ${app.options.projectId || 'Not found in app.options'}`);
    try {
      console.log("[Firebase] Attempting to get Firestore instance for existing app...");
      db = getFirestore(app);
      if (db) {
        console.log("[Firebase] Firestore instance (db) obtained successfully for existing app.");
      } else {
        console.error("[Firebase] FAILED to get Firestore instance for existing app (db is null).");
      }

      console.log("[Firebase] Attempting to get Auth instance for existing app...");
      auth = getAuth(app);
      if (auth) {
        console.log("[Firebase] Auth instance obtained successfully for existing app.");
      } else {
        console.error("[Firebase] FAILED to get Auth instance for existing app (auth is null).");
      }
    } catch (error) {
         console.error("[Firebase] Error getting Firestore/Auth for existing app:", error);
    }
  }
} else {
  console.log("[Firebase] Skipping client-side initialization on server (this is normal for config file).");
}


export { app, auth, db };
