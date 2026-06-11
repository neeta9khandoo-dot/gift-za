import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";


const SHARED_CSS = `
/* ── Page-level shared styles ─────────────────────────────────────── */
.fp-hero{
  background:var(--forest);padding:72px 32px 64px;text-align:center;
  position:relative;overflow:hidden;
}
.fp-hero::before{
  content:"";position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 0%,rgba(61,107,71,.4),transparent 60%);
}
.fp-hero-inner{position:relative;max-width:620px;margin:0 auto;}
.fp-eyebrow{
  font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;
  color:var(--gold2);margin-bottom:12px;display:block;
}
.fp-hero h1{
  font-family:var(--serif);font-size:clamp(2rem,5vw,3.4rem);font-weight:600;
  color:var(--cream);line-height:1.1;margin-bottom:14px;
}
.fp-hero p{
  color:rgba(245,240,232,.65);font-size:.95rem;line-height:1.75;
}
.fp-body{max-width:860px;margin:0 auto;padding:56px 32px 80px;}
.fp-section{margin-bottom:48px;}
.fp-section h2{
  font-family:var(--serif);font-size:1.5rem;font-weight:600;
  color:var(--forest);margin-bottom:14px;padding-bottom:12px;
  border-bottom:1px solid var(--border);
}
.fp-section h3{
  font-family:var(--serif);font-size:1.1rem;font-weight:600;
  color:var(--forest);margin:20px 0 8px;
}
.fp-section p,.fp-section li{
  font-size:.9rem;color:var(--sub);line-height:1.8;
}
.fp-section ul,.fp-section ol{
  padding-left:20px;display:flex;flex-direction:column;gap:6px;margin-top:8px;
}
.fp-section a{color:var(--leaf);font-weight:600;}
.fp-card{
  background:var(--white);border:1px solid var(--border);
  border-radius:16px;padding:28px;
}
.fp-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.fp-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
@media(max-width:768px){
  .fp-body{padding:36px 20px 60px;}
  .fp-hero{padding:52px 20px 48px;}
  .fp-grid-2,.fp-grid-3{grid-template-columns:1fr;}
}
`;

