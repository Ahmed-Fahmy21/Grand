import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPi1brBcO4KK8JU7WLh_vvmGSmjxwzcqM",
  authDomain: "grand-18c1d.firebaseapp.com",
  projectId: "grand-18c1d",
  storageBucket: "grand-18c1d.firebasestorage.app",
  messagingSenderId: "933701558109",
  appId: "1:933701558109:web:9bd6f8998113cdafa952b4",
  measurementId: "G-LM3XQ75DPK"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);