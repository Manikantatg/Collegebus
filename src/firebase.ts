import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCGvaYH_zL-vefP4Bm83MdDn9DXAlCDiGk",
  authDomain: "bus-tracking-7706d.firebaseapp.com",
  projectId: "bus-tracking-7706d",
  storageBucket: "bus-tracking-7706d.firebasestorage.app",
  messagingSenderId: "217343122092",
  appId: "1:217343122092:web:15338fb293406602689d09"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };