import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./Home";
import {
  RedeemVoucherPage,
  HelpCentrePage,
  ContactPage,
  PrivacyPage,
  TermsPage,
} from "./FooterPages";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBx01_b7Dkm6QCnZiGnSrRK0dZGf9p5IaY",
  authDomain: "gift-za.firebaseapp.com",
  projectId: "gift-za",
  storageBucket: "gift-za.firebasestorage.app",
  messagingSenderId: "732762883935",
  appId: "1:732762883935:web:1fc9b21f71c9ffaa43d8ea",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Wrapper so useNavigate works inside BrowserRouter ────
function AppRoutes() {
  const navigate = useNavigate();
  const guardedSetPage = () => {};

  // Called by AuthPage after successful login or register
  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Home db={db} onAuthSuccess={handleAuthSuccess} />}
      />
      <Route path="/redeem" element={<RedeemVoucherPage />} />
      <Route
        path="/help"
        element={<HelpCentrePage setPage={guardedSetPage} />}
      />
      <Route
        path="/contact"
        element={<ContactPage setPage={guardedSetPage} />}
      />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
