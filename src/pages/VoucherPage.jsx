// Save next to StorePage.jsx (e.g. src/pages/VoucherPage.jsx)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { VoucherSEO } from "../components/Seo";
import { CheckoutDrawer, fmt } from "./StorePage";
import { idFromSlug, voucherPath, categoryPath } from "./paths";

export default function VoucherPage({ vouchers = [], loading, onPartnerOpen }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const v = vouchers.find((x) => x.firestoreId === idFromSlug(slug));

  // If the name/city changed, send old links to the current canonical URL
  useEffect(() => {
    if (v && `/voucher/${slug}` !== voucherPath(v)) {
      navigate(voucherPath(v), { replace: true });
    }
  }, [v, slug, navigate]);

  const wrap = {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "24px 16px 60px",
  };

  if (loading) {
    return (
      <main style={wrap}>
        <div
          className="skeleton"
          style={{ height: 24, width: 260, marginBottom: 20 }}
        />
        <div className="skeleton" style={{ height: 340, borderRadius: 16 }} />
      </main>
    );
  }

  if (!v) {
    return (
      <main style={{ ...wrap, textAlign: "center", paddingTop: 80 }}>
        <Helmet>
          <title>Voucher not found | AfriVoucher</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1 style={{ fontSize: "1.6rem", marginBottom: 8 }}>
          This voucher is no longer available
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>
          It may have expired or been removed by the provider.
        </p>
        <Link to="/" style={{ fontWeight: 700, color: "var(--green-primary)" }}>
          Browse all experiences →
        </Link>
      </main>
    );
  }

  const img = v.imageUrl || v.img;

  return (
    <main style={wrap}>
      <VoucherSEO voucher={v} />

      {/* Breadcrumbs (matches the BreadcrumbList structured data) */}
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: ".78rem", color: "var(--muted)", marginBottom: 18 }}
      >
        <Link to="/">Home</Link> › <Link to={categoryPath(v.cat)}>{v.cat}</Link>{" "}
        › <span>{v.name}</span>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            background: "var(--cream2, #eee)",
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "4rem",
          }}
        >
          {img ? (
            <img
              src={img}
              alt={v.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            "🎁"
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: ".72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--terra, #c4531a)",
              marginBottom: 6,
            }}
          >
            {v.cat}
          </div>

          <h1
            style={{ fontSize: "1.8rem", lineHeight: 1.2, margin: "0 0 10px" }}
          >
            {v.name}
          </h1>

          <div style={{ fontSize: ".9rem", marginBottom: 16 }}>
            📍{" "}
            <button
              onClick={() => onPartnerOpen?.(v.partnerId)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textDecoration: "underline",
                color: "var(--green-primary)",
                font: "inherit",
              }}
            >
              {v.partner}
            </button>{" "}
            · {v.city}
          </div>

          {v.desc && (
            <p style={{ lineHeight: 1.7, color: "var(--sub, #444)" }}>
              {v.desc}
            </p>
          )}

          {(v.includes || []).length > 0 && (
            <>
              <h2 style={{ fontSize: "1rem", margin: "20px 0 8px" }}>
                What's included
              </h2>
              <ul style={{ paddingLeft: 20, lineHeight: 1.8, margin: 0 }}>
                {v.includes.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              borderTop: "1px solid var(--border, #ddd)",
              marginTop: 22,
              paddingTop: 16,
            }}
          >
            <span style={{ color: "var(--muted)" }}>Voucher price</span>
            <span style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              {fmt(v.price)}
            </span>
          </div>

          <button
            className="modal-buy-btn"
            style={{ width: "100%", marginTop: 14 }}
            onClick={() => setCheckoutOpen(true)}
          >
            🎁 Buy This Voucher
          </button>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginTop: 16,
              fontSize: ".75rem",
              color: "var(--muted)",
            }}
          >
            <span>⏱️ Valid {v.expiry || "12 months"}</span>
            <span>📱 WhatsApp delivery</span>
            <span>🔒 Secure checkout</span>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutDrawer
          voucher={v}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </main>
  );
}
