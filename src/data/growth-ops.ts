/**
 * Internal growth-operations data. Owner-facing only.
 *
 * Consumed exclusively by /internal/growth-dashboard, which is noindex and
 * excluded from the sitemap, the site search index, and public navigation.
 *
 * Hard rules for this file:
 * - No keyword volumes, difficulty scores, or traffic estimates. We have no
 *   data source for those, so we do not print numbers we cannot verify.
 * - No claims about how Google ranks pages. The decision framework below is
 *   our own editorial policy, expressed as "when we see X, we do Y".
 * - No affiliate approval inferences. Merchant status is read from
 *   src/data/affiliates.ts, which is the single source of truth.
 */

export type TrustState = "working-draft" | "informational" | "money";

export interface QueueItem {
  path: string;
  label: string;
  intent: string;
  role: string;
  trust: TrustState;
  evidenceNeeded: string;
  updateTrigger: string;
}

export interface QueueCluster {
  cluster: string;
  note: string;
  items: QueueItem[];
}

export const CONTENT_QUEUE: QueueCluster[] = [
  {
    cluster: "Duck breast — core technique (Phase 2, Sprint 1 priority)",
    note: "Current Phase 2 priority. Highest-intent cluster on the site, the one the flagship kitchen test serves, and now wired as a single pathway: /cook/how-to-cook-duck-breast is the hub, every cluster page carries the DuckBreastJourney module, and internal navigation emits duck_breast_cluster_click (destination_slug, destination_group, source_path, placement) so we can see which route readers actually take. No live metrics are stored here — read the counts in GA4.",
    items: [
      {
        path: "/recipes/pan-seared-duck-breast",
        label: "Pan-seared duck breast (recipe)",
        intent: "Cook it tonight, following an exact method",
        role: "Trust anchor; feeds gear and buy pages",
        trust: "working-draft",
        evidenceNeeded:
          "Completed Kitchen Test Sheet: weighed breasts, render log, side-probe reads, own-kitchen photos",
        updateTrigger:
          "Any impressions at all for recipe-intent queries, or a completed kitchen test — whichever lands first",
      },
      {
        path: "/cook/how-to-cook-duck-breast",
        label: "How to cook duck breast",
        intent: "Understand the method before committing to a recipe",
        role: "Cluster hub; routes to recipe, doneness, thermometer",
        trust: "informational",
        evidenceNeeded: "Confirm the 12–18 minute render window against measured test data",
        updateTrigger: "Ranks positions 4–15, or impressions rise while CTR stays flat",
      },
      {
        path: "/learn/duck-breast-temperature-doneness",
        label: "Duck breast temperature & doneness",
        intent: "What temperature to pull it at",
        role: "Highest natural bridge into the thermometer page",
        trust: "informational",
        evidenceNeeded: "Measured pull vs post-rest carryover figures from our own cook",
        updateTrigger: "High impressions with low CTR — this is a title/meta candidate first",
      },
      {
        path: "/learn/how-to-score-duck-breast",
        label: "How to score duck breast",
        intent: "Specific sub-technique, often mid-cook",
        role: "Feeds knife and pan gear pages",
        trust: "informational",
        evidenceNeeded: "Photographs of our own scoring pattern and depth",
        updateTrigger: "Impressions present but position beyond 15 — needs internal links first",
      },
      {
        path: "/learn/why-duck-skin-isnt-crispy",
        label: "Why duck skin isn't crispy (troubleshooting)",
        intent: "Something went wrong, fix it now",
        role: "Rescue page; strong path to method and thermometer",
        trust: "informational",
        evidenceNeeded: "One documented failure mode reproduced in our kitchen",
        updateTrigger: "Rising impressions — protect and expand rather than rewrite",
      },
    ],
  },
  {
    cluster: "Whole duck",
    note: "Seasonal demand. Timing accuracy matters more than prose here.",
    items: [
      {
        path: "/cook/whole-roast-duck",
        label: "Whole roast duck",
        intent: "Cook a whole bird for a meal or holiday",
        role: "Hub for serving calculator and buy pages",
        trust: "informational",
        evidenceNeeded: "A whole-bird test with weight, oven temp held, and probe log",
        updateTrigger: "Impressions climbing into a seasonal window — expand, don't rewrite",
      },
      {
        path: "/learn/whole-duck-cooking-time",
        label: "Whole duck cooking time",
        intent: "Answer-shaped query, needs a table fast",
        role: "Feeds cooking time planner and serving calculator",
        trust: "informational",
        evidenceNeeded: "At least one measured bird weight-to-time data point of our own",
        updateTrigger: "Positions 4–15 — tighten the table and the internal links into it",
      },
    ],
  },
  {
    cluster: "Duck fat",
    note: "Low competition, high repeat-use value, natural commercial tail.",
    items: [
      {
        path: "/learn/how-to-render-duck-fat",
        label: "How to render duck fat",
        intent: "Process question after cooking duck",
        role: "Bridge to ways-to-use and the duck fat buying guide",
        trust: "informational",
        evidenceNeeded: "Measured yield (ml of fat per breast/bird) from our own cook",
        updateTrigger: "Any impressions — add the measured yield, which nobody else publishes",
      },
      {
        path: "/cook/ways-to-use-duck-fat",
        label: "Ways to use duck fat",
        intent: "I have a jar of fat, now what",
        role: "Commercial-adjacent; feeds the fat buying guide",
        trust: "informational",
        evidenceNeeded: "Two or three uses we have actually cooked, with notes",
        updateTrigger: "Impressions rising — expand the cluster with a specific use",
      },
    ],
  },
  {
    cluster: "Money pages",
    note: "All three merchant programs are pending. Measure intent now; monetize only after approval.",
    items: [
      {
        path: "/buy/where-to-buy-duck-online",
        label: "Where to buy duck online",
        intent: "Commercial — ready to purchase",
        role: "Primary money page once a program is approved",
        trust: "money",
        evidenceNeeded: "Approved tracking URL, reviewed terms, tested link, disclosure in place",
        updateTrigger:
          "Traffic arriving but no outbound merchant clicks — review CTA placement and commercial framing",
      },
      {
        path: "/gear/best-thermometer-for-duck",
        label: "Best thermometer for duck",
        intent: "Commercial — comparing a specific tool",
        role: "Highest-converting gear page candidate",
        trust: "money",
        evidenceNeeded:
          "Our own side-probe use documented. No merchant program to wait on: the ThermoWorks affiliate application was declined in 2026-08.",
        updateTrigger:
          "Impressions with low CTR, or clicks with no outbound clicks — title first, then CTA",
      },
    ],
  },
  {
    cluster: "First-party asset",
    note: "Owned distribution — the only channel not dependent on search rankings.",
    items: [
      {
        path: "/guides/duck-cooking-starter-guide",
        label: "Duck cooking starter guide",
        intent: "Beginner orientation; lead-magnet companion",
        role: "Newsletter conversion surface",
        trust: "informational",
        evidenceNeeded: "Signup-to-view ratio from GA4 over a full week",
        updateTrigger:
          "starter_guide_view volume with few newsletter_signup events — revise the offer copy, not the article",
      },
    ],
  },
];

