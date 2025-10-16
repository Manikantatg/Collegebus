import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGvaYH_zL-vefP4Bm83MdDn9DXAlCDiGk",
  authDomain: "bus-tracking-7706d.firebaseapp.com",
  projectId: "bus-tracking-7706d",
  storageBucket: "bus-tracking-7706d.firebasestorage.app",
  messagingSenderId: "217343122092",
  appId: "1:217343122092:web:15338fb293406602689d09"
};

// Initialize Firebase with proper types and error handling
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Enable offline persistence
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firebase persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support all of the features required to enable persistence
        console.warn('Firebase persistence not supported by browser');
      }
    });
  }
  
  // Configure Firestore settings for better connection handling
  // Uncomment the following line if you want to use the emulator for development
  // connectFirestoreEmulator(db, 'localhost', 8080);
  
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Configure Auth settings
  if (auth) {
    // Enable persistence for better offline support
    // This requires additional imports and setup
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