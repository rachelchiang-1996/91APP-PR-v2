
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCM0t2PiEaWSMFrV55ORfrWwuAQyx-CXE",
  authDomain: "app-pr-42390.firebaseapp.com",
  projectId: "app-pr-42390",
  storageBucket: "app-pr-42390.firebasestorage.app",
  messagingSenderId: "36128525510",
  appId: "1:36128525510:web:3bb248855996a75c2e5bc7",
  measurementId: "G-NT1Q2EZJFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