export interface DecisionRule {
  signal: string;
  action: string;
}

/**
 * Our own operating policy, not Google documentation. No promised timelines
 * and no numeric ranking thresholds beyond the reported position range itself.
 */
export const DECISION_FRAMEWORK: DecisionRule[] = [
  {
    signal: "High impressions, low CTR",
    action:
      "Rewrite the title and meta description to match the query's phrasing and promise. Change nothing in the body yet — this isolates the variable.",
  },
  {
    signal: "Average position roughly 4–15",
    action:
      "Strengthen the page itself: add the missing specific answer, tighten the opening, and add contextual internal links from related pages into it.",
  },
  {
    signal: "Impressions trending up",
    action:
      "Protect and expand. Do not restructure a page that is gaining. Add an adjacent page in the same cluster instead.",
  },
  {
    signal: "No impressions after the page has clearly been crawled and indexed for a while",
    action:
      "Re-examine intent and phrasing rather than adding length. The page may be answering a question nobody is asking in those words.",
  },
  {
    signal: "Money page gets traffic but no outbound merchant clicks",
    action:
      "Review CTA placement, whether the commercial intent is addressed above the fold, and whether the page answers the buying question before asking for a click.",
  },
  {
    signal: "Clicks but very short engagement",
    action:
      "Check whether the answer is buried. Move the direct answer to the first screen and keep the reasoning below it.",
  },
];

