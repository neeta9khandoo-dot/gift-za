import React, { useState } from "react";
import { HeroV2 } from "./HeroV2";
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
import { AvoSearchBar, AvoEmptyState } from "./AvoSearch";
// ─── Constants ────────────────────────────────────────────────────────────
const ZAR_TO_USD = 16.53;

const fmt = (n) =>
  `US$${(Number(n) / ZAR_TO_USD).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getCatIcon = (cat) =>
  ({
    Wellness: "☯",
    Beauty: "✦",
    Adventure: "✈",
    "Dining & Wine": "◈",
    "Traditional Restaurants": "⊕",
    Stays: "⌂",
    Skills: "◎",
    Music: "♪",
    Events: "✺",
    Florists: "✿",
    Other: "◆",
  })[cat] || "◆";



const CAT_TILES = [
  { emoji: "☯", name: "Wellness",      cat: "Wellness",              img: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=900&h=400&fit=crop&q=80" },
  { emoji: "⊕", name: "Traditional",   cat: "Traditional Restaurants", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&h=400&fit=crop&q=80" },
  { emoji: "♪", name: "Music",         cat: "Music",                 img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=900&h=400&fit=crop&q=80" },
  { emoji: "✈", name: "Adventure",     cat: "Adventure",             img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=900&h=400&fit=crop&q=80" },
 { emoji: "✿", name: "Florists", cat: "Florists",                     img: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=900&h=400&fit=crop&q=80"},
  { emoji: "◈", name: "Dining & Wine", cat: "Dining & Wine",         img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900&h=400&fit=crop&q=80" },
  { emoji: "✺", name: "Events",        cat: "Events",                img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&h=400&fit=crop&q=80" },
  { emoji: "◎", name: "Skills",        cat: "Skills",                img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&h=400&fit=crop&q=80" },
];


const CAT_BLURBS = {
  Wellness: "Spa days, massages & pamper packages",
  "Traditional Restaurants": "Send a proper home-cooked meal",
  Music: "Live jazz, concerts & studio sessions",
  Adventure: "Skydives, safaris & adrenaline gifts",
  Florists: "Fresh bouquets & luxury arrangements",
  "Dining & Wine": "Wine tastings & fine dining for two",
  Events: "Parties, functions & celebrations",
  Skills: "Workshops, classes & learning gifts",
};
 
const CAT_CARD_CSS = `
.cc-wrap{max-width:1200px;margin:0 auto;padding:36px 16px 12px}
.cc-head{text-align:center;margin-bottom:26px}
.cc-title{font-size:1.9rem;font-weight:800;letter-spacing:1px;margin:0;color:#111}
.cc-sub{font-size:.8rem;color:#444;margin:4px 0 0}
.cc-row{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;
  padding:6px 4px 28px;scrollbar-width:none}
.cc-row::-webkit-scrollbar{display:none}
.cc-card{flex:0 0 calc((100% - 48px) / 3);scroll-snap-align:start;background:#fff;
  box-shadow:0 8px 30px rgba(0,0,0,.10);cursor:pointer;
  transition:transform .25s,box-shadow .25s}
.cc-card:hover{transform:translateY(-4px);box-shadow:0 14px 36px rgba(0,0,0,.16)}
.cc-img{position:relative;height:168px;overflow:hidden;background:#e8eef4}
.cc-img img{width:100%;height:100%;object-fit:cover;display:block}
.cc-tag{position:absolute;top:0;left:0;background:#fff;color:#111;
  font-size:.82rem;font-weight:500;padding:12px 20px 14px;
  border-radius:0 0 22px 0}
.cc-body{padding:18px 24px 20px}
.cc-name{font-size:1rem;font-weight:700;letter-spacing:.8px;line-height:1.5;
  color:#111;margin:0 0 14px;min-height:3em}
.cc-meta{font-size:.72rem;color:#222;margin-bottom:16px}
.cc-meta b{color:#e11d1d;font-weight:500}
.cc-btn{display:flex;margin:0 auto;width:max-content;border:none;padding:0;
  cursor:pointer;background:none}
.cc-btn-icon{background:#f0a030;color:#fff;width:43px;height:42px;
  display:flex;align-items:center;justify-content:center;font-size:1.1rem}
.cc-btn-label{background:#3a9be8;color:#fff;font-weight:700;font-size:.78rem;
  padding:0 24px;height:42px;display:flex;align-items:center;letter-spacing:.3px}
.cc-card:hover .cc-btn-label{background:#2b86d1}
@media (max-width:900px){.cc-card{flex-basis:calc((100% - 24px) / 2)}}
@media (max-width:560px){
  .cc-card{flex-basis:82%}
  .cc-title{font-size:1.5rem}
}
`;
 
const ALL_CATS = [
  "All",
  "Wellness",
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

const CAT_ICONS = {
  All:                      "★",
  Wellness:                 "☯",
  "Hair & Beauty":          "✦",
  Adventure:                "✈",
  "Dining & Wine":          "◈",
  "Traditional Restaurants":"⊕",
  Stays:                    "⌂",
  Florists:                 "✿",
  Skills:                   "◎",
  Music:                    "♪",
  Events:                   "✺",
};

// ─── Sub-components ───────────────────────────────────────────────────────
function StarRating({ rating, reviewCount }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
      <span style={{ display: "inline-flex", gap: 1 }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: ".72rem",
              color: i < full || (i === full && half) ? "#f5a623" : "#ddd",
            }}
          >
            ★
          </span>
        ))}
      </span>
      <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--forest)" }}>
        {rating.toFixed(1)}
      </span>
      {reviewCount > 0 && (
        <span style={{ fontSize: ".68rem", color: "var(--muted)" }}>
          · {reviewCount.toLocaleString()} reviews
        </span>
      )}
    </div>
  );
}


function AvoCatGrid({ onCatSelect, vouchers = [] }) {
  const countFor = (cat) => vouchers.filter((v) => v.cat === cat).length;
 
  return (
    <>
      <style>{CAT_CARD_CSS}</style>
      <section className="cc-wrap">
        <div className="cc-head">
          <h2 className="cc-title">Browse by Category</h2>
          <p className="cc-sub">Find the perfect experience for every occasion</p>
        </div>
 
        <div className="cc-row">
          {CAT_TILES.map((t) => {
            const n = countFor(t.cat);
            return (
              <div key={t.cat} className="cc-card" onClick={() => onCatSelect(t.cat)}>
                <div className="cc-img">
                  <img src={t.img} alt={t.name} loading="lazy" />
                  <span className="cc-tag">{t.name}</span>
                </div>
                <div className="cc-body">
                  <h3 className="cc-name">{CAT_BLURBS[t.cat] || t.name}</h3>
                  <div className="cc-meta">
                    <b>{n > 0 ? `${n} available` : "New experiences"}</b>
                    {" · "}WhatsApp delivery
                  </div>
                  <button
                    className="cc-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCatSelect(t.cat);
                    }}
                  >
                    <span className="cc-btn-icon">→</span>
                    <span className="cc-btn-label">Browse Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

const getExpiryDate = (v) => {
  if (v.expiryDate) {
    const d = new Date(v.expiryDate);
    if (!isNaN(d)) return d;
  }
  if (v.createdAt && v.validMonths) {
    const d = new Date(v.createdAt);
    if (!isNaN(d)) {
      d.setMonth(d.getMonth() + Number(v.validMonths));
      return d;
    }
  }
  return null;
};
 
const daysUntil = (date) =>
  Math.ceil((date.getTime() - Date.now()) / 86400000);
 
function AvoFlashDeals({ vouchers = [], onOpen }) {
  const expiring = React.useMemo(
    () =>
      vouchers
        .map((v) => {
          const exp = getExpiryDate(v);
          return exp ? { v, exp, days: daysUntil(exp) } : null;
        })
        .filter((x) => x && x.days >= 0) // hide already-expired
        .sort((a, b) => a.exp - b.exp)   // soonest first
        .slice(0, 10),
    [vouchers]
  );
 
  if (expiring.length === 0) return null;
 
  const badge = (days) => {
    if (days <= 7) return { bg: "#dc2626", label: days <= 1 ? "Last day" : `${days} days left` };
    if (days <= 30) return { bg: "#f59e0b", label: `${days} days left` };
    return { bg: "#16a34a", label: `${days} days left` };
  };
 
  return (
    <div className="avs-section">
      <div className="avs-section-head">
        <span className="avs-section-title">
          <span style={{ marginRight: 5, fontWeight: 900 }}>✦</span>
          Expiring Soon
        </span>
        <span style={{ fontSize: ".7rem", color: "#888", fontWeight: 600 }}>
          Grab them before they go
        </span>
      </div>
 
      <div className="avs-hscroll">
        {expiring.map(({ v, exp, days }) => {
          const b = badge(days);
          const img = v.imageUrl || v.img;
          return (
            <div key={v.id} className="avs-deal-card" onClick={() => onOpen?.(v)}>
              <div className="avs-deal-img">
                {img ? (
                  <img
                    src={img}
                    alt={v.name}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      inset: 0,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem", position: "relative", zIndex: 1 }}>
                    {getCatIcon(v.cat)}
                  </span>
                )}
                <span className="avs-off-badge" style={{ background: b.bg, color: "#fff" }}>
                  {b.label}
                </span>
              </div>
 
              <div className="avs-deal-body">
                <div className="avs-deal-name">{v.name}</div>
                <div className="avs-price-row">
                  <span className="avs-price-now">{fmt(v.price)}</span>
                </div>
                <div className="avs-stock-lbl" style={{ color: b.bg, fontWeight: 600 }}>
                  Expires{" "}
                  {exp.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function AvoTrustStrip() {
 const items = [
  { icon: "◉", text: "Instant WhatsApp delivery" },
  { icon: "✓", text: "Verified ZIM partners" },
  { icon: "◈", text: "PayFast secure checkout" },
  { icon: "★", text: "4.9 · 2,800+ reviews" },
  { icon: "↺", text: "Flexible bookings" },
];
  return (
    <div style={{ padding: "14px 0 4px" }}>
      <div className="avs-hscroll">
        {items.map((it) => (
          <div key={it.text} className="avs-trust-item">
            <span className="avs-trust-icon">{it.icon}</span>
            <span className="avs-trust-text">{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvoVoucherCard({ voucher: v, onOpen, onPartnerOpen }) {
  const badgeBg =
    {
      Music: "#5839b4",
      Events: "#b4396e",
      "Traditional Restaurants": "#8b5a1e",
      Florists: "#b4396c",
    }[v.cat] || "var(--green-primary)";

  return (
    <div className="avs-v-card" onClick={() => onOpen(v)}>
      <div className="avs-v-img">
        {v.imageUrl || v.img ? (
          <img src={v.imageUrl || v.img} alt={v.name} loading="lazy" />
        ) : (
          <span style={{ fontSize: "2.5rem" }}>{getCatIcon(v.cat)}</span>
        )}
        <span className="avs-v-badge" style={{ background: badgeBg }}>
          {v.cat}
        </span>
      </div>
      <div className="avs-v-body">
        <div className="avs-v-name">{v.name}</div>
         {v.partnerRating > 0 && (
    <StarRating
      rating={v.partnerRating}
      reviewCount={v.partnerReviewCount}
    />
  )}
       <div className="avs-v-loc">
  📍{" "}
  <span
    onClick={(e) => { e.stopPropagation(); onPartnerOpen?.(v.partnerId); }}
    style={{ textDecoration: "underline", cursor: "pointer", color: "var(--green-primary)" }}
  >
    {v.partner}
  </span>{" "}
  · {v.city}
</div>
        <div className="avs-v-foot">
          <span className="avs-v-price">{fmt(v.price)}</span>
          <button
            className="avs-v-add"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(v);
            }}
            aria-label={`Buy ${v.name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function AvoOccasions() {
  const occs = [
    { icon: <Flower2 size={22} strokeWidth={1.5} />, name: "Mother's Day" },
    { icon: <Sparkles size={22} strokeWidth={1.5} />, name: "Just Because" },
    { icon: <Cake size={22} strokeWidth={1.5} />, name: "Birthday" },
    { icon: <Heart size={22} strokeWidth={1.5} />, name: "Anniversary" },
    { icon: <Music size={22} strokeWidth={1.5} />, name: "Concert Night" },
    {
      icon: <UtensilsCrossed size={22} strokeWidth={1.5} />,
      name: "Send Mum Lunch",
    },
    {
      icon: <PartyPopper size={22} strokeWidth={1.5} />,
      name: "Private Function",
    },
    { icon: <GraduationCap size={22} strokeWidth={1.5} />, name: "Graduation" },
  ];
  return (
    <div className="avs-section">
      <div className="avs-section-head">
        <span className="avs-section-title">What are you celebrating?</span>
      </div>
      <div className="avs-occ-scroll">
        {occs.map((o) => (
          <div key={o.name} className="avs-occ">
            <div className="avs-occ-icon">{o.icon}</div>
            <div className="avs-occ-name">{o.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────
function SkeletonVoucherCard() {
  return (
    <div className="avs-v-card">
      <div className="skeleton" style={{ height: 100 }} />
      <div
        style={{
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        <div className="skeleton skel-line med" />
        <div className="skeleton skel-line short" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <div
            className="skeleton"
            style={{ width: 50, height: 18, borderRadius: 4 }}
          />
          <div
            className="skeleton"
            style={{ width: 28, height: 28, borderRadius: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}


const QR_URL = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1A2E1F&bgcolor=F5F0E8&data=${encodeURIComponent(data)}`;

const genCode = () =>
  "VCH-" +
  [...Array(8)]
    .map(
      () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
    )
    .join("");

function ProductModal({ voucher: v, onClose, onBuy, onPartnerOpen }) {
  React.useEffect(() => {
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
  📍{" "}
  <span
    onClick={() => { onClose(); onPartnerOpen?.(v.partnerId); }}
    style={{ textDecoration: "underline", cursor: "pointer", color: "var(--green-primary)" }}
  >
    {v.partner}
  </span>
  {" "}· {v.city}{" "}
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

function CheckoutDrawer({ voucher: v, onClose, onSuccess }) {
  const [form, setForm] = useState({
    buyerName: "",
    buyerEmail: "",
    recipientPhone: "",
    recipientName: "",
    note: "",
  });
  const [paying, setPaying] = useState(false);

  React.useEffect(() => {
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
  try {
    const res = await fetch(`${process.env.REACT_APP_WORKER_URL}/paynow/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: `AV-${Date.now()}`,
        amount: (v.price / 16.53).toFixed(2), // adjust if Paynow account is ZAR/ZWL not USD
        buyerEmail: form.buyerEmail,
        buyerName: form.buyerName,
        recipientPhone: form.recipientPhone,
        recipientName: form.recipientName,
        note: form.note,
        voucherName: v.name,
        voucherId: v.id,
      }),
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = data.browserUrl; // send buyer to Paynow to pay
    } else {
      alert("Payment could not be started. Please try again.");
      setPaying(false);
    }
  } catch (e) {
    alert("Network error starting payment.");
    setPaying(false);
  }
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

        {/* Voucher summary */}
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
              getCatIcon(v.cat)
            )}
          </div>
          <div style={{ padding: 14, flex: 1 }}>
            <div
              style={{
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

        {/* Form fields */}
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

        {/* Footer */}
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

function SuccessDrawer({ info, onClose }) {
  React.useEffect(() => {
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

// ─── StorePage ────────────────────────────────────────────────────────────
/**
 * Props:
 *   vouchers    – array of voucher objects
 *   loading     – boolean, shows skeleton cards while true
 *   setPage     – page navigation callback
 *   onCatSelect – callback(cat: string) fired when user picks a category
 *   user        – Firebase auth user (or null)
 */
export default function StorePage({
  vouchers = [],
  loading,
  setPage,
  onCatSelect,
  onPartnerOpen,
  user,
}) {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [drawerVoucher, setDrawerVoucher] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [currentCat, setCurrentCat] = useState("All");
const [sortVal, setSortVal] = useState("default");
const [filteredResults, setFilteredResults] = useState([]);

  const handleCatSelect = (cat) => {
    setCurrentCat(cat);
    onCatSelect?.(cat);
  };

  const handleCheckout = async (form) => {
    await new Promise((r) => setTimeout(r, 2000));
    setCheckoutSuccess({
      code: genCode(),
      voucher: drawerVoucher,
      recipientPhone: form.recipientPhone,
    });
  };

  return (
    <div className="avs-page">
      {/* Greeting */}
     <HeroV2 vouchers={vouchers} onCatSelect={handleCatSelect} />
      {/* Category grid */}
     <AvoCatGrid onCatSelect={handleCatSelect} vouchers={vouchers} />

      {/* Flash deals */}
     <AvoFlashDeals vouchers={vouchers} onOpen={setSelectedVoucher} />

      {/* Category filter tabs */}
      <div
        className="cats-section"
        style={{ position: "sticky", top: 64, zIndex: 90 }}
      >
        <AvoSearchBar
  currentCat={currentCat}
  allCats={ALL_CATS}
  catIcons={CAT_ICONS}
  onCatSelect={handleCatSelect}
  vouchers={vouchers}
  onResults={setFilteredResults}
  sortVal={sortVal}
  onSortChange={setSortVal}
/>
      </div>

      {/* Trust strip */}
      <AvoTrustStrip />

      {/* Voucher grid */}
     <div className="avs-section">
  <div className="avs-section-head">
    <span className="avs-section-title">
      {currentCat === "All" ? "All experiences" : currentCat}
      <span style={{ fontSize: ".72rem", fontWeight: 400, color: "#aaa", marginLeft: 6 }}>
        {loading ? "Loading…" : `${filteredResults.length} available`}
      </span>
    </span>
    {/* sort is now inside AvoSearchBar, remove the select here */}
  </div>

  <div className="avs-voucher-grid">
    {loading ? (
      [...Array(8)].map((_, i) => <SkeletonVoucherCard key={i} />)
    ) : filteredResults.length === 0 ? (
      <AvoEmptyState
        query=""     
        currentCat={currentCat}
        onClear={() => handleCatSelect("All")}
      />
    ) : (
      filteredResults.map((v) => (
        <AvoVoucherCard 
        key={v.id} voucher={v} 
        onOpen={setSelectedVoucher} 
        onPartnerOpen={onPartnerOpen}
        />
      ))
    )}
  </div>
</div>

      {/* Occasions */}
      <AvoOccasions />

      <div style={{ height: 32 }} />

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
    </div>
  );
}
