import React, { useState } from "react";

const FAQS = [
  {
    category: "Buying Vouchers",
    icon: "🎁",
    items: [
      {
        q: "How do I purchase a voucher?",
        a: "Browse the store, click on any experience you like, and hit the buy button. You'll fill in the recipient's WhatsApp number and a personal message, then pay securely via PayFast. The voucher code is delivered instantly to WhatsApp.",
      },
      {
        q: "Can I buy a voucher for someone in Zimbabwe while I'm abroad?",
        a: "Yes — that's exactly what AfriVoucher is built for. Pay in USD from anywhere in the world and the recipient gets their voucher delivered directly to their WhatsApp in Zimbabwe.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept Visa, Mastercard, and SnapScan via PayFast. All transactions are PCI-DSS compliant and your card details are never stored on our servers.",
      },
      {
        q: "Can I buy multiple vouchers in one order?",
        a: "Currently each voucher is purchased individually. If you'd like to send several experiences to one person, simply complete separate purchases — each will be delivered to the same WhatsApp number.",
      },
    ],
  },
  {
    category: "Delivery & Voucher Codes",
    icon: "📱",
    items: [
      {
        q: "How is the voucher delivered?",
        a: "Vouchers are delivered via WhatsApp to the phone number you provide at checkout. Delivery is instant — the recipient receives a message with their unique voucher code and booking instructions.",
      },
      {
        q: "What if the recipient didn't receive their voucher?",
        a: "Check that the WhatsApp number was entered correctly at checkout. If the number is correct, go to My Orders and use the Resend button to push the code again. Still stuck? Contact us on WhatsApp at +27 67 605 6777.",
      },
      {
        q: "Can I send the voucher to myself?",
        a: "Absolutely. Enter your own WhatsApp number at checkout and the voucher will be delivered to you. Great for treating yourself or holding a gift until you're ready to pass it on.",
      },
    ],
  },
  {
    category: "Redeeming a Voucher",
    icon: "✅",
    items: [
      {
        q: "How does the recipient redeem their voucher?",
        a: "The recipient contacts the partner business directly (details are in the WhatsApp message) and presents their unique voucher code. The business validates the code using their AfriVoucher partner dashboard.",
      },
      {
        q: "Do vouchers expire?",
        a: "Yes. Each voucher has a validity period stated at the time of purchase — typically 6 or 12 months. Expired vouchers cannot be extended or refunded, so encourage recipients to book in advance.",
      },
      {
        q: "Can a voucher be partially redeemed?",
        a: "No. Vouchers are redeemed in full in a single use. If the experience costs less than the voucher value, the remaining balance is not refunded or carried over.",
      },
      {
        q: "What if the partner business refuses the voucher?",
        a: "That should never happen. If a partner declines a valid, unexpired voucher, contact us immediately on WhatsApp or at support@afrivoucher.com and we will resolve it within 24 hours.",
      },
    ],
  },
  {
    category: "Refunds & Cancellations",
    icon: "🔄",
    items: [
      {
        q: "Can I get a refund on a voucher?",
        a: "Vouchers are non-refundable once purchased. The exception is if a partner business permanently closes before the voucher is redeemed — in that case, contact us within 30 days for a store credit.",
      },
      {
        q: "What if I bought the wrong voucher?",
        a: "We're unable to exchange or refund vouchers due to buyer error. We recommend double-checking the experience, value, and recipient details before completing your purchase.",
      },
    ],
  },
  {
    category: "Partner Businesses",
    icon: "🤝",
    items: [
      {
        q: "How do I list my business on AfriVoucher?",
        a: "Head to the For Partners page and submit an application. Setup is free, takes about 10 minutes, and we'll be in touch within 24 hours. You keep 80%+ of every sale and receive weekly EFT payouts.",
      },
      {
        q: "How do partners receive payment?",
        a: "AfriVoucher processes all customer payments and transfers your share via EFT every week. You'll receive a payout summary with each transfer detailing which vouchers were sold.",
      },
      {
        q: "How do partners validate voucher codes?",
        a: "Log in to your AfriVoucher partner dashboard and go to the Redeem section. Enter the code the customer presents and the system will confirm it's valid and mark it as used instantly.",
      },
    ],
  },
  {
    category: "Account & Security",
    icon: "🔒",
    items: [
      {
        q: "Do I need an account to buy a voucher?",
        a: "No account is needed to purchase. However, creating a partner account lets you track orders, resend vouchers and manage your voucher catalogue if you're a business owner.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the Sign In page, click Forgot password? and enter your email address. You'll receive a reset link within a few minutes. Check your spam folder if it doesn't arrive.",
      },
      {
        q: "How is my personal data protected?",
        a: "We comply fully with POPIA. Your data is stored on encrypted Google Firebase infrastructure and is never sold to third parties. See our Privacy Policy for full details.",
      },
    ],
  },
];

