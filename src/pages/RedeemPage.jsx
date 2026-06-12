import React, { useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const RESULT_COLORS = { ok: "var(--leaf)", warn: "#F59E0B", error: "#EF4444" };
const RESULT_ICONS = { ok: "✅", warn: "⚠️", error: "❌" };

// ─── RedeemPage ───────────────────────────────────────────────────────────
// Props:
//   user        — Firebase auth user object
//   firebaseApp — initialised Firebase app instance
export default function RedeemPage({ user, firebaseApp }) {
  const db = getFirestore(firebaseApp);

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    setResult(null);

    const upperCode = code.trim().toUpperCase();

    try {
      const vouchersRef = collection(db, "users", user.uid, "vouchers");
      const q = query(vouchersRef, where("code", "==", upperCode));
      const snap = await getDocs(q);

      if (snap.empty) {
        setResult({
          type: "error",
          title: "Not Found",
          msg: `No voucher with code <strong>${upperCode}</strong> found under your account.`,
        });
        return;
      }

      const vDoc = snap.docs[0];
      const v = vDoc.data();

      if (v.status === "used") {
        setResult({
          type: "warn",
          title: "Already Redeemed",
          msg: "This voucher was already redeemed.",
        });
        return;
      }
      if (v.status === "expired") {
        setResult({
          type: "warn",
          title: "Expired",
          msg: "This voucher has expired.",
        });
        return;
      }

      await updateDoc(doc(db, "users", user.uid, "vouchers", vDoc.id), {
        status: "used",
        usedAt: serverTimestamp(),
        redeemedBy: user.email,
        updatedAt: serverTimestamp(),
      });

      setResult({
        type: "ok",
        title: "Valid — Redeemed!",
        msg: `<strong>${v.name}</strong><br/>Category: <strong>${v.category}</strong><br/>Value: <strong>R${Number(v.price).toFixed(2)}</strong>`,
      });
    } catch (e) {
      setResult({ type: "error", title: "Error", msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, padding: "80px 32px" }}>
      <p
        style={{
          fontSize: ".72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--terra)",
          marginBottom: 8,
        }}
      >
        ✦ Validate
      </p>
      <h2
        style={{
          fontFamily: "var(--serif)",
          fontSize: "2.4rem",
          color: "var(--forest)",
          marginBottom: 8,
        }}
      >
        Redeem a Voucher
      </h2>
      <p
        style={{
          color: "var(--sub)",
          fontSize: ".9rem",
          marginBottom: 36,
          lineHeight: 1.7,
        }}
      >
        Enter the code from WhatsApp to validate.
      </p>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 36,
        }}
      >
        <label
          style={{
            fontSize: ".7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "var(--muted)",
            display: "block",
            marginBottom: 8,
          }}
        >
          Voucher Code
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VCH-XXXXXXXX"
          onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
          style={{
            width: "100%",
            padding: "14px 18px",
            border: "1.5px solid var(--border2)",
            borderRadius: 10,
            fontFamily: "var(--serif)",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--forest)",
            letterSpacing: 3,
            outline: "none",
            marginBottom: 16,
            background: "var(--cream)",
          }}
        />
        <button
          onClick={handleRedeem}
          disabled={loading}
          style={{
            width: "100%",
            padding: 15,
            background: "var(--forest)",
            color: "var(--cream)",
            border: "none",
            borderRadius: 10,
            fontFamily: "var(--serif)",
            fontSize: "1.05rem",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all .2s",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Looking up…" : "Validate & Redeem →"}
        </button>
      </div>

      {result && (
        <div
          style={{
            background: "var(--white)",
            border: `2px solid ${RESULT_COLORS[result.type]}`,
            borderRadius: 16,
            padding: 28,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>
            {RESULT_ICONS[result.type]}
          </div>
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.4rem",
              color: "var(--forest)",
              marginBottom: 10,
            }}
          >
            {result.title}
          </h3>
          <p
            style={{ color: "var(--sub)", fontSize: ".86rem", lineHeight: 1.9 }}
            dangerouslySetInnerHTML={{ __html: result.msg }}
          />
        </div>
      )}
    </div>
  );
}
