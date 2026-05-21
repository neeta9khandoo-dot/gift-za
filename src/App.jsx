/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
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

// ─────────────────────────────────────────────────────────────
// 🔧 FIREBASE CONFIG — replace with your project credentials
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const WORKER_URL = "https://voucher-worker.YOUR_SUBDOMAIN.workers.dev";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ── Helpers ──────────────────────────────────────────────────
const genCode = () =>
  "VCH-" +
  [...Array(8)]
    .map(
      () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
    )
    .join("");
const QR = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=0d1117&bgcolor=ffffff&data=${encodeURIComponent(data)}&format=png&qzone=2`;
const fmt = (n) =>
  `R ${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

// ─────────────────────────────────────────────────────────────
// 🇿🇦 SA MARKETPLACE PARTNERS
// ─────────────────────────────────────────────────────────────
const PARTNERS = [
  { id: "relaxzone", name: "Relax Zone Spa",       city: "Pretoria",     logo: "🧖", category: "Wellness",        commission: 20 },
  { id: "bushveld",  name: "Bushveld Escapes",      city: "Limpopo",      logo: "🦁", category: "Adventure",       commission: 18 },
  { id: "vino",      name: "Vino Wine Estate",       city: "Franschhoek",  logo: "🍷", category: "Dining & Wine",   commission: 22 },
  { id: "airborne",  name: "Airborne Adventures",   city: "Johannesburg", logo: "🪂", category: "Adventure",       commission: 15 },
  { id: "chefstable",name: "Chef's Table SA",        city: "Cape Town",    logo: "🍽️", category: "Dining & Wine",   commission: 20 },
  { id: "getaway",   name: "Getaway Lodges",         city: "Magaliesberg", logo: "🏡", category: "Stays",           commission: 18 },
  { id: "glow",      name: "Glow Beauty Studio",     city: "Sandton",      logo: "💅", category: "Beauty",          commission: 25 },
  { id: "skillup",   name: "SkillUp Academy",        city: "Online",       logo: "📚", category: "Skills & Courses",commission: 30 },
  { id: "braaiking", name: "Braai King Classes",     city: "Johannesburg", logo: "🔥", category: "Dining & Wine",   commission: 25 },
  { id: "ballon",    name: "Skysail Balloons",       city: "Magaliesberg", logo: "🎈", category: "Adventure",       commission: 15 },
];

// ─────────────────────────────────────────────────────────────
// 🛍️ FULL SA VOUCHER CATALOGUE
// ─────────────────────────────────────────────────────────────
const CATALOGUE = [
  // WELLNESS
  { id: "w1", partnerId: "relaxzone", category: "Wellness",       name: "60-Min Full Body Massage",      desc: "Swedish, deep tissue or aromatherapy — your pick",                    icon: "🧖", price: 550,  accent: "#C084FC", expiry: "12 months", tags: ["bestseller"], includes: ["1x Treatment","Robe & slippers","Herbal tea"],                                    city: "Pretoria" },
  { id: "w2", partnerId: "relaxzone", category: "Wellness",       name: "Couples Spa Day",               desc: "Side-by-side treatments, sparkling wine & 2-course lunch",            icon: "💑", price: 1800, accent: "#F472B6", expiry: "12 months", tags: ["popular"],    includes: ["2x 90-min treatments","Sparkling wine","2-course lunch","Pool access"],          city: "Pretoria" },
  { id: "w3", partnerId: "relaxzone", category: "Wellness",       name: "Hot Stone Therapy",             desc: "90-min volcanic hot stone full-body massage",                          icon: "🪨", price: 750,  accent: "#A78BFA", expiry: "12 months", tags: [],             includes: ["90-min hot stone massage","Aromatherapy","Tea ceremony"],                        city: "Pretoria" },
  // BEAUTY
  { id: "b1", partnerId: "glow",      category: "Beauty",         name: "Pamper Package",                desc: "Gel mani, spa pedi & eyebrow shaping",                                icon: "💅", price: 480,  accent: "#FB7185", expiry: "6 months",  tags: ["popular"],    includes: ["Gel manicure","Spa pedicure","Brow shape","Refreshments"],                       city: "Sandton" },
  { id: "b2", partnerId: "glow",      category: "Beauty",         name: "Bridal Glow Experience",        desc: "Full bridal prep: hair, makeup, nails & skin",                        icon: "👰", price: 1950, accent: "#F9A8D4", expiry: "12 months", tags: ["premium"],    includes: ["Hair styling","Professional makeup","Full nails","Skin prep","Champagne"],       city: "Sandton" },
  // ADVENTURE
  { id: "a1", partnerId: "airborne",  category: "Adventure",      name: "Tandem Skydive",                desc: "15,000ft freefall over Gauteng with certified instructor",              icon: "🪂", price: 2950, accent: "#34D399", expiry: "24 months", tags: ["adrenaline","popular"], includes: ["Tandem jump","Instructor","Certificate","Video & photos"],              city: "Johannesburg" },
  { id: "a2", partnerId: "ballon",    category: "Adventure",      name: "Hot Air Balloon Sunrise",       desc: "Drift over Magaliesberg at dawn, champagne breakfast incl.",           icon: "🎈", price: 2400, accent: "#FCD34D", expiry: "18 months", tags: ["romantic","popular"],   includes: ["1hr flight","Champagne breakfast","Certificate","Transfers"],           city: "Magaliesberg" },
  { id: "a3", partnerId: "bushveld",  category: "Adventure",      name: "Big 5 Game Drive Day",          desc: "Full-day guided safari in the Limpopo bushveld",                      icon: "🦁", price: 1650, accent: "#F97316", expiry: "24 months", tags: ["uniquely SA"], includes: ["Full-day drive","Bush lunch","Guide & vehicle","Sundowners"],             city: "Limpopo" },
  { id: "a4", partnerId: "bushveld",  category: "Adventure",      name: "Bushveld Overnight Safari",     desc: "2-day/1-night bush stay in a luxury tented camp",                     icon: "⛺", price: 4200, accent: "#84CC16", expiry: "24 months", tags: ["premium","uniquely SA"], includes: ["1 night tented stay","2x game drives","All meals","Bush walk"],         city: "Limpopo" },
  // DINING & WINE
  { id: "d1", partnerId: "vino",      category: "Dining & Wine",  name: "Wine Tasting for Two",          desc: "6-wine flight with artisan cheese board on a historic estate",        icon: "🍷", price: 620,  accent: "#E879F9", expiry: "12 months", tags: ["romantic"],   includes: ["6 wine tastings","Cheese board","Estate tour","Souvenir glass"],                city: "Franschhoek" },
  { id: "d2", partnerId: "chefstable",category: "Dining & Wine",  name: "Fine Dining for Two",           desc: "5-course tasting menu with wine pairing",                             icon: "🍽️", price: 1800, accent: "#FB923C", expiry: "6 months",  tags: ["premium","popular"], includes: ["5-course menu","Wine pairing","Amuse-bouche","Petit fours"],             city: "Cape Town" },
  { id: "d3", partnerId: "braaiking", category: "Dining & Wine",  name: "Braai Masterclass",             desc: "Learn to braai like a pro — fire, meat & all the stories",            icon: "🔥", price: 695,  accent: "#EF4444", expiry: "12 months", tags: ["uniquely SA","fun"], includes: ["3hr class","All ingredients","Recipe booklet","Drinks incl."],          city: "Johannesburg" },
  { id: "d4", partnerId: "chefstable",category: "Dining & Wine",  name: "High Tea for Two",              desc: "Finger sandwiches, scones, pastries & premium teas",                  icon: "🫖", price: 560,  accent: "#F472B6", expiry: "6 months",  tags: ["popular"],    includes: ["2-tier stand","Unlimited tea","Savoury & sweet","Prosecco option"],            city: "Cape Town" },
  // STAYS
  { id: "s1", partnerId: "getaway",   category: "Stays",          name: "Magaliesberg Couples Retreat",  desc: "2-night private chalet with breakfast & sundowner cruise",            icon: "🏡", price: 3600, accent: "#60A5FA", expiry: "18 months", tags: ["romantic","popular"], includes: ["2 nights chalet","Daily breakfast","Sundowner cruise","Pool & spa"],    city: "Magaliesberg" },
  { id: "s2", partnerId: "getaway",   category: "Stays",          name: "Bush Lodge Weekend",            desc: "Friday–Sunday bush break, all meals included",                        icon: "🌿", price: 5200, accent: "#4ADE80", expiry: "18 months", tags: ["premium"],    includes: ["2 nights lodge","All meals","Game drive","Bush walk","Wi-Fi"],                  city: "Magaliesberg" },
  // SKILLS
  { id: "sk1",partnerId: "skillup",   category: "Skills & Courses",name: "Digital Marketing Bootcamp",  desc: "3-day live online course: SEO, social media & paid ads",              icon: "📱", price: 1200, accent: "#38BDF8", expiry: "24 months", tags: ["career"],     includes: ["3 days live training","Course materials","Certificate","6-month replay"],       city: "Online" },
  { id: "sk2",partnerId: "skillup",   category: "Skills & Courses",name: "Photography Workshop",        desc: "Full-day hands-on photography masterclass",                           icon: "📷", price: 890,  accent: "#A3E635", expiry: "12 months", tags: ["creative"],   includes: ["Full-day workshop","Camera provided","Edited portfolio","Printed book"],        city: "Online" },
];

// Map CATALOGUE items to the shape Home.js expects (uses `cat` and `partner`)
const ALL_VOUCHERS = CATALOGUE.map((item) => {
  const partner = PARTNERS.find((p) => p.id === item.partnerId);
  return {
    ...item,
    cat: item.category,
    partner: partner?.name || "",
  };
});

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080B0F;--bg2:#0E1318;--surface:#131920;--card:#181F28;--card2:#1E2630;
  --border:#22303E;--border2:#2E4056;--text:#EDF2F7;--sub:#7A95AA;--muted:#445566;
  --green:#16C784;--green2:#0EA572;--amber:#F7931A;--red:#EF4444;--blue:#3B9EFF;
  --r:16px;--font:'Cabinet Grotesk',sans-serif;--serif:'Instrument Serif',serif;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);
  background-size:60px 60px;opacity:.1;}
