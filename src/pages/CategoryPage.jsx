// src/pages/CategoryPage.jsx
// Standalone category listing page.
// Usage: import CategoryPage from "./pages/CategoryPage";
//        <CategoryPage cat={activeCat} vouchers={displayedVouchers}
//                      loading={loadingV} onBack={() => setActiveCat(null)} />

import React, { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────
const ZAR_TO_USD = 16.53;

const fmt = (n) =>
  `US$${(Number(n) / ZAR_TO_USD).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getCatIcon = (cat) =>
  ({
    Wellness:                  "🧖",
    Beauty:                    "💅",
    Adventure:                 "🪂",
    "Dining & Wine":           "🍷",
    "Traditional Restaurants": "🍲",
    Stays:                     "🏡",
    Skills:                    "📚",
    Music:                     "🎵",
    Events:                    "🎪",
    Florists:                  "🌸",
    Other:                     "🎁",
  })[cat] || "🎁";

const genCode = () =>
  "VCH-" +
  [...Array(8)]
    .map(() => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)])
    .join("");

const QR_URL = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1A2E1F&bgcolor=F5F0E8&data=${encodeURIComponent(data)}`;

// ─── Category metadata ────────────────────────────────────────────────────
const CAT_META = {
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
  Wellness: {
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
  Beauty: {
    icon: "💅",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
    color: "#2e1a22",
    tagline: "Because they deserve to feel gorgeous.",
    desc: "Gel manis, spa pedis, bridal packages and full glam treatments — from Zimbabwe's top beauty professionals.",
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
  Skills: {
    icon: "📚",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
    color: "#1a1f2e",
    tagline: "The gift of knowledge lasts a lifetime.",
    desc: "Language lessons, cooking masterclasses, sculpture workshops and more — hands-on experiences for the curious.",
  },
};

const DEFAULT_META = {
  icon: "🎁",
  img: "",
  color: "#1a2e1f",
  tagline: "Discover amazing experiences.",
  desc: "Browse our curated selection of vouchers.",
};

// ─── VoucherCard ──────────────────────────────────────────────────────────
function VoucherCard({ voucher, onOpen }) {
  const imgSrc = voucher.imageUrl || voucher.img;

  const catBg = {
    Wellness:                  "linear-gradient(145deg,#e8f5ee,#c8e8d8)",
    Adventure:                 "linear-gradient(145deg,#e0ecf8,#c0d8f0)",
    Music:                     "linear-gradient(145deg,#eeebf8,#d8d0f0)",
    Events:                    "linear-gradient(145deg,#f8e8f0,#f0c8dc)",
    Florists:                  "linear-gradient(145deg,#fdf0e8,#f8dcc8)",
    Beauty:                    "linear-gradient(145deg,#fce8f4,#f4c8e4)",
    "Dining & Wine":           "linear-gradient(145deg,#fdf4e0,#f8e4b8)",
    "Traditional Restaurants": "linear-gradient(145deg,#faf0e0,#f0d8a8)",
    Stays:                     "linear-gradient(145deg,#e8f4ec,#c8dcc8)",
    Skills:                    "linear-gradient(145deg,#e8f0fc,#c8d8f8)",
  };

  const catBadgeClass =
    voucher.cat === "Music"                     ? "cbadge cbadge-music"
    : voucher.cat === "Events"                  ? "cbadge cbadge-events"
    : voucher.cat === "Traditional Restaurants" ? "cbadge cbadge-trad"
    : voucher.cat === "Florists"                ? "cbadge cbadge-florist"
    : "cbadge cbadge-pop";

  return (
    <div className="card" onClick={() => onOpen(voucher)}>
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
        <div className="card-badge-row">
          <span className={catBadgeClass}>{voucher.cat}</span>
          {voucher.source === "firebase" && (
            <span className="cbadge cbadge-sale">Partner</span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="card-name">{voucher.name}</div>
        <div className="card-partner">📍 {voucher.partner} · {voucher.city}</div>
        <div className="card-footer">
          <div>
            <div className="card-price-val">
              <small>US$</small>
              {(Number(voucher.price) / ZAR_TO_USD).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {voucher.rating > 0 ? (
              <div className="card-rating">
                <span className="star">★</span> {voucher.rating}
              </div>
            ) : (
              <div style={{ fontSize: ".6rem", color: "var(--green)", fontWeight: 700, marginTop: 2 }}>
                New ✦
              </div>
            )}
          </div>
          <button
            className="card-add-btn"
            onClick={(e) => { e.stopPropagation(); onOpen(voucher); }}
            aria-label={`Buy ${voucher.name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skel-card skel-grid-card">
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

// ─── ProductModal ─────────────────────────────────────────────────────────
function ProductModal({ voucher: v, onClose, onBuy }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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
              style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 300, background: "var(--cream2)" }}
            />
            <div className="modal-gallery-badge">{(v.tags || [])[0] || v.cat}</div>
            <button className="modal-close" onClick={onClose}>✕</button>
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
                      <span className="mi-check">✓</span>{i}
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
            <button className="modal-buy-btn" onClick={onBuy}>🎁 Buy This Voucher</button>
            <button className="modal-secondary-btn" onClick={onClose}>← Back to browse</button>
            <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              {[
                "⏱️ Valid " + (v.expiry || "12 months"),
                "📱 WhatsApp delivery",
                "🔒 Secure checkout",
              ].map((m) => (
                <div key={m} style={{ fontSize: ".75rem", color: "var(--muted)" }}>{m}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CheckoutDrawer ───────────────────────────────────────────────────────
function CheckoutDrawer({ voucher: v, onClose, onSuccess }) {
  const [form, setForm] = useState({
    buyerName: "", buyerEmail: "", recipientPhone: "", recipientName: "", note: "",
  });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* Voucher summary */}
        <div style={{ margin: "20px 28px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", display: "flex" }}>
          <div style={{ width: 100, flexShrink: 0, background: "var(--cream2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
            {v.imageUrl
              ? <img src={v.imageUrl} alt={v.name} style={{ width: "100%", height: "100%", minHeight: 90, objectFit: "cover" }} />
              : getCatIcon(v.cat)
            }
          </div>
          <div style={{ padding: 14, flex: 1 }}>
            <div style={{ fontSize: ".95rem", fontWeight: 600, color: "var(--forest)", marginBottom: 3 }}>{v.name}</div>
            <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{v.partner} · {v.city}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--forest)", marginTop: 6 }}>{fmt(v.price)}</div>
          </div>
        </div>

        <div style={{ padding: "0 28px", flex: 1 }}>
          {[
            ["🎁 Recipient", [
              ["recipientName",  "Their Name",        "Optional",       false],
              ["recipientPhone", "WhatsApp Number *", "+27821234567",   true ],
            ]],
            ["👤 Your Details", [
              ["buyerName",  "Your Name *",  "Jane Smith",     true],
              ["buyerEmail", "Your Email *", "jane@email.com", true],
            ]],
          ].map(([label, fields]) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--terra)", marginBottom: 12 }}>
                {label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {fields.map(([key, lbl, ph]) => (
                  <div key={key} className="df-field">
                    <label>{lbl}</label>
                    <input value={form[key]} onChange={set(key)} placeholder={ph} type={key === "buyerEmail" ? "email" : "text"} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--terra)", marginBottom: 12 }}>
              ✉️ Personal Note
            </div>
            <div className="df-field">
              <textarea value={form.note} onChange={set("note")} placeholder="Happy Birthday! Hope you enjoy this special experience 🎂" />
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 28px 28px", borderTop: "1px solid var(--border)", position: "sticky", bottom: 0, background: "var(--cream)" }}>
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: ".82rem" }}>
              <span style={{ color: "var(--sub)" }}>{v.name}</span>
              <span style={{ fontWeight: 600 }}>{fmt(v.price)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: ".82rem" }}>
              <span style={{ color: "var(--sub)" }}>WhatsApp delivery</span>
              <span style={{ fontWeight: 600, color: "#1A9E56" }}>Free</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: "var(--forest)" }}>Total</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--forest)" }}>{fmt(v.price)}</span>
            </div>
          </div>
          <button className="checkout-btn" disabled={paying} onClick={handlePay}>
            {paying && (
              <span style={{ width: 16, height: 16, border: "2px solid rgba(245,240,232,.3)", borderTopColor: "var(--cream)", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
            )}
            {paying ? "Processing…" : `🔒 Pay Securely ${fmt(v.price)}`}
          </button>
          <div style={{ textAlign: "center", fontSize: ".72rem", color: "var(--muted)", marginTop: 10 }}>
            Protected by PayFast · SSL encrypted
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SuccessDrawer ────────────────────────────────────────────────────────
function SuccessDrawer({ info, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="drawer-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">Gift Sent!</div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flex: 1 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,var(--leaf),var(--leaf2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", animation: "popIn .5s cubic-bezier(.34,1.56,.64,1)" }}>
            🎉
          </div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--forest)" }}>Gift Sent!</h2>
          <p style={{ color: "var(--sub)", fontSize: ".88rem", lineHeight: 1.7, maxWidth: 320 }}>
            Your voucher is on its way to {info.recipientPhone} via WhatsApp.
          </p>
          <div style={{ background: "var(--white)", border: "2px dashed var(--leaf)", borderRadius: 12, padding: "14px 28px", fontSize: "1.6rem", fontWeight: 700, color: "var(--forest)", letterSpacing: 3 }}>
            {info.code}
          </div>
          <img src={QR_URL(info.code)} width="150" height="150" alt="QR" style={{ background: "white", padding: 10, borderRadius: 10, border: "1px solid var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(37,211,102,.08)", border: "1px solid rgba(37,211,102,.2)", color: "#1a9e56", borderRadius: 8, padding: "10px 16px", fontSize: ".8rem", fontWeight: 600 }}>
            ✅ Delivered via WhatsApp
          </div>
          <button onClick={onClose} style={{ padding: "11px 28px", background: "var(--cream2)", border: "1px solid var(--border)", borderRadius: 9, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600, fontSize: ".88rem", color: "var(--sub)" }}>
            ← Back to Store
          </button>
        </div>
        <div style={{ width: "100%", background: "var(--cream2)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, textAlign: "left" }}>
          <p style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 8, fontSize: ".88rem" }}>📅 Book Your Experience</p>
          <p style={{ fontSize: ".78rem", color: "var(--sub)", marginBottom: 12 }}>
            Show this code to the partner and book your preferred date:
          </p>
          <a
            href={`https://wa.me/27XXXXXXXXX?text=Hi! I have voucher ${info.code} and would like to book`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", width: "100%", padding: "11px 0", background: "#25D366", color: "white", borderRadius: 9, textAlign: "center", fontWeight: 700, fontSize: ".85rem", textDecoration: "none" }}
          >
            💬 Book via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryPage ─────────────────────────────────────────────────────────
/**
 * Props:
 *   cat      – category name string (e.g. "Wellness", "Music")
 *   vouchers – full vouchers array; this page filters to the given cat
 *   loading  – boolean skeleton state
 *   onBack   – callback fired when the user clicks Back
 */
export default function CategoryPage({ cat, vouchers = [], loading, onBack }) {
  const [sortVal, setSortVal]               = useState("default");
  const [searchQ, setSearchQ]               = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [drawerVoucher, setDrawerVoucher]   = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  const meta = CAT_META[cat] || DEFAULT_META;

  // Scroll to top whenever the category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cat]);

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
      if (sortVal === "price-asc")  return a.price - b.price;
      if (sortVal === "price-desc") return b.price - a.price;
      if (sortVal === "rating")     return b.rating - a.rating;
      return 0;
    });

  const handleCheckout = async (form) => {
    await new Promise((r) => setTimeout(r, 2000));
    setCheckoutSuccess({
      code: genCode(),
      voucher: drawerVoucher,
      recipientPhone: form.recipientPhone,
    });
  };

  const lowestPrice = filtered.length
    ? Math.min(...filtered.map((v) => v.price || 0))
    : 0;

  return (
    <>
      {/* ── Category Hero ── */}
      <div
        style={{
          position: "relative",
          minHeight: 380,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to top, ${meta.color} 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.15) 100%)${meta.img ? `, url('${meta.img}')` : ""}`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute", top: 24, left: 32,
            background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.25)", borderRadius: 10,
            padding: "9px 16px", color: "#fff", fontFamily: "var(--sans)",
            fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7, zIndex: 2,
          }}
        >
          ← Back
        </button>

        {/* Hero copy */}
        <div
          style={{
            position: "relative", zIndex: 1,
            padding: "0 32px 44px",
            maxWidth: "var(--max)", width: "100%", margin: "0 auto",
          }}
        >
          {/* Category pill */}
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 20, padding: "5px 14px", fontSize: ".7rem",
              fontWeight: 600, color: "rgba(255,255,255,.85)",
              letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14,
            }}
          >
            {meta.icon} {cat}
          </div>

          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2rem,5vw,3.5rem)",
              fontWeight: 600, color: "#fff", lineHeight: 1.05,
              marginBottom: 10, letterSpacing: "-.3px",
            }}
          >
            {meta.tagline}
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,.65)", fontSize: ".92rem",
              lineHeight: 1.75, maxWidth: 560, fontWeight: 300,
            }}
          >
            {meta.desc}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex", gap: 24, marginTop: 24,
              paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.15)",
              flexWrap: "wrap",
            }}
          >
            {[
              [filtered.length,                                             "Experiences available"],
              [`US$${(lowestPrice / ZAR_TO_USD).toFixed(2)}`,             "Starting from"],
              ["Instant",                                                   "WhatsApp delivery"],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 3 }}>
                  {val}
                </div>
                <div style={{ fontSize: ".62rem", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 500 }}>
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div
        style={{
          background: "var(--white)", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 72, zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "var(--max)", margin: "0 auto",
            padding: "14px 32px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 16, flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div
            style={{
              flex: 1, maxWidth: 380,
              background: "var(--cream)", border: "1.5px solid var(--border2)",
              borderRadius: 50, display: "flex", alignItems: "center",
              gap: 9, padding: "0 16px", height: 40,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--muted)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder={`Search ${cat} experiences…`}
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontFamily: "var(--sans)", fontSize: ".85rem",
                color: "var(--text)", width: "100%",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: ".8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
              {filtered.length} experience{filtered.length !== 1 ? "s" : ""}
            </span>
            <select
              value={sortVal}
              onChange={(e) => setSortVal(e.target.value)}
              style={{
                padding: "8px 14px", border: "1.5px solid var(--border2)",
                borderRadius: 8, fontFamily: "var(--sans)", fontSize: ".8rem",
                color: "var(--sub)", background: "var(--white)",
                outline: "none", cursor: "pointer",
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

      {/* ── Voucher grid ── */}
      <section className="section container">
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
            <h3
              style={{
                fontFamily: "var(--serif)", fontSize: "1.4rem",
                color: "var(--forest)", marginBottom: 8,
              }}
            >
              No {cat} experiences yet
            </h3>
            <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 24 }}>
              Our partners are adding new experiences all the time.
            </p>
            <button
              onClick={onBack}
              style={{
                padding: "11px 24px", background: "var(--forest)",
                color: "var(--cream)", border: "none", borderRadius: 9,
                fontFamily: "var(--serif)", fontSize: ".95rem",
                fontWeight: 700, cursor: "pointer",
              }}
            >
              ← Browse all experiences
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {loading
              ? [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
              : filtered.map((v) => (
                  <VoucherCard key={v.id} voucher={v} onOpen={setSelectedVoucher} />
                ))
            }
          </div>
        )}
      </section>

      {/* ── Modals ── */}
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