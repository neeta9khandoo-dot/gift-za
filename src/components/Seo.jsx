import React from "react";
import { Helmet } from "react-helmet-async";

const SITE = "https://afrivoucher.com";
const BRAND = "AfriVoucher";
const ZAR_TO_USD = 16.53;
const DEFAULT_IMG = `${SITE}/images/og-default.jpg`; // add a 1200x630 image

// ── helpers ───────────────────────────────────────────────
export const slugify = (s = "") =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const voucherPath = (v) =>
  `/voucher/${slugify(v.name)}-${slugify(v.city)}-${v.firestoreId || v.id}`;

const trim = (s = "", n = 155) =>
  s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";

const toUSD = (zar) => (Number(zar) / ZAR_TO_USD).toFixed(2);

const absImg = (url) =>
  !url ? DEFAULT_IMG : url.startsWith("http") ? url : SITE + url;

// ── generic tag block ─────────────────────────────────────
function Tags({
  title,
  description,
  path,
  image,
  type = "website",
  jsonLd = [],
}) {
  const url = SITE + path;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_ZW" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}

// ── VOUCHER PAGE ──────────────────────────────────────────
export function VoucherSEO({ voucher: v }) {
  if (!v) return null;

  const path = voucherPath(v);
  const url = SITE + path;
  const image = absImg(v.imageUrl || v.img);
  const price = toUSD(v.price);

  const title = trim(
    `${v.name} – ${v.partner}, ${v.city} | Gift Voucher | ${BRAND}`,
    65,
  );
  const description = trim(
    `Gift "${v.name}" from ${v.partner} in ${v.city}, Zimbabwe for US$${price}. ` +
      `${v.desc || ""} Delivered instantly by WhatsApp.`,
  );

  const validUntil = v.expiryDate
    ? String(v.expiryDate).slice(0, 10)
    : undefined;

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: v.name,
    description: v.desc || description,
    image: [image],
    sku: v.firestoreId || v.id,
    category: v.cat,
    brand: { "@type": "Brand", name: v.partner },
    offers: {
      "@type": "Offer",
      url,
      price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(validUntil && { priceValidUntil: validUntil }),
      seller: {
        "@type": "Organization",
        name: v.partner,
        address: {
          "@type": "PostalAddress",
          addressLocality: v.city,
          addressCountry: "ZW",
        },
      },
    },
    // Only add this when you have REAL reviews (see note below)
    ...(v.partnerRating > 0 &&
      v.partnerReviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: v.partnerRating,
          reviewCount: v.partnerReviewCount,
        },
      }),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: v.cat,
        item: `${SITE}/category/${slugify(v.cat)}`,
      },
      { "@type": "ListItem", position: 3, name: v.name, item: url },
    ],
  };

  return (
    <>
      <Tags
        title={title}
        description={description}
        path={path}
        image={image}
        type="product"
        jsonLd={[product, breadcrumbs]}
      />
      <Helmet>
        <meta property="product:price:amount" content={price} />
        <meta property="product:price:currency" content="USD" />
      </Helmet>
    </>
  );
}

// ── CATEGORY PAGE ─────────────────────────────────────────
export function CategorySEO({ cat, vouchers = [] }) {
  const path = `/category/${slugify(cat)}`;
  const title = `${cat} Gift Vouchers in Zimbabwe | ${BRAND}`;
  const description = trim(
    `Browse ${vouchers.length || ""} ${cat.toLowerCase()} vouchers from verified Zimbabwean providers. ` +
      `Send a gift to someone in Harare, Bulawayo and beyond, delivered by WhatsApp.`,
  );

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat} vouchers`,
    itemListElement: vouchers.slice(0, 20).map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: SITE + voucherPath(v),
      name: v.name,
    })),
  };

  return (
    <Tags
      title={title}
      description={description}
      path={path}
      image={DEFAULT_IMG}
      jsonLd={[itemList]}
    />
  );
}

// ── PARTNER PAGE ──────────────────────────────────────────
export function PartnerSEO({ partner }) {
  if (!partner) return null;
  const path = `/partner/${slugify(partner.name)}-${partner.id}`;
  const title = `${partner.name} – Gift Vouchers, ${partner.city || "Zimbabwe"} | ${BRAND}`;
  const description = trim(
    partner.about ||
      `Buy gift vouchers for ${partner.name} in ${partner.city || "Zimbabwe"}. Instant WhatsApp delivery.`,
  );

  const org = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: partner.name,
    url: SITE + path,
    image: absImg(partner.logoUrl),
    address: {
      "@type": "PostalAddress",
      addressLocality: partner.city,
      addressCountry: "ZW",
    },
  };

  return (
    <Tags
      title={title}
      description={description}
      path={path}
      image={absImg(partner.logoUrl)}
      jsonLd={[org]}
    />
  );
}

// ── HOME PAGE (Organization + WebSite) ────────────────────
export function HomeSEO() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE,
    logo: `${SITE}/logo512.png`,
    sameAs: [
      // add your real profiles
      // "https://www.facebook.com/afrivoucher",
      // "https://www.instagram.com/afrivoucher",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+263776109275",
      contactType: "customer service",
      areaServed: "ZW",
      availableLanguage: ["English"],
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Tags
      title="AfriVoucher – Gift Experiences in Zimbabwe, Delivered by WhatsApp"
      description="Send spa days, restaurant meals, adventures, flowers and more from verified Zimbabwean providers. Perfect for gifting family back home."
      path="/"
      image={DEFAULT_IMG}
      jsonLd={[org, website]}
    />
  );
}