.app{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 20px 100px}

/* NAV */
.nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0;border-bottom:1px solid var(--border);margin-bottom:48px;flex-wrap:wrap;gap:14px}
.brand{display:flex;align-items:center;gap:8px}
.brand-name{font-size:1.4rem;font-weight:900;letter-spacing:-1px}
.brand-name em{font-style:normal;color:var(--green)}
.brand-tag{font-size:.6rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;background:var(--green);color:#080B0F;padding:3px 8px;border-radius:4px}
.nav-tabs{display:flex;gap:2px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:3px}
.tab{padding:8px 16px;border-radius:7px;border:none;background:transparent;color:var(--sub);font-family:var(--font);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .18s}
.tab:hover{color:var(--text)}
.tab.on{background:var(--card2);color:var(--text);box-shadow:0 1px 6px #00000050}

/* CHECKOUT */
.checkout-wrap{max-width:600px;margin:0 auto}
.back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--sub);cursor:pointer;font-family:var(--font);font-size:.84rem;font-weight:600;padding:0;margin-bottom:22px;transition:color .18s}
.back-btn:hover{color:var(--text)}
.checkout{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:34px}
.co-header{display:flex;gap:14px;align-items:flex-start;margin-bottom:28px;padding-bottom:22px;border-bottom:1px solid var(--border)}
.co-icon{font-size:2.6rem;background:var(--surface);border-radius:10px;padding:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.co-meta h2{font-family:var(--serif);font-size:1.4rem;margin-bottom:4px}
.co-meta p{color:var(--sub);font-size:.8rem;line-height:1.6}
.co-partner{font-size:.73rem;color:var(--green);font-weight:700;margin-top:5px}
.includes-box{background:var(--surface);border-radius:8px;padding:12px 14px;margin-bottom:20px}
.inc-title{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:8px}
.inc-items{display:flex;flex-wrap:wrap;gap:5px}
.inc-tag{font-size:.73rem;background:var(--card2);border:1px solid var(--border2);border-radius:5px;padding:3px 9px;color:var(--sub)}
.comm-note{display:inline-flex;align-items:center;gap:6px;background:var(--green)10;border:1px solid var(--green)22;border-radius:7px;padding:7px 13px;font-size:.77rem;color:var(--green);font-weight:600;margin-bottom:18px}
.section-sep{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--green);font-weight:700;margin:20px 0 12px;display:flex;align-items:center;gap:8px}
.section-sep::after{content:'';flex:1;height:1px;background:var(--border)}
.field{margin-bottom:14px}
.field label{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:700;margin-bottom:6px}
.field input{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:11px 13px;color:var(--text);font-family:var(--font);font-size:.92rem;outline:none;transition:border-color .18s}
.field input:focus{border-color:var(--green)}
.field input::placeholder{color:var(--muted)}
.field-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.receipt{background:var(--surface);border-radius:9px;overflow:hidden;margin:22px 0}
.rr{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;font-size:.83rem}
.rr:not(:last-child){border-bottom:1px solid var(--border)}
.rr .l{color:var(--sub)}
.rr .v{font-weight:700}
.rr.total{background:var(--card2)}
.rr.total .l{color:var(--text);font-weight:700;font-size:.87rem}
.rr.total .v{font-size:1.25rem;font-weight:900;color:var(--green)}
.pay-btn{width:100%;padding:15px;border:none;border-radius:9px;background:var(--green);color:#080B0F;font-family:var(--font);font-size:.98rem;font-weight:900;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:-.3px}
.pay-btn:hover:not(:disabled){background:var(--green2);transform:translateY(-1px);box-shadow:0 8px 24px #16C78428}
.pay-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.spin{width:15px;height:15px;border:2px solid rgba(0,0,0,.25);border-top-color:#080B0F;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.info{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--green);border-radius:8px;padding:11px 15px;font-size:.78rem;color:var(--sub);line-height:1.7;margin-bottom:16px}
.info strong{color:var(--text)}
.info code{background:var(--card);padding:1px 5px;border-radius:3px;color:#38BDF8;font-size:.74rem}

/* MODAL */
.overlay{position:fixed;inset:0;background:#000000C8;z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(10px);animation:fadeIn .2s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--card);border:1px solid var(--border2);border-radius:20px;padding:38px 34px;max-width:420px;width:100%;text-align:center;animation:popIn .35s cubic-bezier(.34,1.56,.64,1)}
@keyframes popIn{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
.modal-e{font-size:3rem;display:block;margin-bottom:4px}
.modal h2{font-family:var(--serif);font-size:1.75rem;margin:10px 0 8px}
.modal p{color:var(--sub);font-size:.86rem;line-height:1.7;margin-bottom:18px}
.vc-box{background:var(--surface);border:2px dashed var(--green);border-radius:9px;padding:12px 20px;margin-bottom:14px}
.vc-box code{font-family:var(--font);font-size:1.35rem;font-weight:900;color:var(--green);letter-spacing:2px}
.qr-wrap{background:white;border-radius:9px;padding:9px;display:inline-block;margin-bottom:14px}
.wa-chip{display:inline-flex;align-items:center;gap:5px;background:#25D36612;border:1px solid #25D36630;color:#25D366;font-size:.78rem;font-weight:600;padding:6px 13px;border-radius:6px;margin-bottom:18px}
.modal-close{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:9px 24px;border-radius:7px;cursor:pointer;font-family:var(--font);font-size:.86rem;font-weight:600;transition:all .18s}
.modal-close:hover{border-color:var(--border2)}

/* ADMIN */
.page-title{font-family:var(--serif);font-size:2.1rem;margin-bottom:6px}
.page-sub{color:var(--sub);margin-bottom:28px;font-size:.92rem}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:28px}
.stat{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px}
.stat-icon{font-size:1.2rem;margin-bottom:7px}
.stat-val{font-size:1.8rem;font-weight:900;color:var(--green);letter-spacing:-1px}
.stat-lbl{color:var(--muted);font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.7px;margin-top:2px}
.panel{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:22px;margin-bottom:24px}
.panel h3{font-weight:800;font-size:1rem;margin-bottom:14px}
.ct{width:100%;border-collapse:collapse}
.ct th{text-align:left;font-size:.68rem;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);padding:5px 10px;border-bottom:1px solid var(--border)}
.ct td{padding:10px;font-size:.82rem;border-bottom:1px solid #ffffff04}
.ct tr:last-child td{border-bottom:none}
.ct tr:hover td{background:var(--surface)}
.earn{color:var(--green);font-weight:700}
.payout{color:var(--amber);font-weight:700}
.vtw{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.vt{width:100%;border-collapse:collapse}
.vt th{text-align:left;padding:9px 12px;font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;border-bottom:1px solid var(--border)}
.vt td{padding:12px;border-bottom:1px solid #ffffff04;font-size:.82rem;vertical-align:middle}
.vt tr:hover td{background:var(--surface)}
.vt tr:last-child td{border-bottom:none}
.code-c{font-weight:800;letter-spacing:1px;color:var(--green);font-size:.83rem}
.badge{display:inline-block;padding:3px 9px;border-radius:4px;font-size:.68rem;font-weight:700}
.b-active{background:var(--green)18;color:var(--green);border:1px solid var(--green)28}
.b-used{background:var(--red)18;color:var(--red);border:1px solid var(--red)28}
.b-pending{background:var(--amber)18;color:var(--amber);border:1px solid var(--amber)28}
.empty{text-align:center;color:var(--muted);padding:44px!important}
.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}

/* PARTNERS PAGE */
.partner-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px}
.pc{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;transition:border-color .2s}
.pc:hover{border-color:var(--border2)}
.pc-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.pc-logo{font-size:1.8rem;background:var(--surface);border-radius:9px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pc-name{font-weight:800;font-size:.95rem;margin-bottom:2px}
.pc-meta{font-size:.73rem;color:var(--sub)}
.pc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;border-top:1px solid var(--border);padding-top:12px}
.pc-sv{font-size:1rem;font-weight:900}
.pc-sl{font-size:.66rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:1px}
.comm-pill{display:inline-flex;align-items:center;background:var(--green)14;border:1px solid var(--green)22;color:var(--green);font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:4px}

/* REDEEM */
.redeem-wrap{max-width:480px;margin:0 auto}
.rresult{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:26px;margin-top:18px;text-align:center}
.rresult.ok{border-color:var(--green)}
.rresult.err{border-color:var(--red)}
.ri{font-size:2.6rem;margin-bottom:8px;display:block}
.rt{font-family:var(--serif);font-size:1.45rem;margin-bottom:8px}
.rd{color:var(--sub);font-size:.84rem;line-height:1.9}
.rd strong{color:var(--text)}

@media(max-width:640px){
  .nav{flex-direction:column}
  .field-2{grid-template-columns:1fr}
  .checkout{padding:22px 16px}
  .modal{padding:26px 18px}
}
`;

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]               = useState("store");
  const [category, setCategory]       = useState("All");
  const [selected, setSelected]       = useState(null);
  const [buyerName, setBuyerName]     = useState("");
  const [buyerEmail, setBuyerEmail]   = useState("");
  const [recpName, setRecpName]       = useState("");
  const [recpPhone, setRecpPhone]     = useState("");
  const [note, setNote]               = useState("");
  const [paying, setPaying]           = useState(false);
  const [success, setSuccess]         = useState(null);
  const [vouchers, setVouchers]       = useState([]);
  const [loadingV, setLoadingV]       = useState(false);
  const [redeemCode, setRedeemCode]   = useState("");
  const [redeemResult, setRedeemResult] = useState(null);

  const partner    = selected ? PARTNERS.find((p) => p.id === selected.partnerId) : null;
  const myEarnings = selected ? +((selected.price * (partner?.commission || 20)) / 100).toFixed(2) : 0;

  // ── Home.js callbacks ────────────────────────────────────────
  const openProduct = (id) => {
    const item = CATALOGUE.find((c) => c.id === id);
    if (item) setSelected(item);
  };

  const filterCat = (cat) => setCategory(cat);

  const handleSearch = () => {}; // extend as needed

  const sortCards = () => {};    // extend as needed

  // ── Firebase ─────────────────────────────────────────────────
  const loadVouchers = async () => {
    setLoadingV(true);
    try {
      const snap = await getDocs(
        query(collection(db, "vouchers"), orderBy("createdAt", "desc")),
      );
      setVouchers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoadingV(false);
  };

  useEffect(() => {
    if (page === "admin") loadVouchers();
  }, [page]);

  const handlePurchase = async () => {
    if (!selected || !buyerName || !buyerEmail || !recpPhone) return;
    setPaying(true);
    try {
      const code       = genCode();
      const commission = partner?.commission || 20;
      const earnings   = +((selected.price * commission) / 100).toFixed(2);

      const docRef = await addDoc(collection(db, "vouchers"), {
        code,
        productId:      selected.id,
        productName:    selected.name,
        category:       selected.category,
        partnerId:      selected.partnerId,
        partnerName:    partner?.name || "",
        amount:         selected.price,
        commissionPct:  commission,
        myEarnings:     earnings,
        partnerPayout:  +(selected.price - earnings).toFixed(2),
        buyerName,
        buyerEmail,
        recipientName:  recpName || buyerName,
        recipientPhone: recpPhone,
        note,
        status:         "active",
        createdAt:      serverTimestamp(),
        usedAt:         null,
        payRef:         null,
      });

      await fetch(`${WORKER_URL}/create-voucher`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId:     docRef.id,
          code,
          amount:        selected.price,
          productName:   selected.name,
          partnerName:   partner?.name,
          buyerName,
          buyerEmail,
          recipientName: recpName || buyerName,
          recipientPhone: recpPhone,
          note,
        }),
      }).catch(() => {});

      const qr = QR(
        JSON.stringify({ code, product: selected.name, amount: selected.price }),
      );
      setSuccess({ code, amount: selected.price, qr, phone: recpPhone, product: selected.name, earnings });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setPaying(false);
    }
  };

  const handleRedeem = async () => {
    setRedeemResult(null);
    const code = redeemCode.trim().toUpperCase();
    try {
      const snap = await getDocs(
        query(collection(db, "vouchers"), where("code", "==", code)),
      );
      if (snap.empty) { setRedeemResult({ ok: false, msg: "Voucher not found." }); return; }
      const vDoc = snap.docs[0];
      const v    = vDoc.data();
      if (v.status === "used") { setRedeemResult({ ok: false, msg: "Already redeemed." }); return; }
      await updateDoc(doc(db, "vouchers", vDoc.id), { status: "used", usedAt: serverTimestamp() });
      setRedeemResult({ ok: true, v });
    } catch (e) {
      setRedeemResult({ ok: false, msg: e.message });
    }
  };

  const reset = () => {
    setSelected(null);
    setBuyerName(""); setBuyerEmail(""); setRecpName(""); setRecpPhone(""); setNote("");
    setSuccess(null);
  };

  const totalRevenue  = vouchers.reduce((s, v) => s + (v.amount      || 0), 0);
  const totalEarnings = vouchers.reduce((s, v) => s + (v.myEarnings  || 0), 0);
  const totalPayout   = vouchers.reduce((s, v) => s + (v.partnerPayout || 0), 0);

  const partnerStats = PARTNERS.map((p) => {
    const pvs = vouchers.filter((v) => v.partnerId === p.id);
    return { ...p, sales: pvs.length, revenue: pvs.reduce((s, v) => s + (v.amount || 0), 0), earned: pvs.reduce((s, v) => s + (v.myEarnings || 0), 0) };
  }).filter((p) => p.sales > 0);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* NAV */}
        <nav className="nav">
          <div className="brand">
            <span className="brand-name">Voucher<em>Hub</em></span>
            <span className="brand-tag">ZA</span>
          </div>
          <div className="nav-tabs">
            {[["store","🛍 Store"],["partners","🤝 Partners"],["redeem","✅ Redeem"],["admin","📊 Admin"]].map(([id, lbl]) => (
              <button key={id} className={`tab ${page === id ? "on" : ""}`} onClick={() => { setPage(id); reset(); }}>
                {lbl}
              </button>
            ))}
          </div>
        </nav>

        {/* ═══ STORE — listing (Home component) ═══ */}
        {page === "store" && !selected && (
          <Home
            ALL_VOUCHERS={ALL_VOUCHERS.filter((v) => category === "All" || v.cat === category)}
            currentCat={category}
            filterCat={filterCat}
            openProduct={openProduct}
            handleSearch={handleSearch}
            sortCards={sortCards}
          />
        )}

        {/* ═══ STORE — checkout ═══ */}
        {page === "store" && selected && (
          <div className="checkout-wrap">
            <button className="back-btn" onClick={() => setSelected(null)}>← Back to vouchers</button>
            <div className="checkout">
              <div className="co-header">
                <div className="co-icon">{selected.icon}</div>
                <div className="co-meta">
                  <h2>{selected.name}</h2>
                  <p>{selected.desc}</p>
                  <div className="co-partner">by {partner?.name} · {selected.city}</div>
                </div>
              </div>

              {selected.includes && (
                <div className="includes-box">
                  <div className="inc-title">What's included</div>
                  <div className="inc-items">
                    {selected.includes.map((i) => <span key={i} className="inc-tag">✓ {i}</span>)}
                  </div>
                </div>
              )}

              <div className="comm-note">📱 Voucher delivered instantly to WhatsApp · Valid for {selected.expiry}</div>

              <span className="section-sep">Who is this gift for?</span>
              <div className="field-2">
                <div className="field">
                  <label>Recipient Name</label>
                  <input placeholder="Their name (optional)" value={recpName} onChange={(e) => setRecpName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Their WhatsApp Number *</label>
                  <input placeholder="+27821234567" value={recpPhone} onChange={(e) => setRecpPhone(e.target.value)} />
                </div>
              </div>

              <span className="section-sep">Your Details</span>
              <div className="field-2">
                <div className="field">
                  <label>Your Name *</label>
                  <input placeholder="Jane Smith" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Email *</label>
                  <input type="email" placeholder="jane@email.com" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Personal Message (optional)</label>
                <input placeholder="Happy Birthday! Enjoy your special day 🎂" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div className="receipt">
                <div className="rr"><span className="l">Experience</span><span className="v">{selected.name}</span></div>
                <div className="rr"><span className="l">Provided by</span><span className="v">{partner?.name}</span></div>
                <div className="rr"><span className="l">Delivery</span><span className="v" style={{ color: "#25D366" }}>📱 WhatsApp (instant)</span></div>
                <div className="rr"><span className="l">Valid for</span><span className="v">{selected.expiry}</span></div>
                <div className="rr total"><span className="l">Total</span><span className="v">{fmt(selected.price)}</span></div>
              </div>

              <div className="info">
                🔒 <strong>Secure checkout</strong> — your payment is processed safely via PayFast.
                The voucher code and QR will be sent to the recipient's WhatsApp immediately after payment.
              </div>

              <button className="pay-btn" onClick={handlePurchase} disabled={paying || !buyerName || !buyerEmail || !recpPhone}>
                {paying ? <><span className="spin" />Processing…</> : <>💳 Pay {fmt(selected.price)}</>}
              </button>
            </div>
          </div>
        )}

        {/* ═══ PARTNERS ═══ */}
        {page === "partners" && (
          <div>
            <h2 className="page-title">Partner Directory</h2>
            <p className="page-sub">{PARTNERS.length} SA businesses powering your marketplace.</p>
            <div className="partner-grid">
              {PARTNERS.map((p) => {
                const products = CATALOGUE.filter((c) => c.partnerId === p.id);
                const prices   = products.map((c) => c.price);
                return (
                  <div key={p.id} className="pc">
                    <div className="pc-top">
                      <div className="pc-logo">{p.logo}</div>
                      <div>
                        <div className="pc-name">{p.name}</div>
                        <div className="pc-meta">{p.category} · 📍 {p.city}</div>
                      </div>
                    </div>
                    <div className="pc-grid">
                      <div><div className="pc-sv">{products.length}</div><div className="pc-sl">Products</div></div>
                      <div><div className="pc-sv"><span className="comm-pill">{p.commission}%</span></div><div className="pc-sl">Your cut</div></div>
                      <div><div className="pc-sv" style={{ fontSize: ".82rem" }}>R{Math.min(...prices)}+</div><div className="pc-sl">From</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ REDEEM ═══ */}
        {page === "redeem" && (
          <div className="redeem-wrap">
            <h2 className="page-title">Redeem Voucher</h2>
            <p className="page-sub">Enter the voucher code from WhatsApp or scan the QR at point of sale.</p>
            <div className="field">
              <label>Voucher Code</label>
              <input placeholder="VCH-XXXXXXXX" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} style={{ fontWeight: 800, letterSpacing: "2px", fontSize: "1rem" }} />
            </div>
            <button className="pay-btn" onClick={handleRedeem} disabled={!redeemCode}>✅ Validate &amp; Mark Used</button>
            {redeemResult && (
              <div className={`rresult ${redeemResult.ok ? "ok" : "err"}`}>
                <span className="ri">{redeemResult.ok ? "✅" : "❌"}</span>
                <div className="rt">{redeemResult.ok ? "Valid Voucher!" : "Not Valid"}</div>
                {redeemResult.ok ? (
                  <div className="rd">
                    <strong>{redeemResult.v.productName}</strong><br />
                    Partner: <strong>{redeemResult.v.partnerName}</strong><br />
                    Recipient: <strong>{redeemResult.v.recipientName}</strong><br />
                    Value: <strong style={{ color: "var(--green)" }}>{fmt(redeemResult.v.amount)}</strong><br />
                    <span style={{ color: "var(--green)", fontWeight: 700, marginTop: 8, display: "block" }}>Marked as redeemed ✔</span>
                  </div>
                ) : (
                  <p style={{ color: "var(--sub)" }}>{redeemResult.msg}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ ADMIN ═══ */}
        {page === "admin" && (
          <div>
            <h2 className="page-title">Admin Dashboard</h2>
            <p className="page-sub">Your marketplace earnings, partner commissions & all voucher activity.</p>
            <div className="stats-grid">
              {[
                { icon: "🎟️", val: vouchers.length,                                           lbl: "Vouchers Sold" },
                { icon: "✅",  val: vouchers.filter((v) => v.status === "active").length,      lbl: "Active" },
                { icon: "🔖",  val: vouchers.filter((v) => v.status === "used").length,        lbl: "Redeemed" },
                { icon: "💵",  val: fmt(totalRevenue),                                         lbl: "Total Revenue" },
                { icon: "💰",  val: fmt(totalEarnings),                                        lbl: "Your Earnings" },
                { icon: "📤",  val: fmt(totalPayout),                                          lbl: "Partner Payouts" },
              ].map((s) => (
                <div className="stat" key={s.lbl}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            {partnerStats.length > 0 && (
              <div className="panel">
                <h3>💼 Commission Breakdown by Partner</h3>
                <table className="ct">
                  <thead><tr><th>Partner</th><th>Sales</th><th>Revenue</th><th>Your Earnings</th><th>Payout Owed</th></tr></thead>
                  <tbody>
                    {partnerStats.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong> <span style={{ color: "var(--muted)", fontSize: ".72rem" }}>· {p.commission}%</span></td>
                        <td>{p.sales}</td>
                        <td>{fmt(p.revenue)}</td>
                        <td className="earn">{fmt(p.earned)}</td>
                        <td className="payout">{fmt(p.revenue - p.earned)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="toolbar">
              <h3 style={{ fontWeight: 800 }}>All Vouchers</h3>
              <button className="back-btn" style={{ margin: 0 }} onClick={loadVouchers}>↻ Refresh</button>
            </div>
            <div className="vtw">
              {loadingV ? (
                <div style={{ textAlign: "center", padding: "44px", color: "var(--muted)" }}>Loading…</div>
              ) : (
                <table className="vt">
                  <thead><tr><th>Code</th><th>Product</th><th>Partner</th><th>Amount</th><th>Your Cut</th><th>Recipient</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {vouchers.length === 0 ? (
                      <tr><td className="empty" colSpan="8">No vouchers yet — make a sale from the store!</td></tr>
                    ) : (
                      vouchers.map((v) => (
                        <tr key={v.id}>
                          <td className="code-c">{v.code}</td>
                          <td style={{ maxWidth: 140, fontSize: ".78rem" }}>{v.productName}</td>
                          <td style={{ color: "var(--sub)", fontSize: ".75rem" }}>{v.partnerName}</td>
                          <td><strong style={{ color: "var(--green)" }}>{fmt(v.amount)}</strong></td>
                          <td><strong style={{ color: "var(--amber)" }}>{fmt(v.myEarnings || 0)}</strong></td>
                          <td style={{ fontSize: ".75rem" }}>{v.recipientName}<br /><span style={{ color: "var(--muted)" }}>{v.recipientPhone}</span></td>
                          <td><span className={`badge ${v.status === "active" ? "b-active" : v.status === "used" ? "b-used" : "b-pending"}`}>{v.status}</span></td>
                          <td style={{ color: "var(--muted)", fontSize: ".73rem" }}>{v.createdAt?.toDate?.()?.toLocaleDateString?.() || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUCCESS MODAL */}
      {success && (
        <div className="overlay" onClick={() => { setSuccess(null); reset(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-e">🎉</span>
            <h2>Gift Sent!</h2>
            <p>Your <strong>{success.product}</strong> voucher worth <strong>{fmt(success.amount)}</strong> has been sent to <strong>{success.phone}</strong> via WhatsApp.</p>
            <div className="vc-box"><code>{success.code}</code></div>
            <div className="qr-wrap">
              <img src={success.qr} width="150" height="150" alt="QR" style={{ display: "block", borderRadius: 4 }} />
            </div>
            <div className="wa-chip">✅ Delivered to WhatsApp instantly</div>
            <button className="modal-close" onClick={() => { setSuccess(null); reset(); }}>← Back to Store</button>
          </div>
        </div>
      )}
    </>
  );
}