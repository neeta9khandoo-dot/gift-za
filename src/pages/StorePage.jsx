import React, { useState, useRef, useEffect,  } from "react";
import { HeroV2 } from "./HeroV2";
import { HomeSEO, VoucherSEO } from "../components/Seo";
import { CATEGORIES, SYMBOLS } from "../categories";
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
  `US$${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;





const CAT_TILES = [
  { emoji: "☯", name: "Wellness",      cat: "Wellness",              img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269266/spa_r289dd.webp?w=900&h=400&fit=crop&q=80" },
  { emoji: "⊕", name: "Traditional",   cat: "Traditional Restaurants", img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269267/send-mum_qqist7.png?w=900&h=400&fit=crop&q=80" },
  { emoji: "♪", name: "Music",         cat: "Music",                 img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269265/music_wpedsl.jpg?w=900&h=400&fit=crop&q=80" },
  { emoji: "✈", name: "Adventure",     cat: "Adventure",             img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269266/skydive_lhip9i.jpg?w=900&h=400&fit=crop&q=80" },
 { emoji: "✿", name: "Florists", cat: "Florists",                     img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270012/florists_yn20wz.jpg?w=900&h=400&fit=crop&q=80"},
  { emoji: "◈", name: "Dining & Wine", cat: "Dining & Wine",         img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270011/wine-tasting_fnvxbz.avif?w=900&h=400&fit=crop&q=80" },
  { emoji: "✺", name: "Events",        cat: "Events",                img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270275/events_xztuz0.jpg?w=900&h=400&fit=crop&q=80" },
  { emoji: "◎", name: "Skills",        cat: "Skills",                img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792270274/skills_dcucqg.webp?w=900&h=400&fit=crop&q=80" },
  { emoji: "✚", name: "Medical",  cat: "Medical & Pharmacy",  img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792349723/pharmacy-1_w5mxte.jpg?w=900&h=400&fit=crop&q=80" },
  { emoji: "❂", name: "Cakes & Bakery", cat: "Cakes & Bakery", img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792349723/cakes-1_wem6kk.webp?w=900&h=400&fit=crop&q=80" },
];


// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
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
const CAT_MENU_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&display=swap');

.cm-wrap{
  --ease:cubic-bezier(.19,1,.22,1);
  --y:#FFF200;
  --bg:#0b0b0b;
  --line:rgba(255,255,255,.55);
  --font:'Syne','Arial Black',system-ui,sans-serif;

  display:grid;
  grid-template-columns:300px minmax(0,1fr) minmax(280px,33%);
  height:clamp(520px,82dvh,780px);
  background:var(--bg);
  color:#fff;
  font-family:var(--font);
  overflow:hidden;
}
.cm-wrap *{box-sizing:border-box;margin:0;padding:0}
.cm-wrap button{font-family:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left}

/* ───────── left list ───────── */
.cm-list{padding:44px 28px;overflow-y:auto;scrollbar-width:none}
.cm-list::-webkit-scrollbar{display:none}
.cm-list-label{
  font-size:.72rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(255,255,255,.5);margin-bottom:30px;
}
.cm-list ul{list-style:none;display:flex;flex-direction:column;gap:6px}
.cm-item{
  position:relative;display:block;width:100%;
  padding:9px 0 9px 0;
  font-size:1.02rem;font-weight:600;letter-spacing:.01em;line-height:1.25;
  color:rgba(255,255,255,.55);
  transition:color .4s var(--ease),padding-left .5s var(--ease);
}
.cm-item::before{
  content:"";position:absolute;left:0;top:50%;width:0;height:2px;background:var(--y);
  transform:translateY(-50%);transition:width .5s var(--ease);
}
.cm-item.on,.cm-item:hover{color:#fff;padding-left:22px}
.cm-item.on::before,.cm-item:hover::before{width:14px}
.cm-item:focus-visible{outline:1px solid var(--y);outline-offset:2px}

/* ───────── centre hero ───────── */
.cm-hero{position:relative;overflow:hidden;cursor:pointer;background:#222;outline:none}
.cm-hero:focus-visible{outline:1px solid var(--y);outline-offset:-4px}
.cm-hero-img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;
  opacity:0;transform:scale(1.06);
  transition:opacity .9s var(--ease),transform 1.8s var(--ease);
}
.cm-hero-img.on{opacity:1;transform:scale(1)}
.cm-hero-shade{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.18) 38%,transparent 62%);
}
.cm-hero-copy{
  position:absolute;left:clamp(24px,4vw,64px);right:24px;bottom:clamp(28px,5vh,60px);
  animation:cm-up .8s var(--ease) both;
}
@keyframes cm-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.cm-hero-title{
  font-size:clamp(1.9rem,4.4vw,3.6rem);font-weight:800;line-height:1;
  letter-spacing:.005em;text-transform:uppercase;
  text-wrap:balance;overflow-wrap:anywhere;
  max-width:14ch;
}
.cm-hero-meta{
  margin-top:12px;font-size:.7rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;
  color:rgba(255,255,255,.75);
}
.cm-more{
  display:inline-flex;align-items:center;gap:14px;margin-top:22px;
  font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
}

/* ───────── circular chevron ───────── */
.cm-circle{
  width:40px;height:40px;flex:none;border-radius:50%;
  border:1px solid var(--line);
  display:grid;place-items:center;
  transition:background .5s var(--ease),border-color .5s var(--ease),transform .6s var(--ease);
}
.cm-circle svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:stroke .4s}
.cm-hero:hover .cm-circle,
.cm-tile:hover .cm-circle,
.cm-tile.on .cm-circle{background:#fff;border-color:#fff;transform:translateX(4px)}
.cm-hero:hover .cm-circle svg,
.cm-tile:hover .cm-circle svg,
.cm-tile.on .cm-circle svg{stroke:#000}

/* ───────── right tiles ───────── */
.cm-tiles{
  display:flex;flex-direction:column;
  overflow-y:auto;scroll-snap-type:y mandatory;scrollbar-width:none;
}
.cm-tiles::-webkit-scrollbar{display:none}
.cm-tile{
  position:relative;flex:0 0 33.3334%;min-height:0;overflow:hidden;
  scroll-snap-align:start;background:#2a2a2a;
  display:flex;align-items:flex-end;justify-content:space-between;gap:12px;
  padding:0 26px 26px 30px;
  border-bottom:1px solid #0b0b0b;
}
.cm-tile img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;
  filter:grayscale(.3);
  transition:transform 1.4s var(--ease),filter .8s ease;
}
.cm-tile:hover img,.cm-tile.on img{transform:scale(1.06);filter:none}
.cm-tile-shade{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(0,0,0,.62),rgba(0,0,0,0) 55%);
}
/* yellow edge on the active tile */
.cm-tile::before{
  content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--y);z-index:2;
  transform:scaleY(0);transform-origin:top;transition:transform .6s var(--ease);
}
.cm-tile.on::before{transform:scaleY(1)}
.cm-tile:focus-visible{outline:1px solid var(--y);outline-offset:-4px}

.cm-tile-name{
  position:relative;z-index:1;
  font-size:clamp(.85rem,1.15vw,1.05rem);font-weight:700;letter-spacing:.02em;
  text-transform:uppercase;line-height:1.15;
  text-wrap:balance;overflow-wrap:anywhere;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.cm-tile .cm-circle{position:relative;z-index:1}

/* ───────── tablet & mobile ───────── */
@media (max-width:1100px){
  .cm-wrap{grid-template-columns:230px minmax(0,1fr) minmax(240px,34%)}
  .cm-list{padding:36px 20px}
}
@media (max-width:900px){
  .cm-wrap{
    grid-template-columns:1fr;
    grid-template-rows:auto clamp(260px,58vw,420px) auto;
    height:auto;
  }
  /* list becomes a horizontal chip row */
  .cm-list{padding:20px 16px 14px;overflow:visible}
  .cm-list-label{margin-bottom:12px}
  .cm-list ul{flex-direction:row;overflow-x:auto;gap:8px;scrollbar-width:none}
  .cm-list ul::-webkit-scrollbar{display:none}
  .cm-item{
    width:auto;white-space:nowrap;padding:9px 16px;font-size:.78rem;
    border:1px solid rgba(255,255,255,.3);border-radius:999px;
  }
  .cm-item::before{display:none}
  .cm-item.on,.cm-item:hover{padding-left:16px;background:#fff;color:#000;border-color:#fff}

  /* tiles become a horizontal snap row */
  .cm-tiles{flex-direction:row;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory}
  .cm-tile{flex:0 0 64%;height:200px;padding:0 16px 16px 18px;border-bottom:0;border-right:1px solid #0b0b0b}
  .cm-tile::before{top:auto;height:3px;width:100%;transform:scaleX(0);transform-origin:left}
  .cm-tile.on::before{transform:scaleX(1)}
}
@media (prefers-reduced-motion:reduce){
  .cm-hero-img,.cm-tile img,.cm-circle,.cm-item,.cm-item::before,.cm-tile::before{transition:none}
  .cm-hero-copy{animation:none}
}
`;
const PAGE_SIZE = 40;

