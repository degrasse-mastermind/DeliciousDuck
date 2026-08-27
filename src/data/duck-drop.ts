/**
 * The Duck Drop — weekly newsletter operating system.
 *
 * This module is the editorial + revenue policy for a 3-minute weekly email.
 * It holds the issue field spec, the pre-send quality gate, a 12-issue editorial
 * queue built ONLY from content that already exists on DeliciousDuck, the
 * retention lifecycle plan, and the monetization rules.
 *
 * Hard rules encoded here:
 * - No fabricated trend, ranking, keyword-volume, price, or revenue claims.
 * - No invented testing claims: nothing is "tested" until a recorded kitchen
 *   test exists (see /internal/kitchen-test-sheet).
 * - Commerce is resolved through the affiliate registry, never pasted by hand.
 *   While every merchant is pending, the studio can only produce plain,
 *   non-affiliate destinations — which also means no disclosure is required.
 */

import type { NewsletterInterest } from "./newsletter-contexts";
import { NEWSLETTER_INTERESTS } from "./newsletter-contexts";
import { HAS_ACTIVE_AFFILIATE_PROGRAM } from "./affiliates";

/* ------------------------------------------------------------------ *
 * Confirmed email infrastructure
 * ------------------------------------------------------------------ */

/**
 * IDs only — no API keys. The Resend token lives exclusively as a server
 * secret and is never referenced from client-reachable modules.
 */
export const DUCK_DROP = {
  name: "The Duck Drop",
  cadence: "Weekly",
  promise: "One technique, one mistake, one thing worth opening. Three minutes.",
  sender: "DeliciousDuck <hello@deliciousduck.com>",
  templateName: "The Duck Drop - Weekly Newsletter",
  templateAlias: "duck-drop-weekly",
  templateId: "6154ad00-d5ec-45dc-ac88-be56adb9a1df",
  mainSegmentName: "DeliciousDuck Subscribers",
  mainSegmentId: "0a4c8912-f401-400b-b230-2a993f0ec516",
  breastSegmentName: "DeliciousDuck - Duck Breast",
  breastSegmentId: "eb02d085-1aa8-45e9-85a8-d8754bb525e8",
  /** Plan ceiling. Interest segmentation therefore lives in our database. */
  segmentBudget: 3,
} as const;

/* ------------------------------------------------------------------ *
 * Interest labels (shared by studio, dashboard, and the signup selector)
 * ------------------------------------------------------------------ */

export const INTEREST_LABELS: Record<NewsletterInterest, string> = {
  "duck-breast": "Duck breast",
  "whole-duck": "Whole duck",
  "duck-fat": "Duck fat",
  sourcing: "Buying & sourcing",
  "wild-duck": "Wild duck",
  general: "A bit of everything",
};

/** What choosing this interest actually changes. No overpromising. */
export const INTEREST_BLURBS: Record<NewsletterInterest, string> = {
  "duck-breast": "Crisp skin, scoring, temperature, and pan technique",
  "whole-duck": "Roasting a whole bird, timing, carving, and portions",
  "duck-fat": "Rendering, storing, and cooking with duck fat",
  sourcing: "Buying well: breeds, labels, sellers, and storage",
  "wild-duck": "Lean wild birds and how the rules change",
  general: "The weekly issue as it comes, no leaning",
};

export const SELECTABLE_INTERESTS = NEWSLETTER_INTERESTS;

/* ------------------------------------------------------------------ *
 * 1 — Issue field spec
 * ------------------------------------------------------------------ */

export type MonetizationIntent = "none" | "soft" | "commercial";

export const MONETIZATION_LABEL: Record<MonetizationIntent, string> = {
  none: "Editorial only — no commercial module",
  soft: "One contextual mention, no hard sell",
  commercial: "One deliberate commercial module",
};

/** What the week's commerce slot is for. Never a revenue estimate. */
export type RevenueRole = "sourcing" | "thermometer" | "pan" | "knife" | "duck-fat" | "none";

export const REVENUE_ROLE_LABEL: Record<RevenueRole, string> = {
  sourcing: "Sourcing — where to buy the bird",
  thermometer: "Thermometer — temperature confidence",
  pan: "Pan — heat control and rendering",
  knife: "Knife — scoring and carving",
  "duck-fat": "Duck fat — the by-product purchase",
  none: "No commercial role this week",
};

