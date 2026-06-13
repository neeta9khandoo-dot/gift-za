import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { initializeApp, getApps } from "firebase/app";
import {
  writeBatch, 
  doc, 
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// ─── Firebase ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const WORKER_URL = process.env.REACT_APP_WORKER_URL;
const UPLOAD_SECRET = process.env.REACT_APP_UPLOAD_SECRET;
/*
const fmtUSD = (n) =>
  `$${(Number(n) / ZAR_TO_USD).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
*/
const fmtZAR = (n) =>
  `R ${Number(n).toLocaleString("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const genCode = () =>
  "VCH-" +
  [...Array(8)]
    .map(
      () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
    )
    .join("");

const getCatIcon = (cat) =>
  ({
    Wellness: "🧖",
    Beauty: "💅",
    Adventure: "🪂",
    "Dining & Wine": "🍷",
    "Traditional Restaurants": "🍲",
    Stays: "🏡",
    Skills: "📚",
    Music: "🎵",
    Events: "🎪",
    Florists: "🌸",
    Other: "🎁",
  })[cat] || "🎁";

const ALL_CATEGORIES = [
  "Wellness",
  "Beauty",
  "Adventure",
  "Dining & Wine",
  "Traditional Restaurants",
  "Stays",
  "Skills",
  "Music",
  "Events",
  "Florists",
  "Other",
];

// ─── Styles ───────────────────────────────────────────────────────────────
const S = {
  // Layout
  page: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f4f5f7",
    minHeight: "100vh",
    fontSize: 13,
    color: "#1a1a2e",
  },
  // Top bar
  topbar: {
    background: "#fff",
    borderBottom: "1px solid #e8e8ee",
    padding: "0 24px",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topbarBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "#e8410c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  brandName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a2e",
    letterSpacing: -0.3,
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  // Content
  content: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "24px 24px",
  },
  // Page header
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1a1a2e",
    letterSpacing: -0.4,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 12,
    color: "#8a8a9a",
    marginTop: 3,
  },
  // Tab bar
  tabBar: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid #e8e8ee",
    marginBottom: 24,
  },
  tab: (active) => ({
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 500,
    color: active ? "#e8410c" : "#5a5a72",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #e8410c" : "2px solid transparent",
    marginBottom: -1,
    cursor: "pointer",
    transition: "all 0.15s",
    letterSpacing: -0.1,
  }),
  // Buttons
  btnPrimary: {
    padding: "8px 18px",
    background: "#e8410c",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  },
  btnSecondary: {
    padding: "8px 16px",
    background: "#fff",
    color: "#3a3a52",
    border: "1px solid #d0d0dc",
    borderRadius: 5,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  btnGhost: {
    padding: "7px 14px",
    background: "transparent",
    color: "#6a6a82",
    border: "none",
    borderRadius: 5,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.12s",
  },
  btnDanger: {
    padding: "7px 14px",
    background: "transparent",
    color: "#d0341a",
    border: "1px solid #f0c0b0",
    borderRadius: 5,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  // Cards
  card: {
    background: "#fff",
    border: "1px solid #e8e8ee",
    borderRadius: 8,
  },
  cardHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #e8e8ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1a1a2e",
    margin: 0,
  },
  cardBody: {
    padding: "20px",
  },
  // KPI tile
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  kpiTile: {
    background: "#fff",
    border: "1px solid #e8e8ee",
    borderRadius: 8,
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "#8a8a9a",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 600,
    color: "#1a1a2e",
    letterSpacing: -0.5,
    lineHeight: 1,
  },
  kpiAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: "8px 0 0 8px",
  },
  // Form
  formGrid: (cols = 2) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 16,
  }),
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "#5a5a72",
    letterSpacing: 0.1,
  },
  input: {
    padding: "8px 11px",
    border: "1px solid #d0d0dc",
    borderRadius: 5,
    fontSize: 13,
    color: "#1a1a2e",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "8px 11px",
    border: "1px solid #d0d0dc",
    borderRadius: 5,
    fontSize: 13,
    color: "#1a1a2e",
    background: "#fff",
    outline: "none",
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
    lineHeight: 1.6,
    minHeight: 80,
  },
  select: {
    padding: "8px 11px",
    border: "1px solid #d0d0dc",
    borderRadius: 5,
    fontSize: 13,
    color: "#1a1a2e",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
    appearance: "auto",
  },
  // Table
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#8a8a9a",
    background: "#f8f8fa",
    borderBottom: "1px solid #e8e8ee",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "11px 16px",
    borderBottom: "1px solid #f0f0f4",
    color: "#1a1a2e",
    verticalAlign: "middle",
  },
  // Badges
  badge: (color) => {
    const colors = {
      green: { bg: "#e6f7ed", color: "#1a7a40", border: "#b0e0c8" },
      red: { bg: "#fde8e4", color: "#c0340e", border: "#f4b8a8" },
      amber: { bg: "#fef3e2", color: "#9a6500", border: "#fad898" },
      blue: { bg: "#e4eef8", color: "#1456a0", border: "#a8caef" },
      gray: { bg: "#f0f0f4", color: "#5a5a72", border: "#d8d8e4" },
    };
    const c = colors[color] || colors.gray;
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 9px",
      borderRadius: 3,
      fontSize: 11,
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: 0.2,
    };
  },
  // Alerts
  alert: (type) => {
    const map = {
      error: { bg: "#fde8e4", color: "#a0280c", border: "#f4b8a8" },
      success: { bg: "#e6f7ed", color: "#186030", border: "#b0e0c8" },
      info: { bg: "#e4eef8", color: "#0c4080", border: "#a8caef" },
    };
    const c = map[type] || map.info;
    return {
      padding: "10px 14px",
      borderRadius: 5,
      fontSize: 12.5,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
    };
  },
};

// ─── KPI Tile ─────────────────────────────────────────────────────────────
function KpiTile({ label, value, accent = "#e8410c", icon }) {
  return (
    <div style={S.kpiTile}>
      <div style={{ ...S.kpiAccent, background: accent }} />
      <div style={S.kpiLabel}>{label}</div>
      <div style={S.kpiValue}>{value}</div>
      {icon && (
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 14,
            fontSize: 18,
            opacity: 0.15,
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

// ─── AnalyticsSection ─────────────────────────────────────────────────────
function AnalyticsSection({ vouchers, sold }) {
  const months = [...Array(6)].map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      label: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      revenue: 0,
      count: 0,
    };
  });

  sold.forEach((order) => {
    const d = order.createdAt?.toDate?.();
    if (!d) return;
    const m = months.findIndex(
      (x) => x.month === d.getMonth() && x.year === d.getFullYear(),
    );
    if (m >= 0) {
      months[m].revenue += order.price || 0;
      months[m].count += 1;
    }
  });

  const topMap = {};
  sold.forEach((o) => {
    const key = o.name || "Unknown";
    topMap[key] = (topMap[key] || 0) + 1;
  });
  const topVouchers = Object.entries(topMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.length > 22 ? name.slice(0, 20) + "…" : name,
      count,
    }));

  const totalRev = sold.reduce((s, o) => s + (o.price || 0), 0);
  const activeVouchers = vouchers.filter((v) => v.status === "active").length;
  const usedVouchers = vouchers.filter((v) => v.status === "used").length;
  const redemptionRate = vouchers.length
    ? Math.round((usedVouchers / vouchers.length) * 100)
    : 0;

  const kpis = [
    {
      label: "Total Revenue",
      value: fmtZAR(totalRev),
      accent: "#e8410c",
      icon: "💰",
    },
    { label: "Units Sold", value: sold.length, accent: "#1a6cb0", icon: "🛒" },
    {
      label: "Active Vouchers",
      value: activeVouchers,
      accent: "#1a7a40",
      icon: "✅",
    },
    { label: "Redeemed", value: usedVouchers, accent: "#9a6500", icon: "🔖" },
    {
      label: "Redemption Rate",
      value: `${redemptionRate}%`,
      accent: "#7840b0",
      icon: "📊",
    },
    {
      label: "Total Catalogue",
      value: vouchers.length,
      accent: "#1a6cb0",
      icon: "🎟️",
    },
  ];

  const emptyState = (msg) => (
    <div
      style={{
        textAlign: "center",
        padding: "36px 0",
        color: "#a0a0b8",
        fontSize: 12.5,
      }}
    >
      {msg}
    </div>
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={S.kpiGrid}>
        {kpis.map((k) => (
          <KpiTile key={k.label} {...k} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Revenue chart */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Revenue — last 6 months</span>
          </div>
          <div style={{ padding: "16px 16px 12px" }}>
            {totalRev === 0 ? (
              emptyState("No sales data yet")
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={months}
                  margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#a0a0b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#a0a0b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      `R${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                    }
                  />
                  <Tooltip
                    formatter={(v) => [fmtZAR(v), "Revenue"]}
                    contentStyle={{
                      borderRadius: 6,
                      border: "1px solid #e8e8ee",
                      fontSize: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                    cursor={{ fill: "#f8f8fa" }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#e8410c"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top vouchers */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Top-selling vouchers</span>
          </div>
          <div style={{ padding: "16px 16px 12px" }}>
            {topVouchers.length === 0 ? (
              emptyState("No sales data yet")
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={topVouchers}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f4"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#a0a0b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={115}
                    tick={{ fontSize: 10, fill: "#5a5a72" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 6,
                      border: "1px solid #e8e8ee",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "#f8f8fa" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#1a6cb0"
                    radius={[0, 3, 3, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ProspectingTool ──────────────────────────────────────────────────────
function ProspectingTool() {
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("Harare");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState([]);

  const CATEGORIES = [
    "spas",
    "beauty salons",
    "hair salons",
    "restaurants",
    "florists",
    "music venues",
    "event venues",
    "lodges",
    "adventure tours",
    "photography studios",
    "cooking classes",
  ];
  const CITIES = [
    "Harare",
    "Bulawayo",
    "Masvingo",
    "Victoria Falls",
    "Mutare",
    "Gweru",
    "Kwekwe",
  ];

  const search = async (customQuery) => {
    const q = customQuery || searchQuery;
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const term = `${q} ${city} Zimbabwe`;
      const res = await fetch(
        `${WORKER_URL}/places-search?query=${encodeURIComponent(term)}`,
        { headers: { "X-Upload-Secret": UPLOAD_SECRET } },
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results || []);
      if ((data.results || []).length === 0)
        setError("No results found. Try a different search term.");
    } catch {
      setError(
        "Could not connect to search. Make sure your Worker is set up with the Places API route.",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveContact = (place) =>
    setSaved((s) =>
      s.find((x) => x.place_id === place.place_id) ? s : [...s, place],
    );

  const copyAll = () => {
    const text = saved
      .map(
        (p) =>
          `${p.name} | ${p.formatted_phone_number || "no number"} | ${p.formatted_address}`,
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    alert(`${saved.length} contacts copied to clipboard`);
  };

  const waMessage = encodeURIComponent(
    "Hi! I run AfriVoucher — a Zimbabwe gift voucher platform. " +
      "We list local businesses so diaspora customers can gift your services to family back home. " +
      "Listing is free, setup takes 10 minutes, and we pay you weekly. " +
      "Can I show you how it works? 🇿🇼",
  );

  return (
    <div>
      {/* Search controls */}
      <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#8a8a9a",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 12,
          }}
        >
          Search Google Places
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSearchQuery(cat);
                search(cat);
              }}
              style={{
                padding: "4px 12px",
                borderRadius: 3,
                border: "1px solid",
                borderColor: searchQuery === cat ? "#e8410c" : "#d0d0dc",
                background: searchQuery === cat ? "#fde8e4" : "#fff",
                color: searchQuery === cat ? "#c0340e" : "#5a5a72",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            style={{ ...S.input, flex: 1, minWidth: 200 }}
            placeholder="e.g. spas · florists · music venues"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <select
            style={{ ...S.select, width: 160 }}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => search()}
            disabled={loading}
            style={{
              ...S.btnPrimary,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {error && (
          <div style={{ ...S.alert("error"), marginTop: 12 }}>{error}</div>
        )}
      </div>

      {/* Saved contacts bar */}
      {saved.length > 0 && (
        <div
          style={{
            ...S.card,
            padding: "12px 18px",
            marginBottom: 16,
            borderColor: "#b0e0c8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#1a7a40" }}>
            {saved.length} contact{saved.length !== 1 ? "s" : ""} saved
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copyAll} style={S.btnSecondary}>
              Copy all
            </button>
            <button onClick={() => setSaved([])} style={S.btnGhost}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{ ...S.card, padding: 16, display: "flex", gap: 12 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: "#f0f0f4",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  paddingTop: 4,
                }}
              >
                <div
                  style={{
                    height: 12,
                    background: "#f0f0f4",
                    borderRadius: 3,
                    width: "55%",
                  }}
                />
                <div
                  style={{
                    height: 10,
                    background: "#f4f4f8",
                    borderRadius: 3,
                    width: "38%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 12,
              color: "#8a8a9a",
              marginBottom: 10,
              fontWeight: 500,
            }}
          >
            {results.length} businesses found
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {results.map((place) => {
              const isSaved = !!saved.find(
                (x) => x.place_id === place.place_id,
              );
              const phone = place.formatted_phone_number;
              const cleanPhone = (phone || "").replace(/\D/g, "");

              return (
                <div
                  key={place.place_id}
                  style={{
                    ...S.card,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                    borderColor: isSaved ? "#b0e0c8" : "#e8e8ee",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      background: "#f4f5f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    🏢
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "#1a1a2e",
                        marginBottom: 2,
                      }}
                    >
                      {place.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#8a8a9a",
                        marginBottom: phone ? 3 : 0,
                      }}
                    >
                      📍 {place.formatted_address}
                    </div>
                    {phone && (
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1a7a40",
                        }}
                      >
                        📞 {phone}
                      </div>
                    )}
                    {!phone && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#b0b0c8",
                          fontStyle: "italic",
                        }}
                      >
                        No phone number listed
                      </div>
                    )}
                    {place.rating && (
                      <div
                        style={{ fontSize: 11, color: "#8a8a9a", marginTop: 2 }}
                      >
                        ⭐ {place.rating} · {place.user_ratings_total || 0}{" "}
                        reviews
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      flexShrink: 0,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {phone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "7px 13px",
                          background: "#25D366",
                          color: "#fff",
                          borderRadius: 5,
                          fontSize: 12,
                          fontWeight: 500,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        WhatsApp
                      </a>
                    )}
                    {phone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        style={{
                          ...S.btnSecondary,
                          textDecoration: "none",
                          fontSize: 12,
                        }}
                      >
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => saveContact(place)}
                      style={{
                        ...S.btnSecondary,
                        fontSize: 12,
                        background: isSaved ? "#e6f7ed" : "#fff",
                        borderColor: isSaved ? "#b0e0c8" : "#d0d0dc",
                        color: isSaved ? "#1a7a40" : "#5a5a72",
                      }}
                    >
                      {isSaved ? "✓ Saved" : "+ Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AddVoucherForm ───────────────────────────────────────────────────────
function AddVoucherForm({ user, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Wellness",
    price: "",
    validity: "12",
    desc: "",
    includes: "",
    city: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formStatus, setFormStatus] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const setF = (k) => (e) =>
    setFormData((f) => ({ ...f, [k]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setFormData({
      name: "",
      category: "Wellness",
      price: "",
      validity: "12",
      desc: "",
      includes: "",
      city: "",
    });
    setImageFile(null);
    setImagePreview("");
    setFormStatus(null);
  };

  const handleSubmit = async () => {
    if (!formData.name)
      return setFormStatus({
        type: "error",
        msg: "Please enter a voucher name.",
      });
    if (!formData.price || isNaN(+formData.price) || +formData.price < 1)
      return setFormStatus({
        type: "error",
        msg: "Please enter a valid price.",
      });
    if (!formData.desc)
      return setFormStatus({ type: "error", msg: "Please add a description." });

    setFormLoading(true);
    setFormStatus(null);

    try {
      let imageUrl = "";
      if (imageFile && WORKER_URL) {
        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("uid", user.uid);
        fd.append("name", imageFile.name.replace(/\.[^.]+$/, ""));
        const res = await fetch(`${WORKER_URL}/upload-image`, {
          method: "POST",
          headers: { "X-Upload-Secret": UPLOAD_SECRET },
          body: fd,
        });
        const data = await res.json();
        if (data.success) imageUrl = data.url;
      }

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(formData.validity));

      const voucherData = {
        code: genCode(),
        name: formData.name,
        category: formData.category,
        city: formData.city || "Zimbabwe",
        price: parseFloat(formData.price),
        desc: formData.desc,
        includes: formData.includes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        imageUrl,
        validMonths: parseInt(formData.validity),
        expiryDate: expiryDate.toISOString(),
        status: "active",
        soldCount: 0,
        totalRevenue: 0,
        uid: user.uid,
        businessEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: "manual",
      };

      const ref = await addDoc(
        collection(db, "users", user.uid, "vouchers"),
        voucherData,
      );
      await addDoc(collection(db, "all_vouchers"), {
        ...voucherData,
        firestoreId: ref.id,
        partnerUid: user.uid,
      });

      setFormStatus({
        type: "success",
        msg: `${formData.name} created and now live on the Experiences page.`,
      });
      clearForm();
      setTimeout(() => {
        onSuccess();
        setOpen(false);
        setFormStatus(null);
      }, 1800);
    } catch (e) {
      setFormStatus({ type: "error", msg: "Error: " + e.message });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ ...S.card, marginBottom: 20, overflow: "hidden" }}>
      {/* Accordion header */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "13px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          background: open ? "#fff" : "#f8f8fa",
          borderBottom: open ? "1px solid #e8e8ee" : "none",
          transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>+</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1a2e" }}>
            Add new voucher
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#8a8a9a",
              fontWeight: 400,
              marginLeft: 4,
            }}
          >
            — create a custom voucher including music &amp; events types
          </span>
        </div>
        <span
          style={{
            color: "#8a8a9a",
            fontSize: 11,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "",
          }}
        >
          ▼
        </span>
      </div>

      {open && (
        <div style={{ padding: "24px 24px 20px" }}>
          {/* Row 1: Name + Price */}
          <div style={{ ...S.formGrid(2), marginBottom: 16 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Voucher name *</label>
              <input
                style={S.input}
                type="text"
                value={formData.name}
                onChange={setF("name")}
                placeholder="e.g. Live Jazz Evening for Two"
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Price (ZAR) *</label>
              <input
                style={S.input}
                type="number"
                value={formData.price}
                onChange={setF("price")}
                placeholder="780"
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Category *</label>
              <select
                style={S.select}
                value={formData.category}
                onChange={setF("category")}
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {getCatIcon(c)} {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Valid for *</label>
              <select
                style={S.select}
                value={formData.validity}
                onChange={setF("validity")}
              >
                {["3", "6", "12", "18", "24"].map((m) => (
                  <option key={m} value={m}>
                    {m} months
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: City */}
          <div style={{ ...S.formGroup, marginBottom: 16 }}>
            <label style={S.label}>City / area *</label>
            <input
              style={S.input}
              value={formData.city}
              onChange={setF("city")}
              placeholder="Gweru, Victoria Falls, JHB…"
            />
          </div>

          {/* Description */}
          <div style={{ ...S.formGroup, marginBottom: 16 }}>
            <label style={S.label}>Description *</label>
            <textarea
              style={S.textarea}
              value={formData.desc}
              onChange={setF("desc")}
              placeholder="Describe what the customer will experience…"
            />
          </div>

          {/* Includes */}
          <div style={{ ...S.formGroup, marginBottom: 16 }}>
            <label style={S.label}>
              What's included{" "}
              <span style={{ fontWeight: 400, color: "#a0a0b8" }}>
                (comma separated)
              </span>
            </label>
            <input
              style={S.input}
              value={formData.includes}
              onChange={setF("includes")}
              placeholder="e.g. 2x concert tickets, Welcome cocktails, Programme booklet"
            />
          </div>

          {/* Image upload */}
          <div style={{ ...S.formGroup, marginBottom: 20 }}>
            <label style={S.label}>
              Voucher photo{" "}
              <span style={{ fontWeight: 400, color: "#a0a0b8" }}>
                (optional)
              </span>
            </label>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "24px 20px",
                border: "1.5px dashed #d0d0dc",
                borderRadius: 6,
                cursor: "pointer",
                background: "#f8f8fa",
                textAlign: "center",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontSize: 22 }}>🖼️</span>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#3a3a52",
                    margin: 0,
                  }}
                >
                  {imageFile ? imageFile.name : "Click to upload"}
                </p>
                <p style={{ fontSize: 11.5, color: "#a0a0b8", marginTop: 2 }}>
                  {imageFile ? "Change file" : "JPG, PNG or WebP — max 5 MB"}
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </label>

            {imagePreview && (
              <div
                style={{
                  marginTop: 10,
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid #e8e8ee",
                  position: "relative",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    borderRadius: "50%",
                    width: 26,
                    height: 26,
                    color: "white",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {formStatus && (
            <div
              style={{
                ...S.alert(formStatus.type === "error" ? "error" : "success"),
                marginBottom: 16,
              }}
            >
              {formStatus.msg}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={formLoading}
              style={{
                ...S.btnPrimary,
                opacity: formLoading ? 0.6 : 1,
                cursor: formLoading ? "not-allowed" : "pointer",
              }}
            >
              {formLoading ? "Saving…" : "Create voucher"}
            </button>
            <button onClick={clearForm} style={S.btnGhost}>
              Clear form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// eslint-disable-next-line no-unused-vars
async function updatePartnerRating(partnerId, newRating, newReviewCount) {
  const batch = writeBatch(db);

  // Update all their vouchers
  const vouchersSnap = await getDocs(
    query(collection(db, "vouchers"), where("partnerId", "==", partnerId))
  );
  vouchersSnap.docs.forEach((d) => {
    batch.update(d.ref, {
      partnerRating: newRating,
      partnerReviewCount: newReviewCount,
    });
  });

  // Update the partner doc itself
  batch.update(doc(db, "partners", partnerId), {
    rating: newRating,
    reviewCount: newReviewCount,
  });

  await batch.commit();
}
// ─── AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage({ user, onLogout }) {
  const [vouchers, setVouchers] = useState([]);
  const [sold, setSold] = useState([]);
  const [bizName, setBizName] = useState("Partner Dashboard");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vouchers");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const vSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "vouchers"),
          orderBy("createdAt", "desc"),
        ),
      );
      setVouchers(vSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      try {
        const sSnap = await getDocs(
          query(
            collection(db, "sold_vouchers"),
            where("uid", "==", user.uid),
            orderBy("createdAt", "desc"),
          ),
        );
        setSold(sSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        /* sold_vouchers may not exist yet */
      }

      try {
        const uSnap = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid)),
        );
        if (!uSnap.empty)
          setBizName(uSnap.docs[0].data().businessName || "Partner Dashboard");
      } catch {
        /* ignore */
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const statusBadge = (s) => {
    if (s === "active") return <span style={S.badge("green")}>Active</span>;
    if (s === "used") return <span style={S.badge("red")}>Used</span>;
    return <span style={S.badge("amber")}>{s}</span>;
  };

  return (
    <div style={S.page}>
      {/* Top navigation bar */}
      <div style={S.topbar}>
        <div style={S.topbarBrand}>
          <div style={S.brandDot}>AV</div>
          <span style={S.brandName}>AfriVoucher</span>
          <span style={{ fontSize: 12, color: "#c0c0d0", margin: "0 6px" }}>
            ›
          </span>
          <span style={{ fontSize: 13, color: "#5a5a72" }}>{bizName}</span>
        </div>
        <div style={S.topbarRight}>
          <span style={{ fontSize: 12, color: "#8a8a9a", marginRight: 4 }}>
            {user?.email}
          </span>
          <button onClick={load} style={S.btnGhost} title="Refresh">
            ↻
          </button>
          <button onClick={onLogout} style={S.btnDanger}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={S.content}>
        {/* Page header */}
        <div style={S.pageHeader}>
          <h1 style={S.pageTitle}>{bizName}</h1>
          <p style={S.pageSubtitle}>{vouchers.length} vouchers in catalogue</p>
        </div>

        {/* Tab bar */}
        <div style={S.tabBar}>
          {[
            ["vouchers", "My Vouchers"],
            ["prospecting", "Find Partners"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={S.tab(activeTab === id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Vouchers tab */}
        {activeTab === "vouchers" && (
          <>
            <AnalyticsSection vouchers={vouchers} sold={sold} />

            <AddVoucherForm user={user} onSuccess={load} />

            {/* Vouchers table */}
            <div style={{ ...S.card, marginBottom: 24 }}>
              <div style={S.cardHeader}>
                <span style={S.cardTitle}>Vouchers</span>
                <button onClick={load} style={S.btnSecondary}>
                  ↻ Refresh
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {[
                        "Code",
                        "Name",
                        "Category",
                        "Price",
                        "City",
                        "Valid until",
                        "Status",
                        "Created",
                      ].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            ...S.td,
                            textAlign: "center",
                            padding: 32,
                            color: "#a0a0b8",
                          }}
                        >
                          Loading vouchers…
                        </td>
                      </tr>
                    ) : vouchers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            ...S.td,
                            textAlign: "center",
                            padding: 48,
                            color: "#a0a0b8",
                          }}
                        >
                          No vouchers yet. Add your first one above.
                        </td>
                      </tr>
                    ) : (
                      vouchers.map((v) => (
                        <tr key={v.id} style={{ background: "#fff" }}>
                          <td
                            style={{
                              ...S.td,
                              fontFamily: "monospace",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#e8410c",
                              letterSpacing: 0.5,
                            }}
                          >
                            {v.code || "—"}
                          </td>
                          <td
                            style={{ ...S.td, fontWeight: 500, maxWidth: 220 }}
                          >
                            {v.name || "—"}
                          </td>
                          <td style={{ ...S.td, color: "#5a5a72" }}>
                            {getCatIcon(v.category)} {v.category || "—"}
                          </td>
                          <td
                            style={{
                              ...S.td,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtZAR(v.price || 0)}
                          </td>
                          <td style={{ ...S.td, color: "#5a5a72" }}>
                            {v.city || "—"}
                          </td>
                          <td
                            style={{
                              ...S.td,
                              color: "#5a5a72",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.expiryDate
                              ? new Date(v.expiryDate).toLocaleDateString(
                                  "en-ZA",
                                )
                              : "—"}
                          </td>
                          <td style={S.td}>{statusBadge(v.status)}</td>
                          <td
                            style={{
                              ...S.td,
                              color: "#8a8a9a",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.createdAt
                              ?.toDate?.()
                              ?.toLocaleDateString("en-ZA") || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Prospecting tab */}
        {activeTab === "prospecting" && <ProspectingTool />}
      </div>
    </div>
  );
}
