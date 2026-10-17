import React, { useState, useEffect } from "react";
import { CategorySEO } from "../components/Seo";
import { AvoSearchBar, AvoEmptyState } from "./AvoSearch";
import {
  AvoVoucherCard,
  SkeletonVoucherCard,
  AvoTrustStrip,
  ProductModal,
  CheckoutDrawer,
  ZAR_TO_USD,
  fmt,
} from "./StorePage";

// ─── Category list + icons (same glyph set as StorePage) ──────────────────
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
  All: "★",
  Wellness: "☯",
  "Hair & Beauty": "✦",
  Adventure: "✈",
  "Dining & Wine": "◈",
  "Traditional Restaurants": "⊕",
  Stays: "⌂",
  Florists: "✿",
  Skills: "◎",
  Music: "♪",
  Events: "✺",
};

// ─── Category hero metadata ───────────────────────────────────────────────
const CAT_META = {
  Adventure: {
    icon: "✈",
    img: "/images/ancient-city-lodge-masvingo-698880.webp",
    color: "#1a3a4a",
    tagline: "Push their limits. Create stories worth telling.",
    desc: "From 15,000ft skydives to hot air balloon sunrises, Zimbabwe's most thrilling experiences, gifted from wherever you are.",
  },
  Wellness: {
    icon: "☯",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
    color: "#1a2e1f",
    tagline: "Rest, restore and feel completely renewed.",
    desc: "Treat someone back home to the gift of stillness: massages, spa days and full pamper packages from Zimbabwe's top wellness partners.",
  },
  "Hair & Beauty": {
    icon: "✦",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
    color: "#2e1a22",
    tagline: "Because they deserve to feel gorgeous.",
    desc: "Gel manis, spa pedis, bridal packages and full glam treatments from Zimbabwe's top salons.",
  },
  "Dining & Wine": {
    icon: "◈",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
    color: "#2e1a0e",
    tagline: "Food is love. Gift a table worth remembering.",
    desc: "Wine tastings, braai masterclasses and fine dining experiences for the food lovers in your family.",
  },
  "Traditional Restaurants": {
    icon: "⊕",
    img: "/images/kwaterry.jpg",
    color: "#2e1f0a",
    tagline: "The taste of home, gifted from anywhere in the world.",
    desc: "Sadza, dovi, road runner chicken. Send mum, dad or the whole family for a proper Zimbabwean meal, even when you're miles away.",
  },
  Music: {
    icon: "♪",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
    color: "#1a1a2e",
    tagline: "Give the gift of live music.",
    desc: "Jazz evenings, studio sessions, DJ workshops and concert tickets for the music lovers who deserve a night to remember.",
  },
  Events: {
    icon: "✺",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    color: "#2e1a2e",
    tagline: "Every occasion deserves a celebration.",
    desc: "Birthday bundles, kids parties and anniversary dinners, fully hosted for the family back home.",
  },
  Florists: {
    icon: "✿",
    img: "https://images.unsplash.com/photo-1487530811015-780b95070bb5?w=1200&q=80",
    color: "#2e1a1f",
    tagline: "Say it with flowers.",
    desc: "Bouquets, luxury arrangements and weekly subscriptions from Zimbabwe's finest florists, delivered to their door.",
  },
  Stays: {
    icon: "⌂",
    img: "/images/ancient-city-lodge-masvingo-698880.webp",
    color: "#1a2e1f",
    tagline: "A getaway they'll never forget.",
    desc: "Lodge stays, heritage escapes and weekend retreats. Zimbabwe's most beautiful places to wake up.",
  },
  Skills: {
    icon: "◎",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
    color: "#1a1f2e",
    tagline: "The gift of knowledge lasts a lifetime.",
    desc: "Language lessons, cooking masterclasses, sculpture workshops and more, for the curious.",
  },
};

// Vouchers may be stored as "Beauty" while the tab says "Hair & Beauty"
const META_ALIAS = { Beauty: "Hair & Beauty" };

