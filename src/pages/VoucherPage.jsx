// Save next to StorePage.jsx (e.g. src/pages/VoucherPage.jsx)
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { VoucherSEO } from "../components/Seo";
import { CheckoutDrawer, fmt } from "./StorePage";
import { idFromSlug, voucherPath, categoryPath } from "./paths";

function VoucherSlider({ current, vouchers, onOpen }) {
  const stageRef = useRef(null);
  const drag = useRef({ x: 0, moved: false, down: false });
  const [vw, setVw] = useState(1000);
  const [active, setActive] = useState(0);

  // every OTHER voucher; same category first, then the rest
  const items = useMemo(() => {
    const others = vouchers.filter((x) => x.firestoreId !== current.firestoreId);
    const same = others.filter((x) => x.cat === current.cat);
    const rest = others.filter((x) => x.cat !== current.cat);
    return [...same, ...rest].slice(0, 12);
  }, [vouchers, current]);

  useEffect(() => setActive(0), [current.firestoreId]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setVw(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;

  const n = items.length;
  const SIDE = 0.74;                                           // size of left/right slides
  const slideW = vw < 700 ? vw * 0.6 : Math.min(vw * 0.3, 380); // centre slide width
  const gap = vw < 700 ? 14 : 26;
  const step = slideW * (0.5 + SIDE / 2) + gap;                 // centre -> side distance
  const imgH = slideW * 1.25;                                   // 4:5 image
  const stageH = imgH + 176;                                    // image + text under centre

  const go = (i) => setActive(((i % n) + n) % n);               // loops forever

  // shortest signed distance from the active slide (wraps around the ends)
  const offsetOf = (i) => {
    let d = (i - active) % n;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const onPointerDown = (e) => { drag.current = { x: e.clientX, moved: false, down: true }; };
  const onPointerUp = (e) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.x;
    drag.current.down = false;
    if (Math.abs(dx) > 8) drag.current.moved = true;
    if (dx < -50) go(active + 1);
    else if (dx > 50) go(active - 1);
  };

  return (
    <section className="vs-wrap" aria-label="More vouchers">
      <div className="vs-head">
        <h2 className="vs-title">You may also like</h2>
        <p className="vs-sub">Discover more experiences</p>
      </div>

      <div
        className="vs-stage"
        ref={stageRef}
        style={{ height: stageH }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => (drag.current.down = false)}
      >
        {items.map((x, i) => {
          const d = offsetOf(i);
          const state = d === 0 ? "on" : Math.abs(d) === 1 ? "side" : "off";
          const c = Math.max(-2, Math.min(2, d));               // park far slides just off-stage
          const scale = state === "on" ? 1 : state === "side" ? SIDE : 0.6;
          const ty = state === "on" ? 0 : ((1 - scale) * imgH) / 2; // keep side images vertically centred
          const img = x.imageUrl || x.img;

          const activate = () => {
            if (drag.current.moved) { drag.current.moved = false; return; }
            if (state === "off") return;
            state === "on" ? onOpen(x) : go(i);
          };

          return (
            <div
              key={x.firestoreId || x.id || i}
              className={`vs-slide ${state}`}
              style={{
                width: slideW,
                marginLeft: -slideW / 2,
                transform: `translate3d(${c * step}px, ${ty}px, 0) scale(${scale})`,
                zIndex: state === "on" ? 3 : state === "side" ? 2 : 1,
              }}
              role="button"
              tabIndex={-1}
              aria-hidden={state === "off"}
              aria-label={state === "on" ? `Open ${x.name}` : `Show ${x.name}`}
              onClick={activate}
            >
              <div className="vs-img">
                {img ? (
                  <img src={img} alt={state === "on" ? x.name : ""} loading="lazy" draggable={false} />
                ) : (
                  <span className="vs-fallback">🎁</span>
                )}
                <span className="vs-num">{String(i + 1).padStart(2, "0")}</span>
              </div>

              <div className="vs-text" aria-hidden={state !== "on"}>
                <div className="vs-cat">{x.cat}</div>
                <h3 className="vs-name">{x.name}</h3>
                <div className="vs-row">
                  <span className="vs-price">{fmt(x.price)}</span>
                  <span className="vs-cta">View voucher</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="vs-controls">
        <span className="vs-count">
          {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <div className="vs-progress" aria-hidden="true">
          <div
            className="vs-progress-thumb"
            style={{ width: `${100 / n}%`, left: `${(active / n) * 100}%` }}
          />
        </div>
        <div className="vs-arrows">
          <button className="vs-arrow" onClick={() => go(active - 1)} aria-label="Previous voucher">‹</button>
          <button className="vs-arrow" onClick={() => go(active + 1)} aria-label="Next voucher">›</button>
        </div>
      </div>
    </section>
  );
}
/* ═══════════════════════════ Page ═══════════════════════════ */
export default function VoucherPage({ vouchers = [], loading, onPartnerOpen }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const v = vouchers.find((x) => x.firestoreId === idFromSlug(slug));

  // If the name/city changed, send old links to the current canonical URL
  useEffect(() => {
    if (v && `/voucher/${slug}` !== voucherPath(v)) {
      navigate(voucherPath(v), { replace: true });
    }
  }, [v, slug, navigate]);

  // jump to the top when moving between vouchers
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (loading) {
    return (
      <div className="vp-page">
        <style>{VOUCHER_PAGE_CSS}</style>
        <main className="vp-main">
          <div
            className="vp-skel"
            style={{ height: 18, width: 240, marginBottom: 28 }}
          />
          <div className="vp-skel" style={{ height: 460 }} />
        </main>
      </div>
    );
  }

  if (!v) {
    return (
      <div className="vp-page">
        <style>{VOUCHER_PAGE_CSS}</style>
        <main className="vp-main vp-missing">
          <Helmet>
            <title>Voucher not found | AfriVoucher</title>
            <meta name="robots" content="noindex" />
          </Helmet>
          <h1 className="vp-title">This voucher is no longer available</h1>
          <p className="vp-desc">
            It may have expired or been removed by the provider.
          </p>
          <Link to="/" className="vp-link">
            Browse all experiences →
          </Link>
        </main>
      </div>
    );
  }

  const img = v.imageUrl || v.img;

  return (
    <div className="vp-page">
      <style>{VOUCHER_PAGE_CSS}</style>
      <main className="vp-main">
        <VoucherSEO voucher={v} />

        {/* Breadcrumbs (matches the BreadcrumbList structured data) */}
        <nav aria-label="Breadcrumb" className="vp-crumbs">
          <Link to="/">Home</Link>
          <i>›</i>
          <Link to={categoryPath(v.cat)}>{v.cat}</Link>
          <i>›</i>
          <span>{v.name}</span>
        </nav>

        <div className="vp-grid">
          <div className="vp-media">
            {img ? <img src={img} alt={v.name} /> : <span>🎁</span>}
          </div>

          <div className="vp-info">
            <div className="vp-cat">{v.cat}</div>
            <h1 className="vp-title">{v.name}</h1>

            <div className="vp-loc">
              <span className="vp-loclabel">Available at</span>
              <button
                className="vp-partner"
                onClick={() => onPartnerOpen?.(v.partnerId)}
              >
                {v.partner}
              </button>
              <span> · {v.city}</span>
            </div>

            {v.desc && <p className="vp-desc">{v.desc}</p>}

            {(v.includes || []).length > 0 && (
              <>
                <h2 className="vp-h2">What's included</h2>
                <ul className="vp-includes">
                  {v.includes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="vp-price-row">
              <span className="vp-price-label">Voucher price</span>
              <span className="vp-price">{fmt(v.price)}</span>
            </div>

            <button className="vp-buy" onClick={() => setCheckoutOpen(true)}>
              <span>Buy this voucher</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 12h17M14 6l6 6-6 6" />
              </svg>
            </button>

            <div className="vp-trust">
              <span>Valid {v.expiry || "12 months"}</span>
              <span>WhatsApp delivery</span>
              <span>Secure checkout</span>
            </div>
          </div>
        </div>

        <VoucherSlider
          current={v}
          vouchers={vouchers}
          onOpen={(x) => navigate(voucherPath(x))}
        />
      </main>

      {checkoutOpen && (
        <CheckoutDrawer
          voucher={v}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════ Styles ═══════════════════════════ */
const VOUCHER_PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap');

.vp-page{
  --y:#FFF200; --bg:#0b0b0b; --card:#161616;
  --line:rgba(255,255,255,.16); --dim:rgba(255,255,255,.62);
  --ease:cubic-bezier(.19,1,.22,1);
  --display:'Barlow Condensed','Arial Narrow',Impact,sans-serif;
  --body:'Barlow',system-ui,sans-serif;
  background:var(--bg); color:#fff; font-family:var(--body);
  min-height:100vh; width:100%;
}
.vp-page *{box-sizing:border-box}
.vp-main{max-width:1240px;margin:0 auto;padding:28px 24px 80px}
.vp-main a{color:inherit}

/* ───── breadcrumbs ───── */
.vp-crumbs{
  display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:32px;
  font-size:.68rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);
}
.vp-crumbs a{text-decoration:none;transition:color .3s}
.vp-crumbs a:hover{color:var(--y)}
.vp-crumbs i{font-style:normal;opacity:.5}
.vp-crumbs span{color:#fff}

/* ───── hero grid ───── */
.vp-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:56px;align-items:start}
.vp-media{
  position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--card);
  display:grid;place-items:center;font-size:4rem;
}
.vp-media::before{
  content:"";position:absolute;top:0;left:0;width:100%;height:4px;background:var(--y);z-index:2;
}
.vp-media img{width:100%;height:100%;object-fit:cover;display:block}

.vp-cat{
  display:flex;align-items:center;gap:12px;margin-bottom:14px;
  font-size:.7rem;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--dim);
}
.vp-cat::before{content:"";width:26px;height:2px;background:var(--y)}
.vp-title{
  margin:0 0 18px;font-family:var(--display);font-weight:700;
  font-size:clamp(2rem,4.2vw,3.4rem);line-height:.98;letter-spacing:.02em;
  text-transform:uppercase;text-wrap:balance;overflow-wrap:anywhere;
}
.vp-loc{font-size:.9rem;color:var(--dim);margin-bottom:22px}
.vp-loclabel{display:block;font-size:.64rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:4px;opacity:.7}
.vp-partner{
  background:none;border:0;padding:0;font:inherit;cursor:pointer;color:#fff;
  border-bottom:1px solid var(--line);transition:border-color .3s,color .3s;
}
.vp-partner:hover{color:var(--y);border-color:var(--y)}
.vp-desc{line-height:1.75;color:var(--dim);font-size:.96rem;margin:0}
.vp-h2{
  margin:30px 0 14px;font-family:var(--display);font-weight:600;font-size:1.15rem;
  letter-spacing:.16em;text-transform:uppercase;
}
.vp-includes{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.vp-includes li{position:relative;padding-left:26px;font-size:.92rem;line-height:1.5;color:rgba(255,255,255,.85)}
.vp-includes li::before{content:"";position:absolute;left:0;top:.72em;width:14px;height:2px;background:var(--y)}

.vp-price-row{
  display:flex;justify-content:space-between;align-items:baseline;gap:16px;
  margin-top:30px;padding-top:20px;border-top:1px solid var(--line);
}
.vp-price-label{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.vp-price{font-family:var(--display);font-weight:700;font-size:2.4rem;letter-spacing:.03em;line-height:1}

.vp-buy{
  display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;margin-top:18px;
  padding:18px 22px;background:var(--y);color:#000;border:1px solid var(--y);border-radius:0;cursor:pointer;
  font-family:var(--display);font-weight:700;font-size:1.15rem;letter-spacing:.16em;text-transform:uppercase;
  transition:background .5s var(--ease),color .5s var(--ease),border-color .5s var(--ease);
}
.vp-buy svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:transform .6s var(--ease)}
.vp-buy:hover{background:#fff;border-color:#fff}
.vp-buy:hover svg{transform:translateX(6px)}
.vp-buy:focus-visible{outline:2px solid #fff;outline-offset:3px}

.vp-trust{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:20px;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.vp-trust span{display:flex;align-items:center;gap:8px}
.vp-trust span::before{content:"";width:6px;height:6px;background:var(--y)}

.vp-missing{text-align:center;padding-top:96px}
.vp-missing .vp-title{max-width:18ch;margin:0 auto 14px}
.vp-missing .vp-desc{margin-bottom:26px}
.vp-link{color:var(--y);font-family:var(--display);font-weight:600;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}

.vp-skel{
  background:linear-gradient(90deg,#161616 25%,#222 50%,#161616 75%);
  background-size:700px 100%;animation:vp-shimmer 1.4s infinite linear;
}
@keyframes vp-shimmer{0%{background-position:-700px 0}100%{background-position:700px 0}}

/* ═════════ related-vouchers slider ═════════ */
.vs-wrap{margin-top:96px;padding-top:56px;border-top:1px solid var(--line)}
.vs-head{margin-bottom:36px}
.vs-title{
  margin:0 0 12px;display:flex;align-items:center;gap:16px;
  font-family:var(--display);font-weight:700;font-size:clamp(1.9rem,4vw,3rem);
  line-height:.95;letter-spacing:.02em;text-transform:uppercase;
}
.vs-title::before{content:"";width:6px;height:1em;background:var(--y);flex:none}
.vs-sub{margin:0;font-size:.72rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--dim)}

/* ───── stage: slides are absolutely placed around the true centre ───── */
.vs-stage{
  position:relative;overflow:hidden;outline:none;
  touch-action:pan-y;cursor:grab;user-select:none;
}
.vs-stage:active{cursor:grabbing}
.vs-stage:focus-visible{outline:1px solid var(--y);outline-offset:4px}

.vs-slide{
  position:absolute;top:0;left:50%;container-type:inline-size;
  transform-origin:center top;cursor:pointer;
  transition:transform .9s var(--ease),opacity .6s ease;
  will-change:transform,opacity;
}
.vs-slide.on{opacity:1}
.vs-slide.side{opacity:.45}
.vs-slide.side:hover{opacity:.75}
.vs-slide.off{opacity:0;pointer-events:none}

.vs-img{position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--card);display:grid;place-items:center}
.vs-img img{
  width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;
  filter:grayscale(.5);transition:filter .8s ease,transform 1.4s var(--ease);
}
.vs-slide.on .vs-img img{filter:none}
.vs-slide.on:hover .vs-img img{transform:scale(1.05)}
.vs-img::before{
  content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--y);z-index:2;
  transform:scaleX(0);transform-origin:left;transition:transform .9s var(--ease);
}
.vs-slide.on .vs-img::before{transform:scaleX(1)}
.vs-fallback{font-size:3rem;opacity:.6}
.vs-num{position:absolute;top:14px;left:16px;z-index:2;font-family:var(--display);font-weight:600;font-size:.95rem;letter-spacing:.14em}

/* text shows only under the centre slide */
.vs-text{
  padding-top:20px;opacity:0;transform:translateY(14px);
  transition:opacity .6s ease .15s,transform .8s var(--ease) .15s;
}
.vs-slide.on .vs-text{opacity:1;transform:none}
.vs-cat{font-size:.66rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--dim);margin-bottom:8px}
.vs-name{
  margin:0 0 14px;font-family:var(--display);font-weight:700;
  font-size:clamp(1.1rem,7cqw,1.7rem);line-height:1.04;letter-spacing:.03em;text-transform:uppercase;
  text-wrap:balance;overflow-wrap:anywhere;min-height:2.08em;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.vs-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:14px;border-top:1px solid var(--line)}
.vs-price{font-family:var(--display);font-weight:700;font-size:1.4rem;letter-spacing:.04em}
.vs-cta{
  padding:10px 18px;border:1px solid rgba(255,255,255,.7);
  font-family:var(--display);font-weight:600;font-size:.9rem;letter-spacing:.14em;text-transform:uppercase;
  transition:background .5s var(--ease),color .5s var(--ease),border-color .5s var(--ease);
}
.vs-slide.on:hover .vs-cta{background:var(--y);color:#000;border-color:var(--y)}


/* ───── responsive ───── */
@media (max-width:900px){
  .vp-main{padding:20px 16px 64px}
  .vp-grid{grid-template-columns:1fr;gap:32px}
  .vp-media{aspect-ratio:1/1}
  .vs-wrap{margin-top:64px;padding-top:40px}
  .vs-slide{transform:scale(.8)}
  .vs-arrows{display:none}
}
@media (prefers-reduced-motion:reduce){
  .vs-track,.vs-slide,.vs-text,.vs-img img,.vs-img::before,.vp-buy svg,.vp-skel{transition:none;animation:none}
}
`;
