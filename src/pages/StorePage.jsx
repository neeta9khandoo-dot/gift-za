import React, { useState, useRef, useEffect,  } from "react";
import { HeroV2 } from "./HeroV2";
import { HomeSEO, VoucherSEO } from "../components/Seo";
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
  { emoji: "☯", name: "Wellness",      cat: "Wellness",              img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269266/spa_r289dd.webp?w=900&h=400&fit=crop&q=80" },
  { emoji: "⊕", name: "Traditional",   cat: "Traditional Restaurants", img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269267/send-mum_qqist7.png?w=900&h=400&fit=crop&q=80" },
  { emoji: "♪", name: "Music",         cat: "Music",                 img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269265/music_wpedsl.jpg?w=900&h=400&fit=crop&q=80" },
  { emoji: "✈", name: "Adventure",     cat: "Adventure",             img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269266/skydive_lhip9i.jpg?w=900&h=400&fit=crop&q=80" },
 { emoji: "✿", name: "Florists", cat: "Florists",                     img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270012/florists_yn20wz.jpg?w=900&h=400&fit=crop&q=80"},
  { emoji: "◈", name: "Dining & Wine", cat: "Dining & Wine",         img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270011/wine-tasting_fnvxbz.avif?w=900&h=400&fit=crop&q=80" },
  { emoji: "✺", name: "Events",        cat: "Events",                img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270275/events_xztuz0.jpg?w=900&h=400&fit=crop&q=80" },
  { emoji: "◎", name: "Skills",        cat: "Skills",                img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270274/skills_dcucqg.webp?w=900&h=400&fit=crop&q=80" },
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
 
// Needs: import React, { useRef, useState, useEffect } from "react";
// Uses your existing CAT_TILES and CAT_BLURBS.
// This replaces CAT_CARD_CSS and CAT_SLIDER_CSS: delete both and use CAT_GRID_CSS.

const CAT_GRID_CSS = `
.cc-wrap{
  --cc-bg:#fff;
  --cc-ink:#232a35;
  --cc-muted:rgba(35,42,53,.68);
  --cc-line:rgba(35,42,53,.18);
  --cc-accent:#c4531a;
  --cc-pad:max(24px,calc((100% - 1280px)/2));
  background:var(--cc-bg);color:var(--cc-ink);
  padding:64px 0 56px;box-sizing:border-box;overflow:hidden}
.cc-wrap *,.cc-wrap *::before,.cc-wrap *::after{box-sizing:border-box}

/* ── centred intro ── */
.cc-head{max-width:680px;margin:0 auto 40px;padding:0 24px;text-align:center}
.cc-title{margin:0 0 14px;font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:400;
  letter-spacing:.01em;line-height:1.15}
.cc-sub{margin:0;font-size:1rem;line-height:1.6;color:var(--cc-muted)}

/* ── horizontal row of tall cards ── */
.cc-row{display:flex;gap:20px;overflow-x:auto;
  padding:0 var(--cc-pad);
  scroll-snap-type:x mandatory;scroll-padding-inline:var(--cc-pad);
  scrollbar-width:none;-webkit-overflow-scrolling:touch}
.cc-row::-webkit-scrollbar{display:none}

.cc-card{flex:0 0 clamp(250px,22vw,300px);scroll-snap-align:start;cursor:pointer;
  display:flex;flex-direction:column}
.cc-card:focus-visible{outline:2px solid var(--cc-accent);outline-offset:4px}
.cc-img{position:relative;aspect-ratio:3/4;overflow:hidden;background:#ececec}
.cc-img img{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .8s cubic-bezier(.2,.6,.2,1)}
.cc-card:hover .cc-img img{transform:scale(1.04)}

.cc-body{display:flex;flex-direction:column;gap:8px;flex:1;padding:18px 2px 0}
.cc-name{margin:0;font-size:.95rem;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;line-height:1.35}
.cc-desc{margin:0;font-size:.92rem;line-height:1.55;color:var(--cc-muted);
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.cc-meta{font-size:.78rem;color:var(--cc-muted);margin-bottom:6px}
.cc-meta b{color:var(--cc-ink);font-weight:600}
.cc-btn{align-self:flex-start;margin-top:auto;padding:0 0 3px;background:none;border:none;
  border-bottom:1px solid currentColor;font:inherit;font-size:.78rem;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--cc-ink);cursor:pointer;
  transition:color .2s}
.cc-btn:hover{color:var(--cc-accent)}
.cc-btn:focus-visible{outline:2px solid var(--cc-accent);outline-offset:4px}

/* ── progress line + arrows ── */
.cc-controls{display:flex;align-items:center;gap:32px;margin-top:36px;
  padding:0 var(--cc-pad)}
.cc-progress{flex:1;position:relative;height:2px;background:var(--cc-line)}
.cc-progress-thumb{position:absolute;top:0;height:100%;background:var(--cc-ink);
  transition:left .2s ease,width .2s ease}
.cc-arrows{display:flex;gap:10px}
.cc-arrow{width:44px;height:44px;border-radius:50%;border:1px solid var(--cc-line);
  background:transparent;color:var(--cc-ink);font-size:1.4rem;line-height:1;
  display:flex;align-items:center;justify-content:center;padding:0 0 2px;cursor:pointer;
  transition:background .2s,color .2s,border-color .2s}
.cc-arrow:hover:not(:disabled){background:var(--cc-ink);color:var(--cc-bg);border-color:var(--cc-ink)}
.cc-arrow:disabled{opacity:.3;cursor:default}
.cc-arrow:focus-visible{outline:2px solid var(--cc-accent);outline-offset:3px}

@media (max-width:600px){
  .cc-wrap{padding:44px 0 40px}
  .cc-head{margin-bottom:28px}
  .cc-row{gap:14px}
  .cc-card{flex-basis:72vw}
  .cc-controls{margin-top:24px}
  .cc-arrows{display:none}
}
@media (prefers-reduced-motion:reduce){
  .cc-img img,.cc-progress-thumb,.cc-arrow,.cc-btn{transition:none}
  .cc-card:hover .cc-img img{transform:none}
}
`;

function AvoCatGrid({ onCatSelect, vouchers = [] }) {
  const rowRef = useRef(null);
  const resumeTimer = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [paused, setPaused] = useState(false);
  const [thumb, setThumb] = useState({ w: 100, x: 0 });

  const countFor = (cat) => vouchers.filter((v) => v.cat === cat).length;

  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const w = Math.min(100, (el.clientWidth / el.scrollWidth) * 100);
    const x = max > 0 ? (el.scrollLeft / max) * (100 - w) : 0;
    setThumb({ w, x });
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  };

  const slide = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const card = el.querySelector(".cc-card");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 20;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({
      left: dir * step,
      behavior: reduceMotion() ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    updateArrows();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      clearTimeout(resumeTimer.current);
    };
  }, []);

  // Auto-slide (pauses on hover/focus/touch, loops back to the start at the end)
  useEffect(() => {
    if (paused || reduceMotion()) return;
    const id = setInterval(() => {
      const el = rowRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slide(1);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  const onTouchEnd = () => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 6000);
  };

  return (
    <>
      <style>{CAT_GRID_CSS}</style>
      <section className="cc-wrap">
        <div className="cc-head">
          <h2 className="cc-title">BROWSE BY CATEGORY</h2>
          <p className="cc-sub">
            Find the perfect experience for every occasion
          </p>
        </div>

        <div
          className="cc-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={onTouchEnd}
        >
          <div className="cc-row" ref={rowRef}>
            {CAT_TILES.map((t) => {
              const n = countFor(t.cat);
              return (
                <div
                  key={t.cat}
                  className="cc-card"
                  role="link"
                  tabIndex={0}
                  onClick={() => onCatSelect(t.cat)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onCatSelect(t.cat);
                    }
                  }}
                >
                  <div className="cc-img">
                    <img src={t.img} alt={t.name} loading="lazy" />
                  </div>
                  <div className="cc-body">
                    <h3 className="cc-name">{t.name}</h3>
                    <p className="cc-desc">{CAT_BLURBS[t.cat] || t.name}</p>
                    <div className="cc-meta">
                      <b>{n > 0 ? `${n} available` : "New experiences"}</b>
                      {" · "}WhatsApp delivery
                    </div>
                    <button
                      className="cc-btn"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCatSelect(t.cat);
                      }}
                    >
                      Browse now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cc-controls">
            <div className="cc-progress" aria-hidden="true">
              <div
                className="cc-progress-thumb"
                style={{ width: `${thumb.w}%`, left: `${thumb.x}%` }}
              />
            </div>
            <div className="cc-arrows">
              <button
                className="cc-arrow"
                onClick={() => slide(-1)}
                disabled={!canPrev}
                aria-label="Previous categories"
              >
                ‹
              </button>
              <button
                className="cc-arrow"
                onClick={() => slide(1)}
                disabled={!canNext}
                aria-label="Next categories"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

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



const VIDEO_ADS = [
  {
    id: "v1",
    src: "https://res.cloudinary.com/dlrdkvxiz/video/upload/v1748835069/axis-y_y1jjj6.mp4",
    poster: "../images/ad1.avif",
    alt: "Anantara Skincare",
    href: "https://anantara.africa",
  },
  {
    id: "v2",
    src: "https://res.cloudinary.com/dlrdkvxiz/video/upload/v1748835057/axis_knbydr.mp4",
    poster: "../images/ad1.avif",
    alt: "Anantara Skincare",
    href: "https://anantara.africa",
  },
];

const IMAGE_ADS = [
  {
    id: "i1",
    src: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1748917646/sun-exposure-4_dm39g5.jpg",
    alt: "Aureum Skincare",
    href: "https://anantara.africa",
  },
  {
    id: "i2",
    src: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1748916173/breakouts-1_vjrs3n.jpg",
    alt: "Aureum Skincare",
    href: "https://anantara.africa",
  },
];

function AdSlider({ items, type, interval = 6000 }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef([]);

  // auto-advance (pauses on hover)
  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setInterval(() => setI((c) => (c + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [paused, items.length, interval]);

  // only the visible video plays, which saves mobile data
  useEffect(() => {
    if (type !== "video") return;
    videoRefs.current.forEach((v, idx) => {
      if (!v) return;
      if (idx === i) v.play().catch(() => {});
      else v.pause();
    });
  }, [i, type]);

  return (
    <div
      className="avs-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="avs-slider-track"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {items.map((a, idx) => (
          <a
            key={a.id}
            className="avs-ad"
            href={a.href}
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-label={a.alt}
          >
            <span className="avs-ad-tag">Ad</span>
            {type === "video" ? (
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                muted
                loop
                playsInline
                preload={idx === 0 ? "auto" : "metadata"}
                poster={a.poster}
                aria-hidden="true"
              >
                <source src={a.src} type="video/mp4" />
              </video>
            ) : (
              <img src={a.src} alt={a.alt} loading="lazy" />
            )}
          </a>
        ))}
      </div>

      {items.length > 1 && (
        <div className="avs-slider-dots">
          {items.map((a, d) => (
            <button
              key={a.id}
              className={`avs-slider-dot${d === i ? " on" : ""}`}
              onClick={() => setI(d)}
              aria-label={`Show ${a.alt}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdRail() {
  return (
    <aside className="avs-ads" aria-label="Sponsored">
      <AdSlider items={VIDEO_ADS} type="video" interval={7000} />
      <AdSlider items={IMAGE_ADS} type="image" interval={5000} />
    </aside>
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
    <div style={{ alignItems: "center" }}>
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


// eslint-disable-next-line no-unused-vars
const QR_URL = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1A2E1F&bgcolor=F5F0E8&data=${encodeURIComponent(data)}`;



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
      <VoucherSEO voucher={v} />
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
  onVoucherOpen,
  user,
}) {
 
  const [currentCat, setCurrentCat] = useState("All");
const [sortVal, setSortVal] = useState("default");
const [filteredResults, setFilteredResults] = useState([]);

  const handleCatSelect = (cat) => {
    setCurrentCat(cat);
    onCatSelect?.(cat);
  };

  

  return (
    
    <div className="avs-page">
      {/* Greeting */}
      <HomeSEO />
     <HeroV2 vouchers={vouchers} onCatSelect={handleCatSelect} />
      {/* Category grid */}
     <AvoCatGrid onCatSelect={handleCatSelect} vouchers={vouchers} />

      {/* Flash deals */}
     <AvoFlashDeals vouchers={vouchers} onOpen={onVoucherOpen} />

      {/* Category filter tabs */}
     <div
  className="cats-section"
  style={{ position: "sticky", top: 64, zIndex: 90 }}
>
  <div className="avs-wrap">
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
</div>

{/* Trust strip */}
<div className="avs-wrap">
  <AvoTrustStrip />
</div>

      {/* Voucher grid */}
      <div className="avs-layout">
  <AdRail />
     <div className="avs-section">
 
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
        onOpen={onVoucherOpen} 
        onPartnerOpen={onPartnerOpen}
        />
      ))
    )}
  </div>
</div>
</div>
      {/* Occasions */}
      <AvoOccasions />

      <div style={{ height: 32 }} />

     
    </div>
  );
}
export { AvoVoucherCard, SkeletonVoucherCard, AvoTrustStrip, ProductModal, CheckoutDrawer, ZAR_TO_USD, fmt };