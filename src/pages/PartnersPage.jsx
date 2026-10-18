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

const WE_HANDLE = [
  { t: "Payments", d: "Secure checkout for every voucher sold." },
  { t: "WhatsApp delivery", d: "Codes reach the recipient instantly." },
  {
    t: "Customer support",
    d: "You deliver the experience, we handle the rest.",
  },
];

const FORM_FIELDS = [
  {
    key: "business",
    label: "Business Name",
    type: "text",
    placeholder: "Beat Studio / Stage Events",
    half: true,
    req: true,
  },
  { key: "category", label: "Category", type: "select", half: true },
  {
    key: "contact",
    label: "Contact Name",
    type: "text",
    placeholder: "Gerbo Moyo",
    half: true,
    req: true,
  },
  {
    key: "whatsapp",
    label: "WhatsApp Number",
    type: "text",
    placeholder: "+263776109275",
    half: true,
    req: true,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "hello@yourbusiness.co.zw",
    half: false,
    req: true,
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
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
        title: "Application received",
        msg: "We will be in touch within 24 hours.",
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

  const renderField = ({ key, label, type, placeholder, req }) => (
    <div className="pp-field" key={key}>
      <label className="pp-label" htmlFor={`pp-${key}`}>
        {label}
        {req && <i aria-hidden="true"> *</i>}
      </label>

      {type === "select" ? (
        <select
          id={`pp-${key}`}
          className="pp-input pp-select"
          value={form[key]}
          onChange={setF(key)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={`pp-${key}`}
          className="pp-input pp-textarea"
          value={form[key]}
          onChange={setF(key)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          id={`pp-${key}`}
          className="pp-input"
          type={type}
          value={form[key]}
          onChange={setF(key)}
          placeholder={placeholder}
          required={req}
        />
      )}
    </div>
  );

  return (
    <div className="pp-page">
      <style>{PARTNERS_CSS}</style>

      {/* ── Hero ── */}
      <header className="pp-hero">
        <div className="pp-hero-bg" />
        <div className="pp-hero-in">
          <p className="pp-eyebrow">Partner Programme</p>
          <h1 className="pp-h1">
            List your business.
            <span>Earn on every sale.</span>
          </h1>
          <p className="pp-lede">
            Whether you run a music venue, plan private events, or offer spa
            services — we handle payments, WhatsApp delivery and customer
            support. You just deliver the experience and collect your payout.
          </p>
        </div>

        <div className="pp-stats">
          {STATS.map(({ val, lbl }) => (
            <div key={lbl} className="pp-stat">
              <div className="pp-stat-val">{val}</div>
              <div className="pp-stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Application ── */}
      <main className="pp-main">
        <aside className="pp-side">
          <p className="pp-eyebrow dark">Apply</p>
          <h2 className="pp-h2">Apply to partner</h2>
          <p className="pp-sub">
            Takes 5 minutes. We'll be in touch within 24 hours.
          </p>

          <ol className="pp-steps">
            {WE_HANDLE.map(({ t, d }, i) => (
              <li key={t}>
                <span className="pp-step-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="pp-step-t">{t}</div>
                  <div className="pp-step-d">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        <form className="pp-form" onSubmit={handleSubmit} noValidate>
          <div className="pp-grid">
            {FORM_FIELDS.filter((f) => f.half).map(renderField)}
          </div>

          {FORM_FIELDS.filter((f) => !f.half).map(renderField)}

          {status && (
            <div
              className={"pp-status " + status.type}
              role={status.type === "ok" ? "status" : "alert"}
            >
              {status.title && <strong>{status.title}</strong>}
              <span>{status.msg}</span>
            </div>
          )}

          <button type="submit" className="pp-submit" disabled={loading}>
            <span>{loading ? "Submitting…" : "Submit application"}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 12h17M14 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}

/* ═══════════════════════════ Styles ═══════════════════════════ */
const PARTNERS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

.pp-page{
  --ink:#281432; --paper:#fff; --stone:#f3f2f0;
  --hair:rgba(40,20,50,.16); --dim:rgba(40,20,50,.62);
  --ease:cubic-bezier(.19,1,.22,1);
  --font:'Jost','Helvetica Neue',Arial,sans-serif;
  background:var(--paper);color:var(--ink);font-family:var(--font);width:100%;
}
.pp-page *{box-sizing:border-box}

/* ───── hero ───── */
.pp-hero{position:relative;background:var(--ink);color:#fff;overflow:hidden}
.pp-hero-bg{
  position:absolute;inset:0;
  background:
    linear-gradient(180deg,rgba(40,20,50,.72) 0%,rgba(40,20,50,.9) 100%),
    url('/images/hero-3.jpg') center 40% / cover no-repeat;
  transform:scale(1.06);animation:pp-zoom 2.4s var(--ease) forwards;
}
@keyframes pp-zoom{to{transform:scale(1)}}
.pp-hero-in{
  position:relative;max-width:900px;margin:0 auto;
  padding:clamp(80px,14vw,150px) 24px clamp(56px,8vw,90px);text-align:center;
}
.pp-eyebrow{
  display:flex;align-items:center;justify-content:center;gap:14px;margin:0 0 26px;
  font-size:.7rem;font-weight:400;letter-spacing:.34em;text-transform:uppercase;color:rgba(255,255,255,.72);
  animation:pp-up 1s var(--ease) both;
}
.pp-eyebrow::before,.pp-eyebrow::after{content:"";width:34px;height:1px;background:currentColor;opacity:.6}
.pp-eyebrow.dark{justify-content:flex-start;color:var(--dim)}
.pp-eyebrow.dark::after{display:none}

.pp-h1{
  margin:0 0 26px;font-weight:300;text-transform:uppercase;
  font-size:clamp(1.9rem,5.4vw,4rem);line-height:1.12;letter-spacing:.14em;text-wrap:balance;
  animation:pp-up 1.1s var(--ease) .1s both;
}
.pp-h1 span{display:block;margin-top:.15em;font-weight:500}
.pp-lede{
  margin:0 auto;max-width:600px;font-size:1rem;font-weight:300;line-height:1.85;letter-spacing:.02em;
  color:rgba(255,255,255,.78);animation:pp-up 1.1s var(--ease) .2s both;
}
@keyframes pp-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}

/* stats: hairline-divided strip across the bottom of the hero */
.pp-stats{
  position:relative;display:grid;grid-template-columns:repeat(3,1fr);
  max-width:1100px;margin:0 auto;border-top:1px solid rgba(255,255,255,.22);
  animation:pp-up 1.1s var(--ease) .35s both;
}
.pp-stat{padding:34px 16px 38px;text-align:center}
.pp-stat + .pp-stat{border-left:1px solid rgba(255,255,255,.22)}
.pp-stat-val{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:300;letter-spacing:.06em;line-height:1}
.pp-stat-lbl{margin-top:12px;font-size:.66rem;font-weight:400;letter-spacing:.26em;text-transform:uppercase;color:rgba(255,255,255,.65)}

/* ───── main ───── */
.pp-main{
  max-width:1160px;margin:0 auto;padding:clamp(56px,9vw,110px) 24px clamp(70px,10vw,120px);
  display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(40px,7vw,100px);align-items:start;
}
.pp-side{position:sticky;top:96px}
.pp-h2{margin:0 0 16px;font-weight:300;font-size:clamp(1.6rem,3vw,2.3rem);line-height:1.15;letter-spacing:.12em;text-transform:uppercase}
.pp-sub{margin:0 0 40px;max-width:360px;font-size:.96rem;font-weight:300;line-height:1.8;color:var(--dim)}

.pp-steps{list-style:none;margin:0;padding:0;border-top:1px solid var(--hair)}
.pp-steps li{display:flex;gap:22px;padding:22px 0;border-bottom:1px solid var(--hair)}
.pp-step-n{font-size:.78rem;font-weight:500;letter-spacing:.2em;color:var(--dim);padding-top:3px}
.pp-step-t{font-size:.8rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;margin-bottom:6px}
.pp-step-d{font-size:.9rem;font-weight:300;line-height:1.6;color:var(--dim)}

/* ───── form ───── */
.pp-form{display:flex;flex-direction:column;gap:34px}
.pp-grid{display:grid;grid-template-columns:1fr 1fr;gap:34px 30px}
.pp-field{position:relative}
.pp-field::after{ /* focus line grows in from the left */
  content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--ink);
  transform:scaleX(0);transform-origin:left;transition:transform .7s var(--ease);
}
.pp-field:focus-within::after{transform:scaleX(1)}

.pp-label{
  display:block;margin-bottom:6px;
  font-size:.66rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--dim);
  transition:color .4s;
}
.pp-label i{font-style:normal;color:var(--ink)}
.pp-field:focus-within .pp-label{color:var(--ink)}

.pp-input{
  display:block;width:100%;padding:12px 0 14px;
  background:transparent;color:var(--ink);
  border:0;border-bottom:1px solid var(--hair);border-radius:0;outline:none;
  font-family:var(--font);font-size:1.02rem;font-weight:400;letter-spacing:.02em;
  transition:border-color .4s;
}
.pp-input::placeholder{color:rgba(40,20,50,.34);font-weight:300}
.pp-input:hover{border-bottom-color:rgba(40,20,50,.45)}
.pp-textarea{resize:none;min-height:96px;line-height:1.6}
.pp-select{
  appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:28px;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23281432' stroke-width='1.3'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E") right 2px center / 12px no-repeat;
}

/* status */
.pp-status{
  display:flex;flex-direction:column;gap:4px;padding:16px 20px;
  background:var(--stone);border-left:3px solid var(--ink);
  font-size:.9rem;font-weight:300;line-height:1.6;animation:pp-up .7s var(--ease) both;
}
.pp-status strong{font-weight:500;letter-spacing:.2em;text-transform:uppercase;font-size:.74rem}
.pp-status.error{border-left-color:#b4263a}
.pp-status.error span{color:#8c1d2e}

/* submit: outlined, purple fill rises on hover */
.pp-submit{
  position:relative;overflow:hidden;isolation:isolate;
  display:flex;align-items:center;justify-content:space-between;gap:20px;width:100%;
  padding:20px 26px;margin-top:6px;
  background:transparent;color:var(--ink);border:1px solid var(--ink);border-radius:0;cursor:pointer;
  font-family:var(--font);font-weight:500;font-size:.82rem;letter-spacing:.28em;text-transform:uppercase;
  transition:color .6s var(--ease);
}
.pp-submit::before{
  content:"";position:absolute;inset:0;background:var(--ink);z-index:-1;
  transform:translateY(101%);transition:transform .8s var(--ease);
}
.pp-submit:hover:not(:disabled){color:#fff}
.pp-submit:hover:not(:disabled)::before{transform:none}
.pp-submit svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round;transition:transform .7s var(--ease)}
.pp-submit:hover:not(:disabled) svg{transform:translateX(6px)}
.pp-submit:disabled{opacity:.45;cursor:not-allowed}
.pp-submit:focus-visible{outline:1px solid var(--ink);outline-offset:4px}

/* ───── responsive ───── */
@media (max-width:900px){
  .pp-main{grid-template-columns:1fr;gap:48px}
  .pp-side{position:static}
}
@media (max-width:600px){
  .pp-grid{grid-template-columns:1fr;gap:30px}
  .pp-stat{padding:26px 8px 28px}
  .pp-stat-lbl{letter-spacing:.16em;font-size:.6rem}
  .pp-eyebrow::before,.pp-eyebrow::after{width:20px}
}
@media (prefers-reduced-motion:reduce){
  .pp-hero-bg{animation:none;transform:none}
  .pp-eyebrow,.pp-h1,.pp-lede,.pp-stats,.pp-status{animation:none}
  .pp-field::after,.pp-submit::before,.pp-submit svg{transition:none}
}
`;
