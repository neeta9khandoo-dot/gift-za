import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

const genCode = () =>
  "VCH-" +
  [...Array(8)]
    .map(
      () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
    )
    .join("");

const VOUCHER_TEMPLATES = [
  {
    name: "60-Min Full Body Massage",
    category: "Wellness & Spa",
    price: 550,
    validMonths: 12,
    icon: "massage",
    desc: "Swedish, deep tissue or aromatherapy of choice",
  },
  {
    name: "Couples Spa Day",
    category: "Wellness & Spa",
    price: 1800,
    validMonths: 12,
    icon: "couples_spa",
    desc: "Side-by-side treatments, sparkling wine & lunch",
  },
  {
    name: "Hot Stone Therapy",
    category: "Wellness & Spa",
    price: 750,
    validMonths: 12,
    icon: "hot_stone",
    desc: "90-min volcanic hot stone full-body treatment",
  },
  {
    name: "Luxury Pamper Package",
    category: "Hair & Beauty",
    price: 480,
    validMonths: 6,
    icon: "pamper",
    desc: "Gel mani, spa pedi & eyebrow shaping",
  },
  {
    name: "Bridal Glow Package",
    category: "Hair & Beauty",
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
  {
    name: "Sunday Lunch for Two — Kwa Terry",
    category: "Traditional Restaurants",
    price: 420,
    validMonths: 12,
    icon: "kwa_terry",
    desc: "A proper Zimbabwean Sunday lunch for two at Kwa Terry.",
  },
  {
    name: "Family Feast — Kwa Terry (4 People)",
    category: "Traditional Restaurants",
    price: 980,
    validMonths: 12,
    icon: "kwa_terry_family",
    desc: "Treat the whole family to a hearty traditional feast at Kwa Terry.",
  },
  {
    name: "Feli Nandi's — Lunch for Two",
    category: "Traditional Restaurants",
    price: 380,
    validMonths: 12,
    icon: "feli_nandi",
    desc: "A sit-down traditional lunch at Feli Nandi's.",
  },
  {
    name: "Feli Nandi's — Mother's Special Treat",
    category: "Traditional Restaurants",
    price: 650,
    validMonths: 12,
    icon: "feli_nandi_mum",
    desc: "The ultimate long-distance gift for mum.",
  },
  {
    name: "Roadrunner Chicken Braai Lunch",
    category: "Traditional Restaurants",
    price: 320,
    validMonths: 6,
    icon: "roadrunner",
    desc: "Free-range road runner chicken braaied over open fire.",
  },
  {
    name: "Sadza & Dovi Dinner for Two",
    category: "Traditional Restaurants",
    price: 350,
    validMonths: 6,
    icon: "sadza_dovi",
    desc: "A comforting evening meal of sadza with peanut butter stew.",
  },
  {
    name: "Traditional Breakfast Spread",
    category: "Traditional Restaurants",
    price: 240,
    validMonths: 6,
    icon: "trad_breakfast",
    desc: "Start the day the Zimbabwean way.",
  },
  {
    name: "Whole Family Sunday Roast (Up to 6)",
    category: "Traditional Restaurants",
    price: 1450,
    validMonths: 12,
    icon: "family_roast",
    desc: "A full Sunday roast for up to 6 family members.",
  },
  {
    name: "Braai Masterclass",
    category: "Dining & Wine",
    price: 695,
    validMonths: 12,
    icon: "braai",
    desc: "Learn to braai like a pro — fire, meat & stories",
  },
  {
    name: "Shona Language Basics — 4 Session Bundle",
    category: "Skills & Courses",
    price: 850,
    validMonths: 12,
    icon: "shona_language",
    desc: "Four 1-hour beginner Shona lessons with a native speaker.",
  },
  {
    name: "Zimbabwe Business Setup Consultation",
    category: "Skills & Courses",
    price: 1200,
    validMonths: 12,
    icon: "biz_setup",
    desc: "A 90-minute 1-on-1 session with a local business consultant.",
  },
  {
    name: "Expat Orientation Day",
    category: "Skills & Courses",
    price: 980,
    validMonths: 12,
    icon: "expat_orientation",
    desc: "A full guided half-day for new arrivals.",
  },
  {
    name: "Zimbabwe Driving & Road Rules Crash Course",
    category: "Skills & Courses",
    price: 650,
    validMonths: 6,
    icon: "driving_lesson",
    desc: "A 2-hour practical session for foreigners.",
  },
  {
    name: "Shona Stone Sculpture Workshop",
    category: "Skills & Courses",
    price: 750,
    validMonths: 12,
    icon: "sculpture_workshop",
    desc: "A hands-on 3-hour sculpting session.",
  },
  {
    name: "Traditional Cooking Masterclass",
    category: "Skills & Courses",
    price: 680,
    validMonths: 12,
    icon: "cooking_class",
    desc: "Learn to cook sadza, dovi, muriwo and roasted groundnuts.",
  },
  {
    name: "Mbira Music Introduction — 3 Lessons",
    category: "Skills & Courses",
    price: 720,
    validMonths: 12,
    icon: "mbira_lessons",
    desc: "Three 45-minute beginner lessons on the mbira.",
  },
  {
    name: "Wildlife & Bush Photography Workshop",
    category: "Skills & Courses",
    price: 1450,
    validMonths: 18,
    icon: "bush_photography",
    desc: "A full-day practical photography workshop in the bush.",
  },
  {
    name: "Ecocash & Mobile Money for Expats",
    category: "Skills & Courses",
    price: 350,
    validMonths: 6,
    icon: "mobile_money",
    desc: "A 1-hour practical session covering Ecocash and mobile banking.",
  },
  {
    name: "Zimbabwe Labour Law for Foreign Employers",
    category: "Skills & Courses",
    price: 1650,
    validMonths: 12,
    icon: "labour_law",
    desc: "A 2-hour briefing with an HR specialist.",
  },
  {
    name: "Solar & Off-Grid Living Workshop",
    category: "Skills & Courses",
    price: 890,
    validMonths: 12,
    icon: "solar_workshop",
    desc: "Learn how to set up and manage solar power.",
  },
  {
    name: "Batik & Textile Art Class",
    category: "Skills & Courses",
    price: 580,
    validMonths: 12,
    icon: "batik_class",
    desc: "A 3-hour hands-on batik and fabric dyeing workshop.",
  },
  {
    name: "Birthday Bloom Bouquet",
    category: "Florists",
    price: 350,
    validMonths: 6,
    icon: "bouquet",
    desc: "A hand-arranged seasonal bouquet perfect for birthdays.",
  },
  {
    name: "Luxury Rose Arrangement",
    category: "Florists",
    price: 680,
    validMonths: 6,
    icon: "roses",
    desc: "Premium long-stem roses arranged by a master florist.",
  },
  {
    name: "Weekly Flower Subscription",
    category: "Florists",
    price: 1200,
    validMonths: 3,
    icon: "subscription",
    desc: "4 weeks of fresh seasonal flower deliveries.",
  },
  {
    name: "Wedding Centrepiece Voucher",
    category: "Florists",
    price: 2500,
    validMonths: 12,
    icon: "wedding_flowers",
    desc: "One full table centrepiece arrangement.",
  },
  {
    name: "Surprise Me Seasonal Bouquet",
    category: "Florists",
    price: 450,
    validMonths: 6,
    icon: "surprise_bouquet",
    desc: "Let the florist work their magic.",
  },
  {
    name: "Corporate Office Flowers",
    category: "Florists",
    price: 1800,
    validMonths: 12,
    icon: "corporate_flowers",
    desc: "Monthly fresh flower arrangement for reception or boardroom.",
  },
  {
    name: "Live Jazz Evening for Two",
    category: "Music",
    price: 780,
    validMonths: 12,
    icon: "jazz",
    desc: "Two tickets to an intimate live jazz performance.",
  },
  {
    name: "Private Guitar Lesson Bundle",
    category: "Music",
    price: 650,
    validMonths: 12,
    icon: "guitar",
    desc: "4 x 45-minute private guitar lessons.",
  },
  {
    name: "Studio Recording Session",
    category: "Music",
    price: 1200,
    validMonths: 12,
    icon: "studio",
    desc: "3-hour professional studio recording session.",
  },
  {
    name: "Concert Ticket Voucher",
    category: "Music",
    price: 450,
    validMonths: 6,
    icon: "concert",
    desc: "Redeemable against any single concert ticket.",
  },
  {
    name: "DJ Workshop — Beginner",
    category: "Music",
    price: 990,
    validMonths: 12,
    icon: "dj",
    desc: "Full-day intro to DJing.",
  },
  {
    name: "Corporate Function Package",
    category: "Events",
    price: 4500,
    validMonths: 12,
    icon: "corporate",
    desc: "Half-day venue hire for up to 30 guests.",
  },
  {
    name: "Birthday Celebration Bundle",
    category: "Events",
    price: 1850,
    validMonths: 12,
    icon: "birthday",
    desc: "Private venue styling and décor package.",
  },
  {
    name: "Kids Party Experience",
    category: "Events",
    price: 1200,
    validMonths: 6,
    icon: "kids_party",
    desc: "2-hour fully-hosted kids party.",
  },
  {
    name: "Wedding Anniversary Dinner",
    category: "Events",
    price: 2200,
    validMonths: 12,
    icon: "anniversary",
    desc: "Private 5-course dinner for two.",
  },
  {
    name: "Festival General Access Pass",
    category: "Events",
    price: 580,
    validMonths: 6,
    icon: "festival",
    desc: "One general-access pass redeemable at any participating festival.",
  },
  {
    name: "Ancient City Lodge — 1 Night Stay",
    category: "Stays",
    price: 2800,
    validMonths: 12,
    icon: "ancient_city",
    desc: "One night for two at Ancient City Lodge, Masvingo.",
  },
  {
    name: "Great Zimbabwe Ruins Weekend",
    category: "Stays",
    price: 5200,
    validMonths: 12,
    icon: "great_zim_weekend",
    desc: "Two nights for two at Ancient City Lodge.",
  },
  {
    name: "Masvingo Heritage Escape",
    category: "Stays",
    price: 3600,
    validMonths: 12,
    icon: "masvingo_escape",
    desc: "One night bed & breakfast plus a private guided tour.",
  },
];

// The single source of truth for categories, site-wide: this is the exact
// same list and order shown in the buyer-facing Category dropdown on
// Afrivoucher.com. Keep this list in sync if that dropdown ever changes —
// everything else (partner sign-up, voucher templates, allocation) reads
// from this one array.
const CATEGORIES = [
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
];

async function seedUserVouchers(db, uid, businessName, email, templates) {
  const userVouchersRef = collection(db, "users", uid, "vouchers");
  const batch = writeBatch(db);
  templates.forEach((tpl) => {
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

// ─── AuthPage ─────────────────────────────────────────────────────────────
// Props:
//   firebaseApp  — initialised Firebase app instance
//   onSuccess    — callback fired after successful login or registration
export default function AuthPage({ firebaseApp, onSuccess }) {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    business: "",
    category: "",
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
      onSuccess?.();
    } catch (e) {
      setLoginError(
        [
          "auth/user-not-found",
          "auth/wrong-password",
          "auth/invalid-credential",
        ].includes(e.code)
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
    if (!regForm.category) {
      setRegError("Please choose the category your business belongs to.");
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

      // Only load the templates that match the category the partner picked.
      const templates = VOUCHER_TEMPLATES.filter(
        (t) => t.category === regForm.category,
      );

      await setDoc(doc(db, "users", uid), {
        uid,
        businessName: regForm.business,
        category: regForm.category,
        email: regForm.email,
        role: "partner",
        status: "active",
        voucherCount: templates.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await seedUserVouchers(
        db,
        uid,
        regForm.business,
        regForm.email,
        templates,
      );
      setRegMsg(
        `Account created! ${templates.length} ${regForm.category} voucher${templates.length === 1 ? "" : "s"} loaded for ${regForm.business} 🎉`,
      );
      setTimeout(() => onSuccess?.(), 1800);
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

        {/* ── Login ── */}
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

        {/* ── Register ── */}
        {!showReset && tab === "register" && (
          <>
            <div className="auth-field">
              <label>Business Name</label>
              <input
                type="text"
                value={regForm.business}
                onChange={setR("business")}
                placeholder="Relax Zone Spa"
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>

            <div className="auth-field">
              <label>Category</label>
              <select
                value={regForm.category}
                onChange={setR("category")}
                className="auth-select"
              >
                <option value="" disabled>
                  Choose your business category
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {regForm.category && (
                <p
                  style={{
                    fontSize: ".76rem",
                    color: "var(--sub)",
                    marginTop: 6,
                  }}
                >
                  {
                    VOUCHER_TEMPLATES.filter(
                      (t) => t.category === regForm.category,
                    ).length
                  }{" "}
                  {regForm.category} voucher template
                  {VOUCHER_TEMPLATES.filter(
                    (t) => t.category === regForm.category,
                  ).length === 1
                    ? ""
                    : "s"}{" "}
                  will be loaded to your account.
                </p>
              )}
            </div>

            {[
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

        {/* ── Password Reset ── */}
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
