// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJp9IZusCXEbBcROFagBu8VeIl_JswD-8",
  authDomain: "grand-hotel-88487.firebaseapp.com",
  projectId: "grand-hotel-88487",
  storageBucket: "grand-hotel-88487.firebasestorage.app",
  messagingSenderId: "21308574589",
  appId: "1:21308574589:web:64214ddef6963dd57c1a14"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)});