export type IssueStatus = "idea" | "drafting" | "ready" | "sent";

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  idea: "Idea",
  drafting: "Drafting",
  ready: "Ready to send",
  sent: "Sent",
};

export interface IssueModule {
  title: string;
  body: string;
  /** Same-origin path or absolute https URL. */
  url: string;
}

export interface IssueDraft {
  issueNumber: number;
  issueDate: string;
  subject: string;
  previewText: string;
  issueTitle: string;
  technique: IssueModule;
  mistake: IssueModule;
  worthOpening: IssueModule;
  /** Optional. Resolved through the affiliate registry, never hand-pasted. */
  worthConsidering: IssueModule & { merchantId: string; deepLinkId: string };
  signoff: string;
  audience: NewsletterInterest;
  monetization: MonetizationIntent;
  revenueRole: RevenueRole;
  status: IssueStatus;
}

export const EMPTY_ISSUE: IssueDraft = {
  issueNumber: 1,
  issueDate: "",
  subject: "",
  previewText: "",
  issueTitle: "",
  technique: { title: "", body: "", url: "" },
  mistake: { title: "", body: "", url: "" },
  worthOpening: { title: "", body: "", url: "" },
  worthConsidering: { title: "", body: "", url: "", merchantId: "", deepLinkId: "" },
  signoff: "Cook something good this week.\n— DeliciousDuck",
  audience: "general",
  monetization: "none",
  revenueRole: "none",
  status: "idea",
};

/* ------------------------------------------------------------------ *
 * 2 — Pre-send quality gate
 * ------------------------------------------------------------------ */

export interface GateItem {
  id: string;
  label: string;
  detail: string;
  /** True when the studio can check this automatically from the draft. */
  automated?: boolean;
}

export const QUALITY_GATE: GateItem[] = [
  {
    id: "standalone-value",
    label: "Gives one standalone useful takeaway even if nobody clicks",
    detail:
      "The technique block must be usable inside the email. A teaser that only makes sense after a click fails this gate.",
  },
  {
    id: "one-target",
    label: "One clear primary click target",
    detail: "Every issue has a single destination it is really asking for. Rank the rest below it.",
  },
  {
    id: "one-commercial",
    label: "No more than one commercial module unless editorially necessary",
    detail: "Worth Considering is the only commercial slot. Two commercial asks is an ad feed.",
    automated: true,
  },
  {
    id: "no-fabrication",
    label: "No fake scarcity, fake discounts, fake testing, invented prices or ratings",
    detail:
      "No countdowns, no 'selling out', no price or star rating we have not verified, and no 'we tested' unless a recorded kitchen test exists.",
  },
  {
    id: "disclosure",
    label: "Affiliate disclosure appears before the first actual affiliate link",
    detail:
      "Required only when a real tracking URL is used. With every merchant pending, links are plain and no disclosure is owed.",
    automated: true,
  },
  {
    id: "urls",
    label: "All URLs valid and HTTPS",
    detail: "Site links are absolute https on deliciousduck.com. No bare paths in the email body.",
    automated: true,
  },
  {
    id: "subject",
    label: "Subject is specific, not clickbait",
    detail:
      "Name the thing: 'Why your duck skin goes leathery' beats 'The #1 duck mistake'. No all-caps, no fake urgency.",
    automated: true,
  },
  {
    id: "length",
    label: "Mobile-friendly length",
    detail:
      "Three minutes end to end. Each block reads in under 120 words on a phone with no pinch-zoom.",
    automated: true,
  },
  {
    id: "safety",
    label: "USDA/safety language preserved where relevant",
    detail:
      "If the issue touches doneness, thawing, wild birds, or confit storage, the USDA baseline (165°F for poultry) travels with it — never softened to sell a technique.",
  },
  {
    id: "unsubscribe",
    label: "Unsubscribe handled by Resend",
    detail: "One-click unsubscribe is provider-managed. Never build a second opt-out path.",
  },
  {
    id: "no-pii",
    label: "No email or other PII in analytics parameters",
    detail:
      "Link tags carry campaign, medium, and slot names only. Never an address, hash, or subscriber ID.",
    automated: true,
  },
  {
    id: "link-naming",
    label: "Trackable link naming plan recorded",
    detail: "Every link follows the conventions below so slot performance is comparable weekly.",
  },
];

