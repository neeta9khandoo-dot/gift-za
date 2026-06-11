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

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = (n) =>
  `R ${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;

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
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#f5f0e8;--cream2:#ede6d6;--cream3:#e0d8c8;
  --forest:#1a2e1f;--forest2:#243428;--forest3:#2e4032;
  --leaf:#3d6b47;--leaf2:#4e8459;
  --terra:#c4622d;--terra2:#d4784a;
  --gold:#b8942a;--gold2:#cda83c;
  --white:#ffffff;--text:#1a2e1f;--sub:#5a6b5e;--muted:#8a9b8e;
  --border:#d8d0c0;--border2:#c8bea8;
  --serif:'Cormorant Garamond',Georgia,serif;
  --sans:'DM Sans',system-ui,sans-serif;
  --r:12px;--r2:20px;--max:1280px;
  --sh1:0 2px 12px rgba(26,46,31,.08);--sh2:0 8px 32px rgba(26,46,31,.12);--sh3:0 20px 60px rgba(26,46,31,.18);
}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{background:var(--cream);color:var(--text);font-family:var(--sans);font-size:15px;line-height:1.6;overflow-x:hidden}
img{display:block;width:100%;object-fit:cover}
a{text-decoration:none;color:inherit}
button{font-family:var(--sans);cursor:pointer}
.container{max-width:var(--max);margin:0 auto;padding:0 32px}

/* Announce */
.announce{background:var(--forest);color:var(--cream);text-align:center;padding:10px 20px;font-size:.78rem;font-weight:500;letter-spacing:.3px;cursor:pointer}
.announce strong{color:var(--gold2)}

/* Nav */
.nav{background:rgba(245,240,232,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.nav-inner{max-width:var(--max);margin:0 auto;padding:0 32px;display:flex;align-items:center;gap:32px;height:72px}
.nav-logo{font-family:var(--serif);font-size:1.7rem;font-weight:700;color:var(--forest);letter-spacing:-.5px;white-space:nowrap;flex-shrink:0;background:none;border:none;cursor:pointer; display: flex;
  align-items: center;}
.nav-logo span{color:var(--terra)}
.nav-search{flex:1;max-width:460px;background:var(--white);border:1.5px solid var(--border2);border-radius:50px;display:flex;align-items:center;gap:10px;padding:0 18px;height:44px;transition:border-color .2s,box-shadow .2s}
.nav-search:focus-within{border-color:var(--leaf);box-shadow:0 0 0 3px rgba(61,107,71,.1)}
.nav-search input{flex:1;border:none;outline:none;background:transparent;font-family:var(--sans);font-size:.88rem;color:var(--text)}
.nav-search input::placeholder{color:var(--muted)}
.nav-links{display:flex;align-items:center;gap:4px;margin-left:auto}
.nav-link{padding:8px 14px;border-radius:8px;font-size:.83rem;font-weight:500;color:var(--sub);transition:all .18s;white-space:nowrap;border:none;background:none;cursor:pointer}
.nav-link:hover{background:var(--cream2);color:var(--text)}
.nav-link.active{color:var(--forest);font-weight:600}
.nav-cta{background:var(--forest);color:var(--cream);padding:9px 20px;border-radius:8px;font-size:.83rem;font-weight:600;border:none;transition:all .2s;white-space:nowrap;flex-shrink:0;cursor:pointer}
.nav-cta:hover{background:var(--forest2);transform:translateY(-1px)}
.cbadge-florist{background:rgba(180,57,140,.88);color:white}
.nav-user{position:relative;display:flex;align-items:center;flex-shrink:0}
.nav-user-btn{display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:50px;border:1.5px solid var(--border2);background:transparent;cursor:pointer;transition:all .2s}
.nav-user-btn:hover{border-color:var(--leaf);background:rgba(61,107,71,.04)}
.nav-user-name{font-size:.82rem;font-weight:600;color:var(--text);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nav-chevron{color:var(--muted);transition:transform .2s;flex-shrink:0}
.nav-chevron.open{transform:rotate(180deg)}
.nav-dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:210px;background:var(--white);border:1px solid var(--border2);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.12);overflow:hidden;opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity .18s,transform .18s;z-index:200}
.nav-dropdown.open{opacity:1;pointer-events:all;transform:translateY(0)}
.nav-dropdown-header{padding:14px 16px 10px;border-bottom:1px solid var(--border)}
.nav-dropdown-name{font-size:.88rem;font-weight:700;color:var(--text)}
.nav-dropdown-email{font-size:.76rem;color:var(--muted);margin-top:2px}
.nav-dropdown-section{padding:6px 0}
.nav-dropdown-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 16px;background:none;border:none;cursor:pointer;font-family:var(--sans);font-size:.83rem;color:var(--text);text-align:left;transition:background .15s}
.nav-dropdown-item:hover{background:var(--cream2)}
.nav-dropdown-item i{font-size:16px;color:var(--sub);flex-shrink:0}
.nav-dropdown-divider{height:1px;background:var(--border)}
.nav-dropdown-item.danger{color:var(--terra)}
.nav-dropdown-item.danger i{color:var(--terra)}
.mobile-user-header{display:flex;align-items:center;gap:12px;padding:12px 16px 8px}
.mobile-user-name{font-size:.88rem;font-weight:700;color:var(--forest)}
.mobile-user-email{font-size:.74rem;color:var(--muted);margin-top:1px}
.mobile-menu-link{display:flex;align-items:center;gap:10px}
.mobile-menu-link i{font-size:16px;color:var(--muted);flex-shrink:0}
/* Hero */
.hero{position:relative;min-height:600px;display:flex;align-items:center;overflow:hidden}
.hero-bg {
  position: absolute; 
  inset: 0;
  background-image: 
    linear-gradient(135deg, rgba(26,46,31,.75) 0%, rgba(26,46,31,.35) 55%, transparent 85%),
    url('/images/Great_Enclosure_ruins_UNESCO_Site_in_Great_Zimbabwe.jpg');
  background-size: cover;
  background-position: center 60%;
  background-repeat: no-repeat;
  background-attachment: fixed; /* optional — gives a nice parallax feel */
}
.hero-bg::before {
  content: ""; position: absolute;
  top: -80px; right: -80px;
  width: 400px; height: 400px; border-radius: 50%;
  background: rgba(61,107,71,.22); pointer-events: none;
}
.hero-bg::after {
  content: ""; position: absolute;
  bottom: -100px; left: 25%;
  width: 280px; height: 280px; border-radius: 50%;
  background: rgba(184,148,42,.14); pointer-events: none;
}
  /* Hero sliding cards */
.hero-cards-col {
  position: absolute;
  left: 48px;
  top: 0;
  bottom: 0;
  width: 200px;
  overflow: hidden;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
}
.hero-cards-track {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideUp 28s linear infinite;
  padding: 12px 0;
}
@keyframes slideUp {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.hero-card-item {
  background: rgba(255,255,255,.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 14px;
  overflow: hidden;
  width: 200px;
  flex-shrink: 0;
}
.hero-card-img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}
.hero-card-img-placeholder {
  width: 100%;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  background: rgba(255,255,255,.06);
}
.hero-card-body {
  padding: 10px 12px 12px;
}
.hero-card-cat {
  font-size: .6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--gold2);
  margin-bottom: 3px;
}
.hero-card-name {
  font-family: var(--serif);
  font-size: .92rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 6px;
}
.hero-card-price {
  font-size: .78rem;
  font-weight: 700;
  color: rgba(255,255,255,.75);
  background: rgba(255,255,255,.1);
  border-radius: 6px;
  padding: 3px 8px;
  display: inline-block;
}
@media(max-width: 1024px) {
  .hero-cards-col { display: none; }
}
.hero-content{position:relative;z-index:1;max-width:720px; margin-left: 280px; 
  margin-right: auto;padding:80px 32px 100px}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(245,240,232,.15);border:1px solid rgba(245,240,232,.25);backdrop-filter:blur(8px);border-radius:20px;padding:6px 16px;margin-bottom:22px;font-size:.72rem;font-weight:600;color:rgba(245,240,232,.9);letter-spacing:1.5px;text-transform:uppercase}
.hero h1{font-family:var(--serif);font-size:clamp(3rem,6vw,5.5rem);font-weight:600;line-height:1.02;letter-spacing:-.5px;color:var(--white);margin-bottom:20px}
.hero h1 em{font-style:italic;color:var(--gold2)}
.hero p{font-size:1.05rem;color:rgba(245,240,232,.82);max-width:520px;line-height:1.75;margin-bottom:36px;font-weight:300}
.hero-search{background:var(--white);border-radius:16px;display:flex;align-items:center;overflow:hidden;box-shadow:var(--sh3);max-width:620px}
.hero-search-field{flex:1;padding:18px 22px;display:flex;align-items:center;gap:12px;border-right:1px solid var(--border)}
.hsf-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);display:block;margin-bottom:2px}
.hsf-val{font-size:.9rem;font-weight:500;color:var(--text)}
.hero-search-btn{background:var(--terra);color:white;border:none;padding:18px 28px;display:flex;align-items:center;gap:8px;font-weight:700;font-size:.88rem;white-space:nowrap;cursor:pointer;transition:background .2s;flex-shrink:0}
.hero-search-btn:hover{background:var(--terra2)}
.hero-trust{display:flex;align-items:center;gap:20px;margin-top:28px;flex-wrap:wrap}
.hero-trust-item{display:flex;align-items:center;gap:7px;color:rgba(245,240,232,.7);font-size:.78rem;font-weight:500}
@media(max-width: 1024px) {
  .hero-content {
    margin-left: auto;
  }
}
/* Category pills */
.cats-section{padding:36px 0 0;background:var(--cream)}
.cats-scroll{display:flex;gap:10px;padding:0 32px;overflow-x:auto;scrollbar-width:none;max-width:var(--max);margin:0 auto}
.cats-scroll::-webkit-scrollbar{display:none}
.cat-pill{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:50px;border:1.5px solid var(--border);background:var(--white);font-size:.82rem;font-weight:500;color:var(--sub);white-space:nowrap;cursor:pointer;transition:all .2s;flex-shrink:0}
.cat-pill:hover{border-color:var(--leaf);color:var(--leaf)}
.cat-pill.active{background:var(--forest);color:var(--cream);border-color:var(--forest)}
.cat-pill-count{background:var(--cream2);color:var(--muted);padding:1px 7px;border-radius:10px;font-size:.7rem;font-weight:600}
.cat-pill.active .cat-pill-count{background:rgba(245,240,232,.2);color:rgba(245,240,232,.7)}

/* Section */
.section{padding:60px 0}
.section-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px}
.section-eyebrow{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--terra);margin-bottom:6px}
.section-title{font-family:var(--serif);font-size:clamp(1.8rem,3vw,2.6rem);font-weight:600;letter-spacing:-.3px;line-height:1.1;color:var(--forest)}
.section-sub{color:var(--sub);font-size:.88rem;margin-top:6px}
.see-all{display:flex;align-items:center;gap:5px;font-size:.83rem;font-weight:600;color:var(--leaf);border:1.5px solid var(--border2);border-radius:8px;padding:8px 16px;background:transparent;cursor:pointer;transition:all .2s;white-space:nowrap}
.see-all:hover{border-color:var(--leaf);background:rgba(61,107,71,.04)}

/* Featured */
.featured-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:16px}
.feat-card{position:relative;border-radius:var(--r2);overflow:hidden;cursor:pointer;transition:transform .3s,box-shadow .3s}
.feat-card:hover{transform:translateY(-4px);box-shadow:var(--sh3)}
.feat-card-img{position:relative;overflow:hidden;width: 100%;}
.feat-card-img img{transition:transform .6s cubic-bezier(.25,.46,.45,.94);height:100%}
.feat-card:hover .feat-card-img img{transform:scale(1.05)}
.feat-card.large .feat-card-img{height:420px}
.feat-card.small .feat-card-img{height:200px}
.feat-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,46,31,.85) 0%,rgba(26,46,31,.2) 50%,transparent 80%);display:flex;flex-direction:column;justify-content:flex-end;padding:24px}
.feat-badge{position:absolute;top:16px;left:16px;background:var(--terra);color:white;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 10px;border-radius:4px}
.feat-partner{font-size:.72rem;font-weight:600;color:rgba(245,240,232,.7);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px}
.feat-name{font-family:var(--serif);color:white;font-size:1.5rem;font-weight:600;line-height:1.2;margin-bottom:8px}
.feat-card.small .feat-name{font-size:1.1rem}
.feat-meta{display:flex;align-items:center;gap:12px}
.feat-price{font-weight:700;font-size:1rem;color:white}
.feat-price small{font-size:.7rem;font-weight:500;opacity:.75}
.feat-rating{display:flex;align-items:center;gap:4px;font-size:.75rem;color:rgba(245,240,232,.85);font-weight:600;margin-left:auto}
.star{color:var(--gold2)}
.feat-wishlist{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:white;font-size:.9rem}
.feat-wishlist:hover{background:rgba(255,255,255,.35)}

/* Cards grid */
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.card{background:var(--white);border-radius:var(--r2);overflow:hidden;border:1px solid var(--border);cursor:pointer;transition:transform .25s,box-shadow .25s,border-color .25s;display:flex;flex-direction:column}
.card:hover{transform:translateY(-5px);box-shadow:var(--sh2);border-color:var(--border2)}
.card-img{position:relative;overflow:hidden;height:210px;background:var(--cream2)}
.card-img img{height:100%;transition:transform .5s cubic-bezier(.25,.46,.45,.94)}
.card:hover .card-img img{transform:scale(1.07)}
.card-img-placeholder{height:100%;display:flex;align-items:center;justify-content:center;font-size:3.5rem;background:linear-gradient(135deg,var(--cream2),var(--cream3))}
.card-badge-row{position:absolute;top:12px;left:12px;display:flex;gap:6px}
.cbadge{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:3px 9px;border-radius:4px;backdrop-filter:blur(8px)}
.cbadge-pop{background:rgba(196,98,45,.9);color:white}
.cbadge-sale{background:rgba(61,107,71,.9);color:white}
/* NEW: category-specific badge tints */
.cbadge-music{background:rgba(88,57,180,.88);color:white}
.cbadge-events{background:rgba(180,57,120,.88);color:white}
.cbadge-trad { background: rgba(139, 90, 30, .88); color: white; }
.card-body{padding:18px 18px 16px;flex:1;display:flex;flex-direction:column}
.card-cat{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--terra);margin-bottom:6px}
.card-name{font-family:var(--serif);font-size:1.2rem;font-weight:600;line-height:1.25;margin-bottom:5px;color:var(--forest)}
.card-partner{font-size:.74rem;color:var(--muted);margin-bottom:10px}
.card-desc{font-size:.8rem;color:var(--sub);line-height:1.6;flex:1;margin-bottom:14px}
.card-includes{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px}
.inc{font-size:.68rem;background:var(--cream2);color:var(--sub);padding:3px 8px;border-radius:4px;border:1px solid var(--cream3)}
.card-footer{border-top:1px solid var(--cream2);padding-top:13px;display:flex;justify-content:space-between;align-items:center}
.card-price-from{font-size:.65rem;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);display:block}
.card-price-val{font-family:var(--serif);font-size:1.45rem;font-weight:700;color:var(--forest);letter-spacing:-.5px;line-height:1}
.card-rating{display:flex;align-items:center;gap:4px;font-size:.75rem;font-weight:600;color:var(--forest)}

/* HIW */
.hiw{background:var(--forest);padding:80px 0;position:relative;overflow:hidden}
.hiw {
  position: relative;
  padding: 56px 0;
  overflow: hidden;
}

.hiw::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(135deg, rgba(26,46,31,.92) 0%, rgba(26,46,31,.75) 100%),
    url('/images/zimbabwe.jpg');
  background-size: cover;
  background-position: center 40%;
  background-repeat: no-repeat;
  z-index: 0;
}
.hiw .section-eyebrow{color:var(--gold2)}
.hiw .section-title{color:var(--cream)}
.hiw .section-sub{color:rgba(245,240,232,.55)}
.hiw-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(245,240,232,.1);border-radius:16px;overflow:hidden}
.hiw-step{background:rgba(26,46,31,.4);padding:36px 28px;position:relative;transition:background .2s}
.hiw-step:hover{background:rgba(26,46,31,.6)}
.hiw-step-num{font-family:var(--serif);font-size:3.5rem;font-weight:700;color:rgba(245,240,232,.08);line-height:1;margin-bottom:16px}
.hiw-step-icon{width:48px;height:48px;border-radius:12px;background:rgba(245,240,232,.1);border:1px solid rgba(245,240,232,.12);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:16px}
.hiw-step h3{font-size:.95rem;font-weight:700;color:var(--cream);margin-bottom:8px}
.hiw-step p{font-size:.8rem;color:rgba(245,240,232,.5);line-height:1.65}

/* Trust bar */
.trust-bar { background: transparent; border: none; padding: 0 0 32px; }
.trust-bar-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-width: var(--max); margin: 0 auto; padding: 0 32px;
}
.trust-item {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  display: flex; align-items: flex-start; gap: 10px;
}
.trust-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--cream2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}
.trust-text h4{font-size:.82rem;font-weight:700;color:var(--forest);margin-bottom:1px}
.trust-text p{font-size:.73rem;color:var(--muted)}

/* Testimonials */
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.testi{background:var(--white);border:1px solid var(--border);border-radius:var(--r2);padding:26px}
.testi-stars{display:flex;gap:2px;margin-bottom:14px;font-size:.9rem}
.testi-text{font-family:var(--serif);font-style:italic;font-size:1.05rem;line-height:1.65;color:var(--forest);margin-bottom:18px}
.testi-author{display:flex;align-items:center;gap:10px}
.testi-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--leaf),var(--gold));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:.82rem;flex-shrink:0}
.testi-name{font-weight:600;font-size:.83rem;color:var(--forest)}
.testi-loc{font-size:.72rem;color:var(--muted)}
.testi-product{font-size:.7rem;color:var(--leaf);font-weight:600;background:rgba(61,107,71,.08);border:1px solid rgba(61,107,71,.15);padding:2px 8px;border-radius:4px;margin-left:auto;white-space:nowrap}
.eyebrow {
  font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1.5px; color: var(--terra); margin-bottom: 6px;
}
/* Occasions */
.occasions {
  position: relative;
  padding: 56px 0;
  overflow: hidden;
}

.occasions::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(135deg, rgba(26,46,31,.92) 0%, rgba(26,46,31,.75) 100%),
    url('/images/florists.jpg');
  background-size: cover;
  background-position: center 40%;
  background-repeat: no-repeat;
  z-index: 0;
}

.occasions .container {
  position: relative;
  z-index: 1;
}

.occasions .section-title { color: var(--cream); }
.occasions .section-sub { color: rgba(245,240,232,.5); }
.occ-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.occ{background:rgba(245,240,232,.06);border:1px solid rgba(245,240,232,.1);border-radius:14px;padding:20px 14px;text-align:center;cursor:pointer;transition:all .2s}
.occ:hover{background:rgba(245,240,232,.12);border-color:rgba(245,240,232,.2);transform:translateY(-2px)}
.occ-icon{font-size:1.8rem;margin-bottom:8px;display:block}
.occ-name{font-size:.75rem;font-weight:600;color:rgba(245,240,232,.8)}

/* Cat showcase */
.cat-showcase{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.cat-block{position:relative;border-radius:var(--r2);overflow:hidden;cursor:pointer;transition:transform .25s}
.cat-block:hover{transform:translateY(-3px)}
.cat-block-img{height:220px;position:relative;overflow:hidden}
.cat-block-img img{height:100%;transition:transform .5s}
.cat-block:hover .cat-block-img img{transform:scale(1.06)}
.cat-block-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,46,31,.8) 0%,rgba(26,46,31,.1) 60%,transparent 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:20px}
.cat-block-icon{font-size:2rem;margin-bottom:8px}
.cat-block h3{font-family:var(--serif);color:white;font-size:1.3rem;font-weight:600;margin-bottom:3px}
.cat-block p{font-size:.75rem;color:rgba(245,240,232,.65)}

/* Partners row */
.partners-section{background:var(--white);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:40px 0}
.partners-label{text-align:center;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:28px}
.partners-row{display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap}
.partner-logo{font-family:var(--serif);font-size:1.1rem;font-weight:700;color:var(--muted);opacity:.6;transition:opacity .2s;cursor:default}
.partner-logo:hover{opacity:1}
.partner-logo span{color:var(--terra);opacity:1}

/* Newsletter */
.newsletter{background:var(--cream2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:64px 0;text-align:center}
.newsletter h2{font-family:var(--serif);font-size:2.2rem;font-weight:600;color:var(--forest);margin-bottom:8px}
.newsletter p{color:var(--sub);font-size:.9rem;margin-bottom:28px}
.nl-form{display:flex;max-width:440px;margin:0 auto;overflow:hidden;border-radius:10px;box-shadow:var(--sh1);border:1.5px solid var(--border2)}
.nl-form input{flex:1;padding:14px 18px;border:none;outline:none;font-family:var(--sans);font-size:.88rem;color:var(--text);background:var(--white)}
.nl-btn{background:var(--terra);color:white;border:none;padding:0 22px;font-family:var(--sans);font-weight:700;font-size:.83rem;cursor:pointer;transition:background .2s;white-space:nowrap}
.nl-btn:hover{background:var(--terra2)}
.scroll-top{position:fixed;bottom:calc(90px + env(safe-area-inset-bottom));left:20px;width:42px;height:42px;border-radius:50%;background:var(--forest);color:var(--cream);border:none;font-size:1rem;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .3s,transform .2s;z-index:400;box-shadow:var(--sh2)}
.scroll-top.show{opacity:1;pointer-events:all}
.scroll-top:hover{transform:translateY(-2px)}
/* Footer */
footer{background:var(--forest);color:rgba(245,240,232,.65);padding:64px 0 32px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
.footer-brand{font-family:var(--serif);font-size:1.8rem;font-weight:700;color:var(--cream);margin-bottom:12px}
.footer-brand span{color:var(--terra2)}
.footer-tagline{font-size:.83rem;line-height:1.7;margin-bottom:20px;max-width:280px}
.footer-socials{display:flex;gap:8px}
.social-btn{width:34px;height:34px;border-radius:8px;background:rgba(245,240,232,.08);border:1px solid rgba(245,240,232,.1);display:flex;align-items:center;justify-content:center;font-size:.9rem;cursor:pointer;transition:all .2s;color:rgba(245,240,232,.6);text-decoration:none}
.social-btn:hover{background:rgba(245,240,232,.15);color:var(--cream)}
.footer-col h4{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--cream);margin-bottom:16px}
.footer-links{display:flex;flex-direction:column;gap:9px}
.footer-link{font-size:.82rem;cursor:pointer;transition:color .18s}
.footer-link:hover{color:var(--cream)}
.footer-bottom{border-top:1px solid rgba(245,240,232,.1);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-legal{font-size:.74rem}
.footer-payments{display:flex;align-items:center;gap:8px}
.pay-badge{background:rgba(245,240,232,.08);border:1px solid rgba(245,240,232,.12);border-radius:5px;padding:4px 10px;font-size:.7rem;font-weight:600;color:rgba(245,240,232,.5)}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(26,46,31,.7);z-index:1000;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .3s}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal-overlay.open .modal-sheet{transform:translateY(0)}
.modal-sheet{background:var(--cream);border-radius:24px 24px 0 0;width:100%;max-width:900px;max-height:92vh;overflow-y:auto;transform:translateY(60px);transition:transform .35s cubic-bezier(.34,1.2,.64,1)}
.modal-inner{display:grid;grid-template-columns:1fr 420px;min-height:600px}
.modal-gallery{position:relative;border-radius:24px 0 0 0;overflow:hidden}
.modal-gallery img{height:100%;object-fit:cover;min-height:450px}
.modal-gallery-badge{position:absolute;top:20px;left:20px;background:var(--terra);color:white;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:5px 12px;border-radius:6px}
.modal-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;color:var(--forest);transition:all .2s}
.modal-close:hover{background:white;transform:rotate(90deg)}
.modal-body{padding:36px;overflow-y:auto;display:flex;flex-direction:column}
.modal-cat{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--terra);margin-bottom:8px}
.modal-title{font-family:var(--serif);font-size:1.9rem;font-weight:600;line-height:1.15;color:var(--forest);margin-bottom:8px}
.modal-partner{display:flex;align-items:center;gap:8px;margin-bottom:16px;color:var(--sub);font-size:.82rem}
.modal-partner-badge{background:rgba(61,107,71,.1);color:var(--leaf);font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:4px}
.modal-desc{font-size:.88rem;color:var(--sub);line-height:1.75;margin-bottom:22px}
.modal-includes h4{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px}
.modal-includes-list{display:flex;flex-direction:column;gap:6px;margin-bottom:24px}
.mi-row{display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--text)}
.mi-check{color:var(--leaf);font-size:.75rem;flex-shrink:0}
.modal-sep{height:1px;background:var(--border);margin:0 -36px 22px}
.modal-price-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.modal-price-lbl{font-size:.78rem;color:var(--muted)}
.modal-price-val{font-family:var(--serif);font-size:2rem;font-weight:700;color:var(--forest)}
.modal-buy-btn{width:100%;padding:16px;background:var(--forest);color:var(--cream);border:none;border-radius:12px;font-family:var(--serif);font-size:1.1rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px}
.modal-buy-btn:hover{background:var(--forest2);transform:translateY(-1px);box-shadow:0 8px 24px rgba(26,46,31,.25)}
.modal-secondary-btn{width:100%;padding:12px;background:transparent;border:1.5px solid var(--border2);border-radius:12px;color:var(--sub);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s}
.modal-secondary-btn:hover{border-color:var(--leaf);color:var(--leaf)}

/* Drawer */
.drawer-overlay{position:fixed;inset:0;background:rgba(26,46,31,.5);z-index:2000;opacity:0;pointer-events:none;transition:opacity .25s;backdrop-filter:blur(4px)}
.drawer-overlay.open{opacity:1;pointer-events:all}
.drawer-overlay.open .drawer{transform:translateX(0)}
.drawer{position:absolute;right:0;top:0;bottom:0;width:100%;max-width:480px;background:var(--cream);box-shadow:var(--sh3);transform:translateX(100%);transition:transform .35s cubic-bezier(.34,1,.64,1);display:flex;flex-direction:column;overflow-y:auto}
.drawer-header{padding:24px 28px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--cream);z-index:1}
.drawer-title{font-family:var(--serif);font-size:1.4rem;font-weight:600;color:var(--forest)}
.drawer-close{background:var(--cream2);border:1px solid var(--border);border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;color:var(--sub);transition:all .2s}
.df-field{margin-bottom:12px}
.df-field label{font-size:.72rem;font-weight:600;color:var(--sub);display:block;margin-bottom:5px}
.df-field input,.df-field textarea{width:100%;padding:11px 14px;background:var(--white);border:1.5px solid var(--border);border-radius:9px;font-family:var(--sans);font-size:.88rem;color:var(--text);outline:none;transition:border-color .2s}
.df-field input:focus,.df-field textarea:focus{border-color:var(--leaf)}
.df-field textarea{resize:none;height:70px;font-size:.82rem}
.checkout-btn{width:100%;padding:16px;background:var(--forest);color:var(--cream);border:none;border-radius:12px;font-family:var(--serif);font-size:1.05rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
.checkout-btn:hover{background:var(--forest2);transform:translateY(-1px)}
.checkout-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}

/* Auth */
.auth-page{min-height:80vh;display:flex;align-items:center;justify-content:center;padding:40px 20px}
.auth-card{background:var(--white);border:1px solid var(--border);border-radius:24px;padding:44px 40px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(26,46,31,.1)}
.auth-logo{font-family:var(--serif);font-size:1.6rem;font-weight:700;color:var(--forest);text-align:center;margin-bottom:6px}
.auth-logo span{color:var(--terra)}
.auth-tagline{text-align:center;color:var(--muted);font-size:.82rem;margin-bottom:28px}
.auth-tabs{display:flex;background:var(--cream2);border-radius:10px;padding:4px;gap:4px;margin-bottom:28px}
.auth-tab{flex:1;padding:9px;border-radius:7px;border:none;background:transparent;font-family:var(--sans);font-size:.84rem;font-weight:600;color:var(--sub);cursor:pointer;transition:all .2s}
.auth-tab.active{background:var(--white);color:var(--forest);box-shadow:0 1px 6px rgba(26,46,31,.08)}
.auth-field{margin-bottom:14px}
.auth-field label{display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:6px}
.auth-field input{width:100%;padding:12px 14px;border:1.5px solid var(--border2);border-radius:9px;font-family:var(--sans);font-size:.9rem;color:var(--text);outline:none;transition:border-color .2s;background:var(--cream)}
.auth-field input:focus{border-color:var(--leaf);background:var(--white)}
.auth-btn{width:100%;padding:14px;background:var(--forest);color:var(--cream);border:none;border-radius:10px;font-family:var(--serif);font-size:1rem;font-weight:700;cursor:pointer;transition:all .2s;margin-top:6px}
.auth-btn:hover:not(:disabled){background:var(--forest2);transform:translateY(-1px)}
.auth-btn:disabled{opacity:.5;cursor:not-allowed}
.auth-error{font-size:.78rem;color:#b91c1c;margin-top:6px;min-height:18px}
.auth-badge{display:block;text-align:center;width:fit-content;margin:0 auto 20px;background:rgba(61,107,71,.08);border:1px solid rgba(61,107,71,.15);color:var(--leaf);font-size:.72rem;font-weight:600;padding:5px 12px;border-radius:20px}

/* Admin */
.admin-input{width:100%;padding:11px 14px;border:1.5px solid var(--border2);border-radius:9px;font-family:var(--sans);font-size:.88rem;color:var(--text);outline:none;transition:border-color .2s;background:var(--cream)}
.admin-input:focus{border-color:var(--leaf)}

/* Success */
@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
.spin-anim{animation:spin .7s linear infinite}

/* Responsive */
.nav-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:8px;flex-shrink:0;margin-left:auto}
.nav-hamburger span{display:block;width:22px;height:2px;background:var(--forest);border-radius:2px;transition:transform .25s,opacity .25s}
.nav-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav-hamburger.open span:nth-child(2){opacity:0}
.nav-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mobile-menu{display:none;position:absolute;top:72px;left:0;right:0;background:var(--cream);border-bottom:1px solid var(--border);padding:10px 16px 16px;flex-direction:column;gap:2px;z-index:99;box-shadow:0 8px 24px rgba(26,46,31,.1)}
.mobile-menu.open{display:flex}
.mobile-menu-link{padding:12px 16px;border-radius:9px;font-size:.9rem;font-weight:500;color:var(--sub);cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:background .18s,color .18s}
.mobile-menu-link:hover,.mobile-menu-link.active{background:var(--cream2);color:var(--forest)}
.mobile-menu-divider{height:1px;background:var(--border);margin:8px 0}
.mobile-menu-cta{margin-top:4px;padding:13px;background:var(--forest);color:var(--cream);border:none;border-radius:10px;font-family:var(--sans);font-size:.9rem;font-weight:700;cursor:pointer;text-align:center;width:100%}

@media(max-width:1024px){
  .featured-grid{grid-template-columns:1fr 1fr}
  .hiw-steps{grid-template-columns:1fr 1fr}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .modal-inner{grid-template-columns:1fr}
  .occ-grid{grid-template-columns:repeat(3,1fr)}
  .cat-showcase{grid-template-columns:1fr 1fr}
}

@media(max-width:768px){
  .container{padding:0 16px}
  .section{padding:40px 0}
  .section-head{flex-direction:column;align-items:flex-start;gap:12px}
  .nav-inner{padding:0 16px;gap:12px}
  .nav-user{display:none}
  .nav-search,.nav-links,.nav-cta{display:none}
  .nav-hamburger{display:flex}
  .nav{position:relative}
  .hero{min-height:auto}
  .hero-content{padding:56px 20px 72px}
  .hero h1{font-size:2.6rem}
  .hero p{font-size:.95rem}
  .hero-search{flex-direction:column;max-width:100%;border-radius:14px}
  .hero-search-field{border-right:none!important;border-bottom:1px solid var(--border);padding:14px 18px}
  .hero-search-btn{width:100%;justify-content:center;padding:16px;border-radius:0 0 12px 12px}
  .hero-trust{gap:12px}
  .cats-scroll{padding:0 16px}
  .featured-grid,.testi-grid,.cat-showcase{grid-template-columns:1fr}
  .cards-grid{grid-template-columns:1fr 1fr}
  .feat-card.large .feat-card-img{height:280px}
  .feat-card.small .feat-card-img{height:180px}
  .hiw-steps{grid-template-columns:1fr}
  .hiw{padding:56px 0}
  .occ-grid{grid-template-columns:repeat(3,1fr)}
  .trust-bar-inner{justify-content:flex-start;gap:20px}
  .trust-item:nth-child(n+4){display:none}
  .testi-author{flex-wrap:wrap}
  .testi-product{margin-left:0;margin-top:4px}
  .footer-grid{grid-template-columns:1fr}
  .footer-bottom{flex-direction:column;align-items:flex-start;gap:14px}
  .auth-card{padding:32px 22px;border-radius:16px}
  .modal-sheet{border-radius:20px 20px 0 0;max-height:96vh}
  .modal-inner{grid-template-columns:1fr}
  .modal-gallery img{min-height:220px}
  .modal-body{padding:24px}
  .drawer{max-width:100%}
  .admin-grid-2{grid-template-columns:1fr!important}
}

@media(max-width:600px){
  .cards-grid{grid-template-columns:1fr}
  .occ-grid{grid-template-columns:repeat(2,1fr)}
  .cat-showcase{grid-template-columns:1fr}
  .hiw-step{padding:26px 20px}
  .nav-avatar{width:32px;height:32px;font-size:.72rem}
  .hero h1{font-size:2.1rem}
  .hero-eyebrow{font-size:.65rem}
  .trust-item:nth-child(n+3){display:none}
  .testi-grid{grid-template-columns:1fr}
  .nl-form{flex-direction:column;border-radius:12px}
  .nl-form input{border-radius:10px 10px 0 0;border-right:none}
  .nl-btn{padding:12px;border-radius:0 0 10px 10px;font-size:.85rem}
  .footer-socials{gap:6px}
  .footer-payments{flex-wrap:wrap;gap:6px}
  .auth-tabs{gap:2px}
  .auth-tab{font-size:.78rem;padding:8px}
}

/* ── Bottom Navigation ──────────────────────────────────────────────────── */
.bottom-nav{
  display:none;
  position:fixed;bottom:0;left:0;right:0;z-index:300;
  background:rgba(245,240,232,.97);
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border-top:1px solid var(--border);
  padding:10px 0 max(14px, env(safe-area-inset-bottom));
  box-shadow:0 -4px 24px rgba(26,46,31,.08);
}
.bottom-nav-inner{
  display:grid;grid-template-columns:repeat(4,1fr);
  max-width:480px;margin:0 auto;padding:0 8px;gap:2px;
}
.bn-item{
  display:flex;flex-direction:column;align-items:center;gap:4px;
  padding:6px 4px;border:none;background:none;cursor:pointer;
  border-radius:12px;color:var(--muted);transition:color .18s;
  position:relative;-webkit-tap-highlight-color:transparent;
}
.bn-item.active{color:var(--forest)}
.bn-pill{
  width:44px;height:30px;border-radius:15px;
  display:flex;align-items:center;justify-content:center;
  transition:background .2s;
}
.bn-item.active .bn-pill{background:var(--forest)}
.bn-item.active .bn-label::after {
  content: ""; display: block; width: 4px; height: 4px;
  border-radius: 50%; background: var(--terra);
  margin: 3px auto 0;
}
.bn-item.active .bn-pill svg{stroke:var(--cream)}
.bn-label{font-size:.6rem;font-weight:600;letter-spacing:.3px;line-height:1}
.bn-badge{
  position:absolute;top:4px;right:calc(50% - 22px);
  width:8px;height:8px;border-radius:50%;
  background:var(--terra);border:2px solid var(--cream);
}

@media(max-width:768px){
  .bottom-nav{display:block}
  body{padding-bottom:calc(68px + env(safe-area-inset-bottom))}
  footer{padding-bottom:calc(64px + env(safe-area-inset-bottom))}
}
`;

