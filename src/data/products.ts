/**
 * Affiliate product callouts. Deliberately contain NO prices, ratings,
 * review counts, or partnership claims — those are added only once a
 * real merchant relationship and real testing exist.
 */
export interface AffiliateItem {
  id: string;
  category: string;
  name: string;
  whatItIs: string;
  whyItMatters: string;
  ctaLabel: string;
  href?: string;
}

export const BUYING_GUIDE: AffiliateItem[] = [
  {
    id: "online-butcher",
    category: "Where to buy duck online",
    name: "Specialist online butchers",
    whatItIs:
      "Mail-order butchers that ship frozen whole ducks, breasts, and legs with cold-chain packaging.",
    whyItMatters:
      "The most reliable route to specific cuts — especially Pekin breast or leg quarters — outside major cities.",
    ctaLabel: "Read the sourcing guide",
    href: "/buy",
  },
  {
    id: "farm-direct",
    category: "Where to buy duck online",
    name: "Farm-direct producers",
    whatItIs: "Small producers selling their own birds directly, often seasonally.",
    whyItMatters:
      "Best traceability on breed, feed, and processing date, which is what actually affects flavour and fat.",
    ctaLabel: "How to vet a producer",
    href: "/buy",
  },
];

export const KITCHEN_GEAR: AffiliateItem[] = [
  {
    id: "instant-read-thermometer",
    category: "The duck kitchen",
    name: "Fast instant-read thermometer",
    whatItIs: "A thin-probe thermometer that reads in a few seconds.",
    whyItMatters:
      "Duck breast has a narrow window between rosy and grey. Temperature is the only reliable signal.",
    ctaLabel: "See what to look for",
    href: "/gear",
  },
  {
    id: "carbon-steel-skillet",
    category: "The duck kitchen",
    name: "Heavy carbon steel or cast iron skillet",
    whatItIs: "An oven-safe pan with high thermal mass and no non-stick coating.",
    whyItMatters:
      "Renders the fat cap evenly and holds heat when a cold breast hits the surface.",
    ctaLabel: "See what to look for",
    href: "/gear",
  },
  {
    id: "fat-storage",
    category: "The duck kitchen",
    name: "Fat strainer and storage jar",
    whatItIs: "A fine strainer plus a sealable heatproof jar.",
    whyItMatters:
      "Rendered duck fat is the by-product worth keeping; clean straining is what makes it last in the fridge.",
    ctaLabel: "See what to look for",
    href: "/gear",
  },
];