/* ------------------------------------------------------------------ *
 * 3 — Link naming conventions
 * ------------------------------------------------------------------ */

export const LINK_CONVENTIONS = {
  medium: "email",
  campaign: "duck_drop",
  slots: ["technique", "mistake", "feature", "commerce", "signoff"] as const,
  /** Site links get tagged. External affiliate links never do. */
  rule:
    "Tag DeliciousDuck destinations with utm_source=duck_drop, utm_medium=email, utm_campaign=duck_drop, utm_content=<slot>_<issue-number>. Never append parameters to a network affiliate URL — extra query strings can break network attribution. For affiliate destinations, rely on the outbound affiliate_click event fired on the landing page instead.",
} as const;

export type IssueSlot = (typeof LINK_CONVENTIONS.slots)[number];

/**
 * Builds the tracked email URL for a first-party destination.
 * Returns external URLs untouched — deliberately, so affiliate attribution
 * is never broken by our own parameters.
 */
export function taggedEmailUrl(
  url: string,
  slot: IssueSlot,
  issueNumber: number,
  baseUrl = "https://deliciousduck.com",
): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  let parsed: URL;
  try {
    parsed = new URL(trimmed, baseUrl);
  } catch {
    return trimmed;
  }
  const isFirstParty = parsed.hostname.endsWith("deliciousduck.com");
  if (!isFirstParty) return parsed.toString();
  parsed.searchParams.set("utm_source", "duck_drop");
  parsed.searchParams.set("utm_medium", LINK_CONVENTIONS.medium);
  parsed.searchParams.set("utm_campaign", LINK_CONVENTIONS.campaign);
  parsed.searchParams.set("utm_content", `${slot}_${issueNumber}`);
  return parsed.toString();
}

/* ------------------------------------------------------------------ *
 * 4 — 12-issue editorial queue
 *
 * Sourced only from pages and tools that already exist. Commercial pressure
 * rotates deliberately: most weeks are editorial-only.
 * ------------------------------------------------------------------ */

export interface QueuedIssue {
  week: number;
  pillar: string;
  audience: NewsletterInterest;
  /** Suggested technique block. */
  technique: { angle: string; url: string };
  /** Suggested mistake block. */
  mistake: { angle: string; url: string };
  /** Suggested Worth Opening feature. */
  feature: { angle: string; url: string };
  monetization: MonetizationIntent;
  revenueRole: RevenueRole;
  /** Why this week carries the commercial pressure it carries. */
  note: string;
}