const DEFAULT_META = {
  icon: "◆",
  img: "",
  color: "#1a2e1f",
  tagline: "Discover amazing experiences.",
  desc: "Browse our curated selection of vouchers.",
};

// ─── CategoryPage ─────────────────────────────────────────────────────────
/**
 * Props:
 *   cat           – active category name (e.g. "Wellness")
 *   vouchers      – FULL vouchers array (AvoSearchBar filters by cat, as on StorePage)
 *   loading       – boolean, shows skeleton cards
 *   onBack        – called when the user clicks Back or the "All" tab
 *   onCatSelect   – called with a category name when a tab is picked
 *   onPartnerOpen – called with partnerId when a partner name is clicked
 */
export default function CategoryPage({
  cat,
  vouchers = [],
  loading,
  onBack,
  onCatSelect,
  onPartnerOpen,
}) {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [drawerVoucher, setDrawerVoucher] = useState(null);
  const [sortVal, setSortVal] = useState("default");
  const [filteredResults, setFilteredResults] = useState([]);

  const meta = CAT_META[META_ALIAS[cat] || cat] || DEFAULT_META;

  // Scroll to top whenever the category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cat]);

  // Tab clicks: "All" returns to the store, anything else switches category
  const handleCatSelect = (c) => {
    if (c === "All") onBack?.();
    else onCatSelect?.(c);
  };

  // Hero stats come from the results the search bar has already filtered
  const lowestPrice = filteredResults.length
    ? Math.min(...filteredResults.map((v) => v.price || 0))
    : 0;

  return (
    <div className="avs-page">
      {/* ── Category hero ── */}
      <CategorySEO cat={cat} vouchers={vouchers.filter(v => v.cat === cat)} />
      <div
        style={{
          position: "relative",
          minHeight: 380,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to top, ${meta.color} 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.15) 100%)${
              meta.img ? `, url('${meta.img}')` : ""
            }`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            backgroundRepeat: "no-repeat",
          }}
        />

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
              [loading ? "…" : filteredResults.length, "Experiences available"],
              [
                filteredResults.length ? fmt(lowestPrice) : "—",
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

      {/* ── Category tabs + search + sort (same bar as StorePage) ── */}
      <div
        className="cats-section"
        style={{ position: "sticky", top: 64, zIndex: 90 }}
      >
        <div className="avs-wrap">
          <AvoSearchBar
            currentCat={cat}
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

      {/* ── Trust strip ── */}
      <div className="avs-wrap">
        <AvoTrustStrip />
      </div>

      {/* ── Voucher grid ── */}
      <div className="avs-section">
        <div className="avs-section-head">
          <span className="avs-section-title">
            {cat}
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 400,
                color: "#aaa",
                marginLeft: 6,
              }}
            >
              {loading ? "Loading…" : `${filteredResults.length} available`}
            </span>
          </span>
        </div>

        <div className="avs-voucher-grid">
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonVoucherCard key={i} />)
          ) : filteredResults.length === 0 ? (
            <AvoEmptyState query="" currentCat={cat} onClear={onBack} />
          ) : (
            filteredResults.map((v) => (
              <AvoVoucherCard
                key={v.id}
                voucher={v}
                onOpen={setSelectedVoucher}
                onPartnerOpen={onPartnerOpen}
              />
            ))
          )}
        </div>
      </div>

      <div style={{ height: 32 }} />

      {/* ── Modals (shared with StorePage, so Paynow checkout works here too) ── */}
      {selectedVoucher && (
        <ProductModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onBuy={() => {
            setDrawerVoucher(selectedVoucher);
            setSelectedVoucher(null);
          }}
          onPartnerOpen={onPartnerOpen}
        />
      )}
      {drawerVoucher && (
        <CheckoutDrawer
          voucher={drawerVoucher}
          onClose={() => setDrawerVoucher(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}