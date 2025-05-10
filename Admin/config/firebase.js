import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwj-JXEVUpXgcAvosfjstd1VAC2W4SerA",
  authDomain: "grand-hotel-181ff.firebaseapp.com",
  projectId: "grand-hotel-181ff",
  storageBucket: "grand-hotel-181ff.firebasestorage.app",
  messagingSenderId: "493927339643",
  appId: "1:493927339643:web:b8d0cff30aced33652f4de",
  measurementId: "G-355EBNP3Y9",
};

const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
const db = getFirestore(app);

export  { auth, db };
