import React, { useState } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const ENQUIRY_TYPES = [
  "General enquiry",
  "Voucher not received",
  "Redemption issue",
  "Refund request",
  "Partner / business listing",
  "Corporate gifting",
  "Press & media",
  "Other",
];

const CONTACT_CARDS = [
  {
    icon: "💬",
    label: "WhatsApp",
    value: "+27 67 605 6777",
    sub: "Fastest response · Mon–Fri 8am–6pm CAT",
    href: "https://wa.me/27676056777",
    cta: "Open WhatsApp",
    ctaBg: "#25D366",
  },
  {
    icon: "📧",
    label: "Email",
    value: "support@afrivoucher.com",
    sub: "We reply within one business day",
    href: "mailto:support@afrivoucher.com",
    cta: "Send Email",
    ctaBg: "var(--red)",
  },
  {
    icon: "🤝",
    label: "Partner enquiries",
    value: "partners@afrivoucher.com",
    sub: "For business listings and trade questions",
    href: "mailto:partners@afrivoucher.com",
    cta: "Email Partners Team",
    ctaBg: "var(--red)",
  },
];

const EMPTY_FORM = {
  name: "", email: "", whatsapp: "", type: "General enquiry", message: "",
};

// ─── ContactPage ──────────────────────────────────────────────────────────
// Props:
//   firebaseApp — initialised Firebase app instance
//   setPage     — function to navigate to another page
export default function ContactPage({ firebaseApp, setPage }) {
  const db = getFirestore(firebaseApp);

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "error"
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: "error", msg: "Please fill in your name, email and message." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus({ type: "error", msg: "Please enter a valid email address." });
      return;
    }
    setStatus({ type: "loading" });
    try {
      await addDoc(collection(db, "contact_messages"), {
        ...form,
        submittedAt: serverTimestamp(),
        read: false,
      });
      setStatus({ type: "ok" });
      setForm(EMPTY_FORM);
    } catch {
      setStatus({ type: "error", msg: "Something went wrong. Please try again or reach us on WhatsApp." });
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <div style={{
        background: "var(--black)",
        padding: "64px 24px 56px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(26,122,60,.18), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <p style={{
            fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: 1.5, color: "rgba(255,255,255,.45)", marginBottom: 12,
          }}>
            ✦ Get in touch
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800,
            color: "#fff", lineHeight: 1.05,
            letterSpacing: "-.5px", marginBottom: 12,
          }}>
            We'd love to hear from you.
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".92rem", lineHeight: 1.65 }}>
            Whether you have a question about a voucher, want to list your
            business, or just want to say hello — we're here.
          </p>
        </div>
      </div>

      <div style={{ background: "var(--bg2)" }}>
        <div className="container" style={{ maxWidth: 900, padding: "44px 24px 80px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
            className="contact-grid"
          >
            {/* ── Left: contact channels ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{
                fontSize: "1rem", fontWeight: 700, color: "var(--black)",
                letterSpacing: "-.15px", marginBottom: 4,
              }}>
                Contact channels
              </h2>

              {CONTACT_CARDS.map(({ icon, label, value, sub, href, cta, ctaBg }) => (
                <div key={label} style={{
                  background: "#fff", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "20px 20px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: "1.3rem" }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: 1, color: "var(--muted)" }}>{label}</div>
                      <div style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--black)",
                        marginTop: 1 }}>{value}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: ".78rem", color: "var(--sub)", marginBottom: 14,
                    lineHeight: 1.5 }}>{sub}</p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "9px 18px", background: ctaBg, color: "#fff",
                      borderRadius: 7, fontFamily: "var(--sans)",
                      fontSize: ".78rem", fontWeight: 700, textDecoration: "none",
                      transition: "opacity .15s",
                    }}
                  >
                    {cta} →
                  </a>
                </div>
              ))}

              {/* Hours card */}
              <div style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: 14, padding: "18px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: "1.3rem" }}>🕐</span>
                  <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, color: "var(--muted)" }}>Support hours</div>
                </div>
                {[
                  { day: "Monday – Friday", hours: "8:00am – 6:00pm CAT" },
                  { day: "Saturday",        hours: "9:00am – 1:00pm CAT" },
                  { day: "Sunday",          hours: "Closed" },
                ].map(({ day, hours }) => (
                  <div key={day} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: ".82rem", padding: "5px 0",
                    borderBottom: "1px solid var(--border)",
                  }}>
                    <span style={{ color: "var(--sub)" }}>{day}</span>
                    <span style={{
                      fontWeight: 600,
                      color: hours === "Closed" ? "var(--muted)" : "var(--black)",
                    }}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: message form ── */}
            <div style={{
              background: "#fff", border: "1px solid var(--border)",
              borderRadius: 16, padding: "28px 28px 24px",
            }}>
              <h2 style={{
                fontSize: "1rem", fontWeight: 700, color: "var(--black)",
                letterSpacing: "-.15px", marginBottom: 4,
              }}>
                Send a message
              </h2>
              <p style={{ fontSize: ".82rem", color: "var(--sub)", marginBottom: 22,
                lineHeight: 1.55 }}>
                Fill in the form and we'll get back to you within one business day.
              </p>

              {/* Success state */}
              {status?.type === "ok" ? (
                <div style={{
                  textAlign: "center", padding: "48px 20px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                }}>
                  <div style={{ fontSize: "3rem" }}>✅</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--black)" }}>
                    Message received!
                  </h3>
                  <p style={{ fontSize: ".84rem", color: "var(--sub)", lineHeight: 1.65,
                    maxWidth: 280 }}>
                    Thanks for getting in touch. We'll reply to your email within
                    one business day. For urgent issues, WhatsApp is fastest.
                  </p>
                  <button
                    onClick={() => setStatus(null)}
                    style={{
                      marginTop: 8, padding: "10px 22px",
                      background: "var(--red)", color: "#fff",
                      border: "none", borderRadius: 8,
                      fontFamily: "var(--sans)", fontSize: ".85rem",
                      fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Name + Email row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { k: "name",  lbl: "Your name",  type: "text",  ph: "Jane Smith"               },
                      { k: "email", lbl: "Email",       type: "email", ph: "jane@example.com"         },
                    ].map(({ k, lbl, type, ph }) => (
                      <div key={k}>
                        <FieldLabel>{lbl}</FieldLabel>
                        <input
                          className="admin-input"
                          type={type}
                          value={form[k]}
                          onChange={setF(k)}
                          placeholder={ph}
                        />
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <FieldLabel>WhatsApp number <span style={{ fontWeight: 400, textTransform: "none",
                      letterSpacing: 0 }}>(optional)</span></FieldLabel>
                    <input
                      className="admin-input"
                      type="text"
                      value={form.whatsapp}
                      onChange={setF("whatsapp")}
                      placeholder="+263 77 123 4567"
                    />
                  </div>

                  {/* Enquiry type */}
                  <div>
                    <FieldLabel>Enquiry type</FieldLabel>
                    <select className="admin-input" value={form.type} onChange={setF("type")}>
                      {ENQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <FieldLabel>Message</FieldLabel>
                    <textarea
                      className="admin-input"
                      value={form.message}
                      onChange={setF("message")}
                      placeholder="Tell us how we can help…"
                      style={{ height: 110, resize: "none" }}
                    />
                  </div>

                  {/* Error */}
                  {status?.type === "error" && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 8, fontSize: ".8rem",
                      background: "#FEF2F2", border: "1px solid #EF4444", color: "#B91C1C",
                    }}>
                      {status.msg}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={status?.type === "loading"}
                    style={{
                      padding: "13px", background: "var(--red)", color: "#fff",
                      border: "none", borderRadius: 8,
                      fontFamily: "var(--sans)", fontSize: ".95rem", fontWeight: 800,
                      cursor: status?.type === "loading" ? "not-allowed" : "pointer",
                      transition: "all .18s",
                      opacity: status?.type === "loading" ? 0.55 : 1,
                      marginTop: 4,
                    }}
                  >
                    {status?.type === "loading" ? "Sending…" : "Send Message →"}
                  </button>

                  <p style={{ fontSize: ".72rem", color: "var(--muted)", textAlign: "center",
                    lineHeight: 1.5 }}>
                    Your message is stored securely and only used to respond to your enquiry.
                    See our{" "}
                    <button onClick={() => setPage("privacy")} style={{
                      background: "none", border: "none", color: "var(--red)",
                      fontWeight: 600, cursor: "pointer", fontSize: "inherit",
                      fontFamily: "var(--sans)", padding: 0,
                    }}>
                      Privacy Policy
                    </button>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom nav links ── */}
          <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "← Back to store",  target: "store"   },
              { label: "Help Centre",       target: "help"    },
              { label: "Privacy Policy",    target: "privacy" },
              { label: "Terms of Service",  target: "terms"   },
            ].map(({ label, target }) => (
              <button
                key={label}
                onClick={() => setPage(target)}
                style={{
                  background: "none", border: "none", color: "var(--red)",
                  fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                  padding: 0, fontFamily: "var(--sans)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Responsive two-col → single-col ── */}
      <style>{`
        @media (max-width: 640px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{
      fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 1, color: "var(--muted)", display: "block", marginBottom: 5,
    }}>
      {children}
    </label>
  );
}