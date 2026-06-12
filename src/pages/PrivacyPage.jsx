import React from "react";

const SECTIONS = [
  {
    heading: "Information we collect",
    body: "We collect your name, email address, WhatsApp number, and payment details when you make a purchase. We also collect basic usage analytics (pages visited, search queries) to improve the platform.",
  },
  {
    heading: "How we use your data",
    body: "Your data is used to process your order, deliver your voucher via WhatsApp, send order confirmation emails, and provide customer support. We do not sell your data to third parties.",
  },
  {
    heading: "WhatsApp & messaging",
    body: "By providing a WhatsApp number you consent to receiving your voucher code and order updates via WhatsApp. You may opt out by contacting support.",
  },
  {
    heading: "Data sharing",
    body: "We share your order details with the relevant partner business solely for the purpose of fulfilling your experience. Partners are bound by our Partner Agreement to protect your data.",
  },
  {
    heading: "Data retention",
    body: "Order records are retained for 5 years for accounting purposes. You may request deletion of your personal profile data at any time by emailing support@afrivoucher.com.",
  },
  {
    heading: "Cookies",
    body: "We use essential cookies for authentication and a single analytics cookie (Google Analytics) that you may opt out of via your browser settings.",
  },
  {
    heading: "Your rights (POPIA)",
    body: "You have the right to access, correct or delete your personal information. Submit requests to: support@afrivoucher.com. We respond within 10 business days.",
  },
  {
    heading: "Security",
    body: "All payment processing is handled by PayFast and is PCI-DSS compliant. We do not store card details. Your data is stored on Google Firebase infrastructure with encryption at rest.",
  },
  {
    heading: "Contact",
    body: "Privacy Officer: AfriVoucher (Pty) Ltd · support@afrivoucher.com · +27 67 605 6777",
  },
];

// ─── PrivacyPage ──────────────────────────────────────────────────────────
// Props:
//   setPage — function to navigate back to the store
export default function PrivacyPage({ setPage }) {
  return (
    <div
      className="container"
      style={{ maxWidth: 720, padding: "56px 24px 80px" }}
    >
      <button
        onClick={() => setPage("store")}
        style={{
          background: "none",
          border: "none",
          color: "var(--red)",
          fontWeight: 700,
          fontSize: ".82rem",
          cursor: "pointer",
          marginBottom: 24,
          padding: 0,
        }}
      >
        ← Back to store
      </button>

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--black)",
          marginBottom: 6,
          letterSpacing: "-.4px",
        }}
      >
        Privacy Policy
      </h1>
      <p
        style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 36 }}
      >
        Last updated: June 2025 · POPIA compliant
      </p>

      {SECTIONS.map(({ heading, body }) => (
        <div key={heading} style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontSize: ".95rem",
              fontWeight: 700,
              color: "var(--black)",
              marginBottom: 6,
            }}
          >
            {heading}
          </h3>
          <p
            style={{
              fontSize: ".87rem",
              color: "var(--sub)",
              lineHeight: 1.75,
            }}
          >
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}
