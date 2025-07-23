// firebase.ts
import { initializeApp } from "firebase/app";
import { enableIndexedDbPersistence, getFirestore, FirestoreError } from "firebase/firestore";

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

// Enable offline persistence with async/await and better error handling
const enablePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Firestore persistence enabled');
  } catch (err) {
    if (err instanceof Error) {
      const firestoreError = err as FirestoreError;
      if (firestoreError.code === 'failed-precondition') {
        console.warn('Persistence can only be enabled in one tab at a time.');
      } else if (firestoreError.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence.');
      } else {
        console.warn('Error enabling persistence:', firestoreError);
      }
    } else {
      console.warn('Unknown error enabling persistence:', err);
    }
  }
};

// Call the persistence function immediately after initialization
enablePersistence();

export { app };