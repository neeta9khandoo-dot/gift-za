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
.hv3-side{height:345px;border-radius:18px;overflow:hidden;
  background:linear-gradient(145deg,var(--av-orange-light) 0%,var(--av-orange-deep) 100%);
  text-align:center;padding:16px 18px 0;
  box-shadow:0 10px 30px rgba(196,83,26,.3)}
  .hv3-side {
  display: flex;
  align-items: center;
  gap: 24px;
}

.hv3-side-flag {
  width: 160px;
  max-width: 35%;
  height: auto;
  flex-shrink: 0;
}

.hv3-side-content {
  flex: 1;
  min-width: 0;
}

/* stack the flag above the text on phones */
@media (max-width: 600px) {
  .hv3-side {
    flex-direction: column;
    text-align: center;
  }
  .hv3-side-flag {
    width: 120px;
  }
}
.hv3-logo{background:var(--av-dark);color:#fff;font-weight:800;
  font-size:.85rem;letter-spacing:.5px;padding:9px 16px;border-radius:8px;margin-bottom:22px}
.hv3-side-title{font-size:1.2rem;line-height:1.7;color:#fff;margin:0;font-weight:500;
  text-shadow:0 1px 8px rgba(0,0,0,.15)}
.hv3-side-stage{position:relative;flex:1;width:100%;display:flex;
  align-items:flex-end;justify-content:center;gap:6px;font-size:4.2rem;
  padding-bottom:6px}
.hv3-side-stage span:nth-child(2){font-size:5.4rem}
.hv3-side-btn{position:absolute;top:24px;left:50%;transform:translateX(-50%);
  background:var(--av-dark);color:#fff;border:none;border-radius:999px;padding:10px 20px;
  font-size:.8rem;font-weight:700;cursor:pointer;z-index:2;white-space:nowrap}
.hv3-side-btn:hover{background:var(--av-dark-2)}

@media (max-width:900px){
  .hv3{grid-template-columns:1fr;gap:16px}
  .hv3-main{height:300px}
  .hv3-copy{padding-left:56px;max-width:68%}
  .hv3-side{height:290px}
}
@media (max-width:520px){
  .hv3-main{height:260px}
  .hv3-copy{padding-left:46px;max-width:72%}
  .hv3-sub{font-size:.9rem;margin-bottom:14px}
  .hv3-arrow{width:38px;height:38px;font-size:1.3rem}
  .hv3-arrow.prev{left:6px}.hv3-arrow.next{right:6px}
  .hv3-img{width:46%;opacity:.85}
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
       <div className="hv3-side">
  <img
    className="hv3-side-flag"
    src={flag}
    alt="Zimbabwe flag"
  />
  <div className="hv3-side-content">
    <img src={logo} alt="" />
    <h2 className="hv3-side-title">
      Treat Them from Afar – Get US$10
      <br />
      OFF Gift Vouchers over US$90
    </h2>
    <p className="hv3-side-sub">
      You pay from abroad. They enjoy it in Zimbabwe.
    </p>
    <div className="hv3-side-stage">
      <button
        className="hv3-side-btn"
        onClick={() => open("Traditional Restaurants")}
      >
        Send a Gift
      </button>
      <span title="Wellness"></span>
      <span title="Traditional Restaurants"></span>
      <span title="Music"></span>
      <span title="Adventure"></span>
      <span title="Florists"></span>
      <span title="Stays"></span>
    </div>
  </div>
</div>
      </section>
    </>
  );
}

export default HeroV2;
