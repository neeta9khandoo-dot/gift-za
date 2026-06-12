import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const ZAR_TO_USD = 16.53;

const CAT_ICONS = {
  Wellness: "🧖",
  Beauty: "💅",
  Adventure: "🪂",
  "Dining & Wine": "🍷",
  Stays: "🏡",
  Skills: "📚",
  Music: "🎵",
  Events: "🎪",
  Florists: "🌸",
  "Traditional Restaurants": "🍲",
  Other: "🎁",
};

const getCatIcon = (cat) => CAT_ICONS[cat] || "🎁";

const STATUS_COLOR = { delivered: "#1a9e56", pending: "#f59e0b", redeemed: "#6366f1" };
const STATUS_ICON  = { delivered: "✅", pending: "⏳", redeemed: "🎟️" };

// ─── Skeleton row ─────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: 12, padding: 20, display: "flex", gap: 14,
    }}>
      <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton skel-line med" />
        <div className="skeleton skel-line short" />
        <div className="skeleton skel-line" style={{ width: "40%" }} />
      </div>
    </div>
  );
}

// ─── OrdersPage ───────────────────────────────────────────────────────────
// Props:
//   user         — Firebase auth user object
//   firebaseApp  — initialised Firebase app instance
export default function OrdersPage({ user, firebaseApp }) {
  const db = getFirestore(firebaseApp);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "sold_vouchers"),
            where("buyerEmail", "==", user.email),
            orderBy("createdAt", "desc"),
          ),
        );
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn("Orders fetch:", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, db]);

  return (
    <div className="container" style={{ maxWidth: 760, padding: "48px 24px" }}>
      <p style={{
        fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: 1.5, color: "var(--red)", marginBottom: 8,
      }}>
        ✦ My Account
      </p>
      <h2 style={{
        fontSize: "2rem", fontWeight: 800, color: "var(--black)",
        letterSpacing: "-.4px", marginBottom: 4,
      }}>
        Order History
      </h2>
      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 32 }}>
        All your gifted experiences in one place
      </p>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎁</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--black)", marginBottom: 8 }}>
            No orders yet
          </h3>
          <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>
            Vouchers you purchase will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => {
            const st = order.status || "delivered";
            const recipientClean = (order.recipientPhone || "").replace(/\D/g, "");
            const resendUrl =
              `https://wa.me/${recipientClean}` +
              `?text=Here's your AfriVoucher gift code: ${order.code}`;

            return (
              <div key={order.id} style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: 14, padding: 20,
                display: "flex", alignItems: "center",
                gap: 16, flexWrap: "wrap",
              }}>
                {/* Category icon */}
                <div style={{
                  width: 68, height: 68, borderRadius: 10,
                  background: "var(--bg2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2rem", flexShrink: 0,
                }}>
                  {getCatIcon(order.category)}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{
                    fontWeight: 700, fontSize: ".95rem",
                    color: "var(--black)", marginBottom: 3,
                  }}>
                    {order.name || "Voucher"}
                  </div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: 6 }}>
                    To: {order.recipientPhone || "—"} ·{" "}
                    {order.createdAt?.toDate?.()?.toLocaleDateString("en-ZA") || "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontFamily: "monospace", fontSize: ".78rem", fontWeight: 700,
                      background: "var(--bg2)", border: "1px solid var(--border)",
                      borderRadius: 5, padding: "2px 8px", letterSpacing: 1,
                      color: "var(--black)",
                    }}>
                      {order.code || "—"}
                    </span>
                    <span style={{
                      fontSize: ".7rem", fontWeight: 700, padding: "2px 8px",
                      borderRadius: 4,
                      background: `${STATUS_COLOR[st]}18`,
                      color: STATUS_COLOR[st],
                      border: `1px solid ${STATUS_COLOR[st]}30`,
                    }}>
                      {STATUS_ICON[st]} {st}
                    </span>
                  </div>
                </div>

                {/* Price + Resend */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontSize: "1.1rem", fontWeight: 800,
                    color: "var(--black)", marginBottom: 8,
                  }}>
                    US${(Number(order.price || 0) / ZAR_TO_USD).toFixed(2)}
                  </div>
                  {order.recipientPhone && (
                    <a
                      href={resendUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "7px 14px", background: "#25D366", color: "#fff",
                        borderRadius: 7, fontSize: ".75rem", fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      💬 Resend
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}