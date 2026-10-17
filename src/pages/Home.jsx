/* eslint-disable no-unused-vars */

import { Link } from "react-router-dom";
import React, { useState, useEffect, useCallback, useRef } from "react";
import CSS from './globalCss.js';
import PartnerPage from "./PartnerPage.jsx";
import CookieConsent from "../components/CookieConsent.jsx";
import {
  Flower2,
  Cake,
  Heart,
  Music,
  GraduationCap,
  UtensilsCrossed,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import StorePage from "./StorePage";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import AdminPage from "./AdminPage";
import CategoryPage from "./CategoryPage";
import AuthPage from "./AuthPage";
import OrdersPage from "./OrdersPage";
import PartnersPage from "./PartnersPage";
import PrivacyPage from "./PrivacyPage"
import RedeemPage from "./RedeemPage";
import TermsPage from "./TermsPage";
import Footer from "../components/Footer";
import ContactPage from "./ContactPage";
import HelpCentrePage from "./HelpCentrePage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import greatZimbabwe from "../images/zimbabwe-v.jpg";
// ─── Firebase Init ────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const WORKER_URL = process.env.REACT_APP_WORKER_URL;
const UPLOAD_SECRET = process.env.REACT_APP_UPLOAD_SECRET;
const ZAR_TO_USD = 16.53;
// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = (n) =>
  `US$${(Number(n) / ZAR_TO_USD).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const genCode = () =>
  "VCH-" +
  [...Array(8)]
    .map(
      () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
    )
    .join("");

const QR_URL = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1A2E1F&bgcolor=F5F0E8&data=${encodeURIComponent(data)}`;

const getCatIcon = (cat) =>
  ({
    Wellness: "🧖",
    Beauty: "💅",
    Adventure: "🪂",
    "Dining & Wine": "🍷",
    Stays: "🏡",
    Skills: "📚",
    Music: "🎵",
    Events: "🎪",
    Florists: "🌸",
    Other: "🎁",
  })[cat] || "🎁";

// ─── Voucher Templates (seeded on new partner registration) ───────────────
const VOUCHER_TEMPLATES = [
 
  {
    name: "Masvingo Heritage Escape",
    category: "Stays",
    price: 3600,
    validMonths: 12,
    icon: "masvingo_escape",
    desc: "One night bed & breakfast plus a private guided tour of the Great Zimbabwe National Monument. History, luxury and nature in one gift.",
  },
];

const HERO_CSS = `
.hv3{max-width:1200px;margin:0 auto;padding:20px 16px 8px;display:grid;
  grid-template-columns:2fr 1fr;gap:24px}
.hv3-main{position:relative;height:345px;border-radius:18px;overflow:hidden;
  background:#8ec5ea;
  background-image:radial-gradient(circle at 20% 20%,rgba(255,255,255,.18) 0 2px,transparent 3px),
                   radial-gradient(circle at 70% 60%,rgba(255,255,255,.14) 0 2px,transparent 3px);
  background-size:46px 46px}
.hv3-track{display:flex;height:100%;transition:transform .6s cubic-bezier(.4,0,.2,1)}
.hv3-slide{flex:0 0 100%;position:relative;display:flex;align-items:center;cursor:pointer}
.hv3-copy{position:relative;z-index:2;padding:0 0 0 56px;max-width:60%}
.hv3-title{font-size:clamp(1.8rem,4.2vw,3rem);font-weight:800;line-height:1.1;
  color:#000;margin:0 0 12px;letter-spacing:-.5px}
.hv3-sub{font-size:1.15rem;color:#111;margin:0 0 22px;font-weight:300}
.hv3-cta{background:none;border:none;padding:0;font-weight:800;font-size:.78rem;
  letter-spacing:.5px;color:#000;cursor:pointer}
.hv3-cta:hover{text-decoration:underline}
.hv3-img{position:absolute;right:0;bottom:0;height:100%;width:42%;
  object-fit:cover;object-position:center top;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 28%);
  mask-image:linear-gradient(to right,transparent 0,#000 28%)}
.hv3-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:5;
  width:50px;height:50px;border-radius:50%;border:none;background:#fff;
  box-shadow:0 4px 14px rgba(0,0,0,.18);font-size:1.6rem;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  line-height:1;padding:0 0 3px}
.hv3-arrow.prev{left:12px;color:#000}
.hv3-arrow.next{right:12px;color:#f0a030}
.hv3-arrow:hover{transform:translateY(-50%) scale(1.08)}
.hv3-dots{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);
  display:flex;gap:6px;z-index:5}
.hv3-dot{width:7px;height:7px;border-radius:50%;border:none;padding:0;
  background:rgba(255,255,255,.7);cursor:pointer;transition:all .3s}
.hv3-dot.on{background:#3a9be8;width:20px;border-radius:4px}
 
.hv3-side{position:relative;height:345px;border-radius:18px;overflow:hidden;
  background:#c4e0f5;display:flex;flex-direction:column;align-items:center;
  text-align:center;padding:16px 18px 0}
.hv3-logo{background:#4aa59a;color:#fff;font-style:italic;font-weight:700;
  font-size:.85rem;padding:9px 16px;border-radius:6px;margin-bottom:22px}
.hv3-side-title{font-size:1.2rem;line-height:1.7;color:#111;margin:0;font-weight:400}
.hv3-side-stage{position:relative;flex:1;width:100%;display:flex;
  align-items:flex-end;justify-content:center;gap:6px;font-size:4.2rem;
  padding-bottom:6px}
.hv3-side-stage span:nth-child(2){font-size:5.4rem}
.hv3-side-btn{position:absolute;top:14px;left:50%;transform:translateX(-50%);
  background:#000;color:#fff;border:none;border-radius:10px;padding:10px 18px;
  font-size:.8rem;font-weight:700;cursor:pointer;z-index:2;white-space:nowrap}
.hv3-side-btn:hover{background:#222}
 
@media (max-width:900px){
  .hv3{grid-template-columns:1fr;gap:16px}
  .hv3-main{height:300px}
  .hv3-copy{padding-left:56px;max-width:68%}
  .hv3-side{height:290px}
}
@media (max-width:520px){
  .hv3-main{height:260px}
  .hv3-copy{padding-left:46px;max-width:72%}
  .hv3-sub{font-size:.9rem;margin-bottom:14px}
  .hv3-arrow{width:38px;height:38px;font-size:1.3rem}
  .hv3-arrow.prev{left:6px}.hv3-arrow.next{right:6px}
  .hv3-img{width:46%;opacity:.85}
}
`;
async function seedUserVouchers(uid, businessName, email) {
  const userVouchersRef = collection(db, "users", uid, "vouchers");
  const batch = writeBatch(db);
  VOUCHER_TEMPLATES.forEach((tpl) => {
    const voucherRef = doc(userVouchersRef);
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + tpl.validMonths);
    batch.set(voucherRef, {
      code: genCode(),
      name: tpl.name,
      category: tpl.category,
      price: tpl.price,
      icon: tpl.icon,
      desc: tpl.desc,
      validMonths: tpl.validMonths,
      expiryDate: expiryDate.toISOString(),
      status: "active",
      businessName,
      businessEmail: email,
      uid,
      soldCount: 0,
      totalRevenue: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

// ══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════
const PROMO_SLIDES = [
  { emoji:"🧖", bg:"linear-gradient(135deg,#1a2e1f,#0a1f12)", tag:"Wellness", name:"Couples Spa Day", price:"From US$109", cat:"Wellness" },
  { emoji:"🍲", bg:"linear-gradient(135deg,#2e1a0e,#140a00)", tag:"Traditional", name:"Send Mum a Proper Meal", price:"From US$15", cat:"Traditional Restaurants" },
  { emoji:"🎵", bg:"linear-gradient(135deg,#1a1a2e,#09071a)", tag:"Music", name:"Live Jazz Evening", price:"From US$47", cat:"Music" },
  { emoji:"🪂", bg:"linear-gradient(135deg,#000d1a,#001a33)", tag:"Adventure", name:"Tandem Skydive", price:"From US$179", cat:"Adventure" },
  { emoji:"🌸", bg:"linear-gradient(135deg,#160a10,#2e1a1f)", tag:"Florists", name:"Luxury Rose Arrangement", price:"From US$21", cat:"Florists" },
  { emoji:"🏡", bg:"linear-gradient(135deg,#1a2e1f,#0e1f14)", tag:"Stays", name:"Ancient City Lodge", price:"From US$169", cat:"Stays" },
];
export function AnnounceBannerV2() {
  const [banners] = React.useState([
    { icon: '🚀', text: '<strong>NEW:</strong> Traditional Restaurant vouchers now live — send mum lunch from anywhere', bg: '#1a1a1a', accent: '#ff6b35' },
    { icon: '🎁', text: '<strong>FREE WhatsApp delivery</strong> on all vouchers · Instant, every time', bg: '#0a1628', accent: '#38bdf8' },
    { icon: '🇿🇼', text: 'Supporting <strong>200+ Zimbabwean businesses</strong> · Weekly EFT payouts to partners', bg: '#0a1f12', accent: '#4ade80' },
  ]);
  const [idx, setIdx] = React.useState(0);
 
  React.useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);
 
  const b = banners[idx];
 
  return (
    <div style={{
      background: b.bg,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      transition: 'background .5s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* accent glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 40,
        background: `radial-gradient(ellipse, ${b.accent}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <span style={{ fontSize: '1rem' }}>{b.icon}</span>
      <span
        style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.8)', fontWeight: 500, position: 'relative' }}
        dangerouslySetInnerHTML={{ __html: b.text }}
      />
      {/* Dots */}
      <div style={{ display: 'flex', gap: 4, marginLeft: 12, position: 'relative' }}>
        {banners.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 16 : 5, height: 5,
            borderRadius: 3, border: 'none',
            background: i === idx ? b.accent : 'rgba(255,255,255,.25)',
            cursor: 'pointer', padding: 0, transition: 'all .3s',
          }} />
        ))}
      </div>
    </div>
  );
} 
function Nav({ page, setPage, user, onLogout, onSearch }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
const userRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (userRef.current && !userRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = user
    ? (user.displayName || user.email || "Login")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "Login";
  const navLinks = [
    ["store", "Experiences"],
    ["partners", "For Partners"],
    ["redeem", "Redeem"],
    ["admin", "Admin"],
  ];
  const handleNavClick = (p) => {
    setPage(p);
    setMobileOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => handleNavClick("store")}>
          <img
            src="/images/logo.png"
            alt="AfriVoucher"
            style={{
              height: 48,
              width: "auto",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          Afri<span>Voucher</span>
        </button>
        <button className="nav-address-btn">
  <span className="nav-addr-pin">📍</span>
  Zimbabwe
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color:'var(--muted)'}}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
</button>
        <div className="nav-search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--muted)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Spa day, wine tasting, live music, events…"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="nav-links">
          {navLinks.map(([p, label]) => (
            <button
              key={p}
              className={`nav-link${page === p ? " active" : ""}`}
              onClick={() => handleNavClick(p)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="nav-cta" onClick={() => handleNavClick("partners")}>
          List Your Business
        </button>
        
        {user && (
  <div className="nav-user" ref={userRef}>
    <button
      className="nav-user-btn"
      onClick={() => setDropdownOpen((o) => !o)}
      aria-haspopup="true"
      aria-expanded={dropdownOpen}
    >
      <div className="nav-avatar">{initials}</div>
      <span className="nav-user-name">{user.displayName || user.email?.split("@")[0]}</span>
      <svg
        className={`nav-chevron${dropdownOpen ? " open" : ""}`}
        width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <div className={`nav-dropdown${dropdownOpen ? " open" : ""}`} role="menu">
      <div className="nav-dropdown-header">
        <div className="nav-dropdown-name">{user.displayName || "My Account"}</div>
        <div className="nav-dropdown-email">{user.email}</div>
      </div>
      <div className="nav-dropdown-section">
        <button className="nav-dropdown-item" role="menuitem" onClick={() => { handleNavClick("profile"); setDropdownOpen(false); }}>
          <i className="ti ti-user" aria-hidden="true" /> My Profile
        </button>
        <button className="nav-dropdown-item" role="menuitem" onClick={() => { handleNavClick("favourites"); setDropdownOpen(false); }}>
          <i className="ti ti-heart" aria-hidden="true" /> Favourites
        </button>
        <button className="nav-dropdown-item" role="menuitem" onClick={() => { handleNavClick("orders"); setDropdownOpen(false); }}>
          <i className="ti ti-ticket" aria-hidden="true" /> My Orders
        </button>
        <button className="nav-dropdown-item" role="menuitem" onClick={() => { handleNavClick("notifications"); setDropdownOpen(false); }}>
          <i className="ti ti-bell" aria-hidden="true" /> Notifications
        </button>
      </div>
      <div className="nav-dropdown-divider" />
      <div className="nav-dropdown-section">
        <button className="nav-dropdown-item" role="menuitem" onClick={() => { handleNavClick("settings"); setDropdownOpen(false); }}>
          <i className="ti ti-settings" aria-hidden="true" /> Settings
        </button>
        <button className="nav-dropdown-item danger" role="menuitem" onClick={() => { onLogout(); setDropdownOpen(false); }}>
          <i className="ti ti-logout" aria-hidden="true" /> Sign Out
        </button>
      </div>
    </div>
  </div>
)}

{!user && (
  <div className="nav-avatar" onClick={() => handleNavClick("auth")} title="Sign In">
    {initials}
  </div>
)}
        <button
          className={`nav-hamburger${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--white)",
            border: "1.5px solid var(--border2)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 6,
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--muted)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Spa, safari, music, events…"
            onChange={(e) => onSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "var(--sans)",
              fontSize: ".88rem",
              color: "var(--text)",
              width: "100%",
            }}
          />
        </div>
        <div className="mobile-menu-divider" />
        {navLinks.map(([p, label]) => (
          <button
            key={p}
            className={`mobile-menu-link${page === p ? " active" : ""}`}
            onClick={() => handleNavClick(p)}
          >
            {label}
          </button>
        ))}
        <div className="mobile-menu-divider" />
        <button
          className="mobile-menu-cta"
          onClick={() => handleNavClick("partners")}
        >
          List Your Business
        </button>
         <div className="mobile-menu-divider" />
  {navLinks.map(([p, label]) => (
    <button key={p} className={`mobile-menu-link${page === p ? " active" : ""}`} onClick={() => handleNavClick(p)}>
      {label}
    </button>
  ))}
  <div className="mobile-menu-divider" />
  <button className="mobile-menu-cta" onClick={() => handleNavClick("partners")}>
    List Your Business
  </button>

  {user ? (
    <>
      <div className="mobile-menu-divider" />
      <div className="mobile-user-header">
        <div className="nav-avatar" style={{width:38,height:38,fontSize:".82rem"}}>{initials}</div>
        <div>
          <div className="mobile-user-name">{user.displayName || user.email?.split("@")[0]}</div>
          <div className="mobile-user-email">{user.email}</div>
        </div>
      </div>
      <button className="mobile-menu-link" onClick={() => { handleNavClick("profile"); setMobileOpen(false); }}>
        <i className="ti ti-user" aria-hidden="true" /> My Profile
      </button>
      <button className="mobile-menu-link" onClick={() => { handleNavClick("favourites"); setMobileOpen(false); }}>
        <i className="ti ti-heart" aria-hidden="true" /> Favourites
      </button>
      <button className="mobile-menu-link" onClick={() => { handleNavClick("vouchers"); setMobileOpen(false); }}>
        <i className="ti ti-ticket" aria-hidden="true" /> My Vouchers
      </button>
      <button className="mobile-menu-link" onClick={() => { handleNavClick("settings"); setMobileOpen(false); }}>
        <i className="ti ti-settings" aria-hidden="true" /> Settings
      </button>
      <div className="mobile-menu-divider" />
      <button className="mobile-menu-link" onClick={() => { onLogout(); setMobileOpen(false); }} style={{color:"var(--terra)"}}>
        <i className="ti ti-logout" aria-hidden="true" /> Sign Out
      </button>
    </>
  ) : (
    <button className="mobile-menu-link" onClick={() => { handleNavClick("auth"); setMobileOpen(false); }}
      style={{color:"var(--leaf)",fontWeight:600}}>
      Sign In
    </button>
  )}
</div>
      
    </nav>
  );
}
function SkeletonCard({ grid = false }) {
  return (
    <div className={`skel-card${grid ? " skel-grid-card" : ""}`}>
      <div className="skeleton skel-img" />
      <div className="skel-body">
        <div className="skeleton skel-line short" />
        <div className="skeleton skel-line med" />
        <div className="skeleton skel-line full" />
        <div className="skel-footer">
          <div className="skeleton skel-price" />
          <div className="skeleton skel-btn" />
        </div>
      </div>
    </div>
  );
}
// ─── VoucherCard ──────────────────────────────────────────────────────────
function VoucherCard({ voucher, onOpen }) {
  const imgSrc = voucher.imageUrl || voucher.img;

  const catBg = {
    Wellness:                "linear-gradient(145deg,#e8f5ee,#c8e8d8)",
    Adventure:               "linear-gradient(145deg,#e0ecf8,#c0d8f0)",
    Music:                   "linear-gradient(145deg,#eeebf8,#d8d0f0)",
    Events:                  "linear-gradient(145deg,#f8e8f0,#f0c8dc)",
    Florists:                "linear-gradient(145deg,#fdf0e8,#f8dcc8)",
    Beauty:                  "linear-gradient(145deg,#fce8f4,#f4c8e4)",
    "Dining & Wine":         "linear-gradient(145deg,#fdf4e0,#f8e4b8)",
    "Traditional Restaurants":"linear-gradient(145deg,#faf0e0,#f0d8a8)",
    Stays:                   "linear-gradient(145deg,#e8f4ec,#c8dcc8)",
    Skills:                  "linear-gradient(145deg,#e8f0fc,#c8d8f8)",
  };

  const catBadgeClass =
    voucher.cat === "Music"                  ? "cbadge cbadge-music"
    : voucher.cat === "Events"               ? "cbadge cbadge-events"
    : voucher.cat === "Traditional Restaurants" ? "cbadge cbadge-trad"
    : voucher.cat === "Florists"             ? "cbadge cbadge-florist"
    : "cbadge cbadge-pop";

  return (
    <div className="card" onClick={() => onOpen(voucher)}>
      {/* Image area */}
      <div className="card-img">
        {imgSrc ? (
          <img src={imgSrc} alt={voucher.name} loading="lazy" />
        ) : (
          <div
            className="card-img-placeholder"
            style={{ background: catBg[voucher.cat] || "var(--bg2)" }}
          >
            <span style={{ fontSize: "3rem", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.12))" }}>
              {getCatIcon(voucher.cat)}
            </span>
          </div>
        )}
        {/* Category pill badge on image */}
        <div className="card-badge-row">
          <span className={catBadgeClass}>{voucher.cat}</span>
          {voucher.source === "firebase" && (
            <span className="cbadge cbadge-sale">Partner</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-name">{voucher.name}</div>
        <div className="card-partner">
          📍 {voucher.partner} · {voucher.city}
        </div>

        <div className="card-footer">
          <div>
            <div className="card-price-val">
              <small>US$</small>{(Number(voucher.price) / ZAR_TO_USD).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {voucher.rating > 0 ? (
              <div className="card-rating">
                <span className="star">★</span> {voucher.rating}
              </div>
            ) : (
              <div style={{ fontSize: ".6rem", color: "var(--green)",
                fontWeight: 700, marginTop: 2 }}>New ✦</div>
            )}
          </div>
          <button
            className="card-add-btn"
            onClick={e => { e.stopPropagation(); onOpen(voucher); }}
            aria-label={`Buy ${voucher.name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
function HeroBurst({ cards }) {
  const [key, setKey] = useState(0);

  // Re-trigger the animation every 6 seconds with a new set of cards
  useEffect(() => {
    const t = setInterval(() => setKey(k => k + 1), 6000);
    return () => clearInterval(t);
  }, []);

  // 6 positions radiating out from centre: top-left, top, top-right, bottom-left, bottom, bottom-right
  const positions = [
    { tx0: "0",    ty0: "0",    tx: "-240px", ty: "-160px", delay: "0s"    }, // top-left
    { tx0: "0",    ty0: "0",    tx: "0px",    ty: "-200px", delay: "0.1s"  }, // top
    { tx0: "0",    ty0: "0",    tx: "240px",  ty: "-160px", delay: "0.2s"  }, // top-right
    { tx0: "0",    ty0: "0",    tx: "-240px", ty: "140px",  delay: "0.15s" }, // bottom-left
    { tx0: "0",    ty0: "0",    tx: "0px",    ty: "180px",  delay: "0.25s" }, // bottom
    { tx0: "0",    ty0: "0",    tx: "240px",  ty: "140px",  delay: "0.3s"  }, // bottom-right
  ];

  // Pick 6 cards, cycling through
  const displayed = [];
  for (let i = 0; i < 6; i++) {
    displayed.push(cards[(key * 3 + i) % cards.length]);
  }

  return (
    <div className="hero-burst-wrap" key={key}>
      {displayed.map((card, i) => {
        const pos = positions[i];
        return (
          <div
            key={i}
            className="hero-burst-card"
            style={{
              "--tx-start": pos.tx0,
              "--ty-start": pos.ty0,
              "--tx-end": pos.tx,
              "--ty-end": pos.ty,
              animationDelay: pos.delay,
            }}
          >
            {card.img ? (
              <img src={card.img} alt={card.name} className="hero-burst-card-img" />
            ) : (
              <div className="hero-burst-card-placeholder">{card.emoji}</div>
            )}
            <div className="hero-burst-card-body">
              <div className="hero-burst-card-cat">{card.cat}</div>
              <div className="hero-burst-card-name">{card.name}</div>
              <span className="hero-burst-card-price">{card.price}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

 const PERKS = [
  { icon:"📱", label:"WhatsApp Delivery" },
  { icon:"🔒", label:"PayFast Secure" },
  { icon:"✅", label:"Verified Partners" },
  { icon:"🔄", label:"Flexible Booking" },
  { icon:"🎁", label:"Custom Messages" },
  { icon:"⭐", label:"4.9 · 2,800 Reviews" },
];
 
function AvoFeatureStrip() {
  return (
    <div className="avs-feature-strip">
      <div className="avs-feature-header">
        <div className="avs-feature-icon">🎁</div>
        <div>
          <div className="avs-feature-title">AfriVoucher perks</div>
          <div className="avs-feature-sub">Instant WhatsApp delivery · Weekly EFT payouts · 200+ ZIM partners</div>
        </div>
      </div>
      <div className="avs-pills">
        {PERKS.map(p => (
          <div key={p.label} className="avs-pill">
            <span className="avs-pill-icon">{p.icon}</span>
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}
 const CAT_TILES = [
  { emoji:"🧖", name:"Wellness", cat:"Wellness" },
  { emoji:"🍲", name:"Traditional", cat:"Traditional Restaurants" },
  { emoji:"🎵", name:"Music", cat:"Music" },
  { emoji:"🪂", name:"Adventure", cat:"Adventure" },
  { emoji:"🌸", name:"Florists", cat:"Florists" },
  { emoji:"🍷", name:"Dining & Wine", cat:"Dining & Wine" },
  { emoji:"🎪", name:"Events", cat:"Events" },
  { emoji:"📚", name:"Skills", cat:"Skills" },
];
  
export function FlashDeals({ vouchers = [], onOpen }) {
  const [timeLeft, setTimeLeft] = React.useState({ h: 0, m: 0, s: 0 });
 
  // Countdown to midnight tonight
  React.useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight - now) / 1000));
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
 
  const pad = n => String(n).padStart(2, '0');
 
  // Flash deal data — mix real vouchers with curated specials
  const FLASH = [
    { name: "60-Min Massage", emoji: "🧖", originalPrice: 750, price: 550, off: 27, stock: 4, total: 10, cat: "Wellness" },
    { name: "Wine Tasting for Two", emoji: "🍷", originalPrice: 850, price: 620, off: 27, stock: 7, total: 15, cat: "Dining & Wine" },
    { name: "Birthday Bloom Bouquet", emoji: "🌸", originalPrice: 450, price: 350, off: 22, stock: 3, total: 8, cat: "Florists" },
    { name: "Concert Ticket Voucher", emoji: "🎵", originalPrice: 600, price: 450, off: 25, stock: 5, total: 12, cat: "Music" },
    { name: "Tandem Skydive", emoji: "🪂", originalPrice: 3200, price: 2950, off: 8, stock: 2, total: 5, cat: "Adventure" },
    { name: "Kids Party Pack", emoji: "🎪", originalPrice: 1400, price: 1200, off: 14, stock: 6, total: 10, cat: "Events" },
    { name: "Gel Mani + Spa Pedi", emoji: "💅", originalPrice: 580, price: 480, off: 17, stock: 9, total: 20, cat: "Beauty" },
    { name: "Sadza & Dovi Dinner", emoji: "🍲", originalPrice: 420, price: 350, off: 17, stock: 8, total: 15, cat: "Traditional Restaurants" },
  ];
 
  return (
    <section className="flash-deals-section">
      <div className="flash-header">
        <div className="flash-label">
          <span className="flash-fire">🔥</span>
          <span className="flash-title">Flash Deals</span>
        </div>
        <div className="flash-countdown">
          Ends in
          <span className="flash-timer-block">{pad(timeLeft.h)}</span>
          <span className="flash-colon">:</span>
          <span className="flash-timer-block">{pad(timeLeft.m)}</span>
          <span className="flash-colon">:</span>
          <span className="flash-timer-block">{pad(timeLeft.s)}</span>
        </div>
      </div>
      <div className="flash-row">
        {FLASH.map((deal, i) => (
          <div
            key={i}
            className="flash-deal-card"
            onClick={() => {
              // Try to match to a real voucher, else pass the deal object
              const match = vouchers.find(v =>
                v.cat === deal.cat && v.price <= deal.price * 1.1
              );
              if (onOpen) onOpen(match || { ...deal, id: 'flash_' + i, partner: 'AfriVoucher', city: 'Zimbabwe', desc: deal.name });
            }}
          >
            <div className="flash-deal-img">
              <span style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.15))' }}>{deal.emoji}</span>
              <span className="flash-off-badge">-{deal.off}%</span>
            </div>
            <div className="flash-deal-body">
              <div className="flash-deal-name">{deal.name}</div>
              <div className="flash-price-row">
                <span className="flash-price-now">US${(deal.price / ZAR_TO_USD).toFixed(2)}</span>
<span className="flash-price-was">US${(deal.originalPrice / ZAR_TO_USD).toFixed(2)}</span>
              </div>
              <div className="flash-stock-bar">
                <div
                  className="flash-stock-fill"
                  style={{ width: `${Math.round((deal.stock / deal.total) * 100)}%` }}
                />
              </div>
              <div className="flash-stock-lbl">
                {deal.stock} left at this price
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
const SLIDES = [
  {
    title: "Get Flat 30% off",
    sub: "AfriVoucher is the best way to gift an experience.",
    cta: "SHOP NOW",
    cat: "Wellness",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80",
  },
  {
    title: "Send Mum a Proper Meal",
    sub: "Gift a traditional lunch, delivered to WhatsApp instantly.",
    cta: "BROWSE TRADITIONAL",
    cat: "Traditional Restaurants",
    img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&q=80",
  },
  {
    title: "Gift a Night to Remember",
    sub: "Live jazz evenings, studio sessions and concert vouchers.",
    cta: "SEE MUSIC",
    cat: "Music",
    img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=700&q=80",
  },
  {
    title: "15,000ft. One Jump.",
    sub: "Tandem skydives and adventures for the one who has everything.",
    cta: "VIEW ADVENTURES",
    cat: "Adventure",
    img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=700&q=80",
  },
];
export function HeroV2({ vouchers = [], onSearch, onCatSelect }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
 
  const go = useCallback(
    (dir) => setI((c) => (c + dir + SLIDES.length) % SLIDES.length),
    []
  );
 
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [paused, go]);
 
  // Navigate to a category if the parent supplies a handler,
  // otherwise fall back to the search handler.
  const open = (cat) => {
    if (onCatSelect) onCatSelect(cat);
    else if (onSearch) onSearch(cat);
  };
 
  return (
    <>
      <style>{HERO_CSS}</style>
      <section className="hv3">
        {/* ── Left: main slider ── */}
        <div
          className="hv3-main"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="hv3-track"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {SLIDES.map((s) => (
              <div key={s.title} className="hv3-slide" onClick={() => open(s.cat)}>
                <div className="hv3-copy">
                  <h1 className="hv3-title">{s.title}</h1>
                  <p className="hv3-sub">{s.sub}</p>
                  <button
                    className="hv3-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      open(s.cat);
                    }}
                  >
                    {s.cta} ›
                  </button>
                </div>
                <img className="hv3-img" src={s.img} alt={s.title} loading="lazy" />
              </div>
            ))}
          </div>
 
          <button className="hv3-arrow prev" onClick={() => go(-1)} aria-label="Previous">
            ‹
          </button>
          <button className="hv3-arrow next" onClick={() => go(1)} aria-label="Next">
            ›
          </button>
 
          <div className="hv3-dots">
            {SLIDES.map((_, d) => (
              <button
                key={d}
                className={`hv3-dot${d === i ? " on" : ""}`}
                onClick={() => setI(d)}
                aria-label={`Slide ${d + 1}`}
              />
            ))}
          </div>
        </div>
 
        {/* ── Right: promo card ── */}
        <div className="hv3-side">
          <div className="hv3-logo">AfriVoucher</div>
          <h2 className="hv3-side-title">
            Gift Offer – Get US$10
            <br />
            OFF on Orders over US$90
          </h2>
          <div className="hv3-side-stage">
            <button className="hv3-side-btn" onClick={() => open("Dining & Wine")}>
              Shop Now
            </button>
            <span>🧖</span>
            <span>🍷</span>
            <span>🎵</span>
          </div>
        </div>
      </section>
    </>
  );
}
 
const FLASH_DATA = [
  { name:"60-Min Massage", emoji:"🧖", price:550, orig:750, off:27, stock:4, total:10, cat:"Wellness" },
  { name:"Wine Tasting for Two", emoji:"🍷", price:620, orig:850, off:27, stock:7, total:15, cat:"Dining & Wine" },
  { name:"Birthday Bloom Bouquet", emoji:"🌸", price:350, orig:450, off:22, stock:3, total:8, cat:"Florists" },
  { name:"Concert Ticket Voucher", emoji:"🎵", price:450, orig:600, off:25, stock:5, total:12, cat:"Music" },
  { name:"Luxury Pamper Package", emoji:"💅", price:480, orig:580, off:17, stock:9, total:20, cat:"Beauty" },
  { name:"Sadza & Dovi Dinner", emoji:"🍲", price:350, orig:420, off:17, stock:8, total:15, cat:"Traditional Restaurants" },
  { name:"Kids Party Pack", emoji:"🎪", price:1200, orig:1400, off:14, stock:6, total:10, cat:"Events" },
];
// ─── Newsletter section ───────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [btnText, setBtnText] = useState("Subscribe");
  const [btnStyle, setBtnStyle] = useState({});

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setBtnText("Subscribing...");
    try {
      const existing = await getDocs(
        query(
          collection(db, "subscribers"),
          where("email", "==", email.toLowerCase()),
        ),
      );
      if (!existing.empty) {
        setBtnText("Already subscribed ✓");
        setBtnStyle({ background: "#F59E0B" });
      } else {
        await addDoc(collection(db, "subscribers"), {
          email: email.toLowerCase(),
          subscribedAt: serverTimestamp(),
          status: "active",
        });
        setBtnText("Subscribed! 🎉");
        setBtnStyle({ background: "#22C55E" });
      }
      setEmail("");
      setTimeout(() => {
        setBtnText("Subscribe");
        setBtnStyle({});
      }, 4000);
    } catch {
      setBtnText("Try again");
      setBtnStyle({ background: "#EF4444" });
      setTimeout(() => {
        setBtnText("Subscribe");
        setBtnStyle({});
      }, 3000);
    }
  };

  return (
    <div className="newsletter">
      <div className="container">
        <h2>Get the best ZIM experiences first.</h2>
        <p>
          New partners, live music events, seasonal specials and gifting ideas —
          straight to your inbox.
        </p>
        <div className="nl-form">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          />
          <button className="nl-btn" style={btnStyle} onClick={handleSubscribe}>
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoBanner({ onCatSelect, vouchers = [] }) {
  const [current, setCurrent] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const intervalRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const INTERVAL = 5500; // ms per slide
  const TICK = 50;       // progress bar update interval
 
  const SLIDES = [
    {
      eyebrow: "🔥 This Weekend Only",
      headline: "Spa Days from R550",
      sub: "Treat someone to an hour of pure stillness. Swedish, hot stone or aromatherapy — delivered to WhatsApp in seconds.",
      btnText: "Shop Wellness",
      btnColor: "#1A7A3C",
      bgColor: "#1a0a0a",
      textColor: "#fff",
      accentColor: "#ff6b6b",
      cat: "Wellness",
      priceBadge: "From R550",
      img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
      emoji: "🧖",
    },
    {
      eyebrow: "🎁 Long Distance Gifting",
      headline: "Send Mum a Proper Meal",
      sub: "You're far away — but she doesn't have to eat alone. Gift a traditional lunch at Kwa Terry or Feli Nandi's.",
      btnText: "Browse Traditional",
      btnColor: "#1A7A3C",
      bgColor: "#140a00",
      textColor: "#fff",
      accentColor: "#ffb347",
      cat: "Traditional Restaurants",
      priceBadge: "From R240",
      img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
      emoji: "🍲",
    },
    {
      eyebrow: "🎵 Live Music",
      headline: "Gift a Night to Remember",
      sub: "Jazz evenings, studio sessions and concert vouchers for the music lovers in your life.",
      btnText: "See Music Vouchers",
      btnColor: "#5839b4",
      bgColor: "#09071a",
      textColor: "#fff",
      accentColor: "#a78bfa",
      cat: "Music",
      priceBadge: "From R450",
      img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      emoji: "🎵",
    },
    {
      eyebrow: "🪂 Adventure Awaits",
      headline: "15,000ft. One Jump.",
      sub: "Tandem skydives, hot air balloon sunrises over Magaliesberg — for the one who has everything.",
      btnText: "View Adventures",
      btnColor: "#1A7A3C",
      bgColor: "#000d1a",
      textColor: "#fff",
      accentColor: "#38bdf8",
      cat: "Adventure",
      priceBadge: "From R850",
      img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800&q=80",
      emoji: "🪂",
    },
    {
      eyebrow: "🌸 Say It With Flowers",
      headline: "Fresh Bouquets, Delivered",
      sub: "Birthday blooms, luxury roses and weekly flower subscriptions from Zimbabwe's top florists.",
      btnText: "Shop Florists",
      btnColor: "#c0396b",
      bgColor: "#160a10",
      textColor: "#fff",
      accentColor: "#f9a8d4",
      cat: "Florists",
      priceBadge: "From R350",
      img: "/images/florists.jpg",
      emoji: "🌸",
    },
  ];
 
  const go = React.useCallback((dir) => {
    setCurrent(c => (c + dir + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, [SLIDES.length]);
 
  // Auto-advance + progress bar
  React.useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current);
      clearInterval(progressRef.current);
      return;
    }
    let elapsed = progress * INTERVAL / 100;
    progressRef.current = setInterval(() => {
      elapsed += TICK;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, TICK);
    intervalRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
      setProgress(0);
    }, INTERVAL - elapsed);
    return () => {
      clearInterval(progressRef.current);
      clearTimeout(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, paused]);
 
  const slide = SLIDES[current];
 
  return (
    <div
      className="promo-strip"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track */}
      <div
        className="promo-strip-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="promo-slide"
            onClick={() => onCatSelect && onCatSelect(s.cat)}
          >
            {/* Left: copy */}
            <div
              className="promo-slide-left"
              style={{ '--slide-bg': s.bgColor, background: s.bgColor, color: s.textColor }}
            >
              <div className="promo-eyebrow" style={{ color: s.accentColor }}>
                {s.eyebrow}
              </div>
              <div className="promo-headline" style={{ color: s.textColor }}>
                {s.headline}
              </div>
              <div className="promo-sub" style={{ color: `${s.textColor}99` }}>
                {s.sub}
              </div>
              <div className="promo-cta-row">
                <button
                  className="promo-btn-primary"
                  style={{ color: s.btnColor, boxShadow: `0 4px 18px ${s.accentColor}40` }}
                  onClick={e => { e.stopPropagation(); onCatSelect && onCatSelect(s.cat); }}
                >
                  {s.btnText} →
                </button>
                <button
                  className="promo-btn-ghost"
                  style={{ color: `${s.textColor}70` }}
                  onClick={e => e.stopPropagation()}
                >
                  Learn more
                </button>
              </div>
            </div>
            {/* Right: image */}
            <div className="promo-slide-right">
              {s.img
                ? <img src={s.img} alt={s.headline} loading="lazy" />
                : (
                  <div style={{ width: '100%', height: '100%', background: s.bgColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '6rem' }}>
                    {s.emoji}
                  </div>
                )
              }
              <div className="promo-price-badge">{s.priceBadge}</div>
            </div>
          </div>
        ))}
      </div>
 
      {/* Arrows */}
      <button className="promo-arrow prev" onClick={() => go(-1)} aria-label="Previous">‹</button>
      <button className="promo-arrow next" onClick={() => go(1)} aria-label="Next">›</button>
 
      {/* Dots */}
      <div className="promo-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`promo-dot${i === current ? ' active' : ''}`}
            onClick={() => { setCurrent(i); setProgress(0); }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
 
      {/* Progress bar */}
      <div
        className="promo-progress"
        style={{ width: `${progress}%`, transitionDuration: paused ? '0ms' : `${TICK}ms` }}
      />
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────
function BottomNav({ page, setPage, user }) {
  const tabs = [
    {
      id: "store",
      label: "Home",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "redeem",
      label: "Redeem",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      ),
    },
    {
      id: "partners",
      label: "Partners",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
          <path d="M3 9l2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
          <line x1="12" y1="3" x2="12" y2="9" />
        </svg>
      ),
    },
    {
      id: user ? "admin" : "auth",
      label: user ? "Dashboard" : "Sign In",
      badge: !user,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => {
          const isActive =
            page === tab.id ||
            (tab.id === "auth" && page === "auth") ||
            (tab.id === "admin" && page === "admin");
          return (
            <button
              key={tab.id}
              className={`bn-item${isActive ? " active" : ""}`}
              onClick={() => setPage(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.badge && (
                <span className="bn-badge" aria-label="Action required" />
              )}
              <div className="bn-pill">{tab.icon}</div>
              <span className="bn-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Toast System ─────────────────────────────────────────────────────────
const ToastContext = React.createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "info", duration = 3500) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);
  const icons = { ok: "✅", error: "❌", warn: "⚠️", info: "ℹ️" };
  const colors = {
    ok: "#15803D",
    error: "#B91C1C",
    warn: "#92400E",
    info: "var(--forest)",
  };
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "calc(80px + env(safe-area-inset-bottom))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          pointerEvents: "none",
          width: "calc(100% - 32px)",
          maxWidth: 400,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "var(--forest)",
              color: "var(--cream)",
              padding: "12px 18px",
              borderRadius: 12,
              fontSize: ".85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 32px rgba(26,46,31,.3)",
              animation: "popIn .3s cubic-bezier(.34,1.56,.64,1)",
              width: "100%",
              borderLeft: `4px solid ${colors[t.type]}`,
            }}
          >
            <span>{icons[t.type]}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line no-unused-vars
const useToast = () => React.useContext(ToastContext);

// ─── App Root ─────────────────────────────────────────────────────────────
export default function App({ db, onAuthSuccess }) {
  const [page, setPage] = useState("store");
  const [user, setUser] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loadingV, setLoadingV] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [activeCat, setActiveCat] = useState(null);
const [activePartnerId, setActivePartnerId] = useState(null);
 const [selectedVoucher, setSelectedVoucher] = useState(null);
 
// Handler to navigate to a partner
const openPartner = (partnerId) => {
  setActivePartnerId(partnerId);
  setPage("partner");
};
  const [showScroll, setShowScroll] = useState(false);
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  useEffect(() => {
    const handler = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "all_vouchers"), orderBy("createdAt", "desc")),
        );
       const data = snap.docs.map((d) => {
  const v = d.data();
  return {
    id: "fb_" + d.id,
    cat: v.category || "Other",
    name: v.name || "Unnamed Voucher",
    partner: v.businessName || "Partner",
    partnerId: v.partnerUid || v.uid || "",
    city: v.city || v.businessCity || v.location || "Zimbabwe",
    price: v.price || 0,
    comm: 0,
    rating: 0,
    reviews: 0,
    tags: [],
    icon: getCatIcon(v.category),
    img: v.imageUrl || "",
    imageUrl: v.imageUrl || "",
    desc: v.desc || "",
    includes: Array.isArray(v.includes) ? v.includes : [],
    expiry: v.validMonths ? v.validMonths + " months" : "12 months",
    validMonths: v.validMonths || 12,
    expiryDate: v.expiryDate || "",
    createdAt: v.createdAt?.toDate?.().toISOString() || "",
    source: "firebase",
    uid: v.partnerUid || v.uid || "",
    firestoreId: d.id,
  };
});
        setVouchers(data);
      } catch (e) {
        console.warn("Could not load vouchers:", e.message);
      } finally {
        setLoadingV(false);
      }
    })();
  }, [db]);

  const guardedSetPage = (p) => {
    const protected_ = ["redeem", "admin", "orders"];
    if (protected_.includes(p) && !user) {
      setPage("auth");
      return;
    }
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setPage("store");
  };

  const displayedVouchers = searchQ.trim()
    ? vouchers.filter((v) =>
        [v.name, v.desc, v.cat, v.city, v.partner].some((f) =>
          (f || "").toLowerCase().includes(searchQ.toLowerCase()),
        ),
      )
    : vouchers;

  return (
    <>
      <AnnounceBannerV2 />
      <Nav
        page={page}
        setPage={guardedSetPage}
        user={user}
        onLogout={handleLogout}
        onSearch={setSearchQ}
      />

      {page === "store" && activeCat ? (
        <CategoryPage
          cat={activeCat}
          vouchers={displayedVouchers}
          onBack={() => setActiveCat(null)}
          onOpenVoucher={(v) => {}}
        />
      ) : page === "store" ? (
        <StorePage
          vouchers={displayedVouchers}
          loading={loadingV}
          setPage={guardedSetPage}
          onCatSelect={setActiveCat}
          user={user} 
          selectedVoucher={selectedVoucher}
  setSelectedVoucher={setSelectedVoucher}
   onPartnerOpen={(partnerId) => {
    setActivePartnerId(partnerId);
    setPage("partner");
  }}
        />
      ) : null}
      {page === "auth" && (
        <AuthPage 
         firebaseApp={firebaseApp}
        onSuccess={() => {
  guardedSetPage("admin");
  if (onAuthSuccess) onAuthSuccess();
}} />
      )}
      {page === "redeem" &&
        (user ? (
          <RedeemPage user={user} />
        ) : (
          <AuthPage 
           firebaseApp={firebaseApp}
          onSuccess={() => {
  guardedSetPage("redeem"); // or "admin" depending on which block
  if (onAuthSuccess) onAuthSuccess();
}} />
        ))}
      {page === "admin" &&
        (user ? (
          <AdminPage user={user} onLogout={handleLogout} />
        ) : (
          <AuthPage 
           firebaseApp={firebaseApp}
          onSuccess={() => {
  guardedSetPage("admin");
  if (onAuthSuccess) onAuthSuccess();
}} />
        ))}
        {page === "help" && <HelpCentrePage setPage={guardedSetPage} />}
      {page === "partners" && <PartnersPage />}
{page === "orders" && user && <OrdersPage user={user} />}
{page === "partner" && (
  <PartnerPage
    partnerId={activePartnerId}
    onBack={() => setPage("store")}
    onOpenVoucher={(v) => {
      setPage("store");       
      setSelectedVoucher(v);  
    }}
  />
)}
{page === "contact" && (
  <ContactPage firebaseApp={firebaseApp} setPage={guardedSetPage} />
)}
      <Footer setPage={guardedSetPage} />
      <CookieConsent />
      <BottomNav page={page} setPage={guardedSetPage} user={user} />
      {/* WhatsApp Float Button */}

      <a
        href="https://wa.me/263776109275"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "calc(90px + env(safe-area-inset-bottom))",
          right: 20,
          zIndex: 500,
          background: "#25D366",
          color: "white",
          width: 54,
          height: 54,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          boxShadow: "0 4px 20px rgba(37,211,102,.45)",
          textDecoration: "none",
          transition: "transform .2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        💬
      </a>
      <button
        className={`scroll-top${showScroll ? " show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </>
  );
}
