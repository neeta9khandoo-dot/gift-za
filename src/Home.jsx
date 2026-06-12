/* eslint-disable no-unused-vars */

import { Link } from "react-router-dom";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import {
  RedeemVoucherPage,
  HelpCentrePage,
  ContactPage,
} from "./FooterPages";
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
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import greatZimbabwe from "./images/zimbabwe-v.jpg";
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
  // --- Existing categories ---
  {
    name: "60-Min Full Body Massage",
    category: "Wellness",
    price: 550,
    validMonths: 12,
    icon: "massage",
    desc: "Swedish, deep tissue or aromatherapy of choice",
  },
  {
    name: "Couples Spa Day",
    category: "Wellness",
    price: 1800,
    validMonths: 12,
    icon: "couples_spa",
    desc: "Side-by-side treatments, sparkling wine & lunch",
  },
  {
    name: "Hot Stone Therapy",
    category: "Wellness",
    price: 750,
    validMonths: 12,
    icon: "hot_stone",
    desc: "90-min volcanic hot stone full-body treatment",
  },
  {
    name: "Luxury Pamper Package",
    category: "Beauty",
    price: 480,
    validMonths: 6,
    icon: "pamper",
    desc: "Gel mani, spa pedi & eyebrow shaping",
  },
  {
    name: "Bridal Glow Package",
    category: "Beauty",
    price: 1950,
    validMonths: 12,
    icon: "bridal",
    desc: "Full bridal prep: hair, makeup, nails & skin",
  },
  {
    name: "Tandem Skydive",
    category: "Adventure",
    price: 2950,
    validMonths: 24,
    icon: "skydive",
    desc: "15,000ft freefall with certified instructor",
  },
  {
    name: "Hot Air Balloon Sunrise",
    category: "Adventure",
    price: 2400,
    validMonths: 18,
    icon: "balloon",
    desc: "Champagne breakfast flight over Magaliesberg",
  },
  {
    name: "Wine Tasting for Two",
    category: "Dining & Wine",
    price: 620,
    validMonths: 12,
    icon: "wine",
    desc: "6-wine flight with artisan cheese board",
  },
  // --- NEW: Traditional Restaurants category ---
  {
    name: "Sunday Lunch for Two — Kwa Terry",
    category: "Traditional Restaurants",
    price: 420,
    validMonths: 12,
    icon: "kwa_terry",
    desc: "A proper Zimbabwean Sunday lunch for two at Kwa Terry — sadza, nyama, matemba, muriwo and all the trimmings. The taste of home, gifted from anywhere in the world.",
  },
  {
    name: "Family Feast — Kwa Terry (4 People)",
    category: "Traditional Restaurants",
    price: 980,
    validMonths: 12,
    icon: "kwa_terry_family",
    desc: "Treat the whole family to a hearty traditional feast at Kwa Terry. Sadza rezviyo, beef stew, road runner chicken, roasted groundnuts and more. Seats up to 4.",
  },
  {
    name: "Feli Nandi's — Lunch for Two",
    category: "Traditional Restaurants",
    price: 380,
    validMonths: 12,
    icon: "feli_nandi",
    desc: "Send mum (or anyone you love) for a sit-down traditional lunch at Feli Nandi's. Think freshly pounded sadza, slow-cooked dovi, covo with peanut butter and a cold Mazoe to wash it down.",
  },
  {
    name: "Feli Nandi's — Mother's Special Treat",
    category: "Traditional Restaurants",
    price: 650,
    validMonths: 12,
    icon: "feli_nandi_mum",
    desc: "The ultimate long-distance gift for mum. A full traditional spread at Feli Nandi's — 3 courses, a cold drink, and a personalised printed card delivered to her table. She deserves it.",
  },
  {
    name: "Roadrunner Chicken Braai Lunch",
    category: "Traditional Restaurants",
    price: 320,
    validMonths: 6,
    icon: "roadrunner",
    desc: "Free-range road runner chicken braaied over open fire — served with sadza, chakalaka and tomato-onion relish. Authentic Zimbabwean flavour, no shortcuts.",
  },
  {
    name: "Sadza & Dovi Dinner for Two",
    category: "Traditional Restaurants",
    price: 350,
    validMonths: 6,
    icon: "sadza_dovi",
    desc: "A comforting evening meal of sadza with peanut butter stew (dovi), covo greens and roasted groundnuts. The kind of dinner grandma would cook.",
  },
  {
    name: "Traditional Breakfast Spread",
    category: "Traditional Restaurants",
    price: 240,
    validMonths: 6,
    icon: "trad_breakfast",
    desc: "Start the day the Zimbabwean way — mahewu, rapoko porridge, roasted sweet potato and fresh maputi. A warm, nourishing breakfast for one.",
  },
  {
    name: "Whole Family Sunday Roast (Up to 6)",
    category: "Traditional Restaurants",
    price: 1450,
    validMonths: 12,
    icon: "family_roast",
    desc: "The grandest gift — a full Sunday roast for up to 6 family members. Whole road runner chicken, beef, sadza, 4 sides and traditional mahewu or Mazoe. Book ahead.",
  },
  {
    name: "Braai Masterclass",
    category: "Dining & Wine",
    price: 695,
    validMonths: 12,
    icon: "braai",
    desc: "Learn to braai like a pro — fire, meat & stories",
  },
  // ─── Skills for Foreigners in Zimbabwe ────────────────────────────────────
  {
    name: "Shona Language Basics — 4 Session Bundle",
    category: "Skills",
    price: 850,
    validMonths: 12,
    icon: "shona_language",
    desc: "Four 1-hour beginner Shona lessons with a native speaker. Learn greetings, market phrases, numbers and everyday conversation. Perfect for expats and new arrivals.",
  },
  {
    name: "Zimbabwe Business Setup Consultation",
    category: "Skills",
    price: 1200,
    validMonths: 12,
    icon: "biz_setup",
    desc: "A 90-minute 1-on-1 session with a local business consultant covering company registration, ZIMRA tax basics, forex rules and what foreign investors need to know.",
  },
  {
    name: "Expat Orientation Day",
    category: "Skills",
    price: 980,
    validMonths: 12,
    icon: "expat_orientation",
    desc: "A full guided half-day for new arrivals. Covers neighbourhoods, mobile money (Ecocash), load-shedding prep, local markets and expat community contacts. Harare or Bulawayo.",
  },
  {
    name: "Zimbabwe Driving & Road Rules Crash Course",
    category: "Skills",
    price: 650,
    validMonths: 6,
    icon: "driving_lesson",
    desc: "A 2-hour practical session for foreigners — learn local road rules, police checkpoints, licence requirements and how to navigate Zimbabwe's roads safely.",
  },
  {
    name: "Shona Stone Sculpture Workshop",
    category: "Skills",
    price: 750,
    validMonths: 12,
    icon: "sculpture_workshop",
    desc: "A hands-on 3-hour sculpting session with a Zimbabwean master sculptor. Learn the techniques behind one of Zimbabwe's most celebrated art forms. Materials included.",
  },
  {
    name: "Traditional Cooking Masterclass",
    category: "Skills",
    price: 680,
    validMonths: 12,
    icon: "cooking_class",
    desc: "Learn to cook sadza, dovi, muriwo and roasted groundnuts with a local chef. A 3-hour hands-on class — eat what you make. Perfect for expats and food-curious tourists.",
  },
  {
    name: "Mbira Music Introduction — 3 Lessons",
    category: "Skills",
    price: 720,
    validMonths: 12,
    icon: "mbira_lessons",
    desc: "Three 45-minute beginner lessons on the mbira — Zimbabwe's iconic thumb piano. Learn traditional songs, techniques and the cultural significance behind the instrument.",
  },
  {
    name: "Wildlife & Bush Photography Workshop",
    category: "Skills",
    price: 1450,
    validMonths: 18,
    icon: "bush_photography",
    desc: "A full-day practical photography workshop in the bush. Covers camera settings, tracking light, wildlife behaviour and composing the perfect safari shot. All levels welcome.",
  },
  {
    name: "Ecocash & Mobile Money for Expats",
    category: "Skills",
    price: 350,
    validMonths: 6,
    icon: "mobile_money",
    desc: "A 1-hour practical session covering Ecocash, mobile banking, USD cash economy and how to pay for everything from groceries to fuel as a foreigner in Zimbabwe.",
  },
  {
    name: "Zimbabwe Labour Law for Foreign Employers",
    category: "Skills",
    price: 1650,
    validMonths: 12,
    icon: "labour_law",
    desc: "A 2-hour briefing with an HR specialist on Zimbabwe's Labour Act — hiring local staff, contracts, termination rules, work permits and managing cross-cultural teams.",
  },
  {
    name: "Solar & Off-Grid Living Workshop",
    category: "Skills",
    price: 890,
    validMonths: 12,
    icon: "solar_workshop",
    desc: "Learn how to set up and manage solar power, inverters and water harvesting for your home or business. Essential knowledge for expats dealing with load-shedding.",
  },
  {
    name: "Batik & Textile Art Class",
    category: "Skills",
    price: 580,
    validMonths: 12,
    icon: "batik_class",
    desc: "A 3-hour hands-on batik and fabric dyeing workshop with a local textile artist. Create your own piece to take home. No experience needed. All materials provided.",
  },
  // --- NEW: Florists category ---
  {
    name: "Birthday Bloom Bouquet",
    category: "Florists",
    price: 350,
    validMonths: 6,
    icon: "bouquet",
    desc: "A hand-arranged seasonal bouquet perfect for birthdays — collected in-store or delivered.",
  },
  {
    name: "Luxury Rose Arrangement",
    category: "Florists",
    price: 680,
    validMonths: 6,
    icon: "roses",
    desc: "Premium long-stem roses arranged by a master florist. Choose your colour on redemption.",
  },
  {
    name: "Weekly Flower Subscription",
    category: "Florists",
    price: 1200,
    validMonths: 3,
    icon: "subscription",
    desc: "4 weeks of fresh seasonal flower deliveries — a gift that keeps giving all month long.",
  },
  {
    name: "Wedding Centrepiece Voucher",
    category: "Florists",
    price: 2500,
    validMonths: 12,
    icon: "wedding_flowers",
    desc: "One full table centrepiece arrangement for weddings or special events. Consultation included.",
  },
  {
    name: "Surprise Me Seasonal Bouquet",
    category: "Florists",
    price: 450,
    validMonths: 6,
    icon: "surprise_bouquet",
    desc: "Let the florist work their magic — a beautiful seasonal arrangement chosen fresh on the day.",
  },
  {
    name: "Corporate Office Flowers",
    category: "Florists",
    price: 1800,
    validMonths: 12,
    icon: "corporate_flowers",
    desc: "Monthly fresh flower arrangement for reception or boardroom. Delivery and setup included.",
  },
  // --- NEW: Music category ---
  {
    name: "Live Jazz Evening for Two",
    category: "Music",
    price: 780,
    validMonths: 12,
    icon: "jazz",
    desc: "Two tickets to an intimate live jazz performance at a premier Zimbabwean venue, including welcome cocktails.",
  },
  {
    name: "Private Guitar Lesson Bundle",
    category: "Music",
    price: 650,
    validMonths: 12,
    icon: "guitar",
    desc: "4 x 45-minute private guitar lessons (acoustic or electric) with a professional musician. All levels welcome.",
  },
  {
    name: "Studio Recording Session",
    category: "Music",
    price: 1200,
    validMonths: 12,
    icon: "studio",
    desc: "3-hour professional studio recording session — perfect for soloists, bands or podcasters. Files delivered digitally.",
  },
  {
    name: "Concert Ticket Voucher",
    category: "Music",
    price: 450,
    validMonths: 6,
    icon: "concert",
    desc: "Redeemable against any single concert ticket purchased through our partner venues across Zimbabwe.",
  },
  {
    name: "DJ Workshop — Beginner",
    category: "Music",
    price: 990,
    validMonths: 12,
    icon: "dj",
    desc: "Full-day intro to DJing: mixing, beatmatching, software and equipment provided. Walk away knowing how to DJ.",
  },

  // --- NEW: Events category ---
  {
    name: "Corporate Function Package",
    category: "Events",
    price: 4500,
    validMonths: 12,
    icon: "corporate",
    desc: "Half-day venue hire for up to 30 guests including AV setup, catering allowance and on-site coordinator.",
  },
  {
    name: "Birthday Celebration Bundle",
    category: "Events",
    price: 1850,
    validMonths: 12,
    icon: "birthday",
    desc: "Private venue styling, décor package, welcome drinks for up to 20 guests and a personalised cake.",
  },
  {
    name: "Kids Party Experience",
    category: "Events",
    price: 1200,
    validMonths: 6,
    icon: "kids_party",
    desc: "2-hour fully-hosted kids party with entertainment, face painting, snacks and party packs for 15 children.",
  },
  {
    name: "Wedding Anniversary Dinner",
    category: "Events",
    price: 2200,
    validMonths: 12,
    icon: "anniversary",
    desc: "Private 5-course dinner for two at a top ZIM restaurant with a dedicated sommelier and personalised menu.",
  },
  {
    name: "Festival General Access Pass",
    category: "Events",
    price: 580,
    validMonths: 6,
    icon: "festival",
    desc: "One general-access pass redeemable at any participating Zimbabwean food, arts or music festival.",
  },
  {
    name: "Ancient City Lodge — 1 Night Stay",
    category: "Stays",
    price: 2800,
    validMonths: 12,
    icon: "ancient_city",
    desc: "One night for two at Ancient City Lodge, Masvingo — stone-walled luxury steps from the Great Zimbabwe Ruins. Breakfast included.",
    imageUrl: "/images/ancient-city-lodge-masvingo-698880.webp",
  },
  {
    name: "Great Zimbabwe Ruins Weekend",
    category: "Stays",
    price: 5200,
    validMonths: 12,
    icon: "great_zim_weekend",
    desc: "Two nights for two at Ancient City Lodge — guided ruins tour, full breakfast daily and sunset drinks by the stone pool.",
  },
  {
    name: "Masvingo Heritage Escape",
    category: "Stays",
    price: 3600,
    validMonths: 12,
    icon: "masvingo_escape",
    desc: "One night bed & breakfast plus a private guided tour of the Great Zimbabwe National Monument. History, luxury and nature in one gift.",
  },
];

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

// ─── CSS (injected as a <style> tag via useEffect) ────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
 /* ── Skeleton loaders ── */
@keyframes shimmer{0%{background-position:-700px 0}100%{background-position:700px 0}}
.skeleton{
  background:linear-gradient(90deg,var(--bg3) 25%,var(--bg2) 50%,var(--bg3) 75%);
  background-size:700px 100%;
  animation:shimmer 1.4s infinite linear;
  border-radius:6px;
}
.skel-card{
  background:#fff;border-radius:var(--r2);overflow:hidden;
  border:1px solid var(--border);
  width:220px;min-width:220px;flex-shrink:0;
}
.skel-img{height:160px;width:100%}
.skel-body{padding:12px;display:flex;flex-direction:column;gap:8px}
.skel-line{height:12px;border-radius:4px}
.skel-line.short{width:55%}
.skel-line.med{width:75%}
.skel-line.full{width:100%}
.skel-footer{
  margin-top:10px;padding-top:10px;
  border-top:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;
}
.skel-price{height:20px;width:60px;border-radius:4px}
.skel-btn{height:28px;width:56px;border-radius:6px}
.skel-grid-card{width:auto;min-width:auto}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
 --green-primary:   #1A7A3C;   /* main CTA, buttons, active states   */
  --green-dark:      #145f2e;   /* hover state on buttons              */
  --green-bright:    #22a64f;   /* highlights, glows, badge borders    */
  --green-soft:      #e8f5ee;   /* light tint backgrounds              */
  --green-glow:      rgba(26,122,60,.15);  /* shadow/glow tint         */
  --red:    #1A7A3C;
  --red2:   #145f2e;
  --red3:   #22a64f;
  --black:#111111;
  --dark:#222222;
  --mid:#555555;
  --muted:#888888;
  --border:#e5e5e5;
  --border2:#d0d0d0;
  --bg:#ffffff;
  --bg2:#f5f5f5;
  --bg3:#eeeeee;
  --cream:#fafafa;
  --text:#111111;
  --sub:#555555;
  --green:#1a9e56;
  --sans:'Inter',system-ui,sans-serif;
  --r:8px;--r2:12px;--max:1280px;
  --sh1:0 1px 4px rgba(0,0,0,.08);
  --sh2:0 4px 16px rgba(0,0,0,.1);
}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{background:var(--bg2);color:var(--text);font-family:var(--sans);font-size:15px;line-height:1.5;overflow-x:hidden}
img{display:block;width:100%;object-fit:cover}
a{text-decoration:none;color:inherit}
button{font-family:var(--sans);cursor:pointer}
.container{max-width:var(--max);margin:0 auto;padding:0 20px}
 
/* ── Top delivery bar ── */
.announce{
  background:var(--red);color:#fff;
  padding:0 20px;
  font-size:.78rem;font-weight:600;letter-spacing:.2px;
  display:flex;align-items:center;justify-content:center;gap:8px;
  height:36px;
}
.announce strong{font-weight:800}
 
