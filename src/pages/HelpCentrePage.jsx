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
        a: "Check that the WhatsApp number was entered correctly at checkout. If the number is correct, go to My Orders and use the Resend button to push the code again. Still stuck? Contact us on WhatsApp at +263 77 610 9275.",
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
  { label: "WhatsApp", value: "+263 77 610 9275", href: "https://wa.me/27676056777" },
  { label: "Email", value: "support@afrivoucher.com", href: "mailto:support@afrivoucher.com" },
  { label: "Hours", value: "Mon–Fri, 8am–6pm CAT", href: null },
];

const NAV_LINKS = [
  { label: "← Back to store", target: "store" },
  { label: "Privacy Policy", target: "privacy" },
  { label: "Terms of Service", target: "terms" },
  { label: "Redeem a Voucher", target: "redeem" },
];

const pad = (n) => String(n).padStart(2, "0");

function FaqItem({ id, q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"hc-item" + (open ? " open" : "")}>
      <button
        type="button"
        className="hc-q"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-btn`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="hc-q-text">{q}</span>
        <span className="hc-plus" aria-hidden="true" />
      </button>
      <div
        className="hc-a-wrap"
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
      >
        <div className="hc-a-inner">
          <p className="hc-a">{a}</p>
        </div>
      </div>
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
    <div className="hc-page">
      <style>{HELP_CSS}</style>

      {/* ── Hero ── */}
      <header className="hc-hero">
        <div className="hc-wrap">
          <p className="hc-eyebrow">Help Centre</p>
          <h1 className="hc-h1">How can we help?</h1>
          <p className="hc-lede">
            Answers to the most common questions about buying, redeeming and
            managing AfriVoucher gift experiences.
          </p>
        </div>
      </header>

      {/* ── Category tabs ── */}
      <nav className="hc-tabs" aria-label="Help topics">
        <div className="hc-tabs-row">
          <button
            type="button"
            className={"hc-tab" + (!activeCategory ? " on" : "")}
            onClick={() => setActiveCategory(null)}
          >
            All topics
          </button>
          {FAQS.map(({ category }) => (
            <button
              type="button"
              key={category}
              className={"hc-tab" + (activeCategory === category ? " on" : "")}
              onClick={() =>
                setActiveCategory(category === activeCategory ? null : category)
              }
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      {/* ── FAQ sections ── */}
      <main className="hc-body">
        <div className="hc-wrap">
          {filtered.map(({ category, items }) => {
            const num = FAQS.findIndex((g) => g.category === category) + 1;
            return (
              <section key={category} className="hc-group">
                <div className="hc-group-head">
                  <span className="hc-num">{pad(num)}</span>
                  <h2 className="hc-group-title">{category}</h2>
                  <span className="hc-count">{items.length} questions</span>
                </div>
                <div className="hc-list">
                  {items.map((item, i) => (
                    <FaqItem
                      key={item.q}
                      id={`faq-${num}-${i}`}
                      q={item.q}
                      a={item.a}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* ── Still need help? ── */}
          <section className="hc-contact">
            <div className="hc-contact-head">
              <h3 className="hc-contact-title">Still need help?</h3>
              <p className="hc-contact-sub">
                Our support team is available Monday to Friday. We typically
                respond within a few hours.
              </p>
            </div>

            <div className="hc-tiles">
              {CONTACT_ITEMS.map(({ label, value, href }) => (
                <div key={label} className="hc-tile">
                  <div className="hc-tile-label">{label}</div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hc-tile-value link"
                    >
                      {value}
                    </a>
                  ) : (
                    <div className="hc-tile-value">{value}</div>
                  )}
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/27676056777"
              target="_blank"
              rel="noopener noreferrer"
              className="hc-cta"
            >
              <span>Chat with us on WhatsApp</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 12h17M14 6l6 6-6 6" />
              </svg>
            </a>
          </section>

          {/* ── Bottom links ── */}
          <div className="hc-links">
            {NAV_LINKS.map(({ label, target }) => (
              <button
                type="button"
                key={label}
                className="hc-link"
                onClick={() => setPage(target)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════ Styles ═══════════════════════════ */
const HELP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap');

.hc-page{
  --y:#FFF200; --bg:#0b0b0b; --card:#161616;
  --line:rgba(255,255,255,.16); --dim:rgba(255,255,255,.62);
  --ease:cubic-bezier(.19,1,.22,1);
  --display:'Barlow Condensed','Arial Narrow',Impact,sans-serif;
  --body:'Barlow',system-ui,sans-serif;
  background:var(--bg);color:#fff;font-family:var(--body);min-height:100vh;width:100%;
}
.hc-page *{box-sizing:border-box}
.hc-wrap{max-width:1100px;margin:0 auto;padding:0 24px}

/* ───── hero ───── */
.hc-hero{padding:72px 0 56px;border-bottom:1px solid var(--line)}
.hc-eyebrow{
  display:flex;align-items:center;gap:12px;margin:0 0 18px;
  font-size:.72rem;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--dim);
}
.hc-eyebrow::before{content:"";width:26px;height:2px;background:var(--y)}
.hc-h1{
  margin:0 0 18px;font-family:var(--display);font-weight:700;
  font-size:clamp(2.6rem,7vw,5.2rem);line-height:.92;letter-spacing:.015em;text-transform:uppercase;
  text-wrap:balance;
}
.hc-lede{margin:0;max-width:560px;font-size:1rem;line-height:1.7;color:var(--dim)}

/* ───── tabs ───── */
.hc-tabs{border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none;background:var(--bg)}
.hc-tabs::-webkit-scrollbar{display:none}
.hc-tabs-row{display:flex;max-width:1100px;margin:0 auto;padding:0 24px}
.hc-tab{
  flex:none;position:relative;padding:18px 20px;background:none;border:0;border-radius:0;cursor:pointer;
  font-family:var(--display);font-weight:600;font-size:1rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--dim);white-space:nowrap;transition:color .4s var(--ease);
}
.hc-tab::after{
  content:"";position:absolute;left:20px;right:20px;bottom:-1px;height:3px;background:var(--y);
  transform:scaleX(0);transform-origin:left;transition:transform .6s var(--ease);
}
.hc-tab:hover{color:#fff}
.hc-tab.on{color:#fff}
.hc-tab.on::after{transform:scaleX(1)}
.hc-tab:first-child{padding-left:0}
.hc-tab:first-child::after{left:0}
.hc-tab:focus-visible{outline:1px solid var(--y);outline-offset:-4px}

/* ───── groups ───── */
.hc-body{padding:20px 0 90px}
.hc-group{
  display:grid;grid-template-columns:300px minmax(0,1fr);gap:56px;
  padding:48px 0;border-bottom:1px solid var(--line);
}
.hc-group-head{position:sticky;top:96px;align-self:start}
.hc-num{
  display:block;margin-bottom:10px;
  font-family:var(--display);font-weight:600;font-size:1rem;letter-spacing:.14em;color:var(--y);
}
.hc-group-title{
  margin:0 0 12px;font-family:var(--display);font-weight:700;
  font-size:clamp(1.6rem,2.6vw,2.2rem);line-height:1;letter-spacing:.03em;text-transform:uppercase;
  text-wrap:balance;overflow-wrap:anywhere;
}
.hc-count{font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}

/* ───── accordion ───── */
.hc-list{border-top:1px solid var(--line)}
.hc-item{border-bottom:1px solid var(--line);position:relative}
.hc-item::before{
  content:"";position:absolute;left:0;top:-1px;height:2px;width:100%;background:var(--y);
  transform:scaleX(0);transform-origin:left;transition:transform .8s var(--ease);
}
.hc-item.open::before{transform:scaleX(1)}
.hc-q{
  width:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;
  padding:22px 0;background:none;border:0;border-radius:0;cursor:pointer;text-align:left;color:#fff;
  font-family:var(--body);
}
.hc-q-text{font-size:1.02rem;font-weight:600;line-height:1.4;transition:color .4s}
.hc-q:hover .hc-q-text,.hc-item.open .hc-q-text{color:var(--y)}
.hc-q:focus-visible{outline:1px solid var(--y);outline-offset:2px}

/* square plus -> cross */
.hc-plus{
  position:relative;flex:none;width:38px;height:38px;border:1px solid rgba(255,255,255,.5);
  transition:background .5s var(--ease),border-color .5s var(--ease),transform .6s var(--ease);
}
.hc-plus::before,.hc-plus::after{
  content:"";position:absolute;left:50%;top:50%;width:12px;height:1.5px;background:#fff;
  transform:translate(-50%,-50%);transition:background .4s,transform .6s var(--ease);
}
.hc-plus::after{transform:translate(-50%,-50%) rotate(90deg)}
.hc-q:hover .hc-plus{border-color:var(--y)}
.hc-item.open .hc-plus{background:var(--y);border-color:var(--y)}
.hc-item.open .hc-plus::before,.hc-item.open .hc-plus::after{background:#000}
.hc-item.open .hc-plus::after{transform:translate(-50%,-50%) rotate(0deg)}

/* smooth height without JS measurement */
.hc-a-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .7s var(--ease)}
.hc-item.open .hc-a-wrap{grid-template-rows:1fr}
.hc-a-inner{overflow:hidden}
.hc-a{
  margin:0;padding:0 62px 26px 0;max-width:680px;
  font-size:.95rem;line-height:1.8;color:var(--dim);
  opacity:0;transform:translateY(-6px);transition:opacity .5s ease,transform .7s var(--ease);
}
.hc-item.open .hc-a{opacity:1;transform:none;transition-delay:.1s}

/* ───── contact ───── */
.hc-contact{margin-top:56px;padding:40px;background:var(--card);position:relative}
.hc-contact::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:var(--y)}
.hc-contact-title{
  margin:0 0 10px;font-family:var(--display);font-weight:700;
  font-size:clamp(1.7rem,3vw,2.4rem);line-height:1;letter-spacing:.03em;text-transform:uppercase;
}
.hc-contact-sub{margin:0 0 28px;max-width:520px;font-size:.92rem;line-height:1.7;color:var(--dim)}
.hc-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:28px}
.hc-tile{padding:20px;border:1px solid var(--line);transition:border-color .5s var(--ease)}
.hc-tile:hover{border-color:var(--y)}
.hc-tile-label{margin-bottom:8px;font-size:.64rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.hc-tile-value{
  font-family:var(--display);font-weight:600;font-size:1.25rem;letter-spacing:.04em;line-height:1.2;
  overflow-wrap:anywhere;color:#fff;text-decoration:none;
}
.hc-tile-value.link{display:inline-block;border-bottom:1px solid var(--line);transition:color .3s,border-color .3s}
.hc-tile-value.link:hover{color:var(--y);border-color:var(--y)}

.hc-cta{
  display:inline-flex;align-items:center;justify-content:space-between;gap:28px;
  padding:16px 22px;background:var(--y);color:#000;border:1px solid var(--y);border-radius:0;text-decoration:none;
  font-family:var(--display);font-weight:700;font-size:1.05rem;letter-spacing:.16em;text-transform:uppercase;
  transition:background .5s var(--ease),border-color .5s var(--ease);
}
.hc-cta svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:transform .6s var(--ease)}
.hc-cta:hover{background:#fff;border-color:#fff}
.hc-cta:hover svg{transform:translateX(6px)}
.hc-cta:focus-visible{outline:2px solid #fff;outline-offset:3px}

/* ───── bottom links ───── */
.hc-links{display:flex;flex-wrap:wrap;gap:12px 28px;margin-top:40px}
.hc-link{
  position:relative;padding:4px 0;background:none;border:0;cursor:pointer;color:#fff;
  font-family:var(--display);font-weight:600;font-size:.95rem;letter-spacing:.16em;text-transform:uppercase;
}
.hc-link::after{
  content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--y);
  transform:scaleX(0);transform-origin:left;transition:transform .6s var(--ease);
}
.hc-link:hover{color:var(--y)}
.hc-link:hover::after{transform:scaleX(1)}
.hc-link:focus-visible{outline:1px solid var(--y);outline-offset:4px}

/* ───── responsive ───── */
@media (max-width:900px){
  .hc-group{grid-template-columns:1fr;gap:24px;padding:36px 0}
  .hc-group-head{position:static}
  .hc-tiles{grid-template-columns:1fr}
}
@media (max-width:600px){
  .hc-wrap,.hc-tabs-row{padding:0 16px}
  .hc-hero{padding:48px 0 40px}
  .hc-contact{padding:28px 20px}
  .hc-a{padding-right:0}
  .hc-cta{width:100%}
  .hc-q-text{font-size:.96rem}
}
@media (prefers-reduced-motion:reduce){
  .hc-a-wrap,.hc-a,.hc-plus,.hc-plus::before,.hc-plus::after,.hc-item::before,.hc-tab::after,.hc-cta svg,.hc-link::after{transition:none}
}
`;