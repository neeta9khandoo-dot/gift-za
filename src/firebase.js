// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBx01_b7Dkm6QCnZiGnSrRK0dZGf9p5IaY",
        authDomain: "gift-za.firebaseapp.com",
        projectId: "gift-za",
        storageBucket: "gift-za.firebasestorage.app",
        messagingSenderId: "732762883935",
        appId: "1:732762883935:web:1fc9b21f71c9ffaa43d8ea",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;