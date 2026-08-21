/**
 * The Duck Cooking Starter Guide — the site's first-party lead magnet.
 *
 * Registered here (rather than in `GUIDES`) so it stays out of the pillar hub
 * grids while still feeding the sitemap, site search, and newsletter copy from
 * a single source of truth.
 */
import { SITE_URL } from "./site";

export const STARTER_GUIDE = {
  path: "/guides/duck-cooking-starter-guide",
  title: "The Duck Cooking Starter Guide",
  seoTitle: "Duck Cooking Starter Guide: Your First Duck | DeliciousDuck",
  description:
    "A starter reference for cooking duck: how it differs from chicken, which cut to start with, five core techniques, safe temperatures and a shopping checklist.",
  teaser:
    "Everything a first-time duck cook needs on one page: cut chooser, five core techniques, temperatures, and a shopping checklist.",
  minutes: 9,
} as const;

/** Absolute URL used in the Resend welcome event payload. */
export const STARTER_GUIDE_URL = `${SITE_URL}${STARTER_GUIDE.path}`;


/**
 * Duck Fundamentals: The Field Guide — the printable 16-page PDF that
 * subscribers receive. Served as a stable public asset.
 */
export const FIELD_GUIDE = {
  path: "/downloads/duck-fundamentals-field-guide.pdf",
  title: "Duck Fundamentals: The Field Guide",
  description:
    "A printable 16-page guide to buying, preparing, cooking, carving, troubleshooting, and making every part of the duck count.",
  pages: 16,
} as const;

/** Absolute URL used in the Resend welcome event payload. */
export const FIELD_GUIDE_URL = `${SITE_URL}${FIELD_GUIDE.path}`;