export const ISSUE_QUEUE: QueuedIssue[] = [
  {
    week: 1,
    pillar: "Crispy duck breast",
    audience: "duck-breast",
    technique: {
      angle: "Cold pan, skin down, patient heat — the render that makes skin shatter",
      url: "/cook/how-to-cook-duck-breast",
    },
    mistake: {
      angle: "Starting in a hot pan, so fat seizes and skin turns leathery",
      url: "/learn/why-duck-skin-isnt-crispy",
    },
    feature: { angle: "The full pan-seared method, start to slice", url: "/recipes/pan-seared-duck-breast" },
    monetization: "none",
    revenueRole: "none",
    note: "Opening issue earns attention first. No commercial module at all.",
  },
  {
    week: 2,
    pillar: "Temperature and probes",
    audience: "duck-breast",
    technique: {
      angle: "Where to probe a breast, and the carryover you should plan for",
      url: "/learn/duck-breast-temperature-doneness",
    },
    mistake: {
      angle: "Judging doneness by colour and time instead of an instant-read reading",
      url: "/tools/duck-doneness-guide",
    },
    feature: { angle: "The doneness guide, with the USDA baseline stated plainly", url: "/tools/duck-doneness-guide" },
    monetization: "soft",
    revenueRole: "thermometer",
    note: "Thermometer is genuinely the week's problem. Mention only — merchant is pending, so the link is plain.",
  },
  {
    week: 3,
    pillar: "Whole-duck planning",
    audience: "whole-duck",
    technique: {
      angle: "Work backwards from dinner: thaw, temper, roast, rest",
      url: "/tools/duck-cooking-time-planner",
    },
    mistake: {
      angle: "Buying a bird too small for the table, then over-roasting to stretch it",
      url: "/tools/whole-duck-serving-calculator",
    },
    feature: { angle: "The whole roast duck method", url: "/cook/whole-roast-duck" },
    monetization: "none",
    revenueRole: "none",
    note: "Two calculators in one issue is plenty of ask.",
  },
  {
    week: 4,
    pillar: "Duck fat",
    audience: "duck-fat",
    technique: { angle: "Rendering clean fat while you cook, not as a separate chore", url: "/learn/how-to-render-duck-fat" },
    mistake: { angle: "Scorching the fat, then storing it cloudy and short-lived", url: "/learn/how-to-render-duck-fat" },
    feature: { angle: "Uses for duck fat that are actually worth it", url: "/cook/ways-to-use-duck-fat" },
    monetization: "soft",
    revenueRole: "duck-fat",
    note: "Buying rendered fat is a legitimate shortcut. One mention, no urgency.",
  },
  {
    week: 5,
    pillar: "Sourcing and buying",
    audience: "sourcing",
    technique: { angle: "What to read on the label before you commit to a bird", url: "/buy/where-to-buy-duck-online" },
    mistake: { angle: "Ordering without checking weight, so timing and portions become guesswork", url: "/learn/whole-duck-cooking-time" },
    feature: { angle: "How the online sellers actually differ", url: "/buy/where-to-buy-duck-online" },
    monetization: "commercial",
    revenueRole: "sourcing",
    note: "The one clearly commercial week in the first six. Sourcing is the reader's actual question.",
  },
  {
    week: 6,
    pillar: "Wild vs farmed",
    audience: "wild-duck",
    technique: { angle: "Cooking a lean wild breast: less rendering, faster finish", url: "/cook/how-to-cook-wild-duck-breast" },
    mistake: { angle: "Treating a wild bird like a Pekin and drying it out", url: "/learn/wild-duck-vs-farmed-duck" },
    feature: { angle: "Wild vs farmed, difference by difference", url: "/learn/wild-duck-vs-farmed-duck" },
    monetization: "none",
    revenueRole: "none",
    note: "Safety-sensitive issue. Carry the USDA baseline; sell nothing.",
  },
  {
    week: 7,
    pillar: "Scoring technique",
    audience: "duck-breast",
    technique: { angle: "Depth, spacing, and angle — scoring fat without cutting meat", url: "/learn/how-to-score-duck-breast" },
    mistake: { angle: "Cutting through to the flesh, so juices leave before the skin crisps", url: "/learn/how-to-score-duck-breast" },
    feature: { angle: "Why skin fails, cause by cause", url: "/learn/why-duck-skin-isnt-crispy" },
    monetization: "soft",
    revenueRole: "knife",
    note: "A sharp knife is the constraint here. One mention, editorial first.",
  },
  {
    week: 8,
    pillar: "Sauces and pairings",
    audience: "duck-breast",
    technique: { angle: "Build the pan sauce in the rendered fat you already have", url: "/cook/best-sauces-for-duck-breast" },
    mistake: { angle: "Sweet sauce with no acid, so the plate turns cloying", url: "/ingredients/best-acid-for-duck" },
    feature: { angle: "What to serve alongside", url: "/cook/what-to-serve-with-duck-breast" },
    monetization: "none",
    revenueRole: "none",
    note: "Pure kitchen craft week.",
  },
  {
    week: 9,
    pillar: "Carving a whole duck",
    audience: "whole-duck",
    technique: { angle: "Legs first, then breast off the bone — carving in the right order", url: "/learn/how-to-carve-a-duck" },
    mistake: { angle: "Carving straight out of the oven and losing the juices to the board", url: "/learn/how-to-carve-a-duck" },
    feature: { angle: "Use the whole bird: fat, stock, and second meals", url: "/cook/whole-roast-duck" },
    monetization: "soft",
    revenueRole: "knife",
    note: "Carving knife mention is contextual, not a roundup.",
  },
  {
    week: 10,
    pillar: "Thawing and prep",
    audience: "sourcing",
    technique: { angle: "Fridge thawing on a schedule, plus the dry-brine window", url: "/learn/how-to-thaw-duck" },
    mistake: { angle: "Counter thawing to save a day — the one shortcut we won't publish", url: "/learn/how-to-thaw-duck" },
    feature: { angle: "Dry brine: what it does and when to start", url: "/ingredients/dry-brine-duck" },
    monetization: "none",
    revenueRole: "none",
    note: "Safety issue. USDA thawing guidance stays verbatim.",
  },
  {
    week: 11,
    pillar: "Confit fundamentals",
    audience: "whole-duck",
    technique: { angle: "Cure, submerge, cook low — confit without mystique", url: "/recipes/duck-leg-confit" },
    mistake: { angle: "Treating confit as indefinite preservation instead of 3–4 days refrigerated", url: "/recipes/duck-leg-confit" },
    feature: { angle: "Duck leg confit, explained in the cook pillar", url: "/cook/duck-leg-confit" },
    monetization: "soft",
    revenueRole: "duck-fat",
    note: "Confit needs volume fat. Mention it once; keep the storage guidance conservative.",
  },
  {
    week: 12,
    pillar: "Best-of and tools",
    audience: "general",
    technique: { angle: "The five decisions that changed our duck the most this quarter", url: "/guides/duck-cooking-starter-guide" },
    mistake: { angle: "Cooking duck with no way to plan timing or portions", url: "/tools" },
    feature: { angle: "Every calculator in one place", url: "/tools" },
    monetization: "commercial",
    revenueRole: "sourcing",
    note: "Quarter-closing roundup. Second and last commercial week of the twelve.",
  },
];

