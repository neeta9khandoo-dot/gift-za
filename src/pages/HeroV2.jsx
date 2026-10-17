import React, { useState, useEffect, useCallback } from "react";
import flag from "../images/pngegg.png";
import logo from "../images/logo-desktop.png";
// ─── Slides (left banner) ─────────────────────────────────────────────────
const SLIDES = [
  {
    title: "Get Flat 30% off",
    sub: "AfriVoucher is the best way to gift an experience.",
    cta: "SHOP NOW",
    cat: "Wellness",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80",
  },
  {
    title: "Send Mum a Proper Meal",
    sub: "Gift a traditional lunch, delivered to WhatsApp instantly.",
    cta: "BROWSE TRADITIONAL",
    cat: "Traditional Restaurants",
    img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&q=80",
  },
  {
    title: "Gift a Night to Remember",
    sub: "Live jazz evenings, studio sessions and concert vouchers.",
    cta: "SEE MUSIC",
    cat: "Music",
    img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=700&q=80",
  },
  {
    title: "15,000ft. One Jump.",
    sub: "Tandem skydives and adventures for the one who has everything.",
    cta: "VIEW ADVENTURES",
    cat: "Adventure",
    img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=700&q=80",
  },
];

const HERO_CSS = `
:root{
  --av-dark:#232a35;
  --av-dark-2:#1a2029;
  --av-orange:#d98a35;
  --av-orange-light:#e8a93f;
  --av-orange-deep:#c4531a;
  --av-kraft:#c9a27a;
}
.hv3{margin:0 auto;padding:20px 16px 8px;display:grid;
  grid-template-columns:2fr 1fr;gap:24px}

/* ── main slider ── */
.hv3-main{position:relative;height:345px;border-radius:18px;overflow:hidden;
  background:var(--av-dark);
  background-image:radial-gradient(circle at 20% 20%,rgba(255,255,255,.05) 0 2px,transparent 3px),
                   radial-gradient(circle at 70% 60%,rgba(255,255,255,.04) 0 2px,transparent 3px);
  background-size:46px 46px;
  box-shadow:0 10px 30px rgba(26,32,41,.25)}
.hv3-track{display:flex;height:100%;transition:transform .6s cubic-bezier(.4,0,.2,1)}
.hv3-slide{flex:0 0 100%;position:relative;display:flex;align-items:center;cursor:pointer}
.hv3-copy{position:relative;z-index:2;padding:0 0 0 56px;max-width:60%}
.hv3-title{font-size:clamp(1.8rem,4.2vw,3rem);font-weight:800;line-height:1.1;
  color:#fff;margin:0 0 12px;letter-spacing:-.5px}
.hv3-sub{font-size:1.15rem;color:rgba(255,255,255,.75);margin:0 0 22px;font-weight:300}
.hv3-cta{background:var(--av-orange);border:none;padding:11px 22px;border-radius:999px;
  font-weight:800;font-size:.78rem;letter-spacing:.5px;color:#fff;cursor:pointer;
  transition:background .2s,transform .2s}
.hv3-cta:hover{background:var(--av-orange-deep);transform:translateY(-1px)}
.hv3-img{position:absolute;right:0;bottom:0;height:100%;width:42%;
  object-fit:cover;object-position:center top;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 28%);
  mask-image:linear-gradient(to right,transparent 0,#000 28%)}
.hv3-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:5;
  width:50px;height:50px;border-radius:50%;border:none;background:#fff;
  box-shadow:0 4px 14px rgba(0,0,0,.3);font-size:1.6rem;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  line-height:1;padding:0 0 3px}
.hv3-arrow.prev{left:12px;color:var(--av-dark)}
.hv3-arrow.next{right:12px;color:var(--av-orange)}
.hv3-arrow:hover{transform:translateY(-50%) scale(1.08)}
.hv3-dots{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);
  display:flex;gap:6px;z-index:5}
.hv3-dot{width:7px;height:7px;border-radius:50%;border:none;padding:0;
  background:rgba(255,255,255,.35);cursor:pointer;transition:all .3s}
.hv3-dot.on{background:var(--av-orange);width:20px;border-radius:4px}

/* ── side promo card (matches the app icon) ── */
.hv3-side{
  position:relative;height:345px;border-radius:18px;overflow:hidden;
  padding:28px;box-sizing:border-box;
  display:flex;flex-direction:column;justify-content:space-between;
  text-align:left;color:#fff;
  background:linear-gradient(150deg,#d4802c 0%,#b84a16 100%);
  box-shadow:0 10px 30px rgba(196,83,26,.3)}

.hv3-side-top{display:flex;align-items:center;justify-content:space-between;gap:16px}
.hv3-side-logo{height:34px;width:auto;max-width:60%;object-fit:contain}
.hv3-side-flag{height:44px;width:auto;flex-shrink:0;
  filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}

.hv3-side-body{min-width:0}
.hv3-side-title{margin:0 0 12px;font-size:clamp(1.5rem,2.4vw,1.9rem);
  line-height:1.15;font-weight:800;letter-spacing:-.4px;color:#fff}
.hv3-side-offer{display:inline-block;margin:0 0 12px;padding:6px 12px;
  border-radius:999px;background:#fff;color:var(--av-orange-deep);
  font-size:.85rem;font-weight:700}
.hv3-side-sub{margin:0;font-size:.95rem;line-height:1.5;
  color:rgba(255,255,255,.92)}

.hv3-side-btn{align-self:flex-start;border:none;border-radius:999px;
  padding:12px 24px;background:var(--av-dark);color:#fff;
  font-size:.85rem;font-weight:700;cursor:pointer;
  transition:background .2s,transform .2s}
.hv3-side-btn:hover{background:var(--av-dark-2);transform:translateY(-1px)}
.hv3-side-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}

@media (max-width:900px){
  .hv3-side{height:auto;min-height:290px;gap:20px}
}
@media (max-width:520px){
  .hv3-side{padding:22px}
  .hv3-side-logo{height:28px}
  .hv3-side-flag{height:36px}
}
`;