function useSharedCSS() {
  React.useEffect(() => {
    if (document.getElementById("fp-shared-css")) return;
    const s = document.createElement("style");
    s.id = "fp-shared-css";
    s.textContent = SHARED_CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
}

/* ══════════════════════════════════════════════════════════════════════
   1. REDEEM VOUCHER PAGE (enhanced drop-in replacement for RedeemPage)
   ══════════════════════════════════════════════════════════════════════ */
export function RedeemVoucherPage({ user }) {
  useSharedCSS();
  /* Thin wrapper — the real logic lives in RedeemPage in Home.jsx.
     Import RedeemPage there and render it here, or copy-paste its
     body below. This page adds only the richer hero + how-it-works. */

  const steps = [
    {
      icon: "📱",
      title: "Open WhatsApp",
      desc: "Find the voucher message sent to you or the recipient.",
    },
    {
      icon: "🔢",
      title: "Copy the code",
      desc: "The code looks like VCH-XXXXXXXX.",
    },
    {
      icon: "✅",
      title: "Paste & validate",
      desc: "Enter the code below — we mark it redeemed instantly.",
    },
    {
      icon: "🎉",
      title: "Enjoy!",
      desc: "Show the confirmation to the partner and book your experience.",
    },
  ];

  return (
    <>
      <div className="fp-hero">
        <div className="fp-hero-inner">
          <span className="fp-eyebrow">✦ Voucher Validation</span>
          <h1>Redeem a Voucher</h1>
          <p>
            Enter the code from WhatsApp below to validate and mark it as used.
          </p>
        </div>
      </div>

      <div className="fp-body">
        {/* How it works strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "20px 18px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>
                {s.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontWeight: 600,
                  fontSize: ".95rem",
                  color: "var(--forest)",
                  marginBottom: 5,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontSize: ".78rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Re-use existing RedeemPage body — mount it here */}
        {user ? (
          <div className="fp-card" style={{ maxWidth: 500, margin: "0 auto" }}>
            <p
              style={{
                color: "var(--muted)",
                fontSize: ".82rem",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Signed in as{" "}
              <strong style={{ color: "var(--forest)" }}>{user.email}</strong>
            </p>
            {/* ↓ Paste or import RedeemPage's form body here */}
            <p
              style={{
                textAlign: "center",
                color: "var(--sub)",
                fontSize: ".88rem",
              }}
            >
              ← Import and render &lt;RedeemPage user=&#123;user&#125; /&gt;
              here, or copy-paste its JSX from Home.jsx directly into this card.
            </p>
          </div>
        ) : (
          <div
            className="fp-card"
            style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
            <h3
              style={{
                fontFamily: "var(--serif)",
                color: "var(--forest)",
                marginBottom: 8,
              }}
            >
              Partner login required
            </h3>
            <p
              style={{
                color: "var(--sub)",
                fontSize: ".88rem",
                marginBottom: 20,
              }}
            >
              Only verified AfriVoucher partners can redeem vouchers on behalf
              of customers.
            </p>
            <a
              href="#auth"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "var(--forest)",
                color: "var(--cream)",
                borderRadius: 9,
                fontWeight: 700,
                fontFamily: "var(--serif)",
                fontSize: ".95rem",
                textDecoration: "none",
              }}
            >
              Sign In →
            </a>
          </div>
        )}

        {/* FAQ teaser */}
        <div style={{ marginTop: 56 }}>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.4rem",
              color: "var(--forest)",
              marginBottom: 20,
            }}
          >
            Common questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              [
                "My code isn't working — what do I do?",
                "Make sure you're entering the full code including the VCH- prefix. Codes are case-insensitive. If the issue persists, contact us on WhatsApp.",
              ],
              [
                "Can a voucher be used more than once?",
                "No. Each voucher code is single-use. Once validated the status changes to 'used' permanently.",
              ],
              [
                "What if the voucher has expired?",
                "Expired vouchers cannot be redeemed. Please contact hello@afrivoucher.co.zw — we review expiry extensions case by case.",
              ],
            ].map(([q, a]) => (
              <details
                key={q}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  cursor: "pointer",
                }}
              >
                <summary
                  style={{
                    fontWeight: 600,
                    fontSize: ".88rem",
                    color: "var(--forest)",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {q}{" "}
                  <span style={{ color: "var(--muted)", flexShrink: 0 }}>
                    ＋
                  </span>
                </summary>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: ".84rem",
                    color: "var(--sub)",
                    lineHeight: 1.75,
                  }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. HELP CENTRE PAGE
   ══════════════════════════════════════════════════════════════════════ */
export function HelpCentrePage({ setPage }) {
  useSharedCSS();
  const [searchQ, setSearchQ] = useState("");

  const categories = [
    {
      icon: "🎁",
      title: "Buying Vouchers",
      faqs: [
        {
          q: "How do I buy a voucher?",
          a: "Browse the Experiences page, click a voucher you love, then click 'Buy This Voucher'. Fill in the recipient's WhatsApp number, your details and an optional personal message. Pay securely with PayFast and the voucher is delivered instantly.",
        },
        {
          q: "Can I buy a voucher as a gift for someone else?",
          a: "Yes — that's exactly what AfriVoucher is built for. Enter the recipient's name and WhatsApp number at checkout. They receive the code and QR directly.",
        },
        {
          q: "What payment methods are accepted?",
          a: "We accept credit/debit card (Visa, Mastercard), EFT, and SnapScan through our PayFast integration. All payments are SSL-encrypted.",
        },
        {
          q: "Will I get a confirmation after purchase?",
          a: "Yes. You receive an email confirmation and the recipient gets their voucher on WhatsApp — both happen within seconds of payment.",
        },
        {
          q: "Can I add a personal message?",
          a: "Absolutely. There is a 'Personal Note' field at checkout where you can write a custom message that appears alongside the voucher.",
        },
      ],
    },
    {
      icon: "✅",
      title: "Redeeming Vouchers",
      faqs: [
        {
          q: "How does redemption work?",
          a: "Show or read your voucher code (VCH-XXXXXXXX) to the partner when you arrive for your experience. They validate it in their partner dashboard and mark it as used.",
        },
        {
          q: "My code says 'not found' — help!",
          a: "Double-check you are entering the full code including the VCH- prefix. If the error persists, WhatsApp us at +27 67 605 6777 with a screenshot.",
        },
        {
          q: "Can I book a specific date in advance?",
          a: "Dates are booked directly with the partner. Use the 'Book via WhatsApp' button in your confirmation message to contact them.",
        },
        {
          q: "What if my voucher expires before I can use it?",
          a: "Contact hello@afrivoucher.co.zw before the expiry date. We consider extension requests on a case-by-case basis.",
        },
      ],
    },
    {
      icon: "🔄",
      title: "Refunds & Changes",
      faqs: [
        {
          q: "Can I get a refund?",
          a: "Vouchers are non-refundable once issued. If a partner is unable to fulfil your experience through no fault of your own, contact us for a full credit.",
        },
        {
          q: "Can I transfer my voucher to someone else?",
          a: "Yes. Vouchers are code-based and not tied to an ID. Simply forward the WhatsApp message to the new recipient.",
        },
        {
          q: "What if the partner closes or cancels?",
          a: "If a partner ceases operations we will issue a full store credit valid for any other experience on AfriVoucher.",
        },
      ],
    },
    {
      icon: "🏢",
      title: "Partners",
      faqs: [
        {
          q: "How do I list my business?",
          a: "Head to the 'For Partners' page and submit an application. We'll be in touch within 24 hours.",
        },
        {
          q: "What commission does AfriVoucher take?",
          a: "Partners keep 80%+ of every sale. Our platform fee covers payment processing, WhatsApp delivery, customer support, and marketing.",
        },
        {
          q: "When do I get paid?",
          a: "Partner payouts are processed via weekly EFT. You'll see a breakdown in your dashboard.",
        },
      ],
    },
  ];

  const flatFaqs = categories.flatMap((c) =>
    c.faqs.map((f) => ({ ...f, cat: c.title })),
  );
  const filtered = searchQ.trim()
    ? flatFaqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQ.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQ.toLowerCase()),
      )
    : null;

  return (
    <>
      <div className="fp-hero">
        <div className="fp-hero-inner">
          <span className="fp-eyebrow">✦ Help Centre</span>
          <h1>How can we help?</h1>
          <p>Browse answers below or search for your question.</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--white)",
              border: "1.5px solid var(--border)",
              borderRadius: 50,
              padding: "0 18px",
              height: 48,
              maxWidth: 440,
              margin: "28px auto 0",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--muted)", flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder="Search questions…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "var(--sans)",
                fontSize: ".9rem",
                color: "var(--text)",
              }}
            />
            {searchQ && (
              <button
                onClick={() => setSearchQ("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: "1rem",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fp-body">
        {/* Quick contact strip */}
        <div className="fp-grid-3" style={{ marginBottom: 48 }}>
          {[
            {
              icon: "💬",
              title: "WhatsApp Support",
              sub: "Mon–Fri 8am–6pm",
              cta: "Chat now",
              href: "https://wa.me/27676056777",
            },
            {
              icon: "📧",
              title: "Email Us",
              sub: "hello@afrivoucher.co.zw",
              cta: "Send email",
              href: "mailto:hello@afrivoucher.co.zw",
            },
            {
              icon: "🤝",
              title: "Become a Partner",
              sub: "List your business today",
              cta: "Apply now",
              href: "#partners",
            },
          ].map((c) => (
            <div
              key={c.title}
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "22px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>
                {c.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontWeight: 600,
                  fontSize: ".95rem",
                  color: "var(--forest)",
                  marginBottom: 4,
                }}
              >
                {c.title}
              </div>
              <div
                style={{
                  fontSize: ".78rem",
                  color: "var(--muted)",
                  marginBottom: 14,
                }}
              >
                {c.sub}
              </div>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 18px",
                  background: "var(--forest)",
                  color: "var(--cream)",
                  borderRadius: 8,
                  fontSize: ".8rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {c.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Search results */}
        {filtered && (
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.3rem",
                color: "var(--forest)",
                marginBottom: 16,
              }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
              {searchQ}"
            </h2>
            {filtered.length === 0 ? (
              <div
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
                <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>
                  No results found. Try different keywords or{" "}
                  <a
                    href="mailto:hello@afrivoucher.co.zw"
                    style={{ color: "var(--leaf)", fontWeight: 600 }}
                  >
                    contact us directly
                  </a>
                  .
                </p>
              </div>
            ) : (
              filtered.map((f, i) => (
                <details
                  key={i}
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  <summary
                    style={{
                      fontWeight: 600,
                      fontSize: ".88rem",
                      color: "var(--forest)",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span>
                      <span
                        style={{
                          fontSize: ".68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".8px",
                          color: "var(--terra)",
                          marginRight: 8,
                        }}
                      >
                        {f.cat}
                      </span>
                      {f.q}
                    </span>
                    <span style={{ color: "var(--muted)", flexShrink: 0 }}>
                      ＋
                    </span>
                  </summary>
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: ".84rem",
                      color: "var(--sub)",
                      lineHeight: 1.75,
                    }}
                  >
                    {f.a}
                  </p>
                </details>
              ))
            )}
          </div>
        )}

        {/* Category FAQs */}
        {!filtered &&
          categories.map((cat) => (
            <div key={cat.title} className="fp-section">
              <h2>
                {cat.icon} {cat.title}
              </h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {cat.faqs.map((f, i) => {
                  const key = cat.title + i;
                  return (
                    <details
                      key={key}
                      style={{
                        background: "var(--white)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: "16px 20px",
                        cursor: "pointer",
                      }}
                    >
                      <summary
                        style={{
                          fontWeight: 600,
                          fontSize: ".88rem",
                          color: "var(--forest)",
                          listStyle: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        {f.q}{" "}
                        <span style={{ color: "var(--muted)", flexShrink: 0 }}>
                          ＋
                        </span>
                      </summary>
                      <p
                        style={{
                          marginTop: 12,
                          fontSize: ".84rem",
                          color: "var(--sub)",
                          lineHeight: 1.75,
                        }}
                      >
                        {f.a}
                      </p>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Still need help */}
        <div
          style={{
            background: "var(--forest)",
            borderRadius: 20,
            padding: "40px 36px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginTop: 40,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 0%,rgba(61,107,71,.5),transparent 60%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.6rem",
                color: "var(--cream)",
                marginBottom: 10,
              }}
            >
              Still need help?
            </h3>
            <p
              style={{
                color: "rgba(245,240,232,.6)",
                fontSize: ".88rem",
                marginBottom: 24,
                maxWidth: 380,
                margin: "0 auto 24px",
              }}
            >
              Our support team is available Monday–Friday, 8am–6pm CAT.
            </p>
            <a
              href="https://wa.me/27676056777"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "13px 28px",
                background: "#25D366",
                color: "white",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: ".9rem",
                textDecoration: "none",
              }}
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. CONTACT US PAGE
   ══════════════════════════════════════════════════════════════════════ */
export function ContactPage() {
  useSharedCSS();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General enquiry",
    message: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: "error", msg: "Please fill in all required fields." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus({ type: "error", msg: "Please enter a valid email address." });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "contact_messages"), {
        ...form,
        submittedAt: serverTimestamp(),
        status: "unread",
      });
      setStatus({
        type: "ok",
        msg: "Message sent! We'll reply within 24 hours.",
      });
      setForm({ name: "", email: "", subject: "General enquiry", message: "" });
    } catch {
      setStatus({
        type: "error",
        msg: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid var(--border2)",
    borderRadius: 9,
    fontFamily: "var(--sans)",
    fontSize: ".9rem",
    color: "var(--text)",
    background: "var(--cream)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: ".7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "var(--muted)",
    marginBottom: 6,
  };

  return (
    <>
      <div className="fp-hero">
        <div className="fp-hero-inner">
          <span className="fp-eyebrow">✦ Get in Touch</span>
          <h1>Contact Us</h1>
          <p>
            We'd love to hear from you. Send a message or reach us directly.
          </p>
        </div>
      </div>

      <div className="fp-body">
        <div className="fp-grid-2" style={{ alignItems: "start", gap: 40 }}>
          {/* Contact form */}
          <div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.4rem",
                color: "var(--forest)",
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "1px solid var(--border)",
              }}
            >
              Send a message
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={setF("name")}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.email}
                  onChange={setF("email")}
                  placeholder="jane@email.com"
                />
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.subject}
                  onChange={setF("subject")}
                >
                  {[
                    "General enquiry",
                    "Voucher issue",
                    "Refund request",
                    "Partner application",
                    "Corporate gifting",
                    "Technical support",
                    "Other",
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: 120,
                    resize: "vertical",
                    lineHeight: 1.65,
                  }}
                  value={form.message}
                  onChange={setF("message")}
                  placeholder="Tell us how we can help…"
                />
              </div>
              {status && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 9,
                    fontSize: ".84rem",
                    background: status.type === "ok" ? "#F0FDF4" : "#FEF2F2",
                    border: `1px solid ${status.type === "ok" ? "#22C55E" : "#EF4444"}`,
                    color: status.type === "ok" ? "#15803D" : "#B91C1C",
                    fontWeight: 600,
                  }}
                >
                  {status.type === "ok" ? "✅" : "⚠️"} {status.msg}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "14px",
                  background: "var(--forest)",
                  color: "var(--cream)",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "var(--serif)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "all .2s",
                }}
              >
                {loading ? "Sending…" : "Send Message →"}
              </button>
            </div>
          </div>

          {/* Contact details */}
          <div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.4rem",
                color: "var(--forest)",
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "1px solid var(--border)",
              }}
            >
              Direct channels
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  icon: "💬",
                  title: "WhatsApp Support",
                  value: "+27 67 605 6777",
                  sub: "Mon–Fri 8am–6pm CAT",
                  href: "https://wa.me/27676056777",
                  cta: "Open WhatsApp",
                  color: "#25D366",
                },
                {
                  icon: "📧",
                  title: "Email",
                  value: "hello@afrivoucher.co.zw",
                  sub: "We reply within 24 hours",
                  href: "mailto:hello@afrivoucher.co.zw",
                  cta: "Send Email",
                  color: "var(--leaf)",
                },
                {
                  icon: "📞",
                  title: "Phone",
                  value: "+263 77 123 4567",
                  sub: "Mon–Fri 9am–5pm CAT",
                  href: "tel:+2637712345678",
                  cta: "Call Us",
                  color: "var(--leaf)",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: ".72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".8px",
                        color: "var(--muted)",
                        marginBottom: 3,
                      }}
                    >
                      {c.title}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--forest)",
                        fontSize: ".9rem",
                        marginBottom: 2,
                      }}
                    >
                      {c.value}
                    </div>
                    <div
                      style={{
                        fontSize: ".75rem",
                        color: "var(--muted)",
                        marginBottom: 10,
                      }}
                    >
                      {c.sub}
                    </div>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        background: c.color,
                        color: "white",
                        borderRadius: 7,
                        fontSize: ".76rem",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      {c.cta}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Office info */}
            <div
              style={{
                background: "var(--cream2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "18px 20px",
                marginTop: 16,
              }}
            >
              <div
                style={{
                  fontSize: ".72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".8px",
                  color: "var(--terra)",
                  marginBottom: 8,
                }}
              >
                📍 Registered Office
              </div>
              <p
                style={{
                  fontSize: ".84rem",
                  color: "var(--sub)",
                  lineHeight: 1.75,
                }}
              >
                AfriVoucher (Pty) Ltd
                <br />
                Harare, Zimbabwe
                <br />
                Registered No. ZW-2024-XXXXX
              </p>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div
          style={{
            marginTop: 56,
            borderTop: "1px solid var(--border)",
            paddingTop: 36,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: ".72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "var(--muted)",
              marginBottom: 18,
            }}
          >
            Follow Us
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {[
              {
                label: "Facebook",
                icon: "f",
                href: "https://facebook.com/afrivoucher",
              },
              {
                label: "Instagram",
                icon: "📸",
                href: "https://instagram.com/afrivoucher",
              },
              {
                label: "X / Twitter",
                icon: "𝕏",
                href: "https://twitter.com/afrivoucher",
              },
              {
                label: "LinkedIn",
                icon: "in",
                href: "https://linkedin.com/company/afrivoucher",
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: ".9rem",
                  color: "var(--sub)",
                  transition: "all .2s",
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   4. PRIVACY POLICY PAGE
   ══════════════════════════════════════════════════════════════════════ */
export function PrivacyPage() {
  useSharedCSS();

  const sections = [
    {
      title: "1. Who we are",
      content: `AfriVoucher (Pty) Ltd ("AfriVoucher", "we", "us", or "our") operates the AfriVoucher platform, accessible at afrivoucher.co.zw. We are registered in Zimbabwe. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform or services.`,
    },
    {
      title: "2. Information we collect",
      subsections: [
        {
          heading: "2.1 Information you provide",
          items: [
            "Account registration details: business name, email address, password.",
            "Purchase details: buyer name, buyer email, recipient name, recipient WhatsApp number, personal note.",
            "Partner application details: business name, contact name, email, WhatsApp number, service description.",
            "Newsletter subscriptions: email address.",
            "Contact form submissions: name, email, subject, message.",
          ],
        },
        {
          heading: "2.2 Information collected automatically",
          items: [
            "Log data: IP address, browser type, pages visited, time and date of visit.",
            "Device information: hardware model, operating system, unique device identifiers.",
            "Usage data: features used, clicks, search queries entered on the platform.",
          ],
        },
        {
          heading: "2.3 Information from third parties",
          items: [
            "Payment data from PayFast (we do not store card numbers — PayFast handles all card data).",
            "Authentication tokens from Firebase Authentication.",
          ],
        },
      ],
    },
    {
      title: "3. How we use your information",
      items: [
        "To process voucher purchases and deliver vouchers via WhatsApp.",
        "To operate and maintain your partner account.",
        "To send purchase confirmations and transactional notifications.",
        "To respond to enquiries and provide customer support.",
        "To send marketing emails and newsletters (you may unsubscribe at any time).",
        "To improve the platform through analytics and usage data.",
        "To detect fraud and ensure platform security.",
        "To comply with legal obligations.",
      ],
    },
    {
      title: "4. How we share your information",
      content: `We do not sell your personal data. We share information only as follows:`,
      items: [
        "With partner businesses — only the information needed to fulfil your booked experience (voucher code, recipient name).",
        "With service providers — Firebase (database/auth), PayFast (payments), QR Server (QR code generation). These providers process data only on our instructions.",
        "With law enforcement or regulators when required by applicable law.",
        "In connection with a business transfer such as a merger or acquisition, subject to the same privacy obligations.",
      ],
    },
    {
      title: "5. Data retention",
      content: `We retain personal data for as long as necessary to provide our services and comply with legal obligations. Specifically: account data is retained while your account is active; transaction records are kept for 7 years for financial compliance; newsletter subscriber records are kept until unsubscription.`,
    },
    {
      title: "6. Your rights",
      content: `Depending on your jurisdiction you may have the right to:`,
      items: [
        "Access the personal data we hold about you.",
        "Correct inaccurate personal data.",
        "Request deletion of your personal data.",
        "Object to or restrict processing of your data.",
        "Data portability — receive your data in a machine-readable format.",
        "Withdraw consent at any time (where processing is based on consent).",
      ],
      postContent: `To exercise any of these rights, email us at privacy@afrivoucher.co.zw. We will respond within 30 days.`,
    },
    {
      title: "7. Security",
      content: `We implement industry-standard technical and organisational measures to protect your data, including SSL/TLS encryption in transit, Firebase Security Rules for database access, and PayFast for all payment processing. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.`,
    },
    {
      title: "8. Cookies",
      content: `We use essential cookies required for platform functionality (session management, authentication). We do not use advertising or tracking cookies. You can control cookies through your browser settings, though disabling essential cookies may affect platform functionality.`,
    },
    {
      title: "9. Children's privacy",
      content: `Our platform is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact us at privacy@afrivoucher.co.zw and we will delete it promptly.`,
    },
    {
      title: "10. Changes to this policy",
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice on our platform. Your continued use of the platform after changes take effect constitutes acceptance of the updated policy.`,
    },
    {
      title: "11. Contact",
      content: `For privacy-related queries, contact our Data Protection Officer at privacy@afrivoucher.co.zw or write to us at: AfriVoucher (Pty) Ltd, Harare, Zimbabwe.`,
    },
  ];

  return (
    <>
      <div className="fp-hero">
        <div className="fp-hero-inner">
          <span className="fp-eyebrow">✦ Legal</span>
          <h1>Privacy Policy</h1>
          <p>Last updated: 1 January 2025 · Effective: 1 January 2025</p>
        </div>
      </div>

      <div className="fp-body">
        {/* Summary cards */}
        <div
          style={{
            background: "var(--white)",
            border: "1.5px solid var(--leaf)",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 40,
          }}
        >
          <p
            style={{
              fontSize: ".8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--leaf)",
              marginBottom: 10,
            }}
          >
            🔒 Summary (plain English)
          </p>
          <div className="fp-grid-3">
            {[
              [
                "📵",
                "We never sell your data",
                "Your information is only used to run AfriVoucher services.",
              ],
              [
                "🔐",
                "Payments are secure",
                "Card data goes only to PayFast — we never see your card number.",
              ],
              [
                "✉️",
                "You control your inbox",
                "Unsubscribe from emails anytime with one click.",
              ],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 10 }}>
                <div
                  style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: 2 }}
                >
                  {icon}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: ".84rem",
                      color: "var(--forest)",
                      marginBottom: 3,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: ".78rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {sections.map((sec) => (
          <div key={sec.title} className="fp-section">
            <h2>{sec.title}</h2>
            {sec.content && <p>{sec.content}</p>}
            {sec.subsections &&
              sec.subsections.map((sub) => (
                <div key={sub.heading}>
                  <h3>{sub.heading}</h3>
                  <ul>
                    {sub.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            {sec.items && (
              <ul>
                {sec.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            {sec.postContent && (
              <p style={{ marginTop: 12 }}>{sec.postContent}</p>
            )}
          </div>
        ))}

        <div
          style={{
            background: "var(--cream2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 22px",
            fontSize: ".82rem",
            color: "var(--sub)",
            lineHeight: 1.75,
          }}
        >
          Questions about this policy? Email{" "}
          <a
            href="mailto:privacy@afrivoucher.co.zw"
            style={{ color: "var(--leaf)", fontWeight: 600 }}
          >
            privacy@afrivoucher.co.zw
          </a>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5. TERMS OF SERVICE PAGE
   ══════════════════════════════════════════════════════════════════════ */
export function TermsPage() {
  useSharedCSS();

  const sections = [
    {
      title: "1. Acceptance of terms",
      content: `By accessing or using AfriVoucher ("Platform"), operated by AfriVoucher (Pty) Ltd ("Company"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform. We may revise these Terms at any time; continued use constitutes acceptance.`,
    },
    {
      title: "2. Definitions",
      items: [
        `"Platform" means the AfriVoucher website, mobile interface, and related services.`,
        `"Voucher" means a digital gift voucher purchased on the Platform entitling the holder to a specific experience with a Partner.`,
        `"Partner" means a verified Zimbabwean business offering experiences redeemable via Vouchers.`,
        `"Buyer" means any person who purchases a Voucher.`,
        `"Recipient" means the person to whom a Voucher is gifted.`,
      ],
    },
    {
      title: "3. Eligibility",
      content: `You must be at least 18 years old to purchase Vouchers or register as a Partner. By using the Platform you represent that you meet this requirement.`,
    },
    {
      title: "4. Voucher purchases",
      subsections: [
        {
          heading: "4.1 Purchase",
          content: `Vouchers are purchased at the price displayed at the time of checkout. All prices are in South African Rand (ZAR) unless otherwise stated. Payment is processed by PayFast. A binding contract is formed when payment is confirmed.`,
        },
        {
          heading: "4.2 Delivery",
          content: `Vouchers are delivered to the Recipient's WhatsApp number provided at checkout within seconds of confirmed payment. AfriVoucher is not responsible for failed delivery due to incorrect phone numbers provided by the Buyer.`,
        },
        {
          heading: "4.3 Validity",
          content: `Each Voucher has an expiry date displayed at purchase. Expired Vouchers cannot be redeemed and are non-refundable. The Company may, at its sole discretion, extend validity on a case-by-case basis.`,
        },
        {
          heading: "4.4 Non-transferability of value",
          content: `Vouchers cannot be exchanged for cash. They may be transferred to another person by forwarding the code.`,
        },
      ],
    },
    {
      title: "5. Refund policy",
      items: [
        "Vouchers are non-refundable once issued, except where a Partner is unable to fulfil the experience through no fault of the Buyer.",
        "In the event of Partner closure or cancellation, AfriVoucher will issue a store credit of equivalent value, valid for 24 months.",
        "Refund requests must be submitted within 30 days of the issue date to support@afrivoucher.co.zw.",
        "AfriVoucher reserves the right to refuse refunds where evidence of Voucher use has been recorded.",
      ],
    },
    {
      title: "6. Partner obligations",
      content: `Partners agree to: honour all valid Vouchers presented before their expiry date; maintain appropriate licences and insurance to deliver the listed experience; notify AfriVoucher at least 14 days in advance of any change in services; not increase the listed price after a Voucher has been purchased.`,
    },
    {
      title: "7. Prohibited conduct",
      content: `You must not:`,
      items: [
        "Use the Platform for any unlawful purpose or in violation of any applicable law.",
        "Attempt to counterfeit, duplicate or resell Voucher codes.",
        "Misrepresent your identity or affiliation.",
        "Attempt to gain unauthorised access to any part of the Platform.",
        "Use automated scraping or data extraction tools.",
        "Post false reviews or manipulate the Platform's reputation systems.",
      ],
    },
    {
      title: "8. Intellectual property",
      content: `All content on the Platform — including text, graphics, logos, and software — is the property of AfriVoucher (Pty) Ltd or its licensors and is protected by Zimbabwean and international copyright laws. You may not reproduce, distribute, or create derivative works without written permission.`,
    },
    {
      title: "9. Limitation of liability",
      content: `To the maximum extent permitted by law, AfriVoucher shall not be liable for: (a) any indirect, incidental, special or consequential damages; (b) loss of revenue, profits or data; (c) any damages arising from the acts or omissions of a Partner; (d) any failure of WhatsApp or third-party delivery services. Our total liability to you shall not exceed the amount paid by you for the relevant Voucher.`,
    },
    {
      title: "10. Indemnification",
      content: `You agree to indemnify and hold harmless AfriVoucher, its officers, directors, employees and agents from any claims, damages, losses or expenses (including legal fees) arising from your use of the Platform, your breach of these Terms, or your violation of any applicable law.`,
    },
    {
      title: "11. Governing law & disputes",
      content: `These Terms are governed by the laws of Zimbabwe. Any dispute arising out of or related to these Terms shall be submitted to the exclusive jurisdiction of the courts of Zimbabwe. We encourage you to contact us first at support@afrivoucher.co.zw to resolve disputes amicably.`,
    },
    {
      title: "12. Changes to these terms",
      content: `We reserve the right to modify these Terms at any time. We will provide at least 14 days notice of material changes by email or prominent platform notice. Your continued use after that period constitutes acceptance.`,
    },
    {
      title: "13. Contact",
      content: `For questions about these Terms, contact us at legal@afrivoucher.co.zw or write to: AfriVoucher (Pty) Ltd, Harare, Zimbabwe.`,
    },
  ];

  return (
    <>
      <div className="fp-hero">
        <div className="fp-hero-inner">
          <span className="fp-eyebrow">✦ Legal</span>
          <h1>Terms of Service</h1>
          <p>Last updated: 1 January 2025 · Effective: 1 January 2025</p>
        </div>
      </div>

      <div className="fp-body">
        {/* Key points banner */}
        <div
          style={{
            background: "var(--white)",
            border: "1.5px solid var(--gold)",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 40,
          }}
        >
          <p
            style={{
              fontSize: ".8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--gold)",
              marginBottom: 10,
            }}
          >
            📋 Key points (plain English)
          </p>
          <div className="fp-grid-3">
            {[
              [
                "📵",
                "No cash refunds",
                "Vouchers can't be exchanged for cash, but can be transferred to others.",
              ],
              [
                "📅",
                "Expiry dates apply",
                "Check your voucher's validity period and book in good time.",
              ],
              [
                "🤝",
                "Partners are vetted",
                "All partner businesses are verified before being listed.",
              ],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 10 }}>
                <div
                  style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: 2 }}
                >
                  {icon}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: ".84rem",
                      color: "var(--forest)",
                      marginBottom: 3,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: ".78rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {sections.map((sec) => (
          <div key={sec.title} className="fp-section">
            <h2>{sec.title}</h2>
            {sec.content && <p>{sec.content}</p>}
            {sec.subsections &&
              sec.subsections.map((sub) => (
                <div key={sub.heading}>
                  <h3>{sub.heading}</h3>
                  <p>{sub.content}</p>
                </div>
              ))}
            {sec.items && (
              <ul>
                {sec.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div
          style={{
            background: "var(--cream2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 22px",
            fontSize: ".82rem",
            color: "var(--sub)",
            lineHeight: 1.75,
          }}
        >
          Questions about these Terms? Email{" "}
          <a
            href="mailto:legal@afrivoucher.co.zw"
            style={{ color: "var(--leaf)", fontWeight: 600 }}
          >
            legal@afrivoucher.co.zw
          </a>
        </div>
      </div>
    </>
  );
}
