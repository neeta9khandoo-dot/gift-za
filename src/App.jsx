/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./Home";
import { RedeemVoucherPage, HelpCentrePage, ContactPage, PrivacyPage, TermsPage } from "./FooterPages";
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

// ── Navigation component ──────────────────────────────────
// Uses <a href> for static HTML pages, <Link> for React pages
function Nav() {
  return (
    <nav>
      <Link to="/">Home</Link>

      <a href="/about-us.html">About Us</a>
      <a href="/contact.html">Contact</a>
      <a href="/corporate.html">Corporate</a>
      <a href="/help.html">Help</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </nav>
  );
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  // placeholder for guardedSetPage used by some footer pages
  const guardedSetPage = () => {};
  return (
    <BrowserRouter>
     
      <Routes>

        {/* React-managed pages */}
        <Route path="/" element={<Home db={db} />} />
        <Route path="/redeem" element={<RedeemVoucherPage />} />
        <Route path="/help" element={<HelpCentrePage setPage={guardedSetPage} />} />
        <Route path="/contact" element={<ContactPage setPage={guardedSetPage} />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
