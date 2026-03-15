import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// These are placeholders. You will get these from the Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyCarIL18IARdssslYntOOY-tCBVRGRrshw",
  authDomain: "immunege.firebaseapp.com",
  projectId: "immunege",
  storageBucket: "immunege.firebasestorage.app",
  messagingSenderId: "1001656113599",
  appId: "1:1001656113599:web:3b3531ffc60b692675690a",
  measurementId: "G-WJ84C9LGXQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
