// Import Firebase
import { initializeApp } from "firebase/app";
import {browserLocalPersistence, getAuth, setPersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_g10KDvBo_kFoN1pTy1b1o2QyUfZGU9E",
    authDomain: "d8-byte.firebaseapp.com",
    databaseURL: "https://d8-byte-default-rtdb.firebaseio.com",
    projectId: "d8-byte",
    storageBucket: "d8-byte.firebasestorage.app",
    messagingSenderId: "850343967666",
    appId: "1:850343967666:web:bc4e0fdba004b0dab3c2ab",
    measurementId: "G-C3Z6NHJERF"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app); // Renamed from `db` to `firestore`
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
