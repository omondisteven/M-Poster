// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCD-eSyAlOxCWtu1KgzSLyy_F9SxCUt8FM",
  authDomain: "m-poster.firebaseapp.com",
  projectId: "m-poster",
  storageBucket: "m-poster.firebasestorage.app",
  messagingSenderId: "609130575807",
  appId: "1:609130575807:web:63a629768700179c35130a",
  measurementId: "G-333J85EMRC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);