// Remember which categories the user clicks, so we can rank them first
const INTEREST_KEY = "avo_cat_interest";
const loadInterest = () => {
  try { return JSON.parse(localStorage.getItem(INTEREST_KEY)) || {}; }
  catch { return {}; }
};
const saveInterest = (obj) => {
  try { localStorage.setItem(INTEREST_KEY, JSON.stringify(obj)); } catch {}
};

// Builds [1, "…", 4, 5, 6, "…", 12]
const getPageList = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
};

const PAGINATION_CSS = `
.pg{display:flex;align-items:center;justify-content:center;gap:10px;
  margin:40px 0 24px;flex-wrap:wrap}
.pg button{min-width:36px;height:36px;border-radius:50%;border:1px solid transparent;
  background:transparent;color:#222;font:inherit;font-size:.9rem;cursor:pointer;
  display:grid;place-items:center;padding:0;transition:background .2s,color .2s}
.pg button:hover:not(:disabled):not(.on){background:#f0f0f0}
.pg button.on{background:#222;color:#fff;font-weight:600}
.pg button.arrow{border-color:#ccc;font-size:1.2rem;padding-bottom:2px}
.pg button:disabled{opacity:.35;cursor:default}
.pg-dots{min-width:20px;text-align:center;color:#888}
.pg button:focus-visible{outline:2px solid #c4531a;outline-offset:2px}
`;

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <>
      <style>{PAGINATION_CSS}</style>
      <nav className="pg" aria-label="Pagination">
        <button className="arrow" disabled={page === 1}
          onClick={() => onChange(page - 1)} aria-label="Previous page">‹</button>

        {getPageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`d${i}`} className="pg-dots">…</span>
          ) : (
            <button key={p} className={p === page ? "on" : ""}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}>{p}</button>
          )
        )}

        <button className="arrow" disabled={page === totalPages}
          onClick={() => onChange(page + 1)} aria-label="Next page">›</button>
      </nav>
    </>
  );
}
function AvoCatShowcase({ onCatSelect, vouchers = [] }) {
  const [active, setActive] = useState(0);
  const tilesRef = useRef(null);

  const countFor = (cat) => vouchers.filter((v) => v.cat === cat).length;
  const current = CAT_TILES[active];
  const n = countFor(current.cat);

  // hovering the left list also scrolls the right column to that tile
  const goTo = (i) => {
    setActive(i);
    const box = tilesRef.current;
    const tile = box?.children[i];
    if (box && tile) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      box.scrollTo({
        [window.innerWidth <= 900 ? "left" : "top"]:
          window.innerWidth <= 900 ? tile.offsetLeft : tile.offsetTop,
        behavior: reduce ? "auto" : "smooth",
      });
    }
  };

  const Chevron = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <>
      <style>{CAT_MENU_CSS}</style>
      <section className="cm-wrap" aria-label="Browse by category">
        {/* ───── left list ───── */}
        <nav className="cm-list">
          <div className="cm-list-label">Categories</div>
          <ul>
            {CAT_TILES.map((t, i) => (
              <li key={t.cat}>
                <button
                  type="button"
                  className={"cm-item" + (i === active ? " on" : "")}
                  onMouseEnter={() => goTo(i)}
                  onFocus={() => goTo(i)}
                  onClick={() => onCatSelect(t.cat)}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ───── centre hero (crossfades) ───── */}
        <div
          className="cm-hero"
          role="link"
          tabIndex={0}
          onClick={() => onCatSelect(current.cat)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCatSelect(current.cat);
            }
          }}
        >
          {CAT_TILES.map((t, i) => (
            <img
              key={t.cat}
              src={t.img}
              alt={i === active ? t.name : ""}
              className={"cm-hero-img" + (i === active ? " on" : "")}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
          <div className="cm-hero-shade" />
          <div className="cm-hero-copy" key={current.cat}>
            <h2 className="cm-hero-title">{current.name}</h2>
            <p className="cm-hero-meta">
              {n > 0 ? `${n} available` : "New experiences"} · WhatsApp delivery
            </p>
            <span className="cm-more">
              Discover more
              <span className="cm-circle"><Chevron /></span>
            </span>
          </div>
        </div>

        {/* ───── right tiles: all categories ───── */}
        <div className="cm-tiles" ref={tilesRef}>
          {CAT_TILES.map((t, i) => (
            <button
              type="button"
              key={t.cat}
              className={"cm-tile" + (i === active ? " on" : "")}
              onMouseEnter={() => setActive(i)}
              onClick={() => onCatSelect(t.cat)}
            >
              <img src={t.img} alt="" loading="lazy" />
              <span className="cm-tile-shade" />
              <span className="cm-tile-name">{t.name}</span>
              <span className="cm-circle"><Chevron /></span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
const getCatIcon = (cat) => SYMBOLS[cat] || "◆";

const ALL_CATS = ["All", ...CATEGORIES.filter((c) => c.name !== "Other").map((c) => c.name)];

const CAT_ICONS = { All: "★", ...SYMBOLS };

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
 const FLASH_DEALS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap');

.fd-wrap{
  --y:#FFF200;
  --bg:#0b0b0b;
  --card:#161616;
  --line:rgba(255,255,255,.16);
  --dim:rgba(255,255,255,.62);
  --ease:cubic-bezier(.19,1,.22,1);
  --gap:20px;
  --display:'Barlow Condensed','Arial Narrow',Impact,sans-serif;
  --body:'Barlow',system-ui,sans-serif;

  container:fd / inline-size;      /* responds to its own width, not the viewport */
  background:var(--bg);
  color:#fff;
  font-family:var(--body);
  padding:48px 0 36px;
  width:100%;
  margin:0 0 32px;
}
.fd-wrap *{box-sizing:border-box}

/* ───────── header ───────── */
.fd-head{padding:0 24px;margin:0 0 28px}
.fd-title{
  margin:0 0 12px;
  font-family:var(--display);font-weight:700;
  font-size:clamp(1.9rem,6cqw,3rem);line-height:.95;
  letter-spacing:.02em;text-transform:uppercase;
  display:flex;align-items:center;gap:16px;
}
.fd-title::before{content:"";width:6px;height:1em;background:var(--y);flex:none}
.fd-sub{
  margin:0;font-size:.72rem;font-weight:500;
  letter-spacing:.22em;text-transform:uppercase;color:var(--dim);
}

/* ───────── slider ───────── */
.fd-slider{padding:0 24px}
.fd-row{
  display:flex;gap:var(--gap);
  overflow-x:auto;scroll-snap-type:x mandatory;
  scrollbar-width:none;padding-bottom:4px;
}
.fd-row::-webkit-scrollbar{display:none}

/* ───────── card ───────── */
.fd-card{
  flex:0 0 calc((100% - var(--gap) * 3) / 4);
  container-type:inline-size;
  scroll-snap-align:start;
  position:relative;display:flex;flex-direction:column;
  background:var(--card);border-radius:0;
  cursor:pointer;outline:none;overflow:hidden;
}
/* sweep bar on hover, coloured by urgency */
.fd-card::before{
  content:"";position:absolute;top:0;left:0;right:0;height:3px;z-index:3;
  background:var(--b,var(--y));
  transform:scaleX(0);transform-origin:left;
  transition:transform .8s var(--ease);
}
.fd-card:hover::before,.fd-card:focus-visible::before{transform:scaleX(1)}
.fd-card:focus-visible{outline:1px solid var(--y);outline-offset:4px}

.fd-img{position:relative;aspect-ratio:4/3;overflow:hidden;background:#222;display:grid;place-items:center}
.fd-img img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;
  filter:grayscale(.35) contrast(1.05);
  transform:scale(1);
  transition:transform 1.4s var(--ease),filter .8s ease;
}
.fd-card:hover .fd-img img,.fd-card:focus-visible .fd-img img{transform:scale(1.07);filter:none}
.fd-img::after{
  content:"";position:absolute;inset:auto 0 0 0;height:45%;
  background:linear-gradient(to top,var(--card),transparent);pointer-events:none;
}
.fd-fallback{font-size:2.4rem;opacity:.6;position:relative;z-index:1}
.fd-num{
  position:absolute;top:14px;left:16px;z-index:2;
  font-family:var(--display);font-weight:600;font-size:.95rem;letter-spacing:.14em;
}
.fd-badge{
  position:absolute;top:0;right:0;z-index:2;
  background:var(--b);color:#fff;
  padding:7px 12px;border-radius:0;
  font-family:var(--display);font-weight:700;font-size:.8rem;
  letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;
}

/* ───────── body ───────── */
.fd-body{display:flex;flex-direction:column;gap:12px;padding:6px 18px 20px;flex:1}
.fd-name{
  margin:0;
  font-family:var(--display);font-weight:700;
  font-size:clamp(1.1rem,8cqw,1.6rem);line-height:1.04;
  letter-spacing:.03em;text-transform:uppercase;
  text-wrap:balance;overflow-wrap:anywhere;
  min-height:2.08em;                         /* two lines reserved, cards stay level */
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}

/* urgency bar: shorter = closer to expiry */
.fd-urgency{height:3px;background:var(--line);position:relative;overflow:hidden}
.fd-urgency span{
  position:absolute;inset:0 auto 0 0;width:var(--left);background:var(--b);
  transform-origin:left;transition:transform .9s var(--ease);
}
.fd-card:hover .fd-urgency span{transform:scaleX(.94)}

.fd-meta{font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.fd-meta b{color:var(--b);font-weight:600}

.fd-foot{
  margin-top:auto;padding-top:14px;border-top:1px solid var(--line);
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}
.fd-price{font-family:var(--display);font-weight:700;font-size:1.35rem;letter-spacing:.04em}

.fd-btn{
  padding:10px 18px;background:transparent;color:#fff;
  border:1px solid rgba(255,255,255,.7);border-radius:0;
  font-family:var(--display);font-weight:600;font-size:.9rem;
  letter-spacing:.14em;text-transform:uppercase;cursor:pointer;
  transition:background .5s var(--ease),color .5s var(--ease),border-color .5s var(--ease);
}
.fd-card:hover .fd-btn,.fd-btn:hover{background:var(--y);color:#000;border-color:var(--y)}

/* ───────── controls ───────── */
.fd-controls{display:flex;align-items:center;gap:28px;margin-top:26px}
.fd-progress{flex:1;height:1px;background:var(--line);position:relative}
.fd-progress-thumb{
  position:absolute;top:-1px;height:3px;background:var(--y);
  transition:left .35s ease,width .35s ease;
}
.fd-arrows{display:flex;gap:10px}
.fd-arrow{
  width:46px;height:46px;display:grid;place-items:center;padding:0;
  background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:0;
  font-size:1.5rem;line-height:1;cursor:pointer;
  transition:background .4s var(--ease),color .4s var(--ease),border-color .4s var(--ease);
}
.fd-arrow:hover:not(:disabled){background:var(--y);color:#000;border-color:var(--y)}
.fd-arrow:disabled{opacity:.25;cursor:default}

/* ───────── responsive (by container width) ───────── */
@container fd (max-width:1000px){
  .fd-card{flex-basis:calc((100% - var(--gap) * 2) / 3)}
}
@container fd (max-width:700px){
  .fd-wrap,.fd-card{--gap:14px}
  .fd-card{flex-basis:calc((100% - var(--gap)) / 2)}
  .fd-head,.fd-slider{padding:0 16px}
  .fd-body{padding:4px 14px 16px}
  .fd-arrows{display:none}
}
@container fd (max-width:440px){
  .fd-card{flex-basis:76%}
}
@media (prefers-reduced-motion:reduce){
  .fd-card::before,.fd-img img,.fd-btn,.fd-urgency span{transition:none}
}
`;
const daysUntil = (date) =>
  Math.ceil((date.getTime() - Date.now()) / 86400000);
function AvoFlashDeals({ vouchers = [], onOpen }) {
  const rowRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [thumb, setThumb] = useState({ w: 100, x: 0 });

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
    const card = el.querySelector(".fd-card");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 20;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: reduceMotion() ? "auto" : "smooth" });
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
    };
  }, [expiring.length]);

  if (expiring.length === 0) return null;

  const badge = (days) => {
    if (days <= 7) return { bg: "#dc2626", label: days <= 1 ? "Last day" : `${days} days left` };
    if (days <= 30) return { bg: "#f59e0b", label: `${days} days left` };
    return { bg: "#16a34a", label: `${days} days left` };
  };

  return (
    <>
      <style>{FLASH_DEALS_CSS}</style>
      <section className="fd-wrap" aria-label="Expiring soon">
        <div className="fd-head">
          <h2 className="fd-title">Expiring Soon</h2>
          <p className="fd-sub">Grab them before they go</p>
        </div>

        <div className="fd-slider">
          <div className="fd-row" ref={rowRef}>
            {expiring.map(({ v, exp, days }, i) => {
              const b = badge(days);
              const img = v.imageUrl || v.img;
              const open = () => onOpen?.(v);
              return (
                <div
                  key={v.id}
                  className="fd-card"
                  style={{ "--b": b.bg, "--left": `${Math.max(6, Math.min(100, (days / 60) * 100))}%` }}
                  role="link"
                  tabIndex={0}
                  onClick={open}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      open();
                    }
                  }}
                >
                  <div className="fd-img">
                    {img ? (
                      <img src={img} alt={v.name} loading="lazy" />
                    ) : (
                      <span className="fd-fallback">{getCatIcon(v.cat)}</span>
                    )}
                    <span className="fd-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="fd-badge">{b.label}</span>
                  </div>

                  <div className="fd-body">
                    <h3 className="fd-name">{v.name}</h3>

                    <div className="fd-urgency" aria-hidden="true">
                      <span />
                    </div>

                    <div className="fd-meta">
                      Expires{" "}
                      <b>
                        {exp.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </b>
                    </div>

                    <div className="fd-foot">
                      <span className="fd-price">{fmt(v.price)}</span>
                      <button
                        type="button"
                        className="fd-btn"
                        tabIndex={-1}
                        aria-label={`View ${v.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          open();
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fd-controls">
            <div className="fd-progress" aria-hidden="true">
              <div
                className="fd-progress-thumb"
                style={{ width: `${thumb.w}%`, left: `${thumb.x}%` }}
              />
            </div>
            <div className="fd-arrows">
              <button
                type="button"
                className="fd-arrow"
                onClick={() => slide(-1)}
                disabled={!canPrev}
                aria-label="Previous deals"
              >
                ‹
              </button>
              <button
                type="button"
                className="fd-arrow"
                onClick={() => slide(1)}
                disabled={!canNext}
                aria-label="Next deals"
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

function AvoVoucherCard({ voucher: v, index = 0, onOpen, onPartnerOpen }) {
  const accent =
    {
      Music: "#5839b4",
      Events: "#b4396e",
      "Traditional Restaurants": "#8b5a1e",
      Florists: "#b4396c",
    }[v.cat] || "var(--green-primary)";

  const open = () => onOpen(v);

  return (
    <article
      className="avs-v-card"
      style={{ "--accent": accent, "--i": index }}
      onClick={open}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
      role="link"
      tabIndex={0}
    >
      <div className="avs-v-img">
        {v.imageUrl || v.img ? (
          <img src={v.imageUrl || v.img} alt={v.name} loading="lazy" />
        ) : (
          <span className="avs-v-fallback">{getCatIcon(v.cat)}</span>
        )}
        <span className="avs-v-view">View voucher</span>
      </div>

      <div className="avs-v-body">
        <div className="avs-v-cat">{v.cat}</div>

        <h3 className="avs-v-name">
          <span>{v.name}</span>
        </h3>

        {v.partnerRating > 0 && (
          <StarRating rating={v.partnerRating} reviewCount={v.partnerReviewCount} />
        )}

        <div className="avs-v-loc">
          <span className="avs-v-loclabel">Available at</span>
          <button
            type="button"
            className="avs-v-partner"
            onClick={(e) => {
              e.stopPropagation();
              onPartnerOpen?.(v.partnerId);
            }}
          >
            {v.partner}
          </button>
          <span className="avs-v-city"> · {v.city}</span>
        </div>

        <div className="avs-v-foot">
          <span className="avs-v-price">{fmt(v.price)}</span>
          <button
            type="button"
            className="avs-v-add"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            aria-label={`Buy ${v.name}`}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 0v12M0 6h12" />
            </svg>
          </button>
        </div>
      </div>
    </article>
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
        amount: Number(v.price).toFixed(2),
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
const [searchQuery, setSearchQuery] = useState("");   // fed by AvoSearchBar (step 4)
const [page, setPage_] = useState(1);
const [interest, setInterest] = useState(loadInterest);
const gridTopRef = useRef(null);

const handleCatSelect = (cat) => {
  setCurrentCat(cat);
  if (cat !== "All") {
    setInterest((prev) => {
      const next = { ...prev, [cat]: (prev[cat] || 0) + 1 };
      saveInterest(next);
      return next;
    });
  }
  onCatSelect?.(cat);
};

// Recommended order: only when NOT searching and no manual sort chosen.
// Categories the user cares about come first, cheapest first inside each.
const ranked = React.useMemo(() => {
  const isDefault = !searchQuery.trim() && sortVal === "default";
  if (!isDefault) return filteredResults;
  return [...filteredResults].sort((a, b) => {
    const ia = interest[a.cat] || 0;
    const ib = interest[b.cat] || 0;
    if (ia !== ib) return ib - ia;                    // favourite categories first
    return Number(a.price) - Number(b.price);         // then cheapest
  });
}, [filteredResults, searchQuery, sortVal, interest]);

const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
const pageItems = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

// back to page 1 whenever the result set changes
useEffect(() => { setPage_(1); }, [currentCat, sortVal, searchQuery, filteredResults.length]);

const goToPage = (p) => {
  setPage_(p);
  gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
};

  return (
    
    <div className="avs-page">
      {/* Greeting */}
      <HomeSEO />
     <HeroV2 vouchers={vouchers} onCatSelect={handleCatSelect} />
      {/* Category grid */}
     <AvoCatShowcase onCatSelect={handleCatSelect} vouchers={vouchers} />

      {/* Flash deals */}
     <AvoFlashDeals vouchers={vouchers} onOpen={onVoucherOpen} />

      {/* Category filter tabs */}
     <div
  className="cats-section"
  style={{ position: "relative", top: 64, zIndex: 1 }}
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
      onQueryChange={setSearchQuery}
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
    <div className="avs-section" ref={gridTopRef}>
  <div className="avs-voucher-grid">
    {loading ? (
      [...Array(8)].map((_, i) => <SkeletonVoucherCard key={i} />)
    ) : ranked.length === 0 ? (
      <AvoEmptyState query={searchQuery} currentCat={currentCat}
        onClear={() => handleCatSelect("All")} />
    ) : (
      pageItems.map((v) => (
        <AvoVoucherCard key={v.id} voucher={v}
          onOpen={onVoucherOpen} onPartnerOpen={onPartnerOpen} />
      ))
    )}
  </div>

  {!loading && (
    <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
  )}
</div>
</div>
      {/* Occasions */}
      <AvoOccasions />

      <div style={{ height: 32 }} />

     
    </div>
  );
}
export { AvoVoucherCard, SkeletonVoucherCard, AvoTrustStrip, ProductModal, CheckoutDrawer, ZAR_TO_USD, fmt };