/** Honest counts for the studio header — computed, not asserted. */
export function queueSummary() {
  const commercial = ISSUE_QUEUE.filter((i) => i.monetization === "commercial").length;
  const soft = ISSUE_QUEUE.filter((i) => i.monetization === "soft").length;
  return {
    total: ISSUE_QUEUE.length,
    commercial,
    soft,
    editorialOnly: ISSUE_QUEUE.length - commercial - soft,
    /** With no active program, no issue can carry a real affiliate link yet. */
    monetizableToday: HAS_ACTIVE_AFFILIATE_PROGRAM,
  };
}

/* ------------------------------------------------------------------ *
 * 5 — Retention lifecycle
 * ------------------------------------------------------------------ */

export interface LifecyclePhase {
  stage: "welcome" | "active" | "reengage";
  window: string;
  whatHappens: string;
  dataBasis: string;
}

export const LIFECYCLE_PLAN: LifecyclePhase[] = [
  {
    stage: "welcome",
    window: "Days 0–13",
    whatHappens:
      "The existing six-part welcome series runs, triggered on first subscribe. The playbook download link travels in the first email and is also shown on-site immediately.",
    dataBasis: "Subscribe timestamp and welcome-event status, both stored per row in our database.",
  },
  {
    stage: "active",
    window: "Day 14 onward",
    whatHappens:
      "Eligible for the weekly Duck Drop broadcast to the main segment. Interest only changes which examples lead, never whether they receive the issue.",
    dataBasis: "Lifecycle stage in our database, advanced deliberately — not inferred from opens.",
  },
  {
    stage: "reengage",
    window: "Future workflow — not implemented",
    whatHappens:
      "A single low-pressure 'still useful?' issue, built around a genuinely useful technique rather than a plea. Never a discount, never fake urgency.",
    dataBasis:
      "Click-based engagement where we can observe it. Deliberately NOT open rates: opens are inflated by prefetching and privacy proxies, so treating them as truth would mislead us.",
  },
];

export const LIFECYCLE_POLICY: string[] = [
  "No subscriber is suppressed, downgraded, or deleted automatically. Any removal policy has to be written down here first, with a stated window.",
  "Unsubscribes and complaints are provider-managed; we mirror status in our own row and never re-add an unsubscribed address.",
  "Opens are treated as a weak signal only. Clicks and on-site behaviour are the reliable ones.",
  "Existing subscribers with no known interest stay general/blank. We do not guess an interest from browsing.",
  "Interest is only ever set from explicit signup context (the page cluster) or an explicit subscriber choice.",
];

