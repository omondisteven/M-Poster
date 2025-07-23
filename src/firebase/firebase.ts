// firebase.ts
import { initializeApp } from "firebase/app";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";

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

// Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Offline persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support offline persistence.');
    }
  });