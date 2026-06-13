import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../shared/firebase"; // adjust path to your firebase config

// ─── Constants ─────────────────────────────────────────────────────────────────
const ZAR_TO_USD = 16.53;
const fmt = (n) =>
  `US$${(Number(n) / ZAR_TO_USD).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Firestore shape expected ───────────────────────────────────────────────────
//
// Collection: "partners"
// Document ID: partnerId (slug, e.g. "ancient-city-lodge")
// Fields:
//   name         string   "Ancient City Lodge"
//   tagline      string   "Where Zimbabwe's history meets modern comfort"
//   bio          string   Long-form description
//   city         string   "Harare"
//   category     string   "Stays"
//   coverUrl     string   Hero image URL
//   logoUrl      string   Square logo URL (optional)
//   photos       string[] Array of image URLs (gallery)
//   whatsapp     string   "+263771234567"
//   website      string   "https://..."  (optional)
//   instagram    string   "@ancientcitylodge" (optional)
//   verified     boolean
//   rating       number   4.8
//   reviewCount  number   142
//   since        string   "2021"  (year joined AfriVoucher)
//
// Collection: "vouchers"
// Query: where("partnerId", "==", partnerId)

// ─── Skeleton ───────────────────────────────────────────────────────────────────
function PartnerSkeleton() {
  const s = (w, h, r = 8) => (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: r, flexShrink: 0 }}
    />
  );
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 16px 48px" }}>
      {s("100%", 220, 0)}
      <div style={{ display: "flex", gap: 16, marginTop: -40, padding: "0 20px", alignItems: "flex-end" }}>
        {s(80, 80, 14)}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8 }}>
          {s("60%", 22, 6)}
          {s("40%", 14, 6)}
        </div>
      </div>
      <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {s("100%", 14, 6)}
        {s("90%", 14, 6)}
        {s("70%", 14, 6)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}

// ─── VoucherCard (mini, partner-page variant) ───────────────────────────────────
function PartnerVoucherCard({ voucher: v, onOpen }) {
  return (
    <div
      onClick={() => onOpen(v)}
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "relative", height: 120, background: "var(--cream2)", overflow: "hidden" }}>
        {v.imageUrl || v.img ? (
          <img
            src={v.imageUrl || v.img}
            alt={v.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem" }}>
            🎁
          </div>
        )}
        <span style={{
          position: "absolute", top: 8, left: 8,
          background: "var(--green-primary)", color: "#fff",
          fontSize: ".62rem", fontWeight: 800, padding: "3px 8px",
          borderRadius: 20, letterSpacing: .5,
        }}>
          {v.cat}
        </span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--forest)", marginBottom: 4, lineHeight: 1.3 }}>
          {v.name}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--green-primary)" }}>
            {fmt(v.price)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(v); }}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--green-primary)", color: "#fff",
              border: "none", fontSize: "1.2rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, lineHeight: 1,
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

// ─── Photo gallery ──────────────────────────────────────────────────────────────
function PhotoGallery({ photos }) {
  const [lightbox, setLightbox] = useState(null);
  if (!photos?.length) return null;

  return (
    <div style={{ marginTop: 28 }}>
      <SectionLabel>Gallery</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        marginTop: 12,
      }}>
        {photos.slice(0, 6).map((url, i) => (
          <div
            key={i}
            onClick={() => setLightbox(i)}
            style={{
              height: i === 0 ? 160 : 100,
              gridColumn: i === 0 ? "span 2" : "span 1",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
              background: "var(--cream2)",
            }}
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .2s" }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.target.style.transform = "none")}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
            zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: 18, right: 18,
              background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
              borderRadius: "50%", width: 38, height: 38, fontSize: "1.1rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((l) => l - 1); }}
              style={{ position: "absolute", left: 18, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: "50%", width: 38, height: 38, fontSize: "1.3rem", cursor: "pointer" }}
            >
              ‹
            </button>
          )}
          <img
            src={photos[lightbox]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, objectFit: "contain" }}
          />
          {lightbox < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((l) => l + 1); }}
              style={{ position: "absolute", right: 18, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: "50%", width: 38, height: 38, fontSize: "1.3rem", cursor: "pointer" }}
            >
              ›
            </button>
          )}
          <div style={{ position: "absolute", bottom: 18, color: "rgba(255,255,255,.6)", fontSize: ".8rem" }}>
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase",
      letterSpacing: 1.2, color: "var(--terra)", marginBottom: 2,
    }}>
      {children}
    </div>
  );
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: ".82rem",
            color: i < full ? "#f5a623" : i === full && half ? "#f5a623" : "#ddd",
          }}
        >
          {i < full ? "★" : i === full && half ? "½" : "★"}
        </span>
      ))}
    </span>
  );
}

// ─── PartnerPage ─────────────────────────────────────────────────────────────────
/**
 * Props:
 *   partnerId  – Firestore document ID (slug)
 *   onBack     – () => void   navigate back
 *   onOpenVoucher – (voucher) => void   opens ProductModal
 */
export default function PartnerPage({ partnerId, onBack, onOpenVoucher }) {
  const [partner, setPartner] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partnerId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      // Fetch partner document
      getDoc(doc(db, "partners", partnerId)),
      // Fetch their vouchers
      getDocs(query(collection(db, "vouchers"), where("partnerId", "==", partnerId))),
    ])
      .then(([partnerSnap, vouchersSnap]) => {
        if (!partnerSnap.exists()) {
          setError("Partner not found.");
          return;
        }
        setPartner({ id: partnerSnap.id, ...partnerSnap.data() });
        setVouchers(vouchersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      })
      .catch(() => setError("Could not load partner. Please try again."))
      .finally(() => setLoading(false));
  }, [partnerId]);

  if (loading) return <PartnerSkeleton />;

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠</div>
        <div style={{ color: "var(--forest)", fontWeight: 600, marginBottom: 8 }}>{error}</div>
        <button onClick={onBack} style={backBtnStyle}>← Back to browse</button>
      </div>
    );
  }

  if (!partner) return null;

  const p = partner;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", paddingBottom: 64 }}>

      {/* ── Back ── */}
      <div style={{ padding: "12px 16px 0" }}>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
      </div>

      {/* ── Hero cover ── */}
      <div style={{ position: "relative", height: 220, background: "var(--cream2)", overflow: "hidden", marginTop: 8 }}>
        {p.coverUrl ? (
          <img
            src={p.coverUrl}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
            🏢
          </div>
        )}
        {/* Subtle bottom fade */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.35))" }} />
      </div>

      {/* ── Identity row ── */}
      <div style={{ padding: "0 20px", marginTop: -36, position: "relative", zIndex: 2, display: "flex", gap: 14, alignItems: "flex-end" }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 14, flexShrink: 0,
          border: "3px solid var(--white)", background: "var(--white)",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,.12)",
        }}>
          {p.logoUrl ? (
            <img src={p.logoUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "1.8rem" }}>🏪</span>
          )}
        </div>

        <div style={{ paddingBottom: 6, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--forest)", margin: 0, lineHeight: 1.2 }}>
              {p.name}
            </h1>
            {p.verified && (
              <span style={{
                background: "rgba(0,140,60,.1)", color: "var(--green-primary)",
                fontSize: ".62rem", fontWeight: 800, padding: "2px 8px",
                borderRadius: 20, letterSpacing: .5, border: "1px solid rgba(0,140,60,.2)",
              }}>
                ✓ Verified
              </span>
            )}
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 3 }}>
            📍 {p.city} · {p.category}
            {p.since && ` · On AfriVoucher since ${p.since}`}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>

        {/* ── Rating ── */}
        {p.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <StarRating rating={p.rating} />
            <span style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--forest)" }}>{p.rating.toFixed(1)}</span>
            {p.reviewCount && (
              <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>({p.reviewCount.toLocaleString()} reviews)</span>
            )}
          </div>
        )}

        {/* ── Tagline ── */}
        {p.tagline && (
          <p style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", color: "var(--forest)", lineHeight: 1.55, margin: "0 0 20px", fontStyle: "italic" }}>
            "{p.tagline}"
          </p>
        )}

        {/* ── Bio ── */}
        {p.bio && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>About</SectionLabel>
            <p style={{ fontSize: ".88rem", color: "var(--sub)", lineHeight: 1.75, margin: "8px 0 0", whiteSpace: "pre-line" }}>
              {p.bio}
            </p>
          </div>
        )}

        {/* ── Contact strip ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {p.whatsapp && (
            <a
              href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}?text=Hi ${encodeURIComponent(p.name)}! I found you on AfriVoucher.`}
              target="_blank"
              rel="noopener noreferrer"
              style={contactBtnStyle("#25D366")}
            >
              💬 WhatsApp
            </a>
          )}
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer" style={contactBtnStyle("var(--green-primary)")}>
              🌐 Website
            </a>
          )}
          {p.instagram && (
            <a
              href={`https://instagram.com/${p.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={contactBtnStyle("#c13584")}
            >
              📸 {p.instagram}
            </a>
          )}
        </div>

        {/* ── Photo gallery ── */}
        <PhotoGallery photos={p.photos} />

        {/* ── Vouchers ── */}
        <div style={{ marginTop: 32 }}>
          <SectionLabel>Available experiences</SectionLabel>
          <div style={{ marginTop: 4, marginBottom: 14, fontSize: ".78rem", color: "var(--muted)" }}>
            {vouchers.length} voucher{vouchers.length !== 1 ? "s" : ""} available from {p.name}
          </div>

          {vouchers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: ".88rem" }}>
              No vouchers available right now — check back soon.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {vouchers.map((v) => (
                <PartnerVoucherCard key={v.id} voucher={v} onOpen={onOpenVoucher} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const backBtnStyle = {
  background: "none",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  padding: "6px 14px",
  fontSize: ".78rem",
  fontWeight: 600,
  color: "var(--sub)",
  cursor: "pointer",
  fontFamily: "var(--sans)",
};

const contactBtnStyle = (bg) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  background: bg,
  color: "#fff",
  borderRadius: 9,
  fontSize: ".78rem",
  fontWeight: 700,
  textDecoration: "none",
  fontFamily: "var(--sans)",
});