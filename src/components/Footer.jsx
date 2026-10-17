// src/components/Footer.jsx  (replace the whole file)
import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logoMobile from "../images/logo-mobile-footer.png";
import logoDesktop from "../images/logo-desktop-footer.png";
import { categoryPath } from "../pages/paths";
import ecocash from "../images/payments/ecocash.png";
import omari from "../images/payments/omari.png";
import worldremit from "../images/payments/worldremit.jpg";
import remitly from "../images/payments/remitly.png";
import wise from "../images/payments/wise.png";
// Each link now has a real destination
const EXPERIENCES = [
  { label: "Wellness & Spa", to: categoryPath("Wellness") },
  { label: "Adventure", to: categoryPath("Adventure") },
  { label: "Dining & Wine", to: categoryPath("Dining & Wine") },
  { label: "Music & Live Events", to: categoryPath("Music") },
  { label: "Private Functions", to: categoryPath("Events") },
  { label: "Skills & Courses", to: categoryPath("Skills") },
];

// `to: null` = page doesn't exist yet (renders as a plain, non-navigating link)
const COMPANY = [
  { label: "About Us", to: null },
  { label: "Partner Programme", to: "/partners" },
  { label: "Corporate Gifting", to: "/contact" },
  { label: "Blog", to: null },
  { label: "Careers", to: null },
];

const SUPPORT_LINKS = [
  { label: "Help Centre", to: "/help" },
  { label: "Contact Us", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

const SOCIALS = [
  { label: "𝕏", href: "https://twitter.com/afrivoucher" },
  { label: "in", href: "https://linkedin.com/company/afrivoucher" },
  { label: "f", href: "https://facebook.com/afrivoucher" },
  { label: "📸", href: "https://instagram.com/afrivoucher" },
];

const PAYMENTS = [

  { name: "EcoCash", logo: ecocash },
  { name: "O'mari", logo: omari },

  { name: "WorldRemit", logo: worldremit },
  { name: "Remitly", logo: remitly },

  { name: "Wise", logo: wise },
];

function FooterLink({ to, children }) {
  if (!to) {
    return (
      <a href="#!" className="footer-link" onClick={(e) => e.preventDefault()}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className="footer-link">
      {children}
    </Link>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────
// `setPage` is no longer needed (links navigate directly) but is accepted
// so existing <Footer setPage={...} /> calls don't break.
export default function Footer() {
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
      const gradient =
        "radial-gradient(circle at 1004px -170.984px, rgb(0,0,0) 0%, rgba(0,0,0,0) 60%)";
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
            maskImage:
              "radial-gradient(circle at 1004px -170.984px, rgb(0,0,0) 0%, rgba(0,0,0,0) 60%)",
          }}
        >
          {/* Leading slash: a relative path breaks on /voucher/... and /category/... */}
          <img
            src="/images/grey-logo.png"
            alt=""
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <div className="footer-brand">
              <picture>
                <source media="(max-width:900px)" srcSet={logoMobile} />
                <img src={logoDesktop} alt="AfriVoucher" />
              </picture>
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
              {EXPERIENCES.map(({ label, to }) => (
                <FooterLink key={label} to={to}>
                  {label}
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Company column */}
          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              {COMPANY.map(({ label, to }) => (
                <FooterLink key={label} to={to}>
                  {label}
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Support column */}
          <div className="footer-col">
            <h4>Support</h4>
            <div className="footer-links">
              {SUPPORT_LINKS.map(({ label, to }) => (
                <FooterLink key={label} to={to}>
                  {label}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-legal">
            © 2025 AfriVoucher (Pty) Ltd · All rights reserved · Registered in
            Zimbabwe
          </p>
          <div className="footer-payments">
            <span
              style={{
                fontSize: ".72rem",
                color: "rgba(245,240,232,.3)",
                marginRight: 4,
              }}
            >
              Payments by
            </span>
           {PAYMENTS.map(({ name, logo }) =>
  logo ? (
    <img
      key={name}
      className="pay-logo"
      src={logo}
      alt={name}
      title={name}
      loading="lazy"
    />
  ) : (
    <span key={name} className="pay-badge">
      {name}
    </span>
  ),
)}
          </div>
        </div>
      </div>
    </footer>
  );
}
