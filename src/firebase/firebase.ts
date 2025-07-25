// firebase.ts
import { initializeApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

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

// Initialize Firestore with persistent cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { app };