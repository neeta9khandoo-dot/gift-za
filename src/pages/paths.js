// Put this in the SAME folder as App.jsx and StorePage.jsx (e.g. src/pages/paths.js)
// It adjusts the import below if your Seo.jsx lives elsewhere.
import { slugify, voucherPath } from "../components/Seo";

export { slugify, voucherPath };

// ── URL builders ──────────────────────────────────────────────────────────
export const categoryPath = (cat) => `/category/${slugify(cat)}`;

// Name is optional. The ID at the end is what the page actually uses.
export const partnerPath = (id, name) =>
  name ? `/partner/${slugify(name)}-${id}` : `/partner/${id}`;

// "couples-spa-day-harare-AbC123" -> "AbC123"
// (Firestore document IDs and Firebase UIDs contain no hyphens)
export const idFromSlug = (slug = "") => slug.split("-").pop();

// ── Old "page" ids -> URLs (so Nav, Footer, BottomNav keep working) ───────
const PAGE_PATHS = {
  store: "/",
  partners: "/partners",
  help: "/help",
  contact: "/contact",
  auth: "/auth",
  admin: "/admin",
  orders: "/orders",
  privacy: "/privacy",
  terms: "/terms",
};

// Unknown ids (e.g. "profile", "settings", which have no page yet) go home
export const pathForPage = (p) => PAGE_PATHS[p] ?? "/";

// URL -> page id, used only to highlight the active nav item
export const pageForPath = (pathname) => {
  if (pathname.startsWith("/partner/")) return "partner";
  const hit = Object.entries(PAGE_PATHS).find(
    ([id, path]) => id !== "store" && pathname === path,
  );
  return hit ? hit[0] : "store";
};

// ── Categories ────────────────────────────────────────────────────────────
export const BASE_CATEGORIES = [
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

const CAT_ALIASES = { "hair-and-beauty": "Beauty" };

// "dining-and-wine" -> "Dining & Wine" (or null if unknown)
export const catFromSlug = (slug, vouchers = []) => {
  if (CAT_ALIASES[slug]) return CAT_ALIASES[slug];
  const all = [...BASE_CATEGORIES, ...vouchers.map((v) => v.cat)];
  return all.find((c) => c && slugify(c) === slug) || null;
};
