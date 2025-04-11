import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyCbDI231mKJvFEfxdb0ZrSMofsMCcXR29Q",
    authDomain: "signup-57430.firebaseapp.com",
    projectId: "signup-57430",
    storageBucket: "signup-57430.firebasestorage.app",
    messagingSenderId: "54026540686",
    appId: "1:54026540686:web:866a3ddafc6b31fe2adbdf"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };

