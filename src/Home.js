import React from "react";

// ─────────────────────────────────────────────────────────────
// Home.js — Store landing page extracted from index.html
// Props:
//   ALL_VOUCHERS   : array of voucher objects from Firebase
//   currentCat     : string, active category filter
//   filterCat      : function(cat, btnEl)
//   openProduct    : function(id)
//   handleSearch   : function(query)
//   sortCards      : function(value)
// ─────────────────────────────────────────────────────────────

export default function Home({
  ALL_VOUCHERS = [],
  currentCat = "All",
  filterCat,
  openProduct,
  handleSearch,
  sortCards,
}) {
  // ── Category pills ──────────────────────────────────────────
  const CAT_PILLS = [
    { cat: "All", icon: "🌟", label: "All Experiences" },
    { cat: "Wellness", icon: "🧖", label: "Wellness" },
    { cat: "Beauty", icon: "💅", label: "Beauty" },
    { cat: "Adventure", icon: "🪂", label: "Adventure" },
    { cat: "Dining & Wine", icon: "🍷", label: "Dining & Wine" },
    { cat: "Stays", icon: "🏡", label: "Stays" },
    { cat: "Skills", icon: "📚", label: "Skills" },
  ];

  const countFor = (cat) =>
    cat === "All"
      ? ALL_VOUCHERS.length
      : ALL_VOUCHERS.filter((v) => v.cat === cat).length;

  // ── Filtered + sorted grid ───────────────────────────────────
  const filtered =
    currentCat === "All"
      ? ALL_VOUCHERS
      : ALL_VOUCHERS.filter((v) => v.cat === currentCat);

  // ── Card renderer ────────────────────────────────────────────
  function renderCard(p) {
    const badges = (p.tags || []).map((t) => {
      const cls = ["bestseller", "popular", "premium", "adrenaline"].includes(t)
        ? "cbadge-pop"
        : "cbadge-sale";
      const lbl = t === "uniquely SA" ? "🇿🇦 SA" : t;
      return (
        <span key={t} className={`cbadge ${cls}`}>
          {lbl}
        </span>
      );
    });

    const imgSrc = p.imageUrl || p.img;
    const descText = (p.desc || "").substring(0, 90);
    const includes = (p.includes || []).slice(0, 3);
    const extraCount = (p.includes || []).length - 3;

    return (
      <div key={p.id} className="card" onClick={() => openProduct(p.id)}>
        <div className="card-img">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={p.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div className="card-img-placeholder">{p.icon || "🎁"}</div>
          )}
          <div className="card-badge-row">
            {badges}
            {p.source === "firebase" && (
              <span className="cbadge cbadge-sale">Partner</span>
            )}
          </div>
          <button className="card-wish" onClick={(e) => e.stopPropagation()}>
            ♡
          </button>
        </div>
        <div className="card-body">
          <div className="card-cat">{p.cat}</div>
          <div className="card-name">{p.name}</div>
          <div className="card-partner">
            📍 {p.partner} · {p.city}
          </div>
          <div className="card-desc">
            {descText}
            {descText.length >= 90 ? "…" : ""}
          </div>
          <div className="card-includes">
            {includes.map((i) => (
              <span key={i} className="inc">
                ✓ {i}
              </span>
            ))}
            {extraCount > 0 && <span className="inc">+{extraCount} more</span>}
          </div>
          <div className="card-footer">
            <div className="card-price">
              <span className="card-price-from">from</span>
              <div className="card-price-val">
                <small>R</small>
                {Number(p.price).toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: ".68rem",
                  color: "var(--sub)",
                  marginTop: 2,
                }}
              >
                Valid {p.expiry || "12 months"}
              </div>
            </div>
            {p.rating > 0 ? (
              <div className="card-rating">
                <span className="star">★</span> {p.rating}
                <span className="card-rating-count">({p.reviews})</span>
              </div>
            ) : (
              <div
                className="card-rating"
                style={{ color: "var(--leaf)", fontSize: ".72rem" }}
              >
                ✦ New
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Featured cards (first 3 Firebase vouchers) ───────────────
  const featured = ALL_VOUCHERS.slice(0, 3);
  const [main, second, third] = featured;

  function FeatCard({ v, size }) {
    if (!v) return null;
    const img = v.imageUrl || v.img || "";
    const tag = (v.tags || [])[0] || v.cat;
    return (
      <div
        className={`feat-card ${size}`}
        onClick={() => openProduct(v.id)}
        style={{ cursor: "pointer" }}
      >
        <div className="feat-card-img">
          {img ? (
            <img
              src={img}
              alt={v.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "var(--cream2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
              }}
            >
              {v.icon || "🎁"}
            </div>
          )}
          <div className="feat-badge">{tag}</div>
          <button
            className="feat-wishlist"
            onClick={(e) => e.stopPropagation()}
          >
            ♡
          </button>
        </div>
        <div className="feat-card-overlay">
          <div className="feat-partner">
            {v.partner} · {v.city}
          </div>
          <div className="feat-name">{v.name}</div>
          <div className="feat-meta">
            <div className="feat-price">
              <small>R</small>
              {Number(v.price).toLocaleString()}
            </div>
            <div className="feat-loc">📍 {v.city || "SA"}</div>
            {v.rating > 0 ? (
              <div className="feat-rating">
                <span className="star">★</span> {v.rating}
              </div>
            ) : (
              <div
                className="feat-rating"
                style={{ color: "var(--gold2)", fontSize: ".72rem" }}
              >
                ✦ New
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const gridTitle = currentCat === "All" ? "All Experiences" : currentCat;
  const gridSub =
    filtered.length === 0
      ? "No experiences listed yet — partners are setting up their vouchers"
      : `Showing ${filtered.length} experience${filtered.length !== 1 ? "s" : ""} ${currentCat !== "All" ? "in " + currentCat : "from our SA partners"}`;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-flag">🇿🇦</span>
            South Africa's #1 Gift Experience Marketplace
          </div>
          <h1>
            Give the gift of <em>unforgettable</em> experiences.
          </h1>
          <p>
            From Magaliesberg safaris to Cape Town wine estates — browse 200+
            curated South African experiences, delivered instantly via WhatsApp.
          </p>

          <div className="hero-search">
            <div className="hero-search-field" style={{ flex: "1.2" }}>
              <span className="hsf-icon">🔍</span>
              <div>
                <span className="hsf-label">What experience?</span>
                <div className="hsf-val">Spa, safari, wine tasting…</div>
              </div>
            </div>
            <div className="hero-search-field" style={{ flex: "0.8" }}>
              <span className="hsf-icon">📍</span>
              <div>
                <span className="hsf-label">Where?</span>
                <div className="hsf-val">Anywhere in SA</div>
              </div>
            </div>
            <div className="hero-search-field" style={{ flex: "0.7" }}>
              <span className="hsf-icon">💰</span>
              <div>
                <span className="hsf-label">Budget</span>
                <div className="hsf-val">Any price</div>
              </div>
            </div>
            <button className="hero-search-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              4.9/5 from 2,800+ reviews
            </div>
            <div className="hero-trust-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure PayFast payments
            </div>
            <div className="hero-trust-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
              </svg>
              Instant WhatsApp delivery
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY PILLS ──────────────────────────────────── */}
      <div className="cats-section">
        <div className="cats-scroll">
          {CAT_PILLS.map(({ cat, icon, label }) => (
            <button
              key={cat}
              className={`cat-pill ${currentCat === cat ? "active" : ""}`}
              data-cat={cat}
              onClick={(e) => filterCat(cat, e.currentTarget)}
            >
              <span className="cat-pill-icon">{icon}</span>
              {label}
              <span className="cat-pill-count">{countFor(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── FEATURED EXPERIENCES ────────────────────────────── */}
      {ALL_VOUCHERS.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div className="section-head-left">
              <p className="section-eyebrow">✦ Curated Picks</p>
              <h2 className="section-title">Featured Experiences</h2>
              <p className="section-sub">
                Hand-selected from our partner listings
              </p>
            </div>
            <button
              className="see-all"
              onClick={() =>
                document
                  .getElementById("cardsGrid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View all →
            </button>
          </div>

          <div className="featured-grid">
            {main ? (
              <FeatCard v={main} size="large" />
            ) : (
              /* Fallback static card */
              <div className="feat-card large" style={{ cursor: "pointer" }}>
                <div className="feat-card-img">
                  <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"
                    alt="Couples Spa Day"
                  />
                  <div className="feat-badge">Most Popular</div>
                  <button
                    className="feat-wishlist"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ♡
                  </button>
                </div>
                <div className="feat-card-overlay">
                  <div className="feat-partner">Relax Zone Spa · Pretoria</div>
                  <div className="feat-name">
                    Couples Spa Day with Lunch & Wine
                  </div>
                  <div className="feat-meta">
                    <div className="feat-price">
                      <small>R</small>1,800
                    </div>
                    <div className="feat-loc">📍 Pretoria</div>
                    <div className="feat-rating">
                      <span className="star">★</span> 4.9
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {second ? (
                <FeatCard v={second} size="small" />
              ) : (
                <div className="feat-card small" style={{ cursor: "pointer" }}>
                  <div className="feat-card-img">
                    <img
                      src="https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&q=80"
                      alt="Hot Air Balloon"
                    />
                    <div className="feat-badge new">New</div>
                    <button
                      className="feat-wishlist"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ♡
                    </button>
                  </div>
                  <div className="feat-card-overlay">
                    <div className="feat-partner">
                      Skysail Balloons · Magaliesberg
                    </div>
                    <div className="feat-name">Sunrise Balloon & Champagne</div>
                    <div className="feat-meta">
                      <div className="feat-price">
                        <small>R</small>2,400
                      </div>
                      <div className="feat-rating">
                        <span className="star">★</span> 4.8
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {third ? (
                <FeatCard v={third} size="small" />
              ) : (
                <div className="feat-card small" style={{ cursor: "pointer" }}>
                  <div className="feat-card-img">
                    <img
                      src="https://images.unsplash.com/photo-1510776010768-a8e1b69f8003?w=600&q=80"
                      alt="Wine Tasting"
                    />
                    <div className="feat-badge sale">20% off</div>
                    <button
                      className="feat-wishlist"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ♡
                    </button>
                  </div>
                  <div className="feat-card-overlay">
                    <div className="feat-partner">
                      Vino Estate · Franschhoek
                    </div>
                    <div className="feat-name">Wine Tasting & Cheese Board</div>
                    <div className="feat-meta">
                      <div className="feat-price">
                        <small>R</small>620
                      </div>
                      <div className="feat-rating">
                        <span className="star">★</span> 4.7
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST BAR ───────────────────────────────────────── */}
      <div className="trust-bar">
        <div className="trust-bar-inner">
          {[
            {
              icon: "🔒",
              title: "Secure Payments",
              sub: "PayFast encrypted checkout",
            },
            {
              icon: "📱",
              title: "Instant WhatsApp",
              sub: "Voucher delivered in seconds",
            },
            {
              icon: "✅",
              title: "Verified Partners",
              sub: "All businesses vetted by us",
            },
            {
              icon: "🔄",
              title: "Flexible Bookings",
              sub: "Reschedule anytime",
            },
            {
              icon: "🎁",
              title: "Custom Messages",
              sub: "Personalise every gift",
            },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="trust-item">
              <div className="trust-icon">{icon}</div>
              <div className="trust-text">
                <h4>{title}</h4>
                <p>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ALL VOUCHERS GRID ────────────────────────────────── */}
      <section className="section container">
        <div className="section-head">
          <div className="section-head-left">
            <p className="section-eyebrow">✦ Browse</p>
            <h2 className="section-title">{gridTitle}</h2>
            <p className="section-sub">{gridSub}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select
              style={{
                padding: "8px 14px",
                border: "1.5px solid var(--border2)",
                borderRadius: 8,
                fontFamily: "var(--sans)",
                fontSize: ".8rem",
                color: "var(--sub)",
                background: "var(--white)",
                outline: "none",
                cursor: "pointer",
              }}
              onChange={(e) => sortCards && sortCards(e.target.value)}
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="cards-grid" id="cardsGrid">
          {filtered.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "80px 20px",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎁</div>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.4rem",
                  color: "var(--forest)",
                  marginBottom: 8,
                }}
              >
                No experiences yet
              </h3>
              <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>
                Partners are setting up their vouchers. Check back soon!
              </p>
            </div>
          ) : (
            filtered.map(renderCard)
          )}
        </div>
      </section>

      {/* ── OCCASIONS ───────────────────────────────────────── */}
      <section className="occasions">
        <div className="container">
          <div className="section-head">
            <div className="section-head-left">
              <p className="section-eyebrow">✦ Gift by Occasion</p>
              <h2 className="section-title">What are you celebrating?</h2>
              <p className="section-sub">
                Find the perfect voucher for every moment
              </p>
            </div>
          </div>
          <div className="occ-grid">
            {[
              { icon: "💐", name: "Mother's Day" },
              { icon: "🎂", name: "Birthday" },
              { icon: "💍", name: "Anniversary" },
              { icon: "💼", name: "Corporate" },
              { icon: "🎓", name: "Graduation" },
              { icon: "💑", name: "Valentine's" },
            ].map(({ icon, name }) => (
              <div key={name} className="occ">
                <span className="occ-icon">{icon}</span>
                <div className="occ-name">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY SHOWCASE ───────────────────────────────── */}
      <section className="section container">
        <div className="section-head">
          <div className="section-head-left">
            <p className="section-eyebrow">✦ Browse by Category</p>
            <h2 className="section-title">Explore experiences</h2>
          </div>
        </div>
        <div className="cat-showcase">
          {[
            {
              cat: "Adventure",
              icon: "🪂",
              img: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80",
              desc: "4 experiences from R850",
            },
            {
              cat: "Wellness",
              icon: "🧖",
              img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
              desc: "3 experiences from R550",
            },
            {
              cat: "Dining & Wine",
              icon: "🍷",
              img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
              desc: "4 experiences from R560",
            },
          ].map(({ cat, icon, img, desc }) => (
            <div
              key={cat}
              className="cat-block"
              onClick={() => filterCat(cat, null)}
            >
              <div className="cat-block-img">
                <img src={img} alt={cat} />
              </div>
              <div className="cat-block-overlay">
                <span className="cat-block-icon">{icon}</span>
                <h3>{cat}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="section container">
        <div className="section-head">
          <div className="section-head-left">
            <p className="section-eyebrow">✦ Reviews</p>
            <h2 className="section-title">What people are saying</h2>
          </div>
        </div>
        <div className="testi-grid">
          {[
            {
              stars: 5,
              text: "Bought this for my wife's birthday. She got the code on WhatsApp within seconds and absolutely loved the spa day. Will definitely use AfriVoucher again.",
              init: "TN",
              name: "Thabo N.",
              loc: "Johannesburg",
              product: "Couples Spa Day",
            },
            {
              stars: 5,
              text: "The hot air balloon sunrise was absolutely magical. The whole booking process from WhatsApp to showing up took less than a minute. Incredible.",
              init: "SB",
              name: "Sarah B.",
              loc: "Pretoria",
              product: "Sunrise Balloon",
            },
            {
              stars: 5,
              text: "Our team used AfriVoucher for year-end gifts. 50 vouchers sent in under 10 minutes. Partners are excellent and every employee loved their experience.",
              init: "MK",
              name: "Michelle K.",
              loc: "Cape Town",
              product: "Corporate Gifting",
            },
          ].map(({ stars, text, init, name, loc, product }) => (
            <div key={name} className="testi">
              <div className="testi-stars">{"⭐".repeat(stars)}</div>
              <div className="testi-text">"{text}"</div>
              <div className="testi-author">
                <div className="testi-avatar">{init}</div>
                <div>
                  <div className="testi-name">{name}</div>
                  <div className="testi-loc">{loc}</div>
                </div>
                <div className="testi-product">{product}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARTNER LOGOS ───────────────────────────────────── */}
      <div className="partners-section">
        <p className="partners-label">Trusted South African Partners</p>
        <div className="partners-row">
          {[
            ["Relax", "Zone"],
            ["Skysail", "Balloons"],
            ["Vino", "Estate"],
            ["Bushveld", "Escapes"],
            ["Chef's", "Table"],
            ["Getaway", "Lodges"],
            ["Glow", "Studio"],
          ].map(([a, b]) => (
            <div key={a + b} className="partner-logo">
              {a}
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="hiw">
        <div className="container">
          <div className="section-head">
            <div className="section-head-left">
              <p className="section-eyebrow">✦ Simple Process</p>
              <h2 className="section-title">How AfriVoucher works</h2>
              <p className="section-sub">
                From purchase to experience in four easy steps
              </p>
            </div>
          </div>
          <div className="hiw-steps">
            {[
              {
                n: "01",
                icon: "🛍️",
                title: "Browse & Choose",
                desc: "Find the perfect experience from our 200+ curated South African partners.",
                arrow: true,
              },
              {
                n: "02",
                icon: "💳",
                title: "Pay Securely",
                desc: "Checkout with PayFast — card, EFT, or SnapScan. Safe and encrypted.",
                arrow: true,
              },
              {
                n: "03",
                icon: "📱",
                title: "WhatsApp Delivery",
                desc: "The recipient gets their voucher code and QR instantly on WhatsApp.",
                arrow: true,
              },
              {
                n: "04",
                icon: "🎉",
                title: "Enjoy the Experience",
                desc: "Book directly with the partner. Show the QR at arrival and enjoy.",
                arrow: false,
              },
            ].map(({ n, icon, title, desc, arrow }) => (
              <div key={n} className="hiw-step">
                <div className="hiw-step-num">{n}</div>
                <div className="hiw-step-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
                {arrow && <div className="hiw-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ──────────────────────────────────────── */}
      <div className="newsletter">
        <div className="container">
          <h2>Get the best SA experiences first.</h2>
          <p>
            New partners, seasonal specials and gifting ideas — straight to your
            inbox.
          </p>
          <div className="nl-form">
            <input
              type="email"
              id="nlEmail"
              placeholder="your@email.com"
              onKeyDown={(e) => {
                if (e.key === "Enter" && window.handleSubscribe)
                  window.handleSubscribe();
              }}
            />
            <button
              className="nl-btn"
              onClick={() => window.handleSubscribe && window.handleSubscribe()}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
