/**
 * Reference notes used on content pages.
 *
 * Every factual claim that needs authority points at one of these entries.
 * Keep `checked` accurate: it is displayed to readers as "reference checked".
 */
export interface SourceRef {
  id: string;
  label: string;
  publisher: string;
  url: string;
  note?: string;
  checked: string;
}

export const SOURCES: Record<string, SourceRef> = {
  usdaPoultryTemp: {
    id: "usdaPoultryTemp",
    label: "Safe Minimum Internal Temperature Chart",
    publisher: "USDA Food Safety and Inspection Service",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart",
    note: "All poultry, including duck and duck pieces, is listed at a 165°F (73.9°C) safe minimum internal temperature.",
    checked: "2026-08",
  },
  usdaPoultryPrep: {
    id: "usdaPoultryPrep",
    label: "Duck and Goose from Farm to Table",
    publisher: "USDA Food Safety and Inspection Service",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/duck-and-goose-farm-table",
    note: "Handling, labelling, storage and cooking guidance specific to duck and goose.",
    checked: "2026-08",
  },
  usdaThawing: {
    id: "usdaThawing",
    label: "The Big Thaw — Safe Defrosting Methods",
    publisher: "USDA Food Safety and Inspection Service",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods",
    note: "Refrigerator, cold-water and microwave thawing are the three methods considered safe; room-temperature thawing is not.",
    checked: "2026-08",
  },
  usdaDangerZone: {
    id: "usdaDangerZone",
    label: "Danger Zone (40°F – 140°F)",
    publisher: "USDA Food Safety and Inspection Service",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/danger-zone-40f-140f",
    note: "Perishable food should not sit between 40°F and 140°F for more than two hours.",
    checked: "2026-08",
  },
  usdaLeftovers: {
    id: "usdaLeftovers",
    label: "Leftovers and Food Safety",
    publisher: "USDA Food Safety and Inspection Service",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety",
    note: "Cooked poultry keeps 3–4 days refrigerated; reheat to 165°F.",
    checked: "2026-08",
  },
  fdaColdStorage: {
    id: "fdaColdStorage",
    label: "Refrigerator & Freezer Storage Chart",
    publisher: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/media/74435/download",
    note: "Cold-storage windows for raw and cooked poultry.",
    checked: "2026-08",
  },
  fsisWildGame: {
    id: "fsisWildGame",
    label: "Wild Game from Field to Table",
    publisher: "USDA Food Safety and Inspection Service",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat/wild-game-farm-table",
    note: "Handling guidance for wild-harvested birds, including field dressing and chilling.",
    checked: "2026-08",
  },
};

export const sourceList = (ids: string[]): SourceRef[] =>
  ids.map((id) => SOURCES[id]).filter((s): s is SourceRef => Boolean(s));

/** The single wording we use everywhere the safety number appears. */
export const USDA_SAFETY_LINE =
  "USDA guidance is that duck — whole birds and pieces alike — should reach a minimum internal temperature of 165°F (73.9°C), measured with a food thermometer.";
