import React, { useState, useRef, useEffect } from "react";

// ─── AvoSearchBar ──────────────────────────────────────────────────────────────
// Drop-in replacement for the sticky cats-section + voucher grid header.
// Props:
//   currentCat   – string, active category
//   allCats      – string[], full list incl. "All"
//   catIcons     – { [cat]: string } emoji map
//   onCatSelect  – (cat) => void
//   vouchers     – full unfiltered voucher array
//   onResults    – (filtered: voucher[]) => void  — fires whenever results change
//   sortVal      – string
//   onSortChange – (val) => void

const PRICE_MAX = 2000; // ZAR ceiling for slider

export function AvoSearchBar({
  currentCat,
  allCats,
  catIcons,
  onCatSelect,
  vouchers = [],
  onResults,
  sortVal,
  onSortChange,
}) {
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, PRICE_MAX]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const inputRef = useRef(null);

  // Re-filter whenever any dependency changes
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const [minP, maxP] = priceRange;

    let results = vouchers.filter((v) => {
      const matchCat = currentCat === "All" || v.cat === currentCat;
      const matchQ =
        !q ||
        [v.name, v.desc, v.cat, v.city, v.partner].some((f) =>
          (f || "").toLowerCase().includes(q),
        );
      const matchPrice = v.price >= minP && v.price <= maxP;
      return matchCat && matchQ && matchPrice;
    });

    if (sortVal === "price-asc")
      results = results.sort((a, b) => a.price - b.price);
    if (sortVal === "price-desc")
      results = results.sort((a, b) => b.price - a.price);
    if (sortVal === "rating")
      results = results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    onResults?.(results);
  }, [query, currentCat, priceRange, sortVal, vouchers]);

  const ZAR_TO_USD = 16.53;
  const fmtUSD = (n) => `US$${(n / ZAR_TO_USD).toFixed(0)}`;

  const hasActiveFilters =
    query.trim() ||
    currentCat !== "All" ||
    priceRange[0] > 0 ||
    priceRange[1] < PRICE_MAX;

  const clearAll = () => {
    setQuery("");
    setPriceRange([0, PRICE_MAX]);
    onCatSelect("All");
    setFiltersOpen(false);
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 64,
        zIndex: 90,
        background: "var(--cream)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* ── Search row ── */}
      <div
        style={{
          maxWidth: "var(--max)",
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {/* Search input */}
        <div style={{ flex: 1, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1rem",
              pointerEvents: "none",
              color: "var(--muted)",
            }}
          >
            ⌕
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiences, places, or partners…"
            style={{
              width: "100%",
              padding: "10px 36px 10px 36px",
              border: "1.5px solid var(--border)",
              borderRadius: 10,
              fontFamily: "var(--sans)",
              fontSize: ".85rem",
              color: "var(--forest)",
              background: "var(--white)",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color .15s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--green-primary)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                color: "var(--muted)",
                lineHeight: 1,
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 14px",
            border: `1.5px solid ${filtersOpen || hasActiveFilters ? "var(--green-primary)" : "var(--border)"}`,
            borderRadius: 10,
            background:
              filtersOpen || hasActiveFilters
                ? "rgba(0,100,50,.07)"
                : "var(--white)",
            fontFamily: "var(--sans)",
            fontSize: ".8rem",
            fontWeight: 600,
            color:
              filtersOpen || hasActiveFilters
                ? "var(--green-primary)"
                : "var(--sub)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ⚙ Filters
          {hasActiveFilters && (
            <span
              style={{
                background: "var(--green-primary)",
                color: "#fff",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: ".65rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {
                [
                  query.trim(),
                  currentCat !== "All",
                  priceRange[0] > 0 || priceRange[1] < PRICE_MAX,
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={sortVal}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: "9px 10px",
            border: "1.5px solid var(--border)",
            borderRadius: 10,
            fontFamily: "var(--sans)",
            fontSize: ".78rem",
            color: "var(--sub)",
            background: "var(--white)",
            outline: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <option value="default">Featured</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {/* ── Expanded filters panel ── */}
      {filtersOpen && (
        <div
          style={{
            maxWidth: "var(--max)",
            margin: "0 auto",
            padding: "0 16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Price range */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: ".75rem",
                fontWeight: 700,
                color: "var(--terra)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              <span>Price range</span>
              <span
                style={{
                  color: "var(--forest)",
                  fontWeight: 600,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                {fmtUSD(priceRange[0])} –{" "}
                {priceRange[1] >= PRICE_MAX ? "Any" : fmtUSD(priceRange[1])}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {["Min", "Max"].map((label, idx) => (
                <div
                  key={label}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <label style={{ fontSize: ".7rem", color: "var(--muted)" }}>
                    {label} (ZAR)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={PRICE_MAX}
                    step={50}
                    value={priceRange[idx]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceRange((prev) => {
                        const next = [...prev];
                        next[idx] = val;
                        if (idx === 0 && val > prev[1]) next[1] = val;
                        if (idx === 1 && val < prev[0]) next[0] = val;
                        return next;
                      });
                    }}
                    style={{
                      width: "100%",
                      accentColor: "var(--green-primary)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick price buckets */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Under US$20", range: [0, 330] },
              { label: "US$20–50", range: [330, 826] },
              { label: "US$50–100", range: [826, 1653] },
              { label: "US$100+", range: [1653, PRICE_MAX] },
            ].map(({ label, range }) => {
              const active =
                priceRange[0] === range[0] && priceRange[1] === range[1];
              return (
                <button
                  key={label}
                  onClick={() => setPriceRange(active ? [0, PRICE_MAX] : range)}
                  style={{
                    padding: "5px 12px",
                    border: `1.5px solid ${active ? "var(--green-primary)" : "var(--border)"}`,
                    borderRadius: 20,
                    background: active ? "rgba(0,100,50,.08)" : "var(--white)",
                    color: active ? "var(--green-primary)" : "var(--sub)",
                    fontSize: ".75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--sans)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--terra)",
                fontSize: ".78rem",
                fontWeight: 700,
                fontFamily: "var(--sans)",
                padding: 0,
              }}
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Category pill row ── */}
      <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 16px 10px",
            width: "max-content",
          }}
        >
          {allCats.map((cat) => (
            <button
              key={cat}
              onClick={() => onCatSelect(cat)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 14px",
                border: `1.5px solid ${currentCat === cat ? "var(--green-primary)" : "var(--border)"}`,
                borderRadius: 20,
                background:
                  currentCat === cat ? "var(--green-primary)" : "var(--white)",
                color: currentCat === cat ? "#fff" : "var(--sub)",
                fontSize: ".78rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--sans)",
                whiteSpace: "nowrap",
                transition: "all .15s",
              }}
            >
              <span>{catIcons[cat] || "🎁"}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {hasActiveFilters && (
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "0 16px 10px",
            flexWrap: "wrap",
            maxWidth: "var(--max)",
            margin: "0 auto",
          }}
        >
          {query.trim() && (
            <ActiveChip
              label={`"${query.trim()}"`}
              onRemove={() => setQuery("")}
            />
          )}
          {currentCat !== "All" && (
            <ActiveChip
              label={currentCat}
              onRemove={() => onCatSelect("All")}
            />
          )}
          {(priceRange[0] > 0 || priceRange[1] < PRICE_MAX) && (
            <ActiveChip
              label={`${fmtUSD(priceRange[0])} – ${priceRange[1] >= PRICE_MAX ? "Any" : fmtUSD(priceRange[1])}`}
              onRemove={() => setPriceRange([0, PRICE_MAX])}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        background: "rgba(0,100,50,.09)",
        border: "1px solid rgba(0,100,50,.2)",
        borderRadius: 20,
        fontSize: ".72rem",
        fontWeight: 600,
        color: "var(--forest)",
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
          fontSize: ".7rem",
          color: "var(--forest)",
        }}
        aria-label={`Remove ${label} filter`}
      >
        ✕
      </button>
    </span>
  );
}

// ─── AvoEmptyState ─────────────────────────────────────────────────────────────
// Show this when filtered results are empty.
export function AvoEmptyState({ query, currentCat, onClear }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ fontSize: "2.8rem" }}>◎</div>
      <div
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "var(--forest)",
          fontFamily: "var(--serif)",
        }}
      >
        No experiences found
      </div>
      <div
        style={{
          fontSize: ".85rem",
          color: "var(--muted)",
          maxWidth: 300,
          lineHeight: 1.6,
        }}
      >
        {query
          ? `Nothing matched "${query}"${currentCat !== "All" ? ` in ${currentCat}` : ""}.`
          : `No vouchers available in ${currentCat} right now.`}{" "}
        Try a different search or browse all categories.
      </div>
      <button
        onClick={onClear}
        style={{
          marginTop: 8,
          padding: "10px 22px",
          background: "var(--green-primary)",
          color: "#fff",
          border: "none",
          borderRadius: 9,
          fontFamily: "var(--sans)",
          fontWeight: 700,
          fontSize: ".85rem",
          cursor: "pointer",
        }}
      >
        Show all experiences
      </button>
    </div>
  );
}
