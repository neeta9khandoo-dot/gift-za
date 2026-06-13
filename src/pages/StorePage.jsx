import React, { useState } from "react";
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

const FLASH_DATA = [
  {
    name: "60-Min Massage",
    emoji: "☯",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&q=80",
    price: 550, orig: 750, off: 27, stock: 4, total: 10, cat: "Wellness",
  },
  {
    name: "Wine Tasting for Two",
    emoji: "◈",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&q=80",
    price: 620, orig: 850, off: 27, stock: 7, total: 15, cat: "Dining & Wine",
  },
  {
    name: "Birthday Bloom Bouquet",
    emoji: "✿",
    img: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=300&q=80",
    price: 350, orig: 450, off: 22, stock: 3, total: 8, cat: "Florists",
  },
  {
    name: "Concert Ticket Voucher",
    emoji: "♪",
    img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&q=80",
    price: 450, orig: 600, off: 25, stock: 5, total: 12, cat: "Music",
  },
  {
    name: "Luxury Pamper Package",
    emoji: "✦",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&q=80",
    price: 480, orig: 580, off: 17, stock: 9, total: 20, cat: "Beauty",
  },
  {
    name: "Sadza & Dovi Dinner",
    emoji: "⊕",
    img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=80",
    price: 350, orig: 420, off: 17, stock: 8, total: 15, cat: "Traditional Restaurants",
  },
  {
    name: "Kids Party Pack",
    emoji: "✺",
    img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&q=80",
    price: 1200, orig: 1400, off: 14, stock: 6, total: 10, cat: "Events",
  },
];
const PROMO_SLIDES = [
  {
    emoji: "☯",
    bg: "linear-gradient(135deg,#1a2e1f,#0a1f12)",
    img: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80",
    tag: "Wellness",
    name: "Couples Spa Day",
    price: "From US$109",
    cat: "Wellness",
  },
  {
    emoji: "◈",
    bg: "linear-gradient(135deg,#2e1a0e,#140a00)",
    img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
    tag: "Traditional",
    name: "Send Mum a Proper Meal",
    price: "From US$15",
    cat: "Traditional Restaurants",
  },
  {
    emoji: "♪",
    bg: "linear-gradient(135deg,#1a1a2e,#09071a)",
    img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    tag: "Music",
    name: "Live Jazz Evening",
    price: "From US$47",
    cat: "Music",
  },
  {
    emoji: "✦",
    bg: "linear-gradient(135deg,#000d1a,#001a33)",
    img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=600&q=80",
    tag: "Adventure",
    name: "Tandem Skydive",
    price: "From US$179",
    cat: "Adventure",
  },
  {
    emoji: "✿",
    bg: "linear-gradient(135deg,#160a10,#2e1a1f)",
    img: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=600&q=80",
    tag: "Florists",
    name: "Luxury Rose Arrangement",
    price: "From US$41",
    cat: "Florists",
  },
  {
    emoji: "⌂",
    bg: "linear-gradient(135deg,#1a2e1f,#0e1f14)",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    tag: "Stays",
    name: "Ancient City Lodge",
    price: "From US$169",
    cat: "Stays",
  },
];