export interface ActivationStep {
  step: string;
  detail: string;
}

export const AFFILIATE_ACTIVATION_CHECKLIST: ActivationStep[] = [
  {
    step: "Approval confirmed in the network dashboard",
    detail: "Read it in the network UI. Never infer approval from an email or a silence.",
  },
  {
    step: "Tracking URL obtained",
    detail: "Copy the real deep link from the network. Never construct or guess one.",
  },
  {
    step: "Terms and commission structure reviewed",
    detail: "Confirm what we may claim, cookie window, and any prohibited language.",
  },
  {
    step: "Link tested end to end",
    detail: "Click it, confirm it lands on the right product page, and confirm it registers.",
  },
  {
    step: "Disclosure present on the page",
    detail: "Affiliate disclosure must be visible before the first monetized link.",
  },
  {
    step: "GA4 shows affiliate=true for the click",
    detail:
      "Fire a test click and confirm the affiliate_click event reports link_type: affiliate. Until activation, the same event correctly reports direct_seller.",
  },
  {
    step: "Registry updated",
    detail: 'Set status: "active" and paste affiliateUrl in src/data/affiliates.ts. Nothing else.',
  },
];

export interface EventRef {
  name: string;
  meaning: string;
  fires: string;
  dedupe: string;
}

export const EVENT_REFERENCE: EventRef[] = [
  {
    name: "newsletter_intent",
    meaning: "Someone engaged a signup surface. Intent, not a subscription.",
    fires: "First interaction with any newsletter form on the page",
    dedupe: "Once per mounted signup component",
  },
  {
    name: "newsletter_signup",
    meaning: "A subscription was durably recorded in the database.",
    fires: "After the server confirms persistence — not on submit",
    dedupe: "Once per successful subscribe result",
  },
  {
    name: "newsletter_interest_selected",
    meaning:
      "A new subscriber explicitly chose which pillar the weekly issue should lead with.",
    fires: "On a choice in the post-signup selector, after the server confirms the change",
    dedupe: "Only fires when the chosen value actually differs",
  },
  {
    name: "email_landing_view",
    meaning: "A session arrived from an email link (utm_medium=email).",
    fires: "First qualifying page of the session",
    dedupe: "Once per browser session",
  },
  {
    name: "duck_drop_cta_click",
    meaning: "An email-attributed session clicked an on-site CTA.",
    fires: "Only within sessions that arrived from the newsletter",
    dedupe: "1.5s window per link URL and page path",
  },
  {
    name: "newsletter_postsignup_click",
    meaning:
      "A new subscriber clicked into on-site reading from the post-signup 'Start here' module.",
    fires: "On a click inside the success-state link list",
    dedupe: "1.5s window per link URL and page path",
  },
  {
    name: "starter_guide_view",
    meaning: "A genuine view of the on-site starter guide.",
    fires: "Once after hydration on /guides/duck-cooking-starter-guide",
    dedupe: "Mount-scoped effect, empty dependency list",
  },
  {
    name: "starter_guide_print",
    meaning: "The reader invoked the print/save action on the guide.",
    fires: "On the print button click, before window.print()",
    dedupe: "Per click — repeated prints are genuine repeat intent",
  },
  {
    name: "calculator_complete",
    meaning: "A calculator produced a usable result from real input.",
    fires: "When a tool has enough input to output a result",
    dedupe: "Per completed calculation, guarded against identical repeat inputs",
  },
  {
    name: "affiliate_click",
    meaning:
      "An outbound commercial click. link_type distinguishes a tracked affiliate link from a plain merchant link.",
    fires: "On click of any commerce CTA, sent with transport_type: beacon",
    dedupe: "Per click. affiliate: false and link_type: direct_seller while programs are pending",
  },
  {
    name: "page_view",
    meaning: "Standard GA4 page view, plus SPA route changes.",
    fires: "First load via gtag.js, then on each client route change",
    dedupe: "One per route change",
  },
];

