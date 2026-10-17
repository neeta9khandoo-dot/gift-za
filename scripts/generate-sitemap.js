/**
 * AfriVoucher sitemap + robots.txt generator
 *
 * Put this file at:  scripts/generate-sitemap.js
 * Install once:      npm install --save-dev firebase-admin
 *
 * Add to package.json:
 *   "scripts": {
 *     "sitemap": "node scripts/generate-sitemap.js",
 *     "prebuild": "node scripts/generate-sitemap.js"
 *   }
 *
 * Credentials (Firebase Console > Project settings > Service accounts >
 * Generate new private key). Never commit this key or put it in /public.
 *   Option A: GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
 *   Option B: FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
 *             (handy for Vercel/Netlify/GitHub Actions secrets)
 *
 * Output: public/sitemap.xml and public/robots.txt
 */

const fs = require("fs");
const path = require("path");

const SITE = "https://afrivoucher.com";
const OUT_DIR = path.join(__dirname, "..", "public");
const MAX_URLS = 50000; // sitemap protocol limit per file

// ── Must match src/components/Seo.jsx exactly ─────────────────────────────
const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const voucherPath = (v) =>
  `/voucher/${slugify(v.name)}-${slugify(v.city)}-${v.firestoreId}`;

const categoryPath = (cat) => `/category/${slugify(cat)}`;
const partnerPath = (name, id) => `/partner/${slugify(name)}-${id}`;

// ── Static pages ──────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/partners", changefreq: "monthly", priority: "0.7" },
  { loc: "/help", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "yearly", priority: "0.4" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.2" },
  { loc: "/terms", changefreq: "yearly", priority: "0.2" },
];

// Categories to always list, even if empty today
const BASE_CATEGORIES = [
  "Wellness",
  "Beauty",
  "Adventure",
  "Dining & Wine",
  "Traditional Restaurants",
  "Stays",
  "Skills",
  "Music",
  "Events",
  "Florists",
];

// ── Helpers ───────────────────────────────────────────────────────────────
const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDate = (ts) => {
  if (!ts) return null;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return isNaN(d) ? null : d;
};

const ymd = (d) => (d ? d.toISOString().slice(0, 10) : null);

function initFirestore() {
  const { initializeApp, cert, applicationDefault } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = applicationDefault();
  } else {
    return null;
  }

  const app = initializeApp({ credential });
  return getFirestore(app);
}
// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const db = initFirestore();
  const urls = [];
  const today = ymd(new Date());

  STATIC_PAGES.forEach((p) => urls.push({ ...p, lastmod: today }));

  const categories = new Set(BASE_CATEGORIES);
  const partners = new Map(); // id -> { name, lastmod }

  if (!db) {
    console.warn(
      "[sitemap] No Firebase credentials found. Writing static pages only.\n" +
        "          Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT."
    );
  } else {
    const snap = await db.collection("all_vouchers").get();
    console.log(`[sitemap] Found ${snap.size} vouchers in Firestore`);

    snap.forEach((doc) => {
      const d = doc.data();

      // Skip anything you don't want public
      if (d.status && d.status !== "active") return;

      // Same fallbacks as your App.jsx mapping
      const voucher = {
        firestoreId: doc.id,
        name: d.name || "Unnamed Voucher",
        city: d.city || d.businessCity || d.location || "Zimbabwe",
        cat: d.category || "Other",
      };

      // Skip expired vouchers
      const exp = toDate(d.expiryDate);
      if (exp && exp.getTime() < Date.now()) return;

      const lastmod = ymd(toDate(d.updatedAt) || toDate(d.createdAt)) || today;

      urls.push({
        loc: voucherPath(voucher),
        lastmod,
        changefreq: "weekly",
        priority: "0.8",
      });

      categories.add(voucher.cat);

      const partnerId = d.partnerUid || d.uid;
      if (partnerId && d.businessName) {
        const prev = partners.get(partnerId);
        if (!prev || lastmod > prev.lastmod) {
          partners.set(partnerId, { name: d.businessName, lastmod });
        }
      }
    });
  }

  categories.forEach((cat) =>
    urls.push({
      loc: categoryPath(cat),
      lastmod: today,
      changefreq: "daily",
      priority: "0.9",
    })
  );

  partners.forEach(({ name, lastmod }, id) =>
    urls.push({
      loc: partnerPath(name, id),
      lastmod,
      changefreq: "weekly",
      priority: "0.7",
    })
  );

  if (urls.length > MAX_URLS) {
    console.warn(
      `[sitemap] ${urls.length} URLs exceeds ${MAX_URLS}. Truncating; split into a sitemap index if you reach this.`
    );
    urls.length = MAX_URLS;
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n` +
          `    <loc>${xmlEscape(SITE + u.loc)}</loc>\n` +
          `    <lastmod>${u.lastmod}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n` +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  const robots =
    [
      "User-agent: *",
      "Allow: /",
      "",
      "# Private areas",
      "Disallow: /admin",
      "Disallow: /auth",
      "Disallow: /orders",
      "",
      `Sitemap: ${SITE}/sitemap.xml`,
    ].join("\n") + "\n";

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), xml);
  fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), robots);

  console.log(`[sitemap] Wrote ${urls.length} URLs to public/sitemap.xml`);
  console.log("[sitemap] Wrote public/robots.txt");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // Don't break your production build if Firestore is unreachable
    console.error("[sitemap] Failed:", err.message);
    process.exit(0);
  });