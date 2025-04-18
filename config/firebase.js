import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2MYmypp4TAlTjuoLnqa1MZJAlINgAgzI",
  authDomain: "fir-e0629.firebaseapp.com",
  projectId: "fir-e0629",
  storageBucket: "fir-e0629.appspot.com",
  messagingSenderId: "682369373240",
  appId: "1:682369373240:web:9f3e4e7f61df47ed12c2cd",
  measurementId: "G-Z84S8R7Y3N",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
