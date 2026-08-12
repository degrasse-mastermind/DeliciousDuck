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
  seoTitle: "The Duck Cooking Starter Guide: Your First Duck, Step by Step | DeliciousDuck",
  description:
    "A concise starter reference for cooking duck: how duck differs from chicken, which cut to start with, the five techniques that matter, USDA temperature guidance, and a first-duck shopping checklist.",
  teaser:
    "Everything a first-time duck cook needs on one page: cut chooser, five core techniques, temperatures, and a shopping checklist.",
  minutes: 9,
} as const;

/** Absolute URL used in the Resend welcome event payload. */
export const STARTER_GUIDE_URL = `${SITE_URL}${STARTER_GUIDE.path}`;