/* ── Nav ── */
.nav{
  background:#fff;
  border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:100;
}
.nav-inner{
  max-width:var(--max);margin:0 auto;
  padding:0 20px;
  display:flex;align-items:center;gap:16px;height:64px;
}
.nav-logo{
  font-family:var(--sans);font-size:1.4rem;font-weight:800;
  color:var(--red);letter-spacing:-1px;white-space:nowrap;flex-shrink:0;
  background:none;border:none;cursor:pointer;display:flex;align-items:center;
}
.nav-logo span{color:var(--black)}
.nav-address-btn{
  display:flex;align-items:center;gap:6px;
  padding:8px 14px;border-radius:var(--r);
  border:1.5px solid var(--border2);background:var(--cream);
  font-size:.84rem;font-weight:600;color:var(--black);cursor:pointer;
  white-space:nowrap;transition:border-color .2s;flex-shrink:0;
}
.nav-address-btn:hover{border-color:var(--red)}
.nav-address-btn .nav-addr-pin{color:var(--red);font-size:1rem}
.nav-search{
  flex:1;background:#fff;border:1.5px solid var(--border2);
  border-radius:var(--r);display:flex;align-items:center;
  gap:8px;padding:0 14px;height:42px;
  transition:border-color .2s;
}
.nav-search:focus-within{border-color:var(--red);box-shadow:0 0 0 3px rgba(26,122,60,.08)}
.nav-search input{
  flex:1;border:none;outline:none;background:transparent;
  font-family:var(--sans);font-size:.88rem;color:var(--text);
}
.nav-search input::placeholder{color:var(--muted)}
.nav-search-icon{color:var(--muted);flex-shrink:0}
.nav-links{display:flex;align-items:center;gap:2px;margin-left:auto}
.nav-link{
  padding:7px 12px;border-radius:var(--r);font-size:.82rem;font-weight:500;
  color:var(--sub);transition:all .15s;white-space:nowrap;border:none;background:none;cursor:pointer;
}
.nav-link:hover{background:var(--bg2);color:var(--black)}
.nav-link.active{color:var(--red);font-weight:700}
.nav-cta{
  background:var(--red);color:#fff;padding:9px 18px;
  border-radius:var(--r);font-size:.82rem;font-weight:700;border:none;
  transition:all .18s;white-space:nowrap;flex-shrink:0;cursor:pointer;
}
.nav-cta:hover{background:var(--red2);transform:translateY(-1px)}
.nav-user{position:relative;display:flex;align-items:center;flex-shrink:0}
.nav-user-btn{
  display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;
  border-radius:40px;border:1.5px solid var(--border2);background:transparent;cursor:pointer;transition:all .2s;
}
.nav-user-btn:hover{border-color:var(--red);background:rgba(227,0,27,.04)}
.nav-user-name{font-size:.82rem;font-weight:600;color:var(--black);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nav-chevron{color:var(--muted);transition:transform .2s;flex-shrink:0}
.nav-chevron.open{transform:rotate(180deg)}
.nav-dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:210px;background:#fff;border:1px solid var(--border2);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.12);overflow:hidden;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity .18s,transform .18s;z-index:200}
.nav-dropdown.open{opacity:1;pointer-events:all;transform:translateY(0)}
.nav-dropdown-header{padding:14px 16px 10px;border-bottom:1px solid var(--border)}
.nav-dropdown-name{font-size:.88rem;font-weight:700;color:var(--black)}
.nav-dropdown-email{font-size:.76rem;color:var(--muted);margin-top:2px}
.nav-dropdown-section{padding:6px 0}
.nav-dropdown-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 16px;background:none;border:none;cursor:pointer;font-family:var(--sans);font-size:.83rem;color:var(--text);text-align:left;transition:background .15s}
.nav-dropdown-item:hover{background:var(--bg2)}
.nav-dropdown-divider{height:1px;background:var(--border)}
.nav-dropdown-item.danger{color:var(--red)}
 
/* ── Hero / Delivery Banner ── */
.hero{
  background:#fff;
  border-bottom:1px solid var(--border);
  padding:0;
}
.hero-delivery-bar{
  background:var(--red);
  padding:18px 20px;
  display:flex;align-items:center;justify-content:space-between;
  gap:16px;flex-wrap:wrap;
}
.hero-delivery-left{display:flex;align-items:center;gap:12px}
.hero-delivery-logo{
  font-family:var(--sans);font-size:1.6rem;font-weight:800;
  color:#fff;letter-spacing:-1px;
}
.hero-delivery-tagline{
  color:rgba(255,255,255,.85);font-size:.88rem;font-weight:500;
}
.hero-delivery-tagline strong{color:#fff;font-weight:800}
.hero-delivery-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.hero-badge{
  background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);
  border-radius:20px;padding:5px 14px;font-size:.75rem;font-weight:600;color:#fff;
  white-space:nowrap;
}
.hero-search-bar{
  background:#fff;border-radius:8px;
  display:flex;align-items:center;gap:0;
  overflow:hidden;max-width:600px;margin:16px 20px;
  border:1.5px solid var(--border2);
  box-shadow:var(--sh1);
}
.hsb-field{
  flex:1;padding:12px 16px;display:flex;align-items:center;gap:10px;
  border-right:1px solid var(--border);
}
.hsb-field:last-of-type{border-right:none;flex:0.7}
.hsb-icon{color:var(--muted);font-size:1rem;flex-shrink:0}
.hsb-text{flex:1}
.hsb-label{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);display:block;margin-bottom:1px}
.hsb-val{font-size:.88rem;font-weight:600;color:var(--black)}
.hsb-val.placeholder{color:var(--muted);font-weight:400}
.hero-search-btn{
  background:var(--red);color:#fff;border:none;
  padding:12px 24px;font-weight:700;font-size:.88rem;
  white-space:nowrap;cursor:pointer;display:flex;align-items:center;gap:7px;
  transition:background .15s;flex-shrink:0;
}
.hero-search-btn:hover{background:var(--red2)}
.hero-trust-row{
  display:flex;align-items:center;gap:0;
  padding:0 20px 0;max-width:var(--max);margin:0;
  border-top:1px solid var(--border);overflow-x:auto;scrollbar-width:none;
}
.hero-trust-row::-webkit-scrollbar{display:none}
.htrust-item{
  display:flex;align-items:center;gap:7px;
  padding:12px 20px;border-right:1px solid var(--border);
  font-size:.78rem;font-weight:500;color:var(--sub);white-space:nowrap;flex-shrink:0;
}
.htrust-item:first-child{padding-left:0}
.htrust-item strong{color:var(--black)}
.htrust-dot{width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0}
 
/* ── Category pills ── */
.cats-section{
  background:#fff;
  border-bottom:1px solid var(--border);
  padding:0;
  position:sticky;top:64px;z-index:90;
}
.cats-scroll{
  display:flex;gap:0;padding:0 20px;overflow-x:auto;
  scrollbar-width:none;max-width:var(--max);margin:0 auto;
}
.cats-scroll::-webkit-scrollbar{display:none}
.cat-pill{
  display:flex;flex-direction:column;align-items:center;gap:4px;
  padding:12px 18px;border-bottom:3px solid transparent;
  font-size:.78rem;font-weight:600;color:var(--sub);
  white-space:nowrap;cursor:pointer;transition:all .15s;flex-shrink:0;
  background:none;border-top:none;border-left:none;border-right:none;
}
.cat-pill-emoji{font-size:1.3rem}
.cat-pill:hover{color:var(--black)}
.cat-pill.active{color:var(--red);border-bottom-color:var(--red)}
.cat-pill-count{display:none}
 
/* ── Section ── */
.section{padding:28px 0}
.section-head{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:16px;padding:0 20px;
}
.section-eyebrow{display:none}
.section-title{font-size:1.05rem;font-weight:700;color:var(--black);letter-spacing:-.2px}
.section-sub{color:var(--muted);font-size:.8rem;margin-top:2px}
.see-all{
  font-size:.8rem;font-weight:700;color:var(--red);
  border:none;background:transparent;cursor:pointer;
  display:flex;align-items:center;gap:3px;white-space:nowrap;
}
.see-all:hover{text-decoration:underline}
 
/* ── Horizontal scroll row ── */
.hscroll-row{
  display:flex;gap:12px;padding:0 20px;overflow-x:auto;scrollbar-width:none;
}
.hscroll-row::-webkit-scrollbar{display:none}
 