export const FUTURE_BRANCHES: { branch: string; requires: string }[] = [
  {
    branch: "Interest-specific commercial issue (e.g. a sourcing-only Duck Drop)",
    requires:
      "At least one approved affiliate program plus enough subscribers in that interest for the split to mean anything.",
  },
  {
    branch: "Kitchen-verified recipe announcement issue",
    requires:
      "A completed kitchen test with recorded evidence, so the issue can say 'we cooked it' truthfully.",
  },
  {
    branch: "Preference centre subscribers can revisit by link",
    requires:
      "A signed, expiring token delivered by email. Not built yet: a guessable or non-expiring link would leak one subscriber's preferences to anyone holding the URL. Post-signup selection is in-session only for exactly this reason.",
  },
  {
    branch: "Click-based re-engagement segment",
    requires: "Reliable per-issue click data retained long enough to define dormancy honestly.",
  },
];

/* ------------------------------------------------------------------ *
 * 6 — Monetization rules
 * ------------------------------------------------------------------ */

export const MONETIZATION_RULES: string[] = [
  "Editorial first, always: an issue must earn its keep even if the commerce module is deleted.",
  "The commerce module appears only when the product is the answer to the week's actual problem.",
  "One commercial module per issue. A second one needs a written editorial reason.",
  "Destinations resolve from the affiliate registry by merchant and product ID. Tracking URLs are never pasted into an issue by hand.",
  "Pending merchants resolve to plain, non-affiliate links. No disclosure is claimed, because nothing is earned.",
  "Disclosure appears above the first real affiliate link the moment a program goes active — the studio derives this, it is not a manual checkbox.",
  "No prices, ratings, review counts, discounts, scarcity, or testing claims we cannot substantiate.",
  "Revenue role is recorded per issue so commercial pressure can be reviewed over a quarter, not per email.",
];

/* ------------------------------------------------------------------ *
 * 7 — Duck Drop dashboard metrics
 * ------------------------------------------------------------------ */

export type MetricSource = "live" | "manual" | "future";

export interface DuckDropMetric {
  label: string;
  hint: string;
  source: MetricSource;
  wide?: boolean;
}

export const DUCK_DROP_METRICS: DuckDropMetric[] = [
  {
    label: "Total subscribers",
    hint: "Read live from our database (aggregate counts only, no addresses).",
    source: "live",
  },
  {
    label: "New subscribers this week",
    hint: "Live from our database, last 7 days.",
    source: "live",
  },
  {
    label: "Primary-interest mix",
    hint: "Live from our database. Blank interest means unknown, never guessed.",
    source: "live",
  },
  { label: "Signup source mix", hint: "Live from our database, by placement.", source: "live" },
  { label: "Weekly sends", hint: "From the Resend broadcast summary. Enter manually.", source: "manual" },
  {
    label: "Delivered / bounced / complaints",
    hint: "Resend reports these per broadcast. Enter manually; no live sync exists.",
    source: "manual",
  },
  { label: "Clicks / click rate", hint: "Resend broadcast clicks. Enter manually.", source: "manual" },
  {
    label: "Sessions attributed to email",
    hint: "GA4, filtered to medium=email and campaign=duck_drop. Enter manually.",
    source: "manual",
  },
  {
    label: "Affiliate outbound clicks from email sessions",
    hint: "GA4 affiliate_click where email_attributed=true. Meaningful only once a program is active.",
    source: "future",
  },
  { label: "Unsubscribes", hint: "Resend broadcast summary. Enter manually.", source: "manual", wide: true },
];

export const DUCK_DROP_DECISIONS: { signal: string; action: string }[] = [
  {
    signal: "Low signup conversion on a page that gets traffic",
    action: "Test the offer and placement on that page — the promise wording, then position. Do not add pop-ups.",
  },
  {
    signal: "Subscriber growth healthy, newsletter clicks low",
    action: "The issue itself is the problem. Test the technique block and the single primary CTA, not the send time.",
  },
  {
    signal: "Newsletter clicks healthy, affiliate outbound low",
    action: "This is a landing-page monetization problem, not an email problem. Fix the destination page's commerce module.",
  },
  {
    signal: "Unsubscribe spike after an issue",
    action: "Cadence or expectation mismatch. Re-read that issue against the quality gate — usually commercial pressure or a vague subject.",
  },
  {
    signal: "One interest dominates the mix",
    action: "Lead more issues with that pillar, but keep the broadcast whole. Do not fragment the list into thin segments.",
  },
];
