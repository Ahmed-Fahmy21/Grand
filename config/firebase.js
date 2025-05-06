import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJCLU54E97ONCb7_9AK22-30KctlAt64E",
  authDomain: "grand-81f8c.firebaseapp.com",
  projectId: "grand-81f8c",
  storageBucket: "grand-81f8c.firebasestorage.app",
  messagingSenderId: "853842963252",
  appId: "1:853842963252:web:2d4977bca6edadc52f5361",
  measurementId: "G-RTPV02YE34"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);