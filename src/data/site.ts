import cookImg from "@/assets/tile-cook.jpg";
import learnImg from "@/assets/tile-learn.jpg";
import buyImg from "@/assets/tile-buy.jpg";
import gearImg from "@/assets/tile-gear.jpg";
import ingredientsImg from "@/assets/tile-ingredients.jpg";
import toolsImg from "@/assets/tile-tools.jpg";

export const SITE = {
  name: "DeliciousDuck",
  domain: "DeliciousDuck.com",
  tagline: "Better Duck. A More Delicious World.",
  description:
    "Expert duck recipes, step-by-step guides, buying advice, gear reviews, and practical cooking tools.",
};

export type PillarKey = "cook" | "learn" | "buy" | "gear" | "ingredients" | "tools";

export interface Pillar {
  key: PillarKey;
  label: string;
  to: string;
  headline: string;
  blurb: string;
  image: string;
  kicker: string;
}

export const PILLARS: Pillar[] = [
  {
    key: "cook",
    label: "Cook",
    to: "/cook",
    kicker: "Recipes & technique",
    headline: "Cook",
    blurb:
      "Tested recipes and technique walkthroughs for breast, legs, whole birds, and everything rendered in between.",
    image: cookImg,
  },
  {
    key: "learn",
    label: "Learn",
    to: "/learn",
    kicker: "Guides & fundamentals",
    headline: "Learn",
    blurb:
      "How duck works: cuts, fat, doneness, resting, safety, and the questions people actually search for.",
    image: learnImg,
  },
  {
    key: "buy",
    label: "Buy",
    to: "/buy",
    kicker: "Sourcing & shopping",
    headline: "Buy",
    blurb:
      "Where to buy duck online and in person, what the labels mean, and how to judge quality before you pay.",
    image: buyImg,
  },
  {
    key: "gear",
    label: "Gear",
    to: "/gear",
    kicker: "The duck kitchen",
    headline: "Gear",
    blurb:
      "The short list of pans, thermometers, and knives that make duck easier — and what you can skip.",
    image: gearImg,
  },
  {
    key: "ingredients",
    label: "Ingredients",
    to: "/ingredients",
    kicker: "Fat, pairings & sauces",
    headline: "Ingredients",
    blurb:
      "Duck fat, stone fruit, aromatics, and the pantry pairings that make a duck dinner taste finished.",
    image: ingredientsImg,
  },
  {
    key: "tools",
    label: "Tools",
    to: "/tools",
    kicker: "Calculators & references",
    headline: "Tools",
    blurb:
      "Interactive calculators and quick-reference charts for timing, doneness, portions, and substitutions.",
    image: toolsImg,
  },
];

export const NAV_LINKS = PILLARS.map((p) => ({ label: p.label.toUpperCase(), to: p.to }));

export const FOOTER_COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Cook",
    links: [
      { label: "All recipes", to: "/cook" },
      { label: "Duck breast", to: "/cook" },
      { label: "Duck legs & confit", to: "/cook" },
      { label: "Whole duck", to: "/cook" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Duck fundamentals", to: "/learn" },
      { label: "Doneness & safety", to: "/learn" },
      { label: "Duck cuts explained", to: "/learn" },
      { label: "Ingredients & pairings", to: "/ingredients" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Where to buy duck", to: "/buy" },
      { label: "The duck kitchen", to: "/gear" },
      { label: "Pantry & ingredients", to: "/ingredients" },
      { label: "Affiliate disclosure", to: "/affiliate-disclosure" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "All tools", to: "/tools" },
      { label: "Whole-duck serving calculator", to: "/tools/whole-duck-serving-calculator" },
      { label: "Cooking-time calculator", to: "/tools" },
      { label: "Doneness guide", to: "/tools" },
    ],
  },
];

export const LEGAL_LINKS = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Editorial Standards", to: "/editorial-standards" },
  { label: "Affiliate Disclosure", to: "/affiliate-disclosure" },
];
