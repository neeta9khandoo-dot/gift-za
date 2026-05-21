/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./Home";
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

// Firebase config (keep yours here)
const firebaseConfig = {
  /* your config */
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Navigation component ──────────────────────────────────
// Uses <a href> for static HTML pages, <Link> for React pages
function Nav() {
  return (
    <nav>
      <Link to="/">Home</Link>

      {/* Static HTML pages — plain anchor tags, not React Router Links */}
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
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        {/* React-managed pages */}
        <Route path="/" element={<Home db={db} />} />

        {/*
          Static HTML pages (about-us.html, contact.html, etc.) are NOT
          routed through React — they are served directly by your web server.
          Users navigating to /about-us.html bypass React entirely.
          No <Route> needed for them here.
        */}
      </Routes>
    </BrowserRouter>
  );
}