/* ── Voucher card (Sixty60-style) ── */
/* ── Voucher card — Avo-style ── */
.card{
  background:#fff;
  border-radius:16px;
  overflow:hidden;
  border:none;
  cursor:pointer;
  transition:box-shadow .22s,transform .18s;
  display:flex;flex-direction:column;
  width:200px;min-width:200px;flex-shrink:0;
  box-shadow:0 2px 8px rgba(0,0,0,.07);
}
.card:hover{
  box-shadow:0 8px 28px rgba(0,0,0,.13);
  transform:translateY(-3px);
}
.card-img{
  position:relative;overflow:hidden;
  height:150px;background:var(--bg2);flex-shrink:0;
}
.card-img img{
  width:100%;height:100%;object-fit:cover;
  transition:transform .4s;
}
.card:hover .card-img img{transform:scale(1.05)}
.card-img-placeholder{
  height:100%;display:flex;align-items:center;
  justify-content:center;font-size:3rem;
  background:var(--bg2);
}
/* category badge pill on image */
.card-badge-row{
  position:absolute;top:10px;left:10px;
  display:flex;gap:4px;
}
.cbadge{
  font-size:.58rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.5px;padding:3px 9px;border-radius:20px;
  backdrop-filter:blur(6px);
}
.cbadge-pop{background:rgba(26,122,60,.85);color:#fff}
.cbadge-sale{background:rgba(17,17,17,.75);color:#fff}
.cbadge-music{background:rgba(88,57,180,.85);color:#fff}
.cbadge-events{background:rgba(180,57,120,.85);color:#fff}
.cbadge-trad{background:rgba(139,90,30,.85);color:#fff}
.cbadge-florist{background:rgba(180,57,140,.85);color:#fff}
.card-body{
  padding:12px 14px 14px;
  flex:1;display:flex;flex-direction:column;gap:0;
}
.card-cat{
  font-size:.6rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.9px;color:var(--muted);margin-bottom:4px;
}
.card-name{
  font-size:.88rem;font-weight:700;line-height:1.35;
  color:var(--black);margin-bottom:2px;
  display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;
}
.card-partner{
  font-size:.68rem;color:var(--muted);margin-bottom:10px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.card-desc{display:none}
.card-includes{display:none}
.card-footer{
  margin-top:auto;
  display:flex;justify-content:space-between;
  align-items:center;gap:8px;
}
.card-price-from{display:none}
.card-price-val{
  font-size:1.05rem;font-weight:800;
  color:var(--black);letter-spacing:-.5px;line-height:1;
}
.card-price-val small{
  font-size:.62rem;font-weight:700;
  margin-right:1px;vertical-align:top;
  margin-top:1px;display:inline-block;
  color:var(--muted);
}
.card-rating{
  display:flex;align-items:center;gap:3px;
  font-size:.68rem;font-weight:600;color:var(--sub);
  margin-top:3px;
}
.star{color:#f59e0b}
/* Avo-style round add button */
.card-add-btn{
  background:var(--red);color:#fff;border:none;
  border-radius:50%;
  width:34px;height:34px;
  display:flex;align-items:center;justify-content:center;
  font-size:1.2rem;line-height:1;
  cursor:pointer;transition:background .15s,transform .15s;
  flex-shrink:0;padding:0;
}
.card-add-btn:hover{
  background:var(--red2);
  transform:scale(1.1);
}

/* ── Grid mode ── */
.cards-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
  gap:14px;padding:0 20px;
}
.cards-grid .card{width:auto;min-width:auto}

/* ── Horizontal scroll row — tighter Avo spacing ── */
.hscroll-row{
  display:flex;gap:14px;padding:0 20px;
  overflow-x:auto;scrollbar-width:none;
}
.hscroll-row::-webkit-scrollbar{display:none}
/* ── Grid mode (for "All" listing) ── */
.cards-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:12px;padding:0 20px;
}
.cards-grid .card{width:auto;min-width:auto}
 
/* ── Featured / promo banner ── */
.promo-banner{
  margin:0 20px 8px;border-radius:var(--r2);overflow:hidden;
  position:relative;min-height:160px;cursor:pointer;
  background:var(--red);
}
.promo-banner-bg{
  position:absolute;inset:0;
  background:linear-gradient(90deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.1) 60%, transparent 100%);
}
.promo-banner-bg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;opacity:.5}
.promo-banner-content{
  position:relative;z-index:1;padding:24px 24px;
}
.promo-banner-eyebrow{
  font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;
  color:rgba(255,255,255,.8);margin-bottom:6px;
}
.promo-banner-title{
  font-size:1.5rem;font-weight:800;color:#fff;line-height:1.15;
  margin-bottom:8px;letter-spacing:-.4px;max-width:360px;
}
.promo-banner-sub{font-size:.84rem;color:rgba(255,255,255,.75);margin-bottom:16px;max-width:320px}
.promo-banner-btn{
  display:inline-flex;align-items:center;gap:6px;
  background:#fff;color:var(--red);border:none;
  border-radius:6px;padding:9px 18px;font-size:.82rem;font-weight:800;
  cursor:pointer;transition:all .15s;
}
.promo-banner-btn:hover{background:var(--bg2)}
 
/* ── Category showcase (grid blocks) ── */
.cat-showcase{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));
  gap:10px;padding:0 20px;
}
.cat-block{
  background:#fff;border:1px solid var(--border);border-radius:var(--r2);
  overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s;
  aspect-ratio:1;
}
.cat-block:hover{box-shadow:var(--sh2);transform:translateY(-2px)}
.cat-block-img{height:65%;position:relative;overflow:hidden}
.cat-block-img img{height:100%;transition:transform .4s}
.cat-block:hover .cat-block-img img{transform:scale(1.06)}
.cat-block-overlay{
  padding:8px 10px;
  background:#fff;
}
.cat-block-icon{display:none}
.cat-block h3{font-size:.78rem;font-weight:700;color:var(--black);line-height:1.2;margin-bottom:1px}
.cat-block p{font-size:.65rem;color:var(--muted)}
 
/* ── HIW ── */
.hiw{background:#fff;padding:40px 0;border-top:1px solid var(--border)}
.hiw .section-eyebrow{display:none}
.hiw .section-title{color:var(--black)}
.hiw .section-sub{color:var(--muted)}
.hiw-steps{
  display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
  background:var(--border);border-radius:var(--r2);overflow:hidden;
  margin:0 20px;
}
.hiw-step{background:#fff;padding:24px 20px}
.hiw-step:hover{background:var(--bg2)}
.hiw-step-num{display:none}
.hiw-step-icon{
  width:40px;height:40px;border-radius:10px;
  background:var(--red);
  display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin-bottom:12px;
}
.hiw-step h3{font-size:.88rem;font-weight:700;color:var(--black);margin-bottom:6px}
.hiw-step p{font-size:.76rem;color:var(--sub);line-height:1.55}
 
/* ── Trust bar ── */
.trust-bar{background:#fff;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:0}
.trust-bar-inner{
  display:flex;align-items:stretch;overflow-x:auto;scrollbar-width:none;
  max-width:var(--max);margin:0 auto;
}
.trust-bar-inner::-webkit-scrollbar{display:none}
.trust-item{
  display:flex;align-items:center;gap:10px;padding:14px 20px;
  border-right:1px solid var(--border);flex-shrink:0;white-space:nowrap;
}
.trust-icon{width:32px;height:32px;border-radius:8px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}
.trust-text h4{font-size:.78rem;font-weight:700;color:var(--black);margin-bottom:0}
.trust-text p{font-size:.68rem;color:var(--muted)}
 
/* ── Occasions ── */
.occasions{
  background:#fff;padding:28px 0;
  border-top:1px solid var(--border);border-bottom:1px solid var(--border);
}
.occasions::before{display:none}
.occasions .section-title{color:var(--black)}
.occasions .section-sub{color:var(--muted)}
.occ-grid{
  display:flex;gap:10px;padding:0 20px;
  overflow-x:auto;scrollbar-width:none;
}
.occ-grid::-webkit-scrollbar{display:none}
.occ{
  background:var(--bg2);border:1px solid var(--border);
  border-radius:var(--r2);padding:16px 14px;
  text-align:center;cursor:pointer;transition:all .18s;
  flex-shrink:0;width:100px;
}
.occ:hover{border-color:var(--red);background:#fff}
.occ-icon{font-size:1.5rem;margin-bottom:5px;display:flex;justify-content:center;align-items:center;color:var(--red)}
.occ-name{font-size:.72rem;font-weight:700;color:var(--black);line-height:1.2}
 
/* ── Testimonials ── */
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 20px}
.testi{background:#fff;border:1px solid var(--border);border-radius:var(--r2);padding:20px}
.testi-stars{display:flex;gap:2px;margin-bottom:10px;font-size:.85rem}
.testi-text{font-size:.84rem;line-height:1.65;color:var(--black);margin-bottom:14px;font-style:normal}
.testi-author{display:flex;align-items:center;gap:8px}
.testi-avatar{width:34px;height:34px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.75rem;flex-shrink:0}
.testi-name{font-weight:700;font-size:.8rem;color:var(--black)}
.testi-loc{font-size:.68rem;color:var(--muted)}
.testi-product{font-size:.65rem;color:var(--red);font-weight:700;background:rgba(26,122,60,.08);border:1px solid rgba(26,122,60,.15);padding:2px 7px;border-radius:4px;margin-left:auto;white-space:nowrap}
 
/* ── Newsletter ── */
.newsletter{background:var(--bg2);border-top:1px solid var(--border);padding:40px 0;text-align:center}
.newsletter h2{font-size:1.3rem;font-weight:800;color:var(--black);margin-bottom:6px;letter-spacing:-.3px}
.newsletter p{color:var(--sub);font-size:.85rem;margin-bottom:20px}
.nl-form{display:flex;max-width:400px;margin:0 auto;overflow:hidden;border-radius:8px;box-shadow:var(--sh1);border:1.5px solid var(--border2)}
.nl-form input{flex:1;padding:12px 16px;border:none;outline:none;font-family:var(--sans);font-size:.88rem;color:var(--text);background:#fff}
.nl-btn{background:var(--red);color:#fff;border:none;padding:0 20px;font-family:var(--sans);font-weight:700;font-size:.82rem;cursor:pointer;transition:background .15s;white-space:nowrap}
.nl-btn:hover{background:var(--red2)}
 
/* ── Modals and drawers ── */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .25s}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal-overlay.open .modal-sheet{transform:translateY(0)}
.modal-sheet{background:#fff;border-radius:16px 16px 0 0;width:100%;max-width:880px;max-height:92vh;overflow-y:auto;transform:translateY(60px);transition:transform .3s cubic-bezier(.34,1.1,.64,1)}
.modal-inner{display:grid;grid-template-columns:1fr 380px;min-height:550px}
.modal-gallery{position:relative;border-radius:16px 0 0 0;overflow:hidden}
.modal-gallery img{height:100%;object-fit:cover;min-height:400px}
.modal-gallery-badge{position:absolute;top:16px;left:16px;background:var(--red);color:#fff;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 10px;border-radius:4px}
.modal-close{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;color:var(--black);transition:all .18s}
.modal-close:hover{background:#fff;transform:rotate(90deg)}
.modal-body{padding:28px;overflow-y:auto;display:flex;flex-direction:column}
.modal-cat{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:6px}
.modal-title{font-size:1.5rem;font-weight:800;line-height:1.15;color:var(--black);margin-bottom:8px;letter-spacing:-.3px}
.modal-partner{display:flex;align-items:center;gap:6px;margin-bottom:14px;color:var(--sub);font-size:.8rem}
.modal-partner-badge{background:rgba(26,158,86,.1);color:var(--green);font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:4px}
.modal-desc{font-size:.85rem;color:var(--sub);line-height:1.7;margin-bottom:18px}
.modal-includes h4{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:8px}
.modal-includes-list{display:flex;flex-direction:column;gap:5px;margin-bottom:20px}
.mi-row{display:flex;align-items:center;gap:7px;font-size:.82rem;color:var(--text)}
.mi-check{color:var(--green);font-size:.72rem;flex-shrink:0}
.modal-sep{height:1px;background:var(--border);margin:0 -28px 18px}
.modal-price-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.modal-price-lbl{font-size:.75rem;color:var(--muted)}
.modal-price-val{font-size:1.8rem;font-weight:800;color:var(--black);letter-spacing:-.5px}
.modal-buy-btn{width:100%;padding:14px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:1rem;font-weight:800;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;letter-spacing:-.2px}
.modal-buy-btn:hover{background:var(--red2);transform:translateY(-1px)}
.modal-secondary-btn{width:100%;padding:10px;background:transparent;border:1.5px solid var(--border2);border-radius:8px;color:var(--sub);font-size:.83rem;font-weight:600;cursor:pointer;transition:all .18s}
.modal-secondary-btn:hover{border-color:var(--red);color:var(--red)}
 
/* ── Drawer ── */
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;opacity:0;pointer-events:none;transition:opacity .22s;backdrop-filter:blur(2px)}
.drawer-overlay.open{opacity:1;pointer-events:all}
.drawer-overlay.open .drawer{transform:translateX(0)}
.drawer{position:absolute;right:0;top:0;bottom:0;width:100%;max-width:460px;background:#fff;box-shadow:-4px 0 32px rgba(0,0,0,.12);transform:translateX(100%);transition:transform .3s cubic-bezier(.34,1,.64,1);display:flex;flex-direction:column;overflow-y:auto}
.drawer-header{padding:20px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1}
.drawer-title{font-size:1.1rem;font-weight:800;color:var(--black);letter-spacing:-.3px}
.drawer-close{background:var(--bg2);border:1px solid var(--border);border-radius:6px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.85rem;color:var(--sub);transition:all .15s}
.df-field{margin-bottom:10px}
.df-field label{font-size:.68rem;font-weight:700;color:var(--sub);display:block;margin-bottom:4px}
.df-field input,.df-field textarea{width:100%;padding:10px 12px;background:#fff;border:1.5px solid var(--border2);border-radius:7px;font-family:var(--sans);font-size:.86rem;color:var(--text);outline:none;transition:border-color .15s}
.df-field input:focus,.df-field textarea:focus{border-color:var(--red)}
.df-field textarea{resize:none;height:64px;font-size:.8rem}
.checkout-btn{width:100%;padding:14px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.98rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .18s}
.checkout-btn:hover{background:var(--red2);transform:translateY(-1px)}
.checkout-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
 
/* ── Auth ── */
.auth-page{min-height:80vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:var(--bg2)}
.auth-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:36px 32px;width:100%;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,.08)}
.auth-logo{font-family:var(--sans);font-size:1.4rem;font-weight:800;color:var(--red);text-align:center;margin-bottom:4px;letter-spacing:-.5px}
.auth-logo span{color:var(--black)}
.auth-tagline{text-align:center;color:var(--muted);font-size:.8rem;margin-bottom:22px}
.auth-tabs{display:flex;background:var(--bg2);border-radius:8px;padding:3px;gap:3px;margin-bottom:22px}
.auth-tab{flex:1;padding:8px;border-radius:6px;border:none;background:transparent;font-family:var(--sans);font-size:.82rem;font-weight:600;color:var(--sub);cursor:pointer;transition:all .18s}
.auth-tab.active{background:#fff;color:var(--black);box-shadow:0 1px 4px rgba(0,0,0,.08)}
.auth-field{margin-bottom:12px}
.auth-field label{display:block;font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:5px}
.auth-field input{width:100%;padding:11px 12px;border:1.5px solid var(--border2);border-radius:7px;font-family:var(--sans);font-size:.88rem;color:var(--text);outline:none;transition:border-color .15s;background:#fff}
.auth-field input:focus{border-color:var(--red)}
.auth-btn{width:100%;padding:13px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.95rem;font-weight:800;cursor:pointer;transition:all .18s;margin-top:4px;letter-spacing:-.2px}
.auth-btn:hover:not(:disabled){background:var(--red2);transform:translateY(-1px)}
.auth-btn:disabled{opacity:.45;cursor:not-allowed}
.auth-error{font-size:.75rem;color:var(--red);margin-top:5px;min-height:16px}
.auth-badge{display:block;text-align:center;width:fit-content;margin:0 auto 16px;background:rgba(26,158,86,.08);border:1px solid rgba(26,158,86,.15);color:var(--green);font-size:.7rem;font-weight:700;padding:4px 12px;border-radius:16px}
 
/* ── Admin ── */
.admin-input{width:100%;padding:10px 12px;border:1.5px solid var(--border2);border-radius:7px;font-family:var(--sans);font-size:.86rem;color:var(--text);outline:none;transition:border-color .15s;background:#fff}
.admin-input:focus{border-color:var(--red)}
 
/* ── Footer ── */
footer{background:var(--black);color:rgba(255,255,255,.55);padding:48px 0 24px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px}
.footer-brand{font-family:var(--sans);font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:10px;letter-spacing:-.5px}
.footer-brand span{color:var(--red)}
.footer-tagline{font-size:.8rem;line-height:1.7;margin-bottom:18px;max-width:260px}
.footer-socials{display:flex;gap:7px}
.social-btn{width:32px;height:32px;border-radius:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:.85rem;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.5);text-decoration:none}
.social-btn:hover{background:rgba(255,255,255,.15);color:#fff}
.footer-col h4{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;margin-bottom:14px}
.footer-links{display:flex;flex-direction:column;gap:8px}
.footer-link{font-size:.8rem;cursor:pointer;transition:color .15s}
.footer-link:hover{color:#fff}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.footer-legal{font-size:.72rem}
.footer-payments{display:flex;align-items:center;gap:7px}
.pay-badge{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:4px;padding:3px 9px;font-size:.68rem;font-weight:600;color:rgba(255,255,255,.4)}
 
/* ── Nav avatar ── */
.nav-avatar{
  width:36px;height:36px;border-radius:50%;
  background:var(--red);color:#fff;font-weight:800;font-size:.78rem;
  display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;
}
 
/* ── Bottom Nav ── */
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:300;background:#fff;border-top:1.5px solid var(--border);padding:8px 0 max(12px,env(safe-area-inset-bottom));box-shadow:0 -2px 12px rgba(0,0,0,.08)}
.bottom-nav-inner{display:grid;grid-template-columns:repeat(4,1fr);max-width:480px;margin:0 auto;padding:0 6px;gap:0}
.bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 4px;border:none;background:none;cursor:pointer;border-radius:8px;color:var(--muted);transition:color .15s;position:relative;-webkit-tap-highlight-color:transparent}
.bn-item.active{color:var(--red)}
.bn-pill{width:40px;height:28px;border-radius:12px;display:flex;align-items:center;justify-content:center;transition:background .15s}
.bn-item.active .bn-pill{background:rgba(26,122,60,.08)}
.bn-item.active .bn-pill svg{stroke:var(--red)}
.bn-label{font-size:.58rem;font-weight:700;letter-spacing:.2px;line-height:1}
.bn-badge{position:absolute;top:3px;right:calc(50% - 22px);width:7px;height:7px;border-radius:50%;background:var(--red);border:2px solid #fff}
.bn-item.active .bn-label::after{content:"";display:block;width:3px;height:3px;border-radius:50%;background:var(--red);margin:2px auto 0}
 
/* ── Scroll top ── */
.scroll-top{position:fixed;bottom:calc(80px + env(safe-area-inset-bottom));left:16px;width:38px;height:38px;border-radius:50%;background:var(--black);color:#fff;border:none;font-size:.9rem;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .25s,transform .18s;z-index:400;box-shadow:var(--sh2)}
.scroll-top.show{opacity:1;pointer-events:all}
.scroll-top:hover{transform:translateY(-2px)}
 
/* ── Animations ── */
@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
.spin-anim{animation:spin .7s linear infinite}
 
/* ── Partners section ── */
.partners-section{background:#fff;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:28px 0}
.partners-label{text-align:center;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:20px}
.partners-row{display:flex;align-items:center;justify-content:center;gap:36px;flex-wrap:wrap;padding:0 20px}
.partner-logo{font-family:var(--sans);font-size:1rem;font-weight:800;color:var(--muted);opacity:.5;transition:opacity .18s;cursor:default;letter-spacing:-.3px}
.partner-logo:hover{opacity:.85}
.partner-logo span{color:var(--red);opacity:1}
 
/* ── Mobile hamburger ── */
.nav-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:7px;flex-shrink:0;margin-left:auto}
.nav-hamburger span{display:block;width:20px;height:2px;background:var(--black);border-radius:2px;transition:transform .22s,opacity .22s}
.nav-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav-hamburger.open span:nth-child(2){opacity:0}
.nav-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mobile-menu{display:none;position:absolute;top:64px;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:8px 12px 12px;flex-direction:column;gap:2px;z-index:99;box-shadow:0 8px 24px rgba(0,0,0,.1)}
.mobile-menu.open{display:flex}
.mobile-menu-link{padding:11px 14px;border-radius:7px;font-size:.88rem;font-weight:600;color:var(--sub);cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:background .15s,color .15s}
.mobile-menu-link:hover,.mobile-menu-link.active{background:var(--bg2);color:var(--black)}
.mobile-menu-divider{height:1px;background:var(--border);margin:7px 0}
.mobile-menu-cta{margin-top:3px;padding:12px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.88rem;font-weight:800;cursor:pointer;text-align:center;width:100%}
.mobile-user-header{display:flex;align-items:center;gap:10px;padding:10px 14px 6px}
.mobile-user-name{font-size:.85rem;font-weight:700;color:var(--black)}
.mobile-user-email{font-size:.72rem;color:var(--muted);margin-top:1px}
 
/* ── Responsive ── */
@media(max-width:1024px){
  .footer-grid{grid-template-columns:1fr 1fr;gap:28px}
  .modal-inner{grid-template-columns:1fr}
  .hiw-steps{grid-template-columns:1fr 1fr}
  .testi-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:768px){
  .container{padding:0 14px}
  .section{padding:20px 0}
  .section-head{padding:0 14px;margin-bottom:12px}
  .nav-inner{padding:0 14px;gap:10px}
  .nav-user{display:none}
  .nav-search,.nav-links,.nav-cta{display:none}
  .nav-hamburger{display:flex}
  .nav{position:relative}
  .cats-section{top:56px}
  .hscroll-row,.cards-grid{padding:0 14px}
  .promo-banner{margin:0 14px 6px}
  .cat-showcase{padding:0 14px;grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}
  .testi-grid{grid-template-columns:1fr;padding:0 14px}
  .trust-bar-inner{padding:0 14px}
  .occ-grid{padding:0 14px}
  .section-head{padding:0 14px}
  .hiw-steps{grid-template-columns:1fr 1fr;margin:0 14px}
  .partners-row{gap:20px;padding:0 14px}
  .footer-grid{grid-template-columns:1fr}
  .footer-bottom{flex-direction:column;align-items:flex-start}
  .auth-card{padding:28px 20px;border-radius:14px}
  .modal-sheet{border-radius:16px 16px 0 0;max-height:96vh}
  .modal-inner{grid-template-columns:1fr}
  .modal-gallery img{min-height:200px}
  .modal-body{padding:20px}
  .drawer{max-width:100%}
  .hero-delivery-bar{padding:14px 14px}
  .promo-banner-title{font-size:1.2rem}
}
@media(max-width:600px){
  .cards-grid{
    grid-template-columns:1fr 1fr;
    gap:10px;
    padding:0 14px;
  }
  .card{width:auto;min-width:auto}
  .card-img{height:120px}
  .card-name{font-size:.82rem}
  .card-price-val{font-size:.95rem}
  .card-add-btn{width:30px;height:30px;font-size:1.1rem}
  .hiw-steps{grid-template-columns:1fr}
  .testi-grid{grid-template-columns:1fr}
  .footer-socials{gap:5px}
  .footer-payments{flex-wrap:wrap;gap:5px}
  .nl-form{flex-direction:column;border-radius:10px}
  .nl-form input{border-radius:8px 8px 0 0;border-right:none}
  .nl-btn{padding:11px;border-radius:0 0 8px 8px}
  .bottom-nav{display:block}
  body{padding-bottom:calc(64px + env(safe-area-inset-bottom))}
  footer{padding-bottom:calc(60px + env(safe-area-inset-bottom))}
}
  /* ── Mobile nav fix ── */
@media(max-width:768px){
  .nav-inner{
    display:grid;
    grid-template-columns:auto 1fr auto;
    align-items:center;
    padding:0 14px;
    height:56px;
    gap:10px;
  }
  .nav-logo{
    grid-column:1;
    font-size:1.1rem;
  }
  .nav-address-btn{
    display:none;
  }
  .nav-hamburger{
    grid-column:3;
    display:flex;
    margin-left:0;
  }
  .mobile-menu{
    top:56px;
  }
}

/* ── Mobile content edge-to-edge fix ── */
@media(max-width:600px){
  .container{padding:0 14px}
  .section-head{padding:0 14px}
  .hscroll-row{padding:0 14px}
  .cards-grid{
    padding:0 14px;
    grid-template-columns:1fr 1fr;
  }
  .cat-showcase{padding:0 14px}
  .occ-grid{padding:0 14px}
  .testi-grid{padding:0 14px}
  .promo-banner{margin:0 14px 6px}
  .hiw-steps{margin:0 14px}
  .partners-row{padding:0 14px}
  .hero-search-bar{margin:12px 14px}
  .hero-trust-row{padding:0 14px}
  section.section > *:not(.section-head){padding-left:14px;padding-right:14px}
}
   
/* ── Sliding Promo Banner (Avo-style) ── */
.promo-strip {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-bottom: 1px solid var(--border);
}
.promo-strip-track {
  display: flex;
  transition: transform .55s cubic-bezier(.4,0,.2,1);
  will-change: transform;
}
.promo-slide {
  min-width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 320px;
  cursor: pointer;
}
.promo-slide-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 44px 48px;
  background: var(--slide-bg, #fff);
  position: relative;
  overflow: hidden;
}
.promo-slide-left::before {
  content: '';
  position: absolute;
  right: -60px; top: -60px;
  width: 260px; height: 260px;
  border-radius: 50%;
  background: rgba(255,255,255,.08);
  pointer-events: none;
}
.promo-slide-right {
  position: relative;
  overflow: hidden;
}
.promo-slide-right img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .6s ease;
}
.promo-slide:hover .promo-slide-right img {
  transform: scale(1.04);
}
.promo-eyebrow {
  font-size: .65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
  opacity: .75;
}
.promo-headline {
  font-size: clamp(1.6rem, 3.5vw, 2.6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -.5px;
  margin-bottom: 10px;
}
.promo-sub {
  font-size: .88rem;
  line-height: 1.65;
  margin-bottom: 22px;
  opacity: .75;
  max-width: 360px;
}
.promo-cta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.promo-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 12px 22px;
  border-radius: 8px;
  font-family: var(--sans);
  font-size: .85rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all .18s;
  background: #fff;
  letter-spacing: -.1px;
}
.promo-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,.15);
}
.promo-btn-ghost {
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: none;
  opacity: .7;
  transition: opacity .15s;
  font-family: var(--sans);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.promo-btn-ghost:hover { opacity: 1; }
.promo-price-badge {
  position: absolute;
  top: 20px; right: 20px;
  background: var(--red);
  color: #fff;
  padding: 8px 14px;
  border-radius: 50px;
  font-size: .72rem;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(26,122,60,.35);
  z-index: 2;
  white-space: nowrap;
}
/* Nav dots */
.promo-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}
.promo-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,.2);
  cursor: pointer;
  padding: 0;
  transition: all .2s;
}
.promo-dot.active {
  background: var(--red);
  width: 22px;
  border-radius: 4px;
}
/* Prev/next arrows */
.promo-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,.92);
  box-shadow: 0 2px 12px rgba(0,0,0,.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .9rem;
  color: var(--black);
  transition: all .18s;
}
.promo-arrow:hover {
  background: #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,.18);
  transform: translateY(-50%) scale(1.08);
}
.promo-arrow.prev { left: 14px; }
.promo-arrow.next { right: 14px; }
/* Progress bar */
.promo-progress {
  position: absolute;
  bottom: 0; left: 0;
  height: 3px;
  background: var(--red);
  border-radius: 0 2px 2px 0;
  transition: width linear;
  z-index: 10;
}
 
/* ── Flash Deals Section ── */
.flash-deals-section {
  background: #fff;
  border-bottom: 1px solid var(--border);
  padding: 0 0 28px;
}
.flash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 20px 16px;
  max-width: var(--max);
  margin: 0 auto;
}
.flash-label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.flash-fire {
  font-size: 1.1rem;
  animation: flicker 1.2s ease-in-out infinite alternate;
}
@keyframes flicker {
  from { filter: brightness(1); }
  to { filter: brightness(1.35) drop-shadow(0 0 4px #ff6b00); }
}
.flash-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--black);
  letter-spacing: -.2px;
}
.flash-countdown {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .72rem;
  font-weight: 700;
  color: var(--muted);
}
.flash-timer-block {
  background: var(--black);
  color: #fff;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: .75rem;
  font-weight: 800;
  min-width: 28px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.flash-colon {
  color: var(--red);
  font-weight: 800;
  font-size: .9rem;
  margin-top: -2px;
}
.flash-row {
  display: flex;
  gap: 12px;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
  max-width: var(--max);
  margin: 0 auto;
}
.flash-row::-webkit-scrollbar { display: none; }
.flash-deal-card {
  flex-shrink: 0;
  width: 180px;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all .22s;
  position: relative;
}
.flash-deal-card:hover {
  border-color: var(--red);
  box-shadow: 0 6px 24px rgba(26,122,60,.1);
  transform: translateY(-3px);
}
.flash-deal-img {
  height: 120px;
  background: var(--bg2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  position: relative;
}
.flash-deal-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.flash-off-badge {
  position: absolute;
  top: 8px; left: 8px;
  background: var(--red);
  color: #fff;
  font-size: .6rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: .3px;
}
.flash-deal-body {
  padding: 10px 12px 12px;
}
.flash-deal-name {
  font-size: .78rem;
  font-weight: 700;
  color: var(--black);
  line-height: 1.3;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.flash-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.flash-price-now {
  font-size: 1rem;
  font-weight: 800;
  color: var(--red);
  letter-spacing: -.3px;
}
.flash-price-was {
  font-size: .72rem;
  color: var(--muted);
  text-decoration: line-through;
}
.flash-stock-bar {
  height: 3px;
  background: var(--bg2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}
.flash-stock-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--red), #ff6b35);
  border-radius: 2px;
  transition: width .3s;
}
.flash-stock-lbl {
  font-size: .58rem;
  color: var(--muted);
  margin-top: 4px;
  font-weight: 600;
}
 
/* ── Hero redesign ── */
.hero-v2 {
  background: var(--black);
  position: relative;
  overflow: hidden;
  min-height: 420px;
  display: flex;
  flex-direction: column;
}
.hero-v2-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%);
}
.hero-v2-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 20% 50%, rgba(26,122,60,.12) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(26,122,60,.08) 0%, transparent 40%);
}
.hero-v2-inner {
  position: relative;
  z-index: 2;
  max-width: var(--max);
  margin: 0 auto;
  width: 100%;
  padding: 36px 24px 28px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
}
.hero-v2-left {}
.hero-v2-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(26,122,60,.15);
  border: 1px solid rgba(26,122,60,.3);
  border-radius: 50px;
  padding: 5px 13px;
  font-size: .68rem;
  font-weight: 700;
  color: #ff6b6b;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 14px;
}
.hero-v2-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ff4040;
  animation: pulse-dot 1.4s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .5; transform: scale(.7); }
}
.hero-v2-title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.05;
  letter-spacing: -.5px;
  margin-bottom: 12px;
}
.hero-v2-title em {
  font-style: normal;
  color: var(--red);
}
.hero-v2-sub {
  font-size: .9rem;
  color: rgba(255,255,255,.55);
  line-height: 1.65;
  margin-bottom: 24px;
  max-width: 520px;
}
.hero-v2-search {
  display: flex;
  background: rgba(255,255,255,.08);
  border: 1.5px solid rgba(255,255,255,.15);
  border-radius: 10px;
  overflow: hidden;
  max-width: 560px;
  backdrop-filter: blur(8px);
  transition: border-color .2s;
}
.hero-v2-search:focus-within {
  border-color: rgba(227,0,27,.5);
  background: rgba(255,255,255,.12);
}
.hero-v2-search input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  padding: 14px 16px;
  color: #fff;
  font-family: var(--sans);
  font-size: .9rem;
}
.hero-v2-search input::placeholder { color: rgba(255,255,255,.35); }
.hero-v2-search-btn {
  background: var(--red);
  border: none;
  padding: 0 22px;
  color: #fff;
  font-weight: 800;
  font-size: .85rem;
  font-family: var(--sans);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  transition: background .15s;
}
.hero-v2-search-btn:hover { background: var(--red2); }
.hero-v2-trust {
  display: flex;
  gap: 20px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.hero-v2-trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .72rem;
  color: rgba(255,255,255,.45);
  font-weight: 500;
}
.hero-v2-trust-item strong { color: rgba(255,255,255,.75); }
/* Floating stats card on the right */
.hero-v2-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}
.hero-stat-card {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 14px 18px;
  text-align: center;
  min-width: 120px;
  transition: background .2s;
}
.hero-stat-card:hover { background: rgba(255,255,255,.1); }
.hero-stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -.5px;
  line-height: 1;
  margin-bottom: 3px;
}
.hero-stat-lbl {
  font-size: .6rem;
  color: rgba(255,255,255,.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}
/* Ticker strip under hero */
.hero-ticker {
  background: var(--red);
  position: relative;
  z-index: 2;
  overflow: hidden;
  height: 38px;
  display: flex;
  align-items: center;
}
.hero-ticker-track {
  display: flex;
  gap: 0;
  animation: ticker-scroll 35s linear infinite;
  white-space: nowrap;
}
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.hero-ticker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  font-size: .72rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}
.hero-ticker-sep {
  color: rgba(255,255,255,.4);
  margin: 0 4px;
}
 
