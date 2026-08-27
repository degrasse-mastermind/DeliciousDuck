/**
 * Contextual newsletter capture.
 *
 * One shared component, one shared lead magnet: "Duck Fundamentals: The Field
 * Guide". What changes by page cluster is the *promise* — the sentence that says
 * which problem the guide solves for the reader who is on that page — plus the
 * two or three on-site links we show after a real signup.
 *
 * There is no second lead magnet, no gated bonus, and no variant that implies
 * one. Every context delivers the same 28-page playbook PDF.
 */

/** Controlled, non-PII interest enum. Stored in the database and sent to GA4. */
export const NEWSLETTER_INTERESTS = [
  "duck-breast",
  "whole-duck",
  "duck-fat",
  "sourcing",
  "wild-duck",
  "general",
] as const;

export type NewsletterInterest = (typeof NEWSLETTER_INTERESTS)[number];

export interface StartHereLink {
  label: string;
  href: string;
  note: string;
}

export interface NewsletterContext {
  interest: NewsletterInterest;
  /** Short eyebrow above the heading. */
  eyebrow: string;
  /** The contextual promise. Same asset, cluster-specific problem. */
  promise: string;
  /** Cluster-relevant reasons to join, drawn from what the PDF actually covers. */
  bullets: string[];
  /** 2–3 genuinely useful next steps shown after persistence succeeds. */
  startHere: StartHereLink[];
}

const CONTEXTS: Record<NewsletterInterest, NewsletterContext> = {
  "duck-breast": {
    interest: "duck-breast",
    eyebrow: "Crisp skin, on purpose",
    promise:
      "If you want skin that shatters and a breast you can call at the right temperature, the playbook is the short version: scoring depth, cold-pan rendering, and the numbers to pull at.",
    bullets: [
      "Scoring depth and cold-pan rendering, step by step",
      "Pull temperatures and carryover for breast, with a rest plan",
      "Why skin turns leathery, and the two fixes that work",
      "A printable kitchen card with temperatures and timings",
    ],
    startHere: [
      {
        label: "Pan-seared duck breast",
        href: "/recipes/pan-seared-duck-breast",
        note: "The full method, start to slice",
      },
      {
        label: "Why duck skin isn't crispy",
        href: "/learn/why-duck-skin-isnt-crispy",
        note: "Troubleshooting, cause by cause",
      },
      {
        label: "Temperature and doneness",
        href: "/learn/duck-breast-temperature-doneness",
        note: "What to pull at, and why",
      },
    ],
  },
  "whole-duck": {
    interest: "whole-duck",
    eyebrow: "Plan the whole bird",
    promise:
      "Roasting a whole duck is a timing problem before it is a cooking problem. The playbook carries the planning timeline, from thawing to resting.",
    bullets: [
      "A planning timeline from thawing through carving",
      "Fat rendering and basting decisions for a whole bird",
      "Portioning guidance so you buy the right size",
      "A printable kitchen card with temperatures and timings",
    ],
    startHere: [
      {
        label: "Cooking time planner",
        href: "/tools/duck-cooking-time-planner",
        note: "Work backwards from dinner",
      },
      {
        label: "Whole roast duck",
        href: "/cook/whole-roast-duck",
        note: "The method in full",
      },
      {
        label: "Serving calculator",
        href: "/tools/whole-duck-serving-calculator",
        note: "How much bird per person",
      },
    ],
  },
  "duck-fat": {
    interest: "duck-fat",
    eyebrow: "Waste nothing",
    promise:
      "Duck fat is the second thing you buy a duck for. The playbook covers rendering it cleanly and managing it while you cook.",
    bullets: [
      "Rendering fat cleanly and storing what you keep",
      "Fat management while searing, so skin crisps instead of steaming",
      "Where duck fat earns its place, and where it doesn't",
      "A printable kitchen card with temperatures and timings",
    ],
    startHere: [
      {
        label: "Ways to use duck fat",
        href: "/cook/ways-to-use-duck-fat",
        note: "Uses that are actually worth it",
      },
      {
        label: "How to render duck fat",
        href: "/learn/how-to-render-duck-fat",
        note: "Clean fat, no scorching",
      },
      {
        label: "Fat substitution calculator",
        href: "/tools/duck-fat-substitution-calculator",
        note: "Swap amounts with confidence",
      },
    ],
  },
  sourcing: {
    interest: "sourcing",
    eyebrow: "Buy the right duck",
    promise:
      "Most disappointing duck dinners start at the point of purchase. The playbook includes the shopping checklist we use before anything hits a pan.",
    bullets: [
      "What to check on the label, and what breed choice changes",
      "A first-duck shopping checklist you can take to the counter",
      "How to store, thaw, and portion what you buy",
      "A printable kitchen card with temperatures and timings",
    ],
    startHere: [
      {
        label: "Where to buy duck online",
        href: "/buy/where-to-buy-duck-online",
        note: "How the sellers differ",
      },
      {
        label: "Duck fat buying guide",
        href: "/buy/duck-fat-buying-guide",
        note: "What you're paying for",
      },
      {
        label: "How to thaw duck",
        href: "/learn/how-to-thaw-duck",
        note: "Safe timing before you cook",
      },
    ],
  },
  "wild-duck": {
    interest: "wild-duck",
    eyebrow: "Wild birds, different rules",
    promise:
      "Wild duck is leaner and less forgiving than farmed. The playbook gives you the temperature and technique baseline to adjust from.",
    bullets: [
      "Temperature guidance and the USDA baseline for wild birds",
      "Why lean breast needs a different pan approach",
      "Troubleshooting dry breast and tough legs",
      "A printable kitchen card with temperatures and timings",
    ],
    startHere: [
      {
        label: "Wild vs farmed duck",
        href: "/learn/wild-duck-vs-farmed-duck",
        note: "What actually changes",
      },
      {
        label: "Cooking wild duck breast",
        href: "/cook/how-to-cook-wild-duck-breast",
        note: "Lean-bird method",
      },
      {
        label: "Temperature and doneness",
        href: "/learn/duck-breast-temperature-doneness",
        note: "Where to land, and why",
      },
    ],
  },
  general: {
    interest: "general",
    eyebrow: "Join the list",
    promise:
      "Everything a first duck needs on one printable reference: the five techniques that matter, the temperatures, and the planning.",
    bullets: [
      "The crisp-skin technique: scoring, cold-pan rendering, and fat management",
      "Whole-duck and duck-breast workflows, start to carving",
      "Troubleshooting for chewy skin, dry breast, and tough legs",
      "A planning timeline from thawing to resting",
      "A printable kitchen card with temperatures and timings",
    ],
    startHere: [
      {
        label: "The Duck Cooking Starter Guide",
        href: "/guides/duck-cooking-starter-guide",
        note: "The on-site companion article",
      },
      {
        label: "Temperature and doneness",
        href: "/learn/duck-breast-temperature-doneness",
        note: "The number that matters most",
      },
      {
        label: "Calculators",
        href: "/tools",
        note: "Timing, portions, substitutions",
      },
    ],
  },
};

