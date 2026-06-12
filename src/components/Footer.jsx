import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const EXPERIENCES = [
  "Wellness & Spa",
  "Adventure",
  "Dining & Wine",
  "Music & Live Events",
  "Private Functions",
  "Skills & Courses",
];

const COMPANY = [
  "About Us",
  "Partner Programme",
  "Corporate Gifting",
  "Blog",
  "Careers",
];

const SUPPORT_LINKS = [
  { label: "Redeem Voucher",   target: "redeem"  },
  { label: "Help Centre",      target: "help"    },
  { label: "Contact Us",       target: "contact" },
  { label: "Privacy Policy",   target: "privacy" },
  { label: "Terms of Service", target: "terms"   },
];

const SOCIALS = [
  { label: "𝕏",  href: "https://twitter.com/afrivoucher"          },
  { label: "in", href: "https://linkedin.com/company/afrivoucher" },
  { label: "f",  href: "https://facebook.com/afrivoucher"         },
  { label: "📸", href: "https://instagram.com/afrivoucher"        },
];

const PAYMENTS = ["PayFast", "Visa", "MasterCard", "SnapScan"];

// ─── Footer ───────────────────────────────────────────────────────────────
// Props:
//   setPage — function to navigate to another page
export default function Footer({ setPage }) {
  const footerRef = useRef(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gradient = `radial-gradient(circle at ${x}px ${y}px, rgb(0,0,0) 0%, rgba(0,0,0,0) 60%)`;
      el.style.maskImage = gradient;
      el.style.webkitMaskImage = gradient;
    };

    const handleMouseLeave = () => {
      const gradient = "radial-gradient(circle at 1004px -170.984px, rgb(0,0,0) 0%, rgba(0,0,0,0) 60%)";
      el.style.maskImage = gradient;
      el.style.webkitMaskImage = gradient;
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <footer>
      <div className="container">
        {/* Animated logo watermark */}
        <div
          ref={footerRef}
          className="footer-container"
          style={{
            maskImage: "radial-gradient(circle at 1004px -170.984px, rgb(0,0,0) 0%, rgba(0,0,0,0) 60%)",
          }}
        >
          <img src="images/grey-logo.png" alt="" style={{ width: "100%", height: "auto" }} />
        </div>

        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <div className="footer-brand">
              Afri<span>Voucher</span>
            </div>
            <p className="footer-tagline">
              Zimbabwe's leading digital gift experience marketplace. Connecting
              people with unforgettable moments since 2024.
            </p>
            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="social-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Experiences column */}
          <div className="footer-col">
            <h4>Experiences</h4>
            <div className="footer-links">
              {EXPERIENCES.map((l) => (
                <Link href="#" key={l} className="footer-link">{l}</Link>
              ))}
            </div>
          </div>

          {/* Company column */}
          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              {COMPANY.map((l) => (
                <Link href="#" key={l} className="footer-link">{l}</Link>
              ))}
            </div>
          </div>

          {/* Support column */}
          <div className="footer-col">
            <h4>Support</h4>
            <div className="footer-links">
              {SUPPORT_LINKS.map(({ label, target }) => (
                <button
                  key={label}
                  className="footer-link"
                  onClick={() => setPage(target)}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                    fontFamily: "var(--sans)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-legal">
            © 2025 AfriVoucher (Pty) Ltd · All rights reserved · Registered in Zimbabwe
          </p>
          <div className="footer-payments">
            <span style={{ fontSize: ".72rem", color: "rgba(245,240,232,.3)", marginRight: 4 }}>
              Payments by
            </span>
            {PAYMENTS.map((p) => (
              <span key={p} className="pay-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}