const CONTACT_ITEMS = [
  { icon: "💬", label: "WhatsApp", value: "+27 67 605 6777", href: "https://wa.me/27676056777" },
  { icon: "📧", label: "Email", value: "support@afrivoucher.com", href: "mailto:support@afrivoucher.com" },
  { icon: "🕐", label: "Hours", value: "Mon–Fri, 8am–6pm CAT", href: null },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", background: "none", border: "none",
          cursor: "pointer", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 16,
          padding: "16px 0", textAlign: "left",
          fontFamily: "var(--sans)",
        }}
      >
        <span style={{ fontSize: ".9rem", fontWeight: 600, color: "var(--black)", lineHeight: 1.4 }}>
          {q}
        </span>
        <span style={{
          fontSize: "1.1rem", color: "var(--muted)", flexShrink: 0,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform .2s",
          display: "inline-block",
        }}>
          +
        </span>
      </button>
      {open && (
        <p style={{
          fontSize: ".86rem", color: "var(--sub)", lineHeight: 1.75,
          paddingBottom: 16, margin: 0,
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── HelpCentrePage ───────────────────────────────────────────────────────
// Props:
//   setPage — function to navigate to another page
export default function HelpCentrePage({ setPage }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = activeCategory
    ? FAQS.filter((g) => g.category === activeCategory)
    : FAQS;

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
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <p style={{
            fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: 1.5, color: "rgba(255,255,255,.45)", marginBottom: 12,
          }}>
            ✦ Help Centre
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800,
            color: "#fff", lineHeight: 1.05,
            letterSpacing: "-.5px", marginBottom: 12,
          }}>
            How can we help?
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".92rem", lineHeight: 1.65 }}>
            Answers to the most common questions about buying, redeeming and
            managing AfriVoucher gift experiences.
          </p>
        </div>
      </div>

      {/* ── Category filter pills ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid var(--border)",
        padding: "0 20px", overflowX: "auto",
        display: "flex", gap: 0,
      }}>
        <div style={{
          display: "flex", gap: 0,
          maxWidth: "var(--max)", margin: "0 auto",
        }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: "14px 18px", background: "none",
              border: "none", borderBottom: `3px solid ${!activeCategory ? "var(--red)" : "transparent"}`,
              fontFamily: "var(--sans)", fontSize: ".8rem", fontWeight: 600,
              color: !activeCategory ? "var(--red)" : "var(--sub)",
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              transition: "all .15s",
            }}
          >
            All topics
          </button>
          {FAQS.map(({ category, icon }) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category === activeCategory ? null : category)}
              style={{
                padding: "14px 18px", background: "none",
                border: "none",
                borderBottom: `3px solid ${activeCategory === category ? "var(--red)" : "transparent"}`,
                fontFamily: "var(--sans)", fontSize: ".8rem", fontWeight: 600,
                color: activeCategory === category ? "var(--red)" : "var(--sub)",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all .15s", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span>{icon}</span> {category}
            </button>
          ))}
        </div>
      </div>

      {/* ── FAQ sections ── */}
      <div style={{ background: "var(--bg2)", minHeight: "60vh" }}>
        <div className="container" style={{ maxWidth: 760, padding: "40px 24px 80px" }}>
          {filtered.map(({ category, icon, items }) => (
            <div key={category} style={{ marginBottom: 36 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
              }}>
                <span style={{ fontSize: "1.3rem" }}>{icon}</span>
                <h2 style={{
                  fontSize: "1rem", fontWeight: 700, color: "var(--black)",
                  letterSpacing: "-.15px", margin: 0,
                }}>
                  {category}
                </h2>
              </div>
              <div style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: 14, padding: "0 24px",
              }}>
                {items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}

          {/* ── Still need help? contact card ── */}
          <div style={{
            background: "#fff", border: "1px solid var(--border)",
            borderRadius: 16, padding: "28px 28px 24px",
            marginTop: 8,
          }}>
            <h3 style={{
              fontSize: "1rem", fontWeight: 700, color: "var(--black)",
              marginBottom: 4,
            }}>
              Still need help?
            </h3>
            <p style={{
              fontSize: ".84rem", color: "var(--sub)", lineHeight: 1.6,
              marginBottom: 20,
            }}>
              Our support team is available Monday to Friday. We typically
              respond within a few hours.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {CONTACT_ITEMS.map(({ icon, label, value, href }) => (
                <div key={label} style={{
                  flex: "1 1 160px",
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "14px 16px",
                }}>
                  <div style={{ fontSize: "1.2rem", marginBottom: 6 }}>{icon}</div>
                  <div style={{
                    fontSize: ".65rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, color: "var(--muted)", marginBottom: 4,
                  }}>
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: ".82rem", fontWeight: 600,
                        color: "var(--red)", textDecoration: "none",
                      }}
                    >
                      {value}
                    </a>
                  ) : (
                    <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--black)" }}>
                      {value}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <a
                href="https://wa.me/27676056777"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 22px", background: "#25D366", color: "#fff",
                  borderRadius: 8, fontFamily: "var(--sans)",
                  fontSize: ".85rem", fontWeight: 700, textDecoration: "none",
                  transition: "opacity .15s",
                }}
              >
                💬 Chat with us on WhatsApp
              </a>
            </div>
          </div>

          {/* ── Bottom nav links ── */}
          <div style={{
            marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap",
          }}>
            {[
              { label: "← Back to store", target: "store" },
              { label: "Privacy Policy",  target: "privacy" },
              { label: "Terms of Service", target: "terms" },
              { label: "Redeem a Voucher", target: "redeem" },
            ].map(({ label, target }) => (
              <button
                key={label}
                onClick={() => setPage(target)}
                style={{
                  background: "none", border: "none",
                  color: "var(--red)", fontWeight: 700,
                  fontSize: ".82rem", cursor: "pointer", padding: 0,
                  fontFamily: "var(--sans)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}