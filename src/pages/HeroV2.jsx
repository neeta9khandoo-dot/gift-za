/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useRef } from "react";
import flag from "../images/pngegg.png";
import logo from "../images/logo-desktop.png";

// ─── Slides (left banner) ─────────────────────────────────────────────────
const SLIDES = [
  {
    title: "Get Flat 30% off",
    sub: "AfriVoucher is the best way to gift an experience.",
    cta: "SHOP NOW",
    cat: "Wellness",
    img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269266/spa_r289dd.webp?w=700&q=80",
  },
  {
    title: "Send Mum a Proper Meal",
    sub: "Gift a traditional lunch, delivered to WhatsApp instantly.",
    cta: "BROWSE TRADITIONAL",
    cat: "Traditional Restaurants",
    img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269267/send-mum_qqist7.png?w=700&q=80",
  },
  {
    title: "Gift a Night to Remember",
    sub: "Live jazz evenings, studio sessions and concert vouchers.",
    cta: "SEE MUSIC",
    cat: "Music",
    img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269265/music_wpedsl.jpg?w=700&q=80",
  },
  {
    title: "15,000ft. One Jump.",
    sub: "Tandem skydives and adventures for the one who has everything.",
    cta: "VIEW ADVENTURES",
    cat: "Adventure",
    img: "https://res.cloudinary.com/dlrdkvxiz/image/upload/v1792269266/skydive_lhip9i.jpg?w=700&q=80",
  },
];

const AUTOPLAY_SECONDS = 5.5; // also drives the progress ring on the active bullet

const HERO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600&display=swap');
:root{
  --av-dark:#232a35;
  --av-dark-2:#1a2029;
  --av-orange:#d98a35;
  --av-orange-light:#e8a93f;
  --av-orange-deep:#c4531a;
  --av-kraft:#c9a27a;
  --av-font:"Gill Sans","Gill Sans MT",Cabin,Calibri,"Trebuchet MS",sans-serif;
}
.hv3{box-sizing:border-box;width:100%;margin:0 auto;padding:20px 16px 8px;
  display:grid;grid-template-columns:2fr 1fr;gap:24px}
.hv3 *,.hv3 *::before,.hv3 *::after{box-sizing:border-box}
.hv3 > *{min-width:0}
.hv3{font-family:var(--av-font)}
.hv3 button{font-family:inherit}
.hv3-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);
  white-space:nowrap}

/* ── off-grid carousel: big image | copy | small next image (proportions from the reference) ── */
.hv3-main{position:relative;aspect-ratio:1917/850;min-height:380px;container-type:inline-size;
  border-radius:18px;overflow:hidden;background:#fff;border:1px solid rgba(35,42,53,.1);
  box-shadow:0 10px 30px rgba(26,32,41,.12);touch-action:pan-y}
.hv3-main:focus-visible{outline:2px solid var(--av-orange-deep);outline-offset:3px}

.hv3-left{position:absolute;z-index:2;left:56.2%;top:0;width:23%;height:68%;
  display:flex;align-items:center;text-align:left}
.hv3-caps{width:100%;display:grid;justify-items:start}

/* captions cross-fade and slide in from the left */
.hv3-cap{grid-area:1/1;opacity:0;visibility:hidden;transform:translateX(-20px);
  transition:opacity .5s ease,transform .5s cubic-bezier(.165,.84,.44,1),visibility 0s linear .5s}
.hv3-cap.on{opacity:1;visibility:visible;transform:none;
  transition:opacity .5s ease .15s,transform .5s cubic-bezier(.165,.84,.44,1) .15s,visibility 0s}
.hv3-title{margin:0 0 .9em;font-size:clamp(.95rem,1.55cqw,1.5rem);font-weight:400;
  line-height:1.25;letter-spacing:.1em;text-transform:uppercase;color:var(--av-dark);
  overflow-wrap:break-word}
.hv3-sub{margin:0 0 1.7em;font-size:clamp(.8rem,1.1cqw,1rem);line-height:1.75;
  color:rgba(35,42,53,.62)}

/* circular-arrow link button */
.hv3-cta{display:inline-flex;align-items:center;gap:14px;background:none;border:none;
  padding:0;cursor:pointer;color:var(--av-dark);font-size:clamp(.68rem,.9cqw,.8rem);font-weight:500;
  letter-spacing:.14em;text-transform:uppercase;text-align:left}
.hv3-cta-ring{flex:0 0 auto;width:36px;height:36px;border-radius:50%;
  border:1px solid currentColor;display:flex;align-items:center;justify-content:center;
  transition:background .3s,color .3s}