/** Explicit path prefixes → interest. Longest match wins. */
const PATH_INTERESTS: Array<[string, NewsletterInterest]> = [
  ["/cook/how-to-cook-wild-duck-breast", "wild-duck"],
  ["/learn/wild-duck-vs-farmed-duck", "wild-duck"],
  ["/recipes/pan-seared-duck-breast", "duck-breast"],
  ["/cook/how-to-cook-duck-breast", "duck-breast"],
  ["/cook/best-sauces-for-duck-breast", "duck-breast"],
  ["/cook/what-to-serve-with-duck-breast", "duck-breast"],
  ["/learn/duck-breast-temperature-doneness", "duck-breast"],
  ["/learn/how-to-score-duck-breast", "duck-breast"],
  ["/learn/why-duck-skin-isnt-crispy", "duck-breast"],
  ["/gear/best-pan-for-duck-breast", "duck-breast"],
  ["/gear/best-knife-for-scoring-duck", "duck-breast"],
  ["/gear/best-thermometer-for-duck", "duck-breast"],
  ["/tools/duck-doneness-guide", "duck-breast"],
  ["/cook/whole-roast-duck", "whole-duck"],
  ["/learn/whole-duck-cooking-time", "whole-duck"],
  ["/learn/how-to-carve-a-duck", "whole-duck"],
  ["/tools/whole-duck-serving-calculator", "whole-duck"],
  ["/tools/duck-cooking-time-planner", "whole-duck"],
  ["/cook/ways-to-use-duck-fat", "duck-fat"],
  ["/learn/how-to-render-duck-fat", "duck-fat"],
  ["/ingredients/duck-fat-vs-butter-oil", "duck-fat"],
  ["/tools/duck-fat-substitution-calculator", "duck-fat"],
  ["/buy/duck-fat-buying-guide", "duck-fat"],
  ["/buy", "sourcing"],
  ["/learn/how-to-thaw-duck", "sourcing"],
];

/** Resolves a page path to its cluster interest; falls back to `general`. */
export function interestForPath(path: string | undefined): NewsletterInterest {
  if (!path) return "general";
  const clean = path.replace(/\/+$/, "") || "/";
  let best: NewsletterInterest = "general";
  let bestLength = 0;
  for (const [prefix, interest] of PATH_INTERESTS) {
    if ((clean === prefix || clean.startsWith(`${prefix}/`)) && prefix.length > bestLength) {
      best = interest;
      bestLength = prefix.length;
    }
  }
  return best;
}

export function newsletterContext(interest: NewsletterInterest): NewsletterContext {
  return CONTEXTS[interest];
}

export function isNewsletterInterest(value: unknown): value is NewsletterInterest {
  return typeof value === "string" && (NEWSLETTER_INTERESTS as readonly string[]).includes(value);
}
