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
  seoTitle: "Duck Cooking Starter Guide | DeliciousDuck",
  description:
    "A starter reference for cooking duck: how it differs from chicken, which cut to start with, five core techniques, safe temperatures and a shopping checklist.",
  teaser:
    "Everything a first-time duck cook needs on one page: cut chooser, five core techniques, temperatures, and a shopping checklist.",
  minutes: 9,
} as const;

/** Absolute URL used in the Resend welcome event payload. */
export const STARTER_GUIDE_URL = `${SITE_URL}${STARTER_GUIDE.path}`;


/**
 * Duck the Fundamentals — the printable 28-page playbook subscribers receive.
 * Served as a stable public asset.
 *
 * The exported symbol keeps its historical name (`FIELD_GUIDE`) on purpose: the
 * internal lead-magnet identity, analytics asset id, placements, segments and
 * consent plumbing all key off it, and only the *public* title changed.
 */
export const FIELD_GUIDE = {
  path: "/downloads/duck-the-fundamentals-playbook.pdf",
  /**
   * Permanent legacy path. Serves byte-identical bytes so links already in
   * inboxes, emails and indexes keep working forever.
   */
  legacyPath: "/downloads/duck-fundamentals-field-guide.pdf",
  title: "Duck the Fundamentals",
  descriptor: "The no-panic playbook for cooking seriously good duck",
  description:
    "A printable 28-page playbook: cut-specific routes, a command center, whole-duck, breast and leg plans, temperature and probe guidance, Duck SOS troubleshooting, menus, and detachable kitchen sheets.",
  pages: 28,
} as const;

/**
 * Non-breaking public metadata for analytics payloads. The historical internal
 * id stays `duck-fundamentals-field-guide`; these fields describe the version
 * of the asset actually delivered.
 */
export const LEAD_MAGNET_META = {
  name: "duck_the_fundamentals",
  version: 2,
  pages: FIELD_GUIDE.pages,
} as const;

/** Absolute URL used in the Resend welcome event payload. */
export const FIELD_GUIDE_URL = `${SITE_URL}${FIELD_GUIDE.path}`;

/** Absolute legacy URL, kept for reference/redirect parity. */
export const FIELD_GUIDE_LEGACY_URL = `${SITE_URL}${FIELD_GUIDE.legacyPath}`;