/* ── Category Pills (enhanced) ── */
.cats-section-v2 {
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 64px;
  z-index: 90;
}
.cat-pill-v2 {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 14px 18px;
  border-bottom: 3px solid transparent;
  font-size: .8rem;
  font-weight: 600;
  color: var(--sub);
  white-space: nowrap;
  cursor: pointer;
  transition: all .15s;
  flex-shrink: 0;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
}
.cat-pill-v2:hover { color: var(--black); }
.cat-pill-v2.active { color: var(--red); border-bottom-color: var(--red); }
.cat-pill-v2-emoji { font-size: 1.1rem; }
 
/* Mobile responsive for promo strip */
@media(max-width: 768px) {
  .promo-slide { grid-template-columns: 1fr; min-height: auto; }
  .promo-slide-right { height: 200px; }
  .promo-slide-left { padding: 28px 20px; }
  .promo-arrow { display: none; }
  .hero-v2-inner { grid-template-columns: 1fr; }
  .hero-v2-stats { flex-direction: row; flex-wrap: wrap; }
  .hero-stat-card { min-width: 100px; padding: 10px 14px; }
  .hero-v2-title { font-size: clamp(1.6rem, 6vw, 2.2rem); }
}
@media(max-width: 600px) {
  .hero-v2-stats { display: none; }
  .flash-deal-card { width: 158px; }
}
`;

// ══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════

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
 export function HeroV2({ vouchers = [], onSearch }) {
  const [query, setQuery] = React.useState('');
 
  const TICKER_ITEMS = [
"🧖 Couples Spa Day — US$109",
"🪂 Tandem Skydive — US$179",
"🍲 Sunday Lunch for Two — US$25",
"🎵 Live Jazz Evening — US$47",
"🌸 Luxury Rose Arrangement — US$41",
"🏡 Ancient City Lodge Stay — US$169",
"💅 Bridal Glow Package — US$118",
"🎪 Birthday Bundle — US$112",
  ];
  // Duplicate for seamless loop
  const allTickers = [...TICKER_ITEMS, ...TICKER_ITEMS];
 
  const handleSearch = () => onSearch && onSearch(query);
 
  return (
    <div className="hero-v2">
      <div className="hero-v2-bg" />
      <div className="hero-v2-pattern" />
      <div className="hero-v2-inner">
        <div className="hero-v2-left">
          <div className="hero-v2-eyebrow">
            <span className="hero-v2-eyebrow-dot" />
            Live now · Zimbabwe's gift experience platform
          </div>
          <h1 className="hero-v2-title">
            Give them an experience<br />
            they'll never <em>forget.</em>
          </h1>
          <p className="hero-v2-sub">
            200+ curated Zimbabwean experiences — spas, live music, traditional meals,
            adventures and more. Pay once, delivered to WhatsApp instantly.
          </p>
          <div className="hero-v2-search">
            <input
              type="text"
              placeholder="Spa day, safari, live jazz, send mum lunch…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="hero-v2-search-btn" onClick={handleSearch}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
          </div>
          <div className="hero-v2-trust">
            {[
              ['⭐', '4.9', '/ 2,800+ reviews'],
              ['📱', 'Instant', 'WhatsApp delivery'],
              ['🔒', 'PayFast', 'secure checkout'],
              ['✅', 'Verified', 'ZIM partners'],
            ].map(([icon, val, lbl]) => (
              <div key={lbl} className="hero-v2-trust-item">
                {icon} <strong>{val}</strong> {lbl}
              </div>
            ))}
          </div>
        </div>
        {/* Right: floating stat cards */}
        <div className="hero-v2-stats">
          {[
            { val: vouchers.length || '200+', lbl: 'Experiences' },
            { val: '2.8k+', lbl: 'Vouchers Sold' },
           { val: 'US$33', lbl: 'From' },
          ].map(s => (
            <div key={s.lbl} className="hero-stat-card">
              <div className="hero-stat-val">{s.val}</div>
              <div className="hero-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Scrolling ticker */}
      <div className="hero-ticker">
        <div className="hero-ticker-track">
          {allTickers.map((item, i) => (
            <React.Fragment key={i}>
              <span className="hero-ticker-item">{item}</span>
              <span className="hero-ticker-sep">·</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
// ─── Store Page ───────────────────────────────────────────────────────────
function StorePage({ vouchers, loading, setPage, onCatSelect }) {
  const [lastViewed, setLastViewed] = useState(null);
  const [currentCat, setCurrentCat] = useState("All");
  const [sortVal, setSortVal] = useState("default");
  const [searchQ, setSearchQ] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [drawerVoucher, setDrawerVoucher] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const onSearch = (q) => setSearchQ(q);
  // ── Updated category list now includes Music and Events ─────────────────
  const allCats = [
    "All",
    "Wellness & Spa",
    "Hair & Beauty",
    "Adventure",
    "Dining & Wine",
    "Traditional Restaurants",
    "Stays",
    "Skills",
    "Music",
    "Events",
    "Florists",
  ];
  const catIcons = {
    All: "🌟",
    "Wellness & Spa": "🧖",
    "Hair & Beauty": "💅",
    Adventure: "🪂",
    "Dining & Wine": "🍷",
    "Traditional Restaurants": "🍲",
    Stays: "🏡",
    Florists: "🌸",
    Skills: "📚",
    Music: "🎵",
    Events: "🎪",
  };
  const HERO_CARDS = [
    {
      emoji: "🧖",
      name: "Couples Spa Day",
      cat: "Wellness",
      price: "R 1,800",
      img: "/images/spa.jpg",
    },
    {
      emoji: "🪂",
      name: "Tandem Skydive",
      cat: "Adventure",
      price: "R 2,950",
      img: "",
    },
    {
      emoji: "🍲",
      name: "Sunday Lunch for Two",
      cat: "Traditional",
      price: "R 420",
      img: "/images/kwaterry.jpg",
    },
    {
      emoji: "🎵",
      name: "Live Jazz Evening",
      cat: "Music",
      price: "R 780",
      img: "/images/music.jpg",
    },
    {
      emoji: "🌸",
      name: "Luxury Rose Arrangement",
      cat: "Florists",
      price: "R 680",
      img: "/images/florists.jpg",
    },
    {
      emoji: "🏡",
      name: "Ancient City Lodge Stay",
      cat: "Stays",
      price: "R 2,800",
      img: "/images/ancient-city-lodge-masvingo-698880.webp",
    },
    {
      emoji: "📸",
      name: "Photography Masterclass",
      cat: "Skills",
      price: "R 890",
      img: "",
    },
    {
      emoji: "🍷",
      name: "Wine Tasting for Two",
      cat: "Dining",
      price: "R 620",
      img: "/images/dining.webp",
    },
  ];
  const occasions = [
    [<Flower2 size={28} strokeWidth={1.5} />, "Mother's Day"],
    [<Sparkles size={28} strokeWidth={1.5} />, "Just Because"],
    [<Cake size={28} strokeWidth={1.5} />, "Birthday"],
    [<Heart size={28} strokeWidth={1.5} />, "Anniversary"],
    [<Music size={28} strokeWidth={1.5} />, "Concert Night"],
    [<UtensilsCrossed size={28} strokeWidth={1.5} />, "Send Mum Lunch"],
    [<PartyPopper size={28} strokeWidth={1.5} />, "Private Function"],
    [<GraduationCap size={28} strokeWidth={1.5} />, "Graduation"],
  ];
  const handleOpenVoucher = (v) => {
    setLastViewed(v);
    setSelectedVoucher(v);
  };
  const filtered = vouchers
    .filter((v) => currentCat === "All" || v.cat === currentCat)
    .filter((v) => {
      if (!searchQ.trim()) return true;
      const q = searchQ.toLowerCase();
      return (
        (v.name || "").toLowerCase().includes(q) ||
        (v.desc || "").toLowerCase().includes(q) ||
        (v.cat || "").toLowerCase().includes(q) ||
        (v.city || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortVal === "price-asc") return a.price - b.price;
      if (sortVal === "price-desc") return b.price - a.price;
      if (sortVal === "rating") return b.rating - a.rating;
      return 0;
    });

  const catCount = (cat) =>
    cat === "All"
      ? vouchers.length
      : vouchers.filter((v) => v.cat === cat).length;

  const handleCheckout = async ({
    buyerName,
    buyerEmail,
    recipientPhone,
    recipientName,
    note,
  }) => {
    await new Promise((r) => setTimeout(r, 2000));
    const code = genCode();
    setCheckoutSuccess({ code, voucher: drawerVoucher, recipientPhone });
  };

  return (
    <>
      {/* Hero */}

 <PromoBanner onCatSelect={onCatSelect} />
  <HeroV2 vouchers={vouchers} onSearch={onSearch} />
  <FlashDeals vouchers={vouchers} onOpen={setSelectedVoucher} />
      {/* Category pills — scrollable, includes Music + Events */}
     <div className="cats-section">
  <div className="cats-scroll" style={{maxWidth:'var(--max)',margin:'0 auto'}}>
    {allCats.map(cat => (
      <button
        key={cat}
        className={`cat-pill${currentCat === cat ? ' active' : ''}`}
        onClick={() => setCurrentCat(cat)}
        onDoubleClick={() => cat !== 'All' && onCatSelect(cat)}
      >
        <span className="cat-pill-emoji">{catIcons[cat]}</span>
        {cat === 'All' ? 'All' : cat}
      </button>
    ))}
  </div>
</div>

      {/* Featured */}
     {vouchers.length > 0 && (
  <section className="section" style={{paddingBottom:0}}>
    <div
      className="promo-banner"
      onClick={() => setSelectedVoucher(vouchers[0])}
    >
      <div className="promo-banner-bg">
        {vouchers[0].imageUrl && <img src={vouchers[0].imageUrl} alt="" />}
      </div>
      <div className="promo-banner-content">
        <div className="promo-banner-eyebrow">✦ Featured experience</div>
        <div className="promo-banner-title">{vouchers[0].name}</div>
        <div className="promo-banner-sub">{(vouchers[0].desc||'').substring(0,90)}{(vouchers[0].desc||'').length>90?'…':''}</div>
        <button className="promo-banner-btn">
          View experience →
        </button>
      </div>
    </div>
  </section>

)}
<section className="section">
  <div className="section-head">
    <div>
      <div className="section-title">New arrivals</div>
      <div className="section-sub">Just added by our partners</div>
    </div>
    <button className="see-all" onClick={() => onCatSelect(currentCat)}>See all →</button>
  </div>
  <div className="hscroll-row">
   {loading
  ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
  : filtered.slice(0, 10).map(v => (
      <VoucherCard key={v.id} voucher={v} onOpen={setSelectedVoucher} />
    ))
}
  </div>
</section>
      {/* Trust bar */}
      <div className="trust-bar">
        <div className="trust-bar-inner">
          {[
            ["🔒", "Secure Payments", "PayFast encrypted checkout"],
            ["📱", "Instant WhatsApp", "Voucher delivered in seconds"],
            ["✅", "Verified Partners", "All businesses vetted by us"],
            ["🔄", "Flexible Bookings", "Reschedule anytime"],
            ["🎁", "Custom Messages", "Personalise every gift"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="trust-item">
              <div className="trust-icon">{icon}</div>
              <div className="trust-text">
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Vouchers grid */}
    <section className="section">
  <div className="section-head">
    <div>
      <div className="section-title">
        {currentCat === 'All' ? 'All experiences' : currentCat}
      </div>
      <div className="section-sub">
        {loading ? 'Loading…' : `${filtered.length} experience${filtered.length !== 1 ? 's' : ''}`}
      </div>
    </div>
    <select value={sortVal} onChange={e => setSortVal(e.target.value)} style={{
      padding:'7px 12px',border:'1.5px solid var(--border2)',borderRadius:7,
      fontFamily:'var(--sans)',fontSize:'.78rem',color:'var(--sub)',
      background:'#fff',outline:'none',cursor:'pointer'
    }}>
      <option value="default">Sort: Featured</option>
      <option value="price-asc">Price ↑</option>
      <option value="price-desc">Price ↓</option>
      <option value="rating">Top rated</option>
    </select>
  </div>
  {/* keep your existing cards-grid and filtered.map(...) here unchanged */}
</section>

      {/* Occasions — added Music & Events-relevant occasions */}
      <section className="occasions">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-eyebrow">✦ Gift by Occasion</p>
              <h2 className="section-title">What are you celebrating?</h2>
              <p className="section-sub">
                Find the perfect voucher for every moment
              </p>
            </div>
          </div>
          <div className="occ-grid">
            {occasions.map(([icon, name]) => (
              <div key={name} className="occ">
                <span
                  className="occ-icon"
                  style={{
                    color: "var(--leaf)",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </span>
                <div className="occ-name">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Showcase — now includes Music + Events rows */}
      <section className="section container">
        <div className="section-head">
          <div>
            <p className="section-eyebrow">✦ Browse by Category</p>
            <h2 className="section-title">Explore experiences</h2>
          </div>
        </div>
        <div className="cat-showcase">
          {[
            [
              "Adventure",
              "🪂",
              "/images/ancient-city-lodge-masvingo-698880.webp?w=600&q=80",
             "4 experiences from US$51",
            ],
            [
              "Wellness",
              "🧖",
              "/images/wellness.avif?w=600&q=80",
              "3 experiences from US$33",
            ],
            [
              "Dining & Wine",
              "🍷",
              "/images/dining.webp?w=600&q=80",
              "4 experiences from US$34",
            ],
            [
              "Traditional Restaurants",
              "🍲",
              "/images/kwaterry.jpg?w=600&q=80",
              "8 experiences from US$15",
            ],
            [
              "Music",
              "🎵",
              "/images/music.jpg?w=600&q=80",
              "5 experiences from US$27",
            ],
            [
              "Events",
              "🎪",
              "/images/events.jpg?w=600&q=80",
              "5 experiences from US$35",
            ],
            [
              "Florists",
              "🌸",
              "/images/florists.jpg?w=600&q=80",
              "6 experiences from US$21",
            ],
            [
              "Hair & Beauty",
              "📚",
              "/images/hair.jpg?w=600&q=80",
              "2 experiences from US$39",
            ],
            [
              "Skills",
              "📚",
              "/images/skills.jpg?w=600&q=80",
              "12 experiences from US$21",
            ],
          ].map(([cat, icon, img, sub]) => (
            <div
              key={cat}
              className="cat-block"
              onClick={() => onCatSelect(cat)}
            >
              <div className="cat-block-img">
                <img
                  src={img}
                  alt={cat}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="cat-block-overlay">
                <span className="cat-block-icon">{icon}</span>
                <h3>{cat}</h3>
                <p>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — added music/events reviews */}
      <section className="section container">
        <div className="section-head">
          <div>
            <p className="section-eyebrow">✦ Reviews</p>
            <h2 className="section-title">What people are saying</h2>
          </div>
        </div>
        <div className="testi-grid">
          {[
            {
              init: "TN",
              name: "Thabo N.",
              loc: "Harare",
              prod: "Couples Spa Day",
              text: "Bought this for my wife's birthday. She got the code on WhatsApp within seconds and absolutely loved the spa day.",
            },
            {
              init: "MK",
              name: "Michelle K.",
              loc: "Victoria Falls",
              prod: "Corporate Function",
              text: "Organised a half-day corporate function for 25 people. The on-site coordinator handled everything — our team was blown away.",
            },
            {
              init: "TC",
              name: "Tinashe C.",
              loc: "London, UK",
              prod: "Feli Nandi's — Mum's Treat",
              text: "I'm in London and couldn't be there for Mother's Day. Bought mum the Feli Nandi's special — she called me crying happy tears. The printed card on the table made it.",
            },
          ].map((t) => (
            <div key={t.name} className="testi">
              <div className="testi-stars">⭐⭐⭐⭐⭐</div>
              <div className="testi-text">"{t.text}"</div>
              <div className="testi-author">
                <div className="testi-avatar">{t.init}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-loc">{t.loc}</div>
                </div>
                <div className="testi-product">{t.prod}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partner logos */}
      <div className="partners-section">
        <p className="partners-label">Trusted Zimbabwean Partners</p>
        <div className="partners-row">
          {[
            ["Relax", "Zone"],
            ["Skysail", "Balloons"],
            ["Vino", "Estate"],
            ["Beat", "Studio"],
            ["Stage", "Events"],
            ["Chef's", "Table"],
            ["Glow", "Studio"],
          ].map(([a, b]) => (
            <div key={a + b} className="partner-logo">
              {a}
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="hiw">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-eyebrow">✦ Simple Process</p>
              <h2 className="section-title">How AfriVoucher works</h2>
              <p className="section-sub">
                From purchase to experience in four easy steps
              </p>
            </div>
          </div>
          <div className="hiw-steps">
            {[
              [
                "01",
                "🛍️",
                "Browse & Choose",
                "Find the perfect experience from our 200+ curated Zimbabwean partners — from spa days to live music events.",
              ],
              [
                "02",
                "💳",
                "Pay Securely",
                "Checkout with PayFast — card, EFT, or SnapScan. Safe and encrypted.",
              ],
              [
                "03",
                "📱",
                "WhatsApp Delivery",
                "The recipient gets their voucher code and QR instantly on WhatsApp.",
              ],
              [
                "04",
                "🎉",
                "Enjoy the Experience",
                "Book directly with the partner. Show the QR at arrival and enjoy.",
              ],
            ].map(([num, icon, title, desc]) => (
              <div key={num} className="hiw-step">
                <div className="hiw-step-num">{num}</div>
                <div className="hiw-step-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSection />

      {selectedVoucher && (
        <ProductModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onBuy={() => {
            setDrawerVoucher(selectedVoucher);
            setSelectedVoucher(null);
          }}
        />
      )}
      {drawerVoucher && !checkoutSuccess && (
        <CheckoutDrawer
          voucher={drawerVoucher}
          onClose={() => setDrawerVoucher(null)}
          onSuccess={handleCheckout}
        />
      )}
      {checkoutSuccess && (
        <SuccessDrawer
          info={checkoutSuccess}
          onClose={() => {
            setCheckoutSuccess(null);
            setDrawerVoucher(null);
          }}
        />
      )}
    </>
  );
}

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

// ─── Product Modal ────────────────────────────────────────────────────────
function ProductModal({ voucher: v, onClose, onBuy }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="modal-overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-sheet">
        <div className="modal-inner">
          <div className="modal-gallery">
            <img
              src={v.imageUrl || v.img || ""}
              alt={v.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                minHeight: 300,
                background: "var(--cream2)",
              }}
            />
            <div className="modal-gallery-badge">
              {(v.tags || [])[0] || v.cat}
            </div>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-cat">{v.cat}</div>
            <div className="modal-title">{v.name}</div>
            <div className="modal-partner">
              📍 {v.partner} · {v.city}{" "}
              <span className="modal-partner-badge">Verified</span>
            </div>
            <div className="modal-desc">{v.desc}</div>
            {(v.includes || []).length > 0 && (
              <div className="modal-includes">
                <h4>What's included</h4>
                <div className="modal-includes-list">
                  {v.includes.map((i) => (
                    <div key={i} className="mi-row">
                      <span className="mi-check">✓</span>
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-sep" />
            <div className="modal-price-row">
              <span className="modal-price-lbl">Voucher price</span>
              <span className="modal-price-val">{fmt(v.price)}</span>
            </div>
            <button className="modal-buy-btn" onClick={onBuy}>
              🎁 Buy This Voucher
            </button>
            <button className="modal-secondary-btn" onClick={onClose}>
              ← Back to browse
            </button>
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              {[
                "⏱️ Valid " + (v.expiry || "12 months"),
                "📱 WhatsApp delivery",
                "🔒 Secure checkout",
              ].map((m) => (
                <div
                  key={m}
                  style={{ fontSize: ".75rem", color: "var(--muted)" }}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Drawer ──────────────────────────────────────────────────────
function CheckoutDrawer({ voucher: v, onClose, onSuccess }) {
  const [form, setForm] = useState({
    buyerName: "",
    buyerEmail: "",
    recipientPhone: "",
    recipientName: "",
    note: "",
  });
  const [paying, setPaying] = useState(false);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const handlePay = async () => {
    if (!form.buyerName || !form.buyerEmail || !form.recipientPhone) {
      alert("Please fill in all required fields.");
      return;
    }
    setPaying(true);
    await onSuccess(form);
  };

  return (
    <div
      className="drawer-overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">Complete your gift</div>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div
          style={{
            margin: "20px 28px",
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: 100,
              flexShrink: 0,
              background: "var(--cream2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            {v.imageUrl ? (
              <img
                src={v.imageUrl}
                alt={v.name}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 90,
                  objectFit: "cover",
                }}
              />
            ) : (
              v.icon || getCatIcon(v.cat)
            )}
          </div>
          <div style={{ padding: 14, flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: ".95rem",
                fontWeight: 600,
                color: "var(--forest)",
                marginBottom: 3,
              }}
            >
              {v.name}
            </div>
            <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>
              {v.partner} · {v.city}
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--forest)",
                marginTop: 6,
              }}
            >
              {fmt(v.price)}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 28px", flex: 1 }}>
          {[
            [
              "🎁 Recipient",
              [
                ["recipientName", "Their Name", "Optional", false],
                ["recipientPhone", "WhatsApp Number *", "+27821234567", true],
              ],
            ],
            [
              "👤 Your Details",
              [
                ["buyerName", "Your Name *", "Jane Smith", true],
                ["buyerEmail", "Your Email *", "jane@email.com", true],
              ],
            ],
          ].map(([label, fields]) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--terra)",
                  marginBottom: 12,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {fields.map(([key, lbl, ph]) => (
                  <div key={key} className="df-field">
                    <label>{lbl}</label>
                    <input
                      value={form[key]}
                      onChange={set(key)}
                      placeholder={ph}
                      type={key === "buyerEmail" ? "email" : "text"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: ".68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "var(--terra)",
                marginBottom: 12,
              }}
            >
              ✉️ Personal Note
            </div>
            <div className="df-field">
              <textarea
                value={form.note}
                onChange={set("note")}
                placeholder="Happy Birthday! Hope you enjoy this special experience 🎂"
              />
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "20px 28px 28px",
            borderTop: "1px solid var(--border)",
            position: "sticky",
            bottom: 0,
            background: "var(--cream)",
          }}
        >
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                fontSize: ".82rem",
              }}
            >
              <span style={{ color: "var(--sub)" }}>{v.name}</span>
              <span style={{ fontWeight: 600 }}>{fmt(v.price)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                fontSize: ".82rem",
              }}
            >
              <span style={{ color: "var(--sub)" }}>WhatsApp delivery</span>
              <span style={{ fontWeight: 600, color: "#1A9E56" }}>Free</span>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 8,
                marginTop: 6,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--forest)" }}>
                Total
              </span>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--forest)",
                }}
              >
                {fmt(v.price)}
              </span>
            </div>
          </div>
          <button
            className="checkout-btn"
            disabled={paying}
            onClick={handlePay}
          >
            {paying ? (
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(245,240,232,.3)",
                  borderTopColor: "var(--cream)",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin .7s linear infinite",
                }}
              />
            ) : null}
            {paying ? "Processing…" : `🔒 Pay Securely ${fmt(v.price)}`}
          </button>
          <div
            style={{
              textAlign: "center",
              fontSize: ".72rem",
              color: "var(--muted)",
              marginTop: 10,
            }}
          >
            Protected by PayFast · SSL encrypted
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Success Drawer ───────────────────────────────────────────────────────
function SuccessDrawer({ info, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="drawer-overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">Gift Sent!</div>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div
          style={{
            padding: 40,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg,var(--leaf),var(--leaf2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              animation: "popIn .5s cubic-bezier(.34,1.56,.64,1)",
            }}
          >
            🎉
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.8rem",
              color: "var(--forest)",
            }}
          >
            Gift Sent!
          </h2>
          <p
            style={{
              color: "var(--sub)",
              fontSize: ".88rem",
              lineHeight: 1.7,
              maxWidth: 320,
            }}
          >
            Your voucher is on its way to {info.recipientPhone} via WhatsApp.
          </p>
          <div
            style={{
              background: "var(--white)",
              border: "2px dashed var(--leaf)",
              borderRadius: 12,
              padding: "14px 28px",
              fontFamily: "var(--serif)",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "var(--forest)",
              letterSpacing: 3,
            }}
          >
            {info.code}
          </div>
          <img
            src={QR_URL(info.code)}
            width="150"
            height="150"
            alt="QR"
            style={{
              background: "white",
              padding: 10,
              borderRadius: 10,
              border: "1px solid var(--border)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(37,211,102,.08)",
              border: "1px solid rgba(37,211,102,.2)",
              color: "#1a9e56",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: ".8rem",
              fontWeight: 600,
            }}
          >
            ✅ Delivered via WhatsApp
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "11px 28px",
              background: "var(--cream2)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "var(--sans)",
              fontWeight: 600,
              fontSize: ".88rem",
              color: "var(--sub)",
            }}
          >
            ← Back to Store
          </button>
        </div>
        <div
          style={{
            width: "100%",
            background: "var(--cream2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              color: "var(--forest)",
              marginBottom: 8,
              fontSize: ".88rem",
            }}
          >
            📅 Book Your Experience
          </p>
          <p
            style={{
              fontSize: ".78rem",
              color: "var(--sub)",
              marginBottom: 12,
            }}
          >
            Show this code to the partner and book your preferred date:
          </p>

          <a
            href={`https://wa.me/27XXXXXXXXX?text=Hi! I have voucher ${info.code} and would like to book`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "11px 0",
              background: "#25D366",
              color: "white",
              borderRadius: 9,
              textAlign: "center",
              fontWeight: 700,
              fontSize: ".85rem",
              textDecoration: "none",
            }}
          >
            💬 Book via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────