export const NO_PII_NOTE =
  "No event carries an email address, name, or any user identifier. Newsletter events send placement and source only; the address goes to the database and Resend over the server function, never to GA4.";

export interface WeeklyMetricField {
  label: string;
  hint?: string;
  wide?: boolean;
}

export const WEEKLY_METRIC_FIELDS: WeeklyMetricField[] = [
  { label: "Week ending (date)" },
  { label: "Total impressions", hint: "Search Console → Performance, last 7 days" },
  { label: "Total clicks" },
  { label: "Average CTR (%)" },
  { label: "Average position" },
  { label: "Indexed pages", hint: "Search Console → Pages → Indexed count" },
  { label: "Newsletter signups this week", hint: "GA4 newsletter_signup count" },
  { label: "Outbound merchant clicks", hint: "GA4 affiliate_click, link_type: direct_seller" },
  { label: "Tracked affiliate clicks", hint: "Zero is expected while all programs are pending" },
  { label: "Top 10 queries — query, impressions, CTR, position", wide: true },
  { label: "Top 10 pages — page, clicks, impressions, position", wide: true },
  { label: "Notes: what changed on the site this week", wide: true },
  { label: "Decisions taken from the framework below", wide: true },
];

export const WEEKLY_CHECKLIST: string[] = [
  "Open Search Console and pull the last 7 days of performance data.",
  "Record impressions, clicks, CTR, average position, and indexed page count above.",
  "Read the top 10 queries and top 10 pages. Note anything new or unexpected.",
  "Pick exactly one high-impression / low-CTR page and rewrite its title and meta description.",
  "Pick exactly one page at position 4–15 and strengthen it, including inbound internal links.",
  "Review merchant statuses in the affiliate panel. Chase anything stale; activate nothing unconfirmed.",
  "Check newsletter signups in the database and confirm Resend sync status is clean.",
  "In GA4, inspect affiliate_click and outbound events for volume and correct link_type.",
  "Publish or update only where the data or a completed kitchen test justifies it.",
  "Log kitchen-test progress: what was cooked, what was measured, what photos exist.",
];

/* ------------------------------------------------------------------ *
 * Email economics
 *
 * Manual-entry fields plus our own reading rules. Every number comes
 * from GA4 or the subscribers table — nothing here is estimated, and
 * none of it is a revenue projection.
 * ------------------------------------------------------------------ */

export const EMAIL_METRIC_FIELDS: { label: string; hint: string; wide?: boolean }[] = [
  { label: "newsletter_intent (7d)", hint: "GA4 event count — engaged a signup form" },
  { label: "newsletter_signup (7d)", hint: "GA4 event count — durably stored subscriptions" },
  { label: "Signup rate", hint: "signups ÷ intent, as a percentage" },
  {
    label: "newsletter_postsignup_click (7d)",
    hint: "New subscribers who kept reading on-site",
  },
  {
    label: "Top signup interest",
    hint: "Highest-count value of the interest parameter in GA4",
  },
  {
    label: "Top source_path",
    hint: "Page that produced the most signups this week",
  },
  {
    label: "Resend sync failures",
    hint: "Rows in the subscribers table with resend_sync_status = failed",
    wide: true,
  },
];

export const EMAIL_READING_RULES: { signal: string; action: string }[] = [
  {
    signal: "High intent, low signup rate on one cluster",
    action:
      "The promise doesn't match the page. Rewrite that cluster's promise line in newsletter-contexts.ts — do not weaken the form.",
  },
  {
    signal: "One source_path dominates signups",
    action:
      "Give that cluster its own contextual capture placement if it lacks one, and prioritise it in the content update queue.",
  },
  {
    signal: "Signups healthy, postsignup clicks near zero",
    action:
      "The 'Start here' links for that interest are wrong or too generic. Swap them for the specific next step a reader of that page needs.",
  },
  {
    signal: "Any Resend sync failures",
    action:
      "Subscribers are stored but not receiving email. Re-run the sync utility; the database stays the source of truth so nothing is lost.",
  },
  {
    signal: "A cluster shows no interest values at all",
    action:
      "That page's signup component is missing its interest prop. Check the placement before drawing any conclusion from the data.",
  },
];