// ══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════

function AnnounceBanner() {
  const [banner, setBanner] = useState({
    icon: "⏳",
    text: "Loading holiday promotions…",
    urgency: "",
    bg: "#1a2e1f",
  });

  useEffect(() => {
    const CAT_MAP = {
      Christmas: { bg: "#3B6D11", icon: "🎄", cat: "Stays & Getaways" },
      "New Year": { bg: "#534AB7", icon: "🎆", cat: "Adventure" },
      Easter: { bg: "#0F6E56", icon: "🐣", cat: "Stays & Getaways" },
      Women: { bg: "#993556", icon: "👩", cat: "Wellness & Spa" },
      Youth: { bg: "#185FA5", icon: "🎓", cat: "Skills & Courses" },
      Heritage: { bg: "#854F0B", icon: "🏺", cat: "Dining & Wine" },
      Freedom: { bg: "#534AB7", icon: "🏅", cat: "Adventure" },
      Workers: { bg: "#0F6E56", icon: "💪", cat: "Wellness & Spa" },
      default: { bg: "#0F6E56", icon: "🎁", cat: "Experiences" },
      "Valentine's Day": { bg: "#991B4B", icon: "🌹", cat: "Florists" },
      "Mother's Day": { bg: "#993556", icon: "💐", cat: "Florists" },
    };
    const getInfo = (name) => {
      const k = Object.keys(CAT_MAP).find(
        (k) => k !== "default" && name.toLowerCase().includes(k.toLowerCase()),
      );
      return CAT_MAP[k] || CAT_MAP.default;
    };
    const daysUntil = (ds) => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      const d = new Date(ds);
      d.setHours(0, 0, 0, 0);
      return Math.round((d - t) / 86400000);
    };
    let timer;
    (async () => {
      const year = new Date().getFullYear();
      try {
        const r = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/ZA`,
        );
        const data = await r.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = data
          .filter((h) => new Date(h.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (!upcoming.length) return;
        let idx = 0;
        const update = () => {
          const h = upcoming[idx % upcoming.length];
          const days = daysUntil(h.date);
          const info = getInfo(h.name);
          const urgency =
            days === 0
              ? "🔥 Today!"
              : days <= 3
                ? `🔥 ${days}d left!`
                : days <= 7
                  ? `${days} days away`
                  : "";
          setBanner({
            icon: info.icon,
            text: `🇿🇦 <strong>${h.name}</strong> — Gift a ${info.cat} voucher`,
            urgency,
            bg: info.bg,
          });
          idx++;
        };
        update();
        timer = setInterval(update, 5000);
      } catch {}
    })();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announce" style={{ background: banner.bg, padding: 0 }}>
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span>{banner.icon}</span>
        <span
          style={{ fontSize: ".78rem", fontWeight: 500 }}
          dangerouslySetInnerHTML={{ __html: banner.text }}
        />
        {banner.urgency && (
          <span
            style={{
              background: "rgba(255,255,255,.2)",
              borderRadius: 4,
              padding: "1px 7px",
              fontSize: ".7rem",
            }}
          >
            {banner.urgency}
          </span>
        )}
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
    ? (user.displayName || user.email || "P")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "P";
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
        <button className="nav-dropdown-item" role="menuitem" onClick={() => { handleNavClick("vouchers"); setDropdownOpen(false); }}>
          <i className="ti ti-ticket" aria-hidden="true" /> My Vouchers
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

// ─── VoucherCard ──────────────────────────────────────────────────────────
function VoucherCard({ voucher, onOpen }) {
  const imgSrc = voucher.imageUrl || voucher.img;
  const descText = (voucher.desc || "").substring(0, 90);
  const catBg = {
    Wellness: "linear-gradient(135deg,#e8f0e8,#c8e0c8)",
    Adventure: "linear-gradient(135deg,#e0e8f0,#c0d0e4)",
    Music: "linear-gradient(135deg,#ece8f4,#d4c8ec)",
    Events: "linear-gradient(135deg,#f4e8ec,#ecd0d8)",
    Florists: "linear-gradient(135deg,#f4eee8,#e8d8c8)",
    Beauty: "linear-gradient(135deg,#f4e8f0,#e8c8d8)",
    "Dining & Wine": "linear-gradient(135deg,#f8f0e0,#f0e0c0)",
    "Traditional Restaurants": "linear-gradient(135deg,#f5ede0,#e8d5b0)",
    Stays: "linear-gradient(135deg,#e8f0ec,#c8e0cc)",
  };
  // Pick a badge class based on category
  const catBadgeClass =
    voucher.cat === "Music"
      ? "cbadge cbadge-music"
      : voucher.cat === "Events"
        ? "cbadge cbadge-events"
        : voucher.cat === "Traditional Restaurants"
          ? "cbadge cbadge-trad"
          : "cbadge cbadge-pop";

  return (
    <div className="card" onClick={() => onOpen(voucher)}>
      <div className="card-img">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={voucher.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            className="card-img-placeholder"
            style={{
              background:
                catBg[voucher.cat] ||
                "linear-gradient(135deg,var(--cream2),var(--cream3))",
            }}
          >
            {voucher.icon || getCatIcon(voucher.cat) || "🎁"}
          </div>
        )}
        <div className="card-badge-row">
          {(voucher.tags || []).slice(0, 2).map((t) => (
            <span key={t} className={catBadgeClass}>
              {t}
            </span>
          ))}
          {voucher.source === "firebase" && (
            <span className="cbadge cbadge-sale">Partner</span>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="card-cat">{voucher.cat}</div>
        <div className="card-name">{voucher.name}</div>
        <div className="card-partner">
          📍 {voucher.partner} · {voucher.city}
        </div>
        <div className="card-desc">
          {descText}
          {descText.length >= 90 ? "…" : ""}
        </div>
        <div className="card-includes">
          {(voucher.includes || []).slice(0, 3).map((i) => (
            <span key={i} className="inc">
              ✓ {i}
            </span>
          ))}
          {(voucher.includes || []).length > 3 && (
            <span className="inc">+{voucher.includes.length - 3} more</span>
          )}
        </div>
        <div className="card-footer">
          <div>
            <span className="card-price-from">from</span>
            <div className="card-price-val">
              <small>R</small>
              {Number(voucher.price).toLocaleString()}
            </div>
            <div
              style={{ fontSize: ".68rem", color: "var(--sub)", marginTop: 2 }}
            >
              Valid {voucher.expiry || "12 months"}
            </div>
          </div>
          {voucher.rating > 0 ? (
            <div className="card-rating">
              <span className="star">★</span> {voucher.rating}{" "}
              <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                ({voucher.reviews})
              </span>
            </div>
          ) : (
            <div
              className="card-rating"
              style={{ color: "var(--leaf)", fontSize: ".72rem" }}
            >
              ✦ New
            </div>
          )}
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
      <section className="hero">
        <div
          className="hero-bg"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(26,46,31,.85) 30%, rgba(26,46,31,.7) 50%, transparent 80%), url(${greatZimbabwe})`,
          }}
        />
        <div className="hero-cards-col">
          <div className="hero-cards-track">
            {/* Duplicate the array so the loop is seamless */}
            {[...HERO_CARDS, ...HERO_CARDS].map((card, i) => (
              <div key={i} className="hero-card-item">
                {card.img ? (
                  <img
                    src={card.img}
                    alt={card.name}
                    className="hero-card-img"
                  />
                ) : (
                  <div className="hero-card-img-placeholder">{card.emoji}</div>
                )}
                <div className="hero-card-body">
                  <div className="hero-card-cat">{card.cat}</div>
                  <div className="hero-card-name">{card.name}</div>
                  <span className="hero-card-price">{card.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span>ZW</span> Zimbabwe's #1 Gift Experience Marketplace
          </div>
          <h1>
            Give the gift of <em>unforgettable</em> experiences.
          </h1>
          <p>
            From Victoria Falls to Great Zimbabwe Ruins — browse 200+ curated
            Zimbabwean experiences, delivered instantly via WhatsApp.
          </p>
          <div className="hero-search">
            <div className="hero-search-field" style={{ flex: "1.2" }}>
              <span>🔍</span>
              <div>
                <span className="hsf-label">What experience?</span>
                <div className="hsf-val">Spa, safari, live music…</div>
              </div>
            </div>
            <div className="hero-search-field" style={{ flex: "0.8" }}>
              <span>📍</span>
              <div>
                <span className="hsf-label">Where?</span>
                <div className="hsf-val">Anywhere in ZIM</div>
              </div>
            </div>
            <div
              className="hero-search-field"
              style={{ flex: "0.7", borderRight: "none" }}
            >
              <span>💰</span>
              <div>
                <span className="hsf-label">Budget</span>
                <div className="hsf-val">Any price</div>
              </div>
            </div>
            <button className="hero-search-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
          </div>
          <div className="hero-trust">
            <div className="hero-trust-item">⭐ 4.9/5 from 2,800+ reviews</div>
            <div className="hero-trust-item">🔒 Secure PayFast payments</div>
            <div className="hero-trust-item">📱 Instant WhatsApp delivery</div>
            <div
              className="hero-trust-item"
              style={{
                background: "rgba(245,240,232,.15)",
                border: "1px solid rgba(245,240,232,.25)",
                borderRadius: 20,
                padding: "4px 14px",
              }}
            >
              🎟️ <strong>{vouchers.length * 3 + 2340}</strong> vouchers sold
              this month
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,.1)",
            }}
          >
            {[
              ["2,800+", "Reviews · 4.9★"],
              ["200+", "Experiences"],
              ["Instant", "WhatsApp delivery"],
              ["R0", "Partner setup cost"],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.6rem",
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
                    fontSize: ".65rem",
                    color: "rgba(255,255,255,.4)",
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
      </section>

      {/* Category pills — scrollable, includes Music + Events */}
      <div className="cats-section">
        <div className="cats-scroll">
          {allCats.map((cat) => (
            <button
              key={cat}
              className={`cat-pill${currentCat === cat ? " active" : ""}`}
              onClick={() => setCurrentCat(cat)}
              onDoubleClick={() => cat !== "All" && onCatSelect(cat)}
              title={`Double-click to open ${cat} page`}
            >
              <span>{catIcons[cat]}</span>{" "}
              {cat === "All" ? "All Experiences" : cat}
              <span className="cat-pill-count">{catCount(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {vouchers.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div>
              <p className="section-eyebrow">✦ Curated Picks</p>
              <h2 className="section-title">Featured Experiences</h2>
              <p className="section-sub">
                Hand-selected from our partner listings
              </p>
            </div>
            <button className="see-all" onClick={() => onCatSelect(currentCat)}>
              View all {currentCat !== "All" ? currentCat : ""} →
            </button>
          </div>
          <div className="featured-grid">
            {vouchers[0] && (
              <div
                className="feat-card large"
                onClick={() => setSelectedVoucher(vouchers[0])}
              >
                <div className="feat-card-img">
                  {vouchers[0].imageUrl ? (
                   <div style={{ position: "relative", width: "100%", height: "100%" }}>
  {/* Blurred background fill */}
  <div style={{
    position: "absolute", inset: 0,
    backgroundImage: `url(${vouchers[0].imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(12px) brightness(.6)",
    transform: "scale(1.1)", 
  }} />
  {/* Sharp image on top */}
  <img
    src={vouchers[0].imageUrl}
    alt={vouchers[0].name}
    style={{
      position: "relative", zIndex: 1,
      width: "100%", height: "100%",
      objectFit: "contain",
      objectPosition: "center",
    }}
  />
</div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--cream2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3rem",
                      }}
                    >
                      {vouchers[0].icon}
                    </div>
                  )}
                  <div className="feat-badge">Featured</div>
                </div>
                <div className="feat-card-overlay">
                  <div className="feat-partner">
                    {vouchers[0].partner} · {vouchers[0].city}
                  </div>
                  <div className="feat-name">{vouchers[0].name}</div>
                  <div className="feat-meta">
                    <div className="feat-price">
                      <small>R</small>
                      {Number(vouchers[0].price).toLocaleString()}
                    </div>
                    <div
                      className="feat-rating"
                      style={{ color: "var(--gold2)", fontSize: ".72rem" }}
                    >
                      ✦ New
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {vouchers.slice(1, 3).map((v, i) => (
                <div
                  key={i}
                  className="feat-card small"
                  onClick={() => handleOpenVoucher(v)}
                >
                  <div className="feat-card-img">
                    {v.imageUrl ? (
                     <img
  src={v.imageUrl}
  alt={v.name}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    background: "var(--forest)",
  }}
/>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "var(--cream2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "2.5rem",
                        }}
                      >
                        {v.icon}
                      </div>
                    )}
                  </div>
                  <div className="feat-card-overlay">
                    <div className="feat-partner">
                      {v.partner} · {v.city}
                    </div>
                    <div className="feat-name">{v.name}</div>
                    <div className="feat-meta">
                      <div className="feat-price">
                        <small>R</small>
                        {Number(v.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
      <section className="section container">
        <div className="section-head">
          <div>
            <p className="section-eyebrow">✦ Browse</p>
            <h2 className="section-title">
              {currentCat === "All" ? "All Experiences" : currentCat}
            </h2>
            <p className="section-sub">
              {loading
                ? "Loading partner experiences..."
                : filtered.length === 0
                  ? "No experiences listed yet"
                  : `Showing ${filtered.length} experience${filtered.length !== 1 ? "s" : ""} from our ZIM partners`}
            </p>
          </div>
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
        {lastViewed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              marginBottom: 16,
              cursor: "pointer",
              fontSize: ".82rem",
              color: "var(--sub)",
            }}
            onClick={() => setSelectedVoucher(lastViewed)}
          >
            👁️ You recently viewed:{" "}
            <strong style={{ color: "var(--forest)" }}>
              {lastViewed.name}
            </strong>
            <span
              style={{
                marginLeft: "auto",
                color: "var(--leaf)",
                fontWeight: 600,
              }}
            >
              View again →
            </span>
          </div>
        )}
        <div className="cards-grid">
          {loading ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "80px 20px",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
              <p style={{ color: "var(--muted)" }}>
                Loading experiences from our partners...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "60px 20px",
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
                No results for "{searchQ || currentCat}"
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: ".88rem",
                  marginBottom: 20,
                }}
              >
                Try browsing a different category:
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {["Wellness", "Adventure", "Music", "Events"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCurrentCat(cat);
                      setSearchQ("");
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      border: "1.5px solid var(--border2)",
                      background: "var(--white)",
                      cursor: "pointer",
                      fontSize: ".82rem",
                      fontWeight: 600,
                      color: "var(--sub)",
                    }}
                  >
                    {getCatIcon(cat)} {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            filtered.map((v) => (
              <VoucherCard key={v.id} voucher={v} onOpen={setSelectedVoucher} />
            ))
          )}
        </div>
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
              "4 experiences from R850",
            ],
            [
              "Wellness",
              "🧖",
              "/images/wellness.avif?w=600&q=80",
              "3 experiences from R550",
            ],
            [
              "Dining & Wine",
              "🍷",
              "/images/dining.webp?w=600&q=80",
              "4 experiences from R560",
            ],
            [
              "Traditional Restaurants",
              "🍲",
              "/images/kwaterry.jpg?w=600&q=80",
              "8 experiences from R240",
            ],
            [
              "Music",
              "🎵",
              "/images/music.jpg?w=600&q=80",
              "5 experiences from R450",
            ],
            [
              "Events",
              "🎪",
              "/images/events.jpg?w=600&q=80",
              "5 experiences from R580",
            ],
            [
              "Florists",
              "🌸",
              "/images/florists.jpg?w=600&q=80",
              "6 experiences from R350",
            ],
            [
              "Hair & Beauty",
              "📚",
              "/images/hair.jpg?w=600&q=80",
              "2 experiences from R650",
            ],
            [
              "Skills",
              "📚",
              "/images/skills.jpg?w=600&q=80",
              "12 experiences from R350",
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

// ─── Admin Page ───────────────────────────────────────────────────────────
function AdminPage({ user, onLogout }) {
  const [vouchers, setVouchers] = useState([]);
  const [sold, setSold] = useState([]);
  const [bizName, setBizName] = useState("My Dashboard");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))",
          gap: 14,
          marginBottom: 36,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.lbl}
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div style={{ fontSize: "1.3rem", marginBottom: 8 }}>{s.icon}</div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.7rem",
                fontWeight: 700,
                color: "var(--forest)",
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: ".7rem",
                textTransform: "uppercase",
                letterSpacing: ".7px",
                color: "var(--muted)",
                marginTop: 3,
                fontWeight: 600,
              }}
            >
              {s.lbl}
            </div>
          </div>
        ))}
      </div>

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
                  color: "var(--cream)",
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
                      R {Number(v.price || 0).toFixed(2)}
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
              background: "var(--forest)",
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
function CategoryPage({ cat, vouchers, onBack, onOpenVoucher }) {
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
                `R${Math.min(...filtered.map((v) => v.price || 0)).toLocaleString()}`,
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
            {filtered.map((v) => (
              <VoucherCard key={v.id} voucher={v} onOpen={setSelectedVoucher} />
            ))}
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
  return (
    <footer>
      <div className="container">
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
                "Redeem Voucher",
                "Help Centre",
                "Contact Us",
                "Privacy Policy",
                "Terms of Service",
              ].map((l) => (
                <Link
                  onClick={() => setPage("...")}
                  key={l}
                  className="footer-link"
                >
                  {l}
                </Link>
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
export default function App() {
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
  }, []);

  const guardedSetPage = (p) => {
    const protected_ = ["redeem", "admin"];
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
      <AnnounceBanner />
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
        <AuthPage onSuccess={() => guardedSetPage("admin")} />
      )}
      {page === "redeem" &&
        (user ? (
          <RedeemPage user={user} />
        ) : (
          <AuthPage onSuccess={() => guardedSetPage("redeem")} />
        ))}
      {page === "admin" &&
        (user ? (
          <AdminPage user={user} onLogout={handleLogout} />
        ) : (
          <AuthPage onSuccess={() => guardedSetPage("admin")} />
        ))}
      {page === "partners" && <PartnersPage />}

      <Footer setPage={guardedSetPage} />
      <BottomNav page={page} setPage={guardedSetPage} user={user} />
      {/* WhatsApp Float Button */}

      <a
        href="https://wa.me/27676056777"
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
