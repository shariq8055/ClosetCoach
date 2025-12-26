// Firebase configuration for ClosetCoach
// Using new project: closetcoach-new-vers-01 (free tier with Auth + Firestore)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDQkKE2EZhutEkCSCyyYmgubPVs-_Gd_uU",
    authDomain: "closetcoach-new-vers-01.firebaseapp.com",
    projectId: "closetcoach-new-vers-01",
    storageBucket: "closetcoach-new-vers-01.firebasestorage.app",
    messagingSenderId: "237162018282",
    appId: "1:237162018282:web:f80e21e05e11168143ae93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore (used for both metadata and image storage as base64)
export const db = getFirestore(app);

export default app;
