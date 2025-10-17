import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

// Firebase configuration using environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCGvaYH_zL-vefP4Bm83MdDn9DXAlCDiGk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bus-tracking-7706d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bus-tracking-7706d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bus-tracking-7706d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "217343122092",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:217343122092:web:15338fb293406602689d09"
};

// Initialize Firebase with proper types and error handling
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with optimized settings for real-time updates
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true,
  });
  
  // Configure Firestore settings for better real-time connection handling
  // Uncomment the following line if you want to use the emulator for development
  // connectFirestoreEmulator(db, 'localhost', 8080);
  
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Configure Auth settings
  if (auth) {
    // Disable popup blocking warning in development
    auth.settings.appVerificationDisabledForTesting = false;
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback to prevent app crash
  app = null;
  db = null;
  auth = null;
  googleProvider = null;
}

export { db, auth, googleProvider };