const CAT_TILES = [
  { emoji: "☯", name: "Wellness",      cat: "Wellness",              img: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=200&q=80" },
  { emoji: "⊕", name: "Traditional",   cat: "Traditional Restaurants", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80" },
  { emoji: "♪", name: "Music",         cat: "Music",                 img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&q=80" },
  { emoji: "✈", name: "Adventure",     cat: "Adventure",             img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=200&q=80" },
 { emoji: "✿", name: "Florists", cat: "Florists",                     img: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=200&q=80"},
  { emoji: "◈", name: "Dining & Wine", cat: "Dining & Wine",         img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80" },
  { emoji: "✺", name: "Events",        cat: "Events",                img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=80" },
  { emoji: "◎", name: "Skills",        cat: "Skills",                img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&q=80" },
];

const PERKS = [
  { icon: "◉", label: "WhatsApp Delivery" },
  { icon: "◈", label: "PayFast Secure" },
  { icon: "✓", label: "Verified Partners" },
  { icon: "↺", label: "Flexible Booking" },
  { icon: "◆", label: "Custom Messages" },
  { icon: "★", label: "4.9 · 2,800 Reviews" },
];

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
function AvoGreeting({ user, voucherCount = 0 }) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[new Date().getDay()];
  const name = user
    ? user.displayName || user.email?.split("@")[0] || "there"
    : "Guest";
  return (
    <div className="avs-greeting">
      <h2>
        Happy {day}, {name}
      </h2>
      <p>
        You have <strong>{voucherCount}</strong> voucher
        {voucherCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function AvoPromoRow({ onCatSelect }) {
  const scrollRef = React.useRef(null);
   React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const SPEED = 1;       
    const INTERVAL = 10;    

    const tick = setInterval(() => {
     
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += SPEED;
      }
    }, INTERVAL);

    // Pause on hover/touch
    const pause = () => clearInterval(tick);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("touchstart", pause);

    return () => {
      clearInterval(tick);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("touchstart", pause);
    };
  }, []);
  return (
    <div className="avs-section">
      <div className="avs-section-head">
        <span className="avs-section-title">Promotions</span>
      </div>
      <div className="avs-hscroll" ref={scrollRef}>
        {PROMO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="avs-promo-card"
            onClick={() => onCatSelect(s.cat)}
          >
            <div className="avs-promo-img" style={{ position: "relative", background: s.bg }}>
              {s.img && (
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    inset: 0,
                    opacity: 0.82,
                  }}
                />
              )}
              <span style={{
                position: "absolute",
                bottom: 8,
                right: 10,
                fontSize: "1.4rem",
                color: "rgba(255,255,255)",
                zIndex: 2,
                lineHeight: 1,
              }}>
                {s.emoji}
              </span>
            </div>
            <div className="avs-promo-overlay">
              <div className="avs-promo-tag">{s.tag}</div>
              <div className="avs-promo-name">{s.name}</div>
              <div className="avs-promo-price">{s.price}</div>
              <button
                className="avs-promo-arrow"
                onClick={(e) => { e.stopPropagation(); onCatSelect(s.cat); }}
              >
                ›
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvoFeatureStrip() {
  return (
    <div className="avs-feature-strip">
      <div className="avs-feature-header">
        <div className="avs-feature-icon">🎁</div>
        <div>
          <div className="avs-feature-title">AfriVoucher perks</div>
          <div className="avs-feature-sub">
            Instant WhatsApp delivery · Weekly EFT payouts · 200+ ZIM partners
          </div>
        </div>
      </div>
      <div className="avs-pills">
        {PERKS.map((p) => (
          <div key={p.label} className="avs-pill">
            <span className="avs-pill-icon">{p.icon}</span>
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}
function AvoCatGrid({ onCatSelect }) {
  const scrollRef = React.useRef(null);
  const [activeIdx, setActiveIdx] = React.useState(0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let paused = false;
    const tick = setInterval(() => {
      if (paused) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += 1;
      }
    }, 12);
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    return () => {
      clearInterval(tick);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
    };
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 110;
    const idx = Math.round(el.scrollLeft / cardWidth) % CAT_TILES.length;
    setActiveIdx(idx);
  };

  const scrollTo = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * 110, behavior: "smooth" });
    setActiveIdx(i);
  };

  return (
    <div className="avs-section">
      <div className="avs-section-head">
        <span className="avs-section-title">Browse by category</span>
      </div>

      <div className="avs-cat-scroll" ref={scrollRef} onScroll={handleScroll}>
        {[...CAT_TILES, ...CAT_TILES].map((t, i) => (
          <div key={i} className="avs-cat-circle" onClick={() => onCatSelect(t.cat)}>
            <div className="avs-cat-circle-inner">
              <img src={t.img} alt={t.name} loading="lazy" />
            </div>
            <div className="avs-cat-circle-name">{t.name}</div>
          </div>
        ))}
      </div>

      <div className="avs-cat-dots">
        {CAT_TILES.map((_, i) => (
          <button
            key={i}
            className={`avs-cat-dot${activeIdx === i ? " active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Category ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function AvoFlashDeals({ onOpen }) {
  const [time, setTime] = React.useState({ h: 0, m: 0, s: 0 });

  React.useEffect(() => {
    const tick = () => {
      const now = new Date(),
        midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight - now) / 1000));
      setTime({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="avs-section">
      <div className="avs-section-head">
        <span className="avs-section-title">
           <span style={{ marginRight: 5, fontWeight: 900 }}>✦</span>Flash Deals
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: ".7rem",
            color: "#888",
            fontWeight: 600,
          }}
        >
          Ends in
          {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
            <React.Fragment key={i}>
              <span
                style={{
                  background: "#111",
                  color: "#fff",
                  padding: "3px 7px",
                  borderRadius: 5,
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 800,
                  fontSize: ".72rem",
                }}
              >
                {v}
              </span>
              {i < 2 && (
                <span
                  style={{ color: "var(--green-primary)", fontWeight: 800 }}
                >
                  :
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="avs-hscroll">
        {FLASH_DATA.map((d, i) => (
          <div
            key={i}
            className="avs-deal-card"
            onClick={() =>
              onOpen?.({
                name: d.name,
                cat: d.cat,
                price: d.price,
                desc: d.name,
                partner: "AfriVoucher",
                city: "Zimbabwe",
              })
            }
          >
            <div className="avs-deal-img">
  {d.img ? (
    <img
      src={d.img}
      alt={d.name}
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
      {d.emoji}
    </span>
  )}
  <span className="avs-off-badge">-{d.off}%</span>
</div>
            <div className="avs-deal-body">
              <div className="avs-deal-name">{d.name}</div>
              <div className="avs-price-row">
                <span className="avs-price-now">
                  US${(d.price / ZAR_TO_USD).toFixed(2)}
                </span>
                <span className="avs-price-was">
                  US${(d.orig / ZAR_TO_USD).toFixed(2)}
                </span>
              </div>
              <div className="avs-stock-bar">
                <div
                  className="avs-stock-fill"
                  style={{ width: `${Math.round((d.stock / d.total) * 100)}%` }}
                />
              </div>
              <div className="avs-stock-lbl">{d.stock} left at this price</div>
            </div>
          </div>
        ))}
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
      <AvoGreeting user={user} voucherCount={0} />

      {/* Promotions row */}
      <AvoPromoRow onCatSelect={handleCatSelect} />

      {/* Perks strip */}
      <AvoFeatureStrip />

      {/* Category grid */}
      <AvoCatGrid onCatSelect={handleCatSelect} />

      {/* Flash deals */}
      <AvoFlashDeals onOpen={setSelectedVoucher} />

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
