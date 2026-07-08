import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase keys are provided and not placeholders
export const isFirebaseEnabled = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.apiKey !== "";

let auth = null;
let db = null;
let storage = null;

if (isFirebaseEnabled) {
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.warn("Firebase credentials are not configured or are placeholders. Running in Local Storage Mode.");
}

export { auth, db, storage };
