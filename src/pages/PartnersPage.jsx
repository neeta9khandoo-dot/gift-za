import React, { useState } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const CATEGORIES = [
  "Wellness & Spa",
  "Hair & Beauty",
  "Adventure",
  "Dining & Wine",
  "Traditional Restaurants",
  "Stays",
  "Skills & Courses",
  "Music",
  "Events",
  "Florists",
  "Other",
];

const STATS = [
  { val: "R0", lbl: "Setup cost" },
  { val: "80%+", lbl: "You keep" },
  { val: "Weekly", lbl: "EFT payout" },
];

const FORM_FIELDS = [
  {
    key: "business",
    label: "Business Name",
    type: "text",
    placeholder: "Beat Studio / Stage Events",
    half: true,
  },
  { key: "category", label: "Category", type: "select", half: true },
  {
    key: "contact",
    label: "Contact Name",
    type: "text",
    placeholder: "Jane Smith",
    half: true,
  },
  {
    key: "whatsapp",
    label: "WhatsApp Number",
    type: "text",
    placeholder: "+27821234567",
    half: true,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "hello@yourbusiness.co.za",
    half: false,
  },
  {
    key: "services",
    label: "Describe your service(s)",
    type: "textarea",
    placeholder:
      "e.g. Live jazz evenings R780, studio recording sessions R1200, or private birthday party packages R1850…",
    half: false,
  },
];

const EMPTY_FORM = {
  business: "",
  category: "Wellness & Spa",
  contact: "",
  whatsapp: "",
  email: "",
  services: "",
};

// ─── PartnersPage ─────────────────────────────────────────────────────────
// Props:
//   firebaseApp — initialised Firebase app instance
export default function PartnersPage({ firebaseApp }) {
  const db = getFirestore(firebaseApp);

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.business || !form.contact || !form.email || !form.whatsapp) {
      setStatus({
        type: "error",
        msg: "Please fill in Business Name, Contact Name, Email and WhatsApp number.",
      });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "partner_applications"), {
        ...form,
        status: "pending",
        submittedAt: serverTimestamp(),
      });
      setStatus({
        type: "ok",
        msg: "<strong>Application received!</strong> We will be in touch within 24 hours.",
      });
      setForm(EMPTY_FORM);
    } catch {
      setStatus({
        type: "error",
        msg: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <div
        style={{
          background: "var(--forest)",
          padding: "80px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          backgroundImage: "url('/images/hero-3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(61,107,71,.4), transparent 60%)",
          }}
        />

        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <p
            style={{
              fontSize: ".72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "var(--gold2)",
              marginBottom: 12,
            }}
          >
            ✦ Partner Programme
          </p>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              color: "var(--cream)",
              lineHeight: 1.05,
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            List your business.
            <br />
            <em style={{ color: "var(--gold2)" }}>Earn on every sale.</em>
          </h1>
          <p
            style={{
              color: "rgba(245,240,232,.65)",
              fontSize: "1rem",
              lineHeight: 1.75,
              marginBottom: 32,
            }}
          >
            Whether you run a music venue, plan private events, or offer spa
            services — we handle payments, WhatsApp delivery and customer
            support. You just deliver the experience and collect your payout.
          </p>

          {/* Stat pills */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {STATS.map(({ val, lbl }) => (
              <div
                key={lbl}
                style={{
                  background: "rgba(245,240,232,.1)",
                  border: "1px solid rgba(245,240,232,.15)",
                  borderRadius: 12,
                  padding: "16px 24px",
                  color: "var(--cream)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: ".72rem",
                    color: "rgba(245,240,232,.5)",
                    textTransform: "uppercase",
                    letterSpacing: ".8px",
                  }}
                >
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Application form ── */}
      <div
        className="container"
        style={{ padding: "60px 32px", maxWidth: 680 }}
      >
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "2rem",
            color: "var(--forest)",
            marginBottom: 6,
          }}
        >
          Apply to Partner
        </h2>
        <p style={{ color: "var(--sub)", marginBottom: 28, fontSize: ".9rem" }}>
          Takes 5 minutes. We'll be in touch within 24 hours.
        </p>

        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Two-column grid for half-width fields */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            {FORM_FIELDS.filter((f) => f.half).map(
              ({ key, label, type, placeholder }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  {type === "select" ? (
                    <select
                      className="admin-input"
                      value={form[key]}
                      onChange={setF(key)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="admin-input"
                      type={type}
                      value={form[key]}
                      onChange={setF(key)}
                      placeholder={placeholder}
                    />
                  )}
                </div>
              ),
            )}
          </div>

          {/* Full-width fields */}
          {FORM_FIELDS.filter((f) => !f.half).map(
            ({ key, label, type, placeholder }) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                {type === "textarea" ? (
                  <textarea
                    className="admin-input"
                    value={form[key]}
                    onChange={setF(key)}
                    placeholder={placeholder}
                    style={{ height: 90, resize: "none" }}
                  />
                ) : (
                  <input
                    className="admin-input"
                    type={type}
                    value={form[key]}
                    onChange={setF(key)}
                    placeholder={placeholder}
                  />
                )}
              </div>
            ),
          )}

          {/* Status message */}
          {status && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 9,
                fontSize: ".85rem",
                background: status.type === "ok" ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${status.type === "ok" ? "#22C55E" : "#EF4444"}`,
                color: status.type === "ok" ? "#15803D" : "#B91C1C",
              }}
              dangerouslySetInnerHTML={{ __html: status.msg }}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: 15,
              background: "#22C55E",
              color: "var(--cream)",
              border: "none",
              borderRadius: 10,
              fontFamily: "var(--serif)",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all .2s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Small helper so label styles aren't repeated ─────────────────────────
function FieldLabel({ children }) {
  return (
    <label
      style={{
        fontSize: ".7rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "var(--muted)",
        display: "block",
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}