function AuthPage({ onSuccess }) {
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    business: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [regError, setRegError] = useState("");
  const [regMsg, setRegMsg] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const setL = (k) => (e) =>
    setLoginForm((f) => ({ ...f, [k]: e.target.value }));
  const setR = (k) => (e) => setRegForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogin = async () => {
    setLoginError("");
    if (!loginForm.email || !loginForm.password) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password,
      );
      onSuccess();
    } catch (e) {
      setLoginError(
        e.code === "auth/user-not-found" ||
          e.code === "auth/wrong-password" ||
          e.code === "auth/invalid-credential"
          ? "Incorrect email or password."
          : e.code === "auth/too-many-requests"
            ? "Too many attempts. Try again later."
            : e.message,
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegError("");
    setRegMsg("");
    if (!regForm.business || !regForm.email || !regForm.password) {
      setRegError("All fields are required.");
      return;
    }
    if (regForm.password.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    if (regForm.password !== regForm.confirm) {
      setRegError("Passwords do not match.");
      return;
    }
    setRegLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        regForm.email,
        regForm.password,
      );
      const uid = cred.user.uid;
      await setDoc(doc(db, "users", uid), {
        uid,
        businessName: regForm.business,
        email: regForm.email,
        role: "partner",
        status: "active",
        voucherCount: VOUCHER_TEMPLATES.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await seedUserVouchers(uid, regForm.business, regForm.email);
      setRegMsg(
        `Account created! ${VOUCHER_TEMPLATES.length} vouchers loaded for ${regForm.business} 🎉`,
      );
      setTimeout(onSuccess, 1800);
    } catch (e) {
      setRegError(
        e.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : e.message,
      );
    } finally {
      setRegLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) {
      setResetMsg("Please enter your email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Reset email sent! Check your inbox.");
    } catch {
      setResetMsg("Could not send reset email.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          Afri<span>Voucher</span>
        </div>
        <p className="auth-tagline">
          Partner Portal — Redeem &amp; Admin access
        </p>
        <div className="auth-badge">🔒 Partner accounts only</div>
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            onClick={() => {
              setTab("login");
              setShowReset(false);
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === "register" ? " active" : ""}`}
            onClick={() => {
              setTab("register");
              setShowReset(false);
            }}
          >
            Create Account
          </button>
        </div>
        {!showReset && tab === "login" && (
          <>
            {[
              ["email", "Email Address", "email", "hello@yourbusiness.co.za"],
              ["password", "Password", "password", "Your password"],
            ].map(([k, lbl, type, ph]) => (
              <div key={k} className="auth-field">
                <label>{lbl}</label>
                <input
                  type={type}
                  value={loginForm[k]}
                  onChange={setL(k)}
                  placeholder={ph}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            ))}
            <div className="auth-error">{loginError}</div>
            <button
              className="auth-btn"
              disabled={loginLoading}
              onClick={handleLogin}
            >
              {loginLoading ? "Signing in..." : "Sign In →"}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: ".8rem",
                color: "var(--sub)",
                marginTop: 14,
              }}
            >
              <Link
                style={{
                  color: "var(--leaf)",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </Link>
            </p>
          </>
        )}
        {!showReset && tab === "register" && (
          <>
            {[
              ["business", "Business Name", "text", "Relax Zone Spa"],
              ["email", "Email Address", "email", "hello@yourbusiness.co.za"],
              ["password", "Password", "password", "Minimum 6 characters"],
              ["confirm", "Confirm Password", "password", "Repeat password"],
            ].map(([k, lbl, type, ph]) => (
              <div key={k} className="auth-field">
                <label>{lbl}</label>
                <input
                  type={type}
                  value={regForm[k]}
                  onChange={setR(k)}
                  placeholder={ph}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
              </div>
            ))}
            <div className="auth-error">{regError}</div>
            {regMsg && (
              <div
                style={{ fontSize: ".78rem", color: "#15803D", marginTop: 6 }}
              >
                {regMsg}
              </div>
            )}
            <button
              className="auth-btn"
              disabled={regLoading}
              onClick={handleRegister}
            >
              {regLoading ? "Creating account..." : "Create Account →"}
            </button>
          </>
        )}
        {showReset && (
          <>
            <div
              style={{
                textAlign: "center",
                fontSize: "2.5rem",
                marginBottom: 14,
              }}
            >
              📧
            </div>
            <p
              style={{
                textAlign: "center",
                color: "var(--sub)",
                fontSize: ".85rem",
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              Enter your email and we'll send a reset link.
            </p>
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="hello@yourbusiness.co.za"
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
              />
            </div>
            {resetMsg && (
              <div
                style={{
                  fontSize: ".78rem",
                  color: "var(--leaf)",
                  marginTop: 6,
                }}
              >
                {resetMsg}
              </div>
            )}
            <button className="auth-btn" onClick={handleReset}>
              Send Reset Email →
            </button>
            <p
              style={{ textAlign: "center", fontSize: ".8rem", marginTop: 14 }}
            >
              <Link
                style={{
                  color: "var(--leaf)",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setShowReset(false)}
              >
                ← Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
export function PromoBanner({ onCatSelect, vouchers = [] }) {
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
 
// ─── Redeem Page ──────────────────────────────────────────────────────────
function RedeemPage({ user }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    setResult(null);
    const upperCode = code.trim().toUpperCase();
    try {
      const vouchersRef = collection(db, "users", user.uid, "vouchers");
      const q = query(vouchersRef, where("code", "==", upperCode));
      const snap = await getDocs(q);
      if (snap.empty) {
        setResult({
          type: "error",
          title: "Not Found",
          msg: `No voucher with code <strong>${upperCode}</strong> found under your account.`,
        });
        setLoading(false);
        return;
      }
      const vDoc = snap.docs[0];
      const v = vDoc.data();
      if (v.status === "used") {
        setResult({
          type: "warn",
          title: "Already Redeemed",
          msg: `This voucher was already redeemed.`,
        });
        setLoading(false);
        return;
      }
      if (v.status === "expired") {
        setResult({
          type: "warn",
          title: "Expired",
          msg: `This voucher has expired.`,
        });
        setLoading(false);
        return;
      }
      await updateDoc(doc(db, "users", user.uid, "vouchers", vDoc.id), {
        status: "used",
        usedAt: serverTimestamp(),
        redeemedBy: user.email,
        updatedAt: serverTimestamp(),
      });
      setResult({
        type: "ok",
        title: "Valid — Redeemed!",
        msg: `<strong>${v.name}</strong><br/>Category: <strong>${v.category}</strong><br/>Value: <strong>R${Number(v.price).toFixed(2)}</strong>`,
      });
    } catch (e) {
      setResult({ type: "error", title: "Error", msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  const colors = { ok: "var(--leaf)", warn: "#F59E0B", error: "#EF4444" };
  const icons = { ok: "✅", warn: "⚠️", error: "❌" };

  return (
    <div className="container" style={{ maxWidth: 520, padding: "80px 32px" }}>
      <p
        style={{
          fontSize: ".72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--terra)",
          marginBottom: 8,
        }}
      >
        ✦ Validate
      </p>
      <h2
        style={{
          fontFamily: "var(--serif)",
          fontSize: "2.4rem",
          color: "var(--forest)",
          marginBottom: 8,
        }}
      >
        Redeem a Voucher
      </h2>
      <p
        style={{
          color: "var(--sub)",
          fontSize: ".9rem",
          marginBottom: 36,
          lineHeight: 1.7,
        }}
      >
        Enter the code from WhatsApp to validate.
      </p>
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 36,
        }}
      >
        <label
          style={{
            fontSize: ".7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "var(--muted)",
            display: "block",
            marginBottom: 8,
          }}
        >
          Voucher Code
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VCH-XXXXXXXX"
          style={{
            width: "100%",
            padding: "14px 18px",
            border: "1.5px solid var(--border2)",
            borderRadius: 10,
            fontFamily: "var(--serif)",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--forest)",
            letterSpacing: 3,
            outline: "none",
            marginBottom: 16,
            background: "var(--cream)",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
        />
        <button
          onClick={handleRedeem}
          disabled={loading}
          style={{
            width: "100%",
            padding: 15,
            background: "var(--forest)",
            color: "var(--cream)",
            border: "none",
            borderRadius: 10,
            fontFamily: "var(--serif)",
            fontSize: "1.05rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all .2s",
          }}
        >
          {loading ? "Looking up…" : "Validate & Redeem →"}
        </button>
      </div>
      {result && (
        <div
          style={{
            background: "var(--white)",
            border: `2px solid ${colors[result.type]}`,
            borderRadius: 16,
            padding: 28,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>
            {icons[result.type]}
          </div>
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.4rem",
              color: "var(--forest)",
              marginBottom: 10,
            }}
          >
            {result.title}
          </h3>
          <p
            style={{ color: "var(--sub)", fontSize: ".86rem", lineHeight: 1.9 }}
            dangerouslySetInnerHTML={{ __html: result.msg }}
          />
        </div>
      )}
    </div>
  );
}
function AnalyticsSection({ vouchers, sold }) {
  // Build last-6-months revenue series
  const months = [...Array(6)].map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      label: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      revenue: 0,
      count: 0,
    };
  });
  sold.forEach(order => {
    const d = order.createdAt?.toDate?.();
    if (!d) return;
    const m = months.findIndex(
      x => x.month === d.getMonth() && x.year === d.getFullYear()
    );
    if (m >= 0) {
      months[m].revenue += order.price || 0;
      months[m].count += 1;
    }
  });

  // Top vouchers by sold count
  const topMap = {};
  sold.forEach(o => {
    const key = o.name || "Unknown";
    topMap[key] = (topMap[key] || 0) + 1;
  });
  const topVouchers = Object.entries(topMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 20) + "…" : name, count }));

  const totalRev = sold.reduce((s, o) => s + (o.price || 0), 0);
  const totalSold = sold.length;
  const redemptionRate = vouchers.length
    ? Math.round((vouchers.filter(v => v.status === "used").length / vouchers.length) * 100)
    : 0;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
        gap: 12, marginBottom: 20 }}>
        {[
          { icon: "💵", val: `R ${totalRev.toLocaleString("en-ZA")}`, lbl: "Total Revenue" },
          { icon: "🛒", val: totalSold, lbl: "Units Sold" },
          { icon: "✅", val: vouchers.filter(v => v.status === "active").length, lbl: "Active Vouchers" },
          { icon: "🔖", val: vouchers.filter(v => v.status === "used").length, lbl: "Redeemed" },
          { icon: "📊", val: `${redemptionRate}%`, lbl: "Redemption Rate" },
          { icon: "🎟️", val: vouchers.length, lbl: "Total Catalogue" },
        ].map(s => (
          <div key={s.lbl} style={{ background: "#fff", border: "1px solid var(--border)",
            borderRadius: 14, padding: "18px 16px" }}>
            <div style={{ fontSize: "1.2rem", marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--black)",
              letterSpacing: "-.5px", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".7px",
              color: "var(--muted)", marginTop: 4, fontWeight: 600 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Revenue bar chart */}
        <div style={{ background: "#fff", border: "1px solid var(--border)",
          borderRadius: 14, padding: "20px 16px" }}>
          <div style={{ fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".8px", color: "var(--muted)", marginBottom: 16 }}>
            Revenue — Last 6 months
          </div>
          {totalRev === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)",
              fontSize: ".82rem" }}>No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={months} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }}
                  tickFormatter={v => `R${v >= 1000 ? (v/1000).toFixed(1)+"k" : v}`} />
                <Tooltip
                  formatter={v => [`R ${Number(v).toLocaleString("en-ZA")}`, "Revenue"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)",
                    fontSize: ".78rem" }} />
                <Bar dataKey="revenue" fill="var(--red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top vouchers bar chart */}
        <div style={{ background: "#fff", border: "1px solid var(--border)",
          borderRadius: 14, padding: "20px 16px" }}>
          <div style={{ fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".8px", color: "var(--muted)", marginBottom: 16 }}>
            Top-selling vouchers
          </div>
          {topVouchers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)",
              fontSize: ".82rem" }}>No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topVouchers} layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <YAxis type="category" dataKey="name" width={110}
                  tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)",
                  fontSize: ".78rem" }} />
                <Bar dataKey="count" fill="#1a9e56" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
function ProspectingTool() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Harare");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState([]);

  const CATEGORIES = [
    "spas", "beauty salons", "hair salons", "restaurants",
    "florists", "music venues", "event venues", "lodges",
    "adventure tours", "photography studios", "cooking classes",
  ];
  const CITIES = ["Harare", "Bulawayo", "Masvingo", "Victoria Falls",
                  "Mutare", "Gweru", "Kwekwe"];

  const search = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const searchTerm = `${q} ${city} Zimbabwe`;
      const res = await fetch(
        `${WORKER_URL}/places-search?query=${encodeURIComponent(searchTerm)}`,
        { headers: { "X-Upload-Secret": UPLOAD_SECRET } }
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results || []);
      if ((data.results || []).length === 0) setError("No results found. Try a different search term.");
    } catch (e) {
      setError("Could not connect to search. Make sure your Worker is set up with the Places API route.");
    } finally {
      setLoading(false);
    }
  };

  const saveContact = (place) => {
    setSaved(s => s.find(x => x.place_id === place.place_id)
      ? s : [...s, place]);
  };

  const copyAll = () => {
    const text = saved.map(p =>
      `${p.name} | ${p.formatted_phone_number || "no number"} | ${p.formatted_address}`
    ).join("\n");
    navigator.clipboard.writeText(text);
    alert(`${saved.length} contacts copied to clipboard`);
  };

  const waMessage = encodeURIComponent(
    "Hi! I run AfriVoucher — a Zimbabwe gift voucher platform. " +
    "We list local businesses so diaspora customers can gift your services to family back home. " +
    "Listing is free, setup takes 10 minutes, and we pay you weekly. " +
    "Can I show you how it works? 🇿🇼"
  );

  return (
    <div>
      {/* Search bar */}
      <div style={{ background: "#fff", border: "1px solid var(--border)",
        borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: 1, color: "var(--muted)", marginBottom: 12 }}>
          Search Google Places
        </div>

        {/* Quick category pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => { setQuery(cat); search(cat); }}
              style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid var(--border2)",
                background: query === cat ? "var(--red)" : "#fff",
                color: query === cat ? "#fff" : "var(--sub)",
                fontSize: ".72rem", fontWeight: 600, cursor: "pointer",
                transition: "all .15s" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Search input row */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            className="admin-input"
            placeholder="e.g. spas · florists · music venues"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            className="admin-input"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{ width: 160 }}
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button
            onClick={() => search()}
            disabled={loading}
            style={{ padding: "10px 22px", background: loading ? "var(--bg3)" : "var(--red)",
              color: loading ? "var(--muted)" : "#fff", border: "none",
              borderRadius: 8, fontWeight: 700, fontSize: ".85rem",
              cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              transition: "all .18s" }}
          >
            {loading ? "Searching…" : "🔍 Search"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEF2F2",
            border: "1px solid #EF4444", borderRadius: 8,
            fontSize: ".78rem", color: "#B91C1C" }}>
            {error}
          </div>
        )}
      </div>

      {/* Saved contacts bar */}
      {saved.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid var(--green)",
          borderRadius: 12, padding: "12px 18px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--green)" }}>
            ✅ {saved.length} contact{saved.length !== 1 ? "s" : ""} saved
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copyAll}
              style={{ padding: "7px 14px", background: "var(--bg2)",
                border: "1px solid var(--border)", borderRadius: 7,
                fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>
              📋 Copy all to clipboard
            </button>
            <button onClick={() => setSaved([])}
              style={{ padding: "7px 14px", background: "transparent",
                border: "1px solid var(--border)", borderRadius: 7,
                fontSize: ".75rem", color: "var(--muted)", cursor: "pointer" }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid var(--border)",
              borderRadius: 12, padding: 18, display: "flex", gap: 14 }}>
              <div className="skeleton" style={{ width: 48, height: 48,
                borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton skel-line med" />
                <div className="skeleton skel-line short" />
                <div className="skeleton skel-line" style={{ width: "35%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: ".75rem", color: "var(--muted)",
            marginBottom: 4, fontWeight: 600 }}>
            {results.length} businesses found
          </div>
          {results.map(place => {
            const isSaved = saved.find(x => x.place_id === place.place_id);
            const phone = place.formatted_phone_number;
            const cleanPhone = (phone || "").replace(/\D/g, "");

            return (
              <div key={place.place_id} style={{
                background: "#fff", border: `1px solid ${isSaved ? "var(--green)" : "var(--border)"}`,
                borderRadius: 12, padding: "16px 18px",
                display: "flex", alignItems: "center",
                gap: 14, flexWrap: "wrap",
                transition: "border-color .2s"
              }}>
                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: 10,
                  background: "var(--bg2)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                  🏢
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: ".92rem",
                    color: "var(--black)", marginBottom: 2 }}>
                    {place.name}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--muted)",
                    marginBottom: 4 }}>
                    📍 {place.formatted_address}
                  </div>
                  {phone ? (
                    <div style={{ fontSize: ".78rem", fontWeight: 700,
                      color: "var(--green)" }}>
                      📞 {phone}
                    </div>
                  ) : (
                    <div style={{ fontSize: ".72rem", color: "var(--muted)",
                      fontStyle: "italic" }}>
                      No phone number listed
                    </div>
                  )}
                  {place.rating && (
                    <div style={{ fontSize: ".68rem", color: "var(--muted)",
                      marginTop: 3 }}>
                      ⭐ {place.rating} · {place.user_ratings_total || 0} reviews
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 7, flexShrink: 0,
                  flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {phone && (
                    
                     <a href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "8px 14px", background: "#25D366",
                        color: "#fff", borderRadius: 8, fontSize: ".72rem",
                        fontWeight: 700, textDecoration: "none",
                        display: "flex", alignItems: "center", gap: 5 }}
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  {phone && (
                    
                     <a href={`tel:${cleanPhone}`}
                      style={{ padding: "8px 14px", background: "var(--bg2)",
                        border: "1px solid var(--border)", color: "var(--black)",
                        borderRadius: 8, fontSize: ".72rem", fontWeight: 700,
                        textDecoration: "none", display: "flex",
                        alignItems: "center", gap: 5 }}
                    >
                      📞 Call
                    </a>
                  )}
                  <button
                    onClick={() => saveContact(place)}
                    style={{ padding: "8px 12px",
                      background: isSaved ? "#F0FDF4" : "var(--bg2)",
                      border: `1px solid ${isSaved ? "var(--green)" : "var(--border)"}`,
                      borderRadius: 8, fontSize: ".72rem",
                      color: isSaved ? "var(--green)" : "var(--sub)",
                      fontWeight: 700, cursor: "pointer" }}
                  >
                    {isSaved ? "✓ Saved" : "+ Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ─── Admin Page ───────────────────────────────────────────────────────────
function AdminPage({ user, onLogout }) {
  const [vouchers, setVouchers] = useState([]);
  const [sold, setSold] = useState([]);
  const [bizName, setBizName] = useState("My Dashboard");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("vouchers");
  const [formData, setFormData] = useState({
    name: "",
    category: "Wellness",
    price: "",
    validity: "12",
    desc: "",
    includes: "",
    city: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formStatus, setFormStatus] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const vSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "vouchers"),
          orderBy("createdAt", "desc"),
        ),
      );
      setVouchers(vSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      try {
        const sSnap = await getDocs(
          query(
            collection(db, "sold_vouchers"),
            where("uid", "==", user.uid),
            orderBy("createdAt", "desc"),
          ),
        );
        setSold(sSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {}
      try {
        const uSnap = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid)),
        );
        if (!uSnap.empty)
          setBizName(uSnap.docs[0].data().businessName + " — Dashboard");
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const setF = (k) => (e) =>
    setFormData((f) => ({ ...f, [k]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddVoucher = async () => {
    if (!formData.name) {
      setFormStatus({ type: "error", msg: "Please enter a voucher name." });
      return;
    }
    if (!formData.price || isNaN(+formData.price) || +formData.price < 1) {
      setFormStatus({ type: "error", msg: "Please enter a valid price." });
      return;
    }
    if (!formData.desc) {
      setFormStatus({ type: "error", msg: "Please add a description." });
      return;
    }
    setFormLoading(true);
    setFormStatus(null);
    try {
      let imageUrl = "";
      if (imageFile && WORKER_URL) {
        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("uid", user.uid);
        fd.append("name", imageFile.name.replace(/\.[^.]+$/, ""));
        const res = await fetch(`${WORKER_URL}/upload-image`, {
          method: "POST",
          headers: { "X-Upload-Secret": UPLOAD_SECRET },
          body: fd,
        });
        const data = await res.json();
        if (data.success) imageUrl = data.url;
      }
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(formData.validity));
      const voucherData = {
        code: genCode(),
        name: formData.name,
        category: formData.category,
        city: formData.city || "Zimbabwe",
        price: parseFloat(formData.price),
        desc: formData.desc,
        includes: formData.includes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        imageUrl,
        validMonths: parseInt(formData.validity),
        expiryDate: expiryDate.toISOString(),
        status: "active",
        soldCount: 0,
        totalRevenue: 0,
        uid: user.uid,
        businessEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: "manual",
      };
      const ref = await addDoc(
        collection(db, "users", user.uid, "vouchers"),
        voucherData,
      );
      await addDoc(collection(db, "all_vouchers"), {
        ...voucherData,
        firestoreId: ref.id,
        partnerUid: user.uid,
      });
      setFormStatus({
        type: "ok",
        msg: `✅ ${formData.name} created! Now live on the Experiences page.`,
      });
      setFormData({
        name: "",
        category: "Wellness",
        price: "",
        validity: "12",
        desc: "",
        includes: "",
        city: "",
      });
      setImageFile(null);
      setImagePreview("");
      setTimeout(() => {
        load();
        setShowForm(false);
        setFormStatus(null);
      }, 1800);
    } catch (e) {
      setFormStatus({ type: "error", msg: "Error: " + e.message });
    } finally {
      setFormLoading(false);
    }
  };

  const active = vouchers.filter((v) => v.status === "active").length;
  const used = vouchers.filter((v) => v.status === "used").length;
  const soldRev = sold.reduce((s, v) => s + (v.price || 0), 0);
  const catVal = vouchers.reduce((s, v) => s + (v.price || 0), 0);
  const stats = [
    { icon: "🎟️", val: vouchers.length, lbl: "My Vouchers" },
    { icon: "✅", val: active, lbl: "Active" },
    { icon: "🔖", val: used, lbl: "Redeemed" },
    { icon: "🛒", val: sold.length, lbl: "Units Sold" },
    {
      icon: "💵",
      val: `R ${soldRev.toLocaleString("en-ZA")}`,
      lbl: "Sales Revenue",
    },
    {
      icon: "💰",
      val: `R ${catVal.toLocaleString("en-ZA")}`,
      lbl: "Catalogue Value",
    },
  ];

  const statusStyle = (s) =>
    s === "active"
      ? "background:rgba(61,107,71,.1);color:var(--leaf);border:1px solid rgba(61,107,71,.2)"
      : s === "used"
        ? "background:#EF444418;color:#EF4444;border:1px solid #EF444428"
        : "background:#F59E0B18;color:#F59E0B;border:1px solid #F59E0B28";

  // ── All categories available in the admin form — now includes Music + Events ──
  const ALL_CATEGORIES = [
    "Wellness",
    "Beauty",
    "Adventure",
    "Dining & Wine",
    "Traditional Restaurants",
    "Stays",
    "Skills",
    "Music",
    "Events",
    "Florists",
    "Other",
  ];

  return (
    <div className="container" style={{ padding: "48px 32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontSize: ".72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "var(--terra)",
              marginBottom: 6,
            }}
          >
            ✦ Partner Dashboard
          </p>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "2.2rem",
              color: "var(--forest)",
            }}
          >
            {bizName}
          </h2>
          <p
            style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4 }}
          >
            Signed in as: {user?.email} · {vouchers.length} vouchers
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={load}
            style={{
              fontSize: ".8rem",
              color: "var(--leaf)",
              fontWeight: 600,
              border: "1.5px solid var(--border2)",
              borderRadius: 8,
              padding: "9px 16px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
          <button
            onClick={onLogout}
            style={{
              fontSize: ".8rem",
              color: "var(--terra)",
              fontWeight: 600,
              border: "1.5px solid rgba(196,98,45,.3)",
              borderRadius: 8,
              padding: "9px 16px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
{/* ── Tab switcher ── */}
<div style={{
  display: "flex", gap: 0, marginBottom: 28,
  background: "var(--bg2)", borderRadius: 10,
  padding: 4, width: "fit-content",
  border: "1px solid var(--border)"
}}>
  {[
    ["vouchers",     "🎟️ My Vouchers"],
    ["prospecting",  "🔍 Find Partners"],
  ].map(([id, label]) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      style={{
        padding: "9px 20px", border: "none", borderRadius: 8,
        fontFamily: "var(--sans)", fontSize: ".82rem", fontWeight: 700,
        cursor: "pointer", transition: "all .18s",
        background: activeTab === id ? "#fff" : "transparent",
        color: activeTab === id ? "var(--black)" : "var(--muted)",
        boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,.1)" : "none",
      }}
    >
      {label}
    </button>
  ))}
</div>
     {activeTab === "vouchers" && (
  <>
      <AnalyticsSection vouchers={vouchers} sold={sold} />

      {/* Add Voucher */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        <div
          onClick={() => setShowForm((f) => !f)}
          style={{
            padding: "18px 24px",
            background: "var(--forest)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.2rem" }}>➕</span>
            <div>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.1rem",
                  color: "#15803D",
                  marginBottom: 1,
                }}
              >
                Add New Voucher
              </h3>
              <p style={{ fontSize: ".72rem", color: "rgba(245,240,232,.5)" }}>
                Create a custom voucher — including Music & Events types
              </p>
            </div>
          </div>
          <span
            style={{
              color: "rgba(245,240,232,.6)",
              fontSize: "1rem",
              transition: "transform .3s",
              transform: showForm ? "rotate(180deg)" : "",
            }}
          >
            ▼
          </span>
        </div>

        {showForm && (
          <div style={{ padding: "28px 28px 24px" }}>
            <div
              className="admin-grid-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {[
                {
                  key: "name",
                  label: "Voucher Name *",
                  type: "input",
                  placeholder: "e.g. Live Jazz Evening for Two",
                },
                {
                  key: "price",
                  label: "Price (R) *",
                  type: "number",
                  placeholder: "780",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    style={{
                      fontSize: ".68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: "var(--muted)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    className="admin-input"
                    type={f.type || "text"}
                    value={formData[f.key]}
                    onChange={setF(f.key)}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}

              <div>
                <label
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Category *
                </label>
                <select
                  className="admin-input"
                  value={formData.category}
                  onChange={setF("category")}
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {getCatIcon(c)} {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Valid For *
                </label>
                <select
                  className="admin-input"
                  value={formData.validity}
                  onChange={setF("validity")}
                >
                  {["3", "6", "12", "18", "24"].map((m) => (
                    <option key={m} value={m}>
                      {m} months
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                City / Area *
              </label>
              <input
                className="admin-input"
                value={formData.city}
                onChange={setF("city")}
                placeholder="Gweru, Victoria Falls, JHB…"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Description *
              </label>
              <textarea
                className="admin-input"
                value={formData.desc}
                onChange={setF("desc")}
                placeholder="Describe what the customer will experience…"
                style={{ minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                What's Included (comma separated)
              </label>
              <input
                className="admin-input"
                value={formData.includes}
                onChange={setF("includes")}
                placeholder="e.g. 2x concert tickets, Welcome cocktails, Programme booklet"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Voucher Photo{" "}
                <span
                  style={{
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (optional)
                </span>
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "28px 20px",
                  border: "2px dashed var(--border2)",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: "var(--cream)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "2rem" }}>🖼️</span>
                <div>
                  <p
                    style={{
                      fontSize: ".85rem",
                      fontWeight: 600,
                      color: "var(--forest)",
                    }}
                  >
                    Click to upload or drag &amp; drop
                  </p>
                  <p
                    style={{
                      fontSize: ".75rem",
                      color: "var(--muted)",
                      marginTop: 3,
                    }}
                  >
                    {imageFile ? imageFile.name : "JPG, PNG or WebP — max 5MB"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    position: "relative",
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(0,0,0,.55)",
                      border: "none",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      color: "white",
                      cursor: "pointer",
                      fontSize: ".8rem",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {formStatus && (
              <div
                style={{
                  padding: "11px 14px",
                  borderRadius: 9,
                  fontSize: ".82rem",
                  marginBottom: 14,
                  background: formStatus.type === "ok" ? "#F0FDF4" : "#FEF2F2",
                  border: `1px solid ${formStatus.type === "ok" ? "#22C55E" : "#EF4444"}`,
                  color: formStatus.type === "ok" ? "#15803D" : "#B91C1C",
                }}
                dangerouslySetInnerHTML={{ __html: formStatus.msg }}
              />
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleAddVoucher}
                disabled={formLoading}
                style={{
                  padding: "13px 28px",
                  background: "var(--forest)",
                  color: "var(--cream)",
                  border: "none",
                  borderRadius: 9,
                  fontFamily: "var(--serif)",
                  fontSize: ".95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all .2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: formLoading ? 0.5 : 1,
                }}
              >
                {formLoading ? "Saving…" : "➕ Create & Save Voucher"}
              </button>
              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    category: "Wellness",
                    price: "",
                    validity: "12",
                    desc: "",
                    includes: "",
                    city: "",
                  });
                  setImageFile(null);
                  setImagePreview("");
                  setFormStatus(null);
                }}
                style={{
                  padding: "13px 20px",
                  background: "transparent",
                  color: "var(--muted)",
                  border: "1.5px solid var(--border2)",
                  borderRadius: 9,
                  fontFamily: "var(--sans)",
                  fontSize: ".83rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vouchers table */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--cream2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.2rem",
              color: "var(--forest)",
            }}
          >
            My Vouchers
          </h3>
          <button
            onClick={load}
            style={{
              fontSize: ".75rem",
              color: "var(--leaf)",
              fontWeight: 600,
              border: "1.5px solid rgba(61,107,71,.25)",
              borderRadius: 7,
              padding: "6px 13px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Voucher Code",
                  "Name",
                  "Category",
                  "Price",
                  "Valid Until",
                  "Status",
                  "Created",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "11px 14px",
                      fontSize: ".68rem",
                      textTransform: "uppercase",
                      letterSpacing: ".7px",
                      color: "var(--muted)",
                      fontWeight: 700,
                      background: "var(--cream2)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: "var(--muted)",
                    }}
                  >
                    ⏳ Loading your vouchers…
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 48,
                      color: "var(--muted)",
                    }}
                  >
                    No vouchers found.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id}>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontFamily: "var(--serif)",
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: "var(--forest)",
                        fontSize: ".9rem",
                      }}
                    >
                      {v.code || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: ".85rem",
                        fontWeight: 600,
                        color: "var(--forest)",
                      }}
                    >
                      {v.name || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: ".78rem",
                        color: "var(--muted)",
                      }}
                    >
                      {getCatIcon(v.category)} {v.category || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontFamily: "var(--serif)",
                        fontWeight: 700,
                        color: "var(--forest)",
                      }}
                    >
                      US${(Number(v.price || 0) / ZAR_TO_USD).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: ".78rem",
                        color: "var(--muted)",
                      }}
                    >
                      {v.expiryDate
                        ? new Date(v.expiryDate).toLocaleDateString("en-ZA")
                        : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: 4,
                          fontSize: ".7rem",
                          fontWeight: 700,
                          ...Object.fromEntries(
                            statusStyle(v.status)
                              .split(";")
                              .filter(Boolean)
                              .map((s) => {
                                const [k, val] = s.split(":");
                                return [
                                  k
                                    .trim()
                                    .replace(/-([a-z])/g, (_, c) =>
                                      c.toUpperCase(),
                                    ),
                                  val?.trim(),
                                ];
                              }),
                          ),
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "var(--muted)",
                        fontSize: ".75rem",
                      }}
                    >
                      {v.createdAt?.toDate?.()?.toLocaleDateString("en-ZA") ||
                        "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
)}
{activeTab === "prospecting" && (
  <ProspectingTool />
)}
      </div>
  
  );
}
function TermsPage({ setPage }) {
  return (
    <div className="container" style={{ maxWidth: 720, padding: "56px 24px 80px" }}>
      <button onClick={() => setPage("store")} style={{ background: "none", border: "none",
        color: "var(--red)", fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
        marginBottom: 24, padding: 0 }}>← Back to store</button>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--black)",
        marginBottom: 6, letterSpacing: "-.4px" }}>Terms of Service</h1>
      <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 36 }}>
        Last updated: June 2025 · AfriVoucher (Pty) Ltd
      </p>
      {[
        ["1. Acceptance", "By purchasing or redeeming a voucher on AfriVoucher you agree to these terms. If you do not agree, please do not use the platform."],
        ["2. Voucher validity", "All vouchers are valid for the period stated at time of purchase (typically 6–12 months). Expired vouchers cannot be extended or refunded."],
        ["3. Refund policy", "Vouchers are non-refundable once purchased except where the partner business has permanently closed. In such cases, contact support within 30 days for a store credit."],
        ["4. Redemption", "Vouchers are redeemed directly with the partner business. AfriVoucher is not liable for the quality of the partner's service. All disputes must first be raised with the partner."],
        ["5. Liability", "AfriVoucher acts as a marketplace only. We are not responsible for personal injury, loss or disappointment arising from redeemed experiences."],
        ["6. POPIA & data", "We process your personal information in accordance with the Protection of Personal Information Act (POPIA). See our Privacy Policy for full details."],
        ["7. Partner obligations", "Partners agree to honour all valid vouchers presented within the validity window. Failure to do so may result in removal from the platform."],
        ["8. Governing law", "These terms are governed by the laws of the Republic of Zimbabwe. Disputes shall be subject to the jurisdiction of Zimbabwean courts."],
        ["9. Contact", "For any queries: support@afrivoucher.com · WhatsApp: +27 67 605 6777"],
      ].map(([heading, body]) => (
        <div key={heading} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--black)",
            marginBottom: 6 }}>{heading}</h3>
          <p style={{ fontSize: ".87rem", color: "var(--sub)", lineHeight: 1.75 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}

function PrivacyPage({ setPage }) {
  return (
    <div className="container" style={{ maxWidth: 720, padding: "56px 24px 80px" }}>
      <button onClick={() => setPage("store")} style={{ background: "none", border: "none",
        color: "var(--red)", fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
        marginBottom: 24, padding: 0 }}>← Back to store</button>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--black)",
        marginBottom: 6, letterSpacing: "-.4px" }}>Privacy Policy</h1>
      <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 36 }}>
        Last updated: June 2025 · POPIA compliant
      </p>
      {[
        ["Information we collect", "We collect your name, email address, WhatsApp number, and payment details when you make a purchase. We also collect basic usage analytics (pages visited, search queries) to improve the platform."],
        ["How we use your data", "Your data is used to process your order, deliver your voucher via WhatsApp, send order confirmation emails, and provide customer support. We do not sell your data to third parties."],
        ["WhatsApp & messaging", "By providing a WhatsApp number you consent to receiving your voucher code and order updates via WhatsApp. You may opt out by contacting support."],
        ["Data sharing", "We share your order details with the relevant partner business solely for the purpose of fulfilling your experience. Partners are bound by our Partner Agreement to protect your data."],
        ["Data retention", "Order records are retained for 5 years for accounting purposes. You may request deletion of your personal profile data at any time by emailing support@afrivoucher.com."],
        ["Cookies", "We use essential cookies for authentication and a single analytics cookie (Google Analytics) that you may opt out of via your browser settings."],
        ["Your rights (POPIA)", "You have the right to access, correct or delete your personal information. Submit requests to: support@afrivoucher.com. We respond within 10 business days."],
        ["Security", "All payment processing is handled by PayFast and is PCI-DSS compliant. We do not store card details. Your data is stored on Google Firebase infrastructure with encryption at rest."],
        ["Contact", "Privacy Officer: AfriVoucher (Pty) Ltd · support@afrivoucher.com · +27 67 605 6777"],
      ].map(([heading, body]) => (
        <div key={heading} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--black)",
            marginBottom: 6 }}>{heading}</h3>
          <p style={{ fontSize: ".87rem", color: "var(--sub)", lineHeight: 1.75 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}
function OrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "sold_vouchers"),
            where("buyerEmail", "==", user.email),
            orderBy("createdAt", "desc"),
          ),
        );
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn("Orders fetch:", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const statusColor = { delivered: "#1a9e56", pending: "#f59e0b", redeemed: "#6366f1" };
  const statusIcon  = { delivered: "✅", pending: "⏳", redeemed: "🎟️" };

  return (
    <div className="container" style={{ maxWidth: 760, padding: "48px 24px" }}>
      <p style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: 1.5, color: "var(--red)", marginBottom: 8 }}>✦ My Account</p>
      <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--black)",
        letterSpacing: "-.4px", marginBottom: 4 }}>Order History</h2>
      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 32 }}>
        All your gifted experiences in one place
      </p>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid var(--border)",
              borderRadius: 12, padding: 20, display: "flex", gap: 14 }}>
              <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton skel-line med" />
                <div className="skeleton skel-line short" />
                <div className="skeleton skel-line" style={{ width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎁</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--black)", marginBottom: 8 }}>
            No orders yet
          </h3>
          <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>
            Vouchers you purchase will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map(order => {
            const st = order.status || "delivered";
            return (
              <div key={order.id} style={{ background: "#fff", border: "1px solid var(--border)",
                borderRadius: 14, padding: 20, display: "flex", alignItems: "center",
                gap: 16, flexWrap: "wrap" }}>
                {/* Icon */}
                <div style={{ width: 68, height: 68, borderRadius: 10, background: "var(--bg2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2rem", flexShrink: 0 }}>
                  {getCatIcon(order.category)}
                </div>
                {/* Details */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--black)",
                    marginBottom: 3 }}>{order.name || "Voucher"}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: 6 }}>
                    To: {order.recipientPhone || "—"} ·{" "}
                    {order.createdAt?.toDate?.()?.toLocaleDateString("en-ZA") || "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "monospace", fontSize: ".78rem", fontWeight: 700,
                      background: "var(--bg2)", border: "1px solid var(--border)",
                      borderRadius: 5, padding: "2px 8px", letterSpacing: 1,
                      color: "var(--black)" }}>{order.code || "—"}</span>
                    <span style={{ fontSize: ".7rem", fontWeight: 700, padding: "2px 8px",
                      borderRadius: 4, background: `${statusColor[st]}18`,
                      color: statusColor[st], border: `1px solid ${statusColor[st]}30` }}>
                      {statusIcon[st]} {st}
                    </span>
                  </div>
                </div>
                {/* Price + Resend */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--black)",
                    marginBottom: 8 }}>US${(Number(order.price || 0) / ZAR_TO_USD).toFixed(2)}</div>
                  <a href={`https://wa.me/${(order.recipientPhone||"").replace(/\D/g,"")}` +
                    `?text=Here's your AfriVoucher gift code: ${order.code}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "7px 14px", background: "#25D366", color: "#fff",
                      borderRadius: 7, fontSize: ".75rem", fontWeight: 700,
                      textDecoration: "none" }}>
                    💬 Resend
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ─── Partners Page ────────────────────────────────────────────────────────
function PartnersPage() {
  const [form, setForm] = useState({
    business: "",
    category: "Wellness & Spa",
    contact: "",
    whatsapp: "",
    email: "",
    services: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.business || !form.contact || !form.email || !form.whatsapp) {
      setStatus({
        type: "error",
        msg: "Please fill in Business Name, Contact Name, Email and WhatsApp number.",
      });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "partner_applications"), {
        ...form,
        status: "pending",
        submittedAt: serverTimestamp(),
      });
      setStatus({
        type: "ok",
        msg: "<strong>Application received!</strong> We will be in touch within 24 hours.",
      });
      setForm({
        business: "",
        category: "Wellness & Spa",
        contact: "",
        whatsapp: "",
        email: "",
        services: "",
      });
    } catch {
      setStatus({
        type: "error",
        msg: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          background: "var(--forest)",
          padding: "80px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          backgroundImage: "url('/images/hero-3.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center 40%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 0%,rgba(61,107,71,.4),transparent 60%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <p
            style={{
              fontSize: ".72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "var(--gold2)",
              marginBottom: 12,
            }}
          >
            ✦ Partner Programme
          </p>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2.4rem,5vw,4rem)",
              color: "var(--cream)",
              lineHeight: 1.05,
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            List your business.
            <br />
            <em style={{ color: "var(--gold2)" }}>Earn on every sale.</em>
          </h1>
          <p
            style={{
              color: "rgba(245,240,232,.65)",
              fontSize: "1rem",
              lineHeight: 1.75,
              marginBottom: 32,
            }}
          >
            Whether you run a music venue, plan private events, or offer spa
            services — we handle payments, WhatsApp delivery and customer
            support. You just deliver the experience and collect your payout.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              ["R0", "Setup cost"],
              ["80%+", "You keep"],
              ["Weekly", "EFT payout"],
            ].map(([val, lbl]) => (
              <div
                key={lbl}
                style={{
                  background: "rgba(245,240,232,.1)",
                  border: "1px solid rgba(245,240,232,.15)",
                  borderRadius: 12,
                  padding: "16px 24px",
                  color: "var(--cream)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: ".72rem",
                    color: "rgba(245,240,232,.5)",
                    textTransform: "uppercase",
                    letterSpacing: ".8px",
                  }}
                >
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="container"
        style={{ padding: "60px 32px", maxWidth: 680 }}
      >
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "2rem",
            color: "var(--forest)",
            marginBottom: 6,
          }}
        >
          Apply to Partner
        </h2>
        <p style={{ color: "var(--sub)", marginBottom: 28, fontSize: ".9rem" }}>
          Takes 5 minutes. We'll be in touch within 24 hours.
        </p>
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            className="admin-grid-2"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label
                style={{
                  fontSize: ".7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Business Name
              </label>
              <input
                className="admin-input"
                value={form.business}
                onChange={setF("business")}
                placeholder="Beat Studio / Stage Events"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: ".7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Category
              </label>
              {/* ── Updated category dropdown includes Music + Events ── */}
              <select
                className="admin-input"
                value={form.category}
                onChange={setF("category")}
              >
                {[
                  "Wellness & Spa",
                  "Hair & Beauty",
                  "Adventure",
                  "Dining & Wine",
                  "Traditional Restaurants",
                  "Stays",
                  "Skills & Courses",
                  "Music",
                  "Events",
                  "Florists",
                  "Other",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: ".7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Contact Name
              </label>
              <input
                className="admin-input"
                value={form.contact}
                onChange={setF("contact")}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: ".7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                WhatsApp Number
              </label>
              <input
                className="admin-input"
                value={form.whatsapp}
                onChange={setF("whatsapp")}
                placeholder="+27821234567"
              />
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: ".7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "var(--muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              className="admin-input"
              type="email"
              value={form.email}
              onChange={setF("email")}
              placeholder="hello@yourbusiness.co.za"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "var(--muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Describe your service(s)
            </label>
            <textarea
              className="admin-input"
              value={form.services}
              onChange={setF("services")}
              placeholder="e.g. Live jazz evenings R780, studio recording sessions R1200, or private birthday party packages R1850…"
              style={{ height: 90, resize: "none" }}
            />
          </div>
          {status && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 9,
                fontSize: ".85rem",
                background: status.type === "ok" ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${status.type === "ok" ? "#22C55E" : "#EF4444"}`,
                color: status.type === "ok" ? "#15803D" : "#B91C1C",
              }}
              dangerouslySetInnerHTML={{ __html: status.msg }}
            />
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: 15,
              background: "#22C55E",
              color: "var(--cream)",
              border: "none",
              borderRadius: 10,
              fontFamily: "var(--serif)",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .2s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </>
  );
}
function CategoryPage({ cat, vouchers, loading, onBack, onOpenVoucher }) {
  const [sortVal, setSortVal] = useState("default");
  const [searchQ, setSearchQ] = useState("");

  const catMeta = {
    Adventure: {
      icon: "🪂",
      img: "/images/ancient-city-lodge-masvingo-698880.webp",
      color: "#1a3a4a",
      tagline: "Push your limits. Create stories worth telling.",
      desc: "From 15,000ft skydives to hot air balloon sunrises — Zimbabwe's most thrilling experiences, gifted in seconds.",
    },
    "Wellness & Spa": {
      icon: "🧖",
      img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
      color: "#1a2e1f",
      tagline: "Rest, restore and feel completely renewed.",
      desc: "Treat someone to the gift of stillness — massages, spa days and full pamper packages from Zimbabwe's top wellness partners.",
    },
    "Hair & Beauty": {
      icon: "💅",
      img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
      color: "#2e1a22",
      tagline: "Because they deserve to feel gorgeous.",
      desc: "Gel manis, spa pedis, bridal packages and full glam treatments — from Zimbabwe's top salons and beauty professionals.",
    },
    "Dining & Wine": {
      icon: "🍷",
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
      color: "#2e1a0e",
      tagline: "Food is love. Gift a table worth remembering.",
      desc: "Wine tastings, braai masterclasses and fine dining experiences — for the food lovers in your life.",
    },
    "Traditional Restaurants": {
      icon: "🍲",
      img: "/images/kwaterry.jpg",
      color: "#2e1f0a",
      tagline: "The taste of home, gifted from anywhere in the world.",
      desc: "Sadza, dovi, road runner chicken — send mum, dad or the whole family for a proper Zimbabwean meal, even when you're miles away.",
    },
    Music: {
      icon: "🎵",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
      color: "#1a1a2e",
      tagline: "Give the gift of live music.",
      desc: "Jazz evenings, studio sessions, DJ workshops and concert tickets — for the music lovers who deserve a night to remember.",
    },
    Events: {
      icon: "🎪",
      img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      color: "#2e1a2e",
      tagline: "Every occasion deserves a celebration.",
      desc: "Corporate functions, birthday bundles, kids parties and anniversary dinners — fully hosted, fully unforgettable.",
    },
    Florists: {
      icon: "🌸",
      img: "https://images.unsplash.com/photo-1487530811015-780b95070bb5?w=1200&q=80",
      color: "#2e1a1f",
      tagline: "Say it with flowers.",
      desc: "Bouquets, luxury arrangements, weekly subscriptions and wedding centrepieces — from Zimbabwe's finest florists.",
    },

    Stays: {
      icon: "🏡",
      img: "/images/ancient-city-lodge-masvingo-698880.webp",
      color: "#1a2e1f",
      tagline: "A getaway they'll never forget.",
      desc: "Lodge stays, heritage escapes and weekend retreats — Zimbabwe's most beautiful places to wake up.",
    },
    Beauty: {
      icon: "💅",
      img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
      color: "#2e1a22",
      tagline: "Because they deserve to feel gorgeous.",
      desc: "Gel manis, spa pedis, bridal packages and full glam treatments — from Zimbabwe's top beauty professionals.",
    },
  };

  const meta = catMeta[cat] || {
    icon: "🎁",
    img: "",
    color: "#1a2e1f",
    tagline: "Discover amazing experiences.",
    desc: "Browse our curated selection of vouchers.",
  };

  const filtered = vouchers
    .filter((v) => v.cat === cat)
    .filter((v) => {
      if (!searchQ.trim()) return true;
      const q = searchQ.toLowerCase();
      return (
        (v.name || "").toLowerCase().includes(q) ||
        (v.desc || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortVal === "price-asc") return a.price - b.price;
      if (sortVal === "price-desc") return b.price - a.price;
      if (sortVal === "rating") return b.rating - a.rating;
      return 0;
    });

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [drawerVoucher, setDrawerVoucher] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  const handleCheckout = async (form) => {
    await new Promise((r) => setTimeout(r, 2000));
    const code = genCode();
    setCheckoutSuccess({
      code,
      voucher: drawerVoucher,
      recipientPhone: form.recipientPhone,
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Category Hero */}
      <div
        style={{
          position: "relative",
          minHeight: 380,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to top, ${meta.color} 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.15) 100%), url('${meta.img}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 24,
            left: 32,
            background: "rgba(255,255,255,.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.25)",
            borderRadius: 10,
            padding: "9px 16px",
            color: "#fff",
            fontFamily: "var(--sans)",
            fontSize: ".8rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            zIndex: 2,
          }}
        >
          ← Back
        </button>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "0 32px 44px",
            maxWidth: "var(--max)",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: ".7rem",
              fontWeight: 600,
              color: "rgba(255,255,255,.85)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {meta.icon} {cat}
          </div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2rem,5vw,3.5rem)",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.05,
              marginBottom: 10,
              letterSpacing: "-.3px",
            }}
          >
            {meta.tagline}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,.65)",
              fontSize: ".92rem",
              lineHeight: 1.75,
              maxWidth: 560,
              fontWeight: 300,
            }}
          >
            {meta.desc}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,.15)",
              flexWrap: "wrap",
            }}
          >
            {[
              [filtered.length, "Experiences available"],
              [
                `US$${(Math.min(...filtered.map((v) => v.price || 0)) / ZAR_TO_USD).toFixed(2)}`,
                "Starting from",
              ],
              ["Instant", "WhatsApp delivery"],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                    marginBottom: 3,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: ".62rem",
                    color: "rgba(255,255,255,.45)",
                    textTransform: "uppercase",
                    letterSpacing: ".8px",
                    fontWeight: 500,
                  }}
                >
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 72,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "var(--max)",
            margin: "0 auto",
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div
            style={{
              flex: 1,
              maxWidth: 380,
              background: "var(--cream)",
              border: "1.5px solid var(--border2)",
              borderRadius: 50,
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "0 16px",
              height: 40,
            }}
          >
            <svg
              width="14"
              height="14"
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
              placeholder={`Search ${cat} experiences…`}
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "var(--sans)",
                fontSize: ".85rem",
                color: "var(--text)",
                width: "100%",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Result count */}
            <span
              style={{
                fontSize: ".8rem",
                color: "var(--muted)",
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} experience{filtered.length !== 1 ? "s" : ""}
            </span>

            {/* Sort */}
            <select
              value={sortVal}
              onChange={(e) => setSortVal(e.target.value)}
              style={{
                padding: "8px 14px",
                border: "1.5px solid var(--border2)",
                borderRadius: 8,
                fontFamily: "var(--sans)",
                fontSize: ".8rem",
                color: "var(--sub)",
                background: "var(--white)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voucher grid */}
      <section className="section container">
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.4rem",
                color: "var(--forest)",
                marginBottom: 8,
              }}
            >
              No {cat} experiences yet
            </h3>
            <p
              style={{
                color: "var(--muted)",
                fontSize: ".88rem",
                marginBottom: 24,
              }}
            >
              Our partners are adding new experiences all the time.
            </p>
            <button
              onClick={onBack}
              style={{
                padding: "11px 24px",
                background: "var(--forest)",
                color: "var(--cream)",
                border: "none",
                borderRadius: 9,
                fontFamily: "var(--serif)",
                fontSize: ".95rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← Browse all experiences
            </button>
          </div>
        ) : (
         <div className="cards-grid">
  {loading
    ? [...Array(12)].map((_, i) => <SkeletonCard key={i} grid />)
    : filtered.map(v => (
        <VoucherCard key={v.id} voucher={v} onOpen={setSelectedVoucher} />
      ))
  }
</div>
        )}
      </section>

      {/* Modals */}
      {selectedVoucher && (
        <ProductModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onBuy={() => {
            setDrawerVoucher(selectedVoucher);
            setSelectedVoucher(null);
          }}
        />
      )}
      {drawerVoucher && !checkoutSuccess && (
        <CheckoutDrawer
          voucher={drawerVoucher}
          onClose={() => setDrawerVoucher(null)}
          onSuccess={handleCheckout}
        />
      )}
      {checkoutSuccess && (
        <SuccessDrawer
          info={checkoutSuccess}
          onClose={() => {
            setCheckoutSuccess(null);
            setDrawerVoucher(null);
          }}
        />
      )}
    </>
  );
}
// ─── Footer ───────────────────────────────────────────────────────────────
function Footer({ setPage }) {
   const footerRef = useRef(null);
   useEffect(() => {
  const footerContainer = footerRef.current;
  if (!footerContainer) return;

  const handleMouseMove = (e) => {
    const rect = footerContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gradient = `radial-gradient(circle at ${x}px ${y}px, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 60%)`;
    footerContainer.style.maskImage = gradient;
    footerContainer.style.webkitMaskImage = gradient;
  };

  const handleMouseLeave = () => {
    const gradient = 'radial-gradient(circle at 1004px -170.984px, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 60%)';
    footerContainer.style.maskImage = gradient;
    footerContainer.style.webkitMaskImage = gradient;
  };

  footerContainer.addEventListener('mousemove', handleMouseMove);
  footerContainer.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    footerContainer.removeEventListener('mousemove', handleMouseMove);
    footerContainer.removeEventListener('mouseleave', handleMouseLeave);
  };
}, []);
  return (
    <footer>
      <div className="container" >
          <div style={{ maskImage: "radial-gradient(circle at 1004px -170.984px, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 60%)" }}
              className="footer-container" ref={footerRef}   >
              <img src="images/grey-logo.png" alt="" style={{ width: "100%", height: "auto" }} />
            </div>
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              Afri<span>Voucher</span>
            </div>
            <p className="footer-tagline">
              Zimbabwe's leading digital gift experience marketplace. Connecting
              people with unforgettable moments since 2024.
            </p>
            <div className="footer-socials">
              {[
                { label: "𝕏", href: "https://twitter.com/afrivoucher" },
                {
                  label: "in",
                  href: "https://linkedin.com/company/afrivoucher",
                },
                { label: "f", href: "https://facebook.com/afrivoucher" },
                { label: "📸", href: "https://instagram.com/afrivoucher" },
              ].map((s) => (
                <a
                  href={s.href}
                  key={s.label}
                  className="social-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Experiences</h4>
            <div className="footer-links">
              {[
                "Wellness & Spa",
                "Adventure",
                "Dining & Wine",
                "Music & Live Events",
                "Private Functions",
                "Skills & Courses",
              ].map((l) => (
                <Link href="#" key={l} className="footer-link">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              {[
                "About Us",
                "Partner Programme",
                "Corporate Gifting",
                "Blog",
                "Careers",
              ].map((l) => (
                <Link href="#" key={l} className="footer-link">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <div className="footer-links">
             {[
  ["Redeem Voucher",  "redeem"],
  ["Help Centre",     "help"],
  ["Contact Us",      "contact"],
  ["Privacy Policy",  "privacy"],
  ["Terms of Service","terms"],
].map(([label, target]) => (
  <button key={label} className="footer-link"
    onClick={() => setPage(target)}
    style={{ background: "none", border: "none", cursor: "pointer",
      textAlign: "left", fontFamily: "var(--sans)" }}>
    {label}
  </button>
))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-legal">
            © 2025 AfriVoucher (Pty) Ltd · All rights reserved · Registered in
            Zimbabwe
          </p>
          <div className="footer-payments">
            <span
              style={{
                fontSize: ".72rem",
                color: "rgba(245,240,232,.3)",
                marginRight: 4,
              }}
            >
              Payments by
            </span>
            {["PayFast", "Visa", "MasterCard", "SnapScan"].map((p) => (
              <span key={p} className="pay-badge">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
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
            partner: v.businessEmail?.split("@")[1]?.split(".")[0] || "Partner",
            city: "Zimbabwe",
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
        />
      ) : null}
      {page === "auth" && (
        <AuthPage onSuccess={() => {
  guardedSetPage("admin");
  if (onAuthSuccess) onAuthSuccess();
}} />
      )}
      {page === "redeem" &&
        (user ? (
          <RedeemPage user={user} />
        ) : (
          <AuthPage onSuccess={() => {
  guardedSetPage("redeem"); // or "admin" depending on which block
  if (onAuthSuccess) onAuthSuccess();
}} />
        ))}
      {page === "admin" &&
        (user ? (
          <AdminPage user={user} onLogout={handleLogout} />
        ) : (
          <AuthPage onSuccess={() => {
  guardedSetPage("admin");
  if (onAuthSuccess) onAuthSuccess();
}} />
        ))}
      {page === "partners" && <PartnersPage />}
{page === "orders" && user && <OrdersPage user={user} />}
      <Footer setPage={guardedSetPage} />
      <BottomNav page={page} setPage={guardedSetPage} user={user} />
      {/* WhatsApp Float Button */}

      <a
        href="https://wa.me/27780066108"
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