export function HeroV2({ vouchers = [], onSearch, onCatSelect }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir) => setI((c) => (c + dir + SLIDES.length) % SLIDES.length),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [paused, go]);

  // Navigate to a category if the parent supplies a handler,
  // otherwise fall back to the search handler.
  const open = (cat) => {
    if (onCatSelect) onCatSelect(cat);
    else if (onSearch) onSearch(cat);
  };

  return (
    <>
      <style>{HERO_CSS}</style>
      <section className="hv3">
        {/* ── Left: main slider ── */}
        <div
          className="hv3-main"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="hv3-track"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {SLIDES.map((s) => (
              <div
                key={s.title}
                className="hv3-slide"
                onClick={() => open(s.cat)}
              >
                <div className="hv3-copy">
                  <h1 className="hv3-title">{s.title}</h1>
                  <p className="hv3-sub">{s.sub}</p>
                  <button
                    className="hv3-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      open(s.cat);
                    }}
                  >
                    {s.cta} ›
                  </button>
                </div>
                <img
                  className="hv3-img"
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <button
            className="hv3-arrow prev"
            onClick={() => go(-1)}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="hv3-arrow next"
            onClick={() => go(1)}
            aria-label="Next"
          >
            ›
          </button>

          <div className="hv3-dots">
            {SLIDES.map((_, d) => (
              <button
                key={d}
                className={`hv3-dot${d === i ? " on" : ""}`}
                onClick={() => setI(d)}
                aria-label={`Slide ${d + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── Right: promo card ── */}
        {/* ── Right: promo card ── */}
        <div className="hv3-side">
          <div className="hv3-side-top">
            <img className="hv3-side-logo" src={logo} alt="AfriVoucher" />
            <img className="hv3-side-flag" src={flag} alt="Zimbabwe flag" />
          </div>

          <div className="hv3-side-body">
            <h2 className="hv3-side-title">Treat them from afar</h2>
            <span className="hv3-side-offer">
              US$10 off vouchers over US$90
            </span>
            <p className="hv3-side-sub">
              You pay from abroad. They enjoy it in Zimbabwe.
            </p>
          </div>

          <button
            className="hv3-side-btn"
            onClick={() => open("Traditional Restaurants")}
          >
            Send a gift
          </button>
        </div>
      </section>
    </>
  );
}

export default HeroV2;