.hv3-cta-ring svg{width:14px;height:14px;transition:transform .3s}
.hv3-cta:hover .hv3-cta-ring{background:var(--av-dark);color:#fff}
.hv3-cta:hover .hv3-cta-ring svg{transform:translateX(2px)}
.hv3-cta:focus-visible,.hv3-bullet:focus-visible,.hv3-img:focus-visible{
  outline:2px solid var(--av-orange-deep);outline-offset:3px}

/* bullets with a progress ring on the active one */
.hv3-bullets{position:absolute;z-index:2;right:47.4%;top:93.2%;transform:translateY(-50%);
  display:flex;gap:2px}
.hv3-bullet{width:24px;height:24px;border:none;background:none;padding:0;cursor:pointer;
  display:flex;align-items:center;justify-content:center}
.hv3-bullet svg{width:16px;height:16px;overflow:visible}
.hv3-bullet .dot{fill:var(--av-dark);opacity:.35;transition:opacity .3s}
.hv3-bullet.on .dot{opacity:1}
.hv3-bullet .ring{fill:none;stroke:var(--av-orange);stroke-width:1.5;
  stroke-dasharray:45.55;stroke-dashoffset:45.55;
  transform:rotate(-90deg);transform-origin:8px 8px;transform-box:view-box}
.hv3-bullet.on .ring{animation:hv3-ring ${AUTOPLAY_SECONDS}s linear forwards}
.hv3-bullets.paused .ring{animation-play-state:paused}
@keyframes hv3-ring{to{stroke-dashoffset:0}}

.hv3-stage{position:absolute;inset:0;z-index:1;pointer-events:none;
  --al:0%;--at:0%;--aw:52.6%;--ah:87.6%;
  --nl:82.5%;--nt:26.4%;--nw:17.5%;--nh:61.2%}
.hv3-img{position:absolute;overflow:hidden;border-radius:0;background:#ececec;
  pointer-events:none;
  transition:left .8s cubic-bezier(.165,.84,.44,1),top .8s cubic-bezier(.165,.84,.44,1),
    width .8s cubic-bezier(.165,.84,.44,1),height .8s cubic-bezier(.165,.84,.44,1),
    opacity .6s ease}
.hv3-img img{width:100%;height:100%;object-fit:cover;display:block;
  -webkit-user-drag:none;user-select:none}
/* current slide: big, on the left */
.hv3-img.s-act{left:var(--al);top:var(--at);width:var(--aw);height:var(--ah);
  opacity:1;pointer-events:auto;cursor:pointer}
/* next slide: small and dimmed until it slides across to the left */
.hv3-img.s-nxt{left:var(--nl);top:var(--nt);width:var(--nw);height:var(--nh);
  opacity:.85;pointer-events:auto;cursor:pointer}
.hv3-img.s-nxt:hover{opacity:1}
/* previous slide exits left; the rest wait off-screen on the right */
.hv3-img.s-prv{left:calc(var(--aw) * -1 - 10%);top:var(--at);width:var(--aw);
  height:var(--ah);opacity:0}
.hv3-img.s-hid{left:100%;top:var(--nt);width:var(--nw);height:var(--nh);opacity:0}

/* ── side promo card (matches the app icon) ── */
.hv3-side{
  position:relative;min-height:380px;border-radius:18px;overflow:hidden;
  padding:28px;
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
  line-height:1.15;font-weight:500;letter-spacing:.005em;color:#fff}
.hv3-side-offer{display:inline-block;margin:0 0 12px;padding:6px 12px;
  border-radius:999px;background:#fff;color:var(--av-orange-deep);
  font-size:.85rem;font-weight:600;letter-spacing:.02em}
.hv3-side-sub{margin:0;font-size:.95rem;line-height:1.5;
  color:rgba(255,255,255,.92)}

.hv3-side-btn{align-self:flex-start;border:none;border-radius:999px;
  padding:12px 24px;background:var(--av-dark);color:#fff;
  font-size:.76rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;
  transition:background .2s,transform .2s}
.hv3-side-btn:hover{background:var(--av-dark-2);transform:translateY(-1px)}
.hv3-side-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}

/* ── narrower laptops/tablets: promo card drops underneath, carousel goes full width ── */
@media (max-width:1200px){
  .hv3{grid-template-columns:1fr;gap:16px}
  .hv3-side{min-height:290px;gap:20px}
}

/* ── tablet / phone: image strip on top, copy and bullets underneath ── */
@media (max-width:760px){
  .hv3-main{aspect-ratio:auto;min-height:0;container-type:normal}
  .hv3-stage{position:relative;inset:auto;height:260px;
    --al:16px;--at:16px;--aw:58%;--ah:calc(100% - 32px);
    --nl:calc(70% - 16px);--nt:34%;--nw:30%;--nh:60%}
  .hv3-img{border-radius:4px}
  .hv3-left{position:static;width:auto;height:auto;padding:20px 20px 0}
  .hv3-title{font-size:1.1rem}
  .hv3-sub{font-size:.95rem}
  .hv3-cta{font-size:.74rem}
  .hv3-bullets{position:static;transform:none;padding:12px 16px 18px}
}
@media (max-width:600px){
  .hv3{padding:12px 12px 4px;gap:12px}
  .hv3-main{border-radius:14px}
  .hv3-stage{height:220px;
    --al:12px;--at:12px;--aw:60%;--ah:calc(100% - 24px);
    --nl:calc(70% - 12px);--nt:36%;--nw:30%;--nh:58%}
  .hv3-cta{min-height:44px}
  .hv3-side{padding:22px;min-height:260px;border-radius:14px}
  .hv3-side-logo{height:28px}
  .hv3-side-flag{height:36px}
  .hv3-side-title{font-size:1.5rem}
  .hv3-side-btn{width:100%;align-self:stretch;min-height:44px;text-align:center}
}

@media (max-width:360px){
  .hv3-side-offer{font-size:.8rem}
}

/* reduced motion: no sliding, no auto-advance (the ring stays full) */
@media (prefers-reduced-motion:reduce){
  .hv3-cap,.hv3-cap.on,.hv3-img{transition:none}
  .hv3-bullet.on .ring{animation:none;stroke-dashoffset:0}
  .hv3-cta-ring,.hv3-cta-ring svg,.hv3-side-btn{transition:none}
}
`;

const SWIPE_THRESHOLD = 40; // px

export function HeroV2({ vouchers = [], onSearch, onCatSelect }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef({ x: 0, y: 0, moved: false });

  const go = useCallback(
    (dir) => setI((c) => (c + dir + SLIDES.length) % SLIDES.length),
    [],
  );

  // Navigate to a category if the parent supplies a handler,
  // otherwise fall back to the search handler.
  const open = (cat) => {
    if (onCatSelect) onCatSelect(cat);
    else if (onSearch) onSearch(cat);
  };

  // ── Touch swipe support ──
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, moved: false };
    setPaused(true);
  };

  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      touch.current.moved = true;
      go(dx < 0 ? 1 : -1);
    }
    setPaused(false);
  };

  // Ignore the click that follows a swipe
  const wasSwipe = () => {
    if (touch.current.moved) {
      touch.current.moved = false;
      return true;
    }
    return false;
  };

  const n = SLIDES.length;
  const next = (i + 1) % n;
  const stateOf = (idx) => {
    const rel = (idx - i + n) % n;
    if (rel === 0) return "act";
    if (rel === 1) return "nxt";
    if (rel === n - 1) return "prv";
    return "hid";
  };

  return (
    <>
      <style>{HERO_CSS}</style>
      <section className="hv3">
        {/* ── Left: off-grid carousel ── */}
        <div
          className="hv3-main"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured offers"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="hv3-stage">
            {SLIDES.map((s, idx) => {
              const st = stateOf(idx);
              return (
                <div
                  key={s.title}
                  className={`hv3-img s-${st}`}
                  role={st === "nxt" ? "button" : undefined}
                  tabIndex={st === "nxt" ? 0 : undefined}
                  aria-hidden={st === "act" || st === "nxt" ? undefined : true}
                  aria-label={
                    st === "nxt" ? `Next slide: ${s.title}` : undefined
                  }
                  onClick={() => {
                    if (wasSwipe()) return;
                    if (st === "act") open(s.cat);
                    else if (st === "nxt") go(1);
                  }}
                  onKeyDown={(e) => {
                    if (st === "nxt" && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      go(1);
                    }
                  }}
                >
                  <img
                    src={s.img}
                    alt={st === "act" ? s.title : ""}
                    loading="lazy"
                    draggable="false"
                  />
                </div>
              );
            })}
          </div>

          <div className="hv3-left">
            <div className="hv3-caps">
              {SLIDES.map((s, idx) => (
                <div
                  key={s.title}
                  className={`hv3-cap${idx === i ? " on" : ""}`}
                  aria-hidden={idx !== i}
                >
                  <h2 className="hv3-title">{s.title}</h2>
                  <p className="hv3-sub">{s.sub}</p>
                  <button className="hv3-cta" onClick={() => open(s.cat)}>
                    <span className="hv3-cta-ring" aria-hidden="true">
                      <svg
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="square"
                      >
                        <path d="M1 7h12M8 2l5 5-5 5" />
                      </svg>
                    </span>
                    {s.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`hv3-bullets${paused ? " paused" : ""}`}
            role="group"
            aria-label="Carousel navigation"
          >
            {SLIDES.map((_, d) => (
              <button
                key={d}
                className={`hv3-bullet${d === i ? " on" : ""}`}
                onClick={() => setI(d)}
                aria-label={`Slide ${d + 1} of ${SLIDES.length}`}
                aria-current={d === i}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle className="dot" cx="8" cy="8" r="3.2" />
                  <circle
                    className="ring"
                    cx="8"
                    cy="8"
                    r="7.25"
                    onAnimationEnd={() => go(1)}
                  />
                </svg>
              </button>
            ))}
          </div>

          <div className="hv3-sr" aria-live="polite" aria-atomic="true">
            Showing slide {i + 1} of {SLIDES.length}
          </div>
        </div